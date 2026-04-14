import { z } from "zod";

/**
 * 🔹 Tạo / mở lịch tháng
 */
export const createSchedulePeriodSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000),

  status: z.enum(["DRAFT", "OPEN", "CLOSED"]).optional(),

  open_from: z.string().optional(),
  open_to: z.string().optional(),
});

/**
 * 🔹 Cập nhật lịch tháng
 */
export const updateSchedulePeriodSchema = z.object({
  status: z.enum(["DRAFT", "OPEN", "CLOSED"]).optional(),
  open_from: z.string().optional(),
  open_to: z.string().optional(),
});

/**
 * 🔹 Tạo ngày làm việc trong tháng
 */
export const createScheduleDaysSchema = z.object({
  period_id: z.number(),

  days: z.array(
    z.object({
      work_date: z.string(),
      shift_id: z.number(),
      employee_type: z.enum(["FULLTIME", "PARTTIME"]),
      max_employee: z.number().optional(),
    })
  ),
});

/**
 * 🔹 Cập nhật 1 ngày
 */
export const updateScheduleDaySchema = z.object({
  work_date: z.string().optional(),

  shift_id: z.number().optional(),

  employee_type: z.enum(["FULLTIME", "PARTTIME"]).optional(),

  max_employee: z.number().optional(),

  note: z.string().optional(),
});
