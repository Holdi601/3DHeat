---
title: "Referentie toetsenbord en muis"
parent: "Camera en bediening"
nav_order: 2
lang: "nl"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Referentie toetsenbord en muis

Elke toets- en muisactie op één plek, zodat je de juiste kunt vinden. Klik eerst op de weergave, zodat die het toetsenbord heeft. Toetsen worden genegeerd terwijl een tekstvak of een keuzelijst de focus heeft. De korte versie staat ook linksonder in de weergave.

Snelle zoeker:

| Ik wil ... | Druk op |
|---|---|
| vliegen | `W A S D`, slepen om te kijken |
| alles zien | `F` |
| afspelen of pauzeren | `K` |
| achteruit afspelen | `J` (nogmaals drukken om te pauzeren), vooruit `L` |
| zien wat de kleuren betekenen | `?` of `F1` |
| ongedaan maken in het tabblad Tactiek | `Ctrl+Z` |

## Camera {#camera}

Van [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Invoer | Effect |
|---|---|
| `W` / `↑` | Vooruit in de kijkrichting |
| `S` / `↓` | Achteruit |
| `A` / `←` | Naar links schuiven |
| `D` / `→` | Naar rechts schuiven |
| `Spatie` / `E` | Omhoog |
| `Q` / linker `Ctrl` | Omlaag |
| `Shift` (een van beide) | Ingedrukt houden: 6× snelheid |
| linker `Alt` | Ingedrukt houden: 15% snelheid |
| Links of rechts slepen op de weergave | Kijken (aanwijzer vastgezet zolang de knop is ingedrukt) |
| Wiel (perspectief) | Vliegsnelheid ×1,5 per klik (maximaal 4 kliks per wiel-gebeurtenis) |
| Wiel (parallel) | Zoomen |
| Rechtsklik | Opent geen contextmenu boven de weergave |

## Algemeen {#global}

Van [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Toets | Effect |
|---|---|
| `K` | De [tijdlijn](timeline.md) afspelen / pauzeren |
| `F` | De data in beeld brengen |
| `C` | De positie, gierhoek en neiging van de camera kopiëren ([cameraweergave](camera.md#camera-readout)) |
| `G` | Naar een getypt punt gaan: opent het vak onder de cameraweergave |
| `Esc` | Sluit de selectiekaart; stop daarna met kijken naar de tweede eenheid; stop daarna met het volgen van een eenheid |
| `T` | Tactische weergave aan of uit ([Wedstrijdreplay](match-replay.md#display-style)) |
| `?` / `F1` | Helpmodus: wat de kleuren betekenen ([Instellingen, eenheden en toetsen](settings.md#help-mode)) |
| `1` | [Warmte](heat.md) |
| `2` | [Verschil](difference.md) |
| `3` | [Teamwarmte](team-heat.md) |
| `4` | [Lijnen](line-heat.md) |
| `]` | Verre afknipgrens naar buiten ×1,12 (`Shift`: ×1,35) |
| `[` | Verre afknipgrens naar binnen ÷1,12 (`Shift`: ÷1,35) |
| `\` | Verre afknipgrens uit / weer aan op de plek waar hij stond ([Diepte en afknippen](depth-and-culling.md#keyboard)) |

De modus **Figurenoverlay** heeft geen cijfertoets; kies hem in de modusbalk of open het tabblad Match. De cijfertoetsen gaan langs dezelfde controle als de modusbalk: een toets voor een modus die de balk voor de geladen data als niet beschikbaar toont, doet niets.

## Wedstrijdreplay {#match-replay}

In de modus Figurenoverlay, die het tabblad Match gebruikt ([Wedstrijdreplay](match-replay.md)). Ze werken of een eenheid wordt gevolgd of niet, behalve waar anders vermeld:

| Toets | Effect |
|---|---|
| `B` | Een bladwijzer toevoegen: het moment en de camera |
| `M` | 2D-kaart: hoek, volledige weergave, uit |
| `V` / `Shift+V` | Volgende / vorige cameraweergave van de gevolgde eenheid |
| `H` | Head-up display in de cockpit- en padlock-weergaven |
| `Page Down` / `Page Up` | Volgende / vorige gebeurtenis van de soorten die de gebeurtenislijst toont |
| `J` | Achteruit afspelen; nogmaals, om te pauzeren |
| `L` | Vooruit afspelen; nogmaals, om te pauzeren |
| `.` / `,` | Een seconde vooruit / terug, gepauzeerd (`Shift`: tien seconden) |
| `Esc` | Eerst stoppen met kijken naar het doel, dan stoppen met volgen |
| `Ctrl`+klik of `Alt`+klik op een eenheid (in de weergave of in de eenhedenlijst) | Naar haar kijken vanuit de gevolgde eenheid (de weergave van twee eenheden); nogmaals klikken om haar los te laten |
| `Shift`+klik op twee eenheden | Meten tussen hen: peiling, bereik, hoogteverschil |

`V` heeft een gevolgde eenheid nodig. `M` is hier de 2D-kaart, en "verplaatsen" in het tabblad Tactiek.

## Een eenheid volgen {#following-a-unit}

Terwijl de camera een eenheid volgt, sturen het wiel en de vliegtoetsen rond de eenheid in plaats van vrij te vliegen ([Camera](camera.md#while-following-a-unit)):

| Invoer | Effect |
|---|---|
| Wiel, `W` / `S` | Dichterbij / verder weg (hoger / lager in de satellietweergave). Niet in de cockpit- en padlock-weergaven. |
| `A` / `D`, `Q` / `E` | Om de eenheid heen draaien (achtervolgen- en omcirkelweergaven) |
| Slepen | Rond de eenheid kijken; in de cockpit rondkijken binnenin |
| `V` / `Shift+V` | Volgende / vorige cameraweergave |
| `H` | Head-up display (cockpit- en padlock-weergaven) |
| `Esc` | Stoppen met kijken naar de tweede eenheid, daarna stoppen met volgen |

## Tactiekbord {#tactics-board}

In het tabblad Tactiek ([Tactiekbord](tactics-board.md)). `F`, `C`, `G` en `T` werken zoals hierboven; de cijfertoetsen doen niets.

| Toets | Effect |
|---|---|
| `Ctrl+Z` | Ongedaan maken |
| `Ctrl+Y` of `Ctrl+Shift+Z` | Opnieuw doen |
| `Enter` | De pijl die je tekent afmaken (een dubbelklik of een rechtsklik doet hetzelfde) |
| `Esc` | Een slepen annuleren; anders de pijl of de verplaatsing die bezig is loslaten; anders de selectie opheffen |
| `Delete` of `Backspace` | De selectie verwijderen |
| `W` / `E` / `R` | Verplaats- / Draai- / Schaal-gizmo voor de selectie (toetsenschema **W / E / R**) |
| `G` / `R` / `S` | Verplaats- / Draai- / Schaal-gizmo voor de selectie (toetsenschema **G / R / S**) |
| `R` | Zonder selectie: de volgende te plaatsen figuur 15° draaien. `Shift+R` draait hem terug. |
| `M` | Met een geselecteerde figuur: hem naar de volgende klik verplaatsen |
| `K` | Het plan afspelen of pauzeren |
| Shift+klik | Toevoegen aan of verwijderen uit de selectie |
| Shift+slepen | Een vak tekenen om te selecteren wat erin valt |
| `Ctrl` tijdens het slepen van een handvat | Vastklikken op het raster of de hoekstap |

De gizmo-toetsen werken alleen als er iets geselecteerd is; zonder selectie vliegen `W A S D` de camera gewoon.

## Klikken om te kiezen {#click-to-pick}

Met **Klik toont wat er is** aan en de liniaal uit ([Klikken om te kiezen](camera.md#click-to-pick)):

| Invoer | Effect |
|---|---|
| Linksklik (zonder meer dan 4 px te slepen) | Toont het datapunt, of anders de plek op het niveau onder de aanwijzer |

## Meten {#measure}

Met **Liniaal actief** ([Meten](measure.md)):

| Invoer | Effect |
|---|---|
| Linksklik (zonder meer dan 4 px te slepen) | Een punt plaatsen |
| Rechtsklik | Het laatste punt verwijderen |

## Elders {#elsewhere}

| Waar | Invoer | Effect |
|---|---|---|
| Het handvat van elke schuifregelaar (het handvat naast het getal) | Omhoog / omlaag slepen | De waarde doorlopend veranderen, sneller naarmate je verder sleept; houd `Shift` ingedrukt voor fijne regeling. Loslaten om te stoppen. |
| De snelheidsweergave boven de weergave | Omhoog / omlaag slepen | De vliegsnelheid op dezelfde manier veranderen. |
| Positievakken | `Enter` | De getypte positie of oriëntatie toepassen. |
| Curve-editor | Dubbelklik / Alt-klik / rechtsklik | Een punt toevoegen / een punt verwijderen ([Vorm van sprite](sprite-shape.md#the-curve-editor)). |

## Tabblad Race-analyse {#race-analysis-tab}

In het tabblad Race-analyse speelt `K` de race-replay af en pauzeert hij, spoelt `Home` hem terug, en doen de cijfertoetsen niets. Zie [Race-analyse](race-analysis.md).

## Toetsen die de viewer van de browser houdt {#keys-the-viewer-keeps-from-the-browser}

Sommige sneltoetsen van de browser zouden de pagina sluiten of opnieuw laden en een geladen sessie kwijtraken; de viewer houdt die voor zichzelf. De lijst wordt uit de code gegenereerd: [Browsertoetsen](ref-browser-keys.md).

## Gamepad {#gamepad}

Zie [Gamepad en HOTAS](gamepad.md).
