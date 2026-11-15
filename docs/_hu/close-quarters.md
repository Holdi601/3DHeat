---
title: "Közelharc és körök"
parent: "Felismerések"
nav_order: 2
lang: "hu"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Közelharc és fordulók

Fordulóalapú lövöldözős játékokhoz (először a Counter-Strike-hoz, és bármilyen adathoz, amelynek vannak fordulói, oldalai és ölései) a Felismerések azt méri, hogyan nyerték a harcokat: ki nyerte a nyitópárbajokat, és mennyit értek azok; megtörtént-e a halálesetek cseréje; a bekukkantó játékos legyőzte-e azt, aki a szöget tartotta; bevált-e a kereszttűz és a villanás; hogyan mozdultak a fordulós esélyek minden ölésnél; és mely ajtók öltek meg a bennük belépő játékosokat. Azért használd, hogy lásd, *miért* nyertek a fordulók, nem csak azt, ki szerezte az ölést.

A mérések a szobatisztítás és a városi harc doktrínájából (a halálos tölcsér, a dominancia pontjai, a kereszttűz), valamint az e-sport és a sportelemzés területéről (győzelmi valószínűség, cselekvések értéke, igazított plusz-mínusz) származnak. Mindegyiket a [tudás-lencsén](knowledge.md) keresztül olvassuk, és hivatkozzuk.

## Próbáld ki {#try-it}

1. Tölts be egy vagy több meccset fordulókkal (egy CS2-átalakítás mindent tartalmaz, amire szükség van).
2. Nyisd meg a **Felismerések** fület, és nyomd meg a **Felismerések keresése** gombot.
3. A **A lencse mérőszámai** alatt olvasd el a *Fordulónyerési valószínűség* és a *Játékos hatása* közötti sorokat; mindegyiknek megvannak a számai, a 95%-os intervalluma, a q-értéke és a követett forrásai.
4. Válaszd az **E-sport** vagy a **Városi harc** lencsét, hogy azon a szakirodalmon át olvasd őket; az **Írás MI-vel** a jelentéssel együtt elküldi őket.

## Mit mér {#what-it-measures}

| Mérés | Mit mond | Hogyan |
|---|---|---|
| Fordulónyerési valószínűség | Mennyire volt valószínű, hogy egy oldal megnyeri a fordulót minden pillanatban | Logisztikus regresszió az oldalanként élő játékosokon, a bombán vagy célponton és annak idején, a forduló óráján és a vásárláson, az betöltött adatokra illesztve; a kalibrációt fordulónként, a mintán kívül ellenőrizve (Brier-pontszám és -készség, logveszteség, kalibrációs hiba tíz tartományon, újrakalibrálási meredekség, AUC) |
| Cselekvések értéke | Mennyivel változtatott egy ölés, egy nyitóölés, egy csere, egy villanás mögötti ölés, egy telepítés vagy egy villanás az oldal nyerési esélyén | A győzelmi valószínűség a cselekvés után mínusz előtte; a cseréket, a nyitó- és villanás-ölést a többi ölés ellen permutációs teszttel vetjük össze |
| Nyitópárbajok | Melyik oldal nyeri az első párbajt, az hányszor nyeri meg a fordulót, és hol nyer egy oldal nyitásokat az átlaga jóval fölött | Wilson-intervallumok; helyek pontos binomiális teszttel az oldal részesedéséhez képest, q a helyek fölött |
| Cserék | Halálesetek, amelyekre egy csapattárs válaszol úgy, hogy 5 másodpercen belül megöli a gyilkost; az eltelt idő, és a nyert fordulók, amikor az első halált cserélték | Fisher-féle pontos teszt, Newcombe-intervallum |
| Bekukkantó az tartóval szemben | Párbajok, amelyekben az egyik játékos belement a harcba (az utolsó másodpercben 1,5 m/s vagy több), a másik mozdulatlan maradt (0,75 m/s vagy kevesebb): a bekukkantó részesedése | Pontos binomiális teszt a felére |
| Célzás a párbaj előtt | Minden játékos nézete a másik irányához képest 0,75 másodperccel az ölés előtt; ki célzott jobban, és az a játékos milyen gyakran nyert; a szögén tartók (15° on belül) a szögén kívüliekkel szemben; ölési távolságok | Pontos binomiális teszt; Fisher |
| Kereszttűz | Tartók, akiknek egy mozdulatlan csapattársuk van a bekukkantótól 25 m-en belül, és akinek a rá mutató vonala 35° vagy több eltér a sajátjuktól, a magukra hagyott tartókkal szemben | Fisher, Newcombe |
| Segédeszközök a belépésekben | Bekukkantók a saját oldaluk villanása mögött (3 másodpercen és 15 m-en belül) vagy füst mögött (18 másodpercen belül), száraz bekukkantásokkal szemben; nyitópárbajok, ahol csak az egyik oldalon van villanás; megvakított áldozatok | Fisher, binomiális |
| Létszámelőny | Minden élő játékosszám-állapotra (5v4, 4v5, 2v1 …), amelyet először egy fordulóban elérnek, a belőle nyert fordulók részaránya | Wilson-intervallumok |
| Zárások | Fordulók, amelyekben egy oldal az utolsó játékosáig jut: nyeréseik a modell várt nyereségeihez képest, az ellenfelek száma szerint | Normál teszt a megfigyelt és a várt között |
| Halmozások, forgások, leselkedés | A legnagyobb csoport 10 m-en belül a nyitópárbajnál (3 vagy több: halmozott); a játékosok, akik 30 m-nél messzebb vannak az első harctól vagy a telepített célponttól, és milyen gyorsan érnek 12 m-en belülre; idő és ölés–halál esély több mint 30 m-re minden csapattárstól | Fisher; esélyhányados Woolf-intervallummal |
| Telepítés utáni szakasz és visszafoglalás | A telepítő oldal által nyert fordulók a telepítéskori számok szerint, és részesedése a telepítés utáni párbajokból | Wilson-intervallumok |
| Halálos tölcsérek | Belépések minden helyre (a helyoszlop változása, különben egy 8 m-es cella változása), és a belépéstől 2,5 másodpercen belüli halálesetek, a térkép arányához képest | Pontos binomiális teszt, q a helyek fölött; az arány 20 belépésnél a térkép arányára húzódik vissza |
| Játékos hatása | Minden játékos által fordulónként hozzáadott győzelmi valószínűség (ölések, halálesetek, telepítések), empirikus Bayes-szel összehúzva; a fordulóeredmények gerinces igazított plusz-mínusza a modell kezdetéhez képest; egy ölés értéke hely és fegyver szerint, összehúzva | A büntetést ötszörös keresztvalidálás választja ki |

