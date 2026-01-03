 import { createSlice } from "@reduxjs/toolkit";

/*
STATE STRUCTURE (MENTAL MODEL)

 chat = {
  chats: [ ... ],              // chat list (sidebar)
  activeChatId: 12,            // open chat
  messagesByChat: {
    12: {
      messages: [...],
      loading: false,
      hasMore: true
    },
    15: { ... }
  }
}


      chats = [
        {
          id: chatId,
          name: user.name,
          avatar: user.avatar,
          lastMessage: "",
          time: "",
          unreadCount: 0,
          type: "single",
        },
        ...
      ]



Why this shape?

✅ Fast lookup by chatId
✅ Supports infinite scroll
✅ Multiple chats loaded at once
✅ No data overwrite





🧩 PART 1 — Chat List (Sidebar)
1. setChats
  📌 Used when:
      App loads
      Fetch chat list API

2.addChatOptimistic
 📌 Used when:
    Friend request accepted
    New chat created
    Before server confirms (fast UI)
Why?
👉 Optimistic UI (instant feedback)


3.updateLastMessage
📌 Used when:
    New message arrives via socket
    Updates sidebar preview



4.incrementUnread / resetUnread
    incrementUnread(chatId)
    resetUnread(chatId)

📌 Used when:
    Message arrives in background → increment
    Chat opened → reset to 0




🧩 PART 2 — Active Chat (Main Panel)
1. openChat
📌 Used when:
    User clicks a chat
    Friend request accepted via socket


2.closeChat
📌 Used when:
    User navigates away
    Logs out






🧩 PART 3 — Messages (Per Chat)
1. initChatMessages
    initChatMessages(chatId)
📌 Ensures structure exists before loading messages

2.setMessagesLoading
  setMessagesLoading({ chatId, loading })
📌 Used when:
    Fetching older messages
    Infinite scroll


3.setMessages
setMessages({ chatId, messages, hasMore })

📌 Used when:
    Messages API returns data
    Pagination result


4.addMessageOptimistic

addMessageOptimistic({ chatId, message })


📌 Used when:
  User sends a message
  Socket message arrives
 Why?
  👉 Instant UI update
*/

const initialState = {
  chats: [],                 // left sidebar chat list
  activeChatId: null,        // currently open chat
  messagesByChat: {},        // messages grouped by chatId
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    /* =======================
       CHAT LIST
    ======================= */

    setChats(state, action) {
      state.chats = action.payload;
    },

    markChatAsRead(state, action) {
  const chatId = action.payload;
  const chat = state.chats.find(c => c.id === chatId);
  if (chat) {
    chat.unreadCount = 0;
  }
}
,

    addChatOptimistic(state, action) {
      const exists = state.chats.find(
        (c) => c.id === action.payload.id
      );
      if (!exists) {
        state.chats.unshift(action.payload);
      }
    },



    updateLastMessage(state, action) {
      const { chatId, message, time } = action.payload;
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.lastMessage = message;
        chat.time = time;
      }
    },
incrementUnread(state, action) {
  const { chatId, activeChatId } = action.payload;

  // ❌ Don't increment if chat is currently open
  if (chatId === activeChatId) return;

  const chat = state.chats.find((c) => c.id === chatId);
  if (!chat) return;

  // ✅ Safe increment
  
  chat.unreadCount = ( Number(chat.unreadCount) || 0) + 1;
 
}
,

    resetUnread(state, action) {
      const chat = state.chats.find((c) => c.id === action.payload);
      if (chat) {
        chat.unreadCount = 0;
      }
    },

    /* =======================
       ACTIVE CHAT
    ======================= */

    openChat(state, action) {
      state.activeChatId = action.payload;
    },

    closeChat(state) {
      state.activeChatId = null;
    },

    /* =======================
       MESSAGES
    ======================= */
 

     setMessages(state, action) {
  const { chatId, messages } = action.payload;

  state.messagesByChat[chatId] = {
    messages: messages.map(m => ({
      ...m,
      isOptimistic: false,
      status: "sent",
    })),
  };
},

appendMessages(state, action) {
  const { chatId, messages } = action.payload;

  if (!state.messagesByChat[chatId]) {
    state.messagesByChat[chatId] = { messages: [] };
  }

  const existingIds = new Set(
    state.messagesByChat[chatId].messages.map(m => m.id)
  );

  const unique = messages.filter(m => !existingIds.has(m.id));

  state.messagesByChat[chatId].messages = [
    ...unique,
    ...state.messagesByChat[chatId].messages,
  ];
}
,


// “This message is temporary and NOT confirmed by server.”
// use when user send the message , do not use when 
    addMessageOptimistic(state, action) {
  const { chatId, message } = action.payload;

  if (!state.messagesByChat[chatId]) {
    state.messagesByChat[chatId] = { messages: [] };
  }

  state.messagesByChat[chatId].messages.push({
    ...message,
    isOptimistic: true,
    status: "sending",
  });
},


// Use upsertMessageFromServer ONLY when a message comes from the server
//That means: inside a socket listener, never on button click.

upsertMessageFromServer(state, action) {
  const { chatId, message } = action.payload;

  if (!state.messagesByChat[chatId]) {
    state.messagesByChat[chatId] = { messages: [] };
  }

  const messages = state.messagesByChat[chatId].messages;

  // 1️⃣ Replace optimistic
  if (message.tempId) {
    const idx = messages.findIndex(m => m.tempId === message.tempId);
    if (idx !== -1) {
      messages[idx] = {
        ...message,
        isOptimistic: false,
        status: "sent",
      };
      return;
    }
  }

  // 2️⃣ Prevent duplicate server messages
  if (messages.some(m => m.id === message.id)) {
    return; // 🚫 already exists
  }

  messages.push({
    ...message,
    isOptimistic: false,
    status: "sent",
  });
}
,





    /* =======================
       RESET
    ======================= */

    resetChatState() {
      return initialState;
    },
  },
});

export const {
  setChats,
  addChatOptimistic,
  updateLastMessage,
  markChatAsRead,
  incrementUnread,
  resetUnread,
  openChat,
  closeChat,
  appendMessages,
  upsertMessageFromServer,
  setMessages,
  addMessageOptimistic,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
