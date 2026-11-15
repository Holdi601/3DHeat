---
title: "Taktikatábla"
nav_order: 12
has_children: true
lang: "hu"
source: "tactics-board.md"
source_hash: "e89ef050b0f2"
translated: true
outdated: false
---

# Taktikatábla

A **Taktika** fül egy rajztábla csapattervekhez: kis figurákat helyezel egy térképre, nyilakat húzol arra, hová mennek, és a lejátszással megnézed, mi történik. Azért használd, hogy egy kört vagy támadást megtervezz, mielőtt játszanál. A vásznat, a kamerát és a [pályát](levels.md) a többi fülrel osztja meg, mást nem; egy terv nem adat, és nem rajzol hőt.

## Az első terved {#your-first-plan}

1. Nyisd meg a **Taktika** fület. Válaszd ki a **Játék**et (például Counter-Strike 2), és Valorant esetén nyomd meg a **Valorant-térképek betöltése** gombot, majd válassz egy **Térképet**. Vagy előbb tölts be egy [pályát](levels.md).
2. Válassz egy **Oldalt** (ez adja a színt), és nyomd meg a **Felülnézet** gombot.
3. Válaszd a **Hely**et, válassz egy figurát a **Figurák** listából (a **Figurák keresése** segít megtalálni), és kattints a térképre. Helyezz el kettőt vagy hármat.
4. Válaszd a **Nyíl**at, kattints egy figurára, kattints azokra a pontokra, amerre menjen, és nyomd meg az **Enter**-t a nyíl befejezéséhez.
5. Nyomd meg a **+** gombot a nézet alatt, hogy hozzáadj egy 2. lépést. Minden figura ott kezd, ahol a nyila véget ért. Ott húzz további nyilakat.
6. Nyomd meg a **▶** gombot (vagy a `K`-t), hogy a terv a mutatott lépéstől a végéig lejátsszon.
7. Nevezd el a tervet a **Terv neve** mezőben, és nyomd meg a **Mentés** gombot.

![A Taktika fül felülnézetben: játék, oldalak és eszközök a bal oldalon, három figura Mozgás nyilakkal, egy füst-dobás íve, egy Terület és a lépések az alján](../assets/img/hu/tactics.webp)

## A terv indítása {#starting-a-plan}

