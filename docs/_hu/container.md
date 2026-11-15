---
title: "Egy fájl meccsenként (.3dheat)"
parent: "Adatok betöltése"
nav_order: 9
lang: "hu"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Egy fájl meccsenként: `.3dheat`

Egy `.3dheat` fájl egy teljes meccs egyetlen fájlban, hogy másolhasd, megőrizhesd vagy megoszthasd. Megnyitásához egyszerűen húzd a fájlt a Forrás panelre.

```
match.3dheat   (ZIP-fájl)
  manifest      mi a meccs, és a benne lévő mindenek listája
  table         a pozíciók (Parquet)
  match.json    a meccsdokumentum
  sidecars      amit az átalakító egészben megtartott (események, üzenetek, ...)
```

Egy átalakított meccs régen több egymás melletti fájl volt: a `<meccs>.parquet` tábla, a `<meccs>.match.json` meccsdokumentum és a `<meccs>.<mi>.parquet` kísérőfájlok ([Az átalakítók mindent megtartanak](converters.md)). Egy `.3dheat` fájl mindet egyben tartalmazza: egy visszajátszás, egy fájl, hogy másolhasd, megőrizhesd vagy megoszthasd.

Úgy készült, hogy ezer ilyen betöltése ugyanolyan gyors legyen, mint a különálló táblák betöltése, és hogy a későbbi átalakítók sokkal többet tudjanak beletenni anélkül, hogy új formátum kellene.

## Betöltés {#loading-one}

Bárhol, ahol fájlt vagy mappát tölthetsz be, a `.3dheat` fájl is betöltődik, és egy mappa keverhet konténereket és különálló fájlokat:

| Hely | Mit olvasunk a konténerből |
|---|---|
| **Hőtérkép** Forrás panel (fájlok, mappa, húzás és ejtés) | a táblái, mintha a különálló `<meccs>.parquet` lenne |
| **Hőtérkép → Sok meccs egyszerre** (Fájlok, Mappa, Mappa hozzáadása) | a táblái, a betöltő munkafolyamatai olvassák helyben |
| **Meccs** fül (Betöltés, vagy ejtés a nézetre) | a meccsdokumentum |
| **Taktika** tábla telemetriája | a táblái |

A konténer megnyitásakor két kis részt olvasunk belőle: a könyvtárát a végéről és a manifestjét az elejéről. Egy tábla egyetlen részét sem olvassuk, amíg a betöltő nem kéri. A kísérőfájlokat és a meccsdokumentumot csak akkor olvassuk, ha valami kéri. Egy mappa, amely ugyanazt a meccset kétszer tartalmazza, lazán és csomagolva, egyszer töltődik be.

## Csomagolás és kicsomagolás {#packing-and-unpacking}

Az új átalakítások alapértelmezetten konténereket írnak: a War Thunder-átalakító (`heat3d-wt-replay`), a CS2-átalakító (`heat3d_cs2 demos`) és a Tacview-eszköz (`node tools/acmi-to-parquet.mjs`). A `--loose` a különálló fájlokat tartja meg.

A korábban vagy más eszközökkel átalakított meccseket így csomagoljuk:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** megkeresi az összes `<meccs>.parquet` táblát a mappákban a hozzá tartozó fájlokkal együtt, és a `<meccs>.3dheat` fájlt mellé írja. Az már csomagolt meccset kihagyjuk. Minden konténert egészben visszaolvasunk (minden tag sha256-ját, méretét, CRC-jét és Parquet-láblécét), mielőtt bármi mást tennénk. A különálló fájlokat csak a `--delete-loose` kapcsolóval töröljük, és a korábban csomagolt meccsnél csak akkor, ha bájtról bájtra megegyeznek azzal, amit a konténer tartalmaz. Az a meccs, amelyben egy fájl az utolsó `--settle` percben (alapértelmezetten 10) változott, érintetlen marad: egy átalakító még írhatja.
- **unpack** a tagokat különálló fájlokként visszaírja a konténer mellé.
- **update** tagokat ad hozzá vagy cserél le anélkül, hogy a konténerben lévő táblákat újraírná (lent).
- **repack** egészben újraírja a konténert, eldobva azt, amit a frissítések hátrahagytak.

