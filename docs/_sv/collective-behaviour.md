---
title: "Gruppbeteende"
parent: "Insikter"
nav_order: 3
lang: "sv"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Gruppbeteende: folksamlingar, flockar, hjordar och beslut under press

Spelare i en match beter sig som människor var som helst. De samlas vid dörrar, följer efter den som gick först, håller ihop eller släpar efter, drar sig tillbaka efter tunga förluster och tar större risker efter ett dåligt liv. **Mått för beteendelinsen** mäter sådana mönster med metoder från folkmassforskning, fysik för kollektiv rörelse, beteendeekonomi och militärpsykologi. Varje mått jämförs med sin egen nollmodell. Resultaten tolkas med hjälp av de passande posterna i [kunskapsbasen](knowledge.md).

## Prova det {#try-it}

1. Läs in en eller flera matcher med tid, positioner och lag.
2. Öppna **Insikter** och kör den.
3. Fäll ut **Mått för linsen**. Beteendemåtten listas bland de andra (Kollektiv linjering, Flockbeteende på rutter, Filer och stigar, Trängsel, Ledare och följare, Sammanhållning och eftersläntrare, Brytpunkt, Risk efter förluster, Sviter (het hand), Enighet om köp, Nedhållande eld). Varje mått visas med sina siffror, sitt test och den litteratur som förklarar det.
4. **Genomgången** refererar till dem, och **Skriv med AI** skickar med dem i rapporten.

## Måtten {#the-measures}

Spåren resamplas till en punkt var 2 s (positionen vid slutet av intervallet och hastigheten över det). Avstånden skalas med datans egen typiska avstånd, det vill säga medianavståndet från en enhet till dess närmaste lagkamrat. Samma mått fungerar därmed för infanteri, stridsvagnar och flygplan.

| Mått | Vad det mäter | Nollmodell och test | Kunskap |
|---|---|---|---|
| Kollektiv linjering | Polarisering (längden på den genomsnittliga rubriken för enheterna) för varje sidas rörliga enheter var 2 s. Virvlande (rotation kring tyngdpunkten). Andelar av tiden som är polariserad, virvlande och svärmande, per matchfas. I strider mellan två linjerade sidor, den mer linjerade sidans andel av dödandena | Varje enhets egen bana förskjuten i tiden inom matchen (behåller sin väg men bryter samtidigheten). Teckenvändningstest över 60 s-fönster | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Flockbeteende på rutter | Hur ofta en enhet lämnar en plats på samma sätt som lagkamraten före den gjorde (inom 30 s), för samma inväg, mot platsens egna utvägsandelar, och mot att kopiera en fiendes tidigare passage | Utvägar blandas inom plats och inväg. Effekten är lagkamraternas kopiering minus fiendens (Manskis reflektionsproblem: kopiering och en plan som sidan delar ser lika ut) | Banerjee 1992, Bikhchandani m.fl. 1992, Manski 1993 |
| Filer och stigar | Sidledssegregering av de två riktningarna på platser med motriktad trafik. Andelen rörelse på de mest trafikerade 10 % av marken, dess Gini-värde och överlappningen av matchernas mest trafikerade mark | Riktningar blandas mellan hela besök. Två rutnät förskjutna med en halv plats, var och en testad, Bonferroni | Helbing m.fl. 1997, 2005 |
| Trängsel | Hastighet (i förhållande till enhetens eget tempo) och flöde efter antalet grannar inom dubbla det typiska avståndet, kapacitetsfallet i den tätaste klassen, på den mest trafikerade marken. Dödsfall per timme i folksamlingar. Skott per minut av lagkamrater i närheten (social lättja) | Varje enhets egen korrelation mellan hastighet och täthet, teckenvändning över enheter, lägsta effekt ρ bortom ±0,05. Exakta frekvenstest | Helbing m.fl. 2000, Seyfried m.fl. 2005, Latané m.fl. 1979 |
| Ledare och följare | För lagkamrater som färdas tillsammans, den tidsförskjutning (upp till 8 s) vid vilken den ena enhetens rubrik bäst förutsäger den andras. Ledargraf, transitivitet i triader, ledarnas dödsfall och dödandefrekvens | Par där en bana förskjutits i tiden ger 95 %-tröskeln. Binomialtest mot 5 % | Nagy m.fl. 2010, Couzin m.fl. 2005 |
| Sammanhållning och eftersläntrare | Tid som tillbringas längre än tre gånger sidans typiska avstånd från närmaste lagkamrat. Dödsfallsfrekvensen där jämfört med i gruppen. En sidas avstånd jämfört med dess andel av en strids dödanden | Exakt villkorligt test av två Poisson-frekvenser | Shils och Janowitz 1948, Siebold 2007 |
| Brytpunkt | Närmningshastighet mot fienden (i sidans eget tempo) efter andelen av sidan som förlorats under den senaste minuten. Den lägsta förlustnivån vid vilken sidor drar sig tillbaka | Ensidig klusterbootstrap mot en reträtt på en tiondel av tempot (förluster sker där sidor möts, och sidor som möts slutar närma sig). Bonferroni över nivåerna | Dupuy 1987, Rowland 2006 |
| Risk efter förluster | Andel av nästa liv som tillbringas före sin sida mot fienden, över sidans egen andel och andra återvändande enheter vid den tiden. Efter ett liv som förlorades utan dödande, mot efter ett med dödande. Tidigt dödsfall efter tidigt dödsfall (lutning) | Varje enhets liv blandas (det första livet behålls), så att den ändliga sekvensens bias finns i nollmodellen | Kahneman och Tversky 1979, Thaler och Johnson 1990 |
| Sviter (het hand) | P(dödande efter k dödanden) − P(dödande efter k dödsfall), k = 1..3 | Varje spelares egna sekvens blandas 1 000 gånger. Biasen som Miller och Sanjurjo visade dras bort. Bonferroni över k | Gilovich m.fl. 1985, Miller och Sanjurjo 2018 |
| Enighet om köp | Fleiss kappa för utrustningsnivåerna (eko, styrka, full; tertiler utanför Counter-Strike) inom en sidas runda | Sidans spelar-ronder blandas över sidans rundor | Fleiss 1971 |
| Nedhållande eld | Hastighet under de 4 s efter icke dödlig skada mot de 4 s före, och skott under de 10 s efter mot före, vid träffar och vid samma enhets lugna ögonblick | Teckenvändning över enheter, lägsta effekter 0,05 av tempot och ett skott per minut | Rowland 2006 |

