// Prima prova delle finestre: una sul pannello dell'ingresso, una oltre il vetro, nel corridoio.
import assert from 'node:assert/strict';
import fs from 'node:fs';

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  await G(() => { window.__gioco.gioca(); window.__gioco.evento('gesto'); window.__gioco.vai(1, 0.87, -3); });
  await aiuto.aspetta(100);
  await G(() => window.__gioco.mira(-4, 1.3, -1)); await aiuto.aspetta(100); await G(() => window.__gioco.spara(0));
  await G(() => window.__gioco.mira(-1.5, 1.3, -7)); await aiuto.aspetta(100); await G(() => window.__gioco.spara(1));
  assert.deepEqual((await aiuto.leggi()).portali, ['ingresso-o', 'percorso-o']);
  fs.mkdirSync('gioco/test/out', { recursive: true });
  await page.screenshot({ path: 'gioco/test/out/ingresso-finestre.png' });
  await G(() => { window.__gioco.vai(-2.6, 0.87, -1); window.__gioco.guarda(Math.PI / 2); window.__gioco.tasto('KeyW', true); });
  await aiuto.attendi(() => window.__gioco.leggi().stanza === 'percorso', 4000);
  await G(() => window.__gioco.tasto('KeyW', false));
  await aiuto.aspetta(600);
  await page.screenshot({ path: 'gioco/test/out/percorso.png' });
}
