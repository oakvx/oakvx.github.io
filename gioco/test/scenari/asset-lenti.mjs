// Con la rete lenta la barra d'avvio mostra il progresso vero fino a n/n.
import assert from 'node:assert/strict';

export async function prepara(page) {
  await page.route('**/gioco/asset/**', async (r) => { await new Promise((ok) => setTimeout(ok, 300)); await r.continue(); });
  await page.addInitScript(() => {
    window.__testiAvvio = [];
    new MutationObserver(() => {
      const t = document.getElementById('avvio-testo');
      if (t && window.__testiAvvio[window.__testiAvvio.length - 1] !== t.textContent) window.__testiAvvio.push(t.textContent);
    }).observe(document, { subtree: true, childList: true, characterData: true });
  });
}

export default async function (page, aiuto) {
  await aiuto.attendi(() => !document.getElementById('avvio-entra').hidden, 30000);
  const testi = await aiuto.esegui(() => window.__testiAvvio);
  const conProgresso = testi.filter((t) => /\d+\/\d+/.test(t));
  assert.ok(conProgresso.length >= 3, JSON.stringify(testi));
  const [, a, b] = conProgresso[conProgresso.length - 1].match(/(\d+)\/(\d+)/);
  assert.equal(a, b);
}
