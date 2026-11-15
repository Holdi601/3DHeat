---
title: "Adâncime și eliminarea fețelor"
parent: "Moduri de căldură"
nav_order: 4
lang: "ro"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Adâncime și eliminarea fețelor

Adâncimea face ca dealurile și pereții să ascundă căldura din spatele lor, la fel cum un perete real ascunde o persoană. Eliminarea după distanță păstrează doar căldura dintre o distanță apropiată și una îndepărtată față de cameră.

![O cameră joasă în spatele unui deal, cu Ascunde în spatele terenului oprit (stânga) și pornit (dreapta)](../assets/img/en/depth-and-culling-terrain.webp)

![Eliminare după distanță cu Departe la 400 m și Taie și nivelul pornit: o felie din hartă în jurul camerei](../assets/img/en/depth-and-culling-far.webp)

Fără adâncime, o hartă termică peste un [nivel](levels.md) 3D este un strat plat: tot ce conține setul de date strălucește prin fiecare perete la intensitate maximă, indiciile de adâncime oferite de nivel sunt anulate, iar un punct fierbinte dintr-o clădire arată la fel ca unul de pe acoperișul ei. Secțiunea **Adâncime** face ca nivelul să ascundă ce se află în spatele lui; **Eliminarea după distanță** limitează căldura la o coajă sau o placă în jurul camerei; [Felia](slice.md) taie o placă din lume. Toate trei se aplică modurilor de căldură și schimbă ce rânduri contribuie, deci schimbarea lor repornește acumularea.

## Adâncime {#depth}

