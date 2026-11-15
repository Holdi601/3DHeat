---
title: "Manőverek"
parent: "Felismerések"
nav_order: 4
lang: "hu"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manőverek: hogyan mozognak a csoportok

**Felismerések → Manőverek** követi, hogyan mozognak az oldalak egységei *csoportokként*, és megnevezi a manővereket, amelyeket végrehajtanak: oldalba támadás, csipesz, áttörés, lesbetámadás, visszavonulás, rakétavédelem, a T átvágása. Mindegyiknél megmutatja, mennyire biztos a felismerés, a mögötte álló számokat, azt, hogy megérte-e, és a doktrínában és a történelemben talált párhuzamait. **Tömegelemzés → Manőverek** ezeket megszámolja több ezer meccsen: pályánként, módonként és oldalanként hányszor fordulnak elő, és hányszor térül meg a végrehajtásuk.

Mindent a böngészőben számolunk ki, a saját munkafolyamatában (`src/insights/maneuver`). Egy több száz egységes meccs 10–500 ms-ot vesz igénybe, egy kétórás légi háború több ezer objektummal körülbelül egy másodpercet.

## Használat {#using-it}

- Nyisd meg a **Felismerések** fület, a **Manőverek** lapot. Először megnyitáskor számol. A szűrők megváltoztatása után használd a **Keresés újra** gombot.
- A **Biztos / Valószínű / Lehetséges** gombok a megbízhatóságot állítják be (alapértelmezés: Valószínű).
- Az **idővonal** oldalanként egy sávot mutat, manőverenként egy oszlopot. A **lista** alatta ugyanezt mutatja, időrendben. Kattintásra a visszajátszás a manőver kezdetére ugrik, a kamera odarepül, és 3D-ben megrajzolja: minden csoport útját nyílként (a csipesz két karja a két ív), a csoportok körvonalait a döntő pillanatban (az ellenségét a saját oldala színében), az ellenség frontját fehér vonalként. A **Mind rajzolása 3D-ben** hozzáadja a meccs többi manőverét, halványan. A vonalakat egyszer küldjük el a grafikus kártyának, amikor a kiválasztás megváltozik, nem minden képkockánál. 480 manőver rajzolásakor valódi GPU-n (WebGL2 és WebGPU, p99 18,0–18,5 ms, max 19,5–20,8 ms) a képkockaidők megegyeznek azokéval, amelyeket rajzolás nélkül mérünk.
- Egy megnyitott manőver megmutatja az eredményét (a végrehajtó egységek ölései és veszteségei, miközben tartott, és közvetlenül utána, összevetve az oldal cseréjével a meccs egészében), a bizonyítékait, és a tudásbázis hozzá tartozó bejegyzéseit: a doktrínát és a történelmi párhuzamokat (Cannae a csipeszhez, Sedan 1940 az áttöréshez, Cuszima a T átvágásához, a Bolo hadművelet a megtévesztéshez...).

![Csipesz a szintetikus demómeccsen: mindkét kar nyilai, az ellenséges test és a front](../assets/img/en/maneuvers.webp)

## Hogyan találjuk meg a csoportokat {#how-groups-are-found}

Minden egységet közös idővonalra teszünk: 1 s-os lépés gyalogosnál, egyébként 2 s, nagyon nagy fájloknál hosszabb. A halál idejére az egységet helyben tartjuk, hogy az újraéledés ne húzzon vonalat a térképen át. Minden lépésnél egy oldal egy fajtájának (repülőgép, jármű, hajó, gyalogság) egységei összekapcsolódnak, ha közel vannak – gyalogosan 18 m-en belül, járműveknél 170 m-en, hajóknál 3 km-en, repülőgépeknél 5 km-en belül –, és hasonlóan mozognak (a sebességük a gyorsabbik sebességének felén belül tér el, vagy mindkettő áll). Egy fürt megtartja annak a csoportnak az azonosítóját, amelyben a tagjai többsége volt. Az osztály nélküli egységet a sebessége alapján soroljuk gyalogságnak, járműnek vagy légi egységnek.

