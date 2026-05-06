import { z } from "zod";

/* ================= PACKAGE ================= */
const servicePackageSchema = z.object({
  id: z.number().optional(),

  name: z.string().min(1),
  price: z.number(),

  total_sessions: z.number().min(1),
  unit: z.string().min(1).default("buổi"),

  duration_per_unit: z.number().nullable().optional(),
  is_active: z.boolean().optional(),
});

/* ================= SERVICE ================= */
export const createServiceSchema = z.object({
  name: z.string().min(1),

  area: z.string().optional(),
  parent_id: z.number().nullable().optional(),

  description: z.string().optional(),
  duration: z.number().nullable().optional(),

  is_active: z.boolean().default(true),

  packages: z.array(servicePackageSchema).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();
