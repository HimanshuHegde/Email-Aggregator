import { ImapFlow } from "imapflow";
import dotenv from "dotenv";
import { Accounts } from "../types/email";
import {getAcountByOwnerId } from "./CRUD/accounts";
import { decrypt } from "./crypto";
dotenv.config();

// function to connect to multiple imap accounts
export default async function imapConnection(id:number): Promise<[{client:ImapFlow,accountId:number}?]> {
  let clients: [{client:ImapFlow,accountId:number}?] = [];
  try {
    const Accounts = await getAcountByOwnerId(id);
    if (!Accounts.length) {
      console.log("No accounts found");
      return [];
    }
    for (let account of Accounts) {
      let appPass = decrypt(account.AppPass as any);
      const client = new ImapFlow({
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: { user: account.email, pass: appPass },
        logger: false,
      });
      // loogging in as each user
      await client.connect();
      clients.push({client,accountId:account.id});
    }
  } catch (error) {
    console.error("Error connecting to IMAP");
    return [];
  }
  return clients;
}
