---
title: "Għarfien"
nav_order: 7
has_children: true
lang: "mt"
source: "insights.md"
source_hash: "c8722ac44bfa"
translated: true
outdated: false
---

# Għarfien

**Għarfien** iħares fid-data mgħobbija għal dak li joħroġ - pożizzjonijiet b'saħħa, art mortali, trappoli tal-bidu, punti ta' konġestjoni, plejers 'il fuq minn sħabhom ħafna - u jgħidlek, l-iktar qawwi l-ewwel, bl-evidenza. Uża dan biex titgħallem f'minuta fejn intrebħet jew tilfet partita. Imbagħad jista' jikteb sommarju, u f'replay wieħed jista' jaġixxi bħala kummentatur li jiggwida għall-mumenti kbar.

Kollox jiġi għodd fil-browser tiegħek. Xejn ma joħroġ mill-kompjuter tiegħek sakemm ma tixgħel AI esterna (ara [AI esterna](#external-ai)).

![Għarfien fuq id-demo tat-tanks: 14-il sejba, l-iktar qawwi l-ewwel](../assets/img/mt/insights.webp)

It-taqsima **Għarfien** tinsab fis-sidebar tat-tabs Heatmap u Partita. Għandha tlett tabs: **Sejbiet**, **Sommarju** u **Kummentatur**.

## Sejbiet {#findings}

1. Ittella' d-data u iftaħ **Għarfien**. Agħfas **Sib għarfien** ("Qed jgħodd… n%" juri l-progress).
2. Aqra l-lista. Kull sejba għandha barra tal-qawwa, sentenza, kemm hi tajba l-evidenza (*Evidenza qawwija*, *Evidenza tajba* jew *Ftit evidenza*), liema detector sabha, u l-klassi tal-vettura fejn dan jimporta.
3. **Ikklikkja sejba**: il-viewer japplika l-filtri tagħha, iwassal il-kamera għall-post u jimxi għall-ħin, u jiftaħ id-dettalji: l-effett bl-intervall tiegħu ta' 95%, il-valuri p u q, l-evidenza miżmuma, u **Volum hawn**, li jpitti [volum](volumes.md) madwar il-post.
4. **Irrestawra l-filtri** iqiegħed lura l-filtri tiegħek. **Ikkopja JSON** jikkopja r-rapport kollu.

Il-għadd juża l-filtri attwali, il-gruppi moħbija u l-partita magħżula fuq il-medda taż-żmien kollha. Meta tbiddel il-filtri wara, nota tgħid hekk; agħfas **Għodd mill-ġdid**.

Il-linji fil-quċċata tal-lista (pereżempju t-totali tal-flus) jiġbru d-data kollha qabel is-sejbiet.

![Sejba miftuħa: iż-żona sħuna tal-tir, in-numri tagħha, u silta xierqa mil-letteratura](../assets/img/mt/insights-finding.webp)

### Id-detectors {#the-detectors}

| Detector | X'isib | Teħtieġ fid-data |
|---|---|---|
| **Pożizzjonijiet tal-qawwa** | Postijiet b'probabbiltà ta' qtil għal mewt ħafna aħjar mill-bqija tal-mappa, u *art sikura* fejn ftit jmutu għall-ħin li jqattgħu | avvenimenti ta' kill u death |
| **Żoni sħan u kesħin** | Postijiet fejn tip ta' avveniment (tiri, laqtiet, kapturi ...) jseħħ ħafna iktar jew inqas milli l-ħin qattgħu hemm jbassar | kolonna ta' avveniment |
| **Art miftuħa u kenn** | Mewt fl-art miftuħa kontra ġometrija vicin tal-livell, u bil-mod kontra moviment mgħaġġel | mwiet; livell 3D għall-parti tal-ġometrija |
| **Spawns** | Spawns b'saħħa, trappoli ta' spawn, spawns sikuri, il-ħin għall-ewwel kuntatt | ħin u persuni |
| **Klassi skont il-post** | Klassi ta' vettura, jew plejers kontra AI, li jagħmlu ħafna aħjar jew agħar f'żona | kills flimkien ma' klassi ta' vettura jew kolonna ta' plejer/AI |
| **Plejers** | Plejers li jqatlu jew jmutu ħafna iktar jew inqas minn oħrajn fl-istess klassi | persuni u kills |
| **Konġestjonijiet u ġnub** | Punti ta' konġestjoni (ħafna iktar traversi milli l-art madwarhom) u toroq ta' ġnub (użati ftit, imma jwasslu għal kills) | persuni |
| **Valur** | *Art għalja* u *Art li tgħib* | [kolonni tal-valur](value-weighting.md) |
| **X’iddeċieda r-rawnds** | X'iddistingwa r-rawnds mirbuħa minn dawk mitlufa, u l-plejers li żiedu jew swew l-aktar probabbiltà ta' rebħ (ara [Min rebaħ](#who-won-what-decided-the-rounds)) | rawnds, qtil u mwiet, u l-[kolonni tar-riżultat](data-formats.md#outcome-columns) (`won`) |

Id-detectors li ma jistgħux jaħdmu fuq id-data jidhru f'isfel bir-raġuni.

### Kif jitqiegħdu s-sejbiet {#how-findings-are-ranked}

Kull post jew grupp jiġi ttestjat kontra l-bqija tal-mappa (testijiet binomjali eżatti jew tar-rata). Ir-rata ta' skoperta falza (false discovery rate) tinżamm fuq 5% (Benjamini-Hochberg). Il-każwalità tista' tidher bħala mudell; dan iżomm l-allarmi foloz baxxi: fost is-sejbiet murija, madwar wieħed minn kull għoxrin huwa mistenni li tkun każwali. Effetti minn ftit avvenimenti jinġibdu lejn "l-ebda effett" qabel ma jitqiegħdu. Jintwerew l-iktar 60 sejba, u kull detector jieħu ftit postijiet fuq nett.

### Min rebaħ: x'iddeċieda r-rawnds {#who-won-what-decided-the-rounds}

Meta d-dejta tgħid min rebaħ kull rawnd (il-[kolonna tar-riżultat](data-formats.md#outcome-columns) `won`: CS2, Rainbow Six Siege, War Thunder ...), ir-riżultat huwa dak li dwaru jitkellem l-Għarfien. Għal kull naħa jaqsam ir-rawnds skont x'ġara fihom u jqabbel ir-rati ta' rebħ:

| Fattur | Ir-rawnds tan-naħa bih | ... u mingħajru |
|---|---|---|
| Duell tal-ftuħ | għamlet l-ewwel qtil | mietet l-ewwel |
| Xiri | ix-xiri tagħha kien aħjar minn tan-naħa l-oħra | agħar |
| L-ewwel mewt ivvindikata | l-ewwel mewt tagħha ġiet ivvindikata fi żmien 5 s | ma ġietx ivvindikata |
| Plant | għamlet plant | l-ebda plant |
| Utilità | aktar granati mir-rawnd tas-soltu tagħha | inqas |
| Kuntatt kmieni | l-ewwel duell ġie qabel il-ħin medjan tal-partita | aktar tard |
| Post miżmum | plejer qagħad fil-post 5 s jew aktar | ħadd |
| Post milħuq kmieni | plejer wasal hemm fl-ewwel 25 s (ir-rotta) | ħadd |

Kull tqabbil huwa differenza bejn żewġ rati ta' rebħ bl-intervall ta' 95% tagħha (Newcombe), il-p eżatt ta' Fisher, u q fuq kull fattur ittestjat (Benjamini-Hochberg). Fergħa b'inqas minn 8 rawnds hija mmarkata *ftit rawnds*. Dawk taħt ir-rata ta' skoperta falza ta' 5% isiru sejbiet; l-aktar b'saħħithom jitqiegħdu 'l fuq minn dawk tad-detectors l-oħra (sejba tar-riżultat tiżen 1.35 darbiet daqs waħda bl-istess effett u evidenza).

Eżempju maħluq fuq 40 rawnd:

> **T** rebħet 79% tad-19-il rawnd li fihom żammet **Mid**, kontra 24% tal-21 mingħajru (55 punt, 95% minn 26 sa 74) - q 0.004.

Isegwi wkoll il-**probabbiltà ta' rebħ** tar-rawnd - iċ-ċans li kellha kull naħa f'kull mument, mill-irġiel ħajjin, il-plant u l-arloġġ: imqabbla mar-rawnds meta jkunu 30 jew aktar, inkella minn mudell a priori fiss (u t-test jgħid liema). Minnha jiġu l-**punti ta' bidla** (il-qtil u l-plants li ċċaqilqu l-aktar iċ-ċans) u l-**probabbiltà ta' rebħ miżjuda** ta' kull plejer: il-qtil u l-plants li għamel jgħoddu favurih, il-mwiet tiegħu kontrih, f'valur ta' rawnds matul il-partita, bħala medja għal kull rawnd bl-intervall tagħha, ittestjata kontra żero. Il-postijiet jieħdu l-istess bilanċ: liema naħa kisbet l-aktar fid-duelli li saru hemm.

Id-dejta teħtieġ rawnds, qtil u mwiet biż-żewġ naħat, u l-kolonna `won`; postijiet bl-isem (`place`) għall-postijiet miżmuma, kolonna `buy` għax-xiri.

## Sommarju {#debrief}

It-tab **Sommarju** jikteb is-sejbiet f'test qasir: introduzzjoni, l-iktar sejba ċara, waħda għat-tattika, waħda għall-bilanċ, imbagħad - meta d-dejta tgħid min rebaħ - x'iddeċieda r-rawnds, il-bqija mqassma skont id-detector, u kemm minnhom jistrieħu fuq evidenza iktar dgħajfa.

X'iddeċieda r-rawnds jiġi f'erba' paragrafi: il-punteġġ u minn fejn ġejjin il-probabbiltajiet ta' rebħ; l-aktar fatturi b'saħħithom bin-numri, l-intervall u l-q tagħhom (meta ebda wieħed ma jgħaddi r-rata ta' skoperta falza, it-test jgħid *għadu xejn ċert* u xorta jsemmi l-aktar wieħed b'saħħtu); l-akbar tliet punti ta' bidla; u l-plejers li żiedu u swew l-aktar probabbiltà ta' rebħ, mal-postijiet li kisbu l-aktar. Eżempju maħluq:

> T rebħet 23 u CT rebħet 17 minn 40 rawnd b'riżultat magħruf (T: 58%, 95% minn 42% sa 72%). Il-probabbiltajiet ta' rebħ ġejjin minn mudell imqabbel ma' dawn ir-rawnds.
>
> X'iddistingwa r-rawnds mirbuħa minn dawk mitlufa: T rebħet 79% tad-19-il rawnd li fihom żammet Mid, kontra 24% tal-21 mingħajru (55 punt, 95% minn 26 sa 74) (q 0.004), ...
>
> Punti ta' bidla: rawnd 17 f'48 s, qtil minn CT f'B site ċaqlaq iċ-ċans tagħha minn 31% għal 58%, u ħadet ir-rawnd, ... Kull paragrafu għandu buttuni nnumerati li juru s-sejbiet tiegħu. **Ikkopja t-test** jikkopjah.

![Is-sommarju miktub mill-narratur ta' ġewwa](../assets/img/mt/debrief.webp)

In-narratur ta' ġewwa jaħdem offline, fil-lingwa tiegħek. Is-selector **Lenti** ta' fuqu (ara [Il-lenti tal-għarfien](knowledge.md)) jiddeċiedi liema letteratura tiċċita l-paragrafi.

### AI esterna {#external-ai}

**Settings tal-AI** tħalli mudell tal-AI tal-għażla tiegħek jikteb is-sommarju minflok:

| Setting | Tifsira |
|---|---|
| **Fornitur** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (lokali), LM Studio (lokali), server llama.cpp (lokali), jew kwalunkwe endpoint li jaqbel ma' OpenAI |
| **URL bażi**, **Mudell** | Imimlija mill-fornitur; **Elenka l-mudelli** jistaqsi lis-server |
| **Ċavetta API** | Tintbagħat biss lill-URL bażi. Qatt ma tiġi nnotata, qatt ma tinħażen f'veduti, esportazzjonijiet jew fajls `.3dheat`. Ħafna mis-servers lokali ma jeħtieġu xejn. |
| **Ftakar iċ-ċavetta f'dan il-browser** | Mitfi b'mod predefinit: iċ-ċavetta titnesa meta l-paġna tingħalaq |
| **Uża AI esterna** | Mitfi b'mod predefinit |
| **Ibgħat l-ismijiet tal-plejers** | Mitfi b'mod predefinit: il-plejers jintbagħtu bħala P1, P2 ... |

Imbagħad ikteb mistoqsija fakultattiva u agħfas **Ikteb bl-AI**. Jintbagħtu biss is-sejbiet u n-numri tagħhom - qatt ir-ringieli tad-data tiegħek. It-tweġiba tidħol bil-mod, u s-sejbiet imsemmija isiru buttuni. Meta d-dejta tgħid min rebaħ, il-mudell jingħad jibda b'dak li ddeċieda r-rawnds, bl-intervall u l-q ta' kull numru, u jgħid meta fattur jistrieħ fuq ftit rawnds jew meta l-probabbiltajiet ta' rebħ ġejjin mill-mudell a priori.

## Kummentatur {#caster}

Għal **partita waħda** (agħżel waħda jekk hemm diversi mgħobbijin), il-**Kummentatur** isib il-mumenti li jistħoqqilhom jiġu osservati: l-ewwel demm, multi-kills, trades, clutches, bidliet fl-għanijiet, rimonta, plejers li joqogħdu 'l fuq, tiri twil, u **punti ta' bidla** - il-qtil li ċċaqlaq l-aktar iċ-ċans ta' naħa li tirbaħ ir-rawnd (skont il-plejers li baqgħu ħajjin f'kull naħa, f'rawnds mingħajr respawn).

Meta d-dejta tgħid min rebaħ kull rawnd, kull mument jgħidu: *"Anna twaqqa' lil Ben: iċ-ċans ta' T li tirbaħ ir-rawnd jitla' minn 38% għal 62% - u jieħdu r-rawnd."* Mument tan-naħa li wara rebħet jgħodd aktar meta l-kummentatur jagħżel liema jżomm, u rimonta tingħadd f'rawnds mirbuħa.

![Il-mumenti tal-kummentatur għal rawnd wieħed tad-demo tal-shooter](../assets/img/mt/caster.webp)

- Ikklikkja mument: il-veduta tinbidel għall-replay, timxi għal ftit qabel, tittrasporta lilha u ssegwi l-plejer.
- **Ħaddem il-mumenti** iħaddem kull wieħed sal-aħħar tiegħu u jmur għall-oħra; **Preċedenti** / **Li jmiss** jimxu bejniethom.
- Bl-AI esterna mixgħula, **Kummentarju mill-AI** jikteb kummentarju mil-lista tal-mumenti (tipi, ħinijiet, ismijiet jew psewdonimi, timijiet, klassijiet, distanzi).

Teħtieġ persuni u avvenimenti ta' kill/death (jew capture); kolonna `other`/`victim` tagħmel possibbli l-trades u t-tiri twil.

## Il-lenti tal-għarfien {#knowledge-lens}

Sejba tista' tinqara permezz ta' **lenti** ta' għarfien stabbilit: duttrina militari, ġlied tal-ajru u tal-baħar, operazzjonijiet urbani, disinn tal-logħba u esports (jew *Awtomatiku*, magħżul mill-unitajiet fid-data). Sejba miftuħa mbagħad turi l-entrata l-iktar qrib tad-**duttrina u l-letteratura** u **parallel storiku**, bir-referenzi, u **Kejl tal-lenti** jaħsob kejl minn dik il-letteratura fuq id-data (adattamenti ta' Lanchester, proporzjonijiet ta' skambju, proporzjonijiet ta' forza, oqsma tan-nar, art ewlenija, trades, inizjattiva). Is-sommarju u l-prompt tal-AI jinkludu dawn. Kollox dwarha: [Il-lenti tal-għarfien](knowledge.md).

Il-kejl tal-lenti jkejjel ukoll kif jimxu l-plejers bħala folla u bħala grupp - allinjament u mili, mexxa tat-toroq, sqaq u traċċi, iffullar, mexxejja u segwaċi, dawk li jitilfu t-triq, il-punt tal-kissir taħt telf, ir-riskju wara ħajja mitlufa, serji, qbil fuq l-xiri u r-reazzjoni għan-nar li jasal - kull wieħed kontra l-mudell null tiegħu: [Imġieba kollettiva](collective-behaviour.md).

## Id-data li tagħmel l-għarfien jaħdem {#data-that-makes-insights-work}

- pożizzjonijiet b'**ħin**, kolonna ta' **persuna** u kolonna ta' **tim**;
- kolonna ta' **avveniment** b'kills u mwiet (`kill`, `death`), u oħrajn (`hit`, `fire`, `capture` ...);
- kolonna ta' **parti l-oħra** (`other`, `victim`) għal trades u direzzjonijiet;
- kolonna ta' **vettura** jew **tip** għall-klassijiet; kolonna `ai` għal plejers kontra AI;
- kolonna ta' **sessjoni** / **partita** / **rawnd** meta jkun hemm diversi partiti.

[Id-data demo](demo-data.md) għandha dawn kollha.
