import { Request, Response } from "express";

import * as salaryTemplateServices from "../../services/salary/salary-template.service.js";
import { db } from "../../config/db.js";
import {
  createSalaryTemplateSchema,
  updateSalaryTemplateSchema,
} from "../../validators/salary/salary-template.schema.js";

// ================= GET ALL =================

export const getSalaryTemplates = async (req: Request, res: Response) => {
  try {
    const data = await salaryTemplateServices.getSalaryTemplates();

    return res.json(data);
  } catch {
    return res.status(500).json({
      message: "Lấy mẫu lương thất bại",
    });
  }
};

// ================= GET DETAIL =================

export const getSalaryTemplateDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const data = await salaryTemplateServices.getSalaryTemplateDetail(id);

    if (!data) {
      return res.status(404).json({
        message: "Không tìm thấy mẫu lương",
      });
    }

    return res.json(data);
  } catch {
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

export const createSalaryTemplate = async (req: Request, res: Response) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const validatedData = createSalaryTemplateSchema.parse(req.body);

    // 1. create template
    const template = await salaryTemplateServices.createSalaryTemplate(
      {
        name: validatedData.name,

        employee_type: validatedData.employee_type,

        pay_period: validatedData.pay_period,

        salary_amount: validatedData.salary_amount,

salary_unit: validatedData.salary_unit,

        has_commission: validatedData.has_commission,

        commission_revenue_type: validatedData.commission_revenue_type,

        commission_calculation_type: validatedData.commission_calculation_type,

        commission_value: validatedData.commission_value,
        commission_unit: validatedData.commission_unit,

        minimum_revenue_target: validatedData.minimum_revenue_target,

        note: validatedData.note,

        is_active: validatedData.is_active,
      },
      client,
    );

    // 2. add allowances
    await salaryTemplateServices.addTemplateAllowances(
      template.id,
      validatedData.allowance_ids || [],
      client,
    );

    // 3. add deductions
    await salaryTemplateServices.addTemplateDeductions(
      template.id,
      validatedData.deduction_ids || [],
      client,
    );

    await client.query("COMMIT");

    return res.json(template);
  } catch (err: any) {
    await client.query("ROLLBACK");

    console.error(err);

    return res.status(400).json({
      message: "Tạo mẫu lương thất bại",

      error: err.errors || err.message,
    });
  } finally {
    client.release();
  }
};

export const updateSalaryTemplate = async (req: Request, res: Response) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const id = Number(req.params.id);

    const validatedData = updateSalaryTemplateSchema.parse(req.body);

    // 1. update template
    const template = await salaryTemplateServices.updateSalaryTemplate(
      id,
      {
        name: validatedData.name,

        employee_type: validatedData.employee_type,

        pay_period: validatedData.pay_period,

       salary_amount: validatedData.salary_amount,

salary_unit: validatedData.salary_unit,

        has_commission: validatedData.has_commission,

        commission_revenue_type: validatedData.commission_revenue_type,

        commission_calculation_type: validatedData.commission_calculation_type,

        commission_value: validatedData.commission_value,
        commission_unit: validatedData.commission_unit,

        minimum_revenue_target: validatedData.minimum_revenue_target,

        note: validatedData.note,

        is_active: validatedData.is_active,
      },
      client,
    );

    // 2. remove old relations
    await salaryTemplateServices.removeTemplateAllowances(id, client);

    await salaryTemplateServices.removeTemplateDeductions(id, client);

    // 3. add new relations
    await salaryTemplateServices.addTemplateAllowances(
      id,
      validatedData.allowance_ids || [],
      client,
    );

    await salaryTemplateServices.addTemplateDeductions(
      id,
      validatedData.deduction_ids || [],
      client,
    );

    await client.query("COMMIT");

    return res.json(template);
  } catch (err: any) {
    await client.query("ROLLBACK");

    console.error(err);

    return res.status(400).json({
      message: "Cập nhật mẫu lương thất bại",

      error: err.errors || err.message,
    });
  } finally {
    client.release();
  }
};
