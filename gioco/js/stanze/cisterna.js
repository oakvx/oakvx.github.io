// La cisterna infinita (Format, 2026): archi di mattoni su colonne di tufo, acqua scura che scorre
// e nessun muro. Si vede una griglia 5 × 5 di celle uguali; quando il giocatore esce dalla cella
// centrale viene riportato indietro di nascosto (con cubi e finestre) e una cella logica tiene il
// conto di dove "è" davvero. Ogni cella logica ha le sue piccole differenze (lampada accesa,
// tremolante o spenta, una crepa). L'uscita è uno squarcio di realtà a 5–7 celle dall'ingresso,
// a mezz'aria su una passerella: ci si sale con le finestre, guidati dal ronzio.
import * as THREE from 'three';
import { mergeGeometries } from '../../vendor/three/addons/utils/BufferGeometryUtils.js';
import { cartelloStanza, miiLiminale, tappa } from '../engine/liminale.js';
import { nicchia, collega } from '../engine/varchi.js';
import { canvasTex, pbrMondo } from '../engine/materiali.js';
import { creaAcqua } from '../engine/acqua.js';
import { creaOggetti } from '../engine/oggetti.js';
import { CREPA_GLSL } from '../engine/passaggi.js';
import { LATO, cellaDi, ricentra, variazioni, posizioneSquarcio } from '../logica/cisterna.js';

const OX = 300, OZ = 0;                 // origine della cella centrale (x 300..318, z 0..18)
const H = 5.6, IMPOSTA = 2.6, COL = 1.2, PASSO = 6, ACQUA = 0.4;
const RAGGIO = 2;                       // celle disegnate attorno a quella centrale
export const ENTRATA = [OX + 1, 0, OZ + 9, Math.PI / 2];   // arrivo dal middleman, cella logica (0, 0)
const SQ = { x: OX + 12, y: 3, z: OZ + 13 };                // squarcio: sul filo della passerella, si attraversa verso +z
const LAMPADA = [6, 6];                 // lampada di ogni cella (coordinate nella cella)
const COLONNE = [];
for (const a of [3, 9, 15]) for (const b of [3, 9, 15]) COLONNE.push([a, b]);
// regione della cisterna: qui dentro giocatore, cubi e finestre seguono il ricentraggio
const MEZZO = (RAGGIO + 0.5) * LATO;
const CX = OX + LATO / 2, CZ = OZ + LATO / 2;
const dentro = (p) => p.x > CX - MEZZO && p.x < CX + MEZZO && p.z > CZ - MEZZO && p.z < CZ + MEZZO && p.y > -15 && p.y < 12;

const vertG = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
// lo squarcio: bordo che sfrigola a righe spostate (niente colori da finestra); pieno quando non è attraversabile
const fragG = `
uniform float uTempo; uniform float uPieno; varying vec2 vUv;
${CREPA_GLSL}
float h1(float n){ return fract(sin(n) * 43758.5453); }
void main(){
  float riga = floor(vUv.y * 46.0);
  float salto = (h1(riga + floor(uTempo * 9.0)) - 0.5) * 0.07 * step(0.8, h1(riga * 1.7 + floor(uTempo * 5.0)));
  vec2 uv = vec2(vUv.x + salto, vUv.y);
  float d = crepa(uv);
  float bordo = 1.0 - smoothstep(0.0, 0.04, abs(d));
  float pieno = step(d, 0.0) * uPieno;
  float r = h1(floor(uv.x * 90.0) + floor(uv.y * 160.0) * 91.0 + floor(uTempo * 24.0));
  vec3 col = mix(vec3(1.0, 0.93, 0.8), vec3(1.0), r);
  float a = max(bordo * (0.7 + 0.3 * r), pieno * (0.5 + 0.5 * r));
  if (a < 0.02) discard;
  gl_FragColor = vec4(col * (1.3 + bordo), a);
}`;

