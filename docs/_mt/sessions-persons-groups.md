---
title: "Sessjonijiet, persuni u gruppi"
parent: "Kif tidħol id-data"
nav_order: 4
lang: "mt"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sessjonijiet, persuni u gruppi

**Persuna** hija oġġett wieħed li jiċċaqlaq (plejer, karozza). **Tim / grupp** huwa n-naħa li jappartjenu lilha. **Sessjoni** hija partita jew dawra waħda. Ara il-[glossarju](glossary.md).

Ringiela waħda ta' fajl tista' ssemmi t-tlieta:

| x | y | time | player | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` hija l-persuna, `team` hija l-grupp, `match` hija s-sessjoni.

Tliet kolonni fakultattivi jiddeskrivu *min* u *f'liema parti tal-istorja* jappartjeni ringiela. Kull waħda tinkodifika bħala dizzjunarju waqt it-tagħbija: il-valuri tat-test isiru ids interi żgħar għal kull ringiela flimkien ma' lista waħda ta' tikketti, miftehma fuq il-fajls kollha tat-tagħbija.

## Persuna {#person}

Il-kolonna **Id tal-persuna** ssemmi l-oġġett li jiċċaqlaq li jappartjeni lilu ringiela: plejer, bot, karozza. Tinħażen bħala id ta' 32-bit għal kull ringiela.

Bi kolonna ta' persuna u kolonna ta' ħin, it-tagħbija tikkalkula l-**ħajja** ta' kull ringiela: il-ħin sal-kampjun li jmiss tal-istess persuna *fl-istess sessjoni*, jew "none" (valur sentinella, -1) meta ma jkunx hemm kampjun li jmiss - il-persuna mietet, telqet, jew il-log intemm. Il-ħajjiet isaħħu l-istorja **Ħajja** tal-[linja taż-żmien](timeline.md), l-interpolazzjoni u l-istaleness fil-[replay tal-kaxxa](box-replay.md), u l-qsim tar-rotot fis-[sħana tal-linji](line-heat.md). X'jagħmel ringiela bla suċċessur huwa setting tal-view (*Dewmien ta' riżerva*), mhux miktub fid-dejta.

Kull persuna tingħata l-grupp tar-**ewwel** ringiela tagħha fiż-żmien; din l-assenjazzjoni tikkolora l-kaxxa tagħha fir-replay tal-kaxxa u tiddetermina liema grupp jaħbiha bil-buttuna tal-viżibbiltà. Modi tas-sħana jużaw il-grupp ta' kull ringiela minflokhom.

### Ismijiet li jilbsu diversi oġġetti f'daqqa {#names-worn-by-several-things-at-once}

Isem mhux dejjem huwa entità waħda: f'xi esportazzjonijiet kull bot ta' kull partita jidħol taħt isem wieħed. Li tgħaqqad żewġ kampjuni ta' "persuna" bħal din - bl-interpolazzjoni, traċċa jew rotta - tiġbed linja bejn żewġ kreaturi differenti madwar il-mappa.

Waqt it-tagħbija ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) isem jiġi mmarkat **maqsum** meta żewġ rekords tiegħu

- ikunu fl-istess sessjoni,
- ikollhom l-istess ħin,
- ikunu tal-istess tip (kull kolonna ta' kategorija miżmuma għandha l-istess valur), u
- ikunu aktar 'il bogħod minn 1% tad-dijagonali tal-firxa tad-dejta.

Ismijiet maqsumin jinġibdu bħala kampjuni waħedhom - l-ebda interpolazzjoni, l-ebda traċċa, l-ebda rotta ta' sħana tal-linji. Kull ħaġa oħra dwarhom (is-sħana tagħhom) ma tinbidilx. It-taqsima Dataset turi kemm isem ġie mmarkat, bi tliet eżempji sa, u l-panew tar-replay tal-kaxxa jerġa' juri l-għadd.

## Sessjoni {#session}

Il-kolonna **Sessjoni / partita** tgħid liema partita, raid, rawnd, run jew dawra tappartjeni għaliha ringiela. Din hija dik li tagħmel il-kampjuni ta' persuna traċċa kontinwa waħda: telemetrija reali ħafna drabi tħallat partiti kontemporanji, u kampjun ta' plejer ftit qabel il-playhead u dak ftit wara jistgħu jkunu minn partiti differenti mijiet ta' metri 'l bogħod. Bi kolonna ta' sessjoni:

- l-interpolazzjoni, it-traċċi u r-rotot tas-sħana tal-linji qatt ma jaqsmu bidla ta' sessjoni;
- il-ħajja ta' ringiela tispiċċa fi tmiem sessjonijiet tagħha stess;
- l-għażla **Sessjoni** tidher fuq nett fis-sidebar, taħt il-bar tal-modi.

Kolonna ta' sessjoni ħafna drabi hija *timestamp* - l-istant tal-bidu tal-partita, imtenni fuq kull ringiela ta' dik il-partita. L-immappjar awtomatiku jfittex ismijiet ta' sessjoni qabel persuna u grupp għal din ir-raġuni ([Immappjar tal-kolonni](column-mapping.md#session-person-group)). Dawra jew stint tas-sewqan hija sessjoni wkoll: żewġ dawriet mill-istess karozza ma jridux jingħaqdu f'traċċa waħda.

### L-għażla tas-sessjoni {#the-session-picker}

![L-għażla tas-Sessjoni miftuħa fuq fajl ta' għaxar partiti: Sessjonijiet kollha (10), Match 01, Match 02 u l-bqija](../assets/img/en/sessions-persons-groups-picker.webp)

*Għaxar partiti f'fajl wieħed: agħżel waħda jew araħom kollha.*

Turija meta d-dataset ikollu sessjonijiet elenkati (ara l-limitu hawn taħt).

| Parti | Tfisser |
|---|---|
| Tikketta fuq il-lemin | L-għadd ta' ringieli tas-sessjoni magħżula, jew *kollha f'daqqa*. |
| Menu | *Sessjonijiet kollha (N)*, imbagħad kull sessjoni, l-iktar attiva l-ewwel, bħala `label - N rows, span` (il-medda f'sekondi taħt 90 s, f'minuti taħt 90 min, f'sigħat fuq dan). |
| Ħajt kannella | Murija għal *Sessjonijiet kollha*: il-pożizzjonijiet ma jiġux imqabbda bejn sessjonijiet, madankollu partiti kontemporanji jpoġġu flimkien fuq il-mappa plejers mhux relatati. |
| Ħajt | Murija fil-modi tas-sħana meta tkun magħżula sessjoni waħda: l-għażla tmexxi biss il-playhead għall-bidu tas-sessjoni. |

Fit-tagħbija tintgħażel l-aktar sessjoni attiva. Meta tagħżel sessjoni, il-playhead imur għall-bidu tagħha.

X'jibdel l-għażla:

- Fil-**[replay tal-kaxxa](box-replay.md)** tiddetermina liema sessjoni titlaqqa': biss il-kaxxi u t-traċċi ta' dik is-sessjoni jinġibdu, u l-firxa tal-linja taż-żmien issir il-medda tas-sessjoni nnifisha.
- Fil-**modi tas-sħana** ma tillimitax is-sħana, u ħajt taħt l-għażla jgħid hekk: *Fil-modi tas-sħana dan biss iqiegħed il-playhead fil-bidu tas-sessjoni; is-sħana xorta tgħodd kull sessjoni. Ir-replay tal-kaxxa jitlaqqa' s-sessjoni magħżula waħedha.* Biex tillimita s-sħana għal sessjoni waħda, żomm ukoll il-kolonna tas-sessjoni bħala kolonna tal-filtru (*Żomm għall-iffiltrar*) u iffiltra fuqha. Kolonna tista' tkun kemm kolonna tas-sessjoni kif ukoll kolonna tal-filtru: it-tagħbija taqra kull kolonna tal-filtru mimlija waħedha, kull ma jkun ir-rwol li jkollha wkoll.

### Bosta sessjonijiet {#too-many-sessions}

Sa **100,000** sessjoni jitelenkaw. Iktar minn hekk il-kolonna hija tassew id (folder b'miljuni ta' sessjonijiet ta' ftit ringieli għal kull wieħed), u jibgħat dak l-għadd ta' tikketti mill-worker għall-paġna huwa dak li jdawwar it-tab għall-memorja. It-tagħbija mbagħad iżomm l-**id**i tas-sessjoni - għalhekk il-fruntieri xorta jiġu infurzati kullimkien - imma titfa' t-tikketti u l-għażla, u l-panew tad-Dataset jgħid dan.

## Grupp {#group}

Il-kolonna **Tim / grupp** hija kull kolonna b'ftit valuri differenti: tim, naħa, squad, fazzjoni, bandiera plejer-kontra-AI, klassi ta' karozza. Tinħażen bħala id ta' 16-il bit għal kull ringiela, u tmexxi:

- il-[Lista tat-timijiet](teams-list.md) (viżibbiltà għal kull grupp, + / − għan-naħat),
- [is-sħana tat-tim](team-heat.md) (tonalità għal kull grupp),
- il-[qsim tad-differenza](difference.md) skont il-grupp,
- il-kuluri tal-kaxxi fir-[replay tal-kaxxa](box-replay.md) (familja ta' tonalità għal kull grupp, tonalità għal kull membru).

### Limiti {#limits}

Sa **4,096** grupp differenti. L-id tal-grupp jgħaddi fil-kanal ir-raba' tal-texel tal-pożizzjoni ta' kull ringiela fuq il-GPU, u kull grupp jeħtieġ texel fit-tabella tas-sinjali ta' 4,096-wiesgħa li l-shader jaqra biex jiddeċiedi *moħbi*, *miżjud* jew *imnaqqas*. Kolonna b'iktar valuri differenti hija id, mhux grupp: **it-tagħbija iżomm kull ringiela u titfa' biss il-qsim fil-gruppi**, b'twissija fuq id-dataset li tissuġġerixxi li timmappjaha minflok bħala kolonna tal-persuna, jew iżżommha bħala kolonna tal-filtru.

L-istess limitu ta' 4,096 japplika għal kolonna tal-filtru ta' *kategorija* miżmuma; kolonna iktar wiesgħa ma tinżammx u d-dataset jgħid dan. Kolonna numerika (timestamp, pereżempju) m'għandha ebda limitu bħal dan bħala filtru ta' *medda*.

Il-valuri tal-grupp `0`, valur vojt, `none`, `unknown`, `null` u `-1` (mingħajr sensittività għall-kaptal) ifissru "l-ebda grupp" għas-[sħana tat-tim](team-heat.md), li jpinġihom bl-griż newtrali minflok bħala kulur ta' fiduċja.

## Daqs tal-entità {#entity-size}

Kemm hija kbira oġġett wieħed traċċat - kaxxa ta' kolližjoni ta' plejer, karozza - jiddetermina kemm huma kbar il-kaxxi u l-vleġġi tal-ħarsa tar-[replay tal-kaxxa](box-replay.md). Ma hemm l-ebda qasam għalih fil-panew; ġej mill-[hints `heat3d`](data-formats.md#the-heat3d-hints) tal-fajl (`entity.size`, fl-unitajiet tal-fajl innifsu; il-konvertitur tas-CS2 jikteb 32). It-tagħbija timmultiplikaha bl-iskala tal-unità.

Fuq kull tagħbija ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), bl-*estensjoni* l-ikbar mill-firxa X u Z tad-dejta:

| Setting | B'daqs ta' entità | Mingħajru |
|---|---|---|
| Daqs tal-kubu | daqs tal-entità | estensjoni / 500 |
| Tul tal-vleġġa tal-ħarsa | daqs tal-entità × 4 | estensjoni / 200 |
| Raġġ tal-isprite | estensjoni / 120 | estensjoni / 120 |
| Punt tas-saturazzjoni | stima analitika (imbagħad imkejla) | l-istess |
| Veloċità tat-tlugħ | estensjoni / 12 | l-istess |
| Pjan lil hinn | estensjoni × 12 | l-istess |
| Pjan qrib | max(0.05, estensjoni / 20,000) | l-istess |

## Il-panew Dataset {#the-dataset-panel}

Taħt il-panew tas-Sors. Meta jkun mgħobbi dataset juri:

- l-**isem** tad-dataset - l-għażla, l-għadd tar-ringieli, l-għadd tal-fajls, il-pass meta kien wieħed;
- **`N timijiet · N persuni · Ns medda`**;
- kull **twissija** li t-tagħbija ħalqet, bil-kannella, sakemm id-dataset ikun mgħobbi: gruppi jew kolonna ta' filtru mitfija għal valuri wisq, sessjonijiet mhux elenkati, ismijiet maqsumin, ringieli nieqsa, fajls mitfija;
- il-[ġeneratur sintetiku](synthetic-generator.md);
- **Neħħi**, li jneħħi d-dataset.

L-għadd tar-ringieli jidher fl-intestatura tal-panew.
