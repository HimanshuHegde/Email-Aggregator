import nodemailer from "nodemailer";
import { Email } from "../types/email";
import { Request, Response } from "express";
import { indexingEmail } from "../server functions/elasticSearchinit";
import { getAccountByEmail } from "../server functions/CRUD/accounts";
import bcrypt from "bcrypt";
import { decrypt } from "../server functions/crypto";
import { JsonObject } from "../generated/prisma/runtime/library";
import { createEmailDB } from "../server functions/CRUD/emails";


// function to send emails
export default async function sendEmail(req: Request, res: Response) {
    const data = req.body as Email;
    let Accouunt = await getAccountByEmail(data.from!);
    data.accountId = Accouunt?.ownerId!;
    Accouunt!.AppPass = decrypt(Accouunt?.AppPass! as any);
    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: Accouunt?.email,
      pass: Accouunt?.AppPass,
    },
});
    try{
    await transporter.verify();
    await transporter.sendMail({
        from: data.from,
        to: data.to,
        subject: `message from ${data.name} - ${data.subject}`,
        text: data.body,
    });
    console.log(2)
    res.status(200).json({ message: "Email sent successfully" });
    await createEmailDB(data);
    console.log(3)
} catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send email" });
}
}

;