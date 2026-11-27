import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

const { carte: C } = await carica('assets/magazzino/carte.js');

test('mazzo siciliano: 40 carte uniche, 10 per seme, valori 1–10', () => {
    const m = C.mazzoSiciliano();
    assert.equal(m.length, 40);
    assert.equal(new Set(m.map(c => c.id)).size, 40);
    for (const seme of ['denari', 'coppe', 'spade', 'bastoni']) {
        const v = m.filter(c => c.seme === seme).map(c => c.valore).sort((a, b) => a - b);
        assert.deepEqual([...v], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }
});

test('mazzo francese: 52 carte, e due mazzi con quattro jolly fanno 108', () => {
    assert.equal(C.mazzoFrancese().length, 52);
    const m = C.mazzoFrancese({ mazzi: 2, jolly: 4 });
    assert.equal(m.length, 108);
    assert.equal(new Set(m.map(c => c.id)).size, 108);
    assert.equal(m.filter(c => c.seme === 'jolly').length, 4);
    assert.ok(m.filter(c => c.seme === 'jolly').every(c => c.valore === 0));
});

test('generatore: stesso seme stessa sequenza, valori in [0,1)', () => {
    const a = C.generatore(42), b = C.generatore(42), c = C.generatore(43);
    const sa = Array.from({ length: 5 }, a), sb = Array.from({ length: 5 }, b), sc = Array.from({ length: 5 }, c);
    assert.deepEqual(sa, sb);
    assert.notDeepEqual(sa, sc);
    assert.ok(sa.every(x => x >= 0 && x < 1));
});

test('mischia: riproducibile col seme, non tocca l’originale, stesse carte', () => {
    const m = C.mazzoSiciliano(), copia = m.map(c => c.id);
    const x = C.mischia(m, C.generatore(7)), y = C.mischia(m, C.generatore(7)), z = C.mischia(m, C.generatore(8));
    assert.deepEqual(m.map(c => c.id), copia);
    assert.deepEqual(x.map(c => c.id), y.map(c => c.id));
    assert.notDeepEqual(x.map(c => c.id), z.map(c => c.id));
    assert.deepEqual([...x.map(c => c.id)].sort(), [...copia].sort());
});
