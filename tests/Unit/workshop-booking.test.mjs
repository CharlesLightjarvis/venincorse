import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    canCancelWorkshop,
    getWorkshopCohorts,
    remainingWorkshopSeats,
    workshopScheduleSummary,
} from '../../resources/js/data/workshop-booking.ts';
import {
    getWorkshopOffer,
    grammarPacks,
} from '../../resources/js/data/workshop-catalog.ts';

const now = new Date('2026-11-05T12:00:00.000Z');

function offer(id) {
    return getWorkshopOffer(id);
}

function enrollment(overrides = {}) {
    const cohort = getWorkshopCohorts(offer('grammar-a1'), 'group', { now })[0];
    return {
        id: 'workshop-test',
        offerId: 'grammar-a1',
        category: 'grammar',
        title: 'Grammaire A1',
        level: 'a1',
        tier: 'group',
        cohort,
        name: 'Camille',
        email: 'camille@example.test',
        goal: 'Réviser les bases',
        timezone: 'Europe/Paris',
        installments: false,
        totalCents: 12000,
        paymentsCents: [12000],
        createdAt: now.toISOString(),
        status: 'confirmed',
        notes: '',
        ...overrides,
    };
}

test('a grammar pack proposes three starts and one weekly session per topic', () => {
    const pack = grammarPacks.find((item) => item.id === 'grammar-a2');
    const cohorts = getWorkshopCohorts(offer('grammar-a2'), 'group', { now });

    assert.equal(cohorts.length, 3);
    for (const cohort of cohorts) {
        assert.equal(cohort.sessions.length, pack.sessions);
        assert.ok(cohort.sessions.every((session) => session.hours === 1.5));
        for (let index = 1; index < cohort.sessions.length; index += 1) {
            const previous = new Date(
                cohort.sessions[index - 1].startsAt,
            ).getTime();
            const current = new Date(cohort.sessions[index].startsAt).getTime();
            assert.equal(current - previous, 7 * 86400000);
        }
    }

    assert.equal(new Set(cohorts.map((cohort) => cohort.startsAt)).size, 3);
    assert.ok(
        cohorts.every((cohort) => new Date(cohort.startsAt).getUTCDay() === 1),
    );
});

test('a practice workshop proposes one session at three different moments', () => {
    const cohorts = getWorkshopCohorts(offer('wortschatz'), 'group', { now });

    assert.equal(cohorts.length, 3);
    for (const cohort of cohorts) {
        assert.equal(cohort.sessions.length, 1);
        assert.equal(cohort.sessions[0].hours, 1);
    }
    assert.deepEqual(
        cohorts.map((cohort) => new Date(cohort.startsAt).getUTCDay()),
        [2, 4, 6],
    );
});

test('seat counts depend on confirmed bookings only', () => {
    const cohort = getWorkshopCohorts(offer('grammar-a1'), 'group', { now })[0];
    const first = enrollment({ cohort });
    const cancelled = enrollment({
        id: 'cancelled',
        cohort,
        status: 'cancelled',
    });

    assert.equal(remainingWorkshopSeats(cohort, []), 4);
    assert.equal(remainingWorkshopSeats(cohort, [first]), 3);
    assert.equal(remainingWorkshopSeats(cohort, [first, cancelled]), 3);
});

test('practice workshop seats are isolated per level', () => {
    const a1 = getWorkshopCohorts(offer('sprechen'), 'group', {
        level: 'a1',
        now,
    })[0];
    const b2 = getWorkshopCohorts(offer('sprechen'), 'group', {
        level: 'b2',
        now,
    })[0];
    const booking = enrollment({
        category: 'practice',
        offerId: 'sprechen',
        level: 'a1',
        cohort: a1,
    });

    assert.notEqual(a1.id, b2.id);
    assert.equal(remainingWorkshopSeats(a1, [booking]), 3);
    assert.equal(remainingWorkshopSeats(b2, [booking]), 4);
});

test('the cancellation deadline is longer for a multi-session pack', () => {
    const grammar = enrollment();
    const practice = enrollment({
        category: 'practice',
        offerId: 'sprechen',
        cohort: getWorkshopCohorts(offer('sprechen'), 'group', { now })[0],
    });

    assert.equal(
        canCancelWorkshop(
            enrollment({
                cohort: getWorkshopCohorts(offer('grammar-a1'), 'group', {
                    now,
                })[0],
            }),
            now,
        ),
        true,
    );

    const firstSession = new Date(grammar.cohort.sessions[0].startsAt);
    assert.equal(
        canCancelWorkshop(
            grammar,
            new Date(firstSession.getTime() - 8 * 86400000),
        ),
        true,
    );
    assert.equal(
        canCancelWorkshop(
            grammar,
            new Date(firstSession.getTime() - 3 * 86400000),
        ),
        false,
    );

    const practiceSession = new Date(practice.cohort.sessions[0].startsAt);
    assert.equal(
        canCancelWorkshop(
            practice,
            new Date(practiceSession.getTime() - 30 * 3600000),
        ),
        true,
    );
    assert.equal(
        canCancelWorkshop(
            practice,
            new Date(practiceSession.getTime() - 12 * 3600000),
        ),
        false,
    );

    assert.equal(canCancelWorkshop({ ...grammar, status: 'cancelled' }), false);
});

test('the schedule summary reflects the offer type', () => {
    const grammar = enrollment();
    const practice = enrollment({
        category: 'practice',
        cohort: getWorkshopCohorts(offer('sprechen'), 'group', { now })[0],
    });

    assert.equal(workshopScheduleSummary(grammar), '4 séances · 1 par semaine');
    assert.equal(workshopScheduleSummary(practice), '1 séance');
});

test('both offer types expose a detail page and their focus', () => {
    const grammar = getWorkshopOffer('grammar-b1');
    const practice = getWorkshopOffer('schreiben');

    assert.equal(grammar.category, 'grammar');
    assert.ok(grammar.pack.canDo.length >= 4);
    assert.ok(grammar.pack.focus.length >= 3);

    assert.equal(practice.category, 'practice');
    assert.ok(practice.workshop.focus.length >= 3);
    assert.equal(getWorkshopOffer('holiday-stage'), undefined);
});