## A formátum {#the-format}

A `.3dheat` fájl ZIP-archívum (bármely ZIP-eszköz megnyitja), a következő szabályokkal:

1. **A `manifest.json` az első tag**, amikor konténert írnak, és mindig jelen van. A ZIP központi könyvtáron keresztül találjuk meg, így egy `update` után a fájl későbbi részén lehet.
2. **A bájttartománnyal olvasott vagy már tömörített tagok tárolva vannak** (ZIP-módszer 0): Parquet, Arrow, képek, modellek, hang, videó, átlátszatlan blobok. Egy tárolt tag a konténer egy összefüggő bájttartománya, így az olvasó egy tábla láblécét és oszlopdarabjait helyben olvassa, `File.slice`-szal böngészőben vagy HTTP-tartománykéréssel, pontosan úgy, ahogy a különálló fájlt olvasná.
3. **A szöveg tömörített** (módszer 8): JSON, CSV, egyszerű szöveg. Ezek kicsik, és egészben olvassuk őket.
4. A nevek UTF-8 kódolásúak (zászló 11), relatívak, `/`-sel elválasztottak, `..` nélkül; tartalmazhatnak mappákat (`analysis/heat.json`). Egy csomagolt különálló fájl megtartja a nevét, így a kicsomagolás ugyanazokat a fájlokat adja vissza.
5. A 4 GiB-nál nagyobb tagok, vagy 65 535-nél több tagot tartalmazó konténerek a szokásos módon ZIP64-et használnak. Az írók nem tesznek adatleírókat a tagok után.

Az átalakítók jelenleg ebben a sorrendben írják a tagokat:

| Szerep | Tag | Tárolva |
|---|---|---|
| `table` | `<meccs>.parquet` | igen |
| `match` | `<meccs>.match.json` | nem (tömörített) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<meccs>.<szerep>.parquet` | igen |
| `summary` | `<meccs>.summary.json`, a tömegindex összegzése ([Tömegelemzés](mass-analysis.md)), amelyet a `tools/3dheat-summarize.mjs` ad hozzá | nem (tömörített) |

A tábla közvetlenül a manifest után következik, így az olvasó fájl eleji első olvasása egyszerre lefedi a manifestet és a tábla helyi fejlécét.

### A manifest {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Mező | Jelentés |
|---|---|
| `format` | mindig `3dheat` |
| `format_version` | `fő.alverzió` (lent) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | mi a meccs és mi készítette; `null`, ha nem ismert |
| `created`, `updated` | mikor íródott, mikor frissült utoljára (az `updated` csak frissítés után jelenik meg) |
| `roles` | minden szerep az első tagja nevéhez: gyors mutató |
| `members` | minden tag a manifest kivételével: a teljes lista, és ezt bízza meg az olvasó |
| `matches` | nem kötelező: több meccset tartalmazó konténer meccsei (lent) |
| `references` | nem kötelező: fájlok, amelyekre a konténernek szüksége van, de nem tartalmazza őket |
| `extensions` | nem kötelező: egy átalakító saját metaadatai |

Minden tag:

| Mező | Jelentés |
|---|---|
| `name` | útvonala a konténerben |
| `role` | mire való (lent) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` vagy `deflate` |
| `bytes` | mérete, tömörítetlenül |
| `sha256` | a bájtjainak hash-e, tömörítetlenül |
| `rows` | egy tábla sorszáma |
| `schema` | a követett konvenció, `{ "id", "version" }`: egy dokumentum saját `format` és `version` mezője (`heat3d-wt-replay-match` 2), a `heat3d-table` a táblának, amelyet a néző a `heat3d` láblécéről olvas, a `heat3d-acmi-table` a Tacview-eszközé |
| `match` | több meccset tartalmazó konténerben a `matches[].id`, amelyhez tartozik |

