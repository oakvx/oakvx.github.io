// Il muro dei commit: una parete di quadrati che si accendono a comporre il numero pubblico
// dei commit di oakvx (account oakvx e oakvxish), aggiornato dal vivo. Sotto, i repo toccati di recente.
import * as THREE from 'three';
import { cifre } from '../logica/commit.js';
import { apertura, nicchia, collega } from '../engine/varchi.js';

const X0 = 230, X1 = 250, Z0 = 0, Z1 = 14, H = 5;
const USCITA = [X1, 0, 7];
const LATO = 0.2, PASSO = 0.25, COLONNE = 72, RIGHE = 11;

export function costruisci(m, g) {
  const mat = m.mat;
  const T = () => g.T().stanze.commit;
  m.stanza({
    nome: 'commit', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H, ala: 'commit', passi: 'cemento',
    pareti: { e: { aperture: [apertura(USCITA[2])] }, n: { aperture: [apertura(240)] } },
    luci: [[240, 5, 0.6, 1.6]], intensita: 1.6, raggio: 12,
    atmosfera: { nebbia: 0x0d1416, vicino: 4, lontano: 30, cielo: 0x9ec9d4, terra: 0x101719, intensita: 1.3 },
  });
  nicchia(m, [240, 0, Z0, 0]);
  nicchia(m, [X1, 0, USCITA[2], -Math.PI / 2]);
  collega(g, 'commit-supermercato', [X1, 0, USCITA[2], -Math.PI / 2], [452, 0, 0, 0]);
  g.arredi.porta(X1 - 0.06, 0, USCITA[2], -Math.PI / 2, () => T().uscita);

  // la parete di quadrati
  const quadrati = new THREE.InstancedMesh(new THREE.BoxGeometry(LATO, LATO, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff }), COLONNE * RIGHE);
  const spento = new THREE.Color(0x1d2b30), acceso = new THREE.Color(0x16bad8);
  const larghezza = COLONNE * PASSO;
  const m4 = new THREE.Matrix4();
  // chi guarda la parete guarda verso +z: la colonna 0 va a sinistra, cioè a x maggiore
  const xColonna = (c) => 240 + larghezza / 2 - c * PASSO - PASSO / 2;
  for (let r = 0; r < RIGHE; r++) for (let c = 0; c < COLONNE; c++) {
    m4.makeTranslation(xColonna(c), 1 + (RIGHE - 1 - r) * PASSO, Z1 - 0.05);
    quadrati.setMatrixAt(r * COLONNE + c, m4);
    quadrati.setColorAt(r * COLONNE + c, spento);
  }
  m.scene.add(quadrati);
  let testo = '…';
  let accesi = 0;
  function componi(t) {
    testo = t;
    const g7 = cifre(t);
    const w = g7[0].length;
    const c0 = Math.floor((COLONNE - w) / 2), r0 = 2;
    accesi = 0;
    for (let r = 0; r < RIGHE; r++) for (let c = 0; c < COLONNE; c++) {
      const on = r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + w && g7[r - r0][c - c0] === '1';
      if (on) accesi++;
      quadrati.setColorAt(r * COLONNE + c, on ? acceso : spento);
    }
    quadrati.instanceColor.needsUpdate = true;
  }
  componi('…');
  g.commit().then((c) => componi(c.testo));

  const etichetta = g.texTesto(1024, 128, (ctx, w, h) => {
    ctx.fillStyle = '#0d1416'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#9ec9d4'; ctx.font = '600 44px Archivo, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(T().sotto, w / 2, 80);
  });
  etichetta.ridisegna();
  g.suLingua(() => etichetta.ridisegna());
  const cartellino = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.75), new THREE.MeshBasicMaterial({ map: etichetta }));
  cartellino.position.set(240, 0.55, Z1 - 0.04);
  cartellino.rotation.y = Math.PI;
  m.scene.add(cartellino);
  g.arredi.didascalia(X0 + 0.03, 1.6, 7, Math.PI / 2, () => T().testi.recenti, { w: 1.6, h: 1 });
  g.arredi.cartello(240, 4.2, Z0 + 0.03, 0, '11', () => T().cartello);
  g.puntoControllo('commit', 240, 0, 1.5, Math.PI);

  return { debug: { varchi: [{ id: 'commit-supermercato', da: 'commit', a: 'supermercato', lato: [X1, 0, USCITA[2], -Math.PI / 2] }], uscita: [X1 - 0.3, USCITA[2]], xColonna, stato: () => ({ testo, accesi }) } };
}
