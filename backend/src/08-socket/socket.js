// this socket code is the SAME for all users

import { getDB } from "../01-config/connectDb.js";
import { getChatMembers } from "../02-models/04-chats.js";



/*
key->value  ==>> userId -> Set of socketIds

onlineUsers = {
  "123": Set("s1", "s2"), // user has 2 devices
  "456": Set("s3")
}

what is means of  Set("s1", "s2")?
  One user can be logged in at the same time from multiple places
    (mobile, laptop, another browser tab, etc.)
Each place = one socket connection


*/



export const onlineUsers = new Map(); // “Store onlineUsers in the app so everyone can access it.”

export default function initSocket(io) {
  io.on("connection", (socket) => {
    
      const db=getDB();

  socket.on("setUser", (userId) => {
    const userKey = String(userId); // ✅ normalize here
    socket.userId = userKey;

    // --------------------
    // ADD USER SOCKET
    // --------------------
    if (!onlineUsers.has(userKey)) {
      onlineUsers.set(userKey, new Set());
    }

    onlineUsers.get(userKey).add(socket.id);
    socket.join(userKey);

    console.log("🟢 User online:", userKey);
  });
 
  // --------------------
  // one to one chat
  //---------------------

  // 2️⃣ Chat OPEN (window active)
  socket.on("chat:open",({activeChatId})=>{
    socket.activeChatId=activeChatId;
    socket.join(activeChatId);



    
     
  });


  //3️⃣ Chat CLOSE
  socket.on("chat:close",({activeChatId})=>{
    if (socket.activeChatId === activeChatId) {
      socket.activeChatId = null;
      socket.leave(activeChatId);
    }
  })


  // 4️⃣ MESSAGE SEND (MAIN LOGIC)
    socket.on(
    "message:send",
    async ({ chatId, content, attachments = [], tempId }) => {
      try {
        // 1️⃣ Insert message
        const [res] = await db.execute(
          `
          INSERT INTO messages (chat_id, sender_id, content)
          VALUES (?, ?, ?)
          `,
          [chatId, socket.userId, content || null]
        );

        const messageId = res.insertId;

        // 2️⃣ Sender ALWAYS read
        await db.execute(
          `
          INSERT IGNORE INTO message_reads (message_id, user_id)
          VALUES (?, ?)
          `,
          [messageId, socket.userId]
        );

        // 3️⃣ Insert attachments (if any)
        for (const file of attachments) {
          await db.execute(
            `
            INSERT INTO message_attachments
            (message_id, public_id, url, type)
            VALUES (?, ?, ?, ?)
            `,
            [messageId, file.public_id, file.url, file.type]
          );
        }

        // 4️⃣ Emit message to chat room
        const messagePayload = {
          id: messageId,
          chatId,
          sender_id: socket.userId,
          content,
          attachments,
          created_at: new Date(),
          tempId,
        };

        io.to(chatId).emit("message:new", messagePayload);

        // 5️⃣ MARK AS READ (ONLY IF ACTIVE & DELIVERED)
        const members = await getChatMembers(chatId); // except sender

        
         
        for (const userId of members) {
           
          if (userId === socket.userId) continue; //✔ Sender already read the message

          const sockets = onlineUsers.get(String(userId));
          if (!sockets) continue;
          

          
          for (const sockId of sockets) {
            const s = io.sockets.sockets.get(sockId);
            


              // ✅ CASE 1: Receiver is viewing the chat → mark as read
            if (s && s.activeChatId === chatId) {
               
              await db.execute(

                
                `
                INSERT IGNORE INTO message_reads (message_id, user_id)
                VALUES (?, ?)
                `,
                [messageId, userId]
              );

               

              // notify frontend (optional)
              // io.to(s.id).emit("message:read", {
              //   messageId,
              //   chatId
              // });
            }


            
    // 🔔 CASE 2: Receiver is NOT viewing the chat → send notification
        else {
          io.to(s.id).emit("notification:new", {
            type: "message",
            chatId,
            senderId: socket.userId,
            content,
            created_at: new Date(),
          });
             
           
        }
          }
        }

      } catch (err) {
        socket.emit("message:error", {
          tempId,
          error: "Message failed"
        });
      }
    }
  );
 






  // when open the caht then mark all message as read
  socket.on("chat:opened", async ({ activeChatId }) => {
  try {
    await db.execute(
      `
      INSERT IGNORE INTO message_reads (message_id, user_id)
      SELECT m.id, ?
      FROM messages m
      LEFT JOIN message_reads mr
        ON mr.message_id = m.id
       AND mr.user_id = ?
      WHERE m.chat_id = ?
        AND m.sender_id != ?
        AND mr.message_id IS NULL
      `,
      [
        socket.userId, // insert for this user
        socket.userId, // join check
        activeChatId,
        socket.userId
      ]
    );

    // optional: notify sender(s) that messages were read
    // io.to(chatId).emit("messages:read", { chatId });

  } catch (err) {
    console.error("chat:opened error", err);
  }
});







    // --------------------
    // DISCONNECT
    // --------------------
    socket.on("disconnect", () => {
      const userId = socket.userId;
      if (!userId) return;


      const userSockets = onlineUsers.get(userId);

      if (!userSockets) return;

      userSockets.delete(socket.id);

      // If no active sockets → offline
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        console.log("🔴 User offline:", userId);
      }
    });
   
});
}
