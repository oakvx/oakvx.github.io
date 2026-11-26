// La stanza di oakvx si riempie da dati/stanza-oakvx.json. Qui si controlla il file:
// le voci incomplete o sospette si scartano con un avviso, il resto passa nella lingua giusta.
export const FORME = ['console-portatile', 'console-casa', 'cassetta', 'libro', 'pianta', 'tazza', 'cuffie', 'vinile'];

const testo = (v, lingua) => (typeof v === 'string' ? v : v && typeof v === 'object' ? (v[lingua] ?? v.it ?? v.en ?? '') : '');
const percorsoOk = (f) => typeof f === 'string' && f.length > 0 && !f.startsWith('/') && !f.includes('..') && !/^[a-z]+:/i.test(f);

export function normalizza(json, lingua) {
  const vuoto = { brani: [], poster: [], mensola: [], note: [], lingue: [], avvisi: [] };
  if (!json || typeof json !== 'object' || Array.isArray(json)) return { ...vuoto, avvisi: ['stanza-oakvx.json: non è un oggetto JSON'] };
  const r = { ...vuoto, avvisi: [] };
  const lista = (k) => (Array.isArray(json[k]) ? json[k] : []);
  lista('brani').forEach((b, i) => {
    if (!b || !testo(b.titolo, lingua) || !percorsoOk(b.file)) { r.avvisi.push(`brani[${i}]: servono titolo e file (percorso relativo)`); return; }
    r.brani.push({ titolo: testo(b.titolo, lingua), file: b.file, nota: testo(b.nota, lingua) });
  });
  lista('poster').forEach((p, i) => {
    if (!p || !percorsoOk(p.file)) { r.avvisi.push(`poster[${i}]: serve file (percorso relativo)`); return; }
    r.poster.push({ file: p.file, didascalia: testo(p.didascalia, lingua) });
  });
  lista('mensola').forEach((o, i) => {
    if (!o || !FORME.includes(o.forma)) { r.avvisi.push(`mensola[${i}]: forma non ammessa (${o && o.forma})`); return; }
    r.mensola.push({ forma: o.forma, etichetta: testo(o.etichetta, lingua) });
  });
  lista('note').forEach((n, i) => {
    const t = testo(n, lingua);
    if (!t) { r.avvisi.push(`note[${i}]: vuota`); return; }
    r.note.push(t);
  });
  lista('lingue').forEach((l, i) => {
    if (!l || !testo(l.lingua, lingua)) { r.avvisi.push(`lingue[${i}]: serve lingua`); return; }
    r.lingue.push({ lingua: testo(l.lingua, lingua), livello: testo(l.livello, lingua) });
  });
  return r;
}
