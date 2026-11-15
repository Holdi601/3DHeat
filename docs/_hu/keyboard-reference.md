---
title: "Billentyűzet és egér"
parent: "Kamera és vezérlés"
nav_order: 2
lang: "hu"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Billentyűzet és egér

Minden billentyű- és egérművelet egy helyen, hogy meg tudja találni azt, amelyre szüksége van. Először kattintson a nézetre, hogy az megkapja a billentyűzetet. A billentyűket figyelmen kívül hagyjuk, amíg egy szövegmező vagy egy legördülő lista van fókuszban. A rövid változat a nézet bal alsó sarkában is ki van írva.

Gyors kereső:

| Szeretnék ... | Nyomja meg |
|---|---|
| repülni | `W A S D`, húzás a nézéshez |
| mindent látni | `F` |
| lejátszani vagy szüneteltetni | `K` |
| visszafelé lejátszani | `J` (újra megnyomva szünet), előre `L` |
| látni, mit jelentenek a színek | `?` vagy `F1` |
| visszavonni a Taktika fülön | `Ctrl+Z` |

## Kamera {#camera}

A [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts) fájlból.

| Bemenet | Hatás |
|---|---|
| `W` / `↑` | Előre a nézési irányba |
| `S` / `↓` | Hátra |
| `A` / `←` | Oldalazás balra |
| `D` / `→` | Oldalazás jobbra |
| `Space` / `E` | Fel |
| `Q` / bal `Ctrl` | Le |
| `Shift` (bármelyik) | Nyomva tartva: 6-szoros sebesség |
| bal `Alt` | Nyomva tartva: 15%-os sebesség |
| Bal vagy jobb húzás a nézeten | Nézelődés (a mutató zárolva, amíg a gomb nyomva van) |
| Görgő (perspektivikus) | Repülési sebesség ×1,5 fokonként (görgőeseményenként legfeljebb 4 fokkal) |
| Görgő (párhuzamos) | Zoom |
| Jobb kattintás | A nézet fölött nem nyit helyi menüt |

## Globális {#global}

A [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx) fájlból.

