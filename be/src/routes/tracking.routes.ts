import { Router } from "express";

import * as trackingController from "../controllers/tracking.controller.js";

import { authStaffMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * ============================================
 * 🔹 START SESSION TRACKING
 * ============================================
 */
router.patch(
  "/session/:id/start",
  authStaffMiddleware,
  trackingController.startSessionTracking,
);

/**
 * ============================================
 * 🔹 COMPLETE STEP
 * ============================================
 */
router.patch(
  "/session/:id/step/complete",
  authStaffMiddleware,
  trackingController.completeStepTracking,
);

/**
 * ============================================
 * 🔹 PAUSE SESSION
 * ============================================
 */
router.patch(
  "/session/:id/pause",
  authStaffMiddleware,
  trackingController.pauseSessionTracking,
);

/**
 * ============================================
 * 🔹 RESUME SESSION
 * ============================================
 */
router.patch(
  "/session/:id/resume",
  authStaffMiddleware,
  trackingController.resumeSessionTracking,
);

/**
 * ============================================
 * 🔹 TRANSFER SESSION
 * ============================================
 */
router.patch(
  "/session/:id/transfer",
  authStaffMiddleware,
  trackingController.transferSessionTracking,
);

/**
 * ============================================
 * 🔹 COMPLETE SESSION
 * ============================================
 */
router.patch(
  "/session/:id/complete",
  authStaffMiddleware,
  trackingController.completeSessionTracking,
);

/**
 * ============================================
 * 🔹 REALTIME DETAIL
 * ============================================
 */
router.get(
  "/session/:id/realtime",
  authStaffMiddleware,
  trackingController.getRealtimeTrackingDetail,
);

export default router;