A csoport **alakzatát** a menetirányához képest olvassuk le: oszlop vagy vonal a hosszanti és a keresztirányú szórás alapján, ék, ha a középen lévő vezet, lépcső, ha a tagok az egyik oldal felé húzódnak hátra, doboz, ha a sarkokat tartják.

Mindent a meccs saját méretarányában mérünk. Az **összecsapási távolság** `R` a gyilkos és az áldozata közötti távolság 75. percentilise (a tartomány értelméhez igazítva). A manőverek időtartama az egység fajtájához igazodik: a gyalogságé a szárazföldi egységek harmada.

## Mit talál meg {#what-it-finds}

| Manőver | Akkor találja meg, ha |
|---|---|
| Alakzat | egy csoport a mozgó lépései 60%-ában, 30 másodpercen át ugyanazt az alakzatot tartja |
| Frontális támadás | a csoport a hatótávolságon kívülről érintkezésig közelít, ¾ R vagy többet megtéve, az ellenség néző irányától 35°-on belül |
| Oldalba támadás | ugyanez 50–130°-ról (a hátsó oldal 130° fölött); csak akkor biztos, ha a saját *rögzítő erő* az ellenséggel ott harcol (mindkét irányban ölések) |
| Csipesz | ugyanazon oldal két oldalba támadása ugyanazon az ellenséges testen, ellenkező oldalról (100° vagy több eltéréssel), 90 másodpercen belül; biztos, ha a karok harcolnak |
| Bekerítés | egy tömör ellenséges csoportot a másik oldal legalább ugyanannyi egysége vesz körül 1,5 R-en belül, legalább két csoportból, 100°-nál nagyobb rés nélkül, egy percig, és a saját oldalától elvágva; biztos, ha a gyűrű ½ R-rel szűkült, és a zsákban harcolnak |
| Áttörés | egy csoport átmegy egy tartott vonalon (ellenségek állnak 30 másodpercig a bal- és a jobboldalán, oldaluk középpontja mögöttük); biztos, ha ½ R-rel túljut, 20 másodpercig ott marad, és harcol; áttörésnek számít, ha további R-rel túljut |
| Fedezett előrenyomulás | egy kis csoportban a rész mozog, a többi áll, a szerepek legalább négyszer cserélődnek, és az álló rész fedőtüzet ad |
| Koncentráció / szóródás | egy oldal legsűrűbb pontja körüli részaránya 35%-ról 60%-ra nő (az egységek 1,5 R-nél vagy messzebbről érkeznek, majd kapcsolatba kerülnek), vagy csökken, ha az oldal szétterül |
| Megtévesztés | egy kis, kapcsolatban álló elem két vagy több ellenséget másik helyről magára vonz; egy nagyobb csoport ezután négy hatótávolságnyi távolságból támad, ahol az ellenségből kevesebb van |
| Visszavonulás / üldözés | egy kapcsolatban álló csoport elfordul, és R-nyi távolságot nyit attól a helytől, ahol harcolt; biztos, ha az ott álló ellenség éppen megölt közülük egyet, és a csoport 2 R-re jutott ettől a gyilkostól (gyalogosan soha, lásd lent); az ugyanabba az irányba mozgó és lépést tartó ellenségek üldöznek |
| Mélységi védelem | álló egységek két vagy több sávban, az ellenség tengelyére merőlegesen, R mélységben; az ellenség közeledik, a sávokból tüzelnek |
| Fordított lejtő | három vagy több ölés rövid távolságból, olyan áldozatoktól érkező álló egységek részéről, akik egy gerincen át jöttek |
| Lesbetámadás | egy mozgó csoport olyan ellenségekbe fut, akik 45 másodpercig álltak; ők lőnek először, és a mozgók két egységet vagy a csoport felét elveszítik |
| Felderítő előőrs | egy-két egység halad egy három vagy több egységes test előtt, és elsőként találkozik az ellenséggel |
| Belső vonalak | egy oldal csoportjai közel állnak egymáshoz a másik oldal csoportjai között, az egységei közöttük váltanak |
| Tempó | egy oldal a kapcsolatra (fordulás, sebességváltás, első lövés) 1,5-szer gyorsabban felel, Mann–Whitney p 0,05 alatt |
| Crank, notch, drag, pump | a rakétakilövés célpontja a lövőt 35–70°-ra, 75–105°-ra vagy 140° fölé fordítja, vagy elhúz, majd visszafordul |
| Légi csipesz, fal, vezér–követő, őrlő | egy páros szétválik, hogy egy ellenségre rámenjen; három egymás mellett az ellenség felé; egy elem 5–20 km-rel egy másik mögött; két gép egy pont körül kering, egymástól egy távolságra |
| Harci légőrjárat | három percig kering egy állomás körül |
| Energia- / szögvívás | közelharcban – 30° eltérő irányok, mindegyik sorra tartja a másikat az orrában, vagy ölés történik köztük –, a magasságot használják és emelkednek, vagy laposan, erősen fordulva lassulnak; biztos, ha az egyik megölte a másikat |
| Csapásmérő csoport, SEAD | vegyes szerepű légi csoport, amelynek egy része földi célt támad; a légvédelmi ölések a többi földi ölés előtt jönnek |
| Csatasor, a T átvágása | három hajó oszlopban; egy oszlop négyzetben egy ellenséges oszlop feje előtt |

