// Texture procedurali e materiali. Le superfici usano una mappatura in coordinate
// mondo (triplanare senza fusione), così i blocchi adiacenti non mostrano giunture
// e le piastrelle restano allineate anche dopo i teletrasporti periodici.
import * as THREE from 'three';

let aniso = 1;

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// texture di testo ridisegnabile (per il cambio lingua)
export function texTesto(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  t.ridisegna = (...a) => { draw(c.getContext('2d'), w, h, ...a); t.needsUpdate = true; };
  return t;
}

function rumore(ctx, w, h, quanti, alpha) {
  for (let i = 0; i < quanti; i++) {
    const v = 150 + Math.random() * 80;
    ctx.fillStyle = `rgba(${v},${v + 4},${v + 8},${alpha})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
}

function triplanare(mat, scala, chiave) {
  const sv = typeof scala === 'number' ? new THREE.Vector2(scala, scala) : scala;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uScala = { value: sv };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nvarying vec3 vWN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nvarying vec3 vWN;\nuniform vec2 uScala;')
      .replace('#include <map_fragment>', [
        'vec3 an = abs(vWN);',
        'vec2 tuv = an.y > max(an.x, an.z) ? vWP.xz : (an.x > an.z ? vWP.zy : vWP.xy);',
        'diffuseColor *= texture2D(map, tuv * uScala);',
      ].join('\n'));
  };
  mat.customProgramCacheKey = () => 'tri-' + chiave;
  return mat;
}

// macchie morbide (umidità, sporco) per cemento e intonaco
function macchie(ctx, w, h, quante, colore, alpha) {
  for (let i = 0; i < quante; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 10 + Math.random() * 46;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${colore},${alpha})`);
    gr.addColorStop(1, `rgba(${colore},0)`);
    ctx.fillStyle = gr;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

// texture di attesa: bianco, normale piatta, ARM (occlusione 1, rugosità 0.8, metallo 0)
const pixel = (r, g, b) => { const t = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1); t.needsUpdate = true; return t; };
const BIANCO = pixel(255, 255, 255);
const PIATTA = pixel(128, 128, 255);
const ARM0 = pixel(255, 204, 0);

/*
 * Materiale PBR con mappatura in coordinate mondo: colore, normali e ARM (occlusione, rugosità,
 * metallo) proiettati sull'asse dominante della superficie, densità `scala` ripetizioni al metro.
 * Le normali usano una base tangente per asse. `zoccolo` (opzionale) tinge di scuro la fascia bassa
 * della parete fino a `zoccolo.h` metri sopra `zoccolo.base`. Finché le texture non arrivano il
 * materiale usa solo la tinta; poi si aggiorna da solo (nessuna ricompilazione).
 */
