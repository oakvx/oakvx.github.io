// Porte tra stanze lontane: un'apertura nel muro con una nicchia dietro e un passaggio
// a doppio senso sul filo del muro. Qui stanno anche le coordinate delle porte dei progetti,
// condivise dallo smistamento e dalle stanze dei progetti.
import { posa } from './passaggi.js';

export const W = 1.3, H = 2.3;

// [x, y0, z, ry]: centro della porta sul filo interno del muro e direzione verso l'interno della stanza
export const PORTE = {
  yag: { hub: [-10, 0, -30, Math.PI / 2], stanza: [-90, 0, 0, Math.PI] },
  piko: { hub: [-10, 0, -38, Math.PI / 2], stanza: [-90, 0, -40, Math.PI] },
  brat: { hub: [-4, 0, -42, 0], stanza: [-125, 0, 10, Math.PI] },
  synk: { hub: [10, 0, -30, -Math.PI / 2], stanza: [-127.5, 0, -40, Math.PI] },
  beautify: { hub: [10, 0, -38, -Math.PI / 2], stanza: [-165, 0, -10, Math.PI] },
};

// apertura per una parete di m.stanza: { a, b, y0, y1 } lungo l'asse della parete
export function apertura(lungo, w = W, h = H) {
  return { a: lungo - w / 2, b: lungo + w / 2, y0: 0, y1: h };
}

// nicchia cieca dietro un'apertura (così dietro il passaggio non c'è il vuoto)
export function nicchia(m, [x, y0, z, ry], w = W, h = H) {
  const fx = Math.sin(ry), fz = Math.cos(ry);         // verso l'interno
  const cx = x - fx * 0.75, cz = z - fz * 0.75;        // dietro il muro
  const mx = Math.abs(fz) * w / 2 + Math.abs(fx) * 0.15;
  const mz = Math.abs(fx) * w / 2 + Math.abs(fz) * 0.15;
  m.box(cx - mx, y0, cz - mz, cx + mx, y0 + h + 0.3, cz + mz, m.mat.scuro);
}

export function collega(g, id, a, b, { w = W, h = H, doppio = true, formaA = null } = {}) {
  return g.passaggi.aggiungi({
    id,
    a: posa(a[0], a[1] + h / 2, a[2], a[3]),
    b: posa(b[0], b[1] + h / 2, b[2], b[3]),
    w, h, doppio, formaA,
  });
}

// guscio di una stanza-progetto: porta d'ingresso nella parete sud (z1), verso lo smistamento
export function stanzaProgetto(m, g, { id, x0, x1, z0, z1, h = 4, pareti = {}, ...resto }) {
  const [px] = PORTE[id].stanza;
  const sud = pareti.s || {};
  const s = m.stanza({
    nome: id, x0, x1, z0, z1, h, ala: 'backend',
    luci: [[(x0 + x1) / 2, (z0 + z1) / 2, 0.8, 1.6]], intensita: 3, raggio: 12,
    ...resto,
    pareti: { ...pareti, s: { ...sud, aperture: [...(sud.aperture || []), apertura(px)] } },
  });
  nicchia(m, PORTE[id].stanza);
  g.arredi.porta(px, 0, z1 - 0.06, Math.PI, null);
  g.puntoControllo(id, px, 0, z1 - 1.5, 0);
  return s;
}
