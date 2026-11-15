---
title: "Margir leikir í einu"
nav_order: 10
lang: "is"
source: "many-matches.md"
source_hash: "f2239cef5e91"
translated: true
outdated: false
---


# Margir leikir í einu

**Margir leikir í einu** spilar marga leiki ofan á hvern annan, svo þú sérð hvert leikmenn hvers leiks fara venjulega. Notaðu það til að bera saman hundruð eða þúsundir leikja á einni mynd.

Hver leikur byrjar á sínu eigin upphafi og einingar hans hreyfast sem fígúrur. Skrárnar fara beint inn á skjákortið og engin heil tafla er búin til, svo það spilast mjúklega þar sem venjuleg hleðsla myndi klárast af minni.

![Tíu skriðdrekaleikir lagðir hverjir yfir aðra, einn litur á leik](../assets/img/en/many-matches.webp)

## Hvernig á að nota það {#how-to-use-it}

1. Opnaðu **Margir leikir í einu** í hliðarstiku Hitakorts.
2. Ýttu á **Skrár…** (veldu margar skrár), **Mappa…** (mappa og undirmöppur hennar) eða **Bæta við möppu…** (bæta við því sem er hlaðið).
3. Skoðarinn skiptir yfir í fígúruyfirlögnina og byrjar á upphafinu. Ýttu á **Spila**.

Hver skrá er einn leikur (eða geymir nokkra). Parquet-skrár og [`.3dheat`](container.md)-ílát virka. Skrá þarf staðsetningu, tíma og einingadálk; dálkar fyrir heiti, gerð og hlið eru geymdir. Aðrar skrár, og hliðarskrár breyta (flug, skilaboð, atburðir, spjall, markmið), eru sleppt. Fyrir venjulega töflu, sjá [Hvernig gögn eru sett inn](getting-data-in.md).

## Stillingar {#settings}

| Stilling | Hvað hún gerir |
|---|---|
| **Eftir liði** / **Eftir leik** | Litað eftir hlið, eða einn litur á hvern leik. |
| **Merkja hvar einingar dóu** | Merki þar sem hver eining dó, í 10 s, 30 s, 120 s, eða allt hingað til. |

Spjaldið sýnir hversu margir leikir, einingar, línur og staðsetningar voru lesnar, minnið sem notað var og hleðslutímann. *Rými fyrir* er hversu margar fleiri staðsetningar skjákortið gæti enn tekið. *Fígúrur frá* er stærðin á skjánum, undir henni er einingin teiknuð sem lítil ör í stað fígúru sinnar.

Útlit fígúranna notar sömu stýringar og [endurspilun leiks](match-replay.md#figures): **Stærð fígúra**, **Minnsta mynd á skjá** og **Í fjarlægð**.

## Ábendingar {#tips}

- Þegar allt myndi ekki passa í minni eru staðsetningar grisjaðar (aðeins ein staðsetning á nokkurra metra fresti er geymd) og spjaldið segir það.
- Hitastillingarnar virka líka á gögn yfirlagsins.
- Fyrir tölfræði yfir þúsundir leikja án þess að teikna þá, sjá [Fjöldagreining](mass-analysis.md).
