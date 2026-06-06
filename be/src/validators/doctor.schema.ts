import { z } from "zod";

/**
 * 🔹 Bác sĩ cập nhật thông tin tư vấn
 */
export const updateConsultationSchema = z.object({
  diagnosis: z.string().optional(),

  consultation_note: z.string().optional(),

  recommended_package_id: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === "" || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),

  is_consultation: z.boolean().optional(),

  profile_id: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === "" || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),
});

/**
 * 🔹 Create profile
 */
export const createProfileSchema = z.object({
  customer_id: z.number(),
  service_id: z.number(),
  package_id: z.number(),
  total_sessions: z.number().min(1),

  booking_id: z.number().optional(),
  note: z.string().optional(),
});

/**
 * 🔹 Update profile
 */
export const updateProfileSchema = z.object({
  doctor_id: z.number().optional(),
  technician_id: z.number().optional(),
  total_sessions: z.number().optional(),
  used_sessions: z.number().optional(),
  status: z.string().optional(),
  note: z.string().optional(),
});

/**
 * 🔹 Create session
 */
export const createSessionSchema = z.object({
  profile_id: z.number(),
  session_no: z.number(),
  service_date: z.string(),
  service_time: z.string(),
  technician_id: z.number().optional(),
});

/**
 * 🔹 Update session
 */
export const updateSessionSchema = z.object({
  technician_id: z.number().optional(),
  doctor_note: z.string().optional(),
  skin_reaction: z.string().optional(),
  customer_feedback: z.string().optional(),
  rating: z.number().optional(),
  status: z.string().optional(),
  service_date: z.string().optional(),
  service_time: z.string().optional(),
});
