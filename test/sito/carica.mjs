// Carica uno script classico del sito in un contesto vm con un `window` finto.
// Restituisce window.OAKVX (o l'intero window con { tutto: true }).
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function carica(percorso, finestra = {}, { tutto = false } = {}) {
    const codice = await fs.readFile(path.join(ROOT, percorso), 'utf8');
    // le API che il browser dà per scontate
    finestra.URL ??= URL;
    finestra.window = finestra;
    vm.runInNewContext(codice, finestra, { filename: percorso });
    return tutto ? finestra : finestra.OAKVX;
}
