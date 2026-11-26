// Scrivania: ci si siede al terminale, si scrive davvero; "apri" apre la porta, il comando
// nascosto vale un segreto, Esc chiude il terminale senza mettere in pausa.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  const S = () => G(() => window.__gioco.stanza('scrivania').stato());
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('scrivania'); window.__gioco.vai(206, 0.87, 6.3); });
  await G(() => window.__gioco.evento('oggetto:terminale'));
  assert.equal((await S()).terminale, true);
  await page.keyboard.type('skills');
  await page.keyboard.press('Enter');
  assert.match((await S()).righe.join('\n'), /Web/);
  await page.keyboard.type('sudo make me a sandwich');
  await page.keyboard.press('Enter');
  assert.ok((await aiuto.leggi()).segreti.includes('comando'));
  await page.keyboard.type('apri');
  await page.keyboard.press('Enter');
  assert.equal((await S()).aperta, true);
  // mentre si scrive, W non muove il giocatore
  const z0 = (await aiuto.leggi()).z;
  await page.keyboard.down('KeyW'); await aiuto.aspetta(400); await page.keyboard.up('KeyW');
  assert.ok(Math.abs((await aiuto.leggi()).z - z0) < 0.05);
  await page.keyboard.press('Escape');
  assert.equal((await S()).terminale, false);
  assert.equal((await aiuto.leggi()).stato, 'gioco');
  const u = await G(() => window.__gioco.stanza('scrivania').uscita);
  await G((p) => { window.__gioco.vai(p[0], 0.87, p[1] - 1.5); window.__gioco.guarda(Math.PI); window.__gioco.tasto('KeyW', true); }, u);
  await aiuto.attendi(() => window.__gioco.leggi().stanza === 'commit', 6000);
  await G(() => window.__gioco.tasto('KeyW', false));
}
