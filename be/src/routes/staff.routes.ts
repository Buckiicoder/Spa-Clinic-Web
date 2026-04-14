import { Router } from "express";
import * as staffController from "../controllers/staff.controller.js";
import { authStaffMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// 👉 Lấy danh sách nhân viên
router.get("/", authStaffMiddleware, staffController.getStaffs);

// 👉 Lấy chi tiết nhân viên
router.get("/:id", authStaffMiddleware, staffController.getStaffById);

// 👉 Tạo nhân viên
router.post("/", authStaffMiddleware, staffController.createStaff);

// 👉 Cập nhật nhân viên
router.patch("/:id", authStaffMiddleware, staffController.updateStaff);

// 👉 Xóa nhân viên
router.delete("/:id", authStaffMiddleware, staffController.deleteStaff);

export default router;
