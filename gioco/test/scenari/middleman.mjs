// middleManPS4: al buio un pannello non provato non prende finestre; con la lampada delle prove
// (F) lo si illumina e allora sì. Con i due pannelli giusti si sale alla nicchia e si va in cisterna.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('middleman'); window.__gioco.evento('gesto'); });
  const d = await G(() => window.__gioco.stanza('middleman').posti);
  await G((p) => window.__gioco.vai(p[0], 0.87, p[1]), d.qui);
  await aiuto.aspetta(200);
  // pannello basso, non provato: niente finestra
  await G((p) => window.__gioco.mira(...p), d.basso); await aiuto.aspetta(150);
  await G(() => window.__gioco.spara(0));
  assert.equal((await aiuto.leggi()).portali[0], false);
  // lampada accesa: guardandolo diventa provato
  await page.keyboard.press('KeyF');
  await aiuto.attendi(() => window.__gioco.stanza('middleman').stato().lampada === true, 2000);
  await aiuto.attendi(() => window.__gioco.stanza('middleman').stato().provati.includes('mm-basso'), 3000);
  await G(() => window.__gioco.spara(0));
  assert.equal((await aiuto.leggi()).portali[0], 'mm-basso');
  await G((p) => window.__gioco.mira(...p), d.alto); await aiuto.aspetta(150);
  await aiuto.attendi(() => window.__gioco.stanza('middleman').stato().provati.includes('mm-alto'), 3000);
  await G(() => window.__gioco.spara(1));
  assert.equal((await aiuto.leggi()).portali[1], 'mm-alto');
  // dentro la finestra bassa, fuori da quella alta, poi in cisterna
  await G((p) => { window.__gioco.vai(p[0], 0.87, p[1]); window.__gioco.guarda(p[2]); window.__gioco.tasto('KeyW', true); }, d.entra);
  // fuori dalla finestra alta si è sulla nicchia: ci si gira verso la porta e si va in cisterna
  await aiuto.attendi(() => window.__gioco.leggi().y > 2.5, 8000);
  await G(() => { window.__gioco.tasto('KeyW', false); const s = window.__gioco.leggi(); window.__gioco.vai(s.x, s.y, s.z); });
  await aiuto.aspetta(150);
  await G(() => { window.__gioco.mira(118.5, 3.6, 21); window.__gioco.tasto('KeyW', true); });
  await aiuto.attendi(() => window.__gioco.leggi().stanza === 'cisterna', 8000);
  await G(() => window.__gioco.tasto('KeyW', false));
}
