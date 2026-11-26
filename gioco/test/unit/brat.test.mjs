import test from 'node:test';
import assert from 'node:assert/strict';
import { parolaAttiva, creaTimeline } from '../../js/logica/brat.js';
const testo = [{ parola: 'testi', da: 0, a: 1 }, { parola: 'che', da: 1, a: 2 }, { parola: 'sono', da: 2.5, a: 3 }];
test('parola attiva e ciclo', () => {
  assert.equal(parolaAttiva(0.5, testo), 0);
  assert.equal(parolaAttiva(2.2, testo), -1);
  assert.equal(parolaAttiva(3.5, testo), 0);
});
test('timeline ferma e riavvolge', () => {
  const t = creaTimeline();
  assert.equal(t.tempo(5), 5);
  t.ferma();
  assert.equal(t.tempo(9), 5);
  t.riavvolgi(7);
  assert.equal(t.tempo(9), 0);
  t.riparti();
  assert.equal(t.tempo(10), 1);
});
