// Lo smistamento: in fondo al percorso si arriva qui; l'uscita resta chiusa finché
// le cinque lampade dei progetti non sono accese; ogni porta porta alla sua stanza e ritorno.
import assert from 'node:assert/strict';

const cammina = async (aiuto, yaw, finche, ms = 5000, arg) => {
  await aiuto.esegui((y) => { window.__gioco.guarda(y); window.__gioco.tasto('KeyW', true); }, yaw);
  try { await aiuto.attendi(finche, ms, arg); } finally { await aiuto.esegui(() => window.__gioco.tasto('KeyW', false)); }
};

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  await G(() => window.__gioco.gioca());
  // dal fondo del percorso
  await G(() => window.__gioco.vai(0, 60.87, -12));
  await cammina(aiuto, 0, () => window.__gioco.leggi().stanza === 'smistamento');

  // uscita chiusa
  const u = await G(() => window.__gioco.stanza('smistamento').uscita);
  await G((p) => window.__gioco.vai(p[0], 0.87, p[2] + 2), u);
  await G(() => { window.__gioco.guarda(0); window.__gioco.tasto('KeyW', true); });
  await aiuto.aspetta(1500);
  await G(() => window.__gioco.tasto('KeyW', false));
  assert.equal((await aiuto.leggi()).stanza, 'smistamento');

  // ogni porta porta alla sua stanza, e da lì si torna
  for (const id of ['yag', 'piko', 'brat', 'synk', 'beautify']) {
    const p = await G((k) => window.__gioco.stanza('smistamento').porte[k], id);
    await G((q) => window.__gioco.vai(q[0] + Math.sin(q[3]) * 1.5, 0.87, q[2] + Math.cos(q[3]) * 1.5), p);
    await cammina(aiuto, p[3], (k) => window.__gioco.leggi().stanza === k, 4000, id);
    if (id === 'yag') {
      await aiuto.aspetta(300);
      const y = (await aiuto.leggi()).yaw;
      await cammina(aiuto, y + Math.PI, () => window.__gioco.leggi().stanza === 'smistamento', 4000);
    }
  }

  for (const id of ['yag', 'piko', 'brat', 'synk', 'beautify']) await G((k) => window.__gioco.stanza(k).risolvi(), id);
  assert.equal((await aiuto.leggi()).lampade, 5);
  await G((p) => window.__gioco.vai(p[0], 0.87, p[2] + 2), u);
  await aiuto.aspetta(1200);
  await cammina(aiuto, 0, () => ['passaggio', 'atrio'].includes(window.__gioco.leggi().stanza));
}
