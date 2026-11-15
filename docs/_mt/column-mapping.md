---
title: "Immappjar tal-kolonni"
parent: "Kif tidħol id-data"
nav_order: 2
lang: "mt"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Immappjar tal-kolonni

Fajl huwa tabella, u 3DHeat irid ikun jaf liema kolonna żżomm il-pożizzjoni fuq in-naħa tal-lvant-punent, liema tiżżomm il-ħin, liema tiżżomm l-isem tal-plejer, u hekk kif. Dan il-panew huwa fejn jgħid x'ħaseb, u fejn tikkoreġi ħsieb ħażin.

![Il-panew Immappjar tal-kolonni wara tagħbija ta' fajl Parquet: kull kaxxa diġà mimlija - 1 X, 2 Y, 3 Z, 4 Ħin, 5 Id tal-persuna, 6 Sessjoni / partita, 7 Tim / grupp](../assets/img/en/column-mapping-panel.webp)

*Il-fajl semmha l-kolonni tiegħu stess, għalhekk kull kaxxa diġà mimlija.*

Per eżempju, CSV bl-intestatura `x,y,z,t,player,team` jimmappja lilu nnifsu: x, y u z isiru l-pożizzjoni, `t` il-ħin, `player` il-[persuna](glossary.md) u `team` il-[grupp](glossary.md).

Wara li jiġu magħżula l-fajls, il-panew **Immappjar tal-kolonni** jiftaħ taħt il-panew tas-Sors. Jgħid liema kolonna tilgħab liema rwol. Jimtela awtomatikament u kull qasam jista' jinbidel qabel tipprem **Għabbi**; l-immappjar jinqara waqt it-tagħbija, għalhekk jekk tibdlu wara trid terġa' tgħabbi.

## L-oqsma {#the-fields}

Il-menus tal-kolonni kollha jelenkaw kull kolonna tal-ewwel fajl, flimkien ma' *- xejn -*.

| Qasam | Rwol | Noti |
|---|---|---|
| **Separatur** | CSV biss: il-karattru li jifred il-oqsma. | Menu: *Virgola ,*, *Punt u virgola ;*, *Tab*, *Pipe \|*, *Spazju*; jew ikteb xi karattru wieħed fil-*jew ikteb karattru wieħed*. Jinstab awtomatikament (ara hawn taħt). Jekk tbiddlu, l-immappjar awtomatiku jerġa' jitmexxa, u l-modifiki li għamilt qabel jitilfu. |
| **X**, **Y**, **Z** | Pożizzjoni. | Għall-inqas tnejn huma meħtieġa; it-tielet assi li ma jkunx immappjat huwa 0 (id-dejta tinsab fuq pjan). L-istess kolonna fuq żewġ assi hija żball. |
| **Assi 'l fuq fis-sors** | Liema assi fis-sors iħares 'il fuq. | *Z hija 'l fuq (l-iktar magni tal-logħba)* jew *Y hija 'l fuq (konvenzjoni tal-grafika)*. Ara [Assi, unitajiet u ħin](axes-units-and-time.md). |
| **Skala tal-unità** | Timmultiplika kull pożizzjoni. | Buttuni *1 (m)* u *0.01 (cm→m)*, jew ikteb valur. |
| **Qlib X / Qlib Y / Qlib Z** | Jneġa assi tas-sors. | Japplika għall-pożizzjonijiet u għall-vetturi tad-direzzjoni tal-ħarsa. |
| **Ħin** | L-assi tal-ħin. | Mhux obbligatorju. Mingħajr dan ma jkun hemm l-ebda linja taż-żmien. |
| **Unità tal-ħin** | Kif jinqara l-kolonna tal-ħin. | Seba' unitajiet; ara [Assi, unitajiet u ħin](axes-units-and-time.md#time). Ma jintużax għal kolonni Parquet `TIMESTAMP`/`DATE`, li l-panew jgħid. |
| **Id tal-persuna** | Min jew xi ħaġa tappartjeni għaliha ringiela. | Mhux obbligatorju. Jagħmel it-traċċi, id-dewmien, ir-replay tal-kaxxa u s-sħana tal-linji possibbli. |
| **Sessjoni / partita** | Liema partita, raid, rawnd, run jew dawra tappartjeni għaliha ringiela. | Mhux obbligatorju. Il-pożizzjonijiet qatt ma jiġu interpolati, imtawla jew imgħaqqda f'rotta mal-bidla ta' sessjoni. Ara [Sessjonijiet, persuni u gruppi](sessions-persons-groups.md). |
| **Tim / grupp** | Kull kolonna b'ftit valuri differenti. | Mhux obbligatorju. Iwassal il-kuluri tal-gruppi, is-sħana tat-tim u l-qsim tad-differenza skont il-grupp. |
| **Direzzjoni tal-ħarsa** | *Xejn*, *Kolonni tal-yaw / pitch* jew *Kolonni tal-vettur tad-direzzjoni*. | Bl-yaw/pitch: **Yaw**, **Pitch** u **Unità tal-angolu** (*Gradi* / *Radianti*). Bil-vettur: **Dir X**, **Dir Y**, **Dir Z**. Jintuża għall-ħarsiet tar-[replay tal-kaxxa](box-replay.md). |
| **Żomm għall-iffiltrar** | Kolonni addizzjonali miżmuma fil-memorja. | Checkbox għal kull kolonna, u għal kull waħda mmarkata *medda* (numerika) jew *kategorija*. Kull waħda tiswa 4 bytes għal kull ringiela u taqra waħda fit-tagħbija. Il-kolonni miżmuma biss jistgħu jiġu [iffiltrati](filters.md), jintużaw għal [qsim tad-differenza](difference.md) jew bħala kolonna ta' avvenimenti għal [sħana tal-linji](line-heat.md). |
| **Uri ringieli ta' kampjun** | Tabella tal-ewwel 12-il ringiela kampjunata, il-kolonni kollha. | Biex tiċċekkja l-ħsibijiet. |

Kolonna tal-filtru mimlija li ma tkunx imqiegħda b'mod espliċitu tinqara bħala *medda*; kolonna ta' id li tidher numerika ħafna drabi tkun utli iktar bħala *kategorija*. Jistgħu jkunu attivi biss 4 filtri f'daqqa ([Filtri](filters.md)).

## Kif jaħsbu l-ħsibijiet awtomatiċi {#how-the-auto-mapping-guesses}

Il-ħsib isir f'[`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Jara l-ismijiet tal-kolonni, liema kolonni huma numeriċi fir-ringieli kampjunati (iktar minn 90% tal-valuri mhux vojta jinqraw bħala numri), kemm valur differenti tieħu kull kolonna fil-kampjun, u t-tipi loġiċi ta' Parquet. Il-mudelli tal-ismijiet jiġu ppruvati fl-ordni, mingħajr sensittività għall-kaptal, u l-ewwel mudell li jaqbel ma' kwalunkwe kolonna ħielsa jirbaħ.

### Pożizzjoni {#position}

| Assi | Mudelli tal-ismijiet, fl-ordni (kolonni numeriċi biss) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Jekk assi għadu vojt, l-ewwel kolonni numeriċi żejda (billi jitħalla barra `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) jimlewh skont l-ordni. Ħsieb ħażin jidher ovvjament fuq l-iskrin; wieħed vojt iħalli viewport vojta.

### Ħin {#time}

- **L-ewwel kolonni tat-timestamp ta' Parquet.** Fost il-kolonni li t-tip loġiku tagħhom huwa `TIMESTAMP` jew `DATE`, tintgħażel l-aħjar skont punteġġ: +10,000 jekk l-isem jaqbel ma' mudell ta' ħin, -5,000 għal `DATE` sempliċi, kif ukoll l-għadd ta' valuri differenti fil-kampjun. Data ta' ġurnata sħiħa u bidu ta' sessjoni kostanti jieħdu kważi l-ebda valur differenti, għalhekk l-istant tal-avveniment jirbaħ. L-unità tkun imbagħad *Unix timestamp (ms)*.
- **Inkella skont l-isem:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, imbagħad ismijiet ta' ħin li għadda (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). L-unità tinħess imbagħad mill-valuri: ISO-8601 meta valur jidher bħal `YYYY-MM-DDT…` jew `YYYY-MM-DD …`; inkella skont l-ikbar qawwa: fuq 10^17 nanosekondi, fuq 10^14 mikrosekondi, fuq 10^11 millisekondi Unix, fuq 10^8 sekondi Unix, fuq 10^6 millisekondi, inkella sekondi.

Meta tintgħażel kolonna ta' ħin li għadda, il-panew jinnota li kull sessjoni tiġi allinjata mal-bidu tagħha stess - tajba biex tqiegħed partiti fuq xulxin, mhux biex tarhom fis-sekwenza reali.

### Sessjoni, persuna, grupp {#session-person-group}

Is-sessjoni tiġi mitlubha **wara** l-assi tal-ħin u **qabel** il-persuna u l-grupp, għax kolonna ta' sessjoni ħafna drabi hija timestamp (l-istant tal-bidu tal-partita f'kull ringiela tal-partita).

| Rwol | Mudelli tal-ismijiet, fl-ordni |
|---|---|
| Sessjoni | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (kull wieħed eżatt, bil-`_id` opzjonali) |
| Persuna | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, imbagħad `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (dejta tas-sewqan: il-karozza hija dik li timxi) |
| Grupp | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grupp, riżerva | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Kandidat għal grupp li jieħu valur differenti fuq il-biċċa l-kbira tar-ringieli kampjunati (iktar minn max(48, 60% tal-kampjun)) huwa id, mhux grupp: isir il-kolonna tal-persuna jekk ma nstabet ebda waħda, u ma jintużax bħala grupp. Jekk ma jinstab l-ebda kolonna ta' grupp, tintuża l-kolonna mhux numerika bl-inqas valuri differenti bejn 2 u 12.

### Direzzjoni tal-ħarsa {#look-direction}

Kolonna numerika msemmija `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` jew `rot_z` / `rotation_z` tqallib id-direzzjoni tal-ħarsa għal yaw/pitch; il-pitch jinstab bħala `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Jitqies li huma gradi meta xi yaw ikun iktar minn 7 fil-kobor, inkella radianti. Vettur tad-direzzjoni qatt ma jinħess; jiġi mill-hints hawn taħt jew minnek.

### Kolonni tal-filtru {#filter-columns}

Sa **6** kolonni jinżammu awtomatikament, skont il-klassifika:

1. `region`, `sessionMode`, `actor` - kolonni li jeżistu biex jiġu ffiltrati (punteġġ 1200);
2. kolonni ta' kategorija li jvarjaw fil-kampjun, bl-inqas valuri differenti l-ewwel (1000 neqas l-għadd);
3. kolonna kostanti fil-kampjun, imma biss meta jitgħabbew diversi fajls - tista' tvarja bejn fajl u ieħor, bħal reġjun jew id ta' test (600);
4. kolonni numeriċi (500).

Kolonni li diġà jaqdu rwol, l-ismijiet tal-ħoss hawn fuq, kolonni kostanti f'tagħbija ta' fajl wieħed, u kolonni ta' test ħieles (iktar minn max(16, nofs il-kampjun) valuri differenti) ma jiġux offruti awtomatikament. Kull kolonna tista' xorta tiġi mmarkata b'idejk.

### L-assi 'l fuq {#up-axis}

Meta t-tliet assi jkunu mmappjati, l-assi bl-anqas firxa ta' Y u Z fil-kampjun jitqies bħala 'l fuq (il-mappa hija ferm iktar wiesgħa milli hija għolja); inkella jitqies Z 'il fuq.

## Il-hints `heat3d` f'footer ta' Parquet {#the-heat3d-hints-in-a-parquet-footer}

Fajl ta' Parquet jista' jgħid kif għandu jinqara. Jekk id-dejta tal-metadata ta' key/value tal-footer tal-fajl ikollha entry bil-kjave **`heat3d`**, il-valur tagħha jinqara bħala JSON u jitqiegħed fuq il-ħsibijiet ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Il-konvertitur tad-demo ta' CS2 jikteb entry bħal din, għalhekk it-tabelli tiegħu jinfetħu bil-plejer bħala persuna, in-naħa bħala grupp, kull rawnd bħala sessjoni, id-direzzjoni tal-ħarsa mixgħula u d-dinja fl-ordni t-tajba.

Il-**biss** fajl tal-għażla l-ewwel jinqara għall-hints. Kull entry hija mhux obbligatorja, u kull valur suġġerit jibqa' jidher fil-panew u jista' jinbidel. Deskrizzjoni sħiħa tal-iskema, b'eżempju u kif tikteb waħda, hemm fil-[Referenza tal-formati tad-dejta](data-formats.md#the-heat3d-hints).

Ir-regoli, fil-qosor:

- Kolonna msemmija minn hint tiġi applikata biss meta l-fajl ikollu dik il-kolonna.
- `lookMode: "vector"` jaħdem biss meta `dirX`, `dirY` u `dirZ` ikunu kollha mqiegħda; `"yawPitch"` biss meta `yaw` ikun imqiegħed.
- `extra`, meta jkun preżenti, jieħu post il-lista awtomatika tal-filtri (ismijiet mhux magħrufa u kolonni li diġà jaqdu rwol jitneħħew); it-tip tal-medda/kategorija ta' kull wieħed jiddependi jekk kienx jidher numeriku. Meta ma jkunx preżenti, il-lista awtomatika tinżamm, jitneħħa biss kull kolonna li hint tagħtiha rwol.
- `axes.up` irid ikun `"y"` jew `"z"`, il-qlib irid ikun boolean, u `scale` irid ikun pożittiv.
- `entity.size`, meta jkun pożittiv, huwa d-daqs ta' oġġett wieħed traċċat fl-unitajiet tal-fajl ([daqs tal-entità](sessions-persons-groups.md#entity-size)); hija l-unika triq biex tiġi mqiegħda.

## Problema magħrufa: it-tibdil tas-separatur tas-CSV {#known-issue-overriding-the-csv-separator}

Meta tibdel is-separatur għal wieħed differenti minn dak misjub, il-lista tal-kolonni u r-ringieli tal-kampjun ma jinbidlux (il-preview xorta jaqsam bis-separatur misjub). Is-separatur magħżul xorta jintuża għat-tagħbija innifisha. Jekk is-separatur misjub ikun ħażin:

1. Iftaħ il-fajl f'editur tat-test.
2. Ibdel is-separatur b'virgola f'kull fejn (u l-virgoli deċimali b'punti).
3. Ħallix, imbagħad erġa' għabbi l-fajl.

Il-kawża tinsab f'[`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
