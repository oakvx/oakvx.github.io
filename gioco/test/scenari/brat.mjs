// Brat Animator (anche senza audio): le parole-piattaforma seguono il tempo; fermando la timeline
// restano solide; col testo intero fermo si attraversa il fossato.
import assert from 'node:assert/strict';

export async function prepara(page) {
  await page.addInitScript(() => { delete window.AudioContext; delete window.webkitAudioContext; });
}

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  const S = () => G(() => window.__gioco.stanza('brat').stato());
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('brat'); });
  const a = await S();
  await aiuto.aspetta(1500);
  const b = await S();
  assert.notEqual(a.tempo, b.tempo);

  // ferma con la seconda parola accesa: la piattaforma 1 resta solida
  await aiuto.attendi(() => window.__gioco.stanza('brat').stato().parola === 1, 12000);
  await G(() => window.__gioco.evento('oggetto:brat-pausa'));
  const f1 = await S();
  await aiuto.aspetta(2000);
  const f2 = await S();
  assert.equal(f1.tempo, f2.tempo);
  assert.ok(f2.solide.includes(1));

  // riparti, poi ferma con il testo intero e attraversa
  await G(() => window.__gioco.evento('oggetto:brat-pausa'));
  await aiuto.attendi(() => window.__gioco.stanza('brat').stato().solide.length === 4, 12000);
  await G(() => window.__gioco.evento('oggetto:brat-pausa'));
  const p = await G(() => window.__gioco.stanza('brat').ponte);
  await G((q) => { window.__gioco.vai(q[0], 0.87, q[1]); window.__gioco.guarda(0); window.__gioco.tasto('KeyW', true); }, p);
  await aiuto.attendi((z) => window.__gioco.leggi().z < z, 6000, p[2]);
  await G(() => window.__gioco.tasto('KeyW', false));
  assert.equal((await aiuto.leggi()).stanza, 'brat');
  assert.ok((await aiuto.leggi()).y > 0.5);

  await G(() => window.__gioco.stanza('brat').risolvi());
  assert.equal((await aiuto.leggi()).lampade, 1);
}
