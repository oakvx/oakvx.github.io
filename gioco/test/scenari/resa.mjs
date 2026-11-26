// Resa realistica: tone mapping filmico, ombre (1024 in qualità bassa, 2048 in alta),
// materiali nuovi, panorama HDR come luce d'ambiente; l'ingresso non esce né nero né bianco.
import assert from 'node:assert/strict';
import fs from 'node:fs';

export default async function (page, aiuto) {
  await aiuto.attendi(() => !document.getElementById('avvio-entra').hidden, 30000);
  await aiuto.esegui(() => { window.__gioco.gioca(); window.__gioco.vaiA('ingresso'); });
  await aiuto.aspetta(800);
  let r = await aiuto.esegui(() => window.__gioco.resa());
  assert.ok(['ACESFilmic', 'AgX'].includes(r.toneMapping), JSON.stringify(r));
  assert.equal(r.ombre, true);
  assert.equal(r.mappaOmbra, 1024);
  assert.equal(r.ambiente, 'interno-neutro');
  const chiavi = await aiuto.esegui(() => window.__gioco.materiali());
  for (const k of ['piastrellePiscina', 'mattoni', 'tufo', 'lamiera', 'parquet']) assert.ok(chiavi.includes(k), 'manca ' + k);
  const qualita = (v) => aiuto.esegui((x) => { const e = document.getElementById('imp-qual'); e.value = x; e.dispatchEvent(new Event('change')); }, v);
  await qualita('1');
  r = await aiuto.esegui(() => window.__gioco.resa());
  assert.equal(r.mappaOmbra, 2048);
  await qualita('0.5');
  fs.mkdirSync('gioco/test/out', { recursive: true });
  await aiuto.esegui(() => { window.__gioco.vai(2.5, 0.87, 2.5); window.__gioco.guarda(0.6, -0.1); });
  await aiuto.aspetta(1200);
  await page.screenshot({ path: 'gioco/test/out/resa-ingresso.png' });
}
