// Il corridoio del percorso (due tratti) si cammina per più di 20 m restando in 12 m di ingombro;
// guardando indietro dopo l'ultima tappa compare la porta segreta.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('percorso'); });
  const p0 = (await aiuto.leggi()).passi;
  await G(() => { window.__gioco.guarda(0); window.__gioco.tasto('KeyW', true); });
  let fuori = false;
  const t0 = Date.now();
  let s;
  for (;;) {
    s = await aiuto.leggi();
    if (s.stanza && s.stanza.startsWith('percorso') && (Math.abs(s.x) > 1.6 || s.z > -3.5 || s.z < -16.5)) fuori = true;
    if (s.stanza === 'percorso-2' && s.z < -13.5) break;
    if (Date.now() - t0 > 90000) throw new Error('non arrivo in fondo: ' + JSON.stringify(s));
    await aiuto.aspetta(50);
  }
  await G(() => window.__gioco.tasto('KeyW', false));
  assert.equal(fuori, false, 'uscito dall\'ingombro di 12 m');
  assert.ok(s.passi - p0 > 18, 'percorsi ' + (s.passi - p0));
  assert.ok(s.passi - p0 < 30, 'troppo lungo: ' + (s.passi - p0));

  // porta segreta: nel secondo tratto, dopo la tappa, guardando indietro
  await G(() => { const p = window.__gioco.stanza('percorso').inizio(2); window.__gioco.vai(p[0], p[1], -12); window.__gioco.guarda(0); });
  await aiuto.aspetta(150);
  assert.equal(await G(() => window.__gioco.stanza('percorso').stato().segreta), false);
  await G(() => window.__gioco.guarda(Math.PI));
  await aiuto.attendi(() => window.__gioco.stanza('percorso').stato().segreta === true, 2000);
}
