import { Request, Response } from "express";
import * as consultationService from "../services/doctor.service.js";
import { updateConsultationSchema } from "../validators/doctor.schema.js";
import { getIO } from "../socket.js";

/**
 * 🔹 1. Lấy danh sách khách đang chờ khám
 */
export const getWaitingConsultations = async (req: Request, res: Response) => {
  const data = await consultationService.getWaitingConsultations();
  res.json(data);
};

/**
 * 🔹 2. Lấy danh sách bác sĩ đang khám
 */
export const getMyConsultations = async (req: Request, res: Response) => {
  const doctorId = req.user.id;

  const data = await consultationService.getConsultingBookings(doctorId);

  res.json(data);
};

/**
 * 🔹 3. Lấy chi tiết 1 ca khám
 */
export const getConsultationDetail = async (req: Request, res: Response) => {
  try {
    const data = await consultationService.getConsultationDetail(
      req.params.id,
    );

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🔹 4. Bác sĩ nhận khách (CHECKED_IN → IN_CONSULTATION)
 */
export const startConsultation = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user.id;

    const booking = await consultationService.startConsultation(
      req.params.id,
      doctorId,
    );

    if (!booking) {
      return res.status(400).json({
        message: "Khách đã được bác sĩ khác nhận",
      });
    }

    const full = await consultationService.getConsultationDetail(
      req.params.id,
    );

    // 🔥 realtime
    getIO().to("reception").emit("booking:updated", full);
    getIO().to("doctor").emit("booking:updated", full);

    res.json(full);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 5. Cập nhật thông tin khám
 */
export const updateConsultation = async (req: Request, res: Response) => {
  try {
    const data = updateConsultationSchema.parse(req.body);

    const updated = await consultationService.updateConsultation(
      req.params.id,
      data,
    );

    const full = await consultationService.getConsultationDetail(
      req.params.id,
    );

    getIO().to("doctor").emit("booking:updated", full);

    res.json(full);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 6. Kết thúc tư vấn (→ IN_TREATMENT)
 */
export const finishConsultation = async (req: Request, res: Response) => {
  try {
    const booking = await consultationService.finishConsultation(
      req.params.id,
    );

    const full = await consultationService.getConsultationDetail(
      req.params.id,
    );

    getIO().to("reception").emit("booking:updated", full);
    getIO().to("doctor").emit("booking:updated", full);

    res.json(full);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 7. Tạo liệu trình cho khách (profile)
 */
export const createProfile = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user.id;

    const profile = await consultationService.createCustomerServiceProfile({
      ...req.body,
      doctor_id: doctorId,
    });

    // 🔥 update lại consultation (gắn profile_id)
    await consultationService.updateConsultation(req.body.booking_id, {
      profile_id: profile.id,
    });

    const full = await consultationService.getConsultationDetail(
      req.body.booking_id,
    );

    getIO().to("doctor").emit("booking:updated", full);

    res.json(profile);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 8. Update profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const profile = await consultationService.updateCustomerServiceProfile(
      Number(req.params.id),
      req.body,
    );

    res.json(profile);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 9. Delete profile
 */
export const deleteProfile = async (req: Request, res: Response) => {
  await consultationService.deleteCustomerServiceProfile(
    Number(req.params.id),
  );

  res.json({ success: true });
};

/**
 * 🔹 10. Tạo session (buổi điều trị)
 */
export const createSession = async (req: Request, res: Response) => {
  try {
    const session = await consultationService.createServiceSession(
      req.body,
    );

    res.json(session);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 11. Update session
 */
export const updateSession = async (req: Request, res: Response) => {
  try {
    const session = await consultationService.updateServiceSession(
      Number(req.params.id),
      req.body,
    );

    res.json(session);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 12. Delete session
 */
export const deleteSession = async (req: Request, res: Response) => {
  await consultationService.deleteServiceSession(
    Number(req.params.id),
  );

  res.json({ success: true });
};