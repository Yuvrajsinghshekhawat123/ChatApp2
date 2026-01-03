import { Router } from "express";
import { jwtAuthMiddeware } from "../05-middlewares/jwtAuthMiddelware.js";
import { getAllNotifications } from "../03-controllers/03-notifictaion.js";

export const userNotification=Router();
 
userNotification.get("/allNotifiction",jwtAuthMiddeware,getAllNotifications);