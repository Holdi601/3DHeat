---
title: "Renderelés belső működése"
nav_order: 22
has_children: true
lang: "hu"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Renderelés belülről

A nézegető millió pontot rajzol izzó foltokként, és összeadja őket. Ez a rész azokat a trükköket magyarázza, amelyek ezt gyorssá teszik, és hogy mit jelentenek a statisztikai átfedés számai. Olvasd el, ha a nézegető lassúnak tűnik, vagy ha a renderelőn akarsz dolgozni.

```
adat -> időablak -> GPU-szűrők -> mintavételi terv -> szórás -> akkumulálás -> szín -> képernyő
```

Hogy a saját gépünk hogyan teljesít, a nézet jobb felső sarkában lévő statisztikai dobozban látod: [Teljesítménypanel és statisztikai átfedés](performance-and-stats.md). Az új szavak (GPU, sor, sprite, hőtérkép) a [szótárban](glossary.md) vannak.

## Az alapprobléma {#the-core-problem}

Átfedő sugárirányú rámpák összege képkockánként *N* × π*r*² kevert fragmenst költ. 8 képpont sugarú, 100 millió spritenél ez 2 × 10¹⁰ fragmens - nagyjából egy másodperc munka egy csúcskategóriás GPU-n. Minden képkockában nem lehet erőből végigszámolni, ezért a nézegető a következőket kombinálja:

- **időrendezett sorok** - egy idővonal-ablak két bináris keresés, és a lejátszás költsége a sorokat követi az ablakban, nem az egész adathalmazt;
- **nincs soronkénti CPU-munka képkockánként** - a sorok GPU-memóriában élnek, kvantálva; a szűrők, a csoportjelek, az élettartam-vizsgálat, az ablak, a takarás és a szelet mind a csúcsárnyalóban értékelődnek ki;
- **rétegzett mintavétel** kiegyenlítő súlyokkal, ha egy képkocka nem tud minden sort kirajzolni, és **progresszív akkumuláció**, amely a nézet mozdulatlansága alatt a pontos, minden sort figyelembe vevő eredményhez konvergál ([Mintavétel és keretek](sampling-and-budgets.md), [Akkumuláció](accumulation.md));
- **kétlépcsős fojtás**, amely a képkockánkénti spritekből, majd a hőfelbontásból enged a képkockasebesség megtartásáért ([Mintavétel és keretek](sampling-and-budgets.md#the-adaptive-budget));
- **kényszerített memória-keretek**, így a nem férő adathalmaz látható módon csonkul, nem omlik össze ([GPU-memória-rezidencia](gpu-memory.md)).

## Egy képkocka {#one-frame}

A képkocka-ciklus a [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Minden, ami képkockasebességgel változik - a kamera, a lejátszófej, a keret -, a motorban van, nem az alkalmazás állapotában, így egy képkocka nem jelent React-munkát; az állapotot képkockánként egyszer olvassuk, és csak az alacsony gyakoriságú kijelzőkbe írjuk vissza.

1. **Új adat?** Egy új adathalmazt egy képkockán jelzünk (*N sor feltöltése a GPU-ra*), a következőn töltjük fel, így az üzenet kirajzolódik, mielőtt a munka blokkolná a szálat. Egy új pályát átadunk a renderelőnek; a vonalhő-útvonalak épülnek vagy felszabadulnak.
2. **A lejátszófej** halad (legfeljebb 0,1 s valós idő képkockánként), újraindul vagy megáll.
3. **Kamera**: a billentyűket, az egeret és a gamepadet olvassa; a tengelytükör a nézeti mátrixba van beépítve; WebGPU-n egy mélységátskálázó mátrix alakítja át a three.js OpenGL-stílusú mélységtartományát a WebGPU-éra.
4. **Mi látszik**: az időtartomány az idővonalból és az előzményekből; a csoportjel-tábla (láthatóság csak oszlop szerinti bontásnál); legfeljebb négy szűrő - oszlopszűrők és az Entitások kijelölés; a különbségi bontás.
5. **A szín- és görbetáblázatok** újraépülnek, ha a beállításaik változtak.
6. **Keret**: az adaptív vezérlő beállítja az adott képkocka sprite-keretét és hőfelbontását; a *Minden sor kirajzolása minden képkockában* esetén a keretet minden jelölt sorra emeljük.
7. **Aláírások** döntik el, mit jelent még az akkumulációs puffer: változás a geometriában (*geometry*), ami megváltoztatja, mely sorok járulnak hozzá és hogyan; az idő-ablakban; vagy csak az eredmény színezésében (*composite*). Lásd: [Akkumuláció](accumulation.md#what-restarts-it).
8. **Mintavételi terv**: mely sorblokkokat rajzoljuk ki ([Mintavétel és keretek](sampling-and-budgets.md)).
9. **Akkumulációs mód**: visszaállítás, bővítés, mozgóátlag, futó átlag vagy tétlen.
10. **Box-visszajátszás geometriája** (kockák, nyomvonalak) a CPU-n, csak abban a módban és csak akkor, ha nem tétlen.
11. **Renderelés**: a háttérrendszer kirajzolja a jelenetet (pálya, rács, tengelyek, dobozok, nyomvonalak, vonalzó), a hőt szétszórja a hőcélba, beolvasztja az akkumulátorba, és a hőt a jelenetre komponálva a vászonra rajzolja.
12. **Automatikus expozíció** akkor fut le, amikor a visszaszámlálása nullát ér; a vonalzó hőszondája legfeljebb 120 ms-onként olvas egy képpontot; a kijelzők közzététele megtörténik.

Egy tétlen képkocka - konvergált, és semmi sem változott - kihagyja a jelenetet és a szórást, de még mindig **újrakomponál**: a `preserveDrawingBuffer` nélkül létrehozott WebGL-vászon tartalma a komponálás után nem definiált, ezért nem biztonságos abban bízni, hogy megtartja az utolsó képkockát. A jelenet és a hőcélok a nézegető saját keretpufferei, és megtartják a tartalmukat, így egy tétlen képkocka csak egy teljes képernyős passzba kerül.

## Az ebben a részben lévő oldalak {#pages-in-this-section}

- [A két háttérrendszer](backends.md) - WebGPU és WebGL2, hogyan választjuk ki, URL-kapcsolók
- [Akkumuláció](accumulation.md) - visszaállítás, bővítés, mozgóátlag, futó átlag
- [Mintavétel és keretek](sampling-and-budgets.md) - a rétegzett mintavevő, a pontos mód, az adaptív keret
- [Félpontos akkumuláció](half-float-accumulation.md) - tartomány és pontosság 16 bites célokon
- [GPU-memória-rezidencia](gpu-memory.md) - kvantált sortárolás és a kényszerített GPU-keret
- [Szoftveres renderelés felismerése](software-rendering.md)
- [Teljesítménypanel és statisztikai átfedés](performance-and-stats.md)