Varje p-värde i rapporten går genom Benjamini-Hochbergs falsk-upptäcktsfrekvens (`q`). Ett mått utelämnas när data inte kan bära det. Rundor och utrustningsvärden behövs för enighet om köp, skadehändelser för nedhållande eld, och dödanden och dödsfall som tillskrivs enheter för sviter och risk.

## I massanalysen {#in-the-mass-analysis}

Varje matchsammanfattning (`<match>.summary.json`, se [Massanalys](mass-analysis.md)) innehåller samma mått för matchen i sitt avsnitt `behaviour`. Tusentals matcher kan därmed jämföras utan att raderna läses om.

## Hur väl det fungerar {#how-well-it-works}

På simulerade slag, där varje effekt är inbyggd, och på samma världar utan den (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): varje mått hittar sin inbyggda effekt, och nollvärldarna stannar under tröskeln för falska upptäckter. Risk efter förluster har lägst styrka. Flockbeteende på rutter kan inte skilja kopiering från en gemensam plan. En sida som delar ett mål räknas som "flockbeteende" av det måttet.

## För utvecklare {#for-developers}

- `src/insights/behaviour/acc.ts`: ackumulatorn (resamplade spår, händelser, rundor) och `finish`. `motion.ts` och `choice.ts` innehåller måtten. `bstats.ts` har hjälpfunktionerna för permutation, bootstrap och kappa. `shows.ts` har mönstren och meningarna som linsen läser (`lens.<measure>`).
- `feed.ts` matar den från insiktsarbetarens delar. `summaryTap.ts` matar den från en matchsammanfattning när tabellen strömmar.
- Kunskap: `src/insights/knowledge/behaviour.ts` (poster), `patterns-behaviour.ts` och `refs-behaviour.ts` (referenser, var och en kontrollerad mot sin Crossref- eller Open Library-post).
- Etiketter: `lens.metric.<measure>` i `locales/*/lens.json`.
