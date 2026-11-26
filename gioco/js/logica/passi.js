// Conta i passi lungo il cammino: quanti passi scattano percorrendo d metri (il resto si accumula).
export function creaContapassi(lunghezza = 0.55) {
  let resto = 0;
  return {
    avanza(d) {
      resto += d;
      const n = Math.floor(resto / lunghezza + 1e-9);
      resto -= n * lunghezza;
      return n;
    },
  };
}
