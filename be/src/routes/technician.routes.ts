import { Router } from "express";
import * as technicianController from "../controllers/technician.controller.js";
import { authStaffMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * 🔹 MANAGER
 */

// khách đã khám xong trong ngày
router.get(
  "/consulted-today",
  authStaffMiddleware,
  technicianController.getConsultedToday,
);

// danh sách KTV đang làm
router.get(
  "/technicians",
  authStaffMiddleware,
  technicianController.getWorkingTechnicians,
);

// gán KTV
router.post(
  "/assign",
  authStaffMiddleware,
  technicianController.assignTechnician,
);

/**
 * 🔹 TECHNICIAN
 */

// ca của tôi
router.get(
  "/me",
  authStaffMiddleware,
  technicianController.getMySessions,
);

// chi tiết session
router.get(
  "/session/:id",
  authStaffMiddleware,
  technicianController.getSessionDetail,
);

// bắt đầu làm
router.patch(
  "/session/:id/start",
  authStaffMiddleware,
  technicianController.startSession,
);

// hoàn thành
router.patch(
  "/session/:id/complete",
  authStaffMiddleware,
  technicianController.completeSession,
);

export default router;