---
title: "Glossarju"
nav_order: 21
lang: "mt"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Glossarju

Tifsiriet qosor tal-kliem li dan is-sit juża, b'lingwa sempliċi. Kull dħul jorbot mal-paġna li tispjegha b'mod sħiħ.

## Data {#data}

**Ringiela (row).** Linja waħda tad-data tiegħek: ħaġa waħda li ġrat f'post u ħin wieħed, pereżempju "il-plejer 7 kien hawn fit-tieni 12". Il-viewer jpinġi kull ringiela. [Formati tad-data](data-formats.md)

**Kolonna (column).** Tip wieħed ta' valur fir-ringieli, bħal x, y, z, ħin jew tim. Il-viewer jaħseb liema kolonna hi liema, u tista' tibdel it-tbassir. [Immappjar tal-kolonni](column-mapping.md)

**CSV.** Tabella tal-kliem sempliċi: ringiela waħda f'kull linja, il-valuri separati bil-virgoli. Kważi kull programm jista' jikteb waħda. [Tagħbija tal-fajls](loading-files.md)

**Parquet.** Fajl tabella kompatt li jinqara malajr, anke b'miljuni ta' ringieli. Hu l-format l-aħjar biex tagħti lill-viewer. [Tagħbija tal-fajls](loading-files.md)

**Avveniment (event).** Xi ħaġa li ġrat, bħal tir, laqta, qtil jew tlugħ. Ringiela tista' tkun avveniment, jew sempliċement "jien kont hawn". [Filtri](filters.md)

**Persuna (person).** Min għamel ir-ringieli: plejer, pilota, karozza jew tank. Persuna waħda hi linja waħda ta' pożizzjonijiet maż-żmien. [Sessjonijiet, persuni u gruppi](sessions-persons-groups.md)

**Grupp (tim).** Sett ta' persuni muri bl-istess kulur, pereżempju Blue u Red. [Sessjonijiet, persuni u gruppi](sessions-persons-groups.md)

**Sessjoni (partita, rawnd).** Tmexxija waħda tal-logħba. Partita jew rawnd hija sessjoni. Il-viewer jista' juri sessjoni waħda jew iqiegħed ħafna fuq xulxin. [Sessjonijiet, persuni u gruppi](sessions-persons-groups.md)

**Livell.** Il-mappa 3D fejn ġrat id-data: l-art, il-bini, il-ħitan. Ringieli jidhru fejn ġraw fuq il-livell. [Livelli u ġeometrija tal-isfond](levels.md)

## Ħares lejn id-data {#looking-at-the-data}

**Heatmap.** Ritratt fejn l-postijiet li ħafna ringieli jilmsu jiddu iktar. Postijiet kiesħa huma kwieti, postijiet sħan huma mxgħula. [Sħana](heat.md)

**Sħana (heat).** Kemm ġara f'post. Il-viewer iżid id-dawl ta' kull ringiela f'kull post; is-somma hi s-sħana. [Sħana](heat.md)

**Sprite.** Il-biċċa dawl ċkejkna li l-viewer jpinġi għal ringiela waħda. Ħafna sprites li jaqgħu fuq xulxin jiżdiedu flimkien f'sħana. [Forma tal-isprite](sprite-shape.md)

**Esponiment (exposure).** Kemm hu ċar ir-ritratt. Bħal kamera, esponiment wisq iħalli kollox abjad u ftit wisq jaħbi d-dettall. [Kulur u esponiment](colour-and-exposure.md)

**Saturazzjoni (saturation).** Kemm sħana tgħodd bħala "sħun daqs kemm jaslu l-kuluri". Naqqasha biex tagħmel postijiet kwieti jidhru; għollihom biex tara biss l-iktar sħan. [Kulur u esponiment](colour-and-exposure.md)

**Volum.** Kaxxa jew forma li tpoġġi fil-veduta 3D. Il-viewer jgħodd dak li hemm ġewwa, u jista' jqabbel volumi ma' xulxin. [Volumi u tqabbil](volumes.md)

