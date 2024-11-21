"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSocket = void 0;
const socket_io_1 = require("socket.io");
const configureSocket = (io = socket_io_1.Server) => {
    io.on("connection", (socket) => {
        console.log("client connection", socket.id);
        socket.on("joinroom", (room) => {
            socket.join(room);
        });
        socket.on("joinRoom", (room) => {
            socket.join(room);
        });
        socket.on("sendMessage", (room, message) => {
            io.to(room).emit("receiveMessage", message);
        });
        socket.on("disconnect", () => {
            console.log("client disconnected", socket.id);
        });
    });
};
exports.configureSocket = configureSocket;
