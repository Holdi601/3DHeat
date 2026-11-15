---
title: "Impostazioni, unità e tasti"
nav_order: 19
lang: "it"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Impostazioni, unità e tasti

I piccoli controlli in cima alla barra laterale cambiano il modo in cui il visualizzatore ti parla: la lingua, le unità (metri o piedi, km/h o nodi) e una modalità di aiuto che spiega i colori. Le tue scelte vengono ricordate nel browser.

## L'intestazione {#the-header}

In cima alla barra laterale:

| Controllo | Cosa fa |
|---|---|
| **?** | Modalità di aiuto: cosa significa ogni colore (anche `?` o `F1`) |
| Menu **Unità** | Metrico, Imperiale, Aviazione o Nautico |
| Pulsante **...** accanto a **Unità** | Apre "Scegli un'unità per ogni grandezza": un menu a tendina per ogni grandezza |
| Menu **Lingua** | La lingua del visualizzatore: [40 lingue](languages.md), oppure quella del browser |

![L'intestazione con il menu Unità e la finestra unità per grandezza aperta](../assets/img/en/settings-units.webp)

I numeri che digiti in una casella possono usare un punto o una virgola (`0.35` oppure `0,35`). Il visualizzatore legge entrambi e mostra i numeri nel modo in cui li scrive la lingua del visualizzatore.

## Unità {#units}

1. Scegli un preset nel menu **Unità**. Tutte le grandezze cambiano insieme.
2. Per cambiare una sola grandezza, clicca il pulsante **...** accanto ad essa e scegli un'unità per quella grandezza. Il menu mostra allora un `*` dopo il preset.
3. Una grandezza che non hai impostato segue il preset. Scegli "Come da preset" per tornare indietro.

| Grandezza | Metrico (predefinito) | Imperiale | Aviazione | Nautico |
|---|---|---|---|---|
| Distanza | km | mi | NM | NM |
| Altitudine, lunghezza | m | ft | ft | m |
| Velocità | km/h | mph | kt | kt |
| Velocità verticale | m/s | ft/min | ft/min | m/s |
| Temperatura | °C | °F | °C | °C |
| Pressione | hPa | inHg | hPa | hPa |
| Massa, carburante | kg, l | lb, gal | lb, gal | t, m³ |
| Angolo | gradi | gradi | gradi | gradi |

Altre unità che puoi scegliere per una grandezza: distanza km, mi, NM; velocità km/h, m/s, kt, mph; velocità verticale m/s, ft/min, m/min; temperatura °C, °F, K; pressione hPa, inHg, mmHg, psi; massa kg, lb, t; angolo gradi o mil NATO (6400 per cerchio). Le unità sono le stesse ovunque nel visualizzatore: etichette, schede, grafici, statistiche.

## Modalità di aiuto {#help-mode}

![Modalità di aiuto: cosa significano i colori](../assets/img/en/help.webp)

Premi `?` o `F1`, oppure clicca il pulsante **?**. Mostra *Cosa significano i colori*: le legende della vista 3D, le rampe del calore, i colori delle squadre, i colori del livello, i colori di stato dei pannelli, il pannello della partita e la vista di gara. Resta attiva finché non la spegni. Nella scheda Partita spiega anche i colori del pannello della partita.

![Modalità di aiuto nella scheda Partita](../assets/img/en/settings-help-match.webp)

## Cosa ricorda il browser {#what-the-browser-remembers}

Queste impostazioni vengono conservate nel tuo browser tra una visita e l'altra (non viene inviato nulla da nessuna parte):

- la lingua, le unità e la modalità di aiuto;
- le impostazioni delle figure, dei simboli, delle etichette, della telecamera e del display tattico del replay;
- la velocità di riproduzione e lo specchiamento;
- i segnalibri per registrazione, i volumi per dataset, i livelli degli obiettivi;
- le impostazioni dell'IA esterna (la chiave solo se spunti *Ricorda*).

Le impostazioni del calore, i filtri e la modalità ripartono da zero a ogni caricamento. L'elenco completo, generato automaticamente: [Impostazioni salvate](ref-settings-storage.md).

## Tasti che il visualizzatore conserva dal browser {#keys-the-viewer-keeps-from-the-browser}

Una sessione con dati grandi richiede tempo per caricarsi, quindi il visualizzatore impedisce al browser di buttarla via per sbaglio:

- `Ctrl`/`Cmd` + lettere che stamperebbero, salverebbero, aprirebbero, ricaricherebbero, chiuderebbero o aprirebbero nuove finestre non fanno nulla fuori dalle caselle di testo; `F1`, `F3`, `F5`, `F6` e `F7` non fanno nulla.
- Chiudere o ricaricare la scheda con dati o un livello caricati chiede prima conferma.
- A schermo intero il visualizzatore blocca i tasti che usa (W, T, N, S, R, P, Q, Esc), così il browser non se ne appropria.

L'elenco esatto: [Tasti del browser](ref-browser-keys.md). Tutti i tasti del visualizzatore: [Riferimento tastiera e mouse](keyboard-reference.md).
