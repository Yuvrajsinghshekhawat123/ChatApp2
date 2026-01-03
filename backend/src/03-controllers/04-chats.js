import { allChatsOfUser, fetchMessages } from "../02-models/04-chats.js";
import { onlineUsers } from "../08-socket/socket.js";

export async function getAllChatsForUser(req, res) {
  try {
    let chats = await allChatsOfUser(req.userId);

     chats = chats.map(chat => ({
    ...chat,
    isOnline: onlineUsers.has(String(chat.userId)),
  }));

     
    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// get all messages when
export async function getMessages(req, res) {
  try {
    const { chatId } = req.query;

    

     const cursor = req.query.cursor
      ? JSON.parse(req.query.cursor)
      : null;


       console.log(cursor,);
        const { messages, nextCursor } = await fetchMessages(
      chatId,
      req.userId,
      cursor || null 


    );

     


      
    res.json({
      success: true,
      messages,
      nextCursor,
    });


  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}



 