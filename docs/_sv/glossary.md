---
title: "Ordlista"
nav_order: 21
lang: "sv"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Ordlista

Korta betydelser för orden den här webbplatsen använder, på vanlig svenska. Varje post länkar till sidan som förklarar den fullt ut.

## Data {#data}

**Rad.** En rad i din data: en sak som hände på en plats vid en tid, till exempel ”spelare 7 var här vid sekund 12”. Visaren ritar varje rad. [Dataformat](data-formats.md)

**Kolumn.** En sorts värde i raderna, till exempel x, y, z, tid eller lag. Visaren gissar vilken kolumn som är vilken, och du kan ändra gissningen. [Kolumnmappning](column-mapping.md)

**CSV.** En ren textabell: en rad per rad, med värdena åtskilda av kommatecken. Nästan alla program kan skriva en. [Läsa in filer](loading-files.md)

**Parquet.** En kompakt tabellfil som går snabbt att läsa, även med miljontals rader. Det är det bästa formatet att ge visaren. [Läsa in filer](loading-files.md)

**Händelse.** Något som hände, till exempel ett skott, en träff, en dödning eller en start. En rad kan vara en händelse, eller bara ”jag var här”. [Filter](filters.md)

**Person.** Den som gjorde raderna: en spelare, en pilot, en bil eller en stridsvagn. En person är en rad av positioner genom tiden. [Sessioner, personer och grupper](sessions-persons-groups.md)

**Grupp (lag).** En mängd personer som visas i samma färg, till exempel Blue och Red. [Sessioner, personer och grupper](sessions-persons-groups.md)

**Session (match, runda).** En körning av spelet. En match eller en runda är en session. Visaren kan visa en session eller lägga många ovanpå varandra. [Sessioner, personer och grupper](sessions-persons-groups.md)

**Bana.** 3D-kartan där datan hände: mark, byggnader, väggar. Rader visas där de hände på banan. [Banor och bakgrundsgeometri](levels.md)

## Titta på datan {#looking-at-the-data}

**Värmekarta.** En bild där platser som många rader berör lyser starkare. Kalla platser är lugna, heta platser är livliga. [Värme](heat.md)

**Värme.** Hur mycket som hände på en plats. Visaren adderar varje rads glöd på varje plats, och summan är värmen. [Värme](heat.md)

**Sprite.** Den lilla lysande fläcken visaren ritar för en rad. Många överlappande sprites adderas till värme. [Spriteform](sprite-shape.md)

**Exponering.** Hur ljus bilden är. Som i en kamera: för mycket exponering gör allt vitt, för lite döljer detaljerna. [Färg och exponering](colour-and-exposure.md)

**Mättnad.** Mängden värme som räknas som ”så het som färgerna går”. Sänk den för att lugna platser ska synas, höj den för att se bara det hetaste. [Färg och exponering](colour-and-exposure.md)

**Volym.** En låda eller form du placerar i 3D-vyn. Visaren räknar vad som finns inuti den och kan jämföra volymer med varandra. [Volymer och jämförelse](volumes.md)

**Filter.** En regel som döljer rader du inte vill ha, till exempel ”bara dödningar” eller ”bara laget Red”. [Filter](filters.md)

## Repris {#replay}

**Figur.** En liten modell av en stridsvagn, ett plan, en bil eller en soldat som rör sig dit datan säger att den var. [Figurer](figures.md)

**LOD (detaljnivå).** Varje figur har en detaljerad, en enklare och en mycket enkel version. Nära figurer använder den detaljerade och långt bort den enkla, så att tusentals kan ritas samtidigt. [Figurer](figures.md)

## Racing {#racing}

**Varv.** En färd runt banan, från startlinjen tillbaka till linjen. [Läsa in varv](race-loading-laps.md)

**Referensvarv.** Varvet alla andra jämförs med. Skillnader visas som ”snabbare” eller ”långsammare” än det. [Läsa in varv](race-loading-laps.md)

**Apex.** Punkten i en kurva där bilen är närmast innerkanten. [Kurva för kurva-analys](race-corner-analysis.md)

**Slip.** Hur mycket ett däck glider. Lite slip ger mest grepp, för mycket och bilen spinner. [Racinganalys: metoden](race-analytics.md)

**Hölje (envelope).** Vad en bil kan göra vid varje fart: hur hårt den kan svänga, bromsa och accelerera innan den glider. [Racinganalys: metoden](race-analytics.md)

## Flygsiffror {#aircraft-numbers}

**ALT.** Höjd: höjden över marken eller havsnivån. [Matchrepris](match-replay.md#labels-and-statistics)

**TAS.** Sann lufthastighet: hur fort ett plan rör sig genom luften. [Matchrepris](match-replay.md#labels-and-statistics)

## Dator {#computer}

**GPU.** Grafikkortet eller grafikchippet. Det ritar bilden och är mycket snabbare än huvudprocessorn på att rita miljontals fläckar. [De två bakändarna](backends.md)

**WebGPU / WebGL2.** De två sätten en webbläsare låter en sida använda GPU:n. WebGPU är nyare. Visaren kan använda båda och väljer den bästa som din webbläsare har. [De två bakändarna](backends.md)

## Counter-Strike-ord {#counter-strike-words}

**Runda.** Ett kort slagsmål inom en match. Ena sidan vinner det, och poängen går upp med ett.

**Eco, force buy, full buy.** Hur mycket pengar en sida spenderar på vapen i början av en runda. Eco sparar pengar och köper nästan ingenting (under 1 500 $ per spelare i snitt). Force buy spenderar det den har (under 4 000 $). Full buy köper allt den kan. [Matchanalys](match-analysis.md)

**Trade.** En dödning som betalar tillbaka en dödning: du skjuts, och en lagkamrat skjuter din mördare inom 5 sekunder. [Matchanalys](match-analysis.md)

**KAST.** Andelen rundor i vilka en spelare fick en dödning, en assist, överlevde eller blev tradad. Ett högre tal betyder att spelaren hjälpte till i fler rundor. [Matchanalys](match-analysis.md)

**ADR.** Genomsnittlig skada per runda: hur mycket hälsa en spelare tog från fiender varje runda. [Matchanalys](match-analysis.md)
