// Se i file dei suoni non ci sono, il gioco va avanti con i suoni generati, senza errori.
import assert from 'node:assert/strict';

export async function prepara(page) {
  await page.route('**/gioco/suoni/**', (r) => r.fulfill({ status: 404, body: '' }));
}

export default async function (page, aiuto) {
  await aiuto.esegui(() => { window.__gioco.avviaAudio(); window.__gioco.gioca(); });
  await aiuto.aspetta(1500);
  assert.equal(await aiuto.esegui(() => window.__gioco.suoni().caricati), 0);
  await aiuto.esegui(() => { window.__gioco.vai(0, 0.87, 1); window.__gioco.tasto('KeyW', true); });
  await aiuto.aspetta(800);
  await aiuto.esegui(() => window.__gioco.tasto('KeyW', false));
}
