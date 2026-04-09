import { Request, Response } from "express";
import { ChatService } from "../services/chat.service.js";

export class ChatController {
  static async chat(req: Request, res: Response) {
    try {
      const { message, conversationId } = req.body;

      // 🔐 Validate input
      if (!message || typeof message !== "string") {
        return res.status(400).json({
          error: "Message is required and must be a string",
        });
      }

      // ⚠️ Giới hạn độ dài message (tránh spam + giảm cost AI)
      if (message.length > 1000) {
        return res.status(400).json({
          error: "Message too long (max 1000 characters)",
        });
      }

      // 🔐 Lấy user từ middleware auth (nếu có)
      const userId = (req as any).user?.id || null;

      const result = await ChatService.handleMessage({
        message,
        userId,
        conversationId,
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("❌ Chat error:", error);

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
}
