import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ChatLayout from "./pages/ChatLayout";
import ChatHome from "./components/ChatHome";
import ChatWindow from "./components/ChatWindow";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import api from "./api/api";
import { useDispatch, useSelector } from "react-redux";
import {
  setAuthenticated,
  setCheckAuthComplete,
  login,
} from "./store/authSlice";
import { fetchUsers, fetchChatList } from "./store/usersSlice";
import {
  setUserOnline,
  setUserOffline,
  setOnlineUsers,
} from "./store/usersSlice";
import { fetchChats, addMessage } from "./store/chatSlice";
import { useSocket } from "./hooks/useSocket";
import {
  registerServiceWorker,
  requestNotificationPermission,
  setupForegroundMessageHandler,
} from "./utils/firebaseMessaging";

const App = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const chats = useSelector((state) => state.chat.chats);

  const {
    onMessageReceived,
    connected,
    onUserOnline,
    onUserOffline,
    onOnlineUsers,
  } = useSocket();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get("/auth/verify");

        if (data.success) {
          dispatch(setAuthenticated());
          if (data.user) {
            dispatch(login(data.user));
          }
          dispatch(fetchUsers());
          dispatch(fetchChatList());
          dispatch(fetchChats());

          await registerServiceWorker();
          await requestNotificationPermission();
          setupForegroundMessageHandler((payload) => {
            console.log("[APP] Foreground notification:", payload);
          });
        } else {
          dispatch(setCheckAuthComplete());
        }
      } catch (error) {
        console.log("Auth verification failed:", error.message);
        dispatch(setCheckAuthComplete());
      }
    };

    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    if (!connected || !onMessageReceived) return;

    const unsubscribe = onMessageReceived((message) => {
      dispatch(addMessage(message));

      if (!chats.find((c) => c._id === message.chatId)) {
        dispatch(fetchChats());
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [connected, onMessageReceived, dispatch, chats]);

  useEffect(() => {
    if (!connected) return;

    let offOnline;
    let offUserOnline;
    let offUserOffline;

    if (onOnlineUsers) {
      offOnline = onOnlineUsers((list) => {
        dispatch(setOnlineUsers(list));
      });
    }

    if (onUserOnline) {
      offUserOnline = onUserOnline(({ userId }) => {
        dispatch(setUserOnline({ userId }));
      });
    }

    if (onUserOffline) {
      offUserOffline = onUserOffline(({ userId }) => {
        dispatch(setUserOffline({ userId }));
      });
    }

    return () => {
      if (offOnline) offOnline();
      if (offUserOnline) offUserOnline();
      if (offUserOffline) offUserOffline();
    };
  }, [connected, onOnlineUsers, onUserOnline, onUserOffline, dispatch]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <ProtectedRoute>
                <ChatHome />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute>
                <ChatWindow />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
};

export default App;
