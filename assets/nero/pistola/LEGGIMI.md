# Pistola della transizione

`pistola.glb` è il modello **Service Pistol** di Poly Haven, autore Mateusz Sadek,
licenza **CC0** (pubblico dominio): <https://polyhaven.com/a/service_pistol>.

Modifiche rispetto all'originale (glTF 1k, 3,3 MB):

- un solo file GLB;
- geometria quantizzata (`KHR_mesh_quantization`), nessuna semplificazione;
- texture diffusa, normale e metallo/rugosità ricompresse in WebP a 1024 px (`EXT_texture_webp`).

Risultato: circa 1,1 MB. Comando usato, con gltf-transform 4.5:

```bash
gltf-transform optimize service_pistol.gltf pistola.glb --compress quantize --texture-compress webp --texture-size 1024 --simplify false
```

Viene caricata solo su computer (puntatore fine, schermo largo almeno 900 px, WebGL),
dopo il caricamento della pagina, da `assets/nero/pistola.js`.
