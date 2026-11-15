---
title: "Tagħbija tal-fajls"
parent: "Kif tidħol id-data"
nav_order: 1
lang: "mt"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Tagħbija tal-fajls

Din il-paġna turi kif tagħti lill-3DHeat il-fajls tiegħek u x'jagħmel bihom. Itfa' folder, u jagħżel il-fajls li fihom pożizzjonijiet u jgħaqqadhom f'stampa waħda.

1. Iftaħ **Sors** fuq nett fil-sidebar tat-tab tal-Heatmap.
2. Itfa' fajls jew folder fuq iż-zona tat-tfigħ, jew agħfas **Fajls…** jew **Folder…**.
3. Aqra l-linja tal-għażla u l-**Stima tal-memorja** (ara l-istampa hawn taħt).
4. Agħfas **Għabbi**.

![Il-panew Sors wara li tlaqqa' folder ta' ghaxar partiti: 1 il-linja tal-għażla, 2 l-Istima tal-memorja fit-tifsira ta' jidħlu, u 3 Għabbi 10 fajls](../assets/img/en/loading-files-source.webp)

*Wara li titfa' folder, il-3DHeat jgħidlek x'sab u jekk jidħilx.*

Il-fajls jitgħabbew fil-panew **Sors** fuq nett fis-sidebar tat-tab tal-Heatmap. Kollox magħżul flimkien isir **dataset** wieħed.

## L-għażla tal-fajls {#choosing-files}

| Kontroll | X'jagħmel |
|---|---|
| **Itfa' fajls jew folder hawn** (iż-zona tat-tfigħ) | Itfa' kwalunkwe taħlita ta' fajls u ta' folders. Il-folders jiġu mixjija bil-ġurnata sa fond ta' 12-il livell. Meta tikklikkja fuq iż-zona tat-tfigħ, tiftaħ l-istess għażla bħal **Fajls…**. |
| **Fajl wieħed…** | Għażla ta' fajl għal fajl wieħed. |
| **Fajls…** | Għażla ta' fajl li taċċetta diversi fajls. |
| **Folder…** | Għażla ta' folder (l-għażla `webkitdirectory` tal-browser); kull fajl fis-siġar tal-folder jiġi offrut. |

L-għażliet jaċċettaw it-tipi ta' fajl fil-[lista tal-fajls li jistgħu jitgħabbew](data-formats.md#files). Fil-qosor: `.parquet`/`.pq` jinqraw bħala Parquet, `.csv`/`.tsv`/`.txt` bħala test imfassal, `.acmi` (Tacview), OCAP `.json`/`.json.gz` u l-formati GPS (GPX, KML, KMZ, NMEA, IGC, FIT) jgħaddu mill-qarrejja tagħhom stess, u l-kontenituri `.3dheat` tal-partiti jitgħabbew bħala t-tabelli li fihom ([Fajl wieħed għal partita](container.md)). Kontenitur li ma jistax jinqara jitħalla barra bħala *mhux fajl csv/parquet*.

Il-folders li jitfgħu jiġu mixjija sa fond ta' 12-il livell u sa 20,000 fajl għal kull wieħed, bħala salvagwardja kontra loops ta' symlinks u siġar li jibqgħu jikbru.

## Liema fajls jinżammu {#which-files-are-kept}

Qabel ma jinqra xejn, l-għażla tiġi ffiltrata ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Fajl b'estensjoni oħra jitħalla barra: *mhux fajl csv/parquet*.
- Fajl ta' 0 bytes jitħalla barra: *vojt (0 bytes)*.
- **Il-fajls sidecar tal-konvertituri** - id-dejta mhux maħduma li konvertitur iżomm ħdejn tabella ta' partita, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` u dawk l-oħra elenkati f'[Il-konvertituri jżommu kollox](converters.md) - jitħallew barra: *sidecar ta' konvertitur*. Biex tiftaħ wieħed, agħżlu jew itfgħu waħdu (jew flimkien mal-sidecars biss): għażla ta' sidecars biss titgħabba bħal kull tabella. Il-JSON ħdejn tabella (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` u `.hints.json`) qatt ma jiġi offrut bħala pożizzjonijiet.
- **Ir-regola tal-fajl tal-moviment.** Jekk xi fajl fl-għażla jismu `movement*.parquet`, `movement*.csv` (u l-estensjonijiet l-oħra) - `movement.parquet`, `movement_1.parquet` u l-bqija - allura kull fajl ieħor tad-dejta jitħalla barra: *mhux fajl tal-moviment, u dan il-folder fih fajls tal-moviment*. Esportazzjonijiet ta' telemetrija spiss iżommu tabella waħda ta' pożizzjonijiet ħdejn għexieren ta' tabelli mingħajr pożizzjonijiet, u biss dik l-ewwel tista' titpinġa. Folder bla ebda fajl tal-moviment jitgħabba s-sħiħ tal-fajls tad-dejta tiegħu. Eżempju: folder b'`movement_1.parquet`, `kills.parquet` u `shop.parquet` jitgħabba `movement_1.parquet`; it-tnejn l-oħrajn jiġu elenkati bħala mitfija. Eżempju: folder b'`movement_1.parquet`, `kills.parquet` u `shop.parquet` jitgħabba `movement_1.parquet`; it-tnejn l-oħrajn jiġu elenkati bħala mitfija.
- Il-fajls miżmuma jitqassmu skont il-passaġġ tagħhom ġewwa l-għażla, sabiex l-istess folder dejjem jagħti l-istess dataset u l-istess kuluri.

Il-panew imbagħad juri l-għażla (l-isem ta' fajl wieħed, jew `folder (N files)` bl-aktar folder komuni twil), l-għadd tal-fajls, id-daqs totali tagħhom u l-għadd totali tar-ringieli - eżatt meta kollha jkunu Parquet, immarkat `≈` meta xi wieħed ikun CSV. Il-fajls mitfija jiġu elenkati bir-raġuni tagħhom, l-ewwel erbgħa bl-isem.

## Il-qari tal-iskema {#reading-the-schema}

L-**ewwel** fajl tal-għażla jinfetaħ biex jiddeskrivi l-iskema ("Qed naqra l-iskema"): l-ismijiet tal-kolonni tiegħu, l-ewwel 50 ringiela tad-dejta, liema kolonni jidhru numeriċi, u għal Parquet, it-tip loġiku ta' kull kolonna u l-entry `heat3d` fil-footer. Folder ta' esportazzjonijiet ta' tabella waħda jaqsmu skema waħda, għalhekk fajl wieħed jirrappreżenta lill-kollha. Imbagħad jitkejlu l-fajls kollha ("Qed nagħdu r-ringieli"): footer ta' Parquet jagħti l-għadd eżatt f'qari żgħir wieħed; l-għadd ta' CSV jiġi stmat mill-linja medja tal-ewwel megabyte tiegħu.

Il-panew [Immappjar tal-kolonni](column-mapping.md) jiftaħ bl-aħjar tħmin awtomatiku, u l-[stima tal-memorja](memory-and-budgets.md) tidher fuq il-buttuna **Għabbi**.

## Messaġġi qabel it-tagħbija {#messages-before-loading}

Taħt l-għażla l-panew jelenka, minn [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Żbalji** (aħmar) - it-tagħbija ma tistax tibda: inqas minn żewġ assi ta' pożizzjoni, l-istess kolonna fuq żewġ assi, kolonna mmappjata li mhijiex fil-fajl, kolonna ta' pożizzjoni li ma tidhirx numerika, kolonna tal-ħin li l-valuri kampjunati tagħha huma test filwaqt li l-unità hija numru (kull ringiela tinqara bħala NaN u tmur fil-ħin 0), kolonna tal-ħin imqiegħda għal ISO-8601 li ebda valur kampjunat tagħha ma jinqara bħala data, jew skala ta' unità ta' 0.
- **Twissijiet** (kannella) - jitgħabba, iżda probabbilment mhux kif maħsub: kolonna ta' grupp li tieħu valur differenti fuq il-biċċa l-kbira tar-ringieli kampjunati (għalhekk hija id, mhux grupp), kolonna tal-ħin `DATE` (kull ringiela ta' ġurnata taqsam l-istess mument), direzzjoni tal-ħarsa mqiegħda mingħajr il-kolonni tagħha.
- **Noti** - x'jimplika l-immappjar: tpinġija fuq pjan meta assi wieħed ma jkunx immappjat, l-ebda linja taż-żmien mingħajr kolonna tal-ħin, l-ebda traċċi mingħajr kolonna ta' persuna, u mingħajr kolonna ta' grupp kulur wieħed għal kollox u differenza li tista' tinqasam biss fuq kolonna miżmuma għall-filtrar.

## It-tagħbija {#loading}

Il-buttuna **Għabbi** taqra *Għabbi fajl*, *Għabbi N fajls*, jew *Għabbi N fajls (1 minn K)* meta tkun imqiegħda [pass ta' tnaqqis](memory-and-budgets.md#decimation). Taqra *Kbir wisq - naqqas jew naqqas bil-pass* u tkun mitfija meta [il-kontroll tal-fit](memory-and-budgets.md#the-fit-check) jgħid li t-tagħbija ma tidhirx; tkun mitfija wkoll meta l-immappjar ikollu żbalji jew meta tkun għaddejja tagħbija oħra.

Waqt it-tagħbija, il-panew juri l-pass attwali (b'`[fajl/fajls]` quddiemu meta jkun hemm diversi fajls), ir-ringieli li nqraw s'issa, barra tal-progress, u **Ikkanċella**. Ikkanċella jtemm il-worker tal-ingest, u miegħu kull worker tal-parser li beda.

Il-paġna tibqa' tinpinġa waqt it-tagħbija, għax ix-xogħol isir fil-background. Tara l-pass attwali, ir-ringieli li nqraw, barra tal-progress u **Ikkanċella**. Wara l-aħħar fajl, il-panew juri l-passi *Qed nqiegħed ir-ringieli fl-ordni taż-żmien*, *Qed nerġa' nordna l-kolonni (n minn m)*, *Qed nkejjel il-firxa*, *Qed nibni l-lista*, *Qed niġbor is-sessjonijiet* u *Qed nikkalkula d-dewmien*, imbagħad *Qed nitgħabba N ringiela fuq il-GPU* għal frame wieħed, sabiex tagħbija twila qatt ma titqies bħala waqfa.

### Kif jaħdem {#how-it-works}

It-tagħbija titmexxa f'Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Bi diversi fajls u iktar minn [ħajt wieħed tal-parser](memory-and-budgets.md#parser-threads), sa dak l-għadd ta' fajls jinqraw **fl-istess ħin**, kull wieħed f'worker tal-parser tiegħu stess ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), sa fejn il-baġit tar-RAM jħalli spazju; jibqgħu jingħaqdu wieħed wieħed skont l-ordni tal-għażla, sabiex id-dataset ikun l-istess bħal tagħbija wieħed wara l-ieħor. Waqt li diversi jkunu għaddejjin, il-linja tal-progress issemmi l-fajl li rrapporta l-aħħar, u l-barra u l-għadd tar-ringieli jaqsmu kull fajl li jkun għaddej. B'ħajt wieħed, jew b'fajl wieħed, il-fajls jinqraw wieħed wara l-ieħor fil-worker tal-ingest innifsu. Jinqraw biss il-kolonni li l-immappjar isemmi: kolonna mhux immappjata f'fajl ta' Parquet ma tiswa xejn; CSV jiġi skennjat byte b'byte, imma biss il-oqsma mmappjati jinfthu.

## Diversi fajls isiru dataset wieħed {#several-files-become-one-dataset}

Meta jitgħabba iktar minn fajl wieħed ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Roster wieħed.** Persuni, gruppi, sessjonijiet u valuri ta' kategorija huma dizzjunarji miftiehma fuq il-fajls kollha, għalhekk l-istess plejer f'żewġ esportazzjonijiet huwa persuna waħda b'traċċa waħda.
- **Oriġini ta' ħin waħda.** Il-ħinijiet jinżammu bħala sekondi ta' 64-bit waqt it-taqbid u jiġu rrisistemati fuq l-eqdem ħin tal-għażla *kollha*, imbagħad jinħażnu bħala sekondi ta' 32-bit minn dik l-oriġini. Erba' esportazzjonijiet minn erba' filgħaxijiet jitqiegħdu fl-ordni reali tagħhom, mhux imqiegħda fuq xulxin.
- **Ordni taż-żmien waħda.** Ir-ringieli mill-fajls kollha jitqassmu skont il-ħin b'radix sort (ara [il-limitu tal-ordni](memory-and-budgets.md#the-sort-ceiling)).
- **Kolonna `Source file`.** Kull ringiela tiftakar liema fajl ġiet minnu, bħala kolonna ta' kategorija bl-isem `Source file`. Tidher fil-[Filtri](filters.md) u bħala *Source file - compare two loads* fil-[qsim tad-differenza](difference.md). Tagħbija ta' fajl wieħed ma tikseb din il-kolonna - kolonna kostanti tiswa 4 bytes għal kull ringiela biex tgħid xejn.
- **Kolonni nieqsa.** Fajl li ma għandux waħda mill-kolonni tal-**filtru** ma jagħti l-ebda valur għalihom. Fajl li ma għandux kolonna ta' **rwol** immappjata (X, ħin, persuna, ...) jfalli b'*file has no column "name"*; f'tagħbija ta' diversi fajls dak il-fajl jitħalla barra u l-oħrajn xorta jitgħabbew, u l-fajls mitfija jiġu elenkati fuq id-dataset. Tagħbija ta' fajl wieħed li tfalli tirrapporta l-iżball.
- **Twissija tan-nuqqas.** Meta r-ringieli mitgħabba jkunu inqas minn 95% tar-ringieli li ġew imqabbla minn qabel, id-dataset iġorr twissija bis-sehem li nieqes - mill-fajls li ma jinqrux jew mir-ringieli bla pożizzjoni użabbli, li jitwarrbu waqt id-dħul.

## Wara t-tagħbija {#after-loading}

Id-dataset l-ġdid jieħu post kull dataset ieħor. Fuq kull tagħbija ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- il-filtri kollha u l-viżibbiltà tal-gruppi jitneħħew;
- il-qsim tad-differenza skont il-grupp jitħassar: l-ewwel nofs il-gruppi (imqarrba 'il fuq) pożittivi, il-bqija negattivi;
- ir-raġġ tal-isprite jitpoġġa għall-medda orizzontali / 120 u s-saturazzjoni għal stima analitika; id-daqs tal-kubu, it-tul tar-raġġ tal-ħarsa, il-veloċità tat-tlugħ u l-pjanijiet near/far jitpoġġew mill-medda (ara [Sessjonijiet, persuni u gruppi](sessions-persons-groups.md#entity-size));
- is-sessjoni tar-replay tal-kaxxa titpoġġa għas-sessjoni bl-iktar ringieli;
- il-mogħdijiet tas-sħana tal-linji jiġu mħallsa mill-ġdid ([Sħana tal-linji](line-heat.md));
- il-mod tal-view jerġa' jaqa' għal **Sħana** jekk il-mod attwali ma jkunx appoġġjat mid-dejta l-ġdida; il-linja taż-żmien taqa' għal **Kollox** mingħajr kolonna tal-ħin, u l-istorja għal **Kumulattiva** mingħajr dewmien;
- il-playhead jitpoġġa fil-bidu u l-playback jieqaf;
- il-kamera tiffrejmja d-dataset kollu mid-direzzjoni default (tħares lejn -Z, imdawwar 'l isfel b'madwar 36°).

Il-panew **Dataset** imbagħad juri l-isem tad-dataset (l-għażla, l-għadd tar-ringieli u tal-fajls, u l-pass meta kien hemm wieħed), `N timijiet · N persuni · Ns medda`, u kull twissija li t-tagħbija ħalqet, bil-kannella, sakemm id-dataset ikun mgħobbi. **Neħħi** f'dak il-panew jitneħħa d-dataset.
