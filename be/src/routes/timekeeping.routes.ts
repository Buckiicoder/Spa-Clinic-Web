import express from "express";
import * as timekeepingController from "../controllers/timekeeping.controller.js";
import { authStaffMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔹 GET
// Lấy chấm công theo tháng của user
router.get(
  "/",
  authStaffMiddleware,
  timekeepingController.getTimekeepingByMonth,
);

// 🔹 CREATE (đăng ký ca làm)
router.post("/", authStaffMiddleware, timekeepingController.createTimekeeping);

// 🔹 UPDATE (chung - status, edit...)
router.patch(
  "/:id",
  authStaffMiddleware,
  timekeepingController.updateTimekeeping,
);

// 🔹 CHECK-IN / CHECK-OUT
router.patch(
  "/:id/check-in",
  authStaffMiddleware,
  timekeepingController.checkIn,
);

router.patch(
  "/:id/check-out",
  authStaffMiddleware,
  timekeepingController.checkOut,
);

// 🔹 BREAK
router.patch(
  "/:id/break-start",
  authStaffMiddleware,
  timekeepingController.startBreak,
);

router.patch(
  "/:id/break-end",
  authStaffMiddleware,
  timekeepingController.endBreak,
);

router.delete(
  "/:id",
  authStaffMiddleware,
  timekeepingController.deleteTimekeeping,
);

export default router;
