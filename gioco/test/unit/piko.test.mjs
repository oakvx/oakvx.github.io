import test from 'node:test';
import assert from 'node:assert/strict';
import { creaPianificatore } from '../../js/logica/piko.js';
test('approva solo dopo aver scelto il piano giusto', () => {
  const p = creaPianificatore([{ esito: 'pozzo' }, { esito: 'apre' }]);
  assert.equal(p.attuale(), 0);
  assert.equal(p.approva(), 'pozzo');
  assert.equal(p.rifiuta(), 1);
  assert.equal(p.approva(), 'apre');
  assert.equal(p.rifiuta(), 0);
});
