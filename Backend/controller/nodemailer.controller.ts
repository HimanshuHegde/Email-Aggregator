import nodemailer from "nodemailer";
import { Email } from "../types/email";
import { Accounts } from "../types/email";
import { Request, Response } from "express";
import { indexingEmail } from "../server functions/elasticSearchinit";

const Account:Accounts[] = JSON.parse(process.env.USER_ACCOUNTS!);

// function to send emails
export default async function sendEmail(req: Request, res: Response) {
    const data = req.body as Email;
    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: Account.filter((acc : Accounts) => acc.email === data.account)[0].email,
      pass: Account.filter((acc : Accounts) => acc.email === data.account)[0].password,
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
    await indexingEmail(data);
    console.log(3)
} catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send email" });
}
}