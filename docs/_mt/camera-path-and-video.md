---
title: "Mogħdija tal-kamera u vidjo"
nav_order: 15
lang: "mt"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Mogħdija tal-kamera u vidjo

Agħmel film tad-dejta tiegħek: tpoġġi l-kamera f'ftit postijiet u l-viewer jtir bejniethom u jiffranka vidjo. Kull frame hu nadif ħafna, bla granel. Il-kamera u l-pjanċina jiċċaqilqu flimkien, allura l-istess pannell jagħmel timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Agħmel flythrough {#make-a-flythrough}

1. Titlaq sal-post fejn jibda l-film u agħfas **Żid keyframe hawn** f'**Mogħdija tal-kamera u rendering**.
2. Titlaq sal-post li jmiss u agħfsu darba oħra. Erġa' agħmel dan għal kull waqfa.
3. Immarka **Ara minn qabel tul il-mogħdija** u iġbed **Pożizzjoni tul il-mogħdija** biex tiċċekkja l-moviment.
4. Issettja **Tul** (kemm idum il-vidjo). Moviment li hu tajjeb iżda mgħaġġel wisq jeħtieġ biss tul itwal.
5. Agħfas **Irrendja l-vidjo**. Stenna l-linja tal-progress; il-fajl jitniżżel meta jispiċċa.

