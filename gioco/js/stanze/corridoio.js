// Il corridoio infinito. Dopo il terzo ritorno dal bivio, entrando nel primo
// corridoio il visitatore viene spostato (con un battito di luce) in una copia lunga.
// Lì la porta in fondo arretra dell'88% di ogni metro: ne servono una cinquantina.
// Luci e piastrelle si ripetono ogni 4 m, quindi gli spostamenti non si vedono.
import * as THREE from 'three';

const DX = 100;          // la copia sta 100 m a est (multiplo del periodo delle texture)
const Z0 = -4.3;         // imbocco del corridoio
const PERIODO = 4;
const ARRETRA = 0.88;

export function costruisci(m, g) {
  const mat = m.mat;
  const luci = [];
  for (let z = 15; z > -64; z -= PERIODO) luci.push([DX, z - 2, 0.5, 1.1]);
  m.stanza({ nome: 'infinito', x0: DX - 1, x1: DX + 1, z0: -64, z1: 16, h: 2.6, luci, luciPunto: false });

  // la porta: un muro pieno con un'anta, solido e mobile
  const porta = new THREE.Group();
  const muro = new THREE.Mesh(new THREE.BoxGeometry(2, 2.6, 0.2), mat.muro);
  muro.position.y = 1.3;
  const anta = new THREE.Mesh(new THREE.BoxGeometry(0.92, 2.1, 0.06), new THREE.MeshLambertMaterial({ color: 0xc9d3d8 }));
  anta.position.set(0, 1.05, 0.13);
  const maniglia = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.05), mat.scuro);
  maniglia.position.set(0.32, 1.02, 0.18);
  porta.add(muro, anta, maniglia);
  porta.position.x = DX;
  m.scene.add(porta);
  const solido = { min: new THREE.Vector3(DX - 1, 0, 0), max: new THREE.Vector3(DX + 1, 2.6, 0), pannello: null, attivo: true };
  m.solidi.push(solido);

  let armato = false;
  let dentro = false;
  let porDist = 0;   // distanza della porta dall'imbocco
  let sPrima = 0;
  const posa = () => {
    const z = Z0 - porDist;
    porta.position.z = z;
    solido.min.z = z - 0.1;
    solido.max.z = z + 0.1;
  };
  porDist = 200;
  posa();

  if (g.debug) window.__corridoio = { porta: () => porDist, avvicina: () => { porDist = sPrima + 2; posa(); } };

  g.su('indietro', () => { if (g.narratore().stato.indietro >= 3) armato = true; });

  m.ogniFrame(() => {
    const c = g.giocatore();
    if (armato && !dentro && Math.abs(c.pos.x) < 1 && c.pos.z < -5.4 && c.pos.z > -9.6 && Math.cos(g.yaw()) > 0.5) {
      dentro = true;
      armato = false;
      g.velo(() => {
        c.pos.x += DX;
        sPrima = Z0 - c.pos.z;
        porDist = sPrima + 5.2;
        posa();
      });
      return;
    }
    if (!dentro || Math.abs(c.pos.x - DX) > 2) return;
    const s = Z0 - c.pos.z;
    if (s > sPrima) porDist += (s - sPrima) * ARRETRA;
    porDist = Math.min(porDist, s + 30);
    let salto = 0;
    if (s > 24) salto = Math.floor((s - 12) / PERIODO) * PERIODO;
    else if (s < -8) salto = -Math.ceil((-4 - s) / PERIODO) * PERIODO;
    if (salto !== 0) {
      c.pos.z += salto;
      porDist -= salto;
    }
    sPrima = Z0 - c.pos.z;
    posa();
    if (porDist - sPrima < 1.5) g.finale('corridoio');
  });
}
