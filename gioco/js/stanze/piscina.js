// Il corridoio allagato: piastrelle dipinte a nuvole su un lato, quadri sull'altro,
// luci lilla a parete. L'acqua non è ferma: scorre verso la porta rossa in fondo
// e trascina appena chi ci cammina dentro.
import * as THREE from 'three';
import { geoTonda } from '../engine/mondo.js';
import { canvasTex, materialeTri } from '../engine/materiali.js';
import { creaAcqua } from '../engine/acqua.js';
import { apertura, nicchia, collega } from '../engine/varchi.js';
import { cartelloStanza, miiLiminale, tappa } from '../engine/liminale.js';

const X0 = 40.3, X1 = 70, Z0 = 17, Z1 = 21, H = 3.2;

export function costruisci(m, g) {
  const piastrelle = (fondo, fuga, n) => canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fuga;
    const p = w / n;
    for (let i = 0; i < n; i++) { ctx.fillRect(i * p, 0, 2, h); ctx.fillRect(0, i * p, w, 2); }
  });
  const nuvole = canvasTex(1024, 512, (ctx, w, h) => {
    const gr = ctx.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#5f97d8');
    gr.addColorStop(1, '#8fb9ea');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 14; i++) {
      const cx = (i * 173) % w, cy = 60 + ((i * 97) % (h - 120));
      for (let k = 0; k < 6; k++) {
        ctx.beginPath();
        ctx.arc(cx + (k - 2.5) * 22 + Math.sin(k * 3 + i) * 8, cy + Math.cos(k * 2 + i) * 12, 26 + ((k * 7 + i) % 3) * 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = 'rgba(40,60,90,0.35)';
    for (let x = 0; x < w; x += 32) ctx.fillRect(x, 0, 2, h);
    for (let y = 0; y < h; y += 32) ctx.fillRect(0, y, w, 2);
  });
  const mat = {
    pavimento: materialeTri(piastrelle('#9ed3db', '#6fa9b2', 8), 0.8, 0.8, 'pis-pav'),
    muro: materialeTri(piastrelle('#f1e8ee', '#cdbfca', 8), 0.8, 0.8, 'pis-muro'),
    soffitto: materialeTri(piastrelle('#e7dfeb', '#c5bbca', 4), 0.5, 0.5, 'pis-soff'),
    battiscopa: new THREE.MeshLambertMaterial({ color: 0xa9c9cf }),
    cornice: new THREE.MeshLambertMaterial({ color: 0xc8b9c6 }),
  };
  m.stanza({
    nome: 'piscina', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H,
    pareti: {
      w: { aperture: [{ a: 18, b: 20.4, y0: 0, y1: 2.8 }] },
      n: { pannelli: [{ id: 'piscina-inizio', a: 41.2, b: 44.6, y0: 0, y1: 2.6 }] },
      s: { pannelli: [{ id: 'piscina-fine', a: 64, b: 67.6, y0: 0, y1: 2.6 }] },
      e: { aperture: [apertura(19)] },
    },
    materiali: mat, luciPunto: false, ala: 'transito', passi: 'acqua',
    acqua: { livello: 0.35, corrente: [0, 0] },
    atmosfera: { nebbia: 0xcdc1d8, vicino: 6, lontano: 46, cielo: 0xf3ecff, terra: 0x7fb0bb, intensita: 2.3 },
    suono: { ronzio: 0.3, acqua: 1 },
  });
  // soglia all'ingresso: trattiene l'acqua
  m.tondo(X0, 0, 18, X0 + 0.3, 0.3, 20.4, mat.muro, { r: 0.04 });

  // parete nord dipinta a nuvole (fascia bassa)
  m.box(45, 0, Z0, X1, 2.1, Z0 + 0.02, materialeTri(nuvole, 0.25, 0.5, 'pis-nuv'), { solido: false });

  // corrimano su entrambe le pareti
  const metallo = new THREE.MeshLambertMaterial({ color: 0xa8a9ad, emissive: 0x151515 });
  for (const z of [Z0 + 0.09, Z1 - 0.09]) {
    const tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, X1 - X0 - 0.6, 10), metallo);
    tubo.rotation.z = Math.PI / 2;
    tubo.position.set((X0 + X1) / 2 + 0.3, 0.95, z);
    m.scene.add(tubo);
    for (let x = X0 + 1.5; x < X1; x += 2.5) {
      const staffa = new THREE.Mesh(geoTonda(0.03, 0.03, 0.09, 0.01), metallo);
      staffa.position.set(x, 0.95, z + (z < 19 ? -0.045 : 0.045));
      m.scene.add(staffa);
    }
  }

  // quadri sulla parete sud: astratti, colori pastello
  const palette = [['#e9b7c9', '#7db5c9', '#f4e3b1'], ['#b9c8f0', '#f0c1a3', '#7fa58f'], ['#f2d0e2', '#9c8bd6', '#d8eef0']];
  for (let i = 0, x = X0 + 3; x < 63; i++, x += 4) {
    const [a, b, c] = palette[i % 3];
    const t = canvasTex(128, 160, (ctx, w, h) => {
      ctx.fillStyle = a; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = b; ctx.beginPath(); ctx.arc(w * 0.4, h * 0.45, 34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c; ctx.fillRect(w * 0.15, h * 0.7, w * 0.7, 18);
    });
    const cornice = new THREE.Mesh(geoTonda(0.66, 0.82, 0.04, 0.015), new THREE.MeshLambertMaterial({ color: 0x3a3236 }));
    cornice.position.set(x, 1.85, Z1 - 0.025);
    const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.72), new THREE.MeshLambertMaterial({ map: t }));
    tela.position.set(x, 1.85, Z1 - 0.047);
    tela.rotation.y = Math.PI;
    m.scene.add(cornice, tela);
  }

  // lampade a parete, luce lilla
  const lilla = new THREE.MeshBasicMaterial({ color: 0xf3e6ff, fog: false });
  for (let x = X0 + 2; x < X1; x += 5) {
    for (const z of [Z0 + 0.12, Z1 - 0.12]) {
      const corpo = new THREE.Mesh(geoTonda(0.55, 0.16, 0.22, 0.05), lilla);
      corpo.position.set(x, H - 0.35, z);
      corpo.rotation.x = z < 19 ? 0.35 : -0.35;
      m.scene.add(corpo);
    }
    m.luce(x, H - 0.6, 19, 2.2, 7, 0xe6d2ff);
  }

  // l'acqua scorre all'indietro, verso l'ingresso: nel tratto centrale trascina più forte di quanto si cammini
  creaAcqua(m, X0 + 0.3, Z0, X1, Z1, 0.35, { flusso: [-1.1, 0.02], colore: 0x3d97a6, riflesso: 0xf3eaff, opacita: 0.5 });
  m.vincoli.push((c, dt) => {
    const p = c.pos;
    if (p.x > 45 && p.x < 63 && p.z > Z0 && p.z < Z1 && p.y - c.half.y < 0.35 && p.y < 3) p.x -= 3.2 * dt;
  });

  // la porta rossa in fondo
  const rosso = new THREE.MeshBasicMaterial({ color: 0xff2a3a, fog: false });
  // la porta rossa: un telaio rosso acceso attorno al passaggio verso middleManPS4
  for (const [z0, z1] of [[18.15, 18.35], [19.65, 19.85]]) m.box(X1 - 0.08, 0, z0, X1 - 0.02, 2.4, z1, rosso, { solido: false });
  m.box(X1 - 0.08, 2.3, 18.15, X1 - 0.02, 2.45, 19.85, rosso, { solido: false });
  nicchia(m, [X1, 0, 19, -Math.PI / 2]);
  collega(g, 'piscina-middleman', [X1, 0, 19, -Math.PI / 2], [110, 0, 0, 0]);
  m.luce(X1 - 0.8, 1.4, 19, 3, 7, 0xff3344);

  const cartello = cartelloStanza(m, g, X0 + 1.5, 2.6, Z1 - 0.06, Math.PI, 1848);
  // il ricordo di questo transito: l'Erasmus a Siviglia, oltre la corrente
  const t = tappa(m, g, 'erasmus', 67.2, 0, Z0 + 0.06, 0);
  const mii = miiLiminale(m, g, 'piscina', 69, 0, 19.6, -Math.PI / 2, [0, 1]);
  g.puntoControllo('piscina', X0 + 0.9, 0, 19.2, -Math.PI / 2);
  return { debug: { varchi: [{ id: 'piscina-middleman', da: 'piscina', a: 'middleman', lato: [X1, 0, 19, -Math.PI / 2] }], tappa: t, mii: mii.posto, cartello: () => cartello.testo, risolvi: () => { g.giocatore().pos.set(66, 0.86, 19.2); g.giocatore().vel.set(0, 0, 0); } } };
}
