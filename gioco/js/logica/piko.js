// Piko: l'agente propone un piano; niente succede finché qualcuno non lo approva.
export function creaPianificatore(piani) {
  let i = 0;
  return {
    attuale: () => i,
    approva: () => piani[i].esito,
    rifiuta: () => { i = (i + 1) % piani.length; return i; },
  };
}
