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
    luci: [[-7, -25, 0.8, 1.6], [-7, -29.5, 0.8, 1.6], [-7, -34, 0.8, 1.6]], intensita: 6, raggio: 10,
  });

  // balconata rialzata sul lato nord
  m.box(-14, 0, -36, -0.5, 3.5, -32.5, mat.pavimento);
  // ringhiera bassa (solo visiva sopra il bordo)
  m.box(-14, 3.5, -32.56, -0.5, 3.6, -32.5, mat.cornice, { solido: false });
  // colonna che nasconde il pannello proibito
  m.box(-2.6, 0, -31.6, -1.6, 7, -30.6, mat.muro);

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
