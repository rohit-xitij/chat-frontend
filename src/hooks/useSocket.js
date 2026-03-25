import { useEffect, useRef, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";

let socket = null;

export const useSocket = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const onlineUsersSubs = useRef([]);
  const userOnlineSubs = useRef([]);
  const userOfflineSubs = useRef([]);

  useEffect(() => {
    if (!currentUser?._id) return;

    const userId = currentUser._id;

    if (!socket || socket.auth?.userId !== userId) {
      if (socket) {
        socket.disconnect();
      }

      // socket = io("http://localhost:3000", {
      //   auth: {
      //     userId,
      //   },
      // });

      socket = io("https://chat-backend-6r6t.onrender.com", {
        auth: {
          userId,
        },
      });

      console.log("[SOCKET] Attempting to connect...");
    }

    socketRef.current = socket;
    setConnected(socket.connected);

    const handleOnlineUsers = (list) => {
      onlineUsersSubs.current.forEach((cb) => cb(list));
    };

    const handleUserOnline = (data) => {
      userOnlineSubs.current.forEach((cb) => cb(data));
    };

    const handleUserOffline = (data) => {
      userOfflineSubs.current.forEach((cb) => cb(data));
    };

    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    const handleConnect = () => {
      setConnected(true);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [currentUser?._id]);

  const joinChat = useCallback((chatId) => {
    if (socket) {
      socket.emit("joinChat", chatId);
    }
  }, []);

  const leaveChat = useCallback((chatId) => {
    if (socket) {
      socket.emit("leaveChat", chatId);
    }
  }, []);

  const sendMessage = useCallback((chatId, receiverId, content, clientId) => {
    if (socket && content.trim()) {
      socket.emit("sendMessage", {
        chatId,
        receiverId,
        content,
        clientId,
      });
    }
  }, []);

  const emitTyping = useCallback((chatId, isTyping) => {
    if (socket) {
      socket.emit("userTyping", { chatId, isTyping });
    }
  }, []);

  const onMessageReceived = useCallback((callback) => {
    if (socket) {
      socket.on("messageReceived", callback);
      return () => {
        socket.off("messageReceived", callback);
      };
    }
  }, []);

  const onUserTyping = useCallback((callback) => {
    if (socket) {
      socket.on("userTyping", callback);
      return () => {
        socket.off("userTyping", callback);
      };
    }
  }, []);

  const onUserOnline = useCallback((callback) => {
    userOnlineSubs.current.push(callback);
    return () => {
      userOnlineSubs.current = userOnlineSubs.current.filter(
        (c) => c !== callback,
      );
    };
  }, []);

  const onUserOffline = useCallback((callback) => {
    userOfflineSubs.current.push(callback);
    return () => {
      userOfflineSubs.current = userOfflineSubs.current.filter(
        (c) => c !== callback,
      );
    };
  }, []);

  const onOnlineUsers = useCallback((callback) => {
    onlineUsersSubs.current.push(callback);
    return () => {
      onlineUsersSubs.current = onlineUsersSubs.current.filter(
        (c) => c !== callback,
      );
    };
  }, []);

  return {
    connected,
    joinChat,
    leaveChat,
    sendMessage,
    emitTyping,
    onMessageReceived,
    onUserTyping,
    onUserOnline,
    onUserOffline,
    onOnlineUsers,
  };
};
