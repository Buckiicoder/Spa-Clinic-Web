import { z } from "zod";

/**
 * 🔹 Manager assign KTV
 */
export const assignTechnicianSchema = z.object({
  session_id: z.number(),
  technician_id: z.number(),
});

/**
 * 🔹 KTV hoàn thành session
 */
export const completeSessionSchema = z.object({
  doctor_note: z.string().optional(),
  skin_reaction: z.string().optional(),
  customer_feedback: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
});