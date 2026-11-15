---
title: "Ordliste"
nav_order: 21
lang: "no"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Ordliste

Korte betydninger av ordene dette nettstedet bruker, med enkle ord. Hvert punkt lenker til siden som forklarer det fullt ut.

## Data {#data}

**Rad.** Én linje i dataene dine: én ting som skjedde på ett sted og tidspunkt, for eksempel «spiller 7 var her ved sekund 12». Visningen tegner hver rad. [Dataformater](data-formats.md)

**Kolonne.** Én type verdi i radene, som x, y, z, tid eller lag. Visningen gjetter hvilken kolonne som er hvilken, og du kan endre gjetningen. [Kolonnetilordning](column-mapping.md)

**CSV.** En enkel teksttabell: én rad per linje, verdiene skilt med komma. Nesten alle programmer kan skrive en. [Laste inn filer](loading-files.md)

**Parquet.** En kompakt tabellfil som er rask å lese, selv med millioner av rader. Det er det beste formatet å gi visningen. [Laste inn filer](loading-files.md)

**Hendelse.** Noe som skjedde, for eksempel et skudd, et treff, et drap eller en avgang. En rad kan være en hendelse, eller bare «jeg var her». [Filtre](filters.md)

**Person.** Den som laget radene: en spiller, en pilot, en bil eller en stridsvogn. Én person er én linje med posisjoner over tid. [Økter, personer og grupper](sessions-persons-groups.md)

**Gruppe (lag).** Et sett med personer som vises i samme farge, for eksempel Blå og Rød. [Økter, personer og grupper](sessions-persons-groups.md)

**Økt (kamp, runde).** Én kjøring av spillet. En kamp eller en runde er en økt. Visningen kan vise én økt eller legge mange over hverandre. [Økter, personer og grupper](sessions-persons-groups.md)

**Nivå.** 3D-kartet dataene skjedde på: bakke, bygninger, vegger. Radene vises der de skjedde på nivået. [Nivåer og bakgrunnsgeometri](levels.md)

## Å se på dataene {#looking-at-the-data}

**Varmekart.** Et bilde der steder mange rader berører, lyser sterkere. Kalde steder er stille, varme steder er travle. [Varme](heat.md)

**Varme.** Hvor mye som skjedde på et sted. Visningen legger sammen hver rads glød på hvert sted; summen er varmen. [Varme](heat.md)

**Sprite.** Den lille lysende flekken visningen tegner for én rad. Mange overlappende sprites legges sammen til varme. [Sprite-form](sprite-shape.md)

**Eksponering.** Hvor lyst bildet er. Som et kamera gjør for mye eksponering alt hvitt, og for lite skjuler detaljene. [Farge og eksponering](colour-and-exposure.md)

**Metning.** Mengden varme som regnes som «så varm som fargene går». Senk den for å få stille steder til å vises; øk den for å se bare det varmeste. [Farge og eksponering](colour-and-exposure.md)

**Volum.** En boks eller form du plasserer i 3D-visningen. Visningen teller det som er inni den, og kan sammenligne volumer med hverandre. [Volumer og sammenligning](volumes.md)

**Filter.** En regel som skjuler rader du ikke vil ha, for eksempel «bare drap» eller «bare lag Rød». [Filtre](filters.md)

## Reprise {#replay}

**Figur.** En liten modell av en stridsvogn, et fly, en bil eller en soldat som beveger seg dit dataene sier at den var. [Figurer](figures.md)

**LOD (detaljnivå).** Hver figur har en detaljert, en enklere og en svært enkel versjon. Nære figurer bruker den detaljerte, og fjerne den enkle, slik at tusenvis kan tegnes samtidig. [Figurer](figures.md)

## Racing {#racing}

**Runde (lap).** Én tur rundt banen, fra linjen og tilbake til linjen. [Laste inn runder](race-loading-laps.md)

**Referanserunde.** Runden alle de andre sammenlignes med. Forskjeller vises som «raskere» eller «saktere» enn den. [Laste inn runder](race-loading-laps.md)

**Apex.** Punktet i en sving der bilen er nærmest innsiden. [Analyse sving for sving](race-corner-analysis.md)

**Glidning (slip).** Hvor mye et dekk sklir. Litt glidning gir mest grep; for mye, og bilen sklir. [Racinganalyse: metoden](race-analytics.md)

**Ytelseskurve (envelope).** Hva en bil kan gjøre ved hver fart: hvor hardt den kan svinge, bremse og akselerere før den sklir. [Racinganalyse: metoden](race-analytics.md)

## Flytall {#aircraft-numbers}

**ALT.** Høyde: høyden over bakken eller havnivå. [Kampreplay](match-replay.md#labels-and-statistics)

**TAS.** Sann luftfart: hvor fort et fly beveger seg gjennom luften. [Kampreplay](match-replay.md#labels-and-statistics)

## Datamaskin {#computer}

**GPU.** Grafikkortet eller brikken. Den tegner bildet og er mye raskere enn hovedprosessoren til å tegne millioner av flekker. [De to backendene](backends.md)

**WebGPU / WebGL2.** De to måtene en nettleser lar en side bruke GPU-en på. WebGPU er nyere. Visningen kan bruke begge og velger den beste nettleseren din har. [De to backendene](backends.md)

## Counter-Strike-ord {#counter-strike-words}

**Runde.** En kort kamp inne i en kamp. Den ene siden vinner den, og poengsummen går opp med én.

**Eco, force buy, full buy.** Hvor mye penger en side bruker på våpen ved starten av en runde. En eco sparer penger og kjøper nesten ingenting (under 1 500 dollar per spiller i snitt). Et force buy bruker det som finnes (under 4 000 dollar). Et full buy kjøper alt det kan. [Kampanalyse](match-analysis.md)

**Trade.** Et drap som betaler tilbake et drap: du blir skutt, og en lagkamerat skyter drapsmannen din innen 5 sekunder. [Kampanalyse](match-analysis.md)

**KAST.** Andelen runder der en spiller fikk et drap, en assist, overlevde eller ble tradet. Et høyere tall betyr at spilleren hjalp til i flere runder. [Kampanalyse](match-analysis.md)

**ADR.** Gjennomsnittlig skade per runde: hvor mye helse en spiller tok fra fiender hver runde. [Kampanalyse](match-analysis.md)
