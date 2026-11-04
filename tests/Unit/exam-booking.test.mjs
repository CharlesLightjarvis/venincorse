import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    canCancelExam,
    examLevels,
    examProviders,
    examScopes,
    getExamCohorts,
    getExamPackage,
    isExamDateCompatible,
    remainingExamSeats,
} from '../../resources/js/data/exam-booking.ts';
import { getCourseQuote } from '../../resources/js/data/course-booking.ts';

test('all provider, level and scope combinations have distinct individual and group prices', () => {
    for (const provider of examProviders) {
        for (const level of examLevels) {
            for (const tier of ['solo', 'group']) {
                const full = getExamPackage(provider, level, 'full', tier);
                const written = getExamPackage(
                    provider,
                    level,
                    'written',
                    tier,
                );
                const oral = getExamPackage(provider, level, 'oral', tier);
                assert.ok(
                    full.priceCents > written.priceCents &&
                        written.priceCents > oral.priceCents &&
                        oral.priceCents > 0,
                );
            }
            for (const scope of examScopes) {
                assert.ok(
                    getExamPackage(provider, level, scope, 'solo').priceCents >
                        getExamPackage(provider, level, scope, 'group')
                            .priceCents,
                );
            }
        }
    }
    assert.equal(
        getExamPackage('osd', 'b2', 'full', 'group').priceCents,
        46000,
    );
    assert.notEqual(
        getExamPackage('goethe', 'b2', 'oral', 'solo').priceCents,
        getExamPackage('osd', 'b2', 'oral', 'solo').priceCents,
    );
    assert.notEqual(
        getExamPackage('telc', 'b2', 'written', 'group').priceCents,
        getExamPackage('goethe', 'b2', 'written', 'group').priceCents,
    );
});

test('every schedule matches its package volume without hardcoded 60-hour plans', () => {
    for (const level of examLevels) {
        for (const scope of examScopes) {
            for (const pace of ['regular', 'intensive']) {
                const pack = getExamPackage('osd', level, scope, 'group');
                const cohort = getExamCohorts(
                    'osd',
                    level,
                    scope,
                    'group',
                    pace,
                    new Date('2026-11-04T10:00:00Z'),
                )[0];
                assert.equal(
                    cohort.sessions.length,
                    pack.trainingSessions + pack.mockSessions,
                );
                assert.equal(
                    cohort.sessions.reduce(
                        (total, session) => total + session.hours,
                        0,
                    ),
                    pack.hours,
                );
                assert.ok(
                    cohort.sessions.every((session) => session.hours === 1.5),
                );
                if (pace === 'regular') {
                    assert.ok(
                        cohort.sessions.every((session) =>
                            [2, 4].includes(
                                new Date(session.startsAt).getUTCDay(),
                            ),
                        ),
                    );
                }
            }
        }
    }
});

test('exam cohorts isolate provider and scope, occupy a place and release it on cancellation', () => {
    const now = new Date('2026-11-04T10:00:00Z');
    const cohort = getExamCohorts(
        'osd',
        'a2',
        'oral',
        'solo',
        'regular',
        now,
    )[0];
    const booking = { cohort, status: 'confirmed' };
    assert.equal(remainingExamSeats(cohort, [booking]), 0);
    const otherProvider = getExamCohorts(
        'goethe',
        'a2',
        'oral',
        'solo',
        'regular',
        now,
    )[0];
    const otherScope = getExamCohorts(
        'osd',
        'a2',
        'written',
        'solo',
        'regular',
        now,
    )[0];
    assert.equal(remainingExamSeats(otherProvider, [booking]), 1);
    assert.equal(remainingExamSeats(otherScope, [booking]), 1);
    booking.status = 'cancelled';
    assert.equal(remainingExamSeats(cohort, [booking]), 1);
});

test('the target exam must be after the last preparation session', () => {
    const cohort = {
        sessions: [{ startsAt: '2026-11-20T15:00:00Z', hours: 1.5 }],
    };
    assert.equal(isExamDateCompatible(cohort, ''), true);
    assert.equal(isExamDateCompatible(cohort, '2026-11-19'), false);
    assert.equal(isExamDateCompatible(cohort, '2026-11-20'), false);
    assert.equal(isExamDateCompatible(cohort, '2026-11-21'), true);
});

test('fractional exam prices retain exact cents in installment payments', () => {
    const pack = getExamPackage('goethe', 'a1', 'oral', 'group');
    const quote = getCourseQuote(pack.priceCents / 100, true);
    assert.equal(quote.totalCents, Math.round(pack.priceCents * 1.05));
    assert.equal(
        quote.paymentsCents.reduce((sum, amount) => sum + amount, 0),
        quote.totalCents,
    );
});

test('cancellation requires confirmation, the 14-day window and a future start', () => {
    const booking = {
        status: 'confirmed',
        createdAt: '2026-11-01T10:00:00Z',
        cohort: { startsAt: '2026-11-20T10:00:00Z' },
    };
    assert.equal(
        canCancelExam(booking, new Date('2026-11-05T10:00:00Z')),
        true,
    );
    assert.equal(
        canCancelExam(booking, new Date('2026-11-16T10:00:00Z')),
        false,
    );
    booking.cohort.startsAt = '2026-11-04T10:00:00Z';
    assert.equal(
        canCancelExam(booking, new Date('2026-11-05T10:00:00Z')),
        false,
    );
    booking.status = 'cancelled';
    assert.equal(
        canCancelExam(booking, new Date('2026-11-02T10:00:00Z')),
        false,
    );
});
