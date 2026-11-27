import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

const w = {};
await carica('assets/magazzino/carte.js', w);
const { disegno: D, carte: C } = await carica('assets/magazzino/disegno.js', w);

test('ogni carta dei due mazzi diventa un SVG con il suo nome', () => {
    for (const c of [...C.mazzoSiciliano(), ...C.mazzoFrancese({ jolly: 2 })]) {
        const s = D.carta(c);
        assert.ok(s.startsWith('<svg'), c.id);
        assert.ok(s.includes(`<title>${D.nome(c, 'it')}</title>`), c.id);
        assert.ok(s.includes('viewBox="0 0 200 300"'), c.id);
    }
});

test('nomi in italiano e in inglese', () => {
    assert.equal(D.nome({ seme: 'spade', valore: 9 }, 'it'), 'Cavallo di spade');
    assert.equal(D.nome({ seme: 'denari', valore: 1 }, 'it'), 'Asso di denari');
    assert.equal(D.nome({ seme: 'bastoni', valore: 7 }, 'en'), 'Seven of clubs');
    assert.equal(D.nome({ seme: 'coppe', valore: 8 }, 'en'), 'Jack of cups');
    assert.equal(D.nome({ seme: 'cuori', valore: 12 }, 'en'), 'Queen of hearts');
    assert.equal(D.nome({ seme: 'picche', valore: 10 }, 'it'), 'Dieci di picche');
    assert.equal(D.nome({ seme: 'jolly', valore: 0 }, 'it'), 'Jolly');
    assert.equal(D.nome({ seme: 'jolly', valore: 0 }, 'en'), 'Joker');
});

test('dorso dei due mazzi', () => {
    assert.ok(D.dorso('siciliane').startsWith('<svg') && D.dorso('francesi').startsWith('<svg'));
    assert.notEqual(D.dorso('siciliane'), D.dorso('francesi'));
});
