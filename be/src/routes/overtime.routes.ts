import { Router } from "express";

import {
  getOvertimeRequests,
  getOvertimeRequestDetail,
  getMyOvertimeRequests,
  createOvertimeRequest,
  approveOvertimeRequest,
  rejectOvertimeRequest,
  cancelOvertimeRequest,
  deleteOvertimeRequest,
  syncApprovedOtToTimekeeping,
  getTimekeepingDailyViewController,
} from "../controllers/overtime.controller.js";

const router = Router();

router.get("/", getOvertimeRequests);

router.get("/my/:userId", getMyOvertimeRequests);

router.get("/timekeeping-daily-view", getTimekeepingDailyViewController);

router.get("/:id", getOvertimeRequestDetail);

router.post("/", createOvertimeRequest);

router.patch("/:id/approve", approveOvertimeRequest);

router.patch("/:id/reject", rejectOvertimeRequest);

router.patch("/:id/cancel", cancelOvertimeRequest);

router.patch("/sync-ot", syncApprovedOtToTimekeeping);

router.delete("/:id", deleteOvertimeRequest);

export default router;
