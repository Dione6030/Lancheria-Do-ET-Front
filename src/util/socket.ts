import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function obtemSocket() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  if (!socket) socket = io(import.meta.env.VITE_API_URL, { auth: { token } });
  return socket;
}

export function desconectaSocket() {
  socket?.disconnect();
  socket = null;
}