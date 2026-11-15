---
title: "Căldură pe echipe"
parent: "Moduri de căldură"
nav_order: 6
lang: "ro"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: true
---

# Căldură pe echipe

Căldura pe echipe arată unde a fost fiecare echipă, fiecare echipă în culoarea ei. Acolo unde echipele se suprapun, culorile se amestecă.

**Căldură pe echipe** (tasta 3) este câmpul de densitate din [Căldură](heat.md) cu fiecare [grup](glossary.md) primind propria nuanță. Acolo unde grupurile se suprapun, nuanțele lor se amestecă; o luptă echilibrată iese neutră. Opacitatea poartă în continuare densitatea exact ca în celelalte moduri, astfel că imaginea răspunde în același timp la *cât* și la *a cui*. Are nevoie de o coloană de grup.

![Căldură pe echipe: fiecare parte în culoarea ei; acolo unde se suprapun, culorile se amestecă](../assets/img/ro/heat-teams.webp)

Nu este [suprapunerea figurilor](box-replay.md): aceasta desenează o figură pentru fiecare persoană; aceasta este un câmp de căldură colorat după aceeași coloană.

## Cum se folosește {#how-to-use-it}

1. Apasă `3` (sau alege **Căldură pe echipe** în bara de moduri).
2. Deschide **Culorile căldurii**. Mostrele arată culoarea fiecărui grup; treci cu cursorul peste o mostră ca să vezi numele echipei.
3. Dacă totul pare gri, mărește **Separarea culorilor**.
4. Debifează un grup din [Lista echipelor](teams-list.md) ca să-l scoți; celelalte culori rămân unde erau.

## Comenzi {#controls}

În secțiunea **Culorile căldurii**:

| Comandă | Implicit | Înseamnă |
|---|---|---|
| Mostre | | Culoarea fiecărui grup, pentru primele 12 grupuri, apoi *+N în plus*. Treci cu cursorul ca să vezi numele grupului și culoarea. |
| **Separarea culorilor** | 1,4 | Cât de departe este împins un amestec de neutru, între 0 și 4. 0 face totul gri; 1 este media adevărată; peste aproximativ 2 cele mai luminoase amestecuri ies din gama afișabilă și sunt limitate pe fiecare canal, ceea ce le schimbă nuanța. |
| **Rampă de opacitate (culoarea vine de la grup)** | rampa implicită a căldurii | Aici se folosește doar **alfa** rampei: transparent unde nu este nimic, opac în vârf. Culorile ei sunt ignorate. |

Toate celelalte comenzi ale căldurii - forma, saturația, răspunsul, căldura minimă, adâncimea, eliminarea - funcționează ca în [Căldură](heat.md).

[Lista echipelor](teams-list.md) arată culoarea de căldură pe echipe a fiecărui grup ca mostră în acest mod. Ascunderea unui grup lasă culoarea oricărui alt grup acolo unde era: nuanțele vin din numărul total de grupuri, nu din ce este pornit, așa că două imagini rămân comparabile.

## Paleta {#the-palette}

Din [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Culorile trăiesc în planul de culoare **Oklab** la o luminozitate fixă (0,7) și cromă fixă (0,115), astfel că fiecare grup are aceeași strălucire și un grup roșu nu pare mai fierbinte decât unul albastru.
- Cu *n* grupuri, cercul nuanțelor se împarte în *n* părți egale, iar grupul *i* ia **centrul** părții lui, `(i + 0,5) / n` dintr-o rotație. Oricare două grupuri sunt cât de departe permite numărul, iar opusele rămân opuse indiferent de număr.
- Se folosesc cel mult **16** nuanțe distincte. Cu mai multe grupuri, identificatorii se așază prin înjumătățiri repetate (identificatori cu biți inversați: 0, ½, ¼, ¾, ⅛, …) ca identificatorii vecini să nu aibă aceeași nuanță; grupurile de peste 16 împart neapărat nuanțe.
- Un grup a cărui etichetă înseamnă „fără grup” - `0`, gol, `none`, `unknown`, `null` sau `-1`, fără a conta majusculele - este desenat **gri neutru**, în loc să ia o felie din cerc. Doar prima astfel de etichetă din lista grupurilor este tratată așa.

Separarea implicită este 1,4 și nu 1, deoarece, la 1, un amestec de cinci nuanțe distribuite uniform *este* gri: corect și nelizibil. Puțin peste 1 păstrează egalitățile oneste și face vizibilă o împărțire de 60/40.

## Cum funcționează {#how-it-works}

Ținta de căldură are patru canale în acest mod. Fiecare sprite adaugă densitatea lui *v* la primul canal și *v* × coordonatele Oklab *a* și *b* ale grupului la al doilea și al treilea. La compunere, amestecul pixelului este media ponderată după densitate: *a* = G / R, *b* = B / R, scalat cu separarea culorilor și convertit în sRGB la luminozitatea paletei. Împărțirea la densitatea acumulată face ca nuanța să nu depindă de cât de multe date există și explică de ce fiecare comandă de densitate acționează doar asupra opacității.

Ținta cu patru canale costă de patru ori mai multă memorie GPU decât ținta de căldură cu un singur canal, la aceeași rezoluție.
