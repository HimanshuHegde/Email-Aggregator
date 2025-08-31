import Router from "express";
import { createEmail, deleteEmail, getEmailById, searchEmails, updateEmail } from "../controller/elasticSearchFunction.controller";

const router = Router();

router.get("/",searchEmails);
router.get("/:id", getEmailById);
router.delete("/:id", deleteEmail);
router.put("/:id", updateEmail);
router.post("/", createEmail);

export default router;