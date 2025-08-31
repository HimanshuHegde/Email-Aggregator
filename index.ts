import imapfunctions from "./routes/imapFunctions.route";
import elasticSearchfunc from "./routes/elasticSearchFunc.route";
import CORS from "cors";
import express from "express";
import imapConnection from "./server functions/imapConnection";
import {indexingEmail} from "./server functions/elasticSearchinit"
import { createEmailIndex } from "./server functions/elasticSearchinit";
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

//function to enable idle mode so it fires whenever a new email arrives
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
          await indexingEmail({
            subject: message.envelope?.subject!,
            name: message.envelope?.from![0]?.name!,
            from: message.envelope?.from![0]?.address!,
            date: message.envelope?.date!,
            to: message.envelope?.to![0]?.address!,
            account: message.envelope?.to![0]?.address!,
            folder: "INBOX",
            body: message.envelope?.subject!,
          });
        }
      } finally {
        lock.release();
      }
    });
  }
})();

// function to create the index at the start of the server
(async function () {
  await createEmailIndex();
})();

app.use(CORS());

app.use("/api/imapfunctions", imapfunctions);
app.use("/api/elasticSearchfunc",elasticSearchfunc)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
