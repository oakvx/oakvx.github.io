// Muro dei commit: senza rete verso GitHub mostra il ripiego "2.500+" e il gioco va avanti.
import assert from 'node:assert/strict';

export async function prepara(page) {
  await page.route('https://api.github.com/**', (r) => r.abort());
}

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('commit'); });
  await aiuto.attendi(() => window.__gioco.stanza('commit').stato().testo === '2.500+', 5000);
  assert.ok((await G(() => window.__gioco.stanza('commit').stato().accesi)) > 20);
  // la parete si guarda verso +z: la prima colonna del numero deve stare a sinistra, cioè a x maggiore
  const [x0, x1] = await G(() => [window.__gioco.stanza('commit').xColonna(0), window.__gioco.stanza('commit').xColonna(1)]);
  assert.ok(x0 > x1, `colonne allo specchio: ${x0} ${x1}`);
  const u = await G(() => window.__gioco.stanza('commit').uscita);
  await G((p) => { window.__gioco.vai(p[0] - 1.5, 0.87, p[1]); window.__gioco.guarda(-Math.PI / 2); window.__gioco.tasto('KeyW', true); }, u);
  await aiuto.attendi(() => window.__gioco.leggi().stanza === 'supermercato', 6000);
  await G(() => window.__gioco.tasto('KeyW', false));
}
