export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'

const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
}

export function isBookingStatus(value: string): value is BookingStatus {
  return ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(value)
}

export function canTransitionBookingStatus(from: BookingStatus, to: BookingStatus) {
  if (from === to) return true
  return allowedTransitions[from].includes(to)
}

export function assertBookingStatusTransition(from: string, to: string) {
  if (!isBookingStatus(from) || !isBookingStatus(to)) {
    throw new Error('INVALID_STATUS')
  }

  if (!canTransitionBookingStatus(from, to)) {
    throw new Error('INVALID_STATUS_TRANSITION')
  }
}
