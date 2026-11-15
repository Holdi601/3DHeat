---
title: "Kolektyvinis elgesys"
parent: "Įžvalgos"
nav_order: 3
lang: "lt"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Kolektyvinis elgesys: minios, bandos, kaimenės ir sprendimai spaudimo sąlygomis

Rungtynių žaidėjai elgiasi kaip žmonės bet kur: susispiečia prie durų, seka tą, kuris nuėjo pirmas, laikosi kartu arba atsilieka, po didelių nuostolių traukiasi, po blogo gyvenimo prisiima daugiau rizikos. **Elgesio žiūronų rodikliai** matuoja šiuos dėsningumus minios mokslo, kolektyvinio judėjimo fizikos, elgesio ekonomikos ir karinės psichologijos metodais, kiekvienas palyginamas su savo nulinio modelio atskaita, ir aiškinami atitinkamais [žinių bazės](knowledge.md) įrašais.

## Išbandykite {#try-it}

1. Įkelkite vienas ar daugiau rungtynių su laiku, pozicijomis ir komandomis.
2. Atidarykite **Įžvalgos** ir paleiskite.
3. Išskleiskite **Žiūronų rodikliai**: elgesio matai išvardyti kartu su kitais (Kolektyvinis suderinimas, Maršruto kaimenavimas, Juostos ir pėdsakai, Susigrūdimas, Lyderiai ir sekėjai, Sanglauda ir atsilikėliai, Lūžio taškas, Rizika po nuostolių, Serijos, Pirkimo sutarimas, Slopinimas), kiekvienas su savo skaičiais, testu ir literatūra, kuri jį paaiškina.
4. **Santrauka** jais remiasi; **Rašyti su DI** siunčia juos kartu su ataskaita.

## Matai {#the-measures}

Trajektorijos perskaičiuojamos į vieną tašką kas 2 s (pozicija intervalo pabaigoje ir greitis jo metu). Atstumai skaliuojami pagal paties duomenų tipinį tankį – medianinį atstumą nuo vieneto iki artimiausio komandos draugo – todėl tas pats matas tinka pėstininkams, tankams ir orlaiviams.

| Matas | Ką matuoja | Nulinis modelis ir testas | Žinios |
|---|---|---|---|
| Kolektyvinis suderinimas | Kiekvienos pusės judančių vienetų poliarizacija (vidutinės krypties ilgis) kas 2 s, sukimasis aplink centroidą, poliarizuoto, sukamojo ir spiečiaus judėjimo laiko dalys pagal rungtynių fazę; kovose tarp dviejų suderintų pusių – labiau suderintos pusės nužudymų dalis | Kiekvieno vieneto paties trajektorija, perstumta laike rungtynių ribose (išlaiko kelią, bet nutraukia vienalaikiškumą); ženklo keitimo testas 60 s languose | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Maršruto kaimenavimas | Kaip dažnai vienetas palieka vietą tuo keliu, kuriuo prieš tai ją paliko komandos draugas (per 30 s), tuo pačiu įėjimu, palyginus su tos vietos pačios išėjimo dalimis – ir su priešo ankstesnio perėjimo kopijavimu | Išėjimai sumaišomi vietos ir įėjimo ribose; efektas yra komandos draugo kopijavimas minus priešo kopijavimas (Manski atspindžio problema: kopijavimas ir bendras planas atrodo vienodai) | Banerjee 1992, Bikhchandani ir kt. 1992, Manski 1993 |
| Juostos ir pėdsakai | Dviejų krypčių šoninė atskirtis vietose su priešingu srautu; judėjimo dalis 10 % užimtiausios žemės, jos Gini koeficientas ir rungtynių užimtiausios žemės persidengimas | Kryptys sumaišomos tarp visų apsilankymų; dvi tinklelių, pasislinkusių per pusę vietos, kiekvienas tikrinamas, Bonferroni | Helbing ir kt. 1997, 2005 |
| Susigrūdimas | Greitis (palyginti su paties vieneto tempu) ir srautas pagal kaimynų skaičių per du tipinius tankius, pajėgumo kritimas tankiausioje klasėje, užimtiausioje žemėje; mirtys per valandą minioje; šūviai per minutę iš arti esančių komandos draugų (socialinis tingėjimas) | Kiekvieno vieneto greičio ir tankio koreliacija, ženklo keitimas per vienetus, mažiausias efekto ρ už ±0,05; tikslūs dažnio testai | Helbing ir kt. 2000, Seyfried ir kt. 2005, Latané ir kt. 1979 |
| Lyderiai ir sekėjai | Kartu judantiems komandos draugams – laiko poslinkis (iki 8 s), kuriuo vieno kryptis geriausiai nuspėja kito; lyderių grafas, trijulių tranzityvumas, lyderių mirties ir nužudymų dažniai | Poros su vienu trajektorija, perstumta laike, duoda 95 % slenkstį; binominis testas prieš 5 % | Nagy ir kt. 2010, Couzin ir kt. 2005 |
| Sanglauda ir atsilikėliai | Laikas, praleistas toliau nei trys tipiniai pusės tarpai nuo artimiausio komandos draugo; mirties dažnis ten, palyginti su grupe; pusės tarpai, palyginti su jos dalimi kovos nužudymų | Tikslus sąlyginis dviejų Puasono dažnių testas | Shils ir Janowitz 1948, Siebold 2007 |
| Lūžio taškas | Artėjimo prie priešo greitis (pusės paties tempu) pagal pusės praradimo dalį per paskutinę minutę; žemiausias nuostolių lygis, kuriame pusės traukiasi | Vienpusis klasterinis bootstrap prieš traukimąsi dešimtadaliu tempo (nuostoliai įvyksta ten, kur pusės susitinka, o pusės, kurios susitinka, nustoja artėti), Bonferroni per lygius | Dupuy 1987, Rowland 2006 |
| Rizika po nuostolių | Kiek kito gyvenimo dalies praleidžiama prieš savo pusę link priešo, virš pusės dalies ir kitų grįžtančių vienetų tuo metu: po gyvenimo, prarasto be nužudymo, palyginti su po gyvenimo su nužudymu; ankstyva mirtis po ankstyvos mirties (nuokrypis) | Kiekvieno vieneto gyvenimai sumaišomi (pirmasis išlaikomas), todėl baigtinės sekos šališkumas yra nulinyje | Kahneman ir Tversky 1979, Thaler ir Johnson 1990 |
| Serijos | P(nužudymas po k nužudymų) − P(nužudymas po k mirčių), k = 1..3 | Kiekvieno žaidėjo sekos sumaišomos 1 000 kartų: atimamas šališkumas, kurį parodė Miller ir Sanjurjo; Bonferroni per k | Gilovich ir kt. 1985, Miller ir Sanjurjo 2018 |
| Pirkimo sutarimas | Fleiss' κ pirkinių juostų (eko, jėga, pilna; tertiliai už Counter-Strike ribų) pusės raunde | Pusės žaidėjų ir raundų poros sumaišomos per jos raundus | Fleiss 1971 |
| Slopinimas | Greitis 4 s po nemirtinos žalos palyginti su 4 s prieš ją, ir šūviai per 10 s po palyginti su prieš, prie pataikymų ir prie to paties vieneto ramių momentų | Ženklo keitimas per vienetus, mažiausi efektai 0,05 tempo ir vienas šūvis per minutę | Rowland 2006 |