![Il-pannell Mogħdija tal-kamera u rendering b'tliet keyframes, interpolazzjoni Lixxa, 12 s, 30 fps u 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Keyframes {#keyframes}

| Kontroll | Effett |
|---|---|
| **Żid keyframe hawn** | Iżid il-pożizzjoni attwali tal-kamera, il-yaw, il-pitch u l-kamp tal-veduta bħala keyframe. |
| **Neħħi** | Ineħħi l-keyframes kollha. |
| Lista tal-keyframes | Ringiela waħda għal kull keyframe: in-numru tiegħu (ikklikkja biex il-kamera titlaq hemm, u tissettja wkoll il-kamp tal-veduta), il-pożizzjoni, `yaw° / pitch°`, u **×** biex tneħħih. |

Il-keyframes jitqassmu **b'mod ugwali** tul assi normalizzat tal-mogħdija minn 0 sa 1 kull meta jiġi miżjud jew imneħħi wieħed; it-tul tal-output imbagħad iġbed il-moviment kollu, għalhekk ritratt li hu tajjeb iżda mgħaġġel wisq jeħtieġ biss tul itwal. Il-yaw jitħalla jdur bejn il-keyframes sabiex il-kamera tduwwar fl-ewwel triq qasira.

Mingħajr keyframes, rendering iżomm il-kamera attwali fiss għall-klipp kollu - timelapse tajjeb ħafna.

## Issettjar tal-mogħdija {#path-settings}

| Kontroll | Default | Firxa (jog) | Tifsira |
|---|---|---|---|
| **Interpolazzjoni** (2+ keys) | *Lixxa* | *Lixxa* / *Dritta* | *Lixxa*: kurva Hermite kubika mgħoddija mill-keyframes b'tangenti mill-keyframes ġirien, sabiex il-veloċità taqbel madwar kull keyframe u ma jkunx hemm tfixkil fejn jiltaqgħu s-segmenti. *Dritta*: linji dritti bejn il-keyframes, prevedibbli, b'kantuniera vizibbli f'kull keyframe. Il-kamp tal-veduta dejjem jiġi interpolat b'mod lineari. |
| Linja tal-ivvjaġġar (2+ keys) | | | `N unitajiet ta' ivvjaġġar - M kull sekonda b'dan it-tul`, jew nota li l-keyframes kollha f'post wieħed. |
| **Ara minn qabel tul il-mogħdija** (1+ keys) | mitfi | | Iġġib il-kamera tal-viewport mill-mogħdija, u tqiegħed il-pjanċina miegħha kif jagħmel ir-rendering, sabiex il-moviment jiġi evalwat qabel ir-rendering. |
| **Pożizzjoni tul il-mogħdija** (waqt il-preview) | 0% | 0-100% | Fejn fuq il-mogħdija jsir il-preview. |
| **Tul** | 12 s | 1-120 s (3600) | It-tul tal-vidjo. |
| **Frame rate** | 30 fps | 6-60 (240) | |
| **Bitrate** | 16 Mbps | 1-60 Mbps, logaritmiku (400) | Gradjenti tas-sħana jiddieħlu ħażin f'bitrate baxx: ftit dettall hemm li codec jista' jaħbi fih l-iżball. |
| **Limitu tal-istennija għall-konverġenza** | 240 frames | 2-600 (10,000) | L-iktar li frame tal-output wieħed jista' jistenna biex isir eżatt. Frames li jilħqu dan il-limitu jinkitbu xorta u jitgħoddu. |
| Sommarju | | | `N frames · window: cumulative/fixed/lifetime`, u meta l-linja taż-żmien tkun fil-modalità Kollox: *(ir-rendering jibdel Kollox għal Ħaddem biex il-pjanċina tfisser xi ħaġa)*. |
| **Irrendja l-vidjo** / **Ikkanċella** | | | Jibda r-rendering; waqt li jaħdem, juri `frame i / n · waited w · X MB` u kemm frames ma kinux eżatti. Jeħtieġ dataset. |

## Pariri {#tips}

- Id-daqs tal-output hu d-daqs tal-canvas f'pixels tal-apparat (il-proporzjon tal-pixels tal-iskrin, mhux iktar minn 2). Ibdel id-daqs tat-tieqa tal-browser biex tibdlu.
- Storja kumulattiva tibni s-sħana matul il-klipp; tieqa jew storja tul il-ħajja turi biċċa mobbli minn ħin.
- Il-pożizzjonijiet tal-keyframes huma koordinati tal-wiri: b'[assi tad-dinja maqlub](camera.md#invert-world-axis), keyframes magħmula qabel ma tbiddlu jindikaw mkien ieħor wara.

## Għall-iżviluppaturi {#for-developers}

### X'jagħmel rendering {#what-a-render-does}

1. Jieħu capture ta' prova tal-frame biex jitgħallem id-daqs eżatt tal-output f'pixels tal-apparat.
2. Jagħżel codec permezz tal-WebCodecs: **VP9** (`vp09.00.10.08`), inkella **VP8**, bil-bitrate u bil-frame rate magħżula. Mingħajr `VideoEncoder` jieqaf b'*Dan il-browser m'għandux VideoEncoder - WebCodecs hu meħtieġ biex jinkiteb vidjo*; b'ebda codec, *Ebda codec tal-vidjo appoġġat (ġie ppruvat VP9, VP8)*.
3. Jieħu f'idejh is-settings li rendering jeħtieġ: jieqaf il-playback, iħalli **baġit adattiv mitfi**, **raffinament progressiv mixgħul** u l-baġit tal-sprites għal 64M f'kull frame (il-baġit adattiv iħares il-frame rate, li hu l-għan ħażin hawn: jaqra kull frame bil-mod li jkun qed jikkonverġi bħala raġuni biex jitfa' inqas ringieli, u dan jieħu iktar frames biex jikkonverġi), u jbiddel il-linja taż-żmien minn **Kollox** għal **Ħaddem**. L-issettjar tal-istorja (kumulattiv, tieqa, tul il-ħajja) jibqa' kif inhu: rendering hu maħsub biex ikun dak li kont qed tara, imdawwar u miktub.
4. Għal kull frame tal-output *f* minn *n*, b'*u* = f / (n - 1):
   - iqiegħed il-kamera fil-pożizzjoni tal-mogħdija f'*u* (jekk hemm keys);
   - iġib il-pjanċina għall-istess frazzjoni *u* tal-firxa tal-linja taż-żmien (il-firxa tas-sessjoni magħżula fir-replay tal-kaxxi);
   - jiffoka stima ġdida, anki meta l-kamera ma tkunx ċċaqlaqet - jekk jiġi mdawwar l-akkumulazzjoni tal-frame ta' qabel, jibqa' xbieha tat-tieqa ta' qabel;
   - jistenna, frame b'frame, sakemm l-istampa tkun eżatta (ringieli kandidati kollha miġbuda f'frame wieħed, jew l-akkumulazzjoni tlestiet), sa l-limitu tal-istennija;
   - jiffissa l-frame kompost u jikkodifikah, b'keyframe kull 2 sekondi tal-output sabiex il-fajl ikun jista' jintgħażel.
5. Jgħaqqad il-frames f'fajl WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) bi timestamps magħżula mill-frame rate - il-ħin tal-arloġġ li kull frame ħa ma jgħodd xejn.
6. Jerġa' jqiegħed il-baġit, il-kamp tal-veduta, il-mod tal-linja taż-żmien, il-pjanċina u jekk kienx qed jaħdem.
7. Jniżżel il-vidjo bħala `3dheat-<width>x<height>-<frames>f.webm` u jirrapporta `N frames at W×H, X MB - every frame exact`, jew kemm laħqu il-limitu tal-istennija.

**Ikkanċella** jieqaf wara l-frame kurrenti (*Ir-rendering ġie kkanċellat.*) u jerġa' jqiegħed is-settings.
