import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    getWorkshopSelection,
    grammarPacks,
    practiceWorkshops,
    workshopLevels,
    workshopVolume,
} from '../../resources/js/data/workshop-catalog.ts';

test('selecting a grammar pack preserves its own level independently of the practice filter', () => {
    const selection = getWorkshopSelection('grammar-a2', 'b2', 'group');
    assert.equal(selection.category, 'grammar');
    assert.equal(selection.level, 'a2');
    assert.equal(selection.title, 'Grammaire A2');
    assert.equal(selection.volume, '5 × 90 min · 7,5 h');
    assert.equal(selection.price, 150);
});

test('each grammar program has one session per announced topic', () => {
    assert.deepEqual(
        grammarPacks.map((pack) => pack.level),
        workshopLevels,
    );
    for (const pack of grammarPacks) {
        assert.equal(pack.program.length, pack.sessions);
        assert.ok(pack.program.every((item) => item.title && item.description));
        assert.ok(pack.price.solo > pack.price.group);
    }
});

test('practice selections use the chosen level, format and one-session duration', () => {
    for (const workshop of practiceWorkshops) {
        for (const level of workshopLevels) {
            const selection = getWorkshopSelection(workshop.id, level, 'solo');
            assert.equal(selection.category, 'practice');
            assert.equal(selection.level, level);
            assert.equal(selection.outcome, workshop.levels[level].outcome);
            assert.equal(selection.price, workshop.price.solo);
            assert.match(selection.volume, /une séance/);
            assert.equal(workshop.levels[level].activities.length, 3);
        }
        assert.notEqual(workshop.levels.a1.task, workshop.levels.b2.task);
    }
    assert.equal(
        getWorkshopSelection('wortschatz', 'b1', 'group').volume,
        '60 min · une séance',
    );
});

test('individual and group selections resolve their respective price', () => {
    for (const id of [...grammarPacks, ...practiceWorkshops].map(
        (offer) => offer.id,
    )) {
        const solo = getWorkshopSelection(id, 'a1', 'solo');
        const group = getWorkshopSelection(id, 'a1', 'group');
        assert.ok(solo.price > group.price);
    }
});

test('unknown selections do not prefill a contact request', () => {
    assert.equal(
        getWorkshopSelection('holiday-stage', 'a1', 'group'),
        undefined,
    );
    assert.equal(getWorkshopSelection('', 'a1', 'group'), undefined);
    assert.equal(workshopVolume(4, 90), '4 × 90 min · 6 h');
});
