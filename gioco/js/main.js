// La stanza (beta): prima stanza 3D del portfolio di Gabriele Lucia.
// Regola che inganna: il corridoio elastico. La porta in fondo arretra mentre
// avanzi (sembra a pochi passi, ne servono una cinquantina), mentre il ritorno
// verso la stanza viene accorciato in silenzio sfruttando la geometria periodica.
import * as THREE from 'three';

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------- costanti
const H = 3.2;              // altezza stanza
const ROOM = 4;             // mezza larghezza stanza (8 x 8 m)
const CW = 1;               // mezza larghezza corridoio (2 m)
const CH = 2.6;             // altezza corridoio = altezza della porta d'ingresso
const CLEN = 48;            // lunghezza geometrica del corridoio
const PERIOD = 4;           // periodo di luci, targhette, piastrelle
const EYE = 1.6;
const RADIUS = 0.28;
const SPEED = 2.2;
const DOOR_START = 5.5;     // distanza iniziale della porta dall'imbocco
const RECEDE = 0.88;        // quanto arretra la porta per ogni metro che avanzi
const END_GAP = 1.0;
const SPAWN = new THREE.Vector3(0, EYE, 2.6);
const FOG = 0xe9eef1;

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touchOnly = matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches;

// ---------------------------------------------------------------- testi
let dati = null;
let T = null;
let lingua = 'it';

function linguaIniziale() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'it' || q === 'en') return q;
  const salvata = localStorage.getItem('gioco-lingua');
  if (salvata === 'it' || salvata === 'en') return salvata;
  return document.referrer.includes('/en/') ? 'en' : 'it';
}

function applicaLingua(l) {
  lingua = l;
  T = dati[l];
  document.documentElement.lang = l;
  document.title = T.titolo;
  document.querySelectorAll('[data-t]').forEach((el) => {
    const v = T[el.dataset.t];
    if (typeof v === 'string') el.textContent = v;
  });
  document.querySelectorAll('#classica, #leggere, [data-classica]').forEach((a) => { a.href = T.classicaUrl; });
  const btn = $('lingua');
  btn.textContent = l === 'it' ? 'EN' : 'IT';
  btn.setAttribute('aria-label', l === 'it' ? 'Switch to English' : 'Passa all\'italiano');
  aggiornaAudioLabel();
  aggiornaAvviso();
  if (texturePronte) { disegnaTarga(); disegnaScatola(); disegnaTarghetta(); }
}

function aggiornaAvviso() {
  const box = $('avviso');
  let msg = '';
  if (erroreWebgl) msg = T.erroreWebgl;
  else if (touchOnly) msg = T.avvisoTouch;
  else if (reduceMotion) msg = T.avvisoMotion;
  box.textContent = msg;
  box.hidden = !msg;
}

// ---------------------------------------------------------------- audio
let audioCtx = null;
let audioGain = null;
let audioAttivo = localStorage.getItem('gioco-audio') !== 'off';

