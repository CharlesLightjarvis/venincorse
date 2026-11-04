import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    canChangeTrial,
    createTrialDemoState,
    defaultAvailability,
    formatTrialDate,
    getTrialSlots,
} from '../../resources/js/data/trial-booking.ts';

const now = new Date('2026-11-04T09:00:00Z');

function emptyState() {
    return { bookings: [], availability: structuredClone(defaultAvailability) };
}

test('slots respect the 24-hour lead time, open days and a 14-day horizon', () => {
    const slots = getTrialSlots(emptyState(), now);
    assert.equal(slots[0], '2026-11-05T09:00:00.000Z');
    assert.ok(
        slots.every(
            (slot) => new Date(slot).getTime() >= now.getTime() + 86400000,
        ),
    );
    assert.ok(slots.every((slot) => new Date(slot).getUTCDay() !== 0));
    assert.ok(slots.every((slot) => slot < '2026-11-18T00:00:00.000Z'));
});

test('confirmed and completed slots are unavailable, cancellation releases them', () => {
    const state = createTrialDemoState(now);
    const booking = state.bookings[0];
    assert.ok(!getTrialSlots(state, now).includes(booking.startsAt));
    booking.status = 'completed';
    assert.ok(!getTrialSlots(state, now).includes(booking.startsAt));
    booking.status = 'cancelled';
    assert.ok(getTrialSlots(state, now).includes(booking.startsAt));
});

test('rescheduling releases the old slot and occupies the new one', () => {
    const state = createTrialDemoState(now);
    const previousSlot = state.bookings[0].startsAt;
    const nextSlot = getTrialSlots(state, now)[0];
    state.bookings[0].startsAt = nextSlot;
    const available = getTrialSlots(state, now);
    assert.ok(available.includes(previousSlot));
    assert.ok(!available.includes(nextSlot));
});

test('blocked dates, selected hours and closed availability are respected', () => {
    const state = emptyState();
    state.availability.blockedDates = ['2026-11-05'];
    state.availability.hours = [14];
    const slots = getTrialSlots(state, now);
    assert.ok(slots.length > 0);
    assert.ok(
        slots.every(
            (slot) =>
                !slot.startsWith('2026-11-05') &&
                new Date(slot).getUTCHours() === 14,
        ),
    );
    state.availability.weekdays = [];
    assert.deepEqual(getTrialSlots(state, now), []);
});

test('only confirmed bookings at least 24 hours away can be changed', () => {
    const booking = createTrialDemoState(now).bookings[0];
    booking.startsAt = '2026-11-05T09:00:00.000Z';
    assert.equal(canChangeTrial(booking, now), true);
    assert.equal(
        canChangeTrial(booking, new Date('2026-11-04T09:00:01Z')),
        false,
    );
    booking.status = 'cancelled';
    assert.equal(canChangeTrial(booking, now), false);
});

test('timezone display converts the same appointment without changing its instant', () => {
    const instant = '2026-11-05T14:00:00.000Z';
    assert.match(formatTrialDate(instant, 'Europe/Paris'), /15:00/);
    assert.match(formatTrialDate(instant, 'America/Montreal'), /09:00/);
});
