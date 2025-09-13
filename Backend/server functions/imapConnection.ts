import { ImapFlow } from "imapflow";
import dotenv from "dotenv";
import { Accounts } from "../types/email";
dotenv.config();

// function to connect to multiple imap accounts
export default async function imapConnection(): Promise<ImapFlow[]> {
  let clients: ImapFlow[] = [];

  try {
    const Accounts: Accounts[] = JSON.parse(process.env.USER_ACCOUNTS || "[]");
    console.log("Accounts", Accounts);
    if (!Accounts.length) {
      console.log("No accounts found");
      return [];
    }
    for (let account of Accounts) {
      const client = new ImapFlow({
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: { user: account.email, pass: account.AppPass },
        logger: false,
      });
      // loogging in as each user
      await client.connect();
      clients.push(client);
    }
  } catch (error) {
    console.error("Error connecting to IMAP");
    return [];
  }
  return clients;
}
