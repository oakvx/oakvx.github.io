// synk: prenotazioni per un salone, con WhatsApp e Google Calendar. Il pavimento è la
// giornata (9–18). Tre richieste arrivano come cubi su fumetti verdi; posarne uno sul
// calendario lo prenota. Due prenotazioni che si sovrappongono non possono esistere (vincolo
// di esclusione): il cubo viene respinto e la "saga di compensazione" lo rimette a posto.
// A calendario pieno la parete di Google Calendar si sincronizza riga per riga (outbox).
import * as THREE from 'three';
import { canvasTex } from '../engine/materiali.js';
import { stanzaProgetto } from '../engine/varchi.js';
import { creaCalendario } from '../logica/calendario.js';
import { creaOggetti } from '../engine/oggetti.js';

const X0 = -140, X1 = -115, Z0 = -60, Z1 = -40, H = 4.5;
const GX0 = -135, ORA = 1.6, INIZIO = 9, FINE = 18;
const RIGA = { z0: -52, z1: -48 };
const OCCUPATO = [[9, 11], [13, 14], [16.5, 18]];
const RICHIESTE = [['taglio', 1, -133], ['colore', 2, -127.5], ['piega', 1, -122]];
const xDi = (ora) => GX0 + (ora - INIZIO) * ORA;

