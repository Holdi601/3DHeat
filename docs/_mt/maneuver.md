---
title: "Manuvri"
parent: "Għarfien"
nav_order: 4
lang: "mt"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manuvri: kif jiċċaqalqu l-gruppi

**Għarfien → Manuvri** isegwi kif jiċċaqalqu l-unitajiet ta' kull naħa *bħala gruppi* u jsemmi l-manuvri li jagħmlu - fjank, pinzar, tkissir, imbuskata, ritirata, difiża kontra missili, qsim tat-T - kull wieħed bil-livell ta' ċertezza tiegħu, in-numri li jagħmluh possibbli, jekk ħallasx, u l-paralleli tiegħu fid-duttrina u fl-istorja. **Analiżi tal-massa → Manuvri** jgħoddhom fuq eluf ta' partiti: kemm spiss isir kull wieħed għal kull mappa, modalità u naħa, u kemm spiss iħallas.

Kollox isir fil-browser tiegħek, fil-worker tiegħu stess (`src/insights/maneuver`); partita ta' ftit mijiet ta' unitajiet tieħu 10-500 ms, u gwerra ta' l-ajru ta' sagħtejn b'eluf ta' oġġetti tieħu madwar sekonda.

## Kif tuża dan {#using-it}

- Iftaħ **Għarfien**, tab **Manuvri**. Jgħodd meta jinfetaħ l-ewwel; **Sib mill-ġdid** wara li tbiddel il-filtri.
- **Ċert / Probabbli / Possibbli** jagħżel il-livell ta' ċertezza li jintwera (Probabbli bħala default).
- Il-**linja taż-żmien** għandha sekwenza għal kull naħa u barra għal kull manuvra; il-**lista** taħtha turi l-istess, skont il-ħin. Kklikkja fuq wieħed u r-replay jmur fil-bidu tiegħu, il-kamera tmur hemm, u jinpinġi fi 3D: il-mogħdija ta' kull grupp bħala vleġġa (iż-żewġ idejn ta' pinzar huma l-arkati tagħha), il-konturi tal-gruppi fil-mument ewlieni (dak tal-għadu bil-kulur tan-naħa tiegħu), u l-fruntiera tal-għadu bħala linja bajda. **Pinġi kollox fi 3D** iżid il-manuvri l-oħra tal-partita, ċari. Il-linji jintbagħtu lill-kartan grafiku darba, meta tinbidel l-għażla, mhux kull frame. B'480 manuvra mpinġija waqt il-playback, il-ħinijiet tal-frame fuq GPU reali (WebGL2 u WebGPU, p99 18.0-18.5 ms, max 19.5-20.8 ms) jaqblu ma' dawk mingħajrhom.
- Manuvra miftuħa turi r-riżultat tagħha (il-qtil u t-telf tal-unitajiet li għamluha, waqt li kienet għaddejja u ftit wara, meta mqabbla mal-iskambju tan-naħa matul il-partita), l-evidenza tagħha, u d-dħul tal-bażi tal-għarfien għaliha - id-duttrina u l-paralleli storiċi (Cannae għal pinzar, Sedan 1940 għal tkissir, Tsushima għal qsim tat-T, Operation Bolo għal finta...).
- It-tabella żgħira fl-aħħar: għal kull tip u naħa, kemm saru u kemm ħallsu.

![Pinzar fuq il-partita sintetika tad-demo: iż-żewġ vleġġa tad-driegħ, il-korp tal-għadu u l-fruntiera tiegħu](../assets/img/en/maneuvers.webp)

## Kif jinstabu l-gruppi {#how-groups-are-found}

