import { Request, Response } from "express";

import * as allowanceServices from "../../services/salary/salary-allowance.service.js";

import { createSalaryAllowanceSchema } from "../../validators/salary/salary-allowance.schema.js";

// ================= GET ALL =================

export const getSalaryAllowances = async (req: Request, res: Response) => {
  try {
    const keyword = String(req.query.keyword || "");
    const data = await allowanceServices.getSalaryAllowances(keyword);

    return res.json(data);
  } catch {
    return res.status(500).json({
      message: "Lấy phụ cấp thất bại",
    });
  }
};

// ================= GET DETAIL =================
export const getSalaryAllowanceDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const data = await allowanceServices.getSalaryAllowanceDetail(id);

    if (!data) {
      return res.status(404).json({
        message: "Không tìm thấy phụ cấp",
      });
    }

    return res.json(data);
  } catch {
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// ================= CREATE =================

export const createSalaryAllowance = async (req: Request, res: Response) => {
  try {
    const validatedData = createSalaryAllowanceSchema.parse(req.body);

    const data = await allowanceServices.createSalaryAllowance({
      name: validatedData.name,

      amount_type: validatedData.amount_type,

      amount_value: validatedData.amount_value,

      apply_type: validatedData.amount_type,
    });

    return res.json(data);
  } catch (err: any) {
    console.error(err);

    return res.status(500).json({
      message: "Tạo phụ cấp thất bại",
      error: err.message,
    });
  }
};
