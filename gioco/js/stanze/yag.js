// YAG · Yet Another Gateway. Il visitatore è una richiesta: prende il cubo-chiave (la
// chiave client LAN), passa il varco di autenticazione, sceglie il modello posando il cubo
// su un piedistallo. La stessa porta d'uscita porta al backend scelto: serve il 2.
// Il varco ha anche i limiti operativi: chi lo attraversa troppe volte di fila resta fuori un secondo.
import * as THREE from 'three';
import { posa } from '../engine/passaggi.js';
import { stanzaProgetto, apertura, nicchia, collega } from '../engine/varchi.js';
import { instrada, creaLimitatore } from '../logica/yag.js';

const X0 = -100, X1 = -80, Z0 = -20, Z1 = 0, H = 4.5;
const VARCO = [-90, 0, -8];
const PIED = { a: [-95, 1, -14], b: [-85, 1, -14] };
const USCITA = [-90, 0, Z0, 0];
const BACKEND = { backend1: [-96, 0, 6, 0], backend2: [-84, 0, 6, 0] };
const CHIAVE = [-86, 1.2, -3];

export function costruisci(m, g) {
  const mat = m.mat;
  const T = () => g.T().stanze.yag;
  stanzaProgetto(m, g, {
    id: 'yag', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H,
    pareti: { n: { aperture: [apertura(USCITA[0])] } },
    luci: [[-90, -4, 0.6, 1.6], [-90, -14, 0.6, 1.6]], intensita: 2.6,
    materiali: { pavimento: mat.metallo },
    passi: 'metallo',
    atmosfera: { nebbia: 0x1e2629, vicino: 3, lontano: 26, cielo: 0xc9dde3, terra: 0x2a3236, intensita: 1.9 },
  });
  // backend: due stanze piccole oltre la porta
  for (const [nome, b] of Object.entries(BACKEND)) {
    m.stanza({
      nome: 'yag-' + nome, x0: b[0] - 4, x1: b[0] + 4, z0: 6, z1: 14, h: 3, ala: 'backend', passi: 'metallo',
      pareti: { n: { aperture: [apertura(b[0])] } },
      luci: [[b[0], 10, 0.5, 1.2]], intensita: 2.4, raggio: 8,
      atmosfera: 'eredita',
    });
    nicchia(m, b);
  }

  // parete del varco con l'apertura al centro
  m.box(X0, 0, VARCO[2] - 0.15, VARCO[0] - 1, H, VARCO[2] + 0.15, mat.intonacoA(0));
  m.box(VARCO[0] + 1, 0, VARCO[2] - 0.15, X1, H, VARCO[2] + 0.15, mat.intonacoA(0));
  m.box(VARCO[0] - 1, 2.6, VARCO[2] - 0.15, VARCO[0] + 1, H, VARCO[2] + 0.15, mat.intonacoA(0));
  g.arredi.porta(VARCO[0], 0, VARCO[2] + 0.16, 0, () => T().varco, { w: 2, h: 2.6 });
  const laser = new THREE.MeshBasicMaterial({ color: 0xff4a4a, transparent: true, opacity: 0.25, depthWrite: false });
  const barriera = m.box(VARCO[0] - 1, 0, VARCO[2] - 0.08, VARCO[0] + 1, 2.6, VARCO[2] + 0.08, laser);
  barriera.mesh.userData.vetro = true;

  // la chiave su un tavolino vicino all'ingresso
  m.box(CHIAVE[0] - 0.5, 0, CHIAVE[2] - 0.5, CHIAVE[0] + 0.5, 0.95, CHIAVE[2] + 0.5, mat.scuro);
  const chiave = g.cubo(CHIAVE[0], CHIAVE[1], CHIAVE[2]);
  g.arredi.didascalia(CHIAVE[0] + 0.9, 0, CHIAVE[2], -Math.PI / 2, () => T().testi.chiave, { su: 'leggio', w: 0.44, h: 0.28 });

  // piedistalli dei modelli
  for (const [k, p] of Object.entries(PIED)) {
    m.box(p[0] - 0.35, 0, p[2] - 0.35, p[0] + 0.35, p[1], p[2] + 0.35, mat.cornice);
    g.arredi.porta(p[0], 0, p[2] - 1.2, 0, () => T().modelli[k], { w: 0.9, h: 2.2 });
  }
  const evidenza = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), new THREE.MeshBasicMaterial({ color: 0x39c6d9, transparent: true, opacity: 0.3, depthWrite: false }));
  evidenza.position.set(PIED.b[0], PIED.b[1] + 0.23, PIED.b[2]);
  evidenza.visible = false;
  m.scene.add(evidenza);

  // porta d'uscita: il passaggio cambia meta secondo l'instradamento
  nicchia(m, USCITA);
  const anta = m.box(USCITA[0] - 0.65, 0, Z0 - 0.3, USCITA[0] + 0.65, 2.3, Z0 - 0.05, mat.metallo);
  collega(g, 'yag-uscita', USCITA, BACKEND.backend1);
  g.passaggi.attiva('yag-uscita', false);
  g.arredi.porta(USCITA[0], 0, Z0 + 0.06, 0, () => T().uscita);

  // testi del progetto
  g.arredi.didascalia(X0 + 0.02, 1.5, -4, Math.PI / 2, () => T().testi.yag, { w: 1.4, h: 0.9 });
  g.arredi.didascalia(X1 - 0.02, 1.5, -14, -Math.PI / 2, () => T().testi.avviso, { w: 1.1, h: 0.6 });
  g.arredi.didascalia(BACKEND.backend1[0], 1.4, 13.98, Math.PI, () => T().testi.flusso, { w: 2.2, h: 1.1 });
  g.arredi.didascalia(BACKEND.backend2[0], 1.4, 13.98, Math.PI, () => T().testi.risposta, { w: 1.6, h: 0.8 });
  g.arredi.cartello(-90, 3.4, Z1 - 0.03, Math.PI, '03', () => T().cartello);

  const aiuti = g.aiuti('yag');
  const limitatore = creaLimitatore({ max: 3, finestra: 2 });
  let autenticato = false;
  let piedistallo = null;
  let meta = 'negato';
  let chiusoFino = 0;
  let tempo = 0;
  let soluzione = false;

  const sulPiedistallo = () => {
    if (chiave.tenuto) return null;
    for (const [k, p] of Object.entries(PIED)) {
      if (Math.abs(chiave.pos.x - p[0]) < 0.38 && Math.abs(chiave.pos.z - p[2]) < 0.38 && chiave.pos.y < p[1] + 0.4 && chiave.pos.y > p[1]) return k;
    }
    return null;
  };

  let dentroVarco = false;
  m.ogniFrame((dt) => {
    tempo += dt;
    const io = g.giocatore().pos;
    const conChiave = g.tenuto() === chiave;
    // attraversamenti del varco: limiti operativi
    const nelVarco = Math.abs(io.x - VARCO[0]) < 1 && Math.abs(io.z - VARCO[2]) < 0.6 && io.y < 3;
    if (nelVarco && !dentroVarco && autenticato && !limitatore.passa(tempo)) { chiusoFino = tempo + 1; g.suoni.errore(); }
    dentroVarco = nelVarco;
    if (!autenticato && conChiave && io.z < VARCO[2] - 0.4 && io.x > X0 && io.x < X1) {
      autenticato = true;
      aiuti.progresso();
      g.suoni.notifica();
      g.emetti('yag:autenticato');
    }
    const aperta = (autenticato || conChiave) && tempo >= chiusoFino;
    barriera.attivo = !aperta;
    barriera.mesh.visible = !aperta;
    // instradamento
    const p = sulPiedistallo();
    if (p !== piedistallo) { piedistallo = p; if (p) aiuti.progresso(); }
    const nuova = instrada({ autenticato, piedistallo });
    if (nuova !== meta) {
      meta = nuova;
      const ok = meta !== 'negato';
      anta.attivo = !ok;
      anta.mesh.visible = !ok;
      if (ok) {
        const b = BACKEND[meta];
        g.passaggi.sposta('yag-uscita', 'b', posa(b[0], b[1] + 1.15, b[2], b[3]));
        g.suoni.porta(true);
      }
      g.passaggi.attiva('yag-uscita', ok);
    }
  });
  g.su('stanza:yag-backend1', () => aiuti.progresso());
  g.su('stanza:yag-backend2', () => { aiuti.risolto(); evidenza.visible = false; g.lampada('yag'); });
  g.su('aiuto:soluzione:yag', () => { soluzione = true; evidenza.visible = true; });

  return {
    debug: {
      posti: { chiave: CHIAVE, varco: VARCO, a: PIED.a, b: PIED.b, uscita: USCITA },
      poggia: (x, y, z) => { if (chiave.tenuto) return; chiave.pos.set(x, y, z); chiave.vel.set(0, 0, 0); },
      risolvi: () => { aiuti.risolto(); g.lampada('yag'); },
      stato: () => ({ autenticato, piedistallo, meta, soluzione }),
    },
  };
}
