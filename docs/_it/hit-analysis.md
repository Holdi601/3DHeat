---
title: "Analisi dei colpi (scheda Veicoli)"
parent: "Replay"
nav_order: 4
lang: "it"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Analisi dei colpi

La scheda **Veicoli** mostra dove un carro, una nave o un soldato è stato colpito, e da chi. Usala per vedere quale lato di un carro viene colpito, o quale nemico fa i danni.

## Provalo {#try-it}

1. Carica una partita che ha dei colpi (vedi la tabella sotto per sapere quali giochi li danno).
2. Apri la scheda **Veicoli** in alto.
3. Sotto **Veicolo**, scegli un'unità, per esempio un tipo di carro. Il numero tra parentesi è quanti colpi ha subito.
4. Leggi la figura: ogni segno è un colpo, collocato dove ha colpito.
5. Apri **Chi l'ha colpita** per vedere i tiratori, le armi o i veicoli dei tiratori, con colpi, danni, uccisioni e distanza.

![La scheda Veicoli: un carro demo con i segni dei colpi, e Chi l'ha colpita aperto](../assets/img/en/hit-analysis-tank.webp)

Se non c'è nulla caricato, o se i dati non hanno colpi sui veicoli, la scheda dice cosa manca e quale convertitore usare.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

La figura mostra i colpi dove i dati danno un punto o una parte del corpo. Il dettaglio (chi l'ha colpita, con cosa, quanto forte, da quanto lontano) funziona per ogni fonte.

## Cosa dà ciascuna fonte {#what-each-source-gives}

| Fonte | Punto sull'unità | Tiratore | Arma | Danno / esito |
|---|---|---|---|---|
| War Thunder | sì, nel sistema dell'unità, con la direzione del colpo | sì | il veicolo del tiratore | critico, grave, moduli distrutti, colpo mortale |
| CS2 | parte del corpo (hitgroup) | sì | sì | danno, armatura, salute rimasta |
| World of Tanks | sì (riquadro del componente, entrata e uscita) | sì | - | danno o nessuno (rimbalzo, nessuna penetrazione) |
| World of Warships | sì, nel sistema della nave | sì | tipo di colpo | - |
| Squad | veicoli: sì - l'impatto collocato nel sistema del veicolo dalla sua posizione e direzione | no (i dati non ne nominano nessuno) | il tipo di danno | la caduta della salute del veicolo in quel momento, distrutto |
| Soldati di Squad | no: gli esiti dei colpi (osso e punto d'impatto) restano grezzi nel convertitore; le righe `impact` con `hitBone` vengono lette appena le scrive | | | solo ferite e morti |
| Arma (OCAP, il registratore di Arma 3) | no: OCAP registra chi ha colpito o ucciso chi, con cosa, da quanto lontano, non dove | sì | sì | colpo o uccisione, distanza |
| Tacview ACMI | sì dove un oggetto arma finisce entro 30 m da un'unità (non il suo lanciatore): il suo ultimo posto nel sistema dell'unità (direzione, beccheggio, rollio), arrivando nel modo in cui è volato | il `Parent` dell'arma | il nome dell'arma, o l'AmmoType di un Timeout | Outcome del Timeout, cali di `Health`, `Destroyed`; senza un'arma, un'uccisione o un danno senza punto |
| Telemetria IL-2 (Watcher) | sì: gli eventi `hit` / `damage` portano il punto nel sistema dell'aereo del giocatore (preso come x avanti, y su, z destra) | no | no | la forza |
| Dota 2 | no: il log di combattimento non ha un posto su un eroe | l'unità attaccante | l'abilità o l'oggetto (nessuno: un attacco) | danno, morte dell'eroe |
| Battlefield 6 (GameCapture) | no: la cattura legge il feed delle uccisioni (uccisioni, morti, flag di colpo alla testa), non i colpi | | | |
| DCS / altre fonti live del Watcher | nessun evento di colpo oltre a ciò che contengono le loro registrazioni Tacview | | | |

Dove nessun colpo dell'unità ha un punto, la figura non mostra segni e il dettaglio **Chi l'ha colpita** si apre da solo: per tiratore, arma o veicolo del tiratore, ciascuno con i suoi colpi, danni e uccisioni, e la distanza mediana e quella massima.

## Limita a un'area {#restrict-to-an-area}

La sezione **Area** limita l'analisi ai colpi avvenuti in un luogo della mappa.

1. Premi **Disegna rettangolo** o **Disegna poligono**, e disegna sul terreno 3D o sulla mappa tattica.
2. Scegli **Vittima dentro** (conta un colpo quando l'unità colpita era nell'area) o **Tiratore dentro** (quando lo era chi ha sparato).
3. Premi **Usale come filtro**. I chip mostrano "{n} di {total} colpi nell'area".
4. **Reimposta area** rimuove tutte le aree.

Ogni area è un [volume](volumes.md), quindi le stesse forme filtrano anche la mappa di calore e il replay. Un'area può includere o escludere (un'area che esclude lascia fuori i suoi colpi, mostrato come "{n} di {total} colpi fuori dall'area"). Ogni area appare come un chip con quanti colpi dell'unità vi erano contenuti; la × su un chip lo rimuove. I conteggi, la figura, il dettaglio e le liste dei filtri seguono tutti.

I luoghi di un colpo: la riga da cui viene ha il luogo di una parte (della vittima per un colpo subito o un colpo ricevuto, del tiratore per uno sparo); l'altra parte è il campione proprio di quell'unità più vicino nel tempo (entro 5 s). Un colpo il cui luogo della parte non è noto viene escluso mentre un'area filtra, e il pannello dice quanti sono ("Esclusi, nessun luogo noto").

## Per gli sviluppatori {#for-developers}

Qualsiasi convertitore può aggiungere colpi: una riga della vittima (`hit`, `impact`, `hurt`, `wounded`) con `hitBone` (un osso dello scheletro, una selezione di Arma, una zona di colpo di Reforger - mappata su testa, petto, stomaco, braccia e gambe) oppure `hitLocalX/Y/Z` (metri, x avanti, y su, z destra), con `other` il tiratore e `damage`.
