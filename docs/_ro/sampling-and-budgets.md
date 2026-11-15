---
title: "Eșantionare și bugete"
parent: "Detalii interne ale randării"
nav_order: 3
lang: "ro"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Eșantionare și bugete

Când sunt prea multe puncte de desenat într-un singur cadru, vizualizatorul desenează un eșantion uniform și face ca fiecare punct să conteze mai mult, astfel încât imaginea rămâne corectă. Un controler ajustează câte desenează, ca vizualizatorul să își păstreze rata de cadre.

## Comenzile panoului de performanță {#performance-panel-controls}

| Comandă | Implicit | Interval (cursor) |
|---|---|---|
| **Desenează fiecare rând în fiecare cadru** | pornit | |
| **Buget adaptiv** | pornit | |
| **FPS țintă** | 60 | 20-240 (1000) |
| **Sprite-uri inițiale / cadru** (adaptiv) sau **Sprite-uri / cadru** | 4,00M | 65.536-268.435.456, logaritmic (268.435.456) |
| **Rezoluția căldurii** | 100% | 25-100%, înmulțit cu scara etapei a doua a adaptivului |
| **Rafinare progresivă** | pornit | Oprit: fiecare cadru este o estimare nouă dintr-un singur cadru (util ca să vezi eșantionul brut). |

Vezi și [Panoul de performanță și suprapunerea cu statistici](performance-and-stats.md).

## Pentru dezvoltatori {#for-developers}

### Rândurile candidate {#candidate-rows}

Rândurile sunt stocate în ordinea crescătoare a timpului. Fereastra cronologiei [*lo*, *hi*] devine un interval de rânduri prin două căutări binare pe coloana de timp ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); fără o coloană de timp, fiecare rând este candidat. Acestea sunt **Rânduri în fereastră** din suprapunerea cu statistici. Testele pe rând - filtrele, grupurile, separarea, eliminarea, felia, durata de viață - au loc mai târziu, în shader; un rând care eșuează costă o invocare de vertex și niciun fragment.

### Planul de eșantionare {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) împarte intervalul de candidați în **blocuri de 4.096 de rânduri consecutive** și alege câte să deseneze din bugetul de sprite-uri al cadrului:

- Dacă bugetul acoperă fiecare bloc, toate sunt desenate - cadrul este exact.
- Altfel, blocurile sunt luate la un pas uniform de-a lungul intervalului, decalate cu o variație care avansează cu raportul de aur la fiecare cadru, astfel încât cadrele succesive acoperă blocuri diferite și reuniunea se completează uniform. Acesta este un eșantion **stratificat**: fiecare parte a intervalului de timp este reprezentată în fiecare cadru.

Căldura fiecărui rând desenat este înmulțită cu **candidați / trimiși**, astfel încât căldura așteptată a unui cadru este exactă la orice buget; doar zgomotul depinde de buget. Rândurile trăiesc în bucăți de 8.388.608 (vezi [Rezidența memoriei GPU](gpu-memory.md)); un bloc este împărțit acolo unde trece peste o bucată, iar fiecare bucată primește lista începuturilor de bloc pe care trebuie să le deseneze.

Un plan poate purta cel mult 65.536 de blocuri - 268.435.456 de sprite-uri - pentru că ambele backend-uri țin un buffer fix de 65.536 de sloturi pentru începuturile de bloc. O cerere mai mare este limitată aici, iar diferența apare sincer ca mai multe cadre până la convergență.

### Desenează fiecare rând în fiecare cadru {#draw-every-row-each-frame}

**Performanță → Desenează fiecare rând în fiecare cadru** (implicit **pornit**): bugetul devine o limită inferioară, nu un plafon, iar un cadru care începe o estimare nouă desenează fiecare rând pentru care este responsabil (până la plafonul de 268M).

