// La scrivania: "Cosa so fare". Un ufficio di notte, un monitor a tubo catodico con portfolio.sh.
// Ci si siede (E) e si scrive davvero: help, skills, principi, percorso, contatti, git log.
// Il comando "apri" apre la porta verso il muro dei commit. Esc (o "exit") per alzarsi.
import * as THREE from 'three';
import { esegui } from '../logica/terminale.js';

const X0 = 200, X1 = 212, Z0 = 0, Z1 = 12, H = 3.5;
const PORTA = [206, 0, Z1];
const AREE = ['web', 'backend', 'dati', 'reverse', 'sistemi'];

export function costruisci(m, g) {
  const mat = m.mat;
  const T = () => g.T().stanze.scrivania;
  m.stanza({
    nome: 'scrivania', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H, ala: 'strumenti', passi: 'moquette',
    pareti: { s: { aperture: [{ a: PORTA[0] - 0.65, b: PORTA[0] + 0.65, y0: 0, y1: 2.3 }] } },
    materiali: { pavimento: mat.moquette },
    luci: [[206, 4, 0.5, 1.2]], intensita: 1.8, raggio: 8, coloreLuce: 0xffe2b8,
    atmosfera: { nebbia: 0x15130f, vicino: 3, lontano: 20, cielo: 0xd8c8a8, terra: 0x24201a, intensita: 1.6 },
  });
  // la porta in fondo (chiusa finché non si scrive "apri")
  const anta = m.box(PORTA[0] - 0.65, 0, Z1, PORTA[0] + 0.65, 2.3, Z1 + 0.3, mat.legnoScuro);
  m.box(PORTA[0] - 0.8, 0, Z1 + 0.3, PORTA[0] + 0.8, 2.6, Z1 + 0.5, mat.scuro);
  g.arredi.porta(PORTA[0], 0, Z1 - 0.06, Math.PI, () => T().porta);
  m.zona('uscita-scrivania', PORTA[0] - 0.65, -1, Z1 - 0.2, PORTA[0] + 0.65, 3, Z1 + 0.3, { ripeti: true });
  g.su('uscita-scrivania', () => g.teletrasporta(240, 0, 1.5, Math.PI));

  // scrivania e monitor CRT
  m.box(204, 0, 7.6, 208, 0.78, 8.6, mat.legnoScuro);
  m.box(205.3, 0.78, 7.9, 206.7, 1.78, 8.55, new THREE.MeshLambertMaterial({ color: 0xcfc6b2 }));
  let righe = [];
  let riga = '';
  const schermo = g.texTesto(640, 480, (ctx, w, h) => {
    ctx.fillStyle = '#0b120c'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#8dff9e'; ctx.font = '17px monospace';
    const tutte = [...righe, `oakvx@notte:~$ ${riga}${Math.floor(performance.now() / 500) % 2 ? '█' : ' '}`];
    tutte.slice(-21).forEach((r, i) => ctx.fillText(r.slice(0, 64), 14, 28 + i * 21.5));
    for (let y = 0; y < h; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, y, w, 2); }
  });
  const monitor = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.86), new THREE.MeshBasicMaterial({ map: schermo }));
  monitor.position.set(206, 1.28, 7.88);
  monitor.rotation.y = Math.PI;
  m.scene.add(monitor);
  g.interattivo(monitor, 'terminale');

  const dati = () => {
    const t = T();
    return { strumenti: t.strumenti, principi: t.principi, percorso: t.percorso, contatti: t.contatti, chi: t.chi, log: t.log };
  };
  let attivo = false, aperta = false, soluzione = false;
  const aiuti = g.aiuti('scrivania');
  const apri = () => {
    if (aperta) return;
    aperta = true;
    anta.attivo = false;
    anta.mesh.visible = false;
    g.suoni.porta(true);
    aiuti.risolto();
  };
  const chiudi = () => { attivo = false; g.modoTesto(false); };
  g.su('oggetto:terminale', () => {
    if (attivo) return;
    attivo = true;
    if (!righe.length) righe = [...T().benvenuto];
    aiuti.progresso();
    g.modoTesto(true, (e) => {
      if (e.code === 'Escape' || e.code === 'Tab') { chiudi(); return; }
      if (e.code === 'Enter') {
        const r = esegui(riga, { lingua: g.lingua(), dati: dati() });
        righe.push(`oakvx@notte:~$ ${riga}`, ...r.righe);
        riga = '';
        g.suoni.presa();
        if (r.azione === 'pulisci') righe = [];
        if (r.azione === 'apri') apri();
        if (r.azione === 'segreto') g.segreto('comando');
        if (r.azione === 'esci') chiudi();
        return;
      }
      if (e.code === 'Backspace') { riga = riga.slice(0, -1); return; }
      if (e.key && e.key.length === 1 && riga.length < 48) { riga += e.key; g.suoni.nota?.(1200, 0, 0.02, 'square', 0.01); }
    });
  });
  let passo = -1;
  m.ogniFrame((dt, t) => {
    const p = Math.floor(t * 8);
    if (p !== passo) { passo = p; schermo.ridisegna(); }
    if (attivo && Math.hypot(g.giocatore().pos.x - 206, g.giocatore().pos.z - 7) > 3) chiudi();
  });

  // il post-it della soluzione
  const postit = g.texTesto(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#f7e36b'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#3a3410'; ctx.font = '700 34px monospace'; ctx.textAlign = 'center'; ctx.fillText('apri', w / 2, 76);
  });
  postit.ridisegna();
  const foglietto = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ map: postit }));
  foglietto.position.set(206.75, 1.6, 7.86);
  foglietto.rotation.y = Math.PI;
  foglietto.visible = false;
  m.scene.add(foglietto);
  g.su('aiuto:soluzione:scrivania', () => { soluzione = true; foglietto.visible = true; });

  // gli strumenti, area per area, sulle pareti
  AREE.forEach((k, i) => {
    const sulMuroOvest = i < 3;
    g.arredi.didascalia(sulMuroOvest ? X0 + 0.03 : X1 - 0.03, 1.6, sulMuroOvest ? 3 + i * 3 : 4 + (i - 3) * 4, sulMuroOvest ? Math.PI / 2 : -Math.PI / 2,
      () => T().aree[k], { w: 1.4, h: 0.8 });
  });
  g.arredi.cartello(206, 2.9, Z0 + 0.03, 0, '10', () => T().cartello);
  g.puntoControllo('scrivania', 206, 0, 1.5, Math.PI);

  return {
    debug: {
      uscita: [PORTA[0], Z1 - 0.3],
      risolvi: () => apri(),
      stato: () => ({ terminale: attivo, righe: [...righe], aperta, soluzione }),
    },
  };
}
