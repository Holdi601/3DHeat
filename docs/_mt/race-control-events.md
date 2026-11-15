---
title: "Avvenimenti tal-kontroll tal-karozza"
parent: "Analiżi tat-tellieqa"
nav_order: 54
lang: "mt"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Avvenimenti tal-kontroll tal-karozza

Il-wiri jara kif kull lap ġiet imsuqa u jimmarka fejn is-sewwieq għamel il-karozza tiżloq, tiddur, tolqot xi ħaġa jew titlef grip. Dan huwa utli għax żball li kkostalna żmien huwa l-aktar mod mgħaġġel biex jiġi kkoreġut.

![Is-sezzjoni tal-Kontroll tal-karozza: kemm-il darba kull lap qflet rota, dat-dahar jew mxiet wisq 'il barra, u l-lista tal-iżbalji b'wieħed miftuħ](../assets/img/en/race-control-table.webp)

## Fi kliem sempliċi {#in-plain-words}

- **Lock-up**: tbrejkja tant iebes li rota twaqqaf tdur u tiżloq. Il-karozza tieqaf agħar u ma tistax tidwar.
- **Wheelspin**: tagħfas il-gass tant li r-roti li jmexxu jduru aktar malajr milli l-karozza timxi. Titlef il-qawwa.
- **Oversteer**: wara tal-karozza jiżloq 'il barra. Jekk idur kollu, dik hija **spin**.
- **Understeer**: quddiem tal-karozza jiżloq 'il barra ("jgħaffas"); iddawwar ir-rota aktar ma jgħin xejn.
- **Daqqa** u **ħabta**: il-karozza laqtet xi ħaġa (daqqa hija tqaqqiq jew ħakk; ħabta hija waħda iebsa).
- **ABS**, **TC**: l-għajnuniet tal-karozza stess, li jaħdmu kontra l-lock-up u l-wheelspin. Dawn mhumiex żbalji.

## Is-sezzjoni tal-Kontroll tal-karozza (x'tara) {#the-car-control-section-what-you-see}

Għal-lap iffukata, kull dejta li fihom il-laps - mingħajr slip tat-tajers u mingħajr angolu ta' drift - turi xorta dak li għadu jinstab minflok xejn (hawn taħt).

**It-tabella**: ringiel wieħed għal kull tip li turi kwalunkwe waħda mil-laps - Roti mqafla, Wheelspin, Wara jitlaq (oversteer u spins), Jgħaffas 'il barra, Ħabtiet, Daqqiet, ABS jaħdem, Traction control jaħdem, Handbrake, Fl-arja - kull ċellula "għadd · sekondi", għal-lap iffukata u l-lap li miegħha qed titqabbel; u *L-aktar angolu ta' drift* meta hemm angolu ta' drift (l-akbar fuq l-art).

**Il-lista**: l-iżbalji tagħha li ma jinqasmux ma' oħrajn u li jiswew mill-inqas 0.02 s, l-aktar għaljin l-ewwel, sa 12 biss, kull wieħed bit-titlu u l-ispiża tiegħu (u ċ-chip tat-tip tiegħu). Ikklikkja fuq wieħed biex taqra n-nasiħa tiegħu, tpoġġi ż-żewġ karozzi 40 m qabel u erġa' tilagħbu. **Ukoll x'għamlu ż-żewġ laps hemm** iżid kull żball, anke dawk maqsuma (chip "it-tnejn għamluha", spiża "—" taħt 0.01 s). Jekk ma jkun hemm xejn: "Dak li X għamel bit-tajers ma kkostax żmien li Y ma għamilx ukoll."

**In-nasiħa taħtha** tgħid x'setgħet tara l-iskoperta - "Minn slip u angolu tas-slip ta' kull rota, u l-angolu tad-drift tal-karozza." (jew slip u angolu tas-slip, slip u angolu tad-drift, slip biss, jew "Mill-angolu tad-drift tal-karozza biss - dawn il-laps ma fihomx slip tat-tajers.") - l-art li għaliha tkejlu l-limiti (tarmac, loose, mixed: aktar minn 80% kampjuni loose tfisser loose, inqas minn 20% tfisser tarmac), liema lap kienu l-avvenimenti mqabbla magħha, u kif jinħadem l-ispiża.

