import test from 'node:test';
import assert from 'node:assert/strict';
import { creaSaloni } from '../../js/logica/saloni.js';
test('saloni separati, disponibilità condivisa', () => {
  const s = creaSaloni(['a', 'b', 'c'], 4);
  s.occupa('a', 2); s.occupa('b', 2);
  assert.equal(s.disponibile(2), 'c');
  assert.deepEqual(s.stato('c'), [false, false, false, false]);
  assert.equal(s.occupa('a', 2), false);
  s.occupa('c', 2);
  assert.equal(s.disponibile(2), null);
  s.libera('a', 2);
  assert.equal(s.disponibile(2), 'a');
});
