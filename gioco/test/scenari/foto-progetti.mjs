// Resa realistica, stanze dei progetti: ognuna con i suoi oggetti scansionati; foto in gioco/test/out/.
import assert from 'node:assert/strict';
import { fotografa } from './_foto.mjs';

export const pesante = true;

export default async function (page, aiuto) {
  await aiuto.attendi(() => !document.getElementById('avvio-entra').hidden, 40000);
  await aiuto.esegui(() => window.__gioco.gioca());
  for (const [stanza, k, vista] of [
    ['yag', 2, [-90, 0.87, -1.5, 0.2, 0]],
    ['piko', 2, [-90, 0.87, -41.5, 0.25, -0.1]],
    ['brat', 1, [-125, 0.87, 8.5, 0, 0.1]],
    ['synk', 2, [-127.5, 0.87, -41.5, 0, -0.15]],
    ['beautify', 2, [-170, 0.87, -11.5, 0.3, -0.05]],
  ]) {
    await aiuto.esegui((n) => window.__gioco.vaiA(n), stanza);
    await aiuto.attendi((q) => (window.__gioco.stanza(q[0]).stato().modelli || 0) >= q[1], 30000, [stanza, k]);
    const lum = await fotografa(page, aiuto, stanza, vista);
    assert.ok(lum > 0.12 && lum < 0.85, `${stanza}: luminanza ${lum.toFixed(2)}`);
  }
}