Kiekviena ataskaitos p reikšmė praeina Benjamini-Hochberg klaidingų atradimų dažnio (`q`) kontrolę. Matas praleidžiamas, kai duomenys jo nepalaiko: pirkinių sutarimui reikalingi raundai ir įrangos vertės, slopinimui – žalos įvykiai, serijoms ir rizikai – vienetams priskirti nužudymai ir mirtys.

## Masinėje analizėje {#in-the-mass-analysis}

Kiekvienoje rungtynių santraukoje (`<match>.summary.json`, žr. [Masinė analizė](mass-analysis.md)) tos rungtynės matai yra jos `behaviour` skiltyje, todėl tūkstančius rungtynių galima palyginti neskaitant jų eilučių iš naujo.

## Kaip gerai tai veikia {#how-well-it-works}

Simuliuotuose mūšiuose, kur kiekvienas efektas įdėtas, ir tuose pačiuose pasauliuose be jų (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): kiekvienas matas randa įdėtą efektą, o nuliniai pasauliai lieka žemiau klaidingų atradimų slenksčio. Rizika po nuostolių turi mažiausią galią; maršruto kaimenavimas negali atskirti kopijavimo nuo bendro plano (pusė, turinti vieną tikslą, pagal šį matą yra „kaimenaujanti“).

## Kūrėjams {#for-developers}

- `src/insights/behaviour/acc.ts` – kaupiklis (perskaičiuotos trajektorijos, įvykiai, raundai) ir `finish`; `motion.ts` ir `choice.ts` – matai; `bstats.ts` – permutacijos, bootstrap ir kappa pagalbinės funkcijos; `shows.ts` – šablonai ir sakiniai, kuriuos skaito žiūronas (`lens.<measure>`).
- `feed.ts` tiekia jį iš įžvalgų darbininko gabalų; `summaryTap.ts` – iš rungtynių santraukos, kai ji srautu nuskaito lentelę.
- Žinios: `src/insights/knowledge/behaviour.ts` (įrašai), `patterns-behaviour.ts`, `refs-behaviour.ts` (nuorodos, kiekviena patikrinta pagal jos Crossref ar Open Library įrašą).
- Etiketės: `lens.metric.<measure>` faile `locales/*/lens.json`.
