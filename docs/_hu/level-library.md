---
title: "Pályakönyvtár"
parent: "Pályák és háttérgeometria"
nav_order: 4
lang: "hu"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Pályakönyvtár

A könyvtár a pályáidat ebben a böngészőben tartja meg, így nem kell őket újra betöltened és egyszerűsítened. **Ha az oldal adatait a böngészőben törlöd, a könyvtár is törlődik, és nincs exportálás.** Tartsd meg az eredeti fájljaidat.

Egy pálya feldolgozása - elemzés, osztályozás, összeillesztés, egyszerűsítés, textúrák csomagolása - lassú, és az eredmény mindig ugyanaz. A Háttér / pálya panel alján lévő **Könyvtár** a feldolgozott pályákat ebben a böngészőben tartja meg, így egy egyszerűsített hálót sosem építünk újra kétszer ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Pálya mentése és újratöltése {#save-and-reload-a-level}

1. Tölts be egy térképképet vagy egy 3D-s modellt, és nézd meg, hogy jól néz-e ki.
2. Nyomd meg a **Mentés a könyvtárba** gombot. A panel ezt írja: *Mentve. Legközelebb azonnal betöltődik.*
3. Legközelebb nyisd meg a **Könyvtár** listát, és nyomd meg a ▸ jelet a pályán.
4. A ✕ jellel töröld a bejegyzést, ha már nincs rá szükséged.

## Használata {#using-it}

| Vezérlő | Hatás |
|---|---|
| **Mentés a könyvtárba** | Eltárolja az aktuális pályát. A térképkép PNG-ként tárolódik a két horgonyával; egy modell a feldolgozott pufferei szerint. A panel ezt írja: *Mentve. Legközelebb azonnal betöltődik.* |
| Könyvtár-lista | Soronként egy tárolt pálya: név (fölé húzva a tárolt mérettel), modellnél háromszögek, képnél szélesség képpontban. |
| ▸ (*Betöltés*) | Az elemet az aktuális pályaként tölti be. |
| ✕ (*Törlés*) | Eltávolítja az elemet. |
| Használati sor | `X / Y használva.` - a böngésző tárhely-becslése erre az oldalra. |

Ha nincs tárolt semmi, a lista ezt írja: *Üres. Tölts be egy térképet vagy modellt, majd nyomd meg a „Mentés a könyvtárba” gombot.*

## Mi van tárolva {#what-is-stored}

| Fajta | Tárolva | Nincs tárolva |
|---|---|---|
| Térképkép | A kép (PNG), mérete, horgonyai | Magasság, tükrözés, átlátszóság, fényerő, színtelenítés - az alapértékekre áll vissza (magasság = az aktuális adathalmaz legalacsonyabb Y-ja, tükrözés be) |
| 3D-s pálya | Csúcspontok, csúcsszínek, textúrakoordináták, ezek csempéi és a textúra-atlasz, talaj-, szerkezet- és víz-háromszögek, szerkezeti élek, háromszögszámok | A részek nevei és az osztályozás okai, és minden megjelenési beállítás - egy friss importálás alapértékére áll vissza |

A könyvtárból betöltött modellnek nincs részlistája, határoló dobozai és talajmagasság-sávja pedig a csúcspontjaiból újra kiszámítódik.

## Hol van {#where-it-lives}

A böngésző IndexedDB-jében, a `3dheat` adatbázisban, a `levels` tárolóban, az oldal eredetéhez (a böngésző címsorában lévő címhez) tartozóan. Az adott böngészőprofilhoz kötődik: egy másik böngésző, egy másik profil vagy egy másik cím (például `localhost` a `127.0.0.1` helyett) egy másik, üres könyvtárat lát. Ha az oldal adatait a böngészőben törlöd, ez is törlődik. A régebbi verziók által struktúrák, színek vagy víz nélkül mentett bejegyzések továbbra is betöltődnek.
