---
title: "Kolektivno ponašanje"
parent: "Uvidi"
nav_order: 3
lang: "hr"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Kolektivno ponašanje: gužve, jata, krda i odluke pod pritiskom

Igrači u meču se ponašaju kao ljudi bilo gdje: skupljaju se na vratima, slijede onoga tko je prvi krenuo, drže se zajedno ili zaostaju, povlače se nakon teških gubitaka i preuzimaju više rizika nakon lošeg života. **Mjere leće ponašanja** mjere te obrasce metodama znanosti o gužvama, fizike kolektivnog kretanja, bihevioralne ekonomije i vojne psihologije, svaku naspram vlastitog nultog modela, i tumače ih preko odgovarajućih unosa [baze znanja](knowledge.md).

## Isprobajte {#try-it}

1. Učitajte jedan ili više mečeva s vremenom, pozicijama i timovima.
2. Otvorite **Uvidi** i pokrenite ga.
3. Raširite **Mjere leće**: mjere ponašanja navedene su uz ostale (Kolektivno usklađivanje, Krdo na rutama, Trake i staze, Gužva, Vođe i sljedbenici, Kohezija i zaostali, Točka loma, Rizik nakon gubitaka, Nizovi, Usklađenost kupnje, Suzbijanje vatrom), svaka sa svojim brojkama, svojim testom i literaturom koja je objašnjava.
4. **Sažetak** ih navodi; **Napiši uz UI** ih šalje uz izvještaj.

## Mjere {#the-measures}

Putanje se ponovno uzorkuju na jednu točku svake 2 s (pozicija na kraju intervala i brzina preko njega). Udaljenosti se skaliraju prema tipičnom razmaku samih podataka, medijanu udaljenosti jedinice od njezina najbližeg suigrača, pa ista mjera radi za pješaštvo, tenkove i zrakoplove.

| Mjera | Što mjeri | Nulti model i test | Znanje |
|---|---|---|---|
| Kolektivno usklađivanje | Polarizacija (duljina prosječnog smjera jedinica) pokretnih jedinica svake strane svake 2 s, vrtnja oko težišta (rotacija), udjeli vremena polarizirani, vrtložni i roji po fazi meča; u borbama između dvije usklađene strane, udio ubojstava strane koja je usklađenija | Putanja svake jedinice pomaknuta u vremenu unutar meča (zadržava put, prekida istovremenost); test promjene predznaka preko prozora od 60 s | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Krdo na rutama | Koliko često jedinica napušta mjesto onako kako je to učinio suigrač prije nje (unutar 30 s), za isti ulaz, naspram vlastitih udjela izlaza s mjesta, i naspram kopiranja ranijeg prolaza neprijatelja | Izlazi promiješani unutar mjesta i ulaza; učinak je suigrač minus kopiranje neprijatelja (Manskijev problem refleksije: kopiranje i zajednički plan izgledaju slično) | Banerjee 1992, Bikhchandani i dr. 1992, Manski 1993 |
| Trake i staze | Bočno razdvajanje dvaju smjerova na mjestima s protutokom; udio kretanja na najprometnijih 10% tla, njegov Ginijev koeficijent i preklapanje najprometnijeg tla mečeva | Smjerovi promiješani između cijelih posjeta; dvije mreže pomaknute za pola mjesta, svaka testirana, Bonferroni | Helbing i dr. 1997, 2005 |
| Gužva | Brzina (u odnosu na vlastiti tempo jedinice) i protok po broju susjeda unutar dvostrukog tipičnog razmaka, pad kapaciteta u najgušćoj klasi, na najprometnijem tlu; smrti po satu u gužvama; hici u minuti suigrača u blizini (socijalno lijenčarenje) | Vlastita korelacija brzine i gustoće svake jedinice, promjena predznaka preko jedinica, najmanji učinak ρ izvan ±0,05; točni testovi stope | Helbing i dr. 2000, Seyfried i dr. 2005, Latané i dr. 1979 |
| Vođe i sljedbenici | Za suigrače koji putuju zajedno, vremensko kašnjenje (do 8 s) pri kojem smjer jednog najbolje predviđa smjer drugog; graf vođa, tranzitivnost trijada, stope smrti i ubojstava vođa | Parovi s jednom putanjom pomaknutom u vremenu daju prag od 95%; binomni test naspram 5% | Nagy i dr. 2010, Couzin i dr. 2005 |
| Kohezija i zaostali | Vrijeme provedeno dalje od tri puta tipičnog razmaka strane od najbližeg suigrača; stopa smrti tamo naspram stope s grupom; razmak strane naspram njezina udjela u ubojstvima borbe | Točan uvjetovani test dviju Poissonovih stopa | Shils i Janowitz 1948, Siebold 2007 |
| Točka loma | Brzina približavanja neprijatelju (u vlastitom tempu strane) po udjelu strane izgubljenom u zadnjoj minuti; najniža razina gubitka pri kojoj se strane povlače | Jednostrani bootstrap grupa naspram povlačenja od desetine tempa (gubici dolaze tamo gdje se strane sastanu, a strane koje se sretnu prestaju se približavati), Bonferroni preko razina | Dupuy 1987, Rowland 2006 |
| Rizik nakon gubitaka | Udio sljedećeg života potrošen ispred vlastite strane prema neprijatelju, iznad vlastitog udjela strane i drugih jedinica koje se u tom trenutku vraćaju: nakon života izgubljenog bez ubojstva naspram nakon onog s ubojstvom; rana smrt nakon rane smrti (nagnutost) | Životi svake jedinice promiješani (prvi život zadržan), pa je pristranost konačnog niza u nultom modelu | Kahneman i Tversky 1979, Thaler i Johnson 1990 |
| Nizovi | P(ubojstvo nakon k ubojstava) − P(ubojstvo nakon k smrti), k = 1..3 | Niz svakog igrača promiješan 1000 puta: oduzima se pristranost koju su pokazali Miller i Sanjurjo; Bonferroni preko k | Gilovich i dr. 1985, Miller i Sanjurjo 2018 |
| Usklađenost kupnje | Fleissov κ pojasa opreme (eko, sila, puna; tercili izvan Counter-Strikea) unutar runde strane | Runde igrača te strane promiješane preko njezinih rundi | Fleiss 1971 |
| Suzbijanje vatrom | Brzina u 4 s nakon štete koja nije smrtonosna naspram 4 s prije, i hici u 10 s nakon naspram prije, kod pogodaka i kod mirnih trenutaka iste jedinice | Promjena predznaka preko jedinica, najmanji učinci 0,05 tempa i jedan hitac u minuti | Rowland 2006 |

