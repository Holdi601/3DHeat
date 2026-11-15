---
title: "Ordliste"
nav_order: 21
lang: "no"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Ordliste

Korte betydninger av ordene denne siden bruker, med vanlig språk. Hvert innlegg lenker til siden som forklarer det fullt ut.

## Data {#data}

**Rad.** En linje i dataene dine: én ting som skjedde på ett sted og ett tidspunkt, for eksempel «spiller 7 var her på sekund 12». Visningsprogrammet tegner hver rad. [Dataformater](data-formats.md)

**Kolonne.** Én type verdi i radene, for eksempel x, y, z, tid eller lag. Visningsprogrammet gjetter hvilken kolonne som er hvilken, og du kan endre gjetningen. [Kolonnetilordning](column-mapping.md)

**CSV.** En enkel teksttabell: én rad per linje, verdiene skilt med komma. Nesten hvert program kan skrive en. [Laste inn filer](loading-files.md)

**Parquet.** En kompakt tabellfil som er rask å lese, selv med millioner av rader. Det er det beste formatet å gi visningsprogrammet. [Laste inn filer](loading-files.md)

**Hendelse.** Noe som skjedde, for eksempel et skudd, et treff, et drap eller en avgang. En rad kan være en hendelse, eller bare «jeg var her». [Filtre](filters.md)

**Person.** Den som lagde radene: en spiller, en flyger, en bil eller en stridsvogn. Én person er én linje med posisjoner gjennom tiden. [Økter, personer og grupper](sessions-persons-groups.md)

**Gruppe (lag).** Et sett personer vist i samme farge, for eksempel Blue og Red. [Økter, personer og grupper](sessions-persons-groups.md)

**Økt (kamp, runde).** Én kjøring av spillet. En kamp eller en runde er en økt. Visningsprogrammet kan vise én økt eller legge mange oppå hverandre. [Økter, personer og grupper](sessions-persons-groups.md)

**Bane.** Det 3D-kartet dataene skjedde på: bakke, bygninger, vegger. Rader vises der de skjedde på banen. [Baner og bakgrunnsgeometri](levels.md)

## Se på dataene {#looking-at-the-data}

**Varmekart.** Et bilde der steder mange rader berører, gløder varmere. Kalde steder er stille, varme steder er travle. [Varme](heat.md)

**Varme.** Hvor mye som skjedde på et sted. Visningsprogrammet legger sammen hver rads glød på hvert sted; summen er varmen. [Varme](heat.md)

**Sprite.** Den lille glødende klatten visningsprogrammet tegner for én rad. Mange overlappende sprite-er legges sammen til varme. [Sprite-form](sprite-shape.md)

**Eksponering.** Hvor lyst bildet er. Som i et kamera gjør for mye eksponering alt hvitt, og for lite skjuler detaljene. [Farge og eksponering](colour-and-exposure.md)

**Metning.** Mengden varme som telles som «så varm som fargene går». Senk den for å få stille steder til å vise seg; øk den for bare å se det varmeste. [Farge og eksponering](colour-and-exposure.md)

**Volum.** En boks eller form du plasserer i 3D-visningen. Visningsprogrammet teller det som er inni den, og kan sammenligne volumer med hverandre. [Volumer og sammenligning](volumes.md)

**Filter.** En regel som skjuler rader du ikke vil ha, for eksempel «bare drap» eller «bare lag Red». [Filtre](filters.md)

## Replay {#replay}

**Figur.** En liten modell av en stridsvogn, et fly, en bil eller en soldat som beveger seg dit dataene sier at den var. [Figurer](figures.md)

**LOD (detaljnivå).** Hver figur har en detaljert, en enklere og en svært enkel versjon. Nære figurer bruker den detaljerte og fjerne den enkle, så tusenvis kan tegnes samtidig. [Figurer](figures.md)

## Racing {#racing}

**Runde.** Én tur rundt banen, fra startlinjen og tilbake til startlinjen. [Laste inn runder](race-loading-laps.md)

**Referanserunde.** Runden alle de andre sammenlignes med. Forskjeller vises som «raskere» eller «tregere» enn den. [Laste inn runder](race-loading-laps.md)

**Apex.** Punktet i en sving der bilen er nærmest innsiden. [Analyse sving for sving](race-corner-analysis.md)

**Glidning (slip).** Hvor mye et dekk sklir. Litt glidning gir mest grep; for mye og bilen spinner. [Løpsanalyse: metoden](race-analytics.md)

**Omhylling (envelope).** Hva en bil kan gjøre ved hver fart: hvor hardt den kan svinge, bremse og akselerere før den sklir. [Løpsanalyse: metoden](race-analytics.md)

## Flyverdier {#aircraft-numbers}

**ALT.** Høyde: avstanden over bakken eller havnivå. [Kampreplay](match-replay.md#labels-and-statistics)

**TAS.** Sann luftfart (true airspeed): hvor fort et fly beveger seg gjennom luften. [Kampreplay](match-replay.md#labels-and-statistics)

## Datamaskin {#computer}

**GPU.** Grafikkortet eller brikken. Den tegner bildet og er langt raskere enn hovedprosessoren til å tegne millioner av klatter. [De to backendene](backends.md)

**WebGPU / WebGL2.** De to måtene en nettleser lar en side bruke GPU-en på. WebGPU er nyere. Visningsprogrammet kan bruke begge og velger den beste som nettleseren din støtter. [De to backendene](backends.md)

## Counter-Strike-ord {#counter-strike-words}

**Runde.** Én kort kamp inne i en kamp. Den ene siden vinner den, og poengsummen øker med én.

**Eco, tvungen kjøp, fullt kjøp.** Hvor mye penger en side bruker på våpen i starten av en runde. En eco sparer penger og kjøper nesten ingenting (under $1 500 per spiller i snitt). Et tvungen kjøp bruker det den har (under $4 000). Et fullt kjøp kjøper alt det kan. [Kampanalyse](match-analysis.md)

**Bytte (trade).** Et drap som betaler tilbake et drap: du blir skutt, og en lagkamerat skyter din morder innen 5 sekunder. [Kampanalyse](match-analysis.md)

**KAST.** Andelen runder der en spiller fikk et drap, en assist, overlevde, eller ble byttet. Et høyere tall betyr at spilleren hjalp til i flere runder. [Kampanalyse](match-analysis.md)

**ADR.** Gjennomsnittlig skade per runde: hvor mye helse en spiller tok fra fiender hver runde. [Kampanalyse](match-analysis.md)
