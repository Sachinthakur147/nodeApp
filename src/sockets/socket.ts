import { Server, Socket } from "socket.io";

export const configureSocket = (io = Server)=>{
     io.on("connection", (socket:Socket) => {console.log("client connection", socket.id);
          socket.on("joinroom",(room:any)=>{
               socket.join(room);
          });

          socket.on("joinRoom",(room:any)=>{
               socket.join(room);
          });

          socket.on("sendMessage",(room:any, message:any)=>{
               io.to(room).emit("receiveMessage",message);
          });
          socket.on("disconnect", () => {
               console.log("client disconnected", socket.id);
          });
     });
}