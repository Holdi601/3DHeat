---
title: "Pregled tipkovnice in miške"
parent: "Kamera in upravljanje"
nav_order: 2
lang: "sl"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Pregled tipkovnice in miške

Vsa dejanja tipkovnice in miške na enem mestu, da najdete tisto, ki jo potrebujete. Najprej kliknite pogled, da dobi tipkovnico. Tipke se prezrejo, medtem ko ima polje za besedilo ali spustni seznam fokus. Kratka različica je natisnjena tudi spodaj levo v pogledu.

Hitri iskalnik:

| Želim ... | Pritisnite |
|---|---|
| leteti | `W A S D`, povlecite za ogled |
| videti vse | `F` |
| predvajati ali ustaviti | `K` |
| predvajati nazaj | `J` (ponovno pritisnite za premor), naprej `L` |
| videti, kaj pomenijo barve | `?` ali `F1` |
| razveljaviti na zavihku Taktika | `Ctrl+Z` |

## Kamera {#camera}

Iz [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Vnos | Učinek |
|---|---|
| `W` / `↑` | Naprej v smeri pogleda |
| `S` / `↓` | Nazaj |
| `A` / `←` | Premik v levo |
| `D` / `→` | Premik v desno |
| `Space` / `E` | Gor |
| `Q` / levi `Ctrl` | Dol |
| `Shift` (katerikoli) | Držite: 6-kratna hitrost |
| levi `Alt` | Držite: 15 % hitrosti |
| Povlek z levo ali desno tipko na pogledu | Ogled (kazalec je zaklenjen, dokler je gumb pritisnjen) |
| Kolešček (perspektiva) | Hitrost letenja ×1,5 na zarezo (največ 4 zareze na dogodek kolesčka) |
| Kolešček (vzporedno) | Približevanje |
| Desni klik | Nad pogledom se ne odpre kontekstni meni |

## Splošno {#global}

Iz [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tipka | Učinek |
|---|---|
| `K` | Predvaja ali ustavi [časovnico](timeline.md) |
| `F` | Prikaže vse podatke v kadru |
| `C` | Kopira položaj kamere, zasuk in nagib ([odčitek kamere](camera.md#camera-readout)) |
| `G` | Pojdi na vneseno točko: odpre polje pod odčitkom kamere |
| `Esc` | Zapre kartico izbire; nato preneha gledati drugo enoto; nato preneha slediti enoti |
| `T` | Vklopi ali izklopi videz taktičnega prikaza ([Predvajanje tekme](match-replay.md#display-style)) |
| `?` / `F1` | Način pomoči: kaj pomenijo barve ([Nastavitve, enote in tipke](settings.md#help-mode)) |
| `1` | [Toplota](heat.md) |
| `2` | [Razlika](difference.md) |
| `3` | [Toplota ekip](team-heat.md) |
| `4` | [Črte](line-heat.md) |
| `]` | Zunanja meja izločanja po razdalji navzven ×1,12 (`Shift`: ×1,35) |
| `[` | Zunanja meja izločanja po razdalji navznoter ÷1,12 (`Shift`: ÷1,35) |
| `\` | Zunanja meja izločanja po razdalji izključena / ponovno vklopljena tam, kjer je bila ([Globina in izrezovanje](depth-and-culling.md#keyboard)) |

Način **Prekrivanje figur** nima številske tipke; izberete ga v vrstici načinov ali odprete zavihek Tekma. Številske tipke delujejo prek iste preverbe kot vrstica načinov: tipka za način, ki ga vrstica za naložene podatke prikazuje kot nedosegljivega, ne naredi nič.

## Predvajanje tekme {#match-replay}

V načinu Prekrivanje figur, ki ga uporablja zavihek Tekma ([Predvajanje tekme](match-replay.md)). Delujejo, ali je enota izbrana ali ne, razen kjer je navedeno drugače:

| Tipka | Učinek |
|---|---|
| `B` | Doda zaznamek: trenutek in kamero |
| `M` | 2D-karta: v kotu, čez cel zaslon, izklopljeno |
| `V` / `Shift+V` | Naslednji / prejšnji pogled kamere za sledeno enoto |
| `H` | Prikaz na čelnem steklu v kokpitu in pogledu padlock |
| `Page Down` / `Page Up` | Naslednji / prejšnji dogodek vrst, ki jih prikazuje seznam dogodkov |
| `J` | Predvajanje nazaj; ponovno za premor |
| `L` | Predvajanje naprej; ponovno za premor |
| `.` / `,` | Sekunda naprej / nazaj, na premoru (`Shift`: deset sekund) |
| `Esc` | Najprej preneha gledati cilj, nato preneha slediti |
| `Ctrl`+klik ali `Alt`+klik na enoto (v pogledu ali na seznamu enot) | Ogled z sledene enote (pogled na dve enoti); ponovni klik ga odstrani |
| `Shift`+klik na dve enoti | Mera med njima: smer, razdalja, višinska razlika |

`V` potrebuje sledeno enoto. Tu je `M` 2D-karta, na zavihku Taktika pa »premik«.

## Sledenje enoti {#following-a-unit}

Medtem ko kamera sledi enoti, kolesček in tipke za letenje krožijo okoli enote, namesto da bi leteli prosto ([Kamera](camera.md#while-following-a-unit)):

| Vnos | Učinek |
|---|---|
| Kolesček, `W` / `S` | Bliže / dlje (višje / nižje v satelitskem pogledu). Ne v pogledih kokpit in padlock. |
| `A` / `D`, `Q` / `E` | Kroženje okoli enote (pogled zadaj in orbita) |
| Povlek | Ogled okoli enote; v kokpitu ogled znotraj |
| `V` / `Shift+V` | Naslednji / prejšnji pogled kamere |
| `H` | Prikaz na čelnem steklu (pogled kokpit in padlock) |
| `Esc` | Preneha gledati drugo enoto, nato preneha slediti |

## Taktična tabla {#tactics-board}

Na zavihku Taktika ([Taktična tabla](tactics-board.md)). `F`, `C`, `G` in `T` delujejo kot zgoraj; številske tipke ne naredijo nič.

| Tipka | Učinek |
|---|---|
| `Ctrl+Z` | Razveljavi |
| `Ctrl+Y` ali `Ctrl+Shift+Z` | Ponovi |
| `Enter` | Konča puščico, ki se riše (dvojni klik ali desni klik naredi isto) |
| `Esc` | Prekliče povlek; sicer spusti puščico ali premik v teku; sicer odznači |
| `Delete` ali `Backspace` | Izbriše izbor |
| `W` / `E` / `R` | Premik / vrtenje / merilo: orodje za izbor (shema tipk **W / E / R**) |
| `G` / `R` / `S` | Premik / vrtenje / merilo: orodje za izbor (shema tipk **G / R / S**) |
| `R` | Brez izbora: naslednjo figuro, ki jo postavljate, zavrti za 15°. `Shift+R` jo zavrti nazaj. |
| `M` | Z izbrano figuro: premakne jo na naslednji klik |
| `K` | Predvaja ali ustavi načrt |
| Shift+klik | Doda v izbor ali odstrani iz njega |
| Shift+povlek | Nariše okvir okoli tega, kar izberete |
| `Ctrl` med vlečenjem ročaja | Pripne na mrežo ali na korak kota |

Tipke orodja delujejo samo, kadar je kaj izbrano; brez izbora `W A S D` leti s kamero kot običajno.

## Klik za izbiro {#click-to-pick}

Z vklopljeno možnostjo **Klik pokaže, kaj je tam** in izklopljenim ravnilom ([Klik za izbiro](camera.md#click-to-pick)):

| Vnos | Učinek |
|---|---|
| Levi klik (brez povleka več kot 4 slikovne pike) | Pokaže podatkovno točko ali mesto na ravni pod kazalcem |

## Mera {#measure}

Z vklopljenim **Ravnilo aktivno** ([Mera](measure.md)):

| Vnos | Učinek |
|---|---|
| Levi klik (brez povleka več kot 4 slikovne pike) | Postavi točko |
| Desni klik | Odstrani zadnjo točko |

## Drugje {#elsewhere}

| Kje | Vnos | Učinek |
|---|---|---|
| Ročaj katerega koli drsnika (ročica ob številki) | Povlecite gor / dol | Vrednost se spreminja zvezno, hitreje, čim dlje povlečete; držite `Shift` za natančno nastavitev. Spustite za ustavitev. |
| Prikaz hitrosti nad pogledom | Povlecite gor / dol | Enako spremeni hitrost letenja. |
| Polja položaja | `Enter` | Uveljavi vneseni položaj ali usmerjenost. |
| Urejevalnik krivulj | Dvojni klik / Alt-klik / desni klik | Doda točko / odstrani točko ([Oblika sprajta](sprite-shape.md#the-curve-editor)). |

## Zavihek Analiza dirke {#race-analysis-tab}

Na zavihku Analiza dirke `K` predvaja in ustavi predvajanje dirke, `Home` ga previje nazaj, številske tipke pa ne naredijo nič. Glejte [Analiza dirke](race-analysis.md).

## Tipke, ki jih pregledovalnik obdrži zase {#keys-the-viewer-keeps-from-the-browser}

Nekatere bližnjice brskalnika bi zaprle ali ponovno naložile stran in izgubile naloženo sejo; pregledovalnik jih obdrži zase. Seznam je ustvarjen iz kode: [Tipke brskalnika](ref-browser-keys.md).

## Igralni krmilnik {#gamepad}

Glejte [Igralni krmilnik in HOTAS](gamepad.md).