Minden manőver megmondja, mely **mintákat** mutatja a tudásbázisból (`patterns-maneuver.ts`: alakzat, frontális támadás, kettős bekerítés, bekerítés, áttörés, tűz és mozgás, megtévesztés, visszavonulás, üldözés, mélységi védelem, árnyékolás, szóródás, rakétavédelem, szögvívás, légőrjárat, csapásmérő csoport, csatasor, a T átvágása), és azokat a bejegyzéseket, amelyeket előbb érdemes elolvasni. A régebbi bejegyzések az új mintákat a `knowledge/maneuver-tags.ts` fájlon keresztül kapják meg. Lásd [A tudás-lencse](knowledge.md).

A **Megérte** összeveti az egységek cseréjét, miközben a manőver tartott (és egy perccel utána), az oldal cseréjével a meccs egészében. A visszavonulás akkor térül meg, ha a fordulás után kevesebb egységet veszít, mint előtte; a rakétavédelem, ha a repülőgép egy percig életben marad; a bekerítés, ha a zsák fele elvész.

## Több meccs fölött {#over-many-matches}

Minden meccs összegzése (`src/mass/summarize.ts`, lásd [Tömegelemzés](mass-analysis.md)) tartalmaz egy kis `maneuvers` részt: oldalanként és fajtánként a végrehajtott manővereket (Valószínű vagy magasabb szinten), a megtérülteket, a meg nem térülteket, az ölést és a veszteséget. A **Tömegelemzés → Manőverek** ezeket összeadja a szűrő által megtartott meccsekre, pályánként és módonként vagy összesen. A megtérülési arányt a Wilson-intervallumával együtt mutatja; egy sor betölti azokat a meccseket, amelyekben a manőver történt. A szakasz nélkül készült összegzések nem tartalmazzák ezeket: a hozzáadásukhoz futtasd a `node tools/3dheat-summarize.mjs <mappa> --force` parancsot.

## Mennyire biztos {#how-sure-it-is}

Mesterségesen készült meccsek, amelybe manővereket építettek (`synth.ts`, a `maneuver.test.ts` futtatja): mind a 28 beépített fajtát megtalálja Valószínű vagy magasabb szinten. A jelentett 50 manőverből 31 a beépített fajta, a másik 19 szintén valóban ott van (a mozgó csoport alakzata, a behatoló oszlop frontális megközelítése). Egy sem téves. 30 üres meccsen – véletlen bolyongások külön és keverve, véletlenszerűen álló egységek, egyenes szakaszokon repülő gépek, körbe-körbe mozgó tömeg – Valószínű vagy magasabb szinten semmit sem jelent.

