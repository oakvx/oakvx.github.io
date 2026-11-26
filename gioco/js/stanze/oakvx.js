// La stanza di oakvx (Fuori orario): per ora un segnaposto. La porta segreta del percorso porta qui.
export function costruisci(m, g) {
  m.stanza({ nome: 'oakvx', x0: 660, x1: 668, z0: 0, z1: 12, h: 3, ala: 'oakvx', passi: 'moquette', luci: [[664, 6, 0.6, 0.6]], intensita: 2, raggio: 8, coloreLuce: 0xffd9a8 });
  g.arredi.cartello(664, 2.6, 11.97, Math.PI, '??', () => g.T().stanze.oakvx.cartello);
  g.puntoControllo('oakvx', 664, 0, 3, Math.PI);
  return { debug: {} };
}
