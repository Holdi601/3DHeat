---
title: "Figurák"
parent: "Visszajátszás"
nav_order: 3
has_children: true
lang: "hu"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Figurák

A **figura** annak egy kis 3D-s modellje, hogy valójában mi egy egység: egy tank, egy vadászgép, egy hajó, egy katona. A [visszajátszás](match-replay.md) minden egységet a saját figurájaként rajzol, valódi méretben, sima doboz helyett.

Körülbelül 2000 névvel ellátott jármű, repülőgép, hajó, fegyver és katona van, mindegyiket maga a nézegető építette.

![A demó tankjai a saját figuráikként rajzolva](../assets/img/hu/replay-tanks.webp)

## Mi van a katalógusban {#what-is-in-the-catalogue}

| Terület | Példák |
|---|---|
| Emberek | katona állva, guggolva, hasonfekve; mesterlövész, páncéltörő, mentős, legénység |
| Szárazföld | tankok, gyalogsági harcjárművek, légvédelem, tüzérség, teherautók és autók, vonatok és villamosok |
| Levegő | vadászgépek, támadórepülőgépek, bombázók, szállítók, helikopterek, a kétfedelű gépektől a modern sugárhajtásúakig |
| Tenger | osztályok szerinti hadihajók, repülőgép-anyahajók, tengeralattjárók, csónakok, kereskedelmi hajók |
| Fegyverek | rakéták, lőszerek, bombák, torpedók, fáklyák és csalóhalmazok |
| Jelölők | füst-, villanó- és gyújtógránátok, elhelyezett bombák, zászlók, megjelenési pontok, útpontok |

## Hogyan készülnek a figurák {#how-the-figures-are-made}

- **Nyilvános méretekből építve.** A legtöbb figurát a nézegető saját figuraépítője készíti nyilvános számokból: hossz, szélesség, magasság, görgők, torony és ágyú, szárnyak és farok. Alakjukat ezután nyilvános fényképekhez, rajzokhoz és közzétett méretekhez hangolják. Egyetlen játék modelljét sem használjuk.
- **Szabad modellek.** Néhány figura szabad 3D-s modellt használ (CC0 vagy CC BY), ahol azok hűbbek, néha az épített testtel kombinálva. A CC BY művek szerzőit a [Figura-elismerések](figure-credits.md) oldal említi; a CC0 művekhez nincs szükség elismerésre, és ott nincsenek felsorolva.
- Minden figurának van teljes, durva és távoli változata (részletességi szintek, LOD), így több ezer is rajzolható egyszerre.

## Melyik figurát kapja egy egység {#which-figure-a-unit-gets}

A nézegető az adat saját oszlopait nézi:

1. **Nevek** - a *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* vagy *Figure* nevű oszlopok - összevetjük a katalógussal: pontosan, körülbelül 4000 álnéven keresztül (több játék egységazonosítói), a leghosszabb ismert előtag alapján (`F-16C_50` az F-16C), vagy a legrövidebb olyan figuranév alapján, amely azzal kezdődik.
2. Az a név, amelynek figurája nem illik az egység **típusához**, nem használható (a *Typhoon* nevű teherautó nem a vadászgép).
3. **Típusok** - a *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* vagy *Domain* nevű oszlopok - egy osztályfigurát adnak: Tacview-címkék (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), térképikonok vagy sima szavak (tank, helikopter, gyalogság).
4. Ami egyikkel sem rendelkezik, az emberek adata: mindenki katona.

A helyes figurák legkönnyebb módja tehát egy `vehicle` oszlop a valódi nevekkel, vagy egy `type` oszlop Tacview-címkékkel.

**Az egységem dobozként vagy katonaként jelenik meg.** Adj egy `vehicle` oszlopot a valódi névvel, vagy egy `type` oszlopot Tacview-címkével. Húzd az egységre az egeret, hogy lásd, melyik nevet illesztette. Az olyan adat, amelynek van ilyen oszlopa, de egy egységről nem mond semmit, dobozként marad; amelynek egyik sincs, katonaként rajzolódik.

## Beállítások {#settings}

A visszajátszás oldalsávjának **Figurák** része állítja a méretet, a legkisebb méretet a képernyőn, azt, hogy mivé váljanak a távoli egységek (figura, nyíl, jel), és a rajtuk megjelenő hatásokat. Lásd: [Meccs-visszajátszás](match-replay.md#figures). Füst, tűz és más időzített hatások: [Figurák a figura-rétegen](figure-replay.md).

## Egy választható helyi figurakészlet {#an-optional-local-figure-pack}

A saját gépeden megtarthatsz egy választható saját figurakészletet. Ezek a figurák a katalógus azonos nevű figuráinak helyét veszik át. Soha nem része a tárolónak vagy a közzétett verziónak; készlet nélkül semmi sem változik.
