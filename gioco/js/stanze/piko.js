// Piko: l'agente locale che guarda l'app, scrive un piano e agisce solo dopo l'approvazione.
// Qui l'agente è un fantasma in wireframe; il monitor "Workfield" mostra il suo piano, le
// impronte a terra il percorso. Il piano 1 passa sul pozzo, il piano 2 gira largo e preme
// il pulsante. Due leve: APPROVA e RIFIUTA. Chi salta nel pozzo torna al punto di ripresa.
import * as THREE from 'three';
import { stanzaProgetto } from '../engine/varchi.js';
import { creaPianificatore } from '../logica/piko.js';

const X0 = -100, X1 = -80, Z0 = -60, Z1 = -40, H = 4;
const POZZO = { x0: -96, x1: -84, z0: -52, z1: -48 };
const PIANI = [
  { esito: 'pozzo', punti: [[-90, -42.6], [-90, -50]] },
  { esito: 'apre', punti: [[-90, -42.6], [-98, -44], [-98, -56], [-90, -58.6]] },
];

export function costruisci(m, g) {
  const mat = m.mat;
  const T = () => g.T().stanze.piko;
  stanzaProgetto(m, g, {
    id: 'piko', x0: X0, x1: X1, z0: Z0, z1: Z1, h: H, pavimento: false,
    luci: [[-90, -44, 0.6, 1.6], [-90, -56, 0.6, 1.6]], intensita: 2.4,
    atmosfera: { nebbia: 0x1d2224, vicino: 3, lontano: 24, cielo: 0xd2dde0, terra: 0x2a3033, intensita: 1.9 },
  });
  // pavimento con il pozzo in mezzo
  const pav = mat.cemento;
  m.box(X0 - 0.3, -0.3, POZZO.z1, X1 + 0.3, 0, Z1 + 0.3, pav);
  m.box(X0 - 0.3, -0.3, Z0 - 0.3, X1 + 0.3, 0, POZZO.z0, pav);
  m.box(X0 - 0.3, -0.3, POZZO.z0, POZZO.x0, 0, POZZO.z1, pav);
  m.box(POZZO.x1, -0.3, POZZO.z0, X1 + 0.3, 0, POZZO.z1, pav);
  m.box(POZZO.x0, -8.3, POZZO.z0, POZZO.x1, -8, POZZO.z1, mat.scuro);
  for (const [a, b] of [[POZZO.x0, POZZO.x0 + 0.05], [POZZO.x1 - 0.05, POZZO.x1]]) m.box(a, -8, POZZO.z0, b, 0, POZZO.z1, mat.scuro, { solido: false });
  m.box(POZZO.x0, -8, POZZO.z0, POZZO.x1, 0, POZZO.z0 + 0.05, mat.scuro, { solido: false });
  m.box(POZZO.x0, -8, POZZO.z1 - 0.05, POZZO.x1, 0, POZZO.z1, mat.scuro, { solido: false });

  // monitor Workfield
  m.box(-87, 0, -43.4, -84.6, 0.9, -42.4, mat.scuro);
  const pianificatore = creaPianificatore(PIANI);
  const schermo = g.texTesto(512, 320, (ctx, w, h) => {
    const t = T();
    const i = pianificatore.attuale();
    ctx.fillStyle = '#e9edf0'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2b3a46'; ctx.fillRect(0, 0, w, 44);
    ctx.fillStyle = '#f2f6f8'; ctx.font = '700 24px Archivo, sans-serif'; ctx.fillText('Workfield · Piko', 16, 30);
    ctx.fillStyle = '#1d252b'; ctx.font = '700 26px Archivo, sans-serif'; ctx.fillText(t.piano.replace('{n}', i + 1), 16, 84);
    ctx.font = '400 21px Archivo, sans-serif';
    t.piani[i].forEach((r, k) => ctx.fillText(`${k + 1}. ${r}`, 16, 124 + k * 32));
    ctx.fillStyle = '#56636c'; ctx.font = '500 19px Archivo, sans-serif'; ctx.fillText(t.attesa, 16, 296);
  });
  schermo.ridisegna();
  g.suLingua(() => schermo.ridisegna());
  const monitor = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.75), new THREE.MeshBasicMaterial({ map: schermo }));
  monitor.position.set(-85.8, 1.45, -42.95);
  monitor.rotation.y = Math.PI;
  m.scene.add(monitor);
  m.box(-86.45, 1.05, -42.9, -85.15, 1.85, -42.8, mat.scuro, { solido: false });

  // leve
  const leva = (x, colore, chiave) => {
    m.box(x - 0.2, 0, -42.8, x + 0.2, 1, -42.4, mat.cornice);
    const manico = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), new THREE.MeshLambertMaterial({ color: colore }));
    manico.position.set(x, 1.25, -42.6);
    manico.rotation.x = 0.4;
    m.scene.add(manico);
    g.interattivo(manico, chiave);
    return manico;
  };
  const leve = { approva: leva(-88.6, 0x58c27d, 'piko-approva'), rifiuta: leva(-91.4, 0xd65b5b, 'piko-rifiuta') };
  g.arredi.porta(-88.6, 0, -42.2, Math.PI, () => T().approva, { w: 0.6, h: 1.4 });
  g.arredi.porta(-91.4, 0, -42.2, Math.PI, () => T().rifiuta, { w: 0.6, h: 1.4 });

  // impronte del piano attuale
  const impronte = new THREE.Group();
  m.scene.add(impronte);
  const matImpronta = new THREE.MeshBasicMaterial({ color: 0x39c6d9, transparent: true, opacity: 0.55 });
  function disegnaImpronte() {
    impronte.clear();
    const punti = PIANI[pianificatore.attuale()].punti;
    for (let k = 0; k < punti.length - 1; k++) {
      const [ax, az] = punti[k], [bx, bz] = punti[k + 1];
      const n = Math.max(1, Math.floor(Math.hypot(bx - ax, bz - az) / 0.7));
      for (let j = 0; j <= n; j++) {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.32), matImpronta);
        s.rotation.x = -Math.PI / 2;
        s.position.set(ax + (bx - ax) * j / n, 0.01, az + (bz - az) * j / n);
        impronte.add(s);
      }
    }
  }
  disegnaImpronte();

  // il fantasma dell'agente
  const fantasma = g.arredi.mii(-90, 0, -42.6, Math.PI, 'in piedi');
  const filo = new THREE.MeshBasicMaterial({ color: 0x9fe6f0, wireframe: true });
  fantasma.traverse((o) => { if (o.isMesh) o.material = filo; });

  // pulsante e porta in fondo
  const pulsante = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.1), new THREE.MeshLambertMaterial({ color: 0x8a2f2a }));
  pulsante.position.set(-90, 1.2, Z0 + 0.06);
  m.scene.add(pulsante);
  g.arredi.didascalia(-86, 1.5, Z0 + 0.02, 0, () => T().testi.piko, { w: 1.6, h: 0.95 });
  g.arredi.didascalia(-95, 1.5, Z0 + 0.02, 0, () => T().testi.limiti, { w: 1.3, h: 0.75 });
  g.arredi.cartello(-90, 3.4, Z1 - 0.03, Math.PI, '04', () => T().cartello);

  const aiuti = g.aiuti('piko');
  let cammino = null; // { punti, k, t, esito }
  let ultimo = null;
  let fatto = false;

  function approva() {
    if (cammino || fatto) return;
    g.suoni.leva();
    leve.approva.rotation.x = -0.4;
    const esito = pianificatore.approva();
    cammino = { punti: PIANI[pianificatore.attuale()].punti, k: 0, esito, caduta: 0 };
    aiuti.progresso();
    g.emetti('piko:approvato', { esito });
  }
  function rifiuta() {
    if (cammino || fatto) return;
    g.suoni.leva();
    leve.rifiuta.rotation.x = -0.4;
    pianificatore.rifiuta();
    schermo.ridisegna();
    disegnaImpronte();
    aiuti.progresso();
    setTimeout(() => { leve.rifiuta.rotation.x = 0.4; }, 400);
  }
  g.su('oggetto:piko-approva', approva);
  g.su('oggetto:piko-rifiuta', rifiuta);

  m.ogniFrame((dt) => {
    // chi finisce nel pozzo torna al punto di ripresa
    const io = g.giocatore().pos;
    if (io.y < -2 && io.x > POZZO.x0 && io.x < POZZO.x1 && io.z > POZZO.z0 && io.z < POZZO.z1 && !g.inViaggio) {
      g.inViaggio = true;
      g.emetti('caduta');
      g.teletrasporta(-90, 0, Z1 - 1.5, 0, () => { g.inViaggio = false; g.suoni.tonfo(); });
    }
    if (!cammino) return;
    const { punti } = cammino;
    if (cammino.k >= punti.length - 1) {
      if (cammino.esito === 'pozzo') {
        cammino.caduta += dt;
        fantasma.position.y -= dt * (2 + cammino.caduta * 9);
        if (cammino.caduta > 0.8) {
          ultimo = 'pozzo';
          cammino = null;
          fantasma.position.set(-90, 0, -42.6);
          leve.approva.rotation.x = 0.4;
          g.emetti('piko:pozzo');
        }
      } else {
        ultimo = 'apre';
        cammino = null;
        fatto = true;
        pulsante.material.color.set(0x58c27d);
        g.suoni.notifica();
        aiuti.risolto();
        g.lampada('piko');
      }
      return;
    }
    const [ax, az] = punti[cammino.k], [bx, bz] = punti[cammino.k + 1];
    const d = new THREE.Vector2(bx - fantasma.position.x, bz - fantasma.position.z);
    const passo = dt * 4;
    if (d.length() <= passo) { fantasma.position.set(bx, fantasma.position.y, bz); cammino.k++; }
    else { d.setLength(passo); fantasma.position.x += d.x; fantasma.position.z += d.y; }
    fantasma.rotation.y = Math.atan2(bx - ax, bz - az);
  });

  // soluzione a 90 secondi: il piano giusto è già sullo schermo e le impronte lampeggiano
  let soluzione = false;
  g.su('aiuto:soluzione:piko', () => {
    soluzione = true;
    if (pianificatore.attuale() !== 1) { pianificatore.rifiuta(); schermo.ridisegna(); disegnaImpronte(); }
    matImpronta.color.set(0xd95bb3);
  });

  return {
    debug: {
      pozzo: [-90, -50],
      risolvi: () => { fatto = true; aiuti.risolto(); g.lampada('piko'); },
      stato: () => ({ piano: pianificatore.attuale(), ultimo, fatto, soluzione, cammino: cammino && { k: cammino.k, z: fantasma.position.z, y: fantasma.position.y } }),
    },
  };
}
