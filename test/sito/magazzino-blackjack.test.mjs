import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

const w = {};
await carica('assets/magazzino/carte.js', w);
const { blackjack: B } = await carica('assets/magazzino/blackjack.js', w);
const c = (valore, seme = 'cuori') => ({ id: `${seme}-${valore}-x${Math.random()}`, seme, valore });
const p = m => ({ ...B.punteggio(m) });

test('punteggio: blackjack, assi morbidi, sballato', () => {
    assert.deepEqual(p([c(1), c(13)]), { totale: 21, morbido: true, blackjack: true });
    assert.deepEqual(p([c(1), c(1), c(9)]), { totale: 21, morbido: true, blackjack: false });
    assert.deepEqual(p([c(13), c(12), c(5)]), { totale: 25, morbido: false, blackjack: false });
    assert.deepEqual(p([c(1), c(6), c(10)]), { totale: 17, morbido: false, blackjack: false });
});

const stato = (giocatore, banco, sabot, puntata = 100, fase = 'banco') => ({
    sabot, mani: [{ carte: giocatore, puntata, finita: true, raddoppiata: false }], attiva: 0, banco, fase, divisa: false
});

test('banco: con 16 pesca, con asso e 6 sta', () => {
    const s = B.banco(stato([c(10), c(8)], [c(10), c(6)], [c(5), c(9)]));
    assert.equal(s.banco.length, 3);
    assert.equal(s.fase, 'finita');
    const t = B.banco(stato([c(10), c(8)], [c(1), c(6)], [c(5)]));
    assert.equal(t.banco.length, 2);
});

test('banco: se il giocatore ha sballato non pesca', () => {
    const s = B.banco(stato([c(10), c(8), c(9)], [c(10), c(2)], [c(5)]));
    assert.equal(s.banco.length, 2);
});

test('esito: blackjack paga 3:2, pareggio restituisce, sconfitta zero', () => {
    assert.equal(B.esito(stato([c(1), c(12)], [c(10), c(8)], [], 100, 'finita')).vincita, 250);
    assert.equal(B.esito(stato([c(10), c(8)], [c(9), c(9)], [], 100, 'finita')).vincita, 100);
    assert.equal(B.esito(stato([c(10), c(7)], [c(9), c(9)], [], 100, 'finita')).vincita, 0);
    assert.equal(B.esito(stato([c(10), c(9)], [c(10), c(6), c(8)], [], 100, 'finita')).vincita, 200);
    assert.equal(B.esito(stato([c(1), c(12)], [c(1), c(13)], [], 100, 'finita')).vincita, 100);
});

test('nuova: distribuisce due carte a testa e toglie quattro carte dal sabot di 6 mazzi', () => {
    const s = B.nuova(123, 50);
    assert.equal(s.mani[0].carte.length, 2);
    assert.equal(s.banco.length, 2);
    assert.equal(s.sabot.length, 6 * 52 - 4);
    assert.equal(s.mani[0].puntata, 50);
});

test('azione: raddoppio solo con due carte, poi la mano è chiusa', () => {
    let s = { sabot: [c(2), c(3), c(4)], mani: [{ carte: [c(5), c(6)], puntata: 100, finita: false, raddoppiata: false }], attiva: 0, banco: [c(10), c(7)], fase: 'giocatore', divisa: false };
    const r = B.azione(s, 'raddoppia');
    assert.equal(r.mani[0].carte.length, 3);
    assert.equal(r.mani[0].puntata, 200);
    assert.equal(r.mani[0].finita, true);
    s = B.azione(s, 'carta');
    const n = B.azione(s, 'raddoppia');
    assert.equal(n.mani[0].carte.length, 3, 'niente raddoppio dopo la terza carta');
    assert.equal(n.mani[0].puntata, 100);
});

test('azione: dividi una coppia in due mani, una volta sola', () => {
    const s = { sabot: [c(2), c(3), c(4), c(5)], mani: [{ carte: [c(8), c(8, 'picche')], puntata: 100, finita: false, raddoppiata: false }], attiva: 0, banco: [c(10), c(7)], fase: 'giocatore', divisa: false };
    const r = B.azione(s, 'dividi');
    assert.equal(r.mani.length, 2);
    assert.equal(r.mani[0].carte.length, 2);
    assert.equal(r.mani[1].puntata, 100);
    assert.equal(r.divisa, true);
    assert.equal(B.possibili(r).includes('dividi'), false);
});

test('azione: sballare chiude la mano e passa al banco', () => {
    const s = { sabot: [c(10)], mani: [{ carte: [c(10), c(6)], puntata: 100, finita: false, raddoppiata: false }], attiva: 0, banco: [c(10), c(7)], fase: 'giocatore', divisa: false };
    const r = B.azione(s, 'carta');
    assert.equal(r.mani[0].finita, true);
    assert.notEqual(r.fase, 'giocatore');
});
