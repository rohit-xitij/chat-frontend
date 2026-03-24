import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";

export const fetchUsers = createAsyncThunk("users/fetchAll", async () => {
  const { data } = await api.get("/users");
  return data.users;
});

export const clickUser = createAsyncThunk(
  "users/click",
  async (targetId, { dispatch }) => {
    await api.post("/users/click", { targetId });
    dispatch(fetchChatList());
    return targetId;
  },
);

export const fetchChatList = createAsyncThunk(
  "users/fetchChatList",
  async () => {
    const { data } = await api.get("/users/chat-list");
    return data.list;
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    usersData: [],
    chatList: [],
    selectedUser: null,
    status: "idle",
    chatListStatus: "idle",
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload.user;
    },
    setUserOnline: (state, action) => {
      const id = action.payload.userId;
      state.usersData = state.usersData.map((u) =>
        u._id === id ? { ...u, online: true } : u,
      );
      state.chatList = state.chatList.map((item) => {
        if (item.targetUserId && item.targetUserId._id === id) {
          return {
            ...item,
            targetUserId: { ...item.targetUserId, online: true },
          };
        }
        return item;
      });
    },
    setUserOffline: (state, action) => {
      const id = action.payload.userId;
      state.usersData = state.usersData.map((u) =>
        u._id === id ? { ...u, online: false } : u,
      );
      state.chatList = state.chatList.map((item) => {
        if (item.targetUserId && item.targetUserId._id === id) {
          return {
            ...item,
            targetUserId: { ...item.targetUserId, online: false },
          };
        }
        return item;
      });
    },
    setOnlineUsers: (state, action) => {
      const onlineIds = action.payload; // array of userIds
      state.usersData = state.usersData.map((u) => ({
        ...u,
        online: onlineIds.includes(u._id),
      }));
      state.chatList = state.chatList.map((item) => {
        if (item.targetUserId) {
          return {
            ...item,
            targetUserId: {
              ...item.targetUserId,
              online: onlineIds.includes(item.targetUserId._id),
            },
          };
        }
        return item;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        // convert isOnline -> online
        state.usersData = action.payload.map((u) => ({
          ...u,
          online: !!u.isOnline,
        }));
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchChatList.pending, (state) => {
        state.chatListStatus = "loading";
      })
      .addCase(fetchChatList.fulfilled, (state, action) => {
        state.chatListStatus = "succeeded";
        // make sure embedded users have online property
        state.chatList = action.payload.map((item) => {
          if (item.targetUserId) {
            return {
              ...item,
              targetUserId: {
                ...item.targetUserId,
                online: !!item.targetUserId.isOnline,
              },
            };
          }
          return item;
        });
      })
      .addCase(fetchChatList.rejected, (state) => {
        state.chatListStatus = "failed";
      });
  },
});

export const {
  setSelectedUser,
  setUserOnline,
  setUserOffline,
  setOnlineUsers,
} = usersSlice.actions;

export default usersSlice.reducer;
