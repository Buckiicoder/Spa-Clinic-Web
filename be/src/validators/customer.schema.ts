import { z } from "zod";

// ================= PROFILE =================
export const createCustomerProfileSchema = z.object({
  customer_id: z.number(),
  service_id: z.number(),
  package_id: z.number(),

  doctor_id: z.number().optional(),
  technician_id: z.number().optional(),

  total_sessions: z.number().min(1),
  used_sessions: z.number().optional(),

  status: z
    .enum(["in_progress", "completed", "cancelled"])
    .optional(),

  started_at: z.string().optional(),
  completed_at: z.string().optional(),

  note: z.string().optional(),
});

// ================= SESSION =================
export const createSessionSchema = z.object({
  profile_id: z.number(),
  session_no: z.number(),

  service_date: z.string(),

  technician_id: z.number().optional(),

  doctor_note: z.string().optional(),
  skin_reaction: z.string().optional(),
  customer_feedback: z.string().optional(),

  rating: z.number().min(0).max(5).optional(),

  status: z
    .enum(["scheduled", "done", "missed", "cancelled"])
    .optional(),
});
