---
title: "Teljesítménypanel és statisztikák"
parent: "Renderelés belső működése"
nav_order: 7
lang: "hu"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Teljesítménypanel és statisztikai átfedés

A nézet jobb felső sarkában lévő doboz azt mutatja, mennyit dolgozik a nézegető: hány képkockát rajzol másodpercenként, hány pontot rajzol, és finomítja-e még a képet. A **Teljesítmény** panel segítségével a képminőséget a sebességre cserélheted.

## A statisztikai átfedés {#the-stats-overlay}

A doboz a nézet jobb felső sarkában, a Hőtérkép és a Meccs fülön ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Minden animációs képkockánál olvassa a motor élő kijelzőjét.

![A statisztikai átfedés a sok-meccses jelenetben, számozott jelölésekkel: 1 Backend, 2 FPS, 3 Képkocka, 4 Sorok az ablakban, 5 Sprite / képkocka, 6 Keret, 7 Hőfelbontás, 8 Lefedettség](../assets/img/en/performance-stats-overlay.webp)

| Sor | Jelentés |
|---|---|
| **Backend** | *WebGPU* vagy *WebGL2*. Fölé húzva megmutatja, miért nem a WebGPU-t használja, ha nem azt. Lásd: [A két háttérrendszer](backends.md). |
| **FPS** | Képkockák másodpercenként, legalább 0,4 s-os átlagban. |
| **Képkocka** | Képkocka-idő ms-ban, simítva (90% régi, 10% új érték). Ez a két képkocka közötti idő, nem a GPU-idő - GPU-idő passzonként nem mérünk. |
| **Sorok az ablakban** | Jelölt sorok: az aktuális időablakban lévő sorok, a shaderbeli soronkénti szűrés előtt. |
| **Sprite / képkocka** | Az utolsó képkocka tervében leadott spritek (tétlen képkockákon, amelyek nem rajzolnak semmit, a tervezett szám marad). |
| **Keret** | Az a spritekeret, amellyel ez a képkocka tervet kapott - az adaptív vezérlő értéke, minden jelölt sorra emelve, ha minden sort kirajzolunk. |
| **Hőfelbontás** | A hőpuffer felbontása a vászon arányában: a *Hőfelbontás* beállítás szorozva az adaptív második lépcső arányával. |
| **Lefedettség** | Milyen messze van a progresszív akkumuláció attól, hogy minden sort felhasználjon: százalék konvergálás közben (borostyánsárga), *pontos*, ha kész. Egy zajos képkockát soha nem tévesztünk össze a kész képpel. |
| **Kockák** | A [box-visszajátszásban](box-replay.md) rajzolt dobozok. |
| **Nincs a memóriában** | Csak akkor látszik, ha a sorok nem fértek bele a GPU-keretbe: hány. Lásd: [GPU-memória-rezidencia](gpu-memory.md). |

## A sebességkijelző {#the-speed-display}

A nézet jobb alsó sarkában, csak perspektívában: a repülési sebesség és az idő, amely alatt ezzel a sebességgel átérünk az adaton. Húzd, hogy megváltoztasd a sebességet. Lásd: [Kamera](camera.md#fly-speed).

## Ha a nézegető lassú {#if-the-viewer-is-slow}

Nézd meg a statisztikai átfedést, majd:

1. **A Sorok az ablakban sokkal nagyobb, mint a Sprite / képkocka, és a Lefedettség 100% alatt van** - a képkocka nem tud mindent kirajzolni; mozdulatlanul több képkocka alatt konvergál. Szűkítsd az ablakot, szűrj, vagy vágj a jelöltek csökkentésére; vagy fogadd el a mintavételt.
2. **A Sprite / képkocka egyenlő a Sorok az ablakban értékkel, és a képkocka még mindig lassú** - a költség spritenként, a képernyőn: csökkentsd a *Maximális képpontsugár* beállítást ([Sprite alak](sprite-shape.md#pixel-clamps)) vagy a *Hőfelbontást*.
3. **Kevés sorral is lassú** - valószínűleg a pálya: sok szerkezet élekkel, földháromszögek, mélységélesség. Lásd: [Pálya megjelenése](level-appearance.md).
4. **Minden lassú, és vörös szalag van** - szoftveres renderelés ([Szoftveres renderelés felismerése](software-rendering.md)).

## A Teljesítmény panel {#the-performance-panel}

| Vezérlő | Alapérték | Hatás |
|---|---|---|
| Tipp | | Minden képkocka a látható sorok rétegzett, véletlen részhalmazát szórja szét, a súllyal kiegyenlítve, így a várható hő pontos minden keretnél; a nézet mozdulatlan tartásakor a képkockák addig egyesülnek, amíg minden sor hozzá nem járult. |
| **Minden sor kirajzolása minden képkockában** | be | Minden képkocka, amely új becslést kezd, minden jelölt sort kirajzol (kb. 268 millióig); az alábbi keret ekkor padló lesz. [Mintavétel és keretek](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptív keret** | be | Állítja a spritek számát képkockánként, majd a hőfelbontást, hogy tartsa a cél képkockasebességet - és leáll a csökkentéssel, ha az nem segít. [Mintavétel és keretek](sampling-and-budgets.md#the-adaptive-budget) |
| **Cél FPS** | 60 | 20-240 (a fogantyúval 1000). A 15 alatti értékeket 15-nek kezeljük. |
| **Kezdeti sprite / képkocka** / **Sprite / képkocka** | 4,00M | 65 536-268 435 456, logaritmikus. Adaptív mód mellett *Kezdeti*-nek nevezzük, mert a vezérlő mozgatja. |
| **Hőfelbontás** | 100% | 25-100%. A fragmensköltség a négyzettel arányos: 50% negyedére csökkenti a keverési munkát, és a hőmező elég sima ahhoz, hogy ez alig látszik. |
| **Progresszív finomítás** | be | Képkockák közötti akkumuláció, amíg a nézet mozdulatlan. Kikapcsolva minden képkockában az egyképkockás becslést mutatja. [Akkumuláció](accumulation.md) |
| **Erőforráskeretek** | érzékelt | RAM-, GPU- és feldolgozószál-keretek. [Memória és keretek](memory-and-budgets.md#resource-budgets) |

Ezek egyike sem mentődik el; újratöltéskor az alapértékek térnek vissza.
