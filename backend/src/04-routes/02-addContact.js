import { Router } from "express";
import { jwtAuthMiddeware } from "../05-middlewares/jwtAuthMiddelware.js";
import { acceptRequest, addContact, markVeiwContactAsRead, rejectRequest, searchUser } from "../03-controllers/02-addContact.js";

export const addContactRouter=Router();

addContactRouter.get("/users/search",jwtAuthMiddeware,searchUser) // GET /api/users/search?email=abc@gmail.com
addContactRouter.post("/add",jwtAuthMiddeware,addContact);

addContactRouter.post("/acceptRequest",jwtAuthMiddeware,acceptRequest);
addContactRouter.post("/rejectRequest",jwtAuthMiddeware,rejectRequest);

addContactRouter.post("/marknotificationread",jwtAuthMiddeware,markVeiwContactAsRead);
