---
title: "Diagramok és HUD"
parent: "Versenyelemzés"
nav_order: 53
lang: "hu"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Diagramok és HUD

A diagramok a köreidet méterről méterre egymás alá igazítják, így látod, hol fékezett később egy versenyző, vagy hol engedett korábban. A nézet bal felső sarkában lévő kártyák azt mutatják, mit csinál éppen minden autó és versenyző.

![Diagramok a nézet alatt: gázpedál, sebesség, gáz, fék és kormány sorai két körhöz, az idő- és okcsíkok fent, a kurzor és a kártyák](../assets/img/en/race-charts-rows.webp)

## A diagramok {#the-charts}

Minden kör egy távolságtengelyen van: méterek a referencia mentén (lásd [egy távolságtengely](race-corner-analysis.md#one-distance-axis)), így ugyanaz az x minden körnél ugyanaz a hely a pályán. Egy kört önmagában ábrázolunk (és az le is játszható); ugyanazon pálya második körét az elsőhöz viszonyítva rajzoljuk. Ha nincs betöltött kör (vagy az elemzés nem sikerült), a terület ezt írja: „A diagramok akkor jelennek meg, ha van betöltött kör; tölts be egy másikat ugyanarról a pályáról, hogy összehasonlítsd a kettőt."

### Mi van rajtuk {#what-is-on-them}

- **A jelmagyarázat**: minden ábrázolt kör színe és címkéje, a referencia „(referencia)" jelöléssel; „+N további kirajzolva, nem diagramozva", ha több kör látszik, mint amennyit ábrázolunk; **Grafikonok (N) ▾**; **Teljes kör**, ha nagyítva vagy; egy soros súgó.
- **Két csík** fent, a kiemelt körre:
  - *idő*: az [időtérkép](race-replay-and-scene.md#time-map-where) csíkként, piros, ha vesztünk, zöld, ha nyerünk;
  - *ok*: a veszteségei egy-egy sávként, ott, ahol az oka van, az ok színében; a sáv fölé húzva látszik a címe és a költsége.
- **Kanyarsávok**: egy árnyékolt sáv minden kanyar belépésétől a kijáratáig (ahogy a referencián megtaláltuk), és a neve (`T1` …) a tengely alatt, a csúcsnál.
- **A kiválasztott megállapítás**: egy sáv az ok színében a tartományán.
- **A sorok** (grafikonok), minden kiválasztott csatornához egy: a nevükkel, és balra a tartományuk felső és alsó értékével; ahol a tartomány átlépi a nullát, ott nullavonal van. Minden kör egy vonal a színében: a kiemelt kör 2 px széles és átlátszatlan, a referencia átlátszatlan, a többi 1,5 px széles, 75%-os átlátszóságú. A különbség-sor kihagyja a referenciát (az önmagához képest nulla).
- **A kurzor**: függőleges vonal ott, ahol a referenciaautó van (vagy ahol a mutató van), és egy pont autónként minden sorban, a különbség-sor kivételével – a kurzornál minden autó ugyanazon a méteren van; egyébként minden autó saját távolságán, a visszajátszó órájánál.

A diagramokon legfeljebb **8** kör látszik: a kiemelt, az osztályuk legjobbja és a referencia először, aztán a többi a betöltési sorrendben.

### Sorok és magasságuk {#rows-and-their-heights}

A sorok a diagram magasságát súlyuk szerint osztják el; egyik sem kisebb 16 px-nél:

| Sor | Súly |
|---|---|
| Különbség (a referenciához képest, másodpercben, előjellel) | 1,7 |
| Sebesség (km/h) | 1,7 |
| egy pedál (gáz, fék, kuplung) | 1 |
| kormány | 1,1 |
| sebességfokozat | 0,8 |
| egy lámpa (kézifék, ABS …) | 0,55 |
| minden más | 1 |

A táblázatban fix megjelenítési tartománnyal rendelkező csatorna (pedálok 0–100%) ezt használja; a többi a körök látható szakaszához igazodik. Ha egy sor neve túl hosszú a helyhez képest (egy hosszú szó egy másik nyelven), a felső érték egy sorral lejjebb kerül, ahol a sor elég magas, egyébként három ponttal rövidül; a teljes név az eszköztipp.

### Az alapértelmezett grafikonok {#the-default-graphs}

Amíg nincs grafikon kiválasztva: a **különbség**, aztán minden csatorna, amelyet a táblázat `graph`-ként jelöl, és amelyet a körök tartalmaznak – gáz, fék, kuplung, kézifék, kormány, sebességfokozat, sebesség –, kivéve, hogy egy pedál vagy lámpa csatornát kihagyunk, hacsak valamelyik kör nem mozgatja 0,02 fölé (a soha meg nem nyomott kuplung nem grafikon). A sorrend a táblázaté.

### A grafikonválasztó {#the-graph-picker}

A **Grafikonok (N) ▾** fölött egy panelt nyit:

- egy szűrőmező (a csatorna nevére vagy azonosítójára illeszt);
- **Alapértékek** (vissza az alapértelmezett készletre; az eszköztipp megmondja, hány van) és **Bezárás**;
- *Különbség a referenciához*, aztán minden csatorna, amelyet a diagramozott körök tartalmaznak, csoportosítva (mozgás, kezelőszervek, motor, segédek, gumik, fékek, futómű, kerekek, egyéb, idő, pozíció), mindegyiknél egy jelölőnégyzet; a kerekenkénti csatorna egy sor, kerekenként egy címkével (FL, FR, RL, RR).

A bejelölés a táblázat sorrendjét tartja, bárhogy is jelölted be. A választás az **Alapértékek** gombig vagy az újratöltésig marad. A táblázat által nem ismert csatornák az *egyéb* alatt jelennek meg, az azonosítójukból elnevezve („brakeLinePress" → „Brake line press").

### Egérmozgás, görgő, nagyítás, kattintás {#hover-wheel-zoom-click}

| Bemenet | Hatása |
|---|---|
| egérmozgás | minden autó, a kártyája és a kezelőszervei arra a méterre mozdulnak; egy jelző jelöli a pályán; egy táblázat mutatja minden diagramozott kör értékét minden sorban ott (a különbségnél „ref" a referenciára); a kártyák felett: „N m-nél – a diagramok kurzora". Ha elhagyod a rajzot, visszaadja a visszajátszásnak |
| görgő | a visszajátszást a körön belül 1/200 látható szakasznyit léptet kattintásonként (Shift: 5×), megállítva a visszajátszást; nagyítva a nézet követi a kurzort |
| Ctrl+görgő (Cmd+görgő) | nagyítja a távolságtengelyt a mutató körül, kattintásonként 1,25× kifelé / 0,8× befelé, sosem 40 m-nél szűkebben; a teljes körig kicsinyítve megszűnik a nagyítás |
| oldalirányú görgő | nagyítva oldalra görget (a szakasz 10%-a 100 egységnyi görgetésenként) |
| dupla kattintás, **Teljes kör** | kicsinyítés |
| kattintás | a visszajátszás arra a helyre ugrik, ahol a referencia eléri azt a métert |
| Shift+kattintás | egy vonalba igazítja az autókat ott (lásd [összeigazítás](race-replay-and-scene.md#lining-up)) |

A diagramok a nyelv váltásakor az aktuális nyelven rajzolódnak újra.

A jelmagyarázat súgósora röviden ugyanezt mondja: „Egérmozgás: minden autó ott · görgő: léptetés a körön · Ctrl+görgő: nagyítás · kattintás: ugrás · Shift+kattintás: összeigazítás".

## Az autókártyák (HUD) {#the-car-cards-hud}

A nézet bal felső sarkában egy kártya minden látható körhöz – legfeljebb **6**, a betöltési sorrendben az első hat látható kör – arra a pillanatra, ahol a visszajátszás (vagy a diagramok kurzora) tart.

**Fejléc:** a kör színe és címkéje; az élő különbség – ennek a körnek az ideje ahhoz, hogy elérje a jelenlegi távolságát, mínusz a referencia ideje ugyanahhoz a távolsághoz, „+0,48 s" – vagy „referencia"; **⋯**, hogy megmutasd vagy elrejtsd az összes többi értéket (ugyanaz, mint az *Összes érték a kártyákon*). A követett autó kártyája kiemelt.

**Az autó felülnézetből:** a karosszéria körvonala a kör színében, elöl egy nyíllal, négy gumi (az elsők a kormánnyal együtt legfeljebb 28°-ban elfordulva), mindegyik a hőmérséklete szerinti színnel, ugyanazokkal a jelekkel, mint a 3D-s autó lapos rajzán: csúszógyűrű, futómű-rúd, fékizzás, kopássáv, terhelési sáv.

**Kijelzők:** sebesség km/h-ban, a kör saját ideje, a távolsága a referencia mentén.

**Kezelőszervek:**

- egy kormánykerék, amelyet a kormánybemenet fordít (a teljes kormányszög 180°-ként rajzolva), alatta a százalékkal;
- egy-egy sáv minden pedálhoz, balról jobbra, ahogy a pedálsorban – kuplung, fék, gáz –, mindegyik a százalékával és a rövid nevével, a színében (csak azok a pedálok, amelyeket a kör tartalmaz);
- a sebességfokozat (R a hátrameneti, N a üresjárati);
- egy kis lámpa minden be/ki csatornához, amelyet a kör tartalmaz – kézifék, ABS, TC, DRS, boxutca-korlátozó, levegőben –, a színében világít, amíg be van kapcsolva (a tartománya fele fölött);
- egy kijelző minden szintcsatornához: fékeloszlás, ABS- és TC-beállítások, turbó, üzemanyag.

**A kezelőszervek nyoma:** a pedálok utolsó **6 másodperce** (egy sáv, mindegyik a színében), és a kormány (a saját sávja, középre igazítva), a pillanatban végződve – mit csinált a sofőr odáig vezető úton. Legfeljebb 160 pont.

**Összes érték** (⋯ vagy *Összes érték a kártyákon*): minden más skaláris érték, amelyet a kör ebben a pillanatban tartalmaz, aztán minden kerekenkénti csatorna négy értékként (FL FR RL RR), elnevezve a csatornatáblázatból vagy a csatorna saját nevéből, csoportonként rendezve.

## Fejlesztőknek {#for-developers}

Kód: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### A csatornatáblázat {#the-channel-table}

A `CHANNELS` táblázat a [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) fájlban az egyetlen hely, ahol egy csatorna le van írva: a mértékegysége, az, hogy mintánként egy értéke van-e vagy kerekenként egy (`name.FL` …alakban tárolva), a csoportja, a megjelenítési tartománya, az, hogyan rajzolódik az autón (`glyph`), hogyan jelenik meg a kártyán (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), hogy alapértelmezett grafikon-e, hogy lépcsőzetes-e vagy keveredik (sebességfokozat, jelzők), és hogyan jelenik meg (skála, mértékegység, tizedesjegyek). A címkék és a rövid nevek minden nyelven üzenetek (`race.channel.<name>.label` / `.short`).

Csatornák, amelyeknek van rajzuk vagy alapértelmezett grafikonjuk:

| Csatorna | Mértékegység | Rajzolva mint | Alapértelmezett grafikon |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedál (zöld, piros, …), %-ban | igen |
| `handbrake` | 0..1 | lámpa | igen |
| `steer` | -1..1, jobbra pozitív | kormánykerék | igen |
| `gear` | - | sebességfokozat | igen |
| `speed` | m/s, km/h-ban | - | igen |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lámpa | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | szintkijelző | - |
| `tireTemp` (kerekenként) | °C, megjelenítve 40–130 | gumi színe | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (kerekenként) | ahogy a játék skálázza, megjelenítve ±1,5 | csúszógyűrű | - |
| `combinedSlip`, `slipIndex` (kerekenként) | megjelenítve 0–1,5, illetve 0–1 | csúszógyűrű | - |
| `suspension` (kerekenként) | 0..1 | futómű-rúd | - |
| `brakeTemp` (kerekenként) | °C, megjelenítve 100–900 | fékizzás | - |
| `tireWear` (kerekenként) | 0..1 | kopássáv | - |
| `wheelLoad` (kerekenként) | N, megjelenítve 0–12 000 | terhelési sáv | - |

A táblázat többi csatornája (grafikonon és listában, de nem rajzolva): `latAcc`, `longAcc`, `vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`, `vertVel`, `bodySlip` (sodródási szög), `loose`, `lateral` (eltérés a referenciától), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`, `tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`, `wheelSpeed`, `wheelSurfaceSpeed`, továbbá `time`, `distance`, `x`, `y`, `z`.

**Egy táblázatban nem szereplő csatornát** is beolvasunk, grafikonon ábrázolunk (az *egyéb* alatt), és a kártyákon felsoroljuk, a nevét az azonosítójából véve. **Ahhoz, hogy megfelelő nevet, mértékegységet és rajzot kapjon**, vegyél fel egy bejegyzést a táblázatba (és a címkeüzenetét minden `src/i18n/locales/<nyelv>/race-channels.json` fájlba). Egy új *fajta* kerékrajzolás egy bejegyzés a `WHEEL_GLYPHS` táblában (glyph.ts), és a lapos párja, a `CARD_GLYPHS` (RaceHud.tsx). Mindkettő a fajta szerint van típusozva, így a build addig hibázik, amíg mindkettő nincs meg. A `src/race/extensible.test.ts` ellenőrzi, hogy az ismeretlen csatornák eljutnak a grafikonokig, hogy a táblázat minden glifája kirajzolható, és hogy a lámpák világítanak.
