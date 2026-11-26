// La stanza di oakvx (Fuori orario): la sua camera, una mansarda di notte. Tetto di vetro a
// falde con la pioggia che scorre, travi scure, due faretti caldi. In fondo il letto con la
// coperta verde dentro una libreria piena, una TV a tubo catodico che fa da jukebox. Pareti blu
// a piccoli motivi, moquette a onde arancio e ocra, termosifone, boccione, finestrella ad arco,
// una porta con la scaletta. Entrando l'immagine diventa una foto di una fotocamera del 2008.
// Musica, poster, oggetti e note arrivano da dati/stanza-oakvx.json (vedi oakvx/LEGGIMI.md).
import * as THREE from 'three';
import { canvasTex } from '../engine/materiali.js';
import { normalizza } from '../logica/stanzaOakvx.js';
import { apertura, nicchia, collega } from '../engine/varchi.js';

const X0 = 900, X1 = 908, Z0 = 0, Z1 = 12, PARETE = 2.2, COLMO = 4.6, CX = 904;

export function costruisci(m, g) {
  const T = () => g.T().stanze.oakvx;
  // carta da parati blu polvere con piccoli motivi dorati, come nella foto
  const carta = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#566e94'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(30,40,70,${Math.random() * 0.08})`; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    ctx.strokeStyle = 'rgba(236, 206, 132, 0.8)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (const [x, y, a] of [[40, 50, 0.5], [170, 34, -0.4], [110, 140, 1.2], [214, 190, 0.2], [34, 210, -1], [150, 236, 2]]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(-9, 6); ctx.quadraticCurveTo(0, -10, 9, 6); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 10, 2.5, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  });
  // moquette a onde ad incastro, ruggine e senape, con le stelline
  const moquette = canvasTex(512, 512, (ctx, w, h) => {
    const passo = 128, alto = 64;
    for (let r = -1; r < h / alto + 1; r++) {
      const y = r * alto;
      ctx.fillStyle = r % 2 ? '#d9a33a' : '#a3431b';
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 4) ctx.lineTo(x, y + Math.sin((x / passo) * Math.PI * 2) * 18);
      for (let x = w; x >= 0; x -= 4) ctx.lineTo(x, y + alto + Math.sin((x / passo) * Math.PI * 2 + Math.PI) * 18);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#4e1e0b'; ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) ctx[x ? 'lineTo' : 'moveTo'](x, y + Math.sin((x / passo) * Math.PI * 2) * 18);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(70, 25, 8, 0.8)'; ctx.lineWidth = 2;
    for (let y = 32; y < h; y += 128) for (let x = 64; x < w; x += 128) {
      for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 4; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 12, y - Math.sin(a) * 12); ctx.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); ctx.stroke(); }
    }
  });
  const legno = new THREE.MeshLambertMaterial({ color: 0x3b2618 });
  const muro = new THREE.MeshLambertMaterial({ map: carta });
  carta.repeat.set(5, 1.2);
  m.stanza({
    nome: 'oakvx', x0: X0, x1: X1, z0: Z0, z1: Z1, h: PARETE, soffitto: false, ala: 'oakvx', passi: 'moquette',
    pareti: { n: { aperture: [apertura(902.5), apertura(905.5)] }, w: { aperture: [apertura(8.9)] } },
    materiali: { muro, pavimento: new THREE.MeshLambertMaterial({ map: moquette }), battiscopa: legno, cornice: legno },
    luciPunto: false,
    atmosfera: { nebbia: 0x16233b, vicino: 10, lontano: 60, cielo: 0xa6b8de, terra: 0x8a4a1e, intensita: 1.9 },
    suono: { ronzio: 0.05, pioggia: 1 },
  });
  moquette.repeat.set(1, 1.6);

  // il cielo del temporale, visibile dal tetto di vetro (con qualche lampo lontano)
  const nuvole = canvasTex(1024, 512, (ctx, w, h) => {
    const gr = ctx.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#040a16'); gr.addColorStop(0.5, '#0f1e36'); gr.addColorStop(1, '#22385a');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * w, y = Math.random() * h * 0.95, rr = 30 + Math.random() * 120;
      const n = ctx.createRadialGradient(x, y, 0, x, y, rr);
      n.addColorStop(0, `rgba(105, 128, 165, ${0.25 + Math.random() * 0.3})`); n.addColorStop(0.6, `rgba(70, 90, 125, 0.12)`); n.addColorStop(1, 'rgba(60, 80, 110, 0)');
      ctx.fillStyle = n; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
  });
  const cielo = new THREE.Mesh(new THREE.SphereGeometry(40, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ map: nuvole, side: THREE.BackSide, fog: false }));
  cielo.position.set(CX, -2, (Z0 + Z1) / 2);
  m.scene.add(cielo);
  let lampo = 0, prossimoLampo = 12;
  m.ogniFrame((dt, t) => {
    if (t > prossimoLampo) { lampo = 1; prossimoLampo = t + 18 + Math.random() * 25; }
    lampo = Math.max(0, lampo - dt * 3);
    cielo.material.color.setScalar(1 + lampo * 1.6);
  });

  // timpani (triangoli sopra le pareti corte) e tetto di vetro a falde
  const timpano = new THREE.Shape([new THREE.Vector2(X0 - CX, 0), new THREE.Vector2(X1 - CX, 0), new THREE.Vector2(0, COLMO - PARETE)]);
  const tSud = new THREE.Mesh(new THREE.ExtrudeGeometry(timpano, { depth: 0.3, bevelEnabled: false }), muro);
  tSud.position.set(CX, PARETE, Z0 - 0.3);
  m.scene.add(tSud);
  const pioggia = canvasTex(256, 512, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(40, 60, 90, 0.06)'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w, y = Math.random() * h, l = 4 + Math.random() * 18;
      ctx.strokeStyle = `rgba(200, 220, 250, ${0.25 + Math.random() * 0.35})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.random() * 2 - 1, y + l); ctx.stroke();
      ctx.fillStyle = 'rgba(220, 235, 255, 0.55)'; ctx.fillRect(x - 0.5, y + l, 1.5, 1.5);
    }
  });
  pioggia.repeat.set(6, 4);
  const vetro = new THREE.MeshBasicMaterial({ map: pioggia, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const falda = Math.hypot(CX - X0, COLMO - PARETE);
  const inclina = Math.atan2(COLMO - PARETE, CX - X0);
  for (const lato of [-1, 1]) {
    const v = new THREE.Mesh(new THREE.PlaneGeometry(falda, Z1 - Z0 + 0.3), vetro);
    v.rotation.order = 'YXZ';
    v.rotation.x = -Math.PI / 2;
    v.rotation.y = lato * inclina;
    v.position.set(CX + lato * (CX - X0) / 2, (PARETE + COLMO) / 2, (Z0 + Z1) / 2);
    m.scene.add(v);
    // travi lungo la falda
    for (let z = Z0; z <= Z1 + 0.01; z += 2) {
      const trave = new THREE.Mesh(new THREE.BoxGeometry(falda, 0.16, 0.14), legno);
      trave.position.set(CX + lato * (CX - X0) / 2, (PARETE + COLMO) / 2 - 0.05, z);
      trave.rotation.z = -lato * inclina;
      m.scene.add(trave);
    }
  }
  // montanti lungo la falda: la griglia scura del tetto di vetro
  for (const lato of [-1, 1]) for (const t of [0.34, 0.67]) {
    const arcareccio = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, Z1 - Z0 + 0.3), legno);
    arcareccio.position.set(CX + lato * (CX - X0) * (1 - t), PARETE + (COLMO - PARETE) * t - 0.04, (Z0 + Z1) / 2);
    m.scene.add(arcareccio);
  }
  const colmo = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, Z1 - Z0 + 0.3), legno);
  colmo.position.set(CX, COLMO - 0.1, (Z0 + Z1) / 2);
  m.scene.add(colmo);
  m.ogniFrame((dt) => { pioggia.offset.y += dt * 0.35; });
  // timpano nord in vetro, sopra la libreria, con un montante al centro
  const vetroNord = new THREE.Mesh(new THREE.ShapeGeometry(timpano), vetro);
  vetroNord.position.set(CX, PARETE, Z1 + 0.05);
  m.scene.add(vetroNord);
  const montante = new THREE.Mesh(new THREE.BoxGeometry(0.1, COLMO - PARETE, 0.1), legno);
  montante.position.set(CX, (PARETE + COLMO) / 2, Z1 + 0.05);
  m.scene.add(montante);
  m.box(X0, PARETE - 0.02, Z1, X1, PARETE + 0.1, Z1 + 0.15, legno, { solido: false });

  // luce calda sul pavimento e nella nicchia del letto
  m.luce(CX, 1.1, 5.5, 2.6, 8, 0xffa860);
  m.luce(X1 - 0.6, 1.6, 7, 1.4, 4, 0xffcf7a);
  m.luce(CX, 1.5, Z1 - 1.1, 1.8, 4, 0xffc890);

  // due faretti appesi al colmo
  for (const z of [4.5, 7.5]) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.22, 10), new THREE.MeshLambertMaterial({ color: 0x23272a }));
    f.position.set(CX + (z < 6 ? -0.9 : 0.9), COLMO - 0.75, z);
    f.rotation.z = z < 6 ? -0.5 : 0.5;
    m.scene.add(f);
    const lampadina = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe3a8 }));
    lampadina.position.copy(f.position).add(new THREE.Vector3(z < 6 ? 0.05 : -0.05, -0.12, 0));
    m.scene.add(lampadina);
    m.luce(f.position.x, f.position.y - 0.3, z, 3.6, 9, 0xffd7a0);
  }

  // letto con la coperta verde dentro la libreria
  const coperta = new THREE.MeshLambertMaterial({ color: 0x7c8f3a });
  m.box(CX - 1.1, 0, Z1 - 2.2, CX + 1.1, 0.42, Z1 - 0.2, legno);
  m.box(CX - 1.05, 0.42, Z1 - 2.15, CX + 1.05, 0.62, Z1 - 0.25, coperta);
  for (const x of [-0.5, 0.5]) m.box(CX + x - 0.42, 0.62, Z1 - 0.75, CX + x + 0.42, 0.8, Z1 - 0.3, new THREE.MeshLambertMaterial({ color: 0xd9dde6 }), { solido: false });
  const libreria = legno;
  m.box(CX - 2.6, 0, Z1 - 0.45, CX - 1.15, PARETE + 0.4, Z1, libreria);
  m.box(CX + 1.15, 0, Z1 - 0.45, CX + 2.6, PARETE + 0.4, Z1, libreria);
  m.box(CX - 1.15, 1.7, Z1 - 0.45, CX + 1.15, PARETE + 0.4, Z1, libreria);
  const scaffali = [];
  const ripiano = new THREE.MeshLambertMaterial({ color: 0x5a3b26 });
  const colLibri = [0x8a3b2f, 0x2f5a8a, 0xc9a43b, 0x3b7a4f, 0x6b3b8a, 0xd8d2c0, 0x9c6b3a, 0x334a5e];
  const mLibri = colLibri.map((c) => new THREE.MeshLambertMaterial({ color: c }));
  const libri = (x0, x1, y) => {
    for (let x = x0; x < x1 - 0.05;) {
      const sp = 0.04 + Math.random() * 0.05, alt = 0.2 + Math.random() * 0.12;
      m.box(x, y, Z1 - 0.62 + Math.random() * 0.04, x + sp, y + alt, Z1 - 0.47, mLibri[Math.floor(Math.random() * mLibri.length)], { solido: false });
      x += sp + 0.006;
    }
  };
  for (const xs of [[CX - 2.55, CX - 1.2], [CX + 1.2, CX + 2.55]]) {
    for (const y of [0.45, 1.05, 1.65]) {
      m.box(xs[0], y, Z1 - 0.47, xs[1], y + 0.03, Z1 - 0.44, ripiano, { solido: false });
      if (y > 1.5) libri(xs[0], xs[1], y + 0.03);
      else scaffali.push([(xs[0] + xs[1]) / 2, y + 0.03, Z1 - 0.62]);
    }
  }
  libri(CX - 2.55, CX - 1.95, 0.48);
  // libri colorati sugli scaffali alti
  libri(CX - 1.1, CX + 1.1, 1.73);

  // la TV a tubo catodico (jukebox) e il videoregistratore
  const tvX = CX + 1.88, tvY = 1.08;
  m.box(tvX - 0.42, tvY, Z1 - 0.8, tvX + 0.42, tvY + 0.52, Z1 - 0.46, new THREE.MeshLambertMaterial({ color: 0x2b2b2e }), { solido: false });
  const tv = g.texTesto(320, 240, (ctx, w, h, info) => {
    ctx.fillStyle = '#0c1a14'; ctx.fillRect(0, 0, w, h);
    const t = T();
    ctx.fillStyle = '#b9ffcf'; ctx.font = '700 22px monospace';
    ctx.fillText(info && info.titolo ? info.titolo.slice(0, 22) : t.tvSpenta, 16, 60);
    ctx.font = '16px monospace'; ctx.fillStyle = '#7fbf93';
    ctx.fillText(info && info.stato ? info.stato : t.tvAiuto, 16, 92);
    if (info && info.progresso !== undefined) {
      ctx.fillStyle = '#244b36'; ctx.fillRect(16, 196, w - 32, 10);
      ctx.fillStyle = '#b9ffcf'; ctx.fillRect(16, 196, (w - 32) * info.progresso, 10);
    }
    for (let y = 0; y < h; y += 3) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, y, w, 1); }
  });
  tv.ridisegna(null);
  g.suLingua(() => tv.ridisegna(statoTv()));
  const schermo = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.42), new THREE.MeshBasicMaterial({ map: tv }));
  schermo.position.set(tvX, tvY + 0.27, Z1 - 0.81);
  schermo.rotation.y = Math.PI;
  m.scene.add(schermo);
  g.interattivo(schermo, 'jukebox');
  const vcr = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.32), new THREE.MeshLambertMaterial({ color: 0x1a1a1c }));
  vcr.position.set(tvX, 0.53, Z1 - 0.65);
  m.scene.add(vcr);
  g.interattivo(vcr, 'jukebox-avanti');

  // guardando il letto: a sinistra (x alte) termosifone, boccione e finestrella ad arco; a destra la porta con la scaletta
  const bianco = new THREE.MeshLambertMaterial({ color: 0xe6e2da });
  for (let i = 0; i < 9; i++) m.box(X1 - 0.24, 0.15, 4 + i * 0.12, X1 - 0.08, 0.85, 4.08 + i * 0.12, bianco);
  const boccione = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.45, 14), new THREE.MeshLambertMaterial({ color: 0x8fc4e8, transparent: true, opacity: 0.6 }));
  boccione.position.set(X1 - 0.4, 1.25, 2.6);
  m.scene.add(boccione);
  m.box(X1 - 0.6, 0, 2.4, X1 - 0.2, 1.02, 2.8, new THREE.MeshLambertMaterial({ color: 0x6a3a2a }));
  const arco = new THREE.Shape();
  arco.moveTo(-0.45, 0); arco.lineTo(-0.45, 0.45); arco.absarc(0, 0.45, 0.45, Math.PI, 0, true); arco.lineTo(0.45, 0); arco.lineTo(-0.45, 0);
  const finestrella = new THREE.Mesh(new THREE.ShapeGeometry(arco), new THREE.MeshBasicMaterial({ map: pioggia }));
  finestrella.position.set(X1 - 0.02, 1.0, 7);
  finestrella.rotation.y = -Math.PI / 2;
  m.scene.add(finestrella);
  m.box(X1 - 0.25, 0.95, 6.45, X1, 1.0, 7.55, new THREE.MeshLambertMaterial({ color: 0xd9b23b }));
  for (let k = 0; k < 5; k++) m.box(X0 + 0.02, k * 0.2, 6.2 + k * 0.28, X0 + 0.5, k * 0.2 + 0.2, 6.5 + k * 0.28, new THREE.MeshLambertMaterial({ color: 0x2a3340 }), { solido: false });

  // il Mii, seduto sul letto
  g.arredi.mii(CX - 0.6, 0.42, Z1 - 1.6, Math.PI, 'seduto');
  g.arredi.cartello(CX, 2.0, Z0 + 0.03, 0, '12', () => T().cartello);
  g.arredi.didascalia(X0 + 0.03, 1.45, 4, Math.PI / 2, () => T().testi.stanza, { w: 1.3, h: 0.8 });

  // contenuti da stanza-oakvx.json
  const FORME = {
    'console-portatile': () => { const gr = new THREE.Group(); const a = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.12), new THREE.MeshLambertMaterial({ color: 0x4a4f8a })); const b = a.clone(); b.position.set(0, 0.06, -0.05); b.rotation.x = -1.2; gr.add(a, b); return gr; },
    'console-casa': () => new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.24), new THREE.MeshLambertMaterial({ color: 0xe8e8e8 })),
    cassetta: () => new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.02), new THREE.MeshLambertMaterial({ color: 0x2b2b2b })),
    libro: () => new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.17), new THREE.MeshLambertMaterial({ color: 0x8a3b2f })),
    pianta: () => { const gr = new THREE.Group(); const v = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 8), new THREE.MeshLambertMaterial({ color: 0xa0522d })); const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), new THREE.MeshLambertMaterial({ color: 0x3f7a3a })); f.position.y = 0.13; gr.add(v, f); return gr; },
    tazza: () => new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.08, 10), new THREE.MeshLambertMaterial({ color: 0xf0ede6 })),
    cuffie: () => new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 6, 12, Math.PI), new THREE.MeshLambertMaterial({ color: 0x1f1f22 })),
    vinile: () => new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.01, 20), new THREE.MeshLambertMaterial({ color: 0x111111 })),
  };
  let dati = normalizza(null, g.lingua());
  let caricata = false;
  const contenuti = new THREE.Group();
  m.scene.add(contenuti);
  const etichetta = (testo, x, y, z, ry, w = 0.5) => {
    const t = g.texTesto(256, 64, (ctx, cw, ch) => {
      ctx.fillStyle = '#f2ead6'; ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#2a2018'; ctx.font = '600 24px Archivo, sans-serif'; ctx.fillText(testo.slice(0, 22), 10, 40);
    });
    t.ridisegna();
    const e = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: t }));
    e.position.set(x, y, z);
    e.rotation.y = ry;
    contenuti.add(e);
  };
  function popola() {
    contenuti.clear();
    dati.mensola.slice(0, scaffali.length * 2).forEach((o, i) => {
      const [sx, sy, sz] = scaffali[i % scaffali.length];
      const ogg = FORME[o.forma]();
      ogg.position.set(sx + (i >= scaffali.length ? 0.3 : -0.3), sy + 0.06, sz);
      contenuti.add(ogg);
      etichetta(o.etichetta, ogg.position.x, sy + 0.02, Z1 - 0.47 - 0.33 + 0.001, Math.PI, 0.36);
    });
    const loader = new THREE.TextureLoader();
    dati.poster.slice(0, 6).forEach((p, i) => {
      const lato = i < 3 ? -1 : 1;
      const z = 3 + (i % 3) * 2.2;
      const x = lato < 0 ? X0 + 0.04 : X1 - 0.04;
      const ry = lato < 0 ? Math.PI / 2 : -Math.PI / 2;
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.95, 0.04), legno);
      cornice.position.set(x, 1.5, z);
      cornice.rotation.y = ry;
      contenuti.add(cornice);
      const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.8), new THREE.MeshLambertMaterial({ color: 0x223040 }));
      tela.position.set(x + (lato < 0 ? 0.025 : -0.025), 1.5, z);
      tela.rotation.y = ry;
      contenuti.add(tela);
      loader.load(`oakvx/${p.file}`, (tex) => { tex.colorSpace = THREE.SRGBColorSpace; tela.material = new THREE.MeshLambertMaterial({ map: tex }); }, undefined,
        () => console.warn(`stanza-oakvx: poster non trovato: ${p.file}`));
      if (p.didascalia) etichetta(p.didascalia, x + (lato < 0 ? 0.03 : -0.03), 0.92, z, ry, 0.6);
    });
    dati.note.slice(0, 4).forEach((n, i) => {
      etichetta(n, CX + 0.25 + (i % 2) * 0.45, 0.63, Z1 - 1.6 - Math.floor(i / 2) * 0.3, Math.PI, 0.4);
      contenuti.children[contenuti.children.length - 1].rotation.set(-Math.PI / 2, 0, Math.PI);
    });
    dati.lingue.slice(0, 6).forEach((l, i) => {
      etichetta(`${l.lingua} · ${l.livello}`, X1 - 0.03, 1.95 - (i % 3) * 0.3, 8.6 + Math.floor(i / 3) * 1.3, -Math.PI / 2, 0.7);
    });
    if (dati.avvisi.length) console.warn('stanza-oakvx.json:\n' + dati.avvisi.join('\n'));
  }
  let grezzo = null;
  fetch('dati/stanza-oakvx.json')
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status))))
    .then((t) => { try { grezzo = JSON.parse(t); } catch { grezzo = 'non è JSON'; } })
    .catch(() => { grezzo = 'non trovato'; })
    .finally(() => { dati = normalizza(grezzo, g.lingua()); popola(); caricata = true; });
  g.suLingua(() => { if (caricata) { dati = normalizza(grezzo, g.lingua()); popola(); } });

  // jukebox: brani di oakvx, o il carillon generato
  let indice = 0, suona = false, melodia = false, audio = null, sorgente = null;
  function statoTv() {
    if (melodia) return { titolo: T().carillon, stato: suona ? '▶' : '❚❚' };
    const b = dati.brani[indice];
    if (!b) return null;
    return { titolo: b.titolo, stato: (suona ? '▶ ' : '❚❚ ') + (b.nota || ''), progresso: audio && audio.duration ? audio.currentTime / audio.duration : 0 };
  }
  function passaAMelodia() {
    melodia = true;
    if (audio) { audio.pause(); audio = null; }
    g.musica.melodia(suona);
    tv.ridisegna(statoTv());
  }
  function carica() {
    const b = dati.brani[indice];
    if (!b) { passaAMelodia(); return; }
    if (audio) audio.pause();
    audio = new Audio(`oakvx/${b.file}`);
    audio.crossOrigin = 'anonymous';
    audio.addEventListener('error', () => {
      console.warn(`stanza-oakvx: brano non trovato: ${b.file}`);
      indice++;
      if (indice >= dati.brani.length) passaAMelodia(); else { carica(); if (suona) audio.play().catch(() => {}); }
    });
    audio.addEventListener('ended', () => { indice = (indice + 1) % dati.brani.length; carica(); audio.play().catch(() => {}); });
    if (g.suoni.ac && g.suoni.out) {
      try { sorgente = g.suoni.ac.createMediaElementSource(audio); sorgente.connect(g.suoni.out); } catch { sorgente = null; }
    }
  }
  g.su('oggetto:jukebox', () => {
    suona = !suona;
    if (melodia || !dati.brani.length) { passaAMelodia(); return; }
    if (!audio) carica();
    if (audio) { if (suona) audio.play().catch(() => {}); else audio.pause(); }
    tv.ridisegna(statoTv());
  });
  g.su('oggetto:jukebox-avanti', () => {
    g.suoni.leva();
    if (melodia || !dati.brani.length) return;
    indice = (indice + 1) % dati.brani.length;
    carica();
    if (suona) audio.play().catch(() => {});
    tv.ridisegna(statoTv());
  });

  // modalità 2008: dentro la stanza sì, fuori no; la data è quella di oggi, nel 2008
  const oggi = new Date();
  document.getElementById('data2008').textContent = `${String(oggi.getDate()).padStart(2, '0')}/${String(oggi.getMonth() + 1).padStart(2, '0')}/2008`;
  let dentro = false, ultimoAgg = 0;
  m.ogniFrame((dt, t) => {
    const p = g.giocatore().pos;
    const qui = p.x > X0 - 0.5 && p.x < X1 + 0.5 && p.z > Z0 - 0.5 && p.z < Z1 + 0.5 && p.y > -1 && p.y < 6;
    if (qui !== dentro) {
      dentro = qui;
      g.modo2008(qui);
      if (!qui && suona) { suona = false; if (audio) audio.pause(); g.musica.melodia(false); }
    }
    if (suona && t - ultimoAgg > 0.5) { ultimoAgg = t; tv.ridisegna(statoTv()); }
  });

  // la porta con la scaletta porta all'ultima stanza
  for (const x of [902.5, 905.5]) nicchia(m, [x, 0, Z0, 0]);
  nicchia(m, [X0, 0, 8.9, Math.PI / 2]);
  collega(g, 'oakvx-contatti', [X0, 0, 8.9, Math.PI / 2], [945, 0, 0, 0]);
  g.arredi.porta(X0 + 0.06, 0, 8.9, Math.PI / 2, null);
  g.puntoControllo('oakvx', CX, 0, 1.5, Math.PI);
  return {
    debug: {
      varchi: [{ id: 'oakvx-contatti', da: 'oakvx', a: 'contatti', lato: [X0, 0, 8.9, Math.PI / 2] }],
      porta: [X0, 8.9],
      stato: () => ({
        modo2008: g.modo2008Valore() > 0.99 ? 1 : g.modo2008Valore() < 0.01 ? 0 : g.modo2008Valore(),
        caricata, mensola: caricata ? dati.mensola.length : 0, lingue: dati.lingue.length, melodia, suona,
      }),
    },
  };
}
