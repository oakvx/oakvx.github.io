// Il giro completo, stanza per stanza nell'ordine della spec: alla fine 5 lampade e la schermata
// finale, senza errori. Misura anche gli FPS in tre stanze (asserzione solo con GIOCO_FPS=50:
// nel browser di test senza GPU il numero non dice nulla).
import assert from 'node:assert/strict';

const inStanza = (k) => window.__gioco.leggi().stanza === k;
const cammina = async (aiuto, yaw, arg, ms = 8000) => {
  await aiuto.esegui((y) => { window.__gioco.guarda(y); window.__gioco.tasto('KeyW', true); }, yaw);
  try { await aiuto.attendi(inStanza, ms, arg); } finally { await aiuto.esegui(() => window.__gioco.tasto('KeyW', false)); }
};
const fps = (page) => page.evaluate(() => new Promise((ok) => {
  let n = 0; const t0 = performance.now();
  const giro = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(giro); else ok(n / 3); };
  requestAnimationFrame(giro);
}));

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  const misure = {};
  await G(() => { window.__gioco.gioca(); window.__gioco.evento('gesto'); });
  // percorso → smistamento
  await G(() => window.__gioco.vai(0, 20.87, -12));
  await cammina(aiuto, 0, 'smistamento');
  // i cinque progetti
  for (const id of ['yag', 'piko', 'brat', 'synk', 'beautify']) {
    await G((k) => window.__gioco.vaiA(k), id);
    if (id === 'brat') misure.brat = await fps(page);
    await G((k) => window.__gioco.stanza(k).risolvi(), id);
  }
  assert.equal((await aiuto.leggi()).lampade, 5);
  // uscita dello smistamento → corridoio allagato → middleman → cisterna → galleria
  const u = await G(() => window.__gioco.stanza('smistamento').uscita);
  await G((p) => window.__gioco.vai(p[0], 0.87, p[2] + 2), u);
  await cammina(aiuto, 0, 'piscina');
  misure.piscina = await fps(page);
  await G(() => window.__gioco.stanza('piscina').risolvi());
  await cammina(aiuto, -Math.PI / 2, 'middleman');
  await G(() => window.__gioco.stanza('middleman').risolvi());
  await cammina(aiuto, Math.PI, 'cisterna');
  await G(() => window.__gioco.stanza('cisterna').risolvi());
  await cammina(aiuto, Math.PI, 'galleria');
  misure.galleria = await fps(page);
  // galleria → scrivania → commit → supermercato
  const ug = await G(() => window.__gioco.stanza('galleria').uscita);
  await G((p) => window.__gioco.vai(p[0], 0.87, p[1] - 1.5), ug);
  await cammina(aiuto, Math.PI, 'scrivania');
  await G(() => window.__gioco.stanza('scrivania').risolvi());
  const us = await G(() => window.__gioco.stanza('scrivania').uscita);
  await G((p) => window.__gioco.vai(p[0], 0.87, p[1] - 1.5), us);
  await cammina(aiuto, Math.PI, 'commit');
  const uc = await G(() => window.__gioco.stanza('commit').uscita);
  await G((p) => window.__gioco.vai(p[0] - 1.5, 0.87, p[1]), uc);
  await cammina(aiuto, -Math.PI / 2, 'supermercato');
  // transito C → stanza di oakvx → contatti → fine
  await G(() => window.__gioco.stanza('supermercato').risolvi());
  await cammina(aiuto, Math.PI, 'oakvx');
  const po = await G(() => window.__gioco.stanza('oakvx').porta);
  await G((q) => window.__gioco.vai(q[0] + 1.2, 0.87, q[1]), po);
  await cammina(aiuto, Math.PI / 2, 'contatti');
  const fz = await G(() => window.__gioco.stanza('contatti').finale);
  await G((q) => window.__gioco.vai(q[0], 0.87, q[1] - 1.5), fz);
  await G(() => { window.__gioco.guarda(Math.PI); window.__gioco.tasto('KeyW', true); });
  await aiuto.attendi(() => window.__gioco.leggi().finito === true, 8000);
  await G(() => { window.__gioco.tasto('KeyW', false); window.__gioco.salta(); });
  await aiuto.attendi(() => !document.getElementById('finale').hidden, 8000);
  console.log('  FPS medi:', JSON.stringify(Object.fromEntries(Object.entries(misure).map(([k, v]) => [k, Math.round(v)]))));
  const soglia = Number(process.env.GIOCO_FPS || 0);
  if (soglia) for (const [k, v] of Object.entries(misure)) assert.ok(v >= soglia, `${k}: ${v.toFixed(1)} FPS`);
}
