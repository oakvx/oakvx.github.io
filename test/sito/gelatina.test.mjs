import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

const { gelatina: g } = await carica('assets/nero/gelatina.js');

test('passo: la molla porta il quadratino sul bersaglio e lo ferma', () => {
    let s = { x: 0, y: 0, vx: 0, vy: 0 };
    for (let i = 0; i < 120; i++) s = g.passo(s, { x: 10, y: 0 }, 1 / 60);
    assert.ok(Math.abs(s.x - 10) < .01, `x=${s.x}`);
    assert.ok(Math.abs(s.vx) < .05, `vx=${s.vx}`);
});

test('passo: con i valori predefiniti rimbalza oltre il bersaglio almeno una volta', () => {
    let s = { x: 0, y: 0, vx: 0, vy: 0 }, oltre = false;
    for (let i = 0; i < 120; i++) { s = g.passo(s, { x: 10, y: 0 }, 1 / 60); if (s.x > 10) oltre = true; }
    assert.ok(oltre);
});

test('passo: non modifica lo stato che riceve', () => {
    const s = { x: 0, y: 0, vx: 0, vy: 0 };
    g.passo(s, { x: 5, y: 5 }, 1 / 60);
    assert.deepEqual(s, { x: 0, y: 0, vx: 0, vy: 0 });
});

test('forma: fermo è un quadratino normale, in corsa si allunga e conserva l’area', () => {
    assert.deepEqual({ ...g.forma({ x: 0, y: 0, vx: 0, vy: 0 }) }, { sx: 1, sy: 1, rot: 0 });   // copia: l'oggetto viene da un altro contesto vm
    const f = g.forma({ x: 0, y: 0, vx: 2000, vy: 0 });
    assert.ok(f.sx > 1 && f.sx <= 1.18, `sx=${f.sx}`);
    assert.ok(Math.abs(f.sx * f.sy - 1) < 1e-9);
    assert.equal(g.forma({ x: 0, y: 0, vx: 1e6, vy: 0 }).sx, 1.18);
    assert.equal(Math.round(g.forma({ x: 0, y: 0, vx: 0, vy: 500 }).rot), 90);
});
