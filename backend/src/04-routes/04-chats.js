import { Router } from "express";
import { jwtAuthMiddeware } from "../05-middlewares/jwtAuthMiddelware.js";
import { getAllChatsForUser, getMessages } from "../03-controllers/04-chats.js";
export const userChatRouter=Router();

userChatRouter.get("/allchats",jwtAuthMiddeware,getAllChatsForUser);
userChatRouter.get("/messages",jwtAuthMiddeware,getMessages);



