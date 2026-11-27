#!/usr/bin/env bash
# Scarica da Poly Haven (CC0) i modelli del Magazzino 3D e li converte in GLB leggeri:
# mesh quantizzate, texture WebP a 1024 px.
#
#   scripts/prepara_modelli_magazzino.sh [cartella di lavoro]
#
# Serve node e npm (installa @gltf-transform/cli e sharp nella cartella di lavoro).
# Con GT=/percorso/di/gltf-transform si usa un'installazione già pronta.
set -euo pipefail
LAVORO=${1:-$(mktemp -d)}
USCITA="$(cd "$(dirname "$0")/.." && pwd)/assets/magazzino/modelli"
MODELLI="steel_frame_shelves_01 hanging_industrial_lamp hand_truck cardboard_box_01"
mkdir -p "$LAVORO" "$USCITA"
if [ -z "${GT:-}" ]; then
    (cd "$LAVORO" && npm init -y >/dev/null && npm install --silent @gltf-transform/cli sharp)
    GT="$LAVORO/node_modules/.bin/gltf-transform"
fi
for m in $MODELLI; do
    mkdir -p "$LAVORO/$m"
    python3 - "$m" "$LAVORO/$m" <<'PY'
import json, os, sys, urllib.request
urllib.request.install_opener(urllib.request.build_opener())
opener = urllib.request.build_opener(); opener.addheaders = [('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120 Safari/537.36')]; urllib.request.install_opener(opener)
nome, cartella = sys.argv[1:3]
f = json.load(urllib.request.urlopen(f'https://api.polyhaven.com/files/{nome}'))['gltf']['1k']['gltf']
def scarica(url, dest):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    urllib.request.urlretrieve(url, dest)
scarica(f['url'], os.path.join(cartella, f'{nome}.gltf'))
for rel, v in f['include'].items():
    scarica(v['url'], os.path.join(cartella, rel))
PY
    "$GT" optimize "$LAVORO/$m/$m.gltf" "$USCITA/$m.glb" --compress quantize --texture-compress webp --texture-size 1024
done
du -ch "$USCITA"/*.glb | tail -1
