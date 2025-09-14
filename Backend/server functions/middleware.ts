import { Request, Response } from "express";
import jwt from 'jsonwebtoken'

export default function authenticateToken(req:Request,res:Response,next:any){
    try{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decodeToken;
    next();
    }catch(err){
        return res.status(403).json({ message: 'Invalid token' });;
    }
}