---
title: "Kolektivno ponašanje"
parent: "Uvidi"
nav_order: 3
lang: "bs"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Kolektivno ponašanje: gužve, jata, krda i odluke pod pritiskom

Igrači u meču se ponašaju kao ljudi bilo gdje: skupljaju se kod vrata, prate onoga ko je prvi otišao, drže se zajedno ili zaostaju, povuku se nakon teških gubitaka, preuzimaju više rizika poslije lošeg života. **Mjere ponašanja u sočivu** mjere te obrasce metodama nauke o gužvama, fizike kolektivnog kretanja, bihevioralne ekonomije i vojne psihologije, svaku u odnosu na sopstveni nulti model, i čitaju ih kroz odgovarajuće stavke [baze znanja](knowledge.md).

## Isprobaj {#try-it}

1. Učitaj jedan ili više mečeva s vremenom, pozicijama i timovima.
2. Otvori **Uvide** i pokreni ga.
3. Raširi **Mjere leće**: mjere ponašanja su navedene uz ostale (Kolektivno poravnanje, Stado na rutama, Trake i staze, Gužva, Vođe i pratioci, Kohezija i zaostali, Tačka loma, Rizik poslije gubitaka, Nizovi, Dogovor o kupovini, Potiskivanje), svaka sa svojim brojevima, svojim testom i literaturom koja je objašnjava.
4. **Sažetak** ih navodi; **Napiši uz AI** ih šalje uz izvještaj.

## Mjere {#the-measures}

Putanje se ponovo uzorkuju na jednu tačku svake 2 s (pozicija na kraju intervala i brzina preko njega). Udaljenosti se skaliraju tipičnim razmakom podataka - medijanom udaljenosti jedinice od njenog najbližeg saigrača - pa ista mjera radi za pješadiju, tenkove i avione.

| Mjera | Šta mjeri | Nulti model i test | Znanje |
|---|---|---|---|
| Kolektivno poravnanje | Polarizacija (dužina prosječnog smjera jedinica) pokretnih jedinica svake strane svake 2 s, kružno kretanje (rotacija oko centroida), udjeli vremena polarizovanog, kružnog i rojevitog kretanja, po fazi meča; u borbama između dvije poravnate strane, udio ubistava poravnatije strane | Vlastita putanja svake jedinice pomjerena u vremenu unutar meča (zadržava put, prekida istovremenost); test promjene predznaka preko prozora od 60 s | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Stado na rutama | Koliko često jedinica napusti mjesto onako kako je to uradio saigrač prije nje (u roku od 30 s), za isti način ulaska, naspram vlastitih udjela izlaza mjesta - i naspram kopiranja ranijeg prolaska neprijatelja | Izlazi premiješani unutar mjesta i ulaza; efekat je kopiranje saigrača minus kopiranje neprijatelja (Manskijev problem refleksije: kopiranje i plan koji strana dijeli izgledaju slično) | Banerjee 1992, Bikhchandani i dr. 1992, Manski 1993 |
| Trake i staze | Bočno razdvajanje dva smjera na mjestima s protivnim tokom; udio kretanja na najprometnijih 10% tla, njegov Đini koeficijent i preklapanje najprometnijeg tla mečeva | Smjerovi premiješani između cijelih posjeta; dvije mreže pomjerene za pola mjesta, svaka testirana, Bonferroni | Helbing i dr. 1997, 2005 |
| Gužva | Brzina (u odnosu na sopstveni tempo jedinice) i tok po broju susjeda unutar dvostrukog tipičnog razmaka, pad kapaciteta u najgušćoj klasi, na najprometnijem tlu; smrti po satu u gužvama; pucnji u minuti od obližnjih saigrača (društveno dokoličenje) | Korelacija brzine i gustine vlastite jedinice, promjena predznaka preko jedinica, minimalni efekat ρ izvan ±0,05; tačni testovi stope | Helbing i dr. 2000, Seyfried i dr. 2005, Latané i dr. 1979 |
| Vođe i pratioci | Za saigrače koji putuju zajedno, vremensko kašnjenje (do 8 s) pri kojem smjer jednog najbolje predviđa smjer drugog; graf vođa, tranzitivnost trijada, stope smrti i ubistava vođa | Parovi s jednom putanjom pomjerenom u vremenu daju prag od 95%; binomni test naspram 5% | Nagy i dr. 2010, Couzin i dr. 2005 |
| Kohezija i zaostali | Vrijeme provedeno dalje od tri puta tipičnog razmaka strane od najbližeg saigrača; stopa smrti tamo naspram stope u grupi; razmak strane naspram njenog udjela ubistava u borbi | Tačan uslovni test dviju Poasonovih stopa | Shils i Janowitz 1948, Siebold 2007 |
| Tačka loma | Brzina približavanja neprijatelju (u tempu strane) po udjelu strane izgubljenom u poslednjoj minuti; najniži nivo gubitka pri kojem se strane povlače | Jednostrani klaster bootstrap naspram povlačenja od desetine tempa (gubici dolaze tamo gdje se strane sastanu, a strane koje se sretnu prestaju da se približavaju), Bonferroni preko nivoa | Dupuy 1987, Rowland 2006 |
| Rizik poslije gubitaka | Udio sljedećeg života provedenog ispred svoje strane prema neprijatelju, iznad udjela same strane i ostalih jedinica koje se tada vraćaju: poslije izgubljenog života bez ubistva naspram onog s ubistvom; rana smrt poslije rane smrti (tilt) | Životi svake jedinice premiješani (prvi život zadržan), pa je pristrasnost konačnog niza u nultom modelu | Kahneman i Tversky 1979, Thaler i Johnson 1990 |
| Nizovi | P(ubistvo poslije k ubistava) − P(ubistvo poslije k smrti), k = 1..3 | Vlastiti niz svakog igrača premiješan 1.000 puta: oduzima se pristrasnost koju su pokazali Miller i Sanjurjo; Bonferroni preko k | Gilovich i dr. 1985, Miller i Sanjurjo 2018 |
| Dogovor o kupovini | Fleissov κ pojasa opreme (eko, sila, puna; tercili izvan Counter-Strikea) unutar runde strane | Runde igrača strane premiješane preko njenih rundi | Fleiss 1971 |
| Potiskivanje | Brzina u 4 s poslije nesmrtonosne štete naspram 4 s prije, i pucnji u 10 s poslije naspram prije, na pogocima i u mirnim trenucima iste jedinice | Promjena predznaka preko jedinica, minimalni efekti 0,05 tempa i jedan pucanj u minuti | Rowland 2006 |

