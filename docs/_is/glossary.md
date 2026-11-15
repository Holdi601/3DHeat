---
title: "Orðasafn"
nav_order: 21
lang: "is"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---


# Orðasafn

Stuttar merkingar orðanna sem þessi síða notar, á venjulegu máli. Hver færsla tengist þeirri síðu sem útskýrir hana til fulls.

## Gögn {#data}

**Lína.** Ein lína í gögnunum þínum: eitt sem gerðist á einum stað og tíma, til dæmis "leikmaður 7 var hér á sekúndu 12". Skoðarinn teiknar sérhverja línu. [Gagnasnið](data-formats.md)

**Dálkur.** Ein tegund gilda í línunum, eins og x, y, z, tími eða lið. Skoðarinn giskar á hvaða dálkur er hvað, og þú getur breytt giskinu. [Dálkatenging](column-mapping.md)

**CSV.** Venjuleg textatafla: ein lína á hverja röð, gildi aðskilin með kommum. Næstum hvert forrit getur skrifað hana. [Hleðsla skráa](loading-files.md)

**Parquet.** Þétt töfluskrá sem er fljót að lesa, jafnvel með milljónum lína. Þetta er besta sniðið til að gefa skoðaranum. [Hleðsla skráa](loading-files.md)

**Atburður.** Eitthvað sem gerðist, eins og skot, högg, dráp eða flugtak. Lína getur verið atburður, eða bara "ég var hér". [Síur](filters.md)

**Manneskja.** Sá sem bjó til línurnar: leikmaður, flugmaður, bíll eða skriðdreki. Ein manneskja er ein lína staðsetninga yfir tíma. [Lotur, persónur og hópar](sessions-persons-groups.md)

**Hópur (lið).** Safn manneskja sem eru sýndar í sama lit, til dæmis Blue og Red. [Lotur, persónur og hópar](sessions-persons-groups.md)

**Lota (leikur, umferð).** Ein keyrsla leiksins. Leikur eða umferð er lota. Skoðarinn getur sýnt eina lotu eða lagt margar yfir hver aðra. [Lotur, persónur og hópar](sessions-persons-groups.md)

**Borð.** Þrívíða kortið sem gögnin gerðust á: jörð, byggingar, veggir. Línur birtast þar sem þær gerðust á borðinu. [Borð og bakgrunnsform](levels.md)

## Að skoða gögnin {#looking-at-the-data}

**Hitakort.** Mynd þar sem staðir sem margar línur snerta glóa heitar. Kaldir staðir eru rólegir, heitir staðir eru annasamir. [Hiti](heat.md)

**Hiti.** Hversu mikið gerðist á ákveðnum bletti. Skoðarinn leggur saman ljóma allra lína á hverjum stað; summan er hitinn. [Hiti](heat.md)

**Depill.** Litli glóandi blettur sem skoðarinn teiknar fyrir eina línu. Margir skarandi deplar leggjast saman í hita. [Lögun sprite-mynda](sprite-shape.md)

**Lýsing.** Hversu björt myndin er. Eins og í myndavél: of mikil lýsing gerir allt hvítt og of lítil felur smáatriðin. [Litir og lýsing](colour-and-exposure.md)

**Mettun.** Magn hita sem telst "eins heitt og litirnir ná". Lækkaðu hana til að sýna rólega staði; hækkaðu hana til að sjá aðeins heitustu staðina. [Litir og lýsing](colour-and-exposure.md)

**Rúmmál.** Kassi eða form sem þú setur í þrívíðu sýnina. Skoðarinn telur hvað er inni í því og getur borið rúmmál saman hvert við annað. [Rúmmál og samanburður](volumes.md)

**Sía.** Regla sem felur línur sem þú vilt ekki, til dæmis "aðeins dráp" eða "aðeins lið Red". [Síur](filters.md)

## Endurspilun {#replay}

**Fígúra.** Lítil líking af skriðdreka, flugvél, bíl eða hermanni sem hreyfist þangað sem gögnin segja að hún hafi verið. [Fígúrur](figures.md)

**LOD (smáatriðastig).** Hver fígúra hefur nákvæma, einfaldari og mjög einfalda útgáfu. Nálægar nota þá nákvæmu og fjarlægar þá einföldu, svo þúsundir má teikna í einu. [Fígúrur](figures.md)

## Kappakstur {#racing}

**Hringur.** Ein ferð um brautina, frá markinu og aftur í markið. [Hleðsla hringja](race-loading-laps.md)

**Viðmiðunarhringur.** Hringurinn sem allir hinir eru bornir saman við. Munurinn birtist sem "hraðar" eða "hægar" en hann. [Hleðsla hringja](race-loading-laps.md)

**Toppur beygju.** Sá punktur beygju þar sem bíllinn er næst innri brúninni. [Greining beygju fyrir beygju](race-corner-analysis.md)

**Renna.** Hversu mikið dekk rennur. Lítil renna gefur mest grip; of mikil og bíllinn rennur til. [Kappakstursgreining: aðferðin](race-analytics.md)

**Umslag.** Það sem bíll getur gert á hverjum hraða: hversu hart hann getur beygt, hemlað og hraðað áður en hann rennur. [Kappakstursgreining: aðferðin](race-analytics.md)

## Tölur í loftförum {#aircraft-numbers}

**ALT.** Hæð: hæðin yfir jörðu eða sjávarmáli. [Endurspilun leiks](match-replay.md#labels-and-statistics)

**TAS.** Raunloftshraði: hversu hratt flugvél fer í gegnum loftið. [Endurspilun leiks](match-replay.md#labels-and-statistics)

## Tölva {#computer}

**GPU.** Skjákortið eða flísinn. Hann teiknar myndina og er miklu hraðari en örgjörvinn við að teikna milljónir deplanna. [Bakendarnir tveir](backends.md)

**WebGPU / WebGL2.** Tvær leiðir sem vafri leyfir síðu að nota GPU. WebGPU er nýrra. Skoðarinn getur notað hvort sem er og velur það besta sem vafrinn þinn hefur. [Bakendarnir tveir](backends.md)

## Orð úr Counter-Strike {#counter-strike-words}

**Umferð.** Ein stutt viðureign innan leiks. Önnur hliðin vinnur hana, og stigin hækka um eitt.

**Eco, þvingað kaup, fullt kaup.** Hversu mikla peninga hlið eyðir í vopn í upphafi umferðar. Eco sparar og kaupir nánast ekkert (undir $1,500 á leikmann að meðaltali). Þvingað kaup eyðir því sem það hefur (undir $4,000). Fullt kaup kaupir allt sem það getur. [Leikgreining](match-analysis.md)

**Skipti.** Dráp sem borgar fyrir dráp: þú ert skotinn, og liðsfélagi skýtur banamann þinn innan 5 sekúndna. [Leikgreining](match-analysis.md)

**KAST.** Hlutfall umferða þar sem leikmaður fékk dráp, stoðsendingu, lifði af, eða var skipt. Hærri tala þýðir að leikmaðurinn hjálpaði í fleiri umferðum. [Leikgreining](match-analysis.md)

**ADR.** Meðalskaði á umferð: hversu mikið heilsu leikmaður tók af óvinum í hverri umferð. [Leikgreining](match-analysis.md)
