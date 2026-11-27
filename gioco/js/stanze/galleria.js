// Galleria · Design & Web. Quattro vetrine: il portfolio (uno schermo che inquadra la galleria
// dall'alto, con te dentro), Spinotto Felice (una leva cambia il tema della stanza, chiaro o
// scuro, come il sito), Top Gun Fly School (una pista in una teca sola: un file solo) e il
// sito di Synkris. Nessun enigma: è la stanza dove si respira.
import * as THREE from 'three';
import { apertura, nicchia, collega } from '../engine/varchi.js';
import { creaOggetti } from '../engine/oggetti.js';
import { pbrMondo } from '../engine/materiali.js';

const X0 = 150, X1 = 175, Z0 = 0, Z1 = 20, H = 5;
const CHIARO = { nebbia: 0xb9bdb6, vicino: 6, lontano: 40, cielo: 0xfdfcf6, terra: 0x9a9d96, intensita: 3.2 };
const SCURO = { nebbia: 0x0e1012, vicino: 4, lontano: 30, cielo: 0x5d6a78, terra: 0x0c0d10, intensita: 1.1 };
const VETRINE = [['portfolio', 155.5, 7], ['spinotto', 169.5, 7], ['topgun', 155.5, 14], ['synkris', 169.5, 14]];

export function costruisci(m, g) {
  const mat = m.mat;
  const T = () => g.T().stanze.galleria;
  m.stanza({
    nome: 'galleria', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H, ala: 'design', passi: 'legno', hdr: 'interno-caldo',
    pareti: { n: { aperture: [apertura(162.5)] }, s: { aperture: [apertura(162.5)] } },
    materiali: { pavimento: mat.legnoScuro, muro: pbrMondo(g.asset, 'intonaco', { scala: 0.5, tinta: 0xf1ece2 }) },
    luci: [[157, 7, 0.6, 1.6], [168, 7, 0.6, 1.6], [157, 14, 0.6, 1.6], [168, 14, 0.6, 1.6]], intensita: 2.6, raggio: 9,
    atmosfera: CHIARO,
  });
  const vetro = new THREE.MeshLambertMaterial({ color: 0xd4e4e8, transparent: true, opacity: 0.2, depthWrite: false });
  const teca = (x, z) => {
    m.box(x - 0.9, 0, z - 0.6, x + 0.9, 0.95, z + 0.6, mat.chiaro);
    m.box(x - 0.9, 0.95, z - 0.6, x + 0.9, 1.75, z + 0.6, vetro, { solido: false });
  };
  for (const [k, x, z] of VETRINE) {
    teca(x, z);
    g.arredi.didascalia(x, 0, z - 1.25, 0, () => T().testi[k], { su: 'leggio', w: 0.62, h: 0.4 });
    m.box(x - 0.15, 0, z - 1.4, x + 0.15, 1.1, z - 1.1, mat.chiaro).mesh.visible = false;
  }

  // 1 · portfolio: lo schermo mostra la galleria dall'alto, col Mii al posto tuo
  const rt = new THREE.WebGLRenderTarget(512, 288);
  const occhio = new THREE.PerspectiveCamera(60, 16 / 9, 0.5, 40);
  occhio.position.set(162.5, 16, 10);
  occhio.lookAt(162.5, 0, 10);
  occhio.layers.enable(1);
  const schermo = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.84), new THREE.MeshBasicMaterial({ map: rt.texture }));
  schermo.position.set(155.5, 1.45, 7);
  schermo.rotation.x = -0.35;
  m.scene.add(schermo);
  const io = g.arredi.mii(0, 0, 0, 0, 'in piedi');
  io.traverse((o) => o.layers.set(1));
  io.scale.setScalar(1.6);
  let fotogramma = 0;
  const pixel = new Uint8Array(4 * 16);
  let hashSchermo = 0;
  m.ogniFrame(() => {
    const p = g.giocatore().pos;
    const qui = p.x > X0 && p.x < X1 && p.z > Z0 && p.z < Z1 && Math.abs(p.y - 0.9) < 3;
    io.visible = qui;
    if (!qui || fotogramma++ % 3) return;
    io.position.set(p.x, 0, p.z);
    io.rotation.y = g.yaw();
    const r = g.renderer;
    const prima = r.getRenderTarget();
    schermo.visible = false;
    r.setRenderTarget(rt);
    r.render(m.scene, occhio);
    r.setRenderTarget(prima);
    schermo.visible = true;
    if (g.debug) {
      r.readRenderTargetPixels(rt, 248, 136, 4, 4, pixel);
      hashSchermo = pixel.reduce((a, v, i) => (a * 31 + v * (i + 1)) % 1e9, 7);
    }
  });

  // 2 · Spinotto Felice: una casetta in miniatura e la leva del tema
  m.box(169.1, 0.95, 6.7, 169.9, 1.35, 7.3, new THREE.MeshLambertMaterial({ color: 0xe9d3a6 }), { solido: false });
  m.box(169.0, 1.35, 6.6, 170.0, 1.5, 7.4, new THREE.MeshLambertMaterial({ color: 0xa8402f }), { solido: false });
  m.box(171.1, 0, 6.8, 171.5, 1, 7.2, mat.cornice);
  const leva = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), new THREE.MeshLambertMaterial({ color: 0xe9c14a }));
  leva.position.set(171.3, 1.25, 7);
  m.scene.add(leva);
  g.interattivo(leva, 'galleria-tema');
  let tema = 'chiaro';
  g.su('oggetto:galleria-tema', () => {
    tema = tema === 'chiaro' ? 'scuro' : 'chiaro';
    leva.rotation.x = tema === 'scuro' ? -0.5 : 0;
    g.suoni.leva();
    g.atmosfera(tema === 'scuro' ? SCURO : CHIARO);
  });

  // 3 · Top Gun Fly School: una pista e un aereo in una teca sola
  m.box(154.7, 0.96, 13.85, 156.3, 0.97, 14.15, new THREE.MeshLambertMaterial({ color: 0x2f3437 }), { solido: false });
  const aereo = new THREE.Group();
  const bianco = new THREE.MeshLambertMaterial({ color: 0xf2f2f2 });
  for (const [sx, sy, sz] of [[0.36, 0.05, 0.06], [0.06, 0.02, 0.34], [0.08, 0.1, 0.02]]) aereo.add(new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), bianco));
  aereo.children[2].position.set(-0.15, 0.05, 0);
  aereo.position.set(155.5, 1.2, 14);
  m.scene.add(aereo);
  m.ogniFrame((dt, t) => { aereo.position.x = 155.5 + Math.sin(t * 0.6) * 0.6; aereo.position.y = 1.15 + Math.max(0, Math.sin(t * 0.6)) * 0.35; });

  // 4 · sito di Synkris: cartello "coming soon"
  const presto = g.texTesto(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#0f1b2a'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#7cc7ff'; ctx.font = '800 56px Archivo, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SYNKRIS', w / 2, 110);
    ctx.fillStyle = '#e6eef7'; ctx.font = '500 34px Archivo, sans-serif'; ctx.fillText(T().presto, w / 2, 170);
  });
  presto.ridisegna();
  g.suLingua(() => presto.ridisegna());
  const cartello = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshBasicMaterial({ map: presto }));
  cartello.position.set(169.5, 1.35, 14);
  m.scene.add(cartello);

  g.arredi.cartello(162.5, 3.6, Z0 + 0.03, 0, '09', () => T().cartello);
  nicchia(m, [162.5, 0, Z0, 0]);
  nicchia(m, [162.5, 0, Z1, Math.PI]);
  collega(g, 'galleria-scrivania', [162.5, 0, Z1, Math.PI], [206, 0, 0, 0]);
  g.arredi.porta(162.5, 0, Z1 - 0.06, Math.PI, () => T().uscita);
  // oggetti scansionati: dove sedersi a guardare le vetrine
  const oggetti = creaOggetti(m, g);
  oggetti.metti('sofa_02', X0 + 0.5, 0, 10.5, Math.PI / 2);
  oggetti.metti('side_table_01', X0 + 0.4, 0, 12.6, 0);
  oggetti.metti('modern_arm_chair_01', X1 - 0.6, 0, 10.5, -Math.PI / 2);
  for (const [x, z] of [[X0 + 0.6, 1], [X1 - 0.6, 1], [X0 + 0.6, Z1 - 1], [X1 - 0.6, Z1 - 1]]) oggetti.metti('potted_plant_02', x, 0, z, x * 7);
  g.puntoControllo('galleria', 162.5, 0, 1.5, Math.PI);
  return {
    debug: {
      varchi: [{ id: 'galleria-scrivania', da: 'galleria', a: 'scrivania', lato: [162.5, 0, Z1, Math.PI] }],
      uscita: [162.5, Z1 - 0.5],
      stato: () => ({ modelli: oggetti.quanti(), tema, hashSchermo }),
    },
  };
}
