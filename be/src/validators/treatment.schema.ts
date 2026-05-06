import { z } from "zod";

/* ================= PRODUCT ================= */
const productSchema = z.object({
  product_id: z.number(),
  quantity: z.number().optional().default(1),
});

/* ================= STEP ================= */
const stepSchema = z.object({
  name: z.string().min(1),
  duration: z.number().optional().default(0),
  products: z.array(productSchema).optional(),
});

/* ================= PHASE ================= */
const phaseSchema = z.object({
  name: z.string().min(1),
  from_session: z.number().min(1),
  to_session: z.number().min(1),
  objective: z.string().optional(),

  // 🔥 SỬA Ở ĐÂY
  steps_template: z.array(stepSchema).default([]),
}).refine(
  (p) => p.from_session <= p.to_session,
  { message: "from_session phải <= to_session" }
);

/* ================= MAIN ================= */
export const saveTreatmentSchema = z.object({
  phases: z.array(phaseSchema),
});
