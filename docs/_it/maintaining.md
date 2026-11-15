---
title: "Manutenzione della documentazione"
nav_order: 23
lang: "it"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Manutenzione della documentazione

Questa pagina è per chi si occupa del visualizzatore e di questo sito. Elenca i passi per mantenere corrette le pagine, le immagini e le traduzioni dopo una modifica.

Questo sito viene controllato di nuovo a **ogni rilascio** e ogni volta che cambia molto qualcosa: scorciatoie, il percorso nell'interfaccia, impostazioni, formati di file. La lista di controllo:

1. **Rigenera le pagine di riferimento**: `node tools/docs-refs.mjs` (e `--lang <lang>` per ogni lingua). `node tools/docs-refs.mjs --check` fallisce quando una pagina non è aggiornata.
2. **Rigenera gli screenshot** dai [dati demo](demo-data.md). Usa un computer o un container la cui regione è en-US, così i numeri si leggono `0.35` e non `0,35` (le caselle dei numeri seguono la regione del browser finché non vengono cambiate). Crea i dati demo con `node tools/demo-data.mjs`, avvia un server di sviluppo sulla porta 5321 **senza** un pacchetto locale di figure, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, poi esegui `node tools/docs-shots.mjs --lang <lang>`. Guarda ogni immagine: solo nomi demo (*Demo Valley*, *Blue 1*, *Red 3* ...), nessuna mappa reale, nessun giocatore o registrazione vera.
3. **Elenca ciò che è cambiato** dall'ultimo tag di rilascio: `git log --oneline <last tag>..HEAD`, e la sezione **Docs** di `CHANGELOG.md`, che associa ogni funzione alla sua pagina. Ogni nuova funzione ha bisogno di una pagina o di una sezione, con un'immagine dove si vede sullo schermo.
4. **Revisione indipendente** delle pagine in inglese da parte di qualcuno che non le ha scritte, per tre lettori: un principiante, un bambino di otto anni, un esperto. I passi sono completi e nell'ordine giusto, le parole sono quelle dell'interfaccia, le immagini sono attuali, le etichette dei diagrammi sono giuste?
5. **Correggi ciò che la revisione ha trovato.**
6. **Ritraduci le pagine cambiate** tramite il loro hash di sorgente, poi esegui la revisione per lingua. Vedi `tools/docs-translate.md`.
7. **Cerca termini riservati** nei file cambiati, e controlla che nessuna immagine mostri altro che dati demo.
8. **Pubblica** solo quando il rilascio è approvato.

Lo stesso controllo vale per i siti di documentazione dei repository collegati (vedi la pagina [Home](index.md#related-repositories)).

## Gli strumenti in exporters/ {#the-tools-under-exporters}

Gli strumenti intorno al visualizzatore sono progetti pubblici separati, ognuno con la propria licenza MIT, le proprie versioni, il proprio wiki e il proprio controllo di aggiornamento, fissati in questo repository come sottomoduli git:

| Cartella | Repository |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - tracciati e livelli dagli archivi dei giochi |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - registratori di telemetria dei giri; livelli dai video di gioco |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - plugin per l'Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - demo e mappe di CS2 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - registra il gioco in background |

**Fissato** significa che questo repository registra un commit esatto di ogni strumento. Un checkout del visualizzatore ottiene quei commit:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# oppure, dopo un clone semplice:
git submodule update --init
```

Entrambi i percorsi di aggiornamento qui sopra eseguono `git submodule update --init` dopo il pull, quindi gli strumenti seguono il visualizzatore sui commit che fissa la sua versione più recente - non sui commit più recenti degli strumenti stessi. La nuova versione di uno strumento arriva al visualizzatore quando si sposta il fissaggio qui: le modifiche a uno strumento vengono prima committate e pubblicate nella sua cartella (il suo repository), poi il nuovo fissaggio viene committato qui. Ogni strumento controlla anche le proprie versioni più recenti; questo è documentato nel suo repository.
