// Caricatore degli asset (gioco/asset/, vedi asset/LEGGIMI.md): texture PBR, panorami HDR, modelli .glb.
// Ogni richiesta che fallisce o tarda oltre il timeout restituisce null (e un avviso in console):
// il gioco va avanti con i materiali semplici. Tiene il conto di quanti asset sono arrivati.
import * as THREE from 'three';
import { GLTFLoader } from '../../vendor/three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from '../../vendor/three/addons/loaders/HDRLoader.js';

export function creaCaricatore({ base = 'asset/', timeout = 15000 } = {}) {
  const tex = new THREE.TextureLoader();
  const hdrLoader = new HDRLoader();
  const gltf = new GLTFLoader();
  const cache = new Map();
  const ascoltatori = new Set();
  let fatti = 0, totali = 0;
  let elencoP = null;

  const avvisa = () => ascoltatori.forEach((fn) => fn({ fatti, totali }));
  const conTimeout = (p, id) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), timeout))])
    .catch((e) => { console.warn('asset: ' + id + ' (' + (e && e.message) + ')'); return null; });
  // ogni asset conta una volta, anche se richiesto da più stanze
  function traccia(chiave, crea) {
    if (cache.has(chiave)) return cache.get(chiave);
    totali++;
    avvisa();
    const p = conTimeout(crea(), chiave).finally(() => { fatti++; avvisa(); });
    cache.set(chiave, p);
    return p;
  }
  const elenco = () => (elencoP ||= fetch(base + 'elenco.json').then((r) => (r.ok ? r.json() : null)).catch(() => null)
    .then((e) => e || { texture: {}, hdr: {}, modelli: {} }));
  const carica = (loader, url) => new Promise((ok, no) => loader.load(url, ok, undefined, no));

  return {
    elenco,
    texture: (id) => traccia('texture:' + id, async () => {
      const voce = (await elenco()).texture[id];
      if (!voce) throw new Error('non in elenco');
      const [diff, nor, arm] = await Promise.all(['diff', 'nor', 'arm'].map((k) => carica(tex, base + voce.file[k])));
      for (const t of [diff, nor, arm]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; }
      diff.colorSpace = THREE.SRGBColorSpace;
      return { map: diff, normalMap: nor, aoMap: arm, roughnessMap: arm, metalnessMap: arm };
    }),
    hdr: (id) => traccia('hdr:' + id, async () => {
      const voce = (await elenco()).hdr[id];
      if (!voce) throw new Error('non in elenco');
      const t = await carica(hdrLoader, base + voce.file);
      t.mapping = THREE.EquirectangularReflectionMapping;
      return t;
    }),
    // il modello originale resta in cache; ogni chiamata ne riceve una copia
    modello: (id) => traccia('modello:' + id, async () => {
      const voce = (await elenco()).modelli[id];
      if (!voce) throw new Error('non in elenco');
      const g = await carica(gltf, base + voce.file);
      g.scene.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      return g.scene;
    }).then((s) => (s ? s.clone(true) : null)),
    progresso: () => ({ fatti, totali }),
    suProgresso: (fn) => { ascoltatori.add(fn); fn({ fatti, totali }); },
    tutti: () => Promise.all([...cache.values()]),
  };
}
