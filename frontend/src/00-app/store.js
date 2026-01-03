// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

import userReducer from "../03-features/user/hook/01-useSlice";
import activeReducer from "./activeTabSlice";
import chatReducer from "./01-chatSlice";
import notificationReducer from "./02-notificationSlice"
const rootReducer = combineReducers({
  user: userReducer,   // ✅ only user slice
  active: activeReducer,
  chat:chatReducer,
  notification:notificationReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // ✅ only persist user
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});


export const persistor = persistStore(store);
