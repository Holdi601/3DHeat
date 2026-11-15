---
title: "Útlit borðs"
parent: "Borð og bakgrunnsform"
nav_order: 3
lang: "is"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Útlit borðs

Þessar stillingar breyta því hvernig þrívítt borð lítur út, svo hitinn standi upp úr því og þú getir samt lesið staðinn. Ekkert hér breytir gögnunum.

## Fljótleg byrjun {#quick-start}

1. Hladdu þrívíddarborði ([Þrívídd borð](model-levels.md)).
2. Í **Bakgrunnur / borð** lækkaðu **Birtu** þar til hitinn er það bjartasta á skjánum.
3. Opnaðu **Upphleyping lands** og hækkaðu **Hallaskyggingu** eða **Styrk hæðarlína** þar til þú sérð hæð frá sléttu.
4. Opnaðu **Mannvirki**. Lækkaðu **Ógegnsæi flata** til að sjá inn í byggingar, eða kveiktu á **Áferð mannvirkja** til að sjá þær traustar.
5. Ef jörðin er með mynd málaða á sig, prófaðu **Áferð jarðar** af og á.

![Hlutarnir Upphleyping lands og Mannvirki opnir, með borðinu sýnt með vísbendingum um upphleypingu](../assets/img/en/level-appearance-sections.webp)

Með [þrívíddarborði](model-levels.md) hlaðið sýnir spjaldið Bakgrunnur / borð þessar stillingar. Sjálfgefin gildi eru þau sem nýinnflutt borð fær ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Breyting þeirra teiknar senuna aðeins upp aftur; hitauppsöfnunin helst.

## Allt borðið {#the-whole-level}

| Stilling | Sjálfgefið | Svið | Merking |
|---|---|---|---|
| **Ógegnsæi** | 100% | 0-100% | Undir 100% er borðið blandað og skrifar ekki dýpt, svo það hylur ekki lengur hitann. |
| **Birta** | 0,9 | 0-2 (sleði 64) | |

Borðið er teiknað með litlausum hætti - grátt land, lituð skel - svo hitinn sé eini mettaði hluturinn á skjánum. Ólíkt [kortamynd](map-images.md) hefur þrívítt borð enga afmettunarsleðu.

## Upphleyping lands {#ground-relief}

Úr fjarlægð líta hæð og slétta eins út í gráu, svo skoðarinn bætir við þremur vísbendingum. Hver svarar öðrum vanda:

| Stilling | Sjálfgefið | Merking |
|---|---|---|
| **Bil milli hæðarlína** | út frá hæðarbili landsins | Hæð á milli hæðarlína, lógaritmískt frá 1/4000 til 1/2 af hæðarbili borðsins; neðsti hluti sleðans er *slökkt*. Sjálfgefið er 1/40 af hæðarbili landsins, námundað í 1/2/5-skref - 10 m línur henta hlíð en eru gagnslausar á botni námu. Sérhver 5. lína er teiknuð sterkari. Hæðarlínur eru teiknaðar í skjárými, svo þær haldast einn pixill á breidd við hvaða aðdrátt sem er, og þær eru eina vísbendingin sem lifir af land sem er of flatt til að skyggja yfirhöfuð. |
| **Styrkur hæðarlína** | 35% | 0-100% |
| **Hallaskygging** | 55% | Dekkir eftir bratta, svo bakkar og klettar lesast frá hvaða sjónarhorni myndavélar sem er - ólíkt ljósi, sem jafnar út hvenær sem þú snýrð að því. |
| **Hæðarskali** | 50% | Lágt land dekkra, hátt land ljósara, yfir hæðarbil landsins: stóra formið. |

Haus hlutans sýnir stöðu hæðarlínanna: *á N m fresti*, bil hæðarlínanna, eða *engar hæðarlínur* þegar bilið er slökkt.

## Yfirborð lands {#ground-surface}

