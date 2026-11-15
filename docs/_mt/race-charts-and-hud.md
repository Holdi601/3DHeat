---
title: "Grafiċi u l-HUD"
parent: "Analiżi tat-tellieqa"
nav_order: 53
lang: "mt"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Grafiċi u l-HUD

Il-grafiċi jqiegħdu d-dawriet tiegħek wieħed wieħed, metru b'metru, sabiex tara fejn sewwieq wieħed ibbrejkja iktar tard jew neħħa l-gass iktar kmieni. Il-karti fin-naħa ta' fuq xellug tal-view juru x'qed jagħmel kull karozza u sewwieq issa.

![Grafiċi taħt il-view: ringieli tal-gap, veloċità, gass, brejk u sterzar għal żewġ dawriet, iż-żewġ strixxi tal-ħin u tal-kawża fuq nett, u l-kursur bil-karti](../assets/img/en/race-charts-rows.webp)

## Il-grafiċi {#the-charts}

Kull dawra fuq assi tad-distanza waħda - metri tul ir-referenza (ara [assi tad-distanza waħda](race-corner-analysis.md#one-distance-axis)) - sabiex l-istess x ikun l-istess post fuq it-triq għal kull dawra. Dawra waħda titqiegħed fuq il-grafika waħedha (u titlaq il-playback); it-tieni dawra tal-istess korsa titqiegħed kontriha. Meta ma jkun hemm l-ebda dawra mgħobbija (jew meta l-analiżi tkun falliet) iż-żona tgħid "Il-grafiċi jidhru ladarba tkun mgħobbija dawra; tella' waħda oħra tal-istess korsa biex tqabbel iż-żewġ."

### X'hemm fuqhom {#what-is-on-them}

- **Il-leġġenda**: il-kulur u t-tikketta ta' kull dawra fuq il-grafika, ir-referenza mmarkata "(reference)"; "+N oħra mpinġija, mhux fuq il-grafika" meta jkunu viżibbli iktar dawriet milli jkunu fuq il-grafika; **Grafiċi (N) ▾**; **Id-dawra kollha** waqt li tkun iżżum; linja waħda ta' gwida.
- **Żewġ strixxi** fin-naħa ta' fuq, għad-dawra fokussata:
  - *ħin*: il-[mappa taż-żmien](race-replay-and-scene.md#time-map-where) bħala strixxa, aħmar meta titlef, aħdar meta tirbaħ;
  - *kawża*: kull telf tagħha bħala barra fuq il-post tal-kawża tiegħu, bil-kulur tal-kawża; agħmel hover fuq barra biex tara t-titlu u l-kost tagħha.
- **Fasċi tal-kurvi**: fascia b'dell minn fl-idħol ta' kull kurva sal-ħruġ tagħha (kif tinstab fuq ir-referenza) u ismha (`T1` …) taħt l-assi fil-qofol.
- **Is-sejba magħżula**: fascia bil-kulur tal-kawża tagħha fuq il-medda tagħha.
- **Ir-ringieli** (grafiċi), wieħed għal kull kanal magħżul, kull wieħed bl-isem tiegħu u l-qiegħ u l-quċċata tal-medda tiegħu fuq ix-xellug, linja taż-żero fejn il-medda tgħaddi miż-żero. Kull dawra hija linja bil-kulur tagħha: id-dawra fokussata 2 px wiesgħa u opaka, ir-referenza opaka, l-oħrajn 1.5 px b'75%. Ir-ringiela tal-gap titlaq barra r-referenza (hija żero għaliha nnifisha).
- **Il-kursur**: linja vertikali fejn tinsab il-karozza tar-referenza (jew fejn ikun il-pointer), u tikka għal kull karozza fuq kull ringiela ħlief il-gap - fil-kursur kull karozza tkun fl-istess metru; inkella d-distanza ta' kull karozza fil-arloġġ tal-replay.

L-iktar **8** dawriet jitqiegħdu fuq il-grafika: id-dawra fokussata, l-aħjar tal-klassi tagħha u r-referenza l-ewwel, imbagħad l-oħrajn skont l-ordni tat-tagħbija.

### Ir-ringieli u l-għoljiet tagħhom {#rows-and-their-heights}

Ir-ringieli jaqsmu l-għoli tal-grafika skont il-piż, l-ebda wieħed iktar baxx minn 16 px:

| Ringiela | Piż |
|---|---|
| Gap (għar-referenza, sekondi, b'sinjal) | 1.7 |
| Veloċità (km/h) | 1.7 |
| pedala (gass, brejk, clutch) | 1 |
| sterzar | 1.1 |
| gear | 0.8 |
| lampa (handbrake, ABS …) | 0.55 |
| kull ħaġa oħra | 1 |

Kanal li għandu medda murija fissa fit-tabella (pedali 0-100%) juża dik; l-oħrajn jitħaddmu mal-parti viżibbli tad-dawriet. Isem ta' ringiela twil wisq għall-post (kelma twila f'lingwa oħra) jniżżel il-valur ta' fuq linja fejn ir-ringiela tkun għolja biżżejjed, u jinqata' b'ellipsis fejn ma tkunx; l-isem sħiħ ikun it-tooltip.

### Il-grafiċi default {#the-default-graphs}

Sakemm ma jkunux magħżula grafiċi: il-**gap**, imbagħad kull kanal li t-tabella timmarka `graph` u li d-dawriet fihom - gass, brejk, clutch, handbrake, sterzar, gear, veloċità - ħlief li pedala jew lampa titħalla barra sakemm xi dawra tmexxiha 'l fuq minn 0.02 (clutch li qatt ma tinħeba ma tkunx grafika). L-ordni hija dik tat-tabella.

### L-għażla tal-grafiċi {#the-graph-picker}

**Grafiċi (N) ▾** jiftaħ panew 'il fuq mill-buttuna:

- kaxxa tat-tfittix (taqbel ma' isem jew id ta' kanal);
- **Default** (lura għas-sett default; it-tooltip tgħid kemm huma) u **Agħlaq**;
- *Gap għar-referenza*, imbagħad kull kanal li d-dawriet mpinġija fihom iġorru, mqassma f'gruppi (moviment, kontrolli, magna, għajnuniet, tajers, brejkijiet, sospensjoni, roti, oħrajn, ħin, pożizzjoni), b'checkbox għal kull wieħed; kanal għal kull rota huwa linja waħda b'tikketta għal kull rota (FL, FR, RL, RR).

L-għażla żżomm l-ordni tat-tabella, kemm-il-darba tkun ikklikkjat. L-għażla żżomm sakemm tkun **Default** jew terġa' tgħabbi l-viewer. Il-kanali li t-tabella ma tafx jiġu offruti taħt *oħrajn*, imsemmija skont l-id tagħhom stess ("brakeLinePress" → "Brake line press").

### Hover, rota, zoom, klikk {#hover-wheel-zoom-click}

| Input | Jagħmel |
|---|---|
| hover | kull karozza, il-karta tagħha u l-kontrolli tagħha jmorru f'dak il-metru; post jimmarkah fuq it-triq; tabella telenka l-valur ta' kull dawra fuq il-grafika fuq kull ringiela hemm (il-gap juri "ref" għar-referenza); fuq il-karti, "f'N m - il-kursur tal-grafiċi". Meta tgħaddi barra mill-pjan, tmur lura għar-replay |
| rota | timxi r-replay tul id-dawra b'1/200 mill-medda murija għal kull tikka (Shift: 5×), biex tiqaf ir-replay; meta tkun iżżum, il-view isegwi l-kursur |
| Ctrl+rota (Cmd+rota) | jiżżum l-assi tad-distanza fuq il-pointer, 1.25× 'il barra / 0.8× 'il ġewwa għal kull tikka, qatt aktar dejqa minn 40 m; iżżum 'il barra għad-dawra kollha itemm iż-zoom |
| rota laterali | jimxi fil-view meta tkun iżżum (10% tal-medda għal kull 100 unità ta' skrollar) |
| double-click, **Id-dawra kollha** | iżżum 'il barra |
| klikk | iqiegħed ir-replay fejn ir-referenza tilħaq dak il-metru |
| Shift+klikk | iqabbad il-karozzi f'dak il-post (ara [l-allinjament](race-replay-and-scene.md#lining-up)) |

Il-grafiċi jerġgħu jinpinġew bil-lingwa l-ġdida meta tinbidel.

Il-linja tan-noti fil-leġġenda tgħid l-istess b'mod qasir: "Hover: kull karozza hemm · rota: timxi tul id-dawra · Ctrl+rota: zoom · klikk: aqbeż · Shift+klikk: allinja".

## Il-karti tal-karozzi (HUD) {#the-car-cards-hud}

Fin-naħa ta' fuq xellug tal-view, karta għal kull dawra viżibbli - l-iktar **6**, l-ewwel sitt dawriet viżibbli skont l-ordni tat-tagħbija - għall-mument li fih ir-replay (jew il-kursur tal-grafiċi) jinsab.

**Intestatura:** il-kulur u t-tikketta tad-dawra; il-gap ħaj - il-ħin ta' din id-dawra biex tasal għad-distanza attwali tagħha nieqes il-ħin tar-referenza biex tasal għall-istess distanza, "+0.48 s" - jew "reference"; **⋯** biex turi jew taħbi kull valur ieħor (l-istess bħal *Il-valuri kollha fuq il-karti*). Il-karta tal-karozza segwita titwessa'.

**Il-karozza minn fuq:** il-kontorn tal-ġisem bil-kulur tad-dawra b'vleġġa fuq quddiem, erba' tajers (ir-roti ta' quddiem imdawra sa 28° mal-isterżar), kull wieħed bil-kulur tat-temperatura tiegħu, bl-istess simboli bħall-karozza 3D impinġija ċatta: ċirku tal-isliep, barra tas-sospensjoni, dawl tal-brejk, fascja tal-konsum, barra tal-piż.

**Qari:** veloċità f'km/h, il-ħin tad-dawra stess, id-distanza tagħha tul ir-referenza.

**Kontrolli:**

- rota tal-isterżar imdawra bl-input tal-isterżar (rotazzjoni sħiħa tinġibed bħala 180°) bil-persentaġġ taħtha;
- barra għal kull pedala, minn tal-lemin għal tal-lemin kif f'kaxxa tal-pedali - clutch, brejk, gass - kull waħda bil-persentaġġ u l-isem qasir tagħha, bil-kulur tagħha (biss il-pedali li d-dawra fihom);
- il-gear (R għal reverse, N għal neutral);
- lampa żgħira għal kull kanal ta' on/off li d-dawra fiha - handbrake, ABS, TC, DRS, pit limiter, fl-ajru - mixgħula bil-kulur tagħha waqt li tkun mixgħula (fuq nofs il-medda tagħha);
- qari għal kull kanal ta' livell: brake bias, settings tal-ABS u tat-TC, boost, fuel.

**It-traċċa tal-kontrolli:** l-aħħar **6 sekondi** ta' kull pedala (lane waħda, kull waħda bil-kulur tagħha) u l-isterżar (lane tagħha, fiċ-ċentru), li jispiċċa f'dan il-mument - dak li s-sewwieq għamel fi triqtu lejh. Sa 160 punt.

**Il-valuri kollha** (⋯ jew *Il-valuri kollha fuq il-karti*): kull skalar ieħor li d-dawra għandha f'dan il-mument, imbagħad kull kanal ta' kull rota bħala erba' valuri (FL FR RL RR), imsemmija mit-tabella tal-kanali jew mill-isem tal-kanal stess, ordnati skont il-grupp.

## Għall-iżviluppaturi {#for-developers}

Kodiċi: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### It-tabella tal-kanali {#the-channel-table}

`CHANNELS` f'[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) hija l-uniku post fejn kanal jiġi deskritt: l-unità tiegħu, jekk huwiex valur wieħed għal kull kampjun jew wieħed għal kull rota (maħżun bħala `name.FL` …), il-grupp tiegħu, medda tal-wiri, kif jinġibed fuq il-karozza (`glyph`), kif jidher fuq il-karta (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), jekk huwiex grafika default, jekk jaqbżu minflok jitħalltu (gear, flags), u kif jintwera (skala, unità, digits). It-tikketti u l-ismijiet qosra huma messaġġi f'kull lingwa (`race.channel.<name>.label` / `.short`).

Kanali b'tpinġija jew b'grafika default:

| Kanal | Unità | Miżjud bħala | Grafika default |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedala (aħdar, aħmar, …), murija f'% | iva |
| `handbrake` | 0..1 | lampa | iva |
| `steer` | -1..1, il-lemin pożittiv | rota tal-isterżar | iva |
| `gear` | - | gear | iva |
| `speed` | m/s, murija km/h | - | iva |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lampa | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | qari tal-livell | - |
| `tireTemp` (għal kull rota) | °C, wiri 40-130 | kulur tat-tajer | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (għal kull rota) | kif il-logħba tiskalah, wiri ±1.5 | ċirku tal-isliep | - |
| `combinedSlip`, `slipIndex` (għal kull rota) | wiri 0-1.5, 0-1 | ċirku tal-isliep | - |
| `suspension` (għal kull rota) | 0..1 | barra tas-sospensjoni | - |
| `brakeTemp` (għal kull rota) | °C, wiri 100-900 | dawl tal-brejk | - |
| `tireWear` (għal kull rota) | 0..1 | fascja tal-konsum | - |
| `wheelLoad` (għal kull rota) | N, wiri 0-12 000 | barra tal-piż | - |

Oħrajn fit-tabella (murija fuq grafika u elenkati, mhux mpinġija): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (angolu tad-drift), `loose`, `lateral` (spostament mir-referenza),
`rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, flimkien ma' `time`, `distance`, `x`, `y`, `z`.

**Kanal li mhuwiex fit-tabella** xorta jinqara, jitpoġġa fuq grafika (taħt *oħrajn*) u jiġi elenkat fuq il-karti, b'tikketta mill-isem tiegħu stess. **Biex jingħata isem, unità u tpinġija xierqa**, żid dħul wieħed fit-tabella (u l-messaġġ tat-tikketta tiegħu f'kull `src/i18n/locales/<language>/race-channels.json`). Tip ġdid ta' tpinġija ta' rota huwa dħul wieħed f'`WHEEL_GLYPHS` (glyph.ts) u l-ġemel flat tiegħu `CARD_GLYPHS` (RaceHud.tsx); it-tnejn huma tipizzati bit-tip, għalhekk il-build jaqa' sakemm jeżistu t-tnejn. `src/race/extensible.test.ts` jiċċekkja li kanali mhux magħrufa jaslu għall-grafiċi, li kull glyph fit-tabella jista' jinħadem, u li l-lampi jiddawlu.
