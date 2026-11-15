---
title: "Hraði hreyfinga"
parent: "Taktíkartafla"
nav_order: 1
lang: "is"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Hraði hreyfinga

Hve langan tíma tekur það hermann, skriðdreka eða þotu að komast frá A til B? Þessi síða segir hversu hratt hver fígúra hreyfist á [Taktíkartöflunni](tactics-board.md), og hvaðan þær tölur koma, svo þú getir treyst tímunum í áætluninni þinni eða breytt þeim.

[Taktíkartaflan](tactics-board.md) tímasetur áætlun út frá því hversu hratt hver fígúra hreyfist. Hraðinn kemur úr einni skrá fyrir hvern leik í `src/tactics/speeds/`: hraða fyrir hvern hreyfiham hvers flokks (fótgönguliða, farartækja á landi, báta, loftfara, þyrla), auk nefndra sniða, eins og eins fyrir hvert CS2-vopn eða eitt fyrir hverja gerð loftfars. Hver skrá telur upp heimildir sínar, og hvert gildi segir hvort það er **opinbert** (eigin gögn leiksins, eða birtar tölur raunverulegs loftfars) eða **áætlað** (mælt af samfélaginu eða dæmigert gildi).

Þetta eru upphafspunktar. **Sérhver fígúra getur yfirskrifað hraða sína á töflunni**, svo áætlun getur notað mældan hraða, þungbúinn hermann eða skemmdan skriðdreka.

## Hamir {#modes}

| Flokkur | Hamir |
|---|---|
| Fótgönguliðar | skrið (liggjandi), krjúpa, ganga (hægt, hljóðlát ganga), hlaupa (venjuleg hreyfing), spretthlaup |
| Farartæki á landi, bátar | skrið, varlega, venjulegt (utan vega), flýta (hámarkshraði á vegi) |
| Loftför, þyrlur | hægt (aðflug, sveimur, sigur á sveimi), siglingahraði, bardagi (hraði í beygju eða árásarflug), hámark |

Hamur sem leikurinn hefur ekki er skilinn auður: CS2 og Valorant hafa hvorki spretthlaup né liggjandi stöðu.

## Brekkur {#slopes}

Hver skrá segir líka hvernig leikurinn meðhöndlar brekkur. CS2, Valorant og Squad takmarka lárétta hraðann, svo brekka hægir ekki á spilara. Arma hægir fótgönguliða í brekkum, svo skrá þess og sú almenna nota gönguhraðafall Toblers. Battlefield og flugherminn nota einfalda hallarefsingu.

## Eftir leik {#per-game}

**Counter-Strike 2** (einingar á sekúndu; ein eining er talin sem ein tomma). **Opinbert.** Hlaupahraðar eru `m_flMaxSpeed`-gildin í vopnaskilgreiningum leiksins: hnífur og C4 250, sprengjur 245, skammbyssur 240 (Desert Eagle 230, R8 180), SMG-vopn 220 til 240, rifflar 210 til 225, AWP 200, léttar vélbyssur 195 og 150. AWP með sjónauka (100), AUG og SG 553 (150) og G3SG1 og SCAR-20 (120) hafa sín eigin snið. Ganga er hlaup × 0,52 og krjúpa er hlaup × 0,34. Valve birtir ekki þessa tvo margfaldara, en hvert vopn sýnir þá í upptökum af leikjum. Til að bera áætlun saman við raunverulega hreyfingu, hladdu leik á sama korti og berðu saman hraða spilaranna.

**Valorant** (m/s). Hnífurinn hleypur á 6,75 m/s. Hvert vopn margfaldar það með eigin hlaupamargfaldara úr leikjagögnunum, sem gefur hraðana sem Vopnabúrið í leiknum sýnir: 5,73 fyrir flest skammbyssur og SMG, 5,4 fyrir rifflana, 5,13 fyrir þungu vopnin og Operator, 5,06 fyrir haglabyssur. Þessir hlaupahraðar eru nákvæmir. Ganga- og krjúpahraðar eru **áætlaðir** (0,55 og 0,4 × hlaup) því Riot birtir þá ekki. Snið leyniskyttna með sjónauka eru líka áætluð.

**Battlefield** (km/klst). **Áætlað.** EA birtir engar hreyfitölur. Fótgönguliðar: um 1 m/s liggjandi, 2 krjúpandi, 4 hlaupandi og 6,4 í spretthlaupi. Farartæki, þotur, þyrlur og bátar fá dæmigerðan leikhraða fyrir sinn flokk.

**Squad** (km/klst). **Áætlað.** Hlaup (3,3 m/s) og spretthlaup (5,9 m/s) koma úr samfélagsumfjöllun um vélfræði leiksins. Skrið, krjúp og hæg ganga eru áætlanir, og það sama gildir um hvern flokk farartækja og þyrlur.

**Arma** (km/klst). **Áætlað.** Hraði fótgönguliða eru tímasetningar samfélagsins: um 5 km/klst að ganga, 9 km/klst í krjúpandi taktískum gangi, 15 km/klst að skokka og um 21 km/klst í spretthlaupi. Hámarkshraði farartækja eru stilltu hámörkin fyrir grunnfarartæki Arma 3 í hverjum flokki, úr skrá þriðja aðila. Hægari hamir farartækja eru áætlanir.

**DCS / War Thunder / IL-2** (km/klst). Sérhvert loftfar og þyrla í litaspjaldinu hefur sitt eigið snið. Siglingar- og hámarkshraðar eru **birtar tölur** raunverulegu loftfaranna, sem herminn líkir vel eftir. Hámark er við sjávarmál fyrir þotur og í metinni hæð fyrir skrúfuloftför, og athugasemd hvers sniðs segir hvort. Hægur hraði og bardagahraði eru dæmigerð gildi. Farartæki á landi nota birta vegahraða raunverulegu farartækjanna, námundaða (**áætlað**). Skip nota birta hámarkshraða flokks síns.

**Annað** (m/s). **Áætlaðir** raunheimsvarnaðir: skrið 0,5, krjúp 1,5, ganga 1,4, hlaup 3,5, spretthlaup 6.

## Heimildir {#sources}

Counter-Strike 2
- [Vopnaskilgreiningar CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Vopnasíður CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com vopn (hlaupamargfaldarar)](https://valorant-api.com/v1/weapons)
- [VLR.gg: hnífshraði 6,75 m/s](https://vlr.gg/post/4240306)
- [Stuðningur Riot: Ganga, hlaupa og krjúpa](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA-spjallborð: hreyfihraði í Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Leiðarvísir um hreyfingu í Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Skýrsla fyrir útgáfu um 6,4 m/s spretthlaup](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: færsla um vélfræði Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (birtir engan hraða)

Arma
- [Bohemia-spjallborð: gönguhraði](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia-spjallborð: stillingar á hreyfihraða](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 ábendingaskrá: spretthlaupshraði](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma 3 farartækjatölur eftir fylkingu (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Wikipedia-upplýsingar um hverja gerð loftfars og þyrlu, tengdar frá hverju sniði í `air.json`
- [V-hraðar](https://en.wikipedia.org/wiki/V_speeds), fyrir dæmigerðan aðflugs- og bardagahraða
- [War Thunder-wiki](https://wiki.warthunder.com/), fyrir farartæki á landi
- [Arleigh Burke-tundurspillir](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), og birtir hraðar hinna skipaflokkanna

Annað
- [Æskilegur gönguhraði](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Fallið um gönguhraða Toblers](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
