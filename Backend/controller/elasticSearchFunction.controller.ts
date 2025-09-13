import { Request, Response } from "express";
import { Accounts, Email } from "../types/email";
import { PrismaClient,Prisma } from "../generated/prisma";
import { createBulkEmails, createEmailDB, searchEmails } from "../server functions/CRUD/emails";
import { getAccountByEmail } from "../server functions/CRUD/accounts";
const prisma = new PrismaClient();

// function to search emails based on a query string
export async function searchEmail(req: Request, res: Response) {
  const query = req.query.q as string;
  const result = await searchEmails(query);
  res
    .status(200)
    .json({ total: result.length, emails: result });
}

// function to create emails
export async function createEmail(req: Request, res: Response) {
  const email = req.body;
  email.folder = "[Gmail]/Sent Mail";
  email.account = email.from;
  const result = await getAccountByEmail(email.from!);
    if(result){
        email['accountId'] = result.ownerId;
    }
  await createEmailDB(email);
  res.status(201).json({ message: "Email created" });

}

export async function deleteAccounts(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.account.delete({
    where: {
      id: Number(id),
    },
  });
  res.status(200).json({ message: "Account deleted" });
}
export async function addAccounts(res: Response,req:Request){
  const accounts = req.body;
  for(const account of accounts){
    account['owner'] = (req.user as Accounts).userId
  }
  await prisma.account.createMany({
    data: accounts as Prisma.AccountCreateManyInput[]
  });
  res.status(201).json({ message: "Accounts added" });
  
}

// // function to get mail bys id
// export async function getEmailById(req: Request, res: Response) {
//   const { id } = req.params;
//   const result = await client.get({
//     index: "emails",
//     id,
//   });

//   res.status(200).json({ id: result._id, ...result._source! });
// }

// // function to update email by id
// export async function updateEmail(req: Request, res: Response) {
//   const { id } = req.params;
//   const updates: Partial<Email> = req.body;
//   await client.update({
//     index: "emails",
//     id,
//     body: {
//       doc: updates,
//     },
//     refresh: true,
//   });
  
//   res.status(200).json({ id, ...updates });
// }

// // function to delete email by id
// export async function deleteEmail(req: Request, res: Response) {
//   const { id } = req.params;
//   await client.delete({
//     index: "emails",
//     id,
//     refresh: true,
//   });

//   res.status(200).json({ message: `Email with id ${id} deleted.` });
// }



// function to bulk create emails
export async function BulkcreateEmail(emailList: Email[]) {
  try {
    
      const bulkOps: any[] = [];

      for (const email of emailList) {
        // email.folder = email.folder ?? "[Gmail]/All Mail";
       
        let account = await getAccountByEmail( email.folder ==="Sent" ? email.from : email.to);
        if(account){
            email['accountId'] = account.ownerId;


        bulkOps.push(email);
      }
    }

      await createBulkEmails(bulkOps);


      
    
  } catch (err: any) {
    console.error("Error creating email(s):", err);
  }
}

