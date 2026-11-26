// Fuori mappa: dietro le quinte. Le stanze si vedono come scheletri di linee, tra
// pezzi di codice che fluttuano. Ci si arriva solo con la finestra proibita.
import * as THREE from 'three';
import { T as SP } from '../engine/mondo.js';

export function costruisci(m, g) {
  const cx = -100, cz = -20;
  const s = m.stanza({ nome: 'fuori', x0: cx - 30, x1: cx + 30, z0: cz - 30, z1: cz + 30, h: 30, pareti: { n: false, s: false, e: false, w: false }, soffitto: false });
  void s;
  // bordi invisibili
  const inv = { solido: true };
  const b = (x0, z0, x1, z1) => { m.box(x0, 0, z0, x1, 6, z1, m.mat.chiaro, inv).mesh.visible = false; };
  b(cx - 30 - SP, cz - 30, cx - 30, cz + 30);
  b(cx + 30, cz - 30, cx + 30 + SP, cz + 30);
  b(cx - 30, cz - 30 - SP, cx + 30, cz - 30);
  b(cx - 30, cz + 30, cx + 30, cz + 30 + SP);

  const griglia = new THREE.GridHelper(60, 60, 0x9fb1ba, 0xc8d3d9);
  griglia.position.set(cx, 0.005, cz);
  m.scene.add(griglia);

  // scheletri delle stanze, alla rinfusa
  const linee = new THREE.LineBasicMaterial({ color: 0x6f8794 });
  const scheletri = [];
  const forme = [[8, 3.2, 8], [10, 3.2, 8], [13.5, 7, 14], [2, 2.6, 6], [13.5, 5, 14], [6.5, 3, 7.7]];
  forme.forEach(([w, h, d], i) => {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), linee);
    const a = (i / forme.length) * Math.PI * 2;
    e.position.set(cx + Math.cos(a) * 14, 2 + h / 2 + (i % 3), cz - 6 + Math.sin(a) * 12);
    e.rotation.set(0.1 * i, a, 0.05 * i);
    m.scene.add(e);
    scheletri.push(e);
  });

  // frammenti di codice che fluttuano
  const etichette = [];
  for (let i = 0; i < 7; i++) {
    const tex = g.texTesto(512, 64, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#3d5562';
      ctx.font = '500 30px "Cascadia Code", ui-monospace, monospace';
      ctx.fillText(g.T().fuori[i], 8, 42);
    });
    tex.ridisegna();
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, fog: true }));
    sp.scale.set(4, 0.5, 1);
    sp.position.set(cx - 10 + (i % 4) * 7, 1.6 + (i % 3) * 1.1, cz - 4 - Math.floor(i / 4) * 8 - (i % 2) * 3);
    m.scene.add(sp);
    etichette.push({ sp, tex, base: sp.position.y, f: 0.3 + i * 0.07 });
  }
  g.suLingua(() => etichette.forEach((e) => e.tex.ridisegna()));

  // cornice decorativa dove si arriva: la finestra mente, qui non c'è niente
  const cornice = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.1, 2)), new THREE.LineBasicMaterial({ color: 0xd95bb3 }));
  cornice.position.set(cx, 1.02, cz + 6.01);
  m.scene.add(cornice);

  m.ogniFrame((dt, t) => {
    scheletri.forEach((e, i) => { e.rotation.y += dt * 0.03 * (i % 2 ? 1 : -1); });
    etichette.forEach((e) => { e.sp.position.y = e.base + Math.sin(t * e.f) * 0.15; });
  });

  m.zona('fuori', cx - 30, -1, cz - 30, cx + 30, 10, cz + 30);
}
