---
title: "Gamepad e HOTAS"
parent: "Telecamera e controlli"
nav_order: 1
lang: "it"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Gamepad e HOTAS

Puoi muovere la telecamera con un controller in stile Xbox invece che con la tastiera. Usalo quando vuoi sederti comodo e guardarti intorno in una scena grande. Il suo input **si aggiunge** a quello della tastiera, quindi puoi usarli entrambi insieme.

## Collegare un controller {#connect-a-controller}

1. Collega il controller (o accoppialo).
2. Clicca sulla vista e premi un pulsante qualsiasi del controller. I browser mostrano un controller solo dopo il suo primo input.
3. Apri **Telecamera e scena → Gamepad**. L'elenco dei dispositivi lo mostra con `●`.
4. Spingi la levetta sinistra per muoverti, quella destra per guardarti intorno. Se la telecamera deriva con le levette al centro, alza la **Zona morta**.

Funziona ogni dispositivo che il browser associa al layout standard di gamepad. Una levetta di volo o un manetta (HOTAS) vengono ignorate per impostazione predefinita; vedi sotto.

## Mappatura {#mapping}

| Controllo | Effetto |
|---|---|
| Levetta sinistra | Muovi: avanti/indietro e lateralmente |
| Levetta destra | Guarda: imbardata e beccheggio, a *Velocità dello sguardo* gradi al secondo con la levetta tutta spinta |
| `RT` / `LT` (analogici) | Su / giù; nella proiezione parallela, zoom avanti / indietro |
| `RB` (tenuto) | 6× più veloce |
| `LB` (tenuto) | 15% della velocità |
| `A` (tenuto) | 3× scatto (si combina con RB/LB) |
| `Y` (premuto) | Inquadra i dati |

I numeri dei pulsanti seguono il layout standard: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; le levette sugli assi 0-1 (sinistra) e 2-3 (destra).

## Le impostazioni del Gamepad {#the-gamepad-settings}

In **Telecamera e scena → Gamepad**. **Impostazioni** / **Nascondi** apre e chiude i controlli di regolazione.

| Controllo | Predefinito | Intervallo (rotella) | Significato |
|---|---|---|---|
| **Attiva** | attivo | | |
| Stato dei dispositivi | | | Ogni dispositivo collegato, `●` quando è seguito, `○` quando non lo è, con *- non è un gamepad XInput, ignorato* o *- non è un gamepad XInput, usato comunque* per i dispositivi non standard. Senza nessuno: *Nessun gamepad rilevato. I browser rivelano un controller solo dopo il suo primo input — premi un suo pulsante.* |
| **Dispositivo da usare** | *Solo gamepad XInput (consigliato)* | | Mostrato quando è collegato un dispositivo non standard. Scegli un dispositivo per nome per seguire quello invece. |
| **Velocità dello sguardo** | 150°/s | 20-540 (5000) | Velocità di rotazione con la levetta destra tutta spinta. |
| **Zona morta** | 12% | 0-50% (95%) | Radiale: una spinta in diagonale non finisce mai su un solo asse. Alzala se la telecamera deriva con le levette al centro. |
| **Curva delle levette** | x² | lineare (1) fino a x⁴ (16) | Esponente della risposta dopo la zona morta: controllo più fine vicino al centro, velocità piena al bordo. |
| **Inverti Y delle levette** | off | | |
| **Scambia le levette** | off | | Muovi con la levetta destra, guarda con la sinistra. |

La forma della levetta: con spostamento *m* (la lunghezza del vettore della levetta) e zona morta *d*, l'uscita = ((m - d) / (1 - d)) ^ curva lungo la direzione della levetta, e 0 dentro la zona morta.

## Perché, per impostazione predefinita, solo i gamepad standard {#why-only-standard-pads-by-default}

L'API Gamepad segnala **ogni** dispositivo HID con assi - levette di volo, manette, pedali, volanti - e questi non stanno al centro: un asse di torsione o la leva di una manetta sta a fondo corsa quando nessuno la tocca. Letto come una levetta, è un input fisso a velocità piena che nessuna zona morta può eliminare, e la telecamera gira da sola dal momento in cui si carica la pagina (e anche ogni modalità di calore sembra rotta, perché una telecamera in movimento riavvia l'accumulo a ogni fotogramma).

Quindi un dispositivo viene seguito solo quando il browser segnala `mapping: "standard"`, il suo modo di dire "un pad in stile XInput con gli assi dove te li aspetti". Gli altri dispositivi sono elencati e segnati come ignorati, e **Dispositivo da usare** ne sceglie uno in modo esplicito - per muovere la telecamera con un HOTAS, per esempio. Una volta seguito un pad, la telecamera resta con lui, così due controller non si contendono la telecamera a seconda dell'ordine di enumerazione.

**HOTAS:** vengono letti solo gli assi 0-3 (due levette) e i pulsanti standard. Una manetta o dei pedali su altri assi non fanno nulla, e una levetta o una manetta i cui assi non stanno al centro possono richiedere una **Zona morta** più grande.

I browser nascondono un controller finché non ha inviato il suo primo input, quindi un pad collegato ma non ancora toccato, per la pagina, non esiste ancora.
