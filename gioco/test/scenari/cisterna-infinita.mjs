// La cisterna infinita: camminando dritti si resta sempre nella stessa cella fisica mentre la cella
// logica cresce; finestre e cubo in mano sopravvivono al ricentraggio; lo squarcio è a 5–7 celle
// dall'ingresso e porta in galleria.
import assert from 'node:assert/strict';

export const query = '&seme=7';
const OX = 300, OZ = 0;

export default async function (page, aiuto) {
  const G = (fn, a) => aiuto.esegui(fn, a);
  const stato = () => G(() => window.__gioco.stanza('cisterna').stato());
  const inStanza = (k) => window.__gioco.leggi().stanza === k;

  // 1. dal middleman (risolto) si entra in cisterna dalla porta
  await G(() => { window.__gioco.gioca(); window.__gioco.vaiA('middleman'); window.__gioco.stanza('middleman').risolvi(); window.__gioco.guarda(Math.PI); window.__gioco.tasto('KeyW', true); });
  await aiuto.attendi(inStanza, 8000, 'cisterna');
  await G(() => window.__gioco.tasto('KeyW', false));
  assert.deepEqual((await stato()).cella, [0, 0]);

  // 2. cento metri verso +x: x resta nella cella centrale, la cella logica cresce
  await G((o) => { window.__gioco.vai(o[0] + 3, 0.87, o[1] + 6); window.__gioco.guarda(-Math.PI / 2); window.__gioco.tasto('KeyW', true); }, [OX, OZ]);
  const t0 = Date.now();
  for (;;) {
    const s = await aiuto.leggi();
    assert.ok(s.x >= OX - 0.5 && s.x <= OX + 18.5, `x fuori dalla cella centrale: ${s.x}`);
    if (Math.abs(s.z - 6) > 0.4) await G((p) => window.__gioco.vai(p.x, p.y, 6), s);
    if ((await stato()).cella[0] >= 5) break;
    if (Date.now() - t0 > 90000) throw new Error('la cella logica non cresce: ' + JSON.stringify(await stato()));
    await aiuto.aspetta(200);
  }
  await G(() => window.__gioco.tasto('KeyW', false));
  const dopo = await stato();
  assert.equal(dopo.cella[1], 0);

  // 3. lo squarcio è a distanza di Chebyshev 5–7 dall'ingresso
  const d = Math.max(Math.abs(dopo.squarcio[0]), Math.abs(dopo.squarcio[1]));
  assert.ok(d >= 5 && d <= 7, 'squarcio a ' + d);

  // 4. finestre sulle colonne e cubo in mano: dopo un ricentraggio (andata e ritorno) restano
  await G((o) => { window.__gioco.vai(o[0] + 16.5, 0.87, o[1] + 6); window.__gioco.guarda(Math.PI / 2); }, [OX, OZ]);
  await aiuto.aspetta(200);
  await G((o) => window.__gioco.mira(o[0] + 15, 1.1, o[1] + 8.39), [OX, OZ]);
  await aiuto.aspetta(150);
  await G(() => window.__gioco.spara(0));
  await G((o) => window.__gioco.mira(o[0] + 15, 1.1, o[1] + 3.61), [OX, OZ]);
  await aiuto.aspetta(150);
  await G(() => window.__gioco.spara(1));
  const finestre = (await aiuto.leggi()).portali;
  assert.ok(finestre[0] && finestre[1], 'finestre sulle colonne: ' + JSON.stringify(finestre));
  // il cubo si prende dopo: una mira di colpo lo farebbe cadere
  await G(() => window.__gioco.guarda(-Math.PI / 2));
  await G((o) => window.__gioco.cubo(o[0] + 17.6, 0.6, o[1] + 6), [OX, OZ]);
  await aiuto.aspetta(600);
  const c = await G(() => window.__gioco.cubi().at(-1));
  await G((p) => window.__gioco.mira(p.x, p.y, p.z), c);
  await aiuto.attendi(() => window.__gioco.leggi().mirato === 'cubo', 3000);
  await G(() => window.__gioco.interagisci());
  assert.equal((await aiuto.leggi()).tenuto, true);
  const prima = (await stato()).cella[0];
  await G(() => window.__gioco.tasto('KeyW', true));
  await aiuto.attendi((k) => window.__gioco.stanza('cisterna').stato().cella[0] === k, 20000, prima + 1);
  // indietro senza girarsi (una giravolta di colpo farebbe cadere il cubo)
  await G(() => { window.__gioco.tasto('KeyW', false); window.__gioco.tasto('KeyS', true); });
  await aiuto.attendi((k) => window.__gioco.stanza('cisterna').stato().cella[0] === k, 20000, prima);
  await G(() => window.__gioco.tasto('KeyS', false));
  const s4 = await aiuto.leggi();
  assert.equal(s4.tenuto, true, 'il cubo è ancora in mano');
  assert.deepEqual(s4.portali, finestre);
  // dentro la finestra sulla colonna (15, 9), fuori da quella sulla colonna (15, 3)
  await G((o) => { window.__gioco.vai(o[0] + 15, 0.87, o[1] + 6.6); window.__gioco.guarda(Math.PI); window.__gioco.tasto('KeyW', true); }, [OX, OZ]);
  await aiuto.attendi((o) => window.__gioco.leggi().z < o[1] + 5, 10000, [OX, OZ]);
  await G(() => window.__gioco.tasto('KeyW', false));

  // 5. lo squarcio porta in galleria
  await G(() => window.__gioco.stanza('cisterna').risolvi());
  assert.equal((await stato()).attivo, true);
  await G(() => { window.__gioco.guarda(Math.PI); window.__gioco.tasto('KeyW', true); });
  await aiuto.attendi(inStanza, 8000, 'galleria');
  await G(() => window.__gioco.tasto('KeyW', false));
}
