import test from 'node:test';
import assert from 'node:assert/strict';
import { curvaTransizione, accordo, ALE } from '../../js/logica/armonia.js';
test('curva di transizione', () => {
  assert.deepEqual(curvaTransizione(0, false), { detune: 0, taglio: 18000, spinta: 0 });
  assert.deepEqual(curvaTransizione(0.35, false), { detune: -350, taglio: 700, spinta: 0.6 });
  assert.deepEqual(curvaTransizione(0.35, true), { detune: 0, taglio: 3500, spinta: 0.3 });
  assert.deepEqual(curvaTransizione(1.2, false), { detune: 0, taglio: 18000, spinta: 0 });
});
test('la curva scende e risale senza salti', () => {
  let prima = curvaTransizione(0, false).taglio;
  for (let t = 0.05; t <= 0.35; t += 0.05) { const c = curvaTransizione(t, false).taglio; assert.ok(c <= prima); prima = c; }
  for (let t = 0.4; t <= 1.2; t += 0.05) { const c = curvaTransizione(t, false).taglio; assert.ok(c >= prima - 1e-9); prima = c; }
});
test('accordi per ogni ala', () => {
  for (const a of ALE) {
    assert.equal(accordo(a, 0).length, 4);
    assert.deepEqual(accordo(a, 8), accordo(a, 0));
  }
  assert.notDeepEqual(accordo('transito', 0), accordo('oakvx', 0));
});
