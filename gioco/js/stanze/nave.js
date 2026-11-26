// La nave: interno di un vecchio transatlantico. Pannelli di legno, moquette a fiori,
// colonne con fasce d'ottone, applique calde. Il pavimento ondeggia appena e il legno
// scricchiola. La scala sale verso il ponte, e il ponte non è dove ci si aspetta.
import * as THREE from 'three';
import { geoTonda } from '../engine/mondo.js';
import { canvasTex, materialeTri } from '../engine/materiali.js';

const X0 = 520, X1 = 532, Z0 = 0, Z1 = 14, H = 2.7;

export function costruisci(m, g) {
  const legno = canvasTex(256, 256, (ctx, w, h) => {
    for (let x = 0; x < w; x++) {
      const v = Math.sin(x * 0.21) * 8 + Math.sin(x * 0.047) * 14 + Math.random() * 6;
      ctx.fillStyle = `rgb(${120 + v},${72 + v * 0.6},${38 + v * 0.3})`;
      ctx.fillRect(x, 0, 1, h);
    }
    ctx.fillStyle = 'rgba(50,25,10,0.6)';
    ctx.fillRect(0, 0, 3, h);
    ctx.fillRect(0, 0, w, 3);
    ctx.strokeStyle = 'rgba(255,220,170,0.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, w - 32, h - 32);
  });
  const moquette = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#8f2f2c';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2000; i++) { ctx.fillStyle = `rgba(${60 + Math.random() * 60},20,20,0.25)`; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    const fiore = (x, y, s, c1, c2) => {
      ctx.fillStyle = c1;
      for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * s, y + Math.sin(a) * s, s * 0.8, s * 0.45, a, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = c2;
      ctx.beginPath(); ctx.arc(x, y, s * 0.55, 0, Math.PI * 2); ctx.fill();
    };
    for (const [x, y] of [[64, 64], [192, 192], [192, 64], [64, 192]]) fiore(x, y, 14, '#d9b26b', '#3f6b4a');
    for (const [x, y] of [[0, 128], [128, 0], [128, 128], [256, 128], [128, 256]]) fiore(x, y, 9, '#e7c9a3', '#6d2320');
  });
  const mat = {
    pavimento: materialeTri(moquette, 0.9, 0.9, 'nave-pav'),
    muro: materialeTri(legno, 0.9, 0.6, 'nave-muro'),
    soffitto: new THREE.MeshLambertMaterial({ color: 0xe9e0cd }),
    battiscopa: new THREE.MeshLambertMaterial({ color: 0x4a2a17 }),
    cornice: new THREE.MeshLambertMaterial({ color: 0x5a3520 }),
  };
  m.stanza({
    nome: 'nave', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H, soffitto: false, ondeggia: true,
    materiali: mat,
    atmosfera: { nebbia: 0x2a1b12, vicino: 3, lontano: 22, cielo: 0xffd9a8, terra: 0x3a2214, intensita: 1.5 },
    suono: { ronzio: 0.1, legno: 1 },
  });
  // soffitto con il vano della scala
  const soff = mat.soffitto;
  const T = 0.3;
  m.box(X0 - T, H, Z0 - T, 528.5, H + T, Z1 + T, soff);
  m.box(531.5, H, Z0 - T, X1 + T, H + T, Z1 + T, soff);
  m.box(528.5, H, Z0 - T, 531.5, H + T, 8, soff);
  m.box(528.5, H, 12, 531.5, H + T, Z1 + T, soff);
  // sopra il vano: un buio caldo
  m.box(528.2, H + T, 7.7, 531.8, H + 3, 12.3, new THREE.MeshBasicMaterial({ color: 0x1a0f09 }), { solido: false });

  // colonne di legno con fasce d'ottone
  const ottone = m.mat.ottone;
  const legnoScuro = new THREE.MeshLambertMaterial({ color: 0x6b3d1f });
  for (const [x, z] of [[523.5, 4.5], [523.5, 9.5], [527, 4.5]]) {
    m.tondo(x - 0.22, 0, z - 0.22, x + 0.22, H, z + 0.22, legnoScuro, { r: 0.08 });
    for (const y of [0.15, H - 0.2]) m.tondo(x - 0.25, y - 0.05, z - 0.25, x + 0.25, y + 0.05, z + 0.25, ottone, { r: 0.04, solido: false });
    m.ombra(x, 0, z, 1, 1);
  }
  // tavolo tondo
  const piano = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.05, 32), legnoScuro);
  piano.position.set(521.6, 0.75, 7);
  const gamba = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.2, 0.75, 16), legnoScuro);
  gamba.position.set(521.6, 0.375, 7);
  m.scene.add(piano, gamba);
  m.box(521.1, 0, 6.5, 522.1, 0.78, 7.5, legnoScuro).mesh.visible = false;
  m.ombra(521.6, 0, 7, 1.4, 1.4);

  // applique calde sulle pareti
  const vetroCaldo = new THREE.MeshBasicMaterial({ color: 0xffe2b0, fog: false });
  for (const [x, z, ry] of [[X0 + 0.08, 3, 0], [X0 + 0.08, 11, 0], [X1 - 0.08, 3, 0], [526, Z1 - 0.08, 0], [524, Z0 + 0.08, 0]]) {
    const globo = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 10), vetroCaldo);
    globo.position.set(x, 1.9, z);
    m.scene.add(globo);
    m.luce(x + (x < 526 ? 0.4 : x > 531 ? -0.4 : 0), 1.9, z + (z < 1 ? 0.4 : z > 13 ? -0.4 : 0), 1.6, 6, 0xffc98a);
    void ry;
  }

  // la scala: gradini di legno con la passatoia, ringhiere ai lati
  const N = 12;
  for (let i = 0; i < N; i++) {
    const z = 5 + i * 0.5;
    const y = (i + 1) * (H / N);
    m.tondo(528.5, y - 0.06, z, 531.5, y, z + 0.5, legnoScuro, { r: 0.015, solido: false });
    m.box(529.2, y, z + 0.02, 530.8, y + 0.005, z + 0.48, materialeTri(moquette, 0.9, 0.9, 'nave-pav'), { solido: false });
  }
  m.rampa({ x0: 528.5, x1: 531.5, z0: 5, z1: 11, asse: 'z', da: 0, a: H });
  const inclinazione = Math.atan2(H, 6);
  for (const x of [528.45, 531.55]) {
    const ringhiera = new THREE.Mesh(geoTonda(0.08, 0.08, Math.hypot(6, H), 0.03), legnoScuro);
    ringhiera.position.set(x, H / 2 + 0.95, 8);
    ringhiera.rotation.x = -inclinazione;
    m.scene.add(ringhiera);
    for (let k = 0; k < 7; k++) {
      const z = 5.4 + k * 0.9;
      const y = (z - 5) / 6 * H;
      m.tondo(x - 0.025, y, z - 0.025, x + 0.025, y + 0.95, z + 0.025, ottone, { r: 0.01, solido: false });
    }
    m.box(x - 0.08, 0, 5, x + 0.08, 4, 11.5, legnoScuro).mesh.visible = false;
  }
  m.zona('ponte', 528.5, H - 0.6, 10.3, 531.5, H + 3, 12.5, { ripeti: true });
  g.su('ponte', () => g.teletrasporta(601.3, 30, 9, 0));
}
