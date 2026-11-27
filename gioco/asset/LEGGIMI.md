# Asset del gioco

Texture PBR (colore, normali, ARM = occlusione/rugosità/metallo), panorami HDR e modelli 3D scansionati,
tutti da **Poly Haven** (polyhaven.com), licenza **CC0** (pubblico dominio, nessun obbligo di citazione).
L'elenco completo con l'id originale di ogni asset è in `elenco.json`.

- `texture/<nome>/{diff,nor,arm}.jpg` — 1K
- `hdr/<nome>.hdr` — panorami 1K per la luce d'ambiente
- `modelli/<nome>.glb` — modelli 1K ottimizzati con @gltf-transform (texture WebP 1024)

Per rigenerare o aggiungere asset: modificare le tabelle in `gioco/strumenti/scarica-asset.mjs` e lanciare,
dalla radice del repo, `NODE_USE_ENV_PROXY=1 node gioco/strumenti/scarica-asset.mjs` (serve rete verso
api.polyhaven.com e dl.polyhaven.org). Il test `gioco/test/unit/asset.test.mjs` controlla licenze, file e peso (≤ 60 MB con i suoni).
