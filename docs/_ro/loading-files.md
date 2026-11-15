---
title: "Încărcarea fișierelor"
parent: "Încărcarea datelor"
nav_order: 1
lang: "ro"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Încărcarea fișierelor

Această pagină arată cum îi dai lui 3DHeat fișierele tale și ce face cu ele. Trage un dosar, iar el alege fișierele care conțin poziții și le unește într-o singură imagine.

1. Deschide **Sursă**, în partea de sus a bării laterale a tabului Hartă termică.
2. Trage fișiere sau un dosar în zona de tragere, sau apasă **Fișiere…** sau **Dosar…**.
3. Citește rândul de selecție și **Estimarea memoriei** (vezi imaginea de mai jos).
4. Apasă **Încarcă**.

![Panoul Sursă după ce a fost tras un dosar cu zece meciuri: 1 rândul de selecție, 2 Estimarea memoriei la se potrivește, și 3 Încarcă 10 fișiere](../assets/img/en/loading-files-source.webp)

*După ce tragi un dosar, 3DHeat îți spune ce a găsit și dacă încape.*

Fișierele se încarcă în panoul **Sursă**, din partea de sus a barei laterale a tabului Hartă termică. Tot ce este selectat deodată devine **un singur** set de date.

## Alegerea fișierelor {#choosing-files}

| Control | Ce face |
|---|---|
| **Trageți aici fișiere sau un dosar** (zona de tragere) | Trage orice amestec de fișiere și dosare. Dosarele sunt parcurse recursiv. Un clic pe zona de tragere deschide același selector ca **Fișiere…**. |
| **Un fișier…** | Un selector de fișiere pentru un singur fișier. |
| **Fișiere…** | Un selector de fișiere care acceptă mai multe fișiere. |
| **Dosar…** | Un selector de dosare (selectorul `webkitdirectory` al browserului); fiecare fișier din arborele dosarului este oferit. |

Selectoarele acceptă tipurile de fișiere din [lista fișierelor care pot fi încărcate](data-formats.md#files). Pe scurt: `.parquet`/`.pq` se citesc ca Parquet, `.csv`/`.tsv`/`.txt` ca text delimitat, `.acmi` (Tacview), `.json`/`.json.gz` OCAP și formatele GPS (GPX, KML, KMZ, NMEA, IGC, FIT) trec prin propriile lor cititoare, iar containerele de meci `.3dheat` se încarcă ca tabelele pe care le conțin ([Un fișier pentru fiecare meci](container.md)). Un container care nu poate fi citit este sărit ca *nu este un fișier csv/parquet*.

Dosarele trase sunt parcurse pe o adâncime de 12 niveluri și cel mult 20.000 de fișiere, ca protecție împotriva buclelor de legături simbolice și a arborilor scăpați de sub control.

## Ce fișiere sunt păstrate {#which-files-are-kept}

Înainte ca ceva să fie citit, selecția este filtrată ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Un fișier cu altă extensie este sărit: *nu este un fișier csv/parquet*.
- Un fișier de 0 octeți este sărit: *gol (0 octeți)*.
- **Fișierele auxiliare ale convertorului** - datele brute pe care un convertor le păstrează lângă tabelul unui meci, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` și celelalte enumerate în [Convertoarele păstrează totul](converters.md) - sunt sărite: *fișier auxiliar al unui convertor*. Ca să deschizi unul, alege-l sau trage-l singur (sau doar fișiere auxiliare): o selecție formată doar din fișiere auxiliare le încarcă la fel ca pe orice tabel. JSON-ul de lângă un tabel (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` și `.hints.json`) nu este oferit niciodată ca poziții.
- **Regula fișierului de mișcare.** Dacă vreun fișier din selecție se numește `movement*.parquet`, `movement*.csv` (și celelalte extensii) - `movement.parquet`, `movement_1.parquet` și așa mai departe - atunci fiecare alt fișier de date este sărit: *nu este un fișier de mișcare, iar acest dosar are fișiere de mișcare*. Exporturile de telemetrie conțin adesea un tabel de poziții lângă zeci de tabele fără poziții, iar doar primul poate fi desenat. Un dosar fără niciun fișier de mișcare încarcă toate fișierele lui de date. Exemplu: un dosar cu `movement_1.parquet`, `kills.parquet` și `shop.parquet` încarcă `movement_1.parquet`; celelalte două sunt listate ca sărite. Exemplu: un dosar cu `movement_1.parquet`, `kills.parquet` și `shop.parquet` încarcă `movement_1.parquet`; celelalte două sunt listate ca sărite.
- Fișierele păstrate sunt sortate după calea lor în interiorul selecției, așa că același dosar produce mereu același set de date și aceleași culori.

