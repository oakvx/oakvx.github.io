// Stanza del progetto yag: per ora un segnaposto (la sua tappa del piano la riempie).
import { stanzaProgetto } from '../engine/varchi.js';

export function costruisci(m, g) {
  stanzaProgetto(m, g, { id: 'yag', x0: -100, x1: -80, z0: -20, z1: 0 });
  return { debug: { risolvi: () => g.lampada('yag'), stato: () => ({}) } };
}
