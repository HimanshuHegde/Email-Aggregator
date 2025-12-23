import { Email } from "../types/email";
import { Request, Response } from "express";
import { getAccountByEmail } from "../server functions/CRUD/accounts";
import { createEmailDB } from "../server functions/CRUD/emails";


// function to send emails
export default async function sendEmail(req: Request, res: Response) {
    const data = req.body as Email;
    let Accouunt = await getAccountByEmail(data.from!);
    data.accountId = Accouunt?.ownerId!;
    // Accouunt!.AppPass = decrypt(Accouunt?.AppPass! as any);
    // console.log(Accouunt?.AppPass,"Encrypted Pass");
    console.log('1sdfsdsdfsdf');
    let response = await fetch('http://localhost:3001/sendMail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({data, Accouunt}),
        })
        console.log("Response from sendMail service:", response);
        if (response.ok) {
            await createEmailDB(data);
            res.status(200).json({ message: "Email sent successfully" });
        } else {
            res.status(500).json({ message: "Failed to send email" });
        }
    }