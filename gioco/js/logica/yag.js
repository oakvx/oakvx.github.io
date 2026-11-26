// YAG: autenticazione + instradamento per modello, e limiti operativi (finestra scorrevole).
export function instrada({ autenticato, piedistallo }) {
  if (!autenticato || !piedistallo) return 'negato';
  return piedistallo === 'a' ? 'backend1' : 'backend2';
}

export function creaLimitatore({ max = 3, finestra = 2 } = {}) {
  let passaggi = [];
  return {
    passa(t) {
      passaggi = passaggi.filter((x) => t - x < finestra);
      if (passaggi.length >= max) return false;
      passaggi.push(t);
      return true;
    },
  };
}
