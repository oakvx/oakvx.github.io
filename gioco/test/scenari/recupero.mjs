// Chi cade nel vuoto torna al punto di ripresa della stanza in cui era, non all'inizio del gioco.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  await aiuto.esegui(() => { window.__gioco.gioca(); window.__gioco.vaiA('ingresso'); });
  await aiuto.aspetta(200);
  const prima = await aiuto.leggi();
  assert.equal(prima.puntoControllo, 'ingresso');
  await aiuto.esegui(() => window.__gioco.vai(1.5, -30, 1.5));
  await aiuto.aspetta(700);
  const dopo = await aiuto.leggi();
  assert.equal(dopo.stanza, 'ingresso');
  assert.ok(Math.abs(dopo.y - prima.pc.y) < 1, `y ${dopo.y} vs ${prima.pc.y}`);
}
