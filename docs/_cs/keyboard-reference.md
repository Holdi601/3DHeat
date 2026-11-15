---
title: "Přehled klávesnice a myši"
parent: "Kamera a ovládání"
nav_order: 2
lang: "cs"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Přehled klávesnice a myši

Každá klávesa a každá akce myši na jednom místě, abyste našli tu, kterou potřebujete. Nejdřív klikněte do pohledu, aby měl klávesnici. Klávesy se ignorují, když má fokus textové pole nebo rozbalovací seznam. Krátká verze je také vypsaná vlevo dole v pohledu.

Rychlý rozcestník:

| Chci ... | Stiskněte |
|---|---|
| létat | `W A S D`, táhněte pro rozhlédnutí |
| vidět všechno | `F` |
| přehrát nebo pozastavit | `K` |
| přehrát pozpátku | `J` (znovu stiskněte pro pauzu), dopředu `L` |
| vidět, co znamenají barvy | `?` nebo `F1` |
| vrátit krok v záložce Taktika | `Ctrl+Z` |

## Kamera {#camera}

Z [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Vstup | Účinek |
|---|---|
| `W` / `↑` | Dopředu ve směru pohledu |
| `S` / `↓` | Dozadu |
| `A` / `←` | Odsun vlevo |
| `D` / `→` | Odsun vpravo |
| `Mezerník` / `E` | Nahoru |
| `Q` / levý `Ctrl` | Dolů |
| `Shift` (kterýkoli) | Podržet: šestinásobná rychlost |
| levý `Alt` | Podržet: 15% rychlost |
| Levé nebo pravé tažení v pohledu | Rozhlédnutí (ukazatel je zamčený, dokud držíte tlačítko) |
| Kolečko (perspektiva) | Rychlost letu ×1,5 na jedno cvaknutí (nejvýš 4 cvaknutí na jednu událost kolečka) |
| Kolečko (rovnoběžné) | Přiblížení |
| Pravé tlačítko | Nad pohledem se neotevře kontextová nabídka |

## Globální {#global}

Z [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Klávesa | Účinek |
|---|---|
| `K` | Přehrát / pozastavit [časovou osu](timeline.md) |
| `F` | Zarámovat data |
| `C` | Zkopírovat polohu kamery, natočení a sklon ([údaj kamery](camera.md#camera-readout)) |
| `G` | Přejít na napsaný bod: otevře pole pod údajem kamery |
| `Esc` | Zavřít kartu výběru; potom přestat dívat se na druhou jednotku; potom přestat sledovat jednotku |
| `T` | Vypnout nebo zapnout vzhled taktického displeje ([Přehrání zápasu](match-replay.md#display-style)) |
| `?` / `F1` | Režim nápovědy: co znamenají barvy ([Nastavení, jednotky a klávesy](settings.md#help-mode)) |
| `1` | [Teplo](heat.md) |
| `2` | [Rozdíl](difference.md) |
| `3` | [Týmové teplo](team-heat.md) |
| `4` | [Čáry](line-heat.md) |
| `]` | Hranice vzdáleného vyřazování ven ×1,12 (`Shift`: ×1,35) |
| `[` | Hranice vzdáleného vyřazování dovnitř ÷1,12 (`Shift`: ÷1,35) |
| `\` | Hranice vzdáleného vyřazování vypnout / znovu zapnout tam, kde byla ([Hloubka a vyřazování](depth-and-culling.md#keyboard)) |

Režim **Překryv figur** nemá číselnou klávesu; vyberte ho v pruhu režimů nebo otevřete záložku Zápas. Číselné klávesy procházejí stejnou kontrolou jako pruh režimů: klávesa pro režim, který pruh u načtených dat ukazuje jako nedostupný, nic neudělá.

## Přehrání zápasu {#match-replay}

V režimu Překryv figur, který používá záložka Zápas ([Přehrání zápasu](match-replay.md)). Fungují, ať je jednotka sledovaná, nebo ne, kromě míst, kde je to uvedeno:

| Klávesa | Účinek |
|---|---|
| `B` | Přidat záložku: okamžik a kameru |
| `M` | 2D mapa: v rohu, celý pohled, vypnuto |
| `V` / `Shift+V` | Další / předchozí pohled kamery na sledovanou jednotku |
| `H` | Zobrazení na čelním skle v pohledu z kokpitu a při zámku |
| `Page Down` / `Page Up` | Další / předchozí událost druhů, které ukazuje seznam událostí |
| `J` | Přehrát pozpátku; znovu pro pauzu |
| `L` | Přehrát dopředu; znovu pro pauzu |
| `.` / `,` | Sekunda dopředu / dozadu, pozastaveno (`Shift`: deset sekund) |
| `Esc` | Nejdřív přestat dívat se na cíl, potom přestat sledovat |
| `Ctrl`+klik nebo `Alt`+klik na jednotku (v pohledu nebo v seznamu jednotek) | Podívat se na ni ze sledované jednotky (pohled na dvě jednotky); klikněte znovu, aby se zrušil |
| `Shift`+klik na dvě jednotky | Změřit mezi nimi: směr, vzdálenost, rozdíl výšky |

`V` potřebuje sledovanou jednotku. Zde je `M` 2D mapa, v záložce Taktika znamená „přesunout“.

## Sledování jednotky {#following-a-unit}

Když kamera sleduje jednotku, kolečko a klávesy pro létání kolem ní krouží místo volného letu ([Kamera](camera.md#while-following-a-unit)):

| Vstup | Účinek |
|---|---|
| Kolečko, `W` / `S` | Blíž / dál (výš / níž v satelitním pohledu). Ne v pohledu z kokpitu a při zámku. |
| `A` / `D`, `Q` / `E` | Obíhat jednotku (pohledy zezadu a z orbity) |
| Tažení | Rozhlížet se kolem jednotky; v kokpitu se rozhlížet uvnitř |
| `V` / `Shift+V` | Další / předchozí pohled kamery |
| `H` | Zobrazení na čelním skle (pohled z kokpitu a při zámku) |
| `Esc` | Přestat dívat se na druhou jednotku, potom přestat sledovat |

## Taktická tabule {#tactics-board}

V záložce Taktika ([Taktická tabule](tactics-board.md)). `F`, `C`, `G` a `T` fungují stejně jako výše; číselné klávesy nedělají nic.

| Klávesa | Účinek |
|---|---|
| `Ctrl+Z` | Zpět |
| `Ctrl+Y` nebo `Ctrl+Shift+Z` | Znovu |
| `Enter` | Ukončit šipku, která se kreslí (dvojklik nebo pravé tlačítko dělá totéž) |
| `Esc` | Zrušit tažení; jinak zrušit šipku nebo přesun, který probíhá; jinak zrušit výběr |
| `Delete` nebo `Backspace` | Smazat výběr |
| `W` / `E` / `R` | Gizmo přesunu / otočení / měřítka pro výběr (schéma kláves **W / E / R**) |
| `G` / `R` / `S` | Gizmo přesunu / otočení / měřítka pro výběr (schéma kláves **G / R / S**) |
| `R` | Když nic není vybráno: otočit další figuru, kterou kladete, o 15°. `Shift+R` ji otočí zpět. |
| `M` | Když je figura vybrána: přesunout ji na další kliknutí |
| `K` | Přehrát nebo pozastavit plán |
| Shift+klik | Přidat do výběru nebo z něj odebrat |
| Shift+tažení | Nakreslit rámeček kolem toho, co se má vybrat |
| `Ctrl` při tažení úchytu | Přichytit na mřížku nebo na krok úhlu |

Klávesy gizma fungují jen tehdy, když je něco vybráno; když nic vybráno není, `W A S D` létá s kamerou jako obvykle.

## Výběr kliknutím {#click-to-pick}

Když je zapnuto **Kliknutí ukáže, co tam je** a pravítko je vypnuté ([Výběr kliknutím](camera.md#click-to-pick)):

| Vstup | Účinek |
|---|---|
| Levé kliknutí (bez tažení víc než 4 px) | Ukáže datový bod, nebo jinak místo na levelu pod ukazatelem |

## Měření {#measure}

Když je zapnuté **Pravítko aktivní** ([Měření](measure.md)):

| Vstup | Účinek |
|---|---|
| Levé kliknutí (bez tažení víc než 4 px) | Položit bod |
| Pravé tlačítko | Odebrat poslední bod |

## Jinde {#elsewhere}

| Kde | Vstup | Účinek |
|---|---|---|
| Úchyt každého posuvníku (rukojeť vedle čísla) | Tažení nahoru / dolů | Měnit hodnotu plynule, tím rychleji, čím dál táhnete; držte `Shift` pro jemné ladění. Pusťte pro zastavení. |
| Ukazatel rychlosti nad pohledem | Tažení nahoru / dolů | Měnit rychlost letu stejným způsobem. |
| Pole pozice | `Enter` | Použít napsanou polohu nebo natočení. |
| Editor křivky | Dvojklik / Alt-klik / pravé tlačítko | Přidat bod / odebrat bod ([Tvar sprite](sprite-shape.md#the-curve-editor)). |

## Záložka Analýza závodu {#race-analysis-tab}

V záložce Analýza závodu `K` přehrává a pozastavuje záznam závodu, `Home` ho přetočí na začátek a číselné klávesy nedělají nic. Viz [Analýza závodu](race-analysis.md).

## Klávesy, které si prohlížeč nechává {#keys-the-viewer-keeps-from-the-browser}

Některé zkratky prohlížeče by zavřely nebo znovu načetly stránku a ztratily by načtenou relaci; prohlížeč si je nechává pro sebe. Seznam se generuje z kódu: [Klávesy prohlížeče](ref-browser-keys.md).

## Gamepad {#gamepad}

Viz [Gamepad a HOTAS](gamepad.md).
