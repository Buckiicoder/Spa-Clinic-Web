import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2),
  gender: z.enum(["nam", "nu"]),
  contact: z.string(),
  password: z.string().min(6),
})

export const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string()
})