---
title: "Orðasafn"
nav_order: 21
lang: "is"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Orðasafn

Stuttar merkingar orðanna sem þessi vefsíða notar, á einföldu máli. Hver færsla tengir á síðuna sem útskýrir hana til fulls.

## Gögn {#data}

**Röð.** Ein lína í gögnunum þínum: eitt sem gerðist á einum stað og tíma, til dæmis „leikmaður 7 var hér á sekúndu 12“. Skoðarinn teiknar hverja röð. [Gagnassnið](data-formats.md)

**Dálkur.** Ein tegund gilda í röðunum, eins og x, y, z, tími eða lið. Skoðarinn giskar á hvaða dálkur er hvað, og þú getur breytt giskinu. [Dálkatengingar](column-mapping.md)

**CSV.** Einföld textatafla: ein röð á hverja línu, gildi aðskilin með kommum. Næstum hvaða forrit sem er getur skrifað eina slíka. [Hleðsla skráa](loading-files.md)

**Parquet.** Þjöppuð töfluskrá sem er fljót að lesa, jafnvel með milljónum raða. Það er besta sniðið til að gefa skoðaranum. [Hleðsla skráa](loading-files.md)

**Atburður.** Eitthvað sem gerðist, til dæmis skot, högg, dráp eða flugtak. Röð getur verið atburður, eða bara „ég var hér“. [Síur](filters.md)

**Manneskja.** Sú sem bjó til raðirnar: leikmaður, flugmaður, bíll eða skriðdreki. Ein manneskja er ein lína af staðsetningum yfir tíma. [Lotur, persónur og hópar](sessions-persons-groups.md)

**Hópur (lið).** Safn manneskja sem eru sýndar í sama lit, til dæmis Blátt og Rautt. [Lotur, persónur og hópar](sessions-persons-groups.md)

**Seta (leikur, umferð).** Ein keyrsla leiksins. Leikur eða umferð er seta. Skoðarinn getur sýnt eina setu eða lagt margar yfir hvor aðra. [Lotur, persónur og hópar](sessions-persons-groups.md)

**Borð.** Þrívíða kortið sem atburðirnir gerðust á: jörð, byggingar, veggir. Raðir birtast þar sem þær gerðust á borðinu. [Borð og bakgrunnsform](levels.md)

## Að skoða gögnin {#looking-at-the-data}

**Hitakort.** Mynd þar sem staðir sem margar raðir snerta ljóma heitar. Kaldir staðir eru rólegir, heitir staðir eru annasamir. [Hiti](heat.md)

**Hiti.** Hversu mikið gerðist á einum stað. Skoðarinn leggur saman ljóma sérhverrar raðar á hverjum stað; summan er hitinn. [Hiti](heat.md)

**Sprite.** Litli ljómandi blettur sem skoðarinn teiknar fyrir eina röð. Margir sprite sem skarast leggjast saman í hita. [Lögun sprite-mynda](sprite-shape.md)

**Lýsing.** Hversu björt myndin er. Eins og í myndavél: of mikil lýsing gerir allt hvítt og of lítil felur smáatriðin. [Litir og lýsing](colour-and-exposure.md)

**Mettun.** Magn hita sem telst „eins heitt og litirnir ná“. Lækkaðu það til að sýna rólega staði; hækkaðu það til að sjá aðeins þá heitustu. [Litir og lýsing](colour-and-exposure.md)

**Rúmmál.** Kassi eða form sem þú setur í þrívíðu sýnina. Skoðarinn telur það sem er inni í því og getur borið rúmmál saman hver við annað. [Rúmmál og samanburður](volumes.md)

**Sía.** Regla sem felur raðir sem þú vilt ekki, til dæmis „aðeins dráp“ eða „aðeins lið Rautt“. [Síur](filters.md)

## Endurspilun {#replay}

**Mynd (fígúra).** Lítil líkan af skriðdreka, flugvél, bíl eða hermanni sem hreyfist þangað sem gögnin segja að það hafi verið. [Fígúrur](figures.md)

**LOD (smáatriðastig).** Hver fígúra hefur útgáfu með smáatriðum, einfaldari útgáfu og mjög einfalda útgáfu. Nálægar nota þá með smáatriðum og fjarlægar þá einföldu, svo þúsundir geta verið teiknaðar í einu. [Fígúrur](figures.md)

## Kappakstur {#racing}

**Hringur.** Ein ferð um brautina, frá markalínunni og aftur á markalínuna. [Hleðsla hringja](race-loading-laps.md)

**Viðmiðunarhringur.** Hringurinn sem allir hinir eru bornir saman við. Munur er sýndur sem „hraðar“ eða „hægar“ en hann. [Hleðsla hringja](race-loading-laps.md)

**Hornpunktur.** Punkturinn í beygju þar sem bíllinn er næst innri brúninni. [Greining beygju fyrir beygju](race-corner-analysis.md)

**Slip.** Hversu mikið dekkið rennur. Lítill sleppur gefur mest grip; of mikill og bíllinn skríður. [Kappakstursgreining: aðferðin](race-analytics.md)

**Umslag.** Það sem bíll getur gert á hverjum hraða: hversu hart hann getur beygt, hemlað og hraðað áður en hann rennur. [Kappakstursgreining: aðferðin](race-analytics.md)

## Tölur loftfara {#aircraft-numbers}

**ALT.** Hæð: hæðin yfir jörðu eða sjávarmáli. [Endurspilun leiks](match-replay.md#labels-and-statistics)

**TAS.** Raunloftshraði: hversu hratt flugvél fer í gegnum loftið. [Endurspilun leiks](match-replay.md#labels-and-statistics)

## Tölvan {#computer}

**GPU.** Skjákortið eða flísinn. Hann teiknar myndina og er mun hraðari en örgjörvinn við að teikna milljónir blettna. [Bakendarnir tveir](backends.md)

**WebGPU / WebGL2.** Tvær leiðir sem vafri gefur síðu til að nota GPU. WebGPU er nýrri. Skoðarinn getur notað hvora sem er og velur þá bestu sem vafrinn þinn hefur. [Bakendarnir tveir](backends.md)

## Orð úr Counter-Strike {#counter-strike-words}

**Umferð.** Ein stutt orrusta innan leiks. Önnur hliðin vinnur hana og stigin hækka um eitt.

**Eco, force buy, full buy.** Hversu mikla peninga hlið eyðir í vopn í upphafi umferðar. Eco sparar peninga og kaupir næstum ekkert (undir 1.500 $ á leikmann að meðaltali). Force buy eyðir því sem hún á (undir 4.000 $). Full buy kaupir allt sem hún getur. [Greining leiks](match-analysis.md)

**Skipti.** Dráp sem borgar fyrir dráp: þú ert skotinn, og liðsfélagi skýtur banamann þinn innan 5 sekúndna. [Greining leiks](match-analysis.md)

**KAST.** Hlutfall umferða þar sem leikmaður náði drápi, stoðsendingu, lifði af, eða var skipt. Hærri tala þýðir að leikmaðurinn hjálpaði í fleiri umferðum. [Greining leiks](match-analysis.md)

**ADR.** Meðalskaði á umferð: hversu mikla heilsu leikmaður tók af óvinum í hverri umferð. [Greining leiks](match-analysis.md)
