---
title: "Akkumulazzjoni"
parent: "Id-dettalji tar-rendering"
nav_order: 2
lang: "mt"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Akkumulazzjoni

Meta l-viewer ma jkunx jista' jpitter kull tikka f'frame wieħed, jipitter parti minnhom, imbagħad parti oħra, u jżid l-istampi flimkien waqt li tibqa' fiss. L-istampa tiġi iktar ċara, bħal ritratt li qed jiżviluppa. Il-kamera li tiċċaqlaq tibda mill-ġdid. Il-linja **Kopertura** tal-overlay tal-istatistika turi kemm wasal.

![L-overlay tal-istatistika: Kopertura turi perċentwali waqt li l-istampa tiżviluppa u *eżatt* meta tkun lesta](../assets/img/en/performance-stats-overlay.webp)

## Għall-iżviluppaturi {#for-developers}

Meta frame wieħed ma jistax jpitter kull ringiela, jipitter kampjun u jagħtih piż; allura l-istampa hi stima mhux mgħawġa imma rumuruża. **L-akkumulazzjoni** tgħaqqad frames suċċessivi sabiex l-istima tikkonverġi għat-tweġiba eżatta sakemm ebda ħaġa ma tinbidel. Kull frame jagħżel waħda minn ħames modi ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); l-aħħar wieħed użat hu f'`engine.live.accumMode`.

| Modalità | Meta | X'jiġri għall-akkumulatur |
|---|---|---|
| **reset** | il-kamera ċċaqalqet, xi ħaġa li tbiddel il-qasam inbidlet, ir-raffinament progressiv hu mitfi, tieqa li qed tikber qed tibda (l-ewwel frame tal-playback, wara seek), jew is-sħana tal-linji mmexxija tbiddlet | Jinbidel bl-istima ta' dan il-frame. |
| **extend** | tieqa **Kumulattiva** li kibret biss mill-aħħar frame | Dan il-frame jipitter biss ir-ringieli li għadhom saru viżibbli, bil-piż sħiħ, u iżidhom. Ebda ħaġa ma titlef. |
| **ema** | tieqa li titmexxa (**Tieqa**, **Ħajja**) timxi | `acc = acc × (1 - 0.34) + frame × 0.34` - medja mobbli esponenzjali ta' madwar tliet frames. |
| **mean** | ebda ħaġa ma nbidlet u l-istima mhix kompluta | `acc = acc × (1 - 1/n) + frame × 1/n` fuq il-frame *n*: medja li tiċċaqlaq. |
| **skip** (idle) | ikkonverġa u ebda ħaġa ma nbidlet | Ma jinġibed xejn; il-frame jerġa' jikkompponi biss. |

### Għaliex kull wieħed {#why-each}

- **Medja li tiġri, mhux somma.** Li tiskala l-buffer b'1 - 1/n u żżid 1/n tal-frame il-ġdid hu algebrikament l-istess li tissomma u tgħaddi għal *n* fl-aħħar, imma l-buffer dejjem iżomm il-valur ta' qasam wieħed. Somma tilħaq *n* darbiet il-qasam, u fuq target ta' 16-bit tilħaq is-saturazzjoni f'65,504; b'divisur li jkompli jikber, veduta stazzjonarja titbaxxa iktar kemm tibqa' fiss - filwaqt li kamera li tiċċaqlaq, li tiġi mibdula kull frame, tidher perfettament korretta. It-test tal-smoke jgħid li 16 frame magħquda jżommu 1.00× dak li jżomm frame wieħed.
- **Extend għal playback kumulattiv.** Ir-ringieli diġà akkumulati jibqgħu viżibbli, għalhekk frame jeħtieġ biss il-frazzjoni ta' sekonda li għadha kif waslet - li tiddaħħal f'frame wieħed, għalhekk tintuża eżatt. Li terġa' tistma minflok tiddi sett każwali differenti kull frame u titbaxxa, u tidher bħal splużjonijiet li jintlaħbu u jisparixxu, u frame mwaqqaf kien ikompli jimla. It-test jgħid li t-total jitla' b'mod monotoniku waqt il-playback u jibqa' fi 0.02% fuq 2.5 s mwaqqfa.
- **Medja mobbli għal tieqa li timxi.** Dawn jinbdlu verament kull frame. Peż ta' taħlit fiss isegwi t-tieqa li timxi (medja fuq il-frames kollha minn meta beda l-playback tibqa' lura wara l-pjanċina) u hi ferm iktar kwieta milli tibda mill-ġdid.
- **Reset għal linji mħaddma.** Ir-ras tas-sħana tal-linji jiċċaqlaq kull frame; medja mobbli tgħaffeġ kull wieħed f'traċċa, għalhekk kull frame jinġibed sħiħ u t-tbexxix tad-denb hu tal-istampa stess.
- **Frames parzjali jgħaddu minn target tal-iskrart.** Frame magħqud f'frazzjoni tal-piż sħiħ jitpitter f'target separat mill-zero u mbagħad jitħallat fl-akkumulatur, minflok ma jitpitter direttament bil-piż 1/n. Direttament, kull sprite jiġi miżjud b'1/n tad-daqs tat-total li jingħaqad miegħu, u target ta' half-float jgħaddi dan f'direzzjoni waħda - l-agħar fejn hu l-iktar mimli ([Akkumulazzjoni half-float](half-float-accumulation.md)).

