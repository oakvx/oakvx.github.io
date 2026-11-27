# Testi: proposta di riscrittura (da approvare)

Regola usata: ogni battuta resta **in un posto solo**, quello dove nasce; dove ricompare diventa una frase normale, detta come la diresti a voce. Nessun fatto nuovo: cambia solo come sono dette le cose.
Fonte delle ripetizioni: `python3 scripts/controlla_testi.py` (elenco completo in `docs/testi/ripetizioni.md`).

Segna accanto a ogni riga **ok**, **no**, oppure scrivi la tua versione. Niente viene applicato senza il tuo ok.

## I tormentoni

| Battuta | Dove sta oggi | Dove resta | Cosa cambia altrove |
|---|---|---|---|
| «Il negozio è finto, il sito no» | Spinotto Felice, Ingresso, Tutti i lavori | Spinotto Felice | Ingresso e Lavori: frase descrittiva |
| «Il gioco mi è sfuggito di mano» | Brat Animator, Ingresso | Brat Animator | Ingresso: frase descrittiva |
| «Non il solito esercizio» | Beautify (×2), Chi sono | Beautify, risultato | Beautify intro e Chi sono: riscritte |
| «Non è un limite, è il perimetro» | yag, Metodo | Metodo | yag: detto in modo piano |
| «In coda non vuol dire confermato» | synk, Metodo | Metodo | synk: detto in modo piano |
| «Niente falsifica niente» | middleManPS4, Metodo | middleManPS4 | Metodo: citazione diversa |
| «La parte che non si vede» | Ingresso, Chi sono, Servizi | Servizi | Ingresso e Chi sono: riscritte |
| «Codice e grafica… dalla stessa persona» | Chi sono, Fuori orario | Chi sono | Fuori orario: riscritta |
| «Parto da una domanda semplice…» | Chi sono, Fuori orario | Fuori orario (parola del giorno) | Chi sono: riscritta |
| «Si aprono in fretta e si trovano su Google» | Ingresso, Servizi | Servizi | Ingresso: riscritta |
| «In momenti diversi, per motivi diversi» | Chi sono, Fuori orario | Fuori orario | Chi sono: riscritta |
| «Più o meno» | Chi sono, Fuori orario, Metodo | Fuori orario | Chi sono e Metodo: riscritte |
| «Errori compresi» | Chi sono, Fuori orario | Fuori orario | Chi sono: riscritta |
| «Non subito, ma rispondo» | Contatti, colophon (su ogni pagina) | colophon | Contatti: riscritta |
| «Il banco sta su 17» | Magazzino, Blackjack (titolo e regole) | Blackjack, regole | Magazzino e titolo: riscritti |

## Riga per riga

### Ingresso
| Chiave | Prima | Dopo (IT) | Dopo (EN) |
|---|---|---|---|
| home.w4desc | Un sito vetrina per un negozio che non esiste. Il negozio è finto, il sito no. | Un modello di sito vetrina pensato per essere riusato. Qui vende accessori a clienti immaginari. | A showcase site template made to be reused. Here it sells accessories to imaginary customers. |
| home.w1desc | Trasforma testi sincronizzati in lyric video, tutto nel browser. Nato per gioco, arrivato alla versione 5. Il gioco mi è sfuggito di mano. | Trasforma testi sincronizzati in lyric video, tutto nel browser. Siamo alla versione 5. | Turns synced lyrics into lyric videos, all in the browser. Now at version 5. |
| home.w3desc | Un gestionale per più saloni: clienti, servizi e orari che non si pestano i piedi. Database e backend sono miei. | Il gestionale per più saloni del mio diploma. Database e backend li ho scritti io. | The multi-salon management system from my diploma. I wrote the database and the backend. |
| home.a1text | Siti e applicazioni web che si aprono in fretta e si trovano su Google. | Siti e applicazioni web, dal primo schizzo alla pubblicazione. | Websites and web apps, from the first sketch to going live. |
| home.a2text | La parte che non si vede: server, database, automazioni. Se funziona, nessuno se ne accorge. | Server, database, automazioni. Se funziona, nessuno se ne accorge. | Servers, databases, automations. When it works, nobody notices. |
| home.r1 | Un agente locale per Windows: guarda l’app che hai davanti, scrive un piano con un modello Ollama locale, aspetta che tu lo legga e solo dopo clicca e scrive. Niente cloud, nessuna azione senza approvazione. | Un agente per Windows che lavora sul tuo PC e non sul cloud. Prima ti fa leggere il piano, poi clicca. | A Windows agent that runs on your PC, not in the cloud. It shows you the plan first, then it clicks. |

### Tutti i lavori
| Chiave | Prima | Dopo (IT) | Dopo (EN) |
|---|---|---|---|
| lv.spin | Un modello di sito vetrina. Il negozio è finto, il sito no. | Un modello di sito vetrina, provato su un negozio inventato. | A showcase site template, tried out on a made-up shop. |
| lv.piko | Un agente per Windows che guarda, pianifica con un modello locale e chiede prima di toccare qualsiasi cosa. | Un agente per Windows con un modello locale: niente si muove senza il tuo sì. | A Windows agent with a local model: nothing moves without your yes. |

