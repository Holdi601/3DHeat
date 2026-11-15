---
title: "Glossarju"
nav_order: 21
lang: "mt"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Glossarju

Tifsiriet qosra tal-kliem li dan is-sit juża, b'lingwa sempliċi. Kull dħul jorbot mal-paġna li tispjegh bis-sħiħ.

## Dejta {#data}

**Ringiela.** Linja waħda tad-dejta tiegħek: ħaġa waħda li ġrat f'post u ħin wieħed, pereżempju "plejer 7 kien hawn fit-tieni 12". Il-viewer jiġbed kull ringiela. [Formati tad-dejta](data-formats.md)

**Kolonna.** Tip wieħed ta' valur fir-ringieli, bħal x, y, z, ħin jew timijiet. Il-viewer jaħseb liema kolonna hi liema, u tista' tbiddel l-idea. [Mappa tal-kolonni](column-mapping.md)

**CSV.** Tabella ta' test sempliċi: ringiela waħda f'kull linja, valuri mifruda b'virgoli. Kważi kull programm jista' jikteb wahda. [Tagħbija ta' fajls](loading-files.md)

**Parquet.** Fajl tabella kompatt li jinqara malajr, anki b'miljuni ta' ringieli. Hu l-aħjar format li tista' tagħti lill-viewer. [Tagħbija ta' fajls](loading-files.md)

**Avveniment.** Ħaġa li ġrat, bħal tir, laqta, qtil jew tlugħ. Ringiela tista' tkun avveniment, jew sempliċiment "jiena kont hawn". [Filtri](filters.md)

**Persuna.** Dak li għamel ir-ringieli: plejer, pilota, karozza jew tank. Persuna waħda hi linja waħda ta' pożizzjonijiet maż-żmien. [Sessjonijiet, persuni u gruppi](sessions-persons-groups.md)

**Grupp (tim).** Sett ta' persuni muri bl-istess kulur, pereżempju Blu u Aħmar. [Sessjonijiet, persuni u gruppi](sessions-persons-groups.md)

**Sessjoni (partita, round).** Lġurnata waħda tal-logħba. Partita jew round hi sessjoni. Il-viewer jista' juri sessjoni waħda jew jqiegħed ħafna fuq xulxin. [Sessjonijiet, persuni u gruppi](sessions-persons-groups.md)

**Livell.** Il-mappa 3D fejn ġara d-dejta: art, bini, ħitan. Ringieli jidhru fejn ġraw fuq il-livell. [Livelli u ġeometrija tal-isfond](levels.md)

## Nara d-dejta {#looking-at-the-data}

**Heatmap.** Stampa fejn postijiet li ħafna ringieli jmissu jiddu iktar sħan. Postijiet kesħin huma kwieti, postijiet sħan huma mimlijin. [Sħana](heat.md)

**Sħana.** Kemm ġara f'post. Il-viewer iżid id-dawl ta' kull ringiela f'kull post; is-somma hi s-sħana. [Sħana](heat.md)

**Sprite.** L-iskrizz żgħir li jiddi li l-viewer jiġbed għal ringiela waħda. Ħafna sprites li jaqgħu fuq xulxin jiżdiedu f'sħana. [Forma tal-sprite](sprite-shape.md)

**Esponiment.** Kemm hi brillanti l-istampa. Bħal kamera, esponiment iebes jagħmel kollox abjad u ftit wisq jaħbi d-dettall. [Kulur u esponiment](colour-and-exposure.md)

**Saturazzjoni.** Kemm sħana tgħodd bħala "sħun daqs kemm jilħqu l-kuluri". Naqqasha biex jidhru postijiet kwieti; ogħlieha biex tara biss l-iktar sħan. [Kulur u esponiment](colour-and-exposure.md)

**Volum.** Kaxxa jew forma li tpoġġi fil-veduta 3D. Il-viewer jgħodd dak li hu ġewwa, u jista' jqabbel volumi ma' xulxin. [Volumi u tqabbil](volumes.md)

