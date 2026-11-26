// Il percorso: un corridoio di 12 m che si cammina per 24. Due tratti impilati in altezza,
// cuciti da un passaggio a senso unico: in fondo al primo si continua nel secondo senza
// accorgersene. Ai lati la prima e l'ultima tappa (la scuola, UNIMORE); le altre sono nei
// transiti. Nel secondo tratto, dopo la tappa, chi si gira vede una porta che prima non c'era.
import * as THREE from 'three';
import { posa } from '../engine/passaggi.js';
import { nicchia } from '../engine/varchi.js';
import { tappa } from '../engine/liminale.js';

const Z0 = -16, Z1 = -4.3, H = 3, SALTO = 20;
const TRATTI = 2;
const TAPPE = [['volta', -9.5, 0], ['unimore', -12.5, 1]];

export function costruisci(m, g) {
  const mat = m.mat;
  const T = () => g.T().stanze.percorso;
  for (let k = 0; k < TRATTI; k++) {
    const y0 = k * SALTO;
    m.stanza({
      nome: k ? `percorso-${k + 1}` : 'percorso', x0: -1.5, x1: 1.5, z0: Z0, z1: Z1, y0, h: H, ala: 'ingresso',
      pareti: {
        s: k === 0 ? false : { aperture: [{ a: -0.65, b: 0.65, y0: 0, y1: 2.3 }] },
        w: k === 0 ? { pannelli: [{ id: 'percorso-o', a: -8.6, b: -5.4, y0: 0, y1: 2.6 }] } : {},
      },
      luci: [[0, -7, 0.4, 1.2], [0, -13, 0.4, 1.2]], intensita: 2.4, raggio: 7,
      atmosfera: { nebbia: 0x2c3230, vicino: 2, lontano: 18, cielo: 0xd9e2db, terra: 0x353b37, intensita: 2 },
    });
    // in fondo a ogni tratto si prosegue nel successivo
    if (k < TRATTI - 1) {
      g.passaggi.aggiungi({ id: `percorso-${k}`, a: posa(0, y0 + 1.3, Z0 + 0.3, 0), b: posa(0, y0 + SALTO + 1.3, Z1 - 0.3, Math.PI), w: 3, h: 2.6, doppio: false });
    }
  }
  const cartello = g.arredi.cartello(-1.47, 2.6, -5, Math.PI / 2, '01', () => T().cartello);

  // le tappe: una porta chiusa con l'anno sopra; esaminarla apre il cartiglio
  for (const [id, z, k] of TAPPE) tappa(m, g, id, 1.48, k * SALTO, z, -Math.PI / 2);

  // la porta segreta (secondo tratto, parete sud): compare solo guardando indietro dopo la tappa
  const yS = (TRATTI - 1) * SALTO;
  const segreta = g.arredi.porta(0, yS, Z1 - 0.06, Math.PI, '???');
  segreta.visible = false;
  nicchia(m, [0, yS, Z1, Math.PI]);
  // finché la porta non compare, il vano è chiuso da un tappo del colore del muro
  const tappo = m.box(-0.65, yS, Z1, 0.65, yS + 2.3, Z1 + 0.3, mat.intonacoA(yS));
  g.passaggi.aggiungi({ id: 'porta-segreta', a: posa(0, yS + 1.15, Z1, Math.PI), b: posa(904, 1.15, 0.6, 0), w: 1.3, h: 2.3 });
  g.passaggi.attiva('porta-segreta', false);
  let vista = false;
  m.ogniFrame(() => {
    if (vista) return;
    const p = g.giocatore().pos;
    const nelTerzo = p.y > yS - 1 && p.y < yS + H && p.z < -10.5;
    if (nelTerzo && Math.cos(g.yaw()) < -0.766) {
      vista = true;
      segreta.visible = true;
      tappo.attivo = false;
      tappo.mesh.visible = false;
      g.passaggi.attiva('porta-segreta', true);
      g.suoni.porta(true);
    }
  });
  g.su('passaggio:porta-segreta', () => g.segreto('porta-percorso'));

  g.puntoControllo('percorso', 0, 0, -5, 0);
  return {
    debug: {
      stato: () => ({ segreta: vista, cartello: cartello.testo }),
      inizio: (k) => [0, (k - 1) * SALTO + 0.87, Z1 - 0.7],
    },
  };
}
