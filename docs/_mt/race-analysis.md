---
title: "Analiżi tat-tellieqa"
nav_order: 11
has_children: true
lang: "mt"
source: "race-analysis.md"
source_hash: "ab0531fa7bbd"
translated: true
outdated: false
---

# Analiżi tat-tellieqa

Int sewwaq l-istess traċċa darbtejn. It-tab **Analiżi tat-tellieqa** iħaddem iż-żewġ sewqiet flimkien fi 3D, juri fejn dawra waħda kienet aktar bil-mod u jgħidlek għalfejn. Ma għandekx dawriet għadu? Agħfas **Dawriet demo**.

![It-tab Analiżi tat-tellieqa b'dawriet demo: is-sidebar bid-Dawriet u Fejn titjieb, il-karozzi fuq il-korsa, il-grafiċi taħt il-view](../assets/img/mt/race-analysis-overview.webp)

It-tab iqabbel żewġ dawriet jew aktar ta' korsa waħda. Jaqsam il-kanvas, il-kamera u l-mudell tal-korsa mgħobbi (**Sfond / livell**) mal-heatmap; kollox l-ieħor huwa tiegħu: is-sidebar tiegħu u l-barra tiegħu taħt il-view. Kliem bħal *dawra*, *referenza* u *apex* jinsabu fil-[glossarju](glossary.md).

Din il-paġna hija l-mappa tat-tab. Kull parti għandha l-paġna tagħha:

| Paġna | X'tkopri |
|---|---|
| [Tagħbija tad-dawriet](race-loading-laps.md) | kull format ta' fajl, folders u korsi, ismijiet tal-karozzi, dawriet demo, il-lista tad-dawriet, ir-referenza u l-fokus |
| [Replay u x-xena 3D](race-replay-and-scene.md) | il-bar tat-transport, it-tlett modi tar-replay, l-allinjament tal-karozzi, il-kamera tal-inseguiment, linji, mappi, karozzi, tikketti, dinjiet imqallba |
| [Grafiċi u l-HUD](race-charts-and-hud.md) | il-grafiċi tad-distanza, l-għażla tal-grafiċi, hover u zoom, il-karti tal-karozzi, it-tabella tal-kanali |
| [Avvenimenti tal-kontroll tal-karozza](race-control-events.md) | lock-ups, wheelspin, oversteer, spins, understeer, daqqiet, inkidenti, ABS/TC, handbrake, l-ajru - kif jinstab kull wieħed, b'kull limitu |
| [Analiżi kantunata b'kantunata](race-corner-analysis.md) | l-allinjament skont id-distanza, kurvi u segmenti, il-kont tal-ħin ta' kurva, kull kawża u l-ordni li jiġu ppruvati fiha, il-forma tal-linja u l-parir |
| [Profili tal-karozzi u tqabbil](race-car-profiles.md) | x'jista' jagħmel kull karozza, imkejla mid-dawriet tagħha; *Il-karozzi mqabbla*; x'tiddeċiedi l-karozza f'kull kurva |
| [Statistika tal-korsa](race-course-statistics.md) | ħafna dawriet ta' korsa waħda: żbalji għal kull kurva u għal kull tip, il-mappa taż-żbalji, l-esportazzjoni għall-heatmap, limiti tal-prestazzjoni |
| [Analitika tat-tellieqa: il-metodu](race-analytics.md) | ir-riċerka wara r-regoli, bis-sorsi |
| [Logħob ieħor tat-tellieqa](other-games.md) | x'jagħmel il-viewer b'dawriet minn kull logħba: slip u drift maħduma fejn logħba ma tibgħathomx, dinjiet imqallba, il-kanali addizzjonali |

## L-iskrin {#the-screen}

**Sidebar**, minn fuq 'l isfel (is-taqsimiet jistgħu jingħalqu):

1. **Dawriet** - tgħabba, tilista, turi/taħbi, referenza, fokus, inseguiment.
   Ara [Tagħbija tad-dawriet](race-loading-laps.md).
2. **Statistika tal-korsa** - biss minn tliet dawriet mgħobbija 'l fuq.
   Ara [Statistika tal-korsa](race-course-statistics.md).
3. **Fejn titjieb** - is-sejbiet tad-dawra fokussata, kurva b'kurva.
   Ara [Analiżi kantunata b'kantunata](race-corner-analysis.md).
4. **Kurva b'kurva** (jew *Kurva b'kurva - klassi X* meta jkunu diversi klassijiet) - l-iktar dawra mgħaġġla minn kull kurva u l-linja tagħha. Jidher b'żewġ dawriet jew aktar.
5. **Kontroll tal-karozza** - il-locks, is-slides, il-push u l-daqqiet tad-dawra fokussata.
   Ara [Avvenimenti tal-kontroll tal-karozza](race-control-events.md).
6. **Il-karozzi mqabbla** (jew **Il-karozza** b'karozza waħda) - ara
   [Profili tal-karozzi u tqabbil](race-car-profiles.md).
7. **Veduta** - liema mappa titpinġa fuq il-korsa u x'jinġibed.
   Ara [Replay u x-xena 3D](race-replay-and-scene.md).
8. Il-panels komuni **Livell** u **Kamera u xena** (mudell tal-korsa, qlib tal-assi, kamera) - iddokumentati mas-sħana u [Kamera](camera.md).

**Il-view** juri l-korsa, il-linji mixjuta, il-mappa, il-karozzi, tikketti marbuta mal-korsa, u sa sitt karti tal-karozzi fin-naħa ta' fuq xellug (ara [Grafiċi u l-HUD](race-charts-and-hud.md)). Mingħajr dawriet mgħobbija jgħid "Ebda dawra mgħobbija - itfa' tnejn jew aktar fajls tad-dawra hawn, jew tella' d-dawriet demo mis-sidebar."

**Il-bar taħt il-view** fih it-transport tar-replay u, sakemm ma jkunx moħbi, il-grafiċi tad-distanza.

## Bidu rapid {#quick-start}

1. Iftaħ it-tab **Analiżi tat-tellieqa** (ħdejn **Heatmap** fuq nett fis-sidebar).
2. Ħudlu dawriet. Agħfas **Dawriet demo** biex tara x'jagħmel it-tab b'tliet dawriet magħmula. Għal dawriet tiegħek, irrekordjahom l-ewwel ([formats tal-fajls u rekordaturi](race-loading-laps.md#file-formats)), imbagħad agħfas **Iftaħ fajls tad-dawriet…** jew **Folder…**, jew itfa' fajls jew folders fuq il-view.
3. L-iktar dawra sħiħa mgħaġġla issir ir-referenza; l-iktar dawra oħra bil-mod tiġi fokussata. Ikklikkja kwalunkwe dawra fil-lista biex tiffokussaha; ★ tagħmel dawra referenza.
4. Aqra **Fejn titjieb**. Ikklikkja sejba: il-karozzi jiġu allinjati 40 m qabel, il-kamera tiffrejmjaha, ir-replay jgħaddi minnha u l-kejliet jinfetħu.
5. Agħmel hover fuq il-grafiċi biex tmexxi kull karozza għal dak il-metru; Shift+klikk biex tallinjahom hemm.

## Ċwievet {#keyboard}

Waqt li t-tab tat-Tellieqa jkun miftuħ:

| Ċavetta | Jagħmel |
|---|---|
| **K** | jilgħab / jieqaf ir-replay |
| **Home** | lura għall-bidu tar-replay |
| ċwievet tan-numri | xejn (fis-sħana jibdlu l-modi) |

Ċwievet miktuba f'kaxxa tat-test jew f'drop-down jiġu injorati. Iċ-ċwievet tal-kamera jaħdmu kif fis-sħana (**W A S D**, **Space** 'il fuq, **Q** 'l isfel, **Shift** iktar mgħaġġel, **Alt** iktar bil-mod, il-maws biex tħares; kollox f'[Kamera](camera.md)); **F** jiffrejmja d-dawriet mgħobbija (kif jagħmel it-tagħbija tad-dawriet).

## Ħafna dawriet {#many-laps}

- Id-dawriet kollha mgħobbija jiġu analizzati u mgħoddija; għexieren jieħdu sekonda jew tnejn.
- Wara **8** dawriet (`SHOW_ALL_UP_TO`), id-dawriet miżjuda jinġibdu biss meta jkunu r-referenza, id-dawra fokussata, jew l-aħjar dawra tal-klassi tad-dawra fokussata. *Uri kollox* / *Dawk li qed tħares lejhom biss* jibdlu dan.
- Wara **10** karozzi viżibbli (`PLAIN_PAST`), id-dawriet li mhux qed tħares lejhom (mhux il-fokus, il-karozza segwita jew ir-referenza) jinġibdu b'linji mnaqqsa għal punt kull 6 m minflok 1.5 m, u karozzi sempliċi.
- Il-grafiċi jpinġu sa **8** dawriet; il-HUD juri sa **6** karti.
- L-istatistika tal-korsa tidher minn **3** dawriet.

Dettalji: [Statistika tal-korsa](race-course-statistics.md#performance-with-many-laps).

## Settings default tal-view {#default-view-settings}

| Setting | Default |
|---|---|
| Mappa | Mappa taż-żmien |
| Linji mixjuta, Karozzi, Tajers u sospensjoni, Tikketti, Traċċa mid-dawriet | mixgħul |
| Il-valuri kollha fuq il-karti | mitfi |
| Daqs tal-karozza | 1× |
| Grafiċi | murija |
| Mod tar-replay | Mil-linja |
| Veloċità tar-replay | 1× |
| Loop | mixgħul |

Ebda wieħed minn dawn ma jinħażen; reload jibda mid-default. Dak li jinftakar fil-browser: il-lingwa, u l-ismijiet tal-karozzi mitgħallma mill-fajls tad-dawriet (ara [Tagħbija tad-dawriet](race-loading-laps.md#car-names)).

## Għall-iżviluppaturi {#for-developers}

### X'jiġri meta jitgħabbew dawriet {#what-happens-when-laps-are-loaded}

Kull darba li jinbidel is-sett tad-dawriet, ir-referenza jew il-lingwa, l-analiżi kollha ssir mill-ġdid (`analyse` f'
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Kanali derivati jiżdiedu għal kull dawra fejn il-logħba ma tibgħathomx: angolu tad-drift, slip tar-roti mill-veloċitajiet tar-roti, fl-ajru, art mhux iffissata, rata tal-yaw ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Tintgħażel ir-referenza u kull dawra titproġetta fuq it-traċċa tagħha u terġa' tiġi kampjunata kull 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Jinstab jekk id-dinja tal-logħba tkunx imqallba mid-dawriet ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Il-kurvi jinstabu fuq ir-referenza, u jingemgħu f'segmenti minn żona ta' brejk waħda sal-oħra ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Għal kull karozza: l-envelope tagħha (grip, brejk, ġbid skont il-veloċità), il-profil tagħha, il-kurvi tat-tajers tagħha ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Għal kull dawra u segment: x'għamlet (il-punt tal-brejk, il-punt l-aktar bil-mod, gass sħiħ, ...) u l-linja li ħadet ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Għal kull dawra: l-avvenimenti tal-kontroll tal-karozza tagħha, kull wieħed imqabbel mad-dawra li tiġi mqabbla magħha f'dak il-post.
8. Għal kull dawra u segment: il-kont tal-ħin kontra d-dawra tat-tqabbil tagħha u s-sejba bil-kliem.
9. Il-mappa taż-żmien u l-mappa tal-kawża għal kull dawra.

It-testi jiġu prodotti bil-lingwa attwali; jekk tinbidel il-lingwa l-analiżi titmexxa mill-ġdid (u d-dawriet demo jisimhom mill-ġdid). Falliment fl-analiżi jidher taħt il-buttuni **Dawriet** bħala żball u d-dawriet jibqgħu mgħobbija.

### Fajls tas-sors {#source-files}

| Fajl | Rwol |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | qari tal-fajls tad-dawriet |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | it-tip tad-dawra, l-ismijiet, id-dawriet demo |
| `src/race/derive.ts`, `handedness.ts` | kanali derivati, dinjiet imqallba |
| `src/race/align.ts`, `segments.ts`, `line.ts` | assi tad-distanza, kurvi, linji |
| `src/race/analysis.ts` | kurvi mqabbla, kawżi, sejbiet |
| `src/race/envelope.ts`, `profile.ts` | x'jista' jagħmel karozza |
| `src/race/control.ts`, `impacts.ts` | kontroll tal-karozza, daqqiet u inkidenti |
| `src/race/stats.ts` | ħafna dawriet |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | replay u tpinġija |
| `src/race/schema.ts`, `graphs.ts` | it-tabella tal-kanali, ringieli tal-grafiċi |
| `src/ui/race/*` | is-sidebar, il-grafiċi, il-HUD, it-tikketti |
| `src/state/raceStore.ts` | l-istat tat-tab u l-arloġġ tar-replay |
