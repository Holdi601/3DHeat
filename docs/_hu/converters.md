---
title: "Az átalakítók mindent megtartanak"
parent: "Adatok betöltése"
nav_order: 8
lang: "hu"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Az átalakítók mindent megtartanak

Nincs szükséged erre az oldalra ahhoz, hogy visszajátszást nyiss meg. Azoknak szól, akik olyan eszközöket írnak, amelyek a játékfájlokat 3DHeat-táblázatokká alakítják, és azoknak, akik tudni akarják, miért tartalmaznak ezek a táblázatok ennyi mindent.

Minden eszköz, amely egy játék visszajátszását, demóját, naplóját vagy élő telemetriáját olyanná alakítja, amit a nézegető megnyit, egy szabályt követ:

> **Alakíts át mindent, amit a forrás most olvashatóan tartalmaz, a többit pedig tartsd épen, hogy később az eredeti fájl nélkül is elolvasható legyen.**

Egy visszajátszás gyakran eltűnik egy játékfrissítés, egy újratelepítés vagy egy tele lemez után, az élő adatfolyam pedig abban a pillanatban elvész, ahogy elküldték. Amit egy átalakító eldob, az véglegesen elveszett. Amit épen megtart, azt el lehet olvasni azon a napon, amikor valaki megérti. Ezért az átalakító soha nem dönti el, mi lesz hasznos. Azt dekódolja, amit tud, minden más üzenetet, csomagot, eseményt, tulajdonságot vagy sort változatlanul megtart a tábla mellett, és a saját kimenetében megmondja, mennyit olvasott be mindenből, és mennyit csak megtartott.

Ez az oldal az összes átalakító közös szabálya: a War Thunder, a World of Tanks, a World of Warships és a Squad visszajátszás-átalakítói, a CS2-demóátalakító, a háttérben futó figyelő (a Dota-visszajátszás-dekódolója és minden élő adapter), a játékrögzítő eszköz telemetriaolvasói, valamint a nézegető saját importjai (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). A nézegető saját olvasóit a [Tacview-felvételek](tacview-acmi.md) és a [Fájlok betöltése](loading-files.md) oldal írja le. Az egy fájlos forma az [Egy fájl meccsenként](container.md). Egy meccsből egy tábla lesz, egy `match.json` és mellékfájlok, opcionálisan egy `.3dheat` fájlba csomagolva. Minden eszköz README-jének van egy **Teljesség** szakasza, amely az adott forrásra felsorolja, mi van beolvasva, mi van nyersen megtartva, és mi nem érhető el, és miért.

## Három otthon minden elemnek {#three-homes-for-every-item}

Minden, amit a forrás tartalmaz, pontosan az egyik három helyen végzi:

| Otthon | Mi kerül oda |
|---|---|
| **Dekódolt** | A tábla (soronként egy minta vagy esemény, a nézegető által olvasott oszlopok, plusz oszlopok minden más, a sorhoz tartozó értéknek) és a meccsdokumentum, a `<match>.match.json` (minden, ami a meccs egészéhez tartozik: beállítások, névsorok, eredmények, eredménytáblák, az önellenőrzés). |
| **Nyersen megtartott** | Egy mellékfájl a tábla mellett: minden elem, amely nincs dekódolva vagy csak részben, épen és változatlanul, a típusával, idejével és azzal az egységgel vagy entitással, amelyhez tartozik. |
| **Nem elérhető** | A README Teljesség szakaszában nevezik meg, az okkal: a formátum nem hordozza (egy kliens-visszajátszásban nincsenek más játékosok bemenetei), a forrás sosem küldi, vagy az olvasása nem megengedett (védett folyamat, olyan titkosított blokk, amelynek kulcsa nem a mienk). |

Egy **részben** dekódolt elem dekódolt *és* nyersen megtartott: a tábla azt kapja, amit megértettünk, a mellékfájl az egész elemet. Így egy későbbi, jobb dekódernek nincs szüksége az eredeti fájlra.

Nincs negyedik hely. Valamit eldobni, mert haszontalannak látszott, mert „valószínűleg” duplikátum volt, vagy mert nagy volt, hiba. A ritkítás csak a táblában megengedett (egy kamera 2 Hz-en 60 helyett), a mellékfájlban soha.

## Mellékfájlok {#sidecars}

