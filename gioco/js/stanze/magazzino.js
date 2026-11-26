// Il magazzino (porta destra): la gravità non è ancora stata sistemata. Tra le scatole
// ce n'è una che brilla: chi la prende sblocca il finale "Il magazzino".
import * as THREE from 'three';

export function costruisci(m, g) {
  const mat = m.mat;
  m.stanza({
    nome: 'magazzino', x0: 0.5, x1: 14, z0: -36, z1: -22, h: 5, gravita: 0.3,
    pareti: { s: { aperture: [{ a: 1.5, b: 3.5, y0: 0, y1: 2.4 }] } },
    luci: [[5, -26], [10.5, -26], [5, -32], [10.5, -32]], intensita: 3, raggio: 8,
  });

  // scaffali: tre file
  for (const z of [-26.5, -30, -33.5]) {
    const x0 = 6, x1 = 13;
    for (const x of [x0, (x0 + x1) / 2, x1 - 0.1]) m.tondo(x, 0, z - 0.5, x + 0.1, 3, z + 0.5, mat.cornice, { r: 0.02 });
    for (const y of [0.9, 1.9, 2.9]) m.tondo(x0, y, z - 0.5, x1, y + 0.06, z + 0.5, mat.grigio, { r: 0.02 });
    m.ombra((x0 + x1) / 2, 0, z, x1 - x0 + 0.8, 1.6);
    for (let k = 0; k < 5; k++) {
      const piano = [0.96, 1.96][k % 2];
      g.cubo(x0 + 0.55 + k * 1.25, piano + 0.24, z + (Math.random() - 0.5) * 0.3);
    }
  }
  g.arredi.cartello(2.5, 2.7, -22.03, Math.PI, '04', () => g.T().sale.magazzino);
  for (const z of [-25, -33]) g.arredi.griglia(0.52, 4, z, Math.PI / 2, 0.8, 0.4);
  // scatole sparse a terra
  for (let k = 0; k < 6; k++) g.cubo(2 + Math.random() * 3, 0.3 + k * 0.5, -25 - Math.random() * 9);

  // la scatola che brilla, in fondo
  const etichetta = g.texTesto(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#fbf7e9';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e0b84f';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = '#5b4a1a';
    ctx.font = '800 30px Archivo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.T().targhe.speciale, w / 2, h / 2 + 10);
  });
  etichetta.ridisegna();
  g.suLingua(() => etichetta.ridisegna());
  const speciale = g.cubo(12.6, 0.3, -35.2, { speciale: true, mappa: etichetta });
  const alone = m.luce(0, 0, 0, 2.5, 3.5, 0xffe7a8);
  m.ogniFrame((dt, t) => {
    alone.position.copy(speciale.pos);
    alone.intensity = 2 + Math.sin(t * 2.4) * 0.8;
  });
}
