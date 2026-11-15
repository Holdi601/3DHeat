---
title: "Distanca e afërt dhe raundet"
parent: "Vëzhgime"
nav_order: 2
lang: "sq"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Distanca e afërt dhe raundet

Për lojërat e të shtënave me raunde (Counter-Strike para së gjithash, çdo të dhënë me raunde, palë dhe vrasje), Vëzhgimet mat se si u fituan luftimet: kush mori duelet e hapjes dhe sa vlenin ato, nëse vdekjet u shkëmbyen, nëse lojtari që futej në një kënd fitoi ndaj atij që e mbante, nëse kryqëzimet e zjarrit dhe dritat paguan, si lëvizën shancet e raundit me çdo vrasje, dhe cilat dyer vranë lojtarët që hynin nëpër to. Përdoreni për të parë pse u fituan raundet, jo vetëm kush mori vrasjet.

Matjet vijnë nga doktrina e pastrimit të dhomave dhe e qyteteve (kanali vdekjeprurës, pikat e dominimit, kryqëzimi i zjarrit) dhe nga analiza e esports dhe e sporteve (probabiliteti i fitores, vlera e veprimeve, plus-minus i rregulluar). Secila lexohet përmes [lenteve të njohurive](knowledge.md) dhe citohet.

## Provojeni {#try-it}

1. Ngarkoni një ose më shumë ndeshje me raunde (një konvertim CS2 ka gjithçka që i nevojitet).
2. Hapni **Vëzhgime** dhe shtypni **Gjej vëzhgime**.
3. Te **Matjet e lentes**, lexoni rreshtat nga *Probabiliteti i fitores së raundit* deri te *Ndikimi i lojtarit*; secili ka numrat e vet, intervalin 95%, vlerën q dhe burimet që ndjek.
4. Zgjidhni lentet **Esports** ose **Urban** për t'i lexuar sipas asaj literature; **Shkruaj me IA** i dërgon bashkë me raportin.

## Çfarë mat {#what-it-measures}

| Matja | Çfarë thotë | Si |
|---|---|---|
| Probabiliteti i fitores së raundit | Sa e mundshme ishte fitorja e secilës palë në çdo moment | Regresion logjistik mbi lojtarët e gjallë në secilën palë, bombën ose objektivin dhe kohën e tij, orën e raundit dhe blerjen, i përshtatur me të dhënat e ngarkuara; kalibrimi i kontrolluar jashtë grupit sipas raundit (pikët Brier dhe aftësia, humbja logaritmike, gabimi i kalibrimit në dhjetë kosha, pjerrësia e rikalibrimit, AUC) |
| Vlera e veprimeve | Sa e ndryshoi një vrasje, një vrasje hapjeje, një shkëmbim, një vrasje pas një drite, një vendosje bombe ose një dritë shancin e palës për të fituar | Probabiliteti i fitores pas minus para; shkëmbimet, vrasjet e hapjes dhe ato me dritë testohen kundrejt vrasjeve të tjera me permutim |
| Duelet e hapjes | Cila palë fiton duelin e parë, sa shpesh kjo fiton raundin, dhe ku një palë fiton hapjet shumë mbi mesataren e vet | Intervale Wilson; vendet me test binomial të saktë kundrejt pjesës së palës, q mbi vendet |
| Shkëmbimet | Vdekjet e kthyera nga vrasja e një shoku ndaj vrasësit brenda 5 s, koha që u desh, dhe raundet e fituara kur vdekja e parë u shkëmb | Testi i saktë i Fisher, intervali i Newcombe |
| Gjuajtësi kundër mbajtësit | Duele ku një lojtar u fut në luftim (1.5 m/s ose më shumë gjatë sekondës së fundit) dhe tjetri qëndroi (0.75 m/s ose më pak): pjesa e gjuajtësit | Test binomial i saktë kundrejt gjysmës |
| Synimi para duelit | Shikimi i secilit lojtar kundrejt drejtimit te tjetri 0.75 s para vrasjes; kush synonte më mirë dhe sa shpesh fitoi ai lojtar; mbajtësit në këndin e tyre (brenda 15°) kundrejt atyre jashtë tij; distancat e vrasjeve | Test binomial i saktë; Fisher |
| Kryqëzimi i zjarrit | Mbajtës me një shok të palëvizur brenda 25 m nga gjuajtësi, vija e të cilit drejt tij është 35° ose më shumë larg nga e tyra, kundrejt mbajtësve vetëm | Fisher, Newcombe |
| Shpërthimet te hyrjet | Gjuajtësit pas një drite të palës së tyre (brenda 3 s dhe 15 m) ose një tymi (brenda 18 s) kundrejt goditjeve të thata; duelet e hapjes me dritë vetëm në njërën anë; viktimat e verbuara | Fisher, binomial |
| Avantazhi i njeriut | Për çdo gjendje lojtarësh të gjallë (5v4, 4v5, 2v1...) që arrihet e para në një raund, pjesa e raundeve të fituara prej saj | Intervale Wilson |
| Mbylljet | Raundet ku një palë mbeti me lojtarin e fundit: fitoret kundrejt fitoreve të pritura të modelit, sipas numrit të kundërshtarëve | Testi normal i vëzhguar kundrejt të pritur |
| Grumbullime, rrotullime, pritje | Grupi më i madh brenda 10 m në duelin e hapjes (3 ose më shumë: i grumbulluar); lojtarët mbi 30 m nga lufta e parë ose objektivi i vendosur bombë dhe sa shpejt vijnë brenda 12 m; koha dhe shansi vrasje-vdekje më shumë se 30 m larg çdo shoku | Fisher; raporti i shanseve me intervalin e Woolf |
| Pas vendosjes dhe rimarrja | Raundet e fituara nga pala që vendos bombën, sipas numrave në vendosje, dhe pjesa e saj e duelave pas vendosjes | Intervale Wilson |
| Kanalet vdekjeprurëse | Hyrjet në çdo vend (një ndryshim i kolonës së vendit, ose përndryshe i një qelize 8 m) dhe vdekjet brenda 2.5 s pas hyrjes, kundrejt shkallës së hartës | Test binomial i saktë, q mbi vendet; raporti i tkurrur me 20 hyrje sipas shkallës së hartës |
| Ndikimi i lojtarit | Probabiliteti i fitores i shtuar për raund nga çdo lojtar (vrasje, vdekje, vendosje), i tkurrur me Bayes empirik; plus-minus i rregulluar me ridge i rezultateve të raundit kundrejt fillimit të modelit; vlera e vrasjes sipas vendit dhe armës, e tkurrur | Penalizimi zgjidhet me vërtetim kryq pesëfish |

