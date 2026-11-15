---
title: "Tacview-felvételek (ACMI)"
parent: "Adatok betöltése"
nav_order: 7
lang: "hu"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview-felvételek (ACMI)

A Tacview egy program, amely repüléseket rögzít repülőszimulátorokban; fájljai `.acmi` kiterjesztésűek. A 3DHeat megnyitja őket, hogy lásd, merre repült minden repülőgép.

A Tacview repülési felvételei úgy töltődnek be, mint bármely táblázat: válassz vagy húzz be egy `.acmi` fájlt (szöveges, `.txt.acmi`, vagy tömörített, `.zip.acmi`), és nyomd meg a **Betöltés** gombot. Ekkor megkapod az összes repülés hőtérképét, a **Meccs** fülön pedig egy visszajátszást a figurákkal, nyomvonalakkal és eseménylistával ([Meccs-visszajátszás](match-replay.md)). Az ACMI a Tacview nyilvános fájlformátuma ([dokumentáció](https://www.tacview.net/documentation/acmi/)); a DCS (a Tacview exportálóján keresztül), az IL-2 Great Battles, a Falcon BMS, az X-Plane, az MSFS és mások írják, így mindegyiket olvassa.

## Mivé lesz egy felvétel {#what-a-recording-becomes}

Minden alkalommal egy sor, amikor egy objektum helyzetét írják, egy sor minden eseményhez az objektum helyén, és egy sor, amikor egy objektum eltűnik (`Removed`, az utolsó helyén). Egy olyan eseményhez, amely még nem látott objektumra vonatkozik - egy könyvjelző, egy üzenet mindenkinek -, a `(recording)` objektum egy sora tartozik a vonatkoztatási ponton. A felvétel a saját olvasási utasításaival érkezik, így a leképezési lépés magától kitöltődik. Az olvasó ezeket az oszlopokat írja: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, majd a felvétel minden további tulajdonsága. Ezek szerepei:

| Oszlop | Szerep | Jelentés |
|---|---|---|
| Time | idő | Másodpercek a felvétel ReferenceTime-ja után; Unix-másodpercek, ha van ilyen, így az óra a valódi időt mutatja. |
| X, Y | pozíció | Kelet és észak, méterben, a felvétel vonatkoztatási pontján a Földet érintő síkon: a távolságok és az irányok a közelében valósak, 100 km-en az ezredrész alatt térnek el. Az észak a világ -Z-je lesz. |
| Altitude | pozíció (fel) | Méter. |
| Object | személy | A pilóta és az objektum neve az azonosítójával, pl. `Viper 1 (F-16C_50) #a01`; egy pilóta nélküli objektum `(T-90A) #401`. |
| Coalition | csapat | Az oldal (vagy a szín, ha nincs koalíció). |
| Heading, Pitch | tekintet | Fok; a 0-s irány észak. |
| Recording | munkamenet | A felvétel Title-je, vagy a fájlnév: több felvétel egymás mellett töltődik be úgy, hogy a nyomvonalaik nem kapcsolódnak össze. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | szűrők | Szűréshez megtartva; a Type és a Name választ minden objektumhoz [figurát](figures.md), az Event a visszaelemzés eseménylistáját táplálja, a Roll dönti a repülőgépet. |
| U, V | | A játék saját lapos világának méterei, ha minden mintában megvannak (a DCS írja). |
| EventObjects | szűrők | Minden objektum, amelyet egy esemény megnevez (`Message|a01|b02|...`), azonosító szerint. |
| RecordingInfo | | A felvétel saját tulajdonságai az adott pillanatban - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - JSON-ként. |
| IAS, Mach, AOA, FuelWeight, ... | szűrők | Minden más számszerű tulajdonság, amelyet a felvétel hordoz. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | szűrők | Minden más szöveges tulajdonság, amelyet a felvétel hordoz; egy tulajdonság, amelynek nem szám az értéke, szöveg. |

A Tacview pozíciójának mind a négy formája (`lon|lat|alt`, `u|v`-vel, `roll|pitch|yaw`-lal, és ezek mindegyikével és egy iránnyal) olvasható; az üres mezők megtartják az utolsó értéket; a `-id` eltávolít egy objektumot, és egy azonosító, amelyet utána újra használnak, új objektum. Az escapelt vesszők és a folytatott sorok is kezelve vannak.

A pozíciókat mindig a szélességből és hosszúságból vetítjük, sosem a U/V-ből, így minden játék felvétele egy vetítést oszt meg a valós világ hátterével.

## DCS-szerverek: ki nyert, és hogyan ért véget minden bevetés {#dcs-servers-who-won-and-how-each-sortie-ended}

Egy többjátékos DCS-szerver éjjel-nappal rögzíti a küldetéseit Tacview-val. Egy állandó PvP-szerver sok ilyen küldetésen át visz egy hadjáratot: az az oldal nyer, amelyik elfoglalja a másik minden repülőterét, FARP-ját és zónáját. Ez napokig tart, és a küldetés sokszor újraindul. A felvételek a repüléseket tartalmazzák, nem a hadjáratot: semmilyen üzenet nem mondja meg, ki mit foglalt el, a repülőterek egyszer, az elején vannak kiírva, és semmi sem mondja meg, ki nyert. A Tacview-konverter (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) minden sorhoz hozzáadja, amit tudni lehet, és üresen hagyja, amit nem. Soha nem találgat.

| Oszlop | Jelentés |
|---|---|
| `server` | a szerver vagy a hadjárat, a felvétel fejlécéből (a Title, az Author és a Comments megnevezi az ismert nyilvános szervereket - Blue Flag, SPS Contention, Growling Sidewinder; különben egy Author, amely megnevez valakit); a `--server Name` egy egész mappának ad nevet. Az a felvétel, amelynek fejléce nem nevez meg szervert - például `Admin` Author, olyan Title és Comments, amilyet egy ismert szerver sem ír -, hozzárendelés nélkül marad: a `server` üres, akkor is, ha egy szerver felvételoldaláról töltötték le, mert az oldalon más közösségek küldetései is lehetnek |
| `mission` | a felvétel Title-je a verziója vagy a hadjárat hónapja nélkül: `Operation_Example_V7.7.99`-ből `Operation Example` lesz |
| `campaign` | a hadjárati forduló, amelyhez a felvétel tartozik, szerver, térkép és szám szerint: `Example Server North 3`. Egy felvétel egy munkamenet (újraindítástól újraindításig); egy forduló sok munkameneten, napokon vagy heteken át tart |
| `round` | a forduló száma: a szerver saját száma, ha közzéteszi, különben az adott szerveren és térképen látott n-edik forduló; egy fordulófájlból (lent), nélküle üres |
| `session` | a felvétel helye a forduló munkamenetei között, 1, 2, ...; a `sessionStart` a valódi kezdete (Unix-másodperc) |
| `heldRed`, `heldBlue` | a vitatott helyek, amelyeket az egyes oldalak a munkamenet elején tartottak, egy láncolt fordulófájlból (lent) |
| `won`, `matchWon` | 1, ha a sor oldala (a Color értéke, Red vagy Blue) megnyerte a hadjáratot, 0, ha elvesztette; üres, ahol egy fordulófájl sem nevez meg győztest, és a semleges sorokon. A hadjárat egyszerre a forduló és a meccs, így mindkettő ugyanazt tartalmazza |
| `roundEndReason` | `capture` olyan hadjáratnál, amelyet mindennek az elfoglalásával nyertek meg |
| `won`, `matchWon` a forduló minden munkamenetén | a forduló eredménye, amely a forduló minden felvételére rákerül, amint a vége ismert |
| `sortie` | egy repülőgép sorain: a repülése, 1, 2, ... felszállástól felszállásig; az első felszállás előtti és a leszállás utáni földi idő ahhoz a repüléshez számít, amelyhez tartozik |
| `sortieResult` | hogyan ért véget a repülés: `landed`, `landed damaged` (levegőben kapott találat után), `ejected`, `shot down`, `destroyed` (a földön), `crashed`, `despawned` (látható ok nélkül eltűnt a levegőben - egy játékos kilépett), `airborne at end`, `no takeoff` |
| `sortieKills` | a repülőgépnek abban a repülésben jóváírt kilövések |

Egy állandó szerveren a bevetés az az egység, amelynek jelentése van. Szűrj `sortieResult` = `shot down` értékre, hogy lásd, hol vesztek el repülések, vagy bontsd a hőtérképet `sortieResult` vagy `server` szerint a [bontásban](breakdown.md). A felszállások, leszállások, katapultálások, kilövések és lezuhanások, amelyekből áll, azok az események, amelyeket a konverter a repülőgép mozgásából állapít meg (fent).

A forduló két munkamenete között elfoglalt helyek (ezeket a fordulófájlból tudjuk, lent) `capture` események a későbbi felvétel elején: `Object` `(campaign)`, a helyen, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Az a repülőtér vagy FARP, amely ott vált oldalt, ahol a felvétel mutatja (újra kiírva a másik oldal színében, vagy törölve és öt percen belül a helyén újra kiírva a másik színében), `capture` eseménnyé válik a leszállóhelyen: `Event` = `capture`, `Airfield` a neve, `Detail` `Red to Blue`, `Coalition` az új oldala. Az a leszállóhely, amelyet először írnak ki valamilyen színben, nem elfoglalás. Az eddig vizsgált szerverek egyszer írják ki a leszállóhelyeiket, így a felvételeikben nincsenek elfoglalások.

### Fordulófájlok {#rounds-files}

Egy fordulófájl szerverenként megmondja a hadjárati fordulókat, hogy ki nyerte őket, és mely munkamenetekből áll mindegyik. Abból készül, amit a szerver közzétesz, vagy magukból a felvételekből (lent).

Hogy ki nyert meg egy hadjáratot, azt a szerver teszi közzé (egy hadjárati napló a weboldalán), nem a felvételben van. Egy fordulófájl hordozza ezt, és a konverter a `--rounds file.json` kapcsolóval olvassa be (több is megadható):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Egy felvétel a saját `server` szerverének azokhoz a fordulóihoz tartozik, amelyek `title` mezője (egy reguláris kifejezés) illeszkedik a Title-jére. Minden sor ahhoz a fordulóhoz tartozik, amelybe a valódi ideje esik: a felvétel RecordingTime értéke plusz a sor másodpercei, nem a küldetés játékbeli dátuma. Az időpontok UTC-ben vannak. A győztes nélküli forduló (lecserélték, még tart) a sorainak a forduló számát és üres eredményt ad.

A meccsdokumentum megfelelője, az `acmi` lábléc megmondja, honnan származik az eredmény, ahogy egy War Thunder-meccs `result.source` mezője is: az `outcome.result` értéke `{ winner, round, endReason, source }`, a `source` a fordulófájl `source` mezője, vagy `null`, ha semmi sem nevezett meg győztest. Az `outcome` felsorolja a felvétel fordulóit, az elfoglalásait és a bevetéseit is aszerint, hogyan értek véget:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Egy `Viper 1 (F-16C_50) #a01` pilóta sora a kék oldalon ebben a hadjáratban így néz ki: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Fordulók magukból a felvételekből {#rounds-from-the-recordings-themselves}

Egy állandó szerver az újraindítások között is megtartja a hadjáratát, és minden felvétel mindkét oldal földi egységeivel és statikus objektumaival kezdődik ott, ahol a hadjárat hagyta őket. A `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` minden felvétel első perceit olvassa be ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), időrendbe teszi minden szerver egy térképen készült felvételeit, és láncba fűzi őket:

- **Helyek**: a terep kb. 2 km-es cellákban; egy cella akkor egy oldalé, ha a munkamenet elején ott lévő egységek háromnegyede az övé. A *vitatott* helyek azok, amelyeket mindkét oldal kezében láttak.
- **Elfoglalások**: egy hely, amelyet a következő munkamenet elején a másik oldal tart - a küldetések között vagy a korábbi alatt foglalták el.
- **Új forduló**: egy munkamenet, amelynek helyei több mint 60%-ban eltérnek az előzőétől - ez egy új forduló kezdő elrendezése, nem a régi egy lépése. Egy forduló akkor is véget ér, ha a szerver másik térképre vált (a munkamenetei az utolsó után kezdődnek, és folytatódnak).
- **Ki nyert**: egy véget ért fordulóban az az oldal, amely az utolsó munkamenet elején minden helyet tartott (`capture`, magas bizonyosság), különben az az oldal, amely több vitatott helyet tartott (közepes, ha a másiknak legalább a kétszerese, különben alacsony; alacsony, ha térképváltással ért véget). Egy nyitott fordulónak nincs győztese, de minden munkamenet megmondja, hány helyet tartott az egyes oldal az elején, így látszik, ki állt jobban.
- Az a szerver, amelynek munkamenetei mind egyformán kezdődnek, nem tart meg állapotot közöttük: nem fűzik láncba.

Az utolsó munkamenet kezdete órákkal a forduló vége előtt is lehet, ezért számít a bizonyosság. Egy olyan szerveren ellenőrizve, amely közzéteszi a győzteseit: a lánc minden új fordulót abban a munkamenetben talált meg, amelyben a közzétett forduló kezdődött, és az utolsó kezdetkor vezető oldal volt a közzétett győztes mind a 9 fordulóban, amelyet ellenőrizni tudott. A `--official file.json` megtartja egy ilyen szerver közzétett fordulóit, és hozzáadja a lánc munkameneteit; a fájl `validation` mezője megmondja, mennyire egyezett a lánc. Egy kitalált hadjáratban:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Egy hadjárati forduló megnézése sorozatként {#watching-a-campaign-round-as-a-series}

Töltsd be együtt egy forduló felvételeit (azokat a fájlokat, amelyeknek ugyanaz a `campaign` értéke), és a megjelenítő egy sorozatként játssza le őket: munkamenetet munkamenet után, valódi sorrendjükben, a kettő közötti órákat vagy napokat egyperces szünetre vágva. Az idősáv sárgával jelöli minden munkamenet kezdetét, a szüneteket sötét sávokkal, az óra pedig megmutatja, melyik munkamenet fut, és annak valódi dátumát (`session 4/12 · 2026-11-02 12:38 UTC`). A hőtérkép, a visszajátszás, a szűrők és az Insights az egész sorozaton működnek, mint bármely betöltött adaton. A **Meccs** lap **Hadjárati forduló** szakasza felsorolja a munkameneteket a dátumukkal, hogy hány vitatott helyet tartott az egyes oldal minden kezdetkor (diagramként is az egész fordulóra), és hányat foglaltak el előtte; egy kattintás a munkamenet kezdetére ugrik. Az egyedül betöltött felvétel ott megmondja, melyik forduló és melyik munkamenet. A különböző fordulókból együtt betöltött felvételek nem sorozat: mind nulláról indul, mint a különálló meccsek. A sok meccset betöltő eszköz (**Sok meccs egyszerre**) is sorozatként játssza le a fordulót, folyamként és a GPU-hoz méretezve, sok gigabájtos fordulókhoz.

A forduló alatt gazdát cserélt helyek elfoglalási zónaként jelennek meg a térképen. Mindegyik annak az oldalnak a színét kapja, amelyik a futó munkamenet elején tartotta, és a munkamenetek határán vált; minden váltás egy elfoglalás a visszajátszás eseménylistájában. A betöltött sorokból állapítják meg őket (minden munkamenet földi egységei és statikus objektumai az első perceiben, kb. 2 km-es cellákban, ahogy a lánc is), ezért a teljes betöltő kell hozzájuk (a sok meccset betöltő eszköz túl keveset tart meg minden sorból).

**Az egész forduló betöltése egyik felvételéből.** Egy sima böngészőben a megjelenítő nem nyithat meg olyan fájlokat, amelyeket nem te választottál ki: töltsd be együtt a forduló fájljait. Ha a helyi megjelenítő-szerver szolgálja ki (`npm run dev` vagy `npm run preview`), akkor megteheti: adj a git által figyelmen kívül hagyott `tools/local-data.json` fájlnak egy `campaigns` bejegyzést, amely megnevezi a fordulófájlok mappáját és az átalakított felvételek mappáit. Ekkor egy egyedül betöltött felvétel Hadjárati forduló szakasza felkínálja **Az egész forduló betöltése** gombot: lekéri az ott talált munkameneteket, és a sok meccset betöltő eszközzel betölti őket:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Csak azokat a felvételeket szolgálja ki, amelyeket egy fordulófájl megnevez (`tools/campaign-files.mjs`); az ezekben a mappákban nem talált munkamenetet megszámolja, de nem tölti be.

Amit az ismert szerverek közzétesznek:

| Szerver | Egy forduló | Hogyan nyer egy oldal | Hol olvasható a győztes |
|---|---|---|---|
| SPS Contention | egy hadjárat egy térképen és korszakban (napok), sok újraindításon át | minden repülőtér, FARP és erődítmény elfoglalva; a győztes nélkül véget ért hadjáratot lecserélték | a szerver nyilvános hadjárati naplója (győztes, kezdet, vég hadjáratonként) |
| Blue Flag | egy hadjárati forduló sok 5 órás küldetésen át; a Title `_YYYY_MM` része újraindításonként egy hónapot lép | minden ellenséges állás elfoglalva; régebbi fordulók azt az oldalt hirdették ki, amely egy rögzített idő után többet tartott | eddig nem található közzétett formában; a felvételek lánca követ minden fordulót, és hogy ki mennyit tart minden kezdetkor |
| Growling Sidewinder | egy nyílt konfliktusos küldetés egy futása (6 óra) | zónák és repülőterek elfoglalva | a statisztikai oldala pilótákat mutat, nem eredményeket; minden munkamenet egyformán kezdődik, így egy forduló sem ível át munkameneteken: üres |
| Küldetések az MI ellen (zónafoglalós küldetések) | egy küldetés futása | a játékosok oldala a küldetés MI-je ellen: nincs PvP-eredmény | üres |
| Hozzárendelés nélküli (a fejléc nem nevez meg szervert) | - | - | üres, a `server` is üres |
