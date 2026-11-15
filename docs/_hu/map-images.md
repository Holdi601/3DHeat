---
title: "Térképképek"
parent: "Pályák és háttérgeometria"
nav_order: 1
lang: "hu"
source: "map-images.md"
source_hash: "e7a4a651d75d"
translated: true
outdated: false
---

# Térképképek

A térképkép egy lapos kép – kistérkép, műholdfelvétel, alaprajz –, amelyet az adatai alá fektetünk, hogy lássa, hol van a hő. Megmondja a megjelenítőnek, hová tartozik a kép, úgy, hogy rajta két pontot két helyhez rögzít a világban (a „horgonyok”).

## Térképkép betöltése és elhelyezése {#load-and-place-a-map-image}

1. Először töltse be az adatait ([Adatok betöltése](getting-data-in.md)).
2. A **Háttér / pálya** részben nyomja meg a **Térképkép…** gombot, és válassza ki a képet. Ez az adatok területére nyúlik.
3. Ha a kép el lett mozdítva, nyomja meg az **Illesztés az adatok határaihoz** gombot. Az 1. horgony a kép bal felső sarkába, a 2. horgony a jobb alsó sarkába kerül, az adatok szélein.
4. Ha a hő nem illeszkedik a képhez, válasszon két messze lévő tereptárgyat (például egy épület két átellenes sarkát vagy két kereszteződést). Olvassa le mindegyik pixelét a képen, és a világbeli pozícióját (vigye a mutatót a [vonalzóval](measure.md), hogy lássa az **X**-et és a **Z**-t).
5. Írja be őket az **Elhelyezés** részbe: az **1. horgony** esetén a tereptárgy **px**, **py**, **világ X**, **világ Z** értékeit; ugyanígy a **2. horgony**nál.
6. Ellenőrzés: egy nyomvonalnak vagy hőforrásnak, amelyről tudja, hogy egy úton van, most is azon az úton kell lennie. Állítsa a számokat, amíg így nem lesz.

![Az Elhelyezés szakasz két horgonnyal és hővel egy térképképen](../assets/img/en/map-images-placement.webp)

A két tereptárgynak a pixeloszlopban és a pixelsorban is különböznie kell, különben a panel ezt írja ki: *A két horgony ugyanabban a pixelsorban vagy oszlopban van*.

## Betöltés {#loading}

Bármilyen képformátum, amelyet a böngésző dekódolni tud. A **8192 px**-nél hosszabb oldalú képet 8192-re kicsinyítjük (ez a legnagyobb él, amelyet a GPU-tól kérünk), és a panel ezt írja ki: *W×H-ról w×h-ra kicsinyítve*.

Betöltéskor a kép az adatok X–Z határaira nyúlik (vagy ±1000 egységre adatkészlet nélkül), északkal felfelé, az adatok legalacsonyabb Y-ján. Az alapértékek: **Átlátszatlanság** 100%, **Fényerő** 0,7, **Színtelenítés** 100%, **Észak/dél tükrözése** be: telítetlenül és halványan, mert a háttér dolga, hogy segítse a hőforrás megtalálását, nem az, hogy versenyezzen vele.

## Vezérlők {#controls}

| Vezérlő | Alapérték | Tartomány | Jelentés |
|---|---|---|---|
| **Átlátszatlanság** | 100% | 0–100% | |
| **Fényerő** | 0,7 | 0–2 (jog 64) | |
| **Színtelenítés** | 100% | 0–100% | Szürke háttér, telített hő. A térkép színe versengene az adatok színével. |
| **Észak/dél tükrözése** | be | | Melyik képsor a világ maximális Z-je. Adatkészlet betöltött állapotában a váltás a horgonyokat az adatok határaihoz is újra illeszti. |
| **Elhelyezés**: 1. horgony, 2. horgony | a kép sarkai az adatok határain | | Minden horgony egy pixel a képen – **px** (balról, 0 és a szélesség között) és **py** (felülről, 0 és a magasság között) –, és az a világkoordináta, ahol áll: **világ X** és **világ Z**. A méretarány és az eltolás a párból adódik. |
| **Illesztés az adatok határaihoz** | | | Az 1. horgonyt a kép bal felső sarkára, a 2. horgonyt a jobb alsó sarkára teszi, az adatok X–Z határain. Pontos elhelyezés kiindulópontja. Adatkészlet kell hozzá. |
| **Magasság** | az adatok legalacsonyabb Y-ja | az adatok min. Y-ja – 500 és a max. Y + 500 között (jog max. Y + 100 000) | A térképsík magassága. Az adatok alá állítsa, hogy semmit ne takarjon el. |

