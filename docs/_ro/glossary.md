---
title: "Glosar"
nav_order: 24
lang: "ro"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: false
---

# Glosar

Înțelesul scurt al cuvintelor pe care le folosește acest site, în limbaj simplu. Fiecare intrare trimite la pagina care o explică pe deplin.

## Date {#data}

**Rând.** O linie din datele tale: un lucru care s-a întâmplat într-un loc și la un moment dat, de exemplu „jucătorul 7 era aici la secunda 12”. Vizualizatorul desenează fiecare rând. [Formatele de date](data-formats.md)

**Coloană.** Un fel de valoare din rânduri, cum ar fi x, y, z, timp sau echipă. Vizualizatorul ghicește care coloană este care, iar tu poți schimba presupunerea. [Maparea coloanelor](column-mapping.md)

**CSV.** Un tabel simplu în text: un rând pe linie, valori separate prin virgule. Aproape orice program poate scrie unul. [Încărcarea fișierelor](loading-files.md)

**Parquet.** Un fișier-tabel compact, care se citește repede, chiar și cu milioane de rânduri. Este cel mai bun format pe care îl poți da vizualizatorului. [Încărcarea fișierelor](loading-files.md)

**Eveniment.** Ceva care s-a întâmplat, cum ar fi un foc, o lovitură, o eliminare sau o decolare. Un rând poate fi un eveniment sau doar „eram aici”. [Filtre](filters.md)

**Persoană.** Cel care a produs rândurile: un jucător, un pilot, o mașină sau un tanc. O persoană este o linie de poziții în timp. [Sesiuni, persoane și grupuri](sessions-persons-groups.md)

**Grup (echipă).** Un set de persoane arătate în aceeași culoare, de exemplu Blue și Red. [Sesiuni, persoane și grupuri](sessions-persons-groups.md)

**Sesiune (meci, rundă).** O rulare a jocului. Un meci sau o rundă este o sesiune. Vizualizatorul poate arăta o sesiune sau le poate suprapune pe multe. [Sesiuni, persoane și grupuri](sessions-persons-groups.md)

**Nivel.** Harta 3D pe care s-au petrecut datele: sol, clădiri, ziduri. Rândurile apar acolo unde s-au întâmplat, pe nivel. [Niveluri și geometria fundalului](levels.md)

## Privind datele {#looking-at-the-data}

**Hartă termică.** O imagine în care locurile atinse de multe rânduri strălucesc mai tare. Locurile reci sunt liniștite, cele fierbinți sunt aglomerate. [Căldură](heat.md)

**Căldură.** Cât s-a întâmplat într-un loc. Vizualizatorul adună strălucirea fiecărui rând în fiecare loc; suma este căldura. [Căldură](heat.md)

**Sprite.** Mica pată strălucitoare pe care o desenează vizualizatorul pentru un rând. Multe sprite-uri care se suprapun se adună în căldură. [Forma sprite-ului](sprite-shape.md)

**Expunere.** Cât de luminoasă este imaginea. Ca la o cameră, prea multă expunere face totul alb, iar prea puțină ascunde detaliile. [Culoare și expunere](colour-and-exposure.md)

**Saturație.** Cantitatea de căldură care contează ca „atât de fierbinte cât pot arăta culorile”. Scade-o ca să se vadă locurile liniștite; ridică-o ca să vezi doar cele mai fierbinți. [Culoare și expunere](colour-and-exposure.md)

**Volum.** O cutie sau o formă pe care o pui în vizualizarea 3D. Vizualizatorul numără ce este înăuntru și poate compara volumele între ele. [Volume și comparație](volumes.md)

**Filtru.** O regulă care ascunde rândurile pe care nu le vrei, de exemplu „doar eliminări” sau „doar echipa Red”. [Filtre](filters.md)

## Reluare {#replay}

**Figură.** Un mic model al unui tanc, avion, mașină sau soldat, care se mișcă acolo unde spun datele că a fost. [Figuri](figures.md)

**LOD (nivel de detaliu).** Fiecare figură are o versiune detaliată, una mai simplă și una foarte simplă. Cele apropiate folosesc versiunea detaliată, cele îndepărtate pe cea simplă, astfel că mii pot fi desenate deodată. [Figuri](figures.md)

## Curse {#racing}

**Tur.** O tură completă a traseului, de la linia de start înapoi la linie. [Încărcarea turelor](race-loading-laps.md)

**Tur de referință.** Turul cu care sunt comparate toate celelalte. Diferențele se arată ca „mai rapid” sau „mai lent” decât el. [Încărcarea turelor](race-loading-laps.md)

**Apex.** Punctul unui viraj în care mașina este cel mai aproape de marginea interioară. [Analiza curbă cu curbă](race-corner-analysis.md)

**Alunecare.** Cât alunecă o anvelopă. Puțină alunecare dă cea mai mare aderență; prea multă și mașina derapează. [Analiza de cursă: metoda](race-analytics.md)

**Înveliș de performanță.** Ce poate face o mașină la fiecare viteză: cât de tare poate vira, frâna și accelera înainte să alunece. [Analiza de cursă: metoda](race-analytics.md)

## Cifre de aviație {#aircraft-numbers}

**ALT.** Altitudinea: înălțimea deasupra solului sau a nivelului mării. [Reluarea meciului](match-replay.md#labels-and-statistics)

**TAS.** Viteza reală față de aer: cât de repede se mișcă un avion prin aer. [Reluarea meciului](match-replay.md#labels-and-statistics)

## Calculator {#computer}

**GPU.** Placa sau cipul grafic. Desenează imaginea și este mult mai rapid decât procesorul principal la desenarea a milioane de pete. [Cele două backend-uri](backends.md)

**WebGPU / WebGL2.** Cele două moduri prin care un browser lasă o pagină să folosească GPU-ul. WebGPU este mai nou. Vizualizatorul le poate folosi pe oricare și alege cea mai bună pe care o are browserul tău. [Cele două backend-uri](backends.md)

## Cuvinte din Counter-Strike {#counter-strike-words}

**Rundă.** O luptă scurtă în interiorul unui meci. O parte o câștigă, iar scorul crește cu unu.

**Eco, cumpărare forțată, cumpărare completă.** Cât de mulți bani cheltuie o parte pe arme la începutul unei runde. Un eco economisește și cumpără aproape nimic (sub 1.500 $ per jucător, în medie). O cumpărare forțată cheltuie tot ce are (sub 4.000 $). O cumpărare completă cumpără tot ce poate. [Analiza meciului](match-analysis.md)

**Schimb.** O eliminare care plătește o eliminare: ești împușcat, iar un coechipier îl împușcă pe ucigașul tău în 5 secunde. [Analiza meciului](match-analysis.md)

**KAST.** Ponderea rundelor în care un jucător a făcut o eliminare, o asistență, a supraviețuit sau a fost răzbunat. Un număr mai mare înseamnă că jucătorul a ajutat în mai multe runde. [Analiza meciului](match-analysis.md)

**ADR.** Daunele medii pe rundă: cât de multă viață a luat un jucător de la inamici în fiecare rundă. [Analiza meciului](match-analysis.md)
