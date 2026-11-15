---
title: "Librerija tal-livelli"
parent: "Livelli u ġeometrija tal-isfond"
nav_order: 4
lang: "mt"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Librerija tal-livelli

Il-librerija iżżomm il-livelli tiegħek f'dan il-browser, sabiex ma jkollokx terġa' tgħabbihom u tissimplifikahom. **It-tħassir tad-dejta tas-sit fil-browser iħassar il-librerija, u m'hemm l-ebda esportazzjoni.** Żomm il-fajls oriġinali tiegħek.

Il-proċessar ta' livell - parse, classify, weld, decimate, pack textures - huwa bil-mod, u r-riżultat dejjem l-istess. Il-**Librerija** fl-isfel tal-pannell Sfond / livell iżomm il-livelli pproċessati f'dan il-browser, għalhekk mesh ġġeneralizzat qatt ma jerġa' jinbena darbtejn ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Ħażen u terġa' tgħabbi livell {#save-and-reload-a-level}

1. Agħbi immaġni tal-mappa jew mudell 3D u ċċekkja li jidher tajjeb.
2. Agħfas **Issejvja fil-librerija**. Il-pannell jgħid *Saved. It will load instantly next time.*
3. Id-darba li jmiss, iftaħ il-lista **Librerija** u agħfas ▸ fuq il-livell.
4. Agħfas ✕ biex titlef dħul li m'għadekx tħtieġ.

## Kif tużaha {#using-it}

| Kontroll | Effett |
|---|---|
| **Issejvja fil-librerija** | Jaħżen il-livell attwali. Immaġni tal-mappa tinħażen bħala PNG bl-ankri tagħha tnejn; mudell bħala l-buffers ippproċessati tiegħu. Il-pannell jgħid *Saved. It will load instantly next time.* |
| Lista tal-librerija | Ringiela waħda għal kull livell maħżun: l-isem (bid-daqs maħżun fuq hover), it-trijangoli għal mudell jew il-wisa' f'pixels għal immaġni. |
| ▸ (*Load*) | Jgħabbi d-dħul bħala l-livell attwali. |
| ✕ (*Delete*) | Ineħħi d-dħul. |
| Linja tal-użu | `Using X of Y.` - l-istima tal-ħażna tal-browser għal dan is-sit. |

Meta ma jkun hemm xejn maħżun, il-lista tgħid *Empty. Load a map or model, then "Save to library".*

## Dak li jinħażen {#what-is-stored}

| Tip | Maħżun | Mhux maħżun |
|---|---|---|
| Immaġni tal-mappa | L-immaġni (PNG), id-daqs tagħha, l-ankri tagħha | Għoli, flip, opacity, brightness, desaturate - jerġgħu jmorru għad-defaults (għoli = l-Y l-aktar baxx tad-dataset attwali, flip on) |
| Livell 3D | Vertices, kuluri tal-vertices, koordinati tat-texture, il-blat tagħhom u l-atlas tat-texture, trijangoli tal-art / tal-istrutturi / tal-ilma, xifer tal-istrutturi, għadd tat-trijangoli | Ismijiet tal-partijiet u r-raġunijiet tal-klassifikazzjoni, u kull setting tal-aspett - jerġgħu jmorru għad-defaults ta' importazzjoni ġdida |

Mudell mgħobbi mill-librerija m'għandux lista ta' partijiet, u l-limiti tiegħu u l-banda tal-għoli tal-art jiġu rikalkolati mill-vertices tiegħu.

## Fejn tgħix {#where-it-lives}

Fl-IndexedDB tal-browser, id-database `3dheat`, object store `levels`, għall-origin tal-paġna (l-indirizz fil-barra tal-indirizzi tal-browser). Hija lokali għal dak il-profil tal-browser: browser ieħor, profil ieħor jew indirizz ieħor (pereżempju `localhost` minflok `127.0.0.1`) jara librerija differenti u vojta. It-tħassir tad-dejta tas-sit fil-browser iħassarha. Dħul maħżun minn verżjonijiet preċedenti mingħajr strutturi, kuluri jew ilma jibqa' jitgħabba.
