---
title: "Világ-háttér"
parent: "Pályák és háttérgeometria"
nav_order: 5
has_children: true
lang: "hu"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Világ-háttér

A világ-háttér a valódi talajt teszi egy repülésfelvétel alá: dombokat, utakat, folyókat, repülőtereket és épületeket, szabad nyílt térképadatokból letöltve. Akkor használja, ha a Tacview-felvétel egyébként egy üres rács fölött lebegne. Ez egy [pálya](glossary.md), így a hő és az alakok ráállnak.

## Építés {#build-one}

1. Töltsön be egy repülésfelvételt, amely megmondja, hol van a Földön (egy Tacview `.acmi` fájl), vagy ne töltsön be semmit, és a 3. lépésben válasszon hadszíntért. Lásd [Adatok betöltése](getting-data-in.md).
2. Nyissa meg a **Háttér / pálya** részt az oldalsávban.
3. Nyomja meg a **Valós világ háttérként** gombot, hogy felépüljön az adatai alatti talaj. Vagy válasszon egy valós térképet a **Hadszíntér** mezőben, és nyomja meg az **A hadszíntér hátterének felépítése** gombot (vagy a **Hadszíntér streamelése** gombot).
4. Várjon. A panel mutatja a haladást (*Magassági csempék*, *Térképcsempék*, *A háttér felépítése*); a **Mégse** megállítja.
5. Repüljön körbe. A térképadatok jóváírási sora a nézet jobb alsó sarkában jelenik meg.

Az első építés néhány tíz megabájtot tölt le. A böngésző megőrzi őket, így ugyanazon terület második építése nem tölt le semmit. A **Térképcsempék elfelejtése** törli őket. A **Valós világ háttérként** gomb csak akkor látszik, ha a betöltött adat tartalmaz földrajzi hivatkozást (lent).

Mindent egy háttérben futó munkavégző ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)) épít fel. Az eredmény lecseréli az aktuális pályát, és úgy viselkedik, mint bármely [3D-s pálya](model-levels.md): elrejti mögötte a hőt, a szeletelő metszi, rendelkezik a [megjelenésvezérlőkkel](level-appearance.md), és elmenthető a [könyvtárba](level-library.md).

## Honnan van az adat: a földrajzi hivatkozás {#where-the-data-is-the-geographic-reference}

Egy adathalmaz csak olyan forrástól kap földrajzi hivatkozást, amely megad egyet:

- **Egy ACMI-felvétel**: a fejlécének `ReferenceLatitude` és `ReferenceLongitude` értéke, és az olvasó által arra a síkra vetített pozíciók, amely ott érinti a WGS84 ellipszoidot (X kelet, Y észak, méterben; a magasságok a felvétel tengerszint feletti magassága). A hivatkozás megmarad, ha a leképezés az **X**-et és az **Y**-t veszi földi tengelyeknek – a felvétel saját tippjei ezt teszik –, és elvész, ha a talaj bármely más oszlopból jön, például egy játék saját lapos világának **U** és **V** oszlopából.
- **Egy Parquet-tábla, amelynek `heat3d` tippjei `geo` bejegyzést hordoznak** – a [Watcher](https://github.com/Holdi601/3DHeat-Watcher) DCS, MSFS, X-Plane és IL-2 (Tacview) táblái. A bejegyzés le van írva a [Fejlesztőknek](#for-developers) részben.

Több fájl egyszerre történő betöltésekor a hivatkozás csak akkor marad meg, ha mindegyiknek ugyanaz. Minden más betöltő nem változik, és nincs hivatkozása.

A hátteret ugyanúgy vetítjük, majd átvisszük a betöltés tengelyleképezésén, így bármilyen tükrözést vagy skálázást végez is a leképezés, a háttér az adatok alá kerül.

## Hadszíntér {#theatres}

A **Hadszíntér** választó a DCS World valós térképeit listázza (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) és az IL-2 Great Battles térképeit (Stalingrad, Moscow, Kuban, Rheinland, Normandy, Prokhorovka, Velikie Luki, Arras, Odessa, Finnish Gulf / Leningrad, Korea). Mindegyiknek megvan a saját doboza a Földön ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). A DCS-dobozok a szerkesztők kiterjedései, a közzétett vetületekből számolva; az IL-2-dobozok, és a DCS-dobozok közül a megjelölt(ek), becslések a térképek közzétett méretéből és a szélükön lévő városokból. A panel megmondja, melyik melyik.

