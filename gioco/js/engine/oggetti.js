// Oggetti scansionati (asset/modelli/*.glb) nelle stanze: li carica, li scala all'altezza voluta,
// li appoggia sul pavimento e gli dà un ingombro solido invisibile. Ogni stanza tiene il conto
// di quanti ne ha in scena (per i test e per il debug).
import * as THREE from 'three';

export function creaOggetti(m, g) {
  let quanti = 0;
  const box = new THREE.Box3();
  // id: nome del modello; (x, y, z): punto d'appoggio; ry: rotazione;
  // altezza: metri (scala uniforme); solido: crea l'ingombro; margine: riduce l'ingombro in pianta
  function metti(id, x, y, z, ry = 0, { altezza = null, scala = 1, solido = true, margine = 0.05 } = {}) {
    return g.asset.modello(id).then((o) => {
      if (!o) return null;
      o.rotation.y = ry;
      o.scale.setScalar(scala);
      o.updateMatrixWorld(true);
      box.setFromObject(o);
      if (altezza) {
        const h = box.max.y - box.min.y;
        if (h > 0) o.scale.multiplyScalar(altezza / h);
        o.updateMatrixWorld(true);
        box.setFromObject(o);
      }
      // appoggia la base del modello su y e centra in pianta su (x, z)
      o.position.set(x - (box.min.x + box.max.x) / 2, y - box.min.y, z - (box.min.z + box.max.z) / 2);
      o.updateMatrixWorld(true);
      m.scene.add(o);
      box.setFromObject(o);
      if (solido) m.box(box.min.x + margine, box.min.y, box.min.z + margine, box.max.x - margine, box.max.y, box.max.z - margine, m.mat.chiaro).mesh.visible = false;
      quanti++;
      return o;
    });
  }
  return { metti, quanti: () => quanti };
}
