import { Router } from "express";
import sendEmail from "../controller/nodemailer.controller";

const router = Router();

router.post("/", sendEmail);

export default router;