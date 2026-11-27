#!/usr/bin/env python3
"""Aggiorna instagram:oakvx in assets/social/manuale.json leggendo il profilo con agent-reach.

Uso: python3 scripts/aggiorna_instagram.py [--input risposta.json]
Senza --input lancia `agent-reach instagram profile oakvx`. Scrive solo se trova
follower, seguiti e post come numeri: in ogni altro caso (login richiesto, blocco,
limite di richieste, formato diverso) non tocca niente ed esce con 0, così il
workflow non diventa rosso per un'indisponibilità di Instagram."""
import argparse
import datetime
import json
import subprocess
import sys
from pathlib import Path

SITO = Path(__file__).resolve().parents[1]
MANUALE = SITO / 'assets' / 'social' / 'manuale.json'
CHIAVE = 'instagram:oakvx'
ACCOUNT = 'oakvx'
NOMI = {
    'follower': ('follower_count', 'followers_count', 'followers', 'follower', 'edge_followed_by'),
    'seguiti': ('following_count', 'follows_count', 'following', 'seguiti', 'edge_follow'),
    'post': ('media_count', 'posts_count', 'post_count', 'posts', 'post', 'edge_owner_to_timeline_media'),
}


def numero(v):
    if isinstance(v, bool):
        return None
    if isinstance(v, int):
        return v
    if isinstance(v, float) and v.is_integer():
        return int(v)
    if isinstance(v, str) and v.strip().isdigit():
        return int(v.strip())
    if isinstance(v, dict) and 'count' in v:  # edge_followed_by: {"count": N}
        return numero(v['count'])
    return None


def cerca(nodo, nomi):
    """Primo valore numerico trovato sotto una delle chiavi, in profondità."""
    if isinstance(nodo, dict):
        for n in nomi:
            if n in nodo and numero(nodo[n]) is not None:
                return numero(nodo[n])
        for v in nodo.values():
            r = cerca(v, nomi)
            if r is not None:
                return r
    elif isinstance(nodo, list):
        for v in nodo:
            r = cerca(v, nomi)
            if r is not None:
                return r
    return None


def conteggi(risposta):
    if not isinstance(risposta, dict) or risposta.get('ok') is not True:
        return None
    r = {k: cerca(risposta.get('items'), n) for k, n in NOMI.items()}
    return r if all(v is not None for v in r.values()) else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input')
    a = ap.parse_args()
    if a.input:
        testo = Path(a.input).read_text(encoding='utf-8')
    else:
        p = subprocess.run(['agent-reach', 'instagram', 'profile', ACCOUNT], capture_output=True, text=True, timeout=300)
        testo = p.stdout
    try:
        risposta = json.loads(testo.strip().splitlines()[-1])
    except (json.JSONDecodeError, IndexError):
        print('Risposta non leggibile, nessuna modifica.')
        return 0
    c = conteggi(risposta)
    if c is None:
        err = (risposta.get('error') or {}) if isinstance(risposta, dict) else {}
        print('Nessun conteggio utilizzabile, nessuna modifica.', err.get('code', ''), err.get('hint', ''))
        return 0
    manuale = json.loads(MANUALE.read_text(encoding='utf-8'))
    nuovo = {**c, 'aggiornato': datetime.date.today().isoformat()}
    vecchio = manuale.get(CHIAVE, {})
    if all(vecchio.get(k) == nuovo[k] for k in c):
        print('Conteggi invariati.')
        return 0
    manuale[CHIAVE] = nuovo
    MANUALE.write_text(json.dumps(manuale, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print('Aggiornato:', nuovo)
    return 0


if __name__ == '__main__':
    sys.exit(main())
