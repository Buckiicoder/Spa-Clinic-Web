import { Request, Response } from "express";

import * as deductionServices from "../../services/salary/salary-deduction.service.js";
import { createSalaryDeductionSchema } from "../../validators/salary/salary-deduction.schema.js";

// ================= GET ALL =================

export const getSalaryDeductions = async (req: Request, res: Response) => {
  try {
    const keyword = String(req.query.keyword || "");

    const data = await deductionServices.getSalaryDeductions(keyword);

    return res.json(data);
  } catch {
    return res.status(500).json({
      message: "Lấy giảm trừ thất bại",
    });
  }
};

export const getSalaryDeductionDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const data = await deductionServices.getSalaryDeductionDetail(id);

    if (!data) {
      return res.status(404).json({
        message: "Không tìm thấy giảm trừ",
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

export const createSalaryDeduction = async (req: Request, res: Response) => {
  try {
    const validatedData = createSalaryDeductionSchema.parse(req.body);

    const data = await deductionServices.createSalaryDeduction({
      name: validatedData.name,
      amount_type: validatedData.amount_type,
      amount_value: validatedData.amount_value,
      unit_type: validatedData.unit_type,
      condition_text: validatedData.condition_text,
      note: validatedData.note,
    });

    return res.json(data);
  } catch (err: any) {
    console.error(err);

    return res.status(500).json({
      message: "Tạo giảm trừ thất bại",
      error: err.message,
    });
  }
};
