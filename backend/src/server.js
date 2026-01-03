 import express from "express";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./01-config/connectDb.js";
import requestIp from "request-ip";
import cookieParser from "cookie-parser";
import cors from "cors";

import { userRouter } from "./04-routes/01-user.js";
import { addContactRouter } from "./04-routes/02-addContact.js";
import { userNotification } from "./04-routes/03-notification.js";
;
import initSocket, { onlineUsers } from "./08-socket/socket.js";
import { jwtAuthMiddeware } from "./05-middlewares/jwtAuthMiddelware.js";
import { userChatRouter } from "./04-routes/04-chats.js";

const app = express();
const server = http.createServer(app);

/* -------------------- Middlewares -------------------- */
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(requestIp.mw());

/* -------------------- Routes -------------------- */
app.use("/api/auth", userRouter);
app.use("/api/addContact", addContactRouter);
app.use("/api/notification", userNotification);
app.use("/api/chats",userChatRouter)




app.get("/socket/auth",jwtAuthMiddeware, (req, res) => {
  res.json({ userId: req.userId });
});



/* -------------------- Socket.IO -------------------- */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// initialize socket events
initSocket(io);

// make io accessible in controllers
app.set("io", io); //This stores data inside the Express app instance. like req.app
app.set("onlineUsers", onlineUsers);

/* -------------------- Start Server -------------------- */
async function startServer() {
  await connectDB();

  server.listen(3000, () => {
    console.log("🚀 Server running on port 5000");
  });
}

startServer();
