// Se gli asset non arrivano (404) il gioco parte lo stesso: niente errori, solo avvisi.
import assert from 'node:assert/strict';

export async function prepara(page) {
  await page.route('**/gioco/asset/**', (r) => (r.request().url().endsWith('elenco.json') ? r.continue() : r.fulfill({ status: 404, body: '' })));
}

export default async function (page, aiuto) {
  await aiuto.attendi(() => !document.getElementById('avvio-entra').hidden, 20000);
  assert.equal((await aiuto.leggi()).stato, 'avvio');
  const p = await aiuto.esegui(() => window.__gioco.asset());
  assert.ok(p.totali > 0 && p.fatti === p.totali, JSON.stringify(p));
}
