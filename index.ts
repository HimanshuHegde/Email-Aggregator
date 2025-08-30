import { fetchLast30Days } from "./functionsOFImap";
import CORS from 'cors'
import express from "express";
import imapConnection from "./imapConnection";
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());


(async function(){
    const clients = await imapConnection();
    if(clients.length === 0) {
        console.log("No clients connected");
        return;
    }
    console.log(1)
    for (let client of clients) {
        await client.mailboxOpen("INBOX");
        // enabling the idling to listen for new emails
        client.on("exists", async (messageCount) => {
        let lock = await client.getMailboxLock("INBOX");
        try {
        for await (let message of client.fetch('*',
            { envelope: true, uid: true }
        )) {
            // will be later stored in db
            console.log({
            uid: message.uid!,
            message: {
                subject: message.envelope?.subject!,
                name: message.envelope?.from![0]?.name!,
                from: message.envelope?.from![0]?.address!,
                date: message.envelope?.date!,
            },
            });
        }
        } finally {
        lock.release();
        }
            });
        }
})()


app.use(CORS());
app.get('/fetch-emails', fetchLast30Days);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});