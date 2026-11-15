---
title: "Biblioteca de niveluri"
parent: "Niveluri și geometria fundalului"
nav_order: 4
lang: "ro"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Biblioteca de nivele

Biblioteca îți păstrează nivelele în acest browser, ca să nu le încarci și să le simplifici din nou. **Ștergerea datelor site-ului din browser șterge biblioteca, iar ea nu are export.** Păstrează fișierele tale originale.

Procesarea unui nivel - analiza, clasificarea, sudarea, decimarea, împachetarea texturilor - este lentă, iar rezultatul este același de fiecare dată. **Biblioteca** de la baza panoului Fundal / nivel păstrează nivelele procesate în acest browser, astfel încât o plasă decimată nu se reconstruiește niciodată de două ori ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Salvează și reîncarcă un nivel {#save-and-reload-a-level}

1. Încarcă o imagine de hartă sau un model 3D și verifică dacă arată corect.
2. Apasă **Salvează în bibliotecă**. Panoul spune *Saved. It will load instantly next time.*
3. Data următoare, deschide lista **Bibliotecă** și apasă ▸ pe nivel.
4. Apasă ✕ ca să ștergi o intrare de care nu mai ai nevoie.

## Folosirea ei {#using-it}

| Control | Efect |
|---|---|
| **Salvează în bibliotecă** | Stochează nivelul curent. O imagine de hartă este stocată ca PNG cu cele două ancore ale ei; un model ca bufferele lui procesate. Panoul spune *Saved. It will load instantly next time.* |
| Lista bibliotecii | Un rând pentru fiecare nivel stocat: numele (cu mărimea stocată la trecerea cursorului), triunghiurile pentru un model sau lățimea în pixeli pentru o imagine. |
| ▸ (*Load*) | Încarcă intrarea ca nivel curent. |
| ✕ (*Delete*) | Scoate intrarea. |
| Rândul de utilizare | `Using X of Y.` - estimarea browserului pentru spațiul de stocare al acestui site. |

Când nu este stocat nimic, lista spune *Empty. Load a map or model, then “Salvează în bibliotecă”.*

## Ce este stocat {#what-is-stored}

| Fel | Stocat | Nestocat |
|---|---|---|
| Imagine de hartă | Imaginea (PNG), mărimea ei, ancorele ei | Altitudinea, întoarcerea, opacitatea, luminozitatea, desaturarea - revin la valorile implicite (altitudinea = cel mai mic Y al setului de date curent, întoarcere pornită) |
| Nivel 3D | Vârfurile, culorile vârfurilor, coordonatele texturii, plăcile lor și atlasul de texturi, triunghiurile de teren / structură / apă, marginile structurilor, numărul de triunghiuri | Numele părților și motivele clasificării, și fiecare setare de aspect - revin la valorile implicite ale unui import proaspăt |

Un model încărcat din bibliotecă nu are listă de părți, iar limitele și banda de înălțime a terenului îi sunt recalculate din vârfurile lui.

## Unde trăiește {#where-it-lives}

În IndexedDB al browserului, baza de date `3dheat`, magazinul de obiecte `levels`, pentru originea paginii (adresa din bara de adrese a browserului). Este locală pentru acel profil de browser: un alt browser, alt profil sau altă adresă (de exemplu `localhost` în loc de `127.0.0.1`) vede o bibliotecă diferită, goală. Ștergerea datelor site-ului din browser o șterge. Intrările salvate de versiuni mai vechi, fără structuri, culori sau apă, se încarcă în continuare.
