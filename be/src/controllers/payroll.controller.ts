import { Request, Response } from "express";

import * as payrollServices from "../services/payroll/payroll-service.service.js";

import {
  generatePayrollSchema,
  generateMultiplePayrollsSchema,
  regeneratePayrollSchema,
} from "../validators/payroll.schema.js";

export const getPayrollsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data =
      await payrollServices.getPayrollList({
        keyword: String(req.query.keyword || ""),

        employee_type: req.query.employee_type
          ? String(req.query.employee_type)
          : undefined,

        salary_unit: req.query.salary_unit
          ? String(req.query.salary_unit)
          : undefined,

        month: req.query.month
          ? Number(req.query.month)
          : undefined,

        year: req.query.year
          ? Number(req.query.year)
          : undefined,
      });

    return res.json(data);
  } catch (err: any) {
    console.error(err);

    return res.status(500).json({
      message: "Lấy danh sách bảng lương thất bại",

      error: err.message,
    });
  }
};

export const generatePayrollController =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const validatedData =
        generatePayrollSchema.parse(
          req.body,
        );

      const data =
        await payrollServices.generatePayroll(
          {
            staff_id:
              validatedData.staff_id,

            month:
              validatedData.month,

            year:
              validatedData.year,

            payroll_status:
              validatedData.payroll_status,

            note:
              validatedData.note,
          },
        );

      return res.json({
        message:
          "Tính lương thành công",

        data,
      });
    } catch (err: any) {
      console.error(err);

      return res.status(500).json({
        message:
          "Tính lương thất bại",

        error: err.message,
      });
    }
  };

// ======================================================
// GENERATE MULTIPLE PAYROLLS
// ======================================================

export const generateMultiplePayrollsController =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const validatedData =
        generateMultiplePayrollsSchema.parse(
          req.body,
        );

      const data =
        await payrollServices.generateMultiplePayrolls(
          validatedData.staff_ids,

          validatedData.month,

          validatedData.year,
        );

      return res.json({
        message:
          "Tính nhiều bảng lương thành công",

        data,
      });
    } catch (err: any) {
      console.error(err);

      return res.status(500).json({
        message:
          "Tính nhiều bảng lương thất bại",

        error: err.message,
      });
    }
  };


// DAILY PAYROLL SYNC
// ======================================================

export const runPayrollDailySyncController =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const data =
        await payrollServices.runPayrollDailySyncNow();

      return res.json({
        message:
          "Đồng bộ payroll hàng ngày thành công",

        data,
      });
    } catch (err: any) {
      console.error(err);

      return res.status(500).json({
        message:
          "Đồng bộ payroll hàng ngày thất bại",

        error: err.message,
      });
    }
  };
  
// ======================================================
// REGENERATE PAYROLL
// ======================================================

export const regeneratePayrollController =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const validatedData =
        regeneratePayrollSchema.parse(
          req.body,
        );

      const data =
        await payrollServices.regeneratePayroll(
          validatedData.staff_id,

          validatedData.month,

          validatedData.year,
        );

      return res.json({
        message:
          "Tính lại bảng lương thành công",

        data,
      });
    } catch (err: any) {
      console.error(err);

      return res.status(500).json({
        message:
          "Tính lại bảng lương thất bại",

        error: err.message,
      });
    }
  };