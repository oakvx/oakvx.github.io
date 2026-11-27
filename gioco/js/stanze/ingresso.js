// Ingresso: il bancone del turno di notte, dove si prendono le due finestre.
// L'uscita a nord è chiusa da un vetro: oltre il vetro, nel corridoio del percorso, c'è
// un pannello. Prima prova delle finestre: una qui, una di là.
import * as THREE from 'three';
import { creaOggetti } from '../engine/oggetti.js';

export function costruisci(m, g) {
  const mat = m.mat;
  m.stanza({
    nome: 'ingresso', x0: -4, x1: 4, z0: -4, z1: 4, h: 3.2, ala: 'ingresso',
    pareti: {
      n: { aperture: [{ a: -1, b: 1, y0: 0, y1: 2.6 }] },
      w: { pannelli: [{ id: 'ingresso-o', a: -2.5, b: 0.5, y0: 0, y1: 2.6 }] },
      e: { pannelli: [{ id: 'ingresso-e', a: -2.5, b: 0.5, y0: 0, y1: 2.6 }] },
    },
    luci: [[0, -1.6], [0, 1.6]], intensita: 3.2, raggio: 7,
  });

  // vetro sull'uscita nord: solido, ma le finestre ci sparano attraverso
  const vetro = m.box(-1, 0, -4.22, 1, 2.6, -4.12, new THREE.MeshLambertMaterial({ color: 0xa9c4c8, transparent: true, opacity: 0.18, depthWrite: false }));
  vetro.mesh.userData.vetro = true;

  // bancone con le due finestre appoggiate sopra
  // il bancone è una scrivania d'ufficio in metallo (scansionata); sotto c'è il volume che si esamina
  const oggetti = creaOggetti(m, g);
  const bancone = m.box(-0.8, 0, -2.6, 0.8, 0.78, -1.9, mat.scuro);
  bancone.mesh.visible = false;
  oggetti.metti('metal_office_desk', 0, 0, -2.25, 0, { altezza: 0.78, solido: false });
  oggetti.metti('power_box_01', 3.75, 1.2, 2.6, -Math.PI / 2, { altezza: 0.55, solido: false });
  oggetti.metti('utility_box_01', -3.6, 0, 3.4, Math.PI / 2, { altezza: 1.1 });
  const finestre = new THREE.Group();
  for (const [x, c] of [[-0.35, 0x39c6d9], [0.35, 0xd95bb3]]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.6), new THREE.MeshBasicMaterial({ color: c }));
    f.position.set(x, 0.8, -2.25);
    finestre.add(f);
  }
  m.scene.add(finestre);
  g.interattivo(bancone.mesh, 'bancone');
  const aiuti = g.aiuti('ingresso');
  g.su('oggetto:bancone', () => {
    finestre.visible = false;
    g.emetti('gesto');
    aiuti.progresso();
  });
  g.su('portale:ok', () => aiuti.progresso());
  g.su('stanza:percorso', () => aiuti.risolto());
  // a 90 secondi: le sagome delle due finestre sui pannelli giusti
  const sagome = new THREE.Group();
  for (const [x, z, ry, c] of [[-3.98, -1, Math.PI / 2, 0x39c6d9], [-1.48, -7, Math.PI / 2, 0xd95bb3]]) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.35, depthWrite: false }));
    s.position.set(x, 1.1, z);
    s.rotation.y = ry;
    sagome.add(s);
  }
  sagome.visible = false;
  m.scene.add(sagome);
  g.su('aiuto:soluzione:ingresso', () => { sagome.visible = true; });
  g.su('stanza:percorso', () => { sagome.visible = false; });

  const cartello = g.arredi.cartello(0, 2.93, -3.97, 0, '00', () => g.T().stanze.ingresso.cartello);
  g.puntoControllo('ingresso', 0, 0, 2.6, 0);

  return { debug: { bancone: [0, 0.6, -2.25], stato: () => ({ cartello: cartello.testo, modelli: oggetti.quanti() }) } };
}
