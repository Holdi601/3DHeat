---
title: "Collectief gedrag"
parent: "Inzichten"
nav_order: 3
lang: "nl"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Collectief gedrag: drommen, zwermen, kudden en beslissingen onder druk

Spelers in een wedstrijd gedragen zich zoals mensen overal: ze klonteren bij deuren, volgen wie er als eerste ging, blijven bij elkaar of raken verspreid, trekken zich terug na zware verliezen, en nemen meer risico na een slecht leven. De **gedragsmetingen van de lens** meten deze patronen met de methoden van de menigtewetenschap, de natuurkunde van collectieve beweging, de gedragseconomie en de militaire psychologie, elk tegen het eigen nulmodel, en lezen ze via de bijbehorende items van de [kennisbank](knowledge.md).

## Probeer het {#try-it}

1. Laad een of meer matches met tijd, posities en teams.
2. Open **Inzichten** en start het.
3. Klap **Lensmetingen** open: de gedragsmetingen staan bij de andere (Collectieve uitlijning, Kuddegedrag op routes, Rijstroken en paden, Drukte, Leiders en volgers, Samenhang en achterblijvers, Breekpunt, Risico na verliezen, Reeksen, Overeenstemming in aankopen, Onderdrukking), elk met zijn cijfers, zijn toets en de literatuur die het verklaart.
4. De **Nabespreking** verwijst ernaar; **Schrijven met AI** stuurt ze mee met het rapport.

## De metingen {#the-measures}

Routes worden opnieuw bemonsterd naar één punt per 2 s (de positie aan het eind van het interval en de snelheid erover). Afstanden worden geschaald naar de eigen typische onderlinge afstand van de data - de mediane afstand van een eenheid tot haar dichtstbijzijnde teamgenoot - zodat dezelfde meting werkt voor infanterie, tanks en vliegtuigen.

