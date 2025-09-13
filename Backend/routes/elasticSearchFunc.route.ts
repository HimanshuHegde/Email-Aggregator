import Router from "express";
import { addAccounts, BulkcreateEmail, createEmail, deleteAccounts, searchEmail } from "../controller/elasticSearchFunction.controller";
import authenticateToken from "../server functions/middleware";

const router = Router();

router.get("/",authenticateToken,searchEmail);
// router.get("/:id", getEmailById);
// router.delete("/:id", deleteEmail);
// router.put("/:id", updateEmail);
router.post("/",authenticateToken, createEmail);
router.post("/bulk",authenticateToken, BulkcreateEmail); 
router.post("/addAccounts",authenticateToken, addAccounts);
router.delete("/deleteAccount",authenticateToken, deleteAccounts    );

export default router;