---
title: "Kamera és vezérlés"
nav_order: 14
has_children: true
lang: "hu"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera és vezérlés

Úgy repülsz a jelenetben, mint egy madár: **W A S D** a mozgáshoz, egérhúzással nézelődsz. Ezen az oldalon repülhetsz, ugorhatsz felülnézetre vagy oldalnézetre, és pontosan megnézheted, hol van a kamera.

## Repülés 4 lépésben {#fly-in-4-steps}

1. Kattints egyszer a nézetre, hogy megkapja a billentyűzetet.
2. Tartsd lenyomva a **W**-t az előrerepüléshez, az **S**-t hátra, az **A**-t és a **D**-t oldalra, a **Szóköz**-t felfelé, a **Q**-t lefelé.
3. Tartsd lenyomva a bal vagy a jobb egérgombot, és húzd a körbenézéshez.
4. Nyomd meg az **F**-et, hogy az összes adat újra beleférjen a képbe.

A kamera egy szabad repülő kamera, perspektivikus és párhuzamos vetítéssel, előre beállított nézetekkel, gépelt pózzal és mélységélességgel. A beállításai az oldalsáv alján lévő **Kamera és jelenet** panelen vannak (a Versenyelemzés és a Meccs fülön is látszanak). A megvalósítás: [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Repülés {#flying}

| Bemenet | Hatás |
|---|---|
| `W` `A` `S` `D` vagy a nyilak | Előre (a nézet irányában, a dőlésével együtt), balra, hátra, jobbra |
| `Space` vagy `E` | Fel (a világ felfelé) |
| `Q` vagy a bal `Ctrl` | Le |
| `Shift` (lenyomva) | 6-szor gyorsabban |
| bal `Alt` (lenyomva) | 15%-os sebesség |
| Húzás a bal vagy a jobb egérgombbal | Körbenézés. Húzás közben a mutató zárolva van. |
| Egérgörgő | Repülési sebesség ×1,5 bekattintásonként (perspektíva); nagyítás (párhuzamos) |
| `F` | Az adatok képkockába igazítása |
| Kattintás (húzás nélkül) | Megmutatja, mi van a mutató alatt ([A nézet vizsgálata](#inspecting-the-view)) |
| `C` | A kamera helyzetének, legyezésének és bólintásának másolása |
| `G` | Ugrás egy gépelt pontra |
| `Esc` | A kiválasztókártya bezárása (és egy egység követésének abbahagyása) |

### Egy egység követése közben {#while-following-a-unit}

Ha a kamera egy egységet követ a visszajátszásban ([Meccs-visszajátszás](match-replay.md)), a repülőbillentyűk mást tesznek:

| Bemenet | Hatás |
|---|---|
| Görgő, `W` / `S` | Közelebb az egységhez / távolabb (magasabbra / alacsonyabbra a műholdnézetben) |
| `A` / `D`, `Q` / `E` | Keringés az egység körül (üldözési és keringési nézetek) |
| Húzás | Körbenézés az egység körül (pilótafülke: körbenézés belül) |
| `V` / `Shift+V` | Következő / előző kameranézet |
| `Esc` | Először a második egységről való nézés leállítása, aztán a követés |

A mozgóbillentyűk összeadódnak a [kontrollerrel](gamepad.md); mindent másról lásd a [billentyűzet-referenciát](keyboard-reference.md). A billentyűk figyelmen kívül maradnak, amíg szövegdoboz vagy legördülő lista van fókuszban. A dőlés közvetlenül a függőleges fölött és alatt van korlátozva.

## Kamera és jelenet panel {#camera--scene-panel}

![A Kamera és jelenet panel: Vetítés, Előre beállított nézetek, Látószög gombok, Repülési sebesség és Póz](../assets/img/en/camera-panel.webp)

### Vetítés {#projection}

**Vetítés**: *Perspektíva* (alapértelmezett) vagy *Párhuzamos*.

A *Párhuzamos* (ortografikus) megszünteti a rövidülést, így két azonos sűrűségű pont ugyanakkorának látszik a kép bármely részén. Ezt az összehasonlítást szolgálja a térképes hőtérkép, és ez teszi az izometrikus nézetet izometrikussá. Párhuzamos módban az egérgörgő nagyít (nincs olyan előremozgás, amely a méretarányt megváltoztatná), és a [sebességkijelző](#fly-speed) rejtve van.

**A váltás a tárgy méretét megtartja.** Egy párhuzamos vetítésnek nincs látószöge, ezért a csonkagúla magassága nincs összefüggésben a kamera távolságával. A naiv váltás vagy őrülten nagyít, vagy semmit sem mutat. Párhuzamosra váltáskor a csonkagúla magasságát arra állítják, amit a perspektivikus kamera lát a fókusztávolságban (2 × távolság × tan(látószög / 2); a fókusztávolság az utolsó képkockába igazítás távolsága). Vissza a perspektíva-póz áll helyre, amelyet otthagytál, ugyanolyan látszólagos méretarányban, nem pedig ott, ahová a párhuzamos nézet elkalandozott.

### Előre beállított nézetek {#preset-views}

| Csoport | Gombok | Tájolás |
|---|---|---|
| **Izometrikus** | **ÉK**, **ÉNy**, **DK**, **DNy** | Párhuzamos, dőlés -35,264° (= atan(1/√2), az a szög, amelynél mind a három tengely ugyanolyan hosszúra vetül), legyezés -45°, 45°, -135°, 135°. Négy sarok, mert egyetlen sarok mindig eltakarja a térkép felét a közelebbi dolgok mögött. |
| **Oldalnézetek** | **Felül**, **Alul**, **Elöl**, **Hátul**, **Bal**, **Jobb** | Párhuzamos. A Felül egyenesen lefelé néz (dőlés -89,9°), az Alul egyenesen felfelé, az Elöl a -Z irányába (legyezés 0°), a Hátul a +Z irányába (180°), a Bal a -X irányába (-90°), a Jobb a +X irányába (90°). |
| | **Vissza a perspektívához** | Vissza a perspektíva-pózba, amelyet otthagytál. Perspektívában nincs engedélyezve. |
| | **Háromnegyedes nézet** | Perspektíva, legyezés -35°, dőlés -28°. |

Mindegyik előre beállítás maga kapcsolja a vetítést. Perspektíva alatt a „felülnézet” még mindig egy eltűnési pont felé tart, és az egyenlő területek nem látszanak egyenlőnek. Az adatokat az adott irányból igazítja a képbe.

### Látószög {#field-of-view}

**Látószög** – a függőleges szög. Alapérték 65°, 10–140° a sávon (179° a fogantyúval), gombokkal: **Lapos 20°**, **Hosszú 35°**, **Normál 50°**, **Széles 65°**, **Nagyon széles 90°**. A szűk lapítja a perspektívát, és inkább párhuzamos vetítésre hasonlít. A széles eltúlozza a mélységet, és nehéz megítélni a távolságokat. Párhuzamos módban is élő marad: ott az a méretarányt állítja be, amelyet a váltás vissza kiszámol, és a távolságot, amelyet a **Képkocka** használ.

### Repülési sebesség {#fly-speed}

**Repülési sebesség** – világegység (méter) másodpercenként teljes gáznál. Alapérték 120; minden betöltéskor az adatok vízszintes kiterjedése / 12. Logaritmikus, 0,02–20 000 (a fogantyúval 200 000; a fogantyú arányokkal változtatja, nem összegekkel). Az egérgörgő bekattintásonként 1,5-szörösével szoroz vagy oszt, a 0,02–200 000 tartományon belül.

Ugyanez az érték a nézet jobb alsó sarkában látszik (csak perspektívában): a sebesség m/s-ben vagy km/s-ben, és az idő, amíg ezzel a sebességgel át lehet kelni az adatokon (vagy a pályán, ha 3D pálya van betöltve). Húzd felfelé vagy lefelé a sebesség megváltoztatásához.

### Közeli és távoli {#near-and-far}

**Közeli** (alapérték 0,5) és **Távoli** (alapérték 40 000) a vágási távolságok. Mindkettőt minden betöltéskor újraszámolják az adatokból (közeli = max(0,05; kiterjedés / 20 000), távoli = kiterjedés × 12), és csak tágítják, sosem szűkítik, ha a 3D pálya nagyobb ([Pályák](levels.md#what-a-level-does-for-the-heat)). Arányuk adja a mélységi pontosságot, amelyre a takarás támaszkodik, így egy nagyon kicsi közeli és egy hatalmas távoli gyengíti a [takarást](depth-and-culling.md). A jelenetén kívülről vagy a talaja fölül, nagyon magasról nézve a ténylegesen használt közeli sík ennek a távolságnak a 2%-ára tolódik ki. Így a messziről felülről nézett térkép elég mélységi pontosságot tart meg, és a víz meg a part nem villog. A doboz továbbra is a beállított értéket mutatja.

### Egyéb vezérlők {#other-controls}

| Vezérlő | Alapérték | Jelentés |
|---|---|---|
| **Y invertálása** | ki | Megfordítja az egér fel/le körbenézését. |
| **Mélységélesség** | ki | Lásd lent. |
| **Kontroller** | be | Lásd [Kontroller és HOTAS](gamepad.md). |
| **Póz** | | Lásd lent. |
| **Vizsgálat** | | A kamera-kijelző, a kattintásos kiválasztás, a legyezési konvenció és az *Ugrás egy pontra*; lásd: [A nézet vizsgálata](#inspecting-the-view). |
| **Képkocka az adathalmazra (F)** | | Az adatokat (a Versenyelemzés fülön: a köröket) a nézetbe illeszti, megtartva az aktuális irányt. A kamera a középponttól r / tan(látószög / 2) távolságra kerül, ahol r az adatok határoló dobozának átlójának fele. |
| **Rács**, **Tengelyek** | be, be | Talajrács 1/2/5 × 10ⁿ közökkel, az adatok kiterjedésének nagyjából 1/40-ed részénél (1,5 × az adatokig nyúlik, 8 és 120 rácslépés között), és színes tengelyek. |
| **Világtengely invertálása** X, Y, Z | ki | Lásd lent. |

### Póz {#pose}

Öt számmező – **X**, **Y**, **Z** és **legyezés °**, **bólintás °** – követi a kamerát, amíg egyikük sincs fókuszban. Írj be egy értéket, és nyomd meg az `Enter`-t (vagy hagyd el a mezőt), hogy a kamera oda mozduljon. A **másolás** a vágólapra teszi a `pos X Y Z · yaw A · pitch B` sort (mögötte `(game yaw)`-val, ha azt a konvenciót választottad). A repülés a felfedezés módja; a koordináták a nézet megismétlésének módja. Ugyanazok a számok, mint a [kamera-kijelzőn](#camera-readout): az adatok saját koordinátái, akkor is, ha egy tengely invertálva van, és a legyezés a választott [konvencióban](#yaw-conventions).

### Világtengely invertálása {#invert-world-axis}

A **Világtengely invertálása X / Y / Z** a világot az adott tengely megfordításával rajzolja. Egy játék, amely balkezes világot tart, ebben a jobbkezes nézegetőben tükrözötten jelenik meg: a jobbra kanyarok balra kanyarként rajzolódnak. Az X vagy Z invertálása visszaállítja. **Csak a rajzolás változik**: az adatok, az elemzés és minden koordináta, amelyet az eszközök mutatnak (póz, mérőléc, szelet), a játék saját marad. A nézet helyben fordul, úgy, hogy ugyanarra a helyre nézel. Ez a beállítás a böngészőben marad meg (`localStorage` kulcs: `heat3d.mirror`). Hasonlítsd össze a betöltéskori [tükrözésekkel](axes-units-and-time.md#flips), amelyek az adatokat változtatják meg.

## A nézet vizsgálata {#inspecting-the-view}

Hol van a kamera, mi van a mutató alatt, és ugrás egy pontra. Ez a Kamera és jelenet panel **Vizsgálat** blokkja, valamint két réteg a nézet bal felső sarkában. A kód: [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) és [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Vezérlő | Alapérték | Jelentés |
|---|---|---|
| **Kamerahelyzet a nézet fölött** | be | A kamera-kijelző, lent. A **×**-szal is bezárható. |
| **Kattintásra mutatja, mi van ott** | be | Kattintásos kiválasztás, lent. |
| **Legyezési konvenció** | Megjelenítő | Melyik legyezést mutatja és olvassa a kijelző, a póz-mezők és az ugrás-doboz. |

Ez a három a böngészőben marad meg (`localStorage` kulcs: `heat3d.inspect`).

### Kamera-kijelző {#camera-readout}

A nézet bal felső sarkában: a kamera **x**, **y**, **z**, **legyezés** és **bólintás** értékei élőben, a legyezési konvenciót megnevező címkével. Ugyanazokat a számokat mutatja, mint a [Póz](#pose) mezői, és repülés közben nem kerül semmibe (a képkocka órajelén íródik az oldalra, a panelek újrarajzolása nélkül).

- **másolás** (vagy `C` bárhol, kivéve szövegdobozt) a vágólapra teszi: `x X y Y z Z yaw A pitch B (viewer yaw)`, `.` tizedesjegyekkel, bármilyen nyelven. Ez egy olyan sor, amelyet az ugrás-doboz és bármely szkript visszaolvas.
- **ugrás** (vagy `G`) egy dobozt nyit alatta: illessz be egy pontot, és nyomj `Enter`-t, hogy odanézz, vagy illessz be egy teljes másolt pózt, hogy abba a nézetbe álljon. `Esc` bezárja a dobozt.

### Koordináták: az adatok saját kerete {#coordinates-the-datas-own-frame}

Minden koordináta, amelyet a vizsgálati eszközök mutatnak vagy elfogadnak, a **betöltött adatok saját keretében** van: a betöltés [tengelyleképezése](axes-units-and-time.md) (felfelé mutató tengely, tükrözések, skála) vissza van fordítva. A nézetről leolvasott pozíció az a szám, amelyet a forrástábla tartalmaz, és a táblából az ugrás-dobozba írt szám pontosan arra a helyre visz. Ha a leképezés nem változtat semmin (egy Y-felfelé, nem skálázott betöltés, amilyeneket a rögzítőeszközök és a pályaexportálók írnak), ez egyszerűen a világ. Különben a kijelző **adatkeret** címkét kap. Adatok nélkül a koordináták világkoordináták. A legyezés és a bólintás mindig a nézegető világára vonatkozik, Y felfelé.

### Legyezési konvenciók {#yaw-conventions}

| Konvenció | A 0° legyezés ebbe néz | Ebbe nő | Használja |
|---|---|---|---|
| **Megjelenítő** | -Z | -X | a szabad kamera, [előre beállított nézetek](#preset-views) |
| **Játék / rögzítőeszközök** | +X | -Z | a rögzítőeszközök `yaw` oszlopai és pózai; a nézegető keretében exportált pályán a játék saját legyezése |

A bólintás mindkettőben ugyanaz: a vízszintestől felfelé. A kettő egy negyed fordulatban különbözik, mást nem:

> megjelenítő legyezés = játék legyezés - 90°

Egy `d` irány `(cos p · cos y, sin p, -cos p · sin y)` a játék konvenciójában, és `(-sin y · cos p, sin p, -cos y · cos p)` a nézegetőében. Válaszd a **Játék / rögzítőeszközök** lehetőséget, ha egy rögzítőtábla legyezését közvetlenül be akarod írni, vagy össze akarod hasonlítani a kijelzőt egy ilyennel.

### Ugrás egy pontra {#going-to-a-point}

**Ugrás egy pontra**, a Vizsgálat blokkban (és a kijelző **ugrás** dobozában):

- a szövegdoboz `x, y, z` vagy `x y z` alakot fogad (vagy `x; y; z`), tizedespontokkal vagy tizedesvesszővel: a `-321.6, 137.8, -59.9` és a `-321,6 137,8 -59,9` ugyanaz a pont. Öt szám legyezést és bólintást is ad. A kijelzőről vagy a póz-mezőkből másolt póz egészben olvasódik, címkékkel és konvencióval együtt;
- a **legyezés °** és a **bólintás °** (nem kötelező) elfordítja a kamerát, a választott konvencióban;
- a **Ránézés** megtartja az irányt (ha vízszintesen nézett, legalább 20°-kal lefelé billentve), és az aktuális távolságig hátrál mentén. A távolság a jelenet szélességének 0,3% és 3% közé van szorítva: egy két kilométeres pályán 6–60 méter. A fókusztávolság, a párhuzamos nézet magassága és a repülési sebesség követi, így a nézet használhatóan érkezik;
- az **Ideállás** a kamerát a pontra teszi, a megadott legyezéssel és bólintással, vagy úgy, ahogy volt.

A beillesztett póz a saját legyezésével és bólintásával mindig abba a nézetbe áll.

### Kattintásos kiválasztás {#click-to-pick}

A nézetre kattintás (lenyomva és felengedve, legfeljebb 4 képpontnyi húzással; a húzás továbbra is körbenéz) egy kártyát mutat a bal felső sarokban arról, mi van a mutató alatt. Amíg a [mérőléc](measure.md) be van kapcsolva, a kattintások a mérőlécnek mennek.

**Egy rajzolt adatpont nyer.** A kattintáshoz legközelebbi minta 8 képponton belül van a ténylegesen rajzoltak közül: az időablakban és az élettartamban lévő sorok, amelyek átmennek a [szűrőkön](filters.md), a megjelenített csoportokon és a különbségfelosztáson, a távolsághatáron és a hőt levágó szeleten belül. A doboz-visszajátszásban a mutató alatti doboz (bárhol a rajta). A kártya felsorolja a sor összes oszlopát a forrás saját oszlopneveivel: idő (falióra, vagy a fájl saját másodperce `m:ss.ss` formában), személy, csoport, munkamenet, minden megtartott oszlop, a pozíció és a nézési irány. Emellett megadja a távolságot a kamerától. Csak azok az oszlopok vannak a memóriában, amelyeket a betöltés megtartott: egy oszlop, amelyet nem választottak [szűrőoszlopnak](column-mapping.md), nem látszik.

**Különben a pálya felszíne**: az a pont, ahol a kattintás sugara találkozik a pálya valódi háromszögeivel (nem a mérőléc referenciasíkjával). Megadja azt a **részt**, amelyhez tartozik (az exportáló neve, `structure:props`, `ground:terrain …`), a **fajtáját** (talaj, szerkezet, víz, térképkép), a koordinátákat és a távolságot. A szelet vagy a távolsághatár által elrejtett geometria átengedett. Ahol a pályának van [navigációs hálója](model-levels.md#navigation-meshes), egy sor megnevezi, és megmondja, hogy a hely rajta van-e (✓). A `≈` előtaggal ellátott résznév a részek határoló dobozaiból lett becsülve, mert a pálya azon részét betöltéskor egyszerűsítették.

A kártya addig marad, amíg be nem zárják (**×**, `Esc`), egy másik kattintás mást válaszol, vagy üres helyre kattintanak. A pontnál egy ciánszínű kereszt rajzolódik a jelenetbe, a képernyőn pedig egy gyűrű van rajta. Gombjai: **másolás** (minden érték, a koordináták `x, y, z` alakban), **Ránézés** és **Ideállás** (adatponton a sor nézési irányában, ha van; felületen 1,7 m-rel fölötte).

A pálya a kiválasztáshoz az első olyan kattintáskor indexelődik, amely igényli: oszlopokból álló rács az alaprajza fölött. Néhány ezredmásodpercenként épül a képkockák között, hogy a nézet soha ne álljon meg (körülbelül egy másodperces munka egy több millió háromszögből álló pályán), és a pálya változásáig megmarad. Addig a kártya *A pálya előkészítése a kiválasztáshoz* szöveget mutat százalékkal, és a kész állapotban válaszol a kattintásra. Egy több mint négymillió rajzolt soron átnyúló adatpont-keresés szintén képkockákra osztva fut.

## Mélységélesség {#depth-of-field}

Összecsukható szakasz a Kamera és jelenetben, címe *Mélységélesség – be*, amíg be van kapcsolva. Alapból ki: ez egy bemutató-hatás, és az alapnézetnek az adatokat kell mutatnia, nem azok értelmezését.

| Vezérlő | Alapérték | Tartomány (csúszka) | Jelentés |
|---|---|---|---|
| **Bekapcsolva** | ki | | |
| **Fókusz a bekeretezettre** | be | | A fókusz az utolsó képkockába igazítás távolságán van (*Fókuszban N m.*). |
| **Fókusztávolság** | 1000 | 1–200 000, logaritmikus (10 000 000) | Akkor látszik, ha a fókusz kézi. |
| **Rekesz** | ±35% | ±2% és ±200% között, logaritmikus (±3200%) | A megtartott éles mélység a fókusztávolság töredékeként. Relatív, nem blendeszám, mert a jelenetek egy szobától egy nyolc kilométeres térképig terjednek. |
| **Maximális elmosás** | 12 px | 1–48 (256) | A legnagyobb elmosási sugár; a költség ezzel arányos. |

Az elmosás a **pályát, a rácsot és a dobozokat** mossa, *nem a hőt*. Egy képpont hője sok mélységben lévő sprite összege, így nincs egyetlen mélysége, amelyen kívül eshetne a fókuszból. Ha a mögötte lévő geometriával mosnánk, rosszul lenne, bárhol lebeg is elöl. Az éles adat puhított környezet fölött a hasznosabb a kettő közül. Az elmosás egy 24 pontos arany-szögű gyűjtés az összeállító menetben, úgy súlyozva, hogy egy éles előtér ne kenődjön kifelé a mögötte lévő elmosott háttér miatt. Átállításkor a nézet újrarajzol anélkül, hogy a hőgyűjtés újraindulna.

## Vászonfelbontás {#canvas-resolution}

A vászon a kijelző képpont-arányában rajzolódik, legfeljebb 2-es értékkel. A hőpuffer ennél alacsonyabb felbontásban is rajzolódhat ([Hőfelbontás](performance-and-stats.md)).

## Ebben a szakaszban lévő oldalak {#pages-in-this-section}

- [Kontroller és HOTAS](gamepad.md)
- [Billentyűzet és egér referencia](keyboard-reference.md)
