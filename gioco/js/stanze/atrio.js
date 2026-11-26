// Atrio: un centro commerciale chiuso, a luci quasi spente. Due scale mobili che
// funzionano ancora (una sale, una scende), la balconata a vetri, le cupole delle
// telecamere. A est un corridoio verdastro con l'insegna d'uscita in fondo.
import * as THREE from 'three';
import { geoTonda } from '../engine/mondo.js';
import { canvasTex, texTesto, materialeTri } from '../engine/materiali.js';

export function costruisci(m, g) {
  const tex = m.mat.tex;
  const mat = {
    pavimento: materialeTri(tex.pavimento, 0.5, 0.5, 'atrio-pav', { color: 0x9a957c }),
    muro: materialeTri(tex.muro, 0.5, 0.5, 'atrio-muro', { color: 0xbab496 }),
    soffitto: materialeTri(tex.soffitto, 1, 1, 'atrio-soff', { color: 0xa29e84 }),
    battiscopa: new THREE.MeshLambertMaterial({ color: 0x5a5a4a }),
    cornice: new THREE.MeshLambertMaterial({ color: 0x6d6b58 }),
  };
  const caldo = new THREE.MeshBasicMaterial({ color: 0xfff1d2, fog: false });
  const scuro = new THREE.MeshLambertMaterial({ color: 0x24251f });
  const metallo = new THREE.MeshLambertMaterial({ color: 0x8d9093, emissive: 0x111111 });
  const vetro = new THREE.MeshLambertMaterial({ color: 0xbfd2d6, transparent: true, opacity: 0.22, depthWrite: false });
  const fascia = new THREE.MeshLambertMaterial({ color: 0x3c3e40 });

  m.stanza({
    nome: 'atrio', x0: -12, x1: 12, z0: 8, z1: 32, h: 8,
    pareti: {
      n: { aperture: [{ a: -1, b: 1, y0: 0, y1: 2.6 }] },
      e: { aperture: [{ a: 18, b: 20.4, y0: 0, y1: 2.8 }] },
    },
    materiali: mat, matNeon: caldo,
    luci: [[-3, 13, 1.2, 1.2], [6, 18, 1.2, 1.2]], intensita: 2.2, raggio: 10, coloreLuce: 0xffe9c2,
    atmosfera: { nebbia: 0x24251c, vicino: 5, lontano: 42, cielo: 0xb8b48a, terra: 0x2a2a20, intensita: 1.5 },
    suono: { ronzio: 0.45 },
  });

  // balconata (mezzanino) sul lato sud
  m.box(-12, 3.7, 24, 12, 4, 32, mat.pavimento);
  m.box(-12, 3.3, 23.85, 12, 4.02, 24.05, fascia, { solido: false });
  // parapetto in vetro, con un varco per l'arrivo delle scale mobili
  for (const [a, b] of [[-12, -6.2], [-2.6, 12]]) {
    m.box(a, 4, 24.0, b, 5.0, 24.04, vetro, { solido: false });
    m.tondo(a, 5.0, 23.96, b, 5.06, 24.08, metallo, { r: 0.025, solido: false });
    m.box(a, 4, 23.9, b, 5.3, 24.1, mat.muro).mesh.visible = false;
  }
  // pilastri
  for (const [x, z] of [[-8.5, 24], [8.5, 24], [-8.5, 14], [8.5, 14]]) {
    m.tondo(x - 0.6, 0, z - 0.6, x + 0.6, 8, z + 0.6, mat.muro, { r: 0.05 });
    m.ombra(x, 0, z, 2.2, 2.2);
  }

  // scale mobili: due corsie, una sale e una scende; i gradini scorrono davvero
  const texGradini = canvasTex(64, 64, (ctx, w, h) => {
    ctx.fillStyle = '#1b1c1d';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#3a3c3f';
    for (let x = 0; x < w; x += 6) ctx.fillRect(x, 0, 3, h);
    ctx.fillStyle = '#c9a646';
    ctx.fillRect(0, 0, w, 3);
  });
  const lunghezza = Math.hypot(12, 4);
  const angolo = Math.atan2(4, 12);
  const corsie = [{ x0: -6.0, x1: -4.5, verso: 1 }, { x0: -4.3, x1: -2.8, verso: -1 }];
  const mappe = [];
  for (const c of corsie) {
    const cx = (c.x0 + c.x1) / 2;
    const w = c.x1 - c.x0;
    const gruppo = new THREE.Group();
    gruppo.position.set(cx, 2, 18);
    gruppo.rotation.x = -angolo;
    const t = texGradini.clone();
    t.repeat.set(1, lunghezza / 0.4);
    t.needsUpdate = true;
    mappe.push([t, c.verso]);
    const nastro = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.2, lunghezza + 0.6), new THREE.MeshLambertMaterial({ map: t }));
    nastro.rotation.x = -Math.PI / 2;
    nastro.position.y = 0.01;
    gruppo.add(nastro);
    for (const s of [-1, 1]) {
      const lato = new THREE.Mesh(geoTonda(0.08, 1.0, lunghezza + 1, 0.03), vetro);
      lato.position.set(s * (w / 2 - 0.02), 0.5, 0);
      const corrimano = new THREE.Mesh(geoTonda(0.12, 0.08, lunghezza + 1.2, 0.035), scuro);
      corrimano.position.set(s * (w / 2 - 0.02), 1.02, 0);
      gruppo.add(lato, corrimano);
    }
    const sotto = new THREE.Mesh(geoTonda(w + 0.1, 0.6, lunghezza + 0.6, 0.05), metallo);
    sotto.position.y = -0.31;
    gruppo.add(sotto);
    m.scene.add(gruppo);
    m.rampa({ x0: c.x0, x1: c.x1, z0: 12, z1: 24, asse: 'z', da: 0, a: 4, nastro: 0.7 * c.verso });
  }
  // fianchi invisibili: si sale solo dall'imbocco
  for (const x of [-6.15, -4.5, -2.8]) m.box(x, 0, 12.3, x + 0.15, 6, 23.9, mat.muro).mesh.visible = false;
  m.ombra(-4.4, 0, 12.6, 4, 2.4);
  m.ogniFrame((dt) => { for (const [t, v] of mappe) t.offset.y -= dt * 0.7 * v / 0.4; });

  // faretti incassati e cupole delle telecamere
  for (const [x, z] of [[-9, 10], [0, 10], [9, 10], [-9, 20], [0, 22], [10, 28], [-10, 28]]) {
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.14, 20), caldo);
    d.rotation.x = Math.PI / 2;
    d.position.set(x, 7.99, z);
    m.scene.add(d);
    m.luce(x, 7.6, z, 1.4, 8, 0xffdcaa);
  }
  for (const [x, y, z] of [[10.5, 7.95, 12], [-10.5, 3.65, 30], [4, 7.95, 23]]) {
    const cupola = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), scuro);
    cupola.position.set(x, y, z);
    m.scene.add(cupola);
  }

  // porte di servizio sotto la balconata, cestino
  for (const x of [-4, 3]) {
    m.tondo(x - 0.55, 0, 31.94, x + 0.55, 2.2, 32.0, scuro, { r: 0.02, solido: false });
    m.tondo(x + 0.3, 1.0, 31.9, x + 0.42, 1.04, 31.94, metallo, { r: 0.01, solido: false });
  }
  const cestino = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.8, 20), metallo);
  cestino.position.set(10.2, 0.4, 21.5);
  m.scene.add(cestino);
  m.box(9.92, 0, 21.22, 10.48, 0.8, 21.78, metallo).mesh.visible = false;
  m.ombra(10.2, 0, 21.5, 0.9, 0.9);

  // insegna d'uscita (rossa) sopra il passaggio a est
  const insegna = (x, y, z, ry) => {
    const t = texTesto(256, 96, (ctx, w, h) => {
      ctx.fillStyle = '#2a0b0b';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ff4a3d';
      ctx.font = '800 54px Archivo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.T().sale.uscita.toUpperCase(), w / 2, 68);
    });
    t.ridisegna();
    g.suLingua(() => t.ridisegna());
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.23), new THREE.MeshBasicMaterial({ map: t, fog: false }));
    s.position.set(x, y, z);
    s.rotation.y = ry;
    m.scene.add(s);
    m.luce(x + Math.sin(ry) * 0.4, y - 0.2, z + Math.cos(ry) * 0.4, 0.8, 3, 0xff3b30);
  };
  insegna(11.97, 3.05, 19.2, -Math.PI / 2);

  // corridoio d'uscita, verdastro, lungo
  const matCorr = {
    pavimento: materialeTri(tex.pavimento, 0.8, 0.8, 'usc-pav', { color: 0x7d8a78 }),
    muro: materialeTri(tex.muro, 0.5, 0.5, 'usc-muro', { color: 0xa3ae9a }),
    soffitto: materialeTri(tex.soffitto, 1, 1, 'usc-soff', { color: 0x8c967f }),
    battiscopa: new THREE.MeshLambertMaterial({ color: 0x4e574a }),
    cornice: new THREE.MeshLambertMaterial({ color: 0x5c6556 }),
  };
  const verde = new THREE.MeshBasicMaterial({ color: 0xdff5d9, fog: false });
  const luciC = [];
  for (let x = 15; x < 40; x += 4) luciC.push([x, 19.2, 0.25, 1.4]);
  m.stanza({
    nome: 'uscita', x0: 12.3, x1: 40, z0: 18, z1: 20.4, h: 2.8, pareti: { w: false, e: false },
    materiali: matCorr, matNeon: verde, luci: luciC, intensita: 1.1, raggio: 5, coloreLuce: 0xcff0c8,
    atmosfera: { nebbia: 0x151b15, vicino: 2, lontano: 30, cielo: 0x84a083, terra: 0x182018, intensita: 0.9 },
    suono: { ronzio: 0.9 },
  });
  for (let x = 17; x < 39; x += 7) {
    const lato = x % 2 ? 18.02 : 20.38;
    m.tondo(x - 0.5, 0, Math.min(lato, lato + (lato > 19 ? -0.05 : 0.05)), x + 0.5, 2.1, Math.max(lato, lato + (lato > 19 ? -0.05 : 0.05)), scuro, { r: 0.015, solido: false });
  }
  insegna(39.9, 2.55, 19.2, -Math.PI / 2);
}
