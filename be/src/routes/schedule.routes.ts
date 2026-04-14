import express from "express";
import * as scheduleController from "../controllers/schedule.controller.js";
import { authStaffMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔹 GET
router.get("/full", authStaffMiddleware, scheduleController.getFullSchedule);
router.get("/", authStaffMiddleware, scheduleController.getScheduleByMonth);
router.get("/:id", authStaffMiddleware, scheduleController.getScheduleById);

// 🔹 CREATE
router.post("/", authStaffMiddleware, scheduleController.createSchedulePeriod);

// 🔹 UPDATE
router.patch("/:id", authStaffMiddleware, scheduleController.updateSchedulePeriod);

// 🔹 DAYS
router.post("/days", authStaffMiddleware, scheduleController.setScheduleDays);
// router.delete("/days", authStaffMiddleware, scheduleController.deleteScheduleDay);

// 🔹 DELETE
router.delete("/:id", authStaffMiddleware, scheduleController.deleteSchedulePeriod);

export default router;
