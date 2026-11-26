// Il laboratorio: qui si riceve il gesto delle finestre. Per raggiungere la balconata
// serve una finestra sul pannello basso e una su quello alto. Il pannello dietro la
// colonna "non c'è nel copione": la sua finestra mente e porta dietro le quinte.
import * as THREE from 'three';

export function costruisci(m, g) {
  const mat = m.mat;
  m.stanza({
    nome: 'laboratorio', x0: -14, x1: -0.5, z0: -36, z1: -22, h: 7,
    pareti: {
      s: { aperture: [{ a: -3.5, b: -1.5, y0: 0, y1: 2.4 }] },
      n: { aperture: [{ a: -3.5, b: -1.5, y0: 3.5, y1: 5.9 }], pannelli: [{ id: 'alto', a: -10.5, b: -6.5, y0: 3.5, y1: 6.6 }] },
      w: { pannelli: [{ id: 'basso', a: -30.5, b: -24.5, y0: 0, y1: 3.2 }] },
      e: { pannelli: [{ id: 'proibito', a: -31.9, b: -29.9, y0: 0, y1: 2.6, proibito: true }] },
    },
    luci: [[-7, -25, 0.8, 1.6], [-7, -29.5, 0.8, 1.6], [-7, -34, 0.8, 1.6]], intensita: 4, raggio: 10,
  });

  // balconata rialzata sul lato nord
  m.box(-14, 0, -36, -0.5, 3.5, -32.5, mat.pavimento);
  // bordo e parapetto della balconata
  m.tondo(-14, 3.42, -32.6, -0.5, 3.56, -32.44, mat.cornice, { r: 0.03, solido: false });
  m.tondo(-14, 4.42, -32.6, -0.5, 4.5, -32.5, mat.cornice, { r: 0.035, solido: false });
  for (let x = -13.5; x < -0.6; x += 1.5) m.tondo(x - 0.03, 3.5, -32.58, x + 0.03, 4.45, -32.52, mat.cornice, { r: 0.02, solido: false });
  m.box(-14, 3.5, -32.6, -0.5, 4.6, -32.45, mat.chiaro).mesh.visible = false;
  // colonna che nasconde il pannello proibito
  m.tondo(-2.6, 0, -31.6, -1.6, 7, -30.6, mat.muro, { r: 0.08 });
  m.ombra(-2.1, 0, -31.1, 1.6, 1.6);
  // allestimento
  const A = g.arredi;
  A.cartello(-2.5, 2.7, -22.03, Math.PI, '03', () => g.T().sale.laboratorio);
  A.didascalia(-1.15, 0, -23.4, -0.5, () => g.T().didascalie.gesto, { su: 'leggio', w: 0.44, h: 0.28 });
  m.box(-1.27, 0, -23.52, -1.03, 1.1, -23.28, mat.chiaro).mesh.visible = false;
  for (const z of [-26, -30]) A.griglia(-0.52, 5.6, z, -Math.PI / 2, 0.9, 0.4);

  // pedana del gesto
  const pedana = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.06, 24), mat.cornice);
  pedana.position.set(-2.5, 0.03, -24.2);
  m.scene.add(pedana);
  const anello = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 4, 1), new THREE.MeshBasicMaterial({ color: 0x39c6d9 }));
  anello.rotation.x = -Math.PI / 2;
  anello.rotation.z = Math.PI / 4;
  anello.position.set(-2.5, 0.065, -24.2);
  m.scene.add(anello);
  m.ogniFrame((dt, t) => { anello.material.color.setHSL(t % 2 < 1 ? 0.52 : 0.88, 0.6, 0.55); });
  m.zona('gesto', -3.1, -1, -24.8, -1.9, 2, -23.6);

  // la finestra proibita porta dietro le quinte (vedi fuorimappa.js)
  const arrivo = new THREE.Matrix4().compose(
    new THREE.Vector3(-100, 1.02, -14),
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI),
    new THREE.Vector3(1, 1, 1),
  );
  g.portali.reindirizza('proibito', arrivo);

  m.zona('balconata', -14, 3.3, -36, -0.5, 6, -32.5);

  g.cubo(-8, 0.3, -26);
  g.cubo(-6.6, 0.3, -27.2);
}
