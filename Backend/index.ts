import imapfunctions from "./routes/imapFunctions.route";
import elasticSearchfunc from "./routes/elasticSearchFunc.route";
import http from "http";
import CORS from "cors";
import express from "express";
import imapConnection from "./server functions/imapConnection";
import {Server} from 'socket.io'
import {indexingEmail} from "./server functions/elasticSearchinit"
import { createEmailIndex } from "./server functions/elasticSearchinit";
import sendmail from "./routes/nodemailer.route"
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
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
            const object = {subject: message.envelope?.subject!,
              name: message.envelope?.from![0]?.name!,
              from: message.envelope?.from![0]?.address!,
              date: message.envelope?.date!,
              to: message.envelope?.to![0]?.address!,
              account: message.envelope?.to![0]?.address!,
              folder: "INBOX",
              body: message.envelope?.subject!,}
            await indexingEmail(
              object
            );
            emittingIdle(object);
          }
        } finally {
          lock.release();
        }
      });
    }
  })();
  let prevobject:any = {};
  function emittingIdle(object:any){
    if(JSON.stringify(prevobject) != JSON.stringify(object)){
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

app.use("/api/imapfunctions", imapfunctions);
app.use("/api/elasticSearchfunc",elasticSearchfunc);
app.use("/api/sendMail",sendmail);


server.listen(3000, () => {
  console.log('Socket server listening on port ', PORT);
});
