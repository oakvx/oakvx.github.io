// Un brano che non si trova: il jukebox passa alla melodia generata, senza errori.
import assert from 'node:assert/strict';

export async function prepara(page) {
  await page.route('**/gioco/dati/stanza-oakvx.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ brani: [{ titolo: 'Manca', file: 'musica/manca.mp3' }] }) }));
}

export default async function (page, aiuto) {
  await aiuto.esegui(() => { window.__gioco.avviaAudio(); window.__gioco.gioca(); window.__gioco.vaiA('oakvx'); });
  await aiuto.attendi(() => window.__gioco.stanza('oakvx').stato().caricata === true, 4000);
  await aiuto.esegui(() => window.__gioco.evento('oggetto:jukebox'));
  await aiuto.attendi(() => window.__gioco.stanza('oakvx').stato().melodia === true, 5000);
  assert.equal(await aiuto.esegui(() => window.__gioco.stanza('oakvx').stato().suona), true);
}
