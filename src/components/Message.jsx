import React from "react";
import { useSelector } from "react-redux";

const Message = ({ message }) => {
  const { currentUser } = useSelector((state) => state.auth);

  if (!message) return null;

  const isOwn =
    message.senderId?._id === currentUser?._id ||
    message.senderId === currentUser?._id;

  return (
    <div className="px-10">
      <div className={`chat ${isOwn ? "chat-end" : "chat-start"}`}>
        <div
          className={`chat-bubble ${
            isOwn ? "bg-indigo-500 text-white" : "bg-gray-200"
          } shadow-xs whitespace-pre-wrap`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default Message;
