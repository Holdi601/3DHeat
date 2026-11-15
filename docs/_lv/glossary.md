---
title: "Glosārijs"
nav_order: 24
lang: "lv"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: false
---

# Glosārijs

Īsas vārdu nozīmes šajā vietnē, vienkārā valodā. Katrs ieraksts saista ar lapu, kas to izskaidro pilnībā.

## Dati {#data}

**Rinda.** Viena jūsu datu līnija: viena lieta, kas notika vienā vietā un laikā, piemēram, "spēlētājs 7 bija šeit sekundē 12". Skatītājs zīmē katru rindu. [Datu formāti](data-formats.md)

**Kolonna.** Viens vērtību veids rindās, piemēram, x, y, z, laiks vai komanda. Skatītājs min, kura kolonna ir kura, un jūs varat minējumu mainīt. [Kolonnu atbilstība](column-mapping.md)

**CSV.** Vienkārša teksta tabula: viena rinda katrā līnijā, vērtības atdalītas ar komatiem. Gandrīz katra programma to var rakstīt. [Failu ielāde](loading-files.md)

**Parquet.** Kompakts tabulas fails, kas ātri nolasāms, pat ar miljoniem rindu. Tas ir labākais formāts skatītājam. [Failu ielāde](loading-files.md)

**Notikums.** Kaut kas, kas notika, piemēram, šāviens, trāpījums, nogalinājums vai pacelšanās. Rinda var būt notikums vai vienkārši "es biju šeit". [Filtri](filters.md)

**Persona.** Tas, kas radīja rindas: spēlētājs, pilots, automašīna vai tanks. Viena persona ir viena pozīciju līnija laikā. [Sesijas, personas un grupas](sessions-persons-groups.md)

**Grupa (komanda).** Personu kopa, kas rādīta vienā krāsā, piemēram, Blue un Red. [Sesijas, personas un grupas](sessions-persons-groups.md)

**Sesija (spēle, raunds).** Viens spēles brauciens. Spēle vai raunds ir sesija. Skatītājs var rādīt vienu sesiju vai uzlikt daudzas viena uz otras. [Sesijas, personas un grupas](sessions-persons-groups.md)

**Līmenis.** 3D karte, kurā notika dati: zeme, ēkas, sienas. Rindas parādās tur, kur tās notika uz līmeņa. [Līmeņi un fona ģeometrija](levels.md)

## Datu skatīšana {#looking-at-the-data}

**Siltumkarte.** Attēls, kur vietas, kuras aptver daudzas rindas, spīd karstākas. Aukstas vietas ir klusas, karstas - aktīvas. [Siltums](heat.md)

**Siltums.** Cik daudz kas notika vienā vietā. Skatītājs saskaita katras rindas spīdumu katrā vietā; summa ir siltums. [Siltums](heat.md)

**Sprite.** Mazais spīdošais plankums, ko skatītājs zīmē vienai rindai. Daudzi pārklājoši sprite saskaitās siltumā. [Sprite forma](sprite-shape.md)

**Ekspozīcija.** Cik spilgts ir attēls. Kā kamerā, pārāk liela ekspozīcija visu padara baltu, bet pārāk maza paslēpj detaļas. [Krāsa un ekspozīcija](colour-and-exposure.md)

**Piesātinājums.** Siltuma daudzums, kas skaitās kā "tik karsts, cik krāsas ļauj". Samaziniet to, lai parādītu klusas vietas; palieliniet, lai redzētu tikai karstākās. [Krāsa un ekspozīcija](colour-and-exposure.md)

**Tilpums.** Kaste vai forma, ko novietojat 3D skatā. Skatītājs saskaita, kas tajā ir, un var salīdzināt tilpumus savā starpā. [Tilpumi un salīdzināšana](volumes.md)

**Filtrs.** Noteikums, kas paslēpj nevēlamās rindas, piemēram, "tikai nogalinājumi" vai "tikai komanda Red". [Filtri](filters.md)

## Atkārtojums {#replay}

**Figūra.** Neliels tanka, lidmašīnas, automašīnas vai karavīra modelis, kas kustas tur, kur dati saka, ka tas bija. [Figūras](figures.md)

**LOD (detalizācijas līmenis).** Katrai figūrai ir detalizēta, vienkāršāka un ļoti vienkārša versija. Tuvās izmanto detalizēto, tālās - vienkāršo, tāpēc var zīmēt tūkstošus uzreiz. [Figūras](figures.md)

## Sacīkstes {#racing}

**Aplis.** Viens brauciens pa trasi, no starta līnijas atpakaļ līdz tai. [Apļu ielāde](race-loading-laps.md)

**Atsauces aplis.** Aplis, ar kuru salīdzina visus pārējos. Starpības rāda kā "ātrāk" vai "lēnāk" nekā tas. [Apļu ielāde](race-loading-laps.md)

**Apex.** Līkuma punkts, kur automašīna ir vistuvāk iekšējai malai. [Līkums pa līkumam analīze](race-corner-analysis.md)

**Slīdēšana.** Cik daudz riepa slīd. Neliela slīdēšana dod vislielāko saķeri; pārāk liela - automašīna slīd. [Sacīkšu analītika: metode](race-analytics.md)

**Apvalks.** Ko automašīna var katrā ātrumā: cik stipri tā var pagriezties, bremzēt un paātrināties, pirms tā slīd. [Sacīkšu analītika: metode](race-analytics.md)

## Lidmašīnu skaitļi {#aircraft-numbers}

**ALT.** Augstums: augstums virs zemes vai jūras līmeņa. [Spēles atkārtojums](match-replay.md#labels-and-statistics)

**TAS.** Patiesais gaisa ātrums: cik ātri lidmašīna pārvietojas gaisā. [Spēles atkārtojums](match-replay.md#labels-and-statistics)

## Dators {#computer}

**GPU.** Grafikas karte vai mikroshēma. Tā zīmē attēlu un ir daudz ātrāka par galveno procesoru, zīmējot miljonus plankumu. [Abas renderēšanas metodes](backends.md)

**WebGPU / WebGL2.** Divi veidi, kā pārlūks ļauj lapai izmantot GPU. WebGPU ir jaunāks. Skatītājs var izmantot jebkuru un izvēlas labāko, ko jūsu pārlūks piedāvā. [Abas renderēšanas metodes](backends.md)

## Counter-Strike vārdi {#counter-strike-words}

**Raunds.** Viena īsa cīņa spēles ietvaros. Viena puse to uzvar, un rezultāts pieaug par vienu.

**Eco, force buy, full buy.** Cik naudas puse tērē ieročiem raunda sākumā. Eco taupa naudu un nopērk gandrīz neko (vidēji zem 1500 $ uz spēlētāju). Force buy tērē, kas ir (zem 4000 $). Full buy nopērk visu, ko var. [Spēles analīze](match-analysis.md)

**Apmaiņa.** Nogalinājums, kas atmaksā nogalinājumu: jūs tiekat nošauts, un komandas biedrs nošauj jūsu slepkavu 5 sekunžu laikā. [Spēles analīze](match-analysis.md)

**KAST.** Tās raundu daļa, kuros spēlētājs dabūja nogalinājumu, palīdzību, izdzīvoja vai tika apmainīts. Lielāks skaitlis nozīmē, ka spēlētājs palīdzēja vairākos raundos. [Spēles analīze](match-analysis.md)

**ADR.** Vidējie bojājumi uz raundu: cik veselības spēlētājs zaudēja no ienaidniekiem katrā raundā. [Spēles analīze](match-analysis.md)
