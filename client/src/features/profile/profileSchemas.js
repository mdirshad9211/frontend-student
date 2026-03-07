import { z } from 'zod'

export const profileSchema = z.object({
  dob: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  pwd: z.boolean().optional().nullable(),
  yearOfGraduation: z.number().int().min(1990).max(2030).optional().nullable(),
  specialization: z.string().max(120).optional().nullable(),
  preferredCategories: z.array(z.string()).optional().nullable(),
})