Ambele comenzi au nevoie de un [nivel](levels.md) - o imagine de hartă sau un model 3D. Fără un nivel încărcat nu există nimic în spate, deci nu fac nimic. Sunt ambele dezactivate cât timp [Aplatizare pe planul solului](sprite-shape.md#flatten-onto-ground-plane) este pornită.

### Ascunde în spatele terenului {#hide-behind-terrain}

**Ascunde în spatele terenului** (implicit pornit): un punct de date a cărui suprafață cea mai apropiată, spre cameră, este *solul* (nu o structură) este eliminat complet, nu doar estompat.

Terenul și pereții sunt opaci în feluri diferite. Te uiți *prin* un perete intenționat, ca să vezi la ce etaj a fost traficul; nu vrei niciodată să te uiți prin un deal, pentru că în spatele lui este partea îndepărtată a hărții - care, pe o hartă cât kilometri, este cea mai mare parte a datelor - și se adună de-a lungul orizontului într-o bandă mai luminoasă decât orice din prim-plan. Un singur atenuator nu poate servi ambele cazuri, așa că terenul primește o limită de tăiere, iar pereții păstrează atenuatorul de mai jos.

### Ascuns în spatele geometriei {#hidden-behind-geometry}

**Ascuns în spatele geometriei** (implicit 0,8): cât de puternic este suprimat un punct de date aflat în spatele geometriei nivelului. Valoarea se citește *se vede prin* la 0, *N% mai slab* între valori (poziția cursorului, nu atenuarea măsurată), *complet ascuns* la 1.

Fiecare perete sau planșeu dintre un punct și cameră îl atenuează și mai mult: un perete lasă câteva procente din valoarea implicită, iar fiecare suprafață în plus înjumătățește ce a rămas, până la patru suprafețe. La 1, nimic din spatele geometriei nu este desenat, iar aceasta este cea mai ieftină setare.

Vezi și [Aspectul nivelului](level-appearance.md).

## Eliminarea după distanță {#distance-culling}

**Eliminarea după distanță** (implicit închisă) limitează căldura la rândurile dintre o limită apropiată și una îndepărtată, măsurate de la cameră. Setează o limită îndepărtată ca să citești densitatea în interiorul unei clădiri, fără ca partea îndepărtată a hărții să se adune peste ea; setează o limită apropiată ca să zbori *prin* un punct fierbinte, în loc să intri în el.

| Comandă | Implicit | Interval (cursor) | Înțeles |
|---|---|---|---|
| **Aproape** | oprit | 0,5-5000 m, logaritmic; jumătatea de jos din cursă = oprit (200.000) | Rândurile mai apropiate decât atât sunt sărite. |
| **Departe** | oprit | 1-200.000 m, logaritmic; jos = oprit (10.000.000) | Rândurile mai îndepărtate decât atât sunt sărite. |
| **Tăiere după plan** | pornit | | Măsoară limitele pe axa de vizualizare, în loc de la ochi, astfel încât tăierea este un plan paralel cu ecranul, nu o sferă în jurul tău. Marginea unei sfere se curbează departe pe cadru și alunecă ori de câte ori întorci camera; un plan rămâne unde l-ai pus. |
| **Taie și nivelul** | pornit | | Taie și solul, structurile și apa, la aceleași limite. Cu nivelul lăsat întreg, tăierea elimină punctele de date și lasă clădirea în fața lor; cu ambele tăiate, este o secțiune prin hartă, iar punctele stau lângă pereții și planșeele lor. Aceasta doar redesenează; nu repornește acumularea. |

### Tastatura {#keyboard}

Limita îndepărtată este o comandă pe care o parcurgi - o treci printr-o clădire și vezi la ce etaj apare traficul - deci este pe tastatură cât timp zbori ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tastă | Efect |
|---|---|
| `]` | Împinge limita îndepărtată afară cu un factor de 1,12 (Shift: 1,35) |
| `[` | O trage înăuntru cu același factor |
| `\` | Oprește limita îndepărtată sau o pornește din nou la distanța la care a fost lăsată (6000 prima dată) |

Pașii sunt geometrici, pentru că intervalul util acoperă patru ordine de mărime, de la o cameră la o hartă. Tastatura păstrează limita îndepărtată între 100 și 400.000. Tastele nu fac nimic cât timp o casetă de text sau un meniu are focusul.

## Pentru dezvoltatori {#for-developers}

### Ascunde în spatele terenului {#hide-behind-terrain}

Structurile sunt desenate într-o textură de adâncime proprie. Un fragment care se află în spatele adâncimii scenei, dar *nu* în spatele adâncimii structurilor, se află în spatele solului și este eliminat. Costă o trecere de adâncime peste structuri, care este sărită când comutatorul este oprit.

### Ascuns în spatele geometriei {#hidden-behind-geometry}

Se numără **pe suprafață**. O singură comparație de adâncime poate spune doar „ceva este în față”, deci un punct aflat în spatele unui perete și un punct aflat la patru camere distanță într-o clădire ar fi atenuate la fel, iar interiorul ar apărea ca o pată slabă unică. În schimb, geometria structurii este **decojită pe adâncime** în până la 3 straturi suplimentare ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); fiecare fragment numără câte suprafețe sunt în fața lui (adâncimea proprie a scenei plus straturile decojite: până la patru), iar atenuarea se compune:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Cursor | 1 suprafață | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25% | 12,5% | 6,25% | 3,1% |
| 0,8 (implicit) | 4% | 2% | 1% | 0,6% (prag) |
| 1,0 | nu este desenat | nu este desenat | nu este desenat | nu este desenat |

De ce doi factori: cursorul este calibrat astfel încât un perete să lase câteva procente - aspectul care se citește ca „în spatele a ceva” - iar câteva procente compuse ar fi nimic până la al treilea perete; înjumătățirea la fiecare suprafață în plus păstrează patru trepte distincte. De ce pătrat: liniar, un câmp saturat rămânea saturat în spatele unui perete; puterea a patra îl ștergea la 0,8. De ce un prag: ascunderea completă a căldurii ascunse face ca o cameră plină de trafic ascuns să pară o cameră goală, fără nimic care să sugereze să folosești [Felia](slice.md). Doar un cursor fixat la 1 o ascunde complet - și este cea mai ieftină setare, pentru că punctele ascunse sunt atunci eliminate.

Cum ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), shaderele de căldură pe puncte): comparația se face per fragment, față de textura de adâncime a scenei, în **adâncimea ferestrei**, nu în distanța din lume. O citire a texturii de adâncime în etapa de vertex dă „departe” peste tot pe unele drivere (rasterizatorul software ANGLE printre ele), iar liniarizarea ambelor adâncimi în metri pierde separarea din cauza preciziei, cu un interval larg near/far. Corecția este raza unui sprite convertită în unități de fereastră plus câțiva biți cei mai puțin semnificativi, astfel încât un punct de date așezat pe o suprafață nu se umbrește singur.

Structurile sunt desenate translucid, dar sunt desenate în adâncimea pe care o citește ocluzia; un nivel ale cărui structuri nu ar ajunge în textura de adâncime s-ar ocluziona doar față de teren.

### Eliminarea după distanță {#distance-culling}

Ambele limite sunt evaluate în shaderul de vertex, deci un rând eliminat costă un vertex și niciun fragment.
