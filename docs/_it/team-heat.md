---
title: "Calore per squadra"
parent: "Modalità di calore"
nav_order: 6
lang: "it"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Calore per squadra

Il calore per squadra mostra dove si trovava ciascuna squadra, ognuna nel proprio colore. Dove le squadre si sovrappongono, i colori si mescolano.

**Calore per squadra** (tasto 3) è il campo di densità di [Calore](heat.md) con ogni [gruppo](glossary.md) dotato di una propria tinta. Dove i gruppi si sovrappongono, le loro tinte si mescolano; una sfida equilibrata risulta neutra. L'opacità continua a rappresentare la densità come nelle altre modalità, quindi l'immagine risponde insieme a *quanto* e *di chi*. Richiede una colonna di gruppo.

![Calore per squadra: ogni lato nel proprio colore; dove si sovrappongono, i colori si mescolano](../assets/img/en/heat-teams.webp)

Non è la [sovrapposizione delle figure](box-replay.md): quella disegna una figura per persona; questo è un campo di calore colorato dalla stessa colonna.

## Come si usa {#how-to-use-it}

1. Premi `3` (oppure scegli **Calore per squadra** nella barra delle modalità).
2. Apri **Colori del calore**. I campioni mostrano il colore di ogni gruppo; passa il mouse su un campione per il nome della squadra.
3. Se tutto appare grigio, alza **Separazione dei colori**.
4. Deseleziona un gruppo nell'[Elenco delle squadre](teams-list.md) per toglierlo; gli altri colori restano dove erano.

## Controlli {#controls}

Nella sezione **Colori del calore**:

| Controllo | Predefinito | Significato |
|---|---|---|
| Campioni | | Il colore di ogni gruppo, per i primi 12 gruppi, poi *+N altri*. Passa il mouse per il nome del gruppo e il colore. |
| **Separazione dei colori** | 1,4 | Quanto una miscela viene spinta lontano dal neutro, 0-4. 0 rende tutto grigio; 1 è la media vera; oltre circa 2 le miscele più chiare escono dalla gamma visualizzabile e vengono limitate per canale, cosa che sposta la loro tinta. |
| **Rampa di opacità (il colore viene dal gruppo)** | la rampa del calore predefinita | Qui viene usato solo il canale **alfa** della rampa: trasparente dove non c'è nulla, opaco in cima. I suoi colori vengono ignorati. |

Tutti gli altri controlli del calore - forma, saturazione, risposta, calore minimo, profondità, esclusione - funzionano come in [Calore](heat.md).

L'[Elenco delle squadre](teams-list.md) mostra in questa modalità il colore di calore per squadra di ogni gruppo come suo campione. Nascondere un gruppo lascia il colore di ogni altro gruppo dov'era: le tinte dipendono dal numero totale dei gruppi, non da quali sono accesi, così due immagini restano confrontabili.

## La tavolozza {#the-palette}

Da [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- I colori vivono sul piano di colore **Oklab** a luminosità (0,7) e croma (0,115) fissi, così ogni gruppo è ugualmente luminoso e un gruppo rosso non appare più caldo di uno blu.
- Con *n* gruppi, il cerchio delle tinte è diviso in *n* parti uguali e il gruppo *i* prende il **centro** della sua parte, `(i + 0,5) / n` di giro. Due gruppi qualsiasi sono lontani quanto il numero consente, e gli opposti restano opposti qualunque sia il conteggio.
- Al massimo vengono usate **16** tinte distinte. Con più gruppi, gli id vengono disposti per dimezzamenti ripetuti (id con bit invertiti: 0, ½, ¼, ¾, ⅛, …) così gli id vicini non condividono una tinta; i gruppi oltre il sedicesimo condividono necessariamente.
- Un gruppo la cui etichetta significa "nessun gruppo" - `0`, vuota, `none`, `unknown`, `null` o `-1`, senza distinzione di maiuscole - viene disegnato **grigio neutro** invece di prendere una fetta del cerchio. Viene trattata così solo la prima etichetta del genere nell'elenco dei gruppi.

Il valore predefinito di separazione è 1,4 e non 1 perché, a 1, una miscela di cinque tinte distribuite uniformemente *è* grigia: corretta e illeggibile. Un po' sopra 1 mantiene onesti i pareggi rendendo visibile una suddivisione 60/40.

## Come funziona {#how-it-works}

Il bersaglio di calore ha quattro canali in questa modalità. Ogni sprite aggiunge la sua densità *v* al primo canale e *v* × le coordinate Oklab *a* e *b* del gruppo al secondo e al terzo. Al momento della composizione la miscela del pixel è la media pesata per densità: *a* = G / R, *b* = B / R, scalata dalla separazione dei colori e convertita in sRGB alla luminosità della tavolozza. Dividere per la densità accumulata mantiene la tinta indipendente da quanti dati ci sono, ed è per questo che ogni controllo della densità continua ad agire solo sull'opacità.

Il bersaglio a quattro canali costa quattro volte la memoria GPU del bersaglio di calore a canale singolo, alla stessa risoluzione.