**Filtru (filter).** Regola li taħbi ringieli li ma tridx, pereżempju "biss qtil" jew "biss it-tim Red". [Filtri](filters.md)

## Replay {#replay}

**Figura (figure).** Mudell ċkejken ta' tank, inġenju, karozza jew suldat li jimxi fejn jgħid id-data li kien. [Figuri](figures.md)

**LOD (level of detail).** Kull figura għandha verżjoni dettaljata, waħda iktar sempliċi u waħda sempliċi ħafna. Dawk viċin jużaw dik dettaljata u dawk 'il bogħod dik sempliċi, sabiex jinżlu eluf f'daqqa. [Figuri](figures.md)

## Tellieqa {#racing}

**Ġiro (lap).** Vjaġġ wieħed madwar il-kors, mil-linja lura għall-linja. [Tagħbija tal-ġirjiet](race-loading-laps.md)

**Ġiro ta' referenza (reference lap).** Il-ġiro li l-oħrajn kollha jitqabblu miegħu. Id-differenzi jintwerew bħala "iktar mgħaġġel" jew "iktar bil-mod" minnu. [Tagħbija tal-ġirjiet](race-loading-laps.md)

**Apex.** Il-punt ta' kantuniera fejn il-karozza tkun l-iktar qrib it-truf ta' ġewwa. [Analiżi kantunata b'kantunata](race-corner-analysis.md)

**Slip.** Kemm ir-roti jiżilqu. Ftit slip jagħti l-aktar grip; wisq u l-karozza tiżlaq. [Analitika tat-tellieqa: il-metodu](race-analytics.md)

**Envelope.** Dak li karozza tista' tagħmel f'kull veloċità: kemm tista' tduri, tibreġ u taċċellera qabel ma tiżlaq. [Analitika tat-tellieqa: il-metodu](race-analytics.md)

## Numri tal-inġenji {#aircraft-numbers}

**ALT.** Għoli: l-altezza 'il fuq mill-art jew mil-livell tal-baħar. [Replay tal-partita](match-replay.md#labels-and-statistics)

**TAS.** Veloċità vera fl-arja: kemm malajr tiċċaqlaq ajruplan fl-arja. [Replay tal-partita](match-replay.md#labels-and-statistics)

## Kompjuter {#computer}

**GPU.** Il-kard jew iċ-ċippa grafika. Hija tpinġi l-istampa u hija ferm iktar mgħaġġla mill-proċessur ewlieni biex tpinġi eluf ta' dwal. [Iż-żewġ backends](backends.md)

**WebGPU / WebGL2.** Iż-żewġ modi li bihom browser jħalli paġna tuża l-GPU. WebGPU hija iktar ġdida. Il-viewer jista' juża kwalunkwe waħda u jagħżel l-aħjar waħda li l-browser tiegħek għandu. [Iż-żewġ backends](backends.md)

## Kliem ta' Counter-Strike {#counter-strike-words}

**Rawnd (round).** Ġlieda qasira waħda ġewwa partita. Naħa waħda tirbaħha, u l-punteġġ jitla' b'wieħed.

**Eco, force buy, full buy.** Kemm flus tonfoq naħa fuq l-armi fil-bidu ta' rawnd. Eco jiffranka l-flus u jixtri kważi xejn (inqas minn $1,500 għal kull plejer f'medja). Force buy jonfoq dak li għandu (inqas minn $4,000). Full buy jixtri dak kollu li jista'. [Analiżi tal-partita](match-analysis.md)

**Trade.** Qtil li jħallas lura qtil: tintlaqat, u sieħeb tiegħek jolqot lil min qatlek fi żmien 5 sekondi. [Analiżi tal-partita](match-analysis.md)

**KAST.** Is-sehem tar-rawnds li fihom plejer ikseb qtil, assist, baqa' ħaj, jew kien trade. Numru ogħla jfisser li l-plejer għen f'iktar rawnds. [Analiżi tal-partita](match-analysis.md)

**ADR.** Medja tad-dannu għal kull rawnd: kemm saħħa neħħa plejer mill-għedewwa kull rawnd. [Analiżi tal-partita](match-analysis.md)
