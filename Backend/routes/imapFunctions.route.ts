import { Router } from "express";
import { fetchLast30Days } from "../controller/imapFunctions.controller";
import authenticateToken from "../server functions/middleware";

const router = Router();

router.get("/",authenticateToken, fetchLast30Days);
export default router;