A mellékfájl a tábla mellett lévő Parquet-fájl, a táblától kapja a nevét:

```
<folder>/<match>.parquet              the table
<folder>/<match>.match.json           the match document
<folder>/<match>.<what>.parquet       a sidecar
```

A `<what>` a lista egy szava. Egy új átalakító a hozzá illő szót választja, vagy egy újat ad hozzá ide **és** a [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts) fájlban lévő `SIDECAR_PARQUET`-hez, hogy a nézegető kihagyja, amikor egy egész mappa töltődik be.

| `<what>` | Tartalma | Használja |
|---|---|---|
| `messages` | a hálózati folyam csomagjai, entitásmetódus-hívásai és tulajdonságfrissítései, épen | War Thunder, World of Tanks, World of Warships |
| `flight` | repülőgépenkénti repülésmodell-bejegyzések, épen | War Thunder |
| `packets` | teljes képkockák és hálózati üzenetek, vagy tárolóblokkok, az entitásfolyamon kívül | CS2, Dota 2, Squad |
| `events` | játékesemények minden kulcsukkal, ahogy az elemző adja | CS2 |
| `entities` | entitás- és tulajdonságfrissítések, távoli hívások, megnyitott és lezárt csatornák, a dekóderhez szükséges exportokkal | Squad, Dota 2 |
| `props` | minden entitás-tulajdonság, amelyet az elemző olvas, minden változáskor | CS2 |
| `units` | egységenkénti állapot a pozíciótáblán kívül | Dota 2 |
| `combatlog` | egy harci napló, minden bejegyzése minden mezőjével | Dota 2 |
| `strings` | minden sztringtábla minden bejegyzése | CS2, Dota 2 |
| `objectives` | elfoglalási zónák és célok, minden változás az idejével | War Thunder |
| `raw` | élő adatfolyam: minden csomag, sor, API-dokumentum vagy memóriaolvasás, amit kaptunk, épen | a figyelő munkamenetei (`heat.raw.parquet`), a játékrögzítő eszköz körrögzítői (`<stamp>_<game>.raw.parquet`), a figyelő osu!, LoL és Valorant visszajátszás-fájljai |

A nézegető mappabetöltése kihagyja ennek a listának minden `*.<what>.parquet` fájlját, és minden `*.match.json`, `*.meta.json`, `*.summary.json` fájlt és a többi JSON-mellékfájlt. Ha ezek közül egyet magában nyitsz meg (kiválasztva vagy ráhúzva csak azt a fájlt), az úgy töltődik be, mint bármely más tábla (lásd: [Fájlok betöltése](loading-files.md)).

Ezek a fájlok úgy vannak, ahogy egy átalakító a `--loose` kapcsolóval írja őket. Alapból a War Thunder, a CS2 és a Tacview átalakítók egy meccs tábláját, dokumentumát és mellékfájljait egyetlen fájlba csomagolják, `<match>.3dheat` néven, ugyanazokkal a nevekkel (lásd: [Egy fájl meccsenként](container.md)). Ez a leírás minden tagra igaz.

### Oszlopok {#columns}

Minden mellékfájl-sor egy elem. Az oszlopok ebben a sorrendben vannak, amelyek alkalmazhatók:

| Oszlop | Típus | Mi |
|---|---|---|
| `time` | float64 | másodpercek a tábla `time` (vagy ha a forrás tickekben számol, `tick`) óráján; ilyenkor mindkettő |
| `type` | string (szótár) | mi az elem a forrás saját kifejezéseiben: csomagtípus, üzenetazonosító, eseménynév, tulajdonságútvonal, sorelőtag |
| `name` | string (szótár) | a neve, ahol ismert (egy közösségi név, egy osztálynév), különben üres |
| `entity` / `unit` / `uid` / `player` | egész vagy szöveg | kihez tartozik, ugyanazokkal az azonosítókkal, mint a táblában, így a mellékfájl egy sora összekapcsolható egy pályával |
| `decoded` | string (JSON) | amit belőle megértettek, ha van ilyen; különben üres |
| `payload` | bináris | az elem bájtjai, épen és változatlanul (bináris forrásoknál) |
| `text` | string | az elem szövege, épen és változatlanul (szöveges forrásoknál: egy naplósor, egy JSON-objektum, egy kulcs-érték blokk) |

