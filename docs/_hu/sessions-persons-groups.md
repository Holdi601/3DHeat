---
title: "Munkamenetek, személyek és csoportok"
parent: "Adatok betöltése"
nav_order: 4
lang: "hu"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Munkamenetek, személyek és csoportok

Egy **személy** egy mozgó dolog (egy játékos, egy autó). Egy **csapat / csoport** az oldal, amelyhez tartoznak. Egy **munkamenet** egy meccs vagy egy kör. Lásd a [szójegyzéket](glossary.md).

A fájl egy sora mindhármat megnevezheti:

| x | y | time | player | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

A `player` a személy, a `team` a csoport, a `match` a munkamenet.

Három nem kötelező oszlop írja le, *kié* egy sor, és *a történet melyik részéhez* tartozik. Mindegyiket betöltéskor szótárral kódoljuk: a szöveges értékek soronként kis egész azonosítók lesznek, plusz egy címkelista, amelyet a betöltés minden fájlja megoszt.

## Személy {#person}

A **Személyazonosító** oszlop azt a mozgó dolgot nevezi meg, amelyhez egy sor tartozik: egy játékos, egy bot, egy autó. Soronként egy 32 bites azonosítóként tároljuk.

Személy- és időoszloppal a betöltés minden sorhoz kiszámítja az **élettartamát**: az időt a személy következő mintájáig *ugyanabban a munkamenetben*, vagy „none" (őrérték, −1), ha nincs következő minta – a személy meghalt, elment, vagy a napló véget ért. Az élettartamok hajtják az [idővonal](timeline.md) **Élettartam** előzményét, a [dobozos visszajátszás](box-replay.md) interpolációját és elavulását, valamint a [vonal-hő](line-heat.md) útvonal-töréseit. Hogy mit csinál egy sor, amelynek nincs utódja, az egy nézetbeállítás (*Tartalék élettartam*), nem az adatba égetett érték.

Minden személy a **legelső** sora csoportját kapja időben; ez színezi a dobozukat a dobozos visszajátszásban, és ez dönti el, melyik csoport láthatóság-kapcsolója rejti el őket ott. A hő-módok minden sor saját csoportját használják helyette.

### Több dolog által viselt nevek {#names-worn-by-several-things-at-once}

Egy név nem mindig egy entitás: egyes exportokban minden meccs minden botja ugyanazzal a névvel naplózódik. Két ilyen „személy" mintájának összekötése – interpolációval, nyomvonallal vagy útvonallal – két különböző lényt köt össze egy vonallal a térképen.

Betöltéskor ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) egy nevet **közösnek** jelölünk, ha két rekordja

- ugyanabban a munkamenetben van,
- ugyanazt az időpontot adja,
- ugyanabba a fajtába tartozik (minden megtartott kategóriaoszlopnak ugyanaz az értéke), és
- az adat kiterjedésének átlóján 1%-nál messzebb vannak egymástól.

A közös nevek egyedi mintákként rajzolódnak: nincs interpoláció, nincs nyomvonal, nincs vonal-hő-útvonal. Minden más róluk (a hőjük) nem változik. Az Adatkészlet panel megmutatja, hány nevet jelöltünk meg, legfeljebb három példával, a dobozos visszajátszás panel pedig megismétli a számot.

## Munkamenet {#session}

Az **Munkamenet / meccs** oszlop megmondja, melyik meccs, rajt, forduló, futam vagy kör tartozik egy sorhoz. Ez teszi egy személy mintáit egybefüggő pályává: a valódi telemetria gyakran egymásba fonódó, egyidejű meccseket tartalmaz, és egy játékos mintája, amely közvetlenül a lejátszófej előtt, illetve után van, különböző, egymástól több száz méterre lévő meccsekből származhat. Munkamenet-oszloppal:

- az interpoláció, a nyomvonalak és a vonal-hő útvonalai soha nem lépik át a munkamenet-váltást;
- egy sor élettartama a saját munkamenete végén ér véget;
- a **Munkamenet** választó megjelenik az oldalsáv tetején, a módsáv alatt.

