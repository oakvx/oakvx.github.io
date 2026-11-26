// YAG: con il cubo-chiave si passa l'autenticazione; il piedistallo decide dove porta la stessa porta.
import assert from 'node:assert/strict';

const cammina = async (aiuto, yaw, finche, ms = 5000, arg) => {
  await aiuto.esegui((y) => { window.__gioco.guarda(y); window.__gioco.tasto('KeyW', true); }, yaw);
  try { await aiuto.attendi(finche, ms, arg); } finally { await aiuto.esegui(() => window.__gioco.tasto('KeyW', false)); }
};

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('yag'); });
  const d = await G(() => window.__gioco.stanza('yag').posti);

  // senza chiave il varco non si passa
  await G((p) => window.__gioco.vai(p[0], 0.87, p[2] + 1.2), d.varco);
  await G(() => { window.__gioco.guarda(0); window.__gioco.tasto('KeyW', true); });
  await aiuto.aspetta(1200);
  await G(() => window.__gioco.tasto('KeyW', false));
  assert.ok((await aiuto.leggi()).z > d.varco[2], 'passato senza chiave');

  // prendi la chiave (spostata davanti al varco: teletrasportandosi la si lascerebbe cadere)
  await G((p) => window.__gioco.stanza('yag').poggia(p[0] + 0.6, 0.3, p[2] + 1.6), d.varco);
  await G((p) => window.__gioco.vai(p[0] + 0.6, 0.87, p[2] + 2.6), d.varco);
  await aiuto.aspetta(400);
  await G((p) => window.__gioco.mira(p[0] + 0.6, 0.22, p[2] + 1.6), d.varco);
  await aiuto.attendi(() => window.__gioco.leggi().mirato === 'cubo');
  await G(() => window.__gioco.interagisci());
  assert.equal((await aiuto.leggi()).tenuto, true);
  await G((p) => window.__gioco.vai(p[0], 0.87, p[2] + 2.2), d.varco);
  await cammina(aiuto, 0, (z) => window.__gioco.leggi().z < z - 1, 4000, d.varco[2]);
  assert.equal(await G(() => window.__gioco.stanza('yag').stato().autenticato), true);

  // piedistallo A → backend 1
  await G(() => window.__gioco.interagisci());
  await G((p) => window.__gioco.stanza('yag').poggia(p[0], p[1] + 0.5, p[2]), d.a);
  await aiuto.attendi(() => window.__gioco.stanza('yag').stato().meta === 'backend1', 3000);
  await G((p) => window.__gioco.vai(p[0], 0.87, p[2] + 1.5), d.uscita);
  await cammina(aiuto, 0, () => window.__gioco.leggi().stanza === 'yag-backend1');
  assert.equal((await aiuto.leggi()).lampade, 0);

  // piedistallo B → backend 2: lampada accesa
  await G((p) => window.__gioco.stanza('yag').poggia(p[0], p[1] + 0.5, p[2]), d.b);
  await aiuto.attendi(() => window.__gioco.stanza('yag').stato().meta === 'backend2', 3000);
  await G((p) => window.__gioco.vai(p[0], 0.87, p[2] + 1.5), d.uscita);
  await cammina(aiuto, 0, () => window.__gioco.leggi().stanza === 'yag-backend2');
  assert.equal((await aiuto.leggi()).lampade, 1);
}
