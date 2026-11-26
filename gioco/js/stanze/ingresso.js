// Ingresso: il bancone del turno di notte, dove si prendono le due finestre.
// A sud un passaggio porta all'atrio (gli spazi liminali).
import * as THREE from 'three';

export function costruisci(m, g) {
  const mat = m.mat;
  m.stanza({
    nome: 'ingresso', x0: -4, x1: 4, z0: -4, z1: 4, h: 3.2,
    pareti: {
      s: { aperture: [{ a: -1, b: 1, y0: 0, y1: 2.6 }] },
      w: { pannelli: [{ id: 'ingresso-o', a: -2.5, b: 0.5, y0: 0, y1: 2.6 }] },
      e: { pannelli: [{ id: 'ingresso-e', a: -2.5, b: 0.5, y0: 0, y1: 2.6 }] },
    },
    luci: [[0, -1.6], [0, 1.6]], intensita: 3.2, raggio: 7,
  });
  m.stanza({ nome: 'passaggio', x0: -1, x1: 1, z0: 4.3, z1: 7.7, h: 2.6, pareti: { n: false, s: false }, luci: [[0, 6, 0.4, 0.9]], luciPunto: false, atmosfera: 'eredita', suono: 'eredita' });

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
  g.su('oggetto:bancone', () => {
    finestre.visible = false;
    g.emetti('gesto');
  });

  g.arredi.cartello(0, 2.93, -3.97, 0, '00', () => g.T().stanze.ingresso.cartello);
  g.puntoControllo('ingresso', 0, 0, 2.6, 0);

  return { debug: { bancone: [0, 0.9, -2.25] } };
}