Svaka p-vrijednost izvještaja prolazi kroz Benjamini-Hochbergovu stopu lažnih otkrića (`q`). Mjera se izostavlja kad je podaci ne mogu nositi: za usklađenost kupnje potrebne su runde i vrijednosti opreme, za suzbijanje štetni događaji, a za nizove i rizik ubojstva i smrti pripisani jedinicama.

## U analizi mase {#in-the-mass-analysis}

Svaki sažetak meča (`<match>.summary.json`, pogledajte [Analiza mase](mass-analysis.md)) nosi iste mjere za taj meč u svom odjeljku `behaviour`, pa se tisuće mečeva mogu uspoređivati bez ponovnog čitanja njihovih redaka.

## Koliko dobro radi {#how-well-it-works}

Na simuliranim bitkama s ugrađenim svakim učinkom i istim svjetovima bez njih (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): svaka mjera pronalazi svoj ugrađeni učinak, a nulti svjetovi ostaju ispod praga lažnog otkrića. Rizik nakon gubitaka ima najmanju snagu; krdo na rutama ne može razlikovati kopiranje od zajedničkog plana (strana koja dijeli jedan cilj je po ovoj mjeri "krdo").

## Za razvojne programere {#for-developers}

- `src/insights/behaviour/acc.ts` - akumulator (ponovno uzorkovane putanje, događaji, runde) i `finish`; `motion.ts` i `choice.ts` mjere; `bstats.ts` pomoćne funkcije za permutacije, bootstrap i kappa; `shows.ts` obrasci i rečenice koje leća čita (`lens.<measure>`).
- `feed.ts` ga puni iz dijelova insight workera; `summaryTap.ts` iz sažetka meča dok se tablica strujno prenosi.
- Znanje: `src/insights/knowledge/behaviour.ts` (unosi), `patterns-behaviour.ts`, `refs-behaviour.ts` (reference, svaka provjerena prema svom Crossref ili Open Library zapisu).
- Oznake: `lens.metric.<measure>` u `locales/*/lens.json`.
