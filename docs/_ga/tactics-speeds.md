---
title: "Luasanna gluaiseachta"
parent: "Clár na dtaictic"
nav_order: 1
lang: "ga"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---


# Luasanna gluaiseachta

Cá fhad a thógann sé do shaighdiúir, tanc nó seoltóir dul ó A go B? Insíonn an leathanach seo cé chomh tapa agus a bhogann gach figiúr ar an [chlár taictice](tactics-board.md), agus cá dtagann na huimhreacha sin, ionas gur féidir leat na hamanna ar do phlean a iontráil nó iad a athrú.

Ríomhann an [chlár taictice](tactics-board.md) amanna plean ó luas gach figiúir. Tagann na luasanna ó chomhad amháin do gach cluiche in `src/tactics/speeds/`: luas do gach mód gluaiseachta de gach aicme (coisí, feithiclí talún, báid, aerárthaí, héileacaptair), chomh maith le próifílí ainmnithe amhail ceann do gach airm CS2 nó ceann do gach cineál aerárthaigh. Liostaíonn gach comhad a fhoinsí, agus deir gach luach an bhfuil sé **oifigiúil** (sonraí an chluiche féin, nó figiúirí foilsithe aerárthaigh fhíor) nó **thart** (tomhaiste ag an bpobal nó luach tipiciúil).

Is pointí tosaigh iad seo. **Is féidir le gach figiúr a luasanna a shárú ar an gclár**, mar sin is féidir le plean luas tomhaiste a úsáid, saighdiúir lódáilte nó tanc damáistithe.

## Modhanna {#modes}

| Aicme | Modhanna |
|---|---|
| Coisí | ag rámhaille (ar a bholg), ag cromadh, ag siúl (an siúl mall, ciúin), ag rith (gluaiseacht réamhshocraithe), ag sprintéireacht |
| Feithiclí talún, báid | ag rámhaille, cúramach, gnáthluas (trasna-tíre), luas (luas barr bóthair) |
| Aerárthaigh, héileacaptair | mall (druidim, fánaíocht, crochadh-tacsaí), mordán, cath (luas cúinne nó rith ionsaithe), uasmhéid |

Fágtar mód nach bhfuil ag an gcluiche folamh: níl sprint ná rámhaille ag CS2 agus Valorant.

## Fánaí {#slopes}

Insíonn gach comhad conas a dhéileálann an cluiche le fánaí. Teorannaíonn CS2, Valorant agus Squad luas cothrománach, mar sin ní mhoillíonn fána imreoir. Moillíonn Arma coisithe ar fhánaí, mar sin úsáideann a chomhad agus an comhad ginearálta feidhm siúlóide Tobler. Úsáideann Battlefield agus na samhlacha feithicle pionós grádáin simplí.

## De réir cluiche {#per-game}

**Counter-Strike 2** (aonad in aghaidh an tsoicind; glactar le haonad amháin mar orlach amháin). **Oifigiúil.** Is iad luasanna rite na luachanna `m_flMaxSpeed` i sainmhínithe airm an chluiche: an scian agus C4 250, grenades 245, pistil 240 (Desert Eagle 230, R8 180), SMGanna 220 go 240, raidhfilí 210 go 225, AWP 200, LMGanna 195 agus 150. Tá próifílí féin ag an AWP scóipithe (100), AUG agus SG 553 (150) agus G3SG1 agus SCAR-20 (120). Is é siúl rith × 0.52 agus is é cromadh rith × 0.34. Ní fhoilsíonn Valve an dá iolraitheoir seo, ach taispeánann gach airm iad i dtaifeadtaí demo. Chun plean a sheiceáil i gcoinne gluaiseachta fíor, luchtaigh demo ar an léarscáil chéanna agus cuir luasanna na n-imreoirí i gcomparáid.

