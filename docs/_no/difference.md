---
title: "Forskjell"
parent: "Varmemodi"
nav_order: 5
lang: "no"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: false
---

# Differanse

Rødt der lag A var mest, grønn-blått der lag B var det, ingenting der de var like.

**Differanse** (tast 2) er varme med fortegn. Rader fra én populasjon legger til varme; rader fra en annen trekker den fra. Der de to overlapper jevnt, blir resultatet null og helt gjennomsiktig; der den ene dominerer, vises den i den sidens farger – som standard varme (gjennomsiktig → rød → gul → hvit) for **+**-siden og kjølige (gjennomsiktig → grønn → blå → lilla) for **−**-siden.

![Differansevarme: rødt der +-siden var mest, grønt og blått der −-siden var mest](../assets/img/no/difference-split.webp)

## Slik bruker du den {#how-to-use-it}

1. Trykk `2` (eller velg **Differanse** i modusraden).
2. Åpne **Differansedeling** i sidepanelet.
3. Velg hva du vil **Del etter**: vanligvis *Grupper*.
4. Sett én gruppe (eller verdi) på **+** og en annen på **−**.
5. Les fargene: varmt betyr +-siden, kjølig betyr −-siden. Panelet varsler hvis en side ingen rader har (se [Meldinger du kan se](#messages-you-may-see)).

*Hvilke* to populasjoner det gjelder, er hele spørsmålet, så delingen kan være en hvilken som helst beholdt kolonne, ikke bare grupper. Rader som havner på **ingen** av sidene **utelates**, og telles ikke som null: det er det som gjør at en deling over to av mange verdier sammenligner nettopp disse to, og den settes sammen med [filtrene](filters.md) – filtrer ned til ett kart, og del deretter det etter bygg.

Modusen trenger to sider: en gruppekolonne med minst to grupper, eller en deling over en kolonne som er beholdt for filtrering. Med data som har færre enn to grupper starter en innlasting med en kolonnedeling – kolonnen *Kildefil* i en innlasting av flere filer først, ellers den første kategorikolonnen med to verdier, ellers den første numeriske kolonnen med et omfang – slik at *sammenlign to innlastinger* fungerer på data uten grupper. Bare data uten noe av dette gjør modusen utilgjengelig; det gjør også en kolonnedeling som ikke har noe på den ene siden.

## Panelet Differansedeling {#the-difference-split-panel}

Vises i differansemodus, under varmepanelene.

**Del etter** tilbyr:

| Valg | Vises som | Delingsregel |
|---|---|---|
| Grupper | *Gruppe (N)* (når det finnes en gruppekolonne) | Hver gruppe på +, − eller ingen av sidene, satt i [Lagliste](teams-list.md) |
| En kategorikolonne | *kolonne (N verdier)* | Verdier på +, − eller ingen av sidene |
| En numerisk kolonne | *kolonne (numerisk)* | Et verdiområde for hver side |
| Kildefilen | *Kildefil – sammenlign to innlastinger* (når flere filer er lastet inn) | Filer på +, − eller ingen av sidene |

Bare kolonner som er beholdt under *Behold for filtrering* ved innlasting tilbys.

### Sammenlign andeler, ikke antall {#compare-shares-not-counts}

**Sammenlign andeler, ikke antall** (standard av) vekter hver side med én delt på sitt eget antall rader, så en side med fem ganger så mange rader ikke vinner bare på tall. Fargen viser da hvor hver side er forholdsmessig vanligere enn den andre. Bruk det når de to sidene har svært ulik mengde data, for eksempel to økter av ulik lengde.

### Meldinger du kan se {#messages-you-may-see}

Panelet varsler når bildet ikke er en reell differanse:

| Melding | Betydning |
|---|---|
| *N + / M −* (eller *N + / M − / K ubrukt*) | Hvor mange verdier som ligger på hver side (og på ingen av dem). |
| Ingen rad i vinduet er på **+**-siden | Bare **−**-siden tegnes. Flytt tidslinjevinduet eller endre delingen. |
| Ingen rad i vinduet er på **−**-siden | Bare **+**-siden tegnes. |
| Ingen verdi er på noen av sidene | Differansen tegner ingenting. Sett minst én verdi på **+** eller **−**. |
| *kolonne* kan ikke deles slik | Den valgte kolonnen passer ikke til delingen. Velg kolonnen på nytt. |
| Delingskolonnen fikk ikke plass i GPU-minnet for N av M deler | De radene tegnes ikke. Øk GPU-budsjettet under Ytelse → Ressursbudsjetter, eller last inn færre rader. |

### Etter gruppe {#by-group}

Panelet peker bare på [Lagliste](teams-list.md), der hver gruppe har en knapp for **+** og en for **−**. Ved hver innlasting settes den første halvdelen av gruppene (avrundet opp) på +, resten på −; **Del jevnt** i Lagliste gjør det samme på nytt. En gruppe som står på ingen av sidene, eller er skjult med avmerkingsboksen, bidrar med ingenting.

### Etter kategoriverdier {#by-category-values}

| Del | Betydning |
|---|---|
| `a + / b − / c ubrukt` | Hvor mange verdier som ligger på hver side og på ingen av dem. |
| **Tøm** | Setter alle verdier på ingen av sidene. |
| Verdiliste | Hver verdi med en knapp for **+** og en for **−** (klikk den aktive en gang til for å ta den av siden). En tom verdi listes som *(mangler)*. |
| Merknad om grense | Bare de første 200 verdiene listes: *Viser de første 200 av N verdier. En så bred kolonne er bedre å snevre inn med et filter først, eller dele etter område hvis verdiene er ordnet.* |

Når du velger kolonnen, settes dens første verdi på + og den andre på −. Når ingen av sidene har noen verdi, faller delingen tilbake til grupper i stedet for å vise en tom ramme. *Kildefil* fungerer på samme måte, med én verdi per fil – slik sammenlignes to eksporter, to testkjøringer eller to bygg.

### Etter område {#by-range}

| Del | Betydning |
|---|---|
| Hint | Kolonnens minste og største verdi. |
| **Positivt område (+)**, **fra** / **til** | Rader med en verdi i dette området, inkludert i begge ender, legges til. |
| **Negativt område (−)**, **fra** / **til** | Rader i dette området trekkes fra. |
| **Del ved midtpunktet** | Setter + til [minimum, midten] og − til [midten, maksimum] – det som også skjer når du velger kolonnen. |

En verdi i begge områdene regnes som +. Områdene må ikke dekke hele kolonnen; verdier i ingen av dem utelates. *De to første minuttene mot de to siste* er en områdedeling på en tidslignende kolonne.

## Farger {#colours}

Seksjonen **Varmefarger** viser to fargeredigerere i denne modusen: **Positiv (lag som legger til)** og **Negativ (lag som trekker fra)**, hver med sin egen tilbakestillingsknapp (*Tilbakestill til gjennomsiktig → rød → gul → hvit*, *Tilbakestill til gjennomsiktig → grønn → blå → lilla*). Sammensetningen tar absoluttverdien av nettovarmen gjennom [metningspunktet og responsen](colour-and-exposure.md), og velger den negative rampen der nettoen er under null. Se [Farge og eksponering](colour-and-exposure.md#the-ramp-editor).

Bruk tetthetsresponsen *Lineær* når størrelsen på differansen betyr noe: det er den eneste responsen der lik farge betyr likt antall.

## Hvordan det fungerer {#how-it-works}

Hver rad får et fortegn på +1, −1 eller 0 i vertex-shaderen ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); en 0 forkaster raden før noe fragment tegnes.

- Etter gruppe kommer fortegnet fra en gruppetabell med 4 096 plasser, indeksert med radens gruppe-id (gruppe-id-en ligger i fjerde kanal av radens posisjonstexel).
- Etter kategori kommer fortegnet fra en annen tabell med 4 096 plasser, fylt per kategoriverdi, og radens verdi leses fra kolonnens filter-texel; en verdi forbi tabellens slutt forkastes på begge backendene.
- Etter område sammenlignes radens verdi med de to områdene.

Å endre delingen starter akkumuleringen på nytt.

**Skjulte grupper forblir skjult med hver deling.** Under en deling etter en kolonne bærer ikke gruppetabellen lenger fortegn; den har 1 for en vist gruppe og 0 for en skjult ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), og begge tabellene når shaderen samtidig – to rader i én fortegnstexel på WebGL2, to halvdeler av én lagringsbuffer på WebGPU. En rad tegnes bare når gruppen er vist *og* kolonneverdien står på en side. En gruppe som er avmerket bort i [Lagliste](teams-list.md), eller utelatt av fanen Kamps sidefokus, bidrar derfor med ingenting uansett hvordan differansen deles.
