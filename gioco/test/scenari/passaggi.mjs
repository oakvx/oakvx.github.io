// Varchi fissi: chi li attraversa (giocatore o cubo) esce dall'altra parte, lontano.
// In più verifica che le finestre del giocatore funzionino ancora dopo la rifattorizzazione.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  const G = (fn, arg) => aiuto.esegui(fn, arg);
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('ingresso'); });
  // A nell'ingresso, rivolto a sud; B nell'atrio, 20 m più in là
  await G(() => window.__gioco.aggiungiPassaggio('prova', [0, 1.2, 0, 0], [0, 1.2, 20, 0]));
  await G(() => { window.__gioco.vai(0, 0.87, 1.2); window.__gioco.guarda(0); window.__gioco.tasto('KeyW', true); });
  await aiuto.attendi(() => window.__gioco.leggi().z > 15, 4000);
  await G(() => window.__gioco.tasto('KeyW', false));
  const s = await aiuto.leggi();
  assert.ok(Math.abs(s.x) < 1, 'x ' + s.x);
  assert.equal(s.stanza, 'atrio');

  // un cubo lanciato attraverso il varco
  await G(() => window.__gioco.vaiA('ingresso'));
  const i = await G(() => window.__gioco.cubo(0.6, 0.6, 1.5, 0, 0, -5));
  await aiuto.attendi((k) => window.__gioco.cubi()[k].z > 15, 4000, i);

  // finestre del giocatore: una a ovest, una a est; camminando verso ovest si esce a est
  await G(() => window.__gioco.rimuoviPassaggio('prova'));
  await G(() => { window.__gioco.evento('gesto'); window.__gioco.vai(0, 0.87, -1); });
  await aiuto.aspetta(100);
  // la camera segue mira() al fotogramma successivo
  await G(() => window.__gioco.mira(-4, 1.3, -1));
  await aiuto.aspetta(100);
  await G(() => window.__gioco.spara(0));
  await G(() => window.__gioco.mira(4, 1.3, -1));
  await aiuto.aspetta(100);
  await G(() => window.__gioco.spara(1));
  assert.deepEqual((await aiuto.leggi()).portali, ['ingresso-o', 'ingresso-e']);
  await G(() => { window.__gioco.vai(-2.5, 0.87, -1); window.__gioco.guarda(Math.PI / 2); window.__gioco.tasto('KeyW', true); });
  await aiuto.attendi(() => window.__gioco.leggi().x > 2, 4000);
  await G(() => window.__gioco.tasto('KeyW', false));
}
