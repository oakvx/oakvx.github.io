import test from 'node:test';
import assert from 'node:assert/strict';
import { creaCalendario } from '../../js/logica/calendario.js';
test('niente doppie prenotazioni', () => {
  const c = creaCalendario({ inizio: 9, fine: 18, richieste: ['taglio', 'colore', 'piega'] });
  assert.equal(c.prenota('taglio', 9, 10), 'ok');
  assert.equal(c.prenota('colore', 9.5, 11), 'conflitto');
  assert.equal(c.prenota('colore', 10, 11), 'ok');
  assert.equal(c.prenota('piega', 17.5, 18.5), 'fuori');
  assert.equal(c.pieno(), false);
  assert.equal(c.prenota('piega', 11, 12), 'ok');
  assert.equal(c.pieno(), true);
  c.libera('colore');
  assert.equal(c.pieno(), false);
});
test('riprenotare lo stesso id sposta la prenotazione', () => {
  const c = creaCalendario({ inizio: 9, fine: 18, richieste: ['taglio'] });
  assert.equal(c.prenota('taglio', 9, 10), 'ok');
  assert.equal(c.prenota('taglio', 9.5, 10.5), 'ok');
  assert.equal(c.prenota('altro', 9, 9.5), 'ok');
});
