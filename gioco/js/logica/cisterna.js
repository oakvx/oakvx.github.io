// La cisterna infinita: celle quadrate ripetute senza fine. Il giocatore viene riportato di
// nascosto nella cella centrale (ricentra); una coordinata logica tiene il conto di dove "è"
// davvero, e da quella derivano variazioni deterministiche e la posizione dello squarcio.
// Logica pura: niente Three.js.

export const LATO = 18;

export function cellaDi(x, z, origine = [0, 0]) {
  return [Math.floor((x - origine[0]) / LATO), Math.floor((z - origine[1]) / LATO)];
}

// spostamento (multiplo di LATO) che riporta il punto nella cella centrale
export function ricentra(x, z, origine = [0, 0]) {
  const [cx, cz] = cellaDi(x, z, origine);
  return [-cx * LATO || 0, -cz * LATO || 0];
}

// mulberry32: generatore pseudo-casuale deterministico
export function creaSeme(n) {
  let a = n >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mescola = (cx, cz, seme) => ((cx * 73856093) ^ (cz * 19349663) ^ (seme * 83492791)) >>> 0;

export function variazioni(cx, cz, seme) {
  const r = creaSeme(mescola(cx, cz, seme));
  const l = r();
  return {
    lampada: l < 0.62 ? 'accesa' : l < 0.82 ? 'tremola' : 'spenta',
    crepa: r() < 0.28,
    gocce: r() < 0.4,
    acqua: 0.3 + r() * 0.4,
  };
}

// cella dello squarcio: a distanza di Chebyshev tra 5 e 7 dall'ingresso (0, 0)
export function posizioneSquarcio(seme) {
  const r = creaSeme(mescola(17, 31, seme));
  const d = 5 + Math.floor(r() * 3);
  const lato = Math.floor(r() * 4);
  const t = Math.floor(r() * (2 * d + 1)) - d;
  return [[d, t], [-d, t], [t, d], [t, -d]][lato];
}

export function verso(cx, cz, [sx, sz]) {
  const dx = sx - cx, dz = sz - cz;
  const l = Math.hypot(dx, dz);
  return l ? [dx / l, dz / l] : [0, 0];
}