Svaka p-vrijednost izvještaja prolazi kroz Benjamini-Hochbergovu stopu lažnih otkrića (`q`). Mjera se izostavlja kada je podaci ne mogu nositi: runde i vrijednosti opreme su potrebne za dogovor o kupovini, događaji štete za potiskivanje, ubistva i smrti pripisani jedinicama za nizove i rizik.

## U analizi mase {#in-the-mass-analysis}

Svaki sažetak meča (`<meč>.summary.json`, vidi [Analizu mase](mass-analysis.md)) nosi iste mjere za taj meč u svom odjeljku `behaviour`, pa se hiljade mečeva može porediti bez ponovnog čitanja njihovih redova.

## Koliko dobro radi {#how-well-it-works}

Na simuliranim bitkama s ugrađenim svakim efektom, i na istim svjetovima bez njih (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): svaka mjera nalazi svoj ugrađeni efekat, a nulti svjetovi ostaju ispod praga lažnih otkrića. Rizik poslije gubitaka ima najmanju snagu; stado na rutama ne može razlikovati kopiranje od zajedničkog plana (strana koja dijeli jedan cilj je po ovoj mjeri „stado").

## Za programere {#for-developers}

- `src/insights/behaviour/acc.ts` - akumulator (ponovo uzorkovane putanje, događaji, runde) i `finish`; `motion.ts` i `choice.ts` mjere;
  `bstats.ts` pomoćne funkcije permutacije, bootstrapa i kapa; `shows.ts` obrasci i rečenice koje sočivo čita (`lens.<measure>`).
- `feed.ts` ga puni iz dijelova radnika uvida; `summaryTap.ts` iz sažetka meča dok se tabela prenosi.
- Znanje: `src/insights/knowledge/behaviour.ts` (stavke),
  `patterns-behaviour.ts`, `refs-behaviour.ts` (reference, svaka provjerena prema svom Crossref ili Open Library zapisu).
- Oznake: `lens.metric.<measure>` u `locales/*/lens.json`.
