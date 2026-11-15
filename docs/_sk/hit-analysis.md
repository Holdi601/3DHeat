---
title: "Analýza zásahov (karta Vozidlá)"
parent: "Prehrávanie"
nav_order: 4
lang: "sk"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Analýza zásahov

Karta **Vozidlá** ukazuje, kde bol zasiahnutý jeden tank, loď alebo vojak a kým. Použite ju, ak chcete vidieť, ktorá strana tanku dostáva zásahy, alebo ktorý nepriateľ spôsobuje škodu.

## Vyskúšajte to {#try-it}

1. Načítajte zápas, ktorý má zásahy (pozrite si tabuľku nižšie, ktoré hry ich dávajú).
2. Otvorte kartu **Vozidlá** hore.
3. V **Vozidlo** vyberte jednotku, napríklad typ tanku. Číslo v zátvorke je, koľko zásahov dostala.
4. Prečítajte si obrázok: každá značka je zásah, umiestnený tam, kde dopadol.
5. Otvorte **Kto zasiahol**, aby ste videli strelcov, zbrane alebo vozidlá strelcov, so zásahmi, škodou, zabitiami a vzdialenosťou.

![Karta Vozidlá: ukážkový tank so značkami zásahov a otvorené Kto zasiahol](../assets/img/en/hit-analysis-tank.webp)

Ak nie je nič načítané, alebo dáta nemajú zásahy na vozidlách, karta povie, čo chýba, a ktorý konvertor použiť.

```
        strelec ----> o  značka zásahu na figúre
        strelec ----> o
  [ figúra tanku ]
```

Obrázok ukazuje zásahy tam, kde dáta dávajú bod alebo časť tela. Rozpis (kto zasiahol, čím, ako silno, z akej vzdialenosti) funguje pre každý zdroj.

## Čo dáva každý zdroj {#what-each-source-gives}

| Zdroj | Bod na jednotke | Strelec | Zbraň | Škoda / výsledok |
|---|---|---|---|---|
| War Thunder | áno, v súradnicovej sústave jednotky, so smerom výstrelu | áno | vozidlo strelca | kritický, vážny, zničené moduly, smrteľný zásah |
| CS2 | časť tela (hitgroup) | áno | áno | poškodenie, pancier, zostávajúce zdravie |
| World of Tanks | áno (škatuľka komponentu, vstup a výstup) | áno | - | poškodenie alebo žiadne (odraz, bez prieniku) |
| World of Warships | áno, v súradnicovej sústave lode | áno | typ zásahu | - |
| Squad | vozidlá: áno – náraz umiestnený v súradnicovej sústave vozidla z jeho vlastnej pozície a smeru | nie (dáta žiadneho nepomenúvajú) | typ poškodenia | pokles zdravia vozidla v tom momente, zničené |
| Squad vojaci | nie: výsledky zásahu (kosť a bod nárazu) konvertor uchováva surové; riadky `impact` s `hitBone` sa čítajú hneď, ako ich zapíše | | | len zranenia a smrti |
| Arma (OCAP, zapisovač Arma 3) | nie: OCAP zaznamenáva, kto koho zasiahol alebo zabil, čím a z akej vzdialenosti, nie kde | áno | áno | zásah alebo zabitie, vzdialenosť |
| Tacview ACMI | áno, tam, kde objekt zbrane skončí do 30 m od jednotky (nie jej odpaľovač): jej posledné miesto v súradnicovej sústave jednotky (smer, sklon, náklon), prichádzajúce tou cestou, akou letela | `Parent` zbrane | názov zbrane, alebo AmmoType z Timeout | Outcome z Timeout, poklesy `Health`, `Destroyed`; bez zbrane zabitie alebo poškodenie bez bodu |
| Telemetria IL-2 (Watcher) | áno: udalosti `hit` / `damage` nesú bod v súradnicovej sústave vlastného lietadla hráča (brané ako x dopredu, y hore, z doprava) | nie | nie | sila |
| Dota 2 | nie: bojový záznam nemá miesto na hrdinovi | útočiaca jednotka | schopnosť alebo predmet (žiadny: útok) | poškodenie, smrť hrdinu |
| Battlefield 6 (GameCapture) | nie: záznam číta krvavý zoznam (zabitia, smrti, príznak headshotu), nie zásahy | | | |
| DCS / ďalšie živé zdroje Watchera | žiadne udalosti zásahov nad rámec toho, čo držia ich nahrávky Tacview | | | |

Keď žiadny zásah jednotky nemá bod, obrázok nezobrazí žiadne značky a rozpis **Kto zasiahol** sa otvorí sám: podľa strelca, zbrane alebo vozidla strelca, každý so svojimi zásahmi, škodou a zabitiami, a s mediánom a najvzdialenejšou vzdialenosťou.

## Obmedzenie na oblasť {#restrict-to-an-area}

Sekcia **Oblasť** obmedzí analýzu na zásahy, ktoré sa stali na mieste na mape.

1. Stlačte **Nakresliť obdĺžnik** alebo **Nakresliť mnohouholník** a kreslite na 3D teréne alebo na taktickej mape.
2. Vyberte **Obeť vnútri** (počíta zásah, keď bola zasiahnutá jednotka v oblasti) alebo **Strelec vnútri** (keď v oblasti bol ten, kto strieľal).
3. Stlačte **Použiť ako filter**. Štítky ukazujú „{n} z {total} zásahov v oblasti“.
4. **Obnoviť oblasť** odstráni všetky oblasti.

Každá oblasť je [objem](volumes.md), takže rovnaké tvary filtrujú aj teplotnú mapu a prehrávanie. Oblasť môže zahŕňať alebo vylučovať (vylučujúca oblasť vynechá svoje zásahy, zobrazené ako „{n} z {total} zásahov mimo oblasti“). Každá oblasť sa zobrazuje ako štítok s počtom zásahov jednotky, ktoré v nej boli; × na štítku ho odstráni. Počty, obrázok, rozpis a zoznamy filtra sa všetky riadia podľa toho.

Miesta zásahov: riadok, z ktorého zásah pochádza, nesie miesto jednej strany (obete pri zranení alebo zasiahnutí, strelca pri výstrele); miesto druhej je vlastná vzorka tej jednotky najbližšia v čase (do 5 s). Zásah, ktorého miesto strany nie je známe, sa vynechá, kým oblasť filtruje, a panel hovorí, koľko ich je („Vynechané, miesto nie je známe“).

## Pre vývojárov {#for-developers}

Ľubovoľný konvertor môže pridávať zásahy: riadok obete (`hit`, `impact`, `hurt`, `wounded`) s `hitBone` (kosť kostry, výber Arma, zásahová zóna Reforger – zmapovaná na hlavu, hrudník, brucho, ruky a nohy) alebo `hitLocalX/Y/Z` (metre, x dopredu, y hore, z doprava), pričom `other` je strelec a `damage` je poškodenie.
