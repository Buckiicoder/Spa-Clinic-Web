import { Request, Response } from "express";
import * as positionService from "../services/position.service.js";
import {
  createPositionSchema,
  updatePositionSchema,
} from "../validators/position.schema.js";
import { db } from "../config/db.js";

// 🔹 GET ALL
export const getPositions = async (_req: Request, res: Response) => {
  const positions = await positionService.getAllPositions();
  return res.json(positions);
};

// 🔹 GET BY ID
export const getPositionById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const position = await positionService.getPositionById(id);

    if (!position) {
      return res.status(404).json({ message: "Không tìm thấy chức danh" });
    }

    return res.json(position);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// 🔹 CREATE
export const createPosition = async (req: Request, res: Response) => {
  try {
    const data = createPositionSchema.parse(req.body);

    // 🔸 check trùng tên
    const existed = await positionService.findPositionByName(data.name);
    if (existed) {
      return res.status(400).json({
        message: "Tên chức danh đã tồn tại",
      });
    }

    const position = await positionService.createPosition(data);

    return res.json({
      message: "Tạo chức danh thành công",
      position,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// 🔹 UPDATE
export const updatePosition = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const data = updatePositionSchema.parse(req.body);

    // 🔸 check tồn tại
    const existing = await positionService.getPositionById(id);
    if (!existing) {
      return res.status(404).json({
        message: "Không tìm thấy chức danh",
      });
    }

    // 🔸 check trùng tên nếu đổi
    if (data.name && data.name !== existing.name) {
      const existed = await positionService.findPositionByName(data.name);
      if (existed) {
        return res.status(400).json({
          message: "Tên chức danh đã tồn tại",
        });
      }
    }

    const position = await positionService.updatePosition(id, data);

    return res.json({
      message: "Cập nhật chức danh thành công",
      position,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// 🔹 DELETE
export const deletePosition = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // 🔸 check tồn tại
    const existing = await positionService.getPositionById(id);
    if (!existing) {
      return res.status(404).json({
        message: "Không tìm thấy chức danh",
      });
    }

    // 🔸 check đang được staff sử dụng không
    const used = await db.query(
      `SELECT 1 FROM staffs WHERE position_id = $1 LIMIT 1`,
      [id]
    );

    if (used.rowCount && used.rowCount > 0) {
      return res.status(400).json({
        message: "Không thể xóa vì đang có nhân viên thuộc chức danh này",
      });
    }

    await positionService.deletePosition(id);

    return res.json({
      message: "Xóa chức danh thành công",
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
