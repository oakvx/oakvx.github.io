import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';
import { domFinto } from './dom-finto.mjs';

const finestra = { document: domFinto() };
await carica('assets/magazzino/carte.js', finestra);
await carica('assets/magazzino/disegno.js', finestra);
const { tavolo: T } = await carica('assets/magazzino/tavolo.js', finestra);
const doc = finestra.document;
const carta = (seme, valore) => ({ id: `${seme}-${valore}`, seme, valore });

test('mostra: una carta della mano è un bottone, e il tocco la gioca', () => {
    const radice = doc.createElement('div'), giocate = [];
    const t = T.monta(radice, { onGioca: i => giocate.push(i) });
    t.mostra({ mano: [carta('denari', 1), carta('spade', 9), carta('coppe', 3)], avversari: [{ nome: 'Computer', carte: 3 }], tavolo: [], azioni: [], messaggio: 'Tocca a te' });
    const mano = radice.querySelector('.tavolo__mano');
    const bottoni = mano.querySelectorAll('button');
    assert.equal(bottoni.length, 3);
    assert.equal(bottoni[1].getAttribute('aria-label'), 'Cavallo di spade');
    bottoni[1].click();
    assert.deepEqual(giocate, [1]);
});

test('mostra: le azioni chiamano onAzione, quelle spente no', () => {
    const radice = doc.createElement('div'), azioni = [];
    const t = T.monta(radice, { onAzione: n => azioni.push(n) });
    t.mostra({ mano: [], avversari: [], tavolo: [], azioni: [{ nome: 'carta', etichetta: 'Carta', attiva: true }, { nome: 'dividi', etichetta: 'Dividi', attiva: false }], messaggio: '' });
    const [a, b] = radice.querySelector('.tavolo__azioni').querySelectorAll('button');
    a.click(); b.click();
    assert.deepEqual(azioni, ['carta']);
    assert.equal(b.getAttribute('disabled'), '');
});

test('mostra: le carte del tavolo si toccano quando onTavolo c’è', () => {
    const radice = doc.createElement('div'), scelte = [];
    const t = T.monta(radice, { onTavolo: i => scelte.push(i) });
    t.mostra({ mano: [], avversari: [], tavolo: [carta('denari', 7), carta('coppe', 2)], azioni: [], messaggio: '' });
    radice.querySelector('.tavolo__centro').querySelectorAll('button')[1].click();
    assert.deepEqual(scelte, [1]);
});

test('annuncia scrive nella regione per i lettori di schermo', () => {
    const radice = doc.createElement('div');
    const t = T.monta(radice, {});
    t.annuncia('Il computer gioca il tre di coppe');
    const r = radice.querySelector('.tavolo__annuncio');
    assert.equal(r.getAttribute('aria-live'), 'polite');
    assert.equal(r.textContent, 'Il computer gioca il tre di coppe');
});

test('una carta coperta sul tavolo mostra il dorso e non il suo nome', () => {
    const radice = doc.createElement('div');
    const t = T.monta(radice, {});
    t.mostra({ dorso: 'francesi', mano: [], avversari: [], tavolo: [carta('cuori', 10), { coperta: true, id: 'coperta' }], azioni: [], messaggio: '' });
    const posti = radice.querySelector('.tavolo__centro').children;
    assert.equal(posti[1].getAttribute('aria-label'), 'Carta coperta');
    assert.ok(posti[1].children[0].innerHTML.includes('Dorso'));
});
