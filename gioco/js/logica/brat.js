// Brat Animator: parole a tempo (come una lyric video) e una timeline che si può fermare e riavvolgere.

// indice della parola attiva al tempo t (intervalli [da, a)); il testo si ripete ogni `a` dell'ultima parola
export function parolaAttiva(t, testo) {
  const ciclo = testo[testo.length - 1].a;
  const tc = ((t % ciclo) + ciclo) % ciclo;
  return testo.findIndex((p) => tc >= p.da && tc < p.a);
}

// tempo della stanza: segue l'orologio della musica, finché non lo si ferma
export function creaTimeline() {
  let fermo = false;
  let scarto = 0;       // tempo stanza = tMusica - scarto
  let congelato = 0;
  let ultimo = 0;
  return {
    tempo(tMusica) {
      ultimo = tMusica;
      return fermo ? congelato : Math.max(0, tMusica - scarto);
    },
    ferma() { if (!fermo) { congelato = Math.max(0, ultimo - scarto); fermo = true; } },
    riparti() { if (fermo) { scarto = ultimo - congelato; fermo = false; } },
    riavvolgi(s) {
      if (fermo) congelato = Math.max(0, congelato - s);
      else scarto = ultimo - Math.max(0, ultimo - scarto - s);
    },
    fermo: () => fermo,
  };
}
