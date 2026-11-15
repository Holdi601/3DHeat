---
title: "Analiżi tal-partita (CS2)"
nav_order: 10
lang: "mt"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: true
---

# Analiżi tal-partita (Counter-Strike 2)

It-tab **Partita** iwerwer reġistrazzjoni bħala figuri, u għal partita ta' Counter-Strike 2 juri wkoll l-iskorboard: min rebaħ kull round, kif, u min kiseb il-qtil. Uża din biex tirrevedi partita round b'round, u mbagħad tmur għall-istess mument fil-heatmap.

It-tab Partita iwerwer kull reġistrazzjoni bħala figuri: reġistrazzjoni ta' War Thunder jew Tacview, jew demo ta' CS2, elenkati taħt **Partiti fir-replay** ([Replay tal-partita](match-replay.md)). Fajl `.match.json` ta' CS2 iżid l-iskorboard deskritt f'din il-paġna.

## Irrevedi partita ta' CS2 {#review-a-cs2-match}

1. Ikkonverti d-demo ([hawn taħt](#where-the-data-comes-from)) f'fajl `.parquet` u `.match.json`.
2. Fit-tab **Heatmap**, għabbi l-fajl `.parquet` taħt **Sors**.
3. Iftaħ it-tab **Partita** u ikklikkja **Għabbi fajls ta' partiti…**, jew aqsam il-fajl `.match.json` fuq il-veduta.
4. Ikklikkja partita f'**Sommarji tal-partiti**, imbagħad ċellola tal-istrixxa tar-rawnds biex tiftaħ dak ir-round.
5. Ikklikkja **Uri r-round** biex tara dak ir-round fil-heatmap, jew **Replay tar-round** biex tarah bħala figuri.

![It-tab Partita: strixxa tar-rawnds b'round miftuħ, feed tal-qtil u Skorbord](../assets/img/en/match-analysis-round.webp)

Kliem bħal KAST, ADR, eco, force buy u trade huma fil-[glossarju](glossary.md#counter-strike-words).

## Minn fejn ġejja d-dejta {#where-the-data-comes-from}

Il-konvertitur tad-demo ta' [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) idawwar demos f'żewġ fajls għal kull partita, f'folder għal kull mappa:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Fajl | Jinfetaħ fi | Iżomm |
|---|---|---|
| `<match>.parquet` | it-tab **Heatmap** (il-pannell tas-Sors, bħal kull Parquet - fajl wieħed, diversi, jew il-folder kollu) | il-pożizzjoni ta' kull plejer tmien darbiet kull sekonda, u kull avveniment fejn seħħ: qtil, mewt, ferut, tir, ramj, smoke, flash, HE, molotov, decoy, blind, plant, defuse, explode; b'`match`, `round`, `roundId`, `event`, `player`, `side`, `team`, id-direzzjoni tal-ħarsa, `weapon`, `place`, `opening`, `traded`... |
| `<match>.match.json` | it-tab **Partita** | t-timijiet, l-iskor, kull round (min rebaħ, kif, l-ekonomija, il-plant, kull qtil fl-ordni, clutches, is-sopravvissuti), kull linja tal-iskorboard ta' kull plejer |

Il-footer tal-fajl Parquet iżomm l-istruzzjonijiet tal-qari (ċavetta `heat3d`), allura jinfetaħ mingħajr ebda setting: il-plejer bħala l-persuna, in-naħa bħala l-grupp, kull round (`roundId`, "<match> #NN") bħala sessjoni, id-direzzjoni tal-ħarsa mixgħula, u d-dinja tkun fid-direzzjoni t-tajba (id-dinja ta' CS2 hija right-handed bil-Z 'il fuq; jekk tinqara bil-mappa default Z-up tkun maqlubha). Ara [Column mapping](column-mapping.md) u [Loading files](loading-files.md). `python -m heat3d_cs2 map <map>` jesporta l-ġeometrija tal-mappa fl-istess qafas, mgħobbija fi **Livell**.

Il-konvenzjonijiet wara n-numri huma dawk tal-konvertitur (imsemmija fl-README tiegħu u mġarrba f'kull sommarju): qtil huwa **trade** meta l-qattiel ikun maqtul minn wieħed mill-membri tat-tim tal-vittma fi żmien **5 s**; **KAST** huwa s-sehem tar-rawnds b'qtil, assist (assist ta' flash jgħodd), sopravvivenza jew mewt trade; **damage** huwa s-saħħa li tintilef b'mod reali, l-għedewwa biss; **clutch** huwa li tkun l-aħħar wieħed ħaj f'naħa b'għedewwa wieqfa, miksub meta n-naħa tirbaħ; **buy** għal kull naħa mill-valur medju tat-tagħmir fl-aħħar tal-ħin ta' freeze - l-ewwel round ta' kull nofs regolari pistol round nofs (ebda wieħed fl-overtime), imbagħad taħt $1,500 eco, taħt $4,000 force buy, u aktar minn hekk full buy.

## It-tab {#the-tab}

Is-sidebar tat-tab Partita fih l-iswiċċ tal-modalità tal-heatmap u l-għażla tas-sessjoni fil-quċċata, imbagħad it-taqsimiet tal-partita hawn taħt, imbagħad il-pannelli **Filtri**, **Livell** u **Kamera** tal-heatmap - il-veduta hija l-heatmap ta' kwalunkwe Parquet mgħobbi fit-tab Heatmap.

### Sommarji tal-partiti {#match-summaries}

| Kontroll | X'jagħmel |
|---|---|
| **Għabbi fajls ta' partiti…** | jagħżel fajls `.json` (diversi f'daqqa): is-sommarji `.match.json` |
| aqsam fuq il-veduta | fajls JSON imqiegħda fuq il-veduta waqt li t-tab Partita miftuħ jinġarru bl-istess mod (fajls oħra jiġu injorati) |
| **Neħħi** | jneħħi kull partita |
| **Il-partiti kollha** (b'tnejn jew aktar) | "N partiti, M rawnds": l-istatistika fuqhom kollha |
| ringiel tal-partita | "TeamA 13 vs TeamB 9", mappa · N rawnds: tiftaħ dik il-partita |

Fajl jiġi aċċettat meta jkun JSON b'`"format": "heat3d-cs2-match"` u arrays `rounds`, `players` u `teams`. L-iżbalji jitilqu taħt il-buttuni: "<file>: mhux JSON", "<file>: mhux sommarju ta' partita CS2 (heat3d-cs2-match)", "<file>: rounds, players jew teams nieqsa". Partita mgħobbija mill-ġdid (l-istess isem `match`) tieħu post dik ta' qabel. Il-partiti jinħatru skont il-mappa, imbagħad skont l-isem. Bi partita waħda biss mgħobbija tinfetaħ; inkella l-għażla tibqa' (il-partiti kollha b'default).

Bla ebda dejta mgħobbija, it-taqsima tispjega: ikkonverti b'`python -m heat3d_cs2 demos`, għabbi l-fajls `.match.json` hawn u l-fajls `.parquet` fit-tab Heatmap.

### Partita (partita waħda miftuħa) {#match-one-match-open}

**Il-header:** iż-żewġ timijiet bl-iskor tagħhom, il-mappa, in-nofsijiet - "nofsijiet 7-5, 6-6": rawnds 1-12 u 13-24 (premier u competitive jilagħbu MR12; il-għoli tan-nofs tas-sommarju stess meta jgħid hekk, allura 1-15 u 16-30 għal MR15) - imbagħad, meta l-partita marret għall-overtime, l-iskor tagħha waħdu: "overtime 4-2", ir-rawnds wara t-tnejn in-nofsijiet. Round pperżjat ma jgħodd għal ebda tim. U "N rawnds maqtugħa fid-demo" meta s-sommarju jsemmi rawnds mhux kompluti.

**Is-strixxa tar-rawnds:** ċellola għal kull round, miksija bil-kulur tan-naħa li rebħet, bin-numru tagħha u marka għall-mod kif intemm. Round tal-pari (ebda rebbieħ) huwa ċellola griża newtrali mmarkata `=`, qatt mhux il-kulur ta' naħa; il-tooltip tagħha jgħid "Round 30: pari - l-ebda naħa ma rebħitu".

| Marka | Intemm bi |
|---|---|
| B | il-bomba splodiet |
| D | il-bomba tneħħiet |
| K | eliminati |
| T | skada l-ħin |
| S | ċedew |
| = | pari |
| ? | oħra |

Diviżjoni timmarka l-bidu tat-tieni nofs (round 13, jew ir-round wara t-tul tan-nofs tas-sommarju) u ta' kull nofs ta' overtime ta' tliet rawnds (rawnds 25, 28, 31, …). Għaddi fuq ċellola: "Round 7: TeamA (T) - il-bomba splodiet, ippjantata A" ("…, ippjantata, sit mhux magħruf" meta s-sommarju ma jkollux is-sit) u x-xiri u l-valur tat-tagħmir taż-żewġ naħat. Ikklikkja biex tiftaħ ir-round; ikklikkja darba oħra biex tagħlaqu ("Ikklikkja round għall-qtil, l-ekonomija u r-replay tiegħu.").

**Ir-round:**

- "Round 7: <team> rebaħ - <kif>" ("Round 30: pari - l-ebda naħa ma rebħitu" għal pari) u kemm dam ir-round (mill-aħħar tal-freeze sa deċiż, m:ss);
- l-ekonomija: it-tim ta' kull naħa, ix-xiri (pistol, eco, force buy, full buy) u l-valur tat-tagħmir ("$4,350");
- l-plant: is-sit, il-plejer u l-ħin fir-round (minn kwalunkwe verżjoni tas-sommarju); "Ippjantata minn <plejer> fl-1:05, sit mhux magħruf" meta s-sit ma jkunx magħruf;
- **il-feed tal-qtil**, fl-ordni: il-ħin fir-round, l-attakkant (bil-kulur tan-naħa; "world" meta ma jkun hemm attakkant), l-arma, u l-flags - **HS** headshot, **WB** minn ġol-ħajt, **SM** minn ġol-smoke; **ftuħ** l-ewwel qtil tar-round, **trade** (vendikat ħabib fi żmien 5 s), **traded** (il-qattiel inqatel fi żmien 5 s), **tim** qtil tal-membri tat-tim innifsu (suwiċidju mhuwiex wieħed). Il-qtil wara li r-round kien deċiż jiġi mdawwal;
- il-clutches: "<plejer> (T) waħdu kontra 3: rebaħ il-clutch" / "tilfu";
- min kien ħaj fl-aħħar, għal kull naħa ("ħadd");
- **Uri r-round**: kollox f'dan ir-round, fil-heatmap;
- **Replay tar-round**: jerġa' jtella' r-round bħala boxes, mill-bidu tiegħu (hawn taħt).

Buttuni **Uri fil-heatmap** (ara [hawn taħt](#show-in-the-heatmap)) għal din il-partita, jew għar-round miftuħ.

### Skorboard {#scoreboard}

Tabella għal kull tim, ringiel għal kull plejer:

| Kolonna | Hija |
|---|---|
| K, D | qtil, mwiet |
| A | assists, inklużi l-assists tal-flash |
| ± | qtil nieqes mwiet (aħdar fuq 0, aħmar taħt) |
| ADR | damage kull round, is-saħħa tintilef b'mod reali |
| KAST | % tar-rawnds b'qtil, assist, sopravvivenza jew mewt trade |
| HS | % qtil headshot |
| Open | duelli tal-ftuħ rebaħ-tilef |
| Cl | clutches rebaħ/iddaqqaq |

Għaddi fuq plejer: qtil trade, darbiet trade, assists tal-flash, għedewwa mdawla, damage tal-utility, u rawnds ta' multi-kill ("2×3k"). **Ikklikkja plejer** għall-qtil u l-mwiet tiegħu fil-heatmap (din il-partita).

### Fost il-partiti (Il-partiti kollha) {#across-matches-all-matches}

Fuq kull partita mgħobbija:

- "N partiti · M rawnds · <mappa>", u "N rawnds tal-pari, rebaħhom l-ebda naħa" meta kien hemm pariji;
- **Rawnds rebbieħa** għal kull naħa: fil-totali, fuq rawnds **pistola** (ir-rawnds tal-pistola tas-sommarju), u fuq xiri **eco**, **force** u **full** (kull wieħed bħala perċentwal bir-rawnds miżjuda; ara "rebaħ minn kemm ġew miżjuda"). Round tal-pari jiġi miżjud miż-żewġ naħat u ma jirbħuh ebda naħa;
- **Bomba**: plants għal kull sit, u kemm-il darba n-naħa T marret tirbaħ dawk ir-rawnds ("12 plants fuq A (T rebaħ 67%)"), plants li s-sit tagħhom is-sommarju ma jafx waħdu ("2 plants fuq sit mhux magħruf (T rebaħ 50%)"), jew "qatt ma ġie ppjantat"; kif intemmu r-rawnds, l-aktar komuni l-ewwel;
- "In-naħa li ħadet il-qtil tal-ftuħ rebħet N% minn dawk ir-rawnds." (suwiċidju mhuwiex qtil tal-ftuħ; round tal-pari ma jikkonvertix ftuħ);
- **Duelli tal-ftuħ, fejn**: l-għaxar postijiet bl-aktar qtil tal-ftuħ (skont fejn kienet il-vittma; l-ismijiet tal-postijiet tal-logħba maqrija b'mod leġġibbli, "TopofMid" → "Top of Mid"), id-duelli u s-sehem li rebħet in-naħa T;
- **Plejers**: l-ħmistax l-aħjar skont il-qtil nieqes il-mwiet, miġbura fuq il-partiti kollha tagħhom (imqabbda bl-ID tal-Steam): partiti, K-D, ADR u KAST miżjuda bir-rawnds miġjuba, HS% miżjud bil-qtil, duelli tal-ftuħ. **Ikklikkja plejer** għall-qtil u l-mwiet tiegħu fil-partiti kollha fil-heatmap.

Il-buttuni Uri-fil-heatmap għall-partiti mgħobbija kollha jinsabu taħtha.

## Uri fil-heatmap {#show-in-the-heatmap}

Kull link jissettja l-**filtri** tal-heatmap stess, sabiex dak li jintwera jibqa' vizibbli u editabbli fil-pannell tal-Filtri, u **Uri kollox** inaddafhom. Jaħdmu fuq it-tabella tal-heatmap mgħobbija fit-tab Heatmap; it-tab Partita qatt ma jgħabbiha huwa stess.

| Buttuni | Avvenimenti murija |
|---|---|
| **Pożizzjonijiet** | `position` - fejn kienu l-plejers, tmien darbiet kull sekonda |
| **Qtil** | `kill` - fejn kien qiegħed il-qattiel |
| **Mwiet** | `death` - fejn waqgħet il-vittma |
| **Ftuħ** | `kill` u `death` b'`opening` = 1 - l-ewwel qtil ta' kull round, fejn kienu t-tnejn qegħdin (jiġi offrut biss meta t-tabella jkollha kolonna `opening`) |
| **Smokes** | `smoke` - fejn niżlu s-smokes |
| **Flashes** | `flash` - fejn ħarġu d-dawl tal-flashes |
| **Molotovs** | `molotov` - fejn ħarqu molotovs u incendiaries |
| **HE** | `he` - fejn splodew il-granati HE |
| **Plants** | `plant` - fejn ġiet ippjantata l-bomba |
| **Tiri** | `shot` - minn fejn ġew sparati t-tiri |

Imħaddma skont fejn jinsabu l-buttuni: il-partiti mgħobbija kollha, din il-partita, jew dan ir-round ("Uri fil-heatmap - round 7").

Dak li ma jistax jiġi applikat jingħad taħt il-buttuni, mhux jiġi ffiltrat b'mod sieket għal xejn: "m'hemm l-ebda kolonna tal-partita miżmuma - partita mhix applikata", "partita: X mhix fid-dejta mgħobbija", l-istess għar-round u l-avvenimenti, "plejer X mhuwiex fid-dejta mgħobbija", "naħa X mhijiex fid-dejta mgħobbija", "ebda dejta tal-heatmap mgħobbija: għabbi l-fajls .parquet tal-partiti fit-tab Heatmap". Mingħajr dejta mgħobbija, il-links jgħidu wkoll "Għabbi l-fajls .parquet tal-partiti fit-tab Heatmap biex tarahom fuq il-mappa."

**Replay tar-round** barra minn hekk jibdel il-heatmap għal **Box replay**, il-linja tal-ħin għal modalità *play* bit-tieqa tagħha f'*lifetime*, jfittex il-bidu tas-sessjoni tar-round u jilagħab. Meta r-round ma jkunx sessjoni tad-dejta mgħobbija: "dan ir-round mhuwiex sessjoni tad-dejta mgħobbija: xejn x'jitlaq".

## Għall-iżviluppaturi {#for-developers}

Kodiċi: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Verżjonijiet tas-sommarju {#summary-versions}

It-tab jaqra sommarji tal-verżjoni 1 u l-verżjoni 2 (`"version"` fil-fajl) side by side, u jittrattahom bl-istess mod:

| | Verżjoni 2 | Verżjoni 1 |
|---|---|---|
| ħin tal-plant | sekondi fir-round, bħall-qtil | sekondi tal-partita; it-tab jitnaqqas il-bidu tar-round |
| sit tal-plant | `A` jew `B`; vojt meta d-demo ma jgħidx | `A`, `B`, jew numru ta' entità - maqra bħala sit mhux magħruf |
| tul tan-nofs | `halfLength`, minn fejn jitbiddlu t-timijiet l-ewwel; 12 meta jkun null | 12 (MR12) |
| rawnds tal-pistola | `pistolRounds` (round 1 u l-ewwel round wara n-nofs) | ir-rawnds li x-xiri tagħhom huwa `pistol` |
| round tal-pari | `winner` u `winnerTeam` vojta | - |
| suwiċidju | `suicide` fuq il-qtil, qatt mhux trade | ikkonfermat mill-qattiel u l-vittma li huma l-istess plejer |

Il-`noscope` u l-`attackerBlind` ta' qtil (verżjoni 2) ma jintwerewx fit-tab Partita, li lanqas juri post mit-tabella tal-heatmap, allura post vojt ta' ringiel tal-granata hemmhekk ma jbiddel xejn hawn.

Kif il-focus isir filtri (`focusFilters`):

- **partita** → filtru ta' kategorija fuq il-kolonna `match`;
- **round** → filtru ta' firxa `round` = N fuq kolonna numerika `round` (filtru ta' kategorija fuq waħda kategorika), u s-sessjoni tar-round (`<match> #NN`) tintgħażel fl-għażla tas-sessjoni;
- **avvenimenti** → filtru ta' kategorija fuq il-kolonna `event`;
- **plejer** → filtru ta' persuna fuq dak il-plejer;
- **naħa** → filtru ta' grupp.
