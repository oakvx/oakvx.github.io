// Con l'audio acceso la musica parte, la transizione al cambio stanza gira e l'orologio non torna indietro.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  const t0 = await aiuto.esegui(() => window.__gioco.tempoMusica());
  await aiuto.esegui(() => { window.__gioco.avviaAudio(); window.__gioco.gioca(); });
  const t1 = await aiuto.esegui(() => window.__gioco.tempoMusica());
  assert.ok(t1 >= t0, `l'orologio è tornato indietro: ${t0} → ${t1}`);
  await aiuto.esegui(() => window.__gioco.vai(42, 0.87, 19.2));
  await aiuto.attendi(() => window.__gioco.leggi().stanza === 'piscina');
  await aiuto.aspetta(1500);
  const t2 = await aiuto.esegui(() => window.__gioco.tempoMusica());
  assert.ok(t2 > t1 + 1, `${t1} → ${t2}`);
  // livello misurato sull'uscita della sola musica
  let massimo = 0;
  for (let i = 0; i < 20; i++) { massimo = Math.max(massimo, await aiuto.esegui(() => window.__gioco.livelloAudio())); await aiuto.aspetta(150); }
  assert.ok(massimo > 0.005, 'livello ' + massimo);
}
