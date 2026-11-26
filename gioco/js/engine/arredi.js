// Arredi da mostra: didascalie, colonnine con cordone, cartelli di sala, griglie.
import * as THREE from 'three';
import { geoTonda } from './mondo.js';
import { texTesto } from './materiali.js';

function testoAcapo(ctx, testo, x, y, larghezza, passo) {
  let riga = '';
  for (const p of testo.split(' ')) {
    const prova = riga ? riga + ' ' + p : p;
    if (ctx.measureText(prova).width > larghezza && riga) { ctx.fillText(riga, x, y); riga = p; y += passo; } else riga = prova;
  }
  ctx.fillText(riga, x, y);
  return y;
}

export function creaArredi(m, g) {
  const mat = m.mat;

  // didascalia: targhetta arrotondata con titolo e testo; testi() → [titolo, sottotitolo, testo]
  function didascalia(x, y, z, ry, testi, { su = 'muro', w = 0.5, h = 0.3 } = {}) {
    const gruppo = new THREE.Group();
    gruppo.position.set(x, y, z);
    gruppo.rotation.y = ry;
    const tex = texTesto(512, Math.round(512 * h / w), (ctx, cw, ch) => {
      const [titolo, sotto, corpo] = testi();
      ctx.fillStyle = '#fbfcfc';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#2f6f86';
      ctx.fillRect(28, 30, 36, 5);
      ctx.fillStyle = '#1d252b';
      ctx.font = '750 40px Archivo, sans-serif';
      ctx.fillText(titolo, 28, 82);
      ctx.fillStyle = '#6b7880';
      ctx.font = '500 22px Archivo, sans-serif';
      ctx.fillText(sotto, 28, 116);
      ctx.fillStyle = '#3c4950';
      ctx.font = '400 22px Archivo, sans-serif';
      if (corpo) testoAcapo(ctx, corpo, 28, 158, cw - 56, 30);
    });
    tex.ridisegna();
    g.suLingua(() => tex.ridisegna());
    const base = new THREE.Mesh(geoTonda(w + 0.04, h + 0.04, 0.025, 0.012), mat.cornice);
    const faccia = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex }));
    faccia.position.z = 0.0135;
    gruppo.add(base, faccia);
    if (su === 'leggio') {
      // leggio inclinato su un'asta
      const testa = new THREE.Group();
      testa.add(base, faccia);
      testa.rotation.x = -0.6;
      testa.position.y = 1.0;
      const asta = new THREE.Mesh(geoTonda(0.05, 1.0, 0.05, 0.02), mat.scuro);
      asta.position.y = 0.5;
      const piede = new THREE.Mesh(geoTonda(0.28, 0.025, 0.2, 0.012), mat.scuro);
      piede.position.y = 0.0125;
      gruppo.add(testa, asta, piede);
      m.ombra(x, 0, z, 0.5, 0.4);
    }
    m.scene.add(gruppo);
    return gruppo;
  }

  // colonnine con cordone intorno a un rettangolo
  function recinto(x0, z0, x1, z1, y0 = 0) {
    const pali = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
    const geoPalo = new THREE.CylinderGeometry(0.025, 0.025, 0.9, 12);
    const geoBase = new THREE.CylinderGeometry(0.13, 0.15, 0.04, 20);
    const geoPomo = new THREE.SphereGeometry(0.045, 16, 10);
    for (const [px, pz] of pali) {
      const palo = new THREE.Mesh(geoPalo, mat.ottone);
      palo.position.set(px, y0 + 0.47, pz);
      const base = new THREE.Mesh(geoBase, mat.ottone);
      base.position.set(px, y0 + 0.02, pz);
      const pomo = new THREE.Mesh(geoPomo, mat.ottone);
      pomo.position.set(px, y0 + 0.94, pz);
      m.scene.add(palo, base, pomo);
      m.ombra(px, y0, pz, 0.4, 0.4);
    }
    for (let i = 0; i < 4; i++) {
      const [ax, az] = pali[i];
      const [bx, bz] = pali[(i + 1) % 4];
      const curva = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(ax, y0 + 0.86, az),
        new THREE.Vector3((ax + bx) / 2, y0 + 0.62, (az + bz) / 2),
        new THREE.Vector3(bx, y0 + 0.86, bz),
      );
      m.scene.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 24, 0.018, 8, false), mat.cordone));
    }
    // il recinto blocca il passaggio (non si scavalca con un salto)
    m.box(x0 - 0.03, y0, z0 - 0.03, x1 + 0.03, y0 + 1.4, z1 + 0.03, mat.chiaro).mesh.visible = false;
  }

  // cartello di sala sopra una porta: numero e nome
  function cartello(x, y, z, ry, numero, nome) {
    const tex = texTesto(512, 128, (ctx, w, h) => {
      ctx.fillStyle = '#1f282e';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#39c6d9';
      ctx.fillRect(0, 0, 10, h);
      ctx.fillStyle = '#f2f6f8';
      ctx.font = '750 64px Archivo, sans-serif';
      ctx.fillText(numero, 34, 86);
      ctx.fillStyle = '#a9b7bf';
      ctx.font = '500 34px Archivo, sans-serif';
      ctx.fillText(nome(), 150, 80);
    });
    tex.ridisegna();
    g.suLingua(() => tex.ridisegna());
    const gruppo = new THREE.Group();
    const base = new THREE.Mesh(geoTonda(0.82, 0.22, 0.03, 0.02), mat.scuro);
    const faccia = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.19), new THREE.MeshBasicMaterial({ map: tex }));
    faccia.position.z = 0.016;
    gruppo.add(base, faccia);
    gruppo.position.set(x, y, z);
    gruppo.rotation.y = ry;
    m.scene.add(gruppo);
  }

  // griglia di aerazione
  const texGriglia = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#e4eaed';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#9fadb5';
    for (let y = 14; y < 120; y += 14) ctx.fillRect(12, y, 104, 6);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const matGriglia = new THREE.MeshLambertMaterial({ map: texGriglia });
  function griglia(x, y, z, ry, w = 0.6, h = 0.3) {
    const gr = new THREE.Group();
    const cornice = new THREE.Mesh(geoTonda(w + 0.06, h + 0.06, 0.03, 0.015), mat.cornice);
    const faccia = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matGriglia);
    faccia.position.z = 0.016;
    gr.add(cornice, faccia);
    gr.position.set(x, y, z);
    gr.rotation.y = ry;
    m.scene.add(gr);
  }

  return { didascalia, recinto, cartello, griglia };
}
