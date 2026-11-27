// Acqua che scorre: increspature che si spostano lungo la corrente, riflessi delle
// luci, trasparenza sul fondo e nebbia della scena. Mai stagnante.
import * as THREE from 'three';

const vertex = `
uniform float uTempo;
uniform vec2 uFlusso;
uniform vec2 uScarto;
varying vec3 vWP;
#include <fog_pars_vertex>
void main(){
  vec3 p = position;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vec2 q = wp.xz + uScarto - uFlusso * uTempo;
  wp.y += sin(q.x * 1.7 + q.y * 0.9) * 0.012 + sin(q.y * 2.3 - uTempo * 1.1) * 0.008;
  vWP = wp.xyz;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const fragment = `
uniform float uTempo;
uniform vec2 uFlusso;
uniform vec3 uColore;
uniform vec3 uRiflesso;
uniform float uOpacita;
uniform vec2 uScarto;
varying vec3 vWP;
#include <fog_pars_fragment>
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float onde(vec2 p){
  float t = uTempo;
  vec2 f = uFlusso;
  float v = noise(p * 1.3 - f * t * 1.3) * 0.5;
  v += noise(p * 2.9 - f * t * 2.1 + 7.3) * 0.3;
  v += noise(p * 6.1 - f * t * 3.0 + 3.1) * 0.2;
  return v;
}
void main(){
  vec2 p = vWP.xz + uScarto;
  float e = 0.06;
  float h = onde(p);
  vec3 n = normalize(vec3(onde(p + vec2(e, 0.0)) - h, 0.09, onde(p + vec2(0.0, e)) - h));
  vec3 v = normalize(cameraPosition - vWP);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 luce = normalize(vec3(0.3, 1.0, 0.2));
  float spec = pow(max(dot(reflect(-luce, n), v), 0.0), 60.0);
  float strisce = smoothstep(0.62, 0.78, h) * 0.35;
  vec3 col = mix(uColore, uRiflesso, clamp(fres * 0.9 + strisce, 0.0, 1.0)) + spec * 0.9;
  gl_FragColor = vec4(col, clamp(uOpacita + fres * 0.35, 0.0, 1.0));
  #include <fog_fragment>
}`;

// uScarto (mesh.material.uniforms.uScarto): spostamento delle coordinate del disegno
export function creaAcqua(m, x0, z0, x1, z1, y, { flusso = [0.3, 0], colore = 0x2b6f7a, riflesso = 0xd6eef2, opacita = 0.62 } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uTempo: { value: 0 },
      uFlusso: { value: new THREE.Vector2(...flusso) },
      uScarto: { value: new THREE.Vector2(0, 0) },
      uColore: { value: new THREE.Color(colore) },
      uRiflesso: { value: new THREE.Color(riflesso) },
      uOpacita: { value: opacita },
    }]),
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    fog: true,
  });
  const w = x1 - x0, d = z1 - z0;
  const geo = new THREE.PlaneGeometry(w, d, Math.max(1, Math.round(w)), Math.max(1, Math.round(d)));
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  mesh.renderOrder = 2;
  m.scene.add(mesh);
  m.ogniFrame((dt, t) => { mat.uniforms.uTempo.value = t; });
  return mesh;
}
