---
title: "Kollektiv adfærd"
parent: "Indsigter"
nav_order: 3
lang: "da"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Kollektiv adfærd: folkemængder, flokke, hjorde og beslutninger under pres

Spillere i en kamp opfører sig som mennesker alle andre steder: de samler sig ved døre, følger den, der gik først, holder sammen eller hænger bagud, trækker sig tilbage efter store tab og tager større risici efter et dårligt liv. **Adfærdslinsens måltal** måler disse mønstre med metoder fra menneskemængdeforskning, fysik for kollektiv bevægelse, adfærdsøkonomi og militærpsykologi, hver mod sin egen nulmodel, og læser dem gennem de tilsvarende poster i [vidensbasen](knowledge.md).

## Prøv det {#try-it}

1. Indlæs en eller flere kampe med tid, positioner og hold.
2. Åbn **Indsigter** og kør den.
3. Fold **Linsemål** ud: adfærdsmålene står på listen sammen med de andre (Kollektiv retning, Rutefølgning, Baner og spor, Trængsel, Ledere og følgere, Sammenhold og hængere, Brudpunkt, Risiko efter tab, Serier, Købsenighed, Undertrykkelse), hver med sine tal, sin test og den litteratur, der forklarer den.
4. **Gennemgangen** henviser til dem, og **Skriv med AI** sender dem med rapporten.

## Målene {#the-measures}

Spor resamples til ét punkt hvert 2. sekund (positionen ved slutningen af intervallet og hastigheden over det). Afstande skaleres efter dataenes egen typiske afstand - medianafstanden fra en enhed til dens nærmeste holdkammerat - så det samme mål virker for infanteri, tanke og fly.

| Mål | Hvad det måler | Nulmodel og test | Viden |
|---|---|---|---|
| Kollektiv retning | Polarisering (længden af den gennemsnitlige enhedsretning) for hver sides bevægelige enheder hvert 2. sekund, cirkulering (rotation om tyngdepunktet), andel af tiden polariseret, cirkulerende og svømmende, pr. kampfase; i kampe mellem to rettede sider den mere rettede sides andel af drabene | Hver enheds egen bane forskudt i tid inden for kampen (beholder dens sti, bryder samtidigheden); fortegnsvendingstest over 60 sekunders vinduer | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Rutefølgning | Hvor ofte en enhed forlader et sted på den måde, holdkammeraten før den gjorde (inden for 30 sekunder), for samme indgang mod stedets egne udgangsandele - og mod at kopiere en fjendes tidligere passage | Udgange blandet inden for sted og indgang; effekten er holdkammerat minus fjendekopiering (Manskis spejlingsproblem: kopiering og en plan, siden deler, ligner hinanden) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Baner og spor | Lateral adskillelse af de to retninger på steder med modgående trafik; andel af bevægelsen på de travleste 10 % af terrænet, dets Gini og overlapningen af kampenes travleste terræn | Retninger blandet mellem hele besøg; to gitre forskudt med en halv plads, hver testet, Bonferroni | Helbing et al. 1997, 2005 |
| Trængsel | Hastighed (i forhold til enhedens eget tempo) og flow efter antal naboer inden for to gange den typiske afstand, kapacitetsfaldet i den tætteste klasse, på det travleste terræn; dødsfald pr. time i folkemængder; skud pr. minut fra nærliggende holdkammerater (social loafing) | Hver enheds egen hastighed-tæthed-korrelation, fortegnsvending over enheder, mindste effekt ρ ud over ±0,05; eksakte rate-tests | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Ledere og følgere | For holdkammerater, der rejser sammen, den tidsforskydning (op til 8 sekunder), hvor den ene enheds retning bedst forudsiger den andens; lederdiagram, transitivitet i triader, lederes dødsfalds- og drabsrater | Par med den ene bane forskudt i tid giver 95 %-grænsen; binomialtest mod 5 % | Nagy et al. 2010, Couzin et al. 2005 |
| Sammenhold og hængere | Tid brugt ud over tre gange sidens typiske afstand fra nærmeste holdkammerat; dødsrate der mod med gruppen; en sides afstand mod dens andel af en kamps drab | Eksakt betinget test af to Poisson-rater | Shils og Janowitz 1948, Siebold 2007 |
| Brudpunkt | Nærmehastighed mod fjenden (i sidens eget tempo) efter andelen af siden, der er tabt i det sidste minut; det laveste tabsniveau, hvor sider trækker sig tilbage | Ensidet klyngebootstrap mod en tilbagetrækning på en tiendedel af tempoet (tab kommer, hvor sider mødes, og sider, der mødes, holder op med at lukke afstanden), Bonferroni over niveauer | Dupuy 1987, Rowland 2006 |
| Risiko efter tab | Andel af det næste liv brugt foran ens side mod fjenden, over sidens egen andel og andre vendende enheder på det tidspunkt: efter et liv tabt uden drab mod efter et med drab; tidligt dødsfald efter tidligt dødsfald (tilt) | Hvert enheds liv blandet (første liv beholdt), så bias i den endelige følge indgår i nulmodellen | Kahneman og Tversky 1979, Thaler og Johnson 1990 |
| Serier | P(drab efter k drab) − P(drab efter k dødsfald), k = 1..3 | Hver spillers egen følge blandet 1.000 gange: den bias, Miller og Sanjurjo viste, trækkes fra; Bonferroni over k | Gilovich et al. 1985, Miller og Sanjurjo 2018 |
| Købsenighed | Fleiss' κ for udstyrsklasserne (eco, styrke, fuld; tertiler uden for Counter-Strike) inden for en sides runde | Sidens spiller-runder blandet over dens runder | Fleiss 1971 |
| Undertrykkelse | Hastighed i de 4 sekunder efter ikke-dødelig skade mod de 4 sekunder før, og skud i de 10 sekunder efter mod før, ved træffere og ved den samme enheds rolige øjeblikke | Fortegnsvending over enheder, mindste effekter 0,05 af tempoet og ét skud i minuttet | Rowland 2006 |

