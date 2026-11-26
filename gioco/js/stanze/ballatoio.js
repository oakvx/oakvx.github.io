// Il ballatoio: un corridoio esterno al trentesimo piano, di sera, sotto la pioggia.
// Porte tutte uguali, tubi, lampade a muro. Oltre il parapetto la città nella nebbia,
// piani identici sopra e sotto. L'ultima porta riporta alla sala d'attesa.
import * as THREE from 'three';
import { cartelloStanza } from '../engine/liminale.js';
import { geoTonda } from '../engine/mondo.js';
import { canvasTex, texTesto, materialeTri } from '../engine/materiali.js';
import { creaAcqua } from '../engine/acqua.js';

const X0 = 600, X1 = 602.6, Z0 = -30, Z1 = 10, Y0 = 30, H = 2.8;

export function costruisci(m, g) {
  const cemento = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#5b6266';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { const v = 70 + Math.random() * 40; ctx.fillStyle = `rgba(${v},${v + 4},${v + 8},0.35)`; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    ctx.fillStyle = 'rgba(30,36,40,0.5)';
    ctx.fillRect(0, 0, w, 2);
  });
  const intonaco = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#9aa3a6';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { const v = 130 + Math.random() * 40; ctx.fillStyle = `rgba(${v},${v + 4},${v + 6},0.3)`; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    const gr = ctx.createLinearGradient(0, h * 0.7, 0, h);
    gr.addColorStop(0, 'rgba(60,70,74,0)');
    gr.addColorStop(1, 'rgba(60,70,74,0.35)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
  });
  const matCem = materialeTri(cemento, 0.5, 0.5, 'bal-cem');
  const mat = {
    pavimento: matCem,
    muro: materialeTri(intonaco, 0.35, 0.36, 'bal-muro'),
    soffitto: matCem,
    battiscopa: new THREE.MeshLambertMaterial({ color: 0x3e474c }),
    cornice: new THREE.MeshLambertMaterial({ color: 0x3e474c }),
  };
  m.stanza({
    nome: 'ballatoio', x0: X0, x1: X1, z0: Z0, z1: Z1, y0: Y0, h: H, ala: 'transito', passi: 'metallo',
    pareti: { e: false }, materiali: mat,
    atmosfera: { nebbia: 0x56626e, vicino: 4, lontano: 80, cielo: 0xa4b2c0, terra: 0x2b3239, intensita: 1.4 },
    suono: { ronzio: 0, pioggia: 1 },
  });
  // parapetto pieno e sporgenza del solaio
  m.tondo(X1, Y0, Z0, X1 + 0.25, Y0 + 1.1, Z1, matCem, { r: 0.03 });
  m.box(X1, Y0 + H, Z0 - 0.3, X1 + 0.6, Y0 + H + 0.3, Z1 + 0.3, matCem, { solido: false });
  m.box(X1, Y0 - 0.3, Z0 - 0.3, X1 + 0.3, Y0, Z1 + 0.3, matCem, { solido: false });

  // piani identici sopra e sotto
  for (let k = -6; k <= 6; k++) {
    if (k === 0) continue;
    const y = Y0 + k * 3.1;
    m.box(X0 - 0.3, y - 0.3, Z0 - 0.3, X1 + 0.6, y, Z1 + 0.3, matCem, { solido: false });
    m.box(X1, y, Z0 - 0.3, X1 + 0.25, y + 1.1, Z1 + 0.3, matCem, { solido: false });
    m.box(X0 - 0.3, y, Z0 - 0.3, X0, y + 3.1, Z1 + 0.3, mat.muro, { solido: false });
  }

  // porte tutte uguali, con lo spioncino; tubi e lampade a muro
  const metallo = new THREE.MeshLambertMaterial({ color: 0x46544f });
  const tubo = new THREE.MeshLambertMaterial({ color: 0x7c8584 });
  const lampadaMat = new THREE.MeshBasicMaterial({ color: 0xe8f0ff, fog: false });
  for (let z = Z1 - 3; z > Z0 + 1; z -= 4) {
    m.tondo(X0, Y0, z - 0.5, X0 + 0.06, Y0 + 2.1, z + 0.5, metallo, { r: 0.02, solido: false });
    m.tondo(X0 + 0.05, Y0 + 1.0, z + 0.3, X0 + 0.1, Y0 + 1.06, z + 0.42, tubo, { r: 0.01, solido: false });
    const numero = texTesto(64, 32, (ctx, w, h) => { ctx.fillStyle = '#d8dcd8'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#2a3030'; ctx.font = '700 22px Archivo, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('30' + String(Math.round((Z1 - z) / 4)).padStart(2, '0'), w / 2, 24); });
    numero.ridisegna();
    const targa = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), new THREE.MeshBasicMaterial({ map: numero }));
    targa.position.set(X0 + 0.07, Y0 + 1.75, z);
    targa.rotation.y = Math.PI / 2;
    m.scene.add(targa);
  }
  for (let z = Z1 - 1; z > Z0; z -= 6) {
    const l = new THREE.Mesh(geoTonda(0.12, 0.22, 0.3, 0.05), lampadaMat);
    l.position.set(X0 + 0.07, Y0 + 2.3, z);
    m.scene.add(l);
    m.luce(X0 + 0.6, Y0 + 2.1, z, 1.6, 7, 0xd8e4ff);
  }
  for (const z of [Z1 - 0.7, -11, Z0 + 1.2]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 40, 10), tubo);
    t.position.set(X0 + 0.12, Y0, z);
    m.scene.add(t);
  }

  // pozzanghere: l'acqua della pioggia che scorre verso lo scarico
  for (const [z0, z1] of [[-24, -21], [-9, -6.5], [3, 5]]) creaAcqua(m, X0 + 0.6, z0, X1 - 0.1, z1, Y0 + 0.012, { flusso: [0.05, 0.25], colore: 0x1d262c, riflesso: 0x8ea3b6, opacita: 0.7 });

  // la città nella nebbia: palazzi con le finestre accese
  const finestre = canvasTex(256, 512, (ctx, w, h) => {
    ctx.fillStyle = '#2a3036';
    ctx.fillRect(0, 0, w, h);
    for (let y = 8; y < h; y += 16) for (let x = 6; x < w; x += 14) {
      const acceso = Math.random() < 0.28;
      ctx.fillStyle = acceso ? (Math.random() < 0.5 ? '#ffe0a8' : '#dfe9ff') : '#1c2126';
      ctx.fillRect(x, y, 8, 9);
    }
  });
  const matCitta = new THREE.MeshBasicMaterial({ map: finestre });
  for (let i = 0; i < 46; i++) {
    const x = 648 + (i % 8) * 18 + Math.sin(i * 7.1) * 5;
    const z = Z0 - 50 + Math.floor(i / 8) * 22 + Math.cos(i * 3.3) * 6;
    const hgt = 25 + ((i * 37) % 70);
    const w = 8 + (i % 3) * 3;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, hgt, w), matCitta);
    b.position.set(x, hgt / 2 - 5, z);
    m.scene.add(b);
  }

  // pioggia: linee che cadono oltre il parapetto
  const N = 2600;
  const pos = new Float32Array(N * 6);
  for (let i = 0; i < N; i++) {
    const x = X1 + 0.8 + Math.random() * 30, y = Math.random() * 40, z = Z0 - 20 + Math.random() * 60;
    pos.set([x, y, z, x - 0.02, y + 0.45, z], i * 6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pioggia = new THREE.LineSegments(geo, new THREE.ShaderMaterial({
    uniforms: { uTempo: { value: 0 }, uBase: { value: Y0 - 18 } },
    vertexShader: 'uniform float uTempo; uniform float uBase; varying float vA; void main(){ vec3 p = position; p.y = uBase + mod(p.y - uTempo * 11.0, 40.0); vA = 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
    fragmentShader: 'varying float vA; void main(){ gl_FragColor = vec4(0.78, 0.84, 0.9, 0.35); }',
    transparent: true,
    depthWrite: false,
  }));
  pioggia.frustumCulled = false;
  m.scene.add(pioggia);
  m.ogniFrame((dt, t) => { pioggia.material.uniforms.uTempo.value = t; });

  // in fondo: la porta della stanza di oakvx
  m.tondo(X0 + 0.7, Y0, Z0, X0 + 1.9, Y0 + 2.2, Z0 + 0.06, new THREE.MeshLambertMaterial({ color: 0xeef2f4 }), { r: 0.02, solido: false });
  m.luce(X0 + 1.3, Y0 + 2.4, Z0 + 0.8, 1.4, 4, 0xf2f7ff);
  m.zona('casa', X0, Y0 - 1, Z0, X1, Y0 + 3, Z0 + 1.0, { ripeti: true });
  g.su('casa', () => g.teletrasporta(904, 0, 1.5, Math.PI));
  cartelloStanza(m, g, X0 + 0.04, Y0 + 2.4, -10, Math.PI / 2, 2499);
  g.puntoControllo('ballatoio', 601.3, Y0, 9, 0);
  return { debug: { risolvi: () => { g.giocatore().pos.set(601.3, Y0 + 0.86, Z0 + 2); g.giocatore().vel.set(0, 0, 0); } } };
}