**Valorant** (m/s). Ritheann an scian ag 6.75 m/s. Iolraíonn gach airm an luas sin faoina iolraitheoir luais rite ó shonraí an chluiche, rud a thugann na luasanna a thaispeánann an Arsenal sa chluiche: 5.73 do formhór na mbunairm agus SMGanna, 5.4 do raidhfilí, 5.13 do throm-airm agus don Oibreoir, 5.06 do gunnaí gaoil. Tá na luasanna rite cruinn. Is **meastacháin** iad luasanna siúil agus cromtha (0.55 agus 0.4 × rite) mar ní fhoilsíonn Riot iad. Is meastacháin iad na próifílí lámhaire scóipithe freisin.

**Battlefield** (km/h). **Thart.** Ní fhoilsíonn EA uimhreacha gluaiseachta. Coisithe: thart ar 1 m/s ar a bholg, 2 cromtha, 4 ag rith agus 6.4 ag sprintéireacht. Faigheann feithiclí, aerárthaí, héileacaptair agus báid luasanna tipiciúla sa chluiche dá n-aicme.

**Squad** (km/h). **Thart.** Tagann rith (3.3 m/s) agus sprint (5.9 m/s) ó scríobh pobail ar mheicníochtaí an chluiche. Is meastacháin iad rámhaille, cromadh agus siúl mall, agus mar sin gach aicme feithicle agus héileacaptair.

**Arma** (km/h). **Thart.** Is amanna pobail iad luasanna coisithe: thart ar 5 km/h ag siúl, 9 km/h ag luas taictiúil cromtha, 15 km/h ag rith ar an mbóthar agus thart ar 21 km/h ag sprintéireacht. Is iad uasluasanna feithiclí na huasmhéideanna cumraithe de fheithiclí vanilla Arma 3 in aicme gach ceann, ó liosta tríú páirtí. Is meastacháin iad na modhanna feithicle is moille.

**DCS / War Thunder / IL-2** (km/h). Tá próifíl féin ag gach aerárthach agus héileacaptar sa phailéad. Is iad na luasanna mordáin agus uasluasanna **figiúirí foilsithe** an aerárthaigh fhíor, a mhúnlaíonn na samhlacha go dlúth. Is é an t-uasmhéid ag leibhéal na mara do sheicheanna agus ag an airde mheasta d'aerárthaí airnéise, agus deir nóta gach próifíle cé acu. Is luachanna tipiciúla iad luasanna cromtha agus cathanna. Úsáideann feithiclí talún luasanna bóthair foilsithe na bhfeithiclí fíor, cruinnithe (**thart**). Úsáideann long uasluasanna foilsithe a haicme.

**Eile** (m/s). Réamhshocruithe fíorshaoil **thart**: rámhaille 0.5, cromadh 1.5, siúl 1.4, rith 3.5, sprint 6.

## Foinsí {#sources}

Counter-Strike 2
- [Sainmhínithe airm CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Leathanaigh airm CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com airm (iolraitheoirí luais rite)](https://valorant-api.com/v1/weapons)
- [VLR.gg: luas na scine 6.75 m/s](https://vlr.gg/post/4240306)
- [Tacaíocht Riot: Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Fóraim EA: luas gluaiseachta Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Treoir gluaiseachta Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Tuairisc réamhscaoilte de sprint 6.4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: postáil meicníochtaí cluiche Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (ní fhoilsíonn sé luasanna)

Arma
- [Fóraim Bohemia: luas siúil](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Fóraim Bohemia: cur chun cinn luais gluaiseachta](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Rianaire aiseolais Arma 3: luas sprinte](https://feedback.bistudio.com/T64047)
- [Lámhleabhar Páirce Arma 3: Rialuithe Coisí](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Staitisticí feithiclí Arma 3 de réir fhachtóra (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Sonraíochtaí Vicipéid de gach cineál aerárthaigh agus héileacaptair, nasctha ó gach próifíl in `air.json`
- [Luasanna V](https://en.wikipedia.org/wiki/V_speeds), le haghaidh luasanna tipiciúla druidim agus catha
- [Vicí War Thunder](https://wiki.warthunder.com/), le haghaidh feithiclí talún
- [Scrios aicme Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), agus luasanna foilsithe na n-aicmí loinge eile

Eile
- [Luas siúil roghnaithe](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Feidhm siúlóide Tobler](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
