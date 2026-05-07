import { Server } from "socket.io";
import http from "http";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // 👉 join room theo role (sau này dùng auth)
    socket.on("join-reception", () => {
      socket.join("reception");
    });

    socket.on("join-doctor", () => {
      socket.join("doctor");
    });

    socket.on("join-manager", () => {
  socket.join("manager");
});
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket chưa được khởi tạo");
  return io;
};
