import test from 'node:test';
import assert from 'node:assert/strict';
import { creaGiro, creaAiuti, PROGETTI } from '../../js/logica/giro.js';

test('uscita aperta solo con le 5 lampade', () => {
  const g = creaGiro();
  PROGETTI.slice(0, 4).forEach((p) => g.completa(p));
  assert.equal(g.lampade(), 4);
  assert.equal(g.uscitaAperta(), false);
  assert.equal(g.completa('beautify'), true);
  assert.equal(g.completa('beautify'), false);
  assert.equal(g.uscitaAperta(), true);
});
test('id sconosciuti ignorati', () => {
  const g = creaGiro();
  assert.equal(g.completa('autoofficina'), false);
  assert.equal(g.segreto('boh'), false);
  assert.deepEqual(g.segreti(), []);
});
test('segreti contati una volta', () => {
  const g = creaGiro();
  assert.equal(g.segreto('mii'), true);
  assert.equal(g.segreto('mii'), false);
  assert.deepEqual(g.stato(), { completati: [], segreti: ['mii'] });
});
test('aiuti a 45 e 90 secondi, fermi in pausa', () => {
  const a = creaAiuti();
  assert.equal(a.aggiorna(44, true), null);
  assert.equal(a.aggiorna(100, false), null);
  assert.equal(a.aggiorna(2, true), 'indizio');
  assert.equal(a.aggiorna(1, true), null);
  a.progresso();
  assert.equal(a.aggiorna(89, true), null);
  assert.equal(a.aggiorna(2, true), 'soluzione');
  a.risolto();
  assert.equal(a.aggiorna(500, true), null);
});