### Konverġenza {#convergence}

Il-pjan ta' kull frame jaf kemm hemm ringieli kandidati u kemm jitgħażlu, għalhekk l-għadd ta' frames meħtieġa biex jgħattu kull ringiela hu ⌈kandidati / sottomessi⌉. Ladarba jinħalltu daqshekk frames il-veduta hi **konvergenti**: il-linja *Kopertura* tal-overlay tal-istatistika tinbidel minn perċentwali għal *eżatt*, u frames oħra jsiru idle. Bl-**Ippitturi kull ringiela f'kull frame** mixgħul (id-default), frame wieħed normalment jgħatti kollox, għalhekk il-konverġenza hi immedjata, u l-mekkaniżmu progressiv huwa meħtieġ biss meta t-tieqa żżomm iktar ringieli milli pjan tat-tpitir wieħed jista' jgħorr (madwar 67 miljun).

### Dak li jerġa' jibdih {#what-restarts-it}

Is-settings jaqgħu f'tliet gruppi, skont dak li l-buffer akkumulat għadu jfisser wara li jinbidlu:

| Grupp | Jinbidlu | Effett |
|---|---|---|
| **Ġeometrija** - liema ringieli jikkontribwixxu u kemm | mod tal-veduta; mogħdijiet tal-linji; raġġ tal-sprite, intensità fiċ-ċentru u fit-tarf, tnaqqis, rampa lixxa, il-kurva, limiti tal-pixels, iċċattjar; qtugħ tad-distanza viċin, bogħod u fuq pjan; okkluzjoni u aħbi wara t-terren; il-qtugħ; daqs tal-canvas; riżoluzzjoni tas-sħana; viżibbiltà u sinjali tal-gruppi; il-qsim tad-differenza; Kollox / Ħaddem; l-istorja; il-filtri tal-kolonni u l-għażla tal-Entitajiet; il-gain tal-half-float | Reset. |
| **Tieqa** - il-firxa taż-żmien | il-pjanċina titmexxa; il-fallback tal-Ħajja u t-tbexxix | Extend (kumulattiv) jew medja mobbli (li timxi). |
| **Kompożizzjoni** - il-kulur biss | saturazzjoni, rispons tad-densità, sħana minima, ir-rampi tal-kuluri; il-qtugħ tal-livell; il-griglja u l-assi; settings u sessjoni tar-replay tal-kaxxi; fond tal-fokus | Ipitter mill-ġdid mingħajr ma jaqbeż is-sħana. |

Mogħdija tal-kamera dejjem tagħmel reset. Għalhekk it-tgħawwiġ tas-saturazzjoni jew tar-rampa hu bla spiża; it-tgħawwiġ tar-raġġ tal-sprite jerġa' jibda l-konverġenza f'kull pass.
