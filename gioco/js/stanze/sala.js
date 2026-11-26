// Sala d'attesa (stanza 01) e primo corridoio. Regola: chi torna qui dal bivio
// viene contato, e alla terza volta il corridoio cambia (vedi corridoio.js).
import * as THREE from 'three';
import { geoTonda } from '../engine/mondo.js';

export function costruisci(m, g) {
  const mat = m.mat;
  m.stanza({
    nome: 'sala', x0: -4, x1: 4, z0: -4, z1: 4, h: 3.2,
    pareti: { n: { aperture: [{ a: -1, b: 1, y0: 0, y1: 2.6 }] } },
    luci: [[0, -1.6], [0, 1.6]], intensita: 3.2, raggio: 7,
  });
  m.stanza({
    nome: 'corridoio1', x0: -1, x1: 1, z0: -9.7, z1: -4.3, h: 2.6,
    pareti: { n: false, s: false }, luci: [[0, -7, 0.5, 1.1]], luciPunto: false,
  });

  // monitor su piedistallo: Brat Animator
  const gruppo = new THREE.Group();
  gruppo.position.set(-2.5, 0, -1.4);
  const ped = new THREE.Mesh(geoTonda(0.6, 1.0, 0.6, 0.04), mat.grigio);
  ped.position.y = 0.5;
  const corpo = new THREE.Mesh(geoTonda(0.72, 0.5, 0.42, 0.05), mat.scuro);
  corpo.position.y = 1.27;
  const texSchermo = g.texTesto(512, 320, (ctx, w, h, t, parole) => {
    const ciclo = 5.2;
    const tc = t % ciclo;
    ctx.fillStyle = '#0f1417';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    parole.forEach((p, i) => {
      const t0 = 0.4 + i * 0.9;
      if (tc < t0) return;
      const k = Math.min(1, (tc - t0) / 0.35);
      ctx.globalAlpha = k * (tc > ciclo - 0.6 ? (ciclo - tc) / 0.6 : 1);
      ctx.fillStyle = '#e9f0f2';
      ctx.font = `700 ${40 + (1 - k) * 8}px Archivo, sans-serif`;
      ctx.fillText(p, w / 2, 70 + i * 50 + (1 - k) * 12);
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#26323a';
    ctx.fillRect(24, 286, 464, 6);
    ctx.fillStyle = '#7fb3c4';
    ctx.fillRect(24, 286, 464 * (tc / ciclo), 6);
  });
  const schermo = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.39), new THREE.MeshBasicMaterial({ map: texSchermo, fog: false }));
  schermo.position.set(0, 1.27, 0.211);
  gruppo.add(ped, corpo, schermo);
  gruppo.lookAt(0, 0, 1.5);
  m.scene.add(gruppo);
  m.box(-2.92, 0, -1.82, -2.08, 1.55, -0.98, mat.grigio, { solido: true }).mesh.visible = false;
  g.interattivo(schermo, 'monitor');
  g.interattivo(corpo, 'monitor');
  let passo = -1;
  const parole = { it: ['testi', 'che', 'sono', 'suoni'], en: ['lyrics', 'that', 'are', 'sounds'] };
  m.ogniFrame((dt, t) => {
    const p = Math.floor(t * 12);
    if (p !== passo) { passo = p; texSchermo.ridisegna(t, parole[g.lingua()]); }
  });

  // targa con il nome
  const texTarga = g.texTesto(512, 256, (ctx, w, h) => {
    const T = g.T();
    const gr = ctx.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#dfe5e8');
    gr.addColorStop(0.5, '#f4f7f8');
    gr.addColorStop(1, '#d5dce0');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#a9b4ba';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = '#1d252b';
    ctx.font = '750 50px Archivo, sans-serif';
    ctx.fillText(T.nome.toUpperCase(), 36, 104);
    ctx.fillStyle = '#4b5860';
    ctx.font = '400 26px Archivo, sans-serif';
    ctx.fillText(T.ruolo, 38, 150);
    ctx.font = '500 20px Archivo, sans-serif';
    ctx.fillStyle = '#7a868d';
    ctx.fillText(T.targhe.sala, 38, 210);
  });
  const targa = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.575), new THREE.MeshLambertMaterial({ map: texTarga }));
  targa.position.set(3.99, 1.55, -1.6);
  targa.rotation.y = -Math.PI / 2;
  m.scene.add(targa);
  g.interattivo(targa, 'targa');

  // la scatola sigillata: il "pezzo di Gabri" resta chiuso
  const texScatola = g.texTesto(256, 256, (ctx, w, h) => {
    const T = g.T();
    ctx.fillStyle = '#f3f5f6';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(205, 212, 216, 0.9)';
    ctx.fillRect(112, 0, 32, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 150, 176, 70);
    ctx.strokeStyle = '#9aa6ad';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 150, 176, 70);
    ctx.fillStyle = '#1d252b';
    ctx.font = '700 22px Archivo, sans-serif';
    ctx.fillText(T.targhe.scatolaTitolo, 52, 180);
    ctx.fillStyle = '#56636c';
    ctx.font = '400 18px Archivo, sans-serif';
    ctx.fillText(T.targhe.scatolaNota, 52, 206);
  });
  const lato = new THREE.MeshLambertMaterial({ map: texScatola });
  const sopra = new THREE.MeshLambertMaterial({ color: 0xf1f3f4 });
  const scatola = new THREE.Mesh(geoTonda(0.55, 0.55, 0.55, 0.03), [lato, lato, sopra, sopra, lato, lato]);
  scatola.position.set(2.5, 0.275, 2.3);
  scatola.rotation.y = -0.5;
  m.scene.add(scatola);
  m.box(2.15, 0, 1.95, 2.85, 0.55, 2.65, mat.grigio).mesh.visible = false;
  g.interattivo(scatola, 'scatola');

  g.suLingua(() => { texTarga.ridisegna(); texScatola.ridisegna(); });
  texTarga.ridisegna();
  texScatola.ridisegna();

  // allestimento: ombre, recinto, didascalie, cartello, griglie
  const A = g.arredi;
  m.ombra(-2.5, 0, -1.4, 1.2, 1.2);
  m.ombra(2.5, 0, 2.3, 1.1, 1.1);
  A.recinto(1.85, 1.65, 3.15, 2.95);
  A.didascalia(-3.97, 1.45, -0.35, Math.PI / 2, () => g.T().didascalie.monitor, { w: 0.5, h: 0.32 });
  A.didascalia(1.45, 0, 2.3, -Math.PI / 2, () => g.T().didascalie.scatola, { su: 'leggio', w: 0.42, h: 0.27 });
  m.box(1.33, 0, 2.18, 1.57, 1.1, 2.42, mat.chiaro).mesh.visible = false;
  A.cartello(0, 2.93, -3.97, 0, '01', () => g.T().sale.attesa);
  A.griglia(-3.98, 2.75, 2.2, Math.PI / 2);
  A.griglia(3.98, 2.75, 2.2, -Math.PI / 2);
  // una panca lungo la parete di fondo, per l'attesa
  m.tondo(-1.6, 0.4, 3.45, 1.6, 0.47, 3.85, mat.legno, { r: 0.03 });
  for (const x of [-1.4, 1.4]) m.tondo(x - 0.04, 0, 3.5, x + 0.04, 0.4, 3.8, mat.scuro, { r: 0.02, solido: false });
  m.ombra(0, 0, 3.65, 3.6, 0.9);

  // conteggio dei ritorni dal bivio
  let daBivio = false;
  g.su('stanza:bivio', () => { daBivio = true; });
  g.su('stanza:sala', () => {
    if (daBivio) { daBivio = false; g.emetti('indietro'); }
  });
}
