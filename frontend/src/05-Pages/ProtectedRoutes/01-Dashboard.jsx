import { useState } from "react";
import { Header } from "./Components/01-firstPart/01-header";
import { Chats } from "./Components/02-secondPart/01-chats/01-chats";
import { Groups } from "./Components/02-secondPart/02-groups";
import { Profile } from "./Components/02-secondPart/03-profile";
import { Logout } from "./Components/02-secondPart/04-logut";
import { useLoginUserDetails } from "../../00-CreateGlobalSession/hook/03-useData";
import { ClipLoader } from "react-spinners";
import { ProfileThirdPart } from "./Components/03-thirdPart/01-profile";
import { ChatWindow } from "./Components/03-thirdPart/02-chat";
import { NotificationPanel } from "./Components/02-secondPart/Notifications/allNotificationsType";
import { useDispatch, useSelector } from "react-redux";
 
import socket from "../../07-socket/socket";
import { useEffect } from "react";
import { addNotification, setNotifications } from "../../00-app/02-notificationSlice";
import { useAllNotifiction } from "../../03-features/03-notifiction/03-hook/01-useAllNotifiction";
import { useAllchats } from "../../03-features/04-chats/02-hook/01-useGetAllChats";
import { addChatOptimistic, addMessageOptimistic, incrementUnread, markChatAsRead, openChat, setChats, upsertMessageFromServer } from "../../00-app/01-chatSlice";

export default function Dashboard() {


  const { data: user,isLoading } = useLoginUserDetails();

  const dispatch = useDispatch();



  const { data } = useAllNotifiction();

  const notifications = useSelector(
    state => state.notification.list
  );


  


  const chats = useSelector(state => state.chat.chats);

useEffect(() => {
  if (data?.success && notifications.length === 0) {
    dispatch(setNotifications(data));
  }
}, [data, notifications.length, dispatch]);



useEffect(() => {
    const handler = (notification) => {
    dispatch(addNotification(notification));
    console.log("received notification");
    console.log(notification);
  };


    // ✅ Friend request accepted (for receiver)
  const onRequestAccepted = (chatPayload) => {
  console.log("✅ friend_request:accepted", chatPayload);
  

 dispatch(addChatOptimistic(chatPayload));  
  dispatch(openChat(chatPayload.id)); 

    

    // OPTIONAL UX:
    // open chat automatically
    // setActivePage("chats");
    // dispatch(setActiveChat(chatId));
  };



 
const onNewMessage = (msg) => {
    dispatch(upsertMessageFromServer({
      chatId: msg.chatId,
      message:{
         id: msg.id,
          sender_id: msg.sender_id,
          content:msg.content,
          attachments:msg.attachments,
          created_at: msg.created_at,
          tempId:msg.tempId
      }

    })); // or addMessage(msg)
};



  // socket here
  socket.on("notification", handler);
  socket.on("friend_request:accepted", onRequestAccepted);
  socket.on("message:new", onNewMessage);

  return () => {
    socket.off("notification", handler);
    socket.off("friend_request:accepted", onRequestAccepted);
     socket.on("message:new", onNewMessage);
  };
}, [dispatch]);



 
const activeChatId = useSelector(
    (state) => state.chat.activeChatId
  );

const {data:allchats,isLoadingChats}=useAllchats();
 useEffect(() => {
    if (allchats?.success && chats.length === 0) {
      dispatch(setChats(allchats.chats));
    }
  }, [allchats, chats.length, dispatch]);


// open the chat when the user caht with other
  useEffect(() => {
    if (!activeChatId) return;
  socket.emit("chat:open", {activeChatId});


  //// when open the caht then mark all message as read
  dispatch(markChatAsRead(activeChatId)); // 🔥 UI update immediately
  socket.emit("chat:opened", {
  activeChatId
});


  return () => {
    socket.emit("chat:close", {activeChatId} );
  };
}, [activeChatId]);





 

useEffect(() => {
  const onNotificationNew = (data) => {
    dispatch(
      incrementUnread({
        chatId: data.chatId,
        activeChatId,
      })
    );
  };

  socket.on("notification:new", onNotificationNew);
  return () => {
    socket.off("notification:new", onNotificationNew);
  };
}, [dispatch]);



   if (isLoading || isLoadingChats) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <ClipLoader color="#2563eb" loading size={50} />
        </div>
      </div>
    );

  }




  
  const [activePage, setActivePage] = useState("chats");
  const [searchText,setSearchText]=useState("");

  return (
    <>
      <section className="grid grid-cols-[5%_30%_65%] w-full h-screen">
        <section className="bg-[#202c33] text-white border-r border-gray-700">
          {/* header */}
          <Header activePage={activePage} setActivePage={setActivePage} userDetail={user} />
        </section>

        <section className="bg-[#111b21] text-white  h-full border-r border-gray-700">
          {activePage === "chats" && <Chats searchText={searchText} setSearchText={setSearchText} />}
          {activePage === "groups" && <Groups  />}
          {activePage === "profile" && <Profile    />}
          {activePage === "notification" && <NotificationPanel   setActivePage={setActivePage} />}
          {activePage === "logout" && <Logout />}
        </section>

        <section className="bg-[#191c1e]">
            
           
          {activePage === "profile" && <ProfileThirdPart/>}
          {activePage === "chats" && <ChatWindow activePage={activePage}/>}
          
        </section>
      </section>
    </>
  );
}
