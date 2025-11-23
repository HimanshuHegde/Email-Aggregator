import Router from "express";
import {prisma} from "../lib/prisma"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authenticateToken from "../server functions/middleware";
const JWT_SECRET = process.env.JWT_SECRET!
// const prisma = new PrismaClient();
const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
  

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

router.post('/logout', function(req, res, next) {
  // Since we're using JWTs, logout can be handled on the client side by deleting the token.
  res.json({ success: true, message: 'Logged out successfully' });
});


router.post("/signup", async (req, res, next) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (err) {
    next(err); 
  }
});


router.get('/me', authenticateToken, (req, res) => {
  
  const { id, email, name } = (req.user as any) || {};
  res.json({
    authenticated: true,
    user: { id, email, name }
  });
});





export default router;




