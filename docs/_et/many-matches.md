---
title: "Palju matše korraga"
nav_order: 10
lang: "et"
source: "many-matches.md"
source_hash: "f2239cef5e91"
translated: true
outdated: false
---

# Palju matše korraga

**Palju matše korraga** mängib paljusid matše üksteise peale, nii et näed, kuhu iga matši mängijad tavaliselt lähevad. Kasuta seda, et võrrelda sadu või tuhandeid matše ühes pildis.

Iga matš algab oma algusest ja tema üksused liiguvad kujudena. Failid lähevad otse graafikakaardile ja ühtegi täielikku tabelit ei ehitata, seega see mängib sujuvalt seal, kus tavaline laadimine mälu otsa jookseks.

![Kümme tankimatši üksteise peale laotud, üks värv matši kohta](../assets/img/en/many-matches.webp)

## Kuidas seda kasutada {#how-to-use-it}

1. Ava Soojuskaardi külgribal **Palju matše korraga**.
2. Vajuta **Failid…** (vali palju faile), **Kaust…** (kaust ja selle alamkaustad) või **Lisa kaust…** (lisa laetule).
3. Vaatur lülitub kujude ülekattele ja algab algusest. Vajuta **Esita**.

Iga fail on üks matš (või sisaldab mitut). Töötavad Parquet failid ja [`.3dheat`](container.md) konteinerid. Fail vajab asukoha-, aja- ja üksuseveergu; nime-, tüübi- ja poolveerud hoitakse alles. Teised failid ja konverterite kõrvalfailid (lend, sõnumid, sündmused, vestlus, eesmärgid) jäetakse vahele. Tavalise tabeli kohta vaata [Andmete sisselugemine](getting-data-in.md).

## Seaded {#settings}

| Seade | Mida ta teeb |
|---|---|
| **Meeskonniti** / **Mängude kaupa** | Värv poole järgi või värv matši kohta. |
| **Märgi, kus üksused surid** | Märk, kus iga üksus suri, 10 s, 30 s, 120 s või kõik seni. |

Paneel näitab, mitu matši, üksust, rida ja asukohta loeti, kasutatud mälu ja laadimisaega. *Ruumi* on see, kui palju rohkem asukohti graafikakaart veel võtaks. *Kujud alates* on ekraanisuurus, mille alla üksus joonistatakse väikese nooletaolise asemel oma kujuna.

Kujude välimus kasutab samu juhtnuppe nagu [Matši kordus](match-replay.md#figures): **Kujude suurus**, **Väikseim kujund ekraanil** ja **Kaugelt**.

## Nipid {#tips}

- Kui kõik ei mahuks mällu, hõrendatakse asukohti (alles jäetakse ainult asukoht iga mõne meetri järel) ja paneel ütleb seda.
- Soojusrežiimid töötavad ka ülekatte andmetel.
- Statistika kohta tuhandete matšide üle ilma neid joonistamata vaata [Massanalüüs](mass-analysis.md).
