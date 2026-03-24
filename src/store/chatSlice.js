import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";

export const getOrCreateChat = createAsyncThunk(
  "chat/getOrCreate",
  async (userId) => {
    const { data } = await api.post("/chats", { userId });
    return data.chat;
  },
);

export const fetchChats = createAsyncThunk("chat/fetchAll", async () => {
  const { data } = await api.get("/chats");
  return data.chats;
});

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (chatId) => {
    const { data } = await api.get(`/chats/${chatId}/messages`);
    return { chatId, messages: data.messages };
  },
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ chatId, receiverId, content }) => {
    const { data } = await api.post(`/chats/${chatId}/messages`, {
      chatId,
      receiverId,
      content,
    });
    return data.message;
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [],
    messages: {},
    status: "idle",
    messagesStatus: {},
  },
  reducers: {
    addMessage(state, action) {
      const message = action.payload;
      const chatId = message.chatId;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      if (message.clientId) {
        const tempIndex = state.messages[chatId].findIndex(
          (m) => m.clientId === message.clientId,
        );
        if (tempIndex !== -1) {
          state.messages[chatId][tempIndex] = {
            ...state.messages[chatId][tempIndex],
            ...message,
          };
          return;
        }
      }

      if (!state.messages[chatId].find((m) => m._id === message._id)) {
        state.messages[chatId].push(message);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrCreateChat.fulfilled, (state, action) => {
        const chat = action.payload;
        if (!state.chats.find((c) => c._id === chat._id)) {
          state.chats.push(chat);
        }
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(fetchMessages.pending, (state, action) => {
        state.messagesStatus[action.meta.arg] = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        state.messages[chatId] = messages;
        state.messagesStatus[chatId] = "succeeded";
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        if (!state.messages[msg.chatId]) {
          state.messages[msg.chatId] = [];
        }
        state.messages[msg.chatId].push(msg);
      });
  },
});

export const { addMessage } = chatSlice.actions;

export default chatSlice.reducer;
