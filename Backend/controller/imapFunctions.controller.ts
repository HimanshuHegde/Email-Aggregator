import { ImapFlow } from "imapflow";
import imapConnection from "../server functions/imapConnection";
import { Request, Response } from "express";
import { Res } from "../types/email";
import { createBulkEmails } from "../server functions/CRUD/emails";
import { getAccountByEmail } from "../server functions/CRUD/accounts";

export async function fetchLast30Days(req: Request, res: Response) {
  let response: Res[] = [];
  let bulk: any[] = [];
  const clients: [{client: ImapFlow, accountId: number}?] = await imapConnection((req.user as any).userId);
  console.log("clients.length", clients.length);
  if (clients.length === 0) {
    console.log("No clients connected");
    res.status(200).json({ state: 0, message: "No clients connected" });
    return;
  }

  for (let client of clients) {
    // getting the message from inbox
    let lock = await client?.client.getMailboxLock("[Gmail]/All Mail");
    try {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      // fetching only the last 30 days emails
      for await (let message of client!.client.fetch(
        { since },
        { envelope: true, uid: true, source: true, labels: true }
      )) {
        let folder: string;
        for (let label of message.labels!) {
          folder = label.slice(1);
          if (folder === "Inbox") {
            folder = "INBOX";
          }
        }
        response.push({
          uid: message.uid!,
          message: {
            from: message.envelope?.from![0]?.address!,
            to: message.envelope?.to![0]?.address!,
            account:
              folder! === "Sent"
                ? message.envelope?.from![0]?.address!
                : message.envelope?.to![0]?.address!,
            folder: folder!,
            body: message.envelope?.subject!,
            subject: message.envelope?.subject!,
            name: message.envelope?.from![0]?.name!,
            date: message.envelope?.date!,
          },
        });
        
        bulk.push({
          from: message.envelope?.from![0]?.address!,
          to: message.envelope?.to![0]?.address!,
          folder: folder!,
          body: message.envelope?.subject!,
          subject: message.envelope?.subject!,
          accountId: client!.accountId,
          name: message.envelope?.from![0]?.name!,
          date: message.envelope?.date!,
        });
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      lock?.release();
    }
  }
  response = response.sort(
    (a, b) => b.message.date.getTime() - a.message.date.getTime()
  );
  bulk = bulk.sort((a, b) => b.date!.getTime() - a.date!.getTime());
  await createBulkEmails(bulk);
  res.status(200).json(response);
}
