import { Request, Response } from "express";
import * as staffService from "../services/staff.service.js";
import {
  createStaffSchema,
  updateStaffSchema,
} from "../validators/staff.schema.js";
import { hashPassword } from "../utils/hash.js";
import { UserRole } from "../types/user.js";


// 🔹 GET ALL
export const getStaffs = async (_req: Request, res: Response) => {
  const staffs = await staffService.getAllStaffs();
  return res.json(staffs);
};

// 🔹 GET BY ID
export const getStaffById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const staff = await staffService.getStaffById(id);

    if (!staff) {
      return res.status(404).json({
        message: "Nhân viên không tồn tại",
      });
    }

    return res.json(staff);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// 🔹 CREATE
export const createStaff = async (req: Request, res: Response) => {
  try {
    const data = createStaffSchema.parse(req.body);

    // 🔸 check trùng (DB level)
    const existed = await staffService.findUserByPhoneOrEmail(
      data.phone,
      data.email
    );

    if (existed) {
      return res.status(400).json({
        message: "SĐT hoặc Email đã tồn tại",
      });
    }

    // 🔸 hash password (dùng util)
    const password_hash = await hashPassword(data.password);

    // 🔸 create
    const result = await staffService.createStaff({
      ...data,
      password_hash,
      role: UserRole.STAFF,
    });

    return res.json({
      message: "Tạo nhân viên thành công",
      result,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

// 🔹 UPDATE
export const updateStaff = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const data = updateStaffSchema.parse(req.body);

    // 🔸 check tồn tại
    const existing = await staffService.getStaffById(id);
    if (!existing) {
      return res.status(404).json({
        message: "Nhân viên không tồn tại",
      });
    }

    // 🔸 check trùng nếu update phone/email
    if (data.phone || data.email) {
      const existed = await staffService.findUserByPhoneOrEmail(
        data.phone,
        data.email
      );

      if (existed && existed.id !== existing.user_id) {
        return res.status(400).json({
          message: "SĐT hoặc Email đã tồn tại",
        });
      }
    }

    const staff = await staffService.updateStaff(id, data);

    return res.json({
      message: "Cập nhật nhân viên thành công",
      staff,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

// 🔹 DELETE
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const existing = await staffService.getStaffById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Nhân viên không tồn tại",
      });
    }

    await staffService.deleteStaff(id);

    return res.json({
      message: "Xóa nhân viên thành công",
    });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
