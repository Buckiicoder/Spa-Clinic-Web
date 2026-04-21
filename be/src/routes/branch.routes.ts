import { Router } from "express";
import * as branchController from "../controllers/branch.controller.js";
import { authStaffMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// 👉 Lấy danh sách cơ sở
router.get("/", authStaffMiddleware, branchController.getBranches);

// 👉 Lấy chi tiết cơ sở
router.get("/:id", authStaffMiddleware, branchController.getBranchById);

// 👉 Tạo cơ sở
router.post("/", authStaffMiddleware, branchController.createBranch);

// 👉 Cập nhật cơ sở
router.patch("/:id", authStaffMiddleware, branchController.updateBranch);

// 👉 Xóa cơ sở
router.delete("/:id", authStaffMiddleware, branchController.deleteBranch);

export default router;
