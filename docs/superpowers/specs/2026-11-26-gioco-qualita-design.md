# Gioco: resa realistica, passaggi a vista, cisterna infinita — design

Data: 2026-11-26 · Stato: da approvare · Parte da `gioco-rifiniture` (PR #16)

## Perché

oakvx ha giocato v3 e vuole un salto di qualità:

- **"La stanza dopo si deve già vedere"**: oggi otto cambi di stanza sono una dissolvenza bianca con teletrasporto. Rompono l'immersione e fanno sembrare le stanze scollegate.
- **"Alta qualità degli asset, non una bazza low poly"**: vuole una cosa curata e **realistica** (scelta A). Il realismo è anche ciò che rende inquietanti gli spazi liminali: le Backrooms funzionano perché sembrano foto vere.
- **La cisterna deve sembrare infinita**, come un livello delle Backrooms: colonne e archi dappertutto, finché non trovi lo **squarcio di realtà** che ti fa andare avanti.

Chi gioca resta lo stesso: soprattutto recruiter e aziende, più chiunque voglia divertirsi.

## Obiettivi

1. Nessun cambio di stanza con dissolvenza: ogni porta mostra già la stanza successiva e si attraversa senza stacco.
2. Resa realistica in tutte le stanze: materiali fotografati PBR (colore, normali, rugosità/occlusione), luce d'ambiente da panorami HDR, ombre vere dalle luci principali, oggetti scansionati al posto dei blocchi colorati.
3. Cisterna infinita con lo squarcio di realtà come uscita, raggiunto con le finestre.
4. Il gioco resta giocabile su un portatile normale.

## Non obiettivi

- Rifare il sito (resta il progetto successivo).
- Illuminazione "cotta" in Blender (approccio 2, scartato).
- Cambiare motore grafico.
- Versione mobile.

## Anti-obiettivi

- Un gioco che pesa più di **60 MB** o che si blocca a lungo all'avvio senza progresso visibile.
- Sotto i **40 FPS** in qualità bassa su un portatile con grafica integrata a 1080p.
- Un mix incoerente: metà stanze realistiche e metà a blocchi.
- Asset che non sono CC0 o che richiedono crediti non riportati.
- Perdere quello che già funziona: enigmi, testi, curatore, segreti, test.

## Vincoli

- Sito statico, niente bundler; Three.js **r187** in `gioco/vendor/three/`. Gli addon che servono (`GLTFLoader`, `HDRLoader`/`RGBELoader`, eventuali utilità) si copiano da `three@0.187.0` (npm) in `vendor/three/addons/`.
- Fonti asset: **ambientCG** e **Poly Haven**, entrambe CC0. Host già aperti nell'ambiente: `ambientcg.com`, `polyhaven.com`, `api.polyhaven.com`, `dl.polyhaven.org`.
- Texture a **1K**: JPG per colore, WebP o JPG per normali/ARM. Modelli `.glb` ottimizzati in locale con `@gltf-transform/cli` (npm): texture interne ridotte a 1K, mesh semplificate se troppo dense.
- Tutti i test esistenti continuano a passare; i nuovi comportamenti hanno i loro test.
- Commit a nome `oakvx <oakvx7@gmail.com>`, senza righe di attribuzione; PR senza firma di Claude.

## Approcci

1. **Stesso motore, materiali e luci veri (scelto da oakvx).** Le stanze restano costruite come oggi; cambiano materiali, illuminazione, dettagli e oggetti. Si lavora stanza per stanza con il gioco sempre funzionante.
2. Stanze modellate in Blender con luce "cotta": qualità massima, ma rifare tutto, settimane di lavoro, modifiche future difficili. Scartato.
3. Cambiare motore: costa tutto il fatto senza vero guadagno. Scartato.

## Il come deciso

### Ordine

1. Passaggi a vista: veloce, migliora subito l'immersione.
2. Nuova resa: prima il motore (materiali PBR, luce HDR, ombre, caricamento con progresso), poi stanza per stanza.
3. Cisterna infinita, costruita direttamente con i materiali nuovi.

### 1 · Passaggi a vista

Le otto dissolvenze diventano porte con passaggio fisso a doppio senso (`engine/varchi.js`, `collega`), ciascuna in un'apertura vera con nicchia:

| Da | A |
| --- | --- |
| corridoio allagato, porta rossa | middleManPS4 |
| middleManPS4, nicchia alta | cisterna (cella d'ingresso) |
| cisterna, squarcio di realtà | galleria |
| galleria | scrivania |
| scrivania (porta che si apre con `apri`) | commit |
| commit | supermercato |
| supermercato, uscita | camera di oakvx |
| camera di oakvx, porta con la scaletta | contatti |

Le porte che si aprono durante il gioco (scrivania, smistamento) mostrano la vista solo da aperte. Se il motore lo regge restano visibili 2 passaggi alla volta; altrimenti il terzo più lontano mostra la nebbia (comportamento attuale).

### 2 · Resa realistica

- **Renderer**: tone mapping filmico (ACES o AgX) e uscita sRGB gestiti da Three.js. Il post-processing attuale si adatta: niente più gamma manuale; grana e vignettatura restano, la quantizzazione a 48 livelli si toglie.
- **Materiali** (`engine/materiali.js`): `MeshStandardMaterial` con mappe colore, normali e ARM (occlusione, rugosità, metallo). Mappatura in coordinate mondo come oggi, densità costante (circa 1 m per ripetizione), con le normali corrette per ogni asse. Tavolozza minima: cemento grezzo, intonaco dipinto (due toni: zoccolo e parte alta), piastrelle ceramiche, piastrelle da piscina, metallo verniciato, lamiera, legno scuro, parquet, moquette, mattoni o tufo per la cisterna. I nomi di oggi (`pavimento`, `muro`, `cemento`, `intonaco`…) restano e puntano ai nuovi materiali.
- **Luce**: per ogni area un panorama HDR 1K da Poly Haven (interno neutro, interno caldo, notte) come luce d'ambiente e riflessi. Le luci puntiformi restano nel gruppo fisso di 10; in più **una luce con ombre per la stanza attuale** (spot o direzionale), accesa solo lì. Qualità bassa: ombre 1024 e niente ombre sui piccoli oggetti; qualità alta: 2048.
- **Dettagli architettonici**: battiscopa, cornici delle porte, plafoniere, griglie e cartelli rifatti con modanature e materiali veri; niente più spigoli "a blocco" visibili.
- **Oggetti scansionati** (Poly Haven, `.glb` in `gioco/asset/modelli/`), riusati tra stanze. Indicativo:
  - smistamento: `metal_office_desk`, `power_box_01`, `industrial_wall_lamp`;
  - piscina: `planter_pot_clay`;
  - cisterna: `modular_industrial_pipes_01`, `industrial_pipe_lamp`;
  - galleria: `modern_arm_chair_01`, `potted_plant_02`;
  - scrivania: `metal_office_desk`, `desk_lamp_arm_01`, `binder_notebook`;
  - supermercato: `cardboard_box_01`;
  - camera: `old_bed_frame`, `vintage_cabinet_01`, `book_encyclopedia_set_01`, `portable_cassette_player`, `boombox`, piante;
  - contatti: `sofa_02`, `side_table_01`.
- **Il Mii resta il Mii**: è l'avatar di oakvx, stilizzato per scelta. Se ne migliorano materiali e luce, non lo stile.
- **Le stanze "schermo" restano grafiche**: il desktop di Brat Animator, il muro dei commit, i monitor e la TV sono immagini di interfacce e restano tali; realistici diventano i materiali attorno (vetro, plastica, metallo, luce).
- **Modalità 2008 nella camera**: resta, sopra la nuova resa.
- **Caricamento**: gli asset di un'ala si caricano prima di entrarci (smistamento, transiti, ala design, camera). All'avvio una barra di progresso reale. Un asset che manca non blocca il gioco: si usa un materiale semplice e un avviso in console.
- **Peso**: tetto 60 MB in tutto; da misurare a ogni ala.

### 3 · Cisterna infinita e squarcio di realtà

- Una **cella** di cisterna (circa 18 × 18 m: archi su colonne, acqua scura che scorre, tubi e lampade) ripetuta in tutte le direzioni. Il giocatore sta sempre in una griglia di 5 × 5 copie; quando passa da una cella all'altra lo si riporta al centro di nascosto, così lo spazio sembra senza fine. La nebbia nasconde il bordo.
- Ogni cella ha una **coordinata logica** (cx, cz) da cui derivano variazioni leggere: lampade che tremolano o spente, una colonna crepata, un tubo che gocciola, il livello dell'acqua. Così non sembra la stessa stanza copiata.
- Lo **squarcio di realtà** è in una cella lontana (per esempio a 5–7 celle dall'ingresso), scelta a ogni partita. È una crepa verticale luminosa e glitchata tra due colonne, a circa 3 m d'altezza, che mostra la galleria. Ci si arriva con le finestre, su pannelli nelle colonne di quella cella.
- **Come si trova**:
  - un suono che si avvicina, il ronzio dello squarcio, più forte e meno distorto man mano che ci si avvicina;
  - lampade che tremolano nella sua direzione;
  - a 45 s il curatore dà un indizio, a 90 s compare una scia di luce sull'acqua.
- Il cartello "stanza N di 2.500" cambia numero con la cella.
- Il Mii del segreto compare nella cella accanto allo squarcio.

## Test

- **Passaggi**: per ogni coppia della tabella, attraversando la porta la stanza cambia senza dissolvenza (si controlla che non ci sia la classe `velo on`) e si può tornare indietro.
- **Cisterna**: camminando 100 m in linea retta la posizione resta nella griglia mentre la cella logica cambia; lo squarcio esiste a 5–7 celle; con le finestre lo si raggiunge e si entra in galleria.
- **Asset**: se un file manca (risposta 404 simulata) la stanza si costruisce lo stesso, senza errori.
- **Resa**: le foto dei test in `gioco/test/out/` di ogni stanza; un test che fallisce se compaiono errori WebGL (già attivo).
- **Prestazioni**: `GIOCO_FPS=40` sul giro completo, da far girare su un computer con GPU (qui il browser non ha GPU).

## Lasciato a chi costruisce

- La scelta precisa delle texture e dei panorami nelle categorie indicate.
- Le proporzioni della cella della cisterna e il tipo di glitch dello squarcio, purché si legga come "realtà strappata" e non come le finestre ciano/magenta.
- L'ordine delle stanze nella fase 2.
- Come dividere gli asset per ala.
