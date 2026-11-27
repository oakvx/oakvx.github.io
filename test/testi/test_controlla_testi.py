import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts'))
import controlla_testi as ct  # noqa: E402


class TestControllaTesti(unittest.TestCase):
    def test_ripetizione_tra_pagine(self):
        pagine = {
            'a': '<main><p>Scrivo codice che funziona anche il lunedì mattina.</p></main>',
            'b': '<main><h2>Altro</h2><p>Di solito scrivo codice che funziona anche il lunedì.</p></main>',
        }
        trovate = ct.ripetizioni(pagine, lunghezza=5)
        self.assertIn('scrivo codice che funziona anche', trovate)
        self.assertEqual(sorted(trovate['scrivo codice che funziona anche']), ['a', 'b'])

    def test_stessa_pagina_non_conta(self):
        pagine = {'a': '<p>uno due tre quattro cinque. uno due tre quattro cinque.</p>', 'b': '<p>niente</p>'}
        self.assertEqual(ct.ripetizioni(pagine, lunghezza=5), {})

    def test_giro_vietato_due_volte(self):
        pagine = {'a': '<p>Rispondo. Non subito, ma rispondo.</p>', 'b': '<p>Non subito, ma rispondo!</p>'}
        self.assertEqual(ct.giri_ripetuti(pagine), {'non subito ma rispondo': 2})

    def test_giro_una_volta_va_bene(self):
        self.assertEqual(ct.giri_ripetuti({'a': '<p>Errori compresi.</p>'}), {})

    def test_attributi_e_script_ignorati(self):
        self.assertEqual(ct.testo('<p data-en="hidden words here">Ciao <script>var x = 1</script>mondo</p>'), 'ciao mondo')


if __name__ == '__main__':
    unittest.main()
