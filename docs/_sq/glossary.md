---
title: "Fjalor"
nav_order: 21
lang: "sq"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Fjalor

Kuptime të shkurtra të fjalëve që përdor ky sajt, me gjuhë të thjeshtë. Çdo hyrje lidhet me faqen që e shpjegon plotësisht.

## Të dhënat {#data}

**Rresht.** Një rresht i të dhënave të tua: një gjë që ndodhi në një vend dhe kohë, për shembull "lojtari 7 ishte këtu në sekondën 12". Shikuesi vizaton çdo rresht. [Formatet e të dhënave](data-formats.md)

**Kolonë.** Një lloj vlere në rreshta, si x, y, z, koha ose ekipi. Shikuesi supozon cila kolonë është cila, dhe ti mund ta ndryshosh supozimin. [Përcaktimi i kolonave](column-mapping.md)

**CSV.** Një tabelë tekst e thjeshtë: një rresht për rresht, vlerat të ndara me presje. Pothuajse çdo program mund të shkruajë një të tillë. [Ngarkimi i skedarëve](loading-files.md)

**Parquet.** Një skedar tabele kompakt që lexohet shpejt, edhe me miliona rreshta. Është formati më i mirë për t'i dhënë shikuesit. [Ngarkimi i skedarëve](loading-files.md)

**Ngjarje.** Diçka që ndodhi, si një e shtënë, një goditje, një vrasje ose një ngritje. Një rresht mund të jetë një ngjarje, ose thjesht "isha këtu". [Filtrat](filters.md)

**Person.** Ai që bëri rreshtat: një lojtar, një pilot, një makinë ose një tank. Një person është një vijë pozicionesh përgjatë kohës. [Seancat, personat dhe grupet](sessions-persons-groups.md)

**Grup (ekip).** Një bashkësi personash të shfaqur me të njëjtën ngjyrë, për shembull Blue dhe Red. [Seancat, personat dhe grupet](sessions-persons-groups.md)

**Seancë (ndeshje, raund).** Një ekzekutim i lojës. Një ndeshje ose një raund është një seancë. Shikuesi mund të shfaqë një seancë ose t'i vendosë shumë njëra mbi tjetrën. [Seancat, personat dhe grupet](sessions-persons-groups.md)

**Nivel.** Harta 3D ku ndodhën të dhënat: toka, ndërtesat, muret. Rreshtat shfaqen aty ku ndodhën në nivel. [Nivelet dhe gjeometria e sfondit](levels.md)

## Shikimi i të dhënave {#looking-at-the-data}

**Harta e nxehtësisë.** Një figurë ku vendet që prekin shumë rreshta shkëlqejnë më nxehtë. Vendet e ftohta janë të qeta, vendet e nxehta janë të zëna. [Nxehtësi](heat.md)

**Nxehtësi.** Sa ndodhi në një vend. Shikuesi mbledh shkëlqimin e çdo rreshti në çdo vend; shuma është nxehtësia. [Nxehtësi](heat.md)

**Sprite.** Njollë e vogël që shkëlqen, që shikuesi e vizaton për një rresht. Shumë sprite që mbivendosen mblidhen në nxehtësi. [Forma e sprite-it](sprite-shape.md)

**Ekspozimi.** Sa e ndritshme është figura. Si te një kamerë, ekspozim i tepërt e bën gjithçka të bardhë, ndërsa ekspozim i pakët fsheh detajet. [Ngjyra dhe ekspozimi](colour-and-exposure.md)

**Ngopja.** Sasia e nxehtësisë që llogaritet si "aq e nxehtë sa shkojnë ngjyrat". Ule që të dalin vende të qeta; ngriti që të shohësh vetëm më të nxehtat. [Ngjyra dhe ekspozimi](colour-and-exposure.md)

**Vëllim.** Një kuti ose formë që vendos në pamjen 3D. Shikuesi numëron çfarë ka brenda dhe mund të krahasojë vëllimet me njëri-tjetrin. [Vëllime dhe krahasimi](volumes.md)

