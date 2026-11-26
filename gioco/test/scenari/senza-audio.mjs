// Senza AudioContext il gioco parte, si cambia stanza senza errori e l'orologio della musica va avanti.
import assert from 'node:assert/strict';

export async function prepara(page) {
  await page.addInitScript(() => { delete window.AudioContext; delete window.webkitAudioContext; });
}

export default async function (page, aiuto) {
  await aiuto.esegui(() => { window.__gioco.avviaAudio(); window.__gioco.gioca(); });
  const t1 = await aiuto.esegui(() => window.__gioco.tempoMusica());
  await aiuto.esegui(() => window.__gioco.vai(42, 0.87, 19.2));
  await aiuto.attendi(() => window.__gioco.leggi().stanza === 'piscina');
  await aiuto.aspetta(400);
  const t2 = await aiuto.esegui(() => window.__gioco.tempoMusica());
  assert.ok(t2 > t1 + 0.3, `${t1} → ${t2}`);
}
