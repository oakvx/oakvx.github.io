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
    assert.equal(p.usaPistola({ ...ok, puntatoreFine: false }), true);
    assert.equal(p.usaPistola({ ...ok, larghezza: 390 }), true);
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

test('rinculo: molla smorzata, scatto in ~30 ms, piccolo rimbalzo, poi fermo', () => {
    assert.equal(p.rinculo(299), 0);
    const curva = Array.from({ length: 80 }, (_, i) => p.rinculo(300 + i * 5));
    const picco = Math.max(...curva);
    const quando = 300 + curva.indexOf(picco) * 5;
    assert.ok(picco > .95 && picco <= 1.0001, 'picco ' + picco);
    assert.ok(quando >= 320 && quando <= 345, 'picco a ' + quando);
    assert.ok(Math.min(...curva) < -.05, 'nessun rimbalzo');      // scende un filo sotto lo zero
    assert.ok(Math.abs(p.rinculo(800)) < .02);
});
test('carrello: arretra in 15 ms e torna avanti entro 60 ms', () => {
    assert.equal(p.carrello(299), 0);
    assert.equal(p.carrello(315), 1);
    assert.ok(p.carrello(330) > 0 && p.carrello(330) < 1);
    assert.equal(p.carrello(361), 0);
});

test('traiettoria: parte dalla volata, arriva alla camera, esce lungo la canna', () => {
    const a = [0, 0, 0], asse = [1, 0, 0], b = [0, 0, 5];
    assert.deepEqual(p.traiettoria(0, a, asse, b), a);
    assert.deepEqual(p.traiettoria(1, a, asse, b).map(n => +n.toFixed(9)), b);
    const q = p.traiettoria(0.001, a, asse, b), l = Math.hypot(...q);
    assert.ok(q[0] / l > 0.999);   // la tangente all'uscita è l'asse della canna
});
