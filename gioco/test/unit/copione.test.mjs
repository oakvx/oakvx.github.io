import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const narr = JSON.parse(fs.readFileSync(new URL('../../dati/narratore.json', import.meta.url)));
const cont = JSON.parse(fs.readFileSync(new URL('../../contenuti.json', import.meta.url)));
const id = (v) => (typeof v === 'string' ? v : v.id);

test('ogni battuta citata dagli eventi esiste in IT ed EN', () => {
  for (const [ev, voci] of Object.entries(narr.eventi)) {
    for (const v of voci) {
      const r = narr.righe[id(v)];
      assert.ok(r, `${ev}: manca ${id(v)}`);
      assert.ok(r.it && r.en, `${id(v)}: manca una lingua`);
    }
  }
});
test('nessuna battuta inutilizzata', () => {
  const usate = new Set(Object.values(narr.eventi).flat().map(id));
  assert.deepEqual(Object.keys(narr.righe).filter((k) => !usate.has(k)), []);
});
test('il nome è oakvx, mai "Gabri"', () => {
  for (const testo of [JSON.stringify(narr), JSON.stringify(cont)]) assert.doesNotMatch(testo, /\bGabri\b/);
});
test('stesse chiavi di testo in IT ed EN', () => {
  const chiavi = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? chiavi(v, p + k + '.') : [p + k]));
  assert.deepEqual(chiavi(cont.it).sort(), chiavi(cont.en).sort());
});
