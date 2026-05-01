import { z } from 'zod'

function isValidLocalDate(value: string) {
  const date = new Date(`${value}T12:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export const bookingRequestSchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isValidLocalDate),
  guests: z.coerce.number().int().min(1).max(1000),
  packageId: z.string().trim().min(1).max(120),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email().max(160),
    phone: z.string().trim().max(40).default(''),
    notes: z.string().trim().max(1600).optional(),
  }),
})

export type BookingRequestPayload = z.infer<typeof bookingRequestSchema>
