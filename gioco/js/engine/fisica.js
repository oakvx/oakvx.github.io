// Fisica minima a scatole allineate (AABB): gravità per stanza, scorrimento lungo
// le pareti, corpi afferrabili. Le finestre aprono un varco nel pannello che le ospita.
import * as THREE from 'three';

export const G = 15;
const EPS = 0.001;

export class Corpo {
  constructor(pos, half, { mesh = null, tipo = 'cubo' } = {}) {
    this.pos = pos.clone();
    this.half = half.clone();
    this.vel = new THREE.Vector3();
    this.aTerra = false;
    this.mesh = mesh;
    this.tipo = tipo;
    this.tenuto = false;
    this.zPrima = [null, null]; // lato rispetto alle due finestre al frame precedente
    this.passo = 0;              // altezza dei gradini che sale da solo (giocatore)
  }
}

function sovrapposti(c, h, mn, mx) {
  return c.x + h.x > mn.x + EPS && c.x - h.x < mx.x - EPS
    && c.y + h.y > mn.y + EPS && c.y - h.y < mx.y - EPS
    && c.z + h.z > mn.z + EPS && c.z - h.z < mx.z - EPS;
}

const tmpMin = new THREE.Vector3();
const tmpMax = new THREE.Vector3();

// muove un corpo di delta, asse per asse, contro i solidi e gli altri corpi
function libero(corpo, mondo, varchi) {
  for (const s of mondo.solidi) {
    if (!s.attivo || (s.pannello && varchi.has(s.pannello))) continue;
    if (sovrapposti(corpo.pos, corpo.half, s.min, s.max)) return false;
  }
  return true;
}

export function muovi(corpo, delta, mondo, altri, varchi) {
  const eraATerra = corpo.aTerra;
  corpo.aTerra = false;
  for (const asse of ['y', 'x', 'z']) {
    const d = delta[asse];
    if (d === 0) continue;
    corpo.pos[asse] += d;
    for (const s of mondo.solidi) {
      if (!s.attivo) continue;
      if (s.pannello && varchi.has(s.pannello)) continue;
      if (!sovrapposti(corpo.pos, corpo.half, s.min, s.max)) continue;
      // gradino basso: il giocatore ci sale sopra invece di fermarsi
      const salita = s.max.y - (corpo.pos.y - corpo.half.y);
      if (asse !== 'y' && corpo.passo && eraATerra && salita > 0 && salita <= corpo.passo) {
        corpo.pos.y += salita + EPS;
        if (libero(corpo, mondo, varchi)) { corpo.aTerra = true; continue; }
        corpo.pos.y -= salita + EPS;
      }
      risolvi(corpo, asse, d, s.min, s.max);
    }
    for (const o of altri) {
      if (o === corpo || o.tenuto) continue;
      tmpMin.copy(o.pos).sub(o.half);
      tmpMax.copy(o.pos).add(o.half);
      if (!sovrapposti(corpo.pos, corpo.half, tmpMin, tmpMax)) continue;
      risolvi(corpo, asse, d, tmpMin, tmpMax);
    }
  }
}

function risolvi(corpo, asse, d, mn, mx) {
  if (d > 0) corpo.pos[asse] = mn[asse] - corpo.half[asse] - EPS;
  else corpo.pos[asse] = mx[asse] + corpo.half[asse] + EPS;
  if (asse === 'y' && d < 0) corpo.aTerra = true;
  if (asse === 'y') corpo.vel.y = 0;
  else corpo.vel[asse] *= corpo.tipo === 'cubo' ? -0.25 : 0;
}

// passo di simulazione per i corpi liberi (cubi)
export function passoCorpo(corpo, dt, mondo, altri, varchi) {
  if (!corpo.tenuto) {
    const st = mondo.stanzaDi(corpo.pos);
    const g = G * (st ? st.gravita : 1);
    corpo.vel.y -= g * dt;
    if (corpo.aTerra) {
      const attrito = Math.exp(-6 * dt);
      corpo.vel.x *= attrito;
      corpo.vel.z *= attrito;
    }
  }
  const delta = corpo.vel.clone().multiplyScalar(dt);
  muovi(corpo, delta, mondo, altri, varchi);
  if (corpo.mesh) corpo.mesh.position.copy(corpo.pos);
}
