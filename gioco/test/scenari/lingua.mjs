// Cambiando lingua a metà partita i cartelli si ridisegnano nella nuova lingua.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  await aiuto.esegui(() => window.__gioco.gioca());
  assert.equal(await aiuto.esegui(() => window.__gioco.stanza('ingresso').stato().cartello), 'Ingresso · turno di notte');
  await page.click('#lingua');
  await aiuto.attendi(() => window.__gioco.stanza('ingresso').stato().cartello === 'Entrance · night shift', 2000);
  assert.equal(await aiuto.esegui(() => window.__gioco.stanza('percorso').stato().cartello), 'Journey');
}
