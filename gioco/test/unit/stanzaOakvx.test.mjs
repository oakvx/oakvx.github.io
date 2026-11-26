import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizza } from '../../js/logica/stanzaOakvx.js';
test('voci valide e scartate', () => {
  const r = normalizza({
    brani: [{ titolo: 'Notte', file: 'musica/notte.mp3' }, { titolo: 'Senza file' }, { titolo: 'x', file: '../segreti.mp3' }],
    poster: [{ file: 'poster/a.jpg', didascalia: { it: 'Ciao', en: 'Hi' } }],
    mensola: [{ forma: 'console-casa', etichetta: 'Wii U' }, { forma: 'astronave', etichetta: '?' }],
    note: ['benvenuto'],
  }, 'en');
  assert.deepEqual(r.brani.map((b) => b.titolo), ['Notte']);
  assert.equal(r.poster[0].didascalia, 'Hi');
  assert.equal(r.mensola.length, 1);
  assert.equal(r.avvisi.length, 3);
});
test('JSON rotto', () => {
  const r = normalizza('non sono json', 'it');
  assert.deepEqual([r.brani, r.poster, r.mensola, r.note], [[], [], [], []]);
  assert.equal(r.avvisi.length, 1);
});
test('percorsi assoluti scartati, lingue tenute', () => {
  const r = normalizza({ poster: [{ file: '/etc/passwd', didascalia: 'x' }], lingue: [{ lingua: 'Italiano', livello: { it: 'madrelingua', en: 'native' } }] }, 'it');
  assert.equal(r.poster.length, 0);
  assert.deepEqual(r.lingue, [{ lingua: 'Italiano', livello: 'madrelingua' }]);
});