function avviaAudio() {
  if (audioCtx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  audioCtx = new AC();
  audioGain = audioCtx.createGain();
  audioGain.gain.value = audioAttivo ? 1 : 0;
  audioGain.connect(audioCtx.destination);
  // ronzio dei neon: fondamentale a 50 Hz, armoniche filtrate, battimento lento
  const filtro = audioCtx.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = 420;
  filtro.connect(audioGain);
  const voci = [[50, 'sine', 0.035], [100, 'sawtooth', 0.006], [100.4, 'sawtooth', 0.006], [150, 'triangle', 0.004]];
  for (const [f, tipo, g] of voci) {
    const o = audioCtx.createOscillator();
    o.type = tipo;
    o.frequency.value = f;
    const gg = audioCtx.createGain();
    gg.gain.value = g;
    o.connect(gg).connect(filtro);
    o.start();
  }
  // un pad lontanissimo, sognante
  const pad = audioCtx.createGain();
  pad.gain.value = 0.012;
  pad.connect(audioGain);
  for (const f of [220, 277.18, 329.63]) {
    const o = audioCtx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.05 + Math.random() * 0.05;
    const lg = audioCtx.createGain();
    lg.gain.value = 1.5;
    lfo.connect(lg).connect(o.detune);
    o.connect(pad);
    o.start();
    lfo.start();
  }
}

function aggiornaAudioLabel() {
  const b = $('audio');
  b.textContent = audioAttivo ? T.audioOn : T.audioOff;
  b.setAttribute('aria-pressed', String(audioAttivo));
}

$('audio').addEventListener('click', () => {
  audioAttivo = !audioAttivo;
  localStorage.setItem('gioco-audio', audioAttivo ? 'on' : 'off');
  if (audioGain) audioGain.gain.setTargetAtTime(audioAttivo ? 1 : 0, audioCtx.currentTime, 0.1);
  aggiornaAudioLabel();
});

$('lingua').addEventListener('click', () => {
  const nuova = lingua === 'it' ? 'en' : 'it';
  localStorage.setItem('gioco-lingua', nuova);
  const url = new URL(location.href);
  url.searchParams.set('lang', nuova);
  history.replaceState(null, '', url);
  applicaLingua(nuova);
});

// ---------------------------------------------------------------- renderer
const canvas = $('scena');
let renderer;
let erroreWebgl = false;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
} catch (e) {
  erroreWebgl = true;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(FOG);
scene.fog = new THREE.Fog(FOG, 1.5, 19);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, 60);
camera.rotation.order = 'YXZ';
camera.position.copy(SPAWN);

// ---------------------------------------------------------------- texture
let texturePronte = false;
const maxAniso = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = maxAniso;
  return t;
}

