import test from 'node:test';
import assert from 'node:assert/strict';
import { totaleCommit, cifre } from '../../js/logica/commit.js';
const memoria = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };
test('somma e cache', async () => {
  let chiamate = 0;
  const fetch = async (url) => { chiamate++; return { ok: true, json: async () => ({ total_count: url.includes('oakvxish') ? 12 : 2500 }) }; };
  const storage = memoria();
  assert.deepEqual(await totaleCommit({ fetch, storage, ora: 0 }), { totale: 2512, testo: '2.512' });
  await totaleCommit({ fetch, storage, ora: 30 * 60 * 1000 });
  assert.equal(chiamate, 2);
  await totaleCommit({ fetch, storage, ora: 61 * 60 * 1000 });
  assert.equal(chiamate, 4);
});
test('ripiego offline e 403', async () => {
  const giu = async () => { throw new Error('offline'); };
  assert.deepEqual(await totaleCommit({ fetch: giu, storage: memoria() }), { totale: null, testo: '2.500+' });
  const vietato = async () => ({ ok: false, status: 403, json: async () => ({}) });
  assert.deepEqual(await totaleCommit({ fetch: vietato, storage: memoria() }), { totale: null, testo: '2.500+' });
});
test('cifre', () => {
  assert.equal(cifre('2.5').length, 7);
  assert.equal(cifre('2.500+')[0].length, cifre('2.500+')[6].length);
});
