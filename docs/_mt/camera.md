---
title: "Kamera u kontrolli"
nav_order: 14
has_children: true
lang: "mt"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera u kontrolli

Tgħum fl-iskena bħal għasfur: **W A S D** biex timxi, iġbed bil-mouse biex tħares. Uża din il-paġna biex tittajjar, biex tmur għal veduta mill-fuq jew mill-ġenb, u biex taqra eżattament fejn tinsab il-kamera.

## Ittajjar f'4 passi {#fly-in-4-steps}

1. Ikklikkja darba fuq il-veduta biex ikollha t-tastiera.
2. Żomm **W** biex tittajjar 'il quddiem, **S** lura, **A** u **D** lemin u xellug, **Space** 'il fuq, **Q** 'l isfel.
3. Żomm il-buttuna tal-mouse tax-xellug jew tal-lemin u iġbed biex tħares madwar.
4. Ipprimi **F** biex terġa' tqiegħed id-dejta kollha fil-qafas.

Il-kamera hija kamera ħielsa tat-titjir b'projezzjoni perspettiva u parallela, veduti ppreżettati, pożizzjoni miktuba, u fond tal-kamp. Is-settings tagħha jinsabu fil-pannell **Kamera u xena** fil-qiegħ tal-iskrin tal-ġenb (muri wkoll fit-tabs Analiżi tat-tellieqa u Partita). L-implimentazzjoni hija [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## It-titjir {#flying}

