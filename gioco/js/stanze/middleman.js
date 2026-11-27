// middleManPS4 · Reverse Engineering. "Evidence or it didn't happen": la stanza è al buio e
// si vede solo ciò che si illumina con la lampada delle prove (tasto F). Le etichette, una
// volta illuminate, restano. Anche i pannelli: solo quelli provati accettano le finestre.
// La nicchia d'uscita è in alto: ci si arriva con le finestre, e da lì si scende in cisterna.
import * as THREE from 'three';
import { illuminato } from '../logica/prove.js';
import { apertura, nicchia, collega } from '../engine/varchi.js';
import { creaOggetti } from '../engine/oggetti.js';

const X0 = 100, X1 = 120, Z0 = 0, Z1 = 20, H = 4.5;
const NICCHIA = { x0: 117, x1: X1, z0: 13, z1: Z1, y: 2 };
const USCITA = [118.5, 2, Z1, Math.PI];
const ETICHETTE = [
  ['elf', X0 + 0.03, 1.8, 5, Math.PI / 2], ['orbis', X0 + 0.03, 2.4, 12, Math.PI / 2], ['psf', X0 + 0.03, 1.2, 16, Math.PI / 2],
  ['nid', 106, 2.6, Z1 - 0.03, Math.PI], ['ghidra', 112, 1.6, Z1 - 0.03, Math.PI], ['rete', X1 - 0.03, 1.6, 6, -Math.PI / 2],
  ['console', 104, 3.2, Z1 - 0.03, Math.PI], ['lettura', X1 - 0.03, 1.2, 10, -Math.PI / 2],
];