| Vezérlő | Mit csinál |
|---|---|
| **Játék** | A palettán megjelenő oldalakat és figurákat választja ki: Counter-Strike 2 (T, CT; játékosok és segédeszközök), Valorant (Támadás, Védelem; játékosok és általános képességek), Battlefield, Squad, Arma (gyalogság, földi járművek, repülőgépek, hajók), DCS / War Thunder / IL-2 (sugárhajtású gépek, légcsavaros repülőgépek, helikopterek, légvédelem, föld, hajók, fegyverek), és Egyéb. Egy már figurákkal rendelkező terv megtartja az oldalait, ha a játék változik. |
| **Terv neve** | Az a név, amelyen a terv mentésre kerül. |
| **Térkép**, **Valorant-térképek betöltése** | Ha a Valorant van kiválasztva: a **Valorant-térképek betöltése** lekéri a térképek listáját a [valorant-api.com](https://valorant-api.com) oldalról; a **Térkép** aztán a kiválasztott térkép minitérképét teszi pályaként, felülről keretezve. A képet kiválasztáskor töltjük le, és soha nem szállítjuk. A Riot értesítése látszik, amíg a képernyőn van (lent). |
| **Oldal** | Az oldal, amelyhez a következő figura, nyíl vagy terület tartozik; felveszi az oldal színét. |

Pálya nélkül a tábla a sík talaj. Egy pályát a **Pálya** alatt tölts be, hogy valódi térképen tervezz: egy CS2-térképet a CS2-eszközzel exportálva, egy pályát a könyvtárból, vagy egy térképképet.

## Eszközök {#tools}

| Eszköz | Kattintás | Megjegyzések |
|---|---|---|
| **Kijelölés** | Egy figura, útpont, nyíl, terület vagy jegyzet kijelöli. | Shift+kattintás hozzáad vagy elvesz; Shift+húzás dobozt húz arra, amit hozzáadnál. A kijelölés transzformációs fogantyút kap (lent); a `Delete` vagy `Backspace` eltávolítja. Az `M` a kijelölt figurát a következő kattintásra mozgatja. |
| **Hely** | Lerakja a kiválasztott figurát. | Figurát a **Figurák** palettán választasz (a **Figurák keresése** segítségével). Ha semmi sincs kijelölve, az `R` a következő figurát 15°-kal elfordítja, mielőtt lerakják (`Shift+R` az ellenkező irányba). |
| **Nyíl** | Minden kattintás hozzáad egy pontot; az Enter, a dupla kattintás vagy a jobb kattintás befejezi, az Esc eldobja. | **Mozgás**, **Támadás** (szélesebb fej) vagy **Figyelés** (vékony vonal szemmagasságban). Egy figurán kezdett nyíl az a figura útvonala ebben a lépésben: lejátszáskor a figura bejárja, és a következő lépés ott kezdődik, ahol véget ért. |
| **Dobás** | A dobó, majd az, hová esik. | Szaggatott ív az egyiktől a másikig, és a kiválasztott segédeszköz (füst, villanás, molotov …) ott jelenik meg, ahol landol, és ettől a lépéstől kezdve ott marad. |
| **Terület** | A közép, majd a szél. | Korong az oldal színében. |
| **Jegyzet** | Ahová a jegyzet kerül; megkérdezi a szövegét. | Tűként látszik, a szövege fölötte. |
| **Törlés** | Egy figura, nyíl, terület vagy jegyzet. | Eltávolítja az adott lépéstől kezdve; az első lépésen pedig teljesen. |

A **Visszavonás** és az **Újra** (`Ctrl+Z`; `Ctrl+Y` vagy `Ctrl+Shift+Z`) minden változáson végigmegy. A terv alatti sor megmutatja, hány figura, nyíl és lépés van benne. A **Felülnézet** egyenesen lefelé néz (ortografikus), a **3D-nézet** visszaáll perspektívára, a **Keret** a tervhez igazít, vagy üres tervnél a pályához.

A **Figuraméret** a táblán minden figurát skáláz; az 1× a valódi méret, ami magasról nézve egy személynél néhány pixel.

## Mozgatás, forgatás és méretezés {#moving-turning-and-scaling}

A táblán minden mozgatható, mint egy 3D-s szerkesztőben: figurák, segédeszközök, jelölők, egyedi útpontok és egész nyilak, területek és jegyzetek. A kijelölt elem a közepén fogantyút kap:

| Mód | Billentyűk | Fogantyúk |
|---|---|---|
| **Mozgatás** | W (vagy G) | Tengelyenként egy nyíl (X piros, Y zöld és felfelé, Z kék) mentén mozgatja; egy négyzet a síkjában mozgat; a közép a mutató alatti pálya fölött mozog. |
| **Forgatás** | E (vagy R) | Tengelyenként egy gyűrű körül forgat. Egy figura gyűrűi a saját elfordulását, dőlését és görgetését adják; csoport a világtengelyei körül forog a közepén. |
| **Méretezés** | R (vagy S) | Szétterít vagy összehúz a kijelölést a közepéből egy tengely mentén vagy minden irányban; egy terület sugara ezzel nő. |

A **Billentyűk** a W / E / R (Unity, Unreal) és a G / R / S (Blender) között váltanak; a billentyűk csak akkor választanak módot, ha valami ki van jelölve, egyébként a kamerát repítik. Így az `R` W / E / R billentyűkkel a **Méretezést**, G / R / S billentyűkkel a **Forgatást** jelenti, amíg valami ki van jelölve, és ha semmi, a következő lerakandó figurát fordítja el. Az összes táblabillentyű a [billentyűzet-hivatkozásban](keyboard-reference.md#tactics-board) van. Húzás közben tartsd lenyomva a **Ctrl**-t, hogy egy mozgatás a **Rács** (méter) szerint ugorjon, vagy egy fordulás a **Szögléptékhez** igazodjon. A **Rögzítés a talajhoz** (alapból be) a mozgatott embereket, járműveket, jelölőket, útpontokat és területeket a pálya felszínére teszi; a repülőgépek és helikopterek megtartják a magasságukat, és az Y nyíl mentén húzott mozgás soha nem ugrik. A fogantyú húzása soha nem mozgatja a kamerát. Az **Esc** megszakítja a húzást, és minden változás egy lépés a Visszavonásban.

Az útpontok pontokként látszanak a mutatott lépés nyilain: kattints rá a kijelöléshez, húzd a mozgatáshoz, Delete a kiveréshez. A **Kijelölt** rész megmutatja a kijelölés helyét méterben, egy figura elfordulását, dőlését és görgetését fokban, és egy terület sugarát, mindegyik beírható.

## Időzítés {#timing}

Egy figura útvonala időzített: minden szakasz annyi ideig tart, amekkora a hossza a pályán – a felszínen néhány méterenként mintavételezve, így egy domb vagy egy lépcső két pont között beleszámít –, az adott játékban a figura mozgási **módjának** sebességén, plusz az útponton lévő bármilyen **várakozás**. A gyalogság lopakodik, guggol, sétál (csendben), fut vagy sprintel; a járművek és hajók lassan mennek, óvatosan, normálisan vagy rohannak; a repülőgépek és helikopterek lassan repülnek, utazósebességgel, harci sebességgel vagy maximumon. Egy mód, amelyet a játék nem ismer (a CS2-ben nincs sprint), a legközelebbit veszi, amelyik van. Hogy a lejtő hogyan lassít, a játéktól függ: a CS2-ben és a Valorantban csak a vízszintes távolság számít, ahogy a játékokban is; a katonai szimulátorokban a gyalogság felfelé lassul (Tobler túrázási függvénye), a járművek pedig a meredekség szerint.

A sebességek játékonkénti táblázatokból jönnek, a forrásaikkal együtt (lásd [Mozgási sebességek](tactics-speeds.md)): a CS2-höz a kézben tartott fegyver szerint, a játék fegyverdefinícióiból; a Valorantnál fegyver szerint; a Battlefieldnél, Squadnál, Armánál és a légi játékoknál jármű-típus és osztály szerint. A **Így mozog** kiválaszt egy figura profilt (egy fegyvert, egy jármű-típust); az **Saját (m/s)** felülbírálja a módot az adott figurára. A módok a táblán látható nevükön szerepelnek: *Lopakodás*, *Guggolás*, *Séta (csendben)*, *Futás*, *Sprint*; *Óvatos*, *Normális*, *Rohanás*; *Lassú*, *Utazó*, *Harci*, *Maximális*.

Minden útpont mutatja az előzőtől eltelt időt és a terv kezdete óta eltelt időt („+3,9 s · 0:12"). A kiválasztott figura útvonala minden szakaszt felsorol a módjával, hosszával és idejével, a várakozással és az érkezéssel együtt. Az **Érkezések** az **Időzítés** alatt minden útvonalas figurát egy idővonalra tesz, a legkorábbi érkezés felül. A **Valós időben játszás** (alapból be) mellett egy lépés addig tart, amíg a leglassabb útvonal megérkezik, és minden figura a saját sebességével mozog; ekkor a **Másodperc** a lépés legrövidebb hossza. A **Pályaegység méterenként** megmondja, mi a pálya: 39,37 a CS2-térképeknél (játékegységek), 1 a méterrel dolgozó térképeknél.

## Összevetés meccsadatokkal {#compare-with-match-data}

A **Meccsfájlok betöltése…** beolvassa a térkép CS2-meccstábláit (a CS2-eszköz Parquet-fájljait, amennyi kell; csak a szükséges oszlopokat, a háttérben); a **Betöltött adatok használata** a megjelenítőbe betöltött adatot veszi. Ezután:

- A **Legkorábbi érkezés a térképen** színezi a térképet aszerint, mennyi idő telt el a forduló kezdete óta, mire egy játékos először elért minden helyet – a **Leggyorsabb** gomb a legrövidebbet mutatja minden fordulón át, a **Tipikus (medián)** a középsőt –, zölddel a korai, pirossal a késői érkezés, egy vagy mindkét oldalra. Azt mutatja, mi lehetséges, és mikor.
- A kiválasztott útvonal összevethető azzal, amit a játékosok elértek annak kezdetétől (vagy a forduló kezdetétől) a végéig, mindegyik végpont a megadott sugarú korong: „Leggyorsabb megfigyelt 14,2 s, p10 15,0 s, medián 18,3 s 41 futamból; a tervedben 15,1 s".
- A sebességek, amelyekkel a játékosok ténylegesen mozogtak – futás, séta, guggolás, a táblázatok séta- és guggolás-oszlopaiból –, m/s-ban.

## Lépések {#steps}

A nézet alatti sáv tartalmazza a lépéseket. Egy terv egy lépéssel indul; a **+** hozzáad egyet, és minden figura ott kezd, ahol az utolsó lépésben az útvonala véget ért; a **−** eltávolítja a mutatott lépést. A **Másodperc** azt mutatja, mennyi ideig tart a mutatott lépés lejátszva. A **▶** (K) a mutatott lépéstől a végéig játszik: az útvonallal rendelkező figurák bejárják azt, a következő lépésben új helyre állított figurák oda csúsznak, a többiek állnak. Amíg egy lépés látszik, minden figura következő helyzete halvány árnyként rajzolódik, az előző lépés nyilai pedig halványan az aktuális alatt.

## Mentés {#saving}

A **Fájl** rész tartalmazza a **Mentés**, **Megnyitás** és **Törlés** gombokat. A **Mentés** a tervet `<név>.h3dplan.json` fájlba írja (sima JSON: oldalak, lépések, figurák lépésenként egy hellyel, nyilak, területek, jegyzetek); a **Megnyitás** visszatölt egyet. Más verziójú fájlt, vagy olyat, amely nem terv, az okával együtt visszautasítunk. A **Törlés** kiüríti a tervet; a Visszavonás visszahozza.

## Figurák {#figures}

Minden figurát maga a megjelenítő épít: egyszerű alakzatok a típus közzétett méretéhez, azokkal a jellemzőkkel, amelyek megkülönböztetik a szomszédaitól – egy tank úti kerekei és tornya, egy légvédelmi jármű fegyverei, rakétái és radarjai, egy repülőgép szárnyterve, farka és motorjai, egy helikopter rotorjai és csonkszárnyai. Semmit sem vesznek át egy játékból. Egy játék által kitalált tervet az osztályának általános figurája mutat. Azt, hogyan talál az adat a figurájára, lásd a [Figurák](figures.md#which-figure-a-unit-gets) részben.

## A Riot értesítése {#riots-notice}

A Valorant-térképeket a Riot Games „Legal Jibber Jabber" szabályzata alatt mutatjuk, amely lehetővé teszi, hogy a szabad közösségi projektek használják őket, és kéri ezt az értesítést mindenhol, ahol megjelennek: *A 3DHeat a Riot Games „Legal Jibber Jabber" szabályzata alatt készült, a Riot Games tulajdonában lévő eszközökkel. A Riot Games nem támogatja és nem szponzorálja ezt a projektet.* A táblán lévő képességek általános alakzatok, nem a Riot művészete.
