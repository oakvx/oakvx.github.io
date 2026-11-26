// Stanza del progetto brat: per ora un segnaposto (la sua tappa del piano la riempie).
import { stanzaProgetto } from '../engine/varchi.js';

export function costruisci(m, g) {
  stanzaProgetto(m, g, { id: 'brat', x0: -140, x1: -110, z0: -20, z1: 10, h: 10 });
  return { debug: { risolvi: () => g.lampada('brat'), stato: () => ({}) } };
}
