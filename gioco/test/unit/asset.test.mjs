import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const base = new URL('../../asset/', import.meta.url);
const elenco = JSON.parse(fs.readFileSync(new URL('elenco.json', base)));
const peso = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? peso(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
test('tutti CC0 e tutti i file esistono', () => {
  for (const tipo of ['texture', 'hdr', 'modelli']) for (const [id, a] of Object.entries(elenco[tipo])) {
    assert.equal(a.licenza, 'CC0', id);
    const file = tipo === 'texture' ? Object.values(a.file) : [a.file];
    for (const f of file) assert.ok(fs.existsSync(new URL(f, base)), `${id}: manca ${f}`);
  }
});
test('insieme minimo di texture e panorami', () => {
  for (const id of ['cemento', 'intonaco', 'piastrelle', 'piastrelle-piscina', 'metallo', 'lamiera', 'legno-scuro', 'parquet', 'moquette', 'mattoni', 'tufo']) assert.ok(elenco.texture[id], id);
  for (const id of ['interno-neutro', 'interno-caldo', 'notte']) assert.ok(elenco.hdr[id], id);
});
test('peso totale entro 60 MB', () => {
  const tot = peso(new URL('.', base).pathname) + peso(new URL('../suoni/', base).pathname);
  assert.ok(tot <= 60 * 1024 * 1024, (tot / 1048576).toFixed(1) + ' MB');
});
