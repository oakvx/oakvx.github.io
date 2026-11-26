import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../vendor/three/three.module.js';
import { matriceAttraverso } from '../../js/engine/proiezione.js';

test('un punto davanti ad A esce davanti a B', () => {
  const a = new THREE.Matrix4().makeTranslation(0, 1, 0);
  const b = new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(10, 1, 5);
  const p = new THREE.Vector3(0.2, 1, 0.3).applyMatrix4(matriceAttraverso(a, b));
  // davanti ad A = +z locale; dopo il passaggio è dietro il piano di B (si esce dall'altra parte)
  const locale = p.clone().applyMatrix4(b.clone().invert());
  assert.ok(Math.abs(locale.z + 0.3) < 1e-6);
  assert.ok(Math.abs(locale.x + 0.2) < 1e-6);
});
