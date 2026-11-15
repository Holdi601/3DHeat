---
title: "Elenco delle squadre"
parent: "Filtri e strumenti"
nav_order: 2
lang: "it"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Elenco delle squadre

Il pannello **Squadre** ti permette di nascondere una squadra o di metterla da un lato di un confronto. Usalo per guardare solo i Blue, o per chiedere "dove va Blue che Red non va?".

Un *gruppo* è una squadra o un lato, per esempio Blue e Red ([Gruppi](sessions-persons-groups.md#group)). Il pannello viene mostrato quando il dataset ha una colonna gruppo; il numero dei gruppi è nella sua intestazione. In modalità Calore per squadra la barra laterale ha anche una sezione chiamata **Vista squadre** con le sue impostazioni; questa pagina riguarda l'elenco **Squadre**.

## Nascondere una squadra {#hide-a-team}

1. Apri **Squadre** nella barra laterale.
2. Togli la spunta alla casella (*Visibile*) della squadra da nascondere. L'immagine si aggiorna subito.
3. Premi **Mostra tutti** per riportare visibile ogni squadra.

![L'elenco Squadre: Blue 5p, Red 5p, con Mostra tutti](../assets/img/en/teams-list.webp)

## Ogni riga {#each-row}

| Parte | Significato |
|---|---|
| Casella (*Visibile*) | Mostra o nasconde il gruppo. |
| Campione | Il colore del gruppo: il suo colore del [calore per squadra](team-heat.md) in modalità Calore per squadra, il suo colore di base negli altri modi. |
| Nome | L'etichetta del gruppo (etichetta completa al passaggio del mouse). |
| **+** / **-** (modalità Differenza) | Mette il gruppo dal lato positivo o negativo della [differenza](difference.md); clicca di nuovo il pulsante attivo per metterlo da nessuno dei due lati. |
| `Np` (altre modalità) | Il numero delle persone la cui prima riga è in questo gruppo. |

![Modalità Differenza: Blue dal lato +, Red dal lato -](../assets/img/en/teams-list-difference.webp)

## Pulsanti {#buttons}

| Pulsante | Effetto |
|---|---|
| **Mostra tutti** | Rende di nuovo visibile ogni gruppo. |
| **Dividi equamente** (modalità Differenza) | Prima metà dei gruppi (arrotondata per eccesso) su +, il resto su -; la stessa divisione con cui parte ogni caricamento. |

## Che cosa fa nascondere un gruppo {#what-hiding-a-group-does}

- In **Calore**, **Calore per squadra** e **Linee**, le righe del gruppo non contribuiscono a nulla.
- In **Differenza**, un gruppo nascosto non contribuisce a nulla da qualunque lato sia, anche con una suddivisione per un'altra colonna (vedi [Differenza](difference.md#for-developers)).
- Nella **sovrapposizione delle figure**, le persone la cui prima riga è in quel gruppo non vengono disegnate.
- In **Calore per squadra**, gli altri gruppi mantengono i loro colori: le tinte vengono assegnate dal numero totale dei gruppi, non da ciò che è visibile, così due immagini restano confrontabili.

Cambiare la visibilità riavvia l'accumulo. A ogni nuovo dataset, ogni gruppo torna visibile.

Il suggerimento del pannello cambia con la modalità: in Differenza spiega + e -; in Calore per squadra, che i campioni sono i colori con cui ogni gruppo viene disegnato.
