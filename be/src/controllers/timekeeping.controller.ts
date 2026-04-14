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
    const user_id = Number(req.query.user_id);
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!user_id || !month || !year) {
      return res.status(400).json({
        message: "Thiếu user_id, month hoặc year",
      });
    }

    const data = await timekeepingService.getTimekeepingByMonth(
      user_id,
      month,
      year
    );

    return res.json(data);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//
// 🔹 CREATE (đăng ký lịch làm)
//
export const createTimekeeping = async (req: Request, res: Response) => {
  try {
    const data = createTimekeepingSchema.parse(req.body);

    const result = await timekeepingService.createTimekeeping(data);

    return res.json({
      message: "Đăng ký ca làm thành công",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.errors?.[0]?.message || err.message,
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
