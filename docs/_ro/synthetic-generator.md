---
title: "Generator sintetic"
parent: "Încărcarea datelor"
nav_order: 5
lang: "ro"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Generatorul sintetic

Nu ai date proprii? Apasă un buton și 3DHeat îți inventează o bătălie prefăcută, cât de mică sau de mare vrei.

1. Deschide panoul **Set de date** din bara laterală a Căldurii (sub **Sursă**).
2. Derulează până la **Generator sintetic**.
3. Setează **Rânduri (milioane)**. Încearcă întâi 1: valoarea implicită de 8 milioane este grea pentru o primă încercare.
4. Apasă **Generează**.

![1 milion de rânduri, 8 echipe, desenate în Căldură pe echipe](../assets/img/en/synthetic-generator-team-heat.webp)

Panoul **Set de date** poate genera un set de date în loc să îl încarce. Este menit pentru două lucruri: să încerci vizualizatorul fără date proprii și să verifici dacă un anumit număr de rânduri, o rază de sprite și un buget țin o rată de cadre utilizabilă pe un calculator *înainte* de a-i da o încărcare reală mare. Mișcarea lui are forma unui meci battle royale - echipele pornesc separat, apoi sunt strânse una spre alta - pentru că zgomotul uniform arată bine la orice buget și ascunde tocmai artefactele care merită prinse.

## Controale {#controls}

| Control | Implicit | Înseamnă |
|---|---|---|
| **Rânduri (milioane)** | 8 | Rânduri de generat. Rotunjite în jos la un număr întreg de tacte pentru fiecare jucător. |
| **Echipe** | 8 | Numărul de grupuri (cel puțin 1). |
| **Pe echipă** | 12 | Jucători pe grup (cel puțin 1). |
| **Semi-extinderea hărții (m)** | 4000 | Jumătate din lățimea zonei jucabile pe X și Z. |
| Linia de estimare | | „≈ X GB de RAM, Y GB pe GPU după cuantizare." (aproximativ 26 de octeți de RAM și 8 octeți pe GPU pentru fiecare rând). |
| **Generează** | | Generează în workerul de încărcare, cu progres, și înlocuiește orice set de date încărcat. |

Generarea rulează în workerul din fundal, deci zeci de milioane de rânduri nu blochează pagina.

## Ce generează {#what-it-generates}

Din [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Coloane:** poziție, timp, persoană (`P000`, `P001`, ...), grup (`Team 1`, `Team 2`, ...), girație și înclinare și durate de viață. Nicio coloană de sesiune și nicio coloană de filtre.
- **Timp:** un eșantion pe jucător la fiecare 0,25 s, pornind de la 0 (timp relativ, fără ceas de perete).
- **Mișcare:** fiecare echipă pornește în propriul sector al unui inel, la 55-95% din semi-extindere. Un cerc sigur, centrat aproape de mijloc (decalat aleatoriu cu până la un sfert din semi-extindere), se micșorează până la 8% din semi-extindere în șase faze, cu platouri; fiecare jucător se îndreaptă spre un punct rătăcitor din interiorul lui, cu amortizare și zgomot. Înălțimea oscilează între 0 și 220 m.
- **Direcția privirii:** girația urmează direcția de deplasare, înclinarea vine din viteza verticală.
- **Repetabil:** sămânța aleatoare este fixă (1337), deci aceleași setări produc mereu aceleași date.

Fiecare mod de căldură, redarea cutiilor și căldura pe linii (trasee întregi, pentru că nu există o coloană de evenimente) funcționează pe el. Istoricul duratei de viață funcționează și el.
