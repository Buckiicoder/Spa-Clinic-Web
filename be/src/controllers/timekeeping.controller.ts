import { Request, Response } from "express";
import * as timekeepingService from "../services/timekeeping.service.js";
import {
  createTimekeepingSchema,
  updateTimekeepingSchema,
} from "../validators/timekeeping.schema.js";

//
// 🔹 GET theo user + tháng
//
export const getTimekeepingByMonth = async (req: Request, res: Response) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const user_id = req.query.user_id ? Number(req.query.user_id) : undefined;

    if (!month || !year) {
      return res.status(400).json({
        message: "Thiếu month hoặc year",
      });
    }

    const data = await timekeepingService.getTimekeepingByUser(
      month,
      year,
      user_id,
    );

    return res.json(data);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//
// 🔹 CREATE (đăng ký lịch làm)
//
// timekeeping.controller.ts

export const createTimekeeping = async (req: Request, res: Response) => {
  try {
    console.log("REQ BODY", req.body);

    const parsed = createTimekeepingSchema.parse(req.body);

    console.log("PARSED RECORDS", parsed.records);

    const result = await timekeepingService.createTimekeepingBulk(
      parsed.records,
    );

    return res.status(200).json({
      message: "Đăng ký lịch thành công",
      data: result,
    });
  } catch (err: any) {
    console.error("CREATE TIMEKEEPING ERROR", err);

    return res.status(400).json({
      message:
        err?.errors?.[0]?.message || err?.message || "Đăng ký lịch thất bại",
    });
  }
};

//
// 🔹 UPDATE trạng thái / check-in / check-out
//
export const updateTimekeeping = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    const data = updateTimekeepingSchema.parse(req.body);

    const result = await timekeepingService.updateTimekeeping(id, data);

    if (!result) {
      return res.status(404).json({
        message: "Không tìm thấy bản ghi chấm công",
      });
    }

    return res.json({
      message: "Cập nhật chấm công thành công",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.errors?.[0]?.message || err.message,
    });
  }
};

export const approveTimekeepingOff = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const updated = await timekeepingService.updateTimekeepingStatus(id, "OFF");
    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Duyệt nghỉ thất bại",
    });
  }
};

export const rejectTimekeepingOff = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const updated = await timekeepingService.updateTimekeepingStatus(
      id,
      "SCHEDULED",
    );

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Từ chối nghỉ thất bại",
    });
  }
};

//
// 🔹 DELETE (hủy đăng ký ca)
//
export const deleteTimekeeping = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    await timekeepingService.deleteTimekeeping(id);

    return res.json({
      message: "Xóa ca đăng ký thành công",
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//
// 🔹 CHECK-IN
//
export const checkIn = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const { lat, lng } = req.body;

    const result = await timekeepingService.checkIn(id, lat, lng);

    return res.json({
      message: "Check-in thành công",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//
// 🔹 CHECK-OUT
//
export const checkOut = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const { lat, lng } = req.body;

    const result = await timekeepingService.checkOut(id, lat, lng);

    return res.json({
      message: "Check-out thành công",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//
// 🔹 START BREAK
//
export const startBreak = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const result = await timekeepingService.startBreak(id);

    return res.json({
      message: "Bắt đầu nghỉ",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//
// 🔹 END BREAK
//
export const endBreak = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const result = await timekeepingService.endBreak(id);

    return res.json({
      message: "Kết thúc nghỉ",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
