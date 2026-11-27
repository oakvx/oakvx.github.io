import test from 'node:test';
import assert from 'node:assert/strict';
import { carica } from './carica.mjs';

test('il dizionario inglese si carica in un contesto browser finto', async () => {
    const finestra = await carica('assets/nero/i18n-en.js', {}, { tutto: true });
    assert.equal(typeof finestra.OAKVX_EN, 'object');
    assert.equal(finestra.OAKVX_EN['nav.home'], 'Entrance');
});
