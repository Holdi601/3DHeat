---
title: "Pályák és háttérgeometria"
nav_order: 13
has_children: true
lang: "hu"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: true
---

# Pályák és háttérgeometria

A pálya az a 3D-s hely, ahol a játék történt – egy térkép, egy város, egy pálya. Ha az adat mögé tesz egyet, látja, *hol* van a hő. A **Háttér / pálya** panel (a „pálya” fogalmához lásd a [szójegyzéket](glossary.md)) háromféle kontextust ad:

- egy **térképkép**, két horgonnyal georeferálva – lásd [Térképképek](map-images.md);
- egy **3D-s pálya** – `.glb`, `.gltf`, `.obj`, `.stl` vagy `.ply` – talajra, szerkezetekre és vízre bontva, importáláskor egyszerűsítve – lásd [3D-s pályák](model-levels.md) és [Megjelenés](level-appearance.md);
- egy **világ-háttér** – olyan felvételhez, amely megmondja, hol van a Földön (Tacview ACMI-fájl) –, a valódi terep, utak, vizek, repülőterek és épületek nyílt adatokból letöltve – lásd [Világ-háttér](world-backdrop.md).

Ha semmi nincs betöltve, a jelenet sötét, rácsot és színes tengelyeket mutat (a **Rács** és **Tengelyek** a [Kamera és jelenet](camera.md) alatt), a panel pedig ezt írja: *Nincs betöltve semmi – a jelenet rácsot és tengelyeket mutat. Adjon hozzá térképképet vagy pályahálót, hogy a hő kontextust kapjon.*

A pálya mindhárom fülön közös: a Versenyelemzés fülön betöltött pálya ugyanaz, amelyet a hőtérkép mutat.

![A Háttér / pálya panel betöltött pályával: Térképkép és 3D-modell gombok, Hadszíntér, Átlátszatlanság, Fényerő, Mentés a könyvtárba és a Könyvtár lista](../assets/img/hu/level-panel.webp)

## Pálya az adat mögé {#put-a-level-behind-your-data}

1. Először töltse be az adatot ([Adatok betöltése](getting-data-in.md)), hogy a pálya ahhoz illeszkedjen.
2. Nyissa meg a **Háttér / pálya** részt az oldalsávban.
3. Nyomja meg a **Térképkép…** gombot egy képhez, vagy a **3D-modell…** gombot egy 3D-s pályához, és válassza ki a fájlt. Valódi világfelvételhez használja inkább a **Valós világ háttérként** vagy a **Hadszíntér** gombot.
4. Várja meg, míg a haladássor véget ér. Egy nagy modell először egyszerűsödik (lásd lentebb az **Egyszerűsítési cél** részt).
5. Nyomja meg az **F** gombot a nézetben, hogy mindent keretbe foglaljon. Állítsa az **Átlátszatlanságot** és a **Fényerőt**, amíg a hő ki nem emelkedik a pályából.
6. Nyomja meg a **Mentés a könyvtárba** gombot, ha újra használni fogja a pályát ([Pályakönyvtár](level-library.md)).

## Mit tesz a pálya a hőért {#what-a-level-does-for-the-heat}

- **Takar.** A mögötte lévő adatpontok felületenként elhalványulnak, a terep mögötti adatpontok pedig el vannak rejtve ([Mélység és kihagyás](depth-and-culling.md)). Pálya nélkül nincs takarás.
- A [Szelet](slice.md) és – a *A pálya vágása is* beállítással – a [távolságkihagyás](depth-and-culling.md#distance-culling) is vágja, a hővel együtt.
- Ez az egyetlen dolog, amelyet a [mélységélesség](camera.md#depth-of-field) elmos, a rácson és a dobozokon kívül.
- Egy 3D-s pálya **kitágítja a kamera távoli síkját**, ha nagyobb az adatnál: a közeli és távoli síkot az adatkészletből kalibráljuk, és egy több kilométeres exportált térkép egészen a távoli sík mögött maradna, üres nézetet hagyva. A távoli sík ilyenkor a pálya vízszintes kiterjedésének 3-szorosa lesz, ha az nagyobb, a közeli sík vele együtt mozog (legalább távoli / 100 000), hogy megmaradjon a mélységpontosság, amelytől a takarás függ, és a repülési sebesség legalább kiterjedés / 12 lesz. Csak tágítjuk, sosem szűkítjük.

## A panel, felülről lefelé {#the-panel-top-to-bottom}

| Rész | Részletek |
|---|---|
| **Térképkép…**, **3D-modell…** | Egyet betölt; lecseréli az aktuális pályát. |
| **Valós világ háttérként**, **Térképcsempék elfelejtése** | Csak földrajzi hivatkozású adatkészletnél: a valós helyet pályaként építi meg, vagy törli a letöltött csempéket. [Világ-háttér](world-backdrop.md) |
| **Egyszerűsítési cél** | A következő modellimport háromszögkerete: *Teljes – nincs egyszerűsítés* (alapértelmezés), *Magas – 8M*, *Közepes – 3M*, *Alacsony – 800k*, *Sziluett – 100k*. [3D-s pályák](model-levels.md#simplification) |
| Haladás és **Mégse** | Dekódolás vagy importálás közben. |
| Importmegjegyzés | Háromszögek előtte és utána, a talaj / szerkezetek / víz bontás, a használt részletességi szint. |
| Név és méret | `szélesség×magasság px · x × z m/px` képnél, `N háromszög (M-ből)` modellnél. |
| **Átlátszatlanság**, **Fényerő** | Mindkét fajtánál. |
| Képvezérlők | **Színtelenítés**, **Észak/dél tükrözése**, **Elhelyezés** (két horgony), **Illesztés az adatok határaihoz**, **Magasság**. [Térképképek](map-images.md) |
| Modellvezérlők | Talajdomborzat, víz, talajháromszögek, drótváz, textúra, rögzített szín, szerkezetek, részek osztályozása. [Megjelenés](level-appearance.md) |
| **Mentés a könyvtárba**, **Eltávolítás** | [Pályakönyvtár](level-library.md); az Eltávolítás kiveszi a pályát. |
| **Könyvtár** | Ebben a böngészőben tárolt pályák. [Pályakönyvtár](level-library.md) |

## Az ebben a részben lévő oldalak {#pages-in-this-section}

- [Térképképek](map-images.md)
- [3D-s pályák](model-levels.md) – formátumok, részek, osztályozás, egyszerűsítés, textúrák
- [Pálya megjelenése](level-appearance.md) – minden vezérlő egy 3D-s pályához
- [Pályakönyvtár](level-library.md)
- [Világ-háttér](world-backdrop.md) – a valódi világ egy felvétel alatt, nyílt adatokból

Hogyan lehet pályákat kinyerni játékokból és motorokból, az a különálló exportáló eszközök dolga (lásd a tároló [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) fájlját); az általuk írt szerződést a [3D-s pályák](model-levels.md#the-exporter-contract) oldal foglalja össze.
