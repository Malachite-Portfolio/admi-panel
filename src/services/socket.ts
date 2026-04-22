import { io, type Socket } from "socket.io-client";
import { SOCKET_BASE_URL } from "@/constants/api";

let adminSocket: Socket | null = null;

export const connectAdminSocket = (token?: string) => {
  if (!SOCKET_BASE_URL || !token) {
    return null;
  }

  if (adminSocket?.connected) {
    return adminSocket;
  }

  if (adminSocket) {
    adminSocket.disconnect();
  }

  adminSocket = io(SOCKET_BASE_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1000,
    auth: { token },
  });

  return adminSocket;
};

export const disconnectAdminSocket = () => {
  if (adminSocket) {
    adminSocket.disconnect();
    adminSocket = null;
  }
};

export const getAdminSocket = () => adminSocket;
