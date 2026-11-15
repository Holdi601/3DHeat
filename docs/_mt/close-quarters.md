---
title: "Qrib u rawnds"
parent: "Għarfien"
nav_order: 2
lang: "mt"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Ġlieda mill-qrib u rawnds

Għal shooters ibbażati fuq rawnds (Counter-Strike l-ewwel, kull dejta b'rawnds, naħat u qtiliet), Għarfien ikejjel kif rebħu l-ġlidiet: min ħa d-duelli tal-ftuħ u x'kienu jiswew, jekk il-mwiet ġewx imwieġba, jekk il-plejer li jħares fi kantuniera rebaħ kontra dak li kien jiżżomm il-post, jekk il-crossfires u d-driegħ tad-dawl ħallsux, kif iċ-ċansijiet tar-rawnd timxu ma' kull qtil, u liema bibien qatlu lill-plejers li daħlu minnhom. Użah biex tara *għalfejn* ingħelbu r-rawnds, mhux biss min ħa l-qtiliet.

Il-kejliet ġejjin mid-doktrina tal-kamra ta' tnaddif u tal-urban (il-funnel fatali, punti ta' dominazzjoni, crossfire) u mill-analitika tal-esports u tal-isport (probabbiltà ta' rebħa, valur tal-azzjonijiet, plus-minus aġġustat). Kull wieħed jinqara permezz tal-[lenti tal-għarfien](knowledge.md) u jiġi kkwotat.

## Ipprova {#try-it}

1. Tella' partita waħda jew iktar b'rawnds (konverżjoni tas-CS2 għandha dak kollu meħtieġ).
2. Iftaħ **Għarfien** u agħfas **Sib għarfien**.
3. Taħt **Kejl tal-lenti**, aqra l-linji minn *Probabbiltà ta' rebħa tar-rawnd* sa *Impatt tal-plejer*; kull wieħed għandu n-numri tiegħu, l-intervall tiegħu ta' 95%, il-valur q tiegħu u s-sorsi li jsegwi.
4. Agħżel il-lenti **Esports** jew **Urban** biex taqrahom permezz ta' dik il-letteratura; **Ikteb bl-AI** jibgħathom mar-rapport.

## X'jikejjel {#what-it-measures}

| Kejl | X'jgħid | Kif |
|---|---|---|
| Probabbiltà ta' rebħa tar-rawnd | Kemm kull naħa setgħet tirbaħ ir-rawnd f'kull mument | Regressjoni loġistika fuq il-plejers ħajjin f'kull naħa, il-bomba jew l-għan u l-ħin tiegħu, l-arloġġ tar-rawnd u x-xiri, imtellgħa għad-dejta mgħobbija; il-kalibrazzjoni tiġi ċċekkjata barra mill-fold għal kull rawnd (Brier score u skill, log loss, żball ta' kalibrazzjoni fuq għaxar bins, pendenza ta' rikalibrazzjoni, AUC) |
| Valur tal-azzjonijiet | Kemm qtil, qtil tal-ftuħ, trade, qtil wara driegħ tad-dawl, plant jew driegħ bidel iċ-ċans tan-naħa li tirbaħ | Probabbiltà ta' rebħa wara nieqes qabel; trades, qtiliet tal-ftuħ u dawk mid-driegħ ittestjati kontra l-qtiliet l-oħra b'permutazzjoni |
| Duelli tal-ftuħ | Min-naħa jirbaħ l-ewwel duel, kemm-il darba dak jirbaħ ir-rawnd, u fejn naħa tirbaħ il-ftuħ ferm aktar mill-medja tagħha | Intervalli ta' Wilson; postijiet b'test binomjali eżatt kontra s-sehem tan-naħa, q fuq il-postijiet |
| Trades | Mwiet imwieġba minn qtil ta' sħabek tal-qattiel fi 5 s, il-ħin li ħa, u rawnds rebħu meta l-ewwel mewt ġiet imwieġba | Test eżatt ta' Fisher, intervall ta' Newcombe |
| Peeker kontra holder | Duelli fejn plejer daħal fil-ġlieda (1.5 m/s jew iktar fl-aħħar sekonda) u l-ieħor baqa' wieqaf (0.75 m/s jew inqas): is-sehem tal-peeker | Test binomjali eżatt kontra nofs |
| Aim qabel id-duel | Il-veduta ta' kull plejer kontra l-ġarr għall-ieħor 0.75 s qabel il-qtil; min kien l-iktar immirat u kemm-il darba dak il-plejer rebaħ; holders fuq il-kantuniera tagħhom (fi 15°) kontra dawk barra minnha; firxiet tal-qtil | Test binomjali eżatt; Fisher |
| Crossfire | Holders b'sħabek wieqaf fi 25 m mill-peeker li l-linja tagħhom lejh hija 35° jew iktar 'il barra mill-tagħhom, kontra holders waħedhom | Fisher, Newcombe |
| Utility fid-dħul | Peekers wara driegħ tad-dawl tan-naħa tagħhom (fi 3 s u 15 m) jew duħħan (fi 18 s) kontra peeks niexfa; duelli tal-ftuħ b'driegħ fuq naħa waħda biss; vittmi mgħammaxin | Fisher, binomjali |
| Vantaġġ fl-għadd | Għal kull stat ta' plejers ħajjin (5v4, 4v5, 2v1...) li jintlaħaq l-ewwel f'rawnd, is-sehem tar-rawnds rebħu minnu | Intervalli ta' Wilson |
| Clutches | Rawnds fejn naħa waslet għall-aħħar plejer tagħha: rebħiet kontra l-rebħiet mistennija tal-mudell, skont in-numru ta' avversarji | Test normali ta' osservat kontra mistenni |
| Stacks, rotations, lurks | L-akbar grupp fi 10 m fid-duel tal-ftuħ (3 jew iktar: stacked); plejers aktar minn 30 m mill-ewwel ġlieda jew mill-għan tal-plant u kemm malajr jersqu fi 12 m; ħin u odds ta' qtil-għal-mewt aktar minn 30 m minn kull sieħeb | Fisher; odds ratio b'intervall ta' Woolf |
| Wara l-plant u r-retake | Rawnds rebħu mill-naħa li tpoġġi, skont in-numri fil-plant, u s-sehem tagħha tad-duelli wara l-plant | Intervalli ta' Wilson |
| Funnels fatali | Dħul f'kull post (bidla fil-kolonna tal-post, inkella ta' ċelloli ta' 8 m) u mwiet fi 2.5 s mid-dħul, kontra r-rata tal-mappa | Test binomjali eżatt, q fuq il-postijiet; proporzjon imnaqqas b'20 dħul bir-rata tal-mappa |
| Impatt tal-plejer | Probabbiltà ta' rebħa miżjuda għal kull rawnd minn kull plejer (qtiliet, mwiet, plants), imnaqqsa b'Bayes empiriku; ridge plus-minus aġġustat tar-riżultati tar-rawnds kontra l-bidu tal-mudell; valur tal-qtil skont il-post u l-arma, imnaqqas | Penalità magħżula b'validazzjoni inkrużata b'ħames folds |

It-testijiet kollha ta' analiżi waħda jaqsmu rata waħda ta' skoperta falza (Benjamini-Hochberg), kull post ipprovat inkluż, mhux biss dawk murija; il-q muri huwa fuq kollha. Il-mudell u l-kalibrazzjoni tiegħu jitlaħlu mad-dejta mgħobbija, għalhekk jiddeskrivu dik il-popolazzjoni: mudell professjonali jiġġudika ħażin il-logħba mill-kažwal, u l-kontra wkoll.

Ġie ċċekkjat fuq rawnds sintetiċi b'effetti mqiegħda (vantaġġ tal-peeker, crossfires, driegħ tad-dawl, funnel fatali wieħed, aim aħjar li jirbaħ), u fuq 100 dataset tal-istess rawnds mingħajrhom, fejn ir-rata tal-iskoperta falza tat-testijiet tal-effetti mqiegħda trid tibqa' fil-5% nominali (fi ħdan xi limitu) (`src/insights/cqb/cqb.test.ts`); fuq madwar elf rawnd reali l-mudell laħaq Brier score ta' 0.14 kontra 0.25 għar-rata bażi, żball ta' kalibrazzjoni ta' 0.03 u pendenza ta' rikalibrazzjoni ta' 1.0.

## Id-dejta li teħtieġ {#data-it-needs}

- kolonni ta' **ħin**, **plejer**, **naħa** u **rawnd** (is-sessjoni), u qtiliet u mwiet fil-kolonna ta' avvenimenti; rawnds fejn ħadd ma jmut darbtejn jitqiesu bħala rawnds ta' eliminazzjoni (vantaġġ fl-għadd, clutches u l-mudell jeħtieġuhom);
- kolonna ta' **parti oħra** (`other`, `victim`, `killer`, `attacker`) li ssemmi l-vittma fuq qtil u l-qattiel fuq mewt (mingħajrha, qtiliet u mwiet fl-istess mument jinpaarjaw);
- **direzzjoni tal-ħarsa** għall-kejliet tal-aim;
- kolonna `event` mhux maħduma li ssemmi `flash`, `smoke`, `he`, `molotov`, `plant` u `defuse` għall-utility u għall-plants;
- `won` (in-naħa tar-ringiela rebħet ir-rawnd), `place` (callouts), `weapon`, `buy` u `state_flashed` fejn id-dejta għandha dawn.

Pożizzjonijiet għandhom ikunu ttieħdu kampjuni diversi drabi fis-sekonda; il-veloċitajiet, l-aim u l-crossfires jaqraw l-aħħar sentejn qabel kull mewt.

## Fil-breakdown {#in-the-breakdown}

Il-[breakdown](breakdown.md) jkejjel erba' sitwazzjonijiet bħala fatturi, bil-mingħajr kontra bih: *immaskrat*, *mewt imwieġba*, *duel tal-ftuħ* u n-numri (*man up*, *in-numri ndaqs*, *man down*), kull wieħed fuq K/D, rawnds rebħu, sopravivenza u qtiliet kull minuta.

## Ħafna partiti {#many-matches}

Kull sommarju ta' partita tal-[analiżi ta' ħafna partiti](mass-analysis.md) ta' dejta b'kolonna ta' rawnd iġorr l-istess kejliet bħala għadd (`cqb` fis-sommarju): duelli tal-ftuħ, trades, peeks, crossfires, dħul immaskrat, aim, vantaġġ fl-għadd, plants u l-40 post l-iktar imdaħħal bid-dħul u l-mwiet tiegħu. L-għadd jiġbor fuq il-partiti, għalhekk elf partita jagħtu l-istess sehem bħal analiżi kbira waħda. It-tab **Ġlieda mill-qrib** tal-panew juri dawn bħala sehem bl-intervalli tagħhom, fuq il-mappi kollha jew skont il-mappa; ikklikkja ringiela biex tgħabbi l-partiti minn fejn ġew.

## Għall-iżviluppaturi {#for-developers}

`src/insights/cqb/`: `walk.ts` (passaġġ wieħed fuq ringieli fl-ordni taż-żmien, rawnds miżmuma separati, duelli rreġistrati bl-istat tagħhom), `finish.ts` (il-kejliet u l-għadd tal-partita), `model.ts` (regressjoni loġistika bl-IRLS, kalibrazzjoni, ridge b'conjugate gradients, Bayes empiriku, Fisher, Newcombe, testijiet ta' permutazzjoni), `run.ts` u `worker.ts` (il-viewer: worker tiegħu stess, ħdejn il-passaġġ tal-għarfien), `summary.ts` (il-collector tas-sommarju ta' ħafna partiti), `factors.ts` (is-sitwazzjonijiet tal-breakdown), `shows.ts` (x'jaqra l-lenti), `synth.ts` (ir-rawnds tat-test). Id-dħul tal-għarfien jinsab f'`src/insights/knowledge/cqb.ts`, il-mudelli f'`patterns-cqb.ts`. Ir-riżultati jmorru fir-rapport bħala `lens.cqb`.