**Filtru.** Regola li taħbi ringieli li ma tridx, pereżempju "qtil biss" jew "it-tim Aħmar biss". [Filtri](filters.md)

## Replay {#replay}

**Figura.** Mudell żgħir ta' tank, pjan, karozza jew suldat li jimxi fejn id-dejta tgħid li kien. [Figuri](figures.md)

**LOD (livell ta' dettall).** Kull figura għandha verżjoni dettaljata, waħda iktar sempliċi u waħda sempliċissima. Dawk viċin jużaw dik dettaljata u dawk 'il bogħod dik sempliċi, sabiex eluf jinġibdu f'daqqa. [Figuri](figures.md)

## Logħba tal-karozzi {#racing}

**Ġirja (lap).** Vjaġġ wieħed madwar it-traċċa, mil-linja lura għal-linja. [Tagħbija ta' ġirjiet](race-loading-laps.md)

**Ġirja ta' referenza.** Il-ġirja li l-oħrajn kollha jitqabblu magħha. Id-differenzi jintwerew bħala "iktar mgħaġġel" jew "iktar bil-mod" minnha. [Tagħbija ta' ġirjiet](race-loading-laps.md)

**Apex.** In-punt ta' kantuniera fejn il-karozza tkun l-iktar qrib it-tarf ta' ġewwa. [Analiżi kantuniera b'kantuniera](race-corner-analysis.md)

**Slip.** Kemm ir-rota titqaxxar. Ftit slip jagħti l-aktar grip; wisq u l-karozza tiżbalja. [Analiżi tal-ġirja: il-metodu](race-analytics.md)

**Envelope.** Dak li karozza tista' tagħmel f'kull veloċità: kemm tista' tduwwar, tiżvolta u tiżdied qabel tqaxxar. [Analiżi tal-ġirja: il-metodu](race-analytics.md)

## Numri tal-inġenji tal-ajru {#aircraft-numbers}

**ALT.** Altitudni: l-għoli 'l fuq mill-art jew mil-livell tal-baħar. [Replay tal-partita](match-replay.md#labels-and-statistics)

**TAS.** Veloċità vera tal-ajru: kemm malajr jgħaddi pjan mill-arja. [Replay tal-partita](match-replay.md#labels-and-statistics)

## Kompjuter {#computer}

**GPU.** Il-karta jew iċ-ċippa tal-grafika. Tiġbed l-istampa u hi ferm iktar mgħaġġla mill-processur ewlieni biex tiġbed miljuni ta' blobs. [Iż-żewġ backends](backends.md)

**WebGPU / WebGL2.** Iż-żewġ modi li bihom browser jippermetti lil paġna tuża l-GPU. WebGPU hu iktar ġdid. Il-viewer jista' juża kwalunkwe wieħed u jagħżel l-aħjar wieħed li l-browser tiegħek għandu. [Iż-żewġ backends](backends.md)

## Kliem ta' Counter-Strike {#counter-strike-words}

**Round.** Ġlieda qasira waħda ġewwa partita. Naħa waħda tirbaħha, u l-iskor jiżdied b'wieħed.

**Eco, force buy, full buy.** Kemm flus naħa tonfoq fuq armi fil-bidu ta' round. Eco jiffranka flus u jixtri kważi xejn (inqas minn $1,500 għal kull plejer fuq medja). Force buy jonfoq dak li għandu (inqas minn $4,000). Full buy jixtri kull ma jista'. [Analiżi tal-partita](match-analysis.md)

**Trade.** Qtil li jħallas lura qtil: intlaqat, u sieħeb tiegħek jimmira lill-qattiel tiegħek fi 5 sekondi. [Analiżi tal-partita](match-analysis.md)

**KAST.** Is-sehem tar-rounds fejn plejer kiseb qtil, assist, baqa' ħaj, jew kien trade. Numru ogħla jfisser li l-plejer għen f'iktar rounds. [Analiżi tal-partita](match-analysis.md)

**ADR.** Ħsara medja għal kull round: kemm saħħa tilef plejer mingħand l-għedewwa kull round. [Analiżi tal-partita](match-analysis.md)
