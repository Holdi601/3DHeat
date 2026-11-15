---
title: "Statistiċi tat-traċċa"
parent: "Analiżi tat-tellieqa"
nav_order: 57
lang: "mt"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Statistika tal-korsa

Għabbi ħafna dawriet ta' korsa waħda u l-viewer jgħodd iż-żbalji: liema kurva tiswa l-aktar ħin, kemm mid-dawriet marru ħażin hemm, u għalfejn. Uża din biex issib il-kurva li tiswa l-prattika.

Ipprova: **Dawriet demo** jagħtik tlett dawriet, biżżejjed biex din it-taqsima tidher.

![Statistika tal-korsa bil-mappa taż-żbalji: it-traċċa miżbugħa skont kemm dawriet tilef ħin f'kull kurva, u l-lista tal-kurvi](../assets/img/en/race-course-mistake-map.webp)

Għabbi l-folder sħiħ ta' korsa - għexieren ta' dawriet, diversi karozzi, diversi klassijiet ta' prestazzjoni - u kull dawra titqies, imbagħad tiġi mgħoddija. Din il-paġna tkopri t-tqabbil skont il-klassi, x'jitqies bħala żball, it-taqsima **Statistika tal-korsa**, il-mappa taż-żbalji, l-esportazzjoni għall-heatmap, korsi minn diversi traċċi, u l-limiti tal-prestazzjoni b'ħafna dawriet.

## Kontra l-aħjar tal-klassi tagħha {#against-the-best-of-its-own-class}

Dawra titqabbel kurva b'kurva mal-**aħjar dawra kompluta tal-klassi tagħha** (ir-referenza, fil-klassi tar-referenza); dik id-dawra nnifisha mal-aktar mgħaġġel tal-klassi tagħha f'kull kurva, jew ma' kull dawra kważi meta tkun waħedha fil-klassi tagħha. Il-karozzi jinġabru skont il-klassi ta' prestazzjoni tal-logħba (f'Forza, D sa X; C u S2 huma tnejn minnhom). Il-punt tal-brejk ta' karozza tal-klassi C meta mqabbel ma' waħda tal-klassi S2 ma jgħid xejn dwar is-sewqan. Il-mappa tal-ħin, id-differenzi fil-lista tad-dawriet u t-tabella *Kurva b'kurva* isegwu l-istess tqabbil (ara [min qed titqabbel kull dawra miegħu](race-corner-analysis.md#who-each-lap-is-compared-with)).

L-istatistika tinbena fuq l-analiżi ta' kull dawra, mhux ħdejha.

## X'jitqies bħala żball {#what-counts-as-a-mistake}

**Okkorrenza** hija żball ta' dawra waħda f'kurva waħda (segment). Iż-żbalji ta' dawra f'kurva huma:

1. **Il-kawża ta' sewqan** li l-analiżi sabet għat-telf tagħha hemm - sejba li hija telf, imputata lis-sewwieq (mhux lill-karozza jew is-sitwazzjoni), li tiswa **0.05 s** jew aktar meta mqabbla mad-dawra tat-tqabbil tagħha. Il-kost tagħha huwa t-telf tal-kurva.
2. **Kull żball ta' kontroll tal-karozza** li għamlet hemm u li d-dawra l-oħra ma għamlitx (mhux maqsum), li iniġġes **0.03 s** jew aktar - lock, wheelspin, ir-raħa titkaxkar, push, spin. Il-kost tiegħu hu tal-avveniment innifsu.
3. **Kull daqqa u kull inkwiet**, maqsum jew le, kemm ikun iniġġes.

Kurva waħda tista' tinkludi diversi; kull tip jitgħodd **darba għal kull dawra u kurva**. Il-gwadanji, is-sehem tal-karozza u wasla iktar bil-mod li ġiet iddeċiża fil-kurva ta' qabel mhumiex żbalji.

### Mis-sejbiet għaż-żbalji {#from-findings-to-mistakes}

| Sejba | Żball |
|---|---|
| iktar mgħaġġel fl-idħol, bil-mod fil-ħruġ, minn brejk iktar minn ftit metri tard mill-oħra | Ibbrejkjat tard wisq |
| bbrejkjat bikri | Ibbrejkjat bikri wisq |
| bbrejkjat bil-mod | Ibbrejkjat bil-mod wisq |
| lock bħala l-kawża | Ikkloka roti |
| ħalla l-gass | Ħalla l-gass |
| grip mhux użat, iktar bil-mod sal-apex, bbrejkjat fejn l-oħra ħalliet biss | Iktar bil-mod f'nofs il-kurva |
| linja iktar stretta milli għandha tkun | Linja tro stretta |
| ġie spinta barra | Ġie spint barra |
| dar il-karozza inqas / iktar milli għandha | Dar il-karozza ħażin |
| fuq il-power iktar tard, gass sħiħ iktar tard, dubbjuż | Gass tard |
| iktar bil-mod meta joħroġ mill-kurva | Iktar bil-mod meta joħroġ |
| wheelspin | Wheelspin |
| ir-raħa titkaxkar, ilaterali f'nofs il-kurva | Ir-raħa tkaxkret |
| telaq barra mit-triq | Telaq barra mit-triq |
| kixxa l-veloċità | Kixxa l-veloċità |
| ħalla l-gass (fuq id-dħul, jew fuq it-tul) | Ħalla l-gass |
| ftit qabel ma waqaf, spin, daqqa jew inkwiet bħala l-kawża | Dar / Laqat xi ħaġa / Tkisser meta l-avvenimenti tad-dawra hemm juru liema (l-ewwel tkisser, imbagħad spin, imbagħad daqqa); inkella Kważi waqaf |
| titlajja' 'il bogħod | Tajjar wisq |

Iż-żewġ mudelli jitgħodd bħala l-kawża misjuba ġewwa tagħhom, bl-istess tabella. *Ta iktar fl-idħol milli rabbiet il-ħruġ* huwa żball tal-kawża tad-dħul tiegħu: brejk bikri huwa *Ibbrejkjat bikri wisq*, lock *Ikkloka roti*, il-kwiet *Ħalla l-gass*, grip mhux użat *Iktar bil-mod f'nofs il-kurva*. *Iktar mgħaġġel fl-idħol, bil-mod fil-ħruġ* huwa *Ibbrejkjat tard wisq* meta d-dawra bbrejkjat iktar tard mill-oħra; inkella l-iżball tal-kawża tal-ħruġ tiegħu - *Gass tard*, *Wheelspin*, *Ir-raħa tkaxkret*, *Telaq barra mit-triq*, *Iktar bil-mod meta joħroġ*. Mudell li l-kawża tiegħu hija tal-karozza, jew wasla iktar bil-mod, ma jitgħoddx.

Mhux imgħoddin: wasla iktar bil-mod, il-bidu, kull sejba ta' *karozza* (pull, grip, brejkijiet, drive) u kull kurva ta' gwadan jew livell.

### It-tipi, fl-ordni tagħhom {#the-kinds-in-their-order}

Brejkjar: *Ibbrejkjat tard wisq*, *Ibbrejkjat bikri wisq*, *Ibbrejkjat bil-mod wisq*, *Ikkloka roti*. Dħul: *Ħalla l-gass*, *Iktar bil-mod f'nofs il-kurva*, *Linja tro stretta*, *Ġie spint barra*, *Dar il-karozza ħażin*. Ħruġ: *Gass tard*, *Iktar bil-mod meta joħroġ*, *Wheelspin*, *Ir-raħa tkaxkret*, *Telaq barra mit-triq*, *Kixxa l-veloċità*. Dritt: *Ħalla l-gass*. Inċidenti: *Dar*, *Laqat xi ħaġa*, *Tkisser*, *Kważi waqaf*, *Tajjar wisq*.

## It-taqsima Statistika tal-korsa {#the-course-statistics-section}

Tidher minn **3** dawriet 'il fuq, bejn **Dawriet** u **Fejn titjieb**.

- **Is-sommarju**: "40 dawriet f'9 karozzi, 3 klassijiet: kull kurva mqabbla mal-aktar dawra mgħaġġla tal-klassi tagħha." (il-karozzi jingħeddu bin-numru tal-karozza, jew bl-isem).
- **Biċċiet tal-klassi** (meta hemm diversi klassijiet): **Kollox** u biċċa waħda għal kull klassi, kull waħda bl-għadd tad-dawriet tagħha, fl-ordni tal-logħba (D, C, B, A, S1, S2, R, X, imbagħad l-oħrajn). Ikklikkja klassi biex tara biss dawriet tagħha; **Shift+klikk** iżid jew inaqqas waħda. Kollox hawn taħt - il-listi, il-mappa, l-esportazzjoni tal-heatmap - isegwi l-klassijiet magħżula.
- **Fejn titjieb**: kull tip ta' żball, l-iktar dawriet l-ewwel (imbagħad l-iktar darbiet, imbagħad l-iktar kost), sa 8. **Kollox N tipi** juri l-bqija, **Inqas** iħeba-hom mill-ġdid. Kull ringiela: l-isem tagħha, "N minn M dawriet", barra li turi s-sehem tagħha, u "K darbiet · madwar X s · l-aktar fit-T3 (5), T7 (4), T1 (2)" - kemm saret (dawra b'kurva), kemm ġiet kollha flimkien, u t-tliet kurvi fejn l-aktar dawriet għamluha. **Ikklikkja ringiela** biex turiha fuq il-mappa taż-żbalji (u ixgħel il-mappa); ikklikkja għal darb'oħra biex tara kull żball.
- **Kurva b'kurva** (jew *Kurva b'kurva - <żball>* meta tkun għażilt wieħed): għal kull segment, "N minn M tilfu ħin · X s" - dawriet li għamlu l-kurva kollha, dawk li tilfu **0.05 s** jew aktar hemm meta mqabbla mal-aħjar tal-klassi tagħhom, u l-ħin kollu li tilfu. Imqassam, juri t-tliet żbalji l-iktar komuni tiegħu bl-għadd tad-dawriet. **Ikklikkja kurva** biex tiftaħha, iffrejmha bil-kamera u aqleb għall-mappa taż-żbalji: għal kull żball (jew biss dak li għażilt) linja bħal "12 minn 40 dawriet ibbrejkjaw bikri hawn. F'9 karozzi differenti - madwar 0.21 s kull wieħed." u d-dawriet li għamluh, **l-agħar l-ewwel**, kull wieħed bil-kost tiegħu - sa 8, "+N oħra" għall-bqija. **Ikklikkja dawra** biex tiffoka fuqha u terġa' tara dak iż-żball (imqiegħed 40 m qabel).
- **Turi fil-heatmap**: ara hawn taħt. "Qed nibni l-heatmap…" waqt li jaħdem; mitfi meta m'hemm l-ebda żball.

## Il-mappa taż-żbalji {#the-mistake-map}

**View → Mappa taż-żbalji** tpinġi tul it-traċċa ta' referenza kemm mid-dawriet (tal-klassi magħżula) għamlu żball f'kull metru - ta' kull tip, jew dak li għażilt fl-istatistika. Kull dawra titgħodd darba f'kull metru; il-firxa ta' kull okkorrenza (fejn kienet il-kawża jew l-avveniment tagħha) titwessa' b'6 m fuq kull naħa, sabiex waħda qasira tidher. Iktar wiesgħa u iktar ċara fejn ġew iktar dawriet: wisa' `3 + 10 · (dawriet hawn / l-aktar dawriet kullimkien)` metri, il-kulur minn kannella skura għal oranġjo ċar; striixa griża ta' 2 m fejn ma għamel ħadd. Leġġenda: *ftit dawriet ↔ l-aktar dawriet*.

Bi **Tikketti** mixgħula, il-qofol ta' kull kurva jġorr l-iktar żball komuni tagħha: "T3 · 12/40 brejk bikri" (dawriet li għamluh / dawriet li għaddew mill-kurva), "T3 · 12/40" meta tkun għażilt tip, "T3 · nadif" meta ma tkun għażilt xejn. Meta tgħaddi bil-mouse fuq tikketta tiġi elenkata t-telf tal-kurva u ħamest iż-żbalji l-iktar komuni tagħha; ikklikkjaha tiftaħ jew tagħlaq dik il-kurva fl-istatistika.

## Turi fil-heatmap {#show-in-the-heatmap}

**Turi fil-heatmap** tgħaddi l-istess lit-tab tal-heatmap bħala dataset bl-isem "Żbalji fuq <traċċa>" (jew "Żbalji fuq il-korsa"), sabiex it-toolset kollu tal-heatmap - modi tas-sħana, filtri, il-linja taż-żmien, qtugħ - jaħdem fuq fejn id-dawriet imorru ħażin.

Hija CSV mibnija fil-memorja (`mistakeTable`), ringiela waħda għal kull punt tal-grilja (kull 2 m) ta' kull okkorrenza, fil-**pożizzjoni stess tad-dawra** hemm:

| Kolonna | Kontenut |
|---|---|
| `x`, `y`, `z` | il-pożizzjoni tad-dawra f'dak il-metru (koordinati tal-logħba) |
| `elapsed` | il-ħin tad-dawra hemm, s |
| `lap` | it-tikketta tad-dawra |
| `car` | l-isem tal-karozza (jew "car 1234") |
| `mistake` | l-isem taż-żball, fil-lingwa attwali |
| `car_class` | il-klassi, `-` meta ma hemmx |
| `corner` | it-tikketta tal-kurva, `T3` |
| `cost` | il-kost tal-okkorrenza, s |

Titgħabba mill-loader tal-heatmap stess b'hints tal-mappa: Y 'il fuq, l-ebda qlib tal-assijiet, skala 1; ħin `elapsed` f'sekondi; **persuna** = `car`, **grupp** = `mistake`, **sessjoni** = `lap`; l-ebda direzzjoni ta' ħares; `car_class`, `corner` u `cost` jinżammu bħala kolonni ta' filtru. It-tab imbagħad jaqleb għal **Heatmap** u jiffrejmja d-dejta. Jiġu esportati biss il-klassijiet magħżula fl-istatistika.

## Korsi minn diversi traċċi {#courses-from-several-tracks}

Id-dawriet jiġu analizzati **korsa waħda kull darba**. Folder li fih dawriet ta' diversi korsi - il-librerija sħiħa tad-dawriet - joffri kull korsa biex tintgħabba waħedha (bl-għadd tad-dawriet tagħha, l-iktar l-ewwel); dawriet ta' xogħlijiet li qatt ma ntemmu (`unfinished/` ta' FH Companion) jmorru mal-korsa tagħhom, immarkati *parzjali*. Dawriet ta' diversi traċċi bl-isem magħżula bħala fajls jiġu offruti bl-istess mod, u dawriet li ma jsemmu l-ebda traċċa jmorru ma' dik li tkun magħżula. Tagħbija ta' dawriet ta' traċċa oħra b'isem minn dawk mgħobbija tissostitwixxihom. Dettalji: [Tagħbija tad-dawriet](race-loading-laps.md#folders-and-courses).

## Prestazzjoni b'ħafna dawriet {#performance-with-many-laps}

Għexieren ta' dawriet jiġu analizzati f'sekonda jew tnejn (kollha, dejjem). Dak li jinġibed huwa limitat sabiex il-view jibqa' fuq ir-rata tal-frame:

| Limitu | Valur | Effett |
|---|---|---|
| dawriet imġibda b'default | 8 (`SHOW_ALL_UP_TO`) | wara 8 dawriet mgħobbija, dawriet ġodda miżjuda jinħbew sakemm ma jkunux ir-referenza, id-dawra fokussata jew l-aħjar tal-klassi tagħhom. **Uri kollox** jinġibed kull dawra; **Dawk li qed tħares lejhom biss** iġġibu lura. Il-fokus fuq dawra jurihielha u l-aħjar tal-klassi tagħha |
| karozzi sempliċi u linji rqaq | iktar minn 10 viżibbli (`PLAIN_PAST`) | dawriet oħra għajr il-fokus, il-karozza segwita u r-referenza: punt tal-linja kull 6 m (minflok 1.5 m), karozzi mpinġija sempliċi |
| dawriet fuq grafika | 8 (`CHART_LAPS`) | il-fokus, l-aħjar tal-klassi tiegħu u r-referenza l-ewwel; "+N oħra mpinġija, mhux fuq il-grafika" |
| karti tal-HUD | 6 | l-ewwel sitt dawriet viżibbli |
| statistika | minn 3 dawriet | it-taqsima tinħeba taħt dan |
| sejbiet elenkati | 12 sewwieq, 8 karozza/kuntest, 10 gwadanji | għal kull dawra fokussata |
| pari ta' karozzi murija | 3 | iktar minn 3 pari, pari waħda b'għażla |

Okkorrenzi taż-żbalji jinħadmu darba għal kull analiżi u jinħażnu f'cache; id-densità tal-mappa taż-żbalji tinħażen f'cache skont l-għażla tal-klassi u t-tip taż-żball.

## Għall-iżviluppaturi {#for-developers}

Kodiċi: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` f'[`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
