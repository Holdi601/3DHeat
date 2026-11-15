---
title: "Sesiuni, persoane și grupuri"
parent: "Încărcarea datelor"
nav_order: 4
lang: "ro"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sesiuni, persoane și grupuri

O **persoană** este un lucru aflat în mișcare (un jucător, o mașină). O **echipă/grup** este tabăra din care face parte. O **sesiune** este un meci sau un tur. Vezi [glosarul](glossary.md).

Un rând dintr-un fișier poate numi toate trei:

| x | y | timp | jucător | echipă | meci |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` este persoana, `team` este grupul, `match` este sesiunea.

Trei coloane opționale descriu *cine* și *în ce parte a poveștii* aparține un rând. Fiecare este codificată prin dicționar la încărcare: valorile text devin id-uri întregi mici pe rând, plus o listă de etichete, comună tuturor fișierelor din încărcare.

## Persoana {#person}

Coloana **Id persoană** numește lucrul aflat în mișcare căruia îi aparține un rând: un jucător, un bot, o mașină. Este stocată ca un id pe 32 de biți pe rând.

Cu o coloană de persoană și una de timp, încărcarea calculează **durata de viață** a fiecărui rând: timpul până la următorul eșantion al aceleiași persoane *din aceeași sesiune*, sau "niciuna" (o valoare de semnalizare, -1) când nu există un eșantion următor - persoana a murit, a plecat sau jurnalul s-a terminat. Duratele de viață alimentează istoricul **Durata de viață** al [cronologiei](timeline.md), interpolarea și vechimea din [redarea în cutie](box-replay.md), și întreruperile de rută ale [căldurii pe linii](line-heat.md). Ce face un rând fără succesor este o setare de vizualizare (*Durata de rezervă*), nu este încorporat în date.

Fiecare persoană primește grupul rândului ei **dintâi** în timp; această asociere îi colorează caseta în redarea în cutie și decide ce comutator de vizibilitate al grupului o ascunde acolo. Modurile de căldură folosesc în schimb grupul propriu al fiecărui rând.

### Nume purtate de mai multe lucruri deodată {#names-worn-by-several-things-at-once}

Un nume nu este întotdeauna o singură entitate: în unele exporturi, fiecare bot din fiecare meci se înregistrează sub un singur nume. Unirea a două eșantioane ale unei astfel de "persoane" - prin interpolare, o urmă sau o rută - trasează o linie între două creaturi diferite, de la un capăt al hărții la celălalt.

La încărcare ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) un nume este marcat **comun** când două înregistrări ale lui

- sunt în aceeași sesiune,
- au același timp,
- sunt de același fel (fiecare coloană de categorie păstrată are aceeași valoare), și
- sunt mai departe una de alta decât 1% din diagonala întinderii datelor.

Numele comune sunt desenate ca eșantioane singulare - fără interpolare, fără urmă, fără rută de căldură pe linii. Restul despre ele (căldura lor) nu este afectat. Panoul Set de date listează câte nume au fost marcate, cu până la trei exemple, iar panoul redării în cutie repetă numărul.

## Sesiunea {#session}

Coloana **Sesiune / meci** spune ce meci, raid, rundă, cursă sau tur aparține unui rând. Ea face ca eșantioanele unei persoane să fie o singură urmă continuă: telemetria reală intercalează adesea meciuri simultane, iar eșantionul unui jucător chiar înainte de capul de redare și cel de după pot fi din meciuri diferite, la sute de metri distanță. Cu o coloană de sesiune:

- interpolarea, urmele și rutele căldurii pe linii nu trec niciodată peste o schimbare de sesiune;
- durata de viață a unui rând se încheie la sfârșitul propriei sesiuni;
- selectorul **Sesiune** apare în partea de sus a barei laterale, sub bara de moduri.

O coloană de sesiune este foarte des un *timestamp* - instantul de început al meciului, repetat pe fiecare rând al acelui meci. Maparea automată caută numele de sesiune înaintea persoanei și grupului din acest motiv ([Maparea coloanelor](column-mapping.md#session-person-group)). O tură sau o perioadă de cursă este și ea o sesiune: două ture ale aceleiași mașini nu trebuie unite într-o singură urmă.

### Selectorul de sesiune {#the-session-picker}

![Selectorul de sesiune deschis pe un fișier cu zece meciuri: Toate sesiunile (10), Match 01, Match 02 și așa mai departe](../assets/img/en/sessions-persons-groups-picker.webp)

*Zece meciuri într-un fișier: alege unul sau vezi-le pe toate.*

Apare când setul de date are sesiuni listate (vezi limita de mai jos).

| Parte | Înseamnă |
|---|---|
| Eticheta din dreapta | Numărul de rânduri al sesiunii alese, sau *toate deodată*. |
| Meniul | *Toate sesiunile (N)*, apoi fiecare sesiune, cele mai active primele, ca `etichetă - N rânduri, interval` (intervalul în secunde sub 90 s, în minute sub 90 min, în ore peste). |
| Indiciul chihlimbariu | Apare pentru *Toate sesiunile*: pozițiile nu sunt totuși niciodată unite între sesiuni, dar meciurile simultane pun pe hartă împreună jucători fără legătură. |
| Indiciu | Apare în modurile de căldură când este aleasă o sesiune: alegerea mută doar capul de redare. |

La încărcare este selectată sesiunea cea mai activă. Alegerea unei sesiuni mută capul de redare la începutul acelei sesiuni.

Ce schimbă selecția:

- În **[redarea în cutie](box-replay.md)** decide ce sesiune este redată: sunt desenate doar cutiile și urmele acelei sesiuni, iar intervalul cronologiei devine intervalul propriu al sesiunii.
- În **modurile de căldură** nu restrânge căldura, iar un indiciu sub selector spune asta: *În modurile de căldură aceasta doar mută capul de redare la începutul sesiunii; căldura numără în continuare fiecare sesiune. Redarea în cutie redă singură sesiunea aleasă.* Ca să restrângi căldura la o singură sesiune, păstrează și coloana de sesiune ca o coloană de filtru (*Păstrează pentru filtrare*) și filtrează pe ea. O coloană poate fi și coloana de sesiune, și o coloană de filtru: încărcătorul citește fiecare coloană de filtru bifată separat, oricare ar fi și rolul pe care îl joacă.

### Prea multe sesiuni {#too-many-sessions}

Sunt listate până la **100.000** de sesiuni. Peste asta, coloana este de fapt un id (un dosar cu milioane de sesiuni, fiecare cu câteva rânduri), iar trimiterea atâtor etichete de la lucrător la pagină este ceea ce duce un tab la epuizarea memoriei. Încărcarea păstrează atunci **id-urile** sesiunilor - deci limitele sunt tot respectate peste tot - dar renunță la etichete și la selector, iar panoul Set de date spune asta.

## Grupul {#group}

Coloana **Echipă / grup** este orice coloană cu puține valori distincte: o echipă, o tabără, un pluton, o facțiune, un indicator jucător-contra-AI, o clasă de mașini. Este stocată ca un id pe 16 biți pe rând și conduce:

- [Lista echipelor](teams-list.md) (vizibilitatea pe grup, + / − taberele),
- [căldura pe echipe](team-heat.md) (o nuanță pentru fiecare grup),
- [împărțirea diferenței](difference.md) pe grupuri,
- culorile cutiilor din [redarea în cutie](box-replay.md) (o familie de nuanțe pe grup, o umbră pentru fiecare membru).

### Limite {#limits}

Cel mult **4.096** de grupuri distincte. Id-ul grupului călătorește în al patrulea canal al texelului de poziție al fiecărui rând pe GPU, iar fiecare grup are nevoie de un texel în tabelul de semne de 4.096 de lățime pe care îl citește shaderul ca să decidă *ascuns*, *adunat* sau *scăzut*. O coloană cu mai multe valori distincte este un id, nu un grup: **încărcarea păstrează fiecare rând și elimină doar gruparea**, cu un avertisment pe set de date care sugerează să o mapezi ca coloană de persoană în schimb, sau s-o păstrezi ca o coloană de filtru.

Aceeași limită de 4.096 se aplică unei coloane de filtru de *categorie* păstrate; una mai largă nu este păstrată, iar setul de date spune asta. O coloană numerică (un timestamp, de exemplu) nu are o astfel de limită ca filtru de *interval*.

Valorile de grup `0`, o valoare goală, `none`, `unknown`, `null` și `-1` (fără diferență între majuscule și minuscule) înseamnă "fără grup" pentru [căldura pe echipe](team-heat.md), care le desenează în gri neutru în loc de o culoare sigură.

## Mărimea entității {#entity-size}

Cât de mare este un lucru urmărit - caseta de coliziune a unui jucător, o mașină - decide cât de mari sunt desenate cutiile și razele de privire ale [redării în cutie](box-replay.md). Panoul nu are un câmp pentru ea; vine din [indiciile `heat3d`](data-formats.md#the-heat3d-hints) ale fișierului (`entity.size`, în unitățile proprii ale fișierului; convertorul CS2 scrie 32). Încărcarea o înmulțește cu scara unității.

La fiecare încărcare ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), cu *întinderea* ca fiind cea mai mare dintre întinderile X și Z ale datelor:

| Setare | Cu o mărime a entității | Fără |
|---|---|---|
| Mărimea cubului | mărimea entității | întinderea / 500 |
| Lungimea razei de privire | mărimea entității × 4 | întinderea / 200 |
| Raza sprite-ului | întinderea / 120 | întinderea / 120 |
| Punctul de saturație | estimare analitică (apoi măsurată) | la fel |
| Viteza de zbor | întinderea / 12 | la fel |
| Planul depărtat | întinderea × 12 | la fel |
| Planul apropiat | max(0,05; întinderea / 20.000) | la fel |

## Panoul Set de date {#the-dataset-panel}

Sub panoul Sursă. Cu un set de date încărcat arată:

- **numele** setului de date - selecția, numărul de rânduri, numărul de fișiere, pasul când a fost folosit unul;
- **`N echipe · N persoane · Ns interval`**;
- fiecare **avertisment** produs de încărcare, cu chihlimbariu, atâta timp cât setul de date este încărcat: grupuri sau o coloană de filtru eliminate pentru prea multe valori, sesiuni nelistate, nume comune, rânduri lipsă, fișiere sărite;
- [generatorul sintetic](synthetic-generator.md);
- **Descarcă**, care elimină setul de date.

Numărul de rânduri este arătat în antetul panoului.
