import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

const w = {};
await carica('assets/magazzino/carte.js', w);
const { briscola: B, carte: C } = await carica('assets/magazzino/briscola.js', w);
const k = (seme, valore) => ({ id: `${seme}-${valore}`, seme, valore });

test('presa: il tre batte il re dello stesso seme', () => {
    assert.equal(B.presa(k('coppe', 10), k('coppe', 3), 'denari'), 1);
    assert.equal(B.presa(k('coppe', 3), k('coppe', 10), 'denari'), 0);
});
test('presa: una briscola qualunque batte un asso non di briscola', () => {
    assert.equal(B.presa(k('coppe', 1), k('denari', 2), 'denari'), 1);
});
test('presa: seme diverso senza briscola, prende chi ha giocato per primo', () => {
    assert.equal(B.presa(k('coppe', 2), k('spade', 1), 'denari'), 0);
});
test('punti: il mazzo intero vale 120', () => {
    assert.equal(B.punti(C.mazzoSiciliano()), 120);
});

test('nuova: tre carte a testa, la briscola scoperta in fondo al mazzo', () => {
    const s = B.nuova(5);
    assert.equal(s.mani[0].length, 3);
    assert.equal(s.mani[1].length, 3);
    assert.equal(s.mazzo.length, 34);
    assert.deepEqual({ ...s.mazzo[s.mazzo.length - 1] }, { ...s.briscola });
    assert.equal(s.semeBriscola, s.briscola.seme);
});

test('gioca: chi prende pesca per primo e gioca la mano dopo; a fine partita i punti fanno 120', () => {
    let s = B.nuova(11);
    let giri = 0;
    while (s.fase !== 'finita' && giri++ < 100) s = B.gioca(s, B.mossaComputer(s, 'difficile'));
    assert.equal(s.fase, 'finita');
    assert.equal(B.punti(s.prese[0]) + B.punti(s.prese[1]), 120);
    assert.equal(s.prese[0].length + s.prese[1].length, 40);
});

const conMano = (turno, tavolo, mano, semeBriscola = 'denari') => ({ mazzo: [], briscola: k(semeBriscola, 4), semeBriscola, mani: turno === 1 ? [[], mano] : [mano, []], prese: [[], []], tavolo, turno, fase: 'gioco' });

test('computer: se non può prendere butta la carta che vale meno', () => {
    const s = conMano(1, [{ carta: k('denari', 3), chi: 0 }], [k('coppe', 1), k('bastoni', 2), k('spade', 7)]);
    assert.equal(s.mani[1][B.mossaComputer(s, 'difficile')].id, 'bastoni-2');
});
test('computer: su un carico non di briscola prende con la briscola più bassa', () => {
    const s = conMano(1, [{ carta: k('coppe', 1), chi: 0 }], [k('denari', 7), k('denari', 2), k('spade', 4)]);
    assert.equal(s.mani[1][B.mossaComputer(s, 'difficile')].id, 'denari-2');
});
test('computer: di mano apre con una carta liscia, non con briscole o carichi', () => {
    const s = conMano(1, [], [k('coppe', 1), k('spade', 4), k('denari', 7)]);
    assert.equal(s.mani[1][B.mossaComputer(s, 'difficile')].id, 'spade-4');
});
