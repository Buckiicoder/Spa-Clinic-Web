import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import { sendChatMessageAPI } from "./chatAPI";

// import { ChatMessage, ChatState } from "./chatTypes";

export interface ChatMessage {
  from: "user" | "assistant";
  text: string;
}

export interface ChatState {
  messages: ChatMessage[];

  conversationId: string | null;

  loading: boolean;

  error: string | null;
}

const initialState: ChatState = {
  messages: [
    {
      from: "assistant",
      text: "Xin chào 👋 Spa có thể hỗ trợ tư vấn và đặt lịch cho bạn.",
    },
  ],

  conversationId: null,

  loading: false,

  error: null,
};

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",

  async (
    data: {
      message: string;
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const state: any = getState();

      const conversationId = state.chat.conversationId;

      const res = await sendChatMessageAPI({
        message: data.message,
        conversationId,
      });

      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Chat thất bại");
    }
  },
);

const chatSlice = createSlice({
  name: "chat",

  initialState,

  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        from: "user",
        text: action.payload,
      });
    },

    clearChat: (state) => {
      state.messages = [];

      state.conversationId = null;

      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(sendMessage.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(sendMessage.fulfilled, (state, action: any) => {
      state.loading = false;

      if (action.payload?.conversationId) {
        state.conversationId = action.payload.conversationId;
      }

      state.messages.push({
        from: "assistant",
        text: action.payload.reply,
      });
    });

    builder.addCase(sendMessage.rejected, (state, action: any) => {
      state.loading = false;

      state.error = action.payload?.error || "Chat thất bại";

      state.messages.push({
        from: "assistant",
        text: "Hiện tại hệ thống đang bận, vui lòng thử lại sau.",
      });
    });
  },
});

export const { addUserMessage, clearChat } = chatSlice.actions;

export default chatSlice.reducer;

export const selectChat = (state: any) => state.chat;
