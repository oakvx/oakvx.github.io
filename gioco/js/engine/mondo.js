// Costruzione del mondo: blocchi solidi, stanze con aperture e pannelli, trigger.
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../../vendor/three/addons/RoundedBoxGeometry.js';

export const T = 0.3; // spessore di pareti, pavimenti e soffitti

const geoBox = new THREE.BoxGeometry(1, 1, 1);
const geoNeon = new THREE.PlaneGeometry(1, 1);
const cacheTondi = new Map();

// geometria arrotondata, condivisa tra blocchi delle stesse misure
export function geoTonda(w, h, d, r = 0.03) {
  const k = [w, h, d, r].map((v) => v.toFixed(3)).join('|');
  if (!cacheTondi.has(k)) cacheTondi.set(k, new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * 0.999));
  return cacheTondi.get(k);
}

// ombra morbida di contatto (gradiente radiale)
let texOmbra = null;
function ombraTex() {
  if (texOmbra) return texOmbra;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, 'rgba(40,55,62,0.55)');
  g.addColorStop(0.55, 'rgba(40,55,62,0.22)');
  g.addColorStop(1, 'rgba(40,55,62,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  texOmbra = new THREE.CanvasTexture(c);
  return texOmbra;
}

export class Mondo {
  constructor(scene, mat) {
    this.scene = scene;
    this.mat = mat;
    this.solidi = [];
    this.pannelli = new Map();
    this.meshPannelli = [];
    this.trigger = [];
    this.interattivi = [];
    this.stanze = [];
    this.aggiornamenti = [];
    this.luci = [];       // definizioni: il gioco le assegna a un gruppo fisso di PointLight
    this.vincoli = [];    // rampe, scale, scalette: funzioni (corpo, dt, input)
  }

  // blocco solido (o solo visivo) da min a max
  box(x0, y0, z0, x1, y1, z1, mat, { solido = true, pannello = null, gruppo = this.scene } = {}) {
    const m = new THREE.Mesh(geoBox, mat);
    m.scale.set(x1 - x0, y1 - y0, z1 - z0);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.matrixAutoUpdate = false;
    m.updateMatrix();
    gruppo.add(m);
    if (!solido) return { mesh: m };
    const s = {
      min: new THREE.Vector3(x0, y0, z0),
      max: new THREE.Vector3(x1, y1, z1),
      mesh: m,
      pannello,
      attivo: true,
    };
    this.solidi.push(s);
    if (pannello) {
      m.userData.pannello = pannello;
      this.meshPannelli.push(m);
    }
    return s;
  }

