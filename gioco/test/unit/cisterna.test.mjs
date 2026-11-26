import test from 'node:test';
import assert from 'node:assert/strict';
import { LATO, cellaDi, ricentra, variazioni, posizioneSquarcio, verso } from '../../js/logica/cisterna.js';
test('celle e ricentraggio', () => {
  assert.deepEqual(cellaDi(1, 1), [0, 0]);
  assert.deepEqual(cellaDi(-0.1, LATO + 0.1), [-1, 1]);
  assert.deepEqual(ricentra(LATO + 2, 3), [-LATO, 0]);
  assert.deepEqual(ricentra(5, 5), [0, 0]);
  assert.deepEqual(ricentra(-1, -LATO - 1), [LATO, 2 * LATO]);
});
test('ricentraggio con origine', () => {
  assert.deepEqual(cellaDi(300 + LATO + 1, 1, [300, 0]), [1, 0]);
  assert.deepEqual(ricentra(300 + LATO + 1, 1, [300, 0]), [-LATO, 0]);
});
test('variazioni deterministiche', () => {
  assert.deepEqual(variazioni(3, -2, 42), variazioni(3, -2, 42));
  const tutte = new Set(Array.from({ length: 50 }, (_, i) => variazioni(i, i * 3, 7).lampada));
  assert.ok(tutte.size >= 2);
  for (let i = 0; i < 30; i++) { const a = variazioni(i, -i, 1).acqua; assert.ok(a >= 0.3 && a <= 0.7); }
});
test('squarcio tra 5 e 7 celle', () => {
  for (let s = 1; s < 60; s++) {
    const [cx, cz] = posizioneSquarcio(s);
    const d = Math.max(Math.abs(cx), Math.abs(cz));
    assert.ok(d >= 5 && d <= 7, `${s}: ${cx},${cz}`);
  }
  const [x, z] = verso(0, 0, [6, 0]);
  assert.ok(Math.abs(x - 1) < 1e-9 && Math.abs(z) < 1e-9);
  assert.deepEqual(verso(2, 3, [2, 3]), [0, 0]);
});
