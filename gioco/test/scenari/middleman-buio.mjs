// middleManPS4 è al buio anche con la resa realistica (panorama HDR, faro d'ombra, soffitti):
// a lampada spenta la stanza è quasi nera, con la lampada delle prove (F) si vede.
import assert from 'node:assert/strict';
import { fotografa } from './_foto.mjs';

export const pesante = true;

export default async function (page, aiuto) {
  await aiuto.attendi(() => !document.getElementById('avvio-entra').hidden, 40000);
  await aiuto.esegui(() => { window.__gioco.gioca(); window.__gioco.vaiA('middleman'); window.__gioco.evento('gesto'); });
  await aiuto.attendi(() => window.__gioco.leggi().stanza === 'middleman', 8000);
  await aiuto.aspetta(6000);   // l'atmosfera sfuma verso quella della stanza (lenta senza GPU)
  // verso la parete ovest e i suoi pannelli, a 3,5 m (la nebbia nera nasconde il resto), lontano dalla luce dell'ingresso
  const vista = [103.5, 0.87, 9.5, Math.PI / 2, -0.05];
  const buio = await fotografa(page, aiuto, 'middleman-buio', vista);
  assert.ok(buio < 0.07, `a lampada spenta deve essere buio: luminanza ${buio.toFixed(3)}`);
  await page.keyboard.press('KeyF');
  await aiuto.attendi(() => window.__gioco.stanza('middleman').stato().lampada === true, 2000);
  const luce = await fotografa(page, aiuto, 'middleman-lampada', vista);
  assert.ok(luce > buio + 0.02, `con la lampada si vede: ${buio.toFixed(3)} → ${luce.toFixed(3)}`);
}