Bla **ebda slip tat-tajers u ebda angolu ta' drift** (fajl tal-lap ta' FH Companion mingħajr it-telemetrija tiegħu) it-tabella u l-lista jibqgħu jidhru bl-istess mod, u n-nasiħa tgħid x'kien għadu nstab minn dak li fih il-laps: "Dawn il-laps ma fihomx slip tat-tajers u lanqas angolu ta' drift, u għalhekk il-locks u l-wheelspin ma jistgħux jiġu identifikati. Għadu nstab: il-pushes, mill-iżvolta tas-sterżar kontra t-triq; il-laqtiet u l-ħabtiet, mill-veloċità u l-aċċelerazzjoni." - il-slides mir-rata tal-yaw jissemmew ukoll fejn il-laps għandhom waħda, u l-pushes biss fejn hemm sterżar. Is-sentenza dwar il-limiti tal-slip u tad-drift titħalla barra, u tieni nasiħa tgħid: "Għal Forza Horizon, agħżel il-fajl `.tele.gz` ukoll ħdejn kull lap ta' FH Companion: hija t-telemetrija sħiħa, is-slip ta' kull rota 64 darba kull sekonda."

L-**ispiża totali** tal-kontroll tal-lap (użata fis-sommarji) tgħodd l-iżbalji li jaqgħu fuq xulxin - lock-up u l-slide li jibda minnu, fi żmien ta' 40 m - darba, bl-akbar spiża tal-grupp.

## Kif tinstab {#how-it-is-detected}

Il-bqija ta' din il-paġna hija l-ktieb tar-regoli: kull tip, kull limitu.

Kodiċi: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Ir-raġunament u l-letteratura jinsabu f'[il-metodu](race-analytics.md).

## It-tipi {#the-kinds}

