// Piko: il piano 1 finisce nel pozzo, il 2 apre la porta e accende la lampada; chi cade nel pozzo torna al punto di ripresa.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('piko'); });
  await aiuto.attendi(() => window.__gioco.leggi().stanza === 'piko');
  await G(() => window.__gioco.evento('oggetto:piko-approva'));
  await aiuto.attendi(() => window.__gioco.stanza('piko').stato().ultimo === 'pozzo', 16000);
  assert.equal((await aiuto.leggi()).lampade, 0);
  await G(() => window.__gioco.evento('oggetto:piko-rifiuta'));
  assert.equal(await G(() => window.__gioco.stanza('piko').stato().piano), 1);
  await G(() => window.__gioco.evento('oggetto:piko-approva'));
  await aiuto.attendi(() => window.__gioco.leggi().lampade === 1, 16000);
  // il pozzo
  const c = await G(() => window.__gioco.stanza('piko').pozzo);
  await G((p) => window.__gioco.vai(p[0], 0.87, p[1]), c);
  await aiuto.attendi(() => window.__gioco.leggi().y < -1, 3000);
  await aiuto.attendi(() => Math.abs(window.__gioco.leggi().y - window.__gioco.leggi().pc.y) < 1, 6000);
  assert.equal((await aiuto.leggi()).puntoControllo, 'piko');
}
