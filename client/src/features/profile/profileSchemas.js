import { z } from 'zod'

export const profileSchema = z.object({
  dob: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
})

