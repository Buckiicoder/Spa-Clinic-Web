import { Router } from "express";
import { ChatController } from "../controllers/chat.controller.js";
import { optionalAuthCustomer } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

const router = Router();

// 🔐 Rate limit cho chat (tránh spam + tốn tiền AI)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 20, // tối đa 20 request/phút
  message: {
    error: "Bạn gửi quá nhiều yêu cầu, vui lòng thử lại sau",
  },
});

// 🔥 POST /api/chat
router.post("/", chatLimiter, optionalAuthCustomer, ChatController.chat);

export default router;
