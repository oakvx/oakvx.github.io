import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

const { proiettile: p } = await carica('assets/nero/proiettile.js');
const ev = (x = {}) => ({ button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false, ...x });
const link = (href, x = {}) => ({ href: new URL(href, 'https://oakvx.github.io/').href, target: '', download: false, ...x });
const pag = href => ({ href: new URL(href, 'https://oakvx.github.io/').href });

test('vaFatta: link interno verso un’altra pagina', () => {
    assert.equal(p.vaFatta(ev(), link('/chi-sono/'), pag('/'), false), true);
});
test('vaFatta: Ctrl, Cmd, Maiusc, Alt o tasto centrale aprono normalmente', () => {
    for (const x of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }]) {
        assert.equal(p.vaFatta(ev(x), link('/chi-sono/'), pag('/'), false), false, JSON.stringify(x));
    }
});
test('vaFatta: nuova scheda, download, altra origine, mailto → niente sparo', () => {
    assert.equal(p.vaFatta(ev(), link('/chi-sono/', { target: '_blank' }), pag('/'), false), false);
    assert.equal(p.vaFatta(ev(), link('/assets/x.pdf', { download: true }), pag('/'), false), false);
    assert.equal(p.vaFatta(ev(), link('https://github.com/oakvx'), pag('/'), false), false);
    assert.equal(p.vaFatta(ev(), link('mailto:a@b.c'), pag('/'), false), false);
});
test('vaFatta: stessa pagina con ancora → scorrimento normale', () => {
    assert.equal(p.vaFatta(ev(), link('/#lavori'), pag('/'), false), false);
    assert.equal(p.vaFatta(ev(), link('/chi-sono/#oggi'), pag('/chi-sono/'), false), false);
});
test('vaFatta: con movimento ridotto non spara mai', () => {
    assert.equal(p.vaFatta(ev(), link('/chi-sono/'), pag('/'), true), false);
});
test('usaPistola: solo puntatore fine, almeno 900px, WebGL e senza calma', () => {
    const ok = { puntatoreFine: true, larghezza: 1440, webgl: true, calmo: false };
    assert.equal(p.usaPistola(ok), true);
    assert.equal(p.usaPistola({ ...ok, puntatoreFine: false }), false);
    assert.equal(p.usaPistola({ ...ok, larghezza: 899 }), false);
    assert.equal(p.usaPistola({ ...ok, webgl: false }), false);
    assert.equal(p.usaPistola({ ...ok, calmo: true }), false);
});
test('fase: inizio, sparo, proiettile, copertura', () => {
    const f0 = p.fase(0);
    for (const k of ['pistola', 'sparo', 'proiettile', 'fascio', 'copertura']) assert.equal(f0[k], 0, k);
    assert.ok(p.fase(180).sparo > 0);
    assert.equal(p.fase(480).proiettile, 1);
    assert.equal(p.fase(400).pistola, 1);
    assert.equal(p.fase(p.USCITA_MS).copertura, 1);
    assert.equal(p.fase(p.USCITA_MS).pistola, 0);
});
test('costanti dei tempi', () => {
    assert.equal(p.USCITA_MS, 900);
    assert.equal(p.ARRIVO_MS, 600);
});
