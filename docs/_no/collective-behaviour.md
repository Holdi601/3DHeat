---
title: "Kollektiv atferd"
parent: "Innsikt"
nav_order: 3
lang: "no"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Kollektiv atferd: folkemengder, flokker, hjorder og beslutninger under press

Spillere i en kamp oppfører seg som folk hvor som helst: de samler seg ved dører, følger den som gikk først, holder sammen eller henger etter, trekker seg tilbake etter tunge tap og tar større risiko etter et dårlig liv. **Atferdslinsemålene** måler disse mønstrene med metodene fra folkemengdeforskning, fysikk for kollektiv bevegelse, atferdsøkonomi og militærpsykologi, hver mot sin egen nullmodell, og leser dem gjennom de tilsvarende oppføringene i [kunnskapsbasen](knowledge.md).

## Prøv det {#try-it}

1. Last inn en eller flere kamper med tid, posisjoner og lag.
2. Åpne **Innsikter** og kjør den.
3. Fold ut **Linsemål**: atferdsmålene står sammen med de andre (Kollektiv retning, Flokking etter ruter, Baner og stier, Trengsel, Ledere og følgere, Samhold og etterlatte, Bruddpunkt, Risiko etter tap, Serier, Kjøpsenighet, Undertrykking), hver med sine tall, sin test og litteraturen som forklarer dem.
4. **Gjennomgangen** siterer dem, og **Skriv med AI** sender dem med rapporten.

## Målene {#the-measures}

Spor blir resamplet til ett punkt hvert 2. sekund (posisjonen på slutten av intervallet og farten over det). Avstander skaleres med dataenes egen typiske avstand – medianavstanden fra en enhet til nærmeste lagkamerat – slik at det samme målet fungerer for infanteri, stridsvogner og fly.

| Mål | Hva det måler | Nullmodell og test | Kunnskap |
|---|---|---|---|
| Kollektiv retning | Polarisering (lengden på gjennomsnittlig enhetsretning) for hver sides bevegelige enheter hvert 2. sekund, virvling (rotasjon om tyngdepunktet), andeler av tid polarisert, virvlende og svermende, etter kampfase; i kamper mellom to rettede sider, den mer rettede sides andel av drapene | Hver enhets egen bane forskjøvet i tid innen kampen (beholder veien, bryter samtidighet); fortegnsvendingstest over 60 s-vinduer | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Flokking etter ruter | Hvor ofte en enhet forlater et sted på samme måte som lagkameraten før den gjorde (innen 30 s), for samme inngang, mot stedets egne utgangsandeler – og mot å kopiere et fiendtlig forbipassering tidligere | Utganger blandet innen sted og inngang; effekten er lagkamerater minus fiendtlig kopiering (Manskis refleksjonsproblem: kopiering og en plan sidene deler ser like ut) | Banerjee 1992, Bikhchandani m.fl. 1992, Manski 1993 |
| Baner og stier | Sideveis skille mellom de to retningene på steder med motstrøm; andel av bevegelse på de travleste 10 % av bakken, dens Gini, og overlappet av kampenes travleste bakke | Retninger blandet mellom hele besøk; to rutenett forskjøvet med en halv plass, hver testet, Bonferroni | Helbing m.fl. 1997, 2005 |
| Trengsel | Fart (i forhold til enhetens eget tempo) og flyt etter antall naboer innen to ganger den typiske avstanden, kapasitetsfallet i den tetteste klassen, på den travleste bakken; dødsfall per time i folkemengder; skudd per minutt fra nærliggende lagkamerater (sosial lediggang) | Hver enhets egen fart-tetthetskorrelasjon, fortegnsvending over enheter, minste effekt ρ utenfor ±0,05; eksakte ratetester | Helbing m.fl. 2000, Seyfried m.fl. 2005, Latané m.fl. 1979 |
| Ledere og følgere | For lagkamerater som reiser sammen, tidsforsinkelsen (opptil 8 s) der den ene sin retning best forutsier den andres; lederdiagram, transitivitet i triader, lederes dødsfall- og drapsrater | Par der ett spor er forskjøvet i tid gir 95 %-terskelen; binomisk test mot 5 % | Nagy m.fl. 2010, Couzin m.fl. 2005 |
| Samhold og etterlatte | Tid brukt utenfor tre ganger sidens typiske avstand til nærmeste lagkamerat; dødsrate der mot med gruppen; en sides avstand mot dens andel av kampens drap | Eksakt betinget test av to Poisson-rater | Shils og Janowitz 1948, Siebold 2007 |
| Bruddpunkt | Nærmingsfart mot fienden (i sidens eget tempo) etter andelen av siden som gikk tapt det siste minuttet; det laveste tapsnivået der sider trekker seg tilbake | Ensidig klyngebootstrap mot et tilbaketrekk på en tidel av tempoet (tap kommer der sider møtes, og sider som møtes slutter å lukke avstanden), Bonferroni over nivåer | Dupuy 1987, Rowland 2006 |
| Risiko etter tap | Andel av neste liv brukt foran ens side mot fienden, over sidens egen andel og andre enheter som returnerer på det tidspunktet: etter et liv tapt uten drap mot etter et med drap; tidlig død etter tidlig død (tilt) | Hvert enhets liv blandet (første liv beholdt), slik at skjevheten i endelige sekvenser er med i nullmodellen | Kahneman og Tversky 1979, Thaler og Johnson 1990 |
| Serier | P(drap etter k drap) − P(drap etter k dødsfall), k = 1..3 | Hver spillers egen sekvens blandet 1 000 ganger: skjevheten Miller og Sanjurjo viste, trekkes fra; Bonferroni over k | Gilovich m.fl. 1985, Miller og Sanjurjo 2018 |
| Kjøpsenighet | Fleiss' κ for kjøpsnivåene (eco, force, full; tertiler utenfor Counter-Strike) innen en sides runde | Sidens spiller-runder blandet over sine runder | Fleiss 1971 |
| Undertrykking | Fart i de 4 s etter ikke-dødelig skade mot de 4 s før, og skudd i de 10 s etter mot før, ved treff og ved enhetens rolige øyeblikk | Fortegnsvending over enheter, minste effekter 0,05 av tempoet og ett skudd per minutt | Rowland 2006 |