  // blocco con spigoli arrotondati
  tondo(x0, y0, z0, x1, y1, z1, mat, { r = 0.03, solido = true, gruppo = this.scene } = {}) {
    const m = new THREE.Mesh(geoTonda(x1 - x0, y1 - y0, z1 - z0, r), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    gruppo.add(m);
    if (!solido) return { mesh: m };
    const s = { min: new THREE.Vector3(x0, y0, z0), max: new THREE.Vector3(x1, y1, z1), mesh: m, pannello: null, attivo: true };
    this.solidi.push(s);
    return s;
  }

  ombra(x, y, z, w, d) {
    const m = new THREE.Mesh(geoNeon, new THREE.MeshBasicMaterial({ map: ombraTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.scale.set(w, d, 1);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y + 0.003, z);
    m.renderOrder = 1;
    this.scene.add(m);
    return m;
  }

  // plafoniera: cornice arrotondata con il pannello luminoso incassato
  neon(x, y, z, w, d, mat = this.mat.neon) {
    const cornice = new THREE.Mesh(geoTonda(w + 0.14, 0.06, d + 0.14, 0.025), this.mat.cornice);
    cornice.position.set(x, y - 0.02, z);
    this.scene.add(cornice);
    const n = new THREE.Mesh(geoNeon, mat);
    n.scale.set(w, d, 1);
    n.position.set(x, y - 0.052, z);
    n.rotation.x = Math.PI / 2;
    this.scene.add(n);
    return n;
  }

  luce(x, y, z, intensita = 3, distanza = 8, colore = 0xf2f7ff) {
    const l = { position: new THREE.Vector3(x, y, z), intensity: intensita, distance: distanza, color: new THREE.Color(colore) };
    this.luci.push(l);
    return l;
  }

  // rampa (scale, scale mobili): pavimento inclinato lungo un asse, con nastro opzionale
  rampa({ x0, x1, z0, z1, asse = 'z', da, a, nastro = 0 }) {
    this.vincoli.push((c, dt) => {
      const p = c.pos;
      if (p.x < x0 || p.x > x1 || p.z < z0 || p.z > z1) return;
      const t = asse === 'z' ? (p.z - z0) / (z1 - z0) : (p.x - x0) / (x1 - x0);
      const h = da + (a - da) * t;
      const piedi = p.y - c.half.y;
      if (piedi > h + 0.45 || piedi < h - 0.7 || c.vel.y > 1) return;
      p.y = h + c.half.y + 0.001;
      c.vel.y = 0;
      c.aTerra = true;
      if (nastro) { if (asse === 'z') p.z += nastro * dt; else p.x += nastro * dt; }
    });
  }

  // scaletta: tenendo avanti si sale fino a cima
  scaletta({ x0, x1, z0, z1, y0, cima, suCima }) {
    this.vincoli.push((c, dt, input) => {
      const p = c.pos;
      if (p.x < x0 || p.x > x1 || p.z < z0 || p.z > z1) return;
      const piedi = p.y - c.half.y;
      if (piedi < y0 - 0.2 || piedi > cima + 0.5) return;
      if (input.avanti) {
        // agganciati ai pioli: niente spostamenti laterali mentre si sale
        c.pos.x = Math.min(x1 - 0.1, Math.max(x0 + 0.1, c.pos.x));
        c.pos.z = Math.min(z1 - 0.1, Math.max(z0 + 0.1, c.pos.z));
        c.vel.x = c.vel.z = 0;
        c.vel.y = 2.2;
        c.aTerra = false;
      }
      else if (piedi > y0 + 0.05) { c.vel.y = Math.max(c.vel.y, -1); }
      if (piedi >= cima && suCima) suCima();
    });
  }

  // zona che emette un evento quando il giocatore entra
  zona(nome, x0, y0, z0, x1, y1, z1, { ripeti = false } = {}) {
    const z = { nome, min: new THREE.Vector3(x0, y0, z0), max: new THREE.Vector3(x1, y1, z1), dentro: false, fatto: false, ripeti };
    this.trigger.push(z);
    return z;
  }

  controllaZone(p, emetti) {
    for (const z of this.trigger) {
      const dentro = p.x > z.min.x && p.x < z.max.x && p.y > z.min.y && p.y < z.max.y && p.z > z.min.z && p.z < z.max.z;
      if (dentro && !z.dentro && (z.ripeti || !z.fatto)) {
        z.fatto = true;
        emetti(z.nome, z);
      }
      if (!dentro && z.dentro && z.ripeti) emetti(z.nome + ':esce', z);
      z.dentro = dentro;
    }
  }

  stanzaDi(p) {
    for (const s of this.stanze) {
      if (p.x >= s.x0 - 0.01 && p.x <= s.x1 + 0.01 && p.z >= s.z0 - 0.01 && p.z <= s.z1 + 0.01 && p.y >= s.y0 - 1 && p.y <= s.y0 + s.h + 0.5) return s;
    }
    return null;
  }

  /*
   * Stanza: interno [x0,x1] × [y0,y0+h] × [z0,z1]. Pareti n (z0), s (z1), w (x0), e (x1).
   * Ogni parete: false (assente) oppure { aperture: [{a,b,y0,y1}], pannelli: [{id,a,b,y0,y1,proibito}] }
   * a,b sono coordinate lungo la parete (x per n/s, z per w/e); y0,y1 relativi al pavimento.
   */
  stanza(def) {
    const { x0, x1, z0, z1, y0 = 0, h } = def;
    const s = { gravita: 1, ...def, y0 };
    this.stanze.push(s);
    const m = (this.ms = { ...this.mat, ...(def.materiali || {}) });
    const pareti = def.pareti || {};
    const ex = (k) => (pareti[k] === false ? 0 : T);
    const bx0 = x0 - ex('w'), bx1 = x1 + ex('e'), bz0 = z0 - ex('n'), bz1 = z1 + ex('s');
    if (def.pavimento !== false) this.box(bx0, y0 - T, bz0, bx1, y0, bz1, m.pavimento);
    if (def.soffitto !== false) this.box(bx0, y0 + h, bz0, bx1, y0 + h + T, bz1, m.soffitto);
    const lati = {
      n: { asse: 'x', da: x0 - T, a: x1 + T, interno: [x0, x1], piano: [z0 - T, z0], normale: new THREE.Vector3(0, 0, 1) },
      s: { asse: 'x', da: x0 - T, a: x1 + T, interno: [x0, x1], piano: [z1, z1 + T], normale: new THREE.Vector3(0, 0, -1) },
      w: { asse: 'z', da: z0, a: z1, interno: [z0, z1], piano: [x0 - T, x0], normale: new THREE.Vector3(1, 0, 0) },
      e: { asse: 'z', da: z0, a: z1, interno: [z0, z1], piano: [x1, x1 + T], normale: new THREE.Vector3(-1, 0, 0) },
    };
    for (const [k, lato] of Object.entries(lati)) {
      const p = pareti[k] === undefined ? {} : pareti[k];
      if (p === false) continue;
      this.parete(lato, y0, h, p.aperture || [], p.pannelli || [], k);
    }
    if (def.luci) {
      for (const [lx, lz, w = 0.6, d = 1.2] of def.luci) {
        this.neon(lx, y0 + h, lz, w, d, def.matNeon || this.mat.neon);
        if (def.luciPunto !== false) this.luce(lx, y0 + h - 0.3, lz, def.intensita ?? 3, def.raggio ?? 7, def.coloreLuce ?? 0xf2f7ff);
      }
    }
    return s;
  }

  parete(lato, y0, h, aperture, pannelli, k) {
    const us = new Set([lato.da, lato.a]);
    const vs = new Set([0, h]);
    for (const o of [...aperture, ...pannelli]) {
      us.add(Math.max(lato.da, Math.min(lato.a, o.a)));
      us.add(Math.max(lato.da, Math.min(lato.a, o.b)));
      vs.add(Math.max(0, Math.min(h, o.y0 ?? 0)));
      vs.add(Math.max(0, Math.min(h, o.y1 ?? h)));
    }
    const U = [...us].sort((a, b) => a - b);
    const V = [...vs].sort((a, b) => a - b);
    const dentro = (o, u, v) => u > o.a && u < o.b && v > (o.y0 ?? 0) && v < (o.y1 ?? h);
    for (const p of pannelli) {
      if (!this.pannelli.has(p.id)) {
        const faccia = lato.normale.x + lato.normale.z > 0 ? lato.piano[1] : lato.piano[0];
        this.pannelli.set(p.id, {
          id: p.id,
          asse: lato.asse,
          normale: lato.normale.clone(),
          faccia,
          a: p.a, b: p.b, y0: y0 + (p.y0 ?? 0), y1: y0 + (p.y1 ?? h),
          proibito: !!p.proibito,
          lato: k,
        });
      }
    }
    for (let i = 0; i < U.length - 1; i++) {
      for (let j = 0; j < V.length - 1; j++) {
        const uc = (U[i] + U[i + 1]) / 2;
        const vc = (V[j] + V[j + 1]) / 2;
        if (aperture.some((o) => dentro(o, uc, vc))) continue;
        const pan = pannelli.find((o) => dentro(o, uc, vc));
        const mat = pan ? (pan.proibito ? this.ms.proibito : this.ms.pannello) : this.ms.muro;
        const ya = y0 + V[j];
        const yb = y0 + V[j + 1];
        if (lato.asse === 'x') this.box(U[i], ya, lato.piano[0], U[i + 1], yb, lato.piano[1], mat, { pannello: pan ? pan.id : null });
        else this.box(lato.piano[0], ya, U[i], lato.piano[1], yb, U[i + 1], mat, { pannello: pan ? pan.id : null });
      }
    }
    this.dettagli(lato, y0, h, aperture, pannelli);
  }

  // battiscopa e cornici delle porte (solo visivi)
  dettagli(lato, y0, h, aperture, pannelli) {
    const mat = this.ms;
    const n = lato.normale;
    const fuori = n.x + n.z > 0 ? 1 : -1;               // verso l'interno della stanza
    const faccia = fuori > 0 ? lato.piano[1] : lato.piano[0];
    const retro = fuori > 0 ? lato.piano[0] : lato.piano[1];
    const piastra = (u0, u1, v0, v1, f, spessore, m, r = 0.012) => {
      const a = Math.min(f, f + spessore), b = Math.max(f, f + spessore);
      if (u1 - u0 < 0.02) return;
      if (lato.asse === 'x') this.tondo(u0, y0 + v0, a, u1, y0 + v1, b, m, { r, solido: false });
      else this.tondo(a, y0 + v0, u0, b, y0 + v1, u1, m, { r, solido: false });
    };
    // battiscopa tra le aperture a filo pavimento e fuori dai pannelli bassi
    const [i0, i1] = lato.interno;
    const tagli = [...aperture, ...pannelli].filter((o) => (o.y0 ?? 0) < 0.15).map((o) => [o.a, o.b]).sort((p, q) => p[0] - q[0]);
    let u = i0;
    for (const [a, b] of tagli) {
      if (a > u) piastra(u, Math.min(a, i1), 0, 0.12, faccia, fuori * 0.022, mat.battiscopa, 0.008);
      u = Math.max(u, b);
    }
    if (u < i1) piastra(u, i1, 0, 0.12, faccia, fuori * 0.022, mat.battiscopa, 0.008);
    // cornici delle aperture, su entrambi i lati del muro
    for (const o of aperture) {
      const v0 = o.y0 ?? 0, v1 = o.y1 ?? h, L = 0.09;
      for (const [f, s] of [[faccia, fuori], [retro, -fuori]]) {
        const sp = s * 0.035;
        piastra(o.a - L, o.a, v0, Math.min(h, v1 + L), f, sp, mat.cornice);
        piastra(o.b, o.b + L, v0, Math.min(h, v1 + L), f, sp, mat.cornice);
        if (v1 + 0.02 < h) piastra(o.a - L, o.b + L, v1, Math.min(h, v1 + L), f, sp, mat.cornice);
        if (v0 > 0.05) piastra(o.a - L, o.b + L, Math.max(0, v0 - 0.05), v0, f, s * 0.06, mat.cornice);
      }
    }
  }

  ogniFrame(fn) { this.aggiornamenti.push(fn); }
}
