import   { ImapFlow } from 'imapflow';
import dotenv from 'dotenv';
dotenv.config();
interface Accounts{
    email: string;
    password: string;
}
// function to connect to multiple imap accounts
export default async function imapConnection(): Promise<ImapFlow[]> {
    let clients:ImapFlow[] =[]; 
    
    try {
        const Accounts:Accounts[] = JSON.parse(process.env.USER_ACCOUNTS!);
        for(let account of Accounts) { 
            const client = new ImapFlow({ host: 'imap.gmail.com',
                port: 993,
                secure: true, 
                auth: { user: account.email, pass: account.password, }, 
                logger: false ,
            });
             // loogging in as each user
            await client.connect();
            clients.push(client);
        }
        }catch (error) {
            console.error('Error connecting to IMAP:', error); 
            return [];
        } 
        return clients;
}