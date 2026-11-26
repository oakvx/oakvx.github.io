// Esaminare un oggetto apre un cartiglio senza uscire dal gioco e senza link; E lo richiude.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  await aiuto.esegui(() => { window.__gioco.gioca(); window.__gioco.vaiA('ingresso'); });
  const b = await aiuto.esegui(() => window.__gioco.stanza('ingresso').bancone);
  await aiuto.esegui(() => window.__gioco.vai(0, 0.87, -0.6));
  await aiuto.aspetta(100);
  await aiuto.esegui((p) => window.__gioco.mira(...p), b);
  await aiuto.attendi(() => window.__gioco.leggi().mirato === 'bancone');
  await aiuto.esegui(() => window.__gioco.interagisci());
  let s = await aiuto.leggi();
  assert.equal(s.cartiglio, 'bancone');
  assert.equal(s.stato, 'gioco');
  assert.equal(s.gesto, true);
  assert.equal(await page.locator('#cartiglio a[href]').count(), 0);
  assert.equal(await page.locator('#cartiglio').isVisible(), true);
  await aiuto.esegui(() => window.__gioco.interagisci());
  s = await aiuto.leggi();
  assert.equal(s.cartiglio, null);
}
