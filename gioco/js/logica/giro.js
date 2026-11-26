// Avanzamento del giro (lampade dei progetti, segreti) e tempi degli aiuti.
// Logica pura: niente Three.js, niente DOM.

export const PROGETTI = ['yag', 'piko', 'brat', 'synk', 'beautify'];
export const SEGRETI = ['porta-percorso', 'mii', 'comando'];

export function creaGiro() {
  const completati = new Set();
  const trovati = new Set();
  return {
    completa(id) {
      if (!PROGETTI.includes(id) || completati.has(id)) return false;
      completati.add(id);
      return true;
    },
    completato: (id) => completati.has(id),
    lampade: () => completati.size,
    uscitaAperta: () => completati.size === PROGETTI.length,
    segreto(id) {
      if (!SEGRETI.includes(id) || trovati.has(id)) return false;
      trovati.add(id);
      return true;
    },
    segreti: () => [...trovati],
    stato: () => ({ completati: [...completati], segreti: [...trovati] }),
  };
}

// Tempo senza progresso: indizio a `indizio` secondi, soluzione a `soluzione`, una volta sola ciascuno.
export function creaAiuti({ indizio = 45, soluzione = 90 } = {}) {
  let fermo = 0;
  let datoIndizio = false;
  let dataSoluzione = false;
  let finito = false;
  return {
    progresso() { fermo = 0; },
    aggiorna(dt, attivo) {
      if (finito || !attivo) return null;
      fermo += dt;
      if (!dataSoluzione && fermo >= soluzione) { dataSoluzione = true; datoIndizio = true; return 'soluzione'; }
      if (!datoIndizio && fermo >= indizio) { datoIndizio = true; return 'indizio'; }
      return null;
    },
    risolto() { finito = true; },
    azzera() { fermo = 0; datoIndizio = false; dataSoluzione = false; finito = false; },
  };
}