További oszlopok megengedettek (egy bitofszet, egy méret, egy csatorna). Az ismétlődő sztringek szótár-kódoltak, a fájl zstd-vel íródik, így a mellékfájl a visszajátszás saját méretének csak egy töredéke.

A mellékfájlnak önmagában is elégnek kell lennie: a későbbi dekóder a mellékfájlt olvassa, sosem az eredeti visszajátszást. Ahol egy elem nem érthető kontextus nélkül (egy entitás osztálya, egy sztringtábla, egy kulcs, amelyre egy üzenet hivatkozik), ott a kontextus is a mellékfájlba kerül, vagy a meccsdokumentumba.

### Élő források {#live-sources}

Az élő adapterek (UDP-telemetria, megosztott memória, egy játék naplója, egy helyi API) nincsenek olyan fájlhoz kötve, amelyhez vissza lehetne menni. **Minden mezőt rögzítenek, amelyet a forrás küld**, még azokat is, amelyeket egyelőre semmi sem használ:

- egy csomagfolyam: minden csomag épen; a `payload` a bájtok, a `type` a csomag-azonosítója vagy formátuma, azon a sebességen, amellyel érkezik;
- megosztott memória vagy lekérdezett API: minden olvasás minden mezője, vagy elnevezett oszlopokként, vagy az egész blokk `payload`-ként, azon a sebességen, amellyel az adapter olvas;
- egy napló: minden sor; a `text` a sor, a `type` a sor fajtája, beleértve azokat a sorokat is, amelyekre az adapter nem reagál.

Ezek a munkamenet táblája mellé, a `<session>.raw.parquet` fájlba kerülnek. A méret a szabály ára. A zstd és a szótár-kódolás tartja alacsonyan, nem az, hogy dolgokat hagyunk ki.

## Az önellenőrzés {#the-self-check}

Minden átalakító a meccsdokumentumába (vagy a munkamenet `meta.json`-jába, vagy ahol nincs meccsdokumentum, egy összefoglalóba) beír egy `completeness` blokkot a `selfCheck` alatt:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Mező | Jelentés |
|---|---|
| `seen` | hány elem ilyen típusú van a forrásban |
| `decoded` | teljesen beolvasva a táblába vagy a meccsdokumentumba |
| `partial` | részben beolvasva a táblába vagy a dokumentumba, és épen megtartva egy mellékfájlban |
| `raw` | csak egy mellékfájlban megtartva, épen, dekódolás nélkül |
| `lost` | `seen - decoded - partial - raw`: 0 kell legyen |

A felső szintű `lost` ezek összege. Egy átalakító tesztjei 0-t állítanak a szintetikus mintáin, a README pedig megmondja, mi volt a valódi mintákon. Egy nem nulla `lost` azt jelenti, hogy az átalakító megszegte a szabályt; megnevezi a típust, így a hiány megtalálható.

A „típusok” a forrásé: csomagtípusok, üzenetazonosítók, eseménynevek, tulajdonságcsoportok, sorfajták. Ott számolják meg őket, ahol az átalakító találkozik velük, nem egy elvárt lista alapján. Így egy eddig ismeretlen típus a számával együtt megjelenik, nem tűnik el.

## A README Teljesség szakasza {#the-readmes-completeness-section}

Minden átalakító README-jében van egy **Teljesség** nevű szakasz, három listával:

- **Beolvasva**: mi kerül a táblába és a meccsdokumentumba, és hogyan ellenőriztük minden új mezőt valami függetlennel (a játék saját számaival, egy második forrással, a célra készített felvétellel).
- **Nyersen megtartva**: mi van melyik mellékfájlban, milyen `type` alatt, és eddig mit tudunk róla.
- **Nem elérhető**: amit a forrás nem hordoz vagy amit nem szabad olvasni, és miért.

Visszamutat erre az oldalra.

## Hol áll az egyes átalakító {#where-each-converter-stands}

