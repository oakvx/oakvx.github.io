import test from 'node:test';
import assert from 'node:assert/strict';
import { leggiConteggi } from '../../scripts/instagram_pagina.mjs';

test('legge i conteggi dalla descrizione inglese', () => {
    assert.deepEqual(leggiConteggi('1,234 Followers, 56 Following, 78 Posts - See Instagram photos and videos from oakvx'),
        { follower: 1234, seguiti: 56, post: 78 });
});
test('legge i suffissi K e M', () => {
    assert.deepEqual(leggiConteggi('12.3K Followers, 1 Following, 2M Posts'), { follower: 12300, seguiti: 1, post: 2000000 });
});
test('legge la descrizione italiana', () => {
    assert.deepEqual(leggiConteggi('987 follower, 12 seguiti, 5 post - Foto e video di Instagram'), { follower: 987, seguiti: 12, post: 5 });
});
test('senza numeri completi non restituisce niente', () => {
    assert.equal(leggiConteggi('Login • Instagram'), null);
    assert.equal(leggiConteggi('10 Followers, 5 Following'), null);
});
