// Contatti: l'ultima stanza. L'email grande sulla parete, a cosa è aperto oakvx, il suo Mii che
// saluta. In fondo la zona finale: si apre la schermata di fine con tempo e segreti trovati.
import * as THREE from 'three';
import { apertura, nicchia, collega } from '../engine/varchi.js';

const X0 = 940, X1 = 950, Z0 = 0, Z1 = 10, H = 3.4;

export function costruisci(m, g) {
  const T = () => g.T().stanze.contatti;
  m.stanza({
    nome: 'contatti', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H, ala: 'contatti', passi: 'legno',
    pareti: { n: { aperture: [apertura(945)] } },
    materiali: { pavimento: m.mat.legnoScuro },
    luci: [[945, 3, 0.6, 1.4], [945, 7, 0.6, 1.4]], intensita: 2.8, raggio: 9, coloreLuce: 0xfff1d8,
    atmosfera: { nebbia: 0x23262a, vicino: 6, lontano: 30, cielo: 0xf4f1ea, terra: 0x3a342c, intensita: 2.4 },
  });
  const parete = g.texTesto(1024, 512, (ctx, w, h) => {
    const t = T();
    ctx.fillStyle = '#f4f1ea'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#16bad8'; ctx.fillRect(60, 70, 90, 12);
    ctx.fillStyle = '#1d252b'; ctx.font = '800 64px Archivo, sans-serif'; ctx.fillText(t.titolo, 60, 170);
    ctx.font = '700 52px monospace'; ctx.fillText('gabrielelucia07@gmail.com', 60, 270);
    ctx.fillStyle = '#56636c'; ctx.font = '500 36px Archivo, sans-serif'; ctx.fillText(t.aperto, 60, 350);
    ctx.fillText(t.dove, 60, 410);
  });
  parete.ridisegna();
  g.suLingua(() => parete.ridisegna());
  const quadro = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.5), new THREE.MeshLambertMaterial({ map: parete }));
  quadro.position.set(945, 1.8, Z1 - 0.04);
  quadro.rotation.y = Math.PI;
  m.scene.add(quadro);
  nicchia(m, [945, 0, Z0, 0]);
  g.arredi.mii(948.2, 0, 7.6, Math.PI + 0.4, 'gira');
  g.arredi.cartello(945, 2.9, Z0 + 0.03, 0, '13', () => T().cartello);
  m.zona('fine', X0, -1, Z1 - 2.2, X1, 3, Z1);
  g.su('fine', () => g.fine());
  g.puntoControllo('contatti', 945, 0, 1.5, Math.PI);
  return { debug: { finale: [945, Z1 - 1.2] } };
}
