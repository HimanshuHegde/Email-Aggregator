import { Request, Response, Router } from "express";
import authenticateToken from "../server functions/middleware";
import { getAcountByOwnerId } from "../server functions/CRUD/accounts";

const router = Router();

router.get("/:ownerId",authenticateToken, async (req:Request, res:Response) => {
    const { ownerId } = req.params;
    const reuslt = await getAcountByOwnerId(Number(ownerId));
    res.status(200).json({ accounts: reuslt });
}
);
export default router;