Az **A hadszíntér hátterének felépítése** gomb két részletességi szintet épít egy hálóba:

| Szint | Terület | Domborzat | Térkép |
|---|---|---|---|
| Hadszíntér | az egész doboz | a legmélyebb nagyítás, legfeljebb 10, amelyhez legfeljebb 64 magassági csempe kell (kb. 3 km csúcspontonként Caucasus fölött, 1 km Normandia fölött) | a tenger, a tavak, a felszínborítás és az autópályák legfeljebb 64 vektorcsempéből, 4-es és 9-es nagyítás között |
| Részletes terület | **Az adatok alatt**, **Egy pont körül** (szélesség, hosszúság, 12 és 400 km között), vagy nincs | legfeljebb 12-es nagyításig, legfeljebb 100 csempében, legfeljebb 500 000 csúcsponttal | minden, ami fent van, legfeljebb 1500 vektorcsempéből, a legmélyebb nagyításon, amely belefér, legfeljebb 14-ig |

A részletes terület lyukat vág a hadszíntér rácsába, egész cellákra szélesítve, hogy a két rács közös szélvonalat osszon. Egy vékony fal zárja le a varratot, ahol eltérően mintavételezik a magasságokat.

Adatok betöltve esetén a hadszíntér az adatok síkjára épül, így úgy kerül alájuk, ahogy épült. Adatok nélkül a saját viszonyítási pontja köré épül (egész fokokra, a részletes terület közelében). A később, más viszonyítási ponton betöltött adatok – egy ACMI-fájl a sajátját nevezi meg – maguk alá mozgatják a hátteret. A két vetület közötti pontos eltolást egy 256 × 256-os rácson számoljuk ki a háttér fölött, és a rácspontok között interpoláljuk; egy-két méteres pontossággal az egész hadszíntéren ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). A könyvtárba mentett háttér megőrzi a helyét, és ugyanígy mozog, ha más adatok alatt töltik be.

### Hadszíntér streamelése {#streaming-a-theatre}

A **Hadszíntér streamelése** úgy mutatja a hadszíntért, ahogy egy repülő-szimulátor térképnézője: a talaj sok kis csempeként érkezik a kamera körül, repülés közben töltődik be, és elérhetetlenné válva eldobódik ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Web Mercator csempék négyfája.** A gyökerek 5-ös nagyításon 1500 km-t fednek le a kamera körül, így a talaj a doboz szélén túl a horizontig ér. Egy csempe négy gyermekre bomlik, amíg a kamera közelebb van, mint a szélességének 1,4-szerese, egészen 15-ös nagyításig (kb. 1 km csempénként, 15 m a domborzati csúcspontok között). A részletesség a távolsággal csökken, ahogy a képernyőn is csökken.
- **Minden csempének saját hálója van**, egy munkavégzőben építve ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): egy 65 × 65-ös domborzatrács a széle mentén szoknyával (így a különböző részletességű szomszédok között sosem látszik repedés), rá festve a felszínborítás és a tenger, fölötte az utak, vasutak, tavak, folyók, repterek, felmért kifutópályák és épületek, és választhatóan a négyzet műholdképe. A megjelenítő a csempéket a pálya megjelenésével és mélységi szabályaival rajzolja, így elrejtik mögöttük a hőt, mint bármely pálya.
- **Először a durva.** A csempéket először durvábban és közelebbről kérik, forrásonként négyesével; amíg egy csempe gyermekei töltődnek, a csempe helyettesíti őket, így a nézet azonnal megtelik, és utána élesedik.
- **Memória**: az elkészült csempék legfeljebb 600 MB-ig maradnak meg, a legrégebben rajzoltat dobva ki először. A **letöltések** a csempegyorsítótárban maradnak, 2 GB-os keretben, a legrégebbi távozik először. Ha egy terület fölött újra repül, az nem kerül semmibe, és építésenként nincs felső korlát.
- **A könyvtárba mentve** annak, amit streamel – a hadszíntér, a beállításai és a helye a Földön –, nem csempékként. A betöltés újra streamel, a gyorsítótárból, ahol a csempék még megvannak. A kattintások és a vizsgáló a csempéket találják el, ahogy bármely pályát.
- Mindkét renderelő rajzolja a csempéket: valódi GPU-n egymás mellett ellenőrizve (WebGPU és WebGL2 ugyanazon a kártyán), a gerinc mögé rejtett hővel is.
- Adatok betöltve a csempék az adatok síkjára épülnek; később más síkon betöltött adatok ott építik újra őket (a gyorsítótárból).
- Szintetikus repüléseken mérve, három helyen (Normandia, Nevada, Szíria): kb. 63, 45, illetve 24 MB az első látogatáskor, képpel; a második látogatás nem tölt le semmit.

