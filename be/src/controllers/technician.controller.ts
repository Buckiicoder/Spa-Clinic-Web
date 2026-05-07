import { Request, Response } from "express";
import * as technicianService from "../services/technician.service.js";
import {
  assignTechnicianSchema,
  completeSessionSchema,
} from "../validators/technician.schema.js";
import { getIO } from "../socket.js";

/**
 * 🔹 1. Danh sách khách đã khám xong trong ngày
 */
export const getConsultedToday = async (req: Request, res: Response) => {
  const data = await technicianService.getConsultedToday();
  res.json(data);
};

/**
 * 🔹 2. Danh sách KTV đang làm
 */
export const getWorkingTechnicians = async (
  req: Request,
  res: Response,
) => {
  const data = await technicianService.getWorkingTechnicians();
  res.json(data);
};

/**
 * 🔹 3. Gán KTV cho session (manager)
 */
export const assignTechnician = async (req: Request, res: Response) => {
  try {
    const managerId = req.user.id;

    const { session_id, technician_id } =
      assignTechnicianSchema.parse(req.body);

    const session =
      await technicianService.assignTechnicianToSession(
        session_id,
        technician_id,
        managerId,
      );

    getIO().to("manager").emit("session:assigned", session);

getIO().to("technician").emit("session:assigned", session);

    res.json(session);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 4. KTV lấy danh sách ca của mình
 */
export const getMySessions = async (req: Request, res: Response) => {
  const technicianId = req.user.id;

  const data = await technicianService.getMyAssignedSessions(
    technicianId,
  );

  res.json(data);
};

/**
 * 🔹 5. Chi tiết session (full data)
 */
export const getSessionDetail = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await technicianService.getTechnicianSessionDetail(
      Number(req.params.id),
    );

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    const history = await technicianService.getSessionHistory(
      data.profile_id,
    );

    // const steps = await technicianService.getStepsBySession(
    //   data.package_id,
    //   data.session_no,
    // );

    res.json({
      ...data,
      history,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🔹 6. KTV bắt đầu session
 */
export const startSession = async (req: Request, res: Response) => {
  try {
    const session = await technicianService.startSession(
      Number(req.params.id),
    );

    getIO().to("manager").emit("session:updated", session);

    res.json(session);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 7. Hoàn thành session
 */
export const completeSession = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = completeSessionSchema.parse(req.body);

    const session = await technicianService.completeSession(
      Number(req.params.id),
      data,
    );

    getIO().to("manager").emit("session:updated", session);
    getIO().to("technician").emit("session:updated", session);

    res.json(session);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};