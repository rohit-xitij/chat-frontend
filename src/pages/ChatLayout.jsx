import React, { useState } from "react";
import { Search, Send } from "lucide-react";
import Navbar from "../components/Navbar";
import User from "../components/User";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getOrCreateChat } from "../store/chatSlice";

const Chat = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // order tracked chat list by online status of target user
  const tracked = useSelector((state) =>
    [...state.users.chatList].sort((a, b) => {
      const aOnline = a.targetUserId?.online ? 1 : 0;
      const bOnline = b.targetUserId?.online ? 1 : 0;
      return bOnline - aOnline;
    }),
  );
  const dispatch = useDispatch();

  return (
    <div className="max-h-screen">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <aside className="h-[calc(100vh-75px)] flex flex-col w-90 border-r-gray-500 border-r">
          <div className="p-3 flex items-center pl-3 gap-2 bg-white border-b border-b-gray-500 h-12 max-w-md w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 30 30"
              fill="#6B7280"
            >
              <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8" />
            </svg>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="search"
              placeholder="Search User"
              className="w-full h-full outline-none text-gray-500 placeholder-gray-500 text-sm"
            />
          </div>

          <div className="flex flex-col overflow-y-auto no-scrollbar">
            {tracked
              .filter((u) =>
                u.targetUserId.name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()),
              )
              .map((item) => (
                <User
                  key={item.targetUserId._id}
                  user={item.targetUserId}
                  onClick={() =>
                    dispatch(getOrCreateChat(item.targetUserId._id))
                  }
                />
              ))}
          </div>
        </aside>

        <main className="flex flex-1 flex-col h-[calc(100vh-75px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Chat;
