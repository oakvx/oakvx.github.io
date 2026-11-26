// Con stanza-oakvx.json rotto la stanza si costruisce lo stesso: solo avvisi, nessun errore.
import assert from 'node:assert/strict';

export async function prepara(page) {
  await page.route('**/gioco/dati/stanza-oakvx.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{rotto' }));
  page.on('console', (m) => { if (m.type() === 'warning') page.__avvisi = (page.__avvisi || 0) + 1; });
}

export default async function (page, aiuto) {
  await aiuto.esegui(() => { window.__gioco.gioca(); window.__gioco.vaiA('oakvx'); });
  await aiuto.attendi(() => window.__gioco.stanza('oakvx').stato().caricata === true, 4000);
  const s = await aiuto.esegui(() => window.__gioco.stanza('oakvx').stato());
  assert.equal(s.mensola, 0);
  assert.ok(page.__avvisi >= 1);
}
