---
title: "Daudzas spēles vienlaikus"
parent: "Atskaņojums"
nav_order: 2
lang: "lv"
source: "many-matches.md"
source_hash: "a37a7b4cf8c2"
translated: true
outdated: false
---

# Daudzas spēles vienlaikus

**Daudzas spēles vienlaikus** atskaņo daudzas spēles vienu virs otras, tāpēc redzat, kur katras spēles spēlētāji parasti iet. Izmantojiet to, lai salīdzinātu simtiem vai tūkstošiem spēļu vienā attēlā.

Katra spēle sākas no sava sākuma, un tās vienības kustas kā figūras. Faili tiek ievietoti tieši grafikas kartē, un nekāda pilna tabula netiek veidota. Tāpēc tas atskaņojas vienmērīgi tur, kur parasta ielāde izsmeltu atmiņu.

![Desmit tanku spēles uzliktas viena virs otras, viena krāsa katrai spēlei](../assets/img/lv/many-matches.webp)

## Kā to lietot {#how-to-use-it}

1. Atveriet **Daudzas spēles vienlaikus** siltumkartes sānjoslā.
2. Nospiediet **Faili…** (izvēlieties daudzus failus), **Mape…** (mapi un tās apakšmapes) vai **Pievienot mapi…** (pievienot tam, kas ir ielādēts).
3. Skatītājs pārslēdzas uz figūru pārklājumu un sākas no sākuma. Nospiediet **Atskaņot**.

Katrs fails ir viena spēle (vai satur vairākas). Strādā Parquet faili un [`.3dheat`](container.md) konteineri. Failam vajag pozīciju, laika un vienības kolonnu; nosaukuma, tipa un puses kolonnas tiek saglabātas. Citi faili un konvertētāju palīgfaili (lidojums, ziņojumi, notikumi, tērzēšana, mērķi) tiek izlaisti. Parastai tabulai skatiet [Datu ievade](getting-data-in.md).

## Iestatījumi {#settings}

| Iestatījums | Ko tas dara |
|---|---|
| **Pēc komandas** / **Pēc spēles** | Krāsot pēc puses vai katrai spēlei atsevišķi. |
| **Atzīmēt, kur vienības gāja bojā** | Atzīme katrā vietā, kur vienība gāja bojā, uz 10 s, 30 s, 120 s vai visu līdz šim. |

Panelis rāda, cik spēļu, vienību, rindu un pozīciju tika nolasīts, izmantoto atmiņu un ielādes laiku. *Vieta priekš* ir, cik vēl pozīciju grafikas karte varētu uzņemt. *Figūras no* ir izmērs ekrānā, zem kura vienība tiek zīmēta kā maza bultiņa, nevis kā savu figūru.

Figūru izskats izmanto tās pašas vadības kā [spēles atkārtojums](match-replay.md#figures): **Figūru izmērs**, **Mazākā figūra ekrānā** un **No attāluma**.

## Padomi {#tips}

- Kad viss neiederētos atmiņā, pozīcijas tiek retinātas (tiek saglabāta tikai pozīcija ik pēc dažiem metriem), un panelis to saka.
- Siltuma režīmi strādā arī ar pārklājuma datiem.
- Statistikai par tūkstošiem spēļu bez to zīmēšanas skatiet [Masveida analīze](mass-analysis.md).
