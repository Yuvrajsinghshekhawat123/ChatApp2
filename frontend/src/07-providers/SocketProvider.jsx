/*
It is a wrapper component whose only job is to:
    Create and manage ONE socket connection for your whole app
It doesn’t render UI — it only controls side effects.

❓Why do we need this?
Without this provider:
   1. Socket might connect multiple times
   2. Event listeners might duplicate
   3. Memory leaks happen
   4. Notifications fire multiple times

This ensures:
✅ One connection
✅ One lifecycle
✅ Clean connect / disconnect
*/
 


import { useEffect } from "react";
import socket from "../07-socket/socket";
import axios from "axios";

export default function SocketProvider({ children }) {
  useEffect(() => {
    socket.connect();

    socket.on("connect", async () => {
      console.log("🟢 Socket connected:", socket.id);

      try {
        // 🔐 Authenticate socket via HTTP
        const res = await axios.get(
          "http://localhost:3000/socket/auth",
          { withCredentials: true }
        );

        // 🔑 Send verified userId to socket
        socket.emit("setUser", res.data.userId);

      } catch (err) {
        console.error("❌ Socket auth failed", err);
        socket.disconnect();
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  return children;
}







/*
No matter WHERE the socket event is EMITTED on the server,
it will be RECEIVED only in the frontend component where you LISTEN to that event

That is exactly how Socket.IO works
*/


