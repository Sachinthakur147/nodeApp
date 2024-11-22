import express from "express";
import http from "http";
import 'dotenv/config';
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth";
import { configureSocket } from "./sockets/socket";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});


app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);


configureSocket(io);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});