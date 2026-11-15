---
title: "Referanse for tastatur og mus"
parent: "Kamera og kontroller"
nav_order: 2
lang: "no"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Tastatur og mus

Alle tastatur- og museaksjoner på ett sted, så du kan finne den du trenger. Klikk først på visningen, så får den tastaturet. Taster blir ignorert mens en tekstboks eller en rullegardinliste har fokus. Den korte versjonen står også nederst til venstre i visningen.

Rask finner:

| Jeg vil ... | Trykk |
|---|---|
| fly | `W A S D`, dra for å se rundt |
| se alt | `F` |
| spille av eller pause | `K` |
| spille av baklengs | `J` (trykk igjen for å pause), framover `L` |
| se hva fargene betyr | `?` eller `F1` |
| angre i Taktikk-fanen | `Ctrl+Z` |

## Kamera {#camera}

Fra [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Inndata | Effekt |
|---|---|
| `W` / `↑` | Framover i synsretningen |
| `S` / `↓` | Bakover |
| `A` / `←` | Sidelengs mot venstre |
| `D` / `→` | Sidelengs mot høyre |
| `Space` / `E` | Opp |
| `Q` / venstre `Ctrl` | Ned |
| `Shift` (en av dem) | Hold inne: 6 ganger fart |
| venstre `Alt` | Hold inne: 15 % fart |
| Venstre eller høyre dra på visningen | Se rundt (pekeren låses mens knappen holdes inne) |
| Hjul (perspektiv) | Flyfart ×1,5 per hakk (høyst 4 hakk per hjulhendelse) |
| Hjul (parallell) | Zoom |
| Høyreklikk | Åpner ingen hurtigmeny over visningen |

## Globalt {#global}

Fra [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tast | Effekt |
|---|---|
| `K` | Spill av eller pause [tidslinjen](timeline.md) |
| `F` | Tilpass visningen til dataene |
| `C` | Kopier kameraets posisjon, gir og stigning ([kameraavlesning](camera.md#camera-readout)) |
| `G` | Gå til et punkt du skriver inn: åpner boksen under kameraavlesningen |
| `Esc` | Lukk valgkortet; deretter slutt å se på den andre enheten; deretter slutt å følge en enhet |
| `T` | Taktisk visning av eller på ([Kampreplay](match-replay.md#display-style)) |
| `?` / `F1` | Hjelpemodus: hva fargene betyr ([Innstillinger, enheter og taster](settings.md#help-mode)) |
| `1` | [Varme](heat.md) |
| `2` | [Differanse](difference.md) |
| `3` | [Lagvarme](team-heat.md) |
| `4` | [Linjer](line-heat.md) |
| `]` | Ytre grense for avskjæring flyttes ut ×1,12 (`Shift`: ×1,35) |
| `[` | Ytre grense for avskjæring flyttes inn ÷1,12 (`Shift`: ÷1,35) |
| `\` | Ytre grense for avskjæring av / på igjen der den var ([Dybde og avskjæring](depth-and-culling.md#keyboard)) |

Modusen **Figuroverlegg** har ingen tallknapp; velg den i modusraden eller åpne Kamp-fanen. Tallknappene går gjennom den samme kontrollen som modusraden: en knapp for en modus som raden viser som utilgjengelig for de innlastede dataene, gjør ingenting.

## Kampreplay {#match-replay}

I modusen Figuroverlegg, som Kamp-fanen bruker ([Kampreplay](match-replay.md)). De virker enten en enhet blir fulgt eller ikke, med mindre noe annet er oppgitt:

| Tast | Effekt |
|---|---|
| `B` | Legg til et bokmerke: øyeblikket og kameraet |
| `M` | 2D-kart: hjørne, hele visningen, av |
| `V` / `Shift+V` | Neste / forrige kameravisning for den fulgte enheten |
| `H` | Head-up-display i cockpit- og padlock-visningene |
| `Page Down` / `Page Up` | Neste / forrige hendelse av typene hendelseslisten viser |
| `J` | Spill av baklengs; igjen for å pause |
| `L` | Spill av framover; igjen for å pause |
| `.` / `,` | Ett sekund framover / bakover, pauset (`Shift`: ti sekunder) |
| `Esc` | Slutt å se på målet først, deretter slutt å følge |
| `Ctrl`-klikk eller `Alt`-klikk på en enhet (i visningen eller i enhetslisten) | Se på den fra den fulgte enheten (visningen med to enheter); klikk igjen for å fjerne den |
| `Shift`+klikk på to enheter | Mål mellom dem: peiling, avstand, høydeforskjell |

`V` krever en fulgt enhet. `M` er 2D-kartet her, og «flytt» i Taktikk-fanen.

## Følge en enhet {#following-a-unit}

Mens kameraet følger en enhet, styrer hjulet og flytastene rundt enheten i stedet for å fly fritt ([Kamera](camera.md#while-following-a-unit)):

| Inndata | Effekt |
|---|---|
| Hjul, `W` / `S` | Nærmere / lenger unna (høyere / lavere i satellittvisningen). Ikke i cockpit- og padlock-visningene. |
| `A` / `D`, `Q` / `E` | Gå i bane rundt enheten (jakt- og banevisningene) |
| Dra | Se rundt enheten; i cockpit, se rundt inni |
| `V` / `Shift+V` | Neste / forrige kameravisning |
| `H` | Head-up-display (cockpit- og padlock-visningene) |
| `Esc` | Slutt å se på den andre enheten, deretter slutt å følge |

## Taktikktavlen {#tactics-board}

I Taktikk-fanen ([Taktikktavlen](tactics-board.md)). `F`, `C`, `G` og `T` virker som over; tallknappene gjør ingenting.

| Tast | Effekt |
|---|---|
| `Ctrl+Z` | Angre |
| `Ctrl+Y` eller `Ctrl+Shift+Z` | Gjør om |
| `Enter` | Avslutt pilen som tegnes (dobbeltklikk eller høyreklikk gjør det samme) |
| `Esc` | Avbryt et dra; ellers slipp pilen eller flyttingen som pågår; ellers fjern markeringen |
| `Delete` eller `Backspace` | Slett markeringen |
| `W` / `E` / `R` | Flytt / roter / skaler-verktøyet for markeringen (tastevalg **W / E / R**) |
| `G` / `R` / `S` | Flytt / roter / skaler-verktøyet for markeringen (tastevalg **G / R / S**) |
| `R` | Uten markering: snu neste figur som skal plasseres med 15°. `Shift+R` snur den tilbake. |
| `M` | Med en figur valgt: flytt den til neste klikk |
| `K` | Spill av eller pause planen |
| Shift+klikk | Legg til i eller fjern fra markeringen |
| Shift+dra | Tegn en boks rundt det som skal velges |
| `Ctrl` mens du drar et håndtak | Fest til rutenettet eller vinkeltrinnet |

Verktøytastene virker bare når noe er valgt; uten markering flyr `W A S D` kameraet som vanlig.

## Klikk for å velge {#click-to-pick}

Med **Klikk viser hva som er der** på og linjalen av ([Klikk for å velge](camera.md#click-to-pick)):

| Inndata | Effekt |
|---|---|
| Venstreklikk (uten å dra mer enn 4 px) | Viser datapunktet, ellers stedet i nivået, under pekeren |

## Mål {#measure}

Med **Linjal aktiv** ([Mål](measure.md)):

| Inndata | Effekt |
|---|---|
| Venstreklikk (uten å dra mer enn 4 px) | Legg til et punkt |
| Høyreklikk | Fjern det siste punktet |

## Andre steder {#elsewhere}

| Hvor | Inndata | Effekt |
|---|---|---|
| Håndtaket på en hvilken som helst skyveknapp (grepet ved siden av tallet) | Dra opp / ned | Endrer verdien jevnt, raskere jo lenger du drar; hold `Shift` for finjustering. Slipp for å stoppe. |
| Fartsvisningen over visningen | Dra opp / ned | Endrer flyfarten på samme måte. |
| Posisjonsbokser | `Enter` | Bruker den innskrevne posisjonen eller retningen. |
| Kurveditoren | Dobbeltklikk / Alt-klikk / høyreklikk | Legg til et punkt / fjern et punkt ([Sprite-form](sprite-shape.md#the-curve-editor)). |

## Løpsanalyse-fanen {#race-analysis-tab}

I Løpsanalyse-fanen spiller `K` av og pauser løpsrepriseen, `Home` spoler den tilbake, og tallknappene gjør ingenting. Se [Løpsanalyse](race-analysis.md).

## Taster visningen beholder fra nettleseren {#keys-the-viewer-keeps-from-the-browser}

Noen snarveier i nettleseren ville lukket eller lastet siden på nytt og mistet en innlastet økt; visningen beholder dem for seg selv. Listen er generert fra koden: [Nettleser-taster](ref-browser-keys.md).

## Spillkontroll {#gamepad}

Se [Spillkontroll og HOTAS](gamepad.md).
