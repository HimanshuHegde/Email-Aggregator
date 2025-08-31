import { Router } from "express";
import { fetchLast30Days } from "../controller/imapFunctions.controller";

const router = Router();

router.get("/", fetchLast30Days);
export default router;