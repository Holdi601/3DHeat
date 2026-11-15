---
title: "Reference for tastatur og mus"
parent: "Kamera og styring"
nav_order: 2
lang: "da"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Tastatur- og musereference

Alle taster og musehandlinger samlet ét sted, så du kan finde den, du har brug for. Klik først på visningen, så den har tastaturet. Taster ignoreres, mens et tekstfelt eller en rullemenu har fokus. Den korte udgave er også skrevet nederst til venstre i visningen.

Hurtig opslag:

| Jeg vil ... | Tryk |
|---|---|
| flyve | `W A S D`, træk for at kigge |
| se alt | `F` |
| afspille eller pause | `K` |
| afspille baglæns | `J` (tryk igen for at pause), frem `L` |
| se hvad farverne betyder | `?` eller `F1` |
| fortryde på fanen Taktik | `Ctrl+Z` |

## Kamera {#camera}

Fra [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Input | Virkning |
|---|---|
| `W` / `↑` | Frem i kigretningen |
| `S` / `↓` | Tilbage |
| `A` / `←` | Sidelæns mod venstre |
| `D` / `→` | Sidelæns mod højre |
| `Mellemrum` / `E` | Op |
| `Q` / venstre `Ctrl` | Ned |
| `Shift` (en af dem) | Hold: 6× hastighed |
| venstre `Alt` | Hold: 15 % hastighed |
| Venstre eller højre træk på visningen | Kig (markøren låses, mens knappen holdes nede) |
| Hjul (perspektiv) | Flyvehastighed ×1,5 pr. klik (højst 4 klik pr. hjulbevægelse) |
| Hjul (parallel) | Zoom |
| Højreklik | Åbner ingen genvejsmenu over visningen |

## Globalt {#global}

Fra [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tast | Virkning |
|---|---|
| `K` | Afspil / pause [tidslinjen](timeline.md) |
| `F` | Indram dataene |
| `C` | Kopiér kameraets position, gir og hældning ([kameraaflæsning](camera.md#camera-readout)) |
| `G` | Gå til et skrevet punkt: åbner boksen under kameraaflæsningen |
| `Esc` | Luk valgkortet; stop derefter med at kigge på den anden enhed; stop derefter med at følge en enhed |
| `T` | Taktisk visning til eller fra ([Kamp-replay](match-replay.md#display-style)) |
| `?` / `F1` | Hjælpetilstand: hvad farverne betyder ([Indstillinger, enheder og taster](settings.md#help-mode)) |
| `1` | [Varme](heat.md) |
| `2` | [Forskel](difference.md) |
| `3` | [Holdvarme](team-heat.md) |
| `4` | [Linjer](line-heat.md) |
| `]` | Fjern-udsnitsgrænsen ud ×1,12 (`Shift`: ×1,35) |
| `[` | Fjern-udsnitsgrænsen ind ÷1,12 (`Shift`: ÷1,35) |
| `\` | Fjern-udsnitsgrænsen fra / tilbage til der, hvor den blev sat ([Dybde og udsnit](depth-and-culling.md#keyboard)) |

Tilstanden **Figuroverlejring** har ingen talltast; vælg den på tilstandslinjen eller åbn fanen Kamp. Talasterne går gennem den samme kontrol som tilstandslinjen: en tast til en tilstand, som linjen viser som utilgængelig for de indlæste data, gør ingenting.

## Kamp-replay {#match-replay}

I tilstanden Figuroverlejring, som fanen Kamp bruger ([Kamp-replay](match-replay.md)). De virker, uanset om en enhed er fulgt eller ej, undtagen hvor det er angivet:

| Tast | Virkning |
|---|---|
| `B` | Tilføj et bogmærke: øjeblikket og kameraet |
| `M` | 2D-kort: hjørne, hel visning, fra |
| `V` / `Shift+V` | Næste / forrige kameravisning af den fulgte enhed |
| `H` | Head-up-visning i cockpit- og padlock-visningerne |
| `Page Down` / `Page Up` | Næste / forrige hændelse af de typer, hændelseslisten viser |
| `J` | Afspil baglæns; igen for at pause |
| `L` | Afspil fremad; igen for at pause |
| `.` / `,` | Et sekund frem / tilbage, på pause (`Shift`: ti sekunder) |
| `Esc` | Stop først med at kigge på målet, derefter med at følge |
| `Ctrl`+klik eller `Alt`+klik på en enhed (i visningen eller på enhedslisten) | Kig på den fra den fulgte enhed (visningen af to enheder); klik igen for at slippe den |
| `Shift`+klik på to enheder | Mål mellem dem: pejling, afstand, højdeforskel |

`V` kræver en fulgt enhed. `M` er her 2D-kortet og "flyt" på fanen Taktik.

## Følg en enhed {#following-a-unit}

Mens kameraet følger en enhed, styrer hjulet og flyveknapperne rundt om enheden i stedet for at flyve frit ([Kamera](camera.md#while-following-a-unit)):

| Input | Virkning |
|---|---|
| Hjul, `W` / `S` | Tættere / længere væk (højere / lavere i satellitvisningen). Ikke i cockpit- og padlock-visningerne. |
| `A` / `D`, `Q` / `E` | Kredse om enheden (jagt- og kredsløbsvisningerne) |
| Træk | Kig rundt om enheden; i cockpittet kig rundt inde i det |
| `V` / `Shift+V` | Næste / forrige kameravisning |
| `H` | Head-up-visning (cockpit- og padlock-visningerne) |
| `Esc` | Stop med at kigge på den anden enhed, derefter stop med at følge |

## Taktiktavlen {#tactics-board}

På fanen Taktik ([Taktiktavlen](tactics-board.md)). `F`, `C`, `G` og `T` virker som ovenfor; talasterne gør ingenting.

| Tast | Virkning |
|---|---|
| `Ctrl+Z` | Fortryd |
| `Ctrl+Y` eller `Ctrl+Shift+Z` | Gentag |
| `Enter` | Afslut pilen, der tegnes (et dobbeltklik eller et højreklik gør det samme) |
| `Esc` | Annuller et træk; ellers slip pilen eller flytningen i gang; ellers fravælg |
| `Delete` eller `Backspace` | Slet markeringen |
| `W` / `E` / `R` | Flyt / Roter / Skaler-håndtag for markeringen (tastordningen **W / E / R**) |
| `G` / `R` / `S` | Flyt / Roter / Skaler-håndtag for markeringen (tastordningen **G / R / S**) |
| `R` | Ingenting markeret: drej den næste figur, der skal placeres, 15°. `Shift+R` drejer den tilbage. |
| `M` | Med en figur markeret: flyt den til næste klik |
| `K` | Afspil eller pause planen |
| Shift+klik | Tilføj til eller fjern fra markeringen |
| Shift+træk | Tegn en boks om det, der skal markeres |
| `Ctrl` mens du trækker i et håndtag | Fastgør til gitteret eller vinkeltrinnet |

Håndtagstasterne virker kun, når noget er markeret; uden markering flyver `W A S D` kameraet som vanligt.

## Klik for at vælge {#click-to-pick}

Med **Klik viser, hvad der er der** til og lineal fra ([Klik for at vælge](camera.md#click-to-pick)):

| Input | Virkning |
|---|---|
| Venstreklik (uden at trække mere end 4 px) | Vis datapunktet, ellers stedet på banen, under markøren |

## Mål {#measure}

Med **Lineal aktiv** ([Mål](measure.md)):

| Input | Virkning |
|---|---|
| Venstreklik (uden at trække mere end 4 px) | Sæt et punkt |
| Højreklik | Fjern det sidste punkt |

## Andre steder {#elsewhere}

| Hvor | Input | Virkning |
|---|---|---|
| Greb på en skyder (håndtaget ved siden af tallet) | Træk op / ned | Ændrer værdien løbende, hurtigere jo længere du trækker; hold `Shift` for finjustering. Slip for at stoppe. |
| Hastighedsvisningen over visningen | Træk op / ned | Ændrer flyvehastigheden på samme måde. |
| Positionsbokse | `Enter` | Anvend den skrevne position eller retning. |
| Kurveeditor | Dobbeltklik / Alt-klik / højreklik | Tilføj et punkt / fjern et punkt ([Sprite-form](sprite-shape.md#the-curve-editor)). |

## Fanen Løbsanalyse {#race-analysis-tab}

På fanen Løbsanalyse afspiller og pauser `K` løbsreplayet, `Home` spoler det tilbage, og talasterne gør ingenting. Se [Løbsanalyse](race-analysis.md).

## Taster viseren beholder fra browseren {#keys-the-viewer-keeps-from-the-browser}

Nogle browsergenveje ville lukke eller genindlæse siden og miste en indlæst session; viseren beholder dem for sig selv. Listen er genereret ud fra koden: [Browsertaster](ref-browser-keys.md).

## Gamepad {#gamepad}

Se [Gamepad og HOTAS](gamepad.md).
