import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

// DOM finto quanto basta per spara(): elementi con classList e style, timer manuali.
function finestraFinta() {
    const timer = [];
    const elemento = () => {
        const classi = new Set();
        return {
            classList: { add: (...c) => c.forEach(x => classi.add(x)), remove: (...c) => c.forEach(x => classi.delete(x)), contains: c => classi.has(c) },
            style: { setProperty() {}, removeProperty() {} },
            setAttribute() {}, append() {}, prepend() {},
            set innerHTML(v) {}, set className(v) { v.split(' ').forEach(x => classi.add(x)); }
        };
    };
    const corpo = elemento();
    const w = {
        document: { createElement: elemento, body: corpo, visibilityState: 'visible', documentElement: elemento(), currentScript: null },
        location: { href: 'https://oakvx.github.io/' },
        sessionStorage: { setItem() {}, getItem() { return null; }, removeItem() {} },
        performance: { now: () => 0 },
        requestAnimationFrame: () => 0,
        setTimeout: (fn, ms) => { timer.push({ fn, ms }); return timer.length; },
        matchMedia: () => ({ matches: false }),
        innerHeight: 900, innerWidth: 1440,
        Date
    };
    return { w, timer };
}

test('se la navigazione non avviene, il fascio si toglie da solo', async () => {
    const { w, timer } = finestraFinta();
    const { proiettile: p } = await carica('assets/nero/proiettile.js', w);
    p.spara('https://oakvx.github.io/chi-sono/');
    const livello = p.creaLivello();
    assert.equal(livello.classList.contains('attivo'), true);
    // esegue i timer in ordine di scadenza, anche quelli aggiunti nel frattempo
    for (let i = 0; i < 10 && timer.length; i++) {
        timer.sort((a, b) => a.ms - b.ms);
        const { fn } = timer.shift();
        fn();
    }
    assert.equal(w.location.href, 'https://oakvx.github.io/chi-sono/');
    assert.equal(livello.classList.contains('attivo'), false, 'il livello copre ancora la pagina');
});