Kull unità titpoġġa fuq linja taż-żmien komuni (pass ta' sekonda wieħed fuq sieq, sekondi 2 altrimenti, aktar għal fajls kbar ħafna), miżmuma kwieta meta tmut biex irespawn ma jagħmilx linja tvarra l-mappa. F'kull pass, l-unitajiet ta' naħa u tip (ajruplan, vetturi, bastimenti, infanterija) jiġu marbuta meta jkunu qrib - 18 m fuq sieq, 170 m għall-vetturi, 3 km għall-bastimenti, 5 km għall-ajruplani - u jiċċaqalqu bl-istess mod (il-veloċitajiet ta' qrib in-nofs ta' dik l-aktar mgħaġġla, jew it-tnejn wieqfa). Grupp jibqa' jżomm l-id tal-grupp li kien fih il-maġġoranza tal-membri tiegħu. Unità mingħajr klassi titqies fuq sieq, fi vettura jew fl-ajru skont il-veloċità tagħha.

Il-**forma** ta' grupp tinqara meta mqabbla mad-direzzjoni tiegħu: kolonna jew linja skont it-tixrid tiegħu fit-tul u fit-traverse, wedge meta n-nofs imexxi, echelon meta l-membri jirtiraw lejn naħa waħda, u kaxxa meta jżommu l-kantunieri.

Kollox jiġi evalwat fuq l-iskala tal-partita stess: il-**firxa tal-ingaġġ** `R` huwa il-75 percentil tad-distanza bejn min qatel u l-vittma tiegħu (imqiegħda fil-limitu tal-kamp tad-dominju), u l-ħinijiet ta' manuvra jiġu skalati skont it-tip tal-unità (l-infanterija terz tal-art).

## Dak li jsib {#what-it-finds}

| Manuvra | Tinstab meta |
|---|---|
| Formazzjoni | grupp iżomm forma waħda fuq 60% tal-passi li jiċċaqalqu tiegħu għal 30 s |
| Attakk frontali | grupp jersaq minn barra l-firxa sal-kuntatt, ¾ R jew aktar, minn ġewwa 35° mid-direzzjoni li jħares lejha l-għadu |
| Attakk fuq ġenb | l-istess minn 50-130° (wara, aktar minn hekk); ċert biss b'*forza tal-iffissar* sħiħa li tiġġieled lill-għadu hemm (qtil fiż-żewġ naħat) |
| Pinzar | żewġ attakki fuq il-ġenb ta' naħa waħda fuq l-istess korp tal-għadu, minn naħat opposti (100° jew aktar 'il bogħod), fi 90 s; ċert meta d-driegħ jiġġieled |
| Aċċerkjar | grupp kompatt tal-għadu b'mill-inqas daqs in-numru tal-oħrajn tan-naħa l-oħra madwaru fi 1.5 R, minn żewġ gruppi jew aktar, l-ebda vojt ta' aktar minn 100°, għal minuta, maqtugħ min-naħa tiegħu; ċert meta l-ħalqa tagħlaq b'½ R u tiġġieled il-bqija |
| Penetrazzjoni | grupp jgħaddi minn linja miżmuma (għedewwa wieqfa 30 s fuq ix-xellug u l-lemin tiegħu, iċ-ċentru tan-naħa tagħhom wara dawn); ċert meta jasal ½ R 'il quddiem, jibqa' 20 s, u jiġġieled hemm; tkissir R oħra 'il quddiem |
| Overwatch bl-alternanza | f'grupp żgħir, parti timxi filwaqt li l-bqija tibqa' wieqfa, il-irwoli jiskambjaw erba' darbiet jew aktar, b'nar ta' kopertura mill-parti wieqfa |
| Konċentrazzjoni / dispersjoni | sehem in-naħa qrib il-punt l-aktar imżbugħ tagħha jogħla minn 35% għal 60% (unitajiet jiġu 1.5 R jew aktar, imbagħad kuntatt) - jew jaqa' meta n-naħa titfarrak |
| Finta | element żgħir f'kuntatt jiġbed żewġ għedewwa jew aktar minn post ieħor; grupp akbar imbagħad jolqot erba' firxiet 'il bogħod, fejn l-għadu għandu inqas |
| Ritirata / inseguiment | grupp f'kuntatt idur lura u jitlaq R minn fejn ġġieled; ċert meta għadu hemm kien għadu qatel wieħed minnu u l-grupp sar 2 R 'il bogħod minn dak il-qattiel (qatt fuq sieq: ara hawn taħt); għedewwa li jiċċaqalqu fl-istess direzzjoni u jibqgħu warajh jinseguu |
| Difiża fil-fond | unitajiet wieqfa f'żewġ fasċi jew aktar qabel l-assi tal-għadu, R fil-fond, l-għadu jersaq, nar mill-fasċi |
| Pendio ta' wara | tlett qtiliet jew aktar minn qrib minn unitajiet wieqfa tal-vittmi li kienu għaddew minn fuq xefaten |
| Imbuskata | grupp li jiċċaqlaq jiltaqa' ma' għedewwa li kienu wieqfa 45 s; huma jisparaw l-ewwel u l-movers jitilfu tnejn jew nofs il-grupp |
| Skrin | wieħed jew tnejn mill-unitajiet jimxu 'l quddiem minn korp ta' tlieta jew aktar, u jiltaqgħu mal-għadu l-ewwel |
| Linji interni | gruppi ta' naħa wahda qrib xulxin bejn dawk tal-oħra, l-unitajiet tagħha jiċċaqalqu bejniethom |
| Ritmu | naħa li twieġeb għal kuntatt (dawran, bidla fil-veloċità, l-ewwel tir) 1.5 darbiet aktar mgħaġġla, p ta' Mann-Whitney taħt 0.05 |
| Crank, notch, drag, pump | il-mira ta' tnedija ta' missil iddur lill-muftieħ 35-70°, 75-105°, 'l fuq minn 140°, jew iġġorr u jdur lura |
| Pinzar bl-ajru, ħajt, lead-trail, grinder | par li jaqsam fuq għadu wieħed; tlieta affiancati lejn l-għadu; element 5-20 km wara ieħor; tnejn idawru punt wieħed f'distanza żgħira |
| Patrulja tal-ajru ta' kopertura | jduru madwar stazzjon għal tliet minuti |
| Ġlieda ta' enerġija / angoli | f'ġlieda mqarrba - direzzjonijiet 30° 'il bogħod, kull wieħed iżomm lill-ieħor fuq imnieħru bil-quddiem, jew qtil bejniethom - l-għoli jintuża u jitla', jew ċatt u jdur bil-qawwa filwaqt li jnaqqas il-veloċità; ċert meta wieħed qatel lill-ieħor |
| Pakkett ta' attakk, SEAD | grupp tal-ajru b'rwoli mħallta, xi wħud minnhom jolqtu l-art; qtil ta' difiża tal-ajru qabel ħafna qtiliet oħra fuq l-art |
| Linja ta' battalja, qsim tat-T | tlett bastimenti f'kolonna; kolonna kwadra fuq ir-ras ta' kolonna tal-għadu |

