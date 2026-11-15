---
title: "Referenza tat-tastiera u tal-maws"
parent: "Kamera u kontrolli"
nav_order: 2
lang: "mt"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Referenza tat-tastiera u l-maws

Kull azzjoni tat-tastiera u tal-maws f'post wieħed, biex issib dik li tiħtieġ. L-ewwel ikklikkja l-veduta biex ikollha t-tastiera. It-tasti jiġu injorati meta kaxxa tat-test jew lista tkun fokus. Il-verżjoni qasira hi wkoll stampata fil-kantuniera t'isfel tal-lemin tal-veduta.

Sejba malajr:

| Irrid ... | Agħfas |
|---|---|
| nitjar | `W A S D`, iġbed biex tħares |
| tara kollox | `F` |
| ħaddem jew waqqaf | `K` |
| ħaddem lura | `J` (agħfas darba oħra biex twaqqaf), 'il quddiem `L` |
| tara x'jfisser il-kuluri | `?` jew `F1` |
| agħmel lura fit-tab Taktika | `Ctrl+Z` |

## Kamera {#camera}

Minn [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Input | Effett |
|---|---|
| `W` / `↑` | 'Il quddiem fid-direzzjoni tal-veduta |
| `S` / `↓` | Lura |
| `A` / `←` | Ċaqlaq lejn ix-xellug |
| `D` / `→` | Ċaqlaq lejn il-lemin |
| `Space` / `E` | 'Fuq |
| `Q` / `Ctrl` xellugi | 'Taħt |
| `Shift` (dak iċ-ċerta) | Żomm: 6× veloċità |
| `Alt` xellugi | Żomm: 15% veloċità |
| Ġbid xellugi jew lemini fuq il-veduta | Ħares (il-pointer jinżamm waqt li l-buttuna tkun miżmuma) |
| Roti (perspettiva) | Veloċità tat-tlugħ ×1.5 għal kull tikka (l-iktar 4 tikek għal kull avveniment tar-rota) |
| Roti (paralleli) | Zoom |
| Klikk tal-lemin | Ma tiftaħx menu kuntest fuq il-veduta |

## Globali {#global}

Minn [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tasta | Effett |
|---|---|
| `K` | Ħaddem / waqqaf il-[linja taż-żmien](timeline.md) |
| `F` | Iqabbad id-dejta fil-qafas |
| `C` | Ikopja l-pożizzjoni tal-kamera, il-yaw u l-pitch ([qari tal-kamera](camera.md#camera-readout)) |
| `G` | Mur għal punt miktub: jiftaħ il-kaxxa taħt il-qari tal-kamera |
| `Esc` | Agħlaq il-kartellina tal-għażla; imbagħad aqaf tħares lejn it-tieni unità; imbagħad aqaf issegwi unità |
| `T` | Il-look tal-wiri taktiku fuq jew mitfi ([Replay tal-partita](match-replay.md#display-style)) |
| `?` / `F1` | Modalità tal-għajnuna: x'jfissru l-kuluri ([Settings, units and keys](settings.md#help-mode)) |
| `1` | [Sħana](heat.md) |
| `2` | [Differenza](difference.md) |
| `3` | [Sħana tat-timijiet](team-heat.md) |
| `4` | [Linji](line-heat.md) |
| `]` | Il-limitu ta' barra tal-qtugħ 'l bogħod ×1.12 (`Shift`: ×1.35) |
| `[` | Il-limitu ta' ġewwa tal-qtugħ 'l bogħod ÷1.12 (`Shift`: ÷1.35) |
| `\` | Il-limitu tal-qtugħ 'l bogħod mitfi / lura fejn kien ([Fond u qtugħ](depth-and-culling.md#keyboard)) |

Il-modalità **Figuri fuq xulxin** m'għandhiex tasta nummru; agħżilha fil-barra tal-modi jew iftaħ it-tab Partita. It-tasti tan-numri jgħaddu mill-istess kontroll tal-barra tal-modi: tasta għal modalità li l-barra turi bħala mhux disponibbli għad-dejta mgħobbija ma jagħmel xejn.

## Replay tal-partita {#match-replay}

Fil-modalità Figuri fuq xulxin, li t-tab Partita tuża ([Replay tal-partita](match-replay.md)). Jaħdmu meta unità tkun issegwita jew le, ħlief fejn jingħad:

| Tasta | Effett |
|---|---|
| `B` | Żid markatur: il-mument u l-kamera |
| `M` | Mappa 2D: fil-kantuniera, veduta sħiħa, mitfija |
| `V` / `Shift+V` | Il-veduta li jmiss / ta' qabel tal-kamera tal-unità issegwita |
| `H` | Wiri head-up fil-kokpit u fil-veduti padlock |
| `Page Down` / `Page Up` | L-avveniment li jmiss / ta' qabel tat-tipi li l-lista tal-avvenimenti turi |
| `J` | Ħaddem lura; darba oħra, biex twaqqaf |
| `L` | Ħaddem 'il quddiem; darba oħra, biex twaqqaf |
| `.` / `,` | Sekonda 'il quddiem / lura, mwaqqfa (`Shift`: għaxar sekondi) |
| `Esc` | Aqaf tħares lejn il-mira l-ewwel, imbagħad aqaf issegwi |
| `Ctrl`+klikk jew `Alt`+klikk fuq unità (fil-veduta jew fil-lista tal-unitajiet) | Ħares lejha mill-unità issegwita (il-veduta ta' żewġ unitajiet); ikklikkjaha darba oħra biex titwarrab |
| `Shift`+klikk fuq żewġ unitajiet | Ikkejjel bejniethom: idwar, firxa, differenza fl-għoli |

`V` iħtieġ unità issegwita. `M` hawnhekk hi l-mappa 2D, u "ċaqlaq" fit-tab Taktika.

## Isegwi unità {#following-a-unit}

Waqt li l-kamera tkun qed issegwi unità, ir-rota u t-tasti tat-tlugħ idawru madwar l-unità minflok jitilgħu ħieles ([Kamera](camera.md#while-following-a-unit)):

| Input | Effett |
|---|---|
| Rota, `W` / `S` | Iktar qrib / iktar 'il bogħod (iktar 'il fuq / iktar 'l isfel fil-veduta tas-satellita). Mhux fil-veduti tal-kokpit u padlock. |
| `A` / `D`, `Q` / `E` | Idur madwar l-unità (veduti tal-wara u orbita) |
| Ġbid | Ħares madwar l-unità; fil-kokpit, ħares ġewwa |
| `V` / `Shift+V` | Il-veduta tal-kamera li jmiss / ta' qabel |
| `H` | Wiri head-up (veduti tal-kokpit u padlock) |
| `Esc` | Aqaf tħares lejn it-tieni unità, imbagħad aqaf issegwi |

## Bord taktiku {#tactics-board}

Fit-tab Taktika ([Bord taktiku](tactics-board.md)). `F`, `C`, `G` u `T` jaħdmu bħal fuq; it-tasti tan-numri ma jagħmlu xejn.

| Tasta | Effett |
|---|---|
| `Ctrl+Z` | Agħmel lura |
| `Ctrl+Y` jew `Ctrl+Shift+Z` | Erġa' agħmel |
| `Enter` | Ittemm il-vleġġa li qed tinġibed (klikk doppju jew klikk tal-lemin jagħmel l-istess) |
| `Esc` | Ikkanċella ġbid; altrimenti ħalli l-vleġġa jew il-moviment li qed isir; altrimenti neħħi l-għażla |
| `Delete` jew `Backspace` | Ħassar l-għażla |
| `W` / `E` / `R` | Gizmo tal-Moviment / Dawran / Skala għall-għażla (skema tat-tasti **W / E / R**) |
| `G` / `R` / `S` | Gizmo tal-Moviment / Dawran / Skala għall-għażla (skema tat-tasti **G / R / S**) |
| `R` | Bl-ebda għażla: idawwar il-figura li jmiss biex tqiegħed b'15°. `Shift+R` iduwwarha lura. |
| `M` | Bi figura magħżula: iġġibha għall-klikk li jmiss |
| `K` | Ħaddem jew waqqaf il-pjan |
| Shift+klikk | Żid jew neħħi mill-għażla |
| Shift+ġbid | Ibda kaxxa biex tagħżel dak li jmiss |
| `Ctrl` waqt li tiġbed maniglja | Ikkapċja mal-grilja jew mal-pass tal-angolu |

It-tasti tal-gizmo jaħdmu biss meta xi ħaġa tkun magħżula; bl-ebda għażla, `W A S D` jitilgħu l-kamera kif normali.

## Klikk biex tagħżel {#click-to-pick}

Bil-**Juri x'hemm** mixgħul u l-ħakma mitfija ([Klikk biex tagħżel](camera.md#click-to-pick)):

| Input | Effett |
|---|---|
| Klikk xellugi (mingħajr ma tiġbed aktar minn 4 px) | Juri l-punt tad-dejta, jew inkella l-post fuq il-livell, taħt il-pointer |

## Kejl {#measure}

Bil-**Ħakma attiva** ([Kejl](measure.md)):

| Input | Effett |
|---|---|
| Klikk xellugi (mingħajr ma tiġbed aktar minn 4 px) | Itfa' punt |
| Klikk tal-lemin | Neħħi l-aħħar punt |

## Hemm oħra {#elsewhere}

| Fejn | Input | Effett |
|---|---|---|
| Il-maniglja ta' kull slider (il-handle ħdejn in-numru) | Ġbid 'il fuq / 'l isfel | Ibdel il-valur b'mod kontinwu, bil-veloċità tikber iktar ma tiġbed 'l bogħod; żomm `Shift` għal kontroll fin. Aqta' biex tieqaf. |
| Il-wiri tal-veloċità fuq il-veduta | Ġbid 'il fuq / 'l isfel | Ibdel il-veloċità tat-tlugħ bl-istess mod. |
| Kaxxi tal-pożizzjoni | `Enter` | Japplika l-pożizzjoni jew l-orjentazzjoni miktuba. |
| Editur tal-kurva | Klikk doppju / Alt-klikk / klikk tal-lemin | Iżid punt / inehhi punt ([Forma tal-sprite](sprite-shape.md#the-curve-editor)). |

## Tab tal-analiżi tal-ġirja {#race-analysis-tab}

Fit-tab Analiżi tal-ġirja `K` iħaddem u jwaqqaf ir-replay tal-ġirja, `Home` iġġibu lura, u t-tasti tan-numri ma jagħmlu xejn. Ara [Analiżi tal-ġirja](race-analysis.md).

## It-tasti li l-viewer iżomm mill-browser {#keys-the-viewer-keeps-from-the-browser}

Xi shortcuts tal-browser jagħlqu jew jerġgħu jitgħabbew il-paġna u jitilfu sessjoni mgħobbija; il-viewer iżommhom għalih innifsu. Il-lista tinħoloq mill-kodiċi: [Tasti tal-browser](ref-browser-keys.md).

## Gamepad {#gamepad}

Ara [Gamepad u HOTAS](gamepad.md).
