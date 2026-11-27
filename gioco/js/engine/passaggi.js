// Passaggi fissi: varchi sempre aperti messi dalle stanze, per gli spazi non euclidei
// (corridoi più lunghi dentro che fuori, stanze che si ripetono, porte che cambiano meta).
// Ogni passaggio ha due facce, A e B: da A si vede (e si esce) dietro B, e viceversa.
// Si disegnano solo i `max` più vicini e visibili; gli altri mostrano il colore della nebbia.
import * as THREE from 'three';
import { matriceAttraverso, clipObliqua } from './proiezione.js';

const vertex = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
// crepa verticale frastagliata (uv in [0,1]²): < 0 dentro la crepa. Condivisa con lo squarcio della cisterna.
export const CREPA_GLSL = `
float crepa(vec2 uv){
  float y = uv.y;
  float c = 0.5 + 0.07 * sin(y * 23.0) + 0.045 * sin(y * 57.0 + 1.3) + 0.02 * sin(y * 131.0);
  float w = 0.03 + 0.42 * pow(sin(3.14159 * clamp(y, 0.0, 1.0)), 1.4) * (0.72 + 0.28 * sin(y * 41.0 + 0.7));
  return abs(uv.x - c) - w;
}`;
const fragment = `
uniform sampler2D tVista; uniform vec2 uRes; uniform float uAttivo; uniform vec3 uNebbia; uniform float uForma;
varying vec2 vUv;
${CREPA_GLSL}
void main(){
  if (uForma > 0.5 && crepa(vUv) > 0.0) discard;
  if (uAttivo < 0.5) { gl_FragColor = vec4(uNebbia, 1.0); return; }
  gl_FragColor = vec4(texture2D(tVista, gl_FragCoord.xy / uRes).rgb, 1.0);
}`;

// matrice di posa di una faccia: centro (x, y, z) e rotazione attorno a y
export const posa = (x, y, z, ry = 0) => new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z);

