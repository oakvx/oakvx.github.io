// Il bivio: due porte. Il curatore annuncia la sinistra prima che il visitatore scelga.
import * as THREE from 'three';

export function costruisci(m, g) {
  m.stanza({
    nome: 'bivio', x0: -5, x1: 5, z0: -18, z1: -10, h: 3.2,
    pareti: {
      s: { aperture: [{ a: -1, b: 1, y0: 0, y1: 2.6 }] },
      n: { aperture: [{ a: -3.5, b: -1.5, y0: 0, y1: 2.4 }, { a: 1.5, b: 3.5, y0: 0, y1: 2.4 }] },
    },
    luci: [[0, -14, 1.2, 0.6]], intensita: 3.4, raggio: 8,
  });
  m.stanza({ nome: 'corridoioS', x0: -3.5, x1: -1.5, z0: -21.7, z1: -18.3, h: 2.4, pareti: { n: false, s: false }, luci: [[-2.5, -20, 0.5, 1]], luciPunto: false });
  m.stanza({ nome: 'corridoioD', x0: 1.5, x1: 3.5, z0: -21.7, z1: -18.3, h: 2.4, pareti: { n: false, s: false }, luci: [[2.5, -20, 0.5, 1]], luciPunto: false });

  // cornici scure intorno alle due porte, identiche: nessun indizio
  for (const cx of [-2.5, 2.5]) {
    m.box(cx - 1.08, 0, -18.02, cx - 1.0, 2.48, -17.96, m.mat.cornice, { solido: false });
    m.box(cx + 1.0, 0, -18.02, cx + 1.08, 2.48, -17.96, m.mat.cornice, { solido: false });
    m.box(cx - 1.08, 2.4, -18.02, cx + 1.08, 2.48, -17.96, m.mat.cornice, { solido: false });
  }
  // una panca, per chi vuole aspettare
  m.box(-1.2, 0, -11.2, 1.2, 0.45, -10.75, m.mat.grigio);

  m.zona('porta:sinistra', -3.5, -1, -21.7, -1.5, 3, -18.6);
  m.zona('porta:destra', 1.5, -1, -21.7, 3.5, 3, -18.6);
  void THREE;
}
