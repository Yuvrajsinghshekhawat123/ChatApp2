 import { useSelector, useDispatch } from "react-redux";
import { FiPlus, FiSmile, FiMic } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";

import { ClipLoader } from "react-spinners";
import { useGetAllMessagesPerChatId } from "../../../../03-features/04-chats/02-hook/02-useGetAllMessages";
import {
  addMessageOptimistic,
  appendMessages,
  setMessages,
} from "../../../../00-app/01-chatSlice";
import socket from "../../../../07-socket/socket";
import { useLoginUserDetails } from "../../../../00-CreateGlobalSession/hook/03-useData";

export function ChatWindow({ activePage }) {
  const dispatch = useDispatch();
  const { data: user, isUserLoading } = useLoginUserDetails();

  const activeChatId = useSelector((state) => state.chat.activeChatId);
  const activeChat = useSelector((state) =>
    state.chat.chats.find((c) => c.id === activeChatId)
  );

  const activeTab = useSelector((state) => state.active.activeTab);

  // ✅ messages from Redux (single source of truth)
  const messages =
    useSelector(
      (state) => state.chat.messagesByChat[activeChatId]?.messages
    ) || [];

  const [inputChats, setInputChats] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
   const [cursor, setCursor] = useState(null);
const [nextCursor, setNextCursor] = useState(null);
 

const scrollRef = useRef(null);

const [isPaginating, setIsPaginating] = useState(false);



  const { data, isLoading, isFetching } =
    useGetAllMessagesPerChatId(activeChatId, cursor);
 

 // This ensures each chat starts fresh    
   useEffect(() => {
  if (!data?.messages || !activeChatId) return;

  const el = scrollRef.current;
  if (!el) return;

  const prevScrollHeight = el.scrollHeight;
  const shouldAutoScroll = isUserNearBottom(el);

  const normalized = data.messages.map((m) => ({
    id: m.id,
    sender_id: String(m.sender_id),
    content: m.content,
    attachments: m.attachments || [],
    created_at: m.created_at,
  }));

  if (cursor === null) {
    // first load → always scroll to bottom
    dispatch(
      setMessages({
        chatId: activeChatId,
        messages: normalized.reverse(),
      })
    );

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });

  } else {
    // pagination (older messages)
    dispatch(
      appendMessages({
        chatId: activeChatId,
        messages: normalized.reverse(),
      })
    );

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight - prevScrollHeight;
    });
  }

  setNextCursor(data.nextCursor ?? null);
  setIsPaginating(false);

  // ✅ auto-scroll only if user was near bottom
  if (shouldAutoScroll) {
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }

}, [data]);



useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  requestAnimationFrame(() => {
    el.scrollTop = el.scrollHeight;
  });
}, [messages.length]);





function handleScroll(e) {
  const el = e.target;

  if (
    el.scrollTop <= 100 &&
    nextCursor &&
    !isFetching &&
    !isPaginating
  ) {
    setIsPaginating(true);
    setCursor(nextCursor);
  }
}


function isUserNearBottom(el, threshold = 120) {
  return (
    el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  );
}




useEffect(() => {
  setCursor(null);
  setNextCursor(null);
  setIsPaginating(false);
}, [activeChatId]);



  /* ---------- EMPTY STATE ---------- */
  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 bg-[#111b21]">
        Select a chat to view details
      </div>
    );
  }

  /* ---------- SEND MESSAGE ---------- */
  function handleSend() {
    if (!inputChats.trim() || !activeChatId) return;

    const tempId = crypto.randomUUID();

    // 1️⃣ Optimistic insert
    dispatch(
      addMessageOptimistic({
        chatId: activeChatId,
        message: {
          tempId,
          content: inputChats,
          sender_id: user.id,
          attachments: [],
          created_at: new Date(),
        },
      })
    );

    setInputChats("");

    // 2️⃣ Final commit
    socket.emit("message:send", {
      chatId: activeChatId,
      content: inputChats,
      attachments: [],
      tempId,
    });
  }

  /* ---------- LOADING ---------- */
  if ((isLoading && messages.length === 0) || isUserLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <ClipLoader color="#22c55e" size={40} />
      </div>
    );
  }

  if (
    activePage === "chats" &&
    activeTab !== "newchat" &&
    activeTab !== "newgroup" &&
    activeTab !== "searchcontact"
  )
    return (
      <div className="grid grid-rows-[10%_80%_10%] h-screen text-white overflow-hidden custom-scrollbar">
        {/* HEADER */}
        <div className="bg-[#111b21] border-b border-[#2a3942] flex items-center px-6">
          <div className="w-12 h-12 rounded-full bg-amber-700 flex items-center justify-center font-bold">
            {activeChat.name?.charAt(0)}
          </div>
          <div className="ml-4">
            <h2 className="font-semibold">{activeChat.name}</h2>
            <p className="text-xs text-gray-400">
              {activeChat.isOnline ? "online" : "offline"}
            </p>
          </div>
        </div>

        {/* MESSAGES */}
         <div
  onScroll={handleScroll}
  ref={scrollRef}
  style={{ height: "100%", overflowY: "auto" }}
  className="bg-[#0b141a] px-4 py-3 space-y-2"

>

  {/* TOP PAGINATION LOADER */}
{isPaginating && (
  <div className="flex justify-center py-2 text-gray-400 text-sm">
      <ClipLoader color="#22c55e" size={40} />
  </div>
)}


          {messages.length === 0 && !isFetching && (
            <p className="text-center text-gray-400">
              Start a conversation 👋
            </p>
          )}

          {messages.map((msg) => {
            const isMe = msg.sender_id === String(user.id);

            return (
              <div
                key={msg.id || msg.tempId}
                className={`flex ${isMe ? "justify-end " : "justify-start"}`}
              >{}
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg text-sm
                    ${isMe ? "bg-[#005c4b]" : "bg-[#202c33]"}`}
                >
                  {msg.content}
                  <span className="block text-[10px] text-gray-400 mt-1 text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* INPUT */}
        <div className="bg-[#111b21] border-t border-[#2a3942] flex items-center gap-3 px-4">
          <FiPlus size={22} className="text-gray-400" />
          <FiSmile size={22} className="text-gray-400" />

           <input
  value={inputChats}
  onChange={(e) => setInputChats(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();   // prevent newline
      handleSend();
    }
  }}
  placeholder="Type a message"
  className="flex-1 bg-[#202c33] px-4 py-2 rounded-full outline-none"
/>


          <button onClick={handleSend}>
            {inputChats.trim() ? (
              <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center">
                <IoSend className="text-black" />
              </div>
            ) : (
              <FiMic size={22} className="text-gray-400" />
            )}
          </button>
        </div>
      </div>
    );
}
