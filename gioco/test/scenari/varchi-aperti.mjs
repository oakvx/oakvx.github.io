// Porte a vista: ogni cambio di stanza (ex dissolvenze) avviene attraversando una porta da cui
// si vede già la stanza dopo, senza velo bianco, e si può tornare indietro.
import assert from 'node:assert/strict';

const inStanza = (k) => window.__gioco.leggi().stanza === k;

async function attraversa(page, aiuto, lato, verso) {
  const [x, , z, ry] = lato;
  // 1,5 m davanti alla porta, dal lato della stanza; si cammina verso la porta
  await aiuto.esegui((p) => { window.__gioco.vai(p[0] + Math.sin(p[3]) * 1.5, p[1] + 0.87, p[2] + Math.cos(p[3]) * 1.5); window.__gioco.guarda(p[3]); }, [x, lato[1], z, ry]);
  await aiuto.aspetta(150);
  await aiuto.esegui(() => window.__gioco.tasto('KeyW', true));
  const t0 = Date.now();
  try {
    for (;;) {
      if (await page.evaluate(() => document.getElementById('velo').classList.contains('on'))) throw new Error('dissolvenza verso ' + verso);
      if (await page.evaluate(inStanza, verso)) return;
      if (Date.now() - t0 > 8000) throw new Error('non arrivo in ' + verso + ': ' + JSON.stringify(await aiuto.leggi()));
      await aiuto.aspetta(50);
    }
  } finally { await aiuto.esegui(() => window.__gioco.tasto('KeyW', false)); }
}

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  await G(() => { window.__gioco.gioca(); window.__gioco.stanza('scrivania').risolvi(); });
  const varchi = await G(() => window.__gioco.varchi());
  assert.equal(varchi.length, 8);
  for (const v of varchi) {
    await attraversa(page, aiuto, v.lato, v.a);
    const s = await aiuto.leggi();
    // indietro: ci si gira e si riattraversa
    await G((y) => window.__gioco.guarda(y + Math.PI), s.yaw);
    await G(() => window.__gioco.tasto('KeyW', true));
    await aiuto.attendi(inStanza, 6000, v.da);
    await G(() => window.__gioco.tasto('KeyW', false));
  }
  // catena: dalla galleria si guarda la porta della scrivania (che ha a sua volta una porta)
  const g = varchi.find((v) => v.id === 'galleria-scrivania');
  await G((p) => { window.__gioco.vai(p[0], 0.87, p[2] - 3); window.__gioco.guarda(Math.PI); }, g.lato);
  await aiuto.aspetta(2000);
}