| Meting | Wat het meet | Nulmodel en toets | Kennis |
|---|---|---|---|
| Collectieve uitlijning | Polarisatie (lengte van de gemiddelde koers van de eenheden) van de bewegende eenheden van elke kant elke 2 s, rondcirkelen (rotatie om het zwaartepunt), aandelen van de tijd gepolariseerd, rondcirkelend en zwermend, per wedstrijdfase; in gevechten tussen twee uitgelijnde kanten het killaandeel van de sterker uitgelijnde kant | Het eigen spoor van elke eenheid in de tijd verschoven binnen de match (behoudt het pad, breekt de gelijktijdigheid); tekenomkeringstoets over vensters van 60 s | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Kuddegedrag op routes | Hoe vaak een eenheid een plek verlaat op de manier waarop de teamgenoot ervoor dat deed (binnen 30 s), bij dezelfde manier van binnenkomen, vergeleken met de eigen uitgangsaandelen van de plek - en met het kopiëren van een eerdere doorgang van een vijand | Uitgangen door elkaar gehusseld binnen plek en binnenkomst; het effect is kopiëren van teamgenoten minus kopiëren van vijanden (Manski's spiegelprobleem: kopiëren en een plan dat de kant deelt, lijken op elkaar) | Banerjee 1992, Bikhchandani e.a. 1992, Manski 1993 |
| Rijstroken en paden | Laterale scheiding van de twee richtingen op plekken met tegenverkeer; het aandeel van de beweging op de drukste 10% van het terrein, de Gini daarvan, en de overlap van het drukste terrein van de matches | Richtingen door elkaar gehusseld tussen hele bezoeken; twee roosters die een halve plek verschoven zijn, elk getoetst, Bonferroni | Helbing e.a. 1997, 2005 |
| Drukte | Snelheid (ten opzichte van het eigen tempo van de eenheid) en stroom naar het aantal buren binnen twee keer de typische afstand, de capaciteitsdaling in de dichtste klasse, op het drukste terrein; doden per uur in menigten; schoten per minuut van teamgenoten in de buurt (sociaal luieren) | De eigen snelheid-dichtheidscorrelatie van elke eenheid, tekenomkering over eenheden, minimaal effect ρ buiten ±0,05; exacte snelheidstoetsen | Helbing e.a. 2000, Seyfried e.a. 2005, Latané e.a. 1979 |
| Leiders en volgers | Voor teamgenoten die samen reizen, de tijdsvertraging (tot 8 s) waarbij de koers van de een de koers van de ander het best voorspelt; leidersgraaf, transitiviteit van triades, sterfte- en killsnelheden van leiders | Paren met één spoor in de tijd verschoven geven de drempel van 95%; binomiale toets tegen 5% | Nagy e.a. 2010, Couzin e.a. 2005 |
| Samenhang en achterblijvers | Tijd verder dan drie keer de typische afstand van de kant tot de dichtstbijzijnde teamgenoot; sterftesnelheid daar tegenover bij de groep; de onderlinge afstand van een kant tegenover haar aandeel in de kills van een gevecht | Exacte voorwaardelijke toets van twee Poisson-snelheden | Shils en Janowitz 1948, Siebold 2007 |
| Breekpunt | Naderingssnelheid naar de vijand (in het eigen tempo van de kant) naar het aandeel van de kant dat in de laatste minuut verloren is; het laagste verliesniveau waarop kanten zich terugtrekken | Eenzijdige clusterbootstrap tegen een terugtrekking van een tiende van het tempo (verliezen komen waar kanten elkaar ontmoeten, en kanten die elkaar ontmoeten, stoppen met naderen), Bonferroni over niveaus | Dupuy 1987, Rowland 2006 |
| Risico na verliezen | Aandeel van het volgende leven dat voor de eigen kant richting de vijand wordt doorgebracht, boven het eigen aandeel van de kant en andere terugkerende eenheden op dat moment: na een leven verloren zonder kill tegenover na een leven met kill; vroege dood na vroege dood (tilt) | Het leven van elke eenheid door elkaar gehusseld (eerste leven behouden), zodat de bias van de eindige reeks in het nulmodel zit | Kahneman en Tversky 1979, Thaler en Johnson 1990 |
| Reeksen | P(kill na k kills) − P(kill na k doden), k = 1..3 | De eigen reeks van elke speler 1.000 keer door elkaar gehusseld: de bias die Miller en Sanjurjo aantoonden, wordt afgetrokken; Bonferroni over k | Gilovich e.a. 1985, Miller en Sanjurjo 2018 |
| Overeenstemming in aankopen | Fleiss' κ van de uitrustingsklassen (eco, leger, vol; tertielen buiten Counter-Strike) binnen de ronde van een kant | De speler-rondes van de kant door elkaar gehusseld over haar rondes | Fleiss 1971 |
| Onderdrukking | Snelheid in de 4 s na niet-dodelijke schade tegenover de 4 s ervoor, en schoten in de 10 s na tegenover ervoor, bij treffers en bij de rustige momenten van dezelfde eenheid | Tekenomkering over eenheden, minimale effecten van 0,05 van het tempo en één schot per minuut | Rowland 2006 |

Elke p-waarde van het rapport gaat door de Benjamini-Hochberg-correctie voor de false discovery rate (`q`). Een meting wordt weggelaten wanneer de data haar niet kan dragen: rondes en uitrustingswaarden zijn nodig voor overeenstemming in aankopen, schadegebeurtenissen voor onderdrukking, kills en doden toegeschreven aan eenheden voor reeksen en risico.

## In de massa-analyse {#in-the-mass-analysis}

Elke wedstrijdsamenvatting (`<match>.summary.json`, zie [Massa-analyse](mass-analysis.md)) draagt dezelfde metingen voor die wedstrijd in zijn `behaviour`-deel, zodat duizenden matches vergeleken kunnen worden zonder hun rijen opnieuw te lezen.

## Hoe goed het werkt {#how-well-it-works}

Op gesimuleerde gevechten met elk effect ingebouwd, en dezelfde werelden zonder (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): elke meting vindt het ingebouwde effect, en de nulwerelden blijven onder de drempel voor de false discovery rate. Risico na verliezen heeft de minste power; kuddegedrag op routes kan kopiëren niet onderscheiden van een gedeeld plan (een kant die één doel deelt, is volgens deze meting "kuddegedrag").

## Voor ontwikkelaars {#for-developers}

- `src/insights/behaviour/acc.ts` - de accumulator (bemonsterde routes, gebeurtenissen, rondes) en `finish`; `motion.ts` en `choice.ts` de metingen; `bstats.ts` helpers voor permutatie, bootstrap en kappa; `shows.ts` de patronen en zinnen die de lens leest (`lens.<measure>`).
- `feed.ts` voedt hem vanuit de chunks van de inzichtworker; `summaryTap.ts` vanuit een wedstrijdsamenvatting terwijl die de tabel streamt.
- Kennis: `src/insights/knowledge/behaviour.ts` (items), `patterns-behaviour.ts`, `refs-behaviour.ts` (verwijzingen, elk gecontroleerd tegen zijn Crossref- of Open Library-record).
- Labels: `lens.metric.<measure>` in `locales/*/lens.json`.
