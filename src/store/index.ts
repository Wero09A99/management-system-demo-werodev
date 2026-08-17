"use client";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { authReducer, type AuthState } from "./authReducer";

/**
 * storage que funciona también en SSR (evita acceso a window durante el render).
 * En el servidor devuelve un storage no-op; el cliente hidrata al rehidratar.
 */
function createNoopStorage() {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
}

const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

const persistConfig = {
  key: "werodev-auth",
  storage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
});

export type RootState = {
  auth: AuthState;
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
