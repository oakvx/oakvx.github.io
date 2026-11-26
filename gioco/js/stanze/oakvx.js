// La stanza di oakvx (Fuori orario): la sua camera, una mansarda di notte. Tetto di vetro a
// falde con la pioggia che scorre, travi scure, due faretti caldi. In fondo il letto con la
// coperta verde dentro una libreria piena, una TV a tubo catodico che fa da jukebox. Pareti blu
// a piccoli motivi, moquette a onde arancio e ocra, termosifone, boccione, finestrella ad arco,
// una porta con la scaletta. Entrando l'immagine diventa una foto di una fotocamera del 2008.
// Musica, poster, oggetti e note arrivano da dati/stanza-oakvx.json (vedi oakvx/LEGGIMI.md).
import * as THREE from 'three';
import { canvasTex } from '../engine/materiali.js';
import { normalizza } from '../logica/stanzaOakvx.js';

const X0 = 900, X1 = 908, Z0 = 0, Z1 = 12, PARETE = 2.2, COLMO = 4.6, CX = 904;

export function costruisci(m, g) {
  const T = () => g.T().stanze.oakvx;
  const carta = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#4c5f7d'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(232, 214, 160, 0.55)'; ctx.lineWidth = 3;
    for (const [x, y, a] of [[40, 50, 0.5], [170, 30, -0.4], [110, 140, 1.2], [210, 190, 0.2], [30, 210, -1]]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.moveTo(0, -12); ctx.lineTo(0, 12); ctx.stroke();
      ctx.restore();
    }
  });
  carta.repeat.set(1, 1);
  const moquette = canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#a5481e'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d99a2b';
    for (let y = 0; y < h; y += 128) for (let x = 0; x < w; x += 128) {
      ctx.beginPath();
      ctx.ellipse(x + 64, y + 64, 54, 34, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#5a2410'; ctx.lineWidth = 3;
    for (let y = 0; y < h; y += 128) for (let x = 0; x < w; x += 128) {
      ctx.beginPath(); ctx.moveTo(x + 52, y + 64); ctx.lineTo(x + 76, y + 64); ctx.moveTo(x + 64, y + 52); ctx.lineTo(x + 64, y + 76); ctx.stroke();
    }
  });
  const legno = new THREE.MeshLambertMaterial({ color: 0x3b2618 });
  const muro = new THREE.MeshLambertMaterial({ map: carta });
  carta.repeat.set(4, 1.1);
  m.stanza({
    nome: 'oakvx', x0: X0, x1: X1, z0: Z0, z1: Z1, h: PARETE, soffitto: false, ala: 'oakvx', passi: 'moquette',
    materiali: { muro, pavimento: new THREE.MeshLambertMaterial({ map: moquette }), battiscopa: legno, cornice: legno },
    luciPunto: false,
    atmosfera: { nebbia: 0x0b1424, vicino: 6, lontano: 34, cielo: 0x6c7fa0, terra: 0x2a1a12, intensita: 1.1 },
    suono: { ronzio: 0.05, pioggia: 1 },
  });
  moquette.repeat.set(2, 3);

  // timpani (triangoli sopra le pareti corte) e tetto di vetro a falde
  const timpano = new THREE.Shape([new THREE.Vector2(X0 - CX, 0), new THREE.Vector2(X1 - CX, 0), new THREE.Vector2(0, COLMO - PARETE)]);
  for (const z of [Z0 - 0.15, Z1 + 0.15]) {
    const t = new THREE.Mesh(new THREE.ExtrudeGeometry(timpano, { depth: 0.3, bevelEnabled: false }), muro);
    t.position.set(CX, PARETE, z - 0.15);
    m.scene.add(t);
  }
  const pioggia = canvasTex(256, 512, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(40, 60, 90, 0.35)'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w, y = Math.random() * h, l = 4 + Math.random() * 18;
      ctx.strokeStyle = `rgba(190, 210, 240, ${0.06 + Math.random() * 0.16})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.random() * 2 - 1, y + l); ctx.stroke();
      ctx.fillStyle = 'rgba(210, 225, 250, 0.22)'; ctx.fillRect(x - 0.5, y + l, 1.5, 1.5);
    }
  });
  pioggia.repeat.set(10, 6);
  const vetro = new THREE.MeshLambertMaterial({ map: pioggia, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide, emissive: 0x060c18 });
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
  const colmo = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, Z1 - Z0 + 0.3), legno);
  colmo.position.set(CX, COLMO - 0.1, (Z0 + Z1) / 2);
  m.scene.add(colmo);
  m.ogniFrame((dt) => { pioggia.offset.y += dt * 0.35; });

  // due faretti appesi al colmo
  for (const z of [4.5, 7.5]) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.22, 10), new THREE.MeshLambertMaterial({ color: 0x23272a }));
    f.position.set(CX + (z < 6 ? -0.9 : 0.9), COLMO - 0.75, z);
    f.rotation.z = z < 6 ? -0.5 : 0.5;
    m.scene.add(f);
    const lampadina = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe3a8 }));
    lampadina.position.copy(f.position).add(new THREE.Vector3(z < 6 ? 0.05 : -0.05, -0.12, 0));
    m.scene.add(lampadina);
    m.luce(f.position.x, f.position.y - 0.3, z, 3.2, 9, 0xffd7a0);
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
  for (const xs of [[CX - 2.55, CX - 1.2], [CX + 1.2, CX + 2.55]]) {
    for (const y of [0.45, 1.05, 1.65]) {
      m.box(xs[0], y, Z1 - 0.47, xs[1], y + 0.03, Z1 - 0.44, new THREE.MeshLambertMaterial({ color: 0x5a3b26 }), { solido: false });
      scaffali.push([(xs[0] + xs[1]) / 2, y + 0.03, Z1 - 0.62]);
    }
  }
  // libri colorati sugli scaffali alti
  const colori = [0x8a3b2f, 0x2f5a8a, 0xc9a43b, 0x3b7a4f, 0x6b3b8a, 0xd8d2c0];
  for (let i = 0; i < 14; i++) {
    const x = CX - 1.1 + i * 0.16;
    m.box(x, 1.73, Z1 - 0.62, x + 0.12, 1.73 + 0.26 + (i % 3) * 0.04, Z1 - 0.47, new THREE.MeshLambertMaterial({ color: colori[i % colori.length] }), { solido: false });
  }

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
  m.box(X0 + 0.02, 0, 8.3, X0 + 0.08, 2.05, 9.5, new THREE.MeshLambertMaterial({ color: 0x2a3340 }));
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
  m.zona('verso-contatti', X0, -1, 8.3, X0 + 0.45, 3, 9.5, { ripeti: true });
  g.su('verso-contatti', () => g.teletrasporta(945, 0, 1.5, Math.PI));
  g.puntoControllo('oakvx', CX, 0, 1.5, Math.PI);
  return {
    debug: {
      porta: [X0, 8.9],
      stato: () => ({
        modo2008: g.modo2008Valore() > 0.99 ? 1 : g.modo2008Valore() < 0.01 ? 0 : g.modo2008Valore(),
        caricata, mensola: caricata ? dati.mensola.length : 0, lingue: dati.lingue.length, melodia, suona,
      }),
    },
  };
}