export class Passaggi {
  constructor(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.lista = new Map();
    this.res = new THREE.Vector2(2, 2);
    this.scala = 0.5;
    this.vcam = new THREE.PerspectiveCamera();
    this.vcam.matrixAutoUpdate = false;
    this.vcam.matrixWorldAutoUpdate = false;
    this.frustum = new THREE.Frustum();
    this.pool = [0, 1].map(() => new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType }));
    // texture vuota: nessuna faccia deve tenere legata la texture in cui si sta disegnando (feedback loop)
    this.vuota = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    this.vuota.needsUpdate = true;
  }

  ridimensiona(w, h, scala = this.scala) {
    this.scala = scala;
    this.res.set(w, h);
    for (const rt of this.pool) rt.setSize(Math.max(2, Math.floor(w * scala)), Math.max(2, Math.floor(h * scala)));
  }

  // forma: 'crepa' ritaglia la faccia a forma di squarcio (si attraversa comunque tutto il rettangolo)
  faccia(m, w, h, forma = null) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { tVista: { value: this.vuota }, uRes: { value: this.res }, uAttivo: { value: 0 }, uNebbia: { value: new THREE.Color(0x000000) }, uForma: { value: forma === 'crepa' ? 1 : 0 } },
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(m);
    mesh.matrixWorldNeedsUpdate = true;
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    return { m: m.clone(), inv: m.clone().invert(), mesh, mat };
  }

  // a, b: matrici (posizione + rotazione) del centro di ciascuna faccia; la faccia guarda verso +z locale
  aggiungi({ id, a, b, w = 1.4, h = 2.4, doppio = true, formaA = null }) {
    if (this.lista.has(id)) this.rimuovi(id);
    const p = { id, w, h, doppio, attivo: true, a: this.faccia(a, w, h, formaA), b: this.faccia(b, w, h) };
    p.b.mesh.visible = doppio;
    this.lista.set(id, p);
    return p;
  }

  rimuovi(id) {
    const p = this.lista.get(id);
    if (!p) return;
    for (const f of [p.a, p.b]) { this.scene.remove(f.mesh); f.mesh.geometry.dispose(); f.mat.dispose(); }
    this.lista.delete(id);
  }

  sposta(id, lato, m) {
    const f = this.lista.get(id)?.[lato];
    if (!f) return;
    f.m.copy(m);
    f.inv.copy(m).invert();
    f.mesh.matrix.copy(m);
    f.mesh.matrixWorldNeedsUpdate = true;
  }

  attiva(id, on) {
    const p = this.lista.get(id);
    if (!p) return;
    p.attivo = on;
    p.a.mesh.visible = on;
    p.b.mesh.visible = on && p.doppio;
  }

  // facce attraversabili: [faccia di partenza, faccia d'arrivo]
  *coppie() {
    for (const p of this.lista.values()) {
      if (!p.attivo) continue;
      yield [p.a, p.b, p];
      if (p.doppio) yield [p.b, p.a, p];
    }
  }

  attraversa(corpo) {
    if (!corpo.zPass) corpo.zPass = new Map();
    const l = new THREE.Vector3();
    for (const [P, Q, p] of this.coppie()) {
      l.copy(corpo.pos).applyMatrix4(P.inv);
      const zp = corpo.zPass.get(P);
      corpo.zPass.set(P, l.z);
      // zp - l.z < 1: un salto di colpo (finestra, teletrasporto) non è un attraversamento
      if (zp !== undefined && zp > 0 && l.z <= 0 && zp - l.z < 1 && Math.abs(l.x) < p.w / 2 && Math.abs(l.y) < p.h / 2 + 0.3) {
        const M = matriceAttraverso(P.m, Q.m);
        corpo.pos.applyMatrix4(M);
        corpo.vel.applyMatrix3(new THREE.Matrix3().setFromMatrix4(M));
        corpo.zPass.clear();
        if (corpo.zPrima) corpo.zPrima = [null, null];
        const dir = new THREE.Vector3(0, 0, -1).applyMatrix3(new THREE.Matrix3().setFromMatrix4(M));
        return { id: p.id, dyaw: Math.atan2(-dir.x, -dir.z) };
      }
    }
    return null;
  }

  // durante i render delle finestre le facce mostrano solo la nebbia; poi si riaccendono
  spegni() {
    const accese = [];
    for (const [P] of this.coppie()) if (P.mat.uniforms.uAttivo.value > 0.5) { accese.push(P); P.mat.uniforms.uAttivo.value = 0; }
    return accese;
  }

  riaccendi(accese) { for (const P of accese) P.mat.uniforms.uAttivo.value = 1; }

  render(camera, max = 2) {
    const nebbia = this.scene.fog ? this.scene.fog.color : new THREE.Color(0);
    this.frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    const candidate = [];
    for (const [P, Q, p] of this.coppie()) {
      P.mat.uniforms.uAttivo.value = 0;
      P.mat.uniforms.tVista.value = this.vuota;
      P.mat.uniforms.uNebbia.value.copy(nebbia);
      const centro = new THREE.Vector3().setFromMatrixPosition(P.m);
      if (!this.frustum.intersectsSphere(new THREE.Sphere(centro, Math.hypot(p.w, p.h) / 2))) continue;
      if (camera.position.clone().applyMatrix4(P.inv).z < -0.05) continue;
      candidate.push([centro.distanceToSquared(camera.position), P, Q]);
    }
    candidate.sort((x, y) => x[0] - y[0]);
    const scelte = candidate.slice(0, max);
    scelte.forEach(([, P, Q], i) => {
      const M = matriceAttraverso(P.m, Q.m);
      const v = this.vcam;
      v.matrixWorld.multiplyMatrices(M, camera.matrixWorld);
      v.matrixWorldInverse.copy(v.matrixWorld).invert();
      v.projectionMatrix.copy(camera.projectionMatrix);
      const n = new THREE.Vector3(0, 0, 1).transformDirection(Q.m);
      const punto = new THREE.Vector3().setFromMatrixPosition(Q.m).addScaledVector(n, -0.02);
      const piano = new THREE.Plane().setFromNormalAndCoplanarPoint(n, punto).applyMatrix4(v.matrixWorldInverse);
      clipObliqua(v.projectionMatrix, piano);
      v.projectionMatrixInverse.copy(v.projectionMatrix).invert();
      this.renderer.setRenderTarget(this.pool[i]);
      this.renderer.render(this.scene, v);
      P.mat.uniforms.tVista.value = this.pool[i].texture;
    });
    // le facce scelte si accendono solo dopo, così nessun render legge la propria texture
    scelte.forEach(([, P]) => { P.mat.uniforms.uAttivo.value = 1; });
  }
}
