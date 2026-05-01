import { z } from 'zod'

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(160),
  phone: z.string().trim().max(40).optional().default(''),
  subject: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().min(10).max(2000),
})

export type ContactMessagePayload = z.infer<typeof contactMessageSchema>
