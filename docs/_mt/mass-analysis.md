---
title: "Analiżi tal-massa"
nav_order: 8
lang: "mt"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Analiżi tal-massa: eluf ta' partiti f'daqqa

**L-analiżi tal-massa** turi x'jammontaw għalih folder shiħ ta' partiti: liema vettura tirbaħ l-aktar, liema naħa hija favorita, fejn hemm l-azzjoni. Uża din meta jkollok ferm aktar partiti milli tista' tara.

Taħdem minn sommarju żgħir ta' kull partita, allura elf jew għaxart elef partita jinfetħu malajr. Tgħabbi r-ringieli sħaħ biss għall-partiti li tikklikkja.

## Ipprova {#try-it}

1. Iftaħ **Analiżi tal-massa** fl-iskrin tal-ġenb tal-Heatmap.
2. Ipprimi **Folder...** (jew **Files...**) u agħżel il-partiti tiegħek `.3dheat`.
3. Stenna waqt li l-pannell jaqra s-sommarji ("Sommarji... n minn N").
4. Ipprimi **Iftaħ l-analiżi**. Tiftaħ tieqa b'tabs.
5. Issettja l-filtri (Logħba, Mappa, Modalità, Minn, Għal), imbagħad aqra tab, pereżempju Bilanċ.
6. Ikklikkja ringiel, ċellola jew għarfien: il-partiti tiegħu jitgħabbew fil-veduta 3D, bil-kamera fuq il-post.

