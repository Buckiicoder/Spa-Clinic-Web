import { Request, Response } from "express";
import { ChatService } from "../services/chat/chat.service.js";
import { ChatRateLimitService } from "../services/chat/chat-rate-limit.service.js";

export class ChatController {
  static async chat(
    req: Request,
    res: Response
  ) {
    try {
      const {
        message,
        conversationId,
      } = req.body;

      // console.log("REQ USER:", (req as any).user);

      if (
        !message ||
        typeof message !== "string"
      ) {
        return res.status(400).json({
          error: "Message invalid",
        });
      }

      if (message.length > 500) {
        return res.status(400).json({
          error: "Message too long",
        });
      }

      const userId =
        (req as any).user?.id || null;

      // ======================
      // rate limit
      // ======================

      const limit = userId ? 30 : 15;

      const allowed =
        ChatRateLimitService.check(
          req.ip +
            "_" +
            (conversationId || "guest"),
          limit
        );

      if (!allowed) {
        return res.status(429).json({
          error:
            "Bạn đã vượt quá số lượt chat cho phép.",
        });
      }

      const result =
        await ChatService.handleMessage({
          message,
          userId,
          conversationId,
        });

      return res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
}