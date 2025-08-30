import { ImapFlow } from "imapflow";
import imapConnection from "./imapConnection";
import { Request, Response } from "express";

interface Res {
  uid: number;
  message: {
    subject: string;
    name: string;
    from: string;
    date: Date;
  };
}
export async function fetchLast30Days(req: Request, res: Response) {
  const response: Res[] = [];
  const clients: ImapFlow[] = await imapConnection();
  if (clients.length === 0) {
    console.log("No clients connected");
    return;
  }

  for(let client of clients) {
    // getting the message from inbox
    let lock = await client.getMailboxLock("INBOX");
    try {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      // fetching only the last 30 days emails
      for await (let message of client.fetch(
        { since },
        { envelope: true, uid: true }
      )) {
        response.push({
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
  };
  res.status(200).json(response);
}
