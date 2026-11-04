import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    buildCourseSessions,
    canCancelCourse,
    getCourseCohorts,
    getCourseQuote,
    remainingCourseSeats,
} from '../../resources/js/data/course-booking.ts';

for (const [rhythm, count] of [
    ['extensif', 60],
    ['accelere', 20],
    ['intensif', 20],
    ['super-intensif', 12],
]) {
    test(`${rhythm} schedules exactly 60 hours with the expected session count`, () => {
        const sessions = buildCourseSessions(
            '2026-11-09T09:00:00.000Z',
            rhythm,
        );
        assert.equal(sessions.length, count);
        assert.equal(
            sessions.reduce((sum, session) => sum + session.hours, 0),
            60,
        );
        assert.ok(
            sessions.every(
                (session) =>
                    session.hours > 0 &&
                    ![0, 6].includes(new Date(session.startsAt).getUTCDay()),
            ),
        );
        if (rhythm === 'super-intensif') {
            assert.equal(sessions.at(-1).hours, 5);
        }
    });
}

test('accelerated plans start on an actual Tuesday and continue on Thursday', () => {
    const cohorts = getCourseCohorts(
        'a1',
        'accelere',
        'group',
        new Date('2026-11-04T10:00:00Z'),
    );
    assert.equal(cohorts[0].startsAt, '2026-11-10T09:00:00.000Z');
    assert.ok(
        cohorts[0].sessions.every((session) =>
            [2, 4].includes(new Date(session.startsAt).getUTCDay()),
        ),
    );
});

test('installments add 5 percent and preserve the exact cent total', () => {
    const quote = getCourseQuote(2090, true);
    assert.equal(quote.totalCents, 219450);
    assert.equal(quote.paymentsCents.length, 3);
    assert.equal(
        quote.paymentsCents.reduce((sum, amount) => sum + amount, 0),
        quote.totalCents,
    );
    const uneven = getCourseQuote(720, true, 39);
    assert.equal(uneven.totalCents, 71505);
    assert.equal(
        uneven.paymentsCents.reduce((sum, amount) => sum + amount, 0),
        71505,
    );
    assert.deepEqual(getCourseQuote(720, false, 39), {
        totalCents: 68100,
        paymentsCents: [68100],
    });
});

test('a confirmed registration occupies one place and cancellation releases it', () => {
    const cohort = getCourseCohorts(
        'a1',
        'extensif',
        'solo',
        new Date('2026-11-04T10:00:00Z'),
    )[0];
    const booking = { cohort, status: 'confirmed' };
    assert.equal(remainingCourseSeats(cohort, [booking]), 0);
    booking.status = 'cancelled';
    assert.equal(remainingCourseSeats(cohort, [booking]), 1);
});

test('cancellation requires an active booking within 14 days and before its start', () => {
    const booking = {
        createdAt: '2026-11-01T10:00:00Z',
        status: 'confirmed',
        cohort: { startsAt: '2026-11-20T09:00:00Z' },
    };
    assert.equal(
        canCancelCourse(booking, new Date('2026-11-05T10:00:00Z')),
        true,
    );
    assert.equal(
        canCancelCourse(booking, new Date('2026-11-16T10:00:00Z')),
        false,
    );
    booking.cohort.startsAt = '2026-11-04T09:00:00Z';
    assert.equal(
        canCancelCourse(booking, new Date('2026-11-05T10:00:00Z')),
        false,
    );
});
