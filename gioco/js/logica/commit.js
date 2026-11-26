// Contatore pubblico dei commit (account oakvx e oakvxish), come quello del sito:
// API di ricerca di GitHub, cache di un'ora, ripiego "2.500+" senza rete o col limite superato.
const CHIAVE = 'gioco-commit-v1';
const ORA = 60 * 60 * 1000;
export const RIPIEGO = '2.500+';

// punto delle migliaia anche a quattro cifre (toLocaleString('it-IT') non lo mette sotto 10.000)
export const formatta = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export async function totaleCommit({ fetch, storage, ora = Date.now(), account = ['oakvx', 'oakvxish'] }) {
  try {
    const c = JSON.parse(storage.getItem(CHIAVE) || 'null');
    if (c && typeof c.totale === 'number' && ora - c.quando < ORA) return { totale: c.totale, testo: formatta(c.totale) };
  } catch { /* cache illeggibile: si ricalcola */ }
  try {
    const conti = await Promise.all(account.map(async (a) => {
      const r = await fetch(`https://api.github.com/search/commits?q=author:${a}`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!r.ok) throw new Error('GitHub ' + r.status);
      const j = await r.json();
      if (typeof j.total_count !== 'number') throw new Error('risposta senza total_count');
      return j.total_count;
    }));
    const totale = conti.reduce((a, b) => a + b, 0);
    try { storage.setItem(CHIAVE, JSON.stringify({ totale, quando: ora })); } catch { /* storage pieno o vietato */ }
    return { totale, testo: formatta(totale) };
  } catch {
    return { totale: null, testo: RIPIEGO };
  }
}

// cifre 5×7 (stessa famiglia di quelle del sito): righe di una griglia, '1' = acceso
const GLIFI = {
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  6: ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '.': ['00', '00', '00', '00', '00', '01', '01'],
  ',': ['00', '00', '00', '00', '01', '01', '10'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
};

export function cifre(testo) {
  const righe = Array(7).fill('');
  for (const ch of testo) {
    const gl = GLIFI[ch];
    if (!gl) continue;
    for (let r = 0; r < 7; r++) righe[r] += (righe[r] ? '0' : '') + gl[r];
  }
  return righe;
}