Motivul: o mișcare a camerei renunță la acumulare, deci un cadru în mișcare este o singură estimare al cărei zgomot este stabilit de cât din date a desenat - cu un sfert desenat, vezi un sfert din ele ca puncte luminoase ponderate, iar aceasta este ceea ce face ca o vedere în mișcare să sclipească. Desenarea tuturor face ca fiecare cadru să fie imaginea finită. Costul este că timpul de cadru urmează acum mărimea datelor din fereastră; pârghiile sunt o fereastră de timp mai îngustă, filtrele sau o eliminare după distanță, care reduc candidații în loc să-i eșantioneze mai rar.

Oprește-l pe hardware care nu își poate permite tot câmpul odată: atunci *Sprite-uri / cadru* este o limită reală, iar vederea converge în câteva cadre statice.

Ce costă un plan complet, măsurat pe un GPU de desktop de top, cu un canvas 4K și un nivel mare, cu sprite-uri de rază 1 m (un pixel sau doi): aproximativ 100M de sprite-uri pe cadru la 30 fps, 200M la 15 fps, iar maximul de 268M la aproximativ 12 fps. Cu sprite-uri atât de mici, etapa de vertex este tot costul, iar rezoluția căldurii nu schimbă nimic; cu sprite-uri mari, costul este umplerea: 8M de sprite-uri de rază 100 m au luat 2,5 s pe cadru la rezoluția completă a căldurii și 170 ms la 25%. **Desenează fiecare rând în fiecare cadru** pornește deci de la 67M și crește cu un sfert pe cadru cât timp cadrele durează sub 150 ms, iar scade la jumătate când durează peste 400 ms, astfel încât o vedere grea să nu poată duce un cadru peste ce permite watchdog-ul GPU-ului.

### Bugetul adaptiv {#the-adaptive-budget}

**Performanță → Buget adaptiv** (implicit pornit) ajustează bugetul de sprite-uri ca să mențină **FPS țintă** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Este inactiv în reluarea în cuburi și în timpul randărilor video.

Intrarea este timpul de cadru, netezit (90% anterior + 10% nou, cu cadrele singulare plafonate la 2 s), față de o țintă de 1000 / max(15, FPS țintă) ms.

**Etapa întâi - sprite-uri.** La fiecare cadru bugetul este înmulțit cu `1 + (target / frame - 1) × gain`, cu un câștig de 0,35 când este prea lent și 0,08 când există rezervă, limitat la un factor de 0,5-1,25 pe cadru și la 65.536-268.435.456 de sprite-uri.

**Etapa a doua - rezoluție.** Doar când bugetul este deja la limita inferioară și cadrele sunt încă cu peste 10% prea lente, rezoluția bufferului de căldură scade cu 8% pe cadru, până la 25% din canvas; își revine cu 4% pe cadru cât timp există o rezervă de 30%. Costul de fragment scade cu pătratul rezoluției, ceea ce este aproape invizibil sub o rampă netedă. (Măsurat pe randare software, cu 10M de rânduri și sprite-uri supradimensionate: 141 ms → 17 ms pe cadru.) Scara este rotunjită la șaisprezecimi; *Rez. căldură* din suprapunere o arată.

**Renunțarea.** Un cadru lent arată la fel indiferent dacă l-au cauzat sprite-urile sau un nivel greu - nu există cronometrare pe fiecare pas. Dacă bugetul stă la limita inferioară și cadrele rămân sub 70% din țintă timp de 30 de cadre, sprite-urile nu erau costul: controlerul trece în **urcare**, înmulțind bugetul cu 1,5 la fiecare 14 cadre și restabilind rezoluția, atât timp cât timpul de cadru rămâne în 1,5× față de cel de la limită. O urcare care înrăutățește lucrurile peste atât revine la 60% și reia controlul normal; atingerea țintei încheie urcarea.

Cu bugetul adaptiv oprit, bugetul este pur și simplu **Sprite-uri / cadru**.

Cu *Desenează fiecare rând în fiecare cadru* pornit, bugetul adaptiv rulează în continuare, dar regula exactă ridică bugetul ca să acopere toate rândurile candidate, deci în practică controlează doar etapa de rezoluție și cadrele care nu încep o estimare nouă.
