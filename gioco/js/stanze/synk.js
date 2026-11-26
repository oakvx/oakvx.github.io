// Stanza del progetto synk: per ora un segnaposto (la sua tappa del piano la riempie).
import { stanzaProgetto } from '../engine/varchi.js';

export function costruisci(m, g) {
  stanzaProgetto(m, g, { id: 'synk', x0: -140, x1: -115, z0: -60, z1: -40 });
  return { debug: { risolvi: () => g.lampada('synk'), stato: () => ({}) } };
}