export function costruisci(m, g) {
  const parametri = new URLSearchParams(location.search);
  const seme = parametri.has('seme') ? Number(parametri.get('seme')) >>> 0 : Math.floor(Math.random() * 2 ** 31);
  const sq = posizioneSquarcio(seme);
  const lc = [0, 0];

  // materiali con mappatura nel mondo: periodo che divide il lato della cella, così ogni copia è identica
  const tufo = pbrMondo(g.asset, 'tufo', { scala: 0.5, tinta: 0xbdb6a6 });
  const mattoni = pbrMondo(g.asset, 'mattoni', { scala: 0.5, tinta: 0xa39282 });
  const volta = pbrMondo(g.asset, 'mattoni', { scala: 0.5, tinta: 0x8a7c70, rimbalzo: 0.1 });
  const fondo = pbrMondo(g.asset, 'cemento', { scala: 1 / 3, tinta: 0x7b837f });
  const invisibile = new THREE.MeshBasicMaterial({ visible: false });
  // i pannelli che prendono le finestre, ingrigiti dall'umido (restano riconoscibili)
  const pannello = m.mat.pannello.clone();
  pannello.color.set(0x8c9089);

  m.stanza({
    nome: 'cisterna', x0: OX - 2, x1: OX + LATO + 2, z0: OZ - 2, z1: OZ + LATO + 2, h: H, ala: 'transito', passi: 'acqua',
    pareti: { n: false, s: false, e: false, w: false }, pavimento: false, soffitto: false, luciPunto: false,
    acqua: { livello: ACQUA, corrente: [0.12, 0.05] },
    atmosfera: { nebbia: 0x0b1215, vicino: 3, lontano: 30, cielo: 0x6a8894, terra: 0x0a0e10, intensita: 0.95 },
    suono: { ronzio: 0, acqua: 0.6, gocce: 1 },
    // niente faro d'ombra: illuminerebbe solo la cella in cui si è, e il trucco si vedrebbe
    ombra: { pos: [CX, H - 0.2, CZ], bersaglio: [CX, 0, CZ], intensita: 0 },
  });
  // fondo e volta per tutta la griglia
  m.box(CX - MEZZO, -0.3, CZ - MEZZO, CX + MEZZO, 0, CZ + MEZZO, fondo);
  m.box(CX - MEZZO, H, CZ - MEZZO, CX + MEZZO, H + 0.3, CZ + MEZZO, volta, { solido: false });
  const acqua = creaAcqua(m, CX - MEZZO, CZ - MEZZO, CX + MEZZO, CZ + MEZZO, ACQUA, { flusso: [0.12, 0.05], colore: 0x0c2126, riflesso: 0x3d5c63, opacita: 0.84 });

  // ------------------------------------------------ la cella: colonne, archi, pannelli (geometrie unite)
  const pezzo = (geo, x, y, z, ry = 0) => {
    const q = geo.index ? geo.toNonIndexed() : geo.clone();
    if (ry) q.rotateY(ry);
    q.translate(x, y, z);
    return q;
  };
  const r = (PASSO - COL) / 2;
  const forma = new THREE.Shape();
  forma.moveTo(-PASSO / 2, 0);
  forma.lineTo(-PASSO / 2, H - IMPOSTA);
  forma.lineTo(PASSO / 2, H - IMPOSTA);
  forma.lineTo(PASSO / 2, 0);
  forma.lineTo(r, 0);
  forma.absarc(0, 0, r, 0, Math.PI, false);
  forma.lineTo(-PASSO / 2, 0);
  const geoArco = new THREE.ExtrudeGeometry(forma, { depth: COL, bevelEnabled: false, curveSegments: 24 });
  geoArco.translate(0, 0, -COL / 2);
  const fusto = new THREE.BoxGeometry(COL, IMPOSTA, COL);
  const base = new THREE.BoxGeometry(COL + 0.24, 0.35, COL + 0.24);
  const capitello = new THREE.BoxGeometry(COL + 0.2, 0.18, COL + 0.2);
  const lastra = new THREE.PlaneGeometry(COL - 0.14, IMPOSTA - 0.75);
  const cavo = new THREE.BoxGeometry(0.02, 0.5, 0.02);
  const pezziCol = [], pezziArchi = [], pezziPan = [];
  for (const [lx, lz] of COLONNE) {
    const x = OX + lx, z = OZ + lz;
    pezziCol.push(pezzo(fusto, x, IMPOSTA / 2, z), pezzo(base, x, 0.175, z), pezzo(capitello, x, IMPOSTA - 0.09, z));
    pezziArchi.push(pezzo(geoArco, x + PASSO / 2, IMPOSTA, z), pezzo(geoArco, x, IMPOSTA, z + PASSO / 2, Math.PI / 2));
    const yl = 0.4 + (IMPOSTA - 0.75) / 2, o = COL / 2 + 0.006;
    pezziPan.push(pezzo(lastra, x, yl, z + o), pezzo(lastra, x, yl, z - o, Math.PI), pezzo(lastra, x + o, yl, z, Math.PI / 2), pezzo(lastra, x - o, yl, z, -Math.PI / 2));
  }
  pezziCol.push(pezzo(cavo, OX + LAMPADA[0], H - 0.28, OZ + LAMPADA[1]));
  const cella = new THREE.Group();
  for (const [pezzi, mat] of [[pezziCol, tufo], [pezziArchi, mattoni], [pezziPan, pannello]]) {
    const mesh = new THREE.Mesh(mergeGeometries(pezzi), mat);
    mesh.castShadow = mesh.receiveShadow = true;
    cella.add(mesh);
  }
  // il cartello "stanza N di 2.500", appeso sotto un arco (fronte e retro); N cambia con la cella
  const figli = new Set(m.scene.children);
  const cartello = cartelloStanza(m, g, OX + 6, 3.7, OZ + 3 + 0.02, 0, 2113);
  for (const o of [...m.scene.children]) if (!figli.has(o)) {
    cella.attach(o);
    const retro = o.clone();
    retro.rotation.y = Math.PI;
    retro.position.z = OZ + 3 - 0.02;
    cella.add(retro);
  }
  // copie: la centrale più 24 attorno; lampada e crepa sono di ogni copia
  const matLampada = {
    accesa: new THREE.MeshBasicMaterial({ color: 0xdff1f4 }),
    tremola: new THREE.MeshBasicMaterial({ color: 0xdff1f4 }),
    spenta: new THREE.MeshStandardMaterial({ color: 0x2a2f31, roughness: 0.8 }),
  };
  const geoLampada = new THREE.BoxGeometry(0.9, 0.06, 0.22);
  const texCrepa = canvasTex(128, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(24, 18, 12, 0.9)';
    ctx.lineCap = 'round';
    const ramo = (x, y, lw, n) => {
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < n; k++) { x += (Math.random() - 0.5) * 24; y += 10 + Math.random() * 14; ctx.lineTo(x, y); if (n > 6 && Math.random() < 0.18) { ctx.stroke(); ramo(x, y, lw * 0.5, 4); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x, y); } }
      ctx.stroke();
    };
    ramo(w * 0.5, 0, 3, 18);
  });
  const matCrepa = new THREE.MeshBasicMaterial({ map: texCrepa, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const geoCrepa = new THREE.PlaneGeometry(0.9, 1.8);
  m.scene.add(cella);
  // prima tutte le copie dalla cella nuda, poi lampada e crepa a ciascuna
  const gruppi = [];
  for (let i = -RAGGIO; i <= RAGGIO; i++) for (let j = -RAGGIO; j <= RAGGIO; j++) {
    const gr = i === 0 && j === 0 ? cella : cella.clone();
    gr.position.set(i * LATO, 0, j * LATO);
    if (gr !== cella) m.scene.add(gr);
    gruppi.push([i, j, gr]);
  }
  const copie = [];
  for (const [i, j, gr] of gruppi) {
    const lampada = new THREE.Mesh(geoLampada, matLampada.accesa);
    lampada.position.set(OX + LAMPADA[0], H - 0.55, OZ + LAMPADA[1]);
    gr.add(lampada);
    const crepa = new THREE.Mesh(geoCrepa, matCrepa);
    crepa.position.set(OX + 9 + COL / 2 + 0.012, 1.25, OZ + 9);
    crepa.rotation.y = Math.PI / 2;
    gr.add(crepa);
    copie.push({ i, j, lampada, crepa, v: null });
  }
  // luci vere solo nelle 3 × 3 celle vicine (il resto lo fa la nebbia)
  const luci = copie.filter((c) => Math.abs(c.i) <= 1 && Math.abs(c.j) <= 1)
    .map((c) => ({ c, def: m.luce(OX + LAMPADA[0] + c.i * LATO, H - 0.7, OZ + LAMPADA[1] + c.j * LATO, 0, 13, 0x9ec2cf) }));

  // colonne vere della cella centrale: ingombro invisibile con quattro facce che prendono le finestre
  COLONNE.forEach(([lx, lz], k) => {
    const x = OX + lx, z = OZ + lz, h = COL / 2, id = 'cis-c' + k;
    const s = m.box(x - h, 0, z - h, x + h, IMPOSTA, z + h, invisibile, { pannello: id });
    s.mesh.castShadow = s.mesh.receiveShadow = false;
    const f = (suf, asse, normale, piano, a, b) => ({ id: id + suf, asse, normale, faccia: piano, a, b, y0: 0.05, y1: IMPOSTA, proibito: false });
    m.pannelli.set(id, {
      id,
      facce: [
        f('-n', 'x', new THREE.Vector3(0, 0, -1), z - h, x - h, x + h),
        f('-s', 'x', new THREE.Vector3(0, 0, 1), z + h, x - h, x + h),
        f('-w', 'z', new THREE.Vector3(-1, 0, 0), x - h, z - h, z + h),
        f('-e', 'z', new THREE.Vector3(1, 0, 0), x + h, z - h, z + h),
      ],
    });
  });

  // ------------------------------------------------ strutture che esistono in una sola cella logica
  const oggetti = creaOggetti(m, g);
  function struttura(cellaLogica, fn) {
    const gruppo = new THREE.Group();
    m.scene.add(gruppo);
    const prima = new Set(m.scene.children), s0 = m.solidi.length;
    const extra = fn(gruppo) || {};
    for (const o of [...m.scene.children]) if (!prima.has(o) && o !== gruppo) gruppo.attach(o);
    return { cella: cellaLogica, gruppo, solidi: m.solidi.slice(s0), attivo: false, ...extra };
  }
  // l'ingresso: un muro solo, con la porta da cui si arriva e la tappa del percorso
  let idTappa = null;
  const ingresso = struttura([0, 0], (gr) => {
    const [x, , z] = ENTRATA;
    m.box(x - 0.4, 0, z - 4, x, H, z - 0.65, mattoni);
    m.box(x - 0.4, 0, z + 0.65, x, H, z + 4, mattoni);
    m.box(x - 0.4, 2.3, z - 0.65, x, H, z + 0.65, mattoni);
    nicchia(m, ENTRATA);
    g.arredi.porta(x + 0.06, 0, z, Math.PI / 2, null);
    idTappa = tappa(m, g, 'format', x, 0, z + 2.6, Math.PI / 2);
    oggetti.metti('industrial_pipe_lamp', x + 0.15, 2.55, z, Math.PI / 2, { solido: false }).then((o) => o && gr.add(o));
  });
  // lo squarcio: pilastro con il pannello alto, passerella, crepa che sfrigola
  const matSquarcio = new THREE.ShaderMaterial({
    uniforms: { uTempo: { value: 0 }, uPieno: { value: 1 } },
    vertexShader: vertG, fragmentShader: fragG,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
  const squarcio = struttura(sq, (gr) => {
    m.box(SQ.x - 0.7, 0, OZ + 9.75, SQ.x + 0.7, SQ.y, OZ + 10.4, tufo);
    m.box(SQ.x - 0.7, SQ.y, OZ + 9.75, SQ.x + 0.7, H, OZ + 10.4, pannello, { pannello: 'cis-alto' });
    m.pannelli.set('cis-alto', { id: 'cis-alto', asse: 'x', normale: new THREE.Vector3(0, 0, 1), faccia: OZ + 10.4, a: SQ.x - 0.7, b: SQ.x + 0.7, y0: SQ.y, y1: H, proibito: false, bloccato: true });
    m.box(SQ.x - 0.6, SQ.y - 0.2, OZ + 10.4, SQ.x + 0.6, SQ.y, OZ + 14.6, m.mat.metallo);
    m.box(SQ.x - 0.4, 0, OZ + 14.0, SQ.x + 0.4, SQ.y - 0.2, OZ + 14.6, tufo);
    const crepa = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.3), matSquarcio);
    crepa.position.set(SQ.x, SQ.y + 1.15, SQ.z - 0.012);
    crepa.renderOrder = 3;
    gr.add(crepa);
    oggetti.metti('modular_industrial_pipes_01', SQ.x, 0, OZ + 12.2, Math.PI / 2, { altezza: 2.7, solido: false }).then((o) => o && gr.add(o));
    return { luce: m.luce(SQ.x, SQ.y + 1.6, SQ.z - 0.8, 0, 8, 0xfff0d8), intensita: 3 };
  });
  collega(g, 'cisterna-galleria', [SQ.x, SQ.y, SQ.z, Math.PI], [162.5, 0, 0, 0], { formaA: 'crepa' });

  // il Mii aspetta nella cella accanto allo squarcio, verso l'ingresso
  const cellaMii = Math.abs(sq[0]) >= Math.abs(sq[1]) ? [sq[0] - Math.sign(sq[0]), sq[1]] : [sq[0], sq[1] - Math.sign(sq[1])];
  const mii = miiLiminale(m, g, 'cisterna', OX + 6, 0, OZ + 12, Math.PI, [1, 0]);
  // un cubo vicino all'ingresso
  g.cubo(OX + 2.2, 0.6, OZ + 11.5);

  // ------------------------------------------------ cella logica: variazioni, strutture, passaggi
  const numero = () => 1 + ((((2113 + lc[0] * 37 + lc[1] * 101) % 2499) + 2499) % 2499);
  function posiziona(s) {
    const di = s.cella[0] - lc[0], dj = s.cella[1] - lc[1];
    s.attivo = di === 0 && dj === 0;
    s.gruppo.visible = Math.max(Math.abs(di), Math.abs(dj)) <= RAGGIO;
    s.gruppo.position.set(di * LATO, 0, dj * LATO);
    for (const so of s.solidi) so.attivo = s.attivo;
    if (s.luce) {
      s.luce.position.set(SQ.x + di * LATO, SQ.y + 1.6, SQ.z - 0.8 + dj * LATO);
      s.luce.intensity = s.gruppo.visible ? s.intensita : 0;
    }
  }
  function aggiorna() {
    for (const c of copie) {
      c.v = variazioni(lc[0] + c.i, lc[1] + c.j, seme);
      c.lampada.material = matLampada[c.v.lampada];
      c.crepa.visible = c.v.crepa;
    }
    posiziona(ingresso);
    posiziona(squarcio);
    matSquarcio.uniforms.uPieno.value = squarcio.attivo ? 0 : 1;
    m.pannelli.get('cis-alto').bloccato = !squarcio.attivo;
    g.passaggi.attiva('middleman-cisterna', ingresso.attivo);
    g.passaggi.attiva('cisterna-galleria', squarcio.attivo);
    mii.sposta(OX + 6 + (cellaMii[0] - lc[0]) * LATO, OZ + 12 + (cellaMii[1] - lc[1]) * LATO);
    cartello.numero = numero();
    cartello.ridisegna();
    acqua.material.uniforms.uScarto.value.set(lc[0] * LATO, lc[1] * LATO);
  }
  const vaiCella = (cx, cz) => { lc[0] = cx; lc[1] = cz; aggiorna(); };
  aggiorna();

  // aiuti: indizio (il ronzio) e soluzione (una scia di luce sull'acqua verso lo squarcio)
  const aiuti = g.aiuti('cisterna');
  let vicinanza = Infinity, scia = false;
  // chi rientra dal middleman ricomincia dall'ingresso (dalla galleria si torna invece allo squarcio)
  g.su('stanza:middleman', () => { if (lc[0] || lc[1]) { vaiCella(0, 0); vicinanza = Infinity; } });
  g.su('aiuto:soluzione:cisterna', () => { scia = true; });
  g.su('stanza:galleria', () => { if (squarcio.attivo) aiuti.risolto(); });
  const matScia = new THREE.MeshBasicMaterial({ color: 0xffe9c4, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const puntini = Array.from({ length: 14 }, () => {
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.11, 12), matScia);
    p.rotation.x = -Math.PI / 2;
    p.visible = false;
    m.scene.add(p);
    return p;
  });

  const tremolio = (t) => (Math.sin(t * 23) * Math.sin(t * 7.3) > 0.25 ? 0.12 : 1) * (0.85 + 0.15 * Math.sin(t * 61));
  let prossimoSuono = 0, eraQui = false;
  m.ogniFrame((dt, t) => {
    const p = g.giocatore().pos;
    const qui = dentro(p);
    if (qui) {
      // ricentraggio: fuori dalla cella centrale si torna indietro di nascosto, di celle intere
      const [cx, cz] = cellaDi(p.x, p.z, [OX, OZ]);
      if (cx || cz) {
        const [dx, dz] = ricentra(p.x, p.z, [OX, OZ]);
        g.trasla(dx, dz, dentro);
        lc[0] += cx;
        lc[1] += cz;
        aggiorna();
      }
      const dist = Math.max(Math.abs(sq[0] - lc[0]), Math.abs(sq[1] - lc[1]));
      if (dist < vicinanza) { vicinanza = dist; aiuti.progresso(); }
    }
    // lampade che tremano
    const k = tremolio(t);
    matLampada.tremola.color.setRGB(0.87 * k, 0.94 * k, 0.96 * k);
    for (const { c, def } of luci) def.intensity = c.v.lampada === 'accesa' ? 2.4 : c.v.lampada === 'tremola' ? 2.4 * k : 0;
    matSquarcio.uniforms.uTempo.value = t;
    // ronzio dello squarcio, più forte e più chiaro avvicinandosi
    const sx = SQ.x + (sq[0] - lc[0]) * LATO, sz = SQ.z + (sq[1] - lc[1]) * LATO;
    const d = Math.hypot(sx - p.x, sz - p.z);
    if (t > prossimoSuono || qui !== eraQui) {
      prossimoSuono = t + 0.2;
      eraQui = qui;
      if (qui) g.suoni.squarcio(Math.max(0.08, 1 - d / (8 * LATO)), Math.max(0, 1 - d / 40));
      else g.suoni.squarcio(0, 0);
    }
    // la scia di luce
    const mostra = scia && qui && d > 2;
    const ux = (sx - p.x) / (d || 1), uz = (sz - p.z) / (d || 1);
    puntini.forEach((pt, i) => {
      const s = 1.5 + i * 1.2;
      pt.visible = mostra && s < d;
      if (!pt.visible) return;
      pt.position.set(p.x + ux * s, ACQUA + 0.015, p.z + uz * s);
      pt.scale.setScalar(0.7 + 0.5 * Math.max(0, Math.sin(t * 3 - i * 0.6)));
    });
  });

  g.puntoControllo('cisterna', OX + 2.2, 0, OZ + 6, -Math.PI / 2);
  return {
    debug: {
      mii: mii.posto,
      tappa: idTappa,
      varchi: [{ id: 'cisterna-galleria', da: 'cisterna', a: 'galleria', lato: [SQ.x, SQ.y, SQ.z, Math.PI] }],
      // per i test delle porte: lo squarcio si attraversa solo nella sua cella
      preparaVarco: () => vaiCella(sq[0], sq[1]),
      vaiCella,
      stato: () => ({ cella: [...lc], squarcio: [...sq], attivo: squarcio.attivo, seme, modelli: oggetti.quanti() }),
      // davanti allo squarcio, già sulla passerella
      risolvi: () => {
        vaiCella(sq[0], sq[1]);
        const gp = g.giocatore();
        gp.pos.set(SQ.x, SQ.y + 0.9, SQ.z - 1.6);
        gp.vel.set(0, 0, 0);
        gp.zPrima = [null, null];
        if (gp.zPass) gp.zPass.clear();
      },
    },
  };
}
