// Resa realistica, prima area: ingresso, percorso, smistamento. Ogni stanza ha i suoi oggetti
// scansionati in scena; foto in gioco/test/out/, né nere né bianche.
import assert from 'node:assert/strict';
import { fotografa } from './_foto.mjs';

export const pesante = true;

export default async function (page, aiuto) {
  await aiuto.attendi(() => !document.getElementById('avvio-entra').hidden, 40000);
  await aiuto.esegui(() => window.__gioco.gioca());
  for (const [stanza, k, vista] of [
    ['ingresso', 2, [2.6, 0.87, 2.8, 0.75, -0.05]],
    ['percorso', 1, [0, 0.87, -4.8, 0, 0]],
    ['smistamento', 3, [-6, 0.87, -27.5, -0.5, 0.02]],
  ]) {
    await aiuto.esegui((n) => window.__gioco.vaiA(n), stanza);
    await aiuto.attendi((q) => (window.__gioco.stanza(q[0]).stato().modelli || 0) >= q[1], 30000, [stanza, k]);
    const lum = await fotografa(page, aiuto, stanza, vista);
    assert.ok(lum > 0.12 && lum < 0.85, `${stanza}: luminanza ${lum.toFixed(2)}`);
  }
}
