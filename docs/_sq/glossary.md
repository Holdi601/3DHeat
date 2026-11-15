---
title: "Fjalor"
nav_order: 21
lang: "sq"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---


# Fjalor

Kuptime të shkurtra të fjalëve që përdor kjo faqe, me gjuhë të thjeshtë. Çdo shënim lidhet me faqen që e shpjegon plotësisht.

## Të dhënat {#data}

**Rresht.** Një rresht i të dhënave të tua: një gjë që ndodhi në një vend dhe kohë, për shembull "lojtari 7 ishte këtu në sekondën 12". Shikuesi vizaton çdo rresht. [Referenca e formateve të të dhënave](data-formats.md)

**Kolonë.** Një lloj vlere në rreshta, si x, y, z, koha ose ekipi. Shikuesi merr me mend cila kolonë është cila, dhe ti mund ta ndryshosh atë supozim. [Përcaktimi i kolonave](column-mapping.md)

**CSV.** Një tabelë tekst e thjeshtë: një rresht për rresht, vlerat ndahen me presje. Pothuajse çdo program mund ta shkruajë një të tillë. [Ngarkimi i skedarëve](loading-files.md)

**Parquet.** Një skedar tabele kompakt që lexohet shpejt, edhe me miliona rreshta. Është formati më i mirë për t'i dhënë shikuesit. [Ngarkimi i skedarëve](loading-files.md)

**Ngjarje.** Diçka që ndodhi, si një të shtënë, një goditje, një vrasje ose një ngritje. Një rresht mund të jetë një ngjarje, ose thjesht "isha këtu". [Filtrat](filters.md)

**Person.** Ai që bëri rreshtat: një lojtar, një pilot, një makinë ose një tank. Një person është një rresht pozicionesh përgjatë kohës. [Seancat, personat dhe grupet](sessions-persons-groups.md)

**Grup (ekip).** Një grup personash të shfaqur me të njëjtën ngjyrë, për shembull Blu dhe E kuqe. [Seancat, personat dhe grupet](sessions-persons-groups.md)

**Seancë (ndeshje, raund).** Një lojë e tërë. Një ndeshje ose një raund është një seancë. Shikuesi mund të shfaqë një seancë ose t'i vendosë shumë mbi njëra-tjetrën. [Seancat, personat dhe grupet](sessions-persons-groups.md)

**Nivel.** Harta 3D ku ndodhi loja: toka, ndërtesat, muret. Rreshtat shfaqen aty ku ndodhën në nivel. [Nivelet dhe gjeometria e sfondit](levels.md)

## Shikimi i të dhënave {#looking-at-the-data}

**Harta e nxehtësisë.** Një imazh ku vendet që prekin shumë rreshta ndriçojnë më nxehtë. Vendet e ftohta janë të qeta, vendet e nxehta janë të zëna. [Nxehtësi](heat.md)

**Nxehtësi.** Sa ndodhi në një pikë. Shikuesi mbledh ndriçimin e çdo rreshti në çdo vend; shuma është nxehtësia. [Nxehtësi](heat.md)

**Sprite.** Pika e vogël e ndritshme që vizaton shikuesi për një rresht. Shumë sprite që mbivendosen mblidhen në nxehtësi. [Forma e sprite-it](sprite-shape.md)

**Ekspozim.** Sa e ndritshme është imazhi. Si te një kamerë, shumë ekspozim e bën gjithçka të bardhë, dhe pak e fsheh detajin. [Ngjyra dhe ekspozimi](colour-and-exposure.md)

**Ngopja.** Sasia e nxehtësisë që llogaritet si "aq e nxehtë sa shkojnë ngjyrat". Ul për të treguar vendet e qeta; ngri për të parë vetëm më të nxehtët. [Ngjyra dhe ekspozimi](colour-and-exposure.md)

**Vëllim.** Një kuti ose formë që vendos në pamjen 3D. Shikuesi numëron çfarë ka brenda dhe mund të krahasojë vëllimet me njëri-tjetrin. [Vëllime dhe krahasimi](volumes.md)

