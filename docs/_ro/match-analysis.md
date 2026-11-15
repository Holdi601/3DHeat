---
title: "Analiza meciului (CS2)"
nav_order: 10
lang: "ro"
source: "match-analysis.md"
source_hash: "0b9ab06a759f"
translated: true
outdated: false
---

# Analiza meciului (Counter-Strike 2)

Fila **Meci** redă o reluare sub formă de figuri, iar pentru un meci Counter-Strike 2 arată și tabela de scor: cine a câștigat fiecare rundă, cum, și cine a făcut eliminările. Folosește-o ca să analizezi un meci rundă cu rundă, apoi să sari la același moment pe harta termică.

Fila Meci redă orice reluare sub formă de figuri: o reluare War Thunder sau Tacview, sau un demo CS2, listate la **Meciuri din reluare** ([Reluarea meciului](match-replay.md)). Un fișier `.match.json` CS2 adaugă tabela de scor descrisă pe această pagină.

## Analizează un meci CS2 {#review-a-cs2-match}

1. Convertește demo-ul ([mai jos](#where-the-data-comes-from)) într-un fișier `.parquet` și unul `.match.json`.
2. În fila **Hartă termică**, încarcă fișierul `.parquet` sub **Sursă**.
3. Deschide fila **Meci** și apasă **Încărcați fișiere de meci…**, sau trage fișierul `.match.json` pe vedere.
4. Apasă un meci din **Rezumate de meci**, apoi o celulă din șirul rundelor ca să deschizi acea rundă.
5. Apasă **Arată runda** ca să vezi runda aceea pe harta termică, sau **Reluare rundă** ca să o urmărești sub formă de figuri.

![Fila Meci: șirul rundelor cu o rundă deschisă, fluxul de eliminări și tabela de scor](../assets/img/en/match-analysis-round.webp)

Cuvinte ca KAST, ADR, eco, force buy și trade sunt în [glosar](glossary.md#counter-strike-words).

## De unde vin datele {#where-the-data-comes-from}

Convertorul de demo-uri din [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)
transformă demo-urile în două fișiere pentru fiecare meci, într-un dosar pentru fiecare hartă:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Fișier | Se încarcă în | Conține |
|---|---|---|
| `<match>.parquet` | fila **Hartă termică** (panoul Sursă, ca orice Parquet - un fișier, mai multe, sau tot dosarul) | poziția fiecărui jucător de opt ori pe secundă, și fiecare eveniment în momentul în care s-a produs: eliminare, moarte, rănire, tragere, aruncare, fum, flash, HE, molotov, decoy, orbire, plantare, dezamorsare, explozie; cu `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, direcția privirii, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | fila **Meci** | echipele, scorul, fiecare rundă (câștigătorul, cum, economia, plantarea, fiecare eliminare în ordine, clutch-urile, supraviețuitorii), linia din tabela de scor a fiecărui jucător |

Subsolul fișierului Parquet poartă instrucțiuni de citire (cheia `heat3d`), deci se deschide fără nimic de setat: jucătorul ca persoană, tabăra ca grup, fiecare rundă (`roundId`, „<match> #NN”) ca sesiune, direcția privirii pornită și lumea în sensul corect (lumea CS2 este dreptaci cu Z în sus; citită cu maparea implicită Z-în-sus ar ieși oglindită). Vezi [Maparea coloanelor](column-mapping.md) și [Încărcarea fișierelor](loading-files.md). `python -m heat3d_cs2 map <map>` exportă geometria hărții în același cadru, încărcată în **Nivel**.

Convențiile din spatele cifrelor sunt cele ale convertorului (spuse în README-ul lui și păstrate în fiecare rezumat): o moarte este **răzbunată** când ucigașul ei este omorât de unul dintre coechipierii victimei în **5 s**; **KAST** este partea din runde cu o eliminare, o asistență (o asistență de flash contează), supraviețuire sau o moarte răzbunată; **damage** este viața efectiv pierdută, doar a inamicilor; un **clutch** înseamnă a fi ultimul în viață dintr-o tabără cu inamici în picioare, câștigat când tabăra câștigă; **cumpărarea** pe tabără se ia din valoarea medie a echipamentului la sfârșitul timpului de îngheț – prima rundă a fiecărei reprize regulamentare este o rundă de pistol pe jumătate (niciuna în prelungiri), apoi sub 1.500 $ un eco, sub 4.000 $ un force buy, orice peste un cumpărare completă.

## Fila {#the-tab}

Bara laterală a filei Meci ține sus comutatorul de mod al hărții termice și selectorul de sesiune, apoi secțiunile meciului de dedesubt, iar la final panourile hărții termice **Filtre**, **Nivel** și **Cameră** – vederea este harta termică a oricărui Parquet încărcat în fila Hartă termică.

### Rezumate de meci {#match-summaries}

| Comandă | Ce face |
|---|---|
| **Încărcați fișiere de meci…** | alege fișiere `.json` (mai multe deodată): rezumatele `.match.json` |
| tragere pe vedere | fișierele JSON trase pe vedere cât timp fila Meci este deschisă se încarcă la fel (celelalte fișiere sunt ignorate) |
| **Golește** | scoate fiecare meci |
| **Toate meciurile** (cu două sau mai multe) | „N meciuri, M runde”: statisticile peste toate |
| un rând de meci | „EchipaA 13 vs EchipaB 9”, hartă · N runde: deschide meciul respectiv |

Un fișier este acceptat când este JSON cu `"format": "heat3d-cs2-match"` și vectorii `rounds`, `players` și `teams`. Erorile sunt listate sub butoane: „<file>: nu este JSON”, „<file>: nu este un rezumat de meci CS2 (heat3d-cs2-match)”, „<file>: lipsesc rounds, players sau teams”. Un meci încărcat din nou (același nume `match`) îl înlocuiește pe cel anterior. Meciurile sunt sortate după hartă, apoi după nume. Cu exact un meci încărcat, acesta se deschide; altfel selecția rămâne (implicit toate meciurile).

Fără nimic încărcat, secțiunea explică: convertește cu `python -m heat3d_cs2 demos`, încarcă aici fișierele `.match.json` și fișierele `.parquet` în fila Hartă termică.

### Meci (un meci deschis) {#match-one-match-open}

**Antetul:** ambele echipe cu scorul lor, harta, reprizele –
„reprize 7-5, 6-6”: rundele 1–12 și 13–24 (jocul premier și cel competitiv MR12;
durata reprizei proprii a unui rezumat, când o spune, deci 1–15 și 16–30 pentru MR15) –
apoi, când meciul a intrat în prelungiri, scorul lui separat: „prelungiri 4-2”,
rundele de după cele două reprize. O rundă remizată nu contează pentru niciuna dintre echipe. Și „N runde întrerupte în demo” când rezumatul listează runde incomplete.

**Șirul rundelor:** o celulă pentru fiecare rundă, colorată după tabăra care a câștigat,
cu numărul ei și un semn pentru cum s-a încheiat. O rundă remizată (fără câștigător) este o celulă gri neutră marcată cu `=`, niciodată culoarea unei tabere; sfatul ei spune „Runda 30: remiză – nicio tabără nu a câștigat-o”.

| Semn | Încheiată de |
|---|---|
| B | bomba a explodat |
| D | bomba a fost dezamorsată |
| K | eliminați |
| T | a expirat timpul |
| S | capitulare |
| = | remiză |
| ? | altceva |

O linie de separare marchează începutul celei de-a doua reprize (runda 13, sau runda de după durata reprizei din rezumat) și al fiecărei reprize de prelungire de trei runde (rundele 25, 28, 31, …). Treci cu mouse-ul peste o celulă: „Runda 7: EchipaA (T) - bomba a explodat, plantată A” („…, plantată, sit necunoscut” când rezumatul nu are sit) și cumpărarea și valoarea echipamentului ambelor tabere. Apasă ca să deschizi runda; apasă din nou ca s-o închizi („Apasă pe o rundă pentru eliminările, economia și reluarea ei.”).

**Runda:**

- „Runda 7: <echipa> a câștigat - <cum>” („Runda 30: remiză – nicio tabără nu a câștigat-o” pentru o remiză) și cât a durat runda (de la sfârșitul înghețului până la decizie, m:ss);
- economia: echipa fiecărei tabere, cumpărarea (pistol, eco, force buy, cumpărare completă) și valoarea echipamentului („$4.350”);
- plantarea: situl, jucătorul și timpul de la începutul rundei (din oricare versiune de rezumat); „Plantată de <jucător> la 1:05, sit necunoscut” când situl nu este cunoscut;
- **fluxul de eliminări**, în ordine: timpul de la începutul rundei, atacatorul (în culoarea taberei; „world” când nu există atacator), arma și indicatorii – **HS** lovitură în cap, **WB** prin perete, **SM** prin fum; **deschidere** prima eliminare a rundei, **trade** (a răzbunat un coechipier în 5 s), **răzbunat** (ucigașul a fost omorât în 5 s), **team** o eliminare de coechipier (o sinucidere nu este niciuna). Eliminările de după ce runda a fost decisă sunt estompate;
- clutch-urile: „<jucător> (T) singur contra 3: a câștigat clutch-ul” / „l-a pierdut”;
- cine era în viață la final, pe tabără („nimeni”);
- **Arată runda**: tot ce este în această rundă, pe harta termică;
- **Reluare rundă**: redă runda sub formă de cutii, de la început (mai jos).

Butoanele **Arată pe harta termică** (vezi [mai jos](#show-in-the-heatmap)) pentru acest meci, sau pentru runda deschisă.

### Tabela de scor {#scoreboard}

Un tabel pentru fiecare echipă, un rând pentru fiecare jucător:

| Coloană | Este |
|---|---|
| K, D | eliminări, morți |
| A | asistențe, inclusiv asistențele de flash |
| ± | eliminări minus morți (verde peste 0, roșu sub 0) |
| ADR | daunele pe rundă, viața efectiv pierdută |
| KAST | % din runde cu o eliminare, o asistență, supraviețuire sau o moarte răzbunată |
| HS | % din eliminările cu lovitură în cap |
| Deschideri | dueluri de deschidere câștigate-pierdute |
| Cl | clutch-uri câștigate/jucate |

Treci cu mouse-ul peste un jucător: eliminări de trade, de câte ori a fost răzbunat, asistențe de flash, inamici orbiți, daune de utilitare și runde cu eliminări multiple („2×3k”). **Apasă pe un jucător** ca să-i vezi eliminările și morțile pe harta termică (acest meci).

### Peste meciuri (Toate meciurile) {#across-matches-all-matches}

Peste fiecare meci încărcat:

- „N meciuri · M runde · <hărți>”, și „N runde remizate, câștigate de nicio tabără” când au fost remize;
- **Runde câștigate** pe tabără: în total, la rundele de **pistol** (rundele de pistol din rezumat), și la cumpărările **eco**, **force** și **pline** (fiecare ca procent cu rundele jucate; treci cu mouse-ul pentru „câștigate din jucate”). O rundă remizată este jucată de ambele tabere și nu este câștigată de niciuna;
- **Bombă**: plantări pe sit, și cât de des tabăra T a câștigat mai departe acele runde („12 plantări pe A (T a câștigat 67%)”), plantările al căror sit rezumatul nu-l cunoaște de la sine („2 plantări pe un sit necunoscut (T a câștigat 50%)”), sau „niciodată plantat”; cum s-au încheiat rundele, cele mai frecvente primele;
- „Tabăra care a luat prima eliminare a câștigat N% din acele runde.” (o sinucidere nu este o eliminare de deschidere; o rundă remizată nu convertește nicio deschidere);
- **Dueluri de deschidere, unde**: cele zece locuri cu cele mai multe eliminări de deschidere (după unde era victima; numele locurilor din joc făcute citibile, „TopofMid” → „Top of Mid”), duelurile și partea câștigată de tabăra T;
- **Jucători**: cei cincisprezece cei mai buni după eliminări minus morți, adunați peste toate meciurile lor (potrivite după Steam ID): meciuri, K-D, ADR și KAST ponderate după rundele jucate, HS% ponderat după eliminări, duelurile de deschidere. **Apasă pe un jucător** ca să-i vezi eliminările și morțile din toate meciurile pe harta termică.

Butoanele Arată pe harta termică pentru toate meciurile încărcate stau sub el.

## Ce a decis rundele {#what-decided-the-rounds}

Fila numără; [Observațiile](insights.md#who-won-what-decided-the-rounds) explică. Cu tabelul hărții termice al unui meci încărcat (are coloana `won`), **Observații** împarte rundele fiecărei tabere după ce s-a întâmplat în ele - duelul de deschidere, cumpărarea, o primă moarte răzbunată, plantarea, utilitarele, un prim contact timpuriu, fiecare loc ținut și fiecare loc atins în primele 25 s - și spune care a făcut diferența, cu diferența ratelor de victorie, intervalul ei de 95% și q, și *puține runde* acolo unde o ramură are mai puțin de opt. Numește momentele decisive (eliminările și plantările care au schimbat cel mai mult probabilitatea de victorie) și jucătorii și locurile care au adăugat sau au costat cel mai mult, iar **Rezumat** și **Comentator** încep cu ele. Un exemplu inventat:

> T a câștigat 79% din cele 19 runde în care a ținut Mid, față de 24% din 21 fără el (55 de puncte, 95% între 26 și 74) - q 0,004.
>
> Momente decisive: runda 17 la 48 s, o eliminare făcută de CT pe B site i-a schimbat șansa de la 31% la 58%, iar CT a luat runda.

Un singur meci are mai puțin de 30 de runde, așa că probabilitățile lui de victorie vin dintr-un model a priori fix al oamenilor în viață, plantării și ceasului; textul spune asta. Pentru multe meciuri, aceleași întrebări le pune [analiza în masă](mass-analysis.md#who-won).

## Arată pe harta termică {#show-in-the-heatmap}

Fiecare legătură setează chiar **filtrele** hărții termice, astfel încât ce se arată rămâne vizibil și editabil în panoul Filtre, iar **Arată tot** le golește. Ele funcționează pe tabelul hărții termice încărcat în fila Hartă termică; fila Meci nu îl încarcă niciodată singură.

| Buton | Evenimente arătate |
|---|---|
| **Poziții** | `position` - unde erau jucătorii, de opt ori pe secundă |
| **Eliminări** | `kill` - unde stătea ucigașul |
| **Morți** | `death` - unde a căzut victima |
| **Deschideri** | `kill` și `death` cu `opening` = 1 - prima eliminare din fiecare rundă, unde stăteau amândoi (oferit doar când tabelul are o coloană `opening`) |
| **Fumigene** | `smoke` - unde au căzut fumigenele |
| **Flashuri** | `flash` - unde au explodat flashurile |
| **Molotoave** | `molotov` - unde au ars molotoavele și incendiarele |
| **HE** | `he` - unde au explodat grenadele HE |
| **Plantări** | `plant` - unde a fost plantată bomba |
| **Trageri** | `shot` - de unde au fost trase focurile |

Limitate după locul unde sunt butoanele: toate meciurile încărcate, meciul acesta sau runda aceasta („Arată pe harta termică - runda 7”).

Ce nu poate fi aplicat se spune sub butoane, nu se filtrează în tăcere până la nimic: „nicio coloană de meci păstrată - meciul nu a fost aplicat”, „meci: X nu este în datele încărcate”, la fel pentru rundă și evenimente, „jucătorul X nu este în datele încărcate”, „tabăra X nu este în datele încărcate”, „nu este încărcată nicio dată pe harta termică: încarcă fișierele .parquet ale meciurilor în fila Hartă termică”. Fără date încărcate, legăturile spun și ele: „Încarcă fișierele .parquet ale meciurilor în fila Hartă termică ca să le vezi pe hartă.”

**Reluare rundă** mai comută în plus harta termică pe **Reluare cu cutii**, linia de timp pe modul *redare* cu fereastra ei pusă pe *durata de viață*, sare la începutul sesiunii rundei și redă. Când runda nu este o sesiune a datelor încărcate: „această rundă nu este o sesiune a datelor încărcate: nimic de redat”.

## Pentru dezvoltatori {#for-developers}

Cod: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Versiunile rezumatului {#summary-versions}

Fila citește rezumate de versiunea 1 și de versiunea 2 (`"version"` din fișier) una lângă alta și le tratează la fel:

| | Versiunea 2 | Versiunea 1 |
|---|---|---|
| ora plantării | secunde de la începutul rundei, ca eliminările | secunde de meci; fila scade începutul rundei |
| situl plantării | `A` sau `B`; gol când demo-ul nu spune | `A`, `B` sau un număr de entitate - citit ca sit necunoscut |
| durata reprizei | `halfLength`, din momentul în care taberele fac schimbul; 12 când este null | 12 (MR12) |
| runde de pistol | `pistolRounds` (runda 1 și prima rundă de după repriză) | rundele a căror cumpărare este `pistol` |
| rundă remizată | `winner` și `winnerTeam` goale | - |
| sinucidere | `suicide` pe eliminare, niciodată o eliminare de coechipier | spusă prin atacator și victimă fiind același jucător |

`noscope` și `attackerBlind` ale unei eliminări (versiunea 2) nu sunt arătate în fila Meci, care de asemenea nu arată niciun loc din tabelul hărții termice, deci un rând de grenadă cu `place` gol acolo nu schimbă nimic aici.

Cum devine un focus filtre (`focusFilters`):

- **meci** → un filtru de categorie pe coloana `match`;
- **rundă** → un filtru de interval `round` = N pe o coloană numerică `round` (un filtru de categorie pe una categorială), iar sesiunea rundei (`<match> #NN`) este selectată în selectorul de sesiune;
- **evenimente** → un filtru de categorie pe coloana `event`;
- **jucător** → un filtru de persoană pe acel jucător;
- **tabără** → un filtru de grup.
