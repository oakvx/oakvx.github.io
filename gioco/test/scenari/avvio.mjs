// Il gioco si carica, parte dalla schermata d'avvio e il giocatore si muove dentro una stanza.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  assert.equal((await aiuto.leggi()).stato, 'avvio');
  await aiuto.esegui(() => window.__gioco.gioca());
  await aiuto.esegui(() => window.__gioco.tasto('KeyW', true));
  await aiuto.aspetta(500);
  await aiuto.esegui(() => window.__gioco.tasto('KeyW', false));
  const s = await aiuto.leggi();
  assert.equal(s.stato, 'gioco');
  assert.equal(typeof s.stanza, 'string');
  assert.ok(s.stanza.length > 0);
}
