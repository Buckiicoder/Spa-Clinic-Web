import { Router } from "express";
import * as positionController from "../controllers/position.controller.js";
import { authStaffMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// 👉 Lấy danh sách chức danh
router.get("/", authStaffMiddleware, positionController.getPositions);

// 👉 Lấy chi tiết chức danh
router.get("/:id", authStaffMiddleware, positionController.getPositionById);

// 👉 Tạo chức danh
router.post("/", authStaffMiddleware, positionController.createPosition);

// 👉 Cập nhật chức danh
router.patch("/:id", authStaffMiddleware, positionController.updatePosition);

// 👉 Xóa chức danh
router.delete("/:id", authStaffMiddleware, positionController.deletePosition);

export default router;