function rumore(ctx, w, h, quanti, alpha) {
  for (let i = 0; i < quanti; i++) {
    const v = 150 + Math.random() * 80;
    ctx.fillStyle = `rgba(${v},${v + 4},${v + 8},${alpha})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
}

const texPavimento = canvasTex(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#e3e8eb';
  ctx.fillRect(0, 0, w, h);
  rumore(ctx, w, h, 900, 0.18);
  ctx.fillStyle = '#c9d1d6';
  ctx.fillRect(0, 0, w, 3);
  ctx.fillRect(0, 0, 3, h);
});

const texMuro = canvasTex(256, 512, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#f2f5f6');
  g.addColorStop(1, '#e8edef');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  rumore(ctx, w, h, 500, 0.08);
  ctx.fillStyle = '#d8dfe3';
  ctx.fillRect(0, 0, 2, h);
  ctx.fillStyle = '#d4dbdf';
  ctx.fillRect(0, h - 26, w, 26);
  ctx.fillStyle = '#c3cbd0';
  ctx.fillRect(0, h - 27, w, 2);
});

const texSoffitto = canvasTex(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#eef2f3';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(160,172,178,0.35)';
  for (let i = 0; i < 260; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  ctx.fillStyle = '#cfd6da';
  ctx.fillRect(0, 0, w, 4);
  ctx.fillRect(0, 0, 4, h);
});

function ripeti(base, rx, ry) {
  const t = base.clone();
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return t;
}

// texture con testo, ridisegnate al cambio lingua
const cTarga = document.createElement('canvas');
cTarga.width = 512; cTarga.height = 256;
const texTarga = new THREE.CanvasTexture(cTarga);
texTarga.colorSpace = THREE.SRGBColorSpace;

function disegnaTarga() {
  const ctx = cTarga.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 512, 256);
  g.addColorStop(0, '#dfe5e8');
  g.addColorStop(0.5, '#f4f7f8');
  g.addColorStop(1, '#d5dce0');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#a9b4ba';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 492, 236);
  ctx.fillStyle = '#1d252b';
  ctx.font = '750 50px Archivo, sans-serif';
  ctx.fillText(T.nome.toUpperCase(), 36, 104);
  ctx.fillStyle = '#4b5860';
  ctx.font = '400 26px Archivo, sans-serif';
  ctx.fillText(T.ruolo, 38, 150);
  ctx.font = '500 20px Archivo, sans-serif';
  ctx.fillStyle = '#7a868d';
  ctx.fillText(lingua === 'it' ? 'STANZA 01 · BETA' : 'ROOM 01 · BETA', 38, 210);
  texTarga.needsUpdate = true;
}

const cScatola = document.createElement('canvas');
cScatola.width = 256; cScatola.height = 256;
const texScatola = new THREE.CanvasTexture(cScatola);
texScatola.colorSpace = THREE.SRGBColorSpace;

function disegnaScatola() {
  const ctx = cScatola.getContext('2d');
  ctx.fillStyle = '#f3f5f6';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = 'rgba(205, 212, 216, 0.9)';
  ctx.fillRect(112, 0, 32, 256);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(40, 150, 176, 70);
  ctx.strokeStyle = '#9aa6ad';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 150, 176, 70);
  ctx.fillStyle = '#1d252b';
  ctx.font = '700 22px Archivo, sans-serif';
  ctx.fillText(lingua === 'it' ? 'pezzo di Gabri' : 'a piece of Gabri', 52, 180);
  ctx.fillStyle = '#56636c';
  ctx.font = '400 18px Archivo, sans-serif';
  ctx.fillText(lingua === 'it' ? 'in arrivo' : 'coming soon', 52, 206);
  texScatola.needsUpdate = true;
}

const cTarghetta = document.createElement('canvas');
cTarghetta.width = 128; cTarghetta.height = 64;
const texTarghetta = new THREE.CanvasTexture(cTarghetta);
texTarghetta.colorSpace = THREE.SRGBColorSpace;

function disegnaTarghetta() {
  const ctx = cTarghetta.getContext('2d');
  ctx.fillStyle = '#dfe5e8';
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = '#2b353b';
  ctx.font = '700 30px Archivo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(T.oggetti.corridoio.targhetta, 64, 43);
  texTarghetta.needsUpdate = true;
}

// schermo del monitor: un lyric video in miniatura, come in Brat Animator
const cSchermo = document.createElement('canvas');
cSchermo.width = 512; cSchermo.height = 320;
const texSchermo = new THREE.CanvasTexture(cSchermo);
texSchermo.colorSpace = THREE.SRGBColorSpace;
let ultimoSchermo = -1;

function disegnaSchermo(t) {
  const passo = Math.floor(t * 12);
  if (passo === ultimoSchermo) return;
  ultimoSchermo = passo;
  const ctx = cSchermo.getContext('2d');
  const parole = T.schermo;
  const ciclo = 5.2;
  const tc = t % ciclo;
  ctx.fillStyle = '#0f1417';
  ctx.fillRect(0, 0, 512, 320);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  parole.forEach((p, i) => {
    const t0 = 0.4 + i * 0.9;
    if (tc < t0) return;
    const k = Math.min(1, (tc - t0) / 0.35);
    const y = 70 + i * 50 + (1 - k) * 12;
    ctx.globalAlpha = k * (tc > ciclo - 0.6 ? (ciclo - tc) / 0.6 : 1);
    ctx.fillStyle = '#e9f0f2';
    ctx.font = `700 ${40 + (1 - k) * 8}px Archivo, sans-serif`;
    ctx.fillText(p, 256, y);
  });
  ctx.globalAlpha = 1;
  // timeline
  ctx.fillStyle = '#26323a';
  ctx.fillRect(24, 286, 464, 6);
  ctx.fillStyle = '#7fb3c4';
  ctx.fillRect(24, 286, 464 * (tc / ciclo), 6);
  ctx.fillStyle = '#4c6470';
  parole.forEach((_, i) => ctx.fillRect(24 + 464 * ((0.4 + i * 0.9) / ciclo) - 1, 280, 2, 18));
  texSchermo.needsUpdate = true;
}

// ---------------------------------------------------------------- materiali
const matPav = (w, d) => new THREE.MeshLambertMaterial({ map: ripeti(texPavimento, w, d) });
const matSoff = (w, d) => new THREE.MeshLambertMaterial({ map: ripeti(texSoffitto, w, d) });
const matMuro = (w) => new THREE.MeshLambertMaterial({ map: ripeti(texMuro, w / 2, 1) });
const matNeon = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
const matNeonRoom = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
const matGrigio = new THREE.MeshLambertMaterial({ color: 0xd3dadd });
const matScuro = new THREE.MeshLambertMaterial({ color: 0x2a3237 });

function piano(w, h, mat, x, y, z, rx = 0, ry = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, 0, 'YXZ');
  scene.add(m);
  return m;
}

// ---------------------------------------------------------------- stanza
piano(ROOM * 2, ROOM * 2, matPav(8, 8), 0, 0, 0, -Math.PI / 2);
piano(ROOM * 2, ROOM * 2, matSoff(8, 8), 0, H, 0, Math.PI / 2);
piano(8, H, matMuro(8), 0, H / 2, ROOM, 0, Math.PI);          // fondo
piano(8, H, matMuro(8), -ROOM, H / 2, 0, 0, Math.PI / 2);     // sinistra
piano(8, H, matMuro(8), ROOM, H / 2, 0, 0, -Math.PI / 2);     // destra
const lato = ROOM - CW;
piano(lato, H, matMuro(lato), -(CW + lato / 2), H / 2, -ROOM); // fronte, a sinistra della porta
piano(lato, H, matMuro(lato), CW + lato / 2, H / 2, -ROOM);    // fronte, a destra
piano(CW * 2, H - CH, matMuro(2), 0, CH + (H - CH) / 2, -ROOM); // architrave

// pannelli al neon nella stanza
const neonGeo = new THREE.PlaneGeometry(0.6, 1.2);
const neonStanza = [];
for (const z of [-1.6, 1.6]) {
  const n = new THREE.Mesh(neonGeo, z > 0 ? matNeonRoom : matNeon);
  n.position.set(0, H - 0.005, z);
  n.rotation.x = Math.PI / 2;
  scene.add(n);
  neonStanza.push(n);
}

const hemi = new THREE.HemisphereLight(0xf6f9fb, 0xc4cdd1, 2.9);
scene.add(hemi);
const luciStanza = [];
for (const z of [-1.6, 1.6]) {
  const l = new THREE.PointLight(0xf2f7ff, 3.2, 7, 2);
  l.position.set(0, H - 0.3, z);
  scene.add(l);
  luciStanza.push(l);
}

// ---------------------------------------------------------------- oggetti
const interattivi = [];

// piedistallo e monitor (Brat Animator)
const monitor = new THREE.Group();
monitor.position.set(-2.5, 0, -1.4);
const piedistallo = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.6), matGrigio);
piedistallo.position.y = 0.5;
monitor.add(piedistallo);
const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.5, 0.42), matScuro);
corpo.position.set(0, 1.27, 0);
monitor.add(corpo);
const schermo = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.39), new THREE.MeshBasicMaterial({ map: texSchermo, fog: false }));
schermo.position.set(0, 1.27, 0.211);
schermo.userData.chiave = 'monitor';
monitor.add(schermo);
monitor.lookAt(0, 0, 1.5);
scene.add(monitor);
interattivi.push(schermo, corpo);
corpo.userData.chiave = 'monitor';

// targa con il nome
const targa = piano(1.15, 0.575, new THREE.MeshLambertMaterial({ map: texTarga }), ROOM - 0.01, 1.55, -1.6, 0, -Math.PI / 2);
targa.userData.chiave = 'targa';
interattivi.push(targa);

// scatola sigillata: segnaposto per il "pezzo di Gabri"
const matScatolaLato = new THREE.MeshLambertMaterial({ map: texScatola });
const matScatolaTop = new THREE.MeshLambertMaterial({ color: 0xf1f3f4 });
const scatola = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), [matScatolaLato, matScatolaLato, matScatolaTop, matScatolaTop, matScatolaLato, matScatolaLato]);
scatola.position.set(2.5, 0.275, 2.3);
scatola.rotation.y = -0.5;
scatola.userData.chiave = 'scatola';
scene.add(scatola);
interattivi.push(scatola);

const ostacoli = [
  { x: -2.5, z: -1.4, h: 0.42 },
  { x: 2.5, z: 2.3, h: 0.36 },
];

// ---------------------------------------------------------------- corridoio
const zc = -ROOM - CLEN / 2;
piano(CW * 2, CLEN, matPav(2, CLEN), 0, 0, zc, -Math.PI / 2);
piano(CW * 2, CLEN, matSoff(2, CLEN), 0, CH, zc, Math.PI / 2);
piano(CLEN, CH, matMuro(CLEN), -CW, CH / 2, zc, 0, Math.PI / 2);
piano(CLEN, CH, matMuro(CLEN), CW, CH / 2, zc, 0, -Math.PI / 2);

const matTarghetta = new THREE.MeshLambertMaterial({ map: texTarghetta });
const geoTarghetta = new THREE.PlaneGeometry(0.24, 0.12);
const neonCorridoio = new THREE.PlaneGeometry(0.5, 1.1);
for (let k = 0; k * PERIOD < CLEN; k++) {
  const z = -ROOM - PERIOD / 2 - k * PERIOD;
  const n = new THREE.Mesh(neonCorridoio, matNeon);
  n.position.set(0, CH - 0.005, z);
  n.rotation.x = Math.PI / 2;
  scene.add(n);
  const t = new THREE.Mesh(geoTarghetta, matTarghetta);
  t.position.set(-CW + 0.005, 1.55, z + 1.2);
  t.rotation.y = Math.PI / 2;
  scene.add(t);
}

// la porta in fondo: un muro pieno che chiude il corridoio, con un'anta
const porta = new THREE.Group();
const muroPorta = new THREE.Mesh(new THREE.PlaneGeometry(CW * 2, CH), matMuro(2));
muroPorta.position.y = CH / 2;
porta.add(muroPorta);
const anta = new THREE.Mesh(new THREE.BoxGeometry(0.92, 2.1, 0.06), new THREE.MeshLambertMaterial({ color: 0xc9d3d8 }));
anta.position.set(0, 1.05, 0.03);
porta.add(anta);
const maniglia = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.05), matScuro);
maniglia.position.set(0.32, 1.02, 0.08);
porta.add(maniglia);
const targhettaPorta = new THREE.Mesh(geoTarghetta, matTarghetta);
targhettaPorta.position.set(0, 1.75, 0.065);
porta.add(targhettaPorta);
scene.add(porta);

// ---------------------------------------------------------------- post-processing
let rt = null;
let post = null;
const postScene = new THREE.Scene();
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
if (renderer) {
  rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 });
  post = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: rt.texture }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uGrain: { value: reduceMotion ? 0.025 : 0.045 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; uniform float uGrain;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec2 c = vUv - 0.5; float r2 = dot(c, c);
        vec2 off = c * 0.004 * (1.0 + r2 * 4.0);
        vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
        vec2 px = 3.0 / uRes;
        vec3 blur = (texture2D(tDiffuse, vUv + vec2(px.x, 0.0)).rgb + texture2D(tDiffuse, vUv - vec2(px.x, 0.0)).rgb
                   + texture2D(tDiffuse, vUv + vec2(0.0, px.y)).rgb + texture2D(tDiffuse, vUv - vec2(0.0, px.y)).rgb) * 0.25;
        col = mix(col, max(col, blur), 0.5);
        col = pow(max(col, 0.0), vec3(1.0 / 2.2));
        col *= vec3(0.975, 1.0, 1.025);
        col *= mix(0.74, 1.0, smoothstep(0.62, 0.08, r2));
        col += (hash(vUv * uRes + fract(uTime) * 91.0) - 0.5) * uGrain;
        gl_FragColor = vec4(col, 1.0);
      }`,
    depthTest: false,
    depthWrite: false,
  });
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
}

