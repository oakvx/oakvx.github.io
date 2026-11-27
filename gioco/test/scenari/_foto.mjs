// Aiuto per gli scenari "foto-*": posiziona la camera, salva la foto e ne misura la luminanza media.
// (Il nome inizia con _ ma il runner lo esegue solo se richiesto per nome: non è uno scenario.)
import fs from 'node:fs';

export async function fotografa(page, aiuto, nome, [x, y, z, yaw, pitch]) {
  await aiuto.esegui((q) => { window.__gioco.vai(q[0], q[1], q[2]); window.__gioco.guarda(q[3], q[4]); window.__gioco.salta(); }, [x, y, z, yaw, pitch]);
  await aiuto.aspetta(1800);
  fs.mkdirSync('gioco/test/out', { recursive: true });
  const png = await page.screenshot({ path: `gioco/test/out/${nome}.png` });
  return page.evaluate(async (b64) => {
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
}
