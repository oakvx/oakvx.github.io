# Avvio OAKVX / Wii

Interfaccia fornita dall'autore nell'archivio `oakvx-wii-boot.zip`.
Il banner/disco OAKVX è personalizzato. La ricostruzione integrata usa risorse
Nintendo PAL 4.3E, texture/animazioni italiane e campioni delle anteprime.
Adattamenti nel portfolio: dialogo nativo, avvio per sessione, controlli touch,
focus, movimento ridotto, pulizia delle risorse e passaggio al sito esistente.

I sette JPG in `channels/` sono banner dei canali Wii inclusi nell'archivio.
La documentazione fornita li descrive come immagini Nintendo ricavate da
acquisizioni riportate su WiiBrew. Non sono presentati come grafica originale
del portfolio e non viene attribuita loro una licenza libera.
I vecchi JPG dell'archivio sono conservati; le nove miniature e le anteprime
correnti usano i derivati nativi elencati in `original/manifest.json`.
Avviso italiano, pointer/player 1, clock, cornici e impostazioni provengono dal
titolo Nintendo 0000000100000002 v514, verificato contro la TMD pubblica.
Font Opera originale Wii NTLG PGothic da WiiNTLG-Regular.ttc, contenuto 0000000a;
faccia proporzionale convertita in WOFF2 e ridotta ai caratteri latini.

Mii, Foto, Shop, Meteo, Notizie e Internet: contenuto grafico originale dal
Nintendo Update Server. Vota Anche Tu, Nintendo e Concorsi Mii: primo contenuto
grafico preservato da MarioCube e confrontato con lo SHA1 della TMD scaricata
separatamente dal server Nintendo. Non sono pubblicati WAD o eseguibili nel sito.
I nove sound.bin originali sono decodificati e convertiti in MP3; suoni e musica
sono riprodotti dal controller condiviso e rispettano la preferenza utente.
Le firme Nintendo non sono state verificate indipendentemente.

Le immagini WebP sono render offline delle texture/BRLYT/BRLAN originali,
non acquisizioni video della console. Gli strumenti di parsing/rendering
provengono da https://github.com/Tomoeko/Wii_Menu_HTML, CC0-1.0 per il codice
scritto dal progetto; la licenza non si estende ai materiali Nintendo.
Nintendo e Fontworks conservano i diritti su marchi, grafica, audio e font;
non viene attribuita una licenza libera a questi materiali.
URL, hash e trasformazioni sono in `original/manifest.json` e
`original/native/asset-map.json`. Altre attribuzioni: `original/NOTICE.md`.

Il portfolio non è affiliato a Nintendo.
