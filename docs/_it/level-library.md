---
title: "Libreria dei livelli"
parent: "Livelli e geometria di sfondo"
nav_order: 4
lang: "it"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Libreria dei livelli

La libreria conserva i tuoi livelli in questo browser, così non devi caricarli e semplificarli di nuovo. **Cancellare i dati del sito nel browser elimina la libreria, e non c'è alcuna esportazione.** Conserva i tuoi file originali.

Elaborare un livello - analizzare, classificare, saldare, decimare, impacchettare le texture - è lento, e il risultato è sempre lo stesso. La **Libreria** in fondo al pannello Sfondo / livello conserva i livelli elaborati in questo browser, così una mesh decimata non viene mai ricostruita due volte ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Salvare e ricaricare un livello {#save-and-reload-a-level}

1. Carica un'immagine della mappa o un modello 3D e controlla che sembri giusto.
2. Premi **Salva nella libreria**. Il pannello dice *Salvato. La prossima volta si caricherà all'istante.*
3. La volta successiva, apri l'elenco **Libreria** e premi ▸ sul livello.
4. Premi ✕ per eliminare una voce che non ti serve più.

## Come si usa {#using-it}

| Controllo | Effetto |
|---|---|
| **Salva nella libreria** | Memorizza il livello attuale. Un'immagine della mappa viene salvata come PNG con i suoi due ancoraggi; un modello come i suoi buffer elaborati. Il pannello dice *Salvato. La prossima volta si caricherà all'istante.* |
| Elenco della libreria | Una riga per livello memorizzato: nome (con la sua dimensione salvata al passaggio del mouse), triangoli per un modello o larghezza in pixel per un'immagine. |
| ▸ (*Carica*) | Carica la voce come livello attuale. |
| ✕ (*Elimina*) | Rimuove la voce. |
| Riga di utilizzo | `In uso X di Y.` - la stima di archiviazione del browser per questo sito. |

Quando non c'è nulla di memorizzato, l'elenco dice *Vuoto. Carica una mappa o un modello, poi "Salva nella libreria".*

## Che cosa viene memorizzato {#what-is-stored}

| Tipo | Memorizzato | Non memorizzato |
|---|---|---|
| Immagine della mappa | L'immagine (PNG), la sua dimensione, i suoi ancoraggi | Elevazione, inversione, opacità, luminosità, desaturazione - riportati ai valori predefiniti (elevazione = la Y più bassa del dataset attuale, inversione attiva) |
| Livello 3D | Vertici, colori dei vertici, coordinate delle texture, le loro tessere e l'atlas delle texture, triangoli di terreno / struttura / acqua, spigoli delle strutture, conteggi dei triangoli | Nomi delle parti e motivi della classificazione, e ogni impostazione di aspetto - riportate ai valori predefiniti di una importazione nuova |

Un modello caricato dalla libreria non ha un elenco di parti, e i suoi limiti e la fascia di altezza del terreno vengono ricalcolati dai suoi vertici.

## Dove si trova {#where-it-lives}

Nell'IndexedDB del browser, database `3dheat`, archivio oggetti `levels`, per l'origine della pagina (l'indirizzo nella barra degli indirizzi del browser). È locale a quel profilo del browser: un altro browser, un altro profilo o un altro indirizzo (per esempio `localhost` invece di `127.0.0.1`) vede una libreria diversa, vuota. Cancellare i dati del sito nel browser la elimina. Le voci salvate da versioni precedenti senza strutture, colori o acqua si caricano ancora.
