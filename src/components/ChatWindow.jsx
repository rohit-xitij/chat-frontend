import React, { useState, useEffect, useRef } from "react";
import Message from "./Message";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { getOrCreateChat, fetchMessages, addMessage } from "../store/chatSlice";
import { setSelectedUser } from "../store/usersSlice";
import { useSocket } from "../hooks/useSocket";

const ChatWindow = () => {
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const selectedUser = useSelector((state) => state.users.selectedUser);
  const chats = useSelector((state) => state.chat.chats);
  const messages = useSelector((state) => state.chat.messages);
  const { currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { id } = useParams();
  const {
    connected,
    joinChat,
    leaveChat,
    sendMessage,
    emitTyping,
    onUserTyping,
  } = useSocket();

  const [chatId, setChatId] = useState(null);
  const [roomJoined, setRoomJoined] = useState(false);
  const typingTimeoutRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => {
    if (!connected || !id) return;

    let cancelled = false;
    setRoomJoined(false);

    dispatch(getOrCreateChat(id)).then((action) => {
      if (cancelled) return;
      if (action.payload) {
        const newChatId = action.payload._id;
        setChatId(newChatId);
        activeChatRef.current = newChatId;
        dispatch(fetchMessages(newChatId));
        joinChat(newChatId);
        setRoomJoined(true);
      }
    });

    return () => {
      cancelled = true;
      if (activeChatRef.current) {
        leaveChat(activeChatRef.current);
        activeChatRef.current = null;
      }
      setRoomJoined(false);
    };
  }, [id, connected, dispatch, joinChat, leaveChat]);

  useEffect(() => {
    if (chatId && chats.length && !selectedUser) {
      const chat = chats.find((c) => c._id === chatId);
      if (chat) {
        const other = chat.participants.find((p) => p._id !== currentUser?._id);
        if (other) {
          dispatch(setSelectedUser({ user: other }));
        }
      }
    }
  }, [chatId, chats, selectedUser, currentUser, dispatch]);

  useEffect(() => {
    if (!connected) return;
    const unsubscribe = onUserTyping((data) => {
      if (data.userId !== currentUser?._id) {
        setOtherUserTyping(data.isTyping);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [connected, onUserTyping, currentUser?._id]);

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      if (chatId && connected) {
        emitTyping(chatId, true);
      }
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (chatId && connected) {
        emitTyping(chatId, false);
      }
    }, 2000);
  };

  return (
    <>
      <div className="border-b border-b-white/10">
        <div className="flex gap-5 items-center bg-gray-50/50 py-3 px-5 cursor-pointer border-b border-b-gray-500">
          {!connected && (
            <span className="text-xs text-red-500 ml-4">
              socket disconnected
            </span>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-700 text-2xl font-semibold text-white">
            {(selectedUser?.name?.charAt(0) || "?").toUpperCase()}
          </div>

          <h2 className="line-clamp-1 text-lg">
            {selectedUser?.name || "User"}
          </h2>
        </div>
      </div>

      <div className="h-full flex flex-col gap-2 flex-1 overflow-y-auto p-3">
        {(chatId && messages[chatId] ? messages[chatId] : []).map((msg) => (
          <Message key={msg._id} message={msg} />
        ))}
      </div>

      <div className="flex items-center h-12 w-full text-lg text-gray-500 bg-white  border-t-gray-800 border-t">
        <button type="button" className="h-full px-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
          </svg>
        </button>

        <input
          value={messageText}
          onChange={handleInputChange}
          className="outline-none bg-transparent h-full w-full"
          type="text"
          placeholder="Message..."
          disabled={!id}
        />
        {otherUserTyping && (
          <div className="text-xs text-gray-400 px-2">typing...</div>
        )}
        <button
          type="button"
          className="h-full w-12"
          disabled={!roomJoined}
          onClick={() => {
            if (chatId && messageText.trim()) {
              const clientId = `temp-${Date.now()}`;
              const outgoing = {
                _id: clientId,
                clientId,
                chatId,
                senderId: {
                  _id: currentUser._id,
                  name: currentUser.name,
                  email: currentUser.email,
                },
                receiverId: selectedUser?._id,
                content: messageText,
                createdAt: new Date().toISOString(),
              };
              dispatch(addMessage(outgoing));
              sendMessage(chatId, selectedUser?._id, messageText, clientId);
              setMessageText("");
              setIsTyping(false);
              emitTyping(chatId, false);
            }
          }}
        >
          <svg
            width="27"
            height="27"
            viewBox="0 0 27 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.375 22.5v-18l21.375 9zm2.25-3.375L18.956 13.5 5.625 7.875v3.938l6.75 1.687-6.75 1.688zm0 0V7.875z"
              fill="currentColor"
              fillOpacity=".7"
            />
          </svg>
        </button>
      </div>
    </>
  );
};

export default ChatWindow;
