---
title: "Gamepad og HOTAS"
parent: "Kamera og kontroller"
nav_order: 1
lang: "no"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Gamepad og HOTAS

Du kan fly kameraet med en kontroller i Xbox-stil i stedet for tastaturet. Bruk den når du vil lene deg tilbake og se deg rundt i en stor scene. Inndata fra kontrolleren **legges til** tastaturets, så du kan bruke begge samtidig.

## Koble til en kontroller {#connect-a-controller}

1. Koble til kontrolleren (eller par den).
2. Klikk i visningen og trykk en knapp på kontrolleren. Nettlesere viser bare en kontroller etter at den har gitt sitt første signal.
3. Åpne **Kamera og scene → Gamepad**. Enhetslisten viser den med `●`.
4. Skyv venstre spak for å fly, høyre spak for å se deg rundt. Hvis kameraet driver når spakene står i midten, øk **Dødsone**.

Alle enheter som nettleseren kobler til standard gamepad-oppsettet, fungerer. En flyspak eller gass (HOTAS) ignoreres som standard; se nedenfor.

## Knappeoppsett {#mapping}

| Kontroll | Effekt |
|---|---|
| Venstre spak | Flytt: fram og tilbake, og sidelengs |
| Høyre spak | Se: gir og stigning, ved *Blikkhastighet* grader per sekund ved full utslag |
| `RT` / `LT` (analog) | Opp / ned; i parallellprojeksjonen, zoom inn / ut |
| `RB` (holdt) | 6× raskere |
| `LB` (holdt) | 15 % fart |
| `A` (holdt) | 3× spurt (kombineres med RB/LB) |
| `Y` (trykk) | Rammer inn dataene |

Knappenumrene følger standardoppsettet: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; spakene på akse 0-1 (venstre) og 2-3 (høyre).

## Innstillingene for Gamepad {#the-gamepad-settings}

Under **Kamera og scene → Gamepad**. **Innstillinger** / **Skjul** åpner justeringskontrollene.

| Kontroll | Standard | Område (dra) | Betydning |
|---|---|---|---|
| **Aktivert** | på | | |
| Enhetsstatus | | | Hver tilkoblede enhet, `●` når den følges, `○` når den ikke gjør det, med *- ikke en XInput-kontroller, ignorert* eller *- ikke en XInput-kontroller, brukes likevel* for ikke-standard enheter. Uten noen: *Ingen kontroller funnet. Nettlesere viser bare en kontroller etter at den har sendt sitt første signal - trykk en knapp på den.* |
| **Bruk enhet** | *Bare XInput-kontrollere (anbefalt)* | | Vises når en ikke-standard enhet er tilkoblet. Velg en enhet etter navn for å følge den i stedet. |
| **Blikkhastighet** | 150°/s | 20–540 (5000) | Svinghastighet ved full utslag på høyre spak. |
| **Dødsone** | 12 % | 0–50 % (95 %) | Radiell: et skrått trykk lekker aldri inn i bare én akse. Øk den hvis kameraet driver når spakene står i midten. |
| **Stikkekurve** | x² | lineær (1) til x⁴ (16) | Responseksponent etter dødsonen: finere styring nær midten, fortsatt full fart ved kanten. |
| **Inverter stikke-Y** | av | | |
| **Bytt stikker** | av | | Bevegelse på høyre spak, se på venstre. |

Formingen av spakene: med utslag *m* (lengden av spakvektoren) og dødsone *d*, er utdata ((m - d) / (1 - d)) ^ kurve langs spakens retning, og 0 innenfor dødsonen.

## Hvorfor bare standardkontrollere som standard {#why-only-standard-pads-by-default}

Gamepad-API-et rapporterer **alle** HID-enheter med akser: flyspaker, gasser, pedaler, rattet. Disse hviler ikke i midten. En vridningsakse eller en gasshendel står på full utslag når ingen rører den. Leses den som en spak, er det et permanent fullfartsinnspill som ingen dødsone kan dempe, og kameraet snurrer av seg selv fra det øyeblikket siden lastes (og alle varmemodusene ser også ødelagte ut, fordi et bevegelig kamera starter akkumuleringen på nytt hvert bilde).

En enhet følges derfor bare når nettleseren rapporterer `mapping: "standard"`, sin måte å si "en kontroller i XInput-stil med aksene der du forventer dem". Andre enheter listes og merkes som ignorert, og **Bruk enhet** velger en eksplisitt, for eksempel for å fly kameraet med en HOTAS. Når en kontroller er fulgt, blir kameraet med den, så to kontrollere ikke krangler om kameraet avhengig av rekkefølgen de telles i.

**HOTAS:** bare akse 0-3 (to spaker) og standardknappene leses. En gass eller pedaler på andre akser gjør ingenting, og en spak eller gass hvis akser ikke hviler i midten kan trenge en større **Dødsone**.

Nettlesere skjuler en kontroller til den har sendt sitt første signal, så en tilkoblet kontroller som ikke er rørt, finnes ikke ennå for siden.
