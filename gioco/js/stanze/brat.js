// Brat Animator: il primo progetto di oakvx. La stanza è un desktop gigante con finestre
// dai bordi di vetro (ispirate a un desktop di fine anni 2000, senza loghi). Un fossato la
// taglia in due: il ponte è fatto delle parole del testo, che compaiono a tempo di musica
// come in una lyric video e poi spariscono. Una leva ferma la timeline (un'altra riavvolge):
// con il testo intero fermo, il ponte regge. In fondo, una cornice alta: ci si arriva con le finestre.
import * as THREE from 'three';
import { canvasTex } from '../engine/materiali.js';
import { stanzaProgetto } from '../engine/varchi.js';
import { parolaAttiva, creaTimeline } from '../logica/brat.js';
import { creaOggetti } from '../engine/oggetti.js';

const X0 = -140, X1 = -110, Z0 = -20, Z1 = 10, H = 10;
const FOSSO = { z0: -6, z1: -2 };
const PONTE_X = [-126, -124];
const CORNICE = { x0: -132, x1: -118, z0: Z0, z1: Z0 + 3, y: 6 };

export function costruisci(m, g) {
  const mat = m.mat;
  const T = () => g.T().stanze.brat;
  const sfondo = canvasTex(512, 512, (ctx, w, h) => {
    const gr = ctx.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#0d4f8c'); gr.addColorStop(0.6, '#1f7fc4'); gr.addColorStop(1, '#3fa6d8');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 18;
    for (let i = -2; i < 6; i++) { ctx.beginPath(); ctx.moveTo(i * 120, h); ctx.bezierCurveTo(i * 120 + 160, h * 0.55, i * 120 + 60, h * 0.3, i * 120 + 320, 0); ctx.stroke(); }
  });
  const desktop = new THREE.MeshLambertMaterial({ map: sfondo });
  stanzaProgetto(m, g, {
    id: 'brat', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H, pavimento: false,
    pareti: {
      w: { pannelli: [{ id: 'brat-basso', a: -16, b: -10, y0: 0, y1: 3 }] },
      n: { pannelli: [{ id: 'brat-alto', a: -121.5, b: -118.3, y0: CORNICE.y, y1: CORNICE.y + 2.6 }] },
    },
    materiali: { muro: desktop },
    luci: [[-125, 4, 1, 1.6], [-125, -12, 1, 1.6]], intensita: 3.6, raggio: 18,
    letto: 'battito', passi: 'piastrelle',
    atmosfera: { nebbia: 0x123a5e, vicino: 8, lontano: 48, cielo: 0xd8eefb, terra: 0x245276, intensita: 3.2 },
  });

  // pavimento ai due lati del fossato, e la cornice alta in fondo
  const pav = new THREE.MeshLambertMaterial({ color: 0x1b4f7a });
  m.box(X0 - 0.3, -0.3, FOSSO.z1, X1 + 0.3, 0, Z1 + 0.3, pav);
  m.box(X0 - 0.3, -0.3, Z0 - 0.3, X1 + 0.3, 0, FOSSO.z0, pav);
  m.box(X0, -12.3, FOSSO.z0, X1, -12, FOSSO.z1, mat.scuro);
  m.box(CORNICE.x0, CORNICE.y - 0.3, CORNICE.z0, CORNICE.x1, CORNICE.y, CORNICE.z1, mat.metallo);
  // barra delle applicazioni lungo la parete nord
  m.box(X0, 0, Z0, X1, 0.8, Z0 + 0.2, new THREE.MeshLambertMaterial({ color: 0x1a2a3a, transparent: true, opacity: 0.85 }), { solido: false });
  const orb = new THREE.Mesh(new THREE.CircleGeometry(0.32, 20), new THREE.MeshBasicMaterial({ color: 0x5cc4ff }));
  orb.position.set(X0 + 0.8, 0.4, Z0 + 0.21);
  m.scene.add(orb);

  // finestre del desktop: cornici traslucide attorno ai pannelli e alle didascalie
  const vetro = new THREE.MeshLambertMaterial({ color: 0x9fd6f2, transparent: true, opacity: 0.45, depthWrite: false });
  const finestra = (cx, cy, cz, w, h, ry) => {
    const gr = new THREE.Group();
    for (const [px, py, sx, sy] of [[0, h / 2 + 0.18, w + 0.36, 0.36], [0, -h / 2 - 0.05, w + 0.36, 0.1], [-w / 2 - 0.09, 0, 0.18, h], [w / 2 + 0.09, 0, 0.18, h]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, 0.04), vetro);
      b.position.set(px, py, 0);
      gr.add(b);
    }
    const x = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.05), new THREE.MeshBasicMaterial({ color: 0xc8463c }));
    x.position.set(w / 2 - 0.1, h / 2 + 0.18, 0.01);
    gr.add(x);
    gr.position.set(cx, cy, cz);
    gr.rotation.y = ry;
    m.scene.add(gr);
  };
  finestra(X0 + 0.04, 1.5, -13, 6, 3, Math.PI / 2);
  finestra(-119.9, CORNICE.y + 1.3, Z0 + 0.04, 3.2, 2.6, 0);
  finestra(-114, 3.2, Z0 + 0.04, 5, 2.4, 0);

  // il testo: parole che diventano piattaforme del ponte
  const lingua = () => g.lingua();
  const PAROLE = { it: ['testi', 'che', 'sono', 'suoni'], en: ['lyrics', 'that', 'are', 'sounds'] };
  const testo = [0, 1, 2, 3].map((i) => ({ da: i * 1.1, a: i === 3 ? 5.2 : (i + 1) * 1.1 }));
  const larghezza = (FOSSO.z1 - FOSSO.z0) / 4;
  const piattaforme = testo.map((_, i) => {
    const z1 = FOSSO.z1 - i * larghezza, z0 = z1 - larghezza;
    const tex = g.texTesto(256, 128, (ctx, w, h) => {
      ctx.fillStyle = '#f4f7fb'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#10161c'; ctx.font = '800 54px Archivo, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(PAROLE[lingua()][i], w / 2, 84);
    });
    tex.ridisegna();
    g.suLingua(() => tex.ridisegna());
    const s = m.box(PONTE_X[0], -0.25, z0 + 0.02, PONTE_X[1], 0, z1 - 0.02, new THREE.MeshLambertMaterial({ map: tex }));
    const fantasma = new THREE.Mesh(new THREE.BoxGeometry(PONTE_X[1] - PONTE_X[0], 0.25, larghezza - 0.04), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.25 }));
    fantasma.position.set((PONTE_X[0] + PONTE_X[1]) / 2, -0.125, (z0 + z1) / 2);
    m.scene.add(fantasma);
    return s;
  });
  // la parola cantata in grande sulla parete nord, come nell'anteprima dell'editor
  const anteprima = g.texTesto(1024, 256, (ctx, w, h, k) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(8,16,24,0.55)'; ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center'; ctx.font = '800 120px Archivo, sans-serif';
    ctx.fillStyle = '#ffffff';
    if (k >= 0) ctx.fillText(PAROLE[lingua()][k], w / 2, 170);
  });
  anteprima.ridisegna(-1);
  const schermo = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: anteprima, transparent: true }));
  schermo.position.set(-128, 3.4, Z0 + 0.05);
  m.scene.add(schermo);

  // leve: pausa/riparti e riavvolgi
  const timeline = creaTimeline();
  const leva = (x, colore, chiave) => {
    m.box(x - 0.2, 0, 4.6, x + 0.2, 1, 5, mat.cornice);
    const manico = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), new THREE.MeshLambertMaterial({ color: colore }));
    manico.position.set(x, 1.25, 4.8);
    m.scene.add(manico);
    g.interattivo(manico, chiave);
    return manico;
  };
  const levaPausa = leva(-123, 0x5cc4ff, 'brat-pausa');
  leva(-121.6, 0xd95bb3, 'brat-indietro');
  g.arredi.porta(-123, 0, 5.1, Math.PI, () => T().pausa, { w: 0.6, h: 1.4 });
  g.arredi.porta(-121.6, 0, 5.1, Math.PI, () => T().indietro, { w: 0.6, h: 1.4 });
  // oggetti scansionati
  const oggetti = creaOggetti(m, g);
  oggetti.metti('bar_chair_round_01', -119.5, 0, 4.2, 0.4, { altezza: 0.75 });
  const aiuti = g.aiuti('brat');
  g.su('oggetto:brat-pausa', () => {
    g.suoni.leva();
    if (timeline.fermo()) timeline.riparti(); else timeline.ferma();
    levaPausa.rotation.x = timeline.fermo() ? -0.5 : 0;
    aiuti.progresso();
  });
  g.su('oggetto:brat-indietro', () => { g.suoni.leva(); timeline.riavvolgi(1); aiuti.progresso(); });

  g.arredi.didascalia(X1 - 0.03, 1.6, 2, -Math.PI / 2, () => T().testi.brat, { w: 1.7, h: 1.05 });
  g.arredi.didascalia(-114, 3.2, Z0 + 0.03, 0, () => T().testi.tecnica, { w: 4.4, h: 1.9 });
  g.arredi.cartello(-125, 3.4, Z1 - 0.03, Math.PI, '05', () => T().cartello);

  // simulazione: tempo, parole, ponte, caduta nel fossato, arrivo sulla cornice
  let tempo = 0, parola = -1, solide = [], fatto = false, soluzione = false;
  const ciclo = testo[3].a;
  m.ogniFrame(() => {
    tempo = timeline.tempo(g.musica.tempo());
    const k = parolaAttiva(tempo, testo);
    const tc = tempo % ciclo;
    solide = testo.map((p, i) => (tc >= p.da ? i : -1)).filter((i) => i >= 0);
    piattaforme.forEach((s, i) => { const on = solide.includes(i); s.attivo = on; s.mesh.visible = on; });
    if (k !== parola) { parola = k; anteprima.ridisegna(k); }
    const io = g.giocatore().pos;
    if (io.y < -2 && io.z > FOSSO.z0 && io.z < FOSSO.z1 && io.x > X0 && io.x < X1 && !g.inViaggio) {
      g.inViaggio = true;
      g.emetti('caduta');
      g.teletrasporta(-125, 0, Z1 - 1.5, 0, () => { g.inViaggio = false; g.suoni.tonfo(); });
    }
    if (!fatto && io.y > CORNICE.y && io.z < CORNICE.z1 && io.x > CORNICE.x0 && io.x < CORNICE.x1) {
      fatto = true;
      aiuti.risolto();
      g.lampada('brat');
    }
  });
  g.su('aiuto:soluzione:brat', () => { soluzione = true; });

  return {
    debug: {
      ponte: [(PONTE_X[0] + PONTE_X[1]) / 2, FOSSO.z1 + 1, FOSSO.z0 - 1],
      risolvi: () => { fatto = true; aiuti.risolto(); g.lampada('brat'); },
      stato: () => ({ modelli: oggetti.quanti(), tempo, parola, solide: [...solide], fermo: timeline.fermo(), fatto, soluzione }),
    },
  };
}
