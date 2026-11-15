---
title: "Analitika tat-tellieqa: il-metodu"
parent: "Analiżi tat-tellieqa"
nav_order: 58
lang: "mt"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Analitika tat-tellieqa: il-metodu

Fil-qosor:

- Id-dawriet jitqabblu **skont id-distanza**, mhux skont il-ħin, għalhekk l-istess post fuq it-triq jiġi fl-istess lok.
- Kull kantuniera tiġi evalwata **sħiħa**, minn żona ta' brejkjar għal dik li jmiss.
- Il-ħin mitluf jinqasam **skont fejn intilef** (brejkjar, dħul, ħruġ, dritta) u kemm minnu l-karozza tispjega.
- Il-kawża tiġi **spjegata bil-kliem**, b'parir.
- Biex tuża l-għodda, mhux biex taqra kif taħdem: ara [Analiżi tat-tellieqa](race-analysis.md).

Din hi l-metodu wara t-tab **Analiżi tat-tellieqa**: x'tkejjel, kif tiddeċiedi fejn intilef il-ħin, u kif tgħaddi dan f'parir. Hija l-ispeċifikazzjoni li l-kodiċi tal-analiżi (`src/race/`) isegwi, għalhekk kull regola hawn għandha l-parti tagħha fil-kodiċi u test li jiċċekkjaha.

## Dak li jagħmlu l-għodod professjonali {#what-the-professional-tools-do}

L-għodod stabbiliti jaqblu fuq l-istess qalba, u jiddifferixxu l-aktar fl-idea ta' kemm imorru 'l quddiem lejn il-*kawżi*:

