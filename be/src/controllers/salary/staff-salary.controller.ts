import { Request, Response } from "express";

import * as staffSalaryServices from "../../services/salary/staff-salary.service.js";
import { assignStaffSalarySchema } from "../../validators/salary/staff-salary.schema.js";
// ================= ASSIGN =================

export const assignStaffSalary = async (req: Request, res: Response) => {
  try {
    const validatedData = assignStaffSalarySchema.parse(req.body);

    const data = await staffSalaryServices.assignStaffSalaryWithRelations(validatedData);

    return res.json(data);
  } catch (err: any) {
    console.error(err);

    return res.status(500).json({
      message: "Thiết lập lương nhân viên thất bại",
      error: err.message,
    });
  }
};

// ================= GET DETAIL =================

export const getStaffSalaryDetail = async (req: Request, res: Response) => {
  try {
    const staffId = Number(req.params.staffId);

    const data = await staffSalaryServices.getStaffSalaryDetail(staffId);

    if (!data) {
      return res.status(404).json({
        message: "Không tìm thấy thiết lập lương",
      });
    }

    return res.json(data);
  } catch {
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// ================= GET ALL =================

export const getAllStaffSalaries = async (req: Request, res: Response) => {
  try {
    const data = await staffSalaryServices.getAllStaffSalaries();

    return res.json(data);
  } catch {
    return res.status(500).json({
      message: "Lấy danh sách lương thất bại",
    });
  }
};
