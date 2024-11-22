import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { authenticate } from "../middleware/auth";
import express, { Request, Response, NextFunction } from "express";


const router = express.Router();

// Register endpoint
interface RegisterRequestBody {
  email: string;
  password: string;
}

router.post(
  "/register",
  async (req: Request<{}, RegisterRequestBody>, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { email, password: hashedPassword },
      });

      res.status(201).json({ message: "User registered successfully", user });
    } catch (error: any) {
      if (error.code === "P2002") {
        res.status(400).json({ message: "User already exists" });
        return;
      }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


// Login endpoint
router.post(
  "/login",
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      if (!process.env.SECRET_KEY) {
        throw new Error("Secret key not configured");
      }

      const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { session: token },
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .json({ message: "Logged in successfully" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { id: string };

    // Fetch user from database
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.session !== token) {
      res.status(401).json({ message: "Unauthorized: Invalid session" });
      return;
    }

    // Attach user to request object for use in downstream handlers
    req.user = user;
    next(); // Pass control to the next middleware/route handler
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// Logout endpoint
router.post("/logout", authenticate, async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(400).json({ message: "Invalid user session" });
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { session: null },
    });

    res.clearCookie("token").json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
