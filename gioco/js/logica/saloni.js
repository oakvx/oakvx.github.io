// Beautify: più saloni con dati separati e un controllo di disponibilità condiviso.
export function creaSaloni(nomi, fasce) {
  const agenda = new Map(nomi.map((n) => [n, Array(fasce).fill(false)]));
  return {
    occupa(salone, fascia) {
      const a = agenda.get(salone);
      if (!a || a[fascia]) return false;
      a[fascia] = true;
      return true;
    },
    libera(salone, fascia) { const a = agenda.get(salone); if (a) a[fascia] = false; },
    disponibile: (fascia) => nomi.find((n) => !agenda.get(n)[fascia]) ?? null,
    stato: (salone) => [...agenda.get(salone)],
  };
}
