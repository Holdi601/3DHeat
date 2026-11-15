---
title: "Entità"
parent: "Filtri e strumenti"
nav_order: 3
lang: "it"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entità

**Entità** ti permette di scegliere un giocatore (o alcuni) per vedere solo dove è andato quel giocatore. Usalo per seguire il tuo movimento o un avversario.

Il pannello viene mostrato quando il dataset ha una colonna persona. La sua intestazione mostra il numero delle persone, oppure `selezionate di totali` mentre una selezione è attiva (una *persona* è un giocatore o un'IA, vedi il [glossario](glossary.md)).

## Scegliere un giocatore {#pick-a-player}

1. Apri **Entità** nella barra laterale.
2. Scrivi una parte del nome nella casella di ricerca.
3. Spunta il giocatore. L'intestazione dice, per esempio, `2 di 10`, e tutto il resto scompare.
4. **Svuota** mostra di nuovo tutti.

![Entità con due giocatori su dieci selezionati](../assets/img/en/entities-selected.webp)

La selezione mostra solo le persone selezionate, nelle modalità di calore (punti, linee, differenza, calore per squadra) e anche nelle tracce, nelle figure e nelle scie del [replay a figure](box-replay.md). Lasciala vuota per mostrare tutti; selezionare tutti è lo stesso che non selezionare nessuno.

## Il pannello {#the-panel}

| Parte | Significato |
|---|---|
| Casella di ricerca | *Cerca tra N entità...* - filtra l'elenco per una parte del nome, senza distinzione di maiuscole. Mostra `N risultati`, oppure `N risultati, mostrati i primi 200`; *Nessun risultato per "..."* quando la ricerca non trova nulla. |
| Elenco | Fino a 200 persone (le prime 200 che corrispondono), ognuna con una casella, un campione del colore della persona e il nome (*(senza nome)* per un nome vuoto). |
| Suggerimento "in gioco" | Quando il tempo scorre, l'elenco contiene quelle *in gioco alla testina di riproduzione*; una ricerca le trova tutte. |
| **IA (n)** | Un gruppo ripiegabile con le unità controllate dall'IA, separate dai giocatori. |
| **Aggiungi elencati** | Aggiunge alla selezione tutti quelli attualmente elencati. |
| **Solo elencati** | Rende la selezione esattamente quelli elencati. |
| **Svuota** | Svuota la selezione. |

## Limiti {#limits}

Nel calore la selezione è un filtro e usa uno dei quattro [slot dei filtri](filters.md#rules). Quando gli altri filtri usano già tutti e quattro, il pannello dice *Non applicato al calore: tutti gli slot dei filtri sono occupati. Il replay a figure mostra ancora solo queste entità. Rimuovi un filtro in Filtri per liberarne uno.* Togli un filtro per liberare uno slot.

La selezione viene svuotata a ogni nuovo dataset. La scheda Partita imposta la stessa selezione quando mette a fuoco un giocatore.

## Per gli sviluppatori {#for-developers}

La selezione viene memorizzata come filtro *persons* ([Filtri](filters.md#for-developers)). La maschera dello shader contiene 65.536 id di persona; una persona oltre quel numero non viene disegnata nel calore mentre una selezione è attiva.
