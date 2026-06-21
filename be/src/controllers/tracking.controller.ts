import { Request, Response } from "express";

import * as trackingService from "../services/tracking.service.js";

import { completeSessionSchema } from "../validators/technician.schema.js";

import { getIO } from "../socket.js";

export const startSessionTracking = async (req: Request, res: Response) => {
  try {
    const sessionId = Number(req.params.id);

    const { before_image_url } = req.body;

    const technicianId = req.user.id;

    const session = await trackingService.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (session.status === "in_progress") {
      return res.status(400).json({
        message: "Session already started",
      });
    }

    const firstStep = await trackingService.getFirstTreatmentStep(sessionId);

    if (!firstStep) {
      throw new Error("Treatment step not found");
    }

    const existingTracking = await trackingService.getTrackingByStepNo(
      sessionId,
      firstStep.step_no,
    );

    if (existingTracking) {
      return res.json(existingTracking);
    }

    await trackingService.updateSessionToInProgress(
      sessionId,
      before_image_url,
    );

    const tracking = await trackingService.createTrackingStep(
      sessionId,
      technicianId,
      firstStep,
    );

    getIO().to("manager").emit("tracking:session_started", tracking);

    getIO().to("technician").emit("tracking:session_started", tracking);

    getIO().to("manager").emit("session:updated");

    getIO().to("technician").emit("session:updated");

    return res.json(tracking);
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const completeStepTracking = async (req: Request, res: Response) => {
  try {
    const sessionId = Number(req.params.id);

    const technicianId = req.user.id;

    const { current_step_no } = req.body;

    const session = await trackingService.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (session.status !== "in_progress") {
      return res.status(400).json({
        message: "Session is not in progress",
      });
    }

    await trackingService.completeCurrentTrackingStep(
      sessionId,
      current_step_no,
    );

    const nextStep = await trackingService.getNextTreatmentStep(
      sessionId,
      current_step_no + 1,
    );

    if (!nextStep) {
      return res.json({
        completed: true,
      });
    }

    await trackingService.updateSessionCurrentStep(
      sessionId,
      current_step_no + 1,
    );

    await trackingService.createTrackingStep(sessionId, technicianId, nextStep);

    getIO().to("manager").emit("tracking:step_completed", {
      sessionId,
      current_step_no,
    });

    getIO().to("technician").emit("tracking:step_completed", {
      sessionId,
      current_step_no,
    });

    getIO().to("manager").emit("session:updated");

    getIO().to("technician").emit("session:updated");

    return res.json({
      completed: false,
    });
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const completeSessionTracking = async (req: Request, res: Response) => {
  try {
    const sessionId = Number(req.params.id);

    const data = completeSessionSchema.parse(req.body);

    const stepSummary = await trackingService.getSessionStepSummary(sessionId);

    const isDone =
      Number(stepSummary.current_step_no) >= Number(stepSummary.total_steps);

    const finalStatus = isDone ? "done" : "partial_done";

    await trackingService.completeCurrentTrackingForSession(sessionId);

    const totalDuration =
      await trackingService.getSessionTotalDuration(sessionId);

    const session = await trackingService.completeSessionRecord(
      sessionId,
      {
        ...data,
        status: finalStatus,
      },
      totalDuration,
    );

    if (finalStatus === "done" || finalStatus === "partial_done") {
      await trackingService.increaseUsedSession(sessionId);
    }

    getIO().to("manager").emit("tracking:session_completed", session);

    getIO().to("technician").emit("tracking:session_completed", session);

    getIO().to("manager").emit("session:updated");

    getIO().to("technician").emit("session:updated");

    return res.json(session);
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};

/**
 * ============================================
 * 🔹 3. PAUSE SESSION
 * ============================================
 */
export const pauseSessionTracking = async (req: Request, res: Response) => {
  try {
    const sessionId = Number(req.params.id);

    /**
     * 🔥 get session
     */
    const session = await trackingService.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    /**
     * 🔥 chỉ pause khi đang chạy
     */
    if (session.status !== "in_progress") {
      return res.status(400).json({
        message: "Session is not in progress",
      });
    }

    /**
     * 🔥 chỉ pause 1 lần
     */
    if (session.pause_count >= 1) {
      return res.status(400).json({
        message: "Session already paused",
      });
    }

    /**
     * 🔥 update session
     */
    await trackingService.updateSessionToPaused(sessionId);

    /**
     * 🔥 update tracking
     */
    await trackingService.pauseCurrentTrackingStep(sessionId);

    getIO().to("manager").emit("tracking:paused", {
      sessionId,
    });

    getIO().to("manager").emit("session:updated");

    getIO().to("technician").emit("session:updated");

    return res.json({
      success: true,
    });
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const checkPauseTimeout = async (req: Request, res: Response) => {
  try {
    const sessionId = Number(req.params.id);

    const session = await trackingService.isPauseExpired(sessionId);

    return res.json({
      expired: session.expired,
      pause_expired_at: session.pause_expired_at,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const stopAfterPauseTimeout = async (req: Request, res: Response) => {
  try {
    const sessionId = Number(req.params.id);

    await trackingService.completeCurrentTrackingForSession(sessionId);

    const totalDuration =
      await trackingService.getSessionTotalDuration(sessionId);

    const session = await trackingService.closeSessionAfterPauseTimeout(
      sessionId,
      totalDuration,
    );

    getIO().to("manager").emit("tracking:session_completed", session);

    getIO().to("technician").emit("tracking:session_completed", session);

    getIO().to("manager").emit(
  "session:updated",
);

getIO().to("technician").emit(
  "session:updated",
);

    return res.json(session);
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const resumeSessionTracking = async (req: Request, res: Response) => {
  try {
    const sessionId = Number(req.params.id);

    const session = await trackingService.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (session.status !== "paused") {
      return res.status(400).json({
        message: "Session is not paused",
      });
    }

    const pauseInfo = await trackingService.isPauseExpired(sessionId);

    if (pauseInfo.expired) {
      return res.status(400).json({
        message: "Pause timeout exceeded",
      });
    }

    await trackingService.resumeTrackingSession(sessionId);

    getIO().to("manager").emit("tracking:resumed", {
      sessionId,
    });

    getIO().to("manager").emit("session:updated");

    getIO().to("technician").emit("session:updated");

    return res.json({
      success: true,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const transferSessionTracking = async (req: Request, res: Response) => {
  try {
    const sessionId = Number(req.params.id);

    const session = await trackingService.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (session.status !== "in_progress") {
      return res.status(400).json({
        message: "Only in progress session can transfer",
      });
    }

    await trackingService.transferTrackingSession(sessionId);

    getIO().to("manager").emit("tracking:transferred", {
      sessionId,
    });

    getIO().to("manager").emit("session:updated");

    getIO().to("technician").emit("session:updated");

    return res.json({
      success: true,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

/**
 * ============================================
 * 🔹 7. REALTIME TRACKING DETAIL
 * ============================================
 */
export const getRealtimeTrackingDetail = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await trackingService.getRealtimeTrackingDetail(
      Number(req.params.id),
    );

    return res.json(data);
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};

export const uploadTrackingImage =
  async (
    req: Request,
    res: Response,
  ) => {
    if (!req.file) {
      return res.status(400).json({
        message:
          "Không tìm thấy ảnh",
      });
    }

    return res.json({
       image_url: `/uploads/${req.file.filename}`,
    });
  };