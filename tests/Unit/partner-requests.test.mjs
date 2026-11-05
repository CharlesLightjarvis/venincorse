import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    emptyPartnerProfile,
    isPartnerStepComplete,
    readPartnerRequests,
    savePartnerRequests,
    submitPartnerRequest,
    subscribeToPartnerRequests,
} from '../../resources/js/data/partner-requests.ts';

function profile(changes = {}) {
    return {
        name: ' Camille Martin ',
        email: ' camille@example.test ',
        country: ' France ',
        role: 'Enseignant indépendant',
        experience: '1 à 3 ans',
        students: '1 à 5 élèves',
        levels: ['A1', 'A2'],
        format: 'Cours individuels',
        needs: ['Ressources pédagogiques'],
        project:
            ' Accompagner mes élèves avec des ressources adaptées à leur niveau. ',
        timeline: 'Dans 1 à 3 mois',
        consent: true,
        ...changes,
    };
}

test('each step rejects missing information and the final step rechecks the complete request', () => {
    assert.equal(isPartnerStepComplete(emptyPartnerProfile, 0), false);
    for (const [step, changes] of [
        [0, { name: ' ' }],
        [0, { email: 'invalid' }],
        [0, { country: '' }],
        [0, { role: '' }],
        [0, { experience: '' }],
        [1, { students: '' }],
        [1, { levels: [] }],
        [1, { format: '' }],
        [2, { needs: [] }],
        [2, { project: 'Too short' }],
        [2, { timeline: '' }],
        [3, { consent: false }],
        [3, { email: 'invalid' }],
    ]) {
        assert.equal(isPartnerStepComplete(profile(changes), step), false);
    }
    for (const step of [0, 1, 2, 3]) {
        assert.equal(isPartnerStepComplete(profile(), step), true);
    }
});

test('a mock submission is visible to the teacher, preserves older requests and supports follow-up', (context) => {
    context.mock.timers.enable({
        apis: ['Date'],
        now: new Date('2026-11-05T12:00:00Z'),
    });
    context.mock.method(crypto, 'getRandomValues', (values) => {
        values[0] = 123;
        return values;
    });
    const storage = new Map();
    const originalWindow = globalThis.window;
    const originalStorage = globalThis.localStorage;
    globalThis.window = new EventTarget();
    globalThis.localStorage = {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
    };
    try {
        savePartnerRequests([
            {
                ...profile(),
                id: 'previous',
                createdAt: '2026-11-01T12:00:00Z',
                status: 'pending',
                notes: '',
            },
        ]);
        let changes = 0;
        const unsubscribe = subscribeToPartnerRequests(() => changes++);

        const request = submitPartnerRequest(profile());

        assert.match(request.id, /^partner-[a-z0-9]+-3f$/);
        assert.equal(request.createdAt, '2026-11-05T12:00:00.000Z');
        assert.equal(request.name, 'Camille Martin');
        assert.equal(request.email, 'camille@example.test');
        assert.equal(request.status, 'pending');
        assert.deepEqual(
            readPartnerRequests().map((item) => item.id),
            [request.id, 'previous'],
        );
        assert.equal(changes, 1);
        savePartnerRequests(
            readPartnerRequests().map((item) =>
                item.id === request.id
                    ? {
                          ...item,
                          status: 'reviewing',
                          notes: 'Préparer un échange',
                      }
                    : item,
            ),
        );
        assert.equal(readPartnerRequests()[0].notes, 'Préparer un échange');
        assert.equal(readPartnerRequests()[0].status, 'reviewing');
        assert.throws(
            () => submitPartnerRequest(profile({ consent: false })),
            /Incomplete partner request/,
        );
        assert.equal(readPartnerRequests().length, 2);
        unsubscribe();
        savePartnerRequests([]);
        assert.equal(changes, 2);
    } finally {
        globalThis.window = originalWindow;
        globalThis.localStorage = originalStorage;
    }
});
