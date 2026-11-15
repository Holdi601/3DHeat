---
title: "Skupinsko vedenje"
parent: "Vpogledi"
nav_order: 3
lang: "sl"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Skupinsko vedenje: množice, jate, črede in odločitve pod pritiskom

Igralci v tekmi se vedejo kot ljudje kjerkoli: zbirajo se pri vratih, sledijo tistemu, ki je šel prvi, ostanejo skupaj ali zaostajajo, se po hudih izgubah umaknejo in po slabem življenju tvegajo več. **Meritve leče za vedenje** merijo te vzorce z metodami znanosti o množicah, fizike skupinskega gibanja, vedenjske ekonomije in vojaške psihologije. Vsako primerja s svojim ničelnim modelom in jih bere prek ustreznih vnosov v [bazi znanja](knowledge.md).

## Preizkusite {#try-it}

1. Naložite eno ali več tekem s časom, položaji in ekipami.
2. Odprite **Ugotovitve** in jo zaženite.
3. Razvijte **Meritve leče**: meritve vedenja so naštete med drugimi (Usklajenost skupine, Usmerjanje po poti, Pasovi in sledi, Gneča, Vodje in sledilci, Povezanost in zaostajalci, Prelomna točka, Tveganje po izgubah, Nizi, Dogovor o nakupu, Zatiranje), vsaka s svojimi števili, preizkusom in literaturo, ki jo razlaga.
4. **Povzetek** se sklicuje nanje; **Napiši z AI** jih pošlje skupaj s poročilom.

## Meritve {#the-measures}

Poti se ponovno vzorčijo na eno točko vsaki 2 s (položaj na koncu intervala in hitrost čez njega). Razdalje se merijo glede na običajni razmik podatkov – mediana razdalje od enote do najbližjega soigralca – zato ista meritev deluje za pehoto, tanke in letala.

| Meritev | Kaj meri | Ničelni model in preizkus | Znanje |
|---|---|---|---|
| Usklajenost skupine | Polarizacija (dolžina povprečne smeri enot) premikajočih se enot vsake strani vsaki 2 s, vrtenje okoli težišča (mlatenje), deleži časa polariziranega, mlatenja in roja, po fazah tekme; v bojih med dvema usklajenima stranema delež ubitij bolj usklajene strani | Vsaka pot enote se premakne v času znotraj tekme (ohrani njeno pot, prekine sočasnost); preizkus obrnjenega predznaka v oknih po 60 s | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Usmerjanje po poti | Kako pogosto enota zapusti kraj tako, kot je to storil soigralec pred njo (v 30 s), za isti vhod, glede na lastne deleže izhodov kraja – in glede na posnemanje sovražnikovega prejšnjega prehoda | Izhodi premešani znotraj kraja in vhoda; učinek je posnemanje soigralca minus posnemanje sovražnika (Manskijev problem odzrcaljenja: posnemanje in skupni načrt izgledata enako) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Pasovi in sledi | Bočna ločitev obeh smeri na krajih s protitokom; delež gibanja na najbolj zasedenih 10 % tal, njegov Ginijev koeficient in prekrivanje najbolj zasedenih tal med tekmami | Smeri premešane med celotnimi obiski; dve mreži, zamaknjeni za pol kraja, vsaka preizkušena, Bonferroni | Helbing et al. 1997, 2005 |
| Gneča | Hitrost (glede na lastni tempo enote) in tok po številu sosedov v dvakratniku običajnega razmika, upad zmogljivosti pri najgostejšem razredu, na najbolj zasedenih tleh; smrti na uro v gnečah; streli na minuto soigralcev v bližini (socialno lenarjenje) | Vsaka enota ima lastno korelacijo hitrosti in gostote, preizkus obrnjenega predznaka po enotah, najmanjši učinek ρ nad ±0,05; natančni preizkusi stopenj | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Vodje in sledilci | Za soigralce, ki potujejo skupaj, zamik časa (do 8 s), pri katerem smer enega najbolje napove smer drugega; graf vodij, tranzitivnost trojic, stopnje smrti in ubitij vodij | Pari z eno potjo, premaknjeno v času, dajo 95-odstotni prag; binomski preizkus proti 5 % | Nagy et al. 2010, Couzin et al. 2005 |
| Povezanost in zaostajalci | Čas, preživet več kot trikrat dlje od običajnega razmika od najbližjega soigralca; stopnja smrti tam v primerjavi s skupino; razmik strani v primerjavi z njenim deležem ubitij v boju | Natančen pogojni preizkus dveh Poissonovih stopenj | Shils and Janowitz 1948, Siebold 2007 |
| Prelomna točka | Hitrost približevanja sovražniku (v tempu strani) glede na delež strani, izgubljen v zadnji minuti; najnižja raven izgub, pri kateri se strani umaknejo | Enostranski gručni bootstrap proti umiku za desetino tempa (izgube pridejo tam, kjer se strani srečajo, strani, ki se srečajo, pa nehajo približevati), Bonferroni po ravneh | Dupuy 1987, Rowland 2006 |
| Tveganje po izgubah | Delež naslednjega življenja, preživetega pred svojo stranjo proti sovražniku, nad lastnim deležem strani in drugimi vračajočimi se enotami v tistem času: po življenju, izgubljenem brez ubitja, v primerjavi s tistim z ubitjem; zgodnja smrt po zgodnji smrti (nagnjenost) | Življenja vsake enote premešana (prvo ohranjeno), tako da je pristranskost končnega zaporedja v ničelnem modelu | Kahneman and Tversky 1979, Thaler and Johnson 1990 |
| Nizi | P(ubitje po k ubitjih) − P(ubitje po k smrtih), k = 1..3 | Zaporedje vsakega igralca premešano 1000-krat: odštje se pristranskost, ki sta jo pokazala Miller in Sanjurjo; Bonferroni po k | Gilovich et al. 1985, Miller and Sanjurjo 2018 |
| Dogovor o nakupu | Fleissov κ pasov opreme (eko, sila, poln; tretjine zunaj Counter-Strikea) znotraj runde strani | Runde igralcev strani premešane med njenimi rundami | Fleiss 1971 |
| Zatiranje | Hitrost v 4 s po neletalni škodi v primerjavi s 4 s pred njo in streli v 10 s po v primerjavi s pred njimi, pri zadetkih in pri trenutkih miru iste enote | Preizkus obrnjenega predznaka po enotah, najmanjši učinki 0,05 tempa in en strel na minuto | Rowland 2006 |