Hver p-verdi i rapporten går gjennom Benjamini-Hochberg-metoden for falske funn (`q`). Et mål blir utelatt når dataene ikke kan bære det: runder og utstyrsverdier trengs for kjøpsenighet, skadehendelser for undertrykking, drap og dødsfall tilskrevet enheter for serier og risiko.

## I masseanalysen {#in-the-mass-analysis}

Hvert kampsammendrag (`<kamp>.summary.json`, se [Masseanalyse](mass-analysis.md)) har de samme målene for den kampen i sin `behaviour`-del, slik at tusenvis av kamper kan sammenlignes uten at radene leses på nytt.

## Hvor godt det virker {#how-well-it-works}

På simulerte slag med hver effekt innebygd, og de samme verdenene uten (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): hvert mål finner effekten det er plantet, og nullverdenene blir under grensen for falske funn. Risiko etter tap har minst styrke; flokking etter ruter kan ikke skille kopiering fra en felles plan (en side som deler ett mål, «flokker» etter dette målet).

## For utviklere {#for-developers}

- `src/insights/behaviour/acc.ts` – akkumulatoren (resamplede spor, hendelser, runder) og `finish`; `motion.ts` og `choice.ts` målene;
  `bstats.ts` hjelpere for permutasjon, bootstrap og kappa; `shows.ts` mønstrene og setningene linsen leser (`lens.<measure>`).
- `feed.ts` mater den fra innsiktsarbeiderens biter; `summaryTap.ts` fra et kampsammendrag mens det strømmer gjennom tabellen.
- Kunnskap: `src/insights/knowledge/behaviour.ts` (oppføringer), `patterns-behaviour.ts`, `refs-behaviour.ts` (referanser, hver kontrollert mot sin Crossref- eller Open Library-post).
- Etiketter: `lens.metric.<measure>` i `locales/*/lens.json`.
