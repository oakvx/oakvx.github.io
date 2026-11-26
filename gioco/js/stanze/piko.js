// Stanza del progetto piko: per ora un segnaposto (la sua tappa del piano la riempie).
import { stanzaProgetto } from '../engine/varchi.js';

export function costruisci(m, g) {
  stanzaProgetto(m, g, { id: 'piko', x0: -100, x1: -80, z0: -60, z1: -40 });
  return { debug: { risolvi: () => g.lampada('piko'), stato: () => ({}) } };
}
