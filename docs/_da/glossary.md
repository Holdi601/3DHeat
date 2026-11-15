---
title: "Ordliste"
nav_order: 21
lang: "da"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Ordliste

Korte betydninger af de ord, dette websted bruger, i almindeligt sprog. Hvert punkt linker til siden, der forklarer det fuldt ud.

## Data {#data}

**Række.** En linje i dine data: én ting, der skete ét sted og ét tidspunkt, for eksempel "spiller 7 var her ved sekund 12". Vieweren tegner hver række. [Dataformater](data-formats.md)

**Kolonne.** En slags værdi i rækkerne, for eksempel x, y, z, tid eller hold. Vieweren gætter, hvilken kolonne der er hvilken, og du kan ændre gætteriet. [Kolonnetilknytning](column-mapping.md)

**CSV.** En almindelig teksttabel: én række pr. linje, værdierne adskilt af kommaer. Næsten ethvert program kan skrive en. [Indlæsning af filer](loading-files.md)

**Parquet.** En kompakt tabelfil, der er hurtig at læse, selv med millioner af rækker. Det er det bedste format at give vieweren. [Indlæsning af filer](loading-files.md)

**Hændelse.** Noget, der skete, for eksempel et skud, en træf, et drab eller en start. En række kan være en hændelse, eller blot "jeg var her". [Filtre](filters.md)

**Person.** Den, der lavede rækkerne: en spiller, en pilot, en bil eller en stridsvogn. En person er én linje af positioner gennem tiden. [Sessioner, personer og grupper](sessions-persons-groups.md)

**Gruppe (hold).** Et sæt personer vist i samme farve, for eksempel Blue og Red. [Sessioner, personer og grupper](sessions-persons-groups.md)

**Session (kamp, runde).** Én kørsel af spillet. En kamp eller en runde er en session. Vieweren kan vise én session eller lægge mange over hinanden. [Sessioner, personer og grupper](sessions-persons-groups.md)

**Bane.** Det 3D-kort, dataene skete på: jord, bygninger, mure. Rækker vises, hvor de skete på banen. [Baner og baggrundsgeometri](levels.md)

## At kigge på dataene {#looking-at-the-data}

**Heatmap.** Et billede, hvor steder, mange rækker rører ved, lyser stærkere. Kolde steder er stille, varme steder er travle. [Varme](heat.md)

**Varme.** Hvor meget der skete på et sted. Vieweren lægger hver rækkes glød sammen for hvert sted; summen er varmen. [Varme](heat.md)

**Sprite.** Den lille lysende plet, vieweren tegner for én række. Mange overlappende sprites lægges sammen til varme. [Spriteform](sprite-shape.md)

**Eksponering.** Hvor lyst billedet er. Ligesom et kamera: for meget eksponering gør alt hvidt, og for lidt skjuler detaljerne. [Farve og eksponering](colour-and-exposure.md)

**Mætning.** Den mængde varme, der tæller som "så varm, farverne rækker". Sænk den for at få stille steder til at vise sig; hæv den for kun at se de varmeste. [Farve og eksponering](colour-and-exposure.md)

**Volumen.** En boks eller form, du placerer i 3D-visningen. Vieweren tæller, hvad der er indeni, og kan sammenligne volumener med hinanden. [Volumener og sammenligning](volumes.md)

**Filter.** En regel, der skjuler rækker, du ikke ønsker, for eksempel "kun drab" eller "kun hold Red". [Filtre](filters.md)

## Replay {#replay}

**Figur.** En lille model af en stridsvogn, et fly, en bil eller en soldat, der bevæger sig, hvor dataene siger, den var. [Figurer](figures.md)

**LOD (detaljeniveau).** Hver figur har en detaljeret, en enklere og en meget enkel version. Nære figurer bruger den detaljerede, fjerne den enkle, så tusindvis kan tegnes på én gang. [Figurer](figures.md)

## Racerspil {#racing}

**Omgang.** Én tur rundt om banen, fra startlinjen tilbage til startlinjen. [Indlæsning af omgange](race-loading-laps.md)

**Referenceomgang.** Den omgang, alle de andre sammenlignes med. Forskelle vises som "hurtigere" eller "langsommere" end den. [Indlæsning af omgange](race-loading-laps.md)

**Apex.** Punktet i et sving, hvor bilen er tættest på den indvendige kant. [Analyse sving for sving](race-corner-analysis.md)

**Glid.** Hvor meget et dæk glider. Lidt glid giver mest greb; for meget, og bilen slipper. [Løbsanalyse: metoden](race-analytics.md)

**Hylster.** Hvad en bil kan ved hver fart: hvor hårdt den kan dreje, bremse og accelerere, før den glider. [Løbsanalyse: metoden](race-analytics.md)

## Flytal {#aircraft-numbers}

**ALT.** Højde: afstanden over jorden eller havets overflade. [Kamp-replay](match-replay.md#labels-and-statistics)

**TAS.** Sand lufthastighed: hvor hurtigt et fly bevæger sig gennem luften. [Kamp-replay](match-replay.md#labels-and-statistics)

## Computer {#computer}

**GPU.** Grafikkortet eller -chippen. Den tegner billedet og er langt hurtigere end hovedprocessoren til at tegne millioner af klatter. [De to backends](backends.md)

**WebGPU / WebGL2.** De to måder, en browser lader en side bruge GPU'en på. WebGPU er nyere. Vieweren kan bruge begge og vælger den bedste, din browser har. [De to backends](backends.md)

## Counter-Strike-ord {#counter-strike-words}

**Runde.** En kort kamp inden for en kamp. Den ene side vinder den, og pointtallet stiger med én.

**Eco, tvangskøb, fuldt køb.** Hvor mange penge en side bruger på våben i starten af en runde. Et eco sparer penge og køber næsten intet (under $1.500 pr. spiller i gennemsnit). Et tvangskøb bruger det, der er (under $4.000). Et fuldt køb køber alt, det kan. [Kampanalyse](match-analysis.md)

**Byttehandel.** Et drab, der betaler et drab tilbage: du bliver skudt, og en holdkammerat skyder din dræber inden for 5 sekunder. [Kampanalyse](match-analysis.md)

**KAST.** Andelen af runder, hvor en spiller fik et drab, en assist, overlevede eller blev byttet. Et højere tal betyder, at spilleren hjalp i flere runder. [Kampanalyse](match-analysis.md)

**ADR.** Gennemsnitlig skade pr. runde: hvor meget liv en spiller tog fra fjender hver runde. [Kampanalyse](match-analysis.md)