Hver p-værdi i rapporten går gennem Benjamini-Hochberg-kontrollen for falske fund (`q`). Et mål udelades, når dataene ikke kan bære det: runder og udstyrsværdier er nødvendige for købsenighed, skadehændelser for undertrykkelse, drab og dødsfald tilskrevet enheder for serier og risiko.

## I masseanalysen {#in-the-mass-analysis}

Hvert kampresumé (`<kamp>.summary.json`, se [Masseanalyse](mass-analysis.md)) bærer de samme mål for den kamp i sin `behaviour`-del, så tusindvis af kampe kan sammenlignes uden at læse deres rækker igen.

## Hvor godt det virker {#how-well-it-works}

På simulerede slag med hver effekt indbygget, og de samme verdener uden (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): hvert mål finder sin indlagte effekt, og nulverdenerne bliver under tærsklen for falske fund. Risiko efter tab har mindst styrke; rutefølgning kan ikke skelne kopiering fra en fælles plan (en side, der deler ét mål, "følger" efter dette mål).

## For udviklere {#for-developers}

- `src/insights/behaviour/acc.ts` - akkumulatoren (resamplede spor, hændelser, runder) og `finish`; `motion.ts` og `choice.ts` målene;
  `bstats.ts` permutation, bootstrap og kappa-hjælpere; `shows.ts` mønstrene og sætningerne linsen læser (`lens.<mål>`).
- `feed.ts` fodrer den fra insight-workerens bidder; `summaryTap.ts` fra et kampresumé, mens det streamer tabellen.
- Viden: `src/insights/knowledge/behaviour.ts` (poster),
  `patterns-behaviour.ts`, `refs-behaviour.ts` (referencer, hver kontrolleret
  mod sin Crossref- eller Open Library-post).
- Etiketter: `lens.metric.<mål>` i `locales/*/lens.json`.
