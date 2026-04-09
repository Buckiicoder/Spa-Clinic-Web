import { api } from "../../services/api";

export const sendMessageAPI = (data: {
  message: string;
  conversationId?: string | null;
}) =>
  api.post("/chat", data);
