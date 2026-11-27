import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

const { corsia: C } = await carica('assets/magazzino/corsia.js');
const j = x => JSON.parse(JSON.stringify(x));

test('CASSE: 13 casse, sei aperte in basso, sette chiuse in alto, id e codici unici', () => {
    assert.equal(C.CASSE.length, 13);
    const aperte = C.CASSE.filter(c => c.aperta), chiuse = C.CASSE.filter(c => !c.aperta);
    assert.equal(aperte.length, 6);
    assert.deepEqual(j(aperte.map(c => c.id)), ['blackjack', 'briscola', 'scopa', 'scala-40', 'gioco-3d', 'terminale']);
    assert.ok(aperte.every(c => c.livello === 0 && c.href));
    assert.ok(chiuse.every(c => c.livello === 1 && !c.href));
    assert.equal(new Set(C.CASSE.map(c => c.id)).size, 13);
    assert.equal(new Set(C.CASSE.map(c => c.codice)).size, 13);
    assert.equal(new Set(C.CASSE.map(c => c.emblema)).size, 13, 'ogni gioco ha il suo emblema');
});

test('postoCassa: stesso passo, livelli diversi, nessuna sovrapposizione', () => {
    const p = C.CASSE.map((_, i) => j(C.postoCassa(i)));
    const basso = p.filter((_, i) => C.CASSE[i].livello === 0), alto = p.filter((_, i) => C.CASSE[i].livello === 1);
    for (const riga of [basso, alto]) for (let i = 1; i < riga.length; i++) assert.ok(Math.abs((riga[i].x - riga[i - 1].x) - C.PASSO) < 1e-9);
    assert.ok(alto[0].y > basso[0].y + .5);
    assert.ok(C.PASSO > C.LARGHEZZA_CASSA);
});

test('limitiCamera e cassaVicina: la telecamera resta nei limiti e aggancia solo le casse aperte', () => {
    const l = j(C.limitiCamera(2.6));
    assert.ok(l.min <= l.max);
    const aperte = C.CASSE.map((c, i) => [c, i]).filter(([c]) => c.aperta);
    for (const [c, i] of aperte) assert.equal(C.cassaVicina(C.postoCassa(i).x), i);
    assert.equal(C.cassaVicina(-50), aperte[0][1]);
    assert.equal(C.cassaVicina(999), aperte[aperte.length - 1][1]);
});

test('riempimento: pallini dentro la cassa, fermi, deterministici', () => {
    const a = j(C.riempimento(3)), b = j(C.riempimento(3));
    assert.deepEqual(a, b);
    assert.ok(a.length >= 60 && a.length <= 160);
    assert.ok(a.every(x => Math.abs(x.pos[0]) <= C.LARGHEZZA_CASSA / 2 && Math.abs(x.pos[2]) <= C.PROFONDITA_CASSA / 2 && x.pos[1] <= C.ALTEZZA_CASSA + .02));
});

test('puffo: pochi pallini, si alzano piano e ricadono, deterministico', () => {
    const a = j(C.puffo(.4, 7)), b = j(C.puffo(.4, 7)), c = j(C.puffo(.4, 8));
    assert.deepEqual(a, b);
    assert.notDeepEqual(a, c);
    assert.ok(a.length >= 10 && a.length <= 60);
    const alto = Math.max(...j(C.puffo(.45, 7)).map(x => x.pos[1])) - C.ALTEZZA_CASSA;
    assert.ok(alto > .03 && alto < .25, 'si alzano appena sopra il bordo, senza esplodere');
    assert.ok(j(C.puffo(1, 7)).every(x => x.pos[1] <= C.ALTEZZA_CASSA + .02), 'a fine volo sono ricaduti nella cassa');
});

test('poseAnnoiato: gomito piegato, testa inclinata sulla mano, respiro lento e piccolo', () => {
    const p0 = j(C.poseAnnoiato(0)), p1 = j(C.poseAnnoiato(2000));
    assert.ok(Object.values(p0).every(Number.isFinite));
    assert.ok(p0.collo > .15, 'la testa pende verso la mano');
    assert.ok(p0.gomitoD > 1.8, 'l’avambraccio sale verso la faccia');
    const diff = Math.max(...Object.keys(p0).map(k => Math.abs(p0[k] - p1[k])));
    assert.ok(diff > 0 && diff < .08, 'respira appena');
    assert.deepEqual(j(C.poseAnnoiato(0)), j(C.poseAnnoiato(8000)), 'il respiro si ripete ogni 8 s');
});

test('occhiAnnoiato: mezzi quasi sempre, chiusi per un battito lento', () => {
    let chiusi = 0, mezzi = 0;
    for (let ms = 0; ms < 60000; ms += 40) (C.occhiAnnoiato(ms) === 'chiusi' ? chiusi++ : mezzi++);
    assert.ok(chiusi > 0 && chiusi / (chiusi + mezzi) < .12);
    assert.ok(['mezzi', 'chiusi'].includes(C.occhiAnnoiato(1234)));
});

test('accensione: quattro neon che si accendono a scatti, tutti accesi dopo 1,4 s', () => {
    assert.deepEqual(j(C.accensione(0)), [0, 0, 0, 0]);
    assert.deepEqual(j(C.accensione(1.4)), [1, 1, 1, 1]);
    assert.deepEqual(j(C.accensione(5)), [1, 1, 1, 1]);
    assert.ok(j(C.accensione(.5)).every(v => v >= 0 && v <= 1));
    let scatti = 0, prima = 0;
    for (let t = 0; t < 1.4; t += .02) { const lum = j(C.accensione(t)).reduce((a, b) => a + b, 0); if (Math.abs(lum - prima) > .4) scatti++; prima = lum; }
    assert.ok(scatti >= 4, 'si accendono a scatti, non con una dissolvenza');
});
