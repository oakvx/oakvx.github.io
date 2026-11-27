// Finestre a pixel: due portali collegati, piazzabili solo sui pannelli a quadretti.
// Vista dall'altra parte con camera virtuale e piano di taglio obliquo, ricorsione
// limitata a un livello (dentro una finestra, l'altra appare come rumore a pixel).
// Un pannello può "mentire": la sua finestra porta a una posizione diversa (eff).
import * as THREE from 'three';
import { matriceAttraverso, clipObliqua } from './engine/proiezione.js';

export const W = 1.1;
export const H = 2.0;

const AVANTI = new THREE.Vector3(0, 0, 1);

const vertex = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const fragment = `
uniform sampler2D tVista; uniform vec2 uRes; uniform vec3 uColore; uniform float uTempo;
uniform float uCollegato; uniform float uEco;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
void main(){
  vec2 celle = vec2(11.0, 20.0);
  vec2 id = floor(vUv * celle);
  float ex = min(id.x, celle.x - 1.0 - id.x);
  float ey = min(id.y, celle.y - 1.0 - id.y);
  float e = min(ex, ey);
  float t = floor(uTempo * 8.0);
  float n = hash(id + t * 0.37);
  if (ex < 1.0 && ey < 1.0) discard;                       // angoli smussati a gradino
  if (e < 1.0) { if (n < 0.3) discard; gl_FragColor = vec4(uColore * 1.5, 1.0); return; }
  if (e < 2.0 && n < 0.3) { gl_FragColor = vec4(uColore * 1.15, 1.0); return; }
  vec3 col;
  if (uCollegato > 0.5 && uEco < 0.5) {
    vec2 suv = gl_FragCoord.xy / uRes;
    if (e < 3.0) { vec2 q = uRes / 6.0; suv = (floor(suv * q) + 0.5) / q; }
    col = texture2D(tVista, suv).rgb;
    if (e < 3.0) col = mix(col, uColore, 0.22);
    col *= 0.965 + 0.035 * step(0.5, fract(gl_FragCoord.y * 0.25));
  } else {
    float s = hash(floor(vUv * vec2(44.0, 80.0)) + t);
    col = mix(vec3(0.8, 0.85, 0.88), uColore, 0.3 + 0.35 * s);
  }
  gl_FragColor = vec4(col, 1.0);
}`;

