import { getNotificationsWithCount } from "../02-models/06-notifiction.js";

export async function getAllNotifications(req,res) {
    try{

        
        const {notifications,total,unread } =await getNotificationsWithCount(req.userId);
       return  res.status(200).json({success:true,notifications,total,unread});
    }catch(err){
        console.error(err);
    return res.status(500).json({ success: false, message: err.message });
    }
}



// mark the message unread


/*
1️⃣ How notifications should work (correct flow)
Action happens
↓
Save notification in DB (ALWAYS)
↓
Check if receiver is online
↓
If online → emit socket event
↓
If offline → user will fetch later via API
*/



// accept the 