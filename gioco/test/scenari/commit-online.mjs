// Muro dei commit con GitHub che risponde: la somma dei due account, col punto delle migliaia.
import assert from 'node:assert/strict';

export async function prepara(page) {
  await page.route('https://api.github.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ total_count: r.request().url().includes('oakvxish') ? 12 : 2500 }) }));
}

export default async function (page, aiuto) {
  await aiuto.esegui(() => { window.__gioco.gioca(); window.__gioco.vaiA('commit'); });
  await aiuto.attendi(() => window.__gioco.stanza('commit').stato().testo === '2.512', 5000);
  assert.equal(await aiuto.esegui(() => window.__gioco.stanza('piscina').cartello()), 'STANZA 1.848 DI 2.512');
}
