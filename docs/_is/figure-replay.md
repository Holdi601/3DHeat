---
title: "Fígúrur í fígúruyfirlögninni"
parent: "Fígúrur"
grand_parent: "Endurspilun"
nav_order: 2
lang: "is"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Fígúrur í fígúruyfirlaginu

Þessi síða fjallar um að breyta kössunum í litlar þrívíðar fígúrur af því sem hver eining raunverulega var, og um reykinn og eldinn sem fígúrurnar skilja eftir sig. Stýringar endurspilunarinnar sjálfrar eru á [Endurspilun leiks](match-replay.md).

Í [box replay](box-replay.md) og fígúruendurspilun flipans Match teiknar **Fígúrur í stað kassa** (kveikt sjálfgefið) hverja lifandi persónu sem fígúru af því sem hún er: hermann á fæti, skriðdrekann sem einhver ekur, flugvélina sem Tacview-ferillinn er. Fígúran hefur lit, stöðu og stefnu kassans. Fyrir flugvélar og flaugar hefur hún einnig halla og, þar sem gögnin hafa Roll-dálk, hallann til hliðar. **Stærð fígúra** skalar þær; 1 sinnum er raunstærð. Smellir á fígúru svara eins og smellir á kassann hennar svöruðu.

## Hvaða fígúra {#which-figure}

Nafn- og gerðardálkar gagnanna ráða. Heildarreglurnar, með dálkaheitunum, eru á [Fígúrum](figures.md#which-figure-a-unit-gets). Gögn án hvorugrar tegundar dálka eru gögn um fólk: allir eru hermenn.

Passunin er geymd fyrir hvert merki, svo rammi kostar aðeins staðsetninguna. Gagnaeining er einn metri nema gögnin segi hversu stór ein rakin eining er (CS2-útflutningurinn segir að leikmaður sé 32 einingar á breidd); fígúrurnar eru skalaðar í samræmi við það.

Valfrjáls pakki með eigin fígúrum getur komið í stað fígúra úr safninu á þinni tölvu; sjá [Fígúrur](figures.md#an-optional-local-figure-pack).

## Áhrif {#effects}

Atburðalínur sem skilja eitthvað eftir sig um stund eru teiknaðar þar sem þær gerðust svo lengi sem það varir, í lit þess sem olli þeim: reykur (um 18 s), molotov eða íkveikjusprengja (7 s), blossi (um ein sekúnda) og HE-sprenging (undir einni sekúndu), tálbeita (15 s), komið fyrir sprengju (40 s). Þær koma úr atburðadálki (Event, Events) sem merkimiðinn er `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` eða `plant` - CS2-útflutningurinn skrifar þær við sprenginguna.

## Endurspilun leiks: verkfæri Tacview {#match-replay-tacviews-tools}

Myndavélar, bókamerki, taktísk birting, tölfræði, merkimiðar, **Lóðlínur**, atburðalistinn og línuritsglugginn er lýst á [Endurspilun leiks](match-replay.md). [Jöfnuður við Tacview](tacview-parity.md) telur upp alla eiginleika Tacview og hvar þeir standa.