Egy elemzés összes tesztje egy közös hamis felfedezési arányt (Benjamini–Hochberg) oszt meg, minden kipróbált helyet beleértve, nem csak a megjelenítetteket; a megjelenített q az összes fölött értendő. A modell és kalibrációja a betöltött adatokra illeszkedik, így azt a populációt írják le: egy profi modell félreméri az alkalmi játékot, és fordítva.

Ellenőrizve szintetikus fordulókon, beépített hatásokkal (bekukkantó előnye, kereszttűz, villanások, egy halálos tölcsér, a jobb célzás nyer), és 100 olyan adatkészleten ugyanezekből a fordulókból, hatások nélkül, ahol a beépített hatású tesztek hamis felfedezési aránya a névleges 5%-on kell maradjon (egy sávon belül) (`src/insights/cqb/cqb.test.ts`); mintegy ezer valódi fordulón a modell 0,14-es Brier-pontszámot ért el az alaparány 0,25-ével szemben, 0,03-as kalibrációs hibával és 1,0-s újrakalibrálási meredekséggel.

## Szükséges adatok {#data-it-needs}

- **idő**, **játékos**, **oldal** és **forduló** (a munkamenet) oszlopok, és az ölések és halálesetek az eseményoszlopban; azok a fordulók, ahol senki sem hal meg kétszer, kiesési fordulóként kezelődnek (a létszámelőny, a zárások és a modell ezt igényli);
- egy **másik fél** oszlop (`other`, `victim`, `killer`, `attacker`), amely megnevezi az áldozatot egy ölésnél és a gyilkost egy halálesetnél (nélküle a pontosan egyszerre történő ölések és halálesetek párosodnak);
- egy **nézési irány** a célzási mérésekhez;
- egy nyers `event` oszlop, amely a `flash`, `smoke`, `he`, `molotov`, `plant` és `defuse` értékeket nevezi meg a segédeszközökhöz és telepítésekhez;
- `won` (a sor oldala megnyerte a fordulót), `place` (helynevek), `weapon`, `buy` és `state_flashed`, ahol az adat tartalmazza.

A pozíciókat másodpercenként többször kell mintavételezni; a sebességek, a célzás és a kereszttüzek minden halálesetet megelőző utolsó két másodpercet olvasnak.

## A bontásban {#in-the-breakdown}

A [bontás](breakdown.md) a helyzetek közül négyet tényezőként mér, mint *nélkül–val*: *megvakítva*, *halálesetet cseréltek*, *nyitópárbaj*, és a számok (*létszámelőnyben*, *egyenlő létszám*, *létszámhátrányban*), mindegyiket K/D, nyert fordulók, túlélés és ölés percenként szerint.

## Sok meccs {#many-matches}

A fordulóoszlopos adat [sok meccses elemzésének](mass-analysis.md) minden meccsösszegzése ugyanazokat a méréseket hordozza darabszámként (`cqb` az összegzésben): nyitópárbajok, cserék, bekukkantók, kereszttüzek, villanásos belépések, célzás, létszámelőny, telepítések és a 40 leggyakrabban felkeresett hely a belépéseikkel és halálaikkal. A darabszámok meccsek fölött összeadódnak, így ezer meccs ugyanazokat a részesedéseket adja, mint egy nagy elemzés. A panel **Közelharc** fülén részesedésként látszanak, az intervallumaikkal, az összes térképen vagy térképenként; egy sorra kattintva betöltődnek azok a meccsek, amelyekből származnak.

## Fejlesztőknek {#for-developers}

`src/insights/cqb/`: `walk.ts` (egy menet a sorokon időrendben, a fordulók elkülönítve, a párbajok az állapotukkal rögzítve), `finish.ts` (a mérések és a meccsenkénti darabszámok), `model.ts` (logisztikus regresszió IRLS-sel, kalibráció, gerinc konjugált gradienssel, empirikus Bayes, Fisher, Newcombe, permutációs tesztek), `run.ts` és `worker.ts` (a megjelenítő: saját munkafolyamata, az insight-menet mellett), `summary.ts` (a sok meccses összegzés gyűjtője), `factors.ts` (a bontás helyzetei), `shows.ts` (amit a lencse olvas), `synth.ts` (a teszt-fordulók). A tudásbejegyzések a `src/insights/knowledge/cqb.ts`-ben, a minták a `patterns-cqb.ts`-ben vannak. Az eredmények a jelentésbe `lens.cqb` néven kerülnek.
