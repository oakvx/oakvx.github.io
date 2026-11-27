import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

const { regia: R } = await carica('assets/magazzino/regia.js');
const j = x => JSON.parse(JSON.stringify(x));
const vicino = (a, b, e = 1e-9) => Object.keys(b).every(k => Math.abs(a[k] - b[k]) < e);

test('posa: ogni gesto parte e torna a riposo, a metà è nel punto più ampio', () => {
    const riposo = j(R.posa('riposo', 0));
    for (const nome of ['prendi', 'lancia', 'gira', 'paga']) {
        assert.ok(vicino(j(R.posa(nome, 0)), riposo), nome + ' a 0');
        assert.ok(vicino(j(R.posa(nome, 1)), riposo), nome + ' a 1');
        const meta = j(R.posa(nome, .5));
        assert.ok(!vicino(meta, riposo, 1e-3), nome + ' a metà si muove');
        assert.ok(Object.values(meta).every(Number.isFinite));
    }
});

test('voloCarta: parte, arriva, si alza a metà e si gira durante il volo', () => {
    const da = [0, .9, -1], a = [.3, 0, .4];
    assert.deepEqual(j(R.voloCarta(0, da, a).pos), da);
    assert.deepEqual(j(R.voloCarta(1, da, a).pos).map(n => +n.toFixed(9)), a);
    const m = R.voloCarta(.5, da, a);
    assert.ok(m.pos[1] >= (da[1] + a[1]) / 2 + .25, 'arco');
    assert.equal(R.voloCarta(0, da, a).giro, 0);
    assert.equal(R.voloCarta(1, da, a).giro, 1);
});

test('postoCarta: le carte di una mano non si sovrappongono, le mani divise stanno affiancate', () => {
    const a = j(R.postoCarta('giocatore', 0, 0, 1)), b = j(R.postoCarta('giocatore', 0, 1, 1));
    assert.ok(b[0] - a[0] >= .1);
    const m1 = j(R.postoCarta('giocatore', 0, 3, 2)), m2 = j(R.postoCarta('giocatore', 1, 0, 2));
    assert.ok(m2[0] > m1[0] + .1, 'la seconda mano parte dopo l’ultima carta della prima');
    assert.ok(j(R.postoCarta('banco', 0, 0, 1))[2] < a[2], 'il banco sta più lontano');
});

test('pileFiches: il saldo torna, massimo 20 per pila, tutto dentro il tavolo', () => {
    for (const saldo of [0, 1, 37, 1000, 12345]) {
        const pile = R.pileFiches(saldo);
        assert.equal(pile.reduce((s, p) => s + p.valore * p.quante, 0), saldo);
        assert.ok(pile.every(p => p.quante >= 1 && p.quante <= 20));
        assert.ok(pile.every(p => R.dentroTavolo(p.x, p.z)), String(saldo));
    }
});

test('bocca: alterna aperta e chiusa ogni 110 ms', () => {
    assert.equal(R.bocca(0), 'aperta');
    assert.equal(R.bocca(115), 'chiusa');
    assert.equal(R.bocca(225), 'aperta');
});
