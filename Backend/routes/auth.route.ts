import Router from "express";
import passport from 'passport'
import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const router = Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: any, user:any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ success: true, user });
    });
  })(req, res, next);
});

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session?.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'Logged out successfully' });
    });
  });
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

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ success: true, user });
    });

  } catch (err) {
    next(err); 
  }
});

export default router;




