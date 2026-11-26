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

export function creaMateriali(renderer) {
  aniso = renderer.capabilities.getMaxAnisotropy();

  const pavimento = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#e3e8eb';
    ctx.fillRect(0, 0, w, h);
    rumore(ctx, w, h, 900, 0.18);
    ctx.fillStyle = '#c9d1d6';
    ctx.fillRect(0, 0, w, 3);
    ctx.fillRect(0, 0, 3, h);
  });

  const muro = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f0f3f5';
    ctx.fillRect(0, 0, w, h);
    rumore(ctx, w, h, 400, 0.07);
    ctx.fillStyle = '#d6dde1';
    ctx.fillRect(0, 0, 2, h);
    ctx.fillStyle = '#e2e8eb';
    ctx.fillRect(0, 0, w, 2);
  });

  const soffitto = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#eef2f3';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(160,172,178,0.35)';
    for (let i = 0; i < 260; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    ctx.fillStyle = '#cfd6da';
    ctx.fillRect(0, 0, w, 4);
    ctx.fillRect(0, 0, 4, h);
  });

  // pannello su cui si aprono le finestre: griglia fine a quadretti, angoli marcati
  const pannelloTex = (segno) => canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f8fafb';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e4eaed';
    for (let x = 0; x < w; x += 16) ctx.fillRect(x, 0, 1, h);
    for (let y = 0; y < h; y += 16) ctx.fillRect(0, y, w, 1);
    ctx.fillStyle = '#b9c6cd';
    ctx.fillRect(0, 0, w, 3);
    ctx.fillRect(0, 0, 3, h);
    ctx.fillStyle = segno;
    for (const [x, y] of [[8, 8], [w - 24, 8], [8, h - 24], [w - 24, h - 24]]) {
      ctx.fillRect(x, y, 16, 4);
      ctx.fillRect(x, y, 4, 16);
    }
  });

  const tri = (tex, scala, chiave) => triplanare(new THREE.MeshLambertMaterial({ map: tex }), scala, chiave);

  return {
    tex: { pavimento, muro, soffitto },
    pavimento: tri(pavimento, 1, 'pav'),
    muro: tri(muro, 0.5, 'muro'),
    soffitto: tri(soffitto, 1, 'soff'),
    pannello: tri(pannelloTex('#8fa3ad'), 1, 'pan'),
    proibito: tri(pannelloTex('#c49aae'), 1, 'pro'),
    grigio: new THREE.MeshLambertMaterial({ color: 0xd3dadd }),
    chiaro: new THREE.MeshLambertMaterial({ color: 0xeef2f4 }),
    scuro: new THREE.MeshLambertMaterial({ color: 0x2a3237 }),
    cornice: new THREE.MeshLambertMaterial({ color: 0xbfcad0 }),
    battiscopa: new THREE.MeshLambertMaterial({ color: 0xcfd8dd }),
    legno: new THREE.MeshLambertMaterial({ color: 0xd9d2c5 }),
    ottone: new THREE.MeshLambertMaterial({ color: 0xb59a5e, emissive: 0x1d160a }),
    cordone: new THREE.MeshLambertMaterial({ color: 0x5f8796 }),
    neon: new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }),
    neonTremolante: new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }),
  };
}

// materiale con mappatura in coordinate mondo: sx, sy = ripetizioni per metro
export function materialeTri(tex, sx, sy, chiave, opzioni = {}) {
  return triplanare(new THREE.MeshLambertMaterial({ map: tex, ...opzioni }), new THREE.Vector2(sx, sy), chiave);
}