A munkamenet-oszlop nagyon gyakran *időbélyeg*: a meccs kezdő pillanata, minden sorában megismételve. Az automatikus hozzárendelő ezért a személy és a csoport előtt keresi a munkamenet-neveket ([Oszlop-hozzárendelés](column-mapping.md#session-person-group)). Egy versenykör vagy szakasz is munkamenet: ugyanazon autó két köre nem kapcsolható össze egy pályává.

### A munkamenet-választó {#the-session-picker}

![A munkamenet-választó nyitva egy tíz meccset tartalmazó fájlon: Összes munkamenet (10), Meccs 01, Meccs 02 és így tovább](../assets/img/en/sessions-persons-groups-picker.webp)

*Tíz meccs egy fájlban: válassz egyet, vagy lásd mindet.*

Akkor jelenik meg, ha az adatkészletnek vannak felsorolt munkamenetei (lásd lent a korlátot).

| Rész | Jelentés |
|---|---|
| Címke jobbra | A kiválasztott munkamenet sorszáma, vagy *mind egyszerre*. |
| Menü | *Összes munkamenet (N)*, majd minden munkamenet, a legforgalmasabb elöl, `címke - N sor, tartomány` alakban (a tartomány 90 s alatt másodpercben, 90 perc alatt percben, e fölött órában). |
| Borostyánsárga súgó | Az *Összes munkamenet* esetén látszik: a pozíciókat továbbra sem kapcsoljuk össze munkamenetek között, de az egyidejű meccsek össze nem tartozó játékosokat tesznek egymás mellé a térképre. |
| Súgó | A hőmódokban látszik, ha egy munkamenet van kiválasztva: a választás csak a lejátszófejet mozgatja. |

Betöltéskor a legforgalmasabb munkamenet lesz kiválasztva. Munkamenet választásakor a lejátszófej arra a munkamenetre ugrik, amelynek a kezdete.

A kiválasztás ezeket változtatja:

- A **[dobozos visszajátszás](box-replay.md)**-ban ez dönti el, melyik munkamenet kerül lejátszásra: csak annak a dobozai és nyomvonalai rajzolódnak, és az idővonal tartománya a munkamenet saját tartománya lesz.
- A **hőmódokban** nem korlátozza a hőt, és a választó alatti súgó ezt mondja: *A hőmódokban ez csak a lejátszófejet mozgatja a munkamenet kezdetére; a hő továbbra is minden munkamenetet számol. A dobozos visszajátszás csak a kiválasztott munkamenetet játssza le.* Ha a hőt egy munkamenetre akarod korlátozni, tartsd meg a munkamenet-oszlopot szűrőoszlopként is (*Megtartás szűréshez*), és szűrj rá. Egy oszlop lehet egyszerre munkamenet-oszlop és szűrőoszlop: a betöltő minden bejelölt szűrőoszlopot külön olvas, bármilyen szerepe is van még.

### Túl sok munkamenet {#too-many-sessions}

Legfeljebb **100 000** munkamenet kerül felsorolásra. E fölött az oszlop valójában azonosító (egy mappa, amely több millió munkamenetet tartalmaz, mindegyik néhány sorral), és ennyi címke küldése a munkafolyamatból az oldalra az, ami kifuttatja a fület a memóriából. A betöltés ilyenkor a munkamenet-**azonosítókat** megtartja – így a határokat mindenhol érvényesítjük –, de a címkéket és a választót eldobja, és az Adatkészlet panel ezt megmondja.

## Csoport {#group}

A **Csapat / csoport** oszlop bármilyen kis számosságú oszlop: csapat, oldal, raj, frakció, játékos-vs-MI jelző, autóosztály. Soronként egy 16 bites azonosítóként tároljuk, és ez vezérli:

- a [Csapatlistát](teams-list.md) (láthatóság csoportonként, + / − oldalak),
- a [csapat-hőt](team-heat.md) (egy árnyalat csoportonként),
- a [különbség](difference.md) csoportonkénti felosztását,
- a dobozok színét a [dobozos visszajátszásban](box-replay.md) (egy árnyalatcsalád csoportonként, egy fokozat tagonként).

### Korlátok {#limits}

Legfeljebb **4096** különböző csoport. A csoport-azonosító minden sor pozíció-texelének negyedik csatornáján utazik a GPU-n, és minden csoportnak van egy texele a 4096 széles előjel-táblázatban, amelyet a shader olvas, hogy eldöntse: *rejtett*, *hozzáadott* vagy *kivont*. Az ennél több különböző értéket tartalmazó oszlop azonosító, nem csoport: **a betöltés minden sort megtart, és csak a csoportosítást dobja el**, az adatkészleten figyelmeztetéssel, amely azt javasolja, hogy inkább személyoszlopként rendeld hozzá, vagy tartsd meg szűrőoszlopként.

Ugyanez a 4096-os korlát vonatkozik a megtartott *kategória*-szűrőoszlopra is; a szélesebb nem marad meg, és az adatkészlet ezt megmondja. Egy számoszlop (mondjuk időbélyeg) nem esik ez alá, mint *tartomány*-szűrő.

A csoportértékek `0`, az üres érték, `none`, `unknown`, `null` és `-1` (kis- és nagybetű-érzéketlenül) a [csapat-hő](team-heat.md) számára „nincs csoport" jelentést hordoz, és ezeket semleges szürkével rajzolja, nem magabiztos színnel.

## Entitásméret {#entity-size}

Egy követett dolog mérete – egy játékos ütközési dobozának, egy autónak – eldönti, mekkorák a [dobozos visszajátszás](box-replay.md) dobozai és nézési sugarai. Erre a panelen nincs mező; a fájl [`heat3d` tippjeiből](data-formats.md#the-heat3d-hints) jön (`entity.size`, a fájl saját egységeiben; a CS2-átalakító 32-t ír). A betöltés ezt megszorozza az egységlépték-tényezővel.

Minden betöltésnél ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), ahol a *kiterjedés* az adat X és Z tartományai közül a nagyobb:

| Beállítás | Entitásmérettel | Nélküle |
|---|---|---|
| Kockaméret | entitásméret | kiterjedés / 500 |
| Nézési sugár hossza | entitásméret × 4 | kiterjedés / 200 |
| Sprite-sugár | kiterjedés / 120 | kiterjedés / 120 |
| Telítettségi pont | analitikus becslés (majd mérve) | ugyanaz |
| Repülési sebesség | kiterjedés / 12 | ugyanaz |
| Távoli sík | kiterjedés × 12 | ugyanaz |
| Közeli sík | max(0,05; kiterjedés / 20 000) | ugyanaz |

## Az Adatkészlet panel {#the-dataset-panel}

A Forrás panel alatt. Ha van betöltött adatkészlet, ez látszik rajta:

- az adatkészlet **neve** – a kiválasztás, a sorok száma, a fájlok száma, és ha volt, a ritkítási lépés;
- **`N csapat · N személy · Ns tartomány`**;
- minden **figyelmeztetés**, amelyet a betöltés létrehozott, borostyánsárgával, amíg az adatkészlet be van töltve: csoportok vagy szűrőoszlop eldobva túl sok érték miatt, munkamenetek nincsenek felsorolva, közös nevek, hiányzó sorok, kihagyott fájlok;
- a [szintetikus generátor](synthetic-generator.md);
- **Eltávolítás**, amely eltávolítja az adatkészletet.

A sorok száma a panel fejlécén látszik.