Valódi adatokon (több tucat földi csata, néhány hosszú légi háborús küldetés, tucatnyi lövöldözős meccs) a frontális támadások, oldalba támadások, áttörések és bekerítések a harckocsi-csatákban fordulnak elő; alakzatok és közelharcok a levegőben; rakétavédelmek, légőrjáratok és vezér–követő párok a légi háborús küldetésekben; frontális támadások, amelyeket végrehajtottak, oszlopok, és néhány lesbetámadás és fedezett pár a lövöldözős játékokban. A küszöbértékek a doktrína alakzatai a játék méretarányában. Egy-egy találatot a bizonyítékával együtt olvass, a tömegtáblázat arányait pedig a hozzájuk tartozó intervallumokkal.

### Null-modellekkel szemben {#against-null-models-of-the-same-matches}

A felismerő a talajjal és a tömeggel is félrevezethető: harcban minden csoportnak mindenfelé vannak ellenségei. Ezért minden fajtát lefuttatunk ugyanazokból a meccsekből épített **null-modelleken** (`nulls.ts`), ahol az oldalak már nem úgy találkoznak, ahogy valójában: az egyik oldal idővonalát a meccs egyharmadától kétharmadáig terjedő mértékben megfordítjuk (*shift*, eltolás), vagy a pályák középpontja körül forgatjuk az útvonalait (*rotate*, forgatás); a csapatcímkéket pedig összekeverjük (*teams*, ami szerkezeténél fogva a valódi harcok mintegy felét megtartja). A harcokat csak akkor számoljuk, ha az ölés párosítható a halállal: a gyilkos 2 R-en belül, az áldozat a helyén. A null-modell ezt megszünteti.

Az alábbi táblázat azt mutatja, hány, Valószínű vagy magasabb szinten talált manőver jut egy meccsre a valódi adatokon és a null-modellek mellett (30 harckocsi-csata; 12 lövöldözős meccs):

| Fajta | Harckocsi-csaták: valódi / eltolt / forgatott | Lövöldözős: valódi / eltolt / forgatott |
|---|---|---|
| Bekerítés | 0 / 0 / 0 (korábban 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Áttörés | 0,03 / 0,02 / 0,05 (korábban 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Oldalba támadás | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontális támadás | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Visszavonulás | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (ezért gyalogosan soha nem biztos) |
| Lesbetámadás | - | 0,17 / 0,04 / 0,04 |
| Energiaharc | 1,2 / 0,1 / 0,85 | - |
| Szögharc | 0,6 / 0,07 / 0,3 | - |

A pálya közepe körül vívott közelharci légi harcok túlélik a középpont körüli fordulást, ezért a forgatott oszlop kevésbé hízelgő számukra, mint a földi fajtákra. Az egy oldalon belüli fajták – alakzat, légőrjárat, őrlő, csapásmérő csoport, SEAD, fedezett előrenyomulás, árnyékolás – nem függnek a másik oldaltól, ezért nem tesztelhetők így. A `maneuver.test.ts` ellenőrzi, hogy a null-modellek eltávolítják a mesterséges meccsekből a beépített oldalba támadást, csipeszt, bekerítést, áttörést, lesbetámadást és visszavonulást.

## Korlátok {#limits}

- A csoportokhoz pozíció kell az idő függvényében; egy csak eseményekből álló fájlban nincs pozíció.
- Az irányt nem olvassuk ki az adatokból: az ellenség frontja ott van, ahol a rögzítő erő harcol vele, különben ahol mozog, különben ahonnan a támadó érkezett.
- A terepet az egységek saját magasságából olvassuk (a fordított lejtő); nincs látóvonal-vizsgálat.
- A nagyon nagy fájlokat hosszabb lépésekkel mintavételezzük; a rövid légi manővereket bennük is 2–4 s-os lépésekből olvassuk.
