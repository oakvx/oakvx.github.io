// La tavolozza low poly esiste e le stanze non escono né nere né bianche. Salva le foto in gioco/test/out/.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../out');

export default async function (page, aiuto) {
  const chiavi = await aiuto.esegui(() => window.__gioco.materiali());
  for (const k of ['cemento', 'intonaco', 'metallo', 'piastrelle', 'moquette', 'legnoScuro', 'neonSodio']) assert.ok(chiavi.includes(k), 'manca ' + k);
  fs.mkdirSync(out, { recursive: true });
  await aiuto.esegui(() => window.__gioco.gioca());
  for (const [stanza, x, y, z, yaw] of [['ingresso', 0, 0.87, 2.6, 0], ['piscina', 42, 0.87, 19.2, -Math.PI / 2]]) {
    await aiuto.esegui((p) => { window.__gioco.vai(p[0], p[1], p[2]); window.__gioco.guarda(p[3], -0.05); }, [x, y, z, yaw]);
    await aiuto.aspetta(1500);
    const png = await page.screenshot({ path: path.join(out, stanza + '.png') });
    const lum = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = 96; c.height = 60;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0, 96, 60);
      const d = x.getImageData(0, 0, 96, 60).data;
      let s = 0;
      for (let i = 0; i < d.length; i += 4) s += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
      return s / (d.length / 4);
    }, png.toString('base64'));
    assert.ok(lum > 0.15 && lum < 0.85, `${stanza}: luminanza ${lum.toFixed(2)}`);
  }
}
