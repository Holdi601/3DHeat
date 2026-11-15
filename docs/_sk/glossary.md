---
title: "Slovník pojmov"
nav_order: 21
lang: "sk"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Slovník pojmov

Krátke významy slov, ktoré tento web používa, jednoduchým jazykom. Každé heslo odkazuje na stránku, ktorá ho vysvetľuje celé.

## Dáta {#data}

**Riadok.** Jeden riadok vašich dát: jedna vec na jednom mieste a v jednom čase, napríklad „hráč 7 bol tu v 12. sekunde“. Prehliadač kreslí každý riadok. [Formáty dát](data-formats.md)

**Stĺpec.** Jeden druh hodnoty v riadkoch, napríklad x, y, z, čas alebo tím. Prehliadač odhaduje, ktorý stĺpec je ktorý, a odhad môžete zmeniť. [Mapovanie stĺpcov](column-mapping.md)

**CSV.** Obyčajná textová tabuľka: jeden riadok na riadok, hodnoty oddelené čiarkami. Takmer každý program ju vie zapísať. [Načítanie súborov](loading-files.md)

**Parquet.** Kompaktný tabuľkový súbor, ktorý sa číta rýchlo, aj s miliónmi riadkov. Je to najlepší formát, ktorý možno prehliadaču dať. [Načítanie súborov](loading-files.md)

**Udalosť.** Niečo, čo sa stalo, napríklad výstrel, zásah, zabitie alebo vzlet. Riadok môže byť udalosť, alebo len „bol som tu“. [Filtre](filters.md)

**Osoba.** Ten, kto riadky vytvoril: hráč, pilot, auto alebo tank. Jedna osoba je jeden riadok pozícií v čase. [Relácie, osoby a skupiny](sessions-persons-groups.md)

**Skupina (tím).** Množina osôb zobrazená v rovnakej farbe, napríklad Modrí a Červení. [Relácie, osoby a skupiny](sessions-persons-groups.md)

**Relácia (zápas, kolo).** Jedno spustenie hry. Zápas alebo kolo je relácia. Prehliadač môže zobraziť jednu reláciu alebo položiť ich veľa cez seba. [Relácie, osoby a skupiny](sessions-persons-groups.md)

**Level.** 3D mapa, na ktorej sa dáta udiali: terén, budovy, steny. Riadky sa ukážu tam, kde sa na leveli stali. [Levely a geometria pozadia](levels.md)

## Pozeranie na dáta {#looking-at-the-data}

**Heatmapa.** Obrázok, na ktorom miesta, ktorých sa dotklo veľa riadkov, žiaria viac. Studené miesta sú tiché, horúce sú rušné. [Teplo](heat.md)

**Teplo.** Koľko sa stalo na mieste. Prehliadač na každom mieste sčíta žiarenie každého riadku; súčet je teplo. [Teplo](heat.md)

**Sprite.** Malá žiariaca škvrna, ktorú prehliadač kreslí pre jeden riadok. Mnoho prekrývajúcich sa spritov sa sčíta do tepla. [Tvar spritu](sprite-shape.md)

**Expozícia.** Ako jasný je obraz. Ako pri fotoaparáte: príliš veľa expozície všetko zbelie a príliš málo skryje detaily. [Farba a expozícia](colour-and-exposure.md)

**Nasýtenie.** Množstvo tepla, ktoré sa počíta ako „tak horúce, ako ide farby“. Znížte ho, aby sa ukázali tiché miesta; zvýšte ho, aby ste videli len tie najhorúcejšie. [Farba a expozícia](colour-and-exposure.md)

**Objem.** Kváder alebo tvar, ktorý umiestnite do 3D pohľadu. Prehliadač spočíta, čo je vnútri, a dokáže objemy porovnávať medzi sebou. [Objemy a porovnanie](volumes.md)

**Filter.** Pravidlo, ktoré skryje riadky, ktoré nechcete, napríklad „len zabitia“ alebo „len tím Červení“. [Filtre](filters.md)

## Replay {#replay}

**Figúra.** Malý model tanku, lietadla, auta alebo vojaka, ktorý sa hýbe tam, kde dáta hovoria, že bol. [Figúry](figures.md)

**LOD (úroveň detailu).** Každá figúra má podrobnú, jednoduchšiu a veľmi jednoduchú verziu. Blízke používajú podrobnú a vzdialené jednoduchú, takže sa môžu naraz kresliť tisíce. [Figúry](figures.md)

## Preteky {#racing}

**Kolo.** Jedna cesta okolo trate, od čiary späť k čiare. [Načítanie kôl](race-loading-laps.md)

**Referenčné kolo.** Kolo, s ktorým sa porovnávajú všetky ostatné. Rozdiely sa ukazujú ako „rýchlejšie“ alebo „pomalšie“ oproti nemu. [Načítanie kôl](race-loading-laps.md)

**Vrchol zákruty.** Bod zákruty, kde je auto najbližšie k vnútornému okraju. [Analýza zákruta po zákrute](race-corner-analysis.md)

**Prešmyk.** Ako veľmi pneumatika kĺže. Malý prešmyk dáva najviac priľnavosti; príliš veľa a auto šmyká. [Analýza pretekov: metóda](race-analytics.md)

**Obálka.** Čo auto dokáže pri každej rýchlosti: ako silno môže zatáčať, brzdiť a zrýchľovať, skôr než šmykne. [Analýza pretekov: metóda](race-analytics.md)

## Čísla lietadiel {#aircraft-numbers}

**ALT.** Výška: výška nad zemou alebo hladinou mora. [Prehrávanie zápasu](match-replay.md#labels-and-statistics)

**TAS.** Pravá vzdušná rýchlosť: ako rýchlo sa lietadlo hýbe vzduchom. [Prehrávanie zápasu](match-replay.md#labels-and-statistics)

## Počítač {#computer}

**GPU.** Grafická karta alebo čip. Kreslí obraz a pri kreslení miliónov škvŕn je oveľa rýchlejšia než hlavný procesor. [Dva backendy](backends.md)

**WebGPU / WebGL2.** Dva spôsoby, akými prehliadač dovolí stránke použiť GPU. WebGPU je novší. Prehliadač môže použiť ktorýkoľvek a vyberie najlepší, aký má váš prehliadač. [Dva backendy](backends.md)

## Slová z Counter-Strike {#counter-strike-words}

**Kolo.** Jeden krátky boj v rámci zápasu. Jedna strana ho vyhrá a skóre sa zvýši o jeden.

**Eko, nútený nákup, plný nákup.** Koľko peňazí strana minie na zbrane na začiatku kola. Eko šetrí peniaze a nakúpi takmer nič (pod 1 500 $ na hráča v priemere). Nútený nákup minie, čo má (pod 4 000 $). Plný nákup kúpi všetko, čo môže. [Analýza zápasu](match-analysis.md)

**Výmena.** Zabitie, ktoré splatí zabitie: vy ste zastrelený a spoluhráč zastrelí vášho vraha do 5 sekúnd. [Analýza zápasu](match-analysis.md)

**KAST.** Podiel kôl, v ktorých hráč dostal zabitie, asistenciu, prežil alebo bol vymenený. Vyššie číslo znamená, že hráč pomohol v ďalších kolách. [Analýza zápasu](match-analysis.md)

**ADR.** Priemerné poškodenie za kolo: koľko zdravia hráč v každom kole stratil od nepriateľov. [Analýza zápasu](match-analysis.md)