| Tip | Ringiel fit-tabella | Żball? | L-iqsar li jgħodd |
|---|---|---|---|
| `lock` | Roti mqafla | iva | 0.1 s |
| `wheelspin` | Wheelspin | iva | 0.15 s |
| `oversteer` | Wara jitlaq | iva | 0.2 s |
| `spin` | (mgħodd ma' Wara jitlaq) | iva | 0.1 s |
| `understeer` | Jgħaffas 'il barra | iva | 0.25 s |
| `crash` | Ħabtiet | iva | - |
| `hit` | Daqqiet | iva | - |
| `abs` | ABS jaħdem | le | 0.2 s |
| `tc` | Traction control jaħdem | le | 0.2 s |
| `handbrake` | Handbrake | le | 0.1 s |
| `airborne` | Fl-arja | le | 0.15 s |

Taqsiriet iqsar huma storbju (kerb, daqqa, kampjun wieħed). Taqsiriet ta' punti tal-grilja (kull 2 m) li jgħaddu t-test jingħaqdu flimkien fuq tqattigħ ta' sa 2 punti. Biss **żbalji** jistgħu jkunu żbalji tas-sewwieq u jġibu spiża; l-oħrajn huma dak li għamlu l-karozza u s-sewwieq.

## X'kull test jeħtieġ {#what-every-test-needs}

### Kanali derivati {#derived-channels}

Qabel ma kwalunkwe ħaġa tiġi ġudikata, kull lap tirċievi dak li l-logħba tagħha ma tibgħatx, taħt ismijiet kanoniċi (il-valur proprju tal-logħba dejjem jirbaħ):

| Kanal | Minn |
|---|---|
| `bodySlip` (angolu tad-drift) | il-veloċità fil-qafas tal-karozza, `atan2(latVel, abs(longVel))`, fejn il-logħba tibgħatha (0 taħt 3 m/s); inkella d-direzzjoni (il-yaw tal-logħba, mqabbda mad-direzzjoni tal-vjaġġ permezz tas-sinjal u l-offset fuq kampjuni aktar mgħaġġla minn 10 m/s, u fdata biss b'varjanza ċirkolari taħt 0.05) kontra d-direzzjoni tal-vjaġġ (pożizzjonijiet mill-inqas 2 m 'il bogħod minn xulxin), f'veloċitajiet aktar minn 3 m/s |
| `yawRate` | il-bidla tal-`yaw` maż-żmien, fejn hemm direzzjoni imma ma hemmx rata |
| `airborne` | kull rota mhix f'kuntatt mal-art (≤ 0.5); inkella l-piż ta' kull rota taħt 5% tal-medjan tagħha; inkella kull travel tas-sospensjoni fi jew taħt 0.02 (mgħawweġ kollu). Kampjun wieħed barra mill-ordni mhuwiex titkaxkir |
| `slipRatio.<W>` | `(veloċità tal-wiċċ tar-rota - veloċità tal-karozza) / veloċità tal-karozza` fuq 3 m/s, fejn il-logħba tibgħat veloċitajiet tal-wiċċ tar-roti; jew mid-dawran tar-rota × raġġ ta' rotolament imkejjel fuq il-lap - il-medjan ta' `veloċità / dawran` waqt li tiġri dritt bil-gass ħieles (veloċità > 10 m/s, gass < 0.3, brejk < 0.05, abs(aċċelerazzjoni longitudinali) < 3 m/s², mhux fl-arja; kull kampjun fuq 10 m/s meta jkun hemm inqas minn 20), miġbur bejn 0.1 u 1 m. Immarkat bħala `physical` |
| `loose` | is-sejħa tal-iġġarġar tal-wiċċ ta' Forza fuq mill-inqas 2 rota (> 0.001) għal mill-inqas 0.33 s (kerb huwa iqsar), intervalli taħt 1 s magħqudin |

### Fuq l-art u stabbli {#on-the-ground-and-settled}

Xejn ma jiġi ġudikat fl-arja jew għal **0.3 s wara landing** - is-sospensjoni tintlaħaq tal-aħħar u l-aċċelerazzjonijiet jitgħollew, u dan mhuwiex grip, brejk jew qawwa tal-mutur. Kampjun irid ukoll ikun **qed jimxi**: aktar mgħaġġel minn 5 m/s.

### L-art {#the-ground}

L-art ta' kull kampjun hija **loose** fejn il-kanal `loose` tal-lap jgħid hekk (is-sejħa tal-iġġarġar tal-wiċċ ta' Forza, il-materjali tar-roti ta' Trackmania), inkella l-wiċċ tal-lap (ara [id-dixxiplina u l-wiċċ](race-loading-laps.md#discipline-and-surface)): tarmac, jew loose għal kull ħaġa oħra. Il-qawsiet, l-abitudnijiet tad-drift u l-limiti jinżammu separati għal tarmac u art loose.

### Slip, bħala multiplu tal-quċċata nominali tat-tajer {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Il-logħbiet jiskalaw is-slip b'mod differenti; `meta.slip` jgħid kif, u kull slip tinqasam b'skala sabiex madwar 1 ikun il-quċċata nominali tat-tajer:

| `meta.slip` | Tfisser | Maqsum b' |
|---|---|---|
| `peak` | normalizzat mill-logħba: wara 1 jitlef il-grip (Forza Data Out) | 1 |
| `scaled` | slip fiżiku maqsum b'quċċata tarmac (ir-recorder ta' Kunos) | il-quċċata nominali tal-art fuq dik tat-tarmac |
| `index` | kejl ta' slipping bejn 0..1 (SlipCoef ta' Trackmania) | 0.5 |
| `physical` (jew mhux magħruf) | slip ratio bħala frazzjoni, angolu ta' slip f'radianti | il-quċċata nominali tal-art |

Quċċati nominali, meta ma jkun magħruf xejn aħjar:

| Wiċċ | Slip ratio | Angolu ta' slip |
|---|---|---|
| tarmac | 0.12 | 8° |
| mixed | 0.18 | 12° |
| loose (gravel) | 0.25 | 15° |
| borra | 0.25 | 15° |
| silġ | 0.10 | 6° |

### Fejn jieqaf il-grip: il-qawsiet tat-tajer ta' kull karozza {#where-grip-ends-each-cars-tyre-curves}

Fejn tajer jieqaf ma jagħtix aktar, huwa **mkejjel għal kull karozza**, minn kull lap mgħobbija tagħha (`measureTyres`), separatament għal tarmac u art loose:

