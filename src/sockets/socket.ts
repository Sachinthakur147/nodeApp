import { Server, Socket } from "socket.io";

export const configureSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected", socket.id);

    socket.on("joinRoom", (room: string) => {
      console.log(`Socket ${socket.id} joining room: ${room}`);
      socket.join(room);
    });

    socket.on("sendMessage", (room: string, message: any) => {
      console.log(`Message to room ${room}: ${message}`);
      io.to(room).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
};
