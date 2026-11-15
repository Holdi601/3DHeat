---
title: "Analýza zásahů (karta Vozidla)"
parent: "Přehrání"
nav_order: 4
lang: "cs"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Analýza zásahů

Karta **Vozidla** ukazuje, kde byl zasažen jeden tank, loď nebo voják, a kdo ho zasáhl. Použijte ji, když chcete vidět, která strana tanku dostává palbu, nebo který nepřítel dělá škodu.

## Vyzkoušejte to {#try-it}

1. Načtěte zápas, ve kterém jsou zásahy (které hry je dávají, ukazuje tabulka níže).
2. Otevřete nahoře kartu **Vozidla**.
3. Pod **Vozidlo** vyberte jednotku, například typ tanku. Číslo v závorce je, kolik zásahů dostala.
4. Přečtěte obrázek: každá značka je zásah, umístěný tam, kde dopadl.
5. Otevřete **Kdo zasáhl**, abyste viděli střelce, zbraně nebo vozidla střelců, se zásahy, poškozením, zabitími a vzdáleností.

![Karta Vozidla: ukázkový tank se značkami zásahů a otevřeným Kdo zasáhl](../assets/img/en/hit-analysis-tank.webp)

Když není nic načteno, nebo data nemají zásahy na vozidlech, karta řekne, co chybí, a který převodník použít.

```
        střelec ----> o  značka zásahu na figuře
        střelec ----> o
  [ figura tanku ]
```

Figura ukazuje zásahy tam, kde data dávají bod nebo část těla. Rozpis (kdo zasáhl, čím, jak silně, z jaké dálky) funguje pro každý zdroj.

## Co dává každý zdroj {#what-each-source-gives}

| Zdroj | Bod na jednotce | Střelec | Zbraň | Poškození / výsledek |
|---|---|---|---|---|
| War Thunder | ano, v souřadnicích jednotky, se směrem výstřelu | ano | vozidlo střelce | kritický, vážný, zničené moduly, smrtící zásah |
| CS2 | část těla (hitgroup) | ano | ano | poškození, pancíř, zbývající zdraví |
| World of Tanks | ano (box komponenty, vstup a výstup) | ano | - | poškození, nebo žádné (odraz, bez průniku) |
| World of Warships | ano, v souřadnicích lodi | ano | typ zásahu | - |
| Squad | vozidla: ano – dopad umístěný do souřadnic vozidla z jeho vlastní pozice a směru | ne (data žádné nepojmenovávají) | typ poškození | pokles zdraví vozidla v tom okamžiku, zničeno |
| Vojáci ze Squad | ne: výsledky zásahu (kost a bod dopadu) převodník drží v surovém stavu; řádky `impact` s `hitBone` se načtou, jakmile je zapíše | | | jen zranění a smrti |
| Arma (OCAP, záznamník Arma 3) | ne: OCAP zaznamenává, kdo koho zasáhl nebo zabil, čím a z jaké dálky, ne kde | ano | ano | zásah nebo zabití, vzdálenost |
| Tacview ACMI | ano tam, kde objekt zbraně skončí do 30 m od jednotky (ne její odpalovač): jeho poslední místo v souřadnicích jednotky (směr, sklon, náklon), přicházející tak, jak letěl | `Parent` zbraně | název zbraně, nebo AmmoType z Timeoutu | Outcome z Timeoutu, poklesy `Health`, `Destroyed`; bez zbraně zabití nebo poškození bez bodu |
| Telemetrie IL-2 (Watcher) | ano: události `hit` / `damage` nesou bod v souřadnicích vlastního letadla hráče (bere se jako x vpřed, y nahoru, z vpravo) | ne | ne | síla |
| Dota 2 | ne: bojový log nemá místo u hrdiny | útočící jednotka | schopnost nebo předmět (žádný: útok) | poškození, smrt hrdiny |
| Battlefield 6 (GameCapture) | ne: záznam čte přehled zabití (zabití, smrti, příznak headshotu), ne zásahy | | | |
| DCS / ostatní živé zdroje Watcheru | žádné události zásahů nad rámec toho, co drží jejich nahrávky Tacview | | | |

Kde žádný zásah jednotky nemá bod, figura nemá žádné značky a rozpis **Kdo zasáhl** se otevře sám: podle střelce, zbraně nebo vozidla střelce, každý se svými zásahy, poškozením a zabitími, a s mediánem a nejdelší vzdáleností.

## Omezení na oblast {#restrict-to-an-area}

Sekce **Oblast** omezí analýzu na zásahy, které se staly na místě na mapě.

1. Stiskněte **Nakreslit obdélník** nebo **Nakreslit mnohoúhelník** a kreslete na 3D zemi nebo na taktické mapě.
2. Zvolte **Oběť uvnitř** (počítá se zásah, když byla jednotka zasažena v oblasti), nebo **Střelec uvnitř** (když v ní byl ten, kdo střílel).
3. Stiskněte **Použít jako filtr**. Štítky ukazují „{n} z {total} zásahů v oblasti“.
4. **Obnovit oblast** odstraní všechny oblasti.

Každá oblast je [objem](volumes.md), takže stejné tvary filtrují i teplotní mapu a přehrání. Oblast může zahrnovat, nebo vylučovat (vylučující oblast vynechá své zásahy, zobrazí se jako „{n} z {total} zásahů mimo oblast“). Každá oblast se ukáže jako štítek s tím, kolik zásahů jednotky v ní bylo; × na štítku ji odstraní. Počty, obrázek, rozpis i seznamy filtru se řídí podle toho.

Místa zásahů: řádek, ze kterého zásah pochází, drží místo jedné strany (oběti u zranění nebo zasažení, střelce u výstřelu); místo té druhé je vzorek téže jednotky nejbližší v čase (do 5 s). Zásah, jehož místo strany není známo, se při filtrování oblasti vynechá a panel řekne, kolik jich je („Vynecháno, místo není známo“).

## Pro vývojáře {#for-developers}

Každý převodník může přidávat zásahy: řádek oběti (`hit`, `impact`, `hurt`, `wounded`) s `hitBone` (kost skeletu, výběr Arma, zóna zásahu Reforger – namapovaná na hlavu, hrudník, břicho, paže a nohy) nebo `hitLocalX/Y/Z` (metry, x vpřed, y nahoru, z vpravo), s `other` jako střelcem a `damage`.
