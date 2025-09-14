import imapfunctions from "./routes/imapFunctions.route";
import elasticSearchfunc from "./routes/elasticSearchFunc.route";
import http from "http";
import CORS from "cors";
import express from "express";
import authRoutes from "./routes/auth.route";
import imapConnection from "./server functions/imapConnection";
import { Server } from "socket.io";
import sendmail from "./routes/nodemailer.route";
import { createEmailDB } from "./server functions/CRUD/emails";
import { getAccountByEmail } from "./server functions/CRUD/accounts";
import { classifyEmail } from "./server functions/aiClassifier";
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);

// socket
const io = new Server(server, {
  cors: {
    origin: "https://email-aggregator-ten.vercel.app",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("authenicate", (data) => {
    (async function () {
    const clients = await imapConnection(Number(data.userId));
    if (clients.length === 0) {
      console.log("No clients connected");
      return;
    }
    for (let client of clients) {
      await client?.client.mailboxOpen("INBOX");
      // enabling the idling to listen for new emails
      client?.client.on("exists", async () => {
        let lock = await client.client.getMailboxLock("INBOX");
        try {
          for await (let message of client.client.fetch("*", {
            envelope: true,
            uid: true,
          })) {
            let account = await getAccountByEmail(
              message.envelope?.to![0]?.address!
            );
            let classify = await classifyEmail(message.envelope?.subject!,message.envelope?.subject!);
            const object = {
              subject: message.envelope?.subject!,
              name: message.envelope?.from![0]?.name!,
              from: message.envelope?.from![0]?.address!,
              date: message.envelope?.date!,
              to: message.envelope?.to![0]?.address!,
              aiLabel: classify,
              folder: "INBOX",
              body: message.envelope?.subject!,
              accountId: account?.ownerId!,
            };

            await createEmailDB(object);
            emittingIdle(object);
          }
        } finally {
          lock.release();
        }
      });
    }
  })();
  });
  
  let prevobject: any = {};
  function emittingIdle(object: any) {
    if (JSON.stringify(prevobject) != JSON.stringify(object)) {
      prevobject = object;
      socket.emit("new-email", object);
    }
  }
});



// function to create the index at the start of the server


app.use(CORS(
  {
    origin:"https://email-aggregator-ten.vercel.app",
    credentials:true
  }
));
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "supersecret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       sameSite: "lax",
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 1000 * 60 * 60 * 24 * 7,
//     },
//   })
// );




//routes

app.use("/auth", authRoutes);

app.use("/api/imapfunctions", imapfunctions);
app.use("/api/elasticSearchfunc", elasticSearchfunc);
app.use("/api/sendMail", sendmail);

server.listen(3000, () => {
  console.log("Socket server listening on port ", PORT);
});
