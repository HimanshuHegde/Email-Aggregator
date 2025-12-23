import { request, response } from "express";
import nodemailer from "nodemailer";
import { decrypt } from "../functions/index.js";

export default async function sendMail(req = request, res = response) {
    console.log("SendMail service received a request");
    const { data, Accouunt } = req.body;
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
    try {
        await transporter.verify();
        await transporter.sendMail({
            from: data.from,
            to: data.to,
            subject: `message from ${data.name} - ${data.subject}`,
            text: data.body,
        });
        res.status(200).json({ message: "Email sent successfully" }); 
        console.log("Email sent successfully via SendMail service");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send email" });
    }
}