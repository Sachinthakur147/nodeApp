import { Router } from "express";
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 
import { prisma } from "../config/database";
import { authenticate } from "../middleware/auth";
import express, { Request, Response } from "express";

const router = express.Router();

// Register endpoint
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Missing validation for email and password
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: "User already exists" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.SECRET_KEY!, 
    { expiresIn: "1h" }
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { session: token },
  });

  res
    .cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
    .json({ message: "Logged in successfully" });
});

// Logout endpoint
router.post("/logout", authenticate, async (req, res) => {
  const user = req.user;

 
  if (!user) {
    return res.status(400).json({ message: "Invalid user session" });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { session: null },
  });

  res.clearCookie("token").json({ message: "Logged out successfully" });
});

export default router;