**Filtër.** Një rregull që fsheh rreshtat që nuk do, për shembull "vetëm vrasjet" ose "vetëm ekipi i kuq". [Filtrat](filters.md)

## Riluajtja {#replay}

**Figurë.** Një model i vogël i një tanku, avioni, makine ose ushtari që lëviz aty ku thonë të dhënat që ka qenë. [Figurat](figures.md)

**LOD (niveli i detajit).** Çdo figurë ka një version të detajuar, një më të thjeshtë dhe një shumë të thjeshtë. Ato afër përdorin të detajuarin, ato larg të thjeshtin, kështu që mijëra mund të vizatohen njëherësh. [Figurat](figures.md)

## Garat {#racing}

**Rreth.** Një udhëtim i plotë rreth pistës, nga linja mbrapsht te linja. [Ngarkimi i rrethimeve](race-loading-laps.md)

**Rreth referencë.** Rrethi me të cilin krahasohen të gjithë të tjerët. Diferencat tregohen si "më shpejt" ose "më ngadalë" se ai. [Ngarkimi i rrethimeve](race-loading-laps.md)

**Kulmi.** Pika e një kthese ku makina është më afër skajit të brendshëm. [Analiza kthesë për kthesë](race-corner-analysis.md)

**Rrëshqitje.** Sa rrëshqet një gomë. Pak rrëshqitje jep më shumë aderencë; shumë, dhe makina shkrin. [Analitika e garës: metoda](race-analytics.md)

**Zarfi.** Çfarë mund të bëjë një makinë në çdo shpejtësi: sa fort mund të kthehet, frenojë dhe përshpejtojë para se të rrëshqasë. [Analitika e garës: metoda](race-analytics.md)

## Numrat e avionëve {#aircraft-numbers}

**ALT.** Lartësia: lartësia mbi tokë ose mbi nivelin e detit. [Riluajtja e ndeshjes](match-replay.md#labels-and-statistics)

**TAS.** Shpejtësia e vërtetë ajrore: sa shpejt lëviz një avion nëpër ajër. [Riluajtja e ndeshjes](match-replay.md#labels-and-statistics)

## Kompjuteri {#computer}

**GPU.** Karta ose çipi grafik. Ai vizaton imazhin dhe është shumë më i shpejtë se procesori kryesor për të vizatuar miliona njolla. [Dy backend-et](backends.md)

**WebGPU / WebGL2.** Dy mënyrat me të cilat shfletuesi e lejon një faqe të përdorë GPU-në. WebGPU është më e re. Shikuesi mund të përdorë secilën dhe zgjedh më të mirën që ka shfletuesi yt. [Dy backend-et](backends.md)

## Fjalët e Counter-Strike {#counter-strike-words}

**Raund.** Një luftim i shkurtër brenda një ndeshjeje. Një palë e fiton, dhe rezultati rritet me një.

**Eco, blerje me forcë, blerje e plotë.** Sa para shpenzon një palë për armë në fillim të një raundi. Një eco kursen para dhe blen pothuajse asgjë (nën $1,500 për lojtar në mesatare). Një blerje me forcë shpenzon atë që ka (nën $4,000). Një blerje e plotë blen gjithçka që mundet. [Analiza e ndeshjes (CS2)](match-analysis.md)

**Shkëmbim.** Një vrasje që e shpërblen një vrasje: të qëllojnë ty, dhe një shok ekipi qëllon vrasësin tënd brenda 5 sekondave. [Analiza e ndeshjes (CS2)](match-analysis.md)

**KAST.** Pjesa e raundeve në të cilat një lojtar bëri një vrasje, një asistencë, mbijetoi, ose u shkëmbye. Një numër më i lartë do të thotë që lojtari ndihmoi në më shumë raunde. [Analiza e ndeshjes (CS2)](match-analysis.md)

**ADR.** Dëmi mesatar për raund: sa jetë humbi një lojtar nga armiqtë në çdo raund. [Analiza e ndeshjes (CS2)](match-analysis.md)
