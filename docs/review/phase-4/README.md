# Revisione finale — GL Menu

[Video degli effetti](effects.mp4) · [Desktop 1440](desktop.jpg) · [Tablet 768](tablet.jpg) · [Mobile 360](mobile.jpg) · [Desktop scuro](dark.jpg) · [Anteprima touch](mobile-preview.jpg)

Il video mostra la demo Brat, il cambio di anteprima, il puntatore, l’impostazione Ridotta, il Konami code ed `help`. Le riprese forzano l’indicatore di core del browser di test a 8 per mostrare la qualità Alta; i visitatori su dispositivi stimati deboli partono in Ridotta e possono cambiare la scelta. Il passaggio automatico Alta → Media → Ridotta è stato verificato separatamente con frame simulati ogni 34 ms, e il limite persiste dopo reload. Non è un benchmark di un dispositivo reale.

## Controllo contrasto

Axe `color-contrast`, Chromium, nei due temi: home, home con selezione/focus/hover, HOME aperto, Chi sono, Brat Animator, Fuori orario, 404. Nessuna violazione rilevata negli stati campionati. Per stati e superfici non interamente valutabili da Axe, sono stati controllati anche i colori dei token direttamente (rapporto WCAG, valori minimi tra pannello, superficie e sfondo selezionato):

| Stato / coppia | Chiaro | Scuro | Soglia AA adottata |
|---|---:|---:|---:|
| Testo principale (incl. hover/selezione) | 12,33:1 | 10,45:1 | 4,5:1 |
| Testo secondario (incl. regola per disabilitati) | 5,60:1 | 6,52:1 | 4,5:1 |
| Testo link e bordo/contorno focus | 5,80:1 | 7,55:1 | 4,5:1 per testo, 3:1 per contorno |
| Bordo neutro di tile, pulsanti e selettori | 3,77:1 | 3,85:1 | 3:1 |
| Testo CTA primaria | 6,45:1 | 9,86:1 | 4,5:1 |
| Testo canvas Brat | 9,75:1 | 9,75:1 | 4,5:1 |

I TODO sono **testo**, non falsi link o pulsanti disabilitati. Gli indicatori decorativi non sono l’unico segnale di stato. Questo è un controllo mirato, non una certificazione WCAG dell’intero portafoglio.

## Sottrazione proposta — non applicata

1. **Spegnere la manina per default**, lasciando il cursore nativo e il tilt. Due puntatori nello stesso punto competono per l’attenzione, e l’inseguimento è un loop in più durante il movimento del mouse. Il flag `pointerCompanion` permette di riattivarla.
2. **Far partire Brat a scelta**, mantenendo lo screenshot reale fino a un comando «Riproduci demo» (oppure far fermare la demo dopo un ciclo). Il verde e il moto continui rubano attenzione al menu; la demo resta il dettaglio più utile una volta scelto il progetto.
3. **Tenere il cavetto e ridurre la parallasse** se a schermo reale distrae: il primo spiega dove si è propagata la selezione; lo sfondo non è necessario alla comprensione. Party rimane nascosto e non anima finché non è attivato.

Raccomandazione: applicare **1** e provare **2** con un solo ciclo prima di cambiare la parallasse. Nessuno dei tagli sopra è stato applicato; i risultati Lighthouse in `baseline.md` sono sul candidato consegnato. Se il codice cambia dopo la decisione, ripetere le tre misure.

## Prima della pubblicazione

- [ ] [Checklist su Safari desktop/iOS e Firefox](../../browser-test.md); nessuna simulazione è presentata come test Apple reale.
- [ ] PDF del CV e URL LinkedIn verificato in `assets/gl/config.js`; ora sono TODO senza link fittizi.
- [ ] Link e screenshot autorizzati per i lavori clienti reali. Nessun cliente inventato.
- [ ] Aggiungere la dicitura di non affiliazione **nel repository `oakvx/topGun`**; il portfolio la mostra già, l’app è in un altro checkout.
- [ ] Confermare eventuali cambiamenti rispetto ai Segnalini smaltati e all’elenco asset senza licenza dichiarata; nessun’ulteriore rimozione legacy è stata indovinata dal testo segnaposto.

## Merge e cronologia

1. Dopo approvazione, push **solo** del branch `arena/e590662b-oakvx-github-io` e PR da quel branch verso `main`. Verificare il check statico, i test browser e l’anteprima. Eseguire il merge della PR esplicita soltanto dopo il via libera; poi controllare la pubblicazione GitHub Pages e, se raggiungibile, rifare Lighthouse sull’HTTPS pubblicato.
2. **Raccomandazione: non riscrivere la cronologia** se non è richiesta una rimozione storica. I file sostituiti non fanno parte della nuova versione pubblicata, ma i vecchi commit possono ancora contenerli. Uno squash della PR non cancella gli antenati già in `main`.
3. Se serve la rimozione storica, aprire un intervento separato e coordinato: backup offline, inventario di percorsi storici (anche rinomini e render incorporati), prova di `git filter-repo` su clone mirror isolato, verifica dei riferimenti/oggetti e dei file legittimi, pianificazione con chi usa il repo di branch protetti, tag e force-push. Fork, cloni, cache, release e oggetti di PR non sono necessariamente eliminati; per cache e riferimenti ospitati possono servire azioni separate con GitHub. Non eseguire questa operazione come parte del merge.