export function pbrMondo(asset, id, { scala = 0.5, tinta = 0xffffff, rugosita = 1, metallo = 1, normale = 1, zoccolo = null, rimbalzo = 0 } = {}) {
  // rimbalzo: luce riflessa simulata (soffitti e superfici che guardano in basso)
  const mat = new THREE.MeshStandardMaterial({ color: tinta, roughness: rugosita, metalness: metallo, emissive: new THREE.Color(tinta).multiplyScalar(rimbalzo) });
  const u = {
    tColore: { value: BIANCO }, tNormali: { value: PIATTA }, tArm: { value: ARM0 },
    uScala: { value: scala }, uNormale: { value: normale },
    uZBase: { value: zoccolo ? zoccolo.base : -1e6 }, uZAlto: { value: zoccolo ? zoccolo.h : 0 },
    uZTinta: { value: new THREE.Color(zoccolo ? zoccolo.tinta : 0xffffff) },
  };
  if (asset && id) asset.texture(id).then((t) => { if (!t) return; u.tColore.value = t.map; u.tNormali.value = t.normalMap; u.tArm.value = t.aoMap; });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nvarying vec3 vWN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vWP; varying vec3 vWN;
uniform sampler2D tColore; uniform sampler2D tNormali; uniform sampler2D tArm;
uniform float uScala; uniform float uNormale; uniform float uZBase; uniform float uZAlto; uniform vec3 uZTinta;
vec2 tuvM; vec3 tanM; vec3 bitM; vec3 armM;`)
      .replace('#include <map_fragment>', `
vec3 an = abs(vWN);
if (an.y > max(an.x, an.z)) { tuvM = vWP.xz; tanM = vec3(1.0, 0.0, 0.0); bitM = vec3(0.0, 0.0, sign(vWN.y)); }
else if (an.x > an.z) { tuvM = vec2(vWP.z * sign(vWN.x), vWP.y); tanM = vec3(0.0, 0.0, sign(vWN.x)); bitM = vec3(0.0, 1.0, 0.0); }
else { tuvM = vec2(-vWP.x * sign(vWN.z), vWP.y); tanM = vec3(-sign(vWN.z), 0.0, 0.0); bitM = vec3(0.0, 1.0, 0.0); }
tuvM *= uScala;
diffuseColor.rgb *= texture2D(tColore, tuvM).rgb;
if (vWP.y - uZBase < uZAlto) diffuseColor.rgb *= uZTinta;
armM = texture2D(tArm, tuvM).rgb;`)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = roughness * armM.g;')
      .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = metalness * armM.b;')
      .replace('#include <normal_fragment_maps>', `
vec3 nt = texture2D(tNormali, tuvM).xyz * 2.0 - 1.0;
nt.xy *= uNormale;
vec3 nw = normalize(tanM * nt.x + bitM * nt.y + normalize(vWN) * nt.z);
normal = normalize((viewMatrix * vec4(nw, 0.0)).xyz);`)
      .replace('#include <aomap_fragment>', `
float ambientOcclusion = armM.r;
reflectedLight.indirectDiffuse *= ambientOcclusion;
#if defined( USE_CLEARCOAT )
  clearcoatSpecularIndirect *= ambientOcclusion;
#endif
reflectedLight.indirectSpecular *= ambientOcclusion;`);
  };
  mat.customProgramCacheKey = () => 'pbr-mondo';
  return mat;
}

const std = (color, roughness = 0.7, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });

export function creaMateriali(renderer, asset = null) {
  aniso = renderer.capabilities.getMaxAnisotropy();

  // pannello su cui si aprono le finestre: griglia chiara, angoli ciano e magenta (resta grafico)
  const pannelloTex = (a, b) => canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#d9dcd6';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#b8bcb5';
    for (let x = 0; x < w; x += 16) ctx.fillRect(x, 0, 1, h);
    for (let y = 0; y < h; y += 16) ctx.fillRect(0, y, w, 1);
    ctx.fillStyle = '#8c918a';
    ctx.fillRect(0, 0, w, 3);
    ctx.fillRect(0, 0, 3, h);
    for (const [x, y, c] of [[8, 8, a], [w - 24, h - 24, a], [w - 24, 8, b], [8, h - 24, b]]) {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, 16, 4);
      ctx.fillRect(x, y, 4, 16);
    }
  });
  const pannello = (a, b, chiave) => {
    const m = triplanare(new THREE.MeshStandardMaterial({ map: pannelloTex(a, b), roughness: 0.55, metalness: 0 }), 1, chiave);
    return m;
  };
  // tessuti grezzi per i materiali di stanza fatti a mano (materialeTri)
  const grezza = (base, quanti) => canvasTex(256, 256, (ctx, w, h) => { ctx.fillStyle = base; ctx.fillRect(0, 0, w, h); rumore(ctx, w, h, quanti, 0.1); });

  const cacheIntonaco = new Map();
  const intonacoA = (y0 = 0) => {
    if (!cacheIntonaco.has(y0)) {
      cacheIntonaco.set(y0, pbrMondo(asset, 'intonaco', { scala: 0.5, tinta: 0xe6e2d6, zoccolo: { base: y0, h: 1.1, tinta: 0x5c7f7a } }));
    }
    return cacheIntonaco.get(y0);
  };

  const m = {
    tex: { pavimento: grezza('#8d8e89', 2200), muro: grezza('#cfcfcf', 900), soffitto: grezza('#a7a79f', 400) },
    intonacoA,
    cemento: pbrMondo(asset, 'cemento', { scala: 0.35, tinta: 0xa9aaa6 }),
    intonaco: intonacoA(0),
    metallo: pbrMondo(asset, 'metallo', { scala: 0.6 }),
    lamiera: pbrMondo(asset, 'lamiera', { scala: 0.4 }),
    piastrelle: pbrMondo(asset, 'piastrelle', { scala: 0.5 }),
    piastrellePiscina: pbrMondo(asset, 'piastrelle-piscina', { scala: 0.6 }),
    moquette: pbrMondo(asset, 'moquette', { scala: 0.5 }),
    legnoScuro: pbrMondo(asset, 'legno-scuro', { scala: 0.4 }),
    parquet: pbrMondo(asset, 'parquet', { scala: 0.4 }),
    mattoni: pbrMondo(asset, 'mattoni', { scala: 0.35 }),
    tufo: pbrMondo(asset, 'tufo', { scala: 0.3 }),
    neonSodio: new THREE.MeshBasicMaterial({ color: 0xffc27a, fog: false }),
    soffitto: pbrMondo(asset, 'intonaco', { scala: 0.6, tinta: 0xe2e0d6, rimbalzo: 0.22 }),
    pannello: pannello('#39c6d9', '#d95bb3', 'pan'),
    proibito: pannello('#7a5a6a', '#7a5a6a', 'pro'),
    grigio: std(0x7c7f7a, 0.8),
    chiaro: std(0xc9c8be, 0.75),
    scuro: std(0x24292a, 0.6, 0.2),
    cornice: std(0x3e4644, 0.45, 0.6),
    battiscopa: std(0x1f2625, 0.5, 0.1),
    legno: std(0x6b4a33, 0.65),
    ottone: std(0xb08d4e, 0.3, 1),
    cordone: std(0x8a2f2a, 0.9),
    neon: new THREE.MeshBasicMaterial({ color: 0xeef6f2, fog: false }),
    neonTremolante: new THREE.MeshBasicMaterial({ color: 0xeef6f2, fog: false }),
  };
  // nomi storici, usati dalle stanze: puntano alla nuova tavolozza
  m.pavimento = m.cemento;
  m.muro = m.intonaco;
  return m;
}

// materiale con mappatura in coordinate mondo: sx, sy = ripetizioni per metro
export function materialeTri(tex, sx, sy, chiave, opzioni = {}) {
  return triplanare(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0, ...opzioni }), new THREE.Vector2(sx, sy), chiave);
}
