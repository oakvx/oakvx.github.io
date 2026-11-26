// Segnaposto della stanza "scrivania" (la sua tappa del piano la riempie): una stanza vuota con l'uscita in fondo.
export function costruisci(m, g) {
  const s = m.stanza({ nome: 'scrivania', x0: 200, x1: 212, z0: 0, z1: 12, h: 4, ala: 'transito' });
  m.luce((s.x0 + s.x1) / 2, 3.5, (s.z0 + s.z1) / 2, 3, 14);
  g.puntoControllo('scrivania', 206, 0, 1.5, Math.PI);
  m.zona('uscita-scrivania', s.x0, -1, s.z1 - 1, s.x1, 3, s.z1, { ripeti: true });
  g.su('uscita-scrivania', () => g.teletrasporta(240, 0, 1.5, Math.PI));
  return { debug: { uscita: [(s.x0 + s.x1) / 2, s.z1 - 0.5] } };
}
