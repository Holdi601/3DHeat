---
title: "Ordliste"
nav_order: 21
lang: "da"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Ordliste

Korte betydninger af de ord, denne side bruger, i almindeligt sprog. Hver post linker til siden, der forklarer den fuldt ud.

## Data {#data}

**Række.** En linje i dine data: én ting, der skete ét sted og på ét tidspunkt, for eksempel "spiller 7 var her ved sekund 12". Viseren tegner hver række. [Dataformater](data-formats.md)

**Kolonne.** En slags værdi i rækkerne, såsom x, y, z, tid eller hold. Viseren gætter, hvilken kolonne der er hvilken, og du kan ændre gætningen. [Kolonneafbildning](column-mapping.md)

**CSV.** En almindelig teksttabel: én række pr. linje, værdier adskilt af kommaer. Næsten alle programmer kan skrive en. [Indlæsning af filer](loading-files.md)

**Parquet.** En kompakt tabelfil, der læses hurtigt, selv med millioner af rækker. Det er det bedste format at give viseren. [Indlæsning af filer](loading-files.md)

**Hændelse.** Noget, der skete, såsom et skud, en træffer, et drab eller en start. En række kan være en hændelse, eller bare "jeg var her". [Filtre](filters.md)

**Person.** Den, der lavede rækkerne: en spiller, en pilot, en bil eller en tank. Én person er én linje af positioner over tid. [Sessioner, personer og grupper](sessions-persons-groups.md)

**Gruppe (hold).** Et sæt personer vist i samme farve, for eksempel Blå og Rød. [Sessioner, personer og grupper](sessions-persons-groups.md)

**Session (kamp, runde).** Ét forløb af spillet. En kamp eller en runde er en session. Viseren kan vise én session eller lægge mange over hinanden. [Sessioner, personer og grupper](sessions-persons-groups.md)

**Bane.** Det 3D-kort, dataene skete på: jord, bygninger, mure. Rækker vises, hvor de skete på banen. [Baner og baggrundsgeometri](levels.md)

## At se på dataene {#looking-at-the-data}

**Varmekort.** Et billede, hvor steder, mange rækker rører, lyser stærkere. Kolde steder er stille, varme steder er travle. [Varme](heat.md)

**Varme.** Hvor meget der skete på et sted. Viseren lægger hver række's glød sammen for hvert sted; summen er varmen. [Varme](heat.md)

**Sprite.** Den lille lysende klat, viseren tegner for én række. Mange overlappende sprites lægges sammen til varme. [Sprite-form](sprite-shape.md)

**Eksponering.** Hvor lyst billedet er. Som et kamera gør for meget eksponering alt hvidt, og for lidt skjuler detaljerne. [Farve og eksponering](colour-and-exposure.md)

**Mætning.** Den mængde varme, der tæller som "så varm som farverne går". Sænk den for at få stille steder frem; hæv den for kun at se det varmeste. [Farve og eksponering](colour-and-exposure.md)

**Volumen.** En boks eller form, du placerer i 3D-visningen. Viseren tæller, hvad der er indeni, og kan sammenligne volumener med hinanden. [Volumener og sammenligning](volumes.md)

**Filter.** En regel, der skjuler rækker, du ikke vil have, for eksempel "kun drab" eller "kun hold Rød". [Filtre](filters.md)

## Replay {#replay}

**Figur.** En lille model af en tank, et fly, en bil eller en soldat, der bevæger sig, hvor dataene siger, den var. [Figurer](figures.md)

**LOD (detaljeniveau).** Hver figur har en detaljeret, en enklere og en meget enkel version. Nære bruger den detaljerede og fjerne den enkle, så tusinder kan tegnes på én gang. [Figurer](figures.md)

## Racing {#racing}

**Omgang.** Én tur rundt på banen, fra startlinjen tilbage til startlinjen. [Indlæsning af omgange](race-loading-laps.md)

**Referenceomgang.** Den omgang, alle de andre sammenlignes med. Forskelle vises som "hurtigere" eller "langsommere" end den. [Indlæsning af omgange](race-loading-laps.md)

**Apex.** Punktet i et sving, hvor bilen er tættest på den indre kant. [Analyse hjørne for hjørne](race-corner-analysis.md)

**Slip.** Hvor meget et dæk glider. Lidt slip giver mest greb; for meget, og bilen udskrider. [Løbsanalyse: metoden](race-analytics.md)

**Kuvert.** Hvad en bil kan i hver hastighed: hvor hårdt den kan dreje, bremse og accelerere, før den glider. [Løbsanalyse: metoden](race-analytics.md)

## Flytal {#aircraft-numbers}

**ALT.** Højde: højden over jorden eller havets overflade. [Kamp-replay](match-replay.md#labels-and-statistics)

**TAS.** Sand lufthastighed: hvor hurtigt et fly bevæger sig gennem luften. [Kamp-replay](match-replay.md#labels-and-statistics)

## Computer {#computer}

**GPU.** Grafikkortet eller -chippen. Den tegner billedet og er langt hurtigere end hovedprocessoren til at tegne millioner af klatter. [De to backends](backends.md)

**WebGPU / WebGL2.** De to måder, en browser lader en side bruge GPU'en på. WebGPU er nyere. Viseren kan bruge begge og vælger den bedste, din browser har. [De to backends](backends.md)

## Counter-Strike-ord {#counter-strike-words}

**Runde.** Ét kort slagsmål inde i en kamp. Den ene side vinder den, og pointtallet går op med en.

**Eco, force buy, full buy.** Hvor mange penge en side bruger på våben i starten af en runde. En eco sparer penge og køber næsten intet (under $1.500 pr. spiller i gennemsnit). Et force buy bruger det, den har (under $4.000). Et full buy køber alt, det kan. [Kampanalyse](match-analysis.md)

**Bytte.** Et drab, der betaler et drab tilbage: du bliver skudt, og en holdkammerat skyder din dræber inden for 5 sekunder. [Kampanalyse](match-analysis.md)

**KAST.** Andelen af runder, hvor en spiller fik et drab, en assist, overlevede eller blev trade'et. Et højere tal betyder, at spilleren hjalp i flere runder. [Kampanalyse](match-analysis.md)

**ADR.** Gennemsnitlig skade pr. runde: hvor meget liv en spiller tog fra fjender hver runde. [Kampanalyse](match-analysis.md)
