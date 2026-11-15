---
title: "Filtri e strumenti"
nav_order: 6
has_children: true
lang: "it"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtri e strumenti

Questi pannelli ti permettono di scegliere *quali* dati guardare e di misurare ciò che vedi. Usali quando l'immagine è troppo piena: mostra una squadra, un giocatore, un luogo o un piano di un edificio.

Ogni pannello restringe i dati, e lavorano insieme: una riga viene disegnata solo se passa **tutti** (AND).

```
tutte le righe -> Filtri -> Squadre -> Entità -> Sezione -> immagine
                   AND       AND       AND        AND
```

Esempio: deseleziona *Tank* in Filtri, nascondi la squadra Red in Squadre e scegli un giocatore in Entità. Vedi solo i movimenti di quel giocatore che non sono di un carro.

| Pannello | Cosa fa | Modalità di calore | Figure sovrapposte |
|---|---|---|---|
| [Filtri](filters.md) | Filtri per intervallo e per categoria su qualsiasi colonna mantenuta al caricamento. | Sì | No (solo filtri di colonna) |
| [Suddivisione per differenza](difference.md#the-difference-split-panel) | Quali righe sommano e quali sottraggono, in modalità Differenza. | Solo Differenza | No |
| [Squadre](teams-list.md) | Mostra o nasconde ogni squadra; mette le squadre sul lato + o -. | Sì | Sì |
| [Entità](entities.md) | Scegli i singoli giocatori. | Sì | Sì |
| [Sezione](slice.md) | Taglia una fetta del livello e del calore, per guardare dentro gli edifici. | Sì, e il livello | No |
| [Misura](measure.md) | Un righello e il valore di calore sotto il cursore. | Sì | Sì |
| [Volumi e confronto](volumes.md) | Disegna forme 3D e chiedi cosa è successo dentro. Può anche filtrare. | Sì | Sì |
| [Dettaglio](breakdown.md) | Quale veicolo, giocatore o arma rende meglio in un luogo. | n/d | n/d |

L'analisi dei colpi ha un proprio filtro d'area nella scheda **Veicoli**: vedi [Analisi dei colpi](hit-analysis.md).

Termini come mappa di calore, riga, persona e gruppo sono spiegati nel [glossario](glossary.md).

## Dove sono i pannelli {#where-the-panels-are}

La barra laterale della scheda Mappa di calore, dall'alto al basso:

1. Barra delle modalità e selettore di sessione
2. Sorgente, Mappatura delle colonne, Dataset
3. Percorsi (modalità Linee)
4. I pannelli del calore, oppure la Vista squadre
5. Suddivisione per differenza
6. Squadre
7. Entità
8. Filtri
9. Sfondo / livello
10. Sezione
11. Misura
12. Percorso della telecamera e resa
13. Prestazioni
14. Telecamera e scena

La scheda Partita mostra la barra delle modalità, il selettore di sessione, il proprio pannello, Filtri, Sfondo / livello e Telecamera e scena.
