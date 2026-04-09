import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sendMessageAPI } from "./chatAPI";

interface ChatMessage {
  from: "user" | "bot";
  text: string;
}

interface ChatState {
  messages: ChatMessage[];
  conversationId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [
    { from: "bot", text: "Xin chào 👋 SpaClinic có thể hỗ trợ gì cho bạn?" },
  ],
  conversationId: null,
  loading: false,
  error: null,
};

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { message }: { message: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state: any = getState();
      const conversationId = state.chat.conversationId;

      const res = await sendMessageAPI({
        message,
        conversationId,
      });

      return res.data.data; // { reply, conversationId }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Chat failed"
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({
        from: "user",
        text: action.payload,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sendMessage.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.loading = false;

      state.messages.push({
        from: "bot",
        text: action.payload.reply,
      });

      state.conversationId = action.payload.conversationId;
    });

    builder.addCase(sendMessage.rejected, (state, action) => {
      state.loading = false;
      state.messages.push({
        from: "bot",
        text: "Lỗi kết nối server 😢",
      });
      state.error = action.payload as string;
    });
  },
});

export const { addUserMessage } = chatSlice.actions;

export default chatSlice.reducer;
export const selectChat = (state: any) => state.chat;
