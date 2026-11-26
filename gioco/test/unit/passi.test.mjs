import test from 'node:test';
import assert from 'node:assert/strict';
import { creaContapassi } from '../../js/logica/passi.js';
test('un passo ogni 0,55 m, col resto', () => {
  const c = creaContapassi(0.55);
  assert.equal(c.avanza(0.5), 0);
  assert.equal(c.avanza(0.1), 1);
  assert.equal(c.avanza(1.1), 2);
  assert.equal(c.avanza(0), 0);
});