- **Kollox jitqabbel skont id-distanza, mhux il-ħin.** Żewġ dawriet jiġu ppożizzjonati fuq assi ta' distanza waħda; id-differenza li tikber fil-ħin mictub fl-istess distanza hi l-*delta* (MoTeC isejħilha time variance, oħrajn time slip jew delta trace). L-inklinazzjoni tagħha turi fejn qed jintilef il-ħin issa: inklinazzjoni baxxa tfisser aċċellerazzjoni, ħtikk jew aderenza sostnuta; inklinazzjoni ħafifa 'l fuq jew 'l isfel tfisser differenza ta' brejkjar jew ta' gass; mewġa ta' 'l fuq u 'l isfel tfisser kumpromess bejn il-veloċità fid-dħul u dik fil-ħruġ.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Kull kantuniera tinqasam f'fażijiet**: brejkjar, dħul, nofs, ħruġ - il-punt tal-brejkjar, l-aqwa brejk u r-rilaxx, il-veloċità minima u fejn tiġi, il-marċa, il-bidu tal-gass, ir-ritorn għall-gass sħiħ, il-veloċità fil-ħruġ.
  ([Driver61: sitt fażijiet](https://driver61.com/uni/corner-phases/),
  [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-setturi f'kull kantuniera, u dawra teoretika perfetta** magħmula mill-aħjar wieħed minn kull settur. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Il-linja misjuqa wkoll titqabbel**, imma qatt waħedha: "linja fuq stampa ma tfisser xejn sakemm ma tkunx taf il-fatturi li jikkontribwixxu" - tinqara flimkien mal-grafika tal-veloċità u tad-delta.
  ([Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Il-kawża vera, mhux is-sintomu.** It-telf fuq id-dritta huwa verament il-gass, jew dħul ħażin forza gass tard? L-iżbalji jitqiegħdu f'ordni skont kemm jiswew f'ħin tad-dawra, u jiġu spjegati b'lingwa sempliċi.
  ([Track Titan coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Dak li mar ħażin fl-ewwel verżjoni, u għaliex hu importanti {#what-went-wrong-in-the-first-version-and-why-it-matters}

L-ewwel verżjoni tat ħlas separat għal kull *fażi* u kienet tħares biss lejn it-telf. Dawra li bdiet tibrejkja qabel telfet ħin fil-fażi tal-brejkjar, u kienet tingħad biex tibrejkja aktar tard - anke meta dak il-brejkjar kmieni kien iġib il-karozza lejn il-kurva aktar malajr, fuq il-gass aktar kmieni u barra mill-kantuniera aktar mgħaġġla, u kien jitlef kollox fuq id-dritta. F'test wieħed, l-ewwel verżjoni qalet lil dik id-dawra li dak għamlu "ibrejkja ferm aktar tard", meta l-oħra - li kienet ibbrejkjat aktar tard - kienet tilfet il-punt tal-apex, marret wiesgħa u tilfet preċiżament dak li kienet rebħet. Id-dejta tal-ħin qalet li ż-żewġ modi kienu ugwali; il-parir qal il-kuntrarju.

Ir-rimedju hu r-regola li kull sors fuq imsemmi jaqbel fuqha: **kantuniera tiġi evalwata sħiħa**, minn żona ta' brejkjar għal dik li jmiss, għax "xi kultant li tinqata' ftit millisekondi fuq kantuniera tista' ttejjeb il-ħin tad-dawra kollu billi tippermetti setturi aktar mgħaġġla wara"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## L-għarfien tas-sewqan li r-regoli jinkludu {#racing-knowledge-the-rules-encode}

**Il-veloċità fil-ħruġ togħġob aktar mill-veloċità fid-dħul**, u aktar meta d-dritta li jmiss tkun itwal: "il-ħin imqatta' fuq id-dritti jiddomina fuq il-ħin imqatta' fil-kantunieri", u telf ta' veloċità fil-ħruġ jinġarr sal-punt tal-brejkjar li jmiss. L-aktar mod mgħaġġel biex tgħaddi minn kantuniera u dritta spiss hu li tidħol fil-kantuniera bi ħeffa iktar baxxa, sabiex il-gass jiġi kmieni - *dħul bil-mod, ħruġ mgħaġġel*.
([Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/))
Pjanatur tal-ħin minimu li jiġi ppremjat ukoll għall-veloċità fil-ħruġ iqarreb l-apexes tiegħu lejn wara u jsib dawra *aktar mgħaġġla*; il-premju li jibilanċja ż-żewġ affarijiet jiswa `L / v²` għal kull unità ta' veloċità fil-ħruġ, għal dritta ta' tul `L` f'veloċità `v` - il-ħin li jitlef differenza ta' veloċità fuq dritta jikber mat-tul tagħha u jonqos mal-kwadru tal-veloċità
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Il-kantunieri skont fejn iwasslu.** Dik li twassal għal dritta: tiżdied il-veloċità fil-ħruġ, apex tard, lura għall-gass malajr kemm jista' jkun. Dik fi tmiem dritta: iżżid il-veloċità li tidħol biha, tibrejkja tard kemm jista' jkun, apex kmieni hu aċċettabbli. Dik bejn kantunieri oħra: tiġi kkumpromessa għal dik li tgħodd wara. Kantuniera li tista' tkun jew dan jew dak titqies bħala waħda li twassal għal dritta. Il-kantunieri mgħaġġlin jiżnu aktar: f'veloċità għolja karozza tilħaq ftit, u kull km/h mitluf ma jerġax jinrebaħ.
([Allen Berg: three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/),
[Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

**Iċ-ċirku tal-ħtikk.** Gomma għandha baġit wieħed ta' aderenza, imqassam bejn il-brejkjar, id-dawran u l-aċċellerazzjoni b'kull taħlita; l-aċċellerazzjoni totali hi `sqrt(lat² + long²)`. Il-brejkjar fil-kantuniera (trail braking) isegwi t-tarf tiegħu: il-brejk jitħalla jmur lura hekk kif it-timone u t-tagħbija laterali jiżdiedu.
([friction circle](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Il-coasting** - meta ebda pedal ma jkun imdaqqas - hu l-iktar mod bil-mod kif titlef veloċità, u indikatur ta' prestazzjoni kejjel fih innifsu.
([Racecar Engineering / OptimumG: coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Il-ħtikk (slip).** Il-forza fit-tul tilħaq l-ogħla punt f'ħtikk ta' madwar 10-20%, imbagħad tonqos; wara dak il-punt ir-rota tinħabbes waqt il-brejkjar jew tiddawwar taħt il-qawwa. Forza tirrapporta l-ħtikk normalizzat: 0 hu aderenza sħiħa, u valur akbar minn 1 tfisser li l-aderenza ntilfet.
([longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Understeer u oversteer.** Angolu ta' ħtikk akbar fuq quddiem mir-wara hu understeer; akbar fuq wara mit-tnejn hu oversteer. Mingħajr angoli ta' ħtikk: il-karozza tdur inqas milli t-timone jitlob (it-timone 'il fuq mill-angolu ta' Ackermann `L/R` li karozza teħtieġ f'veloċità baxxa).
([understeer, overview](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Il-ġeometrija ta' linja {#the-geometry-of-a-line}

Il-veloċità li karozza tista' żżomm fuq raġġ `R` hi `v = sqrt(a R)`, fejn `a` hi l-aċċellerazzjoni laterali li l-gomom tagħtiha (flimkien ma' dak li żżid id-downforce, li jikber ma' `v²`). Għalhekk **il-veloċità tikber bl-għerq kwadru tar-raġġ**: linja li tgħaddi mill-nofs fuq raġġ 20% akbar hi madwar 10% aktar mgħaġġla hemmhekk.
([maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: cornering](https://www.formula1-dictionary.net/cornering_tech.html))

**Il-linja ġeometrika** hi l-arku l-kbir l-aktar possibbli minn kantuniera: mill-bord ta' barra, jilmaħ il-bord ta' ġewwa fl-apex, u jerġa' lura għall-bord ta' barra. Għal kantuniera li tdur `θ` fuq triq wiesgħa `w` (nieqsa l-wisa' tal-karozza), arku tanġenzjali mat-tnejn il-bordijiet ta' barra u li jilmaħ il-kantuniera ta' ġewwa jkollu `R = w / (1 - cos(θ/2))` (flimkien mar-raġġ proprju tat-tarf ta' ġewwa) - għal kantuniera ta' 90 grad madwar `3.4 w`, għal hairpin `w`. Għalhekk l-użu tal-wisa' tat-triq jimporta l-aktar f'kantunieri medji u l-inqas f'hairpins.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**L-apex tard** idaħħal it-timone aktar tard u aktar fil-fond, fuq raġġ aktar strett fl-bidu, u jiftaħ ir-raġġ fuq il-ħruġ: iktar bil-mod fin-nofs, dritt iktar kmieni, u sod iktar kmieni - "minimu ftit iktar baxx imma profil ta' aċċellerazzjoni aktar b'saħħtu fil-ħruġ". **L-apex kmieni** hu l-maqlub: iktar mgħaġġel fid-dħul, u raġġ li jissikka fuq il-ħruġ u jżomm il-gass lura - fil-biċċa l-kbira żball, ħlief f'aderenza baxxa ħafna, fejn veloċità mitlufa fid-dħul ma tistax tinġarr fil-ħruġ.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**Il-"V" u l-"U".** Il-U hu l-linja klassika tonda: l-iktar raġġ wiesa', l-inqas bidla fit-timone. Il-V jidħol qabel, imur aktar fil-fond, idawwar il-karozza malajr fin-nofs u jpoġġi l-ħruġ għal dritta iktar dritta: il-brejkjar jibqa' dritt (għalhekk jista' jkun aktar tard), il-veloċità minima tkun iktar baxxa imma tintlaħaq aktar tard, u l-gass sħiħ jiġi ferm kmieni.
([Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Il-kurvatura kontra d-distanza.** L-aktar linja mgħaġġla hi kompromess bejn l-iqsar triq u dik l-inqas mgħawġa; fuq wisa' ta' pista tal-ġirjiet il-kurvatura timporta aktar, u linja bil-kurvatura l-inqas tqarreb lejn linja tal-ħin minimu kull fejn il-karozza tkun fil-limitu tagħha - titlaq minnha fejn il-karozza setgħet taċċellera.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Kantunieri f'katina** - apex doppju, chicane - huma problema waħda: il-linja tal-ħruġ ta' waħda hi l-linja tad-dħul tal-oħra, u jinġarru lura mill-waħda li twassal għal dritta.
([Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

## Liema linja taddatta ma' liema karozza {#which-line-suits-which-car}

Dak li jiddeċiedi hu l-**qawwa tal-karozza kontra l-aderenza tagħha** f'dawk il-veloċitajiet tal-kantuniera - "il-momentum hu aderenza kontra qawwa, kwistjoni ta' proporzjon".
([Ross Bentley: momentum cars](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum over horsepower](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Karozza, f'din il-kantuniera | Linja | Għaliex |
|---|---|---|
| Taċċellera b'saħħa għall-aderenza tagħha ("point and shoot") | V: tibrejkja dritt u tard, idawwar fi nofs qasir u strett, dritt u sod kmieni | il-ħin jinrebaħ bil-gass sħiħ, mhux bil-veloċità minima |
| Taċċellera bi tbatija għall-aderenza tagħha ("momentum") | U wiesa', apex ftit tard, iżomm il-veloċità minima għolja | ma tistax terġa' tirbaħ il-veloċità li tkun telfet |
| Bejn it-tnejn | mgħaġġel fid-dħul, mgħaġġel fil-ħruġ: U b'apex tard | il-kumpromess klassiku |
| Kantuniera mgħaġġla, u iktar bid-downforce | U, qrib mil-linja ġeometrika | l-aċċellerazzjoni hi dgħajfa f'veloċità; l-aderenza bid-downforce tikber ma' `v²`, għalhekk il-veloċità fin-nofs tħallas darbtejn |
| Aderenza baxxa ħafna (bil-ġlied, borra) | apex kmieni | veloċità mitlufa fid-dħul ma tistax tinġarr fil-ħruġ |
| Qawwa ferm 'il fuq mill-aderenza | il-linja tiswa anqas | it-traction, mhux il-linja, jillimita l-ħruġ |

"Iktar ma tkun mgħaġġla l-kantuniera, iktar tqarreb lejn il-linja ġeometrika; iktar ma tkun bil-mod, iktar tbiddilha b'apex tard."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: grip](https://driver61.com/uni/grip/))

Id-drivetrain jibdel kif tinħadem il-linja iktar milli l-linja nfisha: karozza bit-trazzjoni fuq quddiem tiġi ddawwar fuq il-brejkijiet (trail braking) u tingħata qawwa biss hekk kif ir-rota tiftaħ, inkella titlef u tmur wiesgħa; karozza b'qawwa kbira mtella' fuq wara trid tkun dritta qabel il-gass sħiħ, inkella r-ruħa titkaxkar; it-trazzjoni fuq l-erba' rjiel tista' tieħu qawwa filwaqt li tkun għadha qed tdur, għalhekk tibda tiftaħ il-gass iktar kmieni.
([FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Il-viewer jkejjel il-proporzjon qawwa-aderenza tal-karozza f'kull kantuniera mis-sewqan tagħha stess - aċċellerazzjoni bil-gass sħiħ fil-veloċità tal-ħruġ, fuq l-aderenza laterali fil-veloċità minima - u jsejjaħ "point and shoot" meta jkun 0.45 jew aktar, "momentum" meta jkun 0.25 jew inqas. Karozza li l-aderenza tagħha f'150-250 km/h hi aktar minn 15% 'il fuq mill-aderenza tagħha f'55-110 km/h qed tuża d-downforce.

## Il-metodu {#the-method}

In-numri hawn taħt huma r-raġunament. Il-limiti li l-kodiċi juża jinżammu f'paġna waħda kull wieħed, u dawk il-paġni huma r-referenza meta numru hawn jaqbel b'mod differenti: [Analiża kantuniera b'kantuniera](race-corner-analysis.md), [Avvenimenti tal-kontroll tal-karozza](race-control-events.md), [Profili tal-karozzi u paragun](race-car-profiles.md) u [Statistika tal-kors](race-course-statistics.md).

### 1. Assi ta' distanza waħda {#one-distance-axis}

L-aktar dawra mgħaġġla hi r-referenza, sakemm l-utent ma jagħżel oħra. It-triq misjuqa tagħha hi l-assi: kull kampjun ta' kull dawra oħra jiġi ppruvat fuqha, u jingħata distanza tiegħu fuq ir-referenza `s` u offset laterali bis-sinjal `d`. It-tfittxija tmur 'il quddiem biss mill-aħħar qbil, sabiex dawra li tgħaddi minn fuq jew minn taħt innifisha qatt ma taqbeż għan-naħa ħażina tal-pont. Id-dawriet imbagħad jiġu reġa' jiġu kampjunati fuq grilja waħda, kull 2 m, għal kull kanal. Kull dawra titwassal il-ftit metri ta' wara bil-veloċità li kellha, sabiex id-delta tagħha fuq il-linja tkun id-differenza tal-ħin tad-dawra tagħha.

### 2. Kantunieri, u s-sehem ta' kull kantuniera fid-dawra {#corners-and-each-corners-share-of-the-lap}

Kif jinstabu l-kantunieri, is-setturi u l-kumplessi: [Analiża kantuniera b'kantuniera](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Il-kont tal-ħin ta' kantuniera {#the-time-account-of-a-corner}

Netto, qsim, veloċità fil-ħruġ u l-qawwa tal-karozzi: [Analiża kantuniera b'kantuniera](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Il-verdett, u l-kawża {#the-verdict-and-the-cause}

Il-mudelli tal-verdett u l-kawżi fid-dħul u fil-ħruġ: [Analiża kantuniera b'kantuniera](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Il-karozza kontra s-sewwieq {#the-car-against-the-driver}

Meta d-dawriet ikunu f'karozzi differenti, it-telf li l-karozza tispjega jitneħħa, parti b'parti:

- **qawwa**: il-karozzi mill-istess veloċità 'l isfel mid-dritta, kif fuq;
- **aderenza**: mill-veloċità minima l-aktar baxxa li ma tispjegax kantuniera iktar stretta, is-sehem `½ ln(aderenza_l-oħra / aderenza_tiegħi) / ln(v_l-oħra / v_tiegħi)`, meta d-dawra kienet fil-limitu tal-karozza tagħha (90% ta' dak li wriet f'dik il-veloċità);
- **brejkijiet**: minn `u` 'l isfel għal `v` b'deċelerazzjoni `a1` kontra `a2`, sal-istess punt, tiswa `(1/a1 - 1/a2)(u - v)² / 2u` - biss meta d-dawra kienet tibrejkja daqs kemm tista' l-karozza tagħha fuq iż-żona b'mod medju, mhux biss f'daqqa.

Dak li karozza tista' tagħmel jiġi minn kull dawra mgħobbija tagħha: l-aderenza laterali, il-brejkjar u l-aċċellerazzjoni bil-gass sħiħ għal kull bin ta' 5 m/s ta' veloċità (il-95, il-95 u l-90 persentil). L-aderenza hi dik li l-karozza **żammet għal nofs sekonda** - l-aċċellerazzjoni laterali medjata fuq 0.5 s - mhux dik li kampjun wieħed laqat. Kerb, skiv li jerġa' jissettja, karozza li tinqabad, kollha jagħmlu tellieqa qasira, u karozza li tagħmel dan ta' spiss tidher aktar tajba mill-verità. (Iċċekkjat ma' dawriet imsiġġlin ta' żewġ karozzi differenti: il-kejl kampjun b'kampjun poġġihom qrib xulxin; miżmum għal nofs sekonda, jifridhom skont kif jaqbdu l-ħinijiet tagħhom.) Il-brejkjar u l-qawwa jieħdu kull kampjun bħala l-medjan tiegħu stess u tal-ġirien. L-arja, it-tqegħid wara tqegħid, u kull daqqa (it-taqsima 6) sakemm il-karozza terġa' tieħu nifs jitħallew barra.

**X'tip ta' karozza hi kull waħda** (`profile.ts`): mill-istess dawriet,

- **aderenza miżmuma**: il-95 persentil ta' dik l-aċċellerazzjoni laterali ta' nofs sekonda;
- **qawwa** bil-gass sħiħ sa 50 km/h, 50-120, 120-200 u iktar minn 200, u l-ogħla li wriet;
- **brejkjar** minn 60 sa 160 km/h;
- **veloċità massima**: fejn waqfet milli tikseb veloċità bil-gass sħiħ għal sekonda fuq dritta - misjuqa dritt, mhux kurva twila mdawra bis-sħiħ, fejn karozza titlef veloċità f'kull qawwa. Fejn ma kienx hemm dritta bizzejjed twila, dak li kienet għadha tiġbed fl-ogħla punt tagħha juri kemm kienet 'il bogħod. Ebda tħaddin lil hinn minn dak li juru d-dawriet: fit ta' qawwa fuq veloċità kontra t-tkaxkir tqiegħed karozza tat-triq 100 km/h 'il fuq mill-veloċità massima reali tagħha, għax l-irwoti u l-limitatur ineħħu l-qawwa ta' karozza ħafna qabel it-tkaxkir;
- **telf tar-ruħa**: kemm-il darba f'dawra kienet tgħaddi mill-10° ta' drift (20° fuq ġlied) bit-timone mdawwar kontra l-kantuniera - maqbuda bil-lock oppost - kemm minn dawn bdew fuq il-gass, u f'liema sehem tal-aderenza tagħha bdew. Karozza misjuqa xi ftit storta bl-intenzjoni m'hi qed titlef xejn; waħda li trid tinqabad, iva. Jitkejjel l-istess għal kull karozza, sabiex tkun tista' tqabbel żewġ karozzi;
- **bilanċ**, fejn id-dawriet iġorru angoli ta' ħtikk: quddiem kontra wara fil-limitu.

**Karozzi mqabbla** iqiegħed il-karozzi jitqabblu fianka għal fianka - tabella, sentenza għal kull karozza fuq x'inhi meta titqabbel mal-oħra ("X taċċellera aħjar, imma ma tistax tdur bl-istess mod, teħtieġ aktar biex twaqqaf u titlef ir-ruħa iktar faċilment"), kull differenza li hi ċara (4% ta' aderenza, 5% ta' qawwa jew brejkjar, 4 km/h ta' veloċità massima, ruħa maqbuda mill-inqas darba fil-ġimgħa aktar u nofs darba iktar ta' spiss), u kif tisbaq kull waħda. B'karozza waħda, jgħid x'inhi dik il-karozza.

**F'kull kantuniera**, meta d-dawriet ikunu f'karozzi differenti, is-sejbien jgħid x'parti minnu l-karozzi jiddeċiedu, u kif taħdem l-aħjar din il-karozza:

- **fin-nofs**: fuq il-linja tal-karozza l-oħra, l-aderenza ta' din il-karozza tippermetti `v_l-oħra · √(aderenza_tiegħi / aderenza_l-oħra)`. Jekk id-dawra ġarret dan, id-differenza hi l-karozza, u ebda punt tal-brejkjar ma jbiddilha - jingħad hekk, u l-kantuniera titqiegħed fuq il-karozza aktar milli fuq is-sewwieq. Jekk ġarret inqas, il-bqija hemm biex jinkiseb, u jingħad kemm. Imbagħad fejn il-ħin jista' jinrebaħ minflok: fuq dritta, jew f'karozza li tiġbed aktar qawwa, wara l-apex - tibrejkja dritt, tidħol aktar tard, tara li tkun imdawra lejn il-ħruġ kmieni; inkella, l-iktar raġġ wiesa' li t-triq tippermetti, għax raġġ akbar hu l-unika mod biex tikseb veloċità iktar mingħajr aderenza iktar;
- **ruħ li tħalliet**: hawn, f'karozza li titlef ir-ruħa iktar faċilment mill-oħra: x'għandha tagħmel din il-karozza - il-gass imħalli bil-mod hekk kif ir-rota titħallas, jew il-brejk imħalli bil-mod mingħajr tneħħija fin-nofs tal-kantuniera, skont kif jibdew l-iskivi tagħha;
- **id-dritta wara**: dak li l-qawwa ikbar tal-karozza l-oħra minn din l-istess veloċità ħadet, u fejn din il-karozza spiċċat mill-qawwa fuqha;
- **punt tal-brejkjar kmieni** f'karozza li tieqaf inqas bil-qawwa.

Dawra li kienet tiżżerżaq fin-nofs ta' kantuniera (aktar minn 10° ta' drift fuq l-asfalt) kienet għaddiet mill-aderenza tagħha, mhux qasira minnha: qatt ma tingħad li kellha aderenza li tibqa' tinżamm hemm. U fejn ir-ruħa tal-karozza ntilfet f'din id-dawra minn aċċellerazzjoni laterali inqas minn dik li l-kantuniera talbet, "aderenza għall-bqija" tgħid biex issibha f'passi żgħar.

### 6. Kontroll tal-karozza: rotti mblukkati, ħtikk fuq il-gomma, skivi u dfigħ, daqqiet u tfixkil {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Kull dawra titqara wkoll għal kif intlaqgħet il-karozza - fejn rota ntlaqgħet, fejn ir-rota titħakkem tduru, fejn ir-ruħa għamlet skiv, fejn il-quddiem wiegħed wiesa' - għax dawn huma l-iżbalji li l-ħin waħdu ma jsemmihomx. Tlieta jagħmlu dan ilaħħaq madwar il-logħbiet u l-uċuħ.

**Fejn tispiċċa l-aderenza titkejjel mis-sewqan stess tal-karozza.** L-inġiniera jistabbilixxu limitu ta' blokk għal kull karozza fuq il-ħtikk li tagħti l-aktar deċelerazzjoni (il-kanali MoTeC fis-serje tal-brejkjar ta' OptimumG jużaw -0.07 għal karozza waħda), mhux fuq valur ta' ktieb, u l-valuri tal-ktieb xorta jaqblu ħażin: il-forza tilħaq l-ogħla punt f'ħtikk ta' 5-20% fuq l-asfalt skont il-gomma u l-mudell, f'6% jew f'20-60% fuq it-silġ skont is-sors, u l-ebda sors ma jagħti wieħed għall-ġrarju. Il-logħbiet jiskalaw il-ħtikk b'mod ieħor ukoll: il-ħtikk ta' Forza hu "normalizzat" sabiex wara 1 l-aderenza titlef - imma l-brejkijiet ta' karozza jistgħu jagħtu l-aqwa tagħhom ferm taħt jew ferm fuq 1 minnu, u żoni tal-brejkjar ordinarji jistgħu jaqbżu 1. Għalhekk, għal kull karozza, fuq kull dawra mgħobbija tagħha, il-forza li għamlet titqiegħed f'bins kontra l-ħtikk li tbiegħdet - deċelerazzjoni kontra l-ħtikk tar-rota taħt brejkjar f'linja dritta, aċċellerazzjoni (bħala sehem ta' dik li l-karozza tagħmel f'dik il-veloċità) kontra l-ħtikk tar-rota mdawra, u aderenza fil-kantuniera (bħala sehem tal-aderenza tal-karozza f'dik il-veloċità) kontra l-angolu tal-ħtikk ta' kull assi - u l-limitu hu l-ħtikk wara l-aħjar punt fejn il-forza tkun naqset 8%. Kurva li qatt ma tinqeda fid-dejta - l-aderenza fil-kantuniera u t-traction ta' Forza Horizon - ma għandha l-ebda limitu, u l-ħtikk biss ma jindika xejn hemm. B'dejta żgħira wisq, il-limitu hu darba u nofs il-peak nominali.

**L-art hi magħrufa għal kull kampjun**, fejn il-logħba tgħid hekk: Forza tgħattat il-gomom fuq il-ġrar, it-tajn u l-ħaxix (ftit kampjuni fuq pista tal-asfalt, ħafna fuq it-tajn u kursijiet tal-art), Trackmania tisimmi l-materjal taħt kull rota, u l-art ta' stage ta' rally tinstab kif tgħid it-taqsima 11. Il-kurvi, l-abitudnijiet tad-drift u l-limiti jinżammu separati għall-asfalt u għall-art mgħobbija.

**Kull avveniment jitqiegħed kontra d-dawra l-oħra fuq l-istess metri.** Fuq il-ġrar, fuq it-silġ, f'logħba arkada ta' drift kbir, is-skiv hu kif tinqeda kantuniera: studji ta' kontroll ottimali jsibu soluzzjonijiet "b'drift baxx" fuq l-asfalt u "aggressivi, b'drift għoli, anke b'kontra-timone" barra mit-triq, id-dejta tar-rally turi gomom "ferm ġewwa ż-żona mhux lineari", u l-iblokk ta' rota fuq ġlied ferm mgħobbi jista' anke jwaqqaf il-karozza iktar malajr. Għalhekk avveniment li d-dawra l-oħra għamlitu wkoll - 80% jew aktar minnu - hu kif tinqeda l-kantuniera, mhux żball, u dak li ma għamlitux hu żball biss jekk ħa ħin: il-ħin imitluf minn ftit qabel sa 40 m wara. Żball li jispjega 40% jew aktar tat-telf ta' kantuniera isir il-kawża ta' dik il-kantuniera.

Il-limiti tal-individwazzjoni, it-test tad-dawra l-oħra, id-daqqiet u t-tfixkil, u t-testi tal-parir: [Avvenimenti tal-kontroll tal-karozza](race-control-events.md).

### 6b. Ħafna dawriet: l-istatistika tal-kors {#b-many-laps-the-courses-statistics}

Paragun tal-klassi, dak li jitqies bħala żball, l-istatistika u l-mappa taż-żbalji: [Statistika tal-kors](race-course-statistics.md).

### 7. Il-linja misjuqa {#the-driven-line}

Għal kull dawra u kull kantuniera, minn pożizzjonijiet biss: minn fejn bdiet tdur (ħames tal-kurvatura l-aktar stretta tagħha), ir-raġġ l-aktar string tagħha (fuq ±8 m), ir-raġġ medju fl-ewwel u fit-tieni nofs tal-bidla tad-direzzjoni tagħha, u hekk 'il quddiem

- **forma**: l-aktar stretta fuq ir-raġġ medju taħt 0.55 hi V, fuq 0.75 hi U;
- **apex**: ir-raġġ tal-ħruġ fuq ir-raġġ tad-dħul fuq 1.25 hu tard, taħt 0.8 hu kmieni;
- **apex tal-veloċità**: il-punt l-aktar bil-mod tagħha aktar minn 15 m qabel in-nofs tad-dawra tagħha hu bil-mod fid-dħul, mgħaġġel fil-ħruġ; aktar minn 15 m wara, għadha titlef veloċità wara n-nofs.

Kontra d-dawra l-oħra: kemm kienet ġewwa jew barra fil-bidu tad-dħul, minn ġo l-parti l-aktar stretta u fejn it-tnejn kienu jgħaddu mill-kantuniera; u fejn kull waħda bdiet tdur. Kull sejbien jintemm bil-linja li taddatta mal-karozza tad-dawra f'dik il-kantuniera - skont dak li l-kantuniera twassal għalih u l-proporzjon qawwa-aderenza, id-downforce u d-drivetrain - u jekk id-dawra segwietx dik il-linja. It-tabella "Kantuniera b'kantuniera" tlista d-dawra l-aktar mgħaġġla minn kull kantuniera bil-forma tal-linja tagħha, u l-aħjar kantunieri jinġabru flimkien.

### 8. Żewġ mappi {#two-maps}

- **Fejn**: il-kors miksi bi `dΔt/ds` kontra r-referenza, aħmar fejn qed jintilef il-ħin u aħdar fejn qed jinrebaħ.
- **Għaliex**: kull telf imqiegħed fejn tinsab il-kawża tiegħu, miksi bil-grupp tal-kawża - brejkjar, dħul, ħruġ, dritta, karozza - u wiesa' għal wieħed li jiswa aktar.

### 9. Replay {#replay}

Arloġġ wieħed, tliet modi kif jiġi mdawwar f'ħin kull dawra tagħha: mil-linja (from the line), imqiegħda flimkien (lined up - kull dawra tilħaq punt wieħed tat-triq fl-istess ħin, imbagħad titħalla tmur) u ġenb ma' ġenb (side by side - kull dawra miżmuma fid-distanza tar-referenza).

### 10. Liema mod hu d-dinja {#which-way-round-the-world-is}

Id-dinja tal-viewer hi b'id-dritta bil-Y 'il fuq. Logħba b'dinja bl-idejn ix-xellug (Forza fost dawn) tidher imqallba fiha: kull kantuniera tal-lemin tinġarr bħala tax-xellug, il-kors u d-dawriet it-tnejn. Id-dawriet jgħidu huma stess dan - it-timone pożittiv hu lejn il-lemin f'kull adapter, u s-sospensjoni ta' barra ta' kantuniera tgħaffas - għalhekk it-tab tal-ħruġ joffri li jsewwiha, u **Kamera u x-xena → Aqleb l-assi tad-dinja** jagħmel dan: X, Y jew Z jinġarru bil-maqlub. Il-bidla tinbidel biss fid-disinn - riflessjoni miżjuda fil-matriċi tal-veduta; il-kamera titfaċċa fid-dinja mpinġija, u d-dejta, l-analiżi u kull koordinata li l-għodod juru jibqgħu tal-logħba stess. L-analiżi tgħid bl-isem kantunieri lejn ix-xellug jew il-lemin bl-istess kejl.

### 11. Rally: l-iskiv, is-sieq tax-xellug, l-arja {#rally-the-slide-the-left-foot-the-air}

Stage ta' rally mhux karozza tal-pista misjuqa bi aderenza agħar. Fuq il-ġrar u fuq it-silġ l-iskiv hu kif tinqeda kantuniera: il-karozza tiddawwar fid-dħul billi tmexxi l-piż tagħha - "il-brejkijiet imexxu l-piż tal-karozza 'l quddiem ... il-gomom ta' quddiem jirbħu aderenza, dawk ta' wara jitilfuha, u l-karozza tiddawwar tiżżerżaq fil-kantuniera", imbagħad lura għall-gass hekk kif hi "imqiegħda fid-direzzjoni li trid tmur fiha" ([DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Sieq tax-xellug jagħmel il-brejkjar sabiex il-gass u l-brejk jitħaddmu flimkien, il-brejk tal-id idawwar il-karozza f'kantunieri strettissimi ([RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), u l-karozza titlaq mill-art. It-taqsima 6 diġà taqra l-iskivi kontra d-dawra l-oħra; dawn ir-regoli jkopru l-bqija.

- **L-art.** Dak li l-linja tgħid (`meta.surface`, il-`--surface` tar-recorders tar-rally), inkella l-isem tal-avveniment - ir-rallies tal-asfalt (Spanja, Kroazja, Ewropa Ċentrali, il-Ġermanja, il-Ġappun, Korsika, Ypres), dawk tax-xitwa (silġ), l-asfalt tal-Monte b'silġ u ġlata fuqu (imħallat) - inkella kif tkun misjuqa l-karozza. Il-limitu laterali ta' karozza Rally2 hu 0.7-0.9 g fuq il-ġrar u 1.3-1.4 g fuq l-asfalt ([grenzbereich, reference values](https://github.com/GitCrush/grenzbereich)), u fuq il-ġrar ġġib ħafna iktar drift (it-taqsima 6). Għalhekk stage fejn il-karozza ġarret 10 m/s² jew aktar (il-95 persentil, b'veloċità, fuq l-art) b'drift medjan taħt 6 gradi kull fejn daret taħt 70% ta' dak kien tal-asfalt; kull ħaġa oħra, jew meta ma jkunx hemm biżżejjed x'jingħad, tkun imbiegħda.
- **Dak li l-karozza tista' tagħmel, fuq l-art li għamlitu fuqha.** L-aderenza, il-brejkjar u l-qawwa (it-taqsima 5) jitkejlu fuq l-asfalt u fuq l-art mgħobbija separatament meta d-dawriet ikunu ħadu ħames jew aktar mill-kampjuni tagħhom fuq kull wieħed, u kull kantuniera tiġi ġudikata bl-art taħt il-karozza fl-ogħla punt tal-bil-mod tagħha. Il-kampjuni fl-arja u għal 0.3 s wara t-tlaq jitħallew barra minn kull ħaġa li tkejjel il-karozza - l-envelopes, il-kurvi tal-gomom, l-iblokki u t-ħtikk - għax tlaq iċċaqlaq il-karozza aktar minn dak li l-gomom tagħha jistgħu jagħmlu, u r-roti li jduru fl-arja mhumiex ħtikk. Il-downforce ma tiġix ġudikata fuq l-art mgħobbija, fejn partijiet mgħaġġla u bil-mod ta' stage huma toroq differenti.
- **Ħabba tas-sieq tax-xellug mhix brejkjar.** Ftit ta' brejk meta l-gass għadu nofs jew aktar, fuq inqas minn 15 m, iqiegħed il-karozza jew idawwarha; fejn dawra bdiet tibrejkja għal kantuniera hu l-ewwel brejk li tnaqqas bih il-gass, jew dak li dam iktar.
- **Il-karozza dawra fid-dħul.** Għal kull dawra u kull kantuniera, l-ikbar angolu ta' drift mill-brejkjar tagħha sa 5 m wara l-punt l-aktar bil-mod tagħha. Fuq l-art mgħobbija, dawra li kellha l-karozza dawra 8 gradi jew aktar inqas mill-oħra (li dawret 12 jew aktar) u tqiegħdet fuq il-gass aktar tard jew mingħajr gass **dawret inqas il-karozza**: il-parir hu li titneħħa jew tingħata ħabba tal-brejk tas-sieq tax-xellug hekk kif tidħol fid-dawra sabiex ir-ruħa tiddur - bil-punt tal-brejk tal-id tad-dawra l-oħra meta użatu, jew il-brejk tal-id f'kantuniera aktar bil-mod minn 54 km/h - u li jkun imdawwar lejn il-ħruġ qabel l-apex. Waħda li dawritha 12 gradi jew aktar aktar mill-oħra u għadha tqiegħdet fuq il-gass aktar tard **dawritha 'l bogħod**: kellha tiġi mdawwra lura qabel jista' jitnaqqas il-gass. Kwalunkwe waħda minnhom hi l-kawża tal-kantuniera fuq il-ħruġ, wara difett tal-kontroll tal-karozza. Il-parir fuq il-linja fuq l-art mgħobbija jgħid l-istess għal kull kantuniera.
- **L-arja.** Titqiegħed wara 0.2 s jew aktar minn dik tad-dawra l-oħra li tilfet il-ħin minn 10 m qabel it-tlaq sa 40 m wara l-ħabta (jew it-tmiem tal-kantuniera) hi l-kawża meta tispjega 40% jew aktar tat-telf tal-kantuniera, u l-kantuniera ta' wara, imlaħħqa iktar bil-mod, tgħid dan. Fl-arja, il-karozza ma tistax tdur, tibrejkja jew tmexxi. Il-parir iżomm il-gass mixgħul fit-tlaq - "tneħħix il-gass waqt it-tlaq", li jġib l-mimlija 'l isfel - u jieħu l-għoli ftit iktar bil-mod jew b'ħabba tal-brejk, sabiex il-karozza tibqa' baxxa ([DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Kompleksi ta' sa tliet dawriet.** Sezzjoni b'ħafna kurvi li ma tiġix sempliċement dritta mingħajr ma tintlaħaq tkun kumplessa waħda twila: wara tlieta, jibda kumpless ġdid.

`src/race/rally.test.ts` iżomm l-analiżi għal dan kollu fuq stages imħaddma b'mudell sempliċi: karozza li dawret inqas u tard fuq il-qawwa, tlaq itwal, ħabbiet tas-sieq tax-xellug, sezzjoni torturuża, asfalt kontra ġrar.

## Dejta, u dak li kull sors jippermetti {#data-and-what-each-source-allows}

| Sors | Rata | Kanali | Jippermetti |
|---|---|---|---|
| Fajls tad-dawriet tal-FH Companion | ~5 m | pożizzjoni, veloċità, gass, brejk, timone, aċċellerazzjoni fit-tul/fil-wiesgħa, marċa | kollox ħlief il-kontroll tal-karozza, li jeħtieġ it-telemetrija ta' ħdejhom |
| Il-`.tele.gz` tal-FH Companion, ħdejn kull fajl tad-dawra | il-64 Hz tal-logħba (recorder li jżomm kull pakkett jagħmel madwar 110 kull sekonda; ir-repetizzjonijiet jitneħħew) | Data Out kollu ta' Forza: għal kull rota l-ħtikk, l-angolu tal-ħtikk, il-ħtikk magħqud, id-dawran, is-sospensjoni, it-tnaqqis tal-art fuq ir-rumble; il-veloċità fil-qafas tal-karozza; ir-rata tad-dawran | kollox, inkluż il-kontroll tal-karozza |
| Forza Data Out, irrekordjat minn `heat3d_capture telemetry` | 60 Hz | kollox ta' hawn fuq, u għal kull rota: it-temperatura tal-gomma, il-ħtikk, l-angolu tal-ħtikk, il-ħtikk magħqud, il-vjaġġ tas-sospensjoni, il-veloċità tar-rota, ir-rumble strip; RPM, qawwa, torque, rata tad-dawran | kollox |
| Assetto Corsa, ACC, AC EVO, AC Rally (memorja maqsuma, `heat3d_capture telemetry --game ...`) | 60-333 Hz | sett ikbar: il-qalba tal-gomma u t-temperaturi interni/nofs/barra, il-pressjonijiet, it-temperaturi tal-brejkijiet, it-tagħbijiet tar-roti, il-camber, il-ħtikk u l-angolu; il-veloċità fil-qafas tal-karozza; ABS u TC attivi (ACC, EVO, AC Rally) | kollox |
| iRacing `.ibt`, mqara direttament | 60 Hz | pożizzjoni mill-GPS, pedali, timone, g, yaw, temperatura tal-karkassa għal kull rota, deflezzjoni tal-kuxxinett, pressjoni, użu | kollox; kontroll tal-karozza mill-angolu tad-drift (l-yaw tagħha kontra d-direzzjoni tal-vjaġġ) u t-timone, mingħajr ħtikk (mhux irreġistrat) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | kull frame; 100 Hz | pożizzjoni, veloċità dinjija u l-assi tal-karozza, veloċità tal-kuntatt tar-rota għal kull rota u s-sospensjoni, pedali, timone, arloġġ tal-istage u tul | kollox; ħtikk u angolu tad-drift miksuba |
| Richard Burns Rally (NGP UDP) | kull pass tal-fiżika | pożizzjoni, il-veloċitajiet proprji tal-karozza, deflezzjoni u forza tal-bazi għal kull rota, pedali | kollox ħlief il-ħtikk tar-roti |
| BeamNG.drive (il-mod tal-protokoll `heat3d`) | sa 100 Hz | pożizzjoni, veloċità dinjija u assi, veloċità tal-wiċċ għal kull rota, dawran, tagħbija u kuntatt mal-art | kollox; ħtikk u angolu tad-drift miksuba |
| Trackmania (il-plugin tal-Openplanet) | kull frame | pożizzjoni, veloċità quddiem u ġenb, pedali (brejk fuq/mitfi), timone, koeffiċjent tal-ħtikk għal kull rota u art mgħobbija, fl-arja | kollox; angolu tad-drift mill-veloċità laterali |

Kull sors jinbidel f'format wieħed ta' dawra, `heat3d-lap`, li l-kanali tiegħu għandhom ismijiet kanoniċi (`speed`, `throttle`, `tireTemp[FL]` ...). Il-glyph tal-karozza u l-grafiċi jpingu kull kanal li dawra jkollha.

## Sorsi {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (distance-domain delta)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: session laps](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analysing racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: theoretical best from sectors](https://overcut.gg/)
- [Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: braking analysis, lock-up and stability KPIs (Sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: on the throttle (Jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: key performance indicators of race drivers (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Tyre-road friction models and optimal slip (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: tyre-pavement friction, slip at peak on snow and ice](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: tyre friction coefficients, peak and sliding](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: longitudinal forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: lateral forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Vehicle stability, body-slip limits (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rally driving at high sideslip (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimum-time rally manoeuvres (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC reference yaw rate (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Understeer and oversteer detection by steering against yaw (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: steering angle, Ackermann and the understeer gradient](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: math channels (Kus, combined g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: oversteer and understeer widget](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: locking on very loose surfaces](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: gravel rally data logging](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: rally vehicle dynamics, reference values](https://github.com/GitCrush/grenzbereich)
- [Trackmania speed-drift trainer plugin (constants)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania speedslide write-up](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (exit speed against minimum time)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: the three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/)
- [Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/)
- [Driver61: the six phases of a corner](https://driver61.com/uni/corner-phases/)
- [Driver61: grip](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (excerpt)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: what is a momentum car](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [The momentum over horsepower debate](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Math on the racing line, part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, part 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: cornering technique](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Global minimum-time trajectory planning considering curvature and distance](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: the coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Friction circle introduction](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Understeer, an overview](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out documentation](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: traction-limited acceleration](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: power-limited acceleration](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO shared memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetry reader](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT parsing](https://github.com/teamjorge/ibt)
