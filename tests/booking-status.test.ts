import test from 'node:test'
import assert from 'node:assert/strict'
import {
  assertBookingStatusTransition,
  canTransitionBookingStatus,
  isBookingStatus,
} from '../lib/services/booking-status'

test('isBookingStatus accepts known booking statuses only', () => {
  assert.equal(isBookingStatus('PENDING'), true)
  assert.equal(isBookingStatus('CONFIRMED'), true)
  assert.equal(isBookingStatus('BOGUS'), false)
})

test('canTransitionBookingStatus allows operational booking flow', () => {
  assert.equal(canTransitionBookingStatus('PENDING', 'CONFIRMED'), true)
  assert.equal(canTransitionBookingStatus('PENDING', 'REJECTED'), true)
  assert.equal(canTransitionBookingStatus('CONFIRMED', 'COMPLETED'), true)
  assert.equal(canTransitionBookingStatus('CONFIRMED', 'CANCELLED'), true)
})

test('canTransitionBookingStatus prevents reopening terminal bookings', () => {
  assert.equal(canTransitionBookingStatus('REJECTED', 'CONFIRMED'), false)
  assert.equal(canTransitionBookingStatus('CANCELLED', 'CONFIRMED'), false)
  assert.equal(canTransitionBookingStatus('COMPLETED', 'CANCELLED'), false)
})

test('assertBookingStatusTransition throws for invalid status values and transitions', () => {
  assert.throws(() => assertBookingStatusTransition('PENDING', 'BOGUS'), /INVALID_STATUS/)
  assert.throws(() => assertBookingStatusTransition('REJECTED', 'CONFIRMED'), /INVALID_STATUS_TRANSITION/)
  assert.doesNotThrow(() => assertBookingStatusTransition('PENDING', 'CONFIRMED'))
})
