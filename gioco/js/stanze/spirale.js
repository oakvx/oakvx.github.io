// La scala a chiocciola: un pozzo rivestito di mosaico, gradini a elica che scendono
// nel buio, una sola luce tonda in alto. In fondo c'è una porta. Chi cade nel vuoto
// centrale riemerge nella cisterna, sotto il foro da cui era salito.
import * as THREE from 'three';
import { canvasTex } from '../engine/materiali.js';

const CX = 400, CZ = 0, R = 4, R_IN = 1.6, ALTO = 12, GIRO = 4, PER_GIRO = 16, GIRI = 3;
const SALITA = GIRO / PER_GIRO;

export function costruisci(m, g) {
  const mosaico = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#4d6b68';
    ctx.fillRect(0, 0, w, h);
    const n = 16, p = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = Math.random() * 18 - 9;
      ctx.fillStyle = `rgb(${92 + v},${124 + v},${120 + v})`;
      ctx.fillRect(i * p + 1.5, j * p + 1.5, p - 3, p - 3);
    }
  });
  mosaico.repeat.set(24, 18);
  const cemento = new THREE.MeshLambertMaterial({ color: 0x6f8784 });
  const pareteMat = new THREE.MeshLambertMaterial({ map: mosaico, side: THREE.BackSide });

  // la stanza esiste solo come zona (atmosfera, suono, nome): le pareti sono curve
  m.stanze.push({
    nome: 'spirale', x0: CX - R, x1: CX + R, z0: CZ - R, z1: CZ + R, y0: -6, h: 20, gravita: 1, ala: 'transito',
    atmosfera: { nebbia: 0x14201e, vicino: 1.5, lontano: 20, cielo: 0x9cc2bb, terra: 0x0a1211, intensita: 1.0 },
    suono: { ronzio: 0.15, gocce: 0.4 },
  });

  const cilindro = new THREE.Mesh(new THREE.CylinderGeometry(R, R, ALTO + 1.6, 48, 1, true), pareteMat);
  cilindro.position.set(CX, (ALTO + 1.6) / 2 - 0.0, CZ);
  m.scene.add(cilindro);
  const tappo = new THREE.Mesh(new THREE.CircleGeometry(R, 48), cemento);
  tappo.rotation.x = Math.PI / 2;
  tappo.position.set(CX, ALTO + 1.6, CZ);
  m.scene.add(tappo);

  // gradini a elica
  const geoGradino = new THREE.BoxGeometry(R - R_IN + 0.05, 0.45, 1.16);
  const n = PER_GIRO * GIRI;
  const gradini = new THREE.InstancedMesh(geoGradino, cemento, n);
  const o = new THREE.Object3D();
  for (let i = 0; i < n; i++) {
    const a = (i + 0.5) * (2 * Math.PI / PER_GIRO);
    const rc = (R + R_IN) / 2;
    o.position.set(CX + Math.cos(a) * rc, ALTO - i * SALITA - 0.225, CZ + Math.sin(a) * rc);
    o.rotation.set(0, -a, 0);
    o.updateMatrix();
    gradini.setMatrixAt(i, o.matrix);
  }
  m.scene.add(gradini);

  // pianerottolo in cima (mezzo anello) e pavimento in fondo (anello)
  const anello = (a0, a1, y, spessore) => {
    const s = new THREE.Shape();
    const passi = 40;
    for (let k = 0; k <= passi; k++) { const a = a0 + (a1 - a0) * k / passi; const p = [Math.cos(a) * (R - 0.02), -Math.sin(a) * (R - 0.02)]; if (k === 0) s.moveTo(...p); else s.lineTo(...p); }
    for (let k = passi; k >= 0; k--) { const a = a0 + (a1 - a0) * k / passi; s.lineTo(Math.cos(a) * R_IN, -Math.sin(a) * R_IN); }
    const geo = new THREE.ExtrudeGeometry(s, { depth: spessore, bevelEnabled: false, curveSegments: 40 });
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, cemento);
    mesh.position.set(CX, y - spessore, CZ);
    m.scene.add(mesh);
  };
  anello(Math.PI, 2 * Math.PI, ALTO, 0.25);
  anello(0, 2 * Math.PI - 0.001, 0, 0.3);

  // la luce tonda in alto e un chiarore in fondo
  const disco = new THREE.Mesh(new THREE.CircleGeometry(0.45, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }));
  disco.position.set(CX + (R - 0.03) * Math.cos(0.6), ALTO + 0.9, CZ + (R - 0.03) * Math.sin(0.6));
  disco.lookAt(CX, ALTO + 0.9, CZ);
  m.scene.add(disco);
  m.luce(CX + 2.6 * Math.cos(0.6), ALTO + 0.6, CZ + 2.6 * Math.sin(0.6), 6, 12, 0xeaf6f2);
  m.luce(CX, 1.6, CZ, 0.8, 6, 0x6f9c96);

  // la porta in fondo, sul lato opposto all'ultimo gradino
  const porta = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.1), new THREE.MeshLambertMaterial({ color: 0x2a3433 }));
  porta.position.set(CX - (R - 0.04), 1.05, CZ);
  porta.rotation.y = Math.PI / 2;
  m.scene.add(porta);

  // camminare sull'elica: si sceglie il pavimento più alto non sopra i piedi
  m.vincoli.push((c) => {
    const dx = c.pos.x - CX, dz = c.pos.z - CZ;
    const r = Math.hypot(dx, dz);
    if (r > R + 0.6 || c.pos.y < -10 || c.pos.y > ALTO + 4) return;
    const lim = R - 0.32;
    if (r > lim) { c.pos.x = CX + dx / r * lim; c.pos.z = CZ + dz / r * lim; }
    const piedi = c.pos.y - c.half.y;
    if (piedi < -4) {
      if (!g.inViaggio) {
        g.inViaggio = true;
        g.emetti('caduta');
        g.teletrasporta(318, 3.5, 19, null, () => { g.inViaggio = false; g.suoni.tonfo(); });
      }
      return;
    }
    if (r < R_IN) return;
    let a = Math.atan2(dz, dx);
    if (a < 0) a += 2 * Math.PI;
    const i = Math.floor(a / (2 * Math.PI) * PER_GIRO);
    const candidati = [0];
    if (i >= PER_GIRO / 2) candidati.push(ALTO);
    for (let k = 0; k < GIRI; k++) candidati.push(ALTO - (k * PER_GIRO + i) * SALITA);
    let migliore = -Infinity;
    for (const h of candidati) if (h <= piedi + 0.45 && h > migliore) migliore = h;
    if (migliore > -Infinity && piedi - migliore < 0.35 && c.vel.y <= 0.5) {
      c.pos.y = migliore + c.half.y + 0.001;
      c.vel.y = 0;
      c.aTerra = true;
    }
    // la porta in fondo porta al supermercato
    if (piedi < 0.6 && r > R - 0.9 && Math.abs(Math.atan2(dz, -dx)) < 0.3 && !g.inViaggio) {
      g.inViaggio = true;
      g.teletrasporta(162.5, 0, 1.5, Math.PI, () => { g.inViaggio = false; });
    }
  });
  // per i test: quasi in fondo, davanti alla porta
  return { debug: { risolvi: () => { g.giocatore().pos.set(CX - R + 1.2, 0.86, CZ); g.giocatore().vel.set(0, 0, 0); } } };
}
