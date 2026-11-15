---
title: "Detalii interne ale randării"
nav_order: 22
has_children: true
lang: "ro"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Detalii interne ale randării

Vizualizatorul desenează milioane de puncte ca pete strălucitoare și le adună. Această secțiune explică trucurile care țin asta rapidă și ce înseamnă numerele din panoul de statistici. Citește-o dacă vizualizatorul pare lent sau dacă vrei să lucrezi la randator.

```
date -> fereastră de timp -> filtre GPU -> plan de eșantionare -> splat -> acumulare -> culoare -> ecran
```

Ca să vezi cum se descurcă propriul tău calculator, uită-te la caseta de statistici din dreapta sus a vizualizării: [Panoul de performanță și suprapunerea de statistici](performance-and-stats.md). Cuvintele noi (GPU, rând, sprite, hartă de căldură) sunt în [glosar](glossary.md).

## Problema de bază {#the-core-problem}

O sumă de rampe radiale suprapuse costă *N* × π*r*² fragmente amestecate pe cadru. La 100 de milioane de sprite-uri cu rază de 8 px, asta înseamnă 2 × 10¹⁰ fragmente - aproximativ o secundă de lucru pe un GPU de top. Nu poate fi forțată cu forța brută la fiecare cadru, așa că vizualizatorul combină:

- **rânduri sortate după timp** - o fereastră de timeline înseamnă două căutări binare, iar costul redării urmează rândurile din fereastră, nu setul de date;
- **nimic pe rând în CPU pe cadru** - rândurile trăiesc în memoria GPU, cuantizate; filtrele, semnele de grup, testul duratei de viață, fereastra, tăierea și secțiunea sunt evaluate în vertex shader;
- **eșantionare stratificată** cu ponderi de compensare când un cadru nu poate desena fiecare rând, și **acumulare progresivă** care converge spre răspunsul exact cu toate rândurile cât timp vizualizarea rămâne ([Eșantionare și bugete](sampling-and-budgets.md), [Acumulare](accumulation.md));
- **un regulator în două etape** care schimbă mai întâi sprite-urile pe cadru, apoi rezoluția căldurii, pentru rata de cadre ([Eșantionare și bugete](sampling-and-budgets.md#the-adaptive-budget));
- **bugete de memorie aplicate**, astfel încât un set de date care nu încape este tăiat vizibil în loc să blocheze aplicația ([Rezidența memoriei GPU](gpu-memory.md)).

## Un cadru {#one-frame}

Bucla de cadre este [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Tot ce se schimbă la rata de cadre - camera, capul de redare, bugetul - trăiește în motor, nu în starea aplicației, deci un cadru nu costă nimic din munca React; starea este citită o dată pe cadru și scrisă înapoi doar pentru valorile de afișare cu frecvență mică.

1. **Date noi?** Un set de date nou este anunțat (*Se încarcă N rânduri în GPU*) pe un cadru și încărcat pe următorul, ca mesajul să fie desenat înainte ca munca să blocheze firul. Un nivel nou este predat randatorului; rutele de căldură pe linie sunt construite sau eliberate.
2. **Capul de redare** avansează (limitat la 0,1 s de timp real pe cadru), se repetă sau se oprește.
3. **Camera** citește tastele, mouse-ul și gamepad-ul; oglinda de axe este integrată în matricea de vizualizare; pe WebGPU o matrice de remapare a adâncimii convertește intervalul de adâncime în stil OpenGL din three.js în cel al WebGPU.
4. **Ce este vizibil**: intervalul de timp din timeline și istoric; tabela de semne a grupurilor (vizibilitate doar la o împărțire pe o coloană); până la patru filtre - filtrele de coloane și selecția Entități; împărțirea de diferență.
5. **Tabelele de culoare și de curbe** sunt reconstruite dacă setările lor s-au schimbat.
6. **Buget**: regulatorul adaptiv stabilește bugetul de sprite-uri și rezoluția căldurii pentru acest cadru; cu *Desenează fiecare rând în fiecare cadru* bugetul este ridicat ca să acopere fiecare rând candidat.
7. **Semnăturile** decid ce mai înseamnă bufferul de acumulare: o schimbare a ceva ce modifică ce contribuie rândurile sau cum (*geometrie*), a ferestrei de timp sau doar a modului în care rezultatul este colorat (*compozit*). Vezi [Acumulare](accumulation.md#what-restarts-it).
8. **Planul de eșantionare**: ce blocuri de rânduri să fie desenate ([Eșantionare și bugete](sampling-and-budgets.md)).
9. **Modul de acumulare**: resetare, extindere, medie mobilă, medie rulantă sau repaus.
10. **Geometria redării cutiei** (cuburi, trasee) pe CPU, doar în acel mod și doar când nu este în repaus.
11. **Randare**: backend-ul desenează scena (nivelul, grila, axele, cutiile, traseele, rigla), împrăștie căldura în ținta căldurii, o unește în acumulator și compune căldura peste scenă pe canvas.
12. **Auto-expunerea** se declanșează când numărătoarea ajunge la zero; sonda de căldură a riglei citește cel mult un pixel la 120 ms; valorile de afișare sunt publicate.

Un cadru în repaus - convergent, fără nimic schimbat - sare peste scenă și peste împrăștiere, dar tot **recompune**: un canvas WebGL creat fără `preserveDrawingBuffer` are conținut nedefinit după compunere, deci nu este sigur să te bazezi pe el ca să păstreze ultimul cadru. Scena și țintele căldurii sunt framebuffer-ele proprii ale vizualizatorului și le păstrează, deci un cadru în repaus costă o singură trecere pe tot ecranul.

## Paginile din această secțiune {#pages-in-this-section}

- [Cele două backend-uri](backends.md) - WebGPU și WebGL2, cum se alege unul, comutatoarele din adresă
- [Acumulare](accumulation.md) - resetare, extindere, medie mobilă, medie rulantă
- [Eșantionare și bugete](sampling-and-budgets.md) - eșantionatorul stratificat, modul exact, bugetul adaptiv
- [Acumulare în jumătate de float](half-float-accumulation.md) - interval și precizie pe ținte de 16 biți
- [Rezidența memoriei GPU](gpu-memory.md) - stocarea cuantizată a rândurilor și bugetul GPU aplicat
- [Detectarea randării software](software-rendering.md)
- [Panoul de performanță și suprapunerea de statistici](performance-and-stats.md)
