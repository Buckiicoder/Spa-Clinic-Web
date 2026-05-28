import { api } from "../../services/api";

export const sendChatMessageAPI = (data: {
  message: string;
  conversationId?: string;
}) => api.post("/chat", data);