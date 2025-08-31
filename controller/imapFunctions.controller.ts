import { ImapFlow } from "imapflow";
import imapConnection from "../server functions/imapConnection";
import { Request, Response } from "express";

interface Res {
  uid: number;
  message: {
    account: string;
    from: string;
    to: string;
    folder: string;
    subject: string;
    name: string;
    body?: string;
    date: Date;
  };
}
export async function fetchLast30Days(req: Request, res: Response) {
  const response: Res[] = [];
  const folders = ["INBOX", "[Gmail]/Starred", "[Gmail]/Sent Mail","[Gmail]/Drafts", "[Gmail]/Spam", "[Gmail]/Trash"];
  const clients: ImapFlow[] = await imapConnection();
  if (clients.length === 0) {
    console.log("No clients connected");
    return;
  }

  for(let client of clients) {
    for (let folder of folders) {
      // getting the message from inbox
      let lock = await client.getMailboxLock(folder);
      try {
        const since = new Date();
        since.setDate(since.getDate() - 30);

        // fetching only the last 30 days emails
        for await (let message of client.fetch(
          { since },
          { envelope: true, uid: true,source:true }
        )) {
          response.push({
            uid: message.uid!,
            message: {
              from: message.envelope?.from![0]?.address!,
              to: message.envelope?.to![0]?.address!,
              account: folder==="[Gmail]/Sent Mail"?message.envelope?.from![0]?.address!:message.envelope?.to![0]?.address!,
              folder : folder,
              body: message.envelope?.subject!,
              subject: message.envelope?.subject!,
              name: message.envelope?.from![0]?.name!,
              date: message.envelope?.date!,
            },
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
  }
  res.status(200).json(response);
}