Të gjitha testet e një analize ndajnë një shkallë të vetme të normës së rrejshme të zbulimeve (Benjamini-Hochberg), me çdo vend të provuar të përfshirë, jo vetëm vendet e shfaqur; q që shfaqet është mbi të gjitha. Modeli dhe kalibrimi i tij përshtaten me të dhënat e ngarkuara, kështu që përshkruajnë atë popullatë: një model profesional gabon te loja e rastësishme dhe anasjelltas.

Kontrolluar mbi raunde sintetike me efekte të vendosura (avantazhi i gjuajtësit, kryqëzimet e zjarrit, dritat, një kanal vdekjeprurës i vetëm, synimi më i mirë që fiton), dhe mbi 100 grupe të dhënash me të njëjtat raunde pa to, ku shkalla e rrejshme e zbulimeve e testeve me efekte të vendosura duhet të mbetet 5% nominale (brenda një brezi) (`src/insights/cqb/cqb.test.ts`); mbi rreth një mijë raunde reale modeli arriti një pikë Brier prej 0.14 kundrejt 0.25 për normën bazë, një gabim kalibrimi prej 0.03 dhe një pjerrësi rikalibrimi 1.0.

## Të dhënat që nevojiten {#data-it-needs}

- kolonat **kohë**, **lojtar**, **anë** dhe **raund** (seanca), dhe vrasjet dhe vdekjet te kolona e ngjarjeve; raundet ku askush nuk vdes dy herë trajtohen si raunde eliminimi (avantazhi i njeriut, mbylljet dhe modeli kanë nevojë për to);
- një kolonë **palë tjetër** (`other`, `victim`, `killer`, `attacker`) që emëron viktimën te një vrasje dhe vrasësin te një vdekje (pa të, vrasjet dhe vdekjet në të njëjtin moment çiftohen);
- një **drejtim shikimi** për matjet e synimit;
- një kolonë e papërpunuar `event` që emëron `flash`, `smoke`, `he`, `molotov`, `plant` dhe `defuse` për veglat ndihmëse dhe vendosjet;
- `won` (rreshti i palës fitoi raundin), `place` (thirrjet), `weapon`, `buy` dhe `state_flashed` aty ku i ka të dhënat.

Pozicionet duhet të mostrohen disa herë në sekondë; shpejtësitë, synimi dhe kryqëzimet lexojnë dy sekondat e fundit para çdo vdekjeje.

## Te [analiza sipas lojtarit](breakdown.md) {#in-the-breakdown}

[Analiza sipas lojtarit](breakdown.md) mat katër nga situatat si faktorë, me dhe pa: *i verbuar*, *vdekja e shkëmbyer*, *duel hapjeje* dhe numrat (*njeri më shumë*, *numra të barabartë*, *njeri më pak*), secila mbi K/D, raundet e fituara, mbijetesën dhe vrasjet në minutë.

## Shumë ndeshje {#many-matches}

Çdo përmbledhje ndeshjeje e [analizës së shumë ndeshjeve](mass-analysis.md) të të dhënave me një kolonë raundi mban të njëjtat matje si numëra (`cqb` te përmbledhja): duelet e hapjes, shkëmbimet, shtytjet, kryqëzimet, hyrjet me dritë, synimi, avantazhi i njeriut, vendosjet dhe 40 vendet më të hyra më shpesh me hyrjet dhe vdekjet e tyre. Numrat mblidhen mbi ndeshje, kështu që një mijë ndeshje japin të njëjtat pjesë si një analizë e vetme e madhe. Skeda **Distanca e afërt** e panelit i shfaq ato si pjesë me intervalet e tyre, mbi të gjitha hartat ose sipas hartës; një klikim mbi një rresht ngarkon ndeshjet nga të cilat erdhi.

## Për zhvilluesit {#for-developers}

`src/insights/cqb/`: `walk.ts` (një kalim mbi rreshtat sipas kohës, raundet të ndara, duelet të regjistruara me gjendjen e tyre), `finish.ts` (matjet dhe numrat për ndeshje), `model.ts` (regresion logjistik me IRLS, kalibrimi, ridge me gradientë konjugatë, Bayes empirik, Fisher, Newcombe, testet me permutim), `run.ts` dhe `worker.ts` (shikuesi: punëtori i vet, pranë kalimit të vëzhgimeve), `summary.ts` (grumbulluesi i përmbledhjes së shumë ndeshjeve), `factors.ts` (situatat e analizës sipas lojtarit), `shows.ts` (çfarë lexon lenteja), `synth.ts` (raundet e testit). Hyrjet e njohurive janë në `src/insights/knowledge/cqb.ts`, modelet në `patterns-cqb.ts`. Rezultatet hyjnë në raport si `lens.cqb`.
