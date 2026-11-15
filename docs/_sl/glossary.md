---
title: "Slovar pojmov"
nav_order: 21
lang: "sl"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Slovar pojmov

Kratki pomeni besed, ki jih uporablja ta spletna stran, v preprostem jeziku. Vsak vnos povezuje na stran, ki ga razlaga v celoti.

## Podatki {#data}

**Vrstica.** Ena vrstica vaših podatkov: ena stvar, ki se je zgodila na enem mestu in ob enem času, na primer »igralec 7 je bil tukaj ob 12. sekundi«. Pregledovalnik nariše vsako vrstico. [Podatkovni formati](data-formats.md)

**Stolpec.** Ena vrsta vrednosti v vrsticah, na primer x, y, z, čas ali ekipa. Pregledovalnik ugiba, kateri stolpec je kateri, uganko pa lahko spremenite. [Preslikava stolpcev](column-mapping.md)

**CSV.** Navadna besedilna tabela: ena vrstica na vrstico, vrednosti ločene z vejicami. Skoraj vsak program jo zna zapisati. [Nalaganje datotek](loading-files.md)

**Parquet.** Kompaktna datoteka tabele, ki se hitro bere, tudi z milijoni vrstic. Najboljši format za pregledovalnik. [Nalaganje datotek](loading-files.md)

**Dogodek.** Nekaj, kar se je zgodilo, na primer strel, zadetek, ubitje ali vzlet. Vrstica je lahko dogodek ali samo »bil sem tukaj«. [Filtri](filters.md)

**Oseba.** Tisti, ki je ustvaril vrstice: igralec, pilot, avto ali tank. Ena oseba je ena črta položajev skozi čas. [Seje, osebe in skupine](sessions-persons-groups.md)

**Skupina (ekipa).** Nabor oseb, prikazanih v isti barvi, na primer Blue in Red. [Seje, osebe in skupine](sessions-persons-groups.md)

**Seja (tekma, runda).** Ena igra. Tekma ali runda je seja. Pregledovalnik lahko prikaže eno sejo ali jih naloži več drugo čez drugo. [Seje, osebe in skupine](sessions-persons-groups.md)

**Raven.** 3D zemljevid, na katerem so se podatki zgodili: tla, stavbe, zidovi. Vrstice se prikažejo tam, kjer so se zgodile na ravni. [Ravni in geometrija ozadja](levels.md)

## Gledanje podatkov {#looking-at-the-data}

**Toplotni zemljevid.** Slika, na kateri mesta, ki jih veliko vrstic zadeva, svetijo bolj vroče. Hladna mesta so tiha, vroča so polna dogajanja. [Toplota](heat.md)

**Toplota.** Koliko se je zgodilo na nekem mestu. Pregledovalnik na vsakem mestu sešteje sijaj vsake vrstice; vsota je toplota. [Toplota](heat.md)

**Sprajt.** Majhna svetleča lisa, ki jo pregledovalnik nariše za eno vrstico. Mnogo prekrivajočih se sprajtov se sešteje v toploto. [Oblika sprajta](sprite-shape.md)

**Osvetlitev.** Kako svetla je slika. Kot pri fotoaparatu: preveč osvetlitve vse pobeli, premalo skrije podrobnosti. [Barva in osvetlitev](colour-and-exposure.md)

**Nasičenje.** Količina toplote, ki šteje kot »tako vroče, kot segajo barve«. Znižajte jo, da se pokažejo tiha mesta; dvignite, da vidite le najvročejša. [Barva in osvetlitev](colour-and-exposure.md)

**Prostornina.** Škatla ali oblika, ki jo postavite v 3D pogled. Pregledovalnik šteje, kaj je znotraj nje, in lahko primerja prostornine med seboj. [Prostornine in primerjava](volumes.md)

**Filter.** Pravilo, ki skrije vrstice, ki jih ne želite, na primer »samo ubitja« ali »samo ekipa Red«. [Filtri](filters.md)

## Predvajanje {#replay}

**Figura.** Majhen model tanka, letala, avtomobila ali vojaka, ki se premika tja, kjer podatki pravijo, da je bil. [Figure](figures.md)

**LOD (raven podrobnosti).** Vsaka figura ima podrobno, preprostejšo in zelo preprosto različico. Bližnje uporabijo podrobno, oddaljene preprosto, zato jih lahko narišemo na tisoče hkrati. [Figure](figures.md)

## Dirkanje {#racing}

**Krog.** Ena vožnja po progi, od črte nazaj do črte. [Nalaganje krogov](race-loading-laps.md)

**Referenčni krog.** Krog, s katerim se primerjajo vsi drugi. Razlike so prikazane kot »hitreje« ali »počasneje« od njega. [Nalaganje krogov](race-loading-laps.md)

**Apeks.** Točka ovinka, kjer je avto najbližje notranjemu robu. [Analiza ovinek za ovinkom](race-corner-analysis.md)

**Zdrs.** Koliko gume drsijo. Malo zdrsa da največ oprijema; preveč in avto zdrsne. [Analitika dirke: metoda](race-analytics.md)

**Ovojnica.** Kaj zmore avto pri vsaki hitrosti: kako močno lahko zavija, zavira in pospešuje, preden zdrsne. [Analitika dirke: metoda](race-analytics.md)

## Številke letal {#aircraft-numbers}

**ALT.** Višina: razdalja nad tlemi ali morsko gladino. [Predvajanje tekme](match-replay.md#labels-and-statistics)

**TAS.** Prava hitrost zraka: kako hitro se letalo giblje skozi zrak. [Predvajanje tekme](match-replay.md#labels-and-statistics)

## Računalnik {#computer}

**GPU.** Grafična kartica ali čip. Riše sliko in je pri risanju milijonov lis veliko hitrejši od glavnega procesorja. [Dve izvedbi upodabljanja](backends.md)

**WebGPU / WebGL2.** Dva načina, kako brskalnik dovoli strani uporabo GPU. WebGPU je novejši. Pregledovalnik lahko uporabi katerega koli in izbere najboljšega, ki ga ima vaš brskalnik. [Dve izvedbi upodabljanja](backends.md)

## Besede iz Counter-Strike {#counter-strike-words}

**Runda.** En kratek boj znotraj tekme. Ena stran ga zmaga in rezultat se poveča za ena.

**Eco, forsirani nakup, poln nakup.** Koliko denarja stran porabi za orožje na začetku runde. Eco varčuje in skoraj nič ne kupi (pod 1.500 $ na igralca v povprečju). Forsirani nakup porabi, kar ima (pod 4.000 $). Poln nakup kupi vse, kar lahko. [Analiza tekme](match-analysis.md)

**Izmenjava.** Ubitje, ki povrne ubitje: ustreljeni ste, soigralec pa ustreli vašega morilca v 5 sekundah. [Analiza tekme](match-analysis.md)

**KAST.** Delež rund, v katerih je igralec dobil ubitje, asistenco, preživel ali bil maščevan. Višje število pomeni, da je igralec pomagal v več rundah. [Analiza tekme](match-analysis.md)

**ADR.** Povprečna škoda na rundo: koliko zdravja je igralec vzel sovražnikom v vsaki rundi. [Analiza tekme](match-analysis.md)
