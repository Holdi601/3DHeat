---
title: "Forskel"
parent: "Varmetilstande"
nav_order: 5
lang: "da"
source: "difference.md"
source_hash: "9db62413b59c"
translated: true
outdated: false
---

# Forskel

Rød hvor hold A var mere, grøn-blå hvor hold B var, intet hvor de var lige.

**Forskel** (tast 2) er fortegnet varme. Rækker fra én population lægger varme til; rækker fra en anden trækker den fra. Hvor de to overlapper jævnt, bliver resultatet nul og helt gennemsigtigt; hvor den ene dominerer, vises den i den sides farver - som standard varm (gennemsigtig → rød → gul → hvid) for **+**-siden og kølig (gennemsigtig → grøn → blå → lilla) for **−**-siden.

![Forskelsvarme: rød hvor +-siden var mere, grøn og blå hvor −-siden var mere](../assets/img/da/difference-split.webp)

## Sådan bruges den {#how-to-use-it}

1. Tryk på `2` (eller vælg **Forskel** i tilstandslinjen).
2. Åbn **Forskelsopdeling** i sidepanelet.
3. Vælg, hvad der skal **Opdel efter**: normalt *Grupper*.
4. Sæt én gruppe (eller værdi) på **+** og en anden på **−**.
5. Læs farverne: varm betyder +-siden, kølig betyder −-siden. Panelet advarer, hvis den ene side ikke har nogen rækker (se [Meddelelser du kan se](#messages-you-may-see)).

*Hvilke* to populationer, der er tale om, er hele spørgsmålet, så opdelingen kan være enhver beholdt kolonne, ikke kun grupper. Rækker, der falder på **ingen af siderne**, **udelades**, de tælles ikke som nul: det er det, der gør, at en opdeling over to af mange værdier sammenligner netop de to, og den virker sammen med [filtrene](filters.md) - filtrér ned til ét kort, og opdel derefter det efter build.

Tilstanden kræver to sider: en gruppekolonne med mindst to grupper, eller en opdeling over en kolonne, der er beholdt til filtrering. På data med færre end to grupper starter en indlæsning med en kolonneopdeling - først kolonnen *Source file* i en indlæsning af flere filer, ellers den første kategorikolonne med to værdier, ellers den første numeriske kolonne med et spænd - så *sammenlign to indlæsninger* virker på data uden nogen grupper. Kun data med ingen af delene gør tilstanden utilgængelig; det gør en kolonneopdeling også, der står med intet på den ene side.

## Panelet Forskelsopdeling {#the-difference-split-panel}

Vises i Forskel-tilstand, under varmepanelerne.

**Opdel efter** tilbyder:

| Valg | Vist som | Opdelingsregel |
|---|---|---|
| Grupper | *Gruppe (N)* (når der er en gruppekolonne) | Hver gruppe på +, − eller ingen, sat i [holdlisten](teams-list.md) |
| En kategorikolonne | *kolonne (N værdier)* | Værdier på +, − eller ingen |
| En numerisk kolonne | *kolonne (numerisk)* | Et værdiinterval for hver side |
| Filen den kom fra | *Source file - sammenlign to indlæsninger* (når flere filer blev indlæst) | Filer på +, − eller ingen |

Kun kolonner, der blev beholdt under *Behold til filtrering* ved indlæsning, tilbydes.

### Sammenlign andele, ikke antal {#compare-shares-not-counts}

**Sammenlign andele, ikke antal** (standard fra) vægter hver side med én over dens egen rækkeantal, så en side med fem gange så mange rækker ikke vinder blot på tal. Farven viser så, hvor hver side forholdsmæssigt er hyppigere end den anden. Brug den, når de to sider har meget forskellige datamængder, for eksempel to sessioner af forskellig længde.

### Meddelelser du kan se {#messages-you-may-see}

Panelet advarer, når billedet ikke er en rigtig forskel:

| Meddelelse | Betydning |
|---|---|
| *N + / M −* (eller *N + / M − / K ubrugt*) | Hvor mange værdier der er på hver side (og på ingen). |
| Ingen række i vinduet er på **+**-siden | Kun **−**-siden tegnes. Flyt tidslinjens vindue eller skift opdelingen. |
| Ingen række i vinduet er på **−**-siden | Kun **+**-siden tegnes. |
| Ingen værdi er på nogen af siderne | Forskellen tegner intet. Sæt mindst én værdi på **+** eller **−**. |
| *kolonne* kan ikke opdeles på denne måde | Den valgte kolonne passer ikke til opdelingen. Vælg kolonnen igen. |
| Opdelingskolonnen passede ikke i GPU-hukommelsen for N af M bidder | Disse rækker tegnes ikke. Hæv GPU-budgettet under Ydeevne → Ressourcebudgetter, eller indlæs færre rækker. |

### Efter gruppe {#by-group}

Panelet peger blot på [holdlisten](teams-list.md), hvor hver gruppe har en **+**- og en **−**-knap. Ved hver indlæsning sættes den første halvdel af grupperne (rundet op) på +, resten på −; **Del ligeligt** i holdlisten gør det igen. En gruppe på ingen af siderne, eller skjult med sit afkrydsningsfelt, bidrager intet.

### Efter kategoriværdier {#by-category-values}

| Del | Betydning |
|---|---|
| `a + / b − / c ubrugt` | Hvor mange værdier der er på hver side og på ingen. |
| **Ryd** | Sætter hver værdi på ingen side. |
| Værdiliste | Hver værdi med en **+**- og en **−**-knap (klik på den aktive igen for at tage den af siden). En tom værdi listes som *(mangler)*. |
| Bemærkning om loft | Kun de første 200 værdier listes: *Viser de første 200 af N værdier. En kolonne så bred indsnævres bedst med et filter først, eller opdeles efter interval, hvis dens værdier er ordnede.* |

Når kolonnen vælges, sættes dens første værdi på + og dens anden på −. Når ingen af siderne har nogen værdi, falder opdelingen tilbage til grupper i stedet for at vise en tom ramme. *Source file* virker på samme måde, én værdi pr. fil - sådan sammenlignes to eksporter, to testkørsler eller to builds.

### Efter interval {#by-range}

| Del | Betydning |
|---|---|
| Tip | Kolonnens mindste og største værdi. |
| **Positivt interval (+)**, **fra** / **til** | Rækker med en værdi i dette interval, inklusiv i begge ender, lægges til. |
| **Negativt interval (−)**, **fra** / **til** | Rækker i dette interval trækkes fra. |
| **Del ved midtpunktet** | Sætter + til [mindste, midt] og − til [midt, største] - det samme som valget af kolonnen gør. |

En værdi i begge intervaller tæller som +. Intervallerne behøver ikke dække kolonnen; værdier i ingen af dem udelades. *De første to minutter mod de sidste to minutter* er en intervalopdeling på en tidslignende kolonne.

## Andel +: sejrsandelskortet {#share-of--the-win-rate-map}

**Forskel** / **Andel +** øverst i panelet vælger, hvad der tegnes. *Andel +* farver hvert sted efter + sidens andel af rækkerne på begge sider der, set mod den andel over alt det viste: varmt over den, koldt under, intet, hvor den er den samme, og intet, hvor et sted har for få rækker. Med de vundne runder på + og de tabte på − er det et sejrsandelskort; **Sejrsandel pr. runde** og **Sejrsandel pr. kamp** sætter det op med ét tryk, hvor dataene har [resultatkolonner](data-formats.md#outcome-columns). Se [Sejrsandel](win-rate.md).

## Farver {#colours}

Afsnittet **Varmefarver** viser to skala-redigeringer i denne tilstand: **Positiv (additive hold)** og **Negativ (subtraktive hold)**, hver med sin egen nulstillingsknap (*Nulstil til gennemsigtig → rød → gul → hvid*, *Nulstil til gennemsigtig → grøn → blå → lilla*). Det sammensatte billede tager den absolutte værdi af nettovarmen gennem [mætningspunktet og responsen](colour-and-exposure.md), og vælger den negative skala, hvor nettoen er under nul. Se [Farve og eksponering](colour-and-exposure.md#the-ramp-editor).

Brug *Lineær* tæthedsrespons, når forskellens størrelse betyder noget: det er den eneste respons, hvor samme farve betyder samme antal.

## Til udviklere {#for-developers}

Hver række får et fortegn på +1, -1 eller 0 i hjørnepunkt-shaderen ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); en 0 afviser rækken, før noget fragment tegnes.

- Efter gruppe kommer fortegnet fra en gruppetabel med 4.096 poster indekseret med rækkens gruppe-id (gruppe-id'et sidder i den fjerde kanal af rækkens positionstexel).
- Efter kategori kommer fortegnet fra en anden tabel med 4.096 poster, fyldt pr. kategoriværdi, og rækkens værdi læses fra kolonnens filtertexel; en værdi forbi tabellens ende afvises på begge backends.
- Efter interval sammenlignes rækkens værdi med de to intervaller.

Ændring af opdelingen starter akkumuleringen forfra.

**Skjulte grupper forbliver skjult ved enhver opdeling.** Under en opdeling efter en kolonne bærer gruppetabellen ikke længere fortegn; den rummer 1 for en vist gruppe og 0 for en skjult ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), og begge tabeller når shaderen samtidig - to rækker i én fortegnstexel på WebGL2, to halvdele af én storage-buffer på WebGPU. En række tegnes kun, når dens gruppe er vist *og* dens kolonneværdi er på en side. Så bidrager en gruppe, der er fravalgt i [holdlisten](teams-list.md), eller udeladt af kampfanens sidefokus, intet, uanset hvordan forskellen opdeles.
