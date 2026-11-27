// Resa della cisterna infinita: una cella qualunque (archi a perdita d'occhio) e lo squarcio visto
// dalla cella accanto e da vicino. Foto in gioco/test/out/.
import assert from 'node:assert/strict';
import { fotografa } from './_foto.mjs';

export const pesante = true;
export const query = '&seme=7';

export default async function (page, aiuto) {
  await aiuto.attendi(() => !document.getElementById('avvio-entra').hidden, 40000);
  await aiuto.esegui(() => { window.__gioco.gioca(); window.__gioco.vaiA('cisterna'); });
  await aiuto.aspetta(500);
  const s = await aiuto.esegui(() => window.__gioco.stanza('cisterna').stato());
  // da una cella qualunque: lungo una fila di campate
  await aiuto.esegui(() => window.__gioco.stanza('cisterna').vaiCella(2, 1));
  let lum = await fotografa(page, aiuto, 'cisterna', [300.5, 0.87, 6, -Math.PI / 2, 0.05]);
  assert.ok(lum > 0.06 && lum < 0.85, `cisterna: luminanza ${lum.toFixed(2)}`);
  // lo squarcio da una cella più in là (pieno, non attraversabile) e da vicino (si vede la galleria)
  const [sx, sz] = s.squarcio;
  await aiuto.esegui((q) => window.__gioco.stanza('cisterna').vaiCella(q[0], q[1] - 1), [sx, sz]);
  lum = await fotografa(page, aiuto, 'cisterna-squarcio-lontano', [312, 0.87, 9, Math.PI, 0.25]);
  assert.ok(lum > 0.06 && lum < 0.85, `squarcio lontano: luminanza ${lum.toFixed(2)}`);
  await aiuto.esegui(() => window.__gioco.stanza('cisterna').risolvi());
  lum = await fotografa(page, aiuto, 'cisterna-squarcio', [312, 3.9, 11.2, Math.PI, 0]);
  assert.ok(lum > 0.06 && lum < 0.85, `squarcio: luminanza ${lum.toFixed(2)}`);
}
