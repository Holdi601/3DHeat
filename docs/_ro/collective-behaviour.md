---
title: "Comportament colectiv"
parent: "Observații"
nav_order: 3
lang: "ro"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Comportament colectiv: mulțimi, cârduri, turme și decizii sub presiune

Jucătorii dintr-un meci se poartă ca oamenii oriunde: se înghesuie la uși, urmează pe cine a plecat primul, rămân împreună sau se risipesc, se retrag după pierderi grele și își asumă mai mult risc după o viață proastă. **Măsurile lentilei de comportament** măsoară aceste tipare cu metodele științei mulțimilor, ale fizicii mișcării colective, ale economiei comportamentale și ale psihologiei militare, fiecare față de propriul model nul, și le citesc prin intrările corespunzătoare din [baza de cunoștințe](knowledge.md).

## Încearcă {#try-it}

1. Încarcă unul sau mai multe meciuri cu timp, poziții și echipe.
2. Deschide **Observații** și rulează-l.
3. Desfă **Măsurile lentilei**: măsurile de comportament sunt listate alături de celelalte (Aliniere colectivă, Turmare pe rute, Benzi și urme, Aglomerare, Lideri și urmăritori, Coeziune și rămânători, Punct de rupere, Risc după pierderi, Serii, Acord la cumpărare, Suprimare), fiecare cu cifrele sale, testul său și literatura care o explică.
4. **Rezumatul** le citează; **Scrie cu IA** le trimite odată cu raportul.

## Măsurile {#the-measures}

Traseele sunt reeșantionate la un punct la fiecare 2 s (poziția de la sfârșitul intervalului și viteza pe el). Distanțele sunt scalate după distanța tipică a datelor - distanța mediană de la o unitate la cel mai apropiat coleg de echipă - astfel încât aceeași măsură funcționează pentru infanterie, tancuri și aeronave.

| Măsură | Ce măsoară | Model nul și test | Cunoștințe |
|---|---|---|---|
| Aliniere colectivă | Polarizarea (lungimea direcției medii a unităților) unităților în mișcare ale fiecărei părți, din 2 în 2 s; învârtirea în jurul centroidului; ponderea timpului în care sunt polarizate, învârtite și în roi, pe faze ale meciului; în luptele dintre două părți aliniate, partea mai aliniată are partea din uciderile celeilalte | Traseul propriu al fiecărei unități, deplasat în timp în cadrul meciului (păstrează calea, rupe simultaneitatea); test de inversare a semnului pe ferestre de 60 s | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Turmare pe rute | Cât de des pleacă o unitate dintr-un loc pe calea pe care a plecat coechipierul dinaintea ei (în 30 s), pentru aceeași cale de intrare, față de ponderile de ieșire ale locului - și față de copierea unei treceri anterioare a unui inamic | Ieșirile amestecate în cadrul locului și al intrării; efectul este copierea de către coechipieri minus copierea de către inamic (problema reflexiei lui Manski: copierea și un plan comun unei părți arată la fel) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Benzi și urme | Separarea laterală a celor două direcții în locuri cu contrafluxuri; ponderea mișcării pe cel mai aglomerat 10% din teren, coeficientul său Gini și suprapunerea celui mai aglomerat teren al meciurilor | Direcțiile amestecate între vizite întregi; două grile decalate cu o jumătate de loc, fiecare testată, Bonferroni | Helbing et al. 1997, 2005 |
| Aglomerare | Viteza (față de pasul propriu al unității) și fluxul după numărul de vecini aflați la cel mult de două ori distanța tipică, scăderea capacității în clasa cea mai densă, pe cel mai aglomerat teren; decese pe oră în mulțimi; împușcături pe minut ale coechipierilor din apropiere (lenevia socială) | Corelația proprie viteză-densitate a fiecărei unități, inversarea semnului pe unități, efect minim ρ peste ±0,05; teste exacte de rată | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Lideri și urmăritori | Pentru coechipierii care călătoresc împreună, decalajul de timp (până la 8 s) la care direcția unuia îl prezice cel mai bine pe celălalt; graful liderilor, tranzitivitatea triadelor, ratele de moarte și de ucidere ale liderilor | Perechile cu un traseu deplasat în timp dau pragul de 95%; test binomial față de 5% | Nagy et al. 2010, Couzin et al. 2005 |
| Coeziune și rămânători | Timpul petrecut dincolo de trei ori distanța tipică a părții față de cel mai apropiat coleg; rata de moarte acolo, față de cea din grup; distanța unei părți față de partea ei din uciderile unei lupte | Test condiționat exact a două rate Poisson | Shils și Janowitz 1948, Siebold 2007 |
| Punct de rupere | Viteza de apropiere de inamic (în pasul părții) după partea din efectivul pierdut în ultimul minut; cel mai mic nivel de pierderi la care părțile se retrag | Bootstrap de cluster unilateral față de o retragere de o zecime din pas (pierderile apar acolo unde părțile se întâlnesc, iar părțile care se întâlnesc încetează să se apropie), Bonferroni peste niveluri | Dupuy 1987, Rowland 2006 |
| Risc după pierderi | Partea din următoarea viață petrecută în fața părții proprii spre inamic, peste partea proprie a părții și alte unități care se întorc în acel moment: după o viață pierdută fără ucidere, față de după una cu ucidere; moarte timpurie după moarte timpurie (înclinare) | Vietățile fiecărei unități amestecate (prima viață păstrată), astfel încât părtinirea secvenței finite este în modelul nul | Kahneman și Tversky 1979, Thaler și Johnson 1990 |
| Serii | P(ucidere după k uciderii) − P(ucidere după k morți), k = 1..3 | Șirul fiecărui jucător amestecat de 1.000 de ori: se scade părtinirea arătată de Miller și Sanjurjo; Bonferroni peste k | Gilovich et al. 1985, Miller și Sanjurjo 2018 |
| Acord la cumpărare | Kappa Fleiss a benzilor de echipament (eco, forță, complet; terțile în afara Counter-Strike) în runda unei părți | Rundele-jucător ale părții amestecate între rundele ei | Fleiss 1971 |
| Suprimare | Viteza în cele 4 s de după un damaj care nu ucide, față de cele 4 s dinainte, și împușcăturile în cele 10 s de după, față de cele dinainte, la lovituri și la momentele liniștite ale aceleiași unități | Inversarea semnului pe unități, efecte minime de 0,05 din pas și o împușcătură pe minut | Rowland 2006 |

