import test from 'node:test';
import assert from 'node:assert/strict';
import { esegui } from '../../js/logica/terminale.js';
const dati = { strumenti: [['Web', 'HTML, CSS, JavaScript']], percorso: ['2026 → UNIMORE'], contatti: ['gabrielelucia07@gmail.com'], log: ['bratAnimator'], principi: ['local-first'], chi: ['oakvx'] };
test('comandi', () => {
  assert.equal(esegui('  APRI ', { lingua: 'it', dati }).azione, 'apri');
  assert.match(esegui('skills', { lingua: 'en', dati }).righe.join('\n'), /Web/);
  assert.equal(esegui('clear', { lingua: 'it', dati }).azione, 'pulisci');
  assert.equal(esegui('sudo make me a sandwich', { lingua: 'it', dati }).azione, 'segreto');
  assert.match(esegui('rm -rf /', { lingua: 'it', dati }).righe[0], /non trovato: rm/);
  assert.match(esegui('rm -rf /', { lingua: 'en', dati }).righe[0], /not found: rm/);
});
test('riga vuota e git log', () => {
  assert.deepEqual(esegui('   ', { lingua: 'it', dati }), { righe: [], azione: null });
  assert.match(esegui('git log --oneline', { lingua: 'it', dati }).righe.join('\n'), /bratAnimator/);
  assert.equal(esegui('exit', { lingua: 'en', dati }).azione, 'esci');
});
