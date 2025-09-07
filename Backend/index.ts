import imapfunctions from "./routes/imapFunctions.route";
import elasticSearchfunc from "./routes/elasticSearchFunc.route";
import http from "http";
import CORS from "cors";
import express from "express";
import session from "express-session";
import authRoutes from "./routes/auth.route";
import passport from "passport";
import { PrismaClient } from "./generated/prisma";
import imapConnection from "./server functions/imapConnection";
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt'
import { Server } from "socket.io";
import { indexingEmail } from "./server functions/elasticSearchinit";
import { createEmailIndex } from "./server functions/elasticSearchinit";
import sendmail from "./routes/nodemailer.route";
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);

// socket
const io = new Server(server, {
  cors: {
    origin: "https://reach-inbox-assign.vercel.app/",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  console.log("a user connected");
  (async function () {
    const clients = await imapConnection();
    if (clients.length === 0) {
      console.log("No clients connected");
      return;
    }
    for (let client of clients) {
      await client.mailboxOpen("INBOX");
      // enabling the idling to listen for new emails
      client.on("exists", async () => {
        let lock = await client.getMailboxLock("INBOX");
        try {
          for await (let message of client.fetch("*", {
            envelope: true,
            uid: true,
          })) {
            const object = {
              subject: message.envelope?.subject!,
              name: message.envelope?.from![0]?.name!,
              from: message.envelope?.from![0]?.address!,
              date: message.envelope?.date!,
              to: message.envelope?.to![0]?.address!,
              account: message.envelope?.to![0]?.address!,
              folder: "INBOX",
              body: message.envelope?.subject!,
            };
            await indexingEmail(object);
            emittingIdle(object);
          }
        } finally {
          lock.release();
        }
      });
    }
  })();
  let prevobject: any = {};
  function emittingIdle(object: any) {
    if (JSON.stringify(prevobject) != JSON.stringify(object)) {
      prevobject = object;
      socket.emit("new-email", object);
    }
  }
});



// function to create the index at the start of the server
(async function () {
  await createEmailIndex();
})();

app.use(CORS());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
       maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);


// passport auth js
const prisma = new PrismaClient();
passport.use(new LocalStrategy(async function verify(username, password, cb) {
    try{
        const user = await prisma.user.findUnique({
            where: {
                email: username
            }
        });
        if (!user) {
            return cb(null, false, { message: 'Incorrect username.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return cb(null, false, { message: 'Incorrect password.' });
        }
        return cb(null, user);
    }catch(err){
        return cb(err);
    }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

//routes

app.use("/auth", authRoutes);

app.use("/api/imapfunctions", imapfunctions);
app.use("/api/elasticSearchfunc", elasticSearchfunc);
app.use("/api/sendMail", sendmail);

server.listen(3000, () => {
  console.log("Socket server listening on port ", PORT);
});