export class Portali {
  constructor(renderer, scene, mondo) {
    this.renderer = renderer;
    this.scene = scene;
    this.mondo = mondo;
    this.vcam = new THREE.PerspectiveCamera();
    this.vcam.matrixAutoUpdate = false;
    this.vcam.matrixWorldAutoUpdate = false;
    this.scala = 0.5;
    this.res = new THREE.Vector2(1, 1);
    this.reindirizzi = new Map();
    this.vuota = new THREE.DataTexture(new Uint8Array([200, 210, 220, 255]), 1, 1);
    this.vuota.needsUpdate = true;
    this.frustum = new THREE.Frustum();
    this.m4 = new THREE.Matrix4();
    const geo = new THREE.PlaneGeometry(W, H);
    this.p = ['#39c6d9', '#d95bb3'].map((c, i) => {
      const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType });
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          tVista: { value: rt.texture }, uRes: { value: this.res }, uColore: { value: new THREE.Color(c) },
          uTempo: { value: 0 }, uCollegato: { value: 0 }, uEco: { value: 0 },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.matrixAutoUpdate = false;
      mesh.visible = false;
      mesh.frustumCulled = false;
      scene.add(mesh);
      return { i, mesh, mat, rt, attivo: false, fis: new THREE.Matrix4(), inv: new THREE.Matrix4(), eff: new THREE.Matrix4(), pannello: null, u: 0, y: 0 };
    });
  }

  get collegati() { return this.p[0].attivo && this.p[1].attivo; }

  reindirizza(idPannello, matrice) { this.reindirizzi.set(idPannello, matrice); }

  ridimensiona(w, h) {
    this.res.set(w, h);
    for (const p of this.p) p.rt.setSize(Math.max(2, Math.floor(w * this.scala)), Math.max(2, Math.floor(h * this.scala)));
  }

  impostaScala(s, w, h) { this.scala = s; this.ridimensiona(w, h); }

  // prova a piazzare la finestra i dove punta il raggio; restituisce l'esito
  piazza(i, hit) {
    const id = hit.object.userData.pannello;
    let pan = this.mondo.pannelli.get(id);
    if (!pan || !hit.face || pan.bloccato) return 'no';
    // blocco con più facce (le colonne della cisterna): conta la faccia colpita
    if (pan.facce) pan = pan.facce.find((f) => hit.face.normal.dot(f.normale) > 0.9);
    if (!pan) return 'no';
    if (hit.face.normal.dot(pan.normale) < 0.9) return 'no';
    if (pan.b - pan.a < W || pan.y1 - pan.y0 < H) return 'no';
    let u = pan.asse === 'x' ? hit.point.x : hit.point.z;
    u = Math.min(pan.b - W / 2 - 0.02, Math.max(pan.a + W / 2 + 0.02, u));
    let y = hit.point.y;
    y = y - pan.y0 < H ? pan.y0 + H / 2 + 0.02 : Math.min(pan.y1 - H / 2 - 0.02, Math.max(pan.y0 + H / 2 + 0.02, y));
    const altro = this.p[1 - i];
    if (altro.attivo && altro.chiave === pan.id && Math.abs(altro.u - u) < W + 0.05 && Math.abs(altro.y - y) < H) return 'occupato';
    const off = 0.012;
    const pos = pan.asse === 'x'
      ? new THREE.Vector3(u, y, pan.faccia + pan.normale.z * off)
      : new THREE.Vector3(pan.faccia + pan.normale.x * off, y, u);
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(pan.normale.x, pan.normale.z));
    const P = this.p[i];
    P.fis.compose(pos, q, new THREE.Vector3(1, 1, 1));
    P.inv.copy(P.fis).invert();
    P.eff.copy(this.reindirizzi.get(id) || P.fis);
    P.pannello = id;
    P.chiave = pan.id;
    P.proibito = pan.proibito;
    P.u = u;
    P.y = y;
    P.attivo = true;
    P.mesh.matrix.copy(P.fis);
    P.mesh.matrixWorldNeedsUpdate = true;
    P.mesh.visible = true;
    const c = this.collegati ? 1 : 0;
    this.p[0].mat.uniforms.uCollegato.value = c;
    this.p[1].mat.uniforms.uCollegato.value = c;
    return pan.proibito ? 'proibito' : 'ok';
  }

  // trasla le finestre piazzate di (dx, dz), come il resto dello spazio (cisterna infinita);
  // dentro(pos) sceglie quali finestre spostare
  sposta(dx, dz, dentro = () => true) {
    const pos = new THREE.Vector3();
    const t = new THREE.Matrix4().makeTranslation(dx, 0, dz);
    for (const P of this.p) {
      if (!P.attivo) continue;
      pos.setFromMatrixPosition(P.fis);
      if (!dentro(pos)) continue;
      const stessa = P.eff.equals(P.fis);
      P.fis.premultiply(t);
      P.inv.copy(P.fis).invert();
      if (stessa) P.eff.copy(P.fis);
      const pan = this.mondo.pannelli.get(P.pannello);
      P.u += pan && pan.asse === 'z' ? dz : dx;
      P.mesh.matrix.copy(P.fis);
      P.mesh.matrixWorldNeedsUpdate = true;
    }
  }

  // pannelli da non considerare solidi per un corpo che sta passando in una finestra
  varchi(corpo) {
    const set = new Set();
    if (!this.collegati) return set;
    const l = new THREE.Vector3();
    for (const P of this.p) {
      l.copy(corpo.pos).applyMatrix4(P.inv);
      if (Math.abs(l.x) < W / 2 - 0.05 && l.y - corpo.half.y > -H / 2 - 0.08 && l.y + corpo.half.y < H / 2 + 0.08 && l.z < 1.2 && l.z > -1.2) set.add(P.pannello);
    }
    return set;
  }

  // controlla se il corpo ha attraversato una finestra; se sì lo trasporta
  attraversa(corpo) {
    if (!this.collegati) { corpo.zPrima[0] = corpo.zPrima[1] = null; return null; }
    const l = new THREE.Vector3();
    for (const P of this.p) {
      l.copy(corpo.pos).applyMatrix4(P.inv);
      const zp = corpo.zPrima[P.i];
      corpo.zPrima[P.i] = l.z;
      if (zp !== null && zp > 0 && l.z <= 0 && Math.abs(l.x) < W / 2 && Math.abs(l.y) < H / 2 + 0.3) {
        const Q = this.p[1 - P.i];
        const M = this.m4.copy(matriceAttraverso(P.fis, Q.eff));
        corpo.pos.applyMatrix4(M);
        corpo.vel.applyMatrix3(new THREE.Matrix3().setFromMatrix4(M));
        corpo.zPrima[0] = corpo.zPrima[1] = null;
        const dir = new THREE.Vector3(0, 0, -1).applyMatrix3(new THREE.Matrix3().setFromMatrix4(M));
        const dyaw = Math.atan2(-dir.x, -dir.z);
        return { da: P, a: Q, dyaw, proibito: !!Q.proibito || !!P.proibito, reindirizzato: Q.eff !== Q.fis && !Q.eff.equals(Q.fis) };
      }
    }
    return null;
  }

  aggiorna(t) {
    for (const P of this.p) P.mat.uniforms.uTempo.value = t;
  }

  // disegna la vista attraverso ciascuna finestra visibile
  render(camera) {
    if (!this.collegati) return;
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    for (const P of this.p) P.mat.uniforms.uEco.value = 1;
    for (const P of this.p) {
      const Q = this.p[1 - P.i];
      const centro = new THREE.Vector3().setFromMatrixPosition(P.fis);
      if (!this.frustum.intersectsSphere(new THREE.Sphere(centro, 1.2))) continue;
      // la finestra va guardata dal davanti
      const lc = camera.position.clone().applyMatrix4(P.inv);
      if (lc.z < -0.05) continue;
      const M = matriceAttraverso(P.fis, Q.eff);
      const v = this.vcam;
      v.matrixWorld.multiplyMatrices(M, camera.matrixWorld);
      v.matrixWorldInverse.copy(v.matrixWorld).invert();
      v.projectionMatrix.copy(camera.projectionMatrix);
      // piano di taglio obliquo sul piano della finestra di arrivo
      const n = AVANTI.clone().transformDirection(Q.eff);
      const p = new THREE.Vector3().setFromMatrixPosition(Q.eff).addScaledVector(n, -0.02);
      const piano = new THREE.Plane().setFromNormalAndCoplanarPoint(n, p).applyMatrix4(v.matrixWorldInverse);
      clipObliqua(v.projectionMatrix, piano);
      v.projectionMatrixInverse.copy(v.projectionMatrix).invert();
      // durante il disegno nella propria texture la finestra non deve tenerla legata (feedback loop)
      P.mat.uniforms.tVista.value = this.vuota;
      this.renderer.setRenderTarget(P.rt);
      this.renderer.render(this.scene, v);
      P.mat.uniforms.tVista.value = P.rt.texture;
    }
    for (const P of this.p) P.mat.uniforms.uEco.value = 0;
  }
}