Panoul arată apoi selecția (numele unui singur fișier sau `dosar (N fișiere)`, folosind cel mai lung dosar comun), numărul de fișiere, dimensiunea lor totală și numărul total de rânduri - exact când toate fișierele sunt Parquet, marcat cu `≈` când vreunul este CSV. Fișierele sărite sunt listate cu motivul lor, primele patru după nume.

## Citirea schemei {#reading-the-schema}

Primul fișier al selecției este deschis ca să descrie schema ("Se citește schema"): numele coloanelor, primele 50 de rânduri de date, care coloane arată numeric și, pentru Parquet, tipul logic al fiecărei coloane și intrarea `heat3d` din subsolul fișierului. Un dosar cu exporturi ale unui singur tabel are o schemă comună, deci un fișier reprezintă toate. Apoi fiecare fișier este măsurat ("Se numără rândurile"): subsolul unui Parquet dă numărul exact dintr-o singură citire mică; numărul unui CSV este estimat din lungimea medie a liniei din primul lui megaoctet.

Panoul [Maparea coloanelor](column-mapping.md) se deschide cu ghicitorile mapate automat, iar [estimarea memoriei](memory-and-budgets.md) apare deasupra butonului **Încarcă**.

## Mesaje înainte de încărcare {#messages-before-loading}

