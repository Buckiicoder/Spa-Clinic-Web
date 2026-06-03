import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2),
  gender: z.enum(["male", "female"]),
  contact: z.string(),
  password: z.string().min(6),
})

export const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string()
})

export const rateSessionSchema = z.object({
  sessionId: z.coerce.number(),

  rating: z.coerce.number()
    .min(0.5)
    .max(5),

  feedback: z.string()
    .max(1000)
    .optional(),
});