## Mi épül fel {#what-is-built}

| Rész | Forrás | Hogyan |
|---|---|---|
| Képek (streamelt hadszíntereken, nem kötelező) | EOX Sentinel-2 cloudless 2016 | A **Műholdkép** a felhőmentes 2016-os mozaikot a talajra fekteti (kb. 10 m pixelenként, 14-es nagyításon; a mélyebb csempék nagyítják), a festett felszínborítás helyett. Az utak, kifutók, épületek és nevek rajta maradnak. |
| Finomabb képek (USA, Franciaország) | USGS National Map ortofotók; IGN BD ORTHO | A **Műholdkép** bekapcsolva: a 13-as nagyítású térképcsempe, amely teljesen az Egyesült Államok szárazföldi részén vagy a franciaországi nagyvárosi területen belül van, a nemzeti ortofotót kapja, két nagyítási szinttel mélyebb felbontásban (a csempe 16 részét egy képbe illesztve, közelről kb. 1–2 m pixelenként). Máshol EOX. |
| Domborzat (streamelt hadszíntereken) | Mapterhorn | Mindenhol Copernicus GLO-30 (kb. 19 m pixelenként 12-es nagyításon), méteres léptékben ott, ahol egy ország saját felmérése is benne van (Franciaország, az USA és mások); a csempénél két nagyítási szinttel durvábban olvasva. Az AWS Terrain Tiles, ha a Mapterhorn nem érhető el. |
| Domborzat | AWS Terrain Tiles (Terrarium PNG) | Magasságrács a dobozra: a legmélyebb nagyítás, legfeljebb 12, amelyhez legfeljebb 36 csempe kell (kb. 28 m pixelenként 43° É-n); a rács legfeljebb 400 000 csúcspontra ritkítva. Talajként rajzolva, a szokásos domborzati jelzésekkel. |
| Utak, vasutak | OpenFreeMap vektorcsempék, `transportation` réteg | Lapos szalagok, a domborzatra fektetve, a domborzat osztásához sűrítve, és annak néhány százalékával megemelve, hogy ne versenyezzenek vele. Szélesség osztályonként, 16 m-től (autópálya) 3 m-ig (pálya, vasút); soha nem keskenyebb a doboz átlójánál / 5000-nél. A gyalogutak, révek és alagutak kimaradnak. |
| Repterek | `aeroway` réteg | A kifutó, a gurulóút, a betonfelület és a helikopterleszálló sokszögei talajként fektetve; a kifutó- és gurulóúti vonalak 45 m, illetve 18 m széles szalagként. |
| Víz | `water` réteg | A tenger lapos, 0 m-en; a tavak és tócsák a legalacsonyabb partjuknál laposan; a folyók ráfektetve. Vízként rajzolva: lapos árnyalás, nincs kontúr. |
| Felszínborítás | `landcover` és `landuse` rétegek | A domborzat saját csúcspontjaira festve, extra háromszögek nélkül: az erdő, a gyep és a parkok zöldek, a szántók szalmasárgák, vizes élőhely, homok, szikla, jég; a lakó-, ipari, kereskedelmi, katonai és bányaterületek visszafogott árnyalatokban. A víz a víz felszíne alatt is festve van, így a part bármilyen magasságból látszik. A száraz talaj halk magasságszínt kap (alföld szürkészöld, felföld barna, 3000 m felett hó). A domborzat felbontásán olvasható: kb. 30–45 m a részletes területen, kilométerek a hadszíntéren. |
| Helynevek | `place` és `aerodrome_label` rétegek | Városok, települések és falvak, a repterek ICAO-kódjukkal, a nézetre írva; hogy az egyes típusok meddig látszanak, az a kamera magasságával nő, legfeljebb 70 egyszerre. |
| Felmért kifutópályák | [OurAirports](https://ourairports.com/data/) `runways.csv` (közkincs) | Nem kötelező (**Kifutópályák az OurAirports adataiból**, alapból bekapcsolva): minden nyitott kifutópálya, amelynek mindkét vége benne van a listában, küszöbtől küszöbig, a megadott szélességben, oldalsávokkal, szaggatott középvonallal és küszöbsávokkal. Egy 4 MB-os lista, egyszer letöltve, a gyorsítótárban tartva. |
| Épületek | `building` réteg | Lábnyomok, kihúzva a `render_min_height`-tól a `render_height`-ig (hiányzó esetén 6 m), az alattuk lévő legalacsonyabb talaj fölött; a `hide_3d` részek kimaradnak. Építményként rajzolva. |

A vektorcsempéket 14-es nagyításon olvassuk (ez az egyetlen nagyítás, amelyen vannak épületek), ha a doboz legfeljebb 300-at igényel; különben a legmélyebb nagyításon, amely megteszi, egészen 8-ig. Nagyobb terület csak domborzatot kap.

### Megjelenés {#look}

A háttér a **Valódi szín mutatása** kapcsolóval indul be – a szín mondja meg, melyik világos út melyik szürke talajon fekszik, és melyik sötét kifutó melyik betonfelületen –, a talaj háromszögélei kikapcsolva, mert a szabályos rács nem mond semmit; halvány kontúrok; átlátszatlan tenger (a mélyebben fekvő padló versengene a felszínnel a távoli mélységben); az épületek világosszürkék, szinte tömörek, ahogy a térképek rajzolják. A nyílt tenger egyáltalán nem kap talaj-háromszöget. Minden más a pálya alapértelmezett megjelenése.

## Jóváírás a vásznon {#credits-on-the-canvas}

Amíg a háttér a pálya, a forrásainak jóváírása a nézet jobb alsó sarkában jelenik meg, kattintás nélkül, hogy a képernyőképeken és a megjelenített videókon is ott legyen:

> OpenFreeMap © OpenMapTiles · Adatok © OpenStreetMap közreműködők · Magasság: Terrain Tiles – SRTM, GMTED2010, 3DEP az U.S. Geological Survey jóvoltából; ETOPO1: NOAA; és mások

Minden rész a forrása jóváírási oldalára mutat (openstreetmap.org/copyright és a Terrain Tiles [jóváírási listája](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). A könyvtárba mentett háttér megtartja a jóváírásait, és betöltéskor újra megmutatja őket. A szöveg a megjelenítővel együtt fordul; a nevek nem.

## Források és feltételeik {#sources-and-their-terms}

Minden forrás, a licencük, és az, hogy a háttér hogyan marad a feltételeken belül: [Világ-háttér: források és feltételek](world-backdrop-sources.md).

## A csempegyorsítótár {#the-tile-cache}

Minden csempe, és a vektorcsempék TileJSON-ja, a böngésző Cache API-jában tárolódik a `3dheat-world-tiles-v1` alatt, URL szerint. Ugyanazon terület második építése nem tesz kérést, és offline is működik: a TileJSON-t kérjük le először, és ha az nem sikerül, a gyorsítótárazott másolata megnevezi a már meglévő csempéket. A szerver által nem adott csempék (nyílt tenger, 404) szintén hiányzóként vannak megjegyezve.

A vektorcsempe-URL-ek tartalmazzák a térkép build-dátumát, így miután az OpenFreeMap új buildet tesz közzé, a következő háttér friss csempéket tölt le, a régiek pedig törlésig megmaradnak. A gyorsítótár 2 GB-ra korlátozott: efelett a legrégebben tárolt csempék törlődnek először. A **Térképcsempék elfelejtése** az egész gyorsítótárat törli. A gyorsítótárhoz biztonságos eredet kell (`https://` vagy `localhost`); máshol minden építés újra letölt.

## Összehasonlítás a Tacviewval {#compared-with-tacview}

Szemmel ellenőrizve, hadszínházanként egy helyen, szintetikus felvételekkel: a felszállási gurulások a rajzolt kifutók középvonalán maradnak, a partvonal-átkelések a partra esnek. A Tacview oldala a dokumentációjából és a közzétett képernyőképeiből származik (tacview.net, a Steam-oldala), nem abból, hogy itt futtattuk.

| | Tacview 1.9 | Ez a háttér, streamelve |
|---|---|---|
| Kiterjedés | az egész földgolyó | 1500 km a kamera körül, bárhol is van |
| Domborzat | ETOPO1 (kb. 1,25 km) beépítve; SRTM 25–75 m, ha a felhasználó telepíti a fájlokat; DCS-terep, a DCS-ből exportálva | Copernicus GLO-30 (Mapterhorn), méteres léptékben Franciaországban és az USA-ban |
| Képek | nincs beépítve; a felhasználó tölti le a textúrákat (Mapview, SAS Planet, kiegészítők, például egy Caucasus VFR-térkép) | EOX Sentinel-2 cloudless 2016, kb. 10 m, streamelve |
| Felszínborítás | nincs, hacsak nincs textúrában | OpenStreetMapből, a domborzatra festve (kép nélkül) |
| Utak, vasutak | nincs, hacsak nincs textúrában | minden osztály a kamera közelében, a főutak távol |
| Épületek | nincs | kihúzott lábnyomok a kamera közelében |
| Repterek | címkék és kifutók lapos dobozként, jelölések nélkül | a felmért végekből készült kifutók oldalsávokkal, középvonallal és küszöbsávokkal; gurulóutak, betonfelületek; nevek ICAO-kódokkal |
| Helynevek | néhány falu- és városcímke | városok, települések, falvak, repterek, távolság és magasság szerint |

Ahol még elmarad:

- **Képfelbontás**: az USA-n és Franciaországon kívül a 10 m-es műholdmozaik kb. 2 km alatt lágy; a Tacview a felhasználó által telepített 17-es nagyítású textúrával ott élesebb.
- **Terep a DCS saját formájában**: a Tacview meg tudja mutatni azt a terepet, amelyet a DCS maga exportál; itt a valódi Föld van, amely ott tér el a DCS terepétől, ahol a térkép készítői módosították.
- **Görbület**: a talaj lapos sík, így a horizont nem egy görbült Földé; a Tacview gömböt rajzol.
- **Sebesség**: egy hely első látogatása tíz megabájtnyit tölt le, mielőtt éles lesz; egy szoftveresen renderelt böngészőben (a képernyőképek) több száz csempével néhány képkocka másodpercenként rajzolja.

## Korlátok és ami később jön {#limits-and-what-comes-later}

- **Domborzat felbontása**: legjobb esetben kb. 30 m, nagy területen durvább. A [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (felhőre optimalizált GeoTIFF-ek az AWS-en, kulcs nélkül, rögzített jóváírási szöveggel) a jobb forrás: mindenhol 30 m, és GLO-90 ott, ahol a GLO-30-ban rések vannak (Örményország és Azerbajdzsán, amelyeket a DCS Caucasus lefed). Egy GeoTIFF-olvasót igényel, és még nincs használatban.
- **Jobb domborzat**: a Copernicus GLO-30 az AWS-en nem küld CORS-fejléceket, így a böngésző nem tudja olvasni; az OpenTopography tükre olvasható (CORS és tartományok), de a nyilvános alkalmazás futásidejű használatára vonatkozó feltételeik ismeretlenek – használat előtt meg kell kérdezni. A Mapterhorn már tartalmazza a GLO-30-at.
- **Görbület**: a talaj lapos sík, és a magasságokat nem csökkentjük a Föld görbületére, összhangban azzal, ahogy a felvételek el vannak helyezve (a magasság mint magasság). A viszonyítási ponttól távol mindkettő együtt sodródik: 100 km-en egy ezrednél kevesebb. Ha csak a csempéket görbítenénk, azok elválnának az adattól távol, ezért ezt nem kínáljuk. Egy görbült horizonthoz ugyanaz a lesüllyesztés kell – a kamerától mért távolság négyzete osztva a Föld sugarának kétszeresével –, minden olyan menetben alkalmazva, amely pozíciót rajzol (pálya, csempék, hő, vonalak, dobozok, címkék, kiválasztás), egy közös uniformként. Egy valódi gömbhöz az adatoknak is Föld-középpontú pozíció és kamera-relatív renderelés kell. Mindkettő a globe móddal együtt van tervezve.
- **Csak a mai világ**: a DCS és IL-2 történelmi térképei (Normandy 2, The Channel, Germany Cold War, minden IL-2 térkép) a mai városokkal, utakkal és partvonal-munkákkal vannak rajzolva; a panel ezt jelzi. Korabeli repterek nincsenek rajzolva.
- **Nincs globe mód**: a háttér lapos helyi sík. Egész földgolyós nézet tervezett.
- Az utak nagy területen szélesebbek, hogy láthatók maradjanak; közelről szélesebbek az életnél.
- A Watcher táblázataiban lévő DCS-hadszíntérnevek úgy párosulnak, ahogy a DCS adja a `mission.theatre` mezőben. A listában nem szereplő név az első, egész fokra kerekített pontra esik vissza, és csak szélességre és hosszúságra.

## Történelmi térképek (még nincsenek) {#historical-maps-not-built-yet}

Korabeli térképek később texturálhatnák a történelmi hadszíntereket. Az amerikai hadsereg térképészeti szolgálatának (AMS) sorozatai amerikai szövetségi kormányzati munkák, általában közkincsnek tekintik őket (minden szkennelt lap nyilvántartását ellenőrizni kell; sok közülük a brit GSGS vagy német eredetik újrakiadása, amelyeknek a koronaszerzői joga vagy a névtelen mű lejárati ideje szintén letelt):

| Hadszíntér | Sorozat | Hol szkennelve |
|---|---|---|
| IL-2 Stalingrad, Moscow, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Kelet-Európa 1:250 000 (az 1950-es években szovjet és német térképekből összeállítva) | UT Austin PCL; néhány lap a UT GeoData-n földrajzilag illesztve |
| IL-2 Normandy, DCS Normandy 2 és The Channel | AMS **M661** / GSGS 4250, Franciaország 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250 000 és **M841** 1:25 000 (Németország) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50 000 (1951-es kiadások) és **L552** 1:250 000 | ANU Open Research (L751 lapok, „copyright expired”), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | brit első világháborús lövészárok-térképek (nem AMS) | McMaster University; National Library of Scotland (nem kereskedelmi feltételekkel) |

Az AMS-lapok sarkaikban szélesség- és hosszúságjelöléseket hordoznak, így mindegyiket négysarkos illesztéssel helyeznénk el, és textúraként a domborzatra fektetnénk, a csempékhez hasonlóan helyben építve és tárolva.

## Fejlesztőknek {#for-developers}

### A `geo` bejegyzés egy Parquet-táblában {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` és `up` azokat az oszlopokat nevezi meg, amelyek a (`lat0`, `lon0`) pontnál ugyanazon az érintősíkon lévő kelet és észak méterét, valamint a magasságot tartalmazzák. A betöltés akkor hordozza a hivatkozást, ha a leképezése pontosan ezeket az oszlopokat veszi (kelet X-nek, észak és magasság Y-nak és Z-nek, bármelyik sorrendben). Az opcionális `dcs` bejegyzés egy DCS-tábla saját méterét nevezi meg (x észak, y fel, z kelet) és annak hadszíntérét: az a betöltés, amely ezeket az oszlopokat képezi le, a hadszíntér transzverzális Mercator-vetületén keresztül kerül elhelyezésre ([DCS-koordináták](#dcs-coordinates)). A `geo` nélküli tábla úgy olvasódik, mint korábban.

### DCS-koordináták {#dcs-coordinates}

Minden DCS-hadszíntér transzverzális Mercator-vetület (WGS84, skála 0,9996), saját központi meridiánnal és hamis origóval; a DCS x értéke az északi, a z a keleti koordináta. Az állandók azok, amelyeket a pydcs projekt közöl; a számítás Krüger-sorozat hatodrendig (Karney 2011), átportolva a [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts) fájlba. A DCS-méterekre készült hátteret közvetlenül ezekben építjük, így a `dcs_x`/`dcs_y`/`dcs_z` oszlopokkal leképezett Watcher DCS-tábla, a DCS-terep konverter által írt pálya és a háttér egy keretet osztanak meg. Iraq állandóit nem közlik; közzétett referenciapontokra illesztettük őket (4 cm négyzetes középérték).

A Watcher DCS-táblái a hadszíntér rögzített viszonyítási pontján lévő érintősíkon vannak (ugyanaz a pont, amelyet a hadszíntér-választó használ, lent), így több misszió ugyanazon a hadszíntéren érintetlen viszonyítással egyesül, és a hadszíntér-háttérrel elmozdulás nélkül illeszkedik.

### Egyszerűsítés és keret {#simplification-and-budget}

- A 20 m²-nél kisebb épületek kimaradnak; 60 m²-nél, ha a doboz 30 km-nél szélesebb, 150 m²-nél 80 km felett. A többi a legnagyobbtól kezdve kerül be, amíg az épületek el nem érik az 1,5 M háromszöget.
- A mellékutak, szervizutak és pályák 60 km-es kiterjedésen túl kimaradnak; 150 km felett csak az autópályák, főutak, elsődleges és másodlagos utak maradnak.
- Az egész háttér nagyjából 3 M háromszög alatt marad. Az importjegyzet megmondja, hány épület maradt ki.
