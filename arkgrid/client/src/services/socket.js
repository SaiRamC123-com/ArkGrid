import { io } from "socket.io-client";
import { auth } from "../firebase";

let socket = null;
let refs = 0;

// One shared connection. The token is fetched fresh on every (re)connect.
export function acquireSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket", "polling"],
      reconnectionDelayMax: 8000,
      auth: async (cb) => {
        try {
          cb({ token: await auth.currentUser.getIdToken() });
        } catch {
          cb({});
        }
      },
    });
  }
  refs++;
  return socket;
}

export function releaseSocket() {
  refs = Math.max(0, refs - 1);
  if (refs === 0 && socket) {
    socket.disconnect();
    socket = null;
  }
}