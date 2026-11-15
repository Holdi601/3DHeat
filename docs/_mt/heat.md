---
title: "Sħana"
parent: "Modi tas-sħana"
nav_order: 1
lang: "mt"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Sħana

Is-sħana turi l-postijiet fejn ġraw ħafna affarijiet: aħmar fejn ġara ftit, abjad sħun ħafna fejn ġara ħafna. Twieġeb il-mistoqsija "fejn jiġri dan, u kemm".

**Sħana** (ċavetta 1) hija l-modalità predefinita. Kull ringiela viżibbli [(row)](glossary.md) tikkontribwixxi [sprite](glossary.md) tond li jħares lejn il-kamera; sprites li jaqgħu fuq xulxin jiżdiedu flimkien f'buffer ta' numri b'virgola mobbli; is-somma tiġi mqabbla permezz ta' rampa ta' kuluri - b'mod predefinit trasparenti → aħmar → isfar → abjad - u tinħadem fuq ix-xena.

![Sħana fuq livell 3D: punti sħan ġewwa u fuq il-bini](../assets/img/mt/shooter-heat.webp)

Ir-ritratt juri s-sħana ta' rawnd ta' shooter fuq livell bil-bini: il-punti sħan jinsabu fl-kmamar u fuq it-taraġ, mhux biss fuq l-art.

## Kif tuża dan {#how-to-use-it}

1. Għabbi d-data u agħfas `1` (jew agħżel **Sħana** fil-bar tal-modalitajiet).
2. Jekk kollox ikun abjad jew vojt, agħfas **Espożizzjoni awtomatika mill-kamp** fis-sezzjoni **Forma tas-sħana**.
3. Ibdel **Raġġ tas-sprite** sakemm il-punti ta' ħdejn xulxin jingħaqdu f'fasċi: iż-żgħir juri punti waħedhom, il-kbir juri żoni.
4. Iftaħ **Kuluri tas-sħana** biex tibdel il-kuluri, jew **Fond** biex l-għoljiet u l-ħitan jaħbu s-sħana warajhom.

![Is-sezzjonijiet Forma tas-sħana u Kuluri tas-sħana tal-ġenb, it-tnejn miftuħa](../assets/img/mt/heat-panel.webp)

L-istess pannelli jifformaw [Differenza](difference.md), [Sħana tat-tim](team-heat.md) u [Sħana tal-linji](line-heat.md); jiddifferenzjaw f'dak li jiġi miżjud (b'sinjal, b'kuluri, jew tul linji), mhux f'kif isir.

## Il-pannelli u l-bażijiet tagħhom {#the-panels-and-their-defaults}

Kull kontroll hawn taħt jorbot ma' parametru tal-shader, għalhekk il-bidla ma tiswa xejn ħlief ir-ridraw. Is-slidders għandhom kaxxa bil-kitba ħdejhom u maniglja tat-tbaxxir (il-qabda żgħira fuq il-lemin: iġbidha 'l fuq jew 'l isfel, iktar 'il bogħod tfisser iktar mgħaġġel, Shift għal preċiżjoni); fejn il-binarju tal-slidder jieqaf qabel limitu reali, il-maniglja tista' tmur lil hinn sal-*limitu tal-jog* imniżżel hawn. Il-valuri mmarkati *meta jitgħabba* jerġgħu jitħesbu għal kull dataset ġdid.

### Forma tas-sħana (miftuħa) {#heat-shape-open}

