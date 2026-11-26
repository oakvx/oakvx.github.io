// Segnaposto della stanza "commit" (la sua tappa del piano la riempie): una stanza vuota con l'uscita in fondo.
export function costruisci(m, g) {
  const s = m.stanza({ nome: 'commit', x0: 230, x1: 250, z0: 0, z1: 14, h: 4, ala: 'transito' });
  m.luce((s.x0 + s.x1) / 2, 3.5, (s.z0 + s.z1) / 2, 3, 14);
  g.puntoControllo('commit', 240, 0, 1.5, Math.PI);
  m.zona('uscita-commit', s.x0, -1, s.z1 - 1, s.x1, 3, s.z1, { ripeti: true });
  g.su('uscita-commit', () => g.teletrasporta(452, 0, 1.5, Math.PI));
  return { debug: { uscita: [(s.x0 + s.x1) / 2, s.z1 - 0.5] } };
}
