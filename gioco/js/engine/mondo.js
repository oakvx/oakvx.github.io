// Costruzione del mondo: blocchi solidi, stanze con aperture e pannelli, trigger.
import * as THREE from 'three';

export const T = 0.3; // spessore di pareti, pavimenti e soffitti

const geoBox = new THREE.BoxGeometry(1, 1, 1);
const geoNeon = new THREE.PlaneGeometry(1, 1);

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

  neon(x, y, z, w, d, mat = this.mat.neon) {
    const n = new THREE.Mesh(geoNeon, mat);
    n.scale.set(w, d, 1);
    n.position.set(x, y - 0.004, z);
    n.rotation.x = Math.PI / 2;
    this.scene.add(n);
    return n;
  }

  luce(x, y, z, intensita = 3, distanza = 8) {
    const l = new THREE.PointLight(0xf2f7ff, intensita, distanza, 2);
    l.position.set(x, y, z);
    this.scene.add(l);
    return l;
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
    const m = this.mat;
    const pareti = def.pareti || {};
    const ex = (k) => (pareti[k] === false ? 0 : T);
    const bx0 = x0 - ex('w'), bx1 = x1 + ex('e'), bz0 = z0 - ex('n'), bz1 = z1 + ex('s');
    if (def.pavimento !== false) this.box(bx0, y0 - T, bz0, bx1, y0, bz1, m.pavimento);
    if (def.soffitto !== false) this.box(bx0, y0 + h, bz0, bx1, y0 + h + T, bz1, m.soffitto);
    const lati = {
      n: { asse: 'x', da: x0 - T, a: x1 + T, piano: [z0 - T, z0], normale: new THREE.Vector3(0, 0, 1) },
      s: { asse: 'x', da: x0 - T, a: x1 + T, piano: [z1, z1 + T], normale: new THREE.Vector3(0, 0, -1) },
      w: { asse: 'z', da: z0, a: z1, piano: [x0 - T, x0], normale: new THREE.Vector3(1, 0, 0) },
      e: { asse: 'z', da: z0, a: z1, piano: [x1, x1 + T], normale: new THREE.Vector3(-1, 0, 0) },
    };
    for (const [k, lato] of Object.entries(lati)) {
      const p = pareti[k] === undefined ? {} : pareti[k];
      if (p === false) continue;
      this.parete(lato, y0, h, p.aperture || [], p.pannelli || [], k);
    }
    if (def.luci) {
      for (const [lx, lz, w = 0.6, d = 1.2] of def.luci) {
        this.neon(lx, y0 + h, lz, w, d);
        if (def.luciPunto !== false) this.luce(lx, y0 + h - 0.3, lz, def.intensita ?? 3, def.raggio ?? 7);
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
        const mat = pan ? (pan.proibito ? this.mat.proibito : this.mat.pannello) : this.mat.muro;
        const ya = y0 + V[j];
        const yb = y0 + V[j + 1];
        if (lato.asse === 'x') this.box(U[i], ya, lato.piano[0], U[i + 1], yb, lato.piano[1], mat, { pannello: pan ? pan.id : null });
        else this.box(lato.piano[0], ya, U[i], lato.piano[1], yb, U[i + 1], mat, { pannello: pan ? pan.id : null });
      }
    }
  }

  ogniFrame(fn) { this.aggiornamenti.push(fn); }
}
