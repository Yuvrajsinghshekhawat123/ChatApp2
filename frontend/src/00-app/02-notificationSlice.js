/*
Socket events must be listened to in ONE stable place.
Not inside many components, not conditionally.

Your NotificationPanel is a UI renderer, not a socket manager.


❓ So where do we listen to the socket event?
Short answer:
👉 NOT directly inside NotificationPanel
👉 Listen in a higher-level component and FEED data to this panel



✅ ✅ RECOMMENDED (BEST PRACTICE)
🔥 Listen in a Global Logged-In Layout

(example: ProtectedLayout, DashboardLayout, or Navbar wrapper)

Why?

NotificationPanel may mount/unmount
User may open/close notification panel
Socket listener must stay alive even when panel is closed
Prevent duplicate listeners
*/

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  unread: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications(state, action) {
      state.list = action.payload.notifications;
      state.unread = action.payload.unread;
    },

    addNotification(state, action) {
      state.list.unshift(action.payload);
      state.unread += 1;
    },

    markAsRead(state, action) {
  const index = state.list.findIndex(n => n.id === action.payload);
  if (index === -1) return;

  // if it was unread, update unread count
  if (!state.list[index].is_read && state.unread > 0) {
    state.unread -= 1;
  }

  // ✅ REMOVE notification immediately
  state.list.splice(index, 1);
},

    resetNotifications() {
      return initialState;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  resetNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
