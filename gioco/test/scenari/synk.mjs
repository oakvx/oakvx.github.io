// synk: una prenotazione sovrapposta viene respinta (saga di compensazione); con le tre
// prenotazioni giuste il calendario si sincronizza e la lampada si accende.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  const S = () => G(() => window.__gioco.stanza('synk').stato());
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('synk'); });
  await G(() => window.__gioco.stanza('synk').posa('colore', 10));   // 9–11 è già occupato
  await aiuto.attendi(() => window.__gioco.stanza('synk').stato().esiti.colore === 'conflitto', 4000);
  await aiuto.attendi(() => window.__gioco.stanza('synk').stato().inRientro.length === 0, 6000);
  assert.ok(!(await S()).prenotati.includes('colore'));
  await G(() => window.__gioco.stanza('synk').posa('colore', 12));
  await aiuto.attendi(() => window.__gioco.stanza('synk').stato().prenotati.includes('colore'), 4000);
  await G(() => window.__gioco.stanza('synk').posa('taglio', 14.5));
  await G(() => window.__gioco.stanza('synk').posa('piega', 15.5));
  await aiuto.attendi(() => window.__gioco.leggi().lampade === 1, 8000);
}