| Kontroll | Bażi | Medda (limitu tal-jog) | Dettalji |
|---|---|---|---|
| **Raġġ tas-sprite** | 6 m; meta jitgħabba, estensjoni / 120 | 0.05-2000 m, logaritmika (50,000) | [Forma tal-isprite](sprite-shape.md#sprite-radius) |
| **Intensità fiċ-ċentru** | 1 | 0-10 (1000) | [Forma tal-isprite](sprite-shape.md#centre-and-edge-intensity) |
| **Intensità fit-tarf** | 0 | -2-10 (1000) | [Forma tal-isprite](sprite-shape.md#centre-and-edge-intensity) |
| **Forma tar-rampa** | *Tnaqqis* | *Tnaqqis* / *Kurva* | [Forma tal-isprite](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Tnaqqis** (Tnaqqis biss) | 1.6 | 0.1-8 (64) | [Forma tal-isprite](sprite-shape.md#falloff) |
| **Rampa lixxa** (Tnaqqis biss) | fuq | | [Forma tal-isprite](sprite-shape.md#falloff) |
| Editur tal-kurva (Kurva biss) | bil-preset *Lixx* | | [Forma tal-isprite](sprite-shape.md#the-curve-editor) |
| **Punt tas-saturazzjoni** | 24; meta jitgħabba stima, imbagħad imkejla | 0.1-4000, logaritmika (10,000,000) | [Kulur u esponiment](colour-and-exposure.md#saturation-point) |
| **Sħana minima** | mitfija (0) | 0-100% | [Kulur u esponiment](colour-and-exposure.md#minimum-heat) |
| **Rispons tad-densità** | *Saturanti* | *Saturanti* / *Lineari* / *Log* | [Kulur u esponiment](colour-and-exposure.md#density-response) |
| **Espożizzjoni awtomatika mill-kamp** | | buttuna | [Kulur u esponiment](colour-and-exposure.md#auto-exposure) |
| **Segwi l-veduta** | fuq | | Terġa' tkejjel l-espożizzjoni kull darba li l-kamera tieqaf, sabiex reġjun li fih tidħol juża r-rampa kollha tal-kuluri. Bidliet żgħar jiġu injorati u l-iskala titlaq bil-mod. Neħħi l-kaxxa, jew iġbed **Punt tas-saturazzjoni**, biex tiffissa l-iskala u tqabbel postijiet fuq skala waħda. [Kulur u esponiment](colour-and-exposure.md#follow-the-view) |
| **L-istess densità f'kull zoom** | fuq | | Kulur ifisser l-istess numru ta' ringieli għal kull erja tal-art, kemm ikunu viċin. Sprite li l-limitu tal-pixels jikbru (mill-bogħod) jew iżgħar (mill-qrib) iżomm is-sħana li d-daqs veru tiegħu iżid, għalhekk ritratt espost minn 'l bogħod ma jitbaħħarx meta tidħol fih. Mitfi, sprite limitat iżid il-piż sħiħ tiegħu fid-daqs limitat tiegħu. [Forma tal-isprite](sprite-shape.md#pixel-clamps) |
| **Iċċattja fuq il-pjan tal-art** | mitfi | | [Forma tal-isprite](sprite-shape.md#flatten-onto-ground-plane) |

### Kuluri tas-sħana (magħluq) {#heat-colours-closed}

| Kontroll | Bażi | Dettalji |
|---|---|---|
| Kaxxi tal-kulur tal-grupp u **Separazzjoni tal-kuluri** (Sħana tat-tim biss) | 1.4 | [Sħana tat-tim](team-heat.md) |
| Editur tal-**Rampa tas-sħana** (*Pożittiva (timijiet li jżidu)* fid-Differenza, *Rampa tal-opaċità* fis-Sħana tat-tim) | trasparenti → aħmar → isfar → abjad | [Kulur u esponiment](colour-and-exposure.md#the-ramp-editor) |
| **Irrisettja għal trasparenti → aħmar → isfar → abjad** | | |
| Rampa **Negattiva (timijiet li jnaqqsu)** (Differenza biss) | trasparenti → aħdar → blu → vjola | [Differenza](difference.md#colours) |

### Limiti tal-pixels tal-sprite (magħluq) {#sprite-pixel-clamps-closed}

| Kontroll | Bażi | Medda (limitu tal-jog) | Dettalji |
|---|---|---|---|
| **Raġġ minimu f'pixels** | 1 px | 0-16 (512) | [Forma tal-isprite](sprite-shape.md#pixel-clamps) |
| **Raġġ massimu f'pixels** | 96 px | 2-1024, logaritmiku (8192) | [Forma tal-isprite](sprite-shape.md#pixel-clamps) |

### Fond (miftuħ) {#depth-open}

| Kontroll | Bażi | Dettalji |
|---|---|---|
| **Aħbi wara t-terren** | fuq | [Fond u culling](depth-and-culling.md#hide-behind-terrain) |
| **Moħbi wara l-ġeometrija** | 0.8 (*80% iktar iswed*) | [Fond u culling](depth-and-culling.md#hidden-behind-geometry) |

### Qtugħ tal-distanza (magħluq) {#distance-culling-closed}

| Kontroll | Bażi | Medda (limitu tal-jog) | Dettalji |
|---|---|---|---|
| **Viċin** | mitfi (0) | 0.5-5000 m, logaritmika, il-qiegħ tat-track = mitfi (200,000) | [Fond u culling](depth-and-culling.md#distance-culling) |
| **Bogħod** | mitfi (0) | 1-200,000 m, logaritmika, il-qiegħ = mitfi (10,000,000) | [Fond u culling](depth-and-culling.md#distance-culling) |
| **Aqta' f'pjan** | fuq | | [Fond u culling](depth-and-culling.md#distance-culling) |
| **Aqta' wkoll il-livell** | fuq | | [Fond u culling](depth-and-culling.md#distance-culling) |

Ċwievet: `[` u `]` iġibu l-limitu 'l bogħod lura u 'l quddiem, `\` jbiddel it-tqabbid ([Fond u culling](depth-and-culling.md#keyboard)).

### Direzzjoni u Valur {#direction-and-value}

Żewġ sezzjonijiet oħra jinsabu taħt Forma tas-sħana. **Direzzjoni** tpingi kull ringiela bħala kunjal u żżid vleġġa: ara [Sħana direzzjonali](directional-heat.md). **Valur** jiżen is-sħana skont dak li kull ringiela kkostat jew qligħet: ara [Piż tal-valuri](value-weighting.md).

## Dak li jinħażen {#what-is-saved}

Is-settings tas-sħana ta' hawn fuq ma jinħażnux bejn sessjoni u oħra: meta terġa' ttella' l-paġna, jerġgħu jiġu r-bażijiet. Żewġ affarijiet jinżammu fil-browser: l-aħħar veloċità tal-playback (`heat3d.speed`, ara [Linja taż-żmien](timeline.md)) u s-settings tal-figuri 'l bogħod tal-[Figuri fuq xulxin](box-replay.md) (stil tas-simbolu, daqs, marki tal-laqtiet u oħrajn). Hekk jinżammu l-lingwa, l-[assi tad-dinja maqlubin](camera.md#invert-world-axis), l-ismijiet tal-karozzi mfakkra fil-tab tat-tellieqa u l-[librerija tal-livelli](level-library.md). Il-lista sħiħa tinsab fuq [Settings maħżuna](ref-settings-storage.md).
