---
title: "Más versenyjátékok"
parent: "Versenyelemzés"
nav_order: 59
lang: "hu"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Más versenyjátékok a nézegetőben

A nézegető sok versenyjáték köreit olvassa, nem csak egyet. Ez az oldal felsorolja őket, és megmondja, hogyan kapható ki belőlük egy kör.

## A játékok {#the-games}

| Játék | Rögzítő | Csúszás a fájlban? | A világ tükrözött? | Megjegyzések |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out UDP-n), vagy az FH Companion körfájljai és a hozzájuk tartozó `.tele.gz` | igen, kerekenként (normalizálva) | igen (balkezes világ) | minden FH Companion körfájl mellett lévő `.tele.gz` adja meg minden kerék csúszását; a körfájl önmagában nem |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (osztott memória) | igen, kerekenként | a körökből mérve | ABS és kipörgésgátló működése, kerékterhelések, hőmérsékletek is |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | nem, a kerékfordulatszámokból számolva | a körökből mérve | ralinál a laza talajt és az ugrásokat másképp ítéljük meg |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | nem | a körökből mérve | nincsenek kerékfordulatszámok |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (egy mod) | nem, a kerékfordulatszámokból számolva | a körökből mérve | |
| Trackmania | az Openplanet bővítmény, `telemetry --game trackmania --install` | kerekenként egy csúszási együttható | a körökből mérve | arcade fizika: a csúszásokat másképp ítéljük meg |
| iRacing | nincs: a saját `.ibt` fájlja | nem (nincs naplózva); a yawból számolva | nem (GPS-alapú) | a naplózást az autóban az Alt+L billentyűvel kapcsold be |

## Hogyan rögzíts egy kört {#how-to-record-a-lap}

1. Válaszd ki a játékodat a táblázatból, és állítsd be úgy, ahogy a rögzítő oldala az adott játékhoz írja (egy beállítás a játékban, egy mod, vagy semmi iRacing esetén). A lépések játékonként különböznek, ezért a rögzítők dokumentumaiban vannak: [GameCapture: játékok](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Indítsd el a rögzítőt, majd vezess. Körönként egy fájlt ír.
3. A **Versenyelemzés** fülön nyomd meg a **Körfájlok betöltése…** gombot, és válassz ki legalább két kört ugyanazon pályáról (lásd: [Körök betöltése](race-loading-laps.md)).

Ralinál a rögzítő fájlonként egy szakaszfutást ad, a Forzánál pedig a legkönnyebb kezdés az FH Companion könyvtára a hozzá tartozó `.tele.gz` fájlokkal a körfájlok mellett.

## Amit a rögzítők dokumentálnak {#what-the-recorders-document}

Hogy mindegyik játék hogyan rögzíthető, mit küld, honnan származnak az elrendezései, és mely pályák exportálhatók a fájljaiból, azt a rögzítők dokumentálják: [GameCapture: játékok](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (nyilvános, a [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) repóban), a minden rögzítő által írt körfájl pedig a [GameCapture: a körformátum](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Mit csinál a nézegető velük {#what-the-viewer-does-with-them}

Minden játék végül `heat3d-lap` fájlokká lesz (vagy kör-CSV-vé, vagy közvetlenül olvassuk, mint az iRacing `.ibt` fájlját), a `src/race/schema.ts` szabványos csatornaneveivel, és egy `meta` résszel, amely megmondja, mit jelentenek a számai: hogyan van skálázva a csúszása, hogy pálya, rali vagy arcade-e, és ha ismert, a felület. Így a **Versenyelemzés** fül mindegyiket egyformán kezeli. Ha nincs pályamodell betöltve, a **Versenyelemzés** fül a körök saját szórásából rajzol utat, így minden játék használható modell nélkül is.

Amit egyik rali játék sem küld - a gumi csúszását -, azt a nézegető kiszámolja: ahol a játék küld kerék érintkezési felület- vagy felületi sebességet, ott a kerék sebességét az autó sebességéhez mérve (`(kerék - autó) / autó`), ahol csak a forgást küldi, ott annak alapján és a körön magán mért gördülési sugár alapján. A csúszási szöget az autó saját sebességvektorából kapjuk (Forza, az AC játékok, Trackmania, RBR), a világ sebességvektorának az autó tengelyeire vetítéséből (EA WRC, DiRT, BeamNG), vagy az irány és a pálya irányának különbségéből. Azt, hogy az autó levegőben van-e, a kerekei érintkezéséből, terheléséből vagy felfüggesztéséből határozzuk meg. Lásd: `src/race/derive.ts`.

Ahol egy játék világa balkezes - a Forzáé az -, ott a pálya tükrözve jön ki a nézegetőben; a körök saját kormányzása és felfüggesztése elárulja, és a **Versenyelemzés** fül felajánlja, hogy megfordítsa az egyik tengelyt. Azoknál a játékoknál, ahol a kezesség nincs dokumentálva (RBR, BeamNG, Trackmania), ugyanígy járunk el: mérjük, nem feltételezzük.

A vezetési csatornákon túl a rögzítők megtartják, amit az egyes játékok hozzátesznek: az AC játékok ABS- és kipörgésgátló-működését, a fékeloszlást, a DRS-t, a boxutca-sebességkorlátozót, a turbónyomást és a fékbetét- és tárcsaélettartamot; az iRacing segédbeállításait, a fékeloszlást, az üzemanyagot, az olaj- és víz-hőmérsékletet, és minden más csatornát, amit a saját nevén naplóz. A nézegető a saját csatornatáblázatából rajzolja ezeket - lámpákként, szintekként, jelekként, grafikonokon -, így több adat rögzítéséhez nincs szükség változtatásra a nézegetőben.
