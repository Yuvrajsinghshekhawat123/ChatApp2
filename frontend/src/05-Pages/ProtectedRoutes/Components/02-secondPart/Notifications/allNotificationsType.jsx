import { useState } from "react";
import { FriendRequestNotification } from "./components/NotificationList/01-FriendRequestNotification";
import { RequestAcceptedNotification } from "./components/NotificationList/02-RequestAcceptedNotification";
import { GroupInviteNotification } from "./components/NotificationList/03- GroupInviteNotification";
import { SystemNotification } from "./components/NotificationList/04-SystemNotification";
import { useAllNotifiction } from "../../../../../03-features/03-notifiction/03-hook/01-useAllNotifiction";
import { useDispatch, useSelector } from "react-redux";
import { setNotifications } from "../../../../../00-app/02-notificationSlice";
import { useEffect } from "react";

export function NotificationPanel({setActivePage}) {
 
 const dispatch = useDispatch();
  const notifications = useSelector(
    state => state.notification.list
  );
   

  const groupedNotifications = notifications.reduce((acc, n) => {
  if (!acc[n.type]) {
    acc[n.type] = [];
  }
  acc[n.type].push(n);
  return acc;
}, {});



const [activeType, setActiveType] = useState(null);

function toggleNotification(type) {
  setActiveType(prev => (prev === type ? null : type));
}




 
 


 if (!notifications.length) {
    return (
      <p className="p-4 text-gray-400 text-center">
        No notifications
      </p>
    );
  }



  return (<>
     
      <div className="p-3 text-2xl font-semibold border-b border-gray-700">
        Notifications
      </div>

    
     <div  >

  {Object.entries(groupedNotifications).map(([type, items]) => {
  const isOpen = activeType === type;

  return (
    <div key={type} className="border-b border-gray-700">
      {/* HEADER */}
      <div
        onClick={() => toggleNotification(type)}
        className="p-3 cursor-pointer flex justify-between items-center hover:bg-[#1a1a1a]"
      >
        <div className="flex items-center gap-2">
          {/* UNREAD DOT */}
          {items.some(n => n.is_read === 0) && (
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
          )}


          {/* header name  */}
          <span className="font-semibold text-xl capitalize">
            {type.replace("_", " ")} ({items.length})
          </span>
        </div>

        <span className="text-sm text-gray-400">
          {isOpen ? "▲" : "▼"}
        </span>
      </div>

      {/* BODY */}
      {isOpen && (
        <div className="bg-[#111] max-h-[70vh] overflow-y-auto custom-scrollbar">
          {items.map((n) => {
            switch (type) {
              case "friend_request":
                return (
                  <FriendRequestNotification key={n.id} n={n} />
                );

              case "request_accepted":
                return (
                  <RequestAcceptedNotification key={n.id} n={n}  setActivePage={setActivePage}/>
                );

              case "group_invite":
                return (
                  <GroupInviteNotification key={n.id} n={n} />
                );

              default:
                return (
                  <SystemNotification key={n.id} n={n} />
                );
            }
          })}
        </div>
      )}
    </div>
  );
})}


</div>


    </>
  );
}





/*
Yes, the Notification page should contain MANY types of notifications, not only friend requests.
The correct solution is to categorize notifications, not create separate pages.



🔔 Notification Page = “All system events”
Think of Notifications as events, not features.
Examples of notification types:
    👤 Friend request
    💬 New message
    👥 Added to group
    🔄 Request accepted
    ⚠️ System alerts
All of these belong to the same Notifications page.


🧠 How Big Apps Handle This (WhatsApp / Instagram / Slack)
They use ONE notification feed, but each item has:
    a type
    an action
    optional buttons (Accept / Reject / View)



| type             | reference_id | meaning         |
| ---------------- | ------------ | --------------- |
| friend_request   | 12           | Accept / Reject |
| message          | 88           | Open chat       |
| request_accepted | 12           | Start chat      |
| group_invite     | 5            | Join group      |





*/