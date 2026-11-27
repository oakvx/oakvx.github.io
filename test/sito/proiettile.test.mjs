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
    assert.ok(p.faseVolo(301).lampo > .8);             // si spara dopo un'entrata senza fretta
    assert.equal(p.faseVolo(340).lampo, 0);            // la vampa non dura più di due fotogrammi
    assert.equal(p.faseVolo(200).lampo, 0);
    assert.ok(p.faseVolo(150).pistola > 0 && p.faseVolo(150).pistola < 1);
    assert.equal(p.faseVolo(290).pistola, 1);
    assert.equal(p.faseVolo(300).volo, 0);
    assert.ok(p.faseVolo(320).volo > 0 && p.faseVolo(320).volo < .001);   // appena uscito dalla canna
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
test('carrello: dopo l’uscita del proiettile arretra in 15 ms e torna avanti entro 60 ms', () => {
    assert.equal(p.carrello(299), 0);
    assert.equal(p.carrello(302), 0);                  // fermo finché il proiettile non è uscito
    assert.equal(p.carrello(317), 1);
    assert.ok(p.carrello(330) > 0 && p.carrello(330) < 1);
    assert.equal(p.carrello(362), 0);
});

test('traiettoria: parte dalla volata, arriva alla camera, esce lungo la canna', () => {
    const a = [0, 0, 0], asse = [1, 0, 0], b = [0, 0, 5];
    assert.deepEqual(p.traiettoria(0, a, asse, b), a);
    assert.deepEqual(p.traiettoria(1, a, asse, b).map(n => +n.toFixed(9)), b);
    const q = p.traiettoria(0.001, a, asse, b), l = Math.hypot(...q);
    assert.ok(q[0] / l > 0.999);   // la tangente all'uscita è l'asse della canna
});

test('centroCanna: centro dell’anello più avanti, ignorando il resto del carrello', () => {
    const punti = [];
    for (let i = 0; i < 16; i++) {
        const a = i / 16 * Math.PI * 2;
        punti.push([.2, .05 + Math.cos(a) * .01, .002 + Math.sin(a) * .01]);
    }
    for (let i = 0; i < 40; i++) punti.push([.1 + (i % 9) * .01, .03 + (i % 5) * .01, -.01 + (i % 3) * .01]);
    const c = p.centroCanna(punti);
    assert.ok(Math.abs(c[0] - .2) < 1e-6 && Math.abs(c[1] - .05) < 1e-6 && Math.abs(c[2] - .002) < 1e-6, String(c));
});

test('centroCanna: il mirino sopra la volata non sposta il centro', () => {
    const punti = [];
    for (let i = 0; i < 24; i++) {
        const a = i / 24 * Math.PI * 2;
        for (const r of [.0045, .0075]) punti.push([.2, .061 + Math.cos(a) * r, Math.sin(a) * r]);
    }
    punti.push([.2, .074, -.001], [.2, .074, .001], [.199, .0745, 0]);   // mirino
    const c = p.centroCanna(punti);
    assert.ok(Math.abs(c[1] - .061) < .0005 && Math.abs(c[2]) < .0005, String(c));
});

test('ordine degli eventi dello sparo, come in una semiautomatica vera', () => {
    const S = p.SPARO_MS, campioni = [];
    for (let ms = S - 20; ms <= S + 400; ms++) campioni.push({ ms, f: p.faseVolo(ms), c: p.carrello(ms), r: p.rinculo(ms), b: p.bossolo(ms) });
    const primo = cond => campioni.find(cond)?.ms;
    // 1. lampo e uscita del proiettile nello stesso istante
    assert.equal(primo(x => x.f.lampo > 0), S);
    assert.ok(primo(x => x.f.volo > 0) - S <= 1, 'il proiettile esce dopo il lampo');
    // 2. il carrello si muove solo dopo l'uscita del proiettile
    assert.ok(primo(x => x.c > 0) > S, 'carrello prima del proiettile');
    // 3. carrello in fondo prima del massimo rilevamento della canna
    const fondo = primo(x => x.c >= .999);
    const piccoR = campioni.reduce((a, x) => x.r > a.r ? x : a).ms;
    assert.ok(fondo < piccoR, `carrello in fondo a ${fondo}, rilevamento massimo a ${piccoR}`);
    // 4. il bossolo esce quando il carrello ha fatto almeno l'80% della corsa
    const esce = primo(x => x.b > 0);
    assert.ok(campioni.find(x => x.ms === esce).c >= .8 || campioni.filter(x => x.ms < esce).some(x => x.c >= .8), 'bossolo troppo presto');
    // 5. il lampo dura al massimo due fotogrammi
    assert.ok(campioni.filter(x => x.f.lampo > 0).every(x => x.ms <= S + 34), 'lampo troppo lungo');
});
