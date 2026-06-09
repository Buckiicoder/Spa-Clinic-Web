import { io } from "socket.io-client";
import { SOCKET_URL } from "./env";

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: false,
});