export function costruisci(m, g) {
  const mat = m.mat;
  const T = () => g.T().stanze.synk;
  stanzaProgetto(m, g, {
    id: 'synk', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H,
    luci: [[-127.5, -44, 0.6, 1.8], [-127.5, -54, 0.6, 1.8]], intensita: 2.8,
    letto: 'notifiche', passi: 'piastrelle', materiali: { pavimento: mat.piastrelle },
    atmosfera: { nebbia: 0x223029, vicino: 4, lontano: 28, cielo: 0xdcefe4, terra: 0x2c3a33, intensita: 2.3 },
  });

  // la giornata sul pavimento
  const giornata = g.texTesto(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f2f5f3'; ctx.fillRect(0, 0, w, h);
    const px = w / (FINE - INIZIO);
    ctx.fillStyle = '#c9d3cd';
    for (let o = 0; o <= FINE - INIZIO; o += 0.5) ctx.fillRect(o * px - (o % 1 ? 1 : 2), 0, o % 1 ? 2 : 4, h);
    ctx.fillStyle = '#5b6b62'; ctx.font = '700 28px Archivo, sans-serif';
    for (let o = 0; o < FINE - INIZIO; o++) ctx.fillText(`${INIZIO + o}:00`, o * px + 8, 34);
    ctx.fillStyle = '#7b847f';
    for (const [a, b] of OCCUPATO) {
      ctx.fillRect((a - INIZIO) * px + 4, 60, (b - a) * px - 8, h - 80);
    }
    ctx.fillStyle = '#eef2ef'; ctx.font = '600 26px Archivo, sans-serif';
    for (const [a] of OCCUPATO) ctx.fillText(T().occupato, (a - INIZIO) * px + 14, 150);
  });
  giornata.ridisegna();
  g.suLingua(() => giornata.ridisegna());
  const piano = new THREE.Mesh(new THREE.PlaneGeometry((FINE - INIZIO) * ORA, RIGA.z1 - RIGA.z0), new THREE.MeshLambertMaterial({ map: giornata }));
  piano.rotation.x = -Math.PI / 2;
  piano.position.set(xDi((INIZIO + FINE) / 2), 0.01, (RIGA.z0 + RIGA.z1) / 2);
  m.scene.add(piano);

  // richieste: fumetti verdi con un cubo sopra
  const calendario = creaCalendario({ inizio: INIZIO, fine: FINE, richieste: RICHIESTE.map((r) => r[0]) });
  OCCUPATO.forEach(([a, b], i) => calendario.prenota('occupato-' + i, a, b));
  const cubi = {};
  for (const [id, durata, x] of RICHIESTE) {
    m.box(x - 0.45, 0, -43.4, x + 0.45, 0.9, -42.5, new THREE.MeshLambertMaterial({ color: 0x2fae66 }));
    const tex = canvasTex(128, 128, (ctx, w, h) => {
      ctx.fillStyle = '#e9f7ee'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2fae66'; ctx.fillRect(0, 0, w, 10);
      ctx.fillStyle = '#16301f'; ctx.font = '700 20px Archivo, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(g.T().stanze.synk.richieste[id], w / 2, 62);
      ctx.font = '500 18px Archivo, sans-serif'; ctx.fillText(`${durata} h`, w / 2, 92);
    });
    const c = g.cubo(x, 1.2, -42.95, { materiale: new THREE.MeshLambertMaterial({ map: tex }) });
    cubi[id] = { corpo: c, durata, casa: [x, 1.2, -42.95], da: null, rifiuto: 0 };
    g.arredi.porta(x, 0, -42.3, Math.PI, () => `${T().richieste[id]} · ${durata} h`, { w: 0.9, h: 1.6 });
  }

  // parete di Google Calendar: si riempie riga per riga quando il calendario è pieno
  const parete = g.texTesto(1024, 512, (ctx, w, h, righe) => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#3c4043'; ctx.font = '700 40px Archivo, sans-serif'; ctx.fillText(T().calendario, 40, 70);
    ctx.font = '500 30px Archivo, sans-serif';
    (righe || []).forEach((r, i) => {
      ctx.fillStyle = '#e8f0fe'; ctx.fillRect(40, 110 + i * 90, w - 80, 70);
      ctx.fillStyle = '#1967d2'; ctx.fillRect(40, 110 + i * 90, 10, 70);
      ctx.fillStyle = '#1f2a37'; ctx.fillText(r, 70, 156 + i * 90);
    });
    if (!(righe || []).length) { ctx.fillStyle = '#80868b'; ctx.fillText(T().vuoto, 40, 140); }
  });
  parete.ridisegna([]);
  const muro = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshBasicMaterial({ map: parete }));
  muro.position.set(-127.5, 2.2, Z0 + 0.04);
  m.scene.add(muro);
  const saga = g.texTesto(512, 96, (ctx, w, h) => {
    ctx.fillStyle = '#7d1f1a'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffe9e6'; ctx.font = '700 34px monospace'; ctx.textAlign = 'center'; ctx.fillText(T().saga, w / 2, 60);
  });
  saga.ridisegna();
  const cartelloSaga = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.56), new THREE.MeshBasicMaterial({ map: saga }));
  cartelloSaga.position.set(-127.5, 3.9, Z0 + 0.05);
  cartelloSaga.visible = false;
  m.scene.add(cartelloSaga);

  g.arredi.didascalia(X0 + 0.03, 1.6, -45, Math.PI / 2, () => T().testi.synk, { w: 1.7, h: 1.05 });
  g.arredi.didascalia(X1 - 0.03, 1.6, -45, -Math.PI / 2, () => T().testi.tecnica, { w: 1.7, h: 1.05 });
  g.arredi.cartello(-127.5, 3.4, Z1 - 0.03, Math.PI, '06', () => T().cartello);

  // oggetti scansionati
  const oggetti = creaOggetti(m, g);
  oggetti.metti('potted_plant_02', -139.2, 0, -41, 0, { altezza: 1.1 });
  oggetti.metti('side_table_01', -116, 0, -41.2, 0, { altezza: 0.55 });
  const aiuti = g.aiuti('synk');
  const esiti = {};
  let tempo = 0, sincronizza = -1, fatto = false, soluzione = false;
  const ore = (x, durata) => Math.round(((x - GX0) / ORA + INIZIO - durata / 2) * 2) / 2;
  m.ogniFrame((dt) => {
    tempo += dt;
    for (const [id, c] of Object.entries(cubi)) {
      const p = c.corpo.pos;
      const nellaRiga = p.z > RIGA.z0 && p.z < RIGA.z1 && p.x > GX0 - 0.5 && p.x < xDi(FINE) + 0.5 && p.y < 0.6;
      const fermo = !c.corpo.tenuto && c.corpo.vel.length() < 0.4;
      if (c.rifiuto && tempo > c.rifiuto) {
        c.rifiuto = 0;
        p.set(...c.casa);
        c.corpo.vel.set(0, 0, 0);
        cartelloSaga.visible = false;
        continue;
      }
      if (!nellaRiga || c.corpo.tenuto) {
        if (c.da !== null) { calendario.libera(id); c.da = null; }
        continue;
      }
      if (!fermo || c.rifiuto) continue;
      const da = ore(p.x, c.durata);
      if (c.da === da) continue;
      const esito = calendario.prenota(id, da, da + c.durata);
      esiti[id] = esito;
      if (esito === 'ok') {
        c.da = da;
        p.x = xDi(da + c.durata / 2);
        g.suoni.notifica();
        aiuti.progresso();
      } else {
        c.da = null;
        c.rifiuto = tempo + 0.9;
        c.corpo.vel.set(0, 3, 4);
        cartelloSaga.visible = true;
        g.suoni.errore();
        g.emetti('synk:conflitto');
      }
    }
    if (!fatto && sincronizza < 0 && calendario.pieno()) sincronizza = tempo;
    if (sincronizza >= 0 && !fatto) {
      const righe = Object.entries(cubi).filter(([, c]) => c.da !== null).sort((a, b) => a[1].da - b[1].da)
        .map(([id, c]) => `${String(c.da | 0).padStart(2, '0')}:${c.da % 1 ? '30' : '00'} · ${T().richieste[id]}`);
      const n = Math.min(righe.length, Math.floor((tempo - sincronizza) / 0.5) + 1);
      parete.ridisegna(righe.slice(0, n));
      if (!calendario.pieno()) { sincronizza = -1; parete.ridisegna([]); }
      else if (n >= righe.length && tempo - sincronizza > 1.6) {
        fatto = true;
        aiuti.risolto();
        g.lampada('synk');
      }
    }
  });
  g.su('aiuto:soluzione:synk', () => {
    soluzione = true;
    parete.ridisegna([T().soluzione]);
  });

  return {
    debug: {
      posa: (id, ora) => {
        const c = cubi[id];
        if (c.corpo.tenuto) return;
        c.corpo.pos.set(xDi(ora), 0.3, (RIGA.z0 + RIGA.z1) / 2);
        c.corpo.vel.set(0, 0, 0);
      },
      risolvi: () => { fatto = true; aiuti.risolto(); g.lampada('synk'); },
      stato: () => ({ modelli: oggetti.quanti(), esiti: { ...esiti }, prenotati: Object.keys(cubi).filter((id) => cubi[id].da !== null), inRientro: Object.keys(cubi).filter((id) => cubi[id].rifiuto), fatto, soluzione }),
    },
  };
}
