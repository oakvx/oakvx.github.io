// La cisterna: archi su colonne a perdita d'occhio, acqua scura che scorre lenta,
// gocce dal soffitto. Al centro una scaletta sale verso un foro di luce.
import * as THREE from 'three';
import { cartelloStanza, miiLiminale, tappa } from '../engine/liminale.js';
import { canvasTex, materialeTri } from '../engine/materiali.js';
import { creaAcqua } from '../engine/acqua.js';

const X0 = 300, X1 = 336, Z0 = 0, Z1 = 36, H = 5.6, IMPOSTA = 2.4, PASSO = 6, COL = 0.7;

export function costruisci(m, g) {
  const piastrelle = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#9aa7ab';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) {
      const v = 120 + Math.random() * 50;
      ctx.fillStyle = `rgba(${v},${v + 8},${v + 12},0.25)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 3, 3);
    }
    ctx.fillStyle = '#6f7b80';
    for (let i = 0; i < 8; i++) { ctx.fillRect(i * 32, 0, 2, h); ctx.fillRect(0, i * 32, w, 2); }
  });
  const crepe = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#3c4a50';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#1d272b';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(i * 32, 0); ctx.lineTo(i * 32, h); ctx.moveTo(0, i * 32); ctx.lineTo(w, i * 32); ctx.stroke(); }
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 26; i++) {
      let x = Math.random() * w, y = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 5; k++) { x += (Math.random() - 0.5) * 30; y += (Math.random() - 0.5) * 30; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  });
  const muro = materialeTri(piastrelle, 0.8, 0.8, 'cis-muro', { color: 0xb5c2c6 });
  const mat = {
    pavimento: materialeTri(crepe, 0.6, 0.6, 'cis-pav'),
    muro,
    soffitto: materialeTri(piastrelle, 0.8, 0.8, 'cis-soff', { color: 0x7e8a8f }),
    battiscopa: new THREE.MeshLambertMaterial({ color: 0x55636a }),
    cornice: new THREE.MeshLambertMaterial({ color: 0x55636a }),
  };
  m.stanza({
    nome: 'cisterna', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H, ala: 'transito', passi: 'acqua',
    pareti: {
      w: { pannelli: [{ id: 'cisterna-basso', a: 14, b: 20, y0: 0, y1: 2.6 }] },
      e: { pannelli: [{ id: 'cisterna-alto', a: Z1 - 5, b: Z1 - 1, y0: 3, y1: H }] },
    },
    materiali: mat,
    acqua: { livello: 0.5, corrente: [0.12, 0.05] },
    atmosfera: { nebbia: 0x0b1215, vicino: 2, lontano: 28, cielo: 0x6a8894, terra: 0x0a0e10, intensita: 0.95 },
    suono: { ronzio: 0, acqua: 0.6, gocce: 1 },
  });

  // colonne e archi: un arco a tutto sesto tra ogni coppia di colonne vicine
  const r = (PASSO - COL) / 2;
  const forma = new THREE.Shape();
  forma.moveTo(-PASSO / 2, 0);
  forma.lineTo(-PASSO / 2, H - IMPOSTA);
  forma.lineTo(PASSO / 2, H - IMPOSTA);
  forma.lineTo(PASSO / 2, 0);
  forma.lineTo(r, 0);
  forma.absarc(0, 0, r, 0, Math.PI, false);
  forma.lineTo(-PASSO / 2, 0);
  const geoArco = new THREE.ExtrudeGeometry(forma, { depth: COL, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 28 });
  geoArco.translate(0, 0, -COL / 2);
  const colonne = [];
  for (let x = X0 + 3; x < X1; x += PASSO) for (let z = Z0 + 3; z < Z1; z += PASSO) colonne.push([x, z]);
  for (const [x, z] of colonne) {
    m.tondo(x - COL / 2, 0, z - COL / 2, x + COL / 2, IMPOSTA + 0.02, z + COL / 2, muro, { r: 0.05 });
    if (x + PASSO < X1) {
      const a = new THREE.Mesh(geoArco, muro);
      a.position.set(x + PASSO / 2, IMPOSTA, z);
      m.scene.add(a);
    }
    if (z + PASSO < Z1) {
      const a = new THREE.Mesh(geoArco, muro);
      a.position.set(x, IMPOSTA, z + PASSO / 2);
      a.rotation.y = Math.PI / 2;
      m.scene.add(a);
    }
  }

  // luce fioca e fredda qua e là
  for (const [x, z] of [[306, 6], [330, 12], [312, 30], [327, 27]]) m.luce(x, 4.6, z, 1.1, 9, 0x9ec2cf);

  // acqua scura che scorre lenta
  creaAcqua(m, X0, Z0, X1, Z1, 0.5, { flusso: [0.12, 0.05], colore: 0x0f2a31, riflesso: 0x6f9aa6, opacita: 0.78 });

  // il foro nel soffitto e la scaletta
  const LX = 318, LZ = 18;
  const foro = new THREE.Mesh(new THREE.CircleGeometry(0.62, 32), new THREE.MeshBasicMaterial({ color: 0xe9f2f0, fog: false }));
  foro.rotation.x = Math.PI / 2;
  foro.position.set(LX, H - 0.01, LZ);
  m.scene.add(foro);
  const anello = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.78, 32), new THREE.MeshBasicMaterial({ color: 0x24302f }));
  anello.rotation.x = Math.PI / 2;
  anello.position.set(LX, H - 0.012, LZ);
  m.scene.add(anello);
  m.luce(LX, H - 0.6, LZ, 4, 8, 0xd8ece8);
  // pedana alta nell'angolo sud-est: ci si arriva solo con le finestre; da lì si sale alla chiocciola
  m.box(X1 - 6, 0, Z1 - 6, X1, 3, Z1, mat.muro);
  m.zona('cisterna-su', X1 - 6, 3, Z1 - 6, X1, 6, Z1, { ripeti: true });
  g.su('cisterna-su', () => {
    if (g.inViaggio) return;
    g.inViaggio = true;
    g.teletrasporta(162.5, 0, 1.5, Math.PI, () => { g.inViaggio = false; });
  });
  // il ricordo di questo transito: Format, il software industriale
  const t = tappa(m, g, 'format', X0 + 15, 0, Z1 - 0.06, Math.PI);
  cartelloStanza(m, g, X0 + 4, 3.4, Z0 + 0.06, 0, 2113);
  const mii = miiLiminale(m, g, 'cisterna', X0 + 30, 0.5, Z0 + 4, Math.PI, [0, -1]);
  g.puntoControllo('cisterna', 301.5, 0, 18, -Math.PI / 2);
  return {
    debug: {
      mii: mii.posto,
      tappa: t,
      risolvi: () => { g.giocatore().pos.set(X1 - 3, 3.9, Z1 - 3); g.giocatore().vel.set(0, 0, 0); },
    },
  };
}
