---
title: "Slovníček"
nav_order: 21
lang: "cs"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Slovníček

Krátké významy slov, která tyto stránky používají, prostou řečí. Každé heslo odkazuje na stránku, která jej vysvětluje celé.

## Data {#data}

**Řádek.** Jeden řádek vašich dat: jedna věc, která se stala na jednom místě a v jednom čase, například „hráč 7 byl tady v sekundě 12“. Prohlížeč kreslí každý řádek. [Datové formáty](data-formats.md)

**Sloupec.** Jeden druh hodnoty v řádcích, například x, y, z, čas nebo tým. Prohlížeč odhaduje, který sloupec je který, a odhad můžete změnit. [Mapování sloupců](column-mapping.md)

**CSV.** Prostá textová tabulka: jeden řádek na řádku, hodnoty oddělené čárkami. Téměř každý program ji umí zapsat. [Načítání souborů](loading-files.md)

**Parquet.** Kompaktní soubor tabulky, který se rychle čte, i s miliony řádků. Je to nejlepší formát, který můžete prohlížeči dát. [Načítání souborů](loading-files.md)

**Událost.** Něco, co se stalo, například výstřel, zásah, zabití nebo vzlet. Řádek může být událost, nebo jen „byl jsem tady“. [Filtry](filters.md)

**Osoba.** Ten, kdo řádky vytvořil: hráč, pilot, auto nebo tank. Jedna osoba je jedna řada pozic v čase. [Relace, osoby a skupiny](sessions-persons-groups.md)

**Skupina (tým).** Množina osob zobrazených stejnou barvou, například Modrý a Červený. [Relace, osoby a skupiny](sessions-persons-groups.md)

**Relace (zápas, kolo).** Jedno spuštění hry. Zápas nebo kolo je relace. Prohlížeč může ukázat jednu relaci, nebo jich mnoho položit přes sebe. [Relace, osoby a skupiny](sessions-persons-groups.md)

**Level.** 3D mapa, na které se data odehrála: země, budovy, zdi. Řádky se zobrazí tam, kde se na levelu staly. [Levely a geometrie pozadí](levels.md)

## Dívání se na data {#looking-at-the-data}

**Teplotní mapa.** Obrázek, na kterém místa, kterých se dotýká mnoho řádků, žhnou víc. Studená místa jsou klidná, horká rušná. [Teplo](heat.md)

**Teplo.** Kolik se na místě stalo. Prohlížeč sečte záři každého řádku na každém místě; součet je teplo. [Teplo](heat.md)

**Sprite.** Malá zářící skvrna, kterou prohlížeč kreslí pro jeden řádek. Mnoho překrývajících se sprite se sčítá na teplo. [Tvar sprite](sprite-shape.md)

**Expozice.** Jak jasný je obrázek. Jako u fotoaparátu: příliš mnoho expozice všechno zbělí a příliš málo skryje detaily. [Barva a expozice](colour-and-exposure.md)

**Nasycení.** Množství tepla, které se počítá jako „tak horké, jak barvy dovolí“. Snížíte ho, aby vynikla klidná místa; zvýšíte, abyste viděli jen nejžhavější. [Barva a expozice](colour-and-exposure.md)

**Objem.** Kvádr nebo tvar, který umístíte do 3D pohledu. Prohlížeč počítá, co je uvnitř, a umí objemy porovnávat mezi sebou. [Objemy a porovnání](volumes.md)

**Filtr.** Pravidlo, které skryje řádky, které nechcete, například „jen zabití“ nebo „jen tým Červení“. [Filtry](filters.md)

## Přehrání {#replay}

**Figura.** Malý model tanku, letadla, auta nebo vojáka, který se pohybuje tam, kde data říkají, že byl. [Figury](figures.md)

**LOD (úroveň detailu).** Každá figura má podrobnou, jednodušší a velmi jednoduchou verzi. Blízké používají podrobnou, vzdálené jednoduchou, takže lze kreslit tisíce najednou. [Figury](figures.md)

## Závody {#racing}

**Kolo.** Jedna jízda po trati, od startovní čáry zpět na čáru. [Načítání kol](race-loading-laps.md)

**Referenční kolo.** Kolo, s nímž se všechna ostatní porovnávají. Rozdíly se ukazují jako „rychleji“ nebo „pomaleji“ než ono. [Načítání kol](race-loading-laps.md)

**Apex.** Bod zatáčky, kde je auto nejblíž vnitřnímu okraji. [Analýza zatáčku po zatáčce](race-corner-analysis.md)

**Skluz.** Jak moc pneumatika klouže. Trochu skluzu dává nejvíc přilnavosti; příliš a auto smýká. [Analytika závodů: metoda](race-analytics.md)

**Obálka.** Co auto umí při každé rychlosti: jak silně může zatáčet, brzdit a zrychlovat, než začne klouzat. [Analytika závodů: metoda](race-analytics.md)

## Čísla letadel {#aircraft-numbers}

**ALT.** Výška: výška nad zemí nebo mořskou hladinou. [Přehrání zápasu](match-replay.md#labels-and-statistics)

**TAS.** Pravá vzdušná rychlost: jak rychle se letadlo pohybuje vzduchem. [Přehrání zápasu](match-replay.md#labels-and-statistics)

## Počítač {#computer}

**GPU.** Grafická karta nebo čip. Kreslí obrázek a při kreslení milionů skvrn je mnohem rychlejší než hlavní procesor. [Dva backendy](backends.md)

**WebGPU / WebGL2.** Dva způsoby, jak prohlížeč dovolí stránce použít GPU. WebGPU je novější. Prohlížeč umí obojí a vybere nejlepší, kterou váš prohlížeč má. [Dva backendy](backends.md)

## Slova z Counter-Strike {#counter-strike-words}

**Kolo.** Jeden krátký boj uvnitř zápasu. Jedna strana jej vyhraje a skóre se zvýší o jedna.

**Eco, vynucený nákup, plný nákup.** Kolik peněz strana na začátku kola utratí za zbraně. Eco šetří peníze a nakoupí téměř nic (v průměru pod 1 500 $ na hráče). Vynucený nákup utratí, co má (pod 4 000 $). Plný nákup koupí vše, co může. [Analýza zápasu](match-analysis.md)

**Výměna.** Zabití, které oplatí zabití: vás někdo zastřelí a spoluhráč zabije vraha do 5 sekund. [Analýza zápasu](match-analysis.md)

**KAST.** Podíl kol, v nichž hráč získal zabití, asistenci, přežil, nebo byl oplacen. Vyšší číslo znamená, že hráč pomohl ve více kolech. [Analýza zápasu](match-analysis.md)

**ADR.** Průměrné poškození za kolo: kolik zdraví hráč každé kolo vzal nepřátelům. [Analýza zápasu](match-analysis.md)
