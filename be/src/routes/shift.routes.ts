import { Router } from "express";
import * as shiftController from "../controllers/shift.controller.js";
import { authStaffMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// 🔹 Public (hoặc staff tuỳ bạn)
router.get("/", shiftController.getShifts);
router.get("/:id", shiftController.getShiftById);

// 🔹 Staff/Admin
router.post("/", authStaffMiddleware, shiftController.createShift);
router.patch("/:id", authStaffMiddleware, shiftController.updateShift);
router.delete("/:id", authStaffMiddleware, shiftController.deleteShift);

export default router;