### Chi sono
| Chiave | Prima | Dopo (IT) | Dopo (EN) |
|---|---|---|---|
| about.c1quote | Un gestionale vero, non il solito esercizio. | Più saloni, un database solo, dati che non si mescolano. | Several salons, one database, data that never mixes. |
| about.side1text | Curioso per natura. Parto da una domanda semplice e finisco a leggere cose che non servivano. Parlo cinque lingue, una meglio delle altre. | Curioso di natura: se una cosa funziona voglio sapere perché. Parlo cinque lingue, una meglio delle altre. | Curious by nature: if something works, I want to know why. I speak five languages, one better than the others. |
| about.side2text | Siti, applicazioni web, server e database relazionali, fino all’automazione industriale. La parte che non si vede, fatta come se si vedesse. | Siti, applicazioni web, server e database relazionali, fino all’automazione industriale. Curati anche dove nessuno guarda. | Websites, web apps, servers and relational databases, all the way to industrial automation. Looked after even where nobody looks. |
| about.l3text | Inglese, spagnolo, greco e cinese, imparate in momenti diversi per motivi diversi. | Inglese, spagnolo, greco e cinese. Ognuna ha la sua storia, le trovi in Fuori orario. | English, Spanish, Greek and Chinese. Each has its story: they're in Off hours. |
| about.langTitle | Scrivimi in una di queste. *Rispondo nella stessa, errori compresi.* | Scrivimi in una di queste. *Ti rispondo nella stessa.* | Write to me in one of these. *I'll answer in the same one.* |
| about.pathTitle | Sei capitoli, *in ordine. Più o meno.* | Sei capitoli, *dal primo all’ultimo.* | Six chapters, *first to last.* |

### Fuori orario
| Chiave | Prima | Dopo (IT) | Dopo (EN) |
|---|---|---|---|
| fo.o2text | Interfacce. Sistemo colori, spaziature e piccoli movimenti finché codice e grafica non sembrano fatti dalla stessa persona. | Interfacce. Colori, spaziature e piccoli movimenti, finché non smettono di darmi fastidio. | Interfaces. Colours, spacing and small movements, until they stop bothering me. |

### Metodo
| Chiave | Prima | Dopo (IT) | Dopo (EN) |
|---|---|---|---|
| me.r1b | middleManPS4 — rinominato da fwSpoofer, perché lì dentro niente falsifica niente | middleManPS4 — prima si chiamava fwSpoofer; il nome è cambiato perché non falsifica nulla | middleManPS4 — it used to be called fwSpoofer; the name changed because it spoofs nothing |
| me.procTitle | Come va un progetto, *più o meno.* | Come va un progetto, *di solito.* | How a project goes, *usually.* |

### Casi studio
| Chiave | Prima | Dopo (IT) | Dopo (EN) |
|---|---|---|---|
| beautify.intro | Un gestionale per più saloni: clienti, servizi, orari e appuntamenti nello stesso posto. Il mio progetto di diploma, in PHP e MySQL. Non il solito esercizio. | Un gestionale per più saloni: clienti, servizi, orari e appuntamenti nello stesso posto. Il mio progetto di diploma, in PHP e MySQL. | A management system for several salons: clients, services, hours and bookings in one place. My diploma project, in PHP and MySQL. |
| beautify.result | Un gestionale vero, *non il solito esercizio.* Ci tengo a ripeterlo. | Un gestionale vero, *non il solito esercizio.* | A real management system, *not the usual school exercise.* |
| yg.concept2 | Non esegue modelli e non esegue strumenti, e non lo farà mai. Non è un limite: è il perimetro. | Non esegue modelli e non esegue strumenti, e non lo farà mai: fa da porta, non da stanza. | It doesn't run models or tools, and it never will: it's the door, not the room. |
| synk.concept2 | Quindi le regole sono esplicite: se Calendar non risponde in modo affidabile, lo slot non è libero. In coda non vuol dire sincronizzato. Ogni stato incerto è visibile in dashboard e si può passare a una persona. | Quindi le regole sono esplicite: se Calendar non risponde in modo affidabile, lo slot non è libero, e una richiesta in coda resta in coda finché non è sincronizzata. Ogni stato incerto si vede in dashboard e si può passare a una persona. | So the rules are explicit: if Calendar doesn't answer reliably, the slot isn't free, and a queued request stays queued until it's synced. Every uncertain state shows in the dashboard and can be handed to a person. |

### Contatti e Magazzino
| Chiave | Prima | Dopo (IT) | Dopo (EN) |
|---|---|---|---|
| ct.coda | Si parte da un’email. Rispondo. Non subito, ma rispondo. | Si parte da un’email. Il resto lo vediamo dopo. | It starts with an email. We'll figure out the rest after. |
| mg.bj | Tu contro il banco. Il banco sta su 17. | Tu contro il banco, con gettoni che non valgono niente. | You against the dealer, with chips worth nothing. |
| bj.title | Blackjack. *Il banco sta su 17.* | Blackjack. *Il banco non ha fretta.* | Blackjack. *The dealer is in no hurry.* |
| mg.sc | Carte siciliane, settebello e primiera. Si va a 11. | Carte siciliane, settebello e primiera. Il computer conta bene. | Sicilian cards, settebello and primiera. The computer counts well. |
| mg.termText | Fammi due domande, a macchina. Sta in Chi sono. | Il terminale di Chi sono: scrivi e ti risponde. | The terminal in About: type and it answers. |

## Cosa non tocco

- I riassunti dei progetti in Ingresso e Lavori che usano gli stessi **fatti** dei casi studio (nomi, versioni, tecnologie): ripetere un fatto non è ripetere una battuta.
- Le prove citate in Metodo e in Sicurezza: sono citazioni volute dai progetti.
- L’elenco delle lingue con i livelli (C1, B1…): è un dato, sta bene in due posti.
