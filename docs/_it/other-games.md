---
title: "Altri giochi di corse"
parent: "Analisi di gara"
nav_order: 59
lang: "it"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Altri giochi di corse nel visualizzatore

Il visualizzatore legge i giri di molti giochi di corse, non solo di uno. Questa pagina li elenca e spiega come ottenere un giro da ciascuno.

## I giochi {#the-games}

| Gioco | Registratore | Scivolamento nel file? | Mondo specchiato? | Note |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out via UDP), oppure i file di giro di FH Companion più i loro `.tele.gz` | sì, per ruota (normalizzato) | sì (mondo mancino) | il `.tele.gz` accanto a ogni giro di FH Companion dà lo scivolamento di ogni ruota; il solo file di giro no |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (memoria condivisa) | sì, per ruota | misurato dai giri | anche ABS e controllo di trazione in azione, carichi delle ruote, temperature |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | no, ricavato dalle velocità delle ruote | misurato dai giri | rally: il fondo sconnesso e i salti sono giudicati in modo diverso |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (UDP NGP) | no | misurato dai giri | nessuna velocità delle ruote |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (una mod) | no, ricavato dalle velocità delle ruote | misurato dai giri | |
| Trackmania | il plugin Openplanet, `telemetry --game trackmania --install` | un coefficiente di scivolamento per ruota | misurato dai giri | fisica arcade: le sbandate sono giudicate in modo diverso |
| iRacing | nessuno: il suo file `.ibt` | no (non registrato); ricavato dall'imbardata | no (basato su GPS) | attiva la registrazione nell'auto con Alt+L |

## Come registrare un giro {#how-to-record-a-lap}

1. Scegli il tuo gioco nella tabella e imposta il registratore come indica la pagina di quel gioco (un'impostazione nel gioco, una mod, o niente per iRacing). I passi cambiano da gioco a gioco, quindi sono nei documenti dei registratori: [GameCapture: giochi](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Avvia il registratore, poi guida. Scrive un file per giro.
3. Nella scheda **Analisi di gara** premi **Carica giri…** e scegli due o più giri dello stesso tracciato (vedi [Caricare i giri](race-loading-laps.md)).

Per i giochi rally il registratore dà un file per ogni tratto cronometrato, e per Forza l'avvio più semplice è la libreria di FH Companion con i suoi file `.tele.gz` accanto ai file di giro.

## Che cosa documentano i registratori {#what-the-recorders-document}

Come viene registrato ogni gioco, che cosa invia, le fonti dei suoi layout e quali tracciati si possono esportare dai suoi file è compito dei registratori documentarlo: [GameCapture: giochi](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (pubblico, in [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)), e il file di giro che scrive ogni registratore è [GameCapture: il formato del giro](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Che cosa fa il visualizzatore con i giri {#what-the-viewer-does-with-them}

Ogni gioco finisce in file `heat3d-lap` (o in un CSV di giro, oppure viene letto direttamente, come il `.ibt` di iRacing), con i nomi canonici dei canali di `src/race/schema.ts` e un blocco `meta` che dice che cosa significano i suoi numeri — come è scalato il suo scivolamento, se è circuito, rally o arcade, la superficie quando è nota — così la scheda **Analisi di gara** li tratta tutti allo stesso modo. Quando non è caricato alcun modello di tracciato, la scheda **Analisi di gara** disegna una strada dalla dispersione dei giri stessi, quindi ogni gioco è utilizzabile anche senza.

Ciò che nessun gioco rally invia — lo scivolamento delle gomme — lo ricava il visualizzatore: dal punto di contatto di ogni ruota o dalla sua velocità di superficie rispetto alla velocità dell'auto, dove un gioco ne invia una (`(ruota - auto) / auto`), oppure dalla rotazione e da un raggio di rotolamento misurato sul giro stesso, dove invia solo la rotazione. L'angolo di deriva viene dalla velocità propria dell'auto (Forza, i giochi AC, Trackmania, RBR), dalla velocità nel mondo proiettata sugli assi dell'auto (EA WRC, DiRT, BeamNG), oppure dalla direzione rispetto al percorso. Se l'auto è in aria lo si capisce dal contatto, dal carico o dalla sospensione delle ruote. Vedi `src/race/derive.ts`.

Dove il mondo di un gioco è mancino — come quello di Forza — il tracciato esce specchiato nel visualizzatore; lo sterzo e la sospensione dei giri lo rivelano, e la scheda **Analisi di gara** offre di invertire un asse. I giochi il cui orientamento non è documentato (RBR, BeamNG, Trackmania) vengono trattati allo stesso modo: misurati, non supposti.

Oltre ai canali di guida, i registratori conservano ciò che ogni gioco aggiunge: per i giochi AC l'ABS e il controllo di trazione in azione, la ripartizione della frenata, DRS, limitatore di corsia dei box, boost e la vita di pastiglie e dischi dei freni; per iRacing le impostazioni degli aiuti, la ripartizione della frenata, il carburante, le temperature dell'olio e dell'acqua, e ogni altro canale che registra con il proprio nome. Il visualizzatore li disegna dalla sua tabella dei canali — spie, livelli, simboli, grafici — quindi registrarne di più non richiede alcuna modifica al visualizzatore.
