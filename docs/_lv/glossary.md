---
title: "Glosārijs"
nav_order: 21
lang: "lv"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Glosārijs

Īsas vārdu nozīmes, ko šī vietne lieto vienkāršā valodā. Katrs ieraksts saista uz lapu, kas to izskaidro pilnībā.

## Dati {#data}

**Rinda.** Viena datu rinda: viena lieta, kas notika vienā vietā un laikā, piemēram, "spēlētājs 7 bija šeit sekundē 12". Skatītājs zīmē katru rindu. [Datu formāti](data-formats.md)

**Kolonna.** Viens vērtību veids rindās, piemēram, x, y, z, laiks vai komanda. Skatītājs min, kura kolonna ir kura, un minējumu vari mainīt. [Kolonnu atbilstība](column-mapping.md)

**CSV.** Vienkārša teksta tabula: viena rinda katrā līnijā, vērtības atdalītas ar komatiem. Gandrīz katra programma var to rakstīt. [Failu ielāde](loading-files.md)

**Parquet.** Kompakts tabulas fails, ko ātri nolasīt pat ar miljoniem rindu. Tas ir labākais formāts, ko dot skatītājam. [Failu ielāde](loading-files.md)

**Notikums.** Kaut kas, kas notika, piemēram, šāviens, trāpījums, nogalinājums vai pacelšanās. Rinda var būt notikums vai vienkārši "es biju šeit". [Filtri](filters.md)

**Persona.** Tas, kas radīja rindas: spēlētājs, pilots, automašīna vai tanks. Viena persona ir viena pozīciju līnija laikā. [Sesijas, personas un grupas](sessions-persons-groups.md)

**Grupa (komanda).** Personu kopa, kas rādīta vienā krāsā, piemēram, Zilie un Sarkanie. [Sesijas, personas un grupas](sessions-persons-groups.md)

**Sesija (mačs, raunds).** Viens spēles skrējiens. Mačs vai raunds ir sesija. Skatītājs var rādīt vienu sesiju vai novietot daudzas viena virs otras. [Sesijas, personas un grupas](sessions-persons-groups.md)

**Līmenis.** 3D karte, kurā notika dati: zeme, ēkas, sienas. Rindas parādās tur, kur tās notika uz līmeņa. [Līmeņi un fona ģeometrija](levels.md)

## Datu skatīšana {#looking-at-the-data}

**Siltumkarte.** Attēls, kurā vietas, ko skar daudzas rindas, spīd karstāk. Aukstas vietas ir klusas, karstas vietas ir aktīvas. [Siltums](heat.md)

**Siltums.** Cik daudz kaut kas notika vietā. Skatītājs saskaita katras rindas spīdumu katrā vietā; summa ir siltums. [Siltums](heat.md)

**Spraits.** Mazais spīdošais plankums, ko skatītājs zīmē vienai rindai. Daudzi pārklājušies spraiti saskaitās siltumā. [Sprite forma](sprite-shape.md)

**Ekspozīcija.** Cik spilgts ir attēls. Kā kamerai — pārāk liela ekspozīcija visu padara baltu, pārāk maza paslēpj detaļas. [Krāsa un ekspozīcija](colour-and-exposure.md)

**Piesātinājums.** Siltuma daudzums, kas skaitās kā "tikpat karsts, cik krāsas iet". Samazini, lai parādītu klusas vietas; paaugstini, lai redzētu tikai karstākās. [Krāsa un ekspozīcija](colour-and-exposure.md)

**Tilpums.** Kaste vai forma, ko novieto 3D skatā. Skatītājs skaita, kas tajā ir, un var salīdzināt tilpumus savā starpā. [Tilpumi un salīdzināšana](volumes.md)

**Filtrs.** Noteikums, kas paslēpj rindas, kuras tu nevēlies, piemēram, "tikai nogalinājumi" vai "tikai komanda Sarkanie". [Filtri](filters.md)

## Atskaņojums {#replay}

**Figūra.** Maza tanka, lidmašīnas, automašīnas vai karavīra modelis, kas kustas tur, kur dati saka, ka tas bija. [Figūras](figures.md)

**LOD (detalizācijas līmenis).** Katrai figūrai ir detalizēta, vienkāršāka un ļoti vienkārša versija. Tuvās izmanto detalizēto, tālās — vienkāršo, tāpēc var zīmēt tūkstošus uzreiz. [Figūras](figures.md)

## Sacīkstes {#racing}

**Aplis.** Viens brauciens apkārt trasei, no starta līnijas atpakaļ līdz starta līnijai. [Apļu ielāde](race-loading-laps.md)

**Atsauces aplis.** Aplis, ar kuru salīdzina visus pārējos. Atšķirības rāda kā "ātrāk" vai "lēnāk" nekā tas. [Apļu ielāde](race-loading-laps.md)

**Apeks.** Līkuma punkts, kur automašīna ir vistuvāk iekšējai malai. [Līkumu pa līkumam analīze](race-corner-analysis.md)

**Slīdējums.** Cik ļoti riepa slīd. Neliels slīdējums dod visvairāk sķiteni; par daudz — automašīna slīd. [Sacīkšu analītika: metode](race-analytics.md)

**Aploksne.** Ko automašīna var katrā ātrumā: cik stipri tā var pagriezties, bremzēt un paātrināties, pirms tā slīd. [Sacīkšu analītika: metode](race-analytics.md)

## Lidaparātu skaitļi {#aircraft-numbers}

**ALT.** Augstums: augstums virs zemes vai jūras līmeņa. [Spēles atkārtojums](match-replay.md#labels-and-statistics)

**TAS.** Patiesais gaisa ātrums: cik ātri lidmašīna pārvietojas caur gaisu. [Spēles atkārtojums](match-replay.md#labels-and-statistics)

## Dators {#computer}

**GPU.** Grafikas karte vai mikroshēma. Tā zīmē attēlu un ir daudz ātrāka par galveno procesoru, zīmējot miljonus plankumu. [Abas renderēšanas metodes](backends.md)

**WebGPU / WebGL2.** Divi veidi, kā pārlūks ļauj lapai izmantot GPU. WebGPU ir jaunāks. Skatītājs var izmantot abus un izvēlas labāko, ko tavs pārlūks atbalsta. [Abas renderēšanas metodes](backends.md)

## Counter-Strike vārdi {#counter-strike-words}

**Raunds.** Viena īsa cīņa mačā. Viena puse to uzvar, un rezultāts paaugstinās par vienu.

**Eko, spēka pirkums, pilns pirkums.** Cik naudas puse iztērē ieročiem raunda sākumā. Eko taupa naudu un nopērk gandrīz neko (vidēji zem 1500 $ uz spēlētāju). Spēka pirkums iztērē, ko tam ir (zem 4000 $). Pilns pirkums nopērk visu, ko var. [Spēles analīze](match-analysis.md)

**Apmaiņa.** Nogalinājums, kas atmaksā nogalinājumu: tevi nošauj, un komandas biedrs nošauj tavu slepkavu 5 sekunžu laikā. [Spēles analīze](match-analysis.md)

**KAST.** Raundu daļa, kurā spēlētājs guva nogalinājumu, palīdzību, izdzīvoja vai tika apmainīts. Lielāks skaitlis nozīmē, ka spēlētājs palīdzēja vairākos raundos. [Spēles analīze](match-analysis.md)

**ADR.** Vidējais bojājums uz raundu: cik veselības spēlētājs zaudēja no ienaidniekiem katrā raundā. [Spēles analīze](match-analysis.md)
