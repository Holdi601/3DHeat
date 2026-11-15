---
title: "Gamepad og HOTAS"
parent: "Kamera og styring"
nav_order: 1
lang: "da"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Gamepad og HOTAS

Du kan flyve kameraet med en controller i Xbox-stil i stedet for tastaturet. Brug den, når du vil læne dig tilbage og kigge rundt i en stor scene. Dens input **lægges til** tastaturets, så du kan bruge begge på én gang.

## Tilslut en controller {#connect-a-controller}

1. Sæt controlleren i (eller par den).
2. Klik på visningen, og tryk på en knap på controlleren. Browsere viser først en controller, når den har givet sit første input.
3. Åbn **Kamera og scene → Gamepad**. Enhedslisten viser den med `●`.
4. Skub venstre stick for at flyve og højre stick for at kigge. Hvis kameraet driver, når stickene står i midten, så hæv **Dødzone**.

Enhver enhed, som browseren kortlægger til standardlayoutet for gamepads, virker. En flystick eller et gashåndtag (HOTAS) ignoreres som standard. Se nedenfor.

## Kortlægning {#mapping}

| Styring | Virkning |
|---|---|
| Venstre stick | Bevæg: frem/tilbage og sidelæns |
| Højre stick | Kig: gir (yaw) og hældning (pitch), med *Blikhastighed* grader pr. sekund ved fuldt udslag |
| `RT` / `LT` (analog) | Op / ned; i parallelprojektionen zoom ind / ud |
| `RB` (holdt) | 6× hurtigere |
| `LB` (holdt) | 15 % hastighed |
| `A` (holdt) | 3× sprint (kombineres med RB/LB) |
| `Y` (tryk) | Tilpas visningen til dataene |

Knapnumrene følger standardlayoutet: A 0, Y 3, LB 4, RB 5, LT 6, RT 7. Stickene sidder på akserne 0-1 (venstre) og 2-3 (højre).

## Indstillingerne for gamepad {#the-gamepad-settings}

Under **Kamera og scene → Gamepad**. **Indstillinger** / **Skjul** åbner justeringskontrollerne.

| Styring | Standard | Interval (jog) | Betydning |
|---|---|---|---|
| **Aktiveret** | til | | |
| Enhedsstatus | | | Hver tilsluttet enhed, `●` når den følges og `○` når den ikke gør, med *- ikke en XInput-pad, ignoreret* eller *- ikke en XInput-pad, bruges alligevel* for ikke-standardenheder. Uden nogen: *Ingen pad fundet. Browsere viser først en controller, når den har sendt sit første input. Tryk på en knap på den.* |
| **Brug enhed** | *Kun XInput-pads (anbefalet)* | | Vises, når en ikke-standardenhed er tilsluttet. Vælg en enhed efter navn for at følge den i stedet. |
| **Blikhastighed** | 150°/s | 20-540 (5000) | Drejningshastighed ved fuldt udslag på højre stick. |
| **Dødzone** | 12 % | 0-50 % (95 %) | Radial: et diagonalt tryk lækker aldrig ind i én akse alene. Hæv den, hvis kameraet driver, når stickene står i midten. |
| **Stick-kurve** | x² | lineær (1) til x⁴ (16) | Responseeksponent efter dødzonen: finere styring tæt på midten og stadig fuld hastighed ved kanten. |
| **Invertér stick Y** | fra | | |
| **Byt sticks** | fra | | Bevæg med højre stick, kig med venstre. |

Stickformningen: med udslag *m* (længden af stickvektoren) og dødzone *d* er udgangen ((m - d) / (1 - d)) ^ kurve langs stickets retning, og 0 inden for dødzonen.

## Hvorfor kun standardpads som standard {#why-only-standard-pads-by-default}

Gamepad-API'et melder **alle** HID-enheder med akser: flysticks, gashåndtag, pedaler og rat. Disse hviler ikke i midten. En drejeakse eller et gashåndtag står i fuldt udslag, når ingen rører det. Læses det som et stick, er det et permanent fuldt input, som ingen dødzone kan undertrykke. Kameraet snurrer så af sig selv fra det øjeblik, siden indlæses. Alle varmetilstande ser også i stykker ud, fordi et bevægeligt kamera nulstiller akkumuleringen hvert billede.

Derfor følges en enhed kun, når browseren melder `mapping: "standard"`. Det er dens måde at sige: en pad i XInput-stil med akserne, hvor man forventer dem. Andre enheder vises og markeres som ignoreret. **Brug enhed** vælger en eksplicit, for eksempel til at flyve kameraet med et HOTAS. Når en pad først følges, bliver kameraet hos den, så to controllere ikke kæmper om kameraet, afhængigt af hvilken rækkefølge de opremses i.

**HOTAS:** Kun akserne 0-3 (to sticks) og standardknapperne læses. Et gashåndtag eller pedaler på andre akser gør ingenting. Et stick eller gashåndtag, hvis akser ikke hviler i midten, kan have brug for en større **Dødzone**.

Browsere skjuler en controller, indtil den har sendt sit første input. En tilsluttet pad, der ikke er rørt, findes derfor endnu ikke for siden.
