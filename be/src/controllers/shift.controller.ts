import { Request, Response } from "express";
import * as shiftService from "../services/shift.service.js";
import {
  createShiftSchema,
  updateShiftSchema,
} from "../validators/shift.schema.js";

// 🔹 GET ALL
export const getShifts = async (_req: Request, res: Response) => {
  const shifts = await shiftService.getAllShifts();
  return res.json(shifts);
};

// 🔹 GET BY ID
export const getShiftById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const shift = await shiftService.getShiftById(id);

    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    return res.json(shift);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// 🔹 CREATE
export const createShift = async (req: Request, res: Response) => {
  try {
    const data = createShiftSchema.parse(req.body);

    // 🔸 check giờ hợp lệ
    if (data.start_time >= data.end_time) {
      return res.status(400).json({
        message: "Giờ bắt đầu phải nhỏ hơn giờ kết thúc",
      });
    }

    // 🔸 check trùng tên
    const existed = await shiftService.findShiftByName(data.name);
    if (existed) {
      return res.status(400).json({
        message: "Tên ca đã tồn tại",
      });
    }

    // 🔸 tạo shift
    const shift = await shiftService.createShift(data);

    return res.json({
      message: "Tạo ca thành công",
      shift,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// 🔹 UPDATE
export const updateShift = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const data = updateShiftSchema.parse(req.body);

    // 🔸 check tồn tại
    const existing = await shiftService.getShiftById(id);
    if (!existing) {
      return res.status(404).json({ message: "Shift not found" });
    }

    const newStart = data.start_time ?? existing.start_time;
    const newEnd = data.end_time ?? existing.end_time;

    // 🔸 check giờ
    if (newStart >= newEnd) {
      return res.status(400).json({
        message: "Giờ bắt đầu phải nhỏ hơn giờ kết thúc",
      });
    }

    // 🔸 check trùng tên nếu đổi
    if (data.name && data.name !== existing.name) {
      const existed = await shiftService.findShiftByName(data.name);
      if (existed) {
        return res.status(400).json({
          message: "Tên ca đã tồn tại",
        });
      }
    }

    // 🔸 update
    const shift = await shiftService.updateShift(id, data);

    return res.json({
      message: "Cập nhật ca thành công",
      shift,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// 🔹 DELETE
export const deleteShift = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // 🔸 check tồn tại
    const existing = await shiftService.getShiftById(id);
    if (!existing) {
      return res.status(404).json({ message: "Shift not found" });
    }

    await shiftService.deleteShift(id);

    return res.json({
      message: "Xóa ca thành công",
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
