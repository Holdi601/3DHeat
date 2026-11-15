---
title: "Einingar"
parent: "Síur og verkfæri"
nav_order: 3
lang: "is"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Einingar

**Einingar** leyfir þér að velja einn leikmann (eða nokkra) til að sjá aðeins hvert sá leikmaður fór. Notaðu hann til að fylgja eigin hreyfingu eða einum andstæðingi.

Spjaldið birtist þegar gagnasafnið hefur persónudálk. Höfuðlínan sýnir fjölda persóna, eða `selected of total` á meðan val er virkt (*persóna* er einn leikmaður eða AI, sjá [orðasafnið](glossary.md)).

## Veldu leikmann {#pick-a-player}

1. Opnaðu **Einingar** í hliðarstikunni.
2. Skrifaðu hluta af nafninu í leitarreitinn.
3. Hakaðu við leikmanninn. Höfuðlínan sýnir til dæmis `2 of 10`, og allt annað hverfur.
4. **Hreinsa** sýnir alla aftur.

![Einingar með tveimur af tíu leikmönnum valdir](../assets/img/en/entities-selected.webp)

Valið sýnir aðeins valdar persónur, í hitahömunum (punktar, línur, mismunur, liðahiti) sem og í slóðum, fígúrum og rákum [fígúruendurspilunarinnar](box-replay.md). Skildu það eftir tómt til að sýna alla; að velja alla er það sama og að velja engan.

## Spjaldið {#the-panel}

| Hluti | Merking |
|---|---|
| Leitarreitur | *Search N entities...* - sía listann eftir undirstreng heitisins án tillits til stafastærðar. Sýnir `N matches`, eða `N matches, showing the first 200`; *Nothing matches "..."* þegar leitin finnur ekkert. |
| Listi | Allt að 200 persónur (fyrstu 200 sem passa), hver með reit, litasýni persónunnar og heiti (*(unnamed)* fyrir tómt heiti). |
| Vísbending um spilun | Þegar tíminn er í gangi heldur listinn þeim sem eru *in play at the playhead*; leit finnur allar. |
| **AI (n)** | Samfellanlegur hópur sem heldur einingum sem AI stýrir, aðskildum frá leikmönnum. |
| **Bæta við sýndum** | Bætir öllum sem eru á listanum núna við valið. |
| **Aðeins sýnd** | Gerir valið nákvæmlega þá sem eru á listanum. |
| **Hreinsa** | Tæmir valið. |

## Takmörk {#limits}

Í hitanum er valið sía og notar eitt af fjórum [síuraufum](filters.md#rules). Þegar hinar síurnar nota allar fjórar, segir spjaldið *Not applied to the heat: all filter slots are taken. The figure replay still shows only these entities. Clear a filter under Filters to free one.* Hreinsaðu síu til að losa rauf.

Valið er hreinsað við hvert nýtt gagnasafn. Flipinn Match setur sama val þegar hann beinir sjónum að einum leikmanni.

## Fyrir forritara {#for-developers}

Valið er geymt sem *persons*-sía ([Síur](filters.md#for-developers)). Gríma hnútaskyggjarans heldur 65.536 persónuauðkennum; persóna umfram það er ekki teiknuð í hitanum meðan val er virkt.