**Filtër.** Një rregull që fsheh rreshta që nuk të duhen, për shembull "vetëm vrasjet" ose "vetëm ekipi Red". [Filtrat](filters.md)

## Riluajtja {#replay}

**Figurë.** Një model i vogël i një tanku, avioni, makine ose ushtari që lëviz aty ku thonë të dhënat se ka qenë. [Figurat](figures.md)

**LOD (nivel detaji).** Çdo figurë ka një version të detajuar, një më të thjeshtë dhe një shumë të thjeshtë. Ato afër përdorin të detajuarin dhe ato larg të thjeshtin, kështu që mijëra mund të vizatohen njëherësh. [Figurat](figures.md)

## Garat {#racing}

**Xhiro.** Një udhëtim rreth pistës, nga vija deri përsëri te vija. [Ngarkimi i xhirove](race-loading-laps.md)

**Xhiro referencë.** Xhiroja me të cilën krahasohen të gjitha të tjerat. Ndryshimet shfaqen si "më shpejt" ose "më ngadalë" se ajo. [Ngarkimi i xhirove](race-loading-laps.md)

**Kulmi i kthesës.** Pika e një kthese ku makina është më afër skajit të brendshëm. [Analiza kthesë për kthesë](race-corner-analysis.md)

**Rrëshqitja.** Sa rrëshqet një gomë. Pak rrëshqitje jep aderencën më të madhe; shumë e bën makinën të rrëshqasë. [Analitika e garës: metoda](race-analytics.md)

**Zarfi.** Çfarë mund të bëjë një makinë në çdo shpejtësi: sa fort mund të kthehet, frenojë dhe përshpejtojë para se të rrëshqasë. [Analitika e garës: metoda](race-analytics.md)

## Numrat e avionëve {#aircraft-numbers}

**ALT.** Lartësia: lartësia mbi tokë ose mbi nivelin e detit. [Riluajtja e ndeshjes](match-replay.md#labels-and-statistics)

**TAS.** Shpejtësia e vërtetë ajrore: sa shpejt lëviz një avion në ajër. [Riluajtja e ndeshjes](match-replay.md#labels-and-statistics)

## Kompjuteri {#computer}

**GPU.** Karta ose çipi grafik. Ai vizaton figurën dhe është shumë më i shpejtë se procesori kryesor për të vizatuar miliona njolla. [Dy backend-et](backends.md)

**WebGPU / WebGL2.** Dy mënyrat me të cilat shfletuesi lejon një faqe të përdorë GPU-në. WebGPU është më i ri. Shikuesi mund të përdorë secilën dhe zgjedh më të mirën që ka shfletuesi yt. [Dy backend-et](backends.md)

## Fjalët e Counter-Strike {#counter-strike-words}

**Raund.** Një luftim i shkurtër brenda një ndeshjeje. Njëra anë e fiton, dhe rezultati rritet me një.

**Eko, blerje e detyruar, blerje e plotë.** Sa para shpenzon një anë për armë në fillim të raundit. Eko kursen para dhe blen pothuajse asgjë (nën $1,500 për lojtar mesatarisht). Blerja e detyruar shpenzon atë që ka (nën $4,000). Blerja e plotë blen gjithçka që mundet. [Analiza e ndeshjes](match-analysis.md)

**Shkëmbim.** Një vrasje që e shlyen një vrasje: të qëllojnë, dhe një shok ekipi ia kthen vrasësit tënd brenda 5 sekondave. [Analiza e ndeshjes](match-analysis.md)

**KAST.** Pjesa e raundeve në të cilat një lojtar bëri një vrasje, një ndihmë, mbijetoi, ose u shkëmbye. Një numër më i lartë do të thotë që lojtari ndihmoi në më shumë raunde. [Analiza e ndeshjes](match-analysis.md)

**ADR.** Dëmi mesatar për raund: sa jetë u hoq një lojtari nga armiqtë në çdo raund. [Analiza e ndeshjes](match-analysis.md)
