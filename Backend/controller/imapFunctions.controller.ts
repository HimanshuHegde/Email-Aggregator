import { ImapFlow } from "imapflow";
import imapConnection from "../server functions/imapConnection";
import { Request, Response } from "express";
import { BulkcreateEmail } from "./elasticSearchFunction.controller";
import { Email, Res } from "../types/email";

export async function fetchLast30Days(req: Request, res: Response) {
  let response: Res[] = [];
  let bulk:Email[] = [];
  const clients: ImapFlow[] = await imapConnection();
  if (clients.length === 0) {
    console.log("No clients connected");
    return;
  }

  for (let client of clients) {
      // getting the message from inbox
      let lock = await client.getMailboxLock("[Gmail]/All Mail");
      try {
        const since = new Date();
        since.setDate(since.getDate() - 30);

        // fetching only the last 30 days emails
        for await (let message of client.fetch(
          { since },
          { envelope: true, uid: true,source:true,labels:true, }
        )) {
          let folder:string;
          for(let label of message.labels!){
            folder = label.slice(1)
            if(folder === "Inbox"){
              folder = "INBOX"
            }
          }
          response.push({
            uid: message.uid!,
            message: {
              from: message.envelope?.from![0]?.address!,
              to: message.envelope?.to![0]?.address!,
              account: folder! ==="Sent" ? message.envelope?.from![0]?.address! : message.envelope?.to![0]?.address!,
              folder : folder!,
              body: message.envelope?.subject!,
              subject: message.envelope?.subject!,
              name: message.envelope?.from![0]?.name!,
              date: message.envelope?.date!,
            },
          });
          bulk.push( { from: message.envelope?.from![0]?.address!,
              to: message.envelope?.to![0]?.address!,
              account: folder! ==="Sent" ? message.envelope?.from![0]?.address! : message.envelope?.to![0]?.address!,
              folder : folder!,
              body: message.envelope?.subject!,
              subject: message.envelope?.subject!,
              name: message.envelope?.from![0]?.name!,
              date: message.envelope?.date!,
            });
        }
      }
      catch (error) {
        console.error('Error fetching emails:', error);
      }
      finally {
        lock.release();
      }
    };
    response = response.sort((a, b) => b.message.date.getTime() - a.message.date.getTime());
    bulk = bulk.sort((a, b) => b.date!.getTime() - a.date!.getTime());
  res.status(200).json(response);
  await BulkcreateEmail(bulk)
}
