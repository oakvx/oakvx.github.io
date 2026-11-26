// Ingresso: il bancone del turno di notte, dove si prendono le due finestre.
// L'uscita a nord è chiusa da un vetro: oltre il vetro, nel corridoio del percorso, c'è
// un pannello. Prima prova delle finestre: una qui, una di là.
import * as THREE from 'three';

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
  // corridoio verso l'atrio: ci arriva l'uscita dello smistamento
  m.stanza({ nome: 'passaggio', x0: -1, x1: 1, z0: 4.3, z1: 7.7, h: 2.6, pareti: { n: {}, s: false }, luci: [[0, 6, 0.4, 0.9]], luciPunto: false, atmosfera: 'eredita', suono: 'eredita' });

  // vetro sull'uscita nord: solido, ma le finestre ci sparano attraverso
  const vetro = m.box(-1, 0, -4.22, 1, 2.6, -4.12, new THREE.MeshLambertMaterial({ color: 0xa9c4c8, transparent: true, opacity: 0.18, depthWrite: false }));
  vetro.mesh.userData.vetro = true;

  // bancone con le due finestre appoggiate sopra
  const bancone = m.box(-1.4, 0, -2.6, 1.4, 1.05, -1.9, mat.scuro);
  m.box(-1.5, 1.05, -2.7, 1.5, 1.1, -1.8, mat.cornice, { solido: false });
  const finestre = new THREE.Group();
  for (const [x, c] of [[-0.35, 0x39c6d9], [0.35, 0xd95bb3]]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.6), new THREE.MeshBasicMaterial({ color: c }));
    f.position.set(x, 1.13, -2.25);
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

  return { debug: { bancone: [0, 0.9, -2.25], stato: () => ({ cartello: cartello.testo }) } };
}
