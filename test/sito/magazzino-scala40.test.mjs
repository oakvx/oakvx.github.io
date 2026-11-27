import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

const w = {};
await carica('assets/magazzino/carte.js', w);
const { scala40: S } = await carica('assets/magazzino/scala40.js', w);
let n = 0;
const k = (seme, valore) => ({ id: `${seme}-${valore}-${n++}`, seme, valore });
const J = () => ({ id: `jolly-${n++}`, seme: 'jolly', valore: 0 });
const j = x => JSON.parse(JSON.stringify(x));

test('combinazione: tris, scale con asso alto e basso, niente giro', () => {
    assert.deepEqual(j(S.combinazione([k('picche', 5), k('cuori', 5), k('quadri', 5)])), { tipo: 'tris', punti: 15 });
    assert.deepEqual(j(S.combinazione([k('cuori', 12), k('cuori', 13), k('cuori', 1)])), { tipo: 'scala', punti: 31 });
    assert.deepEqual(j(S.combinazione([k('cuori', 1), k('cuori', 2), k('cuori', 3)])), { tipo: 'scala', punti: 6 });
    assert.equal(S.combinazione([k('cuori', 13), k('cuori', 1), k('cuori', 2)]), null);
});
test('combinazione: poker, jolly al posto di una carta, due jolly no', () => {
    assert.equal(S.combinazione([k('picche', 9), k('cuori', 9), k('quadri', 9), k('fiori', 9)]).tipo, 'poker');
    assert.deepEqual(j(S.combinazione([k('fiori', 7), J(), k('fiori', 9)])), { tipo: 'scala', punti: 24 });
    assert.deepEqual(j(S.combinazione([k('fiori', 13), k('cuori', 13), J()])), { tipo: 'tris', punti: 30 });
    assert.equal(S.combinazione([k('fiori', 7), J(), J()]), null);
});
test('combinazione: semi ripetuti nel tris o semi misti nella scala non valgono', () => {
    assert.equal(S.combinazione([k('fiori', 5), k('fiori', 5), k('cuori', 5)]), null);
    assert.equal(S.combinazione([k('fiori', 5), k('cuori', 6), k('fiori', 7)]), null);
    assert.equal(S.combinazione([k('fiori', 5), k('fiori', 6)]), null);
});
test('apertura: servono almeno 40 punti', () => {
    assert.deepEqual(j(S.apertura([[k('picche', 10), k('picche', 11), k('picche', 12)], [k('fiori', 13), k('quadri', 13), k('cuori', 13)]])), { valida: true, punti: 60 });
    assert.equal(S.apertura([[k('picche', 10), k('picche', 11), k('picche', 12)], [k('fiori', 3), k('quadri', 3), k('cuori', 3)]]).valida, false);
    assert.equal(S.apertura([[k('picche', 10), k('cuori', 11), k('picche', 12)]]).valida, false);
});
test('penalità: asso 11, figure 10, jolly 25', () => {
    assert.equal(S.penalita([k('cuori', 1), k('picche', 13), J()]), 46);
    assert.equal(S.penalita([k('cuori', 4), k('picche', 9)]), 13);
});

test('nuova: 13 carte a testa, una nello scarto, 108 in tutto', () => {
    const s = S.nuova(3, 3);
    assert.deepEqual(j(s.mani.map(m => m.length)), [13, 13, 13]);
    assert.equal(s.scarti.length, 1);
    assert.equal(s.mazzo.length + s.scarti.length + 39, 108);
});
test('pesca dallo scarto senza aver aperto: rifiutata se quella carta non serve ad aprire', () => {
    const s = S.nuova(3, 2);
    const t = { ...j(s), mani: [[k('cuori', 2), k('fiori', 4), k('picche', 6)], s.mani[1]], scarti: [k('quadri', 9)], fase: 'pesca' };
    assert.equal(S.pesca(t, 'scarto'), t);
});
test('cala e scarta: non si cala tutto (serve una carta per chiudere), chiudere somma le penalità agli altri', () => {
    const tris = [k('picche', 13), k('fiori', 13), k('quadri', 13)], scala = [k('cuori', 10), k('cuori', 11), k('cuori', 12)];
    const s0 = { mazzo: [k('fiori', 2)], scarti: [k('quadri', 4)], mani: [[...tris, ...scala, k('picche', 2)], [k('cuori', 1), k('picche', 13)]], aperto: [false, false], tavolo: [], turno: 0, fase: 'gioca', presoDaScarto: null, punteggi: [0, 0], eliminati: [false, false], chiInizia: 0 };
    const s1 = S.cala(s0, [tris.map(c => c.id), scala.map(c => c.id)]);
    assert.equal(s1.aperto[0], true);
    assert.equal(s1.mani[0].length, 1);
    assert.equal(s1.tavolo.length, 2);
    const s2 = S.scarta(s1, 0);
    assert.equal(s2.fase, 'chiusa');
    assert.deepEqual(j(s2.punteggi), [0, 21]);
});
test('una partita fra computer arriva in fondo senza perdere carte', () => {
    let s = S.nuova(17, 2), giri = 0;
    while (s.fase !== 'chiusa' && s.fase !== 'finita' && giri++ < 2000) {
        for (const m of S.mossaComputer(s)) {
            if (m.tipo === 'pesca') s = S.pesca(s, m.da);
            if (m.tipo === 'cala') s = S.cala(s, m.gruppi);
            if (m.tipo === 'attacca') s = S.attacca(s, m.carta, m.gruppo);
            if (m.tipo === 'scarta') s = S.scarta(s, m.indice);
        }
        const tot = s.mazzo.length + s.scarti.length + s.mani.reduce((a, m) => a + m.length, 0) + s.tavolo.reduce((a, g) => a + g.carte.length, 0);
        assert.equal(tot, 108);
    }
    assert.ok(s.fase === 'chiusa' || s.fase === 'finita', `fase ${s.fase} dopo ${giri} giri`);
});

test('nessuna smazzata fra computer si blocca, su molti semi', () => {
    for (let seme = 1; seme <= 200; seme++) {
        let s = S.nuova(seme, 2), giri = 0;
        while (s.fase !== 'chiusa' && s.fase !== 'finita' && giri++ < 3000) {
            const prima = JSON.stringify(s);
            for (const m of S.mossaComputer(s)) {
                if (m.tipo === 'pesca') s = S.pesca(s, m.da);
                if (m.tipo === 'cala') s = S.cala(s, m.gruppi);
                if (m.tipo === 'attacca') s = S.attacca(s, m.carta, m.gruppo);
                if (m.tipo === 'scarta') s = S.scarta(s, m.indice);
            }
            assert.notEqual(JSON.stringify(s), prima, `seme ${seme} bloccato`);
        }
    }
});
test('aperto, lo scarto si prende solo se si può usare in questo turno', () => {
    const s = { mazzo: [k('fiori', 2)], scarti: [k('quadri', 3)], mani: [[k('quadri', 4), k('quadri', 5)], [k('cuori', 9)]], aperto: [true, true], tavolo: [], turno: 0, fase: 'pesca', presoDaScarto: null, punteggi: [0, 0], eliminati: [false, false], chiInizia: 0 };
    assert.equal(S.pesca(s, 'scarto'), s);
});
