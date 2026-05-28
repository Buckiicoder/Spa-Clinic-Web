import { z } from "zod";

// ======================================================
// GET ALL OT REQUESTS
// ======================================================

export const getOvertimeRequestsSchema = z.object({
  keyword: z.string().optional(),

  status: z.string().optional(),

  work_date: z.string().optional(),

  from_date: z.string().optional(),

  to_date: z.string().optional(),

  user_id: z.number().optional(),
});

// ======================================================
// GET DETAIL
// ======================================================

export const overtimeRequestIdSchema = z.object({
  id: z.number(),
});

// ======================================================
// CREATE OT REQUEST
// ======================================================

export const createOvertimeRequestSchema = z.object({
  user_id: z.number(),

  timekeeping_id: z.number(),

  work_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

  requested_minutes: z.number().min(1),

  requested_start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(),

  requested_end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(),

  reason: z.string().nullable().optional(),
});

// ======================================================
// APPROVE OT REQUEST
// ======================================================

export const approveOvertimeRequestSchema = z.object({
  approved_by: z.number(),

  approved_minutes: z.number().min(1),
});

// ======================================================
// REJECT OT REQUEST
// ======================================================

export const rejectOvertimeRequestSchema = z.object({
  approved_by: z.number(),

  reject_reason: z.string().nullable().optional(),
});

// ======================================================
// CANCEL OT REQUEST
// ======================================================

export const cancelOvertimeRequestSchema = z.object({
  user_id: z.number(),
});

// ======================================================
// SYNC OT TO TIMEKEEPING
// ======================================================

export const syncApprovedOtSchema = z.object({
  timekeeping_id: z.number(),
});
