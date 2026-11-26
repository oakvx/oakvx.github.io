// L'archivio, oltre la balconata: il percorso di Gabri in ordine. La scrivania in
// fondo chiude il finale "Il dipendente modello".
import * as THREE from 'three';

export function costruisci(m, g) {
  const y0 = 3.5;
  m.stanza({
    nome: 'archivio', x0: -7, x1: -0.5, z0: -44, z1: -36.3, y0, h: 3,
    pareti: { s: false },
    luci: [[-3.75, -38.5, 0.6, 1.2], [-3.75, -42, 0.6, 1.2]], intensita: 2.6, raggio: 6,
  });

  // quattro targhe del percorso, due per lato
  const posizioni = [
    [-6.99, -38.6, Math.PI / 2], [-6.99, -41.4, Math.PI / 2],
    [-0.51, -38.6, -Math.PI / 2], [-0.51, -41.4, -Math.PI / 2],
  ];
  const tex = posizioni.map((_, i) => g.texTesto(512, 320, (ctx, w, h) => {
    const [anni, dove, cosa] = g.T().archivio[i];
    ctx.fillStyle = '#f6f8f9';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#b5c0c6';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = '#2f6f86';
    ctx.font = '650 30px Archivo, sans-serif';
    ctx.fillText(anni, 36, 70);
    ctx.fillStyle = '#1d252b';
    ctx.font = '750 40px Archivo, sans-serif';
    ctx.fillText(dove, 36, 130);
    ctx.fillStyle = '#4b5860';
    ctx.font = '400 24px Archivo, sans-serif';
    const parole = cosa.split(' ');
    let riga = '';
    let y = 185;
    for (const p of parole) {
      const prova = riga ? riga + ' ' + p : p;
      if (ctx.measureText(prova).width > w - 72) { ctx.fillText(riga, 36, y); riga = p; y += 34; } else riga = prova;
    }
    ctx.fillText(riga, 36, y);
  }));
  posizioni.forEach(([x, z, ry], i) => {
    const t = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.875), new THREE.MeshLambertMaterial({ map: tex[i] }));
    t.position.set(x, y0 + 1.6, z);
    t.rotation.y = ry;
    m.scene.add(t);
  });
  const ridisegna = () => tex.forEach((t) => t.ridisegna());
  ridisegna();
  g.suLingua(ridisegna);

  // scrivania
  m.tondo(-5, y0 + 0.72, -43.4, -2.5, y0 + 0.78, -42.5, m.mat.legno, { r: 0.02 });
  for (const [x, z] of [[-4.9, -43.3], [-2.6, -43.3], [-4.9, -42.6], [-2.6, -42.6]]) m.tondo(x - 0.03, y0, z - 0.03, x + 0.03, y0 + 0.72, z + 0.03, m.mat.scuro, { r: 0.015, solido: false });
  m.box(-5, y0, -43.4, -2.5, y0 + 0.72, -42.5, m.mat.chiaro).mesh.visible = false;
  m.ombra(-3.75, y0, -42.95, 3.2, 1.4);
  g.arredi.cartello(-2.5, y0 + 2.62, -36.33, Math.PI, '05', () => g.T().sale.archivio);
  const lampada = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.3), m.mat.neon);
  lampada.position.set(-3.75, y0 + 0.8, -42.95);
  m.scene.add(lampada);
  m.zona('scrivania', -5.5, y0 - 0.5, -42.5, -2, y0 + 2.5, -41.3);
}
