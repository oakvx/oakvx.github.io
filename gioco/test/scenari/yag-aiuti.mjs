// YAG: dopo 90 secondi fermi nella stanza compare la soluzione.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  await aiuto.esegui(() => { window.__gioco.gioca(); window.__gioco.vaiA('yag'); });
  await aiuto.attendi(() => window.__gioco.leggi().stanza === 'yag');
  assert.equal(await aiuto.esegui(() => window.__gioco.stanza('yag').stato().soluzione), false);
  await aiuto.esegui(() => window.__gioco.avanzaAiuti(46));
  await aiuto.esegui(() => window.__gioco.avanzaAiuti(46));
  assert.equal(await aiuto.esegui(() => window.__gioco.stanza('yag').stato().soluzione), true);
}