export function costruisci(m, g) {
  const mat = m.mat;
  const T = () => g.T().stanze.middleman;
  m.stanza({
    nome: 'middleman', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H, ala: 'reverse', letto: 'rete', prove: true, passi: 'metallo',
    pareti: {
      w: { pannelli: [{ id: 'mm-basso', a: 7, b: 11, y0: 0, y1: 2.6 }, { id: 'mm-esca', a: 14, b: 18, y0: 0, y1: 2.6 }] },
      e: { pannelli: [{ id: 'mm-alto', a: NICCHIA.z0 + 1, b: NICCHIA.z1 - 1, y0: NICCHIA.y, y1: H }] },
      n: { aperture: [apertura(110)] },
      s: { aperture: [{ ...apertura(USCITA[0]), y0: USCITA[1], y1: USCITA[1] + 2.3 }] },
    },
    // al buio davvero: niente panorama HDR (ambiente), niente faro d'ombra, soffitto che non riflette luce finta
    materiali: { pavimento: mat.metallo, soffitto: mat.scuro },
    luciPunto: false,
    ombra: { pos: [110, H - 0.2, 10], bersaglio: [110, 0, 10], intensita: 0 },
    atmosfera: { nebbia: 0x020304, vicino: 1, lontano: 14, cielo: 0x1d262b, terra: 0x020304, intensita: 0.12, ambiente: 0.02 },
    suono: { ronzio: 0.2 },
  });
  for (const id of ['mm-basso', 'mm-esca', 'mm-alto']) m.pannelli.get(id).bloccato = true;
  // la nicchia alta
  m.box(NICCHIA.x0, 0, NICCHIA.z0, NICCHIA.x1, NICCHIA.y, NICCHIA.z1, mat.metallo);
  nicchia(m, [110, 0, Z0, 0]);
  nicchia(m, USCITA);
  // si arriva al muro d'ingresso della cisterna infinita (cella logica 0, 0: vedi stanze/cisterna.js)
  collega(g, 'middleman-cisterna', USCITA, [301, 0, 9, Math.PI / 2]);
  g.arredi.porta(USCITA[0], USCITA[1], Z1 - 0.06, Math.PI, null);

  // una sola luce, debole, sulla didascalia vicino all'ingresso
  m.luce(110, 3.6, 3, 1.4, 5, 0x9fb8c4);
  g.arredi.didascalia(X0 + 0.03, 1.5, 2.2, Math.PI / 2, () => T().testi.mm, { w: 1.5, h: 0.95 });
  g.arredi.cartello(110, 3.2, Z0 + 0.03, 0, '08', () => T().cartello);
  const motto = g.texTesto(1024, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#d6f5e6'; ctx.font = '700 64px monospace'; ctx.textAlign = 'center';
    ctx.fillText('EVIDENCE OR IT DIDN\'T HAPPEN', w / 2, 86);
  });
  motto.ridisegna();
  const scritta = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.75), new THREE.MeshBasicMaterial({ map: motto, transparent: true, opacity: 0, depthWrite: false }));
  scritta.position.set(110, 3.6, Z1 - 0.04);
  scritta.rotation.y = Math.PI;
  m.scene.add(scritta);

  // etichette nascoste
  const etichette = ETICHETTE.map(([k, x, y, z, ry]) => {
    const tex = g.texTesto(512, 128, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#7dffb8'; ctx.lineWidth = 4; ctx.strokeRect(4, 4, w - 8, h - 8);
      ctx.fillStyle = '#7dffb8'; ctx.font = '700 40px monospace'; ctx.fillText(T().etichette[k], 24, 78);
    });
    tex.ridisegna();
    g.suLingua(() => tex.ridisegna());
    const e = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false }));
    e.position.set(x, y, z);
    e.rotation.y = ry;
    m.scene.add(e);
    return { k, mesh: e, provata: false };
  });
  etichette.push({ k: 'motto', mesh: scritta, provata: false });

  // lampada delle prove: un cono di luce legato alla camera
  const cono = new THREE.SpotLight(0xd9fff0, 0, 18, 0.38, 0.4, 1.2);
  m.scene.add(cono, cono.target);
  let accesa = false;
  g.su('lampada-prove', () => {
    accesa = !accesa;
    g.suoni.leva();
    aiuti.progresso();
  });

  const aiuti = g.aiuti('middleman');
  const provati = new Set();
  const centroPannello = (p) => (p.asse === 'x' ? [(p.a + p.b) / 2, (p.y0 + p.y1) / 2, p.faccia] : [p.faccia, (p.y0 + p.y1) / 2, (p.a + p.b) / 2]);
  let soluzione = false;
  m.ogniFrame(() => {
    const cam = g.camera;
    const dentro = g.giocatore().pos.x > X0 && g.giocatore().pos.x < X1 && g.giocatore().pos.z > Z0 && g.giocatore().pos.z < Z1;
    const on = accesa && dentro;
    cono.intensity = on ? 12 : 0;
    if (!on) return;
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    cono.position.copy(cam.position);
    cono.target.position.copy(cam.position).add(dir);
    const L = { pos: cam.position.toArray(), dir: dir.toArray(), angolo: 0.36, portata: 18 };
    for (const e of etichette) {
      if (!e.provata && illuminato(e.mesh.position.toArray(), L)) { e.provata = true; g.suoni.notifica(); }
      if (e.provata && e.mesh.material.opacity < 1) e.mesh.material.opacity = Math.min(1, e.mesh.material.opacity + 0.04);
    }
    for (const id of ['mm-basso', 'mm-esca', 'mm-alto']) {
      const p = m.pannelli.get(id);
      if (provati.has(id) || !illuminato(centroPannello(p), L)) continue;
      provati.add(id);
      if (id !== 'mm-esca') p.bloccato = false;
      aiuti.progresso();
    }
  });
  g.su('aiuto:soluzione:middleman', () => {
    soluzione = true;
    accesa = true;
    for (const id of ['mm-basso', 'mm-alto']) { provati.add(id); m.pannelli.get(id).bloccato = false; }
  });
  g.su('stanza:cisterna', () => aiuti.risolto());

  // un faro da cantiere spento e un quadro di rete: si vedono solo con la lampada
  const oggetti = creaOggetti(m, g);
  oggetti.metti('portable_searchlight', 104, 0, 2.6, 0.6, { altezza: 1.2 });
  oggetti.metti('utility_box_02', 100.4, 0, 12.5, Math.PI / 2, { altezza: 1.0 });
  g.puntoControllo('middleman', 110, 0, 1.5, Math.PI);
  return {
    debug: {
      posti: { qui: [108, 9], basso: [X0, 1.3, 9], alto: [X1, NICCHIA.y + 1.25, 16], entra: [101.6, 9, Math.PI / 2] },
      uscita: [118.5, 16],
      varchi: [{ id: 'middleman-cisterna', da: 'middleman', a: 'cisterna', lato: USCITA }],
      risolvi: () => { g.giocatore().pos.set(USCITA[0], NICCHIA.y + 0.9, Z1 - 1.5); g.giocatore().vel.set(0, 0, 0); },
      stato: () => ({ modelli: oggetti.quanti(), lampada: accesa, provati: [...provati], soluzione }),
    },
  };
}
