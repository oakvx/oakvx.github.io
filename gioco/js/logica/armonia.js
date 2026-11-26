// Armonia della musica liminale e curva del "nastro che rallenta" ai cambi di stanza.
// Logica pura: note MIDI e numeri, nessun nodo audio.

export const ALE = ['ingresso', 'backend', 'transito', 'reverse', 'design', 'strumenti', 'commit', 'oakvx', 'contatti'];

// tonica (MIDI) di ogni ala: tonalità diverse, tutte gravi e morbide
const TONICA = { ingresso: 50, backend: 48, transito: 45, reverse: 47, design: 52, strumenti: 53, commit: 49, oakvx: 43, contatti: 55 };

// otto accordi a quattro voci (intervalli dalla tonica): sospesi, settime, niente risoluzioni nette
const GIRO = [
  [0, 7, 14, 16], [-3, 4, 11, 14], [-7, 0, 9, 14], [-5, 2, 9, 12],
  [0, 7, 11, 16], [-4, 3, 10, 15], [-7, 0, 7, 14], [-5, 2, 7, 11],
];

export function accordo(ala, battuta) {
  const t = TONICA[ala] ?? TONICA.transito;
  const i = ((Math.floor(battuta) % GIRO.length) + GIRO.length) % GIRO.length;
  return GIRO[i].map((x) => t + x);
}

const liscia = (x) => x * x * (3 - 2 * x);
const zero = (x) => x || 0; // niente -0

// t: secondi dall'inizio della transizione. Discesa fino a 0,35 s, risalita fino a 1,2 s.
export function curvaTransizione(t, calmo) {
  let k = 0;
  if (t > 0 && t <= 0.35) k = liscia(t / 0.35);
  else if (t > 0.35 && t < 1.2) k = liscia(1 - (t - 0.35) / 0.85);
  const minimo = calmo ? 3500 : 700;
  return {
    detune: calmo ? 0 : zero(Math.round(-350 * k)),
    taglio: Math.round(18000 * Math.pow(minimo / 18000, k)),
    spinta: Math.round((calmo ? 0.3 : 0.6) * k * 1000) / 1000,
  };
}