function ridimensiona() {
  if (!renderer) return;
  const pr = Math.min(devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(pr);
  renderer.setSize(innerWidth, innerHeight, false);
  rt.setSize(Math.floor(innerWidth * pr), Math.floor(innerHeight * pr));
  post.uniforms.uRes.value.set(innerWidth * pr, innerHeight * pr);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', ridimensiona);

// ---------------------------------------------------------------- stato di gioco
let stato = 'ingresso';     // ingresso | gioco | pausa | scheda | fine
let yaw = 0;
let pitch = 0;
let doorDist = DOOR_START;
let passi = 0;
const tasti = new Set();
const pos = SPAWN.clone();

function profondita(z) { return -ROOM - z; }     // metri percorsi nel corridoio

function libero(x, z) {
  const inStanza = Math.abs(x) <= ROOM - RADIUS && Math.abs(z) <= ROOM - RADIUS;
  const inCorr = Math.abs(x) <= CW - RADIUS && z <= -ROOM + 0.5 && profondita(z) <= doorDist - RADIUS - 0.05;
  if (!inStanza && !inCorr) return false;
  for (const o of ostacoli) {
    if (Math.abs(x - o.x) < o.h + RADIUS && Math.abs(z - o.z) < o.h + RADIUS) return false;
  }
  return true;
}

function resetPosizione() {
  pos.copy(SPAWN);
  yaw = 0;
  pitch = 0;
  doorDist = DOOR_START;
}

function aggiorna(dt, t) {
  const avanti = (tasti.has('KeyW') || tasti.has('ArrowUp') ? 1 : 0) - (tasti.has('KeyS') || tasti.has('ArrowDown') ? 1 : 0);
  const destra = (tasti.has('KeyD') || tasti.has('ArrowRight') ? 1 : 0) - (tasti.has('KeyA') || tasti.has('ArrowLeft') ? 1 : 0);
  let mx = 0;
  let mz = 0;
  if (avanti || destra) {
    const len = Math.hypot(avanti, destra);
    const f = (SPEED * dt) / len;
    mx = (-Math.sin(yaw) * avanti + Math.cos(yaw) * destra) * f;
    mz = (-Math.cos(yaw) * avanti - Math.sin(yaw) * destra) * f;
  }
  const sPrima = profondita(pos.z);
  if (libero(pos.x + mx, pos.z + mz)) { pos.x += mx; pos.z += mz; }
  else if (libero(pos.x + mx, pos.z)) pos.x += mx;
  else if (libero(pos.x, pos.z + mz)) pos.z += mz;
  const mosso = Math.hypot(pos.x - camera.position.x, pos.z - camera.position.z);
  passi += mosso;

  // regola: la porta arretra mentre avanzi nel corridoio
  let s = profondita(pos.z);
  if (s > 0 && s > sPrima) doorDist += (s - sPrima) * RECEDE;

  // il ritorno si accorcia: spostamenti di multipli del periodo, invisibili
  const guardaAvanti = Math.cos(yaw) > 0.3;
  let salto = 0;
  if (guardaAvanti && s > 20) salto = Math.floor((s - 8) / PERIOD) * PERIOD;
  else if (s > 28) salto = Math.floor((s - 20) / PERIOD) * PERIOD;
  if (salto > 0) {
    pos.z += salto;
    doorDist -= salto;
    s -= salto;
  }

  if (s > 0 && doorDist - s < END_GAP + RADIUS) mostraFine();

  const bob = reduceMotion ? 0 : Math.sin(passi * 6.5) * 0.022 * Math.min(1, (avanti || destra) ? 1 : 0);
  camera.position.set(pos.x, EYE + bob, pos.z);
}

function aggiornaMondo(t) {
  porta.position.z = -ROOM - doorDist;
  disegnaSchermo(t);
  // un neon della stanza ogni tanto esita
  const fase = t % 9;
  const tremola = fase > 7.6 && fase < 8.4 && Math.sin(t * 61) > 0.1;
  matNeonRoom.color.setScalar(tremola ? 0.55 : 1);
  luciStanza[1].intensity = tremola ? 1.2 : 3.2;
}

// ---------------------------------------------------------------- mira e interazione
const raycaster = new THREE.Raycaster();
raycaster.far = 3.2;
const centro = new THREE.Vector2(0, 0);
let mirato = null;

function aggiornaMira() {
  raycaster.setFromCamera(centro, camera);
  const hit = raycaster.intersectObjects(interattivi, false)[0];
  mirato = hit ? hit.object.userData.chiave : null;
  const sugg = $('suggerimento');
  $('mirino').classList.toggle('attivo', !!mirato);
  if (mirato && stato === 'gioco') {
    sugg.textContent = T.interagisci + T.oggetti[mirato].azione;
    sugg.hidden = false;
  } else {
    sugg.hidden = true;
  }
}

function interagisci() {
  if (stato !== 'gioco' || !mirato) return;
  const o = T.oggetti[mirato];
  $('scheda-titolo').textContent = o.titolo;
  $('scheda-testo').textContent = o.testo;
  const link = $('scheda-link');
  link.hidden = !o.url;
  if (o.url) link.href = o.url;
  stato = 'scheda';
  tasti.clear();
  document.exitPointerLock();
  mostra('scheda');
  (o.url ? link : $('scheda-chiudi')).focus();
}

function mostraFine() {
  if (stato !== 'gioco') return;
  stato = 'fine';
  tasti.clear();
  document.exitPointerLock();
  mostra('fine');
  $('ricomincia').focus();
}

// ---------------------------------------------------------------- pannelli e pointer lock
function mostra(id) {
  for (const p of ['ingresso', 'pausa', 'scheda', 'fine']) $(p).hidden = p !== id;
  const inGioco = id === null;
  $('mirino').hidden = !inGioco;
  if (!inGioco) $('suggerimento').hidden = true;
}

function entra() {
  avviaAudio();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  const r = canvas.requestPointerLock();
  if (r && typeof r.catch === 'function') r.catch(() => {});
}

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === canvas) {
    stato = 'gioco';
    mostra(null);
  } else if (stato === 'gioco') {
    stato = 'pausa';
    tasti.clear();
    mostra('pausa');
    $('riprendi').focus();
  }
});

