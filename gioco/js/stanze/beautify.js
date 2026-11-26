// Stanza del progetto beautify: per ora un segnaposto (la sua tappa del piano la riempie).
import { stanzaProgetto } from '../engine/varchi.js';

export function costruisci(m, g) {
  stanzaProgetto(m, g, { id: 'beautify', x0: -180, x1: -150, z0: -40, z1: -10 });
  return { debug: { risolvi: () => g.lampada('beautify'), stato: () => ({}) } };
}
