// Segnaposto della stanza "galleria" (la sua tappa del piano la riempie): una stanza vuota con l'uscita in fondo.
export function costruisci(m, g) {
  const s = m.stanza({ nome: 'galleria', x0: 150, x1: 175, z0: 0, z1: 20, h: 4, ala: 'transito' });
  m.luce((s.x0 + s.x1) / 2, 3.5, (s.z0 + s.z1) / 2, 3, 14);
  g.puntoControllo('galleria', 162.5, 0, 1.5, Math.PI);
  m.zona('uscita-galleria', s.x0, -1, s.z1 - 1, s.x1, 3, s.z1, { ripeti: true });
  g.su('uscita-galleria', () => g.teletrasporta(206, 0, 1.5, Math.PI));
  return { debug: { uscita: [(s.x0 + s.x1) / 2, s.z1 - 0.5] } };
}
