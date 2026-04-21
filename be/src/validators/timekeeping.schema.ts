import { z } from "zod";

export const timekeepingStatusEnum = z.enum([
  "PENDING", // nhân viên xin nghỉ, chờ duyệt
  "OFF",
  "SCHEDULED",
  "WORKING",
  "BREAK",
  "COMPLETED",
  "ABSENT",
]);

export const createTimekeepingSchema = z.object({
  records: z
    .array(
      z.object({
        user_id: z.number({
          required_error: "Thiếu user_id",
        }),

        shift_id: z.number({
          required_error: "Chưa chọn ca làm",
        }),

        work_date: z.string({
          required_error: "Thiếu ngày làm việc",
        }),

        status: timekeepingStatusEnum.default("SCHEDULED"),
      }),
    )
    .min(1, "Phải chọn ít nhất 1 ca"),
});

//
// 🔹 UPDATE CHẤM CÔNG (check-in / check-out)
//
export const updateTimekeepingSchema = z.object({
  check_in_time: z.string().datetime().optional(),
  check_out_time: z.string().datetime().optional(),
  break_start_time: z.string().datetime().optional(),
  break_end_time: z.string().datetime().optional(),
  status: timekeepingStatusEnum.optional(),
  reject_reason: z.string().nullable().optional(),
});

// 🔹 GET theo user + tháng
export const getTimekeepingByUserSchema = z.object({
  user_id: z.number().optional(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
});

// 🔹 CHI TIẾT CHẤM CÔNG
export const upsertTimekeepingDetailSchema = z.object({
  timekeeping_id: z.number({
    required_error: "Thiếu timekeeping_id",
  }),
  work_minutes: z.number().min(0).optional(),
  ot_minutes: z.number().min(0).optional(),
  break_minutes: z.number().min(0).optional(),
  check_in_lat: z.number().optional(),
  check_in_lng: z.number().optional(),
  check_out_lat: z.number().optional(),
  check_out_lng: z.number().optional(),
  is_full_work: z.boolean().optional(),
});

//
// 🔹 DELETE (hủy đăng ký)
//
export const deleteTimekeepingSchema = z.object({
  id: z.number({
    required_error: "Thiếu id chấm công",
  }),
});
