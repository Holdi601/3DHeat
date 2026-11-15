---
title: "Varme"
parent: "Varmemodi"
nav_order: 1
lang: "no"
source: "heat.md"
source_hash: "b895631187ea"
translated: true
outdated: false
---

# Varme

Varme maler stedene der mye har skjedd: rødt der det skjedde litt, hvitglødende der det skjedde mye. Den svarer på «hvor skjer dette, og hvor mye».

**Varme** (tast 1) er standardmodusen. Hver synlig [rad](glossary.md) bidrar med en rund [sprite](glossary.md) som vender mot kameraet; overlappende sprites legges sammen i en buffer med flyttall; summen blir avbildet gjennom en fargeskala – som standard gjennomsiktig → rød → gul → hvit – og tegnet over scenen.

![Varme på et 3D-nivå: varmepunkter inni og oppå bygningene](../assets/img/no/shooter-heat.webp)

Bildet viser varmen fra en skyterunde på et nivå med bygninger: varmepunktene sitter i rommene og på trappene, ikke bare på bakken.

## Slik bruker du den {#how-to-use-it}

1. Last inn data og trykk `1` (eller velg **Varme** i modusraden).
2. Hvis alt er hvitt eller tomt, trykk **Autoeksponer fra feltet** i seksjonen **Varmeform**.
3. Endre **Sprite-radius** til nabopunktene slår seg sammen til bånd: mindre viser enkeltpunkter, større viser områder.
4. Åpne **Varmefarger** for å endre fargene, eller **Dybde** for å la åser og vegger skjule varmen bak seg.

![Seksjonene Varmeform og Varmefarger i sidepanelet, begge åpne](../assets/img/no/heat-panel.webp)

De samme panelene former [Differanse](difference.md), [Lagvarme](team-heat.md) og [Linjevarme](line-heat.md); de skiller seg i hva som legges til (med fortegn, med farge eller langs linjer), ikke i hvordan.

## Panelene og standardverdiene {#the-panels-and-their-defaults}

Hver kontroll er forklart på sin egen side; kolonnen Detaljer lenker til den. Skyveknapper har en skrevet boks ved siden av og et dragehåndtak (det lille grepet til høyre: dra opp eller ned, lenger er raskere, Shift for finjustering); der en skyveknapps spor slutter før en reell grense, kan håndtaket dras forbi den, opptil *jog-taket* som er oppgitt her. Verdier merket *ved innlasting* blir beregnet på nytt for hvert nye datasett.

### Varmeform (åpen) {#heat-shape-open}

