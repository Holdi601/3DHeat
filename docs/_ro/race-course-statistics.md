---
title: "Statisticile traseului"
parent: "Analiză de cursă"
nav_order: 57
lang: "ro"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Statisticile traseului

Încarcă mai multe ture ale unui singur traseu, iar vizualizatorul numără greșelile: care viraj costă cel mai mult timp, în câte ture s-a greșit acolo și de ce. Folosește-l ca să găsești virajul care merită exersat.

Încearcă: **Tururi demonstrative** îți dă trei ture, suficiente ca această secțiune să apară.

![Statisticile traseului cu harta greșelilor: traseul vopsit după câte ture au pierdut timp în fiecare viraj, și lista virajelor](../assets/img/en/race-course-mistake-map.webp)

Încarcă dosarul întreg al unui traseu - zeci de ture, mai multe mașini, mai multe clase de performanță - și fiecare tură este judecată, apoi numărată. Pagina aceasta acoperă compararea pe clasă, ce înseamnă o greșeală, secțiunea **Statisticile traseului**, harta greșelilor, exportul hărții termice, traseele din mai multe piste, și limitele de performanță cu multe ture.

## Față de cel mai bun din propria clasă {#against-the-best-of-its-own-class}

O tură este comparată viraj cu viraj cu **cea mai rapidă tură completă din propria clasă de performanță** (referința, din clasa referinței); acea tură în sine cu cine din clasa ei a fost cel mai rapid prin fiecare viraj, sau cu fiecare tură când este singură în clasa ei. Mașinile sunt grupate după clasa de performanță a jocului (în Forza, de la D până la X; C și S2 sunt două dintre ele). Punctul de frânare al unei mașini din clasa C comparat cu al uneia S2 nu spune nimic despre conducere. Harta timpului, decalajele din lista turelor și tabelul *Viraj cu viraj* urmează aceeași comparație (vezi [cu cine este comparată fiecare tură](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statisticile sunt construite pe analiza fiecărei ture, nu alături de ea.

## Ce înseamnă o greșeală {#what-counts-as-a-mistake}

O **apariție** este greșeala unei ture într-un viraj (segment). Greșelile unei ture într-un viraj sunt:

1. **Cauza de conducere** pe care analiza a găsit-o pentru pierderea ei acolo - o constatare care este o pierdere, pusă pe seama pilotului (nu a mașinii sau a situației), care costă **0,05 s** sau mai mult față de tura de comparație. Costul ei este pierderea virajului.
2. **Fiecare greșeală de control al mașinii** pe care a făcut-o acolo tura și pe care nu a făcut-o cealaltă tură (nepartajată), care costă **0,03 s** sau mai mult - blocare, patinare a roților, spatele care iese, împingere, rotire. Costul ei este cel al evenimentului.
3. **Fiecare lovitură și accident**, partajate sau nu, oricât ar costa.

Într-un viraj pot fi mai multe; fiecare fel este numărat **o dată pe tură și viraj**. Câștigurile, partea mașinii și o sosire mai lentă, hotărâte în virajul dinainte, nu sunt greșeli.

### De la constatări la greșeli {#from-findings-to-mistakes}

| Constatare | Greșeală |
|---|---|
| prea repede la intrare, lent la ieșire, din frânare cu câțiva metri mai târziu decât cealaltă | Frânat prea târziu |
| frânat devreme | Frânat prea devreme |
| frânat ușor | Frânat prea ușor |
| o blocare ca și cauză | Blocat o roată |
| a mers pe inerție | Mers pe inerție |
| aderență de rezervă, mai lent până la apex, frânat unde cealaltă doar a ridicat | Prea lent prin mijloc |
| o linie prea strânsă | O linie prea strânsă |
| împins spre exterior | Împins spre exterior |
| a întors mașina mai puțin / prea mult | Mașina a fost întoarsă greșit |
| pe putere mai târziu, accelerație plină mai târziu, a ezitat | Accelerație târzie |
| mai lent la ieșirea din viraj | Mai lent la ieșire |
| patinare a roților | Patinare a roților |
| spatele a ieșit, lateral prin mijloc | Spatele a ieșit |
| a ieșit larg | A ieșit larg |
| viteză pierdută | Viteză pierdută |
| a ridicat (la intrare, sau pe linia dreaptă) | Ridicat piciorul |
| aproape oprit, rotire, lovitură sau accident ca și cauză | Rotit / Lovit ceva / Accident când evenimentele turei de acolo spun care (accidentul întâi, apoi rotirea, apoi lovitura); altfel Aproape oprit |
| un zbor mai lung | A zburat prea departe |

Cele două tipare sunt numărate ca cauza găsită în ele, după același tabel. *A dat mai mult la intrare decât a câștigat ieșirea înapoi* este greșeala cauzei intrării lui: frânarea devreme este *Frânat prea devreme*, o blocare *Blocat o roată*, mersul pe inerție *Mers pe inerție*, aderența nefolosită *Prea lent prin mijloc*. *Prea repede la intrare, lent la ieșire* este *Frânat prea târziu* când tura a frânat mai târziu decât cealaltă; altfel greșeala cauzei ieșirii lui - *Accelerație târzie*, *Patinare a roților*, *Spatele a ieșit*, *A ieșit larg*, *Mai lent la ieșire*. Un tipar a cărui cauză este a mașinii, sau o sosire mai lentă, nu este numărat.

Nenumărate: sosirea mai lentă, startul și fiecare constatare despre *mașină* (tragere, aderență, frâne, tracțiune) și fiecare viraj de câștig sau de nivel.

### Tipurile, în ordinea lor {#the-kinds-in-their-order}

Frânare: *Frânat prea târziu*, *Frânat prea devreme*, *Frânat prea ușor*, *Blocat o roată*. Intrare: *Mers pe inerție*, *Prea lent prin mijloc*, *O linie prea strânsă*, *Împins spre exterior*, *Mașina a fost întoarsă greșit*. Ieșire: *Accelerație târzie*, *Mai lent la ieșire*, *Patinare a roților*, *Spatele a ieșit*, *A ieșit larg*, *Viteză pierdută*. Linie dreaptă: *Ridicat piciorul*. Incidente: *Rotit*, *Lovit ceva*, *Accident*, *Aproape oprit*, *A zburat prea departe*.

## Secțiunea Statisticile traseului {#the-course-statistics-section}

Apare de la **3** ture în sus, între **Tururi** și **Unde se poate câștiga timp**.

- **Rezumatul**: "40 de ture în 9 mașini, 3 clase: fiecare viraj judecat față de cea mai rapidă tură din propria clasă." (mașinile numărate după numărul de mașină, sau după nume).
- **Cipurile de clasă** (cu mai multe clase): **Toate** și câte un cip pentru fiecare clasă, fiecare cu numărul ei de ture, în ordinea jocului (D, C, B, A, S1, S2, R, X, apoi altele). Apasă pe o clasă ca să vezi doar turele ei; **Shift+clic** adaugă sau scoate una. Tot ce este mai jos - listele, harta greșelilor, exportul hărții termice - urmează clasele alese.
- **Ce merge prost cel mai des**: fiecare fel de greșeală, cele cu cele mai multe ture primele (apoi cele mai multe ori, apoi cel mai mare cost), cel mult 8 (**Toate N tipuri** arată restul, **Mai puține** le ascunde din nou). Fiecare rând: numele lui, "N din M ture", o bară cu partea aceea, și "K ori · aproximativ X s · cel mai des în T3 (5), T7 (4), T1 (2)" - cât de des a fost făcută (tură cu tură, pe viraj), cât a costat în total și cele trei viraje unde cele mai multe ture au făcut-o. **Apasă pe un rând** ca să-l arăți pe harta greșelilor (și să pornești harta); apasă din nou ca să vezi toate greșelile.
- **Viraj cu viraj** (sau *Viraj cu viraj - <greșeală>* cu una aleasă): pe segment, "N din M au pierdut timp · X s" - ture care au parcurs virajul întreg, cele care au pierdut **0,05 s** sau mai mult acolo față de cea mai bună din clasa lor, și tot timpul pierdut. Pliat, listează cele trei greșeli cele mai frecvente ale lui, cu numărul de ture. **Apasă pe un viraj** ca să-l deschizi, să-l încadrezi cu camera și să treci la harta greșelilor: pentru fiecare greșeală (sau doar pe cea aleasă) o linie ca "12 din 40 de ture au frânat prea devreme aici. La 9 mașini diferite - aproximativ 0,21 s fiecare." și turele care au făcut-o, **cele mai rele primele**, fiecare cu costul ei - cel mult 8, "+N în plus" pentru rest. **Apasă pe o tură** ca s-o focalizezi și să redai greșeala aceea (aliniată cu 40 m înainte de ea).
- **Arată în harta termică**: vezi mai jos. "Se construiește harta termică…" cât timp rulează; dezactivat când nu sunt greșeli.

## Harta greșelilor {#the-mistake-map}

**Vedere → Harta greșelilor** vopsește de-a lungul traseului de referință câte dintre ture (din clasele alese) au greșit în fiecare metru - de orice fel, sau cel ales în statistici. Fiecare tură numără o dată pe metru; intervalul fiecărei apariții (unde era cauza sau evenimentul ei) este lărgit cu 6 m de fiecare parte, ca una scurtă să se vadă. Mai lată și mai strălucitoare unde au fost mai multe ture: lățimea `3 + 10 · (ture aici / cele mai multe ture oriunde)` metri, culoarea de la maro estompat la portocaliu strălucitor; o fâșie gri de 2 m unde nu a fost niciuna. Legendă: *puține ture ↔ cele mai multe ture*.

Cu **Etichete** pornit, fiecare apex de viraj poartă cea mai frecventă greșeală a lui: "T3 · 12/40 frânare devreme" (turele care au făcut-o / turele care au parcurs virajul), "T3 · 12/40" cu un fel ales, "T3 · curat" fără niciunul. Trecând cu mouse-ul peste o etichetă se listează pierderile virajului și cele cinci greșeli cele mai frecvente ale lui; un clic pe ea deschide sau închide virajul acela în statistici.

## Arată în harta termică {#show-in-the-heatmap}

**Arată în harta termică** dă același lucru tabului hărții termice ca set de date numit "Greșeli pe <traseu>" (sau "Greșeli pe traseu"), astfel încât tot setul de unelte al hărții termice - moduri de căldură, filtre, cronologia, secționarea - funcționează pe locul unde merg turele greșit.

Este un CSV construit în memorie (`mistakeTable`), câte un rând pentru fiecare punct al grilei (la fiecare 2 m) din fiecare apariție, la **poziția proprie a turei** acolo:

| Coloană | Conținut |
|---|---|
| `x`, `y`, `z` | poziția turei la acel metru (coordonate de joc) |
| `elapsed` | timpul turei acolo, s |
| `lap` | eticheta turei |
| `car` | numele mașinii (sau "car 1234") |
| `mistake` | numele greșelii, în limba curentă |
| `car_class` | clasa, `-` când nu există |
| `corner` | eticheta virajului, `T3` |
| `cost` | costul apariției, s |

Este încărcat prin încărcătorul propriu al hărții termice cu indicii de mapare: Y în sus, fără inversări de axe, scară 1; timpul `elapsed` în secunde; **persoană** = `car`, **grup** = `mistake`, **sesiune** = `lap`; fără direcție de privire; `car_class`, `corner` și `cost` păstrate ca coloane de filtru. Tabul trece apoi la **Hartă termică** și încadrează datele. Sunt exportate doar clasele alese în statistici.

## Trasee din mai multe piste {#courses-from-several-tracks}

Turele sunt analizate **un traseu pe rând**. Un dosar cu turele mai multor trasee - întreaga bibliotecă de ture - oferă fiecare traseu de încărcat separat (cu numărul lui de ture, cele mai multe primele); turele curselor care nu au terminat (`unfinished/` al FH Companion) merg cu traseul lor, marcate *parțial*. Turele mai multor piste numite alese ca fișiere sunt oferite la fel, turele fără pistă numită mergând cu oricare este aleasă. Încărcarea turelor unei alte piste numite decât cele deja încărcate le înlocuiește. Detalii: [Încărcarea turelor](race-loading-laps.md#folders-and-courses).

## Performanța cu multe ture {#performance-with-many-laps}

Zeci de ture sunt analizate în una sau două secunde (toate, mereu). Ce este desenat este limitat, ca vederea să rămână la rata de cadre:

| Limită | Valoare | Efect |
|---|---|---|
| ture desenate implicit | 8 (`SHOW_ALL_UP_TO`) | peste 8 ture încărcate, turele nou adăugate sunt ascunse, dacă nu sunt referința, tura în focus sau cea mai bună din clasa ei. **Arată tot** desenează fiecare tură; **Doar cele analizate** revine. Focalizarea unei ture o face din nou vizibilă, împreună cu cea mai bună din clasa ei |
| mașini simple și linii subțiri | peste 10 vizibile (`PLAIN_PAST`) | ture altele decât focusul, mașina urmărită și referința: un punct de linie la 6 m (în loc de 1,5 m), mașini desenate simplu |
| ture în grafice | 8 (`CHART_LAPS`) | focus, cea mai bună din clasă și referința întâi; "+N desenate, nereprezentate" |
| carduri HUD | 6 | primele șase ture vizibile |
| statistici | de la 3 ture | secțiunea este ascunsă sub acest număr |
| constatări listate | 12 de pilot, 8 de mașină/context, 10 câștiguri | pe tura focalizată |
| perechi de mașini arătate | 3 | peste 3 perechi, o pereche cu un selector |

Aparițiile greșelilor sunt calculate o dată pe analiză și păstrate în memorie cache; densitatea hărții greșelilor este păstrată în memorie cache pe selecția de clasă și greșeală.

## Pentru dezvoltatori {#for-developers}

Cod: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` în [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
