import test from 'node:test';
import assert from 'node:assert/strict';
import { instrada, creaLimitatore } from '../../js/logica/yag.js';
test('instradamento', () => {
  assert.equal(instrada({ autenticato: false, piedistallo: 'b' }), 'negato');
  assert.equal(instrada({ autenticato: true, piedistallo: null }), 'negato');
  assert.equal(instrada({ autenticato: true, piedistallo: 'a' }), 'backend1');
  assert.equal(instrada({ autenticato: true, piedistallo: 'b' }), 'backend2');
});
test('limitatore', () => {
  const l = creaLimitatore({ max: 3, finestra: 2 });
  assert.deepEqual([0, 0.5, 1, 1.5].map((t) => l.passa(t)), [true, true, true, false]);
  assert.equal(l.passa(2.1), true);
});