$('entra').addEventListener('click', entra);
$('riprendi').addEventListener('click', entra);
$('scheda-chiudi').addEventListener('click', entra);
$('ricomincia').addEventListener('click', () => { resetPosizione(); entra(); });
canvas.addEventListener('click', () => {
  if (stato === 'gioco') interagisci();
  else if (stato === 'pausa') entra();
});

document.addEventListener('mousemove', (e) => {
  if (stato !== 'gioco') return;
  yaw -= e.movementX * 0.0021;
  pitch -= e.movementY * 0.0021;
  pitch = Math.max(-1.35, Math.min(1.35, pitch));
});

document.addEventListener('keydown', (e) => {
  if (stato === 'gioco') {
    if (e.code === 'KeyE') interagisci();
    tasti.add(e.code);
    if (e.code.startsWith('Arrow')) e.preventDefault();
  } else if (e.code === 'Escape' && (stato === 'scheda')) {
    stato = 'pausa';
    mostra('pausa');
    $('riprendi').focus();
  }
});
document.addEventListener('keyup', (e) => tasti.delete(e.code));
addEventListener('blur', () => tasti.clear());

// aggancio per i test automatici, attivo solo con ?debug
if (new URLSearchParams(location.search).has('debug')) {
  window.__stanza = {
    leggi: () => ({ stato, x: pos.x, z: pos.z, yaw, doorDist, s: profondita(pos.z), mirato }),
    guarda: (y, p = 0) => { yaw = y; pitch = p; },
    vai: (x, z) => { pos.set(x, EYE, z); camera.position.copy(pos); },
  };
}

