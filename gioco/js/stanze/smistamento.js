// Smistamento: la sezione "Backend & App Logic" del README. Cinque porte numerate con
// l'hash di un commit, una per progetto; sopra l'uscita cinque lampade. L'uscita (verso
// gli spazi liminali) si apre quando sono accese tutte.
import * as THREE from 'three';
import { posa } from '../engine/passaggi.js';
import { PORTE, apertura, nicchia, collega } from '../engine/varchi.js';
import { PROGETTI } from '../logica/giro.js';

const X0 = -10, X1 = 10, Z0 = -42, Z1 = -26, H = 5;
const HASH = { yag: 'a3f9c21', piko: '7be04d1', brat: 'c51e9aa', synk: '0d4f7b3', beautify: '9e2a6f0' };
const USCITA = [4, 0, Z0, 0];

export function costruisci(m, g) {
  const mat = m.mat;
  const lungo = (id) => (PORTE[id].hub[3] === 0 ? PORTE[id].hub[0] : PORTE[id].hub[2]);
  const sulLato = (lato) => PROGETTI.filter((id) => {
    const ry = PORTE[id].hub[3];
    return lato === 'n' ? ry === 0 : lato === 'w' ? ry > 0 : ry < 0;
  }).map((id) => apertura(lungo(id)));
  m.stanza({
    nome: 'smistamento', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H, ala: 'backend', passi: 'piastrelle',
    pareti: {
      n: { aperture: [...sulLato('n'), apertura(USCITA[0], 2, 2.6)] },
      w: { aperture: sulLato('w') },
      e: { aperture: sulLato('e') },
    },
    materiali: { pavimento: mat.piastrelle },
    luci: [[-5, -30, 0.6, 2], [5, -30, 0.6, 2], [-5, -38, 0.6, 2], [5, -38, 0.6, 2]], intensita: 3, raggio: 10,
    atmosfera: { nebbia: 0x2f3634, vicino: 4, lontano: 30, cielo: 0xe0e8e2, terra: 0x3a403c, intensita: 2.2 },
  });

  // porte dei progetti, a doppio senso
  for (const id of PROGETTI) {
    const h = PORTE[id].hub;
    nicchia(m, h);
    g.arredi.porta(h[0] + Math.sin(h[3]) * 0.06, 0, h[2] + Math.cos(h[3]) * 0.06, h[3], HASH[id]);
    collega(g, 'porta-' + id, h, PORTE[id].stanza);
  }

  // arrivo dal percorso (a senso unico), sulla parete sud
  g.passaggi.aggiungi({ id: 'percorso-3', a: posa(0, 61.3, -15.7, 0), b: posa(0, 1.3, Z1 - 0.3, Math.PI), w: 3, h: 2.6, doppio: false });
  g.arredi.porta(0, 0, Z1 - 0.06, Math.PI, null, { w: 3, h: 2.6 });

  // uscita: chiusa da una saracinesca finché le lampade non sono cinque
  nicchia(m, USCITA, 2, 2.6);
  const saracinesca = m.box(USCITA[0] - 1, 0, Z0 - 0.3, USCITA[0] + 1, 2.6, Z0 - 0.05, mat.metallo);
  collega(g, 'uscita-smistamento', USCITA, [0, 0, 7.85, 0], { w: 2, h: 2.6 });
  g.passaggi.attiva('uscita-smistamento', false);
  g.arredi.porta(USCITA[0], 0, Z0 + 0.06, 0, null, { w: 2, h: 2.6 });

  const spente = new THREE.MeshLambertMaterial({ color: 0x2a3030 });
  const lampade = PROGETTI.map((id, i) => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.12), spente);
    l.position.set(USCITA[0] - 1 + 0.25 + i * 0.375, 3.2, Z0 + 0.07);
    m.scene.add(l);
    return [id, l];
  });
  const accesa = new THREE.MeshBasicMaterial({ color: 0x9ff2c8 });
  for (const [id, l] of lampade) {
    g.su('lampada:' + id, () => {
      l.material = accesa;
      if (g.giro.uscitaAperta()) {
        saracinesca.attivo = false;
        saracinesca.mesh.visible = false;
        g.passaggi.attiva('uscita-smistamento', true);
        g.suoni.porta(true);
        g.emetti('uscita:smistamento');
      }
    });
  }

  g.arredi.cartello(0, 3.4, Z0 + 0.03, 0, '02', () => g.T().stanze.smistamento.cartello);
  g.puntoControllo('smistamento', 0, 0, Z1 - 1.5, 0);

  const porte = Object.fromEntries(PROGETTI.map((id) => [id, PORTE[id].hub.slice(0, 1).concat([0, PORTE[id].hub[2], PORTE[id].hub[3]])]));
  return { debug: { porte, uscita: USCITA, stato: () => ({ aperta: g.giro.uscitaAperta() }) } };
}
