---
title: "Figuri"
parent: "Replay"
nav_order: 3
has_children: true
lang: "mt"
source: "figures.md"
source_hash: "7040eba3b7ac"
translated: true
outdated: false
---

# Figuri

**Figura** hija mudell 3D żgħir ta' dak li unità tassew hija: tank, jet, bastiment, suldat. Il-[replay](match-replay.md) jpinġi kull unità bħala l-figura tagħha f'daqs reali, minflok kaxxa sempliċi.

Hemm madwar 2,000 vettura, ajruplan, bastiment, arma u suldat b'isem, kollha mibnija mill-viewer innifsu.

![Tankijiet tad-demo mpinġija bħala l-figuri tagħhom stess](../assets/img/mt/replay-tanks.webp)

## Dak li hemm fil-katalogu {#what-is-in-the-catalogue}

| Qasam | Eżempji |
|---|---|
| Persuni | suldat wieqaf, qed jitgħawweġ, mistqarr; sniper, anti-tank, medic, crew |
| Art | tankijiet, vetturi tal-infanterija bil-gwerra, difiża mill-ajru, artillerija, trakkijiet u karozzi, ferrovija u trammijiet |
| Ajru | fighters, ajruplani tal-attakk, bombers, transporti, elikotteri, mill-biplanes sa jets moderni |
| Baħar | bastimenti tal-gwerra skont il-klassi, carriers, sottomarini, dgħajjes, merkantili |
| Armi | missili, razzi, bombi, torpedni, flares u chaff |
| Markers | grenades tad-duħħan, tal-flash u tan-nar, bombi mħawlin, bnadar, spawns, waypoints |
| Ġlieda mill-qrib | suldati b'plate carriers b'xkubetta tal-attakk, SMG, shotgun, DMR, LMG, pistola jew tarka; drones, kameras, wajer xewwieki, tarki, rinforz tal-ħitan, barrikati, karigi tal-ksur, nases, twieqi, granati, id-defuser |

## Kif isiru l-figuri {#how-the-figures-are-made}

- **Mibnija minn dimensjonijiet ippubblikati.** Ħafna mill-figuri jsiru mill-builder tal-figuri tal-viewer stess minn numri pubbliċi: tul, wisa', għoli, roti tat-triq, torri u kanun, ġwienaħ u denb. Il-forma tagħhom imbagħad tiġi aġġustata kontra ritratti pubbliċi, disinji u dimensjonijiet ippubblikati. Ma jintuża l-ebda mudell ta' logħba.
- **Mudelli ħielsa.** Xi figuri jużaw mudelli 3D ħielsa (CC0 jew CC BY) fejn huma iktar veri, xi drabi flimkien mal-ġisem mibni. L-awturi ta' xogħlijiet CC BY huma kkreditati fuq [Krediti tal-figuri](figure-credits.md); xogħlijiet CC0 ma jeħtieġux kreditu u ma jidhrux hemm.
- Kull figura għandha verżjoni sħiħa, waħda approssimattiva u waħda għall-bogħod (livelli ta' dettall, LOD), biex jinġibdu eluf fl-istess ħin.

## Liema figura tingħata lil unità {#which-figure-a-unit-gets}

Il-viewer iħares lejn il-kolonni tad-dejta stess:

1. **Ismijiet** - kolonni msejħa *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* jew *Figure* - jitqabblu mal-katalogu: eżattament, permezz ta' madwar 4,000 alias (ID-ijiet tal-unitajiet ta' diversi logħob), bl-aktar bidu twil magħruf (`F-16C_50` huwa l-F-16C), jew bl-isem iqsar tal-figura li jibda bih.
2. Isem li l-figura tiegħu ma taqbilx mat-**tip** tal-unità ma jintużax (trakk imsejjaħ *Typhoon* mhuwiex il-fighter).
3. **Tipi** - kolonni msejħa *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* jew *Domain* - jagħtu figura tal-klassi: tags ta' Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikoni tal-mappa, jew kliem sempliċi (tank, helicopter, infantry).
4. Dejta li m'għandha xejn minn dawn hija dejta ta' persuni: kulħadd huwa suldat.

Allura l-aktar mod faċli biex tikseb il-figuri t-tajbin huwa kolonna `vehicle` bl-ismijiet veri, jew kolonna `type` bi tags ta' Tacview.

**L-unità tiegħi tidher bħala kaxxa jew bħala suldat.** Żid kolonna `vehicle` bl-isem reali, jew kolonna `type` b'tag ta' Tacview. Ħalli l-mouse fuq l-unità biex tara liema isem intlaħaq. Dejta b'dawn il-kolonni iżda li ma tgħid xejn dwar unità tħalliha kaxxa; dejta mingħajr dawn tintwera bħala suldati.

## Figuri tal-ġlieda mill-qrib (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Tabelli miktuba bħal dawk tal-qarrej tar-replays ta' Rainbow Six Siege (kolonni `operator`, `pawn`, `primaryClass`, `side`) jieħdu figuri tagħhom:

