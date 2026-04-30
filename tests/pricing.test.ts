import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateBookingPrice } from '../lib/services/pricing'

const packageOption = {
  basePrice: 1200,
  includedGuests: 100,
  extraGuestFee: 18,
}

test('calculateBookingPrice keeps base price when guests fit package capacity', () => {
  const quote = calculateBookingPrice({
    package: packageOption,
    guestCount: 80,
    operationalFee: 150,
  })

  assert.deepEqual(quote, {
    extraGuests: 0,
    extraGuestsCost: 0,
    totalAmount: 1350,
  })
})

test('calculateBookingPrice charges only guests above package capacity', () => {
  const quote = calculateBookingPrice({
    package: packageOption,
    guestCount: 112,
    operationalFee: 150,
  })

  assert.deepEqual(quote, {
    extraGuests: 12,
    extraGuestsCost: 216,
    totalAmount: 1566,
  })
})
