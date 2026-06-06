import { z } from "zod";

// ================= GET ALL =================

export const getCustomersQuerySchema = z.object({
  search: z.string().optional(),

  page: z.coerce.number().optional(),

  limit: z.coerce.number().optional(),

  rank: z.string().optional(),

  status: z.string().optional(),

  is_active: z.coerce.boolean().optional(),
});

// ================= CREATE =================

export const createCustomerSchema = z.object({
  name: z.string().min(1),

  phone: z.string().min(10).max(11),

  email: z.string().email().optional().or(z.literal("")),

  avatar: z.string().optional(),

  gender: z.enum(["male", "female", "other"]).optional(),

  dob: z.string().optional(),

  city: z.string().optional(),

  ward: z.string().optional(),

  address_detail: z.string().optional(),

  source: z.string().optional(),

  note: z.string().optional(),

  status: z.string().optional(),
});

// ================= UPDATE =================

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  is_active: z.boolean().optional(),

  referrer_id: z.number().optional(),
});

export const rescheduleSessionSchema = z.object({
  session_id: z.number(),

  service_date: z.string().min(1),

  service_time: z.string().min(1),
});
