import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

const w = {};
await carica('assets/magazzino/carte.js', w);
const { scopa: S } = await carica('assets/magazzino/scopa.js', w);
const k = (seme, valore) => ({ id: `${seme}-${valore}`, seme, valore });
// i risultati vengono da un altro contesto vm: si confrontano via JSON
const j = x => JSON.parse(JSON.stringify(x));
const ids = prese => j(prese.map(p => p.map(c => c.id).sort()).sort());

test('prese: con una carta di pari valore in tavola la presa singola è obbligatoria', () => {
    assert.deepEqual(ids(S.prese([k('denari', 7), k('coppe', 3), k('spade', 4)], k('bastoni', 7))), [['denari-7']]);
    assert.deepEqual(ids(S.prese([k('denari', 2), k('coppe', 5), k('spade', 3)], k('bastoni', 5))), [['coppe-5']]);
});
test('prese: altrimenti tutte le somme possibili', () => {
    assert.deepEqual(ids(S.prese([k('denari', 2), k('coppe', 3), k('spade', 4)], k('bastoni', 5))), [['coppe-3', 'denari-2']]);
    assert.deepEqual(ids(S.prese([k('denari', 1), k('coppe', 2), k('spade', 3), k('bastoni', 4)], k('denari', 6))).length, 2);
    assert.deepEqual(j(S.prese([k('denari', 9)], k('coppe', 2))), []);
});
test('prese: con due carte di pari valore si sceglie quale', () => {
    assert.deepEqual(ids(S.prese([k('denari', 4), k('coppe', 4)], k('spade', 4))), [['coppe-4'], ['denari-4']]);
});

const stato = (tavolo, mani, extra = {}) => ({ mazzo: [], tavolo, mani, prese: [[], []], scope: [0, 0], turno: 0, ultimoAPrendere: null, fase: 'gioco', punteggi: [0, 0], ...extra });

test('gioca: presa che svuota il tavolo è scopa', () => {
    const s = S.gioca(stato([k('denari', 3), k('coppe', 4)], [[k('spade', 7), k('bastoni', 1)], [k('coppe', 9), k('spade', 2)]]), 0);
    assert.equal(s.scope[0], 1);
    assert.equal(s.prese[0].length, 3);
    assert.equal(s.tavolo.length, 0);
});
test('gioca: all’ultima giocata della smazzata la presa non vale scopa e il resto va all’ultimo che ha preso', () => {
    const s = S.gioca(stato([k('denari', 3), k('coppe', 4)], [[k('spade', 7)], []]), 0);
    assert.equal(s.scope[0], 0);
    assert.notEqual(s.fase, 'gioco');
});
test('gioca: con più prese possibili senza scelta non succede nulla', () => {
    const s0 = stato([k('denari', 4), k('coppe', 4), k('spade', 2)], [[k('bastoni', 4), k('spade', 6)], [k('coppe', 9)]]);
    assert.equal(S.gioca(s0, 0), s0);
    const s1 = S.gioca(s0, 0, ['coppe-4']);
    assert.deepEqual(j(s1.tavolo.map(c => c.id).sort()), ['denari-4', 'spade-2']);
});

test('conteggio: carte, denari, settebello, primiera, scope', () => {
    const tutte = w.OAKVX.carte.mazzoSiciliano();
    const mie = tutte.filter(c => c.seme === 'denari' || c.valore === 7 || c.valore === 6);   // 10 denari + 7 e 6 degli altri semi
    const sue = tutte.filter(c => !mie.includes(c));
    const s = stato([], [[], []], { prese: [mie, sue], scope: [2, 1], fase: 'contata' });
    const [a, b] = S.conteggio(s).map(x => ({ ...x }));
    assert.deepEqual(a, { carte: 0, denari: 1, settebello: 1, primiera: 1, scope: 2, totale: 5 });
    assert.equal(b.carte, 1);
    assert.equal(b.totale, 2);
});

test('computer: col settebello prendibile in tavola lo prende', () => {
    const s = stato([k('denari', 7), k('coppe', 3)], [[k('spade', 1)], [k('coppe', 7), k('spade', 3), k('bastoni', 2)]], { turno: 1 });   // niente re: col re 7+3 sarebbe settebello e scopa
    const m = S.mossaComputer(s, 'difficile');
    assert.equal(s.mani[1][m.indice].id, 'coppe-7');
    assert.deepEqual(j(m.presa), ['denari-7']);
});

test('una smazzata intera tra computer distribuisce tutte le 40 carte', () => {
    let s = S.nuova(9), giri = 0;
    while (s.fase === 'gioco' && giri++ < 200) { const m = S.mossaComputer(s, 'difficile'); s = S.gioca(s, m.indice, m.presa); }
    assert.equal(s.prese[0].length + s.prese[1].length, 40);
});