| Kontroll | Standard | Område (jog-tak) | Detaljer |
|---|---|---|---|
| **Sprite-radius** | 6 m; ved innlasting utstrekning / 120 | 0,05–2000 m, logaritmisk (50 000) | [Sprite-form](sprite-shape.md#sprite-radius) |
| **Intensitet i senter** | 1 | 0–10 (1000) | [Sprite-form](sprite-shape.md#centre-and-edge-intensity) |
| **Intensitet i kant** | 0 | -2–10 (1000) | [Sprite-form](sprite-shape.md#centre-and-edge-intensity) |
| **Rampeform** | *Avtagning* | *Avtagning* / *Kurve* | [Sprite-form](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Avtagning** (bare ved Avtagning) | 1,6 | 0,1–8 (64) | [Sprite-form](sprite-shape.md#falloff) |
| **Myk rampe** (bare ved Avtagning) | på | | [Sprite-form](sprite-shape.md#falloff) |
| Kurveditor (bare ved Kurve) | forhåndsinnstillingen *Myk* | | [Sprite-form](sprite-shape.md#the-curve-editor) |
| **Metningspunkt** | 24; ved innlasting et anslag, deretter målt | 0,1–4000, logaritmisk (10 000 000) | [Farge og eksponering](colour-and-exposure.md#saturation-point) |
| **Minste varme** | av (0) | 0–100 % | [Farge og eksponering](colour-and-exposure.md#minimum-heat) |
| **Tetthetsrespons** | *Mettende* | *Mettende* / *Lineær* / *Log* | [Farge og eksponering](colour-and-exposure.md#density-response) |
| **Autoeksponer fra feltet** | | knapp | [Farge og eksponering](colour-and-exposure.md#auto-exposure) |
| **Følg visningen** | på | | Måler eksponeringen på nytt hver gang kameraet står stille, slik at et område du flyr inn i bruker hele fargeskalaen. Små endringer ignoreres, og skalaen glir. Fjern haken, eller dra **Metningspunkt**, for å låse skalaen og sammenligne steder på én skala. [Farge og eksponering](colour-and-exposure.md#follow-the-view) |
| **Samme tetthet ved all zoom** | på | | En farge betyr samme antall rader per areal av bakken, uansett hvor nær du er. En sprite som pikselgrensene gjør større (langt unna) eller mindre (nær), beholder varmen den ekte størrelsen ville gitt, så et bilde eksponert på avstand blekner ikke når du flyr inn i det. Av: en begrenset sprite legger til hele vekten sin i den begrensede størrelsen. [Sprite-form](sprite-shape.md#pixel-clamps) |
| **Flat ut på bakkeplanet** | av | | [Sprite-form](sprite-shape.md#flatten-onto-ground-plane) |

### Varmefarger (lukket) {#heat-colours-closed}

| Kontroll | Standard | Detaljer |
|---|---|---|
| Gruppefargeprøver og **Fargeseparasjon** (bare Lagvarme) | 1,4 | [Lagvarme](team-heat.md) |
| Redigeringen av **Varmerampe** (*Positiv (additive lag)* i Differanse, *Opasitetsskala* i Lagvarme) | gjennomsiktig → rød → gul → hvit | [Farge og eksponering](colour-and-exposure.md#the-ramp-editor) |
| **Tilbakestill til gjennomsiktig → rød → gul → hvit** | | |
| **Negativ (lag som trekker fra)**-skala (bare Differanse) | gjennomsiktig → grønn → blå → lilla | [Differanse](difference.md#colours) |

### Pikselgrenser for sprites (lukket) {#sprite-pixel-clamps-closed}

| Kontroll | Standard | Område (jog-tak) | Detaljer |
|---|---|---|---|
| **Minste pikselradius** | 1 px | 0–16 (512) | [Sprite-form](sprite-shape.md#pixel-clamps) |
| **Største pikselradius** | 96 px | 2–1024, logaritmisk (8192) | [Sprite-form](sprite-shape.md#pixel-clamps) |

### Dybde (åpen) {#depth-open}

| Kontroll | Standard | Detaljer |
|---|---|---|
| **Skjul bak terrenget** | på | [Dybde og avskjæring](depth-and-culling.md#hide-behind-terrain) |
| **Skjult bak geometri** | 0,8 (*80 % svakere*) | [Dybde og avskjæring](depth-and-culling.md#hidden-behind-geometry) |

### Avskjæring etter avstand (lukket) {#distance-culling-closed}

| Kontroll | Standard | Område (jog-tak) | Detaljer |
|---|---|---|---|
| **Nær** | av (0) | 0,5–5000 m, logaritmisk; nederst på sporet = av (200 000) | [Dybde og avskjæring](depth-and-culling.md#distance-culling) |
| **Fjern** | av (0) | 1–200 000 m, logaritmisk; nederst = av (10 000 000) | [Dybde og avskjæring](depth-and-culling.md#distance-culling) |
| **Skjær ved et plan** | på | | [Dybde og avskjæring](depth-and-culling.md#distance-culling) |
| **Skjær også nivået** | på | | [Dybde og avskjæring](depth-and-culling.md#distance-culling) |

Taster: `[` og `]` skyver den fjerne grensen inn og ut, `\` veksler den ([Dybde og avskjæring](depth-and-culling.md#keyboard)).

### Retning og Verdi {#direction-and-value}

To flere seksjoner ligger under Varmeform. **Retning** tegner hver rad som en kile og legger til piler: se [Retningsvarme](directional-heat.md). **Verdi** vekter varmen etter hva hver rad kostet eller ga: se [Verdivekting](value-weighting.md).

## Hva som lagres {#what-is-saved}

Varmeinnstillingene over lagres ikke mellom økter: når du laster siden på nytt, gjenopprettes standardverdiene. To ting holdes i nettleseren: siste avspillingshastighet (`heat3d.speed`, se [Tidslinje](timeline.md)) og innstillingene for de fjerne figurene i [figuroverlegget](box-replay.md) (symbolstil, størrelse, treffmerker og så videre). Det samme gjelder språket, [de inverterte verdensaksene](camera.md#invert-world-axis), bilnavnene løpsfanen husker, og [nivåbiblioteket](level-library.md). Hele listen står på [Lagrede innstillinger](ref-settings-storage.md).
