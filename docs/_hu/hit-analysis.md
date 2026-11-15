---
title: "Találatelemzés (Járművek fül)"
parent: "Visszajátszás"
nav_order: 4
lang: "hu"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Találatelemzés

A **Járművek** fül megmutatja, hol találtak el egy tankot, hajót vagy katonát, és ki találta el. Használja arra, hogy lássa, a tank melyik oldalát lövik, vagy melyik ellenség okozza a sebzést.

## Próbálja ki {#try-it}

1. Töltsön be egy meccset, amelyben vannak találatok (az alábbi táblázat megmutatja, mely játékok adnak találatokat).
2. Nyissa meg a tetején lévő **Járművek** fület.
3. A **Jármű** alatt válasszon egy egységet, például egy tanktípust. A zárójelben lévő szám azt mutatja, hány találatot kapott.
4. Olvassa az ábrát: minden jel egy találat, oda helyezve, ahol becsapódott.
5. Nyissa meg a **Ki találta el** részt a lövők, fegyverek vagy lövő járművek megtekintéséhez: találatokkal, sebzéssel, ölésekkel és távolsággal.

![A Járművek fül: egy demó tank találatjelekkel, és nyitott Ki találta el](../assets/img/en/hit-analysis-tank.webp)

Ha nincs betöltve semmi, vagy az adatokban nincsenek járműtalálatok, a fül megmondja, mi hiányzik, és melyik konvertert kell használni.

```
        lövő ----> o  találatjel az ábrán
        lövő ----> o
  [ tank-figura ]
```

Az ábra ott mutatja a találatokat, ahol az adatok pontot vagy testrészt adnak meg. A bontás (ki találta el, mivel, mennyire erősen, milyen távolságból) minden forrásnál működik.

## Mit ad az egyes forrás {#what-each-source-gives}

| Forrás | Pont az egységen | Lövő | Fegyver | Sebzés / kimenetel |
|---|---|---|---|---|
| War Thunder | igen, az egység koordinátarendszerében, a lövés irányával | igen | a lövő járműve | kritikus, súlyos, modulok megsemmisültek, halálos lövés |
| CS2 | testrész (hitgroup) | igen | igen | sebzés, páncél, megmaradt életerő |
| World of Tanks | igen (alkatrészdoboz, belépési és kilépési pont) | igen | - | sebzés vagy semmi (pattanás, nincs áthatolás) |
| World of Warships | igen, a hajó koordinátarendszerében | igen | találattípus | - |
| Squad | járművek: igen – a becsapódás a jármű koordinátarendszerében, a saját helyzetéből és irányából | nem (az adatok nem nevezik meg) | a sebzés típusa | a jármű életerejének esése abban a pillanatban, megsemmisült |
| Squad-katonák | nem: a találati eredmények (csont és becsapódási pont) nyersen maradnak a konverterben; a `hitBone`-os `impact` sorok olvasódnak, amint a konverter írja őket | | | sebesülések és halálesetek csak |
| Arma (OCAP, az Arma 3 felvevője) | nem: az OCAP azt rögzíti, ki kit talált el vagy ölt meg, mivel és milyen távolságból, de nem azt, hogy hol | igen | igen | találat vagy ölés, távolság |
| Tacview ACMI | igen, ahol egy fegyverobjektum 30 m-en belül ér véget egy egységtől (nem az indítója): az utolsó helye az egység koordinátarendszerében (irány, dőlés, billentés), azon az úton érkezve, ahogy repült | a fegyver `Parent` mezője | a fegyver neve, vagy egy Timeout AmmoType-ja | Timeout Outcome-ja, a `Health` esései, `Destroyed`; fegyver nélkül ölés vagy sebzés pont nélkül |
| IL-2 telemetria (Watcher) | igen: a `hit` / `damage` események a pontot a játékos saját repülőgépének koordinátarendszerében hordozzák (x előre, y fel, z jobbra értelmezve) | nem | nem | az erő |
| Dota 2 | nem: a harci napló nem ad helyet egy hősön | a támadó egység | a képesség vagy tárgy (nincs: támadás) | sebzés, a hős halála |
| Battlefield 6 (GameCapture) | nem: a rögzítés a halálok-hírfolyamot olvassa (ölések, halálesetek, fejlövés-jelző), nem a találatokat | | | |
| DCS / más Watcher élő források | nincs találatesemény azon túl, amit a Tacview-felvételeik tartalmaznak | | | |

Ahol az egységnek egyik találata sem rendelkezik ponttal, az ábra nem mutat jelet, és a **Ki találta el** bontás magától megnyílik: lövő, fegyver vagy a lövő járműve szerint, mindegyik a találataival, sebzésével és ölésével, valamint a medián és a legtávolabbi távolsággal.

## Területre korlátozás {#restrict-to-an-area}

A **Terület** szakasz az elemzést azokra a találatokra korlátozza, amelyek a térkép egy helyén történtek.

1. Nyomja meg a **Téglalap rajzolása** vagy a **Sokszög rajzolása** gombot, és rajzoljon a 3D-s talajra vagy a taktikai térképre.
2. Válassza az **Áldozat bent** (a találat akkor számít, ha az eltalált egység a területen volt) vagy a **Lövő bent** (ha az, aki lőtt) opciót.
3. Nyomja meg a **Használat szűrőként** gombot. A jelvények ezt mutatják: „{n} / {total} találat a területen”.
4. A **Terület visszaállítása** eltávolít minden területet.

Minden terület egy [térfogat](volumes.md), így ugyanezek az alakzatok a hőtérképet és a visszajátszást is szűrik. Egy terület bevehet vagy kizárhat (a kizáró terület kihagyja a benne lévő találatokat, és ezt mutatja: „{n} / {total} találat a területen kívül”). Minden terület egy jelvényként jelenik meg azzal, hogy az egység hány találata volt benne; a jelvény ×-e eltávolítja. A számok, az ábra, a bontás és a szűrőlisták mind ehhez igazodnak.

Egy találat helyei: a sor, ahonnan származik, az egyik fél helyét hordozza (az eltalált áldozatét sebzésnél vagy eltalálásnál, a lövőét lövésnél); a másik fél helye az adott egység saját, időben legközelebbi mintája (5 másodpercen belül). Az a találat, amelynek a fél helye nem ismert, kimarad, amíg egy terület szűr, és a panel megmondja, hány ilyen van („Kihagyva, nincs ismert hely”).

## Fejlesztőknek {#for-developers}

Bármelyik konverter hozzáadhat találatokat: egy áldozati sorral (`hit`, `impact`, `hurt`, `wounded`), amely `hitBone`-t (egy csontvázcsontot, Arma-kijelölést, Reforger-találati zónát – fejre, mellkasra, hasra, karokra és lábakra leképezve) vagy `hitLocalX/Y/Z`-t (méterben, x előre, y fel, z jobbra) tartalmaz, a `other` a lövő, a `damage` pedig a sebzés.
