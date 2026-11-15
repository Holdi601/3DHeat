---
title: "Diferență"
parent: "Moduri de căldură"
nav_order: 5
lang: "ro"
source: "difference.md"
source_hash: "9db62413b59c"
translated: true
outdated: false
---

# Diferență

Roșu acolo unde echipa A a fost mai mult, verde-albastru acolo unde a fost echipa B, nimic acolo unde au fost la fel.

**Diferență** (tasta 2) este căldura cu semn. Rândurile unei populații adună căldură; rândurile altei populații o scad. Acolo unde cele două se suprapun în mod egal, rezultatul este zero și complet transparent; acolo unde una domină, se arată în culorile acelei tabere - implicit calde (transparent → roșu → galben → alb) pentru tabăra **+** și reci (transparent → verde → albastru → mov) pentru tabăra **−**.

![Căldură diferență: roșu acolo unde tabăra + a fost mai mult, verde și albastru acolo unde tabăra - a fost mai mult](../assets/img/ro/difference-split.webp)

## Cum se folosește {#how-to-use-it}

1. Apasă `2` (sau alege **Diferență** în bara de moduri).
2. Deschide **Împărțire pentru diferență** în bara laterală.
3. Alege ce să **Împarte după**: de obicei *Grupuri*.
4. Pune un grup (sau o valoare) pe **+** și alt grup pe **−**.
5. Citește culorile: caldul înseamnă tabăra +, rece înseamnă tabăra −. Panoul avertizează dacă o tabără nu are rânduri (vezi [Mesajele pe care le poți vedea](#messages-you-may-see)).

*Care* două populații sunt întrebarea întreagă, deci împărțirea poate fi pe orice coloană păstrată, nu doar pe grupuri. Rândurile care cad pe **nicio** parte sunt **lăsate deoparte**, nu numărate ca zero: asta face ca o împărțire pe două din multe valori să compare exact cele două, și se combină cu [filtrele](filters.md) - filtrează până la o singură hartă, apoi împarte asta după versiune.

Modul are nevoie de două tabere: o coloană de grup cu cel puțin două grupuri, sau o împărțire pe o coloană păstrată pentru filtrare. Pe date cu mai puțin de două grupuri, o încărcare pornește cu o împărțire pe o coloană - întâi coloana *Source file* a unei încărcări cu mai multe fișiere, altfel prima coloană de categorie cu două valori, altfel prima coloană numerică cu o întindere - astfel încât *compară două încărcări* funcționează pe date fără niciun grup. Doar datele fără niciuna lasă modul indisponibil; la fel și o împărțire pe coloană lăsată fără nimic pe o parte.

## Panoul Împărțire pentru diferență {#the-difference-split-panel}

Arătat în modul Diferență, sub panourile de căldură.

**Împarte după** oferă:

| Opțiune | Arătată ca | Regula împărțirii |
|---|---|---|
| Grupuri | *Grup (N)* (când există o coloană de grup) | Fiecare grup pe +, − sau pe niciuna, stabilit în [Lista echipelor](teams-list.md) |
| O coloană de categorie | *coloană (N valori)* | Valorile pe +, − sau pe niciuna |
| O coloană numerică | *coloană (numerică)* | Un interval de valori pentru fiecare parte |
| Fișierul de origine | *Source file - compară două încărcări* (când au fost încărcate mai multe fișiere) | Fișierele pe +, − sau pe niciuna |

Sunt oferite doar coloanele păstrate sub *Păstrează pentru filtrare* la încărcare.

### Compară ponderi, nu numărători {#compare-shares-not-counts}

**Compară ponderi, nu numărători** (implicit oprit) ponderează fiecare parte cu unu împărțit la propriul ei număr de rânduri, astfel încât o parte cu de cinci ori mai multe rânduri nu câștigă doar prin numere. Culoarea arată atunci unde fiecare parte este proporțional mai frecventă decât cealaltă. Folosește-o când cele două părți au cantități foarte diferite de date, de exemplu două sesiuni de lungimi diferite.

### Mesajele pe care le poți vedea {#messages-you-may-see}

Panoul avertizează când imaginea nu este o diferență reală:

| Mesaj | Înseamnă |
|---|---|
| *N + / M −* (sau *N + / M − / K nefolosite*) | Câte valori sunt pe fiecare parte (și pe niciuna). |
| Niciun rând din fereastră nu este pe partea **+** | Se desenează doar partea **−**. Mută fereastra cronologiei sau schimbă împărțirea. |
| Niciun rând din fereastră nu este pe partea **−** | Se desenează doar partea **+**. |
| Nicio valoare nu este pe nicio parte | Diferența nu desenează nimic. Pune cel puțin o valoare pe **+** sau **−**. |
| *coloana* nu poate fi împărțită astfel | Coloana aleasă nu se potrivește cu împărțirea. Alege din nou coloana. |
| Coloana de împărțire nu a încăput în memoria GPU pentru N din M bucăți | Rândurile acelea nu sunt desenate. Mărește bugetul GPU din Performanță → Bugete de resurse, sau încarcă mai puține rânduri. |

### Pe grupuri {#by-group}

Panoul doar trimite la [Lista echipelor](teams-list.md), unde fiecare grup are un buton **+** și unul **−**. La fiecare încărcare prima jumătate a grupurilor (rotunjită în sus) este pusă pe +, restul pe −; **Împarte egal** din Lista echipelor face la fel din nou. Un grup pe niciuna dintre părți, sau ascuns cu căsuța lui, nu contribuie cu nimic.

### Pe valorile unei categorii {#by-category-values}

| Parte | Înseamnă |
|---|---|
| `a + / b − / c nefolosite` | Câte valori sunt pe fiecare parte și pe niciuna. |
| **Golește** | Pune fiecare valoare pe niciuna dintre părți. |
| Lista valorilor | Fiecare valoare cu un buton **+** și unul **−** (apasă din nou pe cel activ ca s-o scoți de pe acea parte). O valoare goală este listată ca *(lipsă)*. |
| Notă de limită | Sunt listate doar primele 200 de valori: *Se arată primele 200 din N valori. O coloană atât de largă e mai bine restrânsă mai întâi cu un filtru, sau împărțită pe interval dacă valorile ei sunt ordonate.* |

Alegerea coloanei pune prima ei valoare pe + și a doua pe −. Când nicio parte nu are nicio valoare, împărțirea trece pe grupuri în loc să arate un cadru gol. *Source file* funcționează la fel, câte o valoare pe fișier - așa se compară două exporturi, două rulări de test sau două versiuni.

### Pe interval {#by-range}

| Parte | Înseamnă |
|---|---|
| Indiciu | Minimul și maximul coloanei. |
| **Interval pozitiv (+)**, **de la** / **la** | Rândurile cu o valoare în acest interval, incluzând ambele capete, adună. |
| **Interval negativ (−)**, **de la** / **la** | Rândurile din acest interval scad. |
| **Împarte la mijloc** | Setează + la [minim, mijloc] și − la [mijloc, maxim] - ceea ce face și alegerea coloanei. |

O valoare din ambele intervale contează ca +. Intervalele nu trebuie să acopere coloana; valorile din niciunul sunt lăsate deoparte. *Primele două minute față de ultimele două* este o împărțire pe interval a unei coloane asemănătoare timpului.

## Proporția +: harta ratei de victorie {#share-of--the-win-rate-map}

**Diferență** / **Proporția +** din partea de sus a panoului alege ce se desenează. *Proporția +* colorează fiecare loc după proporția părții + din rândurile ambelor părți de acolo, față de acea proporție pe tot ce se arată: cald peste ea, rece sub ea, nimic unde e la fel și nimic unde un loc are prea puține rânduri. Cu rundele câștigate pe + și cele pierdute pe − este o hartă a ratei de victorie; **Rata de victorie pe rundă** și **Rata de victorie pe meci** o configurează dintr-o apăsare, acolo unde datele au [coloane de rezultat](data-formats.md#outcome-columns). Vedeți [Rata de victorie](win-rate.md).

## Culorile {#colours}

Secțiunea **Culorile căldurii** arată în acest mod două editoare de scară: **Pozitiv (echipe aditive)** și **Negativ (echipe subtractive)**, fiecare cu propriul buton de resetare (*Resetează la transparent → roșu → galben → alb*, *Resetează la transparent → verde → albastru → mov*). Compozitul ia valoarea absolută a căldurii nete prin [punctul de saturație și răspuns](colour-and-exposure.md), și alege scara negativă acolo unde netul este sub zero. Vezi [Culoare și expunere](colour-and-exposure.md#the-ramp-editor).

Folosește răspunsul de densitate *Liniar* când mărimea diferenței contează: este singurul răspuns în care aceeași culoare înseamnă același număr.

## Pentru dezvoltatori {#for-developers}

Fiecare rând primește un semn de +1, -1 sau 0 în shaderul de vârfuri ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); un 0 respinge rândul înainte ca vreun fragment să fie desenat.

- Pe grup, semnul vine dintr-un tabel de grupuri cu 4.096 de intrări indexat după id-ul grupului rândului (id-ul grupului călătorește în al patrulea canal al texelului de poziție al rândului).
- Pe categorie, semnul vine dintr-al doilea tabel de 4.096 de intrări, umplut pe valoare de categorie, iar valoarea rândului este citită din textura de filtru a coloanei; o valoare de dincolo de sfârșitul tabelului este respinsă pe ambele backend-uri.
- Pe interval, valoarea rândului este comparată cu cele două intervale.

Schimbarea împărțirii repornește acumularea.

**Grupurile ascunse rămân ascunse la orice împărțire.** Sub o împărțire pe o coloană, tabelul de grupuri nu mai poartă semne; ține 1 pentru un grup arătat și 0 pentru unul ascuns ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), iar ambele tabele ajung la shader împreună - două rânduri ale unei singure texturi de semne pe WebGL2, două jumătăți ale unui singur buffer de stocare pe WebGPU. Un rând este desenat doar când grupul lui este arătat *și* valoarea lui de coloană este pe o parte. Deci un grup debifat în [Lista echipelor](teams-list.md), sau lăsat deoparte de focusul de tabără al tabului Meci, nu contribuie cu nimic, oricum ar fi împărțită diferența.