| Stilling | Sjálfgefið | Birt þegar | Merking |
|---|---|---|---|
| **Vatn** | á | borðið hefur vatn | Vötn, ár og hafið, teiknað flatt í fölbláu-gráu: engar vísbendingar landslagsins eiga við yfirborð sem er slétt skilgreiningarlega. |
| **Ógegnsæi vatns** | 60% | Vatn er á | Strandlínan og land undir grunnsævinu sést í gegnum gegnsætt vatn. |
| **Þríhyrningar jarðar** | 30% (0 fyrir borð með áferð) | alltaf | Eigin brúnir landslagsins teiknaðar yfir skyggða yfirborðið, og dofna út á milli 6% og 25% af breidd borðsins frá myndavélinni. Sýnir hversu grófplássuð jörðin var og gefur halla eitthvað til að meta fjarlægð á. Byggt við fyrstu notkun, sem tekur stund á stóru borði. |
| **Jörð aðeins sem vírrammi** | slökkt | alltaf | Kemur í stað landflatar með brúnum hans. Alveg skýringarmynd - hún gefur líka upp skygginguna, hæðarlínurnar og hulninguna, svo *Þríhyrningar jarðar* er yfirleitt betra val. |
| **Áferð jarðar** | á | borðið hefur áferðir | Teiknar jörðina með áferðunum sem skráin ber (malbik, kantur, gras). Möskvalýsingin er borin létt yfir, því áferðin ber nú þegar sína eigin fínu upphleypingu. **Birta** er leiðin til að kyrra hana undir hitanum; Afmettun tilheyrir kortamyndum. |
| **Skráður litur** | slökkt | borðið hefur hnitalit | Skyggir jörðina með litnum sem skönnun náði í stað gráa - endurbyggður vegur er annars óaðgreinanlegur frá kantinum. Útflutningar úr vélum bera engan; þegar hann vantar segir spjaldið *Þetta borð ber engan lit.* |

## Mannvirki {#structures}

Haus **Mannvirki** sýnir fjölda þríhyrninga mannvirkjanna; skýringin fyrir neðan segir hvernig þau eru teiknuð (*teiknuð traust í eigin áferðum* eða *teiknuð sem gegnsær skel svo þú sjáir hitann inni í þeim*) og hversu margir hlutar eru mannvirki.

| Stilling | Sjálfgefið | Merking |
|---|---|---|
| **Áferð mannvirkja** | á þegar mannvirkin bera áferðir | Teiknar mannvirkin traust, í eigin áferðum. Kveikt setur ógegnsæi flata í 100% og slekkur á brúnunum; slökkt fer aftur í litaðu gegnsæju skelina á 25%. Mannvirki með áferð er lýst frá þeirri hlið sem myndavélin sér, því skilti er tveir fletir hvor á móti öðrum og hvor vinnur dýptarprófið er undir ávölun komið. |
| **Vírrammabrúnir** | á; slökkt yfir 300.000 þríhyrningum mannvirkja eða þegar áferð er | Afrituðum brúnum mannvirkjanna, ein lína á hverja brún. |
| **Ógegnsæi brúna** | 50% | |
| **Skelfletir** | á | Dauf yfirborð með skærum Fresnel-brún, svo bygging lesist sem rúmmál en ekki búr eða þokubakki. |
| **Ógegnsæi flata** | 25% (35% yfir 300.000 þríhyrningum mannvirkja, 100% með áferð) | 0-60% á sleðanum, upp í 100% með handfanginu. Hafðu það lágt: traust mannvirki fela gögnin inni í þeim. |
| **Skarpar brúnir** | á (slökkt þegar áferð er) | Skyggir hvern þríhyrning eftir eigin normal, reiknuðum í brotaskyggingunni út frá skjárýmisafleiðum. Útflutt borð eru samsoðin og bera meðaltalsnormala, sem ávalar hvert hornið á kassa í „bráðna filmu“; að skipta hverjum hnúti til að laga það myndi margfalda hnútabuffann. Slökktu á því fyrir borð þar sem bogadregnu yfirborðin skipta meira máli en hornin. |
| **Litblær mannvirkja** | Blágrænn | Litavali og forstillingarnar **Blágrænn**, **Rafgulur**, **Fjólublár**, **Hvítur**. |
| **Sýna flokkun hluta (N)** | | Hver hluti, flokkur hans og ástæðan; sjá [Þrívídd borð](model-levels.md#ground-structures-and-water). |

## Að skera borðið {#cutting-the-level}

[Sneiðin](slice.md) og, með *Skera borðið líka*, [fjarlægðarútilokun](depth-and-culling.md#distance-culling) skera jörðina, mannvirkin og vatnið við sömu fleti og hitinn.