- **Il-plejers** huma l-operator tagħhom. Kull wieħed mit-78 operator għandu figura tiegħu, twila madwar 1.8 m, bil-ħwejjeġ tiegħu: żewġ jew tliet kuluri għall-ġakketta, il-qalziet u t-tagħmir, skont id-dehra pubblika tas-soltu tagħhom (iswed, żebbuġi, kannella ċar, griż urban, abjad, blu skur, b'tagħmir aħmar, oranġjo jew teal). U bil-forom tagħhom, terz akbar milli fil-ħajja fejn iridu jidhru minn fuq: dak li jilbsu fuq rashom (elmi, viżiera jew elmu tqil, kappelli bil-ponta, beanies, berretti, kappell boonie wiesa' jew kappell tal-pil, kapuċċi, xalpi, xagħar), il-wiċċ (goggles, maskra tal-gass, nuċċali, maskra, daqna, goggles bi tliet lentijiet), bini ħafif, medju jew tqil (dawk tqal huma wesgħin, bi pjanċi kbar fuq l-ispallejn u kullar), kowt twil jew libsa, ghillie, dak li jġorru fuq daharhom (martell, karigi, drones, kontenituri, tank tal-fjuwil, tubu ta' launcher, crossbow, pannelli, jammer, tarka) jew fuq driegħhom (launcher, driegħ tal-metall), it-tarka tagħhom (waħda għolja, tarka tar-rewwixti, waħda bid-dwal), u kulur ta' enfasi fuq l-ispallejn. Iżommu l-klassi tal-arma primarja tagħhom. Operator li l-viewer ma jafx huwa suldat sempliċi bi plate carrier fil-kulur tat-tim.
- **In-naħa** tidher separata mill-ħwejjeġ: ċirku fl-art taħt kull operator, **ambra għall-attakk, cyan ċar għad-difiża**, bil-kulur tat-tim ġewwa fih, u faxex fuq id-driegħ u r-ras bl-istess kulur. Kolonna `stance` (wieqaf, mitgħawweġ, mimdud) tagħtihom il-pożizzjoni; mingħajrha jibqgħu weqfin.
- **Jingħarfu mill-bogħod tar-replay:** meta jinħarġu 48 pixel għoljin minn fuq u minn tliet kwarti, kull żewġ operators fl-istess naħa jvarjaw b'differenza ċara fil-kulur jew b'forma differenti (it-testijiet tal-viewer jiċċekkjaw dan).
- **It-tikketti** jsemmu l-plejer u l-operator li qed jilgħab f'dak il-mument, bir-rwol tal-operator bħala simbolu: ✸ ksur iebes, ⚒ ksur artab, ➤ dħul, ✦ fragger, ✚ appoġġ, ⬟ tarka, ◉ intelliġenza, ◇ flessibbli, ↺ għassa tal-ġenb, ⚓ ankra, ✕ nassab, ⇄ roamer, ↯ kontra l-gadgets, ▣ kontra l-ksur.
- **Id-drones** huma drone b'żewġ roti li jintefa', wiesa' madwar 30 cm. Kull wieħed huwa track tiegħu, imsemmi għas-sid tiegħu (“Ash · drone 2”).
- **Il-gadgets imqiegħda** jibqgħu fejn tqiegħdu, minn dak il-ħin sal-aħħar tar-round. Kull wieħed għandu l-figura ta' dak li jagħmel: kamera, wajer xewwieki, tarka li tinfetaħ, karga tal-ksur, karga tal-ksur iebes, karga żgħira li teħel, nassa tal-art, claymore bil-laser tal-iskattar tagħha, tieqa b'direzzjoni waħda, pannell tal-armatura, granata, kontenitur tal-gass, jammer, sensor, bieb tal-laser, kaxxa tal-provvisti. Figura waħda sservi kull gadget li jagħmel l-istess xogħol. Gadget li d-dejta ma tgħidx x'tip hu huwa apparat żgħir b'dawl.
- **Id-defuser** jibqa' fejn tħawwel, għall-45 sekonda tiegħu.

Kull drone u gadget isir track tiegħu meta jitgħabba l-fajl, għalhekk il-figura tal-plejer stess tibqa' fuq ġismu. L-operators huma forom simplifikati skont id-deskrizzjonijiet u l-arti pubbliċi tagħhom (dak li jilbsu, l-apparat li huwa l-abbiltà tagħhom), u l-gadgets għandhom forma skont dak li jagħmlu. Dawn kollha huma disinji tal-viewer stess fid-daqs reali tal-oġġett (claymore wiesa' madwar 22 cm, pannell daqs bieb ta' 1 m b'2.1 m), mhux mudelli mil-logħba.

## Settings {#settings}

Is-sezzjoni **Figures** tas-sidebar tar-replay tissettja d-daqs, id-daqs l-iżgħar fuq l-iskrin, dak li jsiru l-unitajiet tal-bogħod (figura, vleġġa, simbolu), u l-effetti mpinġija fuqhom. Ara [Replay tal-partita](match-replay.md#figures). Duħħan, nar u effetti oħra bil-ħin: [Figuri fl-overlay tal-figuri](figure-replay.md).

## Pakkett lokali fakultattiv tal-figuri {#an-optional-local-figure-pack}

Tista' żżomm pakkett fakultattiv tal-figuri tiegħek stess fuq il-magna tiegħek stess. Il-figuri tiegħu jieħdu post il-figuri tal-katalogu bl-istess ismijiet. Qatt ma jkun parti mir-repożitorju jew minn bini ppubblikat; mingħajru, xejn ma jinbidel.
