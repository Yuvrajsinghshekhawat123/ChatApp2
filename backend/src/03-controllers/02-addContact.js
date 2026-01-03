import { findUserByEmailExcludingSelf, findUserById } from "../02-models/01-user.js";
import {
  createRequest,
  findRequestBySenderIdAndReceiverId,
} from "../02-models/03-addContact.js";
import { createPrivateChatIfNotExists, findPrivateChat } from "../02-models/04-chats.js";
import { findAnyFriendRequest, getFriendRequestById, updateRequestStatus } from "../02-models/05-friend_requests.js";
import { getNotificationById, insertNotification, markNotificationAsReadByReference } from "../02-models/06-notifiction.js";


/*
✅ Separation of responsibilities
    A. searchUser → ONLY finds user
    B. addContact → ONLY creates relationship
    C. chat → only after relationship exists
*/

//A. SEARCH USER BY EMAIL API
export async function searchUser(req, res) {
  try {
    const { email } = req.query;
     
    const loggedInUserId = req.userId; // from JWT middleware

    const existingUser = await findUserByEmailExcludingSelf(
      email,
      loggedInUserId
    );

    if (existingUser.length === 0) {
      return res
        .status(409)
        .json({ success: false, message: "User not found" });
    }

    const targetUser = existingUser[0];

    // check if user has pending request
    // 🔥 CHECK EXISTING REQUEST (BOTH DIRECTIONS)
    const existingRequest = await findAnyFriendRequest(
      loggedInUserId,
      targetUser.id
    );
    

    let requestStatus = null;
    let requestDirection = null;

    if (existingRequest) {
      requestStatus = existingRequest.status;
      requestDirection =
        existingRequest.sender_id === loggedInUserId ? "sent" : "received";
    }



    //  “Check if User A and User B already have a direct chat.”
    const existingChat = await findPrivateChat(loggedInUserId, targetUser.id);

    return res.status(200).json({
      success: true,
      user: targetUser,

      requestExists: !!existingRequest,
      requestStatus,
      requestDirection,

      alreadyContact: !!existingChat,
      id: existingChat?.chatId || null,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ADD CONTACT API (Friend Request)

export async function addContact(req, res) {
  try {
    const senderId = req.userId;
    const { receiverId } = req.body;

    if (senderId == receiverId) {
      return res.status(400).json({ message: "Cannot add yourself" });
    }

    // check existing requst
    const existingRequest = await findRequestBySenderIdAndReceiverId(
      senderId,
      receiverId
    );

    

    if (existingRequest) {
      
      return res.status(409).json({ message: "Reqest already sent" });
    }



     const requestId =  await createRequest(senderId, receiverId);


         // 1️⃣ Insert notification
     const notificationId =await insertNotification(receiverId,'friend_request',requestId);

      // 2️⃣ Fetch full notification row
      const notification = await getNotificationById(notificationId);

      // 3️⃣ Socket emit
      const io=req.app.get("io");
       
      const receiverKey = String(receiverId);
      
     
       
        io.to(receiverKey).emit("notification", notification);
        console.log("✅ notification sent to user:", receiverKey);
      

       




    res.status(200).json({ success: "true", message: "Contact request sent" });
  } catch (err) {
    // 🔥 HANDLE DUPLICATE REQUEST PROPERLY
    if (err.code === "ER_DUP_ENTRY") {
      console.log(err)
      return res.status(409).json({
        success: false,
        message: "Request already sent",
      });
    }

    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}







// accept the request
export async function acceptRequest(req, res) {
  const userId = req.userId; // receiver
  const { reference_id: requestId } = req.body;

  try {
    // 1️⃣ Get friend request
    const request = await getFriendRequestById
    (requestId);

    if (!request || request.receiver_id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (request.status !== "pending") {
      return res.status(409).json({ message: "Request already handled" });
    }

    // 2️⃣ Update request status → accepted
    await updateRequestStatus(requestId,'accepted');


    // 3️⃣ Create private chat (idempotent)
    const chatId = await createPrivateChatIfNotExists(
      request.sender_id,
      request.receiver_id
    );

    // 4️⃣ Mark friend_request notification as READ
    await markNotificationAsReadByReference(
      userId,
      "friend_request",
      requestId
    );

    // 5️⃣ Create NEW notification for sender
    const notificationId = await insertNotification(
      request.sender_id,
      "request_accepted",
      chatId
    );

const onlineUsers=req.app.get("onlineUsers");
    // console.log(onlineUsers , request.sender_id ,request.receiver_id );

    // 6️⃣ Emit socket events AFTER DB success
    const io = req.app.get("io");

    const notification = await getNotificationById(notificationId);

    const receiverKey = String(request.sender_id);
    io.to(receiverKey).emit("notification",  notification);
    // console.log("send");




    const sender = await findUserById(request.sender_id);
    const chatPayload = {
  userId:sender[0].id,
  id:chatId,
  name: sender[0].name,
  avatar: sender[0].avatar || null,
  lastMessage: null,
  time: null,
  unreadCount: 0,
  isOnline:  onlineUsers.has(String(sender[0].id)), // optional (from onlineUsers map)
  type: "single",
};

    io.to(String(request.sender_id)).emit("friend_request:accepted", 
      chatPayload
    );

    
    return res.status(200).json({
      success: true,
      message: "Request accepted",
      chatId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}




// reject the request;
export async function rejectRequest(req,res) {
  const userId = req.userId; // receiver
  const { reference_id: requestId } = req.body;

  try{

    // 1️⃣ Get friend request
    const request = await getFriendRequestById(requestId);

    if (!request || request.receiver_id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (request.status !== "pending") {
      return res.status(409).json({ message: "Request already handled" });
    }



    // 2️⃣ Update request status → accepted
    await updateRequestStatus(requestId,'rejected');

    // 4️⃣ Mark friend_request notification as READ
    await markNotificationAsReadByReference(
      userId,
      "friend_request",
      requestId
    );


      // 4️⃣ Respond to frontend
    return res.status(200).json({
      success: true,
      message: "Friend request rejected"
    });


  }catch(err){

    console.error(err);
    return res.status(500).json({ success: false, message: err.message });

  }
}



// mark the notificon veiw contact as read;
export async function markVeiwContactAsRead(req,res) {
  try{

    const userId = req.userId; // receiver
  const { reference_id: requestId } = req.body;

  await markNotificationAsReadByReference(
      userId,
      "request_accepted",
      requestId
    );


     return res.status(200).json({
      success: true,
      message: "Mark notifiction as read"
    });


  }catch(err){
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}