Fiecare valoare p a raportului trece prin rata de descoperire falsă Benjamini-Hochberg (`q`). O măsură este lăsată afară când datele nu o pot susține: pentru acordul la cumpărare sunt necesare runde și valorile echipamentului, pentru suprimare evenimentele de daune, iar pentru serii și risc, uciderile și morțile atribuite unităților.

## În analiza în masă {#in-the-mass-analysis}

Fiecare rezumat de meci (`<match>.summary.json`, vezi [Analiza în masă](mass-analysis.md)) poartă aceleași măsuri pentru acel meci, în secțiunea sa `behaviour`, astfel încât mii de meciuri pot fi comparate fără a mai citi rândurile lor.

## Cât de bine funcționează {#how-well-it-works}

Pe bătălii simulate, cu fiecare efect construit înăuntru, și pe aceleași lumi fără el (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): fiecare măsură găsește efectul plantat, iar lumile nule rămân sub pragul de descoperire falsă. Riscul după pierderi are cea mai mică putere; turmarea pe rute nu poate deosebi copierea de un plan comun (o parte care are un singur scop este „turmă” după această măsură).

## Pentru dezvoltatori {#for-developers}

- `src/insights/behaviour/acc.ts` - acumulatorul (trasee reeșantionate, evenimente, runde) și `finish`; `motion.ts` și `choice.ts` măsurile;
  `bstats.ts` ajutoarele pentru permutare, bootstrap și kappa; `shows.ts` tiparele și propozițiile pe care le citește lentila (`lens.<measure>`).
- `feed.ts` o alimentează din bucățile worker-ului de observații; `summaryTap.ts` din rezumatul unui meci, pe măsură ce transmite tabelul.
- Cunoștințe: `src/insights/knowledge/behaviour.ts` (intrări), `patterns-behaviour.ts`, `refs-behaviour.ts` (referințe, fiecare verificată după înregistrarea sa Crossref sau Open Library).
- Etichete: `lens.metric.<measure>` în `locales/*/lens.json`.
