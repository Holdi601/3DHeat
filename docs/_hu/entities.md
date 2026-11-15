---
title: "Entitások"
parent: "Szűrők és eszközök"
nav_order: 3
lang: "hu"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entitások

Az **Entitások** segítségével kiválaszthatsz egy játékost (vagy néhányat), és csak azt látod, hol járt az. Használd, ha a saját mozgásodat vagy egy ellenfelet akarod követni.

A panel akkor látszik, ha az adathalmaznak van személy-oszlopa. A fejléce a személyek számát mutatja, vagy `kiválasztott / összes` alakot, amíg van kijelölés (a *személy* egy játékos vagy MI, lásd a [szótárban](glossary.md)).

## Játékos kiválasztása {#pick-a-player}

1. Nyisd meg az **Entitások** részt az oldalsávon.
2. Írd be a nevének egy részét a keresőmezőbe.
3. Pipáld be a játékost. A fejléc például `2 / 10`-et mutat, és minden más eltűnik.
4. A **Törlés** újra mindenkit megmutat.

![Entitások, tíz játékosból kettő kiválasztva](../assets/img/en/entities-selected.webp)

A kijelölés csak a kiválasztott személyeket mutatja, a hőmódokban (pontok, vonalak, különbség, csapathő) éppúgy, mint a [figura-visszajátszás](box-replay.md) nyomvonalaiban, figuráiban és csíkjaiban. Hagyd üresen, ha mindenkit látni akarsz; ha mindenkit kiválasztasz, az ugyanaz, mintha senkit sem választottál volna.

## A panel {#the-panel}

| Rész | Jelentés |
|---|---|
| Keresőmező | *Keresés N entitásban...* - szűri a listát a név kis- és nagybetűtől független részszövegére. `N találat`-ot mutat, vagy `N találat, az első 200 látszik`-ot; *Semmi sem egyezik ezzel: „...”*, ha a keresés nem talál semmit. |
| Lista | Legfeljebb 200 személy (az első 200 egyező), mindegyik jelölőnégyzettel, a személy színmintájával és a nevével (*(névtelen)*, ha a név üres). |
| Játékban lévő jelzés | Amikor az idő fut, a lista azokat tartalmazza, akik *a lejátszófejnél játékban vannak*; a keresés mindenkit megtalál. |
| **MI (n)** | Összecsukható csoport, amely a játékosokon kívüli, MI által vezérelt egységeket tartalmazza. |
| **Listázottak hozzáadása** | Hozzáadja a kijelöléshez mindazokat, akik jelenleg a listán vannak. |
| **Csak a listázottak** | A kijelölést pontosan a listázottakra állítja. |
| **Törlés** | Kiüríti a kijelölést. |

## Korlátok {#limits}

A hőben a kijelölés szűrő, és a négy [szűrőhely](filters.md#rules) egyikét használja. Ha a többi szűrő már mind a négy helyet foglalja, a panel ezt írja: *Nem alkalmazva a hőre: minden szűrőhely foglalt. A figura-visszajátszás továbbra is csak ezeket az entitásokat mutatja. Egy szűrő törlésével a Szűrők alatt szabadítsd fel a helyet.* Egy szűrő törlésével szabadul fel egy hely.

A kijelölés minden új adathalmaznál törlődik. A Meccs fül ugyanezt a kijelölést állítja be, amikor egy játékosra fókuszál.

## Fejlesztőknek {#for-developers}

A kijelölés *persons* szűrőként van tárolva ([Szűrők](filters.md#for-developers)). Az árnyaló maszkja 65 536 személyazonosítót tart; a fölötte lévő személyt a hő nem rajzolja ki, amíg a kijelölés aktív.
