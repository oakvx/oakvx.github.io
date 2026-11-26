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

  // allestimento: due cartelli con soli numeri (nessun indizio), panca, griglie
  const A = g.arredi;
  A.cartello(-2.5, 2.78, -17.96, 0, '03', () => '');
  A.cartello(2.5, 2.78, -17.96, 0, '04', () => '');
  m.tondo(-1.2, 0.4, -11.25, 1.2, 0.47, -10.8, m.mat.legno, { r: 0.03 });
  for (const x of [-1.0, 1.0]) m.tondo(x - 0.04, 0, -11.2, x + 0.04, 0.4, -10.85, m.mat.scuro, { r: 0.02, solido: false });
  m.ombra(0, 0, -11.02, 2.8, 0.9);
  A.griglia(-4.98, 2.7, -14, Math.PI / 2);
  A.griglia(4.98, 2.7, -14, -Math.PI / 2);

  m.zona('porta:sinistra', -3.5, -1, -21.7, -1.5, 3, -18.6);
  m.zona('porta:destra', 1.5, -1, -21.7, 3.5, 3, -18.6);
  void THREE;
}
