import { z } from 'zod'

function isValidLocalDate(value: string) {
  const date = new Date(`${value}T12:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function businessDateKey(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

export function isBookableLocalDate(value: string, now = new Date()) {
  return isValidLocalDate(value) && value >= businessDateKey(now)
}

export const bookingRequestSchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).refine(isBookableLocalDate),
  guests: z.coerce.number().int().min(1).max(1000),
  packageId: z.string().trim().min(1).max(120),
  expectedTotal: z.coerce.number().positive().max(100_000_000),
  addons: z.array(z.object({
    id: z.string().trim().min(1).max(120),
    quantity: z.coerce.number().int().min(1).max(20),
  })).max(12).optional().default([]),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email().max(160),
    phone: z.string().trim().max(40).default(''),
    notes: z.string().trim().max(1600).optional(),
  }),
})

export type BookingRequestPayload = z.infer<typeof bookingRequestSchema>
