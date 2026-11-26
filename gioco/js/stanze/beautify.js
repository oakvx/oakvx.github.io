// Beautify: il progetto di maturità, un gestionale per più saloni con dati separati e un
// controllo di disponibilità condiviso. Dalla reception si vedono i tre saloni dietro le
// vetrine, identici e non comunicanti. L'appuntamento delle 15:00 è nel salone A, che è
// pieno: va portato sulla poltrona del salone libero, passando con le finestre.
import * as THREE from 'three';
import { canvasTex } from '../engine/materiali.js';
import { stanzaProgetto } from '../engine/varchi.js';
import { creaSaloni } from '../logica/saloni.js';

const X0 = -180, X1 = -150, Z0 = -40, Z1 = -10, H = 4;
const FRONTE = -16;
const SALONI = [['a', -180], ['b', -170], ['c', -160]];
const FASCIA = 2;

export function costruisci(m, g) {
  const mat = m.mat;
  const T = () => g.T().stanze.beautify;
  stanzaProgetto(m, g, {
    id: 'beautify', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H,
    pareti: {
      w: { pannelli: [{ id: 'beautify-reception', a: -15, b: -11.5, y0: 0, y1: 2.6 }, { id: 'beautify-a', a: -34, b: -22, y0: 0, y1: 2.6 }] },
      e: { pannelli: [{ id: 'beautify-reception-e', a: -15, b: -11.5, y0: 0, y1: 2.6 }, { id: 'beautify-c', a: -34, b: -22, y0: 0, y1: 2.6 }] },
    },
    luci: [[-165, -13, 1.2, 0.6], [-175, -28, 0.6, 1.4], [-165, -28, 0.6, 1.4], [-155, -28, 0.6, 1.4]], intensita: 2.6, raggio: 9,
    passi: 'piastrelle', materiali: { pavimento: mat.piastrelle },
    atmosfera: { nebbia: 0x2c2a30, vicino: 4, lontano: 26, cielo: 0xf1e6ee, terra: 0x3a3438, intensita: 2.3 },
  });
  // pareti tra i saloni e vetrine sulla reception
  m.box(-170.1, 0, Z0, -169.9, H, FRONTE, mat.intonacoA(0));
  m.box(-160.1, 0, Z0, -159.9, H, FRONTE, mat.intonacoA(0));
  const vetro = new THREE.MeshLambertMaterial({ color: 0xbfd7dc, transparent: true, opacity: 0.16, depthWrite: false });
  for (const [, x0] of SALONI) {
    m.box(x0, 0, FRONTE - 0.1, x0 + 1, H, FRONTE + 0.1, mat.intonacoA(0));
    m.box(x0 + 9, 0, FRONTE - 0.1, x0 + 10, H, FRONTE + 0.1, mat.intonacoA(0));
    m.box(x0 + 1, 2.8, FRONTE - 0.1, x0 + 9, H, FRONTE + 0.1, mat.intonacoA(0));
    const v = m.box(x0 + 1, 0, FRONTE - 0.06, x0 + 9, 2.8, FRONTE + 0.06, vetro);
    v.mesh.userData.vetro = true;
  }

  // arredi identici, tre copie indipendenti: poltrona, specchio, lavabo
  const pelle = new THREE.MeshLambertMaterial({ color: 0x8e3b52 });
  const specchio = new THREE.MeshLambertMaterial({ color: 0xcfe3ea, emissive: 0x223338 });
  const poltrone = {};
  for (const [id, x0] of SALONI) {
    const cx = x0 + 5;
    m.box(cx - 0.4, 0, -26.4, cx + 0.4, 0.5, -25.6, pelle);
    m.box(cx - 0.4, 0.5, -26.5, cx + 0.4, 1.3, -26.3, pelle);
    m.box(cx - 0.7, 1.1, Z0 + 0.02, cx + 0.7, 2.3, Z0 + 0.06, specchio, { solido: false });
    m.box(cx + 2, 0, Z0, cx + 3, 0.9, Z0 + 0.6, mat.chiaro);
    poltrone[id] = [cx, 0.5, -26];
    g.arredi.cartello(cx, 3.2, FRONTE + 0.13, Math.PI, id.toUpperCase(), () => T().salone);
  }

  // l'appuntamento (cubo) sulla poltrona di A
  const tex = canvasTex(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#f7eef2'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#8e3b52'; ctx.fillRect(0, 0, w, 10);
    ctx.fillStyle = '#2a1820'; ctx.font = '700 26px Archivo, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('15:00', w / 2, 70);
  });
  const appuntamento = g.cubo(poltrone.a[0], 0.8, poltrone.a[2], { materiale: new THREE.MeshLambertMaterial({ map: tex }) });

  // tabellone della disponibilità condivisa, alla reception
  const saloni = creaSaloni(SALONI.map((s) => s[0]), 4);
  saloni.occupa('a', FASCIA);
  saloni.occupa('b', FASCIA);
  const tabellone = g.texTesto(768, 384, (ctx, w, h) => {
    const t = T();
    ctx.fillStyle = '#211a1e'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f5e9ef'; ctx.font = '700 40px Archivo, sans-serif'; ctx.fillText(t.tabellone, 30, 64);
    ctx.font = '500 34px Archivo, sans-serif';
    SALONI.forEach(([id], i) => {
      const occ = saloni.stato(id)[FASCIA];
      ctx.fillStyle = occ ? '#d65b5b' : '#58c27d';
      ctx.fillRect(30, 110 + i * 80, 26, 26);
      ctx.fillStyle = '#f5e9ef';
      ctx.fillText(`${t.salone} ${id.toUpperCase()} · ${occ ? t.occupato : t.libero}`, 74, 134 + i * 80);
    });
  });
  tabellone.ridisegna();
  g.suLingua(() => tabellone.ridisegna());
  const pannelloT = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshBasicMaterial({ map: tabellone }));
  pannelloT.position.set(-174, 1.8, Z1 - 0.04);
  pannelloT.rotation.y = Math.PI;
  m.scene.add(pannelloT);

  g.arredi.didascalia(-157, 1.6, Z1 - 0.03, Math.PI, () => T().testi.beautify, { w: 1.7, h: 1.05 });
  g.arredi.cartello(-165, 3.2, Z1 - 0.03, Math.PI, '07', () => T().cartello);

  const aiuti = g.aiuti('beautify');
  let fatto = false, soluzione = false, presa = false;
  m.ogniFrame(() => {
    if (appuntamento.tenuto && !presa) { presa = true; aiuti.progresso(); }
    if (fatto || appuntamento.tenuto) return;
    const [cx, , cz] = poltrone.c;
    const p = appuntamento.pos;
    if (Math.abs(p.x - cx) < 0.5 && Math.abs(p.z - cz) < 0.5 && p.y < 1.2 && appuntamento.vel.length() < 0.5) {
      fatto = true;
      saloni.occupa('c', FASCIA);
      tabellone.ridisegna();
      g.suoni.notifica();
      aiuti.risolto();
      g.lampada('beautify');
    }
  });
  g.su('aiuto:soluzione:beautify', () => { soluzione = true; });

  return {
    debug: {
      posti: { qui: [-172, -12], pannelloReception: [-180, 1.3, -13], pannelloA: [-180, 1.3, -28], poltronaC: poltrone.c },
      poggia: (x, y, z) => { if (appuntamento.tenuto) return; appuntamento.pos.set(x, y, z); appuntamento.vel.set(0, 0, 0); },
      risolvi: () => { fatto = true; aiuti.risolto(); g.lampada('beautify'); },
      stato: () => ({ disponibile: saloni.disponibile(FASCIA), fatto, soluzione }),
    },
  };
}
