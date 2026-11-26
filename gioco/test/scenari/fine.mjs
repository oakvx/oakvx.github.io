// Contatti e finale: entrando nella zona finale compare la schermata con tempo, segreti e
// quattro controlli (Scrivimi, Copia email, Torna al sito, Rigioca). Nessun altro link esterno.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  // dalla stanza di oakvx si arriva ai contatti dalla porta con la scaletta
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('oakvx'); });
  const p = await G(() => window.__gioco.stanza('oakvx').porta);
  await G((q) => { window.__gioco.vai(q[0] + 1.2, 0.87, q[1]); window.__gioco.guarda(Math.PI / 2); window.__gioco.tasto('KeyW', true); }, p);
  await aiuto.attendi(() => window.__gioco.leggi().stanza === 'contatti', 6000);
  await G(() => window.__gioco.tasto('KeyW', false));
  const f = await G(() => window.__gioco.stanza('contatti').finale);
  await G((q) => { window.__gioco.vai(q[0], 0.87, q[1] - 1.5); window.__gioco.guarda(Math.PI); window.__gioco.tasto('KeyW', true); }, f);
  await aiuto.attendi(() => window.__gioco.leggi().finito === true, 8000);
  // la schermata arriva quando il curatore ha finito di parlare: nel test lo si fa tacere
  await G(() => window.__gioco.salta());
  await aiuto.attendi(() => !document.getElementById('finale').hidden, 8000);
  await G(() => window.__gioco.tasto('KeyW', false));
  const testo = await page.locator('#finale').innerText();
  assert.match(testo, /\d\d:\d\d/);
  assert.match(testo, /\d\/3/);
  assert.equal(await page.locator('#finale a[href^="mailto:"]').count(), 1);
  assert.equal(await page.locator('#finale #copia-email').count(), 1);
  assert.equal(await page.locator('#finale [data-classica]').count(), 1);
  assert.equal(await page.locator('#finale #ricomincia').count(), 1);
  const esterni = await page.evaluate(() => [...document.querySelectorAll('body a[href]')]
    .filter((a) => !a.closest('#finale') && !a.hasAttribute('data-classica') && a.id !== 'classica').map((a) => a.href));
  assert.deepEqual(esterni, []);
}