![It-tab tal-Bilanċ: proporzjon ta' rebħ u qtil għal kull mewt skont il-vettura](../assets/img/en/mass-balance.webp)

```
folder ta' .3dheat -> sommarji -> tieqa (tabs) -> ikklikkja ringiel -> partiti miftuħa fl-3D
```

Fajl `.3dheat` huwa partita waħda ([Fajl wieħed kull partita](container.md)). Ħeatmap u ringiel huma spjegati fil-[glossarju](glossary.md).

## Kif tikseb is-sommarji {#getting-the-summaries}

M'hemm xejn x'tagħmel għall-biċċa l-kbira tan-nies: il-pannell jaħdem is-sommarji li nieqsin waħdu. Biex tħejji folder kbir darba, uża l-għodda offline hawn taħt.

Kull partita `.3dheat` tirċievi sommarju (`src/mass/summarize.ts`), miżmum fil-container bħala l-membru `<match>.summary.json` (rwol `summary`, ara [Fajl wieħed kull partita](container.md)). L-għodda offline tikteb dawn, u indiċi għal kull folder. Hija għodda għall-iżviluppaturi; ħaddimha fuq folder kbir biex tiffranka x-xogħol lill-pannell:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Partita li diġà ġiet sommarizzata (l-istess verżjoni tal-format) tinqara biss; `--force` jerġa' jaħdem fuqha. `--no-write` iħalli l-containers kif inhuma.
- Fajl mibdul fl-aħħar `--settle` minuti (10) jitħalla barra: converter jista' għadu jikteb fih.
- `<folder>/3dheat-index.jsonl.gz`: linja għal kull partita - il-mogħdija tagħha, id-daqs, il-ħin u s-sommarju mingħajr il-grilja. `<folder>/3dheat-index.grids.jsonl.gz`: linja għal kull partita bil-grilja tagħha.
- Ħaddimha fuq il-magna li fiha jinsabu l-fajls, b'prijorità baxxa (pereżempju `nice -n 19 ionice -c3` fuq Linux).

Il-pannell jieħu, għal kull partita, l-ewwel minn dan li ġej: il-linja tal-indiċi tal-folder (l-istess mogħdija u daqs), il-cache tal-browser (IndexedDB, skont l-isem, id-daqs u l-ħin), il-membru `summary` tal-container, jew sommarju maħdum f'pool ta' workers u mħabbi. Hekk folder mingħajr indiċi jaħdem ukoll - l-ewwel darba bil-veloċità tal-qari tat-tabelli, wara minn cache.

## Il-pannell {#the-panel}

Agħżel folder (jew fajls; **Żid folder...** iżid ieħor). It-tieqa fiha l-filtri **Logħba**, **Mappa**, **Modalità**, **Minn** u **Għal**, għażla **Aqsam skont**, **L-inqas ħajjiet** u **Plejers biss**, u dan it-tabs. Kull numru ġej mis-sommarji, u klikk fuq ringiel, ċellola jew għarfien jgħabbi l-partiti tiegħu fil-veduta bħala l-overlay tal-ħafna partiti bil-filtri li juruh (vettura, klassi, arma, tim, plejer) u l-kamera fuq il-post:

| Tab | X'fih |
|---|---|
| Ħarsa ġenerali | partiti, sigħat, plejers, ħajjiet, ringieli, dati; partiti kuljum; skont il-logħba, il-mappa, il-modalità; totali tal-avvenimenti; l-ekonomija skont il-munita; meta fil-partita jiġru l-affarijiet |
| Bilanċ | skont il-vettura, il-klassi, l-arma jew it-tim, maqsum skont il-mappa, il-modalità, it-tier jew il-logħba: K/D bl-intervall tiegħu ta' ~95%, proporzjon ta' rebħ (Wilson), sopravvivenza, qtil u laqtiet kull minuta, qligħ kull minuta, u q - il-False Discovery Rate ta' Benjamini-Hochberg tal-K/D u r-rebħ kontra l-bqija tal-qsim. **L-inqas ħajjiet** jaħbi ringieli b'ħafna drabi ftit ħajjiet biex wieħed jafdahom; **Plejers biss** iħalli barra dak li ddaqqqu l-AI tal-missjoni |
| Xejriet | użu (sehem tal-preżenza), K/D jew proporzjon ta' rebħ tal-vetturi jew il-klassijiet l-aktar użati kuljum, kull ġimgħa jew kull xahar |
| Plejers | plejers distinti, partiti għal kull plejer, plejers għal kull partita, l-aktar plejers frekwenti |
| Naħat | kull naħa ta' kull mappa: partiti rbaħ meta mqabbla ma' qsim ugwali |
| Ġlied mill-qrib | dejta tal-rawnds: duelli tal-ftuħ skont in-naħa u l-konverżjoni tagħhom, trades, min jiċċaqlaq kontra min jiżżomm, crossfires, dħul immexxi b'flash, immirar, plants, vantaġġ fin-numru tal-bniedem u, **Skont il-mappa**, il-postijiet li joqtlu lill-plejers li jidħlu fihom - kull wieħed bħala sehem bl-intervall ta' Wilson tiegħu, mill-għadd `cqb` tas-sommarji ([Ġlied mill-qrib u rawnds](close-quarters.md)) |
| Uċuħ R6 | il-marki ta' Rainbow Six Siege fuq il-livell (toqob tal-balal u bħalhom) għal kull wiċċ tal-livell: marki, għal kull rawnd tal-mappa, il-kamra, is-sehem ta' dawk li nstab min spara; klikk jiftaħ it-tipi ta' marki, l-operaturi u l-klassijiet tal-armi ta' min spara, u fejn huma l-marki fuq il-wiċċ (heat żgħir ta' ċelel ta' kwart ta' metru); wiċċ iżomm l-id tiegħu fil-partiti ta' verżjoni waħda tal-mappa. Mill-għadd `marks` tas-sommarji |
| Mappa | il-grilja mqabbda tal-mappa: preżenza, qtil, mwiet, K/D, kwalunkwe avveniment, fluss, u **sħuna f'kemm-il partita** (stabbiltà); skont it-tim, f'1, 2, 4 jew 8 darbiet iċ-ċellula |
| Postijiet | postijiet li joħorġu fin-numri imma mhux fil-heat (żona kbira mimlija bħala kollha, koridji, fasċi ta' għoli), u postijiet fejn dawk li jżommuhom jirbħu aktar jew inqas mir-rawnds tagħhom; **Sib postijiet** |
| Nikek | gruppi li jagħmlu ferm aħjar jew agħar mill-bqija (vettura fuq mappa waħda, settur f'għoli wieħed), u gruppi ta' rawnds mirbuħa lil hinn minn dak li rebħet in-naħa tagħhom fl-istess partiti; **Sib nikek** |
| Għarfien | il-detetturi tal-massa u d-detetturi tal-mappa (hawn taħt); **Ikopja r-rapport (JSON)** jagħti l-JSON li jaqrah model tal-lingwa |

## Għarfien fuq ħafna partiti {#insights-over-many-matches}

Il-**Postijiet** tab isib postijiet li joħorġu fin-numri imma mhux fil-heat - żona kbira mimlija bħala kollha, koridju, fascia ta' għoli, post mimli biss f'parti mill-partita - u jimmarka bħala **moħbija** dawk li l-heat sempliċi ma juriex, u jqassarhom fil-veduta 3D; **Għabbi** jieħu l-kamera hemm bil-partiti li kellha fiha. It-tab **Nikek** isib gruppi (vettura fuq mappa u naħa waħda, settur f'għoli wieħed) li jagħmlu ferm aħjar jew agħar mill-bqija; ikklikkja wieħed biex tara kull raffinament ta' kondizzjoni waħda tal-grupp (l-esploratur), u **Għabbi** jgħabbi l-partiti tiegħu.

### Min rebaħ {#who-won}

Meta l-partiti jgħidu min rebaħ kull rawnd (il-[kolonna tar-riżultat](data-formats.md#outcome-columns) `won`), ir-riżultat isir għan waħdu:

- **Postijiet: rata ta' rebħ.** Għal kull naħa, is-sehem tar-rawnds tagħha f'post li rebħet, kontra s-sehem li rebħet fl-istess partita kullimkien - għalhekk il-bilanċ tal-mappa, tan-naħa u tal-partita nfisha huma l-bażi, u joħorġu biss il-postijiet fejn dawk li jżommuhom jirbħu aktar (jew inqas) mir-rawnds tagħhom. Eżempju maħluq: *"Dust: in-naħa T tirbaħ aktar mir-rawnds tagħha meta tkun hawn: 61% minn 412 mirbuħa, kontra 49% mistenni mir-rata tagħha stess fl-istess partiti (odds 1.6x; miżmum f'31/48 partita)."* L-istess kontrolli tar-rata ta' skoperta falza u tal-istabbiltà bħal kull post; **Agħbi** jgħabbi l-partiti li fihom inżamm, u juri l-pożizzjonijiet ta' dik in-naħa.
- **Nikek: rebħ tar-rawnd.** It-tabella **Rawnds** fiha r-rawnd ta' kull ħajja: il-mappa, in-naħa, il-parti tal-partita (rawnds 1-4, 5-8, ...), il-vettura (operatur, aġent), l-arma li użat l-aktar, il-post li żammet l-aktar, ix-xiri (eco, force, full) u jekk in-naħa tagħha għamlitx l-ewwel qtil. Grupp jiġi ġġudikat kontra dak li rebħet in-naħa tiegħu fl-istess partiti, għalhekk *T fuq Dust b'AWP* hija nikkja biss meta dawk ir-rawnds intrebħu aktar spiss mir-rawnds l-oħra ta' T f'dawk il-partiti. Eżempju maħluq: *"m1 · T · AWP: tirbaħ 80% minn 320 rawnd, kontra 62% mistenni mill-istess naħat fl-istess partiti (odds 2.3x; 40 partita)."* Ikklassifikati skont iż-żieda darba l-appoġġ; **Agħbi** jgħabbi l-partiti li r-rawnds tagħhom juruha l-aktar.

It-tnejn jeħtieġu sommarji tal-verżjoni 2 (ara [Kif tikseb is-sommarji](#getting-the-summaries)): dawk eqdem jerġgħu jinħadmu.

It-tab **Għarfien** isib, fuq il-partiti kollha, vetturi li jinbiegħu jew jirbħu aħjar jew agħar mill-bqija, postijiet imsaħħna f'sehem stabbli ta' partiti, naħat li jirbħu aktar minn qsim ugwali, vetturi li l-użu tagħhom jiċċaqlaq matul id-dati, u partijiet tat-tul tal-partita li jżommu aktar qtil minn tqassim ugwali. Kull sejba jkollha l-għadd, l-effett, l-intervall u rata ta' skoperta falza tagħha (miżmuma għal 5%), u klikk iġib il-partiti tagħha. Dettalji: [Għall-iżviluppaturi](#for-developers).

## Skala {#scale}

Tista' tirrepeti verżjoni żgħira ta' dan int stess: `node tools/demo-data.mjs` jikteb 150 partita sintetika tal-linja tad-dabbi għal `tools/.shots/demo/mass` (madwar 1,000 ringiel kull waħda). Imkejjel fuq dawk il-150 partita demo sintetika ta' `tools/demo-data.mjs` fuq PC tad-desktop (partita reali hija ferm akbar):

- `tools/3dheat-summarize.mjs` b'4 workers: 2.6 sa 4.8 s għall-150 kollha, 8 sa 21 ms kull partita f'worker; it-tieni tħaddim li jaqra biss is-sommarji jieħu madwar 2 s.
- Il-ftuħ tal-folder fil-pannell, bl-indiċi preżenti, sa ma turi t-tieqa: 0.9 sa 1.6 s (il-parti tal-worker, il-qari ta' 150 linja tal-indiċi, hija 20 sa 40 ms).
- Il-bidla għal tab, sa ma tinżel it-tabella tiegħu: Ħarsa ġenerali 10 sa 30 ms, Bilanċ 30 sa 70 ms, Xejriet 30 sa 45 ms, Plejers 15 sa 35 ms, Naħat 15 sa 20 ms, Mappa 55 sa 130 ms.
- Il-maħżen iżomm il-150 partita f'madwar 0.5 MB.

Il-ftuħ tat-tieqa jieħu frame qasir wieħed: il-fajls magħżula jmorru lill-worker 16 f'daqqa, u l-oqsma tad-dati u l-ewwel tab jidhru frame wara t-tieqa.

Il-maħżen iżomm madwar 15 KB kull partita, allura 10,000 partita jieħdu ~150 MB fil-worker; il-grilji qatt ma jinżammu għal aktar mill-mappa mitluba.

## Għall-iżviluppaturi {#for-developers}

### Għarfien fuq ħafna partiti {#insights-over-many-matches}

`src/mass/detect.ts` - kull sejba bl-għadd, l-effett u l-intervall tagħha, il-p u l-q (Benjamini-Hochberg fuq kollox li d-detettur ipprova, miżmum għal 5%), id-drill-down li jgħabbi l-partiti tagħha u ċavetta tas-sentenza b'il-valuri tagħha; ir-rapport (`heat3d.mass/1`) huwa dak li `massReportForModel` jagħti lil narratur, fl-istess forma tar-rapport ta' partita waħda (`insights/seam.ts`).

| Detettur | Isib |
|---|---|
| `balance` | vettura ta' plejer li tinbiegħ jew tirbaħ aħjar jew agħar mill-bqija fuq mappa jew f'modalità |
| `hotspot` | postijiet imsaħħna f'sehem stabbli tal-partiti li ġew (partiti sħan / partiti li rajna, kontra l-ċelel l-oħra tal-mappa) - mhux sempliċement sħan fil-total |
| `side` | naħa ta' mappa li tirbaħ aktar minn qsim ugwali |
| `meta` | sehem il-ħajjiet tal-plejers ta' vettura jew il-K/D tagħha jiċċaqlaq bejn in-nofs ta' qabel u ta' wara tad-dati, għal kull mappa - kbir biżżejjed biex ikun ta' importanza, b'xejra matul ir-rbugħ, l-istess mod fuq ħafna mappi (hawn taħt) |
| `phase` | parti tat-tul tal-partita li tżomm aktar qtil, laqtiet, tlaqqija... minn tqassim ugwali |
| `place` | postijiet li joħorġu fuq ħafna partiti (Stadju B, hawn taħt): rata ta' reġjun jew sehem qtil kontra dak ta' kull partita stess, ċrieki, koridji, żoni mkabbra, fasċi ta' għoli, fażijiet; moħbijin meta l-heat sempliċi ma juriehom |
| `niche` | gruppi li jagħmlu ferm aħjar jew agħar (Stadju B, hawn taħt) |
| `grid.*` | id-detetturi ta' dataset wieħed (postijiet tal-qawwa, postijiet sħan u kwieti, postijiet tal-klassi) fuq il-grilji mqabbda ta' kull mappa: `GridMerge.toInsightJob` iġib il-grilji tal-passaġġ tal-għarfien mis-sommarji; id-detetturi li jeħtieġu traċċi jaqbżu |

### Is-sommarju {#the-summary}

JSON sempliċi (`src/mass/types.ts`), madwar 5-30 KB miżmum f'deflate kull partita:

- il-partita: logħba, mappa, mod, missjoni, bidu, tul, ringieli, ħajjiet, plejers, AI, timijiet (ħajjiet, plejers, preżenza, qtil, mwiet, rebħ, flus), rebbieħ;
- għal kull vettura u tim: klassi, tier, ħajjiet, ħajjiet tal-plejers, preżenza, avvenimenti skont it-tip kanoniku, qtil skont il-klassi tal-mira, rebħiet, flus;
- għal kull plejer (skont l-ID tal-utent, jew l-isem): tim, ħajjiet, preżenza, qtil, mwiet, laqtiet, tlaqqijiet, rebħ, vetturi; għal kull arma: avvenimenti skont it-tip;
- b'kolonna tar-riżultat (verżjoni 2): rawnds mirbuħa u milgħuba għal kull tim, vettura (`rw`, kull wieħed ħajja u rawnd), plejer u arma (ir-rawnds li fihom naħa użatha); ir-rawnd ta' kull ħajja (`outcome.u`: rawnd, naħa, vettura, l-arma użata l-aktar, il-post miżmum l-aktar, ix-xiri, rebħ) u n-numru, ir-rebbieħ u n-naħa tal-ewwel qtil ta' kull rawnd (`outcome.r`);
- il-kolonni tal-ekonomija (`cost_*`, `earn_*`) u t-totali tagħhom;
- fażijiet: avvenimenti skont it-tip f'20 kaxxa tat-tul tal-partita u skont il-minuta;
- imġieba: il-kejl tal-imġieba kollettiva tal-partita (allinjament, merħla tal-mogħdija, korsiji, idjafa, mexxejja, dawk li jitilfu l-passa, punt ta' kisra, riskju wara telf, sekwenzi, qbil dwar ix-xiri, sopprexxjoni), kull wieħed bil-mudell null tiegħu, p u q - ara [Imġieba kollettiva](collective-behaviour.md);
- il-grilja (hawn taħt).

Megħdud kif jgħoddu l-viewer: kolonni misjuba kif il-loader tal-ħafna partiti jsibhom (`leanSpec`), avvenimenti skont `data/canonical.ts`; qtil li arma ta' Tacview tgħodd jgħodd għall-kiddieb tiegħu; mewt imqallba darba f'daqqa (`dead`, `death`) tgħodd darba.

#### Il-grilja: dak li fuqu jibni l-Istadju B {#the-grid-what-stage-b-builds-on}

Il-parti spazjali hija magħmula għal skans statistiku fuq reġjuni ta' kwalunkwe daqs u forma, mhux biss għal ritratti tas-heat:

- **Piramida.** Iċ-ċelel huma setgħat ta' tnejn allinjati fl-unitajiet tad-dinja (x, z kif il-viewer jqegħdhom). Il-livell `k` huwa ċ-ċelel imqabbda bi `ix >> k, iz >> k` - eżatt, fil-partita u bejn partiti ta' daqsijiet oħra taċ-ċelel - u kwalunkwe reġjun (kaxxa, koridju tul linja, ċirku) huwa somma ta' ċelel. Il-livell l-aktar fin jaqbel mal-estensjoni robusta tal-partita (iċ-ċelel li jżommu 99% tal-preżenza) f'128 ċella; dawk barra minnha jinżammu.
- **Esponiment ma' kull għadd.** Sekondi ta' preżenza għal kull ċella, għal kull tim (`pt`), għal kull klassi tal-vettura (`pc`) u għal kull fascia ta' għoli (`ph`), sabiex ir-rata, l-aspettattiva u l-proporzjon ta' reġjun jiġu mħaddma għal kull subgrupp.
- **Għoli.** Fasċi ' fuq l-art tal-partita (l-1 perċentil tal-għoli): taħt 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, fuq; fajl b'kolonna `floor`/`storey`/`deck` jagħmel fasċi skont il-bnadar tiegħu minflok. `y` huwa l-għoli medju ta' kull ċella, `y0` l-aktar baxx tagħha (il-bnadar tagħha, għal għoli fuqu).
- **Avvenimenti** bħala tuples `[cell, kind, team, class, band, count]`.
- **Rawnds skont ir-riżultat** (verżjoni 2, b'kolonna tar-riżultat u żewġ rawnds jew aktar): `pw` bħala `[cell, team, rounds won, rounds lost]` - ir-rawnds li fihom kull naħa qattgħet sekonda jew aktar fiċ-ċellula, skont ir-riżultat tagħha fir-rawnd.
- **Ħinijiet imqattgħin** f'livell kważi (8 ċelel kull naħa), skont il-minuta mill-bidu tal-partita: `[cx, cz, minute, kind, value]`, is-sekondi tal-preżenza bħala tip `GRID_KINDS.length`; il-fażijiet tal-partita huma minuti fuq it-tul.
- Imxerred, għadd sħiħ, sekondi sa għexxa: imqayyad minn dak li ġara.

### Stadju B: postijiet u nikek {#stage-b-places-and-niches}

L-Istadju B ifittex dak li joħroġ fin-numri mingħajr ma jaqbad l-għajn: żona kbira mimlija bħala kollha mingħajr ebda ċella sħuna fiha, proporzjon stramb ta' qtil u mewt fuq ftit avvenimenti, koridju, fascia ta' għoli, raggruppament li jkun hemm biss f'parti waħda tal-partita - u gruppi (vettura fuq mappa waħda f'naħa waħda, settur f'għoli wieħed) li jagħmlu ferm aħjar jew agħar mill-bqija. **Sib postijiet** / **Sib nikek** / **Sib għarfien** waħda tmexxi d-detetturi kollha; it-tliet tabs jaqsmu r-rapport.

#### Postijiet (`src/mass/scan.ts`) {#places-srcmassscants}

Il-partiti ta' kull mappa jinqraw darbtejn, partita b'partita; il-memorja żżomm is-somom fuq grilja ta' mhux aktar minn 64 ċella kull naħa (16 għall-iskans tal-ħin-spazju), qatt mhux il-partiti.

- **Kejl.** Ir-rata ta' avveniment għal kull sekonda ta' preżenza - qtil, mwiet, laqtiet, tlaqqijiet, qabdiet, għall-unitajiet kollha, għal kull klassi (l-4 bl-aktar avvenimenti), għal kull fascia ta' għoli - u s-sehem tal-qtil fil-qtil u l-mwiet (kollha, għal kull naħa, għal kull fascia), u r-**rata ta' rebħ** ta' kull naħa: ir-rawnds tagħha fiċ-ċellula mirbuħa kontra mitlufa (`pw`), fejn 8 partiti tal-mappa jew aktar jgħoddu r-rawnds skont ir-riżultat. Liema klassijiet u naħat jiġu mir-ras (`planOf`).
- **Aspettattiva skont il-partita.** Ir-rata ta' kull partita stess imqassma fuq il-preżenza tagħha stess f'ċella hija l-aspettattiva tal-ċella (skans ta' Kulldorff aġġustat għall-covariates, stratifikat skont il-partita): ftit partiti dmija jew server wieħed ikbir ma jagħmlu l-ebda post. Għar-rata ta' rebħ, l-aspettattiva hija s-sehem tan-naħa stess ta' rawnds mirbuħa f'dik il-partita, għalhekk il-bilanċ tal-mappa u tan-naħa qatt ma jsir post. Rawnd f'diversi ċelel ta' reġjun jgħodd f'kull waħda; id-dispersjoni mkejla fid-daqs tar-reġjun iġġorr dan.
- **Dispersjoni.** Il-partiti jaqblu ferm aktar minn Poisson. Il-residwi ta' kull partita jinġabru f'blokki ta' 1, 2, 4, 8, 16 ċelel; id-dispersjoni ta' kull daqs ta' blokk (residwi kwadri fuq il-varjanza nulla, miġbura flimkien, bl-aħħar 5% tal-blokki mitfugħa barra) tiskala kull test ta' reġjun ta' dak id-daqs: proporzjon ta' probabbiltà kważi, Poisson għar-rati, binomjali għas-sehem.
- **Reġjuni.** Ċrieki ta' 0.75 sa 18 ċellola; elissi f'sitt angoli, 3 u 6 darbiet itwal milli wiesgħa, 3 sa 18 ċellola (koridji; l-assi huwa `place.path` tal-għarfien); żoni mkabbra ċella b'ċella mill-aktar ċelel lokali Gi* qawwija sakemm il-punteġġ tar-reġjun jikber (forom irregolari) - mkabbra fuq nofs il-partiti u ttestjati fuq in-nofs l-ieħor, sabiex il-ħelsien tat-tkabbir ma jagħmel l-ebda post falz; kull fascia ta' għoli kontra l-fasċi l-oħra tal-partita fuq il-mappa kollha (robust għall-raggruppament); silindri ta' ħin-spazju: ċirku f'wieħed jew tnejn minn ħumsa tat-tul tal-partita, kontra l-ispread tal-avvenimenti tal-partita stess fuq il-post u l-ħin (l-iskans permutazzjoni ta' ħin-spazju).
- **Ittestjar.** p mill-proporzjon ta' probabbiltà kważi; Benjamini-Hochberg fuq kull reġjun ippruvat fuq kull mappa (700,000 fuq tliet mappi huwa tas-soltu) għal 5%. Dak li jgħaddi jitnaqqas (reġjun li jkun l-aktar ġewwa ċirku ieqaf tal-istess kejl juri l-istess ħaġa), jinqara mill-ġdid għall-**istabbiltà** tiegħu - il-partiti li rawh, il-partiti li żammuh, id-direzzjoni tiegħu f'ħames folds tal-partiti - u jiġi ttestjat darba oħra fuq il-varjanza li l-partiti stess juru (robust għall-raggruppament, il-partiti bħala gruppi, qatt taħt Poisson), BH mill-ġdid. Postijiet kwieti fuq bażi (2% jew aktar tal-ispawns, tat-tlugħ u tan-nżul tal-mappa) jitħallew barra.
- **Effett.** Il-proporzjon tar-rata (jew tal-odds), imnaqqas bil-Bayes empiriku (prior gamma adattat għall-blokki 2x2 tal-mappa), b'intervall ta' ~95% fid-dispersjoni; Gi* f'1, 2 u 4 ċelel u Moran lokali fiċ-ċentru.
- **Ovvjetà viżiva.** Kemm ir-reġjun diġà juri fis-heat sempliċi tal-avveniment tiegħu (skala logaritmika sal-iktar ċella ċara, kif jiddisinjawh il-veduti): il-kuntrast tiegħu ma' ċirku madwarha (għaxra tal-paletta diffiċli biex tinstab, żewġ ħamsijiet sempliċi) u quċċata ċara li tiġorr l-eċċess; proporzjon qatt mhu mmarkat mill-heat, allura sehem jgħodd nofs. Taħt 35% huwa **moħbi**. Il-klassifika: is-saħħa (l-effett li jsatura f'4 darbiet, postijiet kwieti f'0.7) darba `1 - 0.7 x ovvjetà` darba l-qbil tal-folds.

It-tab **Postijiet** jelenka dawn (moħbijin biss b'default; skont il-mappa, il-forma, id-direzzjoni); ikklikkja jiddelinja l-postijiet tal-mappa fil-veduta 3D (`placeLines.ts`: il-linji ta' fuq tal-magna, mibnija darba: maġenta moħbi, ambra sempliċi, ċjan kwiet, dik magħżula sħiħa; fascja bħala kaxxa mill-art sa s-soffitt tagħha) u fuq il-kanvas tat-tab tal-Mappa; **Għabbi** jieħu l-post u jgħabbi l-60 partita li kellu fihom l-aktar, filtrati skont l-avveniment tiegħu (u l-klassi).

#### Nikek (`src/mass/niche.ts`) {#niches-srcmassnichets}

Tfittxija tar-raġġ (wisa' 24, fond 3) fuq tliet tabelli: **ħajjiet** (il-ħajjiet tal-plejers: logħba, mappa, mod, klassi, vettura, naħa, tier, rbugħ tad-dati, terz tat-tul tal-partiti; K/D, rebħ, mewt ħajja, qtil kull siegħa, qligħ kull minuta), **postijiet** (qtil u mwiet skont il-mappa, il-modalità, id-dati, is-settur tal-mappa 4 x 4, il-klassi, in-naħa, il-fascia) u **fażijiet** (settur u ħames tat-tul tal-partita: K/D, mwiet kull siegħa ta' preżenza). Grupp jiġi ttestjat kontra l-kollox bil-partiti bħala gruppi (il-varjanza sandwich tar-residwi tiegħu skont il-partita), l-effett tiegħu bħala proporzjon ta' odds jew rata mnaqqas bi prior ta' 20 riżultat; ħtieġ 30 riżultat f'8 partiti, u raffinament irid ikun 10% aktar b'saħħtu mill-ġenitur tiegħu; gruppi fejn ir-riżultat ikun dejjem jew qatt ikun hemm huma mitfugħa barra (ma jkunux irrekordjati għalihom). Miżmum: BH taħt 5% fuq kull grupp evalwat, proporzjon imnaqqas ta' 1.25 (jew 1/1.25) mill-inqas, erba' minn ħames folds jaqblu, u mhux raffinament li jirrepeti biss il-ġenitur tiegħu. It-tab **Nikek** jelenkhom; klikk juri kull raffinament ta' kondizzjoni waħda tal-grupp (l-esploratur), **Għabbi** jgħabbi l-partiti tiegħu. It-tagħmir tal-armi ma jinsabx għadu fis-sommarji.

Ir-raba' tabella, **rawnds** (`roundsTable`), għandha r-riżultat tar-rawnd bħala l-għan tagħha: ringiela waħda għal kull rawnd ta' ħajja - mappa, naħa, parti tal-partita (rawnds 1-4, 5-8, ...), vettura, l-arma użata l-aktar, il-post miżmum l-aktar, xiri, l-ewwel qtil jew l-ewwel mewt - iġġudikata kontra r-rata ta' rebħ tan-naħa tagħha stess fil-partita tagħha stess (l-aspettattiva stratifikata ta' Mantel-Haenszel: ir-residwu huwa `won - e`, `e` is-sehem tan-naħa fil-partita), għalhekk nikkja qatt ma hi l-bilanċ tal-mappa jew tan-naħa. Il-partiti jibqgħu r-raggruppamenti. Iż-z tagħha huwa kkalibrat: l-istess tfittxija bir-raġġ taħdem tmien darbiet fuq ir-riżultati mħawda bejn ir-rawnds ta' kull naħa ta' kull partita (ir-rata tan-naħa f'kull partita tinżamm), u t-tixrid ta' dawk iż-z null lil hinn minn normali standard - skont in-numru ta' kundizzjonijiet, min-nofs (medjan / 0.674) u mid-denb (99 perċentil / 2.576), l-akbar, qatt taħt 1 - jaqsam dawk veri qabel il-p tagħhom u r-rata ta' skoperta falza (null empiriku, Efron 2004). Gruppi aktar fil-fond jieħdu l-iskala l-akbar: ir-raġġ iżomm raffinamenti ta' gruppi magħżula għaż-z kbir tagħhom. Il-bażi ta' nikkja hija l-aspettattiva tagħha stess, iż-żieda tagħha l-punti 'l fuq minnha, u tiġi kklassifikata skont iż-żieda darba l-għerq kwadru tar-rawnds tagħha, miżmuma mill-evidenza u mill-folds (`wracc` huwa l-appoġġ darba ż-żieda). Iġġorr il-partiti fejn dehret l-aktar (`matchIds`) u ftit mir-rawnds tagħhom (`rounds`, `[match, round]`) għad-dettall.

#### Bidliet fil-`meta` b'sinifikat prattiku {#meta-shifts-with-practical-significance}

Fuq dati mħallta, il-binomjal fuq il-ħajjiet sejjaħ kważi kull bidla sinifikanti. Issa `meta` jittestja b'mod robust għar-raggruppament (il-ħajjiet ta' kull partita huma raggruppament), iżomm bidla fl-użu biss ta' 2 punti u 25% mill-inqas, bidla fil-K/D ta' 1.3 darba, ir-rbugħat tad-dati jimxu fl-istess direzzjoni (tau ta' Kendall ta' mill-inqas 0.5) u, għal vettura fuq diversi mappi, l-istess direzzjoni fuq il-biċċa l-kbira minnhom. Dan iħalli biss ftit bidliet f'sett ta' testijiet fejn it-test sempliċi kien jiġbed kważi lkoll.

#### Għal mudell {#for-a-model}

`massReportForModel` jagħti lil kull post il-`region` tiegħu (forma, moħbi, ovvjetà, għoljiet, fażi) u lil kull nikka l-`conditions` tagħha, flimkien ma' kemm reġjuni u gruppi ġew ippruvati. Il-lenti tal-għarfien tista' taqra l-postijiet bħala żoni tal-qtil u rotot tal-attakk: it-tipi tagħhom huma `place.*` u `niche.*`.

#### Kontrolli {#checks}

`scan.test.ts` jippjanta żona mxerrda (1.6 darbiet ir-rata tal-mewt fuq ċirku ta' 22 ċella, ħafifa f'kull ċella), koridju, fascia ta' għoli u raggruppament tal-fażi biss f'240 partita sintetika b'dispersjoni eċċessiva - kollha misjuba, dik mxerrda moħbija - u jaħdem tmien settijiet null ta' 60 partita: l-ebda post. `niche.test.ts` isib grupp ippjantat ta' vettura x mappa x naħa u xejn fi ħames tabelli null. `outcome.test.ts` jiċċekkja s-sommarju tal-verżjoni 2 (rawnds mirbuħa skont in-naħa, l-unità, il-plejer u l-arma, `pw`, ir-rawnds tal-unitajiet); jippjanta korsija li n-naħa tagħha tirbaħ 70% tar-rawnds tagħha kontra 35% (kull partita bil-bilanċ tagħha) - misjuba - u jaħdem 20 sett null ta' 50 partita fejn il-korsiji ma jgħidu xejn: l-ebda post tar-rata ta' rebħ; jippjanta AWP fuq mappa waħda li jirbaħ ir-rawnds tan-naħa tiegħu 30 punt aktar - misjub, bil-partiti u r-rawnds tiegħu - u jaħdem 30 sett null ta' 80 partita b'kull partita bil-bilanċ tagħha u naħa waħda aktar b'saħħitha fuq mappa waħda: l-ebda nikkja.
