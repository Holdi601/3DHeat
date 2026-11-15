---
title: "Adatok betöltése"
nav_order: 3
has_children: true
lang: "hu"
source: "getting-data-in.md"
source_hash: "35eb9e47859c"
translated: true
outdated: false
---

# Adatok betöltése

Mielőtt a 3DHeat bármit rajzolni tudna, táblázatra van szüksége: minden sor megmondja, hol volt valami, és ha van ilyen adat, mikor és ki volt. Ez a rész megmutatja, hogyan lesz a fájlból kép. Még nincsenek adatai? Próbálja ki a [demóadatokat](demo-data.md).

**Tegye meg most:**

1. A Hőtérkép oldalsávjában nyissa meg a **Forrás** részt, és nyomja meg a **Fájlok…** gombot (vagy dobjon egy fájlt vagy mappát a dobási területre).
2. Nézze meg az **Oszlop-hozzárendelés** részt: a mezők általában már ki vannak töltve.
3. Ellenőrizze, hogy a **Memóriabecslés** *belefér* állapotot mutat.
4. Nyomja meg a **Betöltés** gombot.

```mermaid
flowchart LR
  A["Forrás<br/>fájlok vagy mappa kiválasztása"] --> B["Előnézet<br/>első sorok"]
  B --> C["Oszlop-hozzárendelés<br/>X, Y, Z, idő, személy, csapat"]
  C --> D["Memóriabecslés<br/>belefér, szoros vagy nem fér bele"]
  D --> E["Betöltés"]
  E --> F["A kép"]
```

A Hőtérkép fül mindent egyetlen **adatkészletből** mutat: ez sorok táblázata, mindegyikben pozícióval és – opcionálisan – idővel, személlyel, csoporttal, munkamenettel, nézési iránnyal és tetszőleges számú extra oszloppal, amelyeket szűréshez tartunk meg. Ez a rész azt magyarázza, hogyan készül egy adatkészlet.

## Az út a fájloktól a képig {#the-path-from-files-to-picture}

1. **Fájlok kiválasztása** a **Forrás** panelen – egy fájl, több, egy mappafa, vagy dobással. A Parquet, CSV, Tacview, GPS-útvonalak és más formátumok elfogadottak; a teljes lista a [Adatformátumok](data-formats.md#files) oldalon található. Lásd [Fájlok betöltése](loading-files.md).
2. **Előnézet.** A kiválasztás első fájlja megnyílik: az oszlopnevei, az első 50 sora, az, hogy mely oszlopok tűnnek számnak, és (Parquet esetén) minden oszlop logikai típusa és a fájl saját olvasási utasítása, a `heat3d` láblécbejegyzés.
3. **Automatikus hozzárendelés.** Az oszlopok szerepeket kapnak – X, Y, Z, idő, személy, munkamenet, csoport, nézési irány –, és néhány megmarad szűréshez. Minden találgatás látszik az **Oszlop-hozzárendelés** panelen, és módosítható. Lásd [Oszlopok hozzárendelése](column-mapping.md) és [Tengelyek, mértékegységek és idő](axes-units-and-time.md).
4. **Számlálás.** Minden fájl sorszáma beolvasásra kerül (pontosan a Parquet-láblécekből, becsülve a CSV-nél), így a panel még a betöltés előtt megmondhatja, mennyi memória kell, és belefér-e. Ha nem fér bele, minden *N*-edik sor betöltését javasolja. Lásd [Memória és keretek](memory-and-budgets.md).
5. **Betöltés.** Egy háttérmunkafolyamat minden fájlból csak a hozzárendelt oszlopokat olvassa be – több fájlt egyszerre, legfeljebb a [feldolgozószálak](memory-and-budgets.md#parser-threads) keretéig – és a kiválasztás sorrendjében egyetlen adatkészletbe olvasztja: egy közös szótár a személyekről, csoportokról és munkamenetekről az összes fájlban, egy közös időkezdőpont, minden sor idő szerint rendezve. Lásd [Munkamenetek, személyek és csoportok](sessions-persons-groups.md).
6. **Feltöltés.** A főszál egy képkockán át kiírja: „N sor feltöltése a GPU-ra”, majd a sorokat a GPU-keretnek megfelelően GPU-memóriába csomagolja. Lásd [GPU-memória tartózkodása](gpu-memory.md).
7. **Első kép.** A kamera az adatokat keretezi, a sprite-sugár és a telítettség az adatok kiterjedéséből és sorszámából áll be, és 8 megjelenített képkocka után a telítettséget magából a képből mérik ([Szín és expozíció](colour-and-exposure.md)).

## Követelmények, betöltés előtt ellenőrizve {#requirements-checked-before-a-load}

| Igény | Mi történik nélküle |
|---|---|
| **Legalább két tengely az X / Y / Z közül** | A betöltés megtagadva. Pontosan kettő esetén a harmadik tengely 0, és az adatok lapos síkként jelennek meg a 3D-s jelenetben – ezt kéri a felülnézeti hőtérkép. |
| Időoszlop | Opcionális. Nélküle az idővonal letiltva, a nézet az **Összes** módban marad, és az oldalsáv ezt jelzi. |
| Személyoszlop | Opcionális. A [figurás átfedéshez](box-replay.md) (figura minden személyhez), a [vonal-hőhöz](line-heat.md) (minden személy útja), interpolációhoz, nyomvonalakhoz és az **Élettartam** előzményhez kell. |
| Csoportoszlop | Opcionális. A [csapathőhöz](team-heat.md) és a [különbség](difference.md) módhoz kell (legalább két csoport). |

A betöltött adatok által nem támogatott mód szürkén jelenik meg a módválasztó sávon; ha fölé visszük az egeret, megmondja, miért.

## Saját adatok nélkül {#without-your-own-data}

Az **Adatkészlet** panelen (a **Forrás** alatt) van egy [szintetikus generátor](synthetic-generator.md), amely tetszőleges méretű, battle royale jellegű adatkészletet állít elő. Hasznos a megjelenítő kipróbálásához és annak teszteléséhez, mit bír el a gép.

## Az ebben a részben lévő oldalak {#pages-in-this-section}

- [Fájlok betöltése](loading-files.md) – fájlválasztók, mappák, húzás és elengedés, több fájl összevonása, a mozgásfájl-szabály, folyamat és megszakítás
- [Oszlop-hozzárendelés](column-mapping.md) – a hozzárendelési panel minden mezője, az automatikus hozzárendelés találgatásai, a `heat3d` tippek
- [Tengelyek, mértékegységek és idő](axes-units-and-time.md) – felfelé mutató tengely, tükrözések, mértékegység-skála, időegységek, nézési irány
- [Munkamenetek, személyek és csoportok](sessions-persons-groups.md) – mit tesz mindegyik, a korlátok, megosztott nevek, entitásméret, az Adatkészlet panel
- [Szintetikus generátor](synthetic-generator.md)
- [Memória és keretek](memory-and-budgets.md) – a lábnyommodell, a belefér-ellenőrzés, a ritkítás, a rendezési felső határ, erőforráskeretek
