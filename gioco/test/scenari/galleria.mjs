// Galleria: lo schermo del portfolio inquadra la stanza col visitatore dentro (cambia quando
// ti sposti); la leva di Spinotto Felice cambia il tema della stanza.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  const S = () => G(() => window.__gioco.stanza('galleria').stato());
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('galleria'); window.__gioco.vai(160, 0.87, 4); });
  await aiuto.aspetta(800);
  const h1 = (await S()).hashSchermo;
  await G(() => window.__gioco.vai(162.5, 0.87, 10));
  await aiuto.aspetta(800);
  const h2 = (await S()).hashSchermo;
  assert.notEqual(h1, h2);
  assert.equal((await S()).tema, 'chiaro');
  await G(() => window.__gioco.evento('oggetto:galleria-tema'));
  assert.equal((await S()).tema, 'scuro');
  await G(() => window.__gioco.evento('oggetto:galleria-tema'));
  assert.equal((await S()).tema, 'chiaro');
  // uscita verso la scrivania
  const u = await G(() => window.__gioco.stanza('galleria').uscita);
  await G((p) => { window.__gioco.vai(p[0], 0.87, p[1] - 1.5); window.__gioco.guarda(Math.PI); window.__gioco.tasto('KeyW', true); }, u);
  await aiuto.attendi(() => window.__gioco.leggi().stanza === 'scrivania', 6000);
  await G(() => window.__gioco.tasto('KeyW', false));
}
