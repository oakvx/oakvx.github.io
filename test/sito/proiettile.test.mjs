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

test('arrivoValido: solo un segnale scritto da meno di 3 secondi', () => {
    const adesso = 1_000_000;
    assert.equal(p.arrivoValido(String(adesso - 500), adesso), true);
    assert.equal(p.arrivoValido(String(adesso - 3500), adesso), false);   // es. dopo un giro nel gioco
    assert.equal(p.arrivoValido('1', adesso), false);                     // vecchio formato
    assert.equal(p.arrivoValido(null, adesso), false);
    assert.equal(p.arrivoValido(String(adesso + 10_000), adesso), false); // orologio indietro
});

test('fase: il proiettile si vede uscire dalla canna, il fumo dura fino alla fine', () => {
    assert.equal(p.fase(170).proiettile, 0);
    assert.ok(p.fase(220).proiettile > 0 && p.fase(220).proiettile < .3);
    assert.equal(p.fase(450).proiettile, 1);
    assert.equal(p.fase(170).fumo, 0);
    assert.ok(p.fase(500).fumo > 0 && p.fase(500).fumo < 1);
    assert.equal(p.fase(p.USCITA_MS).fumo, 1);
});
test('fase: il lampo è un picco che si spegne in fretta', () => {
    assert.equal(p.fase(140).lampo, 0);
    assert.ok(p.fase(160).lampo > .8);
    assert.ok(p.fase(230).lampo < .2);
    assert.equal(p.fase(300).lampo, 0);
});

test('cubica: parte lenta, finisce lenta, simmetrica', () => {
    assert.equal(p.cubica(0), 0);
    assert.equal(p.cubica(1), 1);
    assert.equal(p.cubica(.5), .5);
    assert.ok(p.cubica(.1) < .01);
    assert.ok(Math.abs(p.cubica(.2) + p.cubica(.8) - 1) < 1e-9);
});

test('faseVolo: con la pistola il proiettile vola verso chi guarda fino a coprire lo schermo', () => {
    assert.equal(p.VOLO_MS, 1400);
    const f0 = p.faseVolo(0);
    assert.equal(f0.volo, 0);
    assert.equal(f0.copertura, 0);
    assert.ok(p.faseVolo(310).lampo > .8);             // si spara dopo un'entrata senza fretta
    assert.equal(p.faseVolo(200).lampo, 0);
    assert.ok(p.faseVolo(150).pistola > 0 && p.faseVolo(150).pistola < 1);
    assert.equal(p.faseVolo(290).pistola, 1);
    assert.equal(p.faseVolo(320).volo, 0);
    assert.ok(p.faseVolo(700).volo > 0 && p.faseVolo(700).volo < .5);   // parte lento, poi accelera
    assert.equal(p.faseVolo(1300).volo, 1);
    assert.equal(p.faseVolo(1200).copertura, 0);
    assert.equal(p.faseVolo(p.VOLO_MS).copertura, 1);
    assert.equal(p.faseVolo(400).pistola, 1);
    assert.equal(p.faseVolo(p.VOLO_MS).pistola, 0);
});

test('rinculo: scatto rapido verso l\'alto, poi torna fermo', () => {
    assert.equal(p.rinculo(299), 0);
    const picco = Math.max(...[310, 320, 330, 340, 350].map(p.rinculo));
    assert.ok(picco > .6 && picco <= 1);
    assert.ok(p.rinculo(330) > p.rinculo(500));
    assert.ok(p.rinculo(800) < .02);
});
