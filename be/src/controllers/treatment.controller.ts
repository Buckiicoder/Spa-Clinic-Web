import { Request, Response } from "express";
import * as treatmentService from "../services/treatment.service.js";
import { saveTreatmentSchema } from "../validators/treatment.schema.js";
import { db } from "../config/db.js";
import * as type from "../types/treatment.js";

// ================= GET ALL PACKAGES =================
export const getPackages = async (req: Request, res: Response) => {
  try {
    const data = await treatmentService.getAllPackages();
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Lấy danh sách liệu trình thất bại",
    });
  }
};

// ================= SAVE =================
export const saveTreatment = async (req: Request, res: Response) => {
  try {
    const packageId = Number(req.params.id);
    if (!packageId || isNaN(packageId)) {
      return res.status(400).json({ message: "packageId không hợp lệ" });
    }

    // 🔥 validate
    const parsed = saveTreatmentSchema.parse(req.body) as type.SavePayload;

    const totalSessions =
      (
        await db.query(
          `SELECT total_sessions FROM service_packages WHERE id = $1`,
          [packageId],
        )
      ).rows[0]?.total_sessions || 0;

    const covered: number[] = [];

    parsed.phases.forEach((p) => {
      for (let i = p.from_session; i <= p.to_session; i++) {
        covered.push(i);
      }
    });

    const unique = new Set(covered);

    // thiếu hoặc trùng
    if (unique.size !== totalSessions) {
      return res.status(400).json({
        message: "Thiếu hoặc trùng số buổi trong giai đoạn",
      });
    }

    // vượt
    if (covered.length && Math.max(...covered) > totalSessions) {
      return res.status(400).json({
        message: "Vượt quá số buổi của gói",
      });
    }

    // ❗ check overlap giữa các phase
    for (let i = 0; i < parsed.phases.length; i++) {
      for (let j = i + 1; j < parsed.phases.length; j++) {
        const a = parsed.phases[i];
        const b = parsed.phases[j];

        const isOverlap =
          a.from_session <= b.to_session && b.from_session <= a.to_session;

        if (isOverlap) {
          return res.status(400).json({
            message: "Các giai đoạn bị chồng chéo buổi",
          });
        }
      }
    }

    if (!parsed.phases || parsed.phases.length === 0) {
      return res.status(400).json({
        message: "Phải có ít nhất 1 giai đoạn",
      });
    }

    await treatmentService.saveTreatmentByPackage(packageId, parsed);

    return res.json({
      message: "Lưu liệu trình thành công",
    });
  } catch (err: any) {
    console.error(err);

    if (err.name === "ZodError") {
      return res.status(400).json(err.errors);
    }

    return res.status(500).json({
      message: "Lưu thất bại",
    });
  }
};

// ================= GET DETAIL =================
export const getTreatment = async (req: Request, res: Response) => {
  try {
    const packageId = Number(req.params.id);
    if (!packageId || isNaN(packageId)) {
      return res.status(400).json({ message: "packageId không hợp lệ" });
    }

    const data = await treatmentService.getTreatmentByPackage(packageId);

    if (!data) {
      return res.status(404).json({
        message: "Không tìm thấy liệu trình",
      });
    }

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

export const searchSteps = async (req: Request, res: Response) => {
  try {
    const keyword = (req.query.q as string) || "";
    const data = await treatmentService.searchSteps(keyword);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi search step" });
  }
};

export const searchSessions = async (req: Request, res: Response) => {
  try {
    const keyword = (req.query.q as string) || "";
    const data = await treatmentService.searchSessions(keyword);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi search session" });
  }
};
