import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

const { deposito: D } = await carica('assets/magazzino/deposito.js');
const memoria = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m['delete'](k) }; };
const rotto = { getItem() { throw new Error('bloccato'); }, setItem() { throw new Error('bloccato'); }, removeItem() { throw new Error('bloccato'); } };

test('saldo iniziale 1000 e puntate valide', () => {
    const d = D.crea(memoria());
    assert.equal(d.saldo(), 1000);
    assert.equal(d.scommetti(300), true);
    assert.equal(d.saldo(), 700);
    d.paga(450);
    assert.equal(d.saldo(), 1150);
});

test('puntata oltre il saldo, zero, negativa o non intera: rifiutata, saldo invariato', () => {
    const d = D.crea(memoria());
    for (const n of [1500, 0, -10, 2.5, NaN, '100']) assert.equal(d.scommetti(n), false, String(n));
    assert.equal(d.saldo(), 1000);
});

test('il saldo resta tra una visita e l’altra', () => {
    const s = memoria();
    D.crea(s).scommetti(250);
    assert.equal(D.crea(s).saldo(), 750);
});

test('ricarica solo a zero', () => {
    const d = D.crea(memoria());
    d.ricarica();
    assert.equal(d.saldo(), 1000);
    d.scommetti(1000);
    assert.equal(d.saldo(), 0);
    d.ricarica();
    assert.equal(d.saldo(), 1000);
});

test('salva, riprendi e dimentica una partita', () => {
    const d = D.crea(memoria());
    const stato = { turno: 3, mano: [{ id: 'denari-1', seme: 'denari', valore: 1 }] };
    d.salva('briscola', stato);
    assert.deepEqual(JSON.parse(JSON.stringify(d.riprendi('briscola'))), stato);
    assert.equal(d.riprendi('scopa'), null);
    d.dimentica('briscola');
    assert.equal(d.riprendi('briscola'), null);
});

test('con localStorage bloccato funziona tutto in memoria', () => {
    const d = D.crea(rotto);
    assert.equal(d.saldo(), 1000);
    assert.equal(d.scommetti(100), true);
    assert.equal(d.saldo(), 900);
    d.salva('scopa', { a: 1 });
    assert.equal(d.riprendi('scopa').a, 1);
});

test('sotto la puntata minima si può ricaricare', () => {
    const d = D.crea(memoria());
    d.scommetti(995);
    assert.equal(d.saldo(), 5);
    d.ricarica();
    assert.equal(d.saldo(), 1000);
});
test('con localStorage bloccato due depositi vedono lo stesso saldo', () => {
    const bloccato = { ...rotto };   // uno tutto suo: la memoria è condivisa per oggetto
    const a = D.crea(bloccato); a.scommetti(250);
    assert.equal(D.crea(bloccato).saldo(), 750);
});