Sub selecție, panoul listează, din [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Erori** (roșu) - încărcarea nu poate porni: mai puțin de două axe de poziție, aceeași coloană pe două axe, o coloană mapată care nu există în fișier, o coloană de poziție care nu pare numerică, o coloană de timp ale cărei valori eșantionate sunt text când unitatea este un număr (fiecare rând ar fi citit ca NaN și ar ajunge la timpul 0), o coloană de timp setată la ISO-8601 dintre ale cărei valori eșantionate niciuna nu se poate citi ca dată, o scară de unitate de 0.
- **Avertismente** (chihlimbariu) - se va încărca, dar probabil nu cum a fost gândit: o coloană de grup care ia o valoare distinctă pe majoritatea rândurilor eșantionate (deci este un id, nu un grup), o coloană de timp `DATE` (fiecare rând dintr-o zi are același moment), direcție de privire setată fără coloanele ei.
- **Note** - ce implică maparea: desenare pe un plan când o axă nu este mapată, fără cronologie fără o coloană de timp, fără trasee fără o coloană de persoană, și fără o coloană de grup o singură culoare pentru tot și o diferență care poate fi împărțită doar pe o coloană păstrată pentru filtrare.

## Încărcarea {#loading}

Butonul **Încarcă** citește *Încarcă fișierul*, *Încarcă N fișiere* sau *Încarcă N fișiere (1 din K)* când este setat un [pas de decimare](memory-and-budgets.md#decimation). Citește *Prea mare - reduceți sau decimați* și este dezactivat când [verificarea de încăpere](memory-and-budgets.md#the-fit-check) spune că încărcarea nu va încăpea; este dezactivat și cât timp maparea are erori sau o altă încărcare rulează.

În timpul încărcării, panoul arată pasul curent (cu `[fișier/fișiere]` în față când sunt mai multe fișiere), rândurile citite până acum, o bară de progres și **Anulează**. Anularea oprește lucrătorul de ingerare și, odată cu el, orice lucrători de analiză pe care i-a pornit.

Pagina continuă să deseneze în timp ce încarcă, pentru că lucrul se face în fundal. Vezi pasul curent, rândurile citite, o bară de progres și **Anulează**. După ultimul fișier, panoul arată pașii *Se pun rândurile în ordinea timpului*, *Se reordonează coloanele (n din m)*, *Se măsoară întinderea*, *Se construiește lista*, *Se rezumă sesiunile* și *Se calculează duratele de viață*, apoi *Se încarcă N rânduri pe GPU* pentru un cadru, ca o încărcare lungă să nu fie confundată niciodată cu un blocaj.

### Cum funcționează {#how-it-works}

Încărcarea rulează într-un Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Cu mai multe fișiere și mai mult de un [fir de analiză](memory-and-budgets.md#parser-threads), până la acel număr de fișiere sunt analizate **deodată**, fiecare într-un lucrător de analiză al lui ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), atât cât lasă loc bugetul de RAM; ele sunt tot unite câte unul, în ordinea selecției, așa că setul de date este același ca la o încărcare una câte una. Cât timp mai multe sunt în lucru, linia de progres numește fișierul care a raportat ultimul, iar bara și numărul de rânduri adună fiecare fișier aflat în lucru. Cu un singur fir sau cu un singur fișier, fișierele sunt analizate unul după altul chiar în lucrătorul de ingerare. Sunt citite doar coloanele pe care le numește maparea: o coloană nemapată a unui fișier Parquet nu costă nimic; un CSV este parcurs octet cu octet, dar sunt decodificate doar câmpurile mapate.

## Mai multe fișiere devin un singur set de date {#several-files-become-one-dataset}

Când sunt încărcate mai multe fișiere ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Un singur registru.** Persoanele, grupurile, sesiunile și valorile de categorie sunt dicționare comune tuturor fișierelor, așa că același jucător din două exporturi este o persoană cu o singură urmă.
- **O singură origine a timpului.** Timpii sunt păstrați ca secunde pe 64 de biți în timpul unirii și raportați la cel mai devreme timp al *întregii* selecții, apoi stocați ca secunde pe 32 de biți de la acea origine. Patru exporturi din patru după-amieze sunt puse în ordinea lor reală, nu una peste alta.
- **O singură ordine a timpului.** Rândurile din toate fișierele sunt sortate după timp cu un sortaj radix (vezi [plafonul sortării](memory-and-budgets.md#the-sort-ceiling)).
- **O coloană `Source file`.** Fiecare rând își amintește din ce fișier vine, ca o coloană de categorie numită `Source file`. Apare în [Filtre](filters.md) și ca *Source file - compară două încărcări* în [împărțirea diferenței](difference.md). O încărcare dintr-un singur fișier nu o primește - o coloană constantă ar costa 4 octeți pe rând ca să nu spună nimic.
- **Coloane lipsă.** Un fișier căruia îi lipsește una dintre coloanele *de filtrare* contribuie pur și simplu fără valori pentru ea. Un fișier căruia îi lipsește o coloană de *rol* mapată (X, timp, persoană, ...) eșuează cu *fișierul nu are coloana „nume”*; într-o încărcare cu mai multe fișiere acel fișier este sărit și celelalte se încarcă în continuare, iar fișierele sărite sunt listate pe set de date. O încărcare dintr-un singur fișier care eșuează raportează eroarea.
- **Avertisment de lipsă.** Când rândurile încărcate sunt mai puține de 95% din rândurile numărate dinainte, setul de date poartă un avertisment cu partea lipsă - din fișiere ilizibile sau din rânduri fără o poziție utilizabilă, care sunt aruncate pe drum.

## După încărcare {#after-loading}

Noul set de date înlocuiește pe cel anterior. La fiecare încărcare ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- toate filtrele și vizibilitatea grupurilor sunt șterse;
- împărțirea diferenței pe grupuri este resetată: prima jumătate a grupurilor (rotunjită în sus) pozitivă, restul negative;
- raza sprite-ului este setată la întinderea orizontală / 120, iar saturația la o estimare analitică; mărimea cubului, lungimea razei de privire, viteza de zbor și planele apropiat/depărtat sunt setate după întindere (vezi [Sesiuni, persoane și grupuri](sessions-persons-groups.md#entity-size));
- sesiunea redării în cutie este setată la sesiunea cu cele mai multe rânduri;
- rutele căldurii pe linii sunt ghicite din nou ([Căldură pe linii](line-heat.md));
- modul de vedere revine la **Căldură** dacă modul curent nu este acceptat de noile date; cronologia revine la **Toate** fără o coloană de timp, iar istoricul la **Cumulativ** fără durate de viață;
- capul de redare este parcat la început, iar redarea se oprește;
- camera încadrează tot setul de date din direcția implicită (privind de-a lungul lui -Z, înclinată în jos cu aproximativ 36°).

Panoul **Set de date** arată apoi numele setului de date (selecția, numărul de rânduri și de fișiere și pasul, când a fost folosit unul), `N echipe · N persoane · Ns deschidere` și fiecare avertisment produs de încărcare, cu chihlimbariu, atâta timp cât setul de date este încărcat. **Descarcă** din acel panou elimină setul de date.