### Növekedésre tervezve {#made-to-grow}

A formátum sokkal gazdagabb visszajátszásokat hordozna, mint a mai, anélkül hogy megtörné azt, ami most olvassa:

- **Verziózás.** A `format_version` `fő.alverzió`. Az olvasó a saját főverziójának minden alverzióját olvassa, és minden ismeretlen mezőt figyelmen kívül hagy. Az alverzió akkor nő, amikor valami hozzáadódik; a főverzió csak akkor, ha az elrendezés olyan módon változik, hogy egy régebbi olvasó rosszul olvasná (egy tag már nincs tárolva, a manifest kikerül az archívumból). Minden tag saját konvenciója külön verziózott, a `schema`-ban, így egy új táblaelrendezéshez vagy új dokumentumverzióhoz nincs szükség új konténerverzióra. Az első konténerek `"version": 1`-et írtak; az olvasók ezt 1.0-nak veszik.
- **A szerepek nyitottak.** A szerep bármilyen karakterlánc. Az olvasók a nekik ismert szerepeket használják, a többit megtartják: egy ismeretlen szerepet felsorolunk, sosem utasítunk el, és az `update` és a `repack` érintetlenül viszi tovább. Egy szerepnek több tagja is lehet: több tábla (pályánkénti pályák, eltérő sebességű telemetria), események, hang, videószinkron, pályahivatkozások, figurafelülírások, elemzési eredmények. A nevek tartalmazhatnak mappákat.
- **Bármilyen média.** Egy tag bármi lehet, aminek van médiatípusa: Parquet, JSON, Arrow, PNG- vagy JPEG-bélyegképek, glTF-modellek, hang, nyers blobok.
- **Több meccs.** Egy munkamenet vagy egy verseny beleférhet egy konténerbe: a `matches` felsorolja őket (`{ "id", "map", "mode", "started", ... }`), és minden tag megnevezi a `match`-ét. A néző minden `table` szerepű tagot betölt.
- **Hivatkozások.** Azok a fájlok, amelyekre a konténernek szüksége van, de nem tartalmazza őket – például egy pálya –, név és sha256 szerint felsorolva a `references`-ben (`{ "kind": "level", "name": "...", "sha256": "..." }`), így a megfelelő fájl megtalálható és ellenőrizhető anélkül, hogy minden meccsbe bemásolnánk.
- **Kiterjesztések.** Az `extensions` egy átalakító saját metaadatait tartja a saját kulcsa alatt, `"<gyártó>/<név>": { ... }` alakban, így két átalakító sosem ütközik, és a közös mezőkhöz nem kell semmit hozzáadni.
- **Frissítés helyben.** Az `update` tagokat ad hozzá vagy cserél le anélkül, hogy a nagy, tárolt táblákat újraírná: az új tagok és egy új manifest a konténer vége után íródnak, egy új központi könyvtár követi. Ami cserélődött, az nem hivatkozott bájtként marad, amíg a `repack` nem fut. Minden tag és minden manifest-mező, ismert vagy sem, megmarad. Egy sikertelen frissítés visszavág a konténerre, ahogy volt.

A néző tesztjei ehhez tartják: egy 1.7-es formátumú konténer, benne egy ismeretlen szereppel, egy tagmezővel, egy kiterjesztéssel és egy hangtaggal, egy mappában betöltődik, és frissítés és újracsomagolás után is mindent megőrizve átvészeli; a 2-es főverziójú konténert visszautasítjuk.

## Írók {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs) (írás, olvasás, ellenőrzés, frissítés, újracsomagolás), amelyet a csomagoló eszköz és a Tacview-eszköz használ.
- Python: `container.py`, körülbelül 140 sor a szabványos `zipfile` modulon, ugyanaz a fájl minden átalakítóban (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), így egyik átalakító sem függ a másiktól. Egy új átalakító egyszerűen átmásolja.
- A néző a [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts) fájllal olvas.
