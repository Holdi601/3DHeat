---
title: "Linja taż-żmien u l-playback"
nav_order: 5
lang: "mt"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Linja taż-żmien u l-playback

Il-bar taħt ir-ritratt hu bħal player tal-vidjo: tista' tħaddem id-data bħala film, twaqqafha, timxi minn post għall-ieħor u tbiddel il-veloċità.

![Il-bar tal-linja taż-żmien: 1 Kollox/Ħaddem, 2 buttuni tal-kontroll, 3 arloġġ, 4 Veloċità, 5 Storja, b'Tieqa u Medda ta' 30 s](../assets/img/en/timeline-bar.webp)

Il-bar taħt il-veduta hu l-linja taż-żmien ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Hu jiddeċiedi liema ringieli huma viżibbli f'kull mument. Teħtieġ kolonna ta' ħin; mingħajrha l-bar kollu jitfi, il-veduta tibqa' fuq **Kollox**, u s-sidebar jgħid *Ma hemm l-ebda kolonna ta' ħin f'din id-data - il-linja taż-żmien hija mitfija u kull punt tad-data jintwera f'daqqa.*

## Kollox u Ħaddem {#all-and-play}

Żewġ modalitajiet ewlenin, għax iwieġbu mistoqsijiet differenti.

- **Kollox** (il-bażi f'kull tagħbija) tinjora l-playhead għal kollox u turi kull ringiela li tgħaddi mill-filtri. Hija l-veduta "fejn ġara dan", u mhijiex l-istess bħal li tmur fl-aħħar. L-iskrubber hu mitfi u l-arloġġ jaqra `kollox · <span> tad-data`.
- **Ħaddem** tmexxi d-data bħala timelapse. L-iskrubber, il-kontrolli tat-trasport u s-settings tal-istorja jidhru.

Jekk tagħżel **Kollox** il-playback jieqaf ukoll.

## Il-kontrolli {#the-controls}

| Kontroll | Bażi | Tifsira |
|---|---|---|
| Skrubber | il-bidu | Il-playhead. Iġbed biex timxi; 20,000 pass tul il-medda. |
| **Kollox** / **Ħaddem** | Kollox | Ara hawn fuq. |
| ▶ / ❚❚ | mwaqqaf | Iħaddem jew iwaqqaf; ukoll `K`. |
| ◀ **Ħaddem lura (J)** | | Iħaddem id-data bil-maqlub. Juri biss fil-modalità **Figuri fuq xulxin**; iċ-ċavetta `J` taħdem hemm ukoll (ara [Ċavetta](#keyboard)). |
| ⏮ | | Lura għall-bidu tal-medda. |
| Arloġġ | | `elapsed / total` bħala `mm:ss.s` (jew `h:mm:ss`), u, meta l-kolonna tal-ħin tkun timestamp assolut, il-ħin tal-ħajt tal-playhead bħala `HH:MM:SSZ` (UTC). |
| **Veloċità** | 1× | Sekondi tad-dataset għal kull sekonda reali. Il-menu għandu 17-il pass minn 0.01× sa 1800× (0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), u **Personalizzata…**: ikteb kwalunkwe veloċità minn 0.001× sa 3600× (pereżempju 0.3 jew 12) u agħfas Enter; Esc iżomm il-veloċità attwali. L-aħħar veloċità tinftakar għall-volta li jmiss (ara [Settings maħżuna](ref-settings-storage.md)). |
| **Storja** | Kumulattiva | Dak li jitqies viżibbli fil-playhead: *Kumulattiva*, *Tieqa* jew *Ħajja* (aktar 'l isfel). |
| **Medda** (Tieqa; fil-modalità Linji wkoll Ħajja) | 30 s | Tul it-tieqa li tispiċċa fil-playhead; mill-inqas 0.01 s. Fil-[Sħana tal-linji](line-heat.md#playback) hija t-tul tad-denb. |
| **Ħajja ta' riżerva** (Ħajja biss, mhux fil-modalità Linji) | 10 s | Kemm żmien punt tad-data mingħajr kampjun li jmiss tal-persuna tiegħu jibqa' viżibbli. |
| **Sfumar** (Ħajja biss, mhux fil-modalità Linji) | 0.4 | Frazzjoni tal-ħajja ta' kull punt tad-data li tintefa bil-mod, 0-1. |
| **Ripetizzjoni** | fuq | Fl-aħħar terġa' tibda mill-bidu; mitfija tieqaf fl-aħħar. |
| Naħa tal-lemin | | L-isem tad-dataset. |

Il-**medda** hija l-medda taż-żmien tad-dataset - jew, fil-[Figuri fuq xulxin](box-replay.md) b'sessjoni magħżula, il-medda ta' dik is-sessjoni.

## Storja {#history}

Fil-modalità Ħaddem:

- **Kumulattiva** - kollox mill-bidu tal-medda sal-playhead. Is-sħana tikber waqt li tkun qed tiġi mħaddma.
- **Tieqa** - medda fissa ta' storja li tispiċċa fil-playhead (*Medda*).
- **Ħajja** - kull punt tad-data jgħix sa **l-kampjun li jmiss tal-istess persuna** (fl-istess sessjoni), għalhekk eżattament pożizzjoni waħda għal kull persuna hija attwali f'kull mument. Punt tad-data li l-persuna tiegħu qatt ma terġa' tidher - mewta, skonnessjoni, it-tmiem tal-log - m'għandux kampjun li jmiss, u jgħix għall-*Ħajja ta' riżerva* minflok ma jisparixxi minnufih jew jibqa' għal dejjem. Il-punti tad-data **jisfumaw** fl-aħħar frazzjoni *Sfumar* tal-ħajja tagħhom minflok ma jitfgħu bil-ħeffa: b'kampjun wieħed ħaj għal kull persuna, punt li jisparixxi bejn frame u ieħor jagħmel il-qasam kollu jiddgħdaq bir-rata tal-kampjuni. *Sfumar* 0 jerġa' jagħti t-tqattigħ bil-ħeffa.

Ħajja teħtieġ kolonna ta' persuna kif ukoll kolonna ta' ħin; mingħajrha l-istorja tirtira għal Kumulattiva meta titħabbar. Fil-[Sħana tal-linji](line-heat.md#playback) l-istorja tiddetermina kemm jibqa' viżibbli d-denb ta' triq; fil-[Figuri fuq xulxin](box-replay.md) il-*Ħajja ta' riżerva* hija kemm tinżamm persuna mingħajr kampjuni oħra.

## Imġieba tal-playback {#playback-behaviour}

Mill-loop tal-frame ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- Il-playhead jitqaddem bi *ħin tal-frame × veloċità*. Il-ħin tal-frame jiġi mqabbad għal 0.1 s, sabiex it-tibdil ta' tab ma jqaffazx il-playhead.
- Meta tagħfas Ħaddem fl-aħħar eżatt tal-medda, jibda mill-bidu, bħal media player. F'kull tagħbija l-playhead jitpoġġa fil-bidu, għalhekk l-ewwel pressjoni ta' Ħaddem tħaddem.
- Fl-aħħar tal-medda l-playhead jirritorna għall-bidu (Ripetizzjoni fuq) jew jieqaf hemm u l-playback jintemm (Ripetizzjoni mitfija).
- L-iskrubber jaqra l-playhead tal-magna direttament f'kull frame; l-istat tal-applikazzjoni jiġi aġġornat fuq it-tfittxija, il-bidu, it-twaqqif u l-lupep.
- Jekk tagħżel sessjoni fil-għażla tas-sessjoni, tfittex il-bidu ta' dik is-sessjoni.

## Għaliex il-playback hu lixx, u irħis {#why-playback-is-smooth-and-cheap}

Ringieli huma maħżuna ordnati skont il-ħin, għalhekk tieqa taż-żmien hija żewġ tfittxijiet binarji fuq il-kolonna tal-ħin: it-tqaddim tal-playhead iċaqlaq żewġ interi u ma jmissx ringiela, u l-ispiża tal-playback tiddependi fuq l-għadd ta' ringieli fit-tieqa, mhux fuq id-daqs tad-dataset.

Kif tinżamm is-sħana stabbli waqt li t-tieqa tiċċaqlaq jiddependi fuq l-istorja ([Akkumulazzjoni](accumulation.md)):

- **Kumulattiva** dejjem tikber biss, għalhekk kull frame jiżid biss dawk il-ringieli li saru viżibbli mill-aħħar wieħed, bil-piż sħiħ. Il-qasam jinbena b'mod monotoniku u l-waqfien ma jbiddel xejn, għax ma jibqa' xejn li jasal. (Li terġa' tistma kieku tagħmel kull frame jiddi fuq sett differenti każwali u mbagħad jitfih, u dan jidher bħal splużjonijiet li jixegħlu u jisparixxu.)
- **Tieqa** u **Ħajja** verament jinbidlu kull frame, u jiġu mistmija mill-ġdid, imħallta bħala medja mobbli esponenzjali (piż 0.34 għall-frame l-ġdid), li hi mingħajr preġudizzju f'ekwilibriju u ferm iktar kwieta mill-bidu mill-ġdid.
- Fil-modalità Ħajja, ir-ringieli kandidati huma dawk minn *playhead - massimu(l-itwal vojt fid-data, Ħajja ta' riżerva)* sal-playhead; l-shader imbagħad jitfi kull ringiela li l-ħajja tagħha spiċċat u japplika l-isfumar.

Jekk tbiddel bejn Kollox u Ħaddem, jew tbiddel l-istorja, l-akkumulazzjoni terġa' tibda.

## Ċavetti {#keyboard}

| Ċavetta | Effett |
|---|---|
| `K` | Ħaddem / waqqaf |
| `J` | Ħaddem lura; jekk terġa' tagħfasha tieqaf (Figuri fuq xulxin biss) |
| `L` | Ħaddem 'il quddiem; jekk terġa' tagħfasha tieqaf (Figuri fuq xulxin biss) |

`J` u `L` iqallbu wkoll il-linja taż-żmien għal **Ħaddem**. Iċ-ċwievet jiġu injorati meta kaxxa tal-kitba jew menu jkun attiv. Fit-tab Analiżi tat-tellieqa `K` iħaddem ir-replay ta' dak it-tab stess minflok.
