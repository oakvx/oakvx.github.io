// Beautify: dalla reception si vede dentro i saloni (vetrine) e ci si aprono finestre;
// portare l'appuntamento sulla poltrona libera del salone C accende la lampada.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('beautify'); window.__gioco.evento('gesto'); });
  const d = await G(() => window.__gioco.stanza('beautify').posti);
  assert.equal(await G(() => window.__gioco.stanza('beautify').stato().disponibile), 'c');
  // finestre: una sul pannello della reception, una nel salone A attraverso la vetrina
  await G((p) => window.__gioco.vai(p[0], 0.87, p[1]), d.qui);
  await aiuto.aspetta(150);
  await G((p) => window.__gioco.mira(...p), d.pannelloReception); await aiuto.aspetta(120); await G(() => window.__gioco.spara(0));
  await G((p) => window.__gioco.mira(...p), d.pannelloA); await aiuto.aspetta(120); await G(() => window.__gioco.spara(1));
  assert.deepEqual((await aiuto.leggi()).portali, ['beautify-reception', 'beautify-a']);
  // l'appuntamento sulla poltrona di C
  await G((p) => window.__gioco.stanza('beautify').poggia(p[0], 1.2, p[2]), d.poltronaC);
  await aiuto.attendi(() => window.__gioco.leggi().lampade === 1, 5000);
  assert.equal(await G(() => window.__gioco.stanza('beautify').stato().disponibile), null);
}
