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
  skin_reaction: z.string().optional(),
  after_image_url: z.string().optional(),
});