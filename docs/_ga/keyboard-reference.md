---
title: "Tagairt don méarchlár agus don luch"
parent: "Ceamara agus rialuithe"
nav_order: 2
lang: "ga"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---


# Tagairt na méarchlár agus na luiche

Gach eochair agus gníomh luiche in aon áit amháin, ionas gur féidir leat an ceann a theastaíonn uait a aimsiú. Cliceáil ar an amharc ar dtús ionas go mbeidh an méarchlár aige. Déantar neamhaird d'eochracha agus bosca téacs nó liosta anuas fócasaithe. Taispeántar an gearrleagan freisin ag bun na láimhe clé den amharc.

Aimsitheoir tapa:

| Ba mhaith liom ... | Brúigh |
|---|---|
| eitilt | `W A S D`, tarraing chun féachaint |
| gach rud a fheiceáil | `F` |
| seinm nó stad | `K` |
| seinm ar gcúl | `J` (brúigh arís chun stad), ar aghaidh `L` |
| a fheiceáil cad atá i gciall na ndathanna | `?` nó `F1` |
| aisghabháil sa chluaisín Clár na dtaictic | `Ctrl+Z` |

## Ceamara {#camera}

Ó [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Ionchur | Toradh |
|---|---|
| `W` / `↑` | Ar aghaidh i dtreo na treo féachana |
| `S` / `↓` | Ar ais |
| `A` / `←` | Sleamhnú ar chlé |
| `D` / `→` | Sleamhnú ar dheis |
| `Spás` / `E` | Suas |
| `Q` / `Ctrl` ar chlé | Síos |
| `Shift` (ceann ar bith) | Coinnigh: 6× luas |
| `Alt` ar chlé | Coinnigh: 15% luas |
| Tarraing le cnaipe clé nó deas ar an amharc | Féach (an luchtóg faoi ghlas agus an cnaipe coinnithe) |
| Roth (peirspeictíocht) | Luas eitilte ×1.5 in aghaidh an chliceáil (ar a mhéad 4 chliceáil in aghaidh imeachta rotha) |
| Roth (comhthreomhar) | Zúmáil |
| Cliceáil dheas | Ní oscalaíonn aon roghchlár comhthéacs thar an amharc |

## Domhanda {#global}

Ó [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Eochair | Toradh |
|---|---|
| `K` | Seinn / stad an [amlíne](timeline.md) |
| `F` | Fráma na sonraí |
| `C` | Cóipeáil suíomh, giaw agus pitse an cheamara ([léamh an cheamara](camera.md#camera-readout)) |
| `G` | Téigh chuig pointe scríofa: osclaíonn sé an bosca faoi léamh an cheamara |
| `Esc` | Dún an cárta roghnúcháin; ansin stop ag féachaint ar an dara haonad; ansin stop ag leanúint haonaid |
| `T` | Radharc taispeána taictiúil air nó as ([Athsheinm cluiche](match-replay.md#display-style)) |
| `?` / `F1` | Mód cabhrach: cad atá i gciall na ndathanna ([Socruithe, aonaid agus eochracha](settings.md#help-mode)) |
| `1` | [Teas](heat.md) |
| `2` | [Difríocht](difference.md) |
| `3` | [Teas foirne](team-heat.md) |
| `4` | [Teas líne](line-heat.md) |
| `]` | Teorainn scagtha i bhfad amach ×1.12 (`Shift`: ×1.35) |
| `[` | Teorainn scagtha i bhfad isteach ÷1.12 (`Shift`: ÷1.35) |
| `\` | Teorainn scagtha i bhfad as / ar ais mar a bhí ([Doimhneacht agus scagadh](depth-and-culling.md#keyboard)) |

Níl eochair uimhreach ag an mód **Forleagan figiúirí**; roghnaigh é sa bharra modhanna nó oscail an cluaisín Cluiche. Oibríonn na heochracha uimhreacha tríd an seiceáil chéanna is a oibríonn an barra modhanna: ní dhéanann eochair do mhód a thaispeánann an barra mar nach bhfuil ar fáil do na sonraí luchtaithe rud ar bith.

## Athsheinm cluiche {#match-replay}

Sa mhód Forleagan figiúirí, a úsáideann an cluaisín Cluiche ([Athsheinm cluiche](match-replay.md)). Oibríonn siad an bhfuil aonad á leanúint nó nach bhfuil, ach amháin sa chás a luaitear:

| Eochair | Toradh |
|---|---|
| `B` | Cuir leabharmharc leis: an nóiméad agus an ceamara |
| `M` | Léarscáil 2D: cúinne, an radharc iomlán, as |
| `V` / `Shift+V` | An chéad / an radharc ceamara roimhe sin den aonad leanta |
| `H` | Taispeán ceann-suas sa chaisteal agus sna radharcanna padlock |
| `Page Down` / `Page Up` | An chéad / an imeacht roimhe sin de na cineálacha a thaispeánann liosta na n-imeachtaí |
| `J` | Seinn ar gcúl; arís, chun stad |
| `L` | Seinn ar aghaidh; arís, chun stad |
| `.` / `,` | Soicind amháin ar aghaidh / ar ais, stadta (`Shift`: deich soicind) |
| `Esc` | Stop ag féachaint ar an sprioc ar dtús, ansin stop ag leanúint |
| `Ctrl`+cliceáil nó `Alt`+cliceáil ar aonad (sa radharc nó sa liosta aonad) | Féach air ón aonad leanta (an radharc dhá-aonad); cliceáil arís chun é a scaoileadh |
| `Shift`+cliceáil ar dhá aonad | Tomhais eatarthu: treo, raon, difríocht airde |

Teastaíonn aonad leanta ó `V`. Is é `M` an léarscáil 2D anseo, agus "bog" sa chluaisín Clár na dtaictic.

## Aonad a leanúint {#following-a-unit}

Agus an ceamara ag leanúint aonaid, stiúrann an roth agus na heochracha eitilte timpeall an aonaid in ionad eitilt saor ([Ceamara](camera.md#while-following-a-unit)):

| Ionchur | Toradh |
|---|---|
| Roth, `W` / `S` | Níos gaire / níos faide (níos airde / níos ísle sa radharc satailíte). Ní sa chaisteal agus sna radharcanna padlock. |
| `A` / `D`, `Q` / `E` | Fithis timpeall an aonaid (radharcanna cuaille agus fithise) |
| Tarraing | Féach timpeall an aonaid; sa chaisteal, féach timpeall istigh |
| `V` / `Shift+V` | An chéad / an radharc ceamara roimhe sin |
| `H` | Taispeán ceann-suas (radharcanna caiste agus padlock) |
| `Esc` | Stop ag féachaint ar an dara haonad, ansin stop ag leanúint |

## Clár na dtaictic {#tactics-board}

Sa chluaisín Clár na dtaictic ([Clár na dtaictic](tactics-board.md)). Oibríonn `F`, `C`, `G` agus `T` mar thuas; ní dhéanann na heochracha uimhreacha aon rud.

| Eochair | Toradh |
|---|---|
| `Ctrl+Z` | Cealaigh |
| `Ctrl+Y` nó `Ctrl+Shift+Z` | Athchuir |
| `Enter` | Críochnaigh an saighead atá á tarraingt (déanann cliceáil dhúbailte nó cliceáil dheas an rud céanna) |
| `Esc` | Cealaigh tarraingt; mura bhfuil, scaoil an saighead nó an bogadh atá ar siúl; mura bhfuil, díroghnaigh |
| `Delete` nó `Backspace` | Scrios an roghnú |
| `W` / `E` / `R` | Giuirléid Bog / Rothlaigh / Scála don roghnú (scéim eochrach **W / E / R**) |
| `G` / `R` / `S` | Giuirléid Bog / Rothlaigh / Scála don roghnú (scéim eochrach **G / R / S**) |
| `R` | Gan rud ar bith roghnaithe: cas an chéad fhigiúr eile 15°. `Shift+R` casann ar ais é. |
| `M` | Figiúr roghnaithe: bog go dtí an chéad chliceáil eile é |
| `K` | Seinn nó stad an plean |
| Shift+cliceáil | Cuir leis nó bain den roghnú |
| Shift+tarraing | Tarraing bosca thart ar an méid le roghnú |
| `Ctrl` agus láimhseáil á tarraingt | Snap go dtí an greille nó céim na huillinne |

Oibríonn eochracha na giuirléide ach nuair a bhíonn rud éigin roghnaithe; gan rud ar bith roghnaithe, eitlíonn `W A S D` an ceamara mar is gnách.

## Cliceáil chun roghnú {#click-to-pick}

Le **Taispeánann cliceáil cad atá ann** ar agus an rialóir as ([Cliceáil chun roghnú](camera.md#click-to-pick)):

| Ionchur | Toradh |
|---|---|
| Cliceáil ar chlé (gan tarraingt níos mó ná 4 px) | Taispeán an pointe sonraí, nó an spota ar an leibhéal, faoin gcúrsóir |

## Tomhas {#measure}

Le **Rialóir ar siúl** ([Tomhas](measure.md)):

| Ionchur | Toradh |
|---|---|
| Cliceáil ar chlé (gan tarraingt níos mó ná 4 px) | Cuir pointe síos |
| Cliceáil dheas | Bain an pointe deiridh |

## In áiteanna eile {#elsewhere}

| Áit | Ionchur | Toradh |
|---|---|---|
| Greim aon sliodair (an handle in aice leis an uimhir) | Tarraing suas / síos | Athraigh an luach go leanúnach, níos tapa dá fhad a tharraingíonn tú; coinnigh `Shift` le haghaidh rialaithe mín. Scaoil chun stopadh. |
| An taispeáint luais os cionn an amhairc | Tarraing suas / síos | Athraigh luas eitilte ar an mbealach céanna. |
| Boscaí seasa | `Enter` | Cuir an suíomh nó an treoshuíomh scríofa i bhfeidhm. |
| Eagarthóir cuair | Cliceáil dhúbailte / Alt-cliceáil / cliceáil dheas | Cuir pointe leis / bain pointe ([Cruth sprite](sprite-shape.md#the-curve-editor)). |

## Cluaisín anailíse rása {#race-analysis-tab}

Sa chluaisín Anailís rása seinneann `K` agus stadann sé athsheinm na rása, athchasann `Home` é, agus ní dhéanann na heochracha uimhreacha aon rud. Féach [Anailís rása](race-analysis.md).

## Eochracha a choinníonn an amharcóir ón mbrabhsálaí {#keys-the-viewer-keeps-from-the-browser}

Dhúnfadh roinnt gearrbhealaí brabhsálaí an leathanach nó athlódálfadh sé é agus chaillfí seisiún luchtaithe; coinníonn an t-amharcóir iad dó féin. Tá an liosta ginte ón gcód: [Eochracha brabhsálaí](ref-browser-keys.md).

## Pada {#gamepad}

Féach [Pada cluiche agus HOTAS](gamepad.md).