// ---------------------------------------------------------------- avvio
const orologio = new THREE.Timer();

function ciclo(ms) {
  orologio.update(ms);
  const dt = Math.min(orologio.getDelta(), 0.1);
  const t = orologio.getElapsed();
  if (stato === 'gioco') aggiorna(dt, t);
  else if (stato === 'ingresso' && !reduceMotion) {
    // in attesa: lo sguardo ondeggia appena verso il corridoio
    yaw = Math.sin(t * 0.13) * 0.18;
    pitch = Math.sin(t * 0.09) * 0.04;
  }
  camera.rotation.set(pitch, yaw, 0);
  aggiornaMondo(t);
  if (stato === 'gioco') aggiornaMira();
  post.uniforms.uTime.value = reduceMotion ? 0 : t;
  renderer.setRenderTarget(rt);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  renderer.render(postScene, postCam);
}

async function avvia() {
  const risposta = await fetch('contenuti.json');
  dati = await risposta.json();
  try { await document.fonts.load('700 40px Archivo'); } catch (e) { /* font di sistema */ }
  applicaLingua(linguaIniziale());
  if (erroreWebgl) {
    $('entra').hidden = true;
    return;
  }
  disegnaTarga();
  disegnaScatola();
  disegnaTarghetta();
  texturePronte = true;
  ridimensiona();
  renderer.setAnimationLoop(ciclo);
  const b = $('entra');
  b.dataset.t = 'entra';
  b.textContent = T.entra;
  b.disabled = false;
}

avvia().catch((e) => {
  console.error(e);
  erroreWebgl = true;
  if (T) aggiornaAvviso();
  $('entra').hidden = true;
});
