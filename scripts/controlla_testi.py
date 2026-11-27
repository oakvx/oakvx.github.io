#!/usr/bin/env python3
"""Segnala le frasi ripetute tra le pagine del sito.

Legge il testo visibile italiano dei corpi in scripts/pagine/corpi/*.html (testata e
colophon esclusi), lo normalizza e riporta:
- ogni sequenza di LUNGHEZZA parole presente in due o più pagine;
- i giri ricorrenti di GIRI che compaiono più di una volta nel sito.
Esce con 1 se trova qualcosa.

Uso: python3 scripts/controlla_testi.py
"""
from __future__ import annotations

import html
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORPI = ROOT / 'scripts' / 'pagine' / 'corpi'
LUNGHEZZA = 5
GIRI = ['quando la userei io', 'non subito ma rispondo', 'garanzie scadute', 'errori compresi', 'più o meno']
# pagine che non sono testo del sito: vecchia versione e crediti
ESCLUSE = {'classic', 'credits'}


def testo(sorgente: str) -> str:
    """Testo visibile, minuscolo, senza punteggiatura né attributi."""
    s = re.sub(r'<(script|style)\b.*?</\1>', ' ', sorgente, flags=re.S | re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(s).lower().replace('’', "'")
    s = re.sub(r"[^\w']+", ' ', s)
    return ' '.join(s.split())


def _sequenze(parole: list[str], n: int) -> set[str]:
    return {' '.join(parole[i:i + n]) for i in range(len(parole) - n + 1)}


def ripetizioni(pagine: dict[str, str], lunghezza: int = LUNGHEZZA) -> dict[str, list[str]]:
    dove: dict[str, set[str]] = defaultdict(set)
    for nome, sorgente in pagine.items():
        for seq in _sequenze(testo(sorgente).split(), lunghezza):
            dove[seq].add(nome)
    return {seq: sorted(n) for seq, n in dove.items() if len(n) > 1}


def giri_ripetuti(pagine: dict[str, str]) -> dict[str, int]:
    conta: Counter[str] = Counter()
    for sorgente in pagine.values():
        t = ' ' + testo(sorgente) + ' '
        for giro in GIRI:
            conta[giro] += t.count(' ' + giro + ' ')
    return {g: n for g, n in conta.items() if n > 1}


def main() -> int:
    pagine = {p.stem: p.read_text(encoding='utf-8') for p in sorted(CORPI.glob('*.html')) if p.stem not in ESCLUSE}
    rip = ripetizioni(pagine)
    giri = giri_ripetuti(pagine)
    for seq, nomi in sorted(rip.items(), key=lambda x: (-len(x[1]), x[0])):
        print(f'ripetuta  {", ".join(nomi):40}  {seq}')
    for giro, n in sorted(giri.items()):
        print(f'giro      {n} volte{"":33}  {giro}')
    print(f'{len(rip)} sequenze ripetute, {len(giri)} giri ripetuti', file=sys.stderr)
    return 1 if rip or giri else 0


if __name__ == '__main__':
    sys.exit(main())