| Átalakító | Mellékfájlok | Teljesség szakasza |
|---|---|---|
| War Thunder visszajátszások | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (az önellenőrzés számai a `counts` alatt vannak; a `completeness` blokk még hátravan) |
| World of Tanks visszajátszások | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships visszajátszások | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad szerverdemók | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2-demók | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2 visszajátszások (figyelő) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2 visszajátszások](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!, LoL, Valorant visszajátszások (figyelő) | `raw` | a nekik szóló oldalak a [figyelő dokumentációjában](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Élő adapterek (figyelő) | `raw` | minden játék oldala a [figyelő dokumentációjában](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), és a [fejlesztés](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) a `Session.raw`-hoz |
| Körrögzítők (játékrögzítő) | `raw`, és `unparsed` bájtok egy Forza körfájlon belül | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| A nézegető saját importjai | nincs: lásd lent | ez az oldal |

### A nézegető saját importjai {#the-viewers-own-imports}

A Tacview ACMI-t, az OCAP-ot és a GPS-formátumokat a böngészőben olvassa a felhasználó saját fájljából. A nézegető semmit nem tárol belőlük, így maga a fájl marad a nyilvántartás. Ennek ellenére olvasnak, amennyit csak tudnak:

- **Tacview ACMI** (`src/data/acmi.ts`): minden pozíciós objektumsor egy sor, minden tulajdonsággal, amelyet a felvétel hordoz. Minden esemény egy sor, minden eltávolítás egy sor. A felvétel saját tulajdonságai (a fejléc FileType és FileVersion mezőjével) minden sorban `RecordingInfo`-ként szerepelnek. Egy megjegyzéssor `Comment` esemény, egy soha nem pozicionált objektum pedig egy `Unplaced` sor a referenciapontnál. A U/V oszlop, ha bármely sorban van. Egy pozíció nélküli tulajdonságsor részben olvasódik: az értékei az objektum következő sorához jutnak, nem a saját idejükhöz. Az `AcmiTable.completeness` a fájl sorait fajta szerint számolja.
- **OCAP** (`src/data/ocap.ts`): minden entitás képkockái, lövései, jelölői, minden eseményfajta (az ismeretlen fajták a „Mission” sorai a szövegükkel), és a dokumentum saját mezői (`Info`). Még nincs beolvasva: az entitásmezők és a fejlécben felsoroltakon kívüli végső pozíciós elemek (egy újabb rögzítő kiegészítései), és egy halott egység ismétlődő képkockái a halála után (szándékosan ritkítva, mert bennük nem változik semmi).
- **GPS-formátumok** (`src/data/geoTracks.ts`): a fixek, az idejük, magasságuk, irányuk és sebességük, valamint a pulzus, kadencia, teljesítmény, hőmérséklet, műholdak, HDOP és nyomásmagasság, ahol a fájl rögzíti őket. Még nincs beolvasva: a többi GPX- és KML-kiterjesztés, a helyzetmondatokon kívüli NMEA-mondatok, a fixeken és azok kiterjesztésein kívüli IGC-rekordok, és a rekordokon kívüli FIT-üzenetek (körök, munkamenetek, eszközinformáció).

Ezek a hiányok azért vannak felsorolva, hogy bezárjuk őket, nem hogy mentegessük magunkat. A betöltött felvétel nézegetőbeli exportjai (`src/data/exportRecording.ts`) csak azt írják, amit beolvastak.

## Átalakító hozzáadása {#adding-a-converter}

1. Sorold fel, mit tartalmaz a formátum: a dokumentációjából, a saját szerkezeteiből, vagy úgy, hogy megszámolod minden üzenettípusát valódi mintákban. A lista az önellenőrzés `types` része.
2. Dekódold azt, amit most lehet ellenőrizni. Minden új mezőt valami függetlennel ellenőrizz, mielőtt a táblába kerül; az a mező, amelyet még nem lehet ellenőrizni, nyersen marad.
3. A többit tartsd épen egy mellékfájlban, a fentiek szerint elnevezve, a fenti oszlopokkal.
4. Írd meg a `completeness` blokkot és egy tesztet, amely szerint `lost` 0.
5. Írd meg a README Teljesség szakaszát, és linkelj ide.
6. Ha a mellékfájl `<what>`-ja új, add hozzá a fenti táblázathoz és a `SIDECAR_PARQUET`-hez az `src/data/filePick.ts` fájlban.

Az átalakítók tiszta lapról íródnak: formátumokból, dokumentációból és mintákból, soha nem GPL- vagy AGPL-kódból. A valódi visszajátszások mintái annál a gépnél maradnak, amely készítette; a tesztek szintetikus fájlokat használnak.