| Qawsa | Kampjuni (veloċità > 10 m/s, stabbli, aċċelerazzjonijiet taħt 45 m/s²) | Slip (x) | Forza (y) |
|---|---|---|---|
| brejkjar | brake > 0.3, handbrake ≤ 0.2, issuq dritt (lateral taħt 30% tal-akbar) | abs(medja tas-slip ratio tal-erba' rot) | dekeċerazzjoni |
| traction | throttle > 0.8, brake ≤ 0.05, dritt, it-tiġbid sħiħ tal-karozza f'dik il-veloċità > 0.5 m/s² | is-slip ratio tar-rota mmexxija l-akbar | aċċelerazzjoni bħala sehem ta' dak it-tiġbid |
| quddiem | lateral aktar minn 30% tal-akbar, il-grip tal-karozza f'dik il-veloċità > 1 m/s² | l-akbar angolu ta' slip ta' quddiem | aċċelerazzjoni laterali bħala sehem tal-grip |
| wara | l-istess | l-akbar angolu ta' slip ta' wara | l-istess |

"L-akbar" huwa l-99 perċentil tal-abs(aċċelerazzjoni laterali) tal-lap fuq dik l-art (l-art kollha meta jkun hemm inqas minn 50 kampjun). Id-drivetrain jiddeċiedi liema rot jimmexxu (FWD quddiem, RWD wara, AWD it-tnejn; mhux magħruf: it-tnejn).

Minn mill-inqas **150 kampjun**, is-slip jinqasam f'6 sa 14 sqaq ta' għadd indaqs (wieħed għal kull 40 kampjun), kull forza ta' sqaq hija l-kwart ta' fuq tagħha (dak li t-tajer ta meta s-sewwieq talab), u tiġi mlissa mal-viċini. L-**aħjar** huwa s-sqaq bl-aktar forza; il-**limitu** huwa l-ewwel sqaq wara li l-forza tkun niżlet b'**8%**. Qawsa li qatt ma tniżżel fid-dejta ma għandha ebda limitu (infinite) - li tgħaddi mill-"quċċata" ma jiswa xejn f'dik il-logħba, u s-slip waħdu ma jimmarka xejn hemm (il-qawsiet tal-kurvi u t-traction ta' Forza Horizon huma bħal dan). B'kampjuni żgħar wisq fuq art waħda, jintużaw dawk tal-art l-oħra; b'kampjuni żgħar wisq għal kollox, il-**limitu nominali**: 1.5 darba l-quċċata nominali.

Kull karozza tirċievi wkoll:

- **l-abitudni tad-drift tagħha**: il-kwart ta' fuq tal-angolu tad-drift fejn tgħawweġ b'60% jew aktar mill-akbar tagħha (jeħtieġ 100 kampjun);
- **id-direzzjoni għal kull kurvatura** (`steerGain`), għal kull firxa ta' veloċità ta' 5 m/s: il-medjan ta' abs(steer) / kurvatura tal-mogħdija waqt li tgħawweġ bil-qawwa imma sew ġewwa l-grip tagħha (30-60% tal-akbar, kurvatura iqsar minn raġġ ta' 400 m, steer aktar minn 0.02; 25 kampjun kull firxa). Il-kurvatura tal-mogħdija hija r-rata tal-yaw fuq il-veloċità fejn il-logħba tibgħat rata tal-yaw, inkella mill-pożizzjonijiet ±5 m.

## Detezzjoni, tip b'tip {#detection-kind-by-kind}

| Tip | It-test (fuq kampjuni mexjin u stabbli) | `peak` u `limit` |
|---|---|---|
| **lock** | brake > 0.05, handbrake mhux aktar minn 0.2, u kwalunkwe slip ratio ta' rota taħt il-limitu tal-brejk nieqes | l-aktar slip negattiv (multipli tal-quċċata nominali); il-limitu bħala negattiv |
| **wheelspin** | throttle > 0.2 (jew l-ebda kanal tal-gass), u slip ratio ta' rota mmexxija fuq il-limitu tat-traction | l-akbar slip imexxi; il-limitu |
| **oversteer** (angolu tad-drift) | l-angolu tad-drift fuq il-massimu akbar mill-art (floor) tal-wiċċ u 1.5 × l-abitudni tad-drift tal-karozza hemm | l-akbar angolu tad-drift, f'radianti |
| **oversteer** (angoli tas-slip, mingħajr angolu tad-drift) | l-akbar angolu tas-slip ta' wara fuq il-limitu ta' wara u aktar minn 0.25 fuq l-akbar ta' quddiem | l-angolu tas-slip ta' wara (multipli tal-quċċata) |
| **oversteer** (mingħajr angolu tad-drift, iżda b'rata tal-yaw u aċċelerazzjoni laterali) | il-"veloċità tal-attitudni" - abs(rata tal-yaw) nieqes abs(aċċelerazzjoni laterali) / veloċità, fuq 8 m/s - fuq 0.2 rad/s, bl-isterżar kontra l-bidla | rad/s; limitu 0.2 |
| **spin** | run ta' oversteer li l-angolu tad-drift tiegħu laħaq **60°** | bħal oversteer |
| **understeer** (angoli tas-slip) | mhux qed jiżloq, l-akbar angolu ta' slip ta' quddiem fuq il-limitu ta' quddiem u aktar minn 0.3 fuq dak ta' wara | l-angolu ta' slip ta' quddiem; il-limitu |
| **understeer** (mingħajr angoli tas-slip) | aktar mgħaġġel minn 12 m/s, mhux qed jiżloq, mhux qed jiġġebbed kontra, aċċelerazzjoni laterali aktar minn nofs l-akbar tal-lap (99 perċentil), mogħdija iqsar minn raġġ ta' 300 m, u sterżar aktar minn **1.6 darba** dak li l-isterżar għal kull kurvatura tal-karozza tgħid li l-mogħdija kellha bżonn | ħin il-bżonn tal-isterżar; limitu 1.6 |
| **abs**, **tc** | `absActive` / `tcActive` fuq 0.5 | - |
| **handbrake** | `handbrake` fuq 0.2 | - |
| **airborne** | `airborne` fuq 0.5 | - |
| **hit**, **crash** | ara [Daqqiet u ħabtiet](#hits-and-crashes) | il-veloċità li l-impatt ħa |

Limiti ta' drift skont l-art: tarmac **7°**, mixed **10°**, loose u borra **15°**, silġ **10°**. Karozza li tiġri aktar bħala ħaġa normali - mudell ta' tajer arkada, speċjalista tal-gravel - għandha limitu tagħha stess, ogħla, mil-lapsijiet tagħha (1.5 × l-abitudni tagħha).

**Liema triq tidur il-karozza** (għal "kontra l-kurva"): il-bidla fid-direzzjoni tal-mogħdija tal-lap stess fuq ±6 m (mill-inqas 2 punti tal-grilja); iqsar minn raġġ ta' 600 m jitqies bħala kurva; xellug jew lemin skont jekk id-dinja hijiex imqalba. L-isterżar huwa **kontra** l-kurva meta abs(steer) > 0.05 u s-sinjal tiegħu jkun oppost għal dik il-kurva - slide li qed **tinżamm** b'lock oppost.

**Il-pedali kif bdew** (`pedal`): *brejk* meta l-brake jkun aktar minn 0.1; *gass* meta l-throttle jkun aktar minn 0.3; *imneħħi* meta l-throttle kien aktar minn 0.5 fi żmien 8 punti tal-grilja (16 m) qabel; *coasting* f'kull każ ieħor (jew b'ebda kanal tal-gass).

## Imqabbda mal-lap l-oħra {#laid-against-the-other-lap}

Kull avveniment jiġi ġudikat kontra l-lap li magħha titqabbel il-lap iffukata f'dik is-segment (l-aħjar fil-klassi tagħha; għal dik il-lap innifisha, min minn klassitha kien l-aktar mgħaġġel mis-segment):

1. **Kemm marret il-lap l-oħra** fuq l-istess metri, ±8 m: l-avvenimenti tagħha stess tal-istess familja (spin jgħodd bħala oversteer, crash bħala hit) imkejla fl-istess unitajiet, mingħajr limiti, bl-użu tal-qawsiet tat-tajers tal-karozza l-oħra.
2. **Maqsuma** meta l-lap l-oħra marret **80%** daqs dan jew aktar: hekk qed tinxtegħel il-kurva, mhux żball. Tipi li mhumiex żbalji dejjem "maqsuma".
3. **Spiża**, għal żball mhux maqsum: il-ħin li din il-lap tilfet kontra l-oħra minn 5 m qabel l-avveniment sa **40 m wara** tiegħu (għal daqqa jew ħabta, sakemm il-karozza terġa' tieħu l-veloċità tagħha - il-metri biex terġa' tilħaq, b'tiġbid tagħha stess, 40 sa 400 m; mingħajr tiġbid imkejjel, 5 m/s²). Qatt ma tkun negattiva.
4. **Veloċità mitfugħa lil hinn mil-limitu tal-karozza**: għal lock, id-dekeċerazzjoni li l-karozza turi li tista' tagħmel f'dik il-veloċità nieqes dik li għamlet, miġbura matul l-avveniment; għal wheelspin, it-tiġbid sħiħ tagħha nieqes dak li għamlet; għal impatt, il-veloċità li ħa. Tingħad meta tkun aktar minn 0.5 m/s (1.8 km/h).

Żball li mhuwiex maqsum u jiswa mill-inqas **0.02 s** jitniżżel (il-[statistika tal-kors](race-course-statistics.md) tgħodd biss iżbalji ta' **0.03 s** jew aktar, sabiex żball li jitgħodd fuq ħafna laps ikun wieħed ċar), u jista' jsir il-kawża tat-telf ta' qawsa (ara [Analiżi qawsa b'qawsa](race-corner-analysis.md#car-control-faults-and-impacts)).

## Daqqiet u ħabtiet {#hits-and-crashes}

`impacts.ts` jaqra l-laqtiet mill-**kampjuni proprji** tal-lap, qabel ma jiġu rikampjunati - daqqa tintemm f'mijiet ta' sekonda. It-tajers ma jistgħux jagħmlu l-forzi ta' daqqa, għalhekk daqqa titkejjel kontra l-karozza tal-lap stess:

- **Il-grip tagħha `G`**: il-99 perċentil tal-aċċelerazzjoni orizzontali tagħha `√(lat² + long²)` fuq il-lap, fuq l-art u aktar mgħaġġla minn 5 m/s. Mingħajr kanali tal-aċċelerazzjoni (jew taħt 3 m/s²), 15 m/s² - grip ta' karozza tat-triq.
- **Limitu**: `max(1.8 G, G + 18, 30)` m/s².
- **Kampjun imqaxxar**: l-aċċelerazzjoni orizzontali fuq il-limitu *u* tqabbeż aktar minn nofs `G` mill-kampjun ta' qabel; **jew** il-veloċità titnaqqas, fi żmien 0.1 s, b'aktar mill-limitu li jieħu f'0.1 s pluss 1.5 m/s. Biss fuq l-art u stabbli, u biss meta l-karozza kienet aktar mgħaġġla minn 5 m/s.
- Kampjuni mqaxxra fi żmien **0.4 s** huma impatt wieħed.
- **Qabel / wara**: l-akbar veloċità fl-0.15 s ta' qabel; l-aktar baxxa sa 0.3 s wara l-aħħar kampjun imqaxxar.
- **Mhux impatt**: veloċità mitlufa mingħajr forza warajha - l-aċċelerazzjoni orizzontali l-akbar fi żmien 0.1 s taħt l-akbar minn `G` u 25 m/s² - hija l-logħba li terġa' tgħabbi jew terġa' tissettja l-karozza.
- **Crash** meta ħalliet **30 km/h** jew aktar, jew meta tilef aktar minn nofs il-veloċità tiegħu; **hit** inkella - daqqa, qixra kontra ħajt.
- **Direzzjoni**: l-aċċelerazzjoni longitudinali akbar mill-laterali u negattiva: *head-on*; pożittiva: *minn wara*; il-laterali akbar: *fuq ġenbha*. Mingħajr aċċelerazzjonijiet, head-on.

Dak li karozza tista' tagħmel jitkejjel bl-impatti kollha mħallija barra, minn 0.1 s qabel sa 1 s wara (`struckMask`).

## It-testi {#the-texts}

Kull avveniment jingħad billi jsemmi ż-żewġ laps, b'fejn (bil-metri tul ir-referenza), il-veloċità li bdiet biha, kemm hija 'l fuq mil-limitu meta mqabbla mal-lap l-oħra, u nasiħa. In-nasiħa ssegwi mit-tip u dak li tkejjel:

| Avveniment | Nasiħa |
|---|---|
| lock, fuq il-quddiem biss | rota ta' quddiem imqafla ma tistax tisterżża: inqas pressjoni fil-bidu taż-żona, neħħiha lejn il-qawsa |
| lock, fuq wara biss | rota ta' wara mqafla tħalli l-karozza tiddur: ibrejkja aktar f'linja dritta, ilaqqa' l-brejk meta tidħol fil-qawsa; ġarr il-bias 'il quddiem jekk ierġa' jiġri |
| lock, art loose | rota mqafla tara u tħaffer: aħtaf biss qabel tiffriża |
| lock, sew | pedala wisq għall-grip: aħtaf b'mod aktar gradwali |
| wheelspin | erġa' żid il-gass hekk kif l-istering jitneħħa, ibdel malajr fil-marċi fejn it-traction jiġi limitat (fuq art loose: marċa ogħla tirrilassa t-torque) |
| spin / oversteer | skont il-pedal: taħt il-brejk (brejk tat-tmiem tqil wisq, downshift bikri wisq), imneħħi (oversteer ta' lift-off: żomm gass stabbli), fuq il-gass (wisq waqt li għad hemm dawr), xejn (dħalt fil-qawsa b'veloċità kbira wisq); "caught with opposite lock" meta ġiet imżammra b'countersteer; fuq art loose jew f'rally, "xi angolu huwa t-triq veloċi - dak tal-lap l-oħra kien biżżejjed" |
| understeer | aktar lock ma jagħmel xejn ladarba l-quddiem ħalla: idħol bil-mod, aħmel ftit brejk biex tiġbed il-quddiem, ittaqqab; fuq art loose, idawwar il-karozza b'lift jew dabba bil-saqajn xellugi |
| hit / crash | fuq ġenb: metru ta' marġni jiswa inqas mill-qixra; minn wara: karozza oħra jew tiżloq lura; crash head-on: ibrejkja iktar kmieni; ħabta fuq quddiem: laqat xi ħaġa. "X laqat hemm ukoll." meta maqsuma |

Fi Trackmania, slide tgħid ukoll: taħt madwar **400 km/h** (**300** fuq art loose: ħamrija, ħaxix, plastik) slide tagħti inqas tiġbid milli ssik; ogħla, speedslide fl-angolu t-tajjeb jiksab, u din kienet dik li kostatna żmien, għalhekk l-angolu tagħha kien żbaljat.

## X'kull sors jippermetti {#what-each-source-allows}

| Il-laps fihom | Locks / wheelspin | Oversteer / spin | Understeer |
|---|---|---|---|
| slip ratio u angolu tas-slip għal kull rota, veloċità tal-karozza (Forza Data Out, il-logħbiet AC) | mis-slip | mill-angolu tad-drift, jew angolu tas-slip ta' wara | mill-angoli tas-slip |
| veloċitajiet tar-roti, veloċità fid-dinja (logħbiet tar-rally, BeamNG) | mis-slip mikxuf | mill-angolu tad-drift mikxuf | mid-direzzjoni għal kull kurvatura |
| yaw u rata tal-yaw, mingħajr slip (iRacing) | - | mill-angolu tad-drift (il-yaw mqabbad mad-direzzjoni tal-vjaġġ); mill-veloċità tal-attitudni b'countersteer biss meta l-yaw ma jkunx fdat | mid-direzzjoni għal kull kurvatura |
| direzzjoni biss | - | mid-direzzjoni mqabbla mal-vjaġġ | mid-direzzjoni għal kull kurvatura |
| fajl tal-lap ta' FH Companion waħdu (mingħajr yaw, mingħajr slip) | - | - | mid-direzzjoni għal kull kurvatura (għandu sterżar u aċċelerazzjonijiet) |

Daqqiet u ħabtiet jeħtieġu biss il-veloċità (aħjar bl-aċċelerazzjonijiet), għalhekk kull sors għandu dawn. Is-sezzjoni **Kontroll tal-karozza** turi x'jippermetti kull sors: b'fajl tal-lap ta' FH Companion waħdu, l-pushes tiegħu mill-isterżar u d-daqqiet tiegħu, u n-nasiħa biex titgħabba l-`.tele.gz` għal kollox.
