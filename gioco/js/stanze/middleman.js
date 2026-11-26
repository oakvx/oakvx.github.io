// Segnaposto della stanza "middleman" (la sua tappa del piano la riempie): una stanza vuota con l'uscita in fondo.
export function costruisci(m, g) {
  const s = m.stanza({ nome: 'middleman', x0: 100, x1: 120, z0: 0, z1: 20, h: 4, ala: 'transito' });
  m.luce((s.x0 + s.x1) / 2, 3.5, (s.z0 + s.z1) / 2, 3, 14);
  g.puntoControllo('middleman', 110, 0, 1.5, Math.PI);
  m.zona('uscita-middleman', s.x0, -1, s.z1 - 1, s.x1, 3, s.z1, { ripeti: true });
  g.su('uscita-middleman', () => g.teletrasporta(301.5, 0, 18, -Math.PI / 2));
  return { debug: { uscita: [(s.x0 + s.x1) / 2, s.z1 - 0.5] } };
}
