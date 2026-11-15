---
title: "Figurák"
nav_order: 11
has_children: true
lang: "hu"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figurák

A **figura** egy kis 3D-s modell arról, hogy mi valójában az egység: egy harckocsi, egy sugárhajtású repülő, egy hajó, egy katona. A [visszajátszás](match-replay.md) minden egységet a figurájaként, valódi méretében rajzol ki, a sima doboz helyett.

Mintegy 2000 nevesített jármű, repülőgép, hajó, fegyver és katona van, amelyeket maga a megjelenítő épít.

![A demo harckocsijai a saját figuráikként](../assets/img/hu/replay-tanks.webp)

## Mi van a katalógusban {#what-is-in-the-catalogue}

| Terület | Példák |
|---|---|
| Emberek | álló, guggoló, fekvő katona; mesterlövész, páncéltörő, szanitéc, legénység |
| Szárazföld | harckocsik, gyalogsági harcjárművek, légvédelem, tüzérség, teherautók és autók, vonatok és villamosok |
| Levegő | vadászgépek, támadórepülők, bombázók, szállítógépek, helikopterek, a kétfedelűektől a modern sugárhajtásúakig |
| Tenger | hadihajók osztályonként, repülőgép-hordozók, tengeralattjárók, csónakok, kereskedelmi hajók |
| Fegyverek | rakéták, lövedékek, bombák, torpedók, fáklyák és fóliacsíkok |
| Jelölők | füst-, villanó- és tűzgránátok, elhelyezett bombák, zászlók, spawnok, útpontok |

## Hogyan készülnek a figurák {#how-the-figures-are-made}

- **Nyilvános méretekből építve.** A legtöbb figurát a megjelenítő saját figuraépítője készíti nyilvános számokból: hossz, szélesség, magasság, úttest-kerekek, torony és löveg, szárnyak és farok. Alakjukat ezután nyilvános fényképekhez, rajzokhoz és közzétett méretekhez hangolják. Egyetlen játék modelljét sem használjuk.
- **Szabad modellek.** Néhány figura szabad 3D-s modelleket használ (CC0 vagy CC BY), ahol azok valósághűbbek, néha az épített test kombinálva. A CC BY művek szerzőit a [Figurák forrásai](figure-credits.md) oldal említi; a CC0 művekhez nem kell hivatkozás, és ott nem is szerepelnek.
- Minden figurának van teljes, durva és távoli változata (részletességi szintek, LOD), így több ezer rajzolható egyszerre.

## Melyik figurát kapja egy egység {#which-figure-a-unit-gets}

A megjelenítő az adat saját oszlopait nézi:

1. **Nevek** – *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* vagy *Figure* nevű oszlopok – összevetése a katalógussal: pontosan, mintegy 4000 álnéven keresztül (több játék egységazonosítói), a leghosszabb ismert előtag szerint (az `F-16C_50` az F-16C), vagy a vele kezdődő legrövidebb figuranév szerint.
2. Az a név, amelynek figurája nem illik az egység **típusához**, nem kerül felhasználásra (egy *Typhoon* nevű teherautó nem a vadászgép).
3. **Típusok** – *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* vagy *Domain* nevű oszlopok – osztályfigurát adnak: Tacview-címkék (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), térkép-ikonok, vagy egyszerű szavak (tank, helikopter, gyalogság).
4. Az olyan adat, amelynek egyik sincs, emberek adata: mindenki katona.

A helyes figurák legkönnyebb módja tehát egy `vehicle` oszlop a valódi nevekkel, vagy egy `type` oszlop Tacview-címkékkel.

**Az egységem dobozként vagy katonaként jelenik meg.** Adjon hozzá egy `vehicle` oszlopot a valódi névvel, vagy egy `type` oszlopot Tacview-címkével. Vigye az egységre az egeret, hogy lássa, melyik név lett felismerve. Ha az ilyen oszlopokkal rendelkező adat nem mond semmit egy egységről, az egység doboz marad; ha egyik sincs, katonaként rajzoljuk.

## Beállítások {#settings}

A visszajátszás oldalsávjának **Figurák** szakasza állítja a méretet, a képernyőn lévő legkisebb méretet, azt, mivé válnak a távoli egységek (figura, nyíl, jel), és a rájuk rajzolt hatásokat. Lásd [Meccs-visszajátszás](match-replay.md#figures). Füst, tűz és más időzített hatások: [Figurák a figurás átfedésben](figure-replay.md).

## Opcionális helyi figuracsomag {#an-optional-local-figure-pack}

Megtarthat egy opcionális saját figuracsomagot a saját gépén. Ennek figurái a katalógus azonos nevű figuráinak helyét veszik át. Soha nem része a tárolónak vagy a közzétett csomagnak; csomag nélkül semmi nem változik.
