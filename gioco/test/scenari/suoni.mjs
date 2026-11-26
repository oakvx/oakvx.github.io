// Effetti sonori da file (Kenney, CC0): con l'audio acceso si caricano tutti e suonano davvero;
// il passo sul cemento usa un campione, non il suono generato.
import assert from 'node:assert/strict';

export default async function (page, aiuto) {
  await aiuto.esegui(() => { window.__gioco.avviaAudio(); window.__gioco.gioca(); });
  const totale = await page.evaluate(async () => Object.values(await (await fetch('suoni/elenco.json')).json()).flat().length);
  assert.ok(totale > 50);
  await aiuto.attendi((n) => window.__gioco.suoni().caricati === n, 10000, totale);
  assert.equal(await aiuto.esegui(() => window.__gioco.suoni().prova('passo-cemento')), true);
  assert.equal(await aiuto.esegui(() => window.__gioco.suoni().prova('inesistente')), false);
}
