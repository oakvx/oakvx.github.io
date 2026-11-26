// Matematica condivisa da finestre e passaggi: trasformazione da un varco all'altro
// e piano di taglio obliquo per la camera virtuale. Niente import: funziona anche in Node.

// Matrice che porta un punto davanti al varco `da` nello stesso punto relativo dietro `a`
// (si entra da una faccia e si esce dall'altra, girati di mezzo giro).
export function matriceAttraverso(da, a) {
  const giro = new da.constructor().makeRotationY(Math.PI);
  return new da.constructor().copy(a).multiply(giro).multiply(da.clone().invert());
}

// Sostituisce il piano vicino della proiezione con `piano` (in spazio camera): la camera
// virtuale non disegna ciò che sta dietro il varco d'arrivo. Modifica `proiezione`.
export function clipObliqua(proiezione, piano) {
  const e = proiezione.elements;
  const c = [piano.normal.x, piano.normal.y, piano.normal.z, piano.constant];
  const q = [(Math.sign(c[0]) + e[8]) / e[0], (Math.sign(c[1]) + e[9]) / e[5], -1, (1 + e[10]) / e[14]];
  const k = 2 / (c[0] * q[0] + c[1] * q[1] + c[2] * q[2] + c[3] * q[3]);
  e[2] = c[0] * k;
  e[6] = c[1] * k;
  e[10] = c[2] * k + 1;
  e[14] = c[3] * k;
  return proiezione;
}
