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

// intonaco a due colori: zoccolo scuro fino a 1,1 m dal pavimento, parte alta chiara
function intonacoBicolore(tex, y0) {
  const mat = new THREE.MeshLambertMaterial({ map: tex });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uScala = { value: new THREE.Vector2(0.5, 0.5) };
    sh.uniforms.uBase = { value: y0 };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nvarying vec3 vWN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nvarying vec3 vWN;\nuniform vec2 uScala;\nuniform float uBase;')
      .replace('#include <map_fragment>', [
        'vec3 an = abs(vWN);',
        'vec2 tuv = an.y > max(an.x, an.z) ? vWP.xz : (an.x > an.z ? vWP.zy : vWP.xy);',
        'vec3 tx = texture2D(map, tuv * uScala).rgb;',
        'float h = vWP.y - uBase;',
        'vec3 alto = vec3(0.78, 0.77, 0.69);',
        'vec3 basso = vec3(0.25, 0.36, 0.34);',
        'vec3 tinta = h < 1.08 ? basso : (h < 1.14 ? vec3(0.16, 0.2, 0.19) : alto);',
        'diffuseColor.rgb *= tinta * tx * 1.25;',
      ].join('\n'));
  };
  mat.customProgramCacheKey = () => 'intonaco-' + y0;
  return mat;
}

export function creaMateriali(renderer) {
  aniso = renderer.capabilities.getMaxAnisotropy();

  const cemento = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#8d8e89';
    ctx.fillRect(0, 0, w, h);
    macchie(ctx, w, h, 14, '60,62,58', 0.18);
    macchie(ctx, w, h, 10, '170,170,162', 0.12);
    rumore(ctx, w, h, 2200, 0.16);
    ctx.fillStyle = 'rgba(40,42,40,0.55)';
    ctx.fillRect(0, 0, w, 2);
    ctx.fillRect(0, 0, 2, h);
  });

  const intonaco = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#cfcfcf';
    ctx.fillRect(0, 0, w, h);
    macchie(ctx, w, h, 8, '120,120,110', 0.12);
    rumore(ctx, w, h, 900, 0.08);
  });

  const soffitto = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#a7a79f';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(70,70,64,0.35)';
    for (let i = 0; i < 380; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    ctx.fillStyle = '#6f6f68';
    ctx.fillRect(0, 0, w, 4);
    ctx.fillRect(0, 0, 4, h);
    ctx.fillRect(w / 2, 0, 3, h);
    ctx.fillRect(0, h / 2, w, 3);
  });

  const metallo = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#5d6a70';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(200,205,205,0.18)';
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.random() * 30 - 15, y + Math.random() * 6 - 3); ctx.stroke();
    }
    macchie(ctx, w, h, 6, '120,80,50', 0.18);
    rumore(ctx, w, h, 600, 0.08);
  });

  const piastrelle = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#b9b29d';
    ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) {
      const v = Math.random() * 18 - 9;
      ctx.fillStyle = `rgb(${185 + v},${178 + v},${157 + v})`;
      ctx.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
    }
    macchie(ctx, w, h, 8, '90,84,66', 0.16);
    rumore(ctx, w, h, 700, 0.1);
  });

  const moquette = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#7a4a32';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      const v = Math.random() * 40;
      ctx.fillStyle = `rgba(${120 + v},${70 + v / 2},${40},0.35)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  });

  const legnoScuro = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#4a3324';
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) {
      ctx.fillStyle = `rgba(30,18,10,0.6)`;
      ctx.fillRect(0, y, w, 2);
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(${90 + Math.random() * 30},${60 + Math.random() * 20},40,0.25)`;
        ctx.fillRect(Math.random() * w, y + 3 + Math.random() * 27, 20 + Math.random() * 60, 1);
      }
    }
  });

  // pannello su cui si aprono le finestre: griglia chiara, angoli ciano e magenta
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

  const tri = (tex, scala, chiave) => triplanare(new THREE.MeshLambertMaterial({ map: tex }), scala, chiave);
  const cacheIntonaco = new Map();
  const intonacoA = (y0 = 0) => {
    if (!cacheIntonaco.has(y0)) cacheIntonaco.set(y0, intonacoBicolore(intonaco, y0));
    return cacheIntonaco.get(y0);
  };

  const m = {
    tex: { pavimento: cemento, muro: intonaco, soffitto, cemento, metallo, piastrelle, moquette, legnoScuro },
    intonacoA,
    cemento: tri(cemento, 0.5, 'cem'),
    intonaco: intonacoA(0),
    metallo: tri(metallo, 0.6, 'met'),
    piastrelle: tri(piastrelle, 1, 'pia'),
    moquette: tri(moquette, 1, 'moq'),
    legnoScuro: tri(legnoScuro, 0.7, 'leg'),
    neonSodio: new THREE.MeshBasicMaterial({ color: 0xffc27a, fog: false }),
    soffitto: tri(soffitto, 0.5, 'soff'),
    pannello: tri(pannelloTex('#39c6d9', '#d95bb3'), 1, 'pan'),
    proibito: tri(pannelloTex('#7a5a6a', '#7a5a6a'), 1, 'pro'),
    grigio: new THREE.MeshLambertMaterial({ color: 0x7c7f7a }),
    chiaro: new THREE.MeshLambertMaterial({ color: 0xb9b8ae }),
    scuro: new THREE.MeshLambertMaterial({ color: 0x24292a }),
    cornice: new THREE.MeshLambertMaterial({ color: 0x3e4644 }),
    battiscopa: new THREE.MeshLambertMaterial({ color: 0x1f2625 }),
    legno: new THREE.MeshLambertMaterial({ color: 0x6b4a33 }),
    ottone: new THREE.MeshLambertMaterial({ color: 0xa88a4e, emissive: 0x1d160a }),
    cordone: new THREE.MeshLambertMaterial({ color: 0x8a2f2a }),
    neon: new THREE.MeshBasicMaterial({ color: 0xeef6f2, fog: false }),
    neonTremolante: new THREE.MeshBasicMaterial({ color: 0xeef6f2, fog: false }),
  };
  // nomi storici, usati dai transiti di v2: puntano alla nuova tavolozza
  m.pavimento = m.cemento;
  m.muro = m.intonaco;
  return m;
}

// materiale con mappatura in coordinate mondo: sx, sy = ripetizioni per metro
export function materialeTri(tex, sx, sy, chiave, opzioni = {}) {
  return triplanare(new THREE.MeshLambertMaterial({ map: tex, ...opzioni }), new THREE.Vector2(sx, sy), chiave);
}
