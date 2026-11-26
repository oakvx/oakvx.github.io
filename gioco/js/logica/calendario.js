// synk: prenotazioni con un vincolo di esclusione (come la GiST di PostgreSQL): due intervalli
// [da, a) che si sovrappongono non possono esistere insieme.
export function creaCalendario({ inizio, fine, richieste }) {
  const prenotazioni = new Map();
  return {
    prenota(id, da, a) {
      if (da < inizio || a > fine || a <= da) return 'fuori';
      for (const [altro, p] of prenotazioni) {
        if (altro !== id && da < p.a && p.da < a) return 'conflitto';
      }
      prenotazioni.set(id, { da, a });
      return 'ok';
    },
    libera(id) { prenotazioni.delete(id); },
    pieno: () => richieste.every((r) => prenotazioni.has(r)),
    elenco: () => [...prenotazioni].map(([id, p]) => ({ id, ...p })),
  };
}