| Input | Effett |
|---|---|
| `W` `A` `S` `D` jew il-vleġeġ | 'Il quddiem (fuq il-veduta, inkluż il-pitch tagħha), xellug, lura, lemin |
| `Space` jew `E` | 'Il fuq (fuq tad-dinja) |
| `Q` jew `Ctrl` tax-xellug | 'L isfel |
| `Shift` (miżmum) | 6× aktar mgħaġġel |
| `Alt` tax-xellug (miżmum) | 15% tal-veloċità |
| Iġbed bil-buttuna tal-mouse tax-xellug jew tal-lemin | Ħares madwar. Il-pointer jinżamm waqt li tiġbed. |
| Ir-rota tal-mouse | Veloċità tat-titjir ×1.5 għal kull tikka (perspettiva); zoom (parallela) |
| `F` | Iffoka d-dejta fil-qafas |
| Klikk (mingħajr ma tiġbed) | Juri dak li hemm taħt il-pointer ([Spezzjoni tal-veduta](#inspecting-the-view)) |
| `C` | Ikkopja l-pożizzjoni tal-kamera, il-yaw u l-pitch |
| `G` | Mur f'punt miktub |
| `Esc` | Agħlaq il-kard tal-għażla (u ieqaf issegwi unità) |

### Waqt li tkun qed issegwi unità {#while-following-a-unit}

Meta l-kamera tkun qed issegwi unità f'replay ([Replay tal-partita](match-replay.md)), it-tasti tat-titjir jagħmlu xi ħaġa oħra:

| Input | Effett |
|---|---|
| Ir-rota, `W` / `S` | Eqrib lejn l-unità / ibgħad minnha (għoli / baxx fil-veduta satellitari) |
| `A` / `D`, `Q` / `E` | Orbita madwar l-unità (veduti chase u orbit) |
| Iġbed | Ħares madwar l-unità (fil-kokpit: ħares ġewwa) |
| `V` / `Shift+V` | Il-veduta tal-kamera li jmiss / ta' qabel |
| `Esc` | Ieqaf tħares lejn it-tieni unità l-ewwel, imbagħad ieqaf issegwi |

It-tasti tal-moviment jiżdiedu ma' [gamepad](gamepad.md); ara l-[referenza tat-tastiera](keyboard-reference.md) għal kollox. It-tasti jiġu injorati waqt li kaxxa tat-test jew lista tal-għażla tkun fil-fokus. Il-pitch jinżamm ftit qabel tkun dritta 'l fuq u 'l isfel.

## Il-pannell Kamera u xena {#camera--scene-panel}

![Il-pannell Kamera u xena: Projezzjoni, Veduti ppreżettati, buttuni tal-Kamp viżiv, Veloċità tat-titjira u Poża](../assets/img/en/camera-panel.webp)

### Projezzjoni {#projection}

**Projezzjoni**: *Perspettiva* (default) jew *Parallela*.

*Parallela* (ortografika) titneħħa l-qsir ta' l-perspettiva, allura żewġ punti sħan ta' l-istess densità jidhru bl-istess daqs kullimkien fil-qafas - il-paragun li mappa tal-heat hija għalih - u hija dik li tagħmel il-veduta isometrika tkun isometrika. F'modalità parallela r-rota tal-mouse tagħmel zoom (m'hemm l-ebda moviment 'il quddiem li jibdel id-daqs) u l-[wiri tal-veloċità](#fly-speed) jinħeba.

**Il-bidla żżomm is-suġġett l-istess daqs.** Projezzjoni parallela m'għandhiex field of view, allura l-għoli tal-frustum tagħha m'għandu ebda rabta mad-distanza tal-kamera; jekk tbiddel bla ħsieb, jew tagħmel zoom salvaġġ jew ma tara xejn. Il-mod għall-parallela jissettja l-għoli tal-frustum għal dak li tkopri l-kamera perspettiva fid-distanza tal-fokus (2 × distanza × tan(fov / 2), id-distanza tal-fokus tkun id-distanza tal-aħħar qafas). Il-lura terġa' tpoġġi l-pożizzjoni perspettiva li ħallejt, bl-istess daqs apparenti, minflok fejn il-veduta parallela tkun marret.

### Veduti ppreżettati {#preset-views}

| Grupp | Buttuni | Orjentazzjoni |
|---|---|---|
| **Isometrika** | **NE**, **NW**, **SE**, **SW** | Parallela, pitch -35.264° (= atan(1/√2), l-angolu li fih it-tliet assi kollha jiproġettaw bl-istess tul), yaw -45°, 45°, -135°, 135°. Erba' kantunieri, għax wieħed biss dejjem jaħbi nofs il-mappa wara dak li hu eqrib. |
| **Elevazzjonijiet** | **Fuq**, **Taħt**, **Quddiem**, **Wara**, **Xellug**, **Lemin** | Parallela. Fuq tħares dritt 'l isfel (pitch -89.9°), Taħt dritt 'il fuq, Quddiem tul -Z (yaw 0°), Wara tul +Z (180°), Xellug tul -X (-90°), Lemin tul +X (90°). |
| | **Lura għall-perspettiva** | Terġa' lura għall-pożizzjoni perspettiva li ħallejt. Mitfija fil-perspettiva. |
| | **Veduta ta' tliet kwarti** | Perspettiva, yaw -35°, pitch -28°. |

Kull preset jibdel il-proġezzjoni nnifisha - taħt il-perspettiva "veduta mill-fuq" xorta tikkonverġi lejn punt ta' sparizzjoni u l-erji ugwali ma jibqgħux jidhru ugwali - u jqiegħed id-dejta fil-qafas minn dik id-direzzjoni.

### Kamp viżiv {#field-of-view}

**Kamp viżiv** - l-angolu vertikali. Default 65°, 10-140° fuq it-track (179° bil-maniglja), b'buttuni **Ċatt 20°**, **Twil 35°**, **Normali 50°**, **Wiesa' 65°**, **Wiesa' ħafna 90°**. Dejjaq jiċċatta l-perspettiva u jixbah aktar projezzjoni parallela; wiesa' jagħmel il-fond eċċessiv u jagħmilha diffiċli li tiġi ġġudikata d-distanza. Jibqa' ħaj fil-modalità parallela, fejn jissettja l-iskala li l-bidla lura tisolvi għaliha u d-distanza li **Frame** juża.

### Veloċità tat-titjir {#fly-speed}

**Veloċità tat-titjir** - unitajiet tad-dinja (metri) kull sekonda bl-acċeleratur kollu mgħaffas. Default 120; f'kull tagħbija d-daqs orizzontali tad-dejta / 12. Logaritmika, 0.02-20,000 (200,000 bil-maniglja; il-maniglja tbiddel b'rapporti, mhux b'ammonti). Ir-rota tal-mouse tmiss jew taqsam bi 1.5 għal kull tikka, fil-firxa 0.02-200,000.

L-istess valur jintwera fl-isfel fuq il-lemin tal-veduta (perspettiva biss): il-veloċità f'm/s jew km/s u l-ħin biex taqsam id-dejta (jew il-livell, meta jkun mgħobbi livell 3D) f'dik il-veloċità. Iġbed 'il fuq jew 'l isfel biex tbiddel il-veloċità.

### Qrib u bogħod {#near-and-far}

Distanzi ta' qtugħ **Qrib** (default 0.5) u **Bogħod** (default 40,000). It-tnejn jiġu rikalkulati mid-dejta f'kull tagħbija (qrib = max(0.05, estensjoni / 20,000), bogħod = estensjoni × 12) u jitwessgħu, qatt mhux jiddejqu, minn livell 3D kbir aktar ([Livelli](levels.md#what-a-level-does-for-the-heat)). Il-proporzjon tagħhom jiddeċiedi l-preċiżjoni tal-fond li l-okkluzjoni tiddependi fuqha, allura qrib żgħir ħafna b'bogħod kbir ħafna jdgħajjef l-[okkluzjoni](depth-and-culling.md). Meta jitħares minn barra mix-xena jew 'il fuq mill-art tagħha 'l fuq, il-pjan qrib użat verament jitħaraq sa 2% ta' dik id-distanza, sabiex mappa li tidher minn bogħod 'il fuq iżżomm preċiżjoni biżżejjed tal-fond biex l-ilma u x-xatt ma jitħabbtux; il-kaxxa xorta turi l-valur imqiegħed.

### Kontrolli oħra {#other-controls}

| Kontroll | Default | Tfisser |
|---|---|---|
| **Aqleb Y** | off | Taqleb il-ħarsa tal-mouse 'il fuq/'l isfel. |
| **Fond tal-kamp** | off | Ara hawn taħt. |
| **Gamepad** | attivat | Ara [Gamepad u HOTAS](gamepad.md). |
| **Poża** | | Ara hawn taħt. |
| **Spezzjoni** | | Il-qari tal-kamera, l-għażla bil-klikk, il-konvenzjoni tal-yaw u *Mur f'punt*; ara [Spezzjoni tal-veduta](#inspecting-the-view). |
| **Iffoka d-dejta (F)** | | Jimla d-dejta (fit-tab Analiżi tat-tellieqa: il-laps) mal-veduta, u jżomm id-direzzjoni attwali. Il-kamera titqiegħed f'r / tan(fov / 2) miċ-ċentru, r kif tkun nofs id-dijagonali tal-limiti tad-dejta. |
| **Grilja**, **Assi** | on, on | Grilja fuq l-art b'spazjatura 1/2/5 × 10ⁿ ta' madwar 1/40 tal-firxa tad-dejta (li tmur sa 1.5 × id-dejta, bejn 8 u 120 pass tal-grilja), u assi kkulurit. |
| **Aqleb assi tad-dinja** X, Y, Z | off | Ara hawn taħt. |

### Pożizzjoni {#pose}

Ħames kaxxi għan-numri - **X**, **Y**, **Z** u **yaw °**, **pitch °** - li jsegwu l-kamera sakemm xejn minnhom ma jkun fil-fokus. Ikteb valur u pprimi `Enter` (jew ħalli l-kaxxa) biex tmexxi l-kamera hemm. **ikkopja** jpoġġi `pos X Y Z · yaw A · pitch B` fuq il-clipboard (bi `(game yaw)` wara dan meta jintgħażel dak il-konvenzjoni). It-titjir huwa kif tesplora; il-koordinati huma kif terġa' tagħmel veduta. Huma l-istess numri tal-[qari tal-kamera](#camera-readout): il-koordinati stess tad-dejta, anke meta asse jkun maqlub, u l-yaw fil-[konvenzjoni](#yaw-conventions) magħżula.

### Aqleb assi tad-dinja {#invert-world-axis}

**Aqleb assi tad-dinja X / Y / Z** jiddisinja d-dinja bl-assi dak maqlub. Logħba li żżomm dinja tax-xellug tidher maqlubha f'dan il-viewer tal-lemin - l-għawġ tal-lemin jidher bħala għawġ tax-xellug - u l-qlib ta' X jew Z jerġa' jpoġġiha lura. **Il-kitba biss tinbidel**: id-dejta, l-analiżi u kull koordinata li l-għodod juru (pożizzjoni, ruler, slice) jibqgħu tal-logħba stess. Il-veduta titqallab fil-post, u żżomm lilek tħares lejn l-istess post. Din is-settings tinżamm f'dan il-browser (iċ-ċavetta `localStorage` `heat3d.mirror`); ara l-[qlib](axes-units-and-time.md#flips) tal-kariga waqt it-tagħbija, li jbiddel id-dejta.

## Spezzjoni tal-veduta {#inspecting-the-view}

Fejn hi l-kamera, x'hemm taħt il-pointer, u l-mori għal punt - il-blokk **Spezzjoni** tal-pannell Kamera u xena, u żewġ overlays fil-kantuniera ta' fuq-xellug tal-veduta. Il-kodiċi hu f'[`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) u [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Kontroll | Default | Tfisser |
|---|---|---|
| **Pożizzjoni tal-kamera fuq il-veduta** | on | Il-qari tal-kamera, hawn taħt. Jingħalaq ukoll bil-**×**. |
| **Klikk juri x'hemm** | on | L-għażla bil-klikk, hawn taħt. |
| **Konvenzjoni tal-yaw** | Wiri | Liema yaw jurih il-qari, il-kaxxi tal-pożizzjoni u l-kaxxa tal-qbiż, u liema jaqraw. |

Dawn it-tlieta jinżammu f'dan il-browser (iċ-ċavetta `localStorage` `heat3d.inspect`).

### Qari tal-kamera {#camera-readout}

Fil-kantuniera ta' fuq-xellug tal-veduta: **x**, **y**, **z**, **yaw** u **pitch** tal-kamera, f'ħin reali, b'tikketta li ssemmi l-konvenzjoni tal-yaw. Juri l-istess numri tal-kaxxi [Pożizzjoni](#pose) u ma jiswa xejn waqt it-titjir (jinkiteb fil-paġna fuq il-frame clock, mingħajr ma jerġa' jitfassal il-pannelli).

- **ikkopja** (jew `C` kullimkien barra kaxxa tat-test) jpoġġi `x X y Y z Z yaw A pitch B (viewer yaw)` fuq il-clipboard, bil-punti deċimali `.` kull ma tkun il-lingwa - linja li l-kaxxa tal-qbiż, u kull skrip, jaqra lura.
- **mur** (jew `G`) jiftaħ kaxxa taħtha: ipejstja punt u pprimi `Enter` biex tħares lejh, jew ipejstja pożizzjoni sħiħa mkopjata biex tqiegħed ruħek f'dik il-veduta. `Esc` jagħlaq il-kaxxa.

### Koordinati: il-qafas tad-dejta stess {#coordinates-the-datas-own-frame}

Kull koordinata li l-għodod tal-ispezzjoni juru jew jaċċettaw tkun fil-**qafas proprju tad-dejta mgħobbija**: il-[mappa tal-assi](axes-units-and-time.md) tat-tagħbija (assi 'l fuq, qlib, skala) titneħħa. Pożizzjoni maqrija mill-veduta hija n-numru li t-tabella tas-sors iżżomm, u numru mit-tabella miktub fil-kaxxa tal-qbiż jaqa' fuq dak il-post. Meta l-mappa ma tbiddel xejn (tagħbija b'Y 'il fuq u mingħajr skala - li hija dik li l-għodod tal-kattura u l-esportaturi tal-livelli jiktbu) dan huwa sempliċiment id-dinja; inkella l-qari jġorr tikketta **qafas tad-dejta**. Mingħajr dataset, il-koordinati huma koordinati tad-dinja. Il-yaw u l-pitch huma dejjem dwar id-dinja tal-viewer, bl-Y 'il fuq.

### Konvenzjonijiet tal-yaw {#yaw-conventions}

| Konvenzjoni | Yaw 0° jħares tul | Tikber lejn | Użata minn |
|---|---|---|---|
| **Viewer** | -Z | -X | il-kamera ħielsa tat-titjir, [veduti ppreżettati](#preset-views) |
| **Logħba / għodod tal-kattura** | +X | -Z | il-kolonni `yaw` tal-għodod tal-kattura u l-pożizzjonijiet tagħhom; f'livell esportat fil-qafas tal-viewer, il-yaw proprju tal-logħba |

Il-pitch huwa l-istess fiż-żewġ konvenzjonijiet: 'il fuq mill-orizzontali. It-tnejn jiddifferixxu b'kwart ta' dawra u xejn aktar:

> viewer yaw = game yaw - 90°

Direzzjoni `d` hija `(cos p · cos y, sin p, -cos p · sin y)` fil-konvenzjoni tal-logħba u `(-sin y · cos p, sin p, -cos y · cos p)` f'dik tal-viewer. Agħżel **Logħba / għodod tal-kattura** biex tikteb yaw direttament minn tabella ta' kattura, jew biex tqabbel il-qari ma' waħda.

### Mur għal punt {#going-to-a-point}

**Mur għal punt**, fil-blokk Spezzjoni (u l-kaxxa **mur** tal-qari):

- il-kaxxa tat-test taċċetta `x, y, z` jew `x y z` (jew `x; y; z`), b'punt deċimali jew virgola deċimali - `-321.6, 137.8, -59.9` u `-321,6 137,8 -59,9` huma l-istess punt. Ħames numri jiżdiedu ma' yaw u pitch, u pożizzjoni mkopjata mill-qari jew mill-kaxxi tal-pożizzjoni tinqara sħiħa, bit-tikketti u l-konvenzjoni inklużi;
- **yaw °** u **pitch °** (fakultattivi) idawru l-kamera, fil-konvenzjoni magħżula;
- **Ħares lejh** iżomm id-direzzjoni (miġbuda biex tħares 'l isfel għal mill-inqas 20° jekk kienet tħares lixxa) u tirtira lungu fiha għad-distanza attwali, miżmuma bejn 0.3% u 3% tal-wisa' tax-xena - 6 sa 60 m fuq livell ta' żewġ kilometri. Id-distanza tal-fokus, l-għoli tal-veduta parallela u l-veloċità tat-titjir isegwu, sabiex il-veduta tasal utilizzabbli;
- **Oqgħod hawn** jqiegħed il-kamera fuq il-punt, imdawra għall-yaw u l-pitch mogħtija, jew kif kienet.

Pożizzjoni mdaħħla bil-yaw u l-pitch tagħha dejjem toqgħod f'dik il-veduta.

### Għażla bil-klikk {#click-to-pick}

Klikk fuq il-veduta - tgħafas u tħalli mingħajr ma tiġbed aktar minn 4 pixels; jekk tiġbed xorta tħares madwar - juri kard fil-kantuniera ta' fuq-xellug b'dak li hemm taħt il-pointer. Waqt li l-[ruler](measure.md) ikun mixħut, il-klikkijiet imorru għar-ruler.

**Punt tad-dejta li jidher jirbaħ.** L-aqrab kampjun fi 8 pixels mill-klikk, minn dawk li jidhru fil-fatt: ir-ringieli fil-finestra tal-ħin u l-ħajja tagħhom, li jgħaddu mill-[filtri](filters.md), il-gruppi murija u l-qsim tad-differenza, ġewwa t-tqattigħ tad-distanza u slice li jaqta' l-heat. Fil-box replay, box taħt il-pointer (fi kwalunkwe post fuqu). Il-kard jelenka kull kolonna li r-ringiel iżomm, taħt l-ismijiet tal-kolonni tas-sors nnifsu - il-ħin (tal-arloġġ, jew is-sekondi tal-fajl bi `m:ss.ss`), il-persuna, il-grupp, is-sessjoni, kull kolonna miżmuma, il-pożizzjoni u d-direzzjoni tal-ħarsa - u d-distanza mill-kamera. Biss kolonni li t-tagħbija żammet jinsabu fil-memorja: kolonna li ma nħtrix bħala [kolonna tal-filtru](column-mapping.md) ma tintwera.

**Inkella l-wiċċ tal-livell**: il-punt fejn ix-xoħ tal-klikk jiltaqa' mat-triangoli reali tal-livell (mhux il-pjan ta' referenza tar-ruler), bil-**parti** li tappartjeni għaliha (l-isem tal-esportatur, `structure:props`, `ground:terrain …`), it-**tip** tagħha (art, struttura, ilma, immaġni tal-mappa), il-koordinati u d-distanza. Ġeometrija moħbija minn slice jew mill-qtugħ tad-distanza tgħaddi minnha. Fejn il-livell għandu [navigation mesh](model-levels.md#navigation-meshes), linja tisimmha u tgħid jekk il-post jinsabx fuqha (✓). Isem ta' parti bil-prefiss `≈` kien immaġinat mill-kaxxi tal-partijiet, għax dik il-parti tal-livell ġiet issimplifikata waqt it-tagħbija.

Il-kard jibqa' sakemm jingħalaq (**×**, `Esc`), klikk ieħor jirrispondi għal xi ħaġa oħra, jew klikk fuq spazju vojt. Salib ċjan jinżel fil-punt fix-xena u ċrieki fuqu fuq l-iskrin. Il-buttuni tiegħu: **ikkopja** (il-valuri kollha, u l-koordinati bħala `x, y, z`), **Ħares lejh**, u **Oqgħod hawn** (fuq punt tad-dejta, billi tħares kif kienet tħares ir-ringiel meta jkun fih direzzjoni tal-ħarsa; fuq wiċċ, 1.7 m fuqu).

Il-livell huwa indiċjat għall-għażla fl-ewwel klikk li jeħtieġha, grilja ta' kolonni fuq il-pjanta tiegħu, mibnija ftit millisekondi kull darba bejn il-frames sabiex il-veduta qatt ma tieqaf (madwar sekonda ta' xogħol għal livell ta' diversi miljuni ta' triangoli), u miżmuma sakemm jinbidel il-livell. Sa dakinhar il-kard jgħid *Qed nipprepara l-livell għall-għażla* b'perċentwal, u jwieġeb il-klikk meta jkun lest. Tfittxija ta' punt tad-dejta fuq aktar minn erba' miljun ringiel li jidher titqassam fuq frames bl-istess mod.

## Fond tal-kamp {#depth-of-field}

Taqsima li tinfetaħ u tingħalaq fi Kamera u xena, bit-titolu *Fond tal-kamp - on* waqt li tkun attivata. Off b'default: hija effett ta' preżentazzjoni, u l-veduta default għandha turi d-dejta u mhux interpretazzjoni tagħha.

| Kontroll | Default | Firxa (jog) | Tfisser |
|---|---|---|---|
| **Attivat** | off | | |
| **Iffoka fuq dak li ddaħħal fil-qafas** | on | | Iffoka fid-distanza li użat l-aħħar qafas (*Iffukat fuq N m.*). |
| **Distanza tal-fokus** | 1000 | 1-200,000, logaritmika (10,000,000) | Murija meta l-fokus ikun manwali. |
| **Apertura** | ±35% | ±2% sa ±200%, logaritmika (±3200%) | Il-fond miżmum ċar, bħala frazzjoni tad-distanza tal-fokus - relattiv u mhux numru f (f-number), għax il-iskejjen jvarjaw minn kamra sa mappa ta' tmien kilometri. |
| **Ċajpir massimu** | 12 px | 1-48 (256) | L-akbar raġġ tal-ċajpir; l-ispiża tiskala magħu. |

Ċajpirja biss **il-livell, il-grilja u l-kaxxi** - *mhux is-heat*. Is-heat f'pixel huwa s-somma ta' sprites f'ħafna fondi, allura m'għandux fond wieħed li jkun barra mill-fokus; li tagħmlu ċajpir bil-ġeometrija li tinsab wara tiegħu tkun żbaljata kullimkien fejn joqgħod jilleva quddiemha. Id-dejta ċara fuq kuntest imrażżan hija wkoll l-aktar utli minn tnejn. Iċ-ċajpir huwa ġabra ta' 24 tap ta' angolu tad-deheb fil-pass tal-kompożizzjoni, imqassma sabiex il-forgrawnd ċar ma jiġix imdewweb 'il barra mill-isfond imċajpar warajh. Jekk tbiddlu, jerġa' jsir ir-rendering mingħajr ma jerġa' jibda l-akkumulazzjoni tas-heat.

## Riżoluzzjoni tal-kanvas {#canvas-resolution}

Il-kanvas jitqiegħed fir-rendering bil-proporzjon tal-pixel tal-iskrin, limitat għal 2. Il-buffer tas-heat jista' jitqiegħed fir-rendering b'riżoluzzjoni iktar baxxa minn hekk ([Riżoluzzjoni tas-heat](performance-and-stats.md)).

## Paġni f'din it-taqsima {#pages-in-this-section}

- [Gamepad u HOTAS](gamepad.md)
- [Referenza tat-tastiera u tal-mouse](keyboard-reference.md)
