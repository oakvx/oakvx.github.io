// Transiti negli spazi liminali: la catena delle stanze, l'acqua che trascina all'indietro,
// le corsie che si ripetono, e i tre Mii che girano l'angolo (segreto).
import assert from 'node:assert/strict';

const cammina = async (aiuto, yaw, finche, ms = 6000, arg) => {
  await aiuto.esegui((y) => { window.__gioco.guarda(y); window.__gioco.tasto('KeyW', true); }, yaw);
  try { await aiuto.attendi(finche, ms, arg); } finally { await aiuto.esegui(() => window.__gioco.tasto('KeyW', false)); }
};
const inStanza = (k) => window.__gioco.leggi().stanza === k;

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  await G(() => window.__gioco.gioca());

  // A: nel tratto centrale del corridoio allagato non si avanza
  await G(() => { window.__gioco.vaiA('piscina'); });
  await G(() => window.__gioco.vai(50, 0.86, 19.2));
  await G(() => { window.__gioco.guarda(-Math.PI / 2); window.__gioco.tasto('KeyW', true); });
  await aiuto.aspetta(1500);
  await G(() => window.__gioco.tasto('KeyW', false));
  assert.ok((await aiuto.leggi()).x < 50.5, 'si avanza controcorrente');
  await G(() => window.__gioco.stanza('piscina').risolvi());
  await cammina(aiuto, -Math.PI / 2, inStanza, 6000, 'middleman');
  // dalla stanza (segnaposto) di middleman alla cisterna
  await G(() => window.__gioco.stanza('middleman').risolvi());
  await aiuto.attendi(inStanza, 4000, 'cisterna');

  // B: dalla pedana alta della cisterna alla chiocciola, e in fondo alla galleria
  await G(() => window.__gioco.stanza('cisterna').risolvi());
  await aiuto.attendi(inStanza, 4000, 'spirale');
  await G(() => window.__gioco.stanza('spirale').risolvi());
  await cammina(aiuto, Math.PI / 2, inStanza, 6000, 'galleria');

  // C: le corsie si ripetono
  await G(() => window.__gioco.vaiA('supermercato'));
  await G(() => window.__gioco.vai(463.5, 0.86, 26));
  await cammina(aiuto, Math.PI, () => window.__gioco.leggi().z < 10, 4000);
  await G(() => window.__gioco.stanza('supermercato').risolvi());
  await cammina(aiuto, Math.PI, inStanza, 6000, 'nave');
  await G(() => window.__gioco.stanza('nave').risolvi());
  await aiuto.attendi(inStanza, 4000, 'ballatoio');
  await G(() => window.__gioco.stanza('ballatoio').risolvi());
  await cammina(aiuto, 0, inStanza, 6000, 'oakvx');

  // i tre Mii
  for (const r of ['atrio', 'cisterna', 'supermercato']) {
    const p = await G((k) => window.__gioco.stanza(k).mii, r);
    await G((q) => window.__gioco.vai(q[0] - 3, q[1] + 0.9, q[2]), p);
    await aiuto.aspetta(300);
  }
  assert.ok((await aiuto.leggi()).segreti.includes('mii'));
}
