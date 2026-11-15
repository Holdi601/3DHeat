---
title: "Figuri"
nav_order: 11
has_children: true
lang: "mt"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figuri

**Figura** hi mudell 3D żgħir ta' dak li verament hu unità: tank, jet, vapur, suldat. Il-[replay](match-replay.md) jpinġi kull unità bħala l-figura tagħha f'daqs veru, minflok kaxxa sempliċi.

Hemm madwar 2,000 vettura, inġenju, vapur, arma u suldat b'isem, kollha mibnija mill-viewer innifsu.

![Tanks tad-demo mpinġija bħala l-figuri tagħhom stess](../assets/img/en/replay-tanks.webp)

## X'hemm fil-katalgu {#what-is-in-the-catalogue}

| Qasam | Eżempji |
|---|---|
| Nies | suldat wieqaf, imdaħħal, mistrieħ fl-art; sniper, anti-tank, medic, ekwipaġġ |
| Art | tanks, vetturi tal-infanterija mgħammra, difiża tal-ajru, artillerija, trakkijiet u karozzi, ferroviji u tramm |
| Ajru | ġellieda, inġenji tal-attakk, bombers, trasport, helicopters, minn bijplani sal-jets moderni |
| Baħar | bastimenti tal-gwerra skont il-klassi, carriers, sottomarini, dgħajjes, merkanti |
| Armi | missili, rockets, bombi, torpedoes, flares u chaff |
| Markaturi | smoke, flash u fire grenades, bombi mitfugħa, bnadar, spawns, waypoints |

## Kif isiru l-figuri {#how-the-figures-are-made}

- **Mibnija minn dimensjonijiet ippubblikati.** Ħafna mill-figuri jinbnew mill-bini tal-figuri tal-viewer stess minn numri pubbliċi: tul, wisa', għoli, roti tat-triq, turretta u kanna, ġwienaħ u denb. Il-forma tagħhom imbagħad tiġi aġġustata kontra ritratti pubbliċi, disinji u dimensjonijiet ippubblikati. Ma jintużaw l-ebda mudelli tal-logħob.
- **Mudelli ħielsa.** Xi figuri jużaw mudelli 3D ħielsa (CC0 jew CC BY) meta dawn ikunu iktar veri, xi kultant flimkien mal-ġisem mibni. L-awturi ta' xogħlijiet CC BY jingħataw kreditu fuq [Krediti tal-figuri](figure-credits.md); xogħlijiet CC0 ma jeħtieġux kreditu u ma jinsabux hemm.
- Kull figura għandha verżjoni sħiħa, waħda kwadra u waħda 'l bogħod (livelli tad-dettall, LOD), sabiex jinżlu eluf f'daqqa.

## Liema figura tieħu unità {#which-figure-a-unit-gets}

Il-viewer iħares lejn il-kolonni tad-data nnifisha:

1. **Ismijiet** - kolonni msejħa *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* jew *Figure* - jitqabblu mal-katalgu: eżattament, permezz ta' madwar 4,000 alias (ID tal-unitajiet ta' diversi logħob), bil-bidu magħruf l-itwal (`F-16C_50` huwa l-F-16C), jew bl-isem l-iqsar tal-figura li jibda biha.
2. Isem li l-figura tiegħu ma taqbilx mat-**tip** tal-unità ma jintużax (trakk jismu *Typhoon* mhux il-ġellied).
3. **Tipi** - kolonni msejħa *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* jew *Domain* - jagħtu figura tal-klassi: tags ta' Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikoni tal-mappa, jew kliem sempliċi (tank, helicopter, infantry).
4. Data b'xejn minn dan hija data ta' nies: kulħadd huwa suldat.

Għalhekk l-aktar mod faċli biex tikseb il-figuri t-tajbin hu kolonna `vehicle` bl-ismijiet veri, jew kolonna `type` b'tags ta' Tacview.

**L-unità tiegħi tidher bħala kaxxa jew suldat.** Żid kolonna `vehicle` bl-isem veru, jew kolonna `type` b'tag ta' Tacview. Poġġi l-mouse fuq l-unità biex tara liema isem ġie mqabbel. Data li għandha dawn il-kolonni imma ma tgħid xejn dwar unità tħallieha bħala kaxxa; data mingħajr xejn minnhom tinżel bħala suldati.

## Settings {#settings}

It-taqsima **Figuri** tas-sidebar tar-replay tistabbilixxi d-daqs, l-iżgħar daqs fuq l-iskrin, x'isiru l-unitajiet 'il bogħod (figura, vleġġa, simbolu), u l-effetti miżjuda fuqhom. Ara [Replay tal-partita](match-replay.md#figures). Duħħan, nar u effetti oħra bil-ħin: [Effetti fuq il-figuri](figure-replay.md).

## Pakkett lokali fakultattiv ta' figuri {#an-optional-local-figure-pack}

Tista' żżomm pakkett fakultattiv ta' figuri tiegħek fuq il-magna tiegħek. Il-figuri tiegħu jieħdu post il-figuri tal-katalgu bl-istess ismijiet. Qatt ma jkun parti mir-repożitorju jew minn bini ppubblikat; mingħajru ma jinbidel xejn.