Vsaka p-vrednost v poročilu gre skozi Benjamini-Hochbergovo stopnjo lažnih odkritij (`q`). Meritev se izpusti, kadar je podatki ne morejo nositi: za dogovor o nakupu so potrebne runde in vrednosti opreme, za zatiranje dogodki škode, za nize in tveganje pa ubitja in smrti, pripisani enotam.

## V množični analizi {#in-the-mass-analysis}

Vsak povzetek tekme (`<tekma>.summary.json`, glejte [Množična analiza](mass-analysis.md)) nosi iste meritve za to tekmo v razdelku `behaviour`, zato je mogoče primerjati na tisoče tekem, ne da bi znova brali njihove vrstice.

## Kako dobro deluje {#how-well-it-works}

Na simuliranih bitkah z vgrajenim vsakim učinkom in na istih svetovih brez njih (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): vsaka meritev najde svoj vgrajeni učinek, ničelni svetovi pa ostanejo pod pragom lažnih odkritij. Tveganje po izgubah ima najmanjšo moč; usmerjanje po poti ne loči posnemanja od skupnega načrta (stran, ki deli en cilj, je s to meritvijo »usmerjanje«).

## Za razvijalce {#for-developers}

- `src/insights/behaviour/acc.ts` – akumulator (ponovno vzorčene poti, dogodki, runde) in `finish`; `motion.ts` in `choice.ts` sta meritvi; `bstats.ts` pomožne funkcije za permutacije, bootstrap in κ; `shows.ts` vzorci in stavki, ki jih bere leča (`lens.<measure>`).
- `feed.ts` ga napaja iz kosov delavca za vpoglede; `summaryTap.ts` iz povzetka tekme, ko pretaka tabelo.
- Znanje: `src/insights/knowledge/behaviour.ts` (vnosi), `patterns-behaviour.ts`, `refs-behaviour.ts` (reference, vsaka preverjena na zapisu Crossref ali Open Library).
- Oznake: `lens.metric.<measure>` v `locales/*/lens.json`.
