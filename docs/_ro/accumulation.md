---
title: "Acumulare"
parent: "Detalii interne ale randării"
nav_order: 2
lang: "ro"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Acumulare

Când vizualizatorul nu poate desena fiecare punct într-un singur cadru, desenează o parte din ele, apoi o altă parte, și adună imaginile cât timp stai nemișcat. Imaginea devine mai clară, ca o fotografie care se developează. Mișcarea camerei începe totul de la capăt. Rândul **Acoperire** din suprapunerea cu statistici arată cât de departe a ajuns.

![Suprapunerea cu statistici: Acoperire arată un procent cât timp imaginea se developează și *exact* când este completă](../assets/img/en/performance-stats-overlay.webp)

## Pentru dezvoltatori {#for-developers}

Când un cadru nu poate desena fiecare rând, desenează un eșantion și îl ponderează; imaginea este atunci o estimare nepărtinitoare, dar zgomotoasă. **Acumularea** îmbină cadrele succesive, astfel încât estimarea converge la răspunsul exact cât timp nimic nu se schimbă. Fiecare cadru alege unul din cinci moduri ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); ultimul folosit este în `engine.live.accumMode`.

| Mod | Când | Ce se întâmplă cu acumulatorul |
|---|---|---|
| **reset** | camera s-a mișcat, s-a schimbat ceva care modifică câmpul, rafinarea progresivă este oprită, o fereastră care crește începe (primul cadru al redării, după o derulare), sau linia de căldură redată s-a mișcat | Înlocuit cu estimarea acestui cadru. |
| **extend** | o fereastră **Cumulativă** care doar a crescut de la ultimul cadru | Acest cadru desenează doar rândurile care tocmai au devenit vizibile, cu greutate completă, și le adaugă. Nimic nu se estompează. |
| **ema** | o fereastră glisantă (**Fereastră**, **Durată de viață**) s-a mutat | `acc = acc × (1 - 0,34) + frame × 0,34` - o medie mobilă exponențială de vreo trei cadre. |
| **mean** | nimic nu s-a schimbat și estimarea nu este completă | `acc = acc × (1 - 1/n) + frame × 1/n` la cadrul *n*: o medie rulantă. |
| **skip** (inactiv) | convergență și nimic nu s-a schimbat | Nimic nu este desenat; cadrul doar recompune. |

### De ce fiecare {#why-each}

- **Medie rulantă, nu sumă.** Scalarea bufferului cu 1 - 1/n și adăugarea a 1/n din cadrul nou este algebric același lucru cu însumarea și împărțirea la *n* la final, dar bufferul ține mereu cât valorează un singur câmp. O sumă ajunge la *n* ori câmpul, iar pe o țintă de 16 biți se saturează la 65.504; cu un divizor care crește mereu, o vedere nemișcată s-ar estompa cu cât stă mai mult - în timp ce o cameră în mișcare, care se resetează la fiecare cadru, arată perfect corect. Suita de teste afirmă că 16 cadre îmbinate țin 1,00× din ce ține un singur cadru.
- **Extend pentru redarea cumulativă.** Rândurile deja acumulate sunt încă vizibile, deci un cadru are nevoie doar de fracțiunea de secundă care tocmai a sosit - ceea ce încape într-un cadru, deci intră exact. Reestimarea ar aprinde în fiecare cadru un alt subset aleator și l-ar estompa, citindu-se ca explozii care apar și dispar, iar un cadru pus pe pauză ar continua să se umple. Suita afirmă că totalul crește monoton în timpul redării și rămâne în 0,02% timp de 2,5 s pe pauză.
- **Medie mobilă pentru ferestrele glisante.** Acelea chiar se schimbă la fiecare cadru. O pondere fixă de amestec urmărește fereastra mobilă (o medie pe toate cadrele de la începutul redării ar rămâne în urma cursorului) și este mult mai liniștită decât să începi de la zero.
- **Reset pentru liniile redate.** Capetele liniilor de căldură se mută la fiecare cadru; o medie mobilă le-ar întinde în câte o dâră, deci fiecare cadru este desenat întreg, iar estomparea cozii este a imaginii însăși.
- **Cadrele parțiale trec printr-o țintă de lucru.** Un cadru îmbinat la o fracțiune din greutatea completă este împrăștiat într-o țintă separată, de la zero, și apoi amestecat în acumulator, în loc să fie împrăștiat direct la greutatea 1/n. Direct, fiecare sprite ar fi adăugat la 1/n din mărimea totalului la care se alătură, ceea ce o țintă cu virgulă mobilă pe jumătate de precizie rotunjește până la dispariție - cel mai rău acolo unde este cel mai dens ([Acumularea în jumătate de precizie](half-float-accumulation.md)).

### Convergența {#convergence}

Planul fiecărui cadru știe câte rânduri candidate există și câte trimite, deci numărul de cadre necesare ca să acopere fiecare rând este ⌈candidați / trimiși⌉. Odată ce atâtea cadre au fost îmbinate, vederea este **convergentă**: rândul *Acoperire* din suprapunerea cu statistici trece de la procent la *exact*, iar cadrele următoare sunt inactive. Cu **Desenează fiecare rând în fiecare cadru** pornit (implicit), un singur cadru acoperă de obicei totul, deci convergența este imediată, iar mecanismul progresiv este necesar doar când fereastra conține mai multe rânduri decât poate duce un singur plan de desen (aproximativ 67 de milioane).

### Ce o repornește {#what-restarts-it}

Setările se împart în trei grupuri, după ce mai înseamnă bufferul acumulat după ce se schimbă:

| Grup | Se schimbă | Efect |
|---|---|---|
| **Geometria** - ce rânduri contribuie și cât | modul vederii; rutele liniilor; raza sprite-ului, intensitatea din centru și de la margine, atenuarea, rampa lină, curba, limitele de pixeli, aplatizarea; eliminarea după distanță aproape, departe și planară; ocluzia și ascunderea în spatele terenului; felia; mărimea canvasului; rezoluția căldurii; vizibilitatea și semnele grupurilor; împărțirea diferenței; Toate / Redare; istoria; filtrele de coloane și selecția Entităților; câștigul semi-preciziei | Reset. |
| **Fereastra** - intervalul de timp | cursorul care se mută; reperul și estomparea duratei de viață | Extend (cumulativ) sau medie mobilă (glisant). |
| **Compunerea** - doar colorarea | saturația, răspunsul la densitate, căldura minimă, rampele de culori; tăierea nivelului; grila și axele; setările și sesiunea reluării în cuburi; adâncimea de câmp | Redesenează fără să atingă căldura. |

O mișcare a camerei resetează mereu. Deci tragerea saturației sau a rampei este gratuită; tragerea razei sprite-ului repornește convergența la fiecare pas.
