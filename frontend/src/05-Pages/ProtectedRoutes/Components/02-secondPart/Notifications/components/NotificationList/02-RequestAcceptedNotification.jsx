import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "../../../../../../../00-app/activeTabSlice";
import { useState } from "react";
import { markAsRead } from "../../../../../../../00-app/02-notificationSlice";
import { useMarkNotificationAsRead } from "../../../../../../../03-features/02-addContact/03-hook/05-useMarkNotificaionAsRead";
import { toast } from "react-toastify";

export function RequestAcceptedNotification({ n, setActivePage }) {

  const isRead = Boolean(n.is_read);
  const isDisabled =  isRead;

  const dispatch = useDispatch();
  

  const { mutate } = useMarkNotificationAsRead();
  function handleGetChatsForChatId() {
     if (isDisabled) return;
    dispatch(setActiveTab("all"));
    setActivePage("chats");


    dispatch(markAsRead(n.id));

    const formData = new FormData();
    formData.append("reference_id",n.reference_id);

    mutate(formData, {
      onError: (error) => {
        toast.error(error?.response?.data?.message);
      },
    });
  }
  return (
    <div className="relative p-3 border-b border-gray-800  "  >
      {/* 🔴 Unread dot */}
       {!isRead && (
          <span className="mt-2 h-2 w-2 rounded-full bg-green-500"></span>
        )}

      <p className="text-gray-300 text-md">Your request was accepted by  <span className="font-bold ">{n.name}</span></p>

      <button
        onClick={() => handleGetChatsForChatId()}
        className="text-green-500 text-sm mt-1 hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"disabled={isDisabled}
      >
        Open chat
      </button>
    </div>
  );
}
