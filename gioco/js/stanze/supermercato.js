// Il supermercato: aperto, illuminato a giorno, vuoto. Scaffali pieni di prodotti
// senza nome, banchi frigo, cartelli delle corsie appesi. Il ronzio è più forte.
import * as THREE from 'three';
import { geoTonda } from '../engine/mondo.js';
import { canvasTex, texTesto, materialeTri } from '../engine/materiali.js';

const X0 = 450, X1 = 480, Z0 = 0, Z1 = 32, H = 4.5;

export function costruisci(m, g) {
  const pavimento = canvasTex(256, 256, (ctx, w, h) => {
    const n = 4, p = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      ctx.fillStyle = (i + j) % 4 === 0 ? '#7e8582' : '#eef1ee';
      ctx.fillRect(i * p, j * p, p, p);
    }
    ctx.fillStyle = '#c3c9c5';
    for (let i = 0; i < n; i++) { ctx.fillRect(i * p, 0, 2, h); ctx.fillRect(0, i * p, w, 2); }
  });
  const mat = {
    pavimento: materialeTri(pavimento, 0.42, 0.42, 'sup-pav'),
    muro: materialeTri(m.mat.tex.muro, 0.5, 0.5, 'sup-muro', { color: 0xf3f6f1 }),
    soffitto: materialeTri(m.mat.tex.soffitto, 1, 1, 'sup-soff', { color: 0xf4f6f2 }),
    battiscopa: new THREE.MeshLambertMaterial({ color: 0x9aa59c }),
  };
  const tubi = [];
  for (let x = X0 + 2.5; x < X1; x += 5) for (let z = Z0 + 4; z < Z1 - 2; z += 6) tubi.push([x, z, 0.16, 4.8]);
  m.stanza({
    nome: 'supermercato', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H,
    materiali: mat, luci: tubi, intensita: 2.2, raggio: 8, coloreLuce: 0xf8fff4,
    atmosfera: { nebbia: 0xe6ede7, vicino: 8, lontano: 55, cielo: 0xffffff, terra: 0xd0d8d0, intensita: 3.2 },
    suono: { ronzio: 1.8 },
  });

  // prodotti: file di confezioni colorate senza marca, con le etichette dei prezzi
  const prodotti = canvasTex(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#d9dcd8';
    ctx.fillRect(0, 0, w, h);
    const ripiani = 4, hr = h / ripiani;
    for (let r = 0; r < ripiani; r++) {
      let x = 2;
      while (x < w - 4) {
        const larg = 14 + Math.random() * 22;
        const alto = hr * (0.55 + Math.random() * 0.35);
        const hue = Math.floor(Math.random() * 360);
        ctx.fillStyle = `hsl(${hue}, ${45 + Math.random() * 35}%, ${45 + Math.random() * 25}%)`;
        ctx.fillRect(x, (r + 1) * hr - 8 - alto, larg - 2, alto);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(x + 3, (r + 1) * hr - 8 - alto * 0.7, larg - 8, 4);
        x += larg;
      }
      ctx.fillStyle = '#f4f4f0';
      ctx.fillRect(0, (r + 1) * hr - 8, w, 8);
      ctx.fillStyle = '#e8c14a';
      for (let k = 10; k < w; k += 60) ctx.fillRect(k, (r + 1) * hr - 7, 14, 6);
    }
  });
  const matProdotti = materialeTri(prodotti, 0.25, 0.5, 'sup-prod');
  const matScaffale = new THREE.MeshLambertMaterial({ color: 0xe9ece8 });
  const corsie = [455, 460, 465, 470, 475];
  for (const x of corsie) {
    m.box(x - 0.6, 0, 5, x + 0.6, 2.0, 25, matProdotti);
    m.tondo(x - 0.66, 2.0, 4.94, x + 0.66, 2.1, 25.06, matScaffale, { r: 0.03, solido: false });
    m.tondo(x - 0.66, 0, 4.94, x + 0.66, 0.12, 25.06, matScaffale, { r: 0.02, solido: false });
    for (const z of [4.9, 25.1]) m.tondo(x - 0.62, 0, Math.min(z, z + (z < 10 ? -0.06 : 0.06)), x + 0.62, 1.8, Math.max(z, z + (z < 10 ? -0.06 : 0.06)), matScaffale, { r: 0.03, solido: false });
    m.ombra(x, 0, 15, 2.4, 21);
  }

  // cartelli delle corsie appesi
  for (let k = 0; k < corsie.length - 1; k++) {
    const x = (corsie[k] + corsie[k + 1]) / 2;
    const t = texTesto(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#2f7d5a';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 150px Archivo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(k + 1), w / 2, 180);
    });
    t.ridisegna();
    const cartello = new THREE.Mesh(geoTonda(0.7, 0.7, 0.05, 0.04), [0, 0, 0, 0, 1, 1].map((v) => (v ? new THREE.MeshLambertMaterial({ map: t }) : new THREE.MeshLambertMaterial({ color: 0x2f7d5a }))));
    cartello.position.set(x, 3.4, 4.5);
    m.scene.add(cartello);
    for (const dx of [-0.25, 0.25]) {
      const filo = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, H - 3.75, 4), matScaffale);
      filo.position.set(x + dx, 3.75 + (H - 3.75) / 2, 4.5);
      m.scene.add(filo);
    }
  }

  // banchi frigo lungo la parete est
  const vetro = new THREE.MeshLambertMaterial({ color: 0xcfe7ee, transparent: true, opacity: 0.35, depthWrite: false });
  const freddo = new THREE.MeshBasicMaterial({ color: 0xe9f7ff, fog: false });
  for (let z = 4; z < 28; z += 4.2) {
    m.tondo(477, 0, z, 479.7, 0.85, z + 4, matScaffale, { r: 0.05 });
    m.box(477.15, 0.85, z + 0.1, 479.55, 0.86, z + 3.9, freddo, { solido: false });
    m.tondo(477.05, 0.86, z + 0.05, 479.65, 1.0, z + 3.95, vetro, { r: 0.04, solido: false });
    m.ombra(478.35, 0, z + 2, 3.6, 4.6);
  }

  // fascia a scacchi e insegna del banco gastronomia sulla parete nord
  const scacchi = canvasTex(128, 32, (ctx, w, h) => {
    for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? '#b8332f' : '#f5f1ea'; ctx.fillRect(i * 16, j * 16, 16, 16); }
  });
  m.box(X0 + 6, 3.2, Z1 - 0.03, X1 - 6, 3.6, Z1, materialeTri(scacchi, 1.25, 2.5, 'sup-scac'), { solido: false });
  const insegna = texTesto(512, 128, (ctx, w, h) => {
    ctx.fillStyle = '#b8332f';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 700 64px Archivo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.T().sale.gastronomia, w / 2, 86);
  });
  insegna.ridisegna();
  g.suLingua(() => insegna.ridisegna());
  const tabella = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), new THREE.MeshLambertMaterial({ map: insegna }));
  tabella.position.set(465, 3.95, Z1 - 0.05);
  tabella.rotation.y = Math.PI;
  m.scene.add(tabella);
  m.tondo(458, 0, Z1 - 1.2, 472, 1.1, Z1 - 0.2, matScaffale, { r: 0.06 });
  m.tondo(458.05, 1.1, Z1 - 1.15, 471.95, 1.45, Z1 - 0.95, vetro, { r: 0.05, solido: false });

  // l'uscita, in fondo a destra
  const porta = new THREE.MeshLambertMaterial({ color: 0x3f4a46 });
  m.tondo(X1 - 3.5, 0, Z1 - 0.06, X1 - 1.5, 2.3, Z1, porta, { r: 0.02, solido: false });
  m.zona('uscita-super', X1 - 3.6, -1, Z1 - 1.0, X1 - 1.4, 3, Z1, { ripeti: true });
  g.su('uscita-super', () => g.teletrasporta(521.5, 0, 1.5, Math.PI));
}