Kull manuvra tgħid liema **mudelli** tal-bażi tal-għarfien turi (`patterns-maneuver.ts`: formazzjoni, attakk frontali, involuzzjoni doppja, aċċerkjar, penetrazzjoni, nar u manuvra, finta, ritirata, inseguiment, difiża fil-fond, skrinjar, dispersjoni, difiża kontra missili, ġlieda tal-angoli, patrulja tal-ajru ta' kopertura, pakkett ta' attakk, linja ta' battalja, qsim tat-T) u d-dħul li għandek taqra l-ewwel. Dħul antik iġorr il-mudelli l-ġodda permezz ta' `knowledge/maneuver-tags.ts`. Ara [Il-lenti tal-għarfien](knowledge.md).

**Ħallas** iqabbel l-iskambju tal-unitajiet waqt li kienet għaddejja (u minuta wara) mal-iskambju tan-naħa tagħhom matul il-partita; ritirata tħallas meta titlef inqas unitajiet wara d-dawran milli qabel, difiża kontra missili meta l-ajruplan jgħix minuta, u aċċerkjar meta l-pocket jitlef nofs tiegħu.

## Fuq ħafna partiti {#over-many-matches}

Is-sommarju ta' kull partita (`src/mass/summarize.ts`, ara [Analiżi tal-massa](mass-analysis.md)) fih taqsima żgħira `maneuvers`: għal kull tip u naħa, kemm saru (fil-Probabbli jew aktar), kemm ħallsu, kemm ma ħallsux, il-qtiliet u t-telf. **Analiżi tal-massa → Manuvri** iġemma dawn fuq il-partiti li l-filtru jżomm - għal kull mappa u modalità, jew fuq kollox - bl-intervall ta' Wilson tar-rata ta' ħlas; ringiela ttella' l-partiti li fihom saret. Sommarji miktuba qabel ma kinitx din it-taqsima ma fihomx xejn: mexxi `node tools/3dheat-summarize.mjs <folder> --force` biex iżżidha.

## Kemm hi ċerta {#how-sure-it-is}

Partiti sintetiċi b'manuvri mqiegħda minn qabel (`synth.ts`, imexxija minn `maneuver.test.ts`): il-28 tip ippjanat kollha jinstabu fil-Probabbli jew aktar; mill-50 manuvra rrapportata, 31 huma t-tip ippjanat u d-19 l-oħra wkoll hemm verament (il-formazzjoni tal-grupp li jiċċaqlaq, l-approċċ frontali tal-kolonna li tipenetra); ebda waħda mhi ħażina. Fuq 30 partita null - mixjiet każwali waħda 'l hemm u 'l hawn u mħallta, unitajiet wieqfa b'mod każwali, ajruplani fuq linji dritti, folla li tiċċaqlaq bla skop - ma tinstab xejn fil-Probabbli jew aktar.

Fuq dejta reali (dazzini ta' battalji bl-art, ftit missjonijiet twal ta' gwerra fl-ajru, dsatax-il partita ta' logħba b'tir): attakki frontali, ġnub, penetrazzjonijiet u aċċerkjar fil-battalji tad-dabbabiet, formazzjonijiet u ġlied mqarrbin fl-ajru, difiżi kontra missili, orbiti ta' CAP u pari lead-trail fil-missjonijiet tal-gwerra fl-ajru, eżekuzzjonijiet frontali, kolonni u ftit imbuskati u pari li jiċċaqalqu fil-logħba tat-tir. L-limiti huma l-forom tad-duttrina fl-iskala tal-logħba; aqra sejba waħda bl-evidenza tagħha, u r-rati tat-tabella tal-massa bl-intervalli tagħhom.

### Kontra mudelli null tal-istess partiti {#against-null-models-of-the-same-matches}

Detector jista' jiġi mgħaffġ mill-art u mill-folla: f'taqbida kull grupp għandu għedewwa madwaru. Għalhekk kull tip jitmexxa wkoll fuq **mudelli null** mibnija mill-istess partiti (`nulls.ts`), fejn in-naħat ma jiltaqgħux iktar kif kienu: l-linja taż-żmien ta' naħa waħda tiddur b'terz sa żewġ terzi tal-partita (*shift*), jew it-traċċi tagħha jiddaru madwar iċ-ċentru tal-mappa (*rotate*); u t-tikketti tat-timijiet jitħalltu (*teams*, li b'kostruzzjoni jżomm madwar nofs il-ġlidiet reali). Il-ġlidiet jiġu kkontati biss bħala qtiliet mgħaqqda mal-mwiet tagħhom, min qatel fi 2 R u l-vittma fil-post - mudell null jgħib dawn. Sejbiet fil-Probabbli jew aktar, reali kontra l-mudelli null (30 battalja bid-dabbabiet; 12-il partita tat-tir):

| Tip | Battalji tad-dabbabiet: reali / shift / rotate | Tir: reali / shift / rotate |
|---|---|---|
| Aċċerkjar | 0 / 0 / 0 (kien 1.3 / 1.2 / 0.8) | 0 / 0 / 0 |
| Penetrazzjoni | 0.03 / 0.02 / 0.05 (kien 1.6 / 1.8 / 1.4) | 0 / 0 / 0 |
| Fjank | 0.33 / 0.07 / 0.10 | 1.0 / 0.08 / 0.21 |
| Attakk frontali | 0.87 / 0.47 / 0.12 | 14.4 / 6.5 / 4.3 |
| Ritirata | 0.03 / 0 / 0.02 | 0.08 / 0.08 / 0.5 (għalhekk qatt ċert fuq sieq) |
| Imbuskata | - | 0.17 / 0.04 / 0.04 |
| Ġlieda ta' enerġija | 1.2 / 0.1 / 0.85 | - |
| Ġlieda tal-angoli | 0.6 / 0.07 / 0.3 | - |

Ġlidiet mqarrba fl-ajru fuq iċ-ċentru ta' qasam tal-battalja jgħixu dawran madwar dak iċ-ċentru, għalhekk il-kolonna rotate ma tagħmilx lilhom favur daqs kemm tagħmel lit-tipi tal-art. Tipi ġewwa naħa waħda - formazzjoni, orbita ta' CAP, grinder, pakkett ta' attakk, SEAD, overwatch bl-alternanza, skrin - ma jiddipendux mill-oħra u mhumiex ittestjati b'dan il-mod. `maneuver.test.ts` jiċċekkja li l-mudelli null ineħħu l-pinzar, il-fjank, l-aċċerkjar, il-penetrazzjoni, l-imbuskata u r-ritirata ippjanati mill-partiti sintetiċi.

## Limiti {#limits}

- Il-gruppi jeħtieġu pożizzjonijiet maż-żmien; fajl ta' avvenimenti biss ma għandu l-ebda.
- Il-wiċċ ma jinqarax mid-dejta: il-fruntiera tal-għadu hija fejn il-forza tal-iffissar tingaġġah, inkella fejn jimxi, inkella minn fejn wasal l-attakkant.
- It-terren jinqara mill-għoli tal-unitajiet stess (il-pendio ta' wara); m'hemm l-ebda test ta' linja tal-vista.
- Fajls kbar ħafna jittieħdu b'passi itwal; manuvri qosra fl-ajru f'dawn xorta jinqraw minn passi ta' 2-4 s.
