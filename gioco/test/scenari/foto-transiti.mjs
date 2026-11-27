// Resa realistica: piscina, middleman, supermercato. Ogni stanza con i suoi oggetti scansionati; foto in gioco/test/out/.
import assert from 'node:assert/strict';
import { fotografa } from './_foto.mjs';

export const pesante = true;

export default async function (page, aiuto) {
  await aiuto.attendi(() => !document.getElementById('avvio-entra').hidden, 40000);
  await aiuto.esegui(() => window.__gioco.gioca());
  for (const [stanza, k, vista] of [
    ['piscina', 1, [44,0.87,19.2,-1.5708,0]],
    ['middleman', 1, [110,0.87,2,3.14159,-0.05]],
    ['supermercato', 2, [452,0.87,2,3.14159,0]],
  ]) {
    await aiuto.esegui((n) => window.__gioco.vaiA(n), stanza);
    await aiuto.attendi((q) => (window.__gioco.stanza(q[0]).stato().modelli || 0) >= q[1], 60000, [stanza, k]);
    const lum = await fotografa(page, aiuto, stanza, vista);
    assert.ok(lum > 0.12 && lum < 0.85, `${stanza}: luminanza ${lum.toFixed(2)}`);
  }
}