| Billentyű | Hatás |
|---|---|
| `K` | Az [idővonal](timeline.md) lejátszása / szüneteltetése |
| `F` | Az adatok kerettel való bekeretezése |
| `C` | A kamera helyzetének, elfordulásának (yaw) és dőlésének (pitch) másolása ([kamera-kijelző](camera.md#camera-readout)) |
| `G` | Ugrás egy beírt pontra: megnyitja a dobozt a kamera-kijelző alatt |
| `Esc` | Bezárja a kiválasztó kártyát; majd leáll a második egység nézése; majd leáll egy egység követése |
| `T` | A taktikai megjelenítés nézet be- és kikapcsolása ([Meccs-visszajátszás](match-replay.md#display-style)) |
| `?` / `F1` | Súgó mód: mit jelentenek a színek ([Beállítások, egységek és billentyűk](settings.md#help-mode)) |
| `1` | [Hő](heat.md) |
| `2` | [Különbség](difference.md) |
| `3` | [Csapathő](team-heat.md) |
| `4` | [Vonalak](line-heat.md) |
| `]` | A távoli levágási határ kifelé ×1,12 (`Shift`: ×1,35) |
| `[` | A távoli levágási határ befelé ÷1,12 (`Shift`: ÷1,35) |
| `\` | A távoli levágás ki, illetve vissza oda, ahol volt ([Mélység és kihagyás](depth-and-culling.md#keyboard)) |

Az **Ábra-átfedés** módnak nincs számbillentyűje; válassza ki a módsávban, vagy nyissa meg a Meccs fület. A számbillentyűk ugyanazt az ellenőrzést használják, mint a módsáv: a betöltött adatokhoz nem elérhető módhoz tartozó billentyű nem tesz semmit.

## Meccs-visszajátszás {#match-replay}

Az Ábra-átfedés módban, amelyet a Meccs fül használ ([Meccs-visszajátszás](match-replay.md)). Működnek, akár követ egy egységet, akár nem, hacsak nincs másképp jelezve:

| Billentyű | Hatás |
|---|---|
| `B` | Könyvjelző hozzáadása: a pillanat és a kamera |
| `M` | 2D térkép: sarokban, teljes nézetben vagy ki |
| `V` / `Shift+V` | A követett egység következő / előző kameranézete |
| `H` | Kijelző a pilótafülkében és a padlock nézetben |
| `Page Down` / `Page Up` | Következő / előző esemény az események listájában megjelenő fajtákból |
| `J` | Visszafelé lejátszás; újra megnyomva szünet |
| `L` | Előre lejátszás; újra megnyomva szünet |
| `.` / `,` | Egy másodperc előre / vissza, szünetelve (`Shift`: tíz másodperc) |
| `Esc` | Először a célpont nézésének leállítása, majd a követés leállítása |
| `Ctrl`+kattintás vagy `Alt`+kattintás egy egységen (a nézetben vagy az egységlistában) | Nézés a követett egységből (a két egységes nézet); újabb kattintással megszűnik |
| `Shift`+kattintás két egységen | Mérés köztük: iránysszög, távolság, magasságkülönbség |

A `V`-hez kell követett egység. Itt az `M` a 2D térkép, a Taktika fülön pedig „mozgatás”.

## Egy egység követése {#following-a-unit}

Amíg a kamera egy egységet követ, a görgő és a repülő billentyűk az egység körül kormányozzák a kamerát, nem szabadon repülnek ([Kamera](camera.md#while-following-a-unit)):

| Bemenet | Hatás |
|---|---|
| Görgő, `W` / `S` | Közelebb / távolabb (magasabbra / alacsonyabbra a műholdas nézetben). Nem a pilótafülke- és padlock nézetekben. |
| `A` / `D`, `Q` / `E` | Keringés az egység körül (üldözés- és keringő nézet) |
| Húzás | Nézelődés az egység körül; a pilótafülkében a fülkén belül |
| `V` / `Shift+V` | A következő / előző kameranézet |
| `H` | Kijelző (pilótafülke- és padlock nézet) |
| `Esc` | A második egység nézésének leállítása, majd a követés leállítása |

## Taktikai tábla {#tactics-board}

A Taktika fülön ([Taktikai tábla](tactics-board.md)). Az `F`, `C`, `G` és `T` a fentiek szerint működik; a számbillentyűk nem tesznek semmit.

| Billentyű | Hatás |
|---|---|
| `Ctrl+Z` | Visszavonás |
| `Ctrl+Y` vagy `Ctrl+Shift+Z` | Újra |
| `Enter` | A rajzolt nyíl befejezése (dupla kattintás vagy jobb kattintás ugyanezt teszi) |
| `Esc` | Húzás megszakítása; különben a nyíl vagy a folyamatban lévő mozgatás eldobása; különben a kijelölés megszüntetése |
| `Delete` vagy `Backspace` | A kijelölés törlése |
| `W` / `E` / `R` | Mozgatás / Forgatás / Méretezés fogantyú a kijelölésre (billentyűkiosztás **W / E / R**) |
| `G` / `R` / `S` | Mozgatás / Forgatás / Méretezés fogantyú a kijelölésre (billentyűkiosztás **G / R / S**) |
| `R` | Ha nincs kijelölés: a következő elhelyezendő figurát 15°-kal elforgatja. A `Shift+R` visszaforgatja. |
| `M` | Kijelölt figura esetén: a következő kattintásra mozgatja |
| `K` | A terv lejátszása vagy szüneteltetése |
| Shift+kattintás | Hozzáadás a kijelöléshez vagy eltávolítás belőle |
| Shift+húzás | Doboz rajzolása a kijelölendő elemek köré |
| `Ctrl` fogantyú húzása közben | Illesztés a rácsra vagy a szögléptékre |

A fogantyú-billentyűk csak akkor működnek, ha van kijelölés; kijelölés nélkül a `W A S D` a szokásos módon repíti a kamerát.

## Kattintásos kiválasztás {#click-to-pick}

Ha a **Kattintásra mutatja, mi van ott** be van kapcsolva, a vonalzó pedig ki ([Kattintásos kiválasztás](camera.md#click-to-pick)):

| Bemenet | Hatás |
|---|---|
| Bal kattintás (legfeljebb 4 px-nyi húzással) | Megmutatja az adatpontot, különben a pályán a mutató alatti helyet |

## Mérés {#measure}

Ha a **Vonalzó aktív** be van kapcsolva ([Mérés](measure.md)):

| Bemenet | Hatás |
|---|---|
| Bal kattintás (legfeljebb 4 px-nyi húzással) | Pont elhelyezése |
| Jobb kattintás | Az utolsó pont eltávolítása |

## Máshol {#elsewhere}

| Hol | Bemenet | Hatás |
|---|---|---|
| Bármely csúszka fogantyúja (a szám melletti markolat) | Húzás fel / le | Az érték folyamatos változtatása, minél távolabb húzza, annál gyorsabban; a finom vezérléshez tartsa nyomva a `Shift`-et. Engedéskor áll meg. |
| A nézet fölötti sebességkijelző | Húzás fel / le | A repülési sebesség ugyanígy változtatható. |
| Pozícióazonosító dobozok | `Enter` | A beírt pozíció vagy irány alkalmazása. |
| Görbeszerkesztő | Dupla kattintás / Alt-kattintás / jobb kattintás | Pont hozzáadása / pont eltávolítása ([Sprite-alak](sprite-shape.md#the-curve-editor)). |

## Versenyelemzés fül {#race-analysis-tab}

A Versenyelemzés fülön a `K` lejátssza és szünetelteti a verseny-visszajátszást, a `Home` visszatekeri, a számbillentyűk pedig nem tesznek semmit. Lásd: [Versenyelemzés](race-analysis.md).

## A böngészőtől a megtartott billentyűk {#keys-the-viewer-keeps-from-the-browser}

Néhány böngészőbeli gyorsbillentyű bezárná vagy újratöltené az oldalt, és elveszítené a betöltött munkamenetet; a megjelenítő ezeket magának tartja meg. A lista a kódból generálódik: [Böngészőbillentyűk](ref-browser-keys.md).

## Játékvezérlő {#gamepad}

Lásd: [Játékvezérlő és HOTAS](gamepad.md).
