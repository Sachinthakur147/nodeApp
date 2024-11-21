"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Register endpoint
router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    // Missing validation for email and password
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    try {
        const user = await database_1.prisma.user.create({
            data: { email, password: hashedPassword },
        });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ message: "User already exists" });
    }
});
// Login endpoint
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await database_1.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: "1h" });
    await database_1.prisma.user.update({
        where: { id: user.id },
        data: { session: token },
    });
    res
        .cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
        .json({ message: "Logged in successfully" });
});
// Logout endpoint
router.post("/logout", auth_1.authenticate, async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(400).json({ message: "Invalid user session" });
    }
    await database_1.prisma.user.update({
        where: { id: user.id },
        data: { session: null },
    });
    res.clearCookie("token").json({ message: "Logged out successfully" });
});
exports.default = router;
