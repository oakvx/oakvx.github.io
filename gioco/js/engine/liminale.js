// Spazi liminali: il cartello "stanza N di 2.500" (col contatore vero dei commit, quando c'è)
// e il Mii di oakvx che gira l'angolo quando ti avvicini.
import * as THREE from 'three';
import { formatta } from '../logica/commit.js';

export function cartelloStanza(m, g, x, y, z, ry, n) {
  const fmt = (v) => (g.lingua() === 'en' ? formatta(v).replace(/\./g, ',') : formatta(v));
  let totale = '2.500';
  const tex = g.texTesto(512, 128, (ctx, w, h) => {
    ctx.fillStyle = '#1c1f1d'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e3e7e2'; ctx.font = '700 44px monospace'; ctx.textAlign = 'center';
    tex.testo = g.T().stanzaDi.replace('{n}', fmt(n)).replace('{tot}', totale);
    ctx.fillText(tex.testo, w / 2, 80);
  });
  tex.ridisegna();
  g.suLingua(() => tex.ridisegna());
  if (g.commit) g.commit().then((c) => { totale = c.testo; tex.ridisegna(); }).catch(() => {});
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: tex }));
  s.position.set(x, y, z);
  s.rotation.y = ry;
  m.scene.add(s);
  return tex;
}

// il Mii appare in fondo a uno spazio; quando ti avvicini si sposta di lato e sparisce
const visti = new Set();
export function miiLiminale(m, g, id, x, y, z, ry, verso = [1, 0]) {
  const mii = g.arredi.mii(x, y, z, ry, 'gira');
  let via = -1;
  m.ogniFrame((dt) => {
    if (!mii.visible) return;
    const p = g.giocatore().pos;
    if (via < 0 && Math.hypot(p.x - x, p.z - z) < 8 && Math.abs(p.y - y - 0.85) < 3) {
      via = 0;
      visti.add(id);
      if (visti.size >= 3) g.segreto('mii');
    }
    if (via >= 0) {
      via += dt;
      mii.position.x = x + verso[0] * via * 3;
      mii.position.z = z + verso[1] * via * 3;
      if (via > 0.45) mii.visible = false;
    }
  });
  return { id, posto: [x, y, z] };
}

// una tappa del percorso: porta chiusa con l'anno sopra; esaminarla (E) apre il cartiglio
export function tappa(m, g, id, x, y0, z, ry) {
  g.arredi.porta(x, y0, z, ry, () => g.T().stanze.percorso.anni[id]);
  const fx = Math.sin(ry), fz = Math.cos(ry);
  const mx = Math.abs(fz) * 0.65 + Math.abs(fx) * 0.07, mz = Math.abs(fx) * 0.65 + Math.abs(fz) * 0.07;
  const cx = x - fx * 0.05, cz = z - fz * 0.05;
  const anta = m.box(cx - mx, y0, cz - mz, cx + mx, y0 + 2.3, cz + mz, m.mat.legnoScuro);
  g.interattivo(anta.mesh, 'tappa-' + id);
  return id;
}
