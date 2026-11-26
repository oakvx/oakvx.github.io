// Scarica gli asset CC0 del gioco da Poly Haven (texture PBR 1K, panorami HDR 1K, modelli glTF 1K),
// converte i modelli in .glb con @gltf-transform/cli e scrive gioco/asset/elenco.json.
// Uso (dalla radice del repo): node gioco/strumenti/scarica-asset.mjs
// Serve rete verso api.polyhaven.com e dl.polyhaven.org; @gltf-transform/cli si scarica con npx.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const qui = path.dirname(fileURLToPath(import.meta.url));
const ASSET = path.resolve(qui, '../asset');
const TMP = path.join(ASSET, '.tmp');

// id interno → id Poly Haven
const TEXTURE = {
  cemento: 'brushed_concrete',
  intonaco: 'painted_plaster_wall',
  piastrelle: 'floor_tiles_06',
  'piastrelle-piscina': 'blue_floor_tiles_01',
  metallo: 'blue_metal_plate',
  lamiera: 'corrugated_iron_02',
  'legno-scuro': 'old_wood_floor',
  parquet: 'wood_floor',
  moquette: 'dirty_carpet',
  mattoni: 'brick_wall_001',
  tufo: 'rustic_stone_wall',
};
const HDR = { 'interno-neutro': 'hospital_room_2', 'interno-caldo': 'artist_workshop', notte: 'moonless_golf' };
const MODELLI = [
  'metal_office_desk', 'power_box_01', 'industrial_wall_lamp', 'utility_box_01', 'utility_box_02',
  'metal_toolbox', 'drawer_cabinet', 'modern_arm_chair_01', 'bar_chair_round_01', 'potted_plant_01', 'potted_plant_02', 'potted_plant_04',
  'side_table_01', 'planter_pot_clay', 'cardboard_box_01', 'portable_searchlight',
  'desk_lamp_arm_01', 'binder_notebook', 'sofa_02',
  'modular_industrial_pipes_01', 'industrial_pipe_lamp',
  'old_bed_frame', 'vintage_cabinet_01', 'book_encyclopedia_set_01', 'portable_cassette_player', 'boombox',
];

async function json(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}
async function scarica(url, dest) {
  if (fs.existsSync(dest)) return;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}
const rel = (p) => path.relative(ASSET, p).split(path.sep).join('/');

const elenco = { texture: {}, hdr: {}, modelli: {} };
fs.mkdirSync(TMP, { recursive: true });

for (const [id, ph] of Object.entries(TEXTURE)) {
  const f = await json(`https://api.polyhaven.com/files/${ph}`);
  const dir = path.join(ASSET, 'texture', id);
  const file = { diff: path.join(dir, 'diff.jpg'), nor: path.join(dir, 'nor.jpg'), arm: path.join(dir, 'arm.jpg') };
  await scarica(f.Diffuse['1k'].jpg.url, file.diff);
  await scarica(f.nor_gl['1k'].jpg.url, file.nor);
  await scarica(f.arm['1k'].jpg.url, file.arm);
  elenco.texture[id] = { fonte: 'Poly Haven', idFonte: ph, licenza: 'CC0', file: { diff: rel(file.diff), nor: rel(file.nor), arm: rel(file.arm) } };
  console.log('texture', id);
}

for (const [id, ph] of Object.entries(HDR)) {
  const f = await json(`https://api.polyhaven.com/files/${ph}`);
  const dest = path.join(ASSET, 'hdr', `${id}.hdr`);
  await scarica(f.hdri['1k'].hdr.url, dest);
  elenco.hdr[id] = { fonte: 'Poly Haven', idFonte: ph, licenza: 'CC0', file: rel(dest) };
  console.log('hdr', id);
}

for (const id of MODELLI) {
  const info = await json(`https://api.polyhaven.com/info/${id}`);
  const f = await json(`https://api.polyhaven.com/files/${id}`);
  const g = f.gltf['1k'].gltf;
  const dir = path.join(TMP, id);
  const gltf = path.join(dir, path.basename(new URL(g.url).pathname));
  await scarica(g.url, gltf);
  for (const [nome, inc] of Object.entries(g.include || {})) await scarica(inc.url, path.join(dir, nome));
  const glb = path.join(ASSET, 'modelli', `${id}.glb`);
  fs.mkdirSync(path.dirname(glb), { recursive: true });
  if (!fs.existsSync(glb)) {
    execFileSync('npx', ['--yes', '@gltf-transform/cli', 'optimize', gltf, glb, '--compress', 'false', '--texture-compress', 'webp', '--texture-size', '1024'], { stdio: 'inherit' });
  }
  const altezza = info.dimensions ? Math.max(...info.dimensions) / 1000 : null;
  elenco.modelli[id] = { fonte: 'Poly Haven', idFonte: id, licenza: 'CC0', file: rel(glb), altezza };
  console.log('modello', id);
}

fs.writeFileSync(path.join(ASSET, 'elenco.json'), JSON.stringify(elenco, null, 1) + '\n');
fs.rmSync(TMP, { recursive: true, force: true });
console.log('fatto');
