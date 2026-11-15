---
title: "Lupta corp la corp și rundele"
parent: "Observații"
nav_order: 2
lang: "ro"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Lupta corp la corp și rundele

Pentru shootere pe runde (Counter-Strike mai întâi, orice date cu runde, tabere și doborâri), Observații măsoară cum au fost câștigate luptele: cine a luat duelurile de deschidere și ce au valorat, dacă morțile au fost răspunse prin schimb, dacă jucătorul care iese în față la un unghi a bătut pe cel care îl ține, dacă focurile încrucișate și blițurile au meritat, cum s-au mișcat șansele rundei cu fiecare doborâre și care uși i-au doborât pe jucătorii care intrau pe ele. Folosește-o ca să vezi de ce au fost câștigate rundele, nu doar cine a luat doborârile.

Măsurătorile vin din doctrina curățirii camerelor și a luptei urbane (pâlnia fatală, punctele de dominație, focul încrucișat) și din analiza esports-ului și a sporturilor (probabilitatea de a câștiga, valoarea acțiunilor, plus-minus ajustat). Fiecare este citită prin [lentila cunoașterii](knowledge.md) și citată.

## Încearcă {#try-it}

1. Încarcă una sau mai multe meciuri cu runde (o conversie CS2 are tot ce îi trebuie).
2. Deschide **Observații** și apasă **Găsește observații**.
3. Sub **Măsurile lentilei**, citește rândurile de la *Probabilitatea de a câștiga runda* până la *Impactul jucătorului*; fiecare are cifrele lui, intervalul de 95%, valoarea q și sursele pe care le urmează.
4. Alege lentila **Esports** sau **Urban** ca să le citești prin literatura aceea; **Scrie cu IA** le trimite odată cu raportul.

## Ce măsoară {#what-it-measures}

| Măsură | Ce spune | Cum |
|---|---|---|
| Probabilitatea de a câștiga runda | Cât de probabil era ca fiecare tabără să câștige runda în fiecare moment | Regresie logistică pe jucătorii în viață de fiecare parte, bomba sau obiectivul și timpul lor, cronometrul rundei și cumpărătura, potrivită pe datele încărcate; calibrarea verificată în afara potrivirii pe runde (scorul Brier și abilitatea, pierderea logaritmică, eroarea de calibrare pe zece intervale, panta recalibrării, AUC) |
| Valoarea acțiunilor | Cât a schimbat o doborâre, o doborâre de deschidere, un schimb, o doborâre după un bliț, o plantare sau un bliț șansele taberei de a câștiga | Probabilitatea de a câștiga după minus înainte; schimburile, doborârile de deschidere și cele după bliț testate față de celelalte doborâri prin permutare |
| Duelurile de deschidere | Care tabără câștigă primul duel, cât de des acela câștigă runda, și unde o tabără câștigă deschiderile mult peste media ei | Intervale Wilson; locuri prin testul binomial exact față de partea taberei, q pe locuri |
| Schimburile | Morți răspunse de o doborâre a unui coechipier a ucigașului în 5 s, cât a durat, și runde câștigate când prima moarte a fost schimbată | Testul exact Fisher, intervalul Newcombe |
| Cel care iese în față față de cel care ține | Dueluri în care un jucător a intrat în luptă (1,5 m/s sau mai mult în ultima secundă) și celălalt a stat nemișcat (0,75 m/s sau mai puțin): partea celui care a ieșit în față | Testul binomial exact față de jumătate |
| Țintirea înaintea duelului | Privirea fiecărui jucător față de direcția celuilalt cu 0,75 s înainte de doborâre; cine a fost mai bine țintit și cât de des a câștigat acel jucător; cei care țin unghiul lor (în 15°) față de cei scoși din el; razele doborârilor | Testul binomial exact; Fisher |
| Focul încrucișat | Cei care țin, cu un coechipier nemișcat la mai puțin de 25 m de cel care iese în față a cărui linie spre el este cu 35° sau mai mult în afara celei proprii, față de cei care țin singuri | Fisher, Newcombe |
| Utilitarele în intrări | Cei care ies în față în spatele unui bliț al taberei lor (în 3 s și 15 m) sau al unui fum (în 18 s) față de ieșirile în față fără acoperire; duelurile de deschidere cu un bliț doar pe o parte; victimele orbite | Fisher, binomial |
| Avantajul de om | Pentru fiecare stare a jucătorilor în viață (5v4, 4v5, 2v1...) atinsă prima dată într-o rundă, partea rundelor câștigate din ea | Intervale Wilson |
| Clutch-urile | Runde în care o tabără a ajuns la ultimul ei jucător: victorii față de cele așteptate de model, pe numărul de adversari | Test normal al valorii observate față de cea așteptată |
| Grămezi, rotații, pândă | Cel mai mare grup la mai puțin de 10 m la duelul de deschidere (3 sau mai mulți: grămadă); jucătorii la peste 30 m de prima luptă sau de obiectivul plantat și cât de repede ajung la 12 m; timpul și șansele de doborâre-față-de-moarte la peste 30 m de fiecare coechipier | Fisher; raportul de șanse cu intervalul Woolf |
| După plantare și reluare | Runde câștigate de tabăra care a plantat, după cifrele de la plantare, și partea ei din duelurile de după plantare | Intervale Wilson |
| Pâlniile fatale | Intrări în fiecare loc (o schimbare a coloanei de loc, altfel a unei celule de 8 m) și morți în 2,5 s de la intrare, față de rata hărții | Testul binomial exact, q pe locuri; raportul micșorat cu 20 de intrări la rata hărții |
| Impactul jucătorului | Probabilitatea de a câștiga adăugată pe rundă de fiecare jucător (doborâri, morți, plantări), micșorată prin Bayes empiric; plus-minus ajustat de regresie ridge al rezultatelor rundelor față de startul modelului; valoarea doborârii pe loc și armă, micșorată | Penalizare aleasă prin validare încrucișată în cinci părți |

