import { Router } from "express";
import * as consultationController from "../controllers/doctor.controller.js";
import { authStaffMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * 🔹 DOCTOR ROUTES
 */

// danh sách chờ khám
router.get(
  "/waiting",
  authStaffMiddleware,
  consultationController.getWaitingConsultations,
);

// danh sách đang khám của bác sĩ
router.get(
  "/me",
  authStaffMiddleware,
  consultationController.getMyConsultations,
);

router.get(
  "/profile/:profileId/next-session",
  authStaffMiddleware,
  consultationController.getNextSessionInfo,
);

router.get(
  "/booking/:bookingId/re-examination",
  authStaffMiddleware,
  consultationController.getReExaminationInfo,
);

router.get(
  "/booking/:bookingId/next-session",
  authStaffMiddleware,
  consultationController.getNextSessionInfoByBooking,
);

// chi tiết
router.get(
  "/:id",
  authStaffMiddleware,
  consultationController.getConsultationDetail,
);

// nhận khách
router.patch(
  "/:id/start",
  authStaffMiddleware,
  consultationController.startConsultation,
);

// update chẩn đoán
router.patch(
  "/:id",
  authStaffMiddleware,
  consultationController.updateConsultation,
);

// kết thúc khám
router.patch(
  "/:id/complete",
  authStaffMiddleware,
  consultationController.finishConsultation,
);

/**
 * 🔹 PROFILE
 */
router.post(
  "/profile",
  authStaffMiddleware,
  consultationController.createProfile,
);

router.patch(
  "/profile/:id",
  authStaffMiddleware,
  consultationController.updateProfile,
);

router.delete(
  "/profile/:id",
  authStaffMiddleware,
  consultationController.deleteProfile,
);

/**
 * 🔹 SESSION
 */
router.post(
  "/session",
  authStaffMiddleware,
  consultationController.createSession,
);

router.patch(
  "/session/:id",
  authStaffMiddleware,
  consultationController.updateSession,
);

router.delete(
  "/session/:id",
  authStaffMiddleware,
  consultationController.deleteSession,
);

export default router;
