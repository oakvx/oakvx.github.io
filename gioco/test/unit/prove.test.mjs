import test from 'node:test';
import assert from 'node:assert/strict';
import { illuminato } from '../../js/logica/prove.js';
const l = { pos: [0, 1.6, 0], dir: [0, 0, -1], angolo: 0.35, portata: 10 };
test('cono della lampada', () => {
  assert.equal(illuminato([0, 1.6, -5], l), true);
  assert.equal(illuminato([0, 1.6, 5], l), false);
  assert.equal(illuminato([4, 1.6, -5], l), false);
  assert.equal(illuminato([0, 1.6, -12], l), false);
});
test('direzione non normalizzata', () => {
  assert.equal(illuminato([0, 1.6, -5], { ...l, dir: [0, 0, -3] }), true);
});