Toate testele unei analize împart o singură rată falsă de descoperire (Benjamini-Hochberg), cu fiecare loc încercat, nu doar locurile arătate; q arătat este peste toate. Modelul și calibrarea lui sunt potrivite pe datele încărcate, deci descriu acea populație: un model profesionist judecă greșit jocul ocazional, și invers.

Verificate pe runde sintetice cu efecte puse (avantajul celui care iese în față, focurile încrucișate, bliturile, o pâlnie fatală, țintirea mai bună câștigând), și pe 100 de seturi de date cu aceleași runde fără ele, unde rata falsă de descoperire a testelor cu efecte puse trebuie să rămână la nivelul nominal de 5% (într-o bandă) (`src/insights/cqb/cqb.test.ts`); pe aproximativ o mie de runde reale modelul a avut un scor Brier de 0,14 față de 0,25 pentru rata de bază, o eroare de calibrare de 0,03 și o pantă a recalibrării de 1,0.

## Datele de care are nevoie {#data-it-needs}

- coloanele **time**, **player**, **side** și **round** (sesiunea), și doborârile și morțile în coloana de evenimente; rundele în care nimeni nu moare de două ori sunt tratate ca runde de eliminare (avantajul de om, clutch-urile și modelul au nevoie de ele);
- o coloană de **altă parte** (`other`, `victim`, `killer`, `attacker`) care numește victima la o doborâre și ucigașul la o moarte (fără ea, doborârile și morțile din același moment sunt asociate);
- o **direcție de privire** pentru măsurile de țintire;
- o coloană brută `event` care numește `flash`, `smoke`, `he`, `molotov`, `plant` și `defuse` pentru utilitare și plantări;
- `won` (tabăra rândului a câștigat runda), `place` (apelurile de loc), `weapon`, `buy` și `state_flashed` acolo unde datele le au.

Pozițiile ar trebui eșantionate de mai multe ori pe secundă; vitezele, țintirea și focurile încrucișate citesc ultimele două secunde înainte de fiecare moarte.

## În defalcare {#in-the-breakdown}

[Defalcarea](breakdown.md) măsoară patru dintre situații ca factori, cu și fără: *orbit*, *moarte schimbată*, *duel de deschidere* și numerele (*om în plus*, *numere egale*, *om în minus*), fiecare pe K/D, runde câștigate, supraviețuire și doborâri pe minut.

## Multe meciuri {#many-matches}

Fiecare rezumat de meci al [analizei pe multe meciuri](mass-analysis.md) din datele cu o coloană de rundă poartă aceleași măsuri ca numărători (`cqb` în rezumat): duelurile de deschidere, schimburile, ieșirile în față, focurile încrucișate, intrările cu bliț, țintirea, avantajul de om, plantările și primele 40 de locuri în care s-a intrat, cu intrările și morțile lor. Numărătorii se adună peste meciuri, deci o mie de meciuri dau aceleași ponderi ca o analiză mare. Fila **Luptă apropiată** a panoului arată acestea ca ponderi cu intervalele lor, peste toate hărțile sau pe hartă; un clic pe un rând încarcă meciurile din care a venit.

## Pentru dezvoltatori {#for-developers}

`src/insights/cqb/`: `walk.ts` (o trecere peste rânduri în ordinea timpului, rundele ținute separat, duelurile înregistrate cu starea lor), `finish.ts` (măsurile și numărătorii pe meci), `model.ts` (regresie logistică prin IRLS, calibrare, ridge prin gradienți conjugați, Bayes empiric, Fisher, Newcombe, teste prin permutare), `run.ts` și `worker.ts` (vizualizatorul: lucrătorul lui propriu, lângă trecerea de observații), `summary.ts` (colectorul rezumatului pe multe meciuri), `factors.ts` (situațiile din defalcare), `shows.ts` (ce citește lentila), `synth.ts` (rundele de test). Intrările de cunoștințe sunt în `src/insights/knowledge/cqb.ts`, tiparele în `patterns-cqb.ts`. Rezultatele intră în raport ca `lens.cqb`.
