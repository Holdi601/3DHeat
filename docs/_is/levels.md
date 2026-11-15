---
title: "Borð og bakgrunnsform"
nav_order: 13
has_children: true
lang: "is"
source: "levels.md"
source_hash: "1283adc1548a"
translated: true
outdated: false
---

# Borð og bakgrunnsform

Borð er þrívíði staðurinn þar sem leikurinn fór fram - kort, bær, braut. Settu eitt fyrir aftan gögnin þín og þú sérð *hvar* hitinn er. Spjaldið **Bakgrunnur / borð** (sjá [Orðasafn](glossary.md) fyrir „borð“) gefur þér þrjár tegundir samhengis:

- **kortamynd**, staðsetta með tveimur akkerum - sjá [Kortamyndir](map-images.md);
- **þrívítt borð** - `.glb`, `.gltf`, `.obj`, `.stl` eða `.ply` - skipt í jörð, mannvirki og vatn og einfaldað við innflutning - sjá [Þrívíð borð](model-levels.md) og [Útlit borðs](level-appearance.md).
- **bakgrunnur heimsins** - fyrir upptöku sem segir hvar á jörðinni hún er (Tacview ACMI-skrá), raunverulegt landslag, vegi, vatn, flugvelli og byggingar, sótt úr opnum gögnum - sjá [Bakgrunnur heimsins](world-backdrop.md).

Þegar ekkert er hlaðið er sennan dökk með hnitaneti og lituðum ásum (**Hnitanet** og **Ásar** í [Myndavél og sena](camera.md)), og spjaldið segir *Ekkert hlaðið - sennan sýnir hnitanet og ása. Bættu við kortamynd eða borðneti til að gefa hitanum samhengi.*

Borðið er sameiginlegt fyrir alla þrjá flipana: braut sem hlaðin er í flipanum Kappakstursgreining er sama borð og hitakortið sýnir.

![Spjaldið Bakgrunnur / borð með hlaðið borð: hnappar fyrir Kortamynd og Þrívíddarlíkan, Vígvöllur, Ógegnsæi, Birta, Vista í safn og listinn Safn](../assets/img/is/level-panel.webp)

## Settu borð fyrir aftan gögnin þín {#put-a-level-behind-your-data}

1. Hladdu gögnunum fyrst ([Hvernig gögn eru sett inn](getting-data-in.md)), svo borðið sé lagað að þeim.
2. Opnaðu **Bakgrunnur / borð** á hliðarstikunni.
3. Ýttu á **Kortamynd…** fyrir mynd eða **Þrívíddarlíkan…** fyrir þrívítt borð, og veldu skrána. Fyrir upptöku úr raunheimi notaðu **Bakgrunnur heimsins** eða **Vígvöllur** í staðinn.
4. Bíddu eftir að framvindulínan klárist. Stórt líkan er fyrst einfaldað (sjá **Markmið einföldunar** hér að neðan).
5. Ýttu á **F** í sýninni til að ramma allt inn. Notaðu **Ógegnsæi** og **Birtu** þar til hitinn sker sig úr borðinu.
6. Ýttu á **Vista í safn** ef þú ætlar að nota borðið aftur ([Borðasafn](level-library.md)).

## Hvað borð gerir fyrir hitann {#what-a-level-does-for-the-heat}

- Það **hylur**: gagnapunktar á bak við það eru dempaðir eftir yfirborðum, og gagnapunktar á bak við landslagið eru faldir ([Dýpt og útilokun](depth-and-culling.md)). Án borðs er engin hulning.
- Það er **skorið** af [Sneiðinni](slice.md) og, með *Skera borðið líka*, af [fjarlægðarafskurði](depth-and-culling.md#distance-culling), ásamt hitanum.
- Það er það eina sem [dýptarskerpa](camera.md#depth-of-field) gerir óskýrt, auk hnitanetsins og kassanna.
- Þrívítt borð **víkkar fjærplan myndavélarinnar** þegar það er stærra en gögnin: nær- og fjærplan eru kvörðuð út frá gagnasafninu, og útflutt kort nokkra kílómetra á breidd sæti annars alveg á bak við fjærplanið og skilji eftir tóma sýn. Fjærplanið verður 3 × lárétt útbreiðsla borðsins þegar hún er stærri, nærplanið færist með því (að minnsta kosti fjær / 100.000) til að halda dýptarnákvæmninni sem hulningin byggir á, og flughraðinn er hækkaður í að minnsta kosti útbreiðsla / 12. Það er aðeins alltaf víkkað, aldrei þrengt.

## Spjaldið, ofan frá og niður {#the-panel-top-to-bottom}

| Hluti | Nánar |
|---|---|
| **Kortamynd…**, **Þrívíddarlíkan…** | Hladdu einu; það kemur í stað núverandi borðs. |
| **Bakgrunnur heimsins**, **Gleyma kortareitum** | Aðeins fyrir gagnasafn með landfræðilegri tilvísun: byggir raunverulega staðinn undir því sem borð, eða eyðir sóttu reitunum. [Bakgrunnur heimsins](world-backdrop.md) |
| **Markmið einföldunar** | Þríhyrningafjárhagsáætlunin fyrir næsta innflutning líkans: *Full - engin einföldun* (sjálfgefið), *Há - 8M*, *Miðlungs - 3M*, *Lág - 800k*, *Útlína - 100k*. [Þrívíð borð](model-levels.md#simplification) |
| Framvinda og **Hætta við** | Meðan afkóðun eða innflutningur stendur yfir. |
| Innflutningsathugasemd | Þríhyrningar fyrir og eftir, skiptingin í jörð / mannvirki / vatn, smáatriðastigið sem var notað. |
| Heiti og stærð | `breidd×hæð px · x × z m/px` fyrir mynd, `N þríhyrningar (af M)` fyrir líkan. |
| **Ógegnsæi**, **Birta** | Báðar tegundirnar. |
| Stýringar mynda | **Afmetta**, **Snúa norðri/suðri við**, **Staðsetning** (tvö akkeri), **Laga að mörkum gagnanna**, **Hæð**. [Kortamyndir](map-images.md) |
| Stýringar líkans | Upphleyping lands, vatn, þríhyrningar jarðar, vírrammi, áferð, skráður litur, mannvirki, flokkun hluta. [Útlit borðs](level-appearance.md) |
| **Vista í safn**, **Fjarlægja** | [Borðasafn](level-library.md); Fjarlægja tekur borðið úr sambandi. |
| **Safn** | Borð sem eru geymd í þessum vafra. [Borðasafn](level-library.md) |

## Síður í þessum kafla {#pages-in-this-section}

- [Kortamyndir](map-images.md)
- [Þrívíð borð](model-levels.md) - snið, hlutar, flokkun, einföldun, áferðir
- [Útlit borðs](level-appearance.md) - sérhver stilling fyrir þrívítt borð
- [Borðasafn](level-library.md)
- [Bakgrunnur heimsins](world-backdrop.md) - raunverulegi heimurinn undir upptöku, úr opnum gögnum

Hvernig borð eru sótt úr leikjum og vélum er verkefni sérstöku útflutningsverkfæranna (sjá [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) í geymslunni); samninginn sem þau skrifa eftir er tekinn saman í [Þrívíð borð](model-levels.md#the-exporter-contract).
