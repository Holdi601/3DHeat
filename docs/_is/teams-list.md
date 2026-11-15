---
title: "Listi yfir lið"
parent: "Síur og verkfæri"
nav_order: 2
lang: "is"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Listi liða

Spjaldið **Lið** leyfir þér að fela lið eða setja það öðrum megin í samanburði. Notaðu það til að skoða aðeins Blue, eða til að spyrja „hvert fer Blue sem Red gerir ekki?“.

*Hópur* er lið eða hlið, til dæmis Blue og Red ([Hópar](sessions-persons-groups.md#group)). Spjaldið birtist þegar gagnasafnið hefur hópdálk; fjöldi hópa er á hausnum þess. Í Team heat-ham hefur hliðarstikan líka kafla sem heitir **Liðssýn** með eigin stillingum; þessi síða fjallar um listann **Lið**.

## Fela lið {#hide-a-team}

1. Opnaðu **Lið** í hliðarstikunni.
2. Afhakaðu reitinn (*Visible*) við liðið sem þú vilt fela. Myndin uppfærist strax.
3. Ýttu á **Sýna alla** til að færa öll lið aftur.

![Listi liða: Blue 5p, Red 5p, með Show all](../assets/img/en/teams-list.webp)

## Hver lína {#each-row}

| Hluti | Merking |
|---|---|
| Reitur (*Visible*) | Sýnir eða felur hópinn. |
| Litasýni | Litur hópsins: [liðahitalitur](team-heat.md) hans í Team heat-ham, grunnlitur hans í hinum hömunum. |
| Heiti | Merkimiði hópsins (fullur merkimiði við músarbendingu). |
| **+** / **-** (Difference-ham) | Setur hópinn öðrum megin, + eða -, í [mismuninum](difference.md); smelltu aftur á virka hnappinn til að setja hann hvorugu megin. |
| `Np` (aðrir hamir) | Fjöldi persóna þar sem fyrsta línan er í þessum hópi. |

![Difference-ham: Blue á + hliðinni, Red á - hliðinni](../assets/img/en/teams-list-difference.webp)

## Hnappar {#buttons}

| Hnappur | Áhrif |
|---|---|
| **Sýna alla** | Gerir alla hópa sýnilega aftur. |
| **Skipta jafnt** (Difference-ham) | Fyrri helmingur hópanna (námundaður upp) á +, hinir á -; sama skipting og hver hleðsla byrjar á. |

## Hvað það gerir að fela hóp {#what-hiding-a-group-does}

- Í **Hiti**, **Liðahiti** og **Línur** leggja línur hópsins ekkert til.
- Í **Mismunur** leggur falinn hópur ekkert til hvoru megin sem hann er, líka með skiptingu eftir öðrum dálki (sjá [Mismun](difference.md#for-developers)).
- Í **fígúruyfirlaginu** eru persónur sem fyrsta lína er í þeim hópi ekki teiknaðar.
- Í **Liðahiti** halda hinir hóparnir litunum sínum: tónar eru úthlutaðir út frá heildarfjölda hópa, ekki út frá því sem er sýnilegt, svo tvær myndir haldast samanburðarhæfar.

Breyting á sýnileika endurræsir söfnunina. Við hvert nýtt gagnasafn eru allir hópar sýnilegir aftur.

Ábending spjaldsins breytist eftir hamnum: í Difference útskýrir hún + og -; í Team heat útskýrir hún að litasýnin séu litirnir sem hver hópur teiknast í.
