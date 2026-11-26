// La stanza di oakvx: entrando l'immagine passa alla "modalità 2008" con la data gialla;
// uscendo torna normale. La porta segreta del percorso porta qui e si torna indietro.
import assert from 'node:assert/strict';

const cammina = async (aiuto, yaw, finche, arg, ms = 6000) => {
  await aiuto.esegui((y) => { window.__gioco.guarda(y); window.__gioco.tasto('KeyW', true); }, yaw);
  try { await aiuto.attendi(finche, ms, arg); } finally { await aiuto.esegui(() => window.__gioco.tasto('KeyW', false)); }
};
const inStanza = (k) => window.__gioco.leggi().stanza === k;

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('oakvx'); });
  await aiuto.attendi(() => window.__gioco.stanza('oakvx').stato().modo2008 === 1, 3000);
  assert.equal(await page.locator('#data2008').isVisible(), true);
  assert.match(await page.locator('#data2008').textContent(), /^\d\d\/\d\d\/2008$/);
  const s = await G(() => window.__gioco.stanza('oakvx').stato());
  assert.ok(s.mensola >= 6, 'mensola ' + s.mensola);
  assert.ok(s.lingue >= 5, 'lingue ' + s.lingue);

  // fuori dalla stanza la modalità 2008 si spegne
  await G(() => window.__gioco.vaiA('ingresso'));
  await aiuto.attendi(() => window.__gioco.stanza('oakvx').stato().modo2008 === 0, 3000);
  assert.equal(await page.locator('#data2008').isVisible(), false);

  // porta segreta: dal terzo tratto del percorso, guardando indietro, si entra qui; e si torna
  await G(() => { const p = window.__gioco.stanza('percorso').inizio(3); window.__gioco.vai(p[0], p[1], -12); window.__gioco.guarda(Math.PI); });
  await aiuto.attendi(() => window.__gioco.stanza('percorso').stato().segreta === true, 2000);
  await cammina(aiuto, Math.PI, inStanza, 'oakvx');
  assert.ok((await aiuto.leggi()).segreti.includes('porta-percorso'));
  await aiuto.aspetta(300);
  await cammina(aiuto, 0, inStanza, 'percorso-3');
}