A név sor a `szélesség×magasság px · x × z m/px` értéket mutatja, vagyis egy pixel világbeli méretét tengelyenként.

## A jelenetben {#in-the-scene}

A kép egyetlen textúrázott négyszög a magasságon. Teljes átlátszatlanságnál mélységet ír, így a talajként részt vesz a [takarásban](depth-and-culling.md); 100% alatti átlátszatlanságnál keveredik, és nem ír mélységet, így semmit sem takar. A [vonalzó](measure.md) a síkján mér. A [pályakönyvtár](level-library.md) a képes pályát a horgonyaival együtt tárolja.

## Dota 2 térkép {#dota-2-map}

A **Térképkép…** mellett lévő **Dota 2-térkép** lehívja azt a rajzot az aktuális Dota 2 térképről, amelyet az [OpenDota](https://www.opendota.com) a meccsoldalain mutat, és a [Watcher](https://github.com/Holdi601/3DHeat-Watcher) által Dota 2 visszajátszásokból írt táblázatok alá helyezi ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). A képet a gomb megnyomásakor tölti le az opendota.com, és nem része a 3DHeat-nek; a legújabb patch rajzát az OpenDota saját listájából vesszük, a listát nem tudva beolvasni pedig a 7.40-es rajzot.

| | |
|---|---|
| Forrás | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Elhelyezés | Az OpenDota kalibrálása: a kép a Dota világegységeken -8192-től 8064-ig fut mindkét tengelyen (a 128 egységes cellák 64-től 191-ig), északkal felül. A visszajátszási táblázat tengelyeivel (Z felfelé, Y tükrözve) ez a világ X -8192-től 8064-ig és a világ Z -8064-től 8192-ig. Kb. 18 egység pixelenként. |
| Magasság | 0. A hősök 0 és kb. 600 között állnak. |
| Megjelenés | Fényerő 0,8, színtelenítés 50%. |

Egy nyilvános meccs 7.40-es patchű visszajátszásán ellenőrizve: minden hős nyomvonala a rajzolt sávokat követi, és a visszajátszás által elhelyezett tornyok, kaszárnyák és ősök a rajzolt bázisokra esnek. A **Felül** nézet a térképet mutatja, északkal a képernyő alján, ahogy minden Z-felfelé táblázatot mutat, amelynek Y-ja tükrözött.

A rajz az OpenDota-é, a Valve térképéről; a Valve nem támogatja a 3DHeat-et.

### A 3D-s térkép {#the-3d-map}

Telepített Dota 2 mellett a Watcher [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) parancsa (`python -m heat3d_watch dota-map -o dota.glb`) a játék saját fájljaiból 3D-ben elkészíti a térképet: talaj, sziklafalak, víz, fák és épületek, a visszajátszás-táblák egységeiben és tengelyeivel. Töltsd be a fájlt egyszer ezzel: **3D-modell…**. A néző a részeiről ismeri fel (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` a `dotaMap.ts` fájlban), azonnal a [pályakönyvtárba](level-library.md) teszi egy régebbi helyére, és ezt jelzi is. Onnantól a(z) **Dota 2-térkép** ezt a 3D-s térképet tölti be a könyvtárból a rajz letöltése helyett; ha nincs ilyen a könyvtárban, letölti a rajzot, és elmondja, hogyan készül a 3D-s térkép. A fájl a saját telepítésedből származik, és a gépeden marad.

## Fejlesztőknek {#for-developers}

### Hogyan helyezik el a horgonyok a képet {#how-the-anchors-place-the-image}

A [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts) fájlból, az *a* és *b* horgonyokkal:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
a (0, 0) pixel itt van:  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Két horgony tengelyenként egymástól függetlenül rögzíti a méretarányt és az eltolást, így a térkép X-en és Z-n másképp nyúlhat, de nem forgatható. A horgonyoknak **mindkét** pixelkoordinátában különbözniük kell; ha egy sort vagy oszlopot osztanak, nem származtatható méretarány, a térkép nem rajzolódik ki, és a panel ezt írja ki: *A két horgony ugyanabban a pixelsorban vagy oszlopban van*.
