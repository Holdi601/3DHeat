---
title: "Referens för tangentbord och mus"
parent: "Kamera och styrning"
nav_order: 2
lang: "sv"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Referens för tangentbord och mus

Varje tangent och musåtgärd på ett ställe, så att du hittar den du behöver. Klicka först på vyn så att den får tangentbordet. Tangenterna ignoreras medan en textruta eller en rullgardinslista har fokus. Den korta versionen skrivs också ut nere till vänster i vyn.

Snabbguide:

| Jag vill ... | Tryck |
|---|---|
| flyga | `W A S D`, dra för att titta |
| se allt | `F` |
| spela eller pausa | `K` |
| spela baklänges | `J` (tryck igen för att pausa), framåt `L` |
| se vad färgerna betyder | `?` eller `F1` |
| ångra i fliken Taktik | `Ctrl+Z` |

## Kamera {#camera}

Från [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Indata | Effekt |
|---|---|
| `W` / `↑` | Framåt längs visningsriktningen |
| `S` / `↓` | Bakåt |
| `A` / `←` | Sidled vänster |
| `D` / `→` | Sidled höger |
| `Space` / `E` | Upp |
| `Q` / vänster `Ctrl` | Ner |
| `Shift` (endera) | Håll: 6× fart |
| vänster `Alt` | Håll: 15 % fart |
| Vänster eller höger dra i vyn | Titta (pekaren låses medan knappen hålls nere) |
| Hjul (perspektiv) | Flygfart ×1,5 per klick (högst 4 klick per hjulhändelse) |
| Hjul (parallell) | Zoom |
| Högerklick | Öppnar ingen snabbmeny över vyn |

## Globalt {#global}

Från [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tangent | Effekt |
|---|---|
| `K` | Spela / pausa [tidslinjen](timeline.md) |
| `F` | Anpassa vyn till data |
| `C` | Kopiera kamerans position, girning och nickning ([kameraavläsningen](camera.md#camera-readout)) |
| `G` | Gå till en inskriven punkt: öppnar lådan under kameraavläsningen |
| `Esc` | Stäng kortet för vald punkt. Sluta sedan titta på den andra enheten. Sluta sedan följa en enhet |
| `T` | Taktisk visning på eller av ([Matchrepris](match-replay.md#display-style)) |
| `?` / `F1` | Hjälpläge: vad färgerna betyder ([Inställningar, enheter och tangenter](settings.md#help-mode)) |
| `1` | [Värme](heat.md) |
| `2` | [Differens](difference.md) |
| `3` | [Lagvärme](team-heat.md) |
| `4` | [Linjer](line-heat.md) |
| `]` | Längsta gallringsgräns ut ×1,12 (`Shift`: ×1,35) |
| `[` | Längsta gallringsgräns in ÷1,12 (`Shift`: ÷1,35) |
| `\` | Längsta gallringsgräns av / på igen där den var ([Djup och bortsortering](depth-and-culling.md#keyboard)) |

Läget **Figuröverlägg** har ingen sifferknapp. Välj det i lägesfältet eller öppna fliken Match. Sifferknapparna går genom samma kontroll som lägesfältet. En knapp för ett läge som fältet visar som otillgängligt för de inlästa data gör ingenting.

## Matchrepris {#match-replay}

I läget Figuröverlägg, som fliken Match använder ([Matchrepris](match-replay.md)). De fungerar oavsett om en enhet följs eller inte, om inget annat anges:

| Tangent | Effekt |
|---|---|
| `B` | Lägg till ett bokmärke: ögonblicket och kameran |
| `M` | 2D-karta: hörn, hela vyn, av |
| `V` / `Shift+V` | Nästa / föregående kameravy för den följda enheten |
| `H` | Visning i huvudet i cockpit- och padlock-vyerna |
| `Page Down` / `Page Up` | Nästa / föregående händelse av de slag som händelselistan visar |
| `J` | Spela baklänges. Tryck igen för att pausa |
| `L` | Spela framåt. Tryck igen för att pausa |
| `.` / `,` | En sekund fram / bak, pausat (`Shift`: tio sekunder) |
| `Esc` | Sluta titta på målet först, sedan sluta följa |
| `Ctrl`+klick eller `Alt`+klick på en enhet (i vyn eller i enhetslistan) | Titta på den från den följda enheten (vyn med två enheter). Klicka igen för att släppa den |
| `Shift`+klick på två enheter | Mät mellan dem: bäring, avstånd, höjdskillnad |

`V` kräver en följd enhet. `M` är 2D-kartan här, och "flytta" i fliken Taktik.

## Följa en enhet {#following-a-unit}

Medan kameran följer en enhet styr hjulet och flygtangenterna runt enheten i stället för att flyga fritt ([Kamera](camera.md#while-following-a-unit)):

| Indata | Effekt |
|---|---|
| Hjul, `W` / `S` | Närmare / längre bort (högre / lägre i satellitvyn). Inte i cockpit- och padlock-vyerna. |
| `A` / `D`, `Q` / `E` | Kretsa runt enheten (jakt- och kretsvyerna) |
| Dra | Titta runt enheten. I cockpit, titta runt inuti |
| `V` / `Shift+V` | Nästa / föregående kameravy |
| `H` | Visning i huvudet (cockpit- och padlock-vyerna) |
| `Esc` | Sluta titta på den andra enheten, sedan sluta följa |

## Taktiktavlan {#tactics-board}

I fliken Taktik ([Taktiktavla](tactics-board.md)). `F`, `C`, `G` och `T` fungerar som ovan. Sifferknapparna gör ingenting.

| Tangent | Effekt |
|---|---|
| `Ctrl+Z` | Ångra |
| `Ctrl+Y` eller `Ctrl+Shift+Z` | Gör om |
| `Enter` | Avsluta pilen som ritas (ett dubbelklick eller ett högerklick gör samma sak) |
| `Esc` | Avbryt en dragning. Annars släpp pilen eller flytten som pågår. Annars avmarkera |
| `Delete` eller `Backspace` | Ta bort markeringen |
| `W` / `E` / `R` | Flytta / Rotera / Skala-verktyget för markeringen (tangentschemat **W / E / R**) |
| `G` / `R` / `S` | Flytta / Rotera / Skala-verktyget för markeringen (tangentschemat **G / R / S**) |
| `R` | Med inget markerat: vrid nästa figur som ska placeras 15°. `Shift+R` vrider tillbaka den |
| `M` | Med en figur markerad: flytta den till nästa klick |
| `K` | Spela upp eller pausa planen |
| Shift+klick | Lägg till i eller ta bort från markeringen |
| Shift+dra | Rita en låda runt det som ska markeras |
| `Ctrl` medan du drar ett handtag | Fäst vid rutnätet eller vinkelsteget |

Verktygstangenterna fungerar bara medan något är markerat. Utan markering flyger `W A S D` kameran som vanligt.

## Klicka för att välja {#click-to-pick}

Med **Klick visar vad som finns där** på och linjalen av ([Klicka för att välja](camera.md#click-to-pick)):

| Indata | Effekt |
|---|---|
| Vänsterklick (utan att dra mer än 4 px) | Visar datapunkten, eller annars platsen på banan, under pekaren |

## Mått {#measure}

Med **Linjal aktiv** ([Mått](measure.md)):

| Indata | Effekt |
|---|---|
| Vänsterklick (utan att dra mer än 4 px) | Sätter en punkt |
| Högerklick | Tar bort den sista punkten |

## Andraställen {#elsewhere}

| Var | Indata | Effekt |
|---|---|---|
| Ett reglages handtag (greppet bredvid siffran) | Dra upp / ned | Ändrar värdet kontinuerligt, snabbare ju längre du drar. Håll `Shift` för finjustering. Släpp för att stoppa. |
| Hastighetsvisningen över vyn | Dra upp / ned | Ändrar flygfarten på samma sätt. |
| Lägesrutor | `Enter` | Tillämpar den inskrivna positionen eller riktningen. |
| Kurvredigeraren | Dubbelklick / Alt-klick / högerklick | Lägg till en punkt / ta bort en punkt ([Spriteform](sprite-shape.md#the-curve-editor)). |

## Fliken Racinganalys {#race-analysis-tab}

I fliken Racinganalys spelar och pausar `K` loppreprisen, `Home` spolar tillbaka den, och sifferknapparna gör ingenting. Se [Racinganalys](race-analysis.md).

## Tangenter som visaren behåller från webbläsaren {#keys-the-viewer-keeps-from-the-browser}

Vissa webbläsargenvägar skulle stänga eller ladda om sidan och förlora en inläst session. Visaren behåller dem för sig själv. Listan genereras från koden: [Webbläsarens tangenter](ref-browser-keys.md).

## Handkontroll {#gamepad}

Se [Handkontroll och HOTAS](gamepad.md).
