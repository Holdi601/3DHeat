---
title: "Diferență"
parent: "Moduri de căldură"
nav_order: 5
lang: "ro"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: false
---

# Diferență

Roșu acolo unde echipa A a fost mai mult, verde-albastru acolo unde a fost echipa B, nimic acolo unde au fost egale.

**Diferență** (tasta 2) este căldură cu semn. Rândurile unei populații adaugă căldură; ale alteia o scad. Acolo unde cele două se suprapun uniform, rezultatul este zero și complet transparent; acolo unde una domină, se arată în culorile acelei părți - implicit calde (transparent → roșu → galben → alb) pentru partea **+** și reci (transparent → verde → albastru → violet) pentru partea **−**.

![Căldură diferență: roșu acolo unde partea + a fost mai mult, verde și albastru acolo unde partea − a fost mai mult](../assets/img/en/difference-split.webp)

## Cum se folosește {#how-to-use-it}

1. Apasă `2` (sau alege **Diferență** în bara de moduri).
2. Deschide **Împărțire pentru diferență** în bara laterală.
3. Alege după ce să **Împarți după**: de obicei *Grupuri*.
4. Pune un grup (sau o valoare) pe **+** și alt grup pe **−**.
5. Citește culorile: cald înseamnă partea +, rece înseamnă partea −. Panoul avertizează dacă o parte nu are rânduri (vezi [Mesaje pe care le poți vedea](#messages-you-may-see)).

*Care* două populații contează este întreaga întrebare, deci împărțirea poate fi după orice coloană păstrată, nu doar după grupuri. Rândurile care cad pe **niciuna** dintre părți sunt **lăsate deoparte**, nu numărate ca zero: asta face ca o împărțire după două dintre multe valori să compare exact acele două și se combină cu [filtrele](filters.md) - filtrează până la o singură hartă, apoi împarte asta după versiune.

Modul are nevoie de două părți: o coloană de grup cu cel puțin două grupuri sau o împărțire după o coloană păstrată pentru filtrare. La datele cu mai puțin de două grupuri, o încărcare începe cu o împărțire după o coloană - întâi coloana *Fișier sursă* a unei încărcări din mai multe fișiere, altfel prima coloană de categorie cu două valori, altfel prima coloană numerică cu o întindere - așa că *compară două încărcări* funcționează și la datele fără grupuri. Doar datele fără nimic din acestea lasă modul indisponibil; la fel și o împărțire pe o coloană care rămâne fără nimic pe o parte.

## Panoul Împărțire pentru diferență {#the-difference-split-panel}

Apare în modul Diferență, sub panourile de căldură.

**Împarte după** oferă:

| Opțiune | Afișată ca | Regula împărțirii |
|---|---|---|
| Grupuri | *Grup (N)* (când există o coloană de grup) | Fiecare grup pe +, pe − sau pe niciuna, setat în [Lista echipelor](teams-list.md) |
| O coloană de categorie | *coloană (N valori)* | Valorile pe +, pe − sau pe niciuna |
| O coloană numerică | *coloană (numerică)* | Un interval de valori pentru fiecare parte |
| Fișierul de origine | *Fișier sursă - compară două încărcări* (când au fost încărcate mai multe fișiere) | Fișierele pe +, pe − sau pe niciuna |

Sunt oferite doar coloanele păstrate sub *Păstrează pentru filtrare* la încărcare.

### Compară ponderi, nu numărători {#compare-shares-not-counts}

**Compară ponderi, nu numărători** (implicit oprit) ponderează fiecare parte cu unu împărțit la propriul număr de rânduri, astfel încât o parte cu de cinci ori mai multe rânduri nu câștigă doar prin numere. Culoarea arată atunci unde fiecare parte este proporțional mai frecventă decât cealaltă. Folosește-o când cele două părți au cantități foarte diferite de date, de exemplu două sesiuni de lungimi diferite.

### Mesaje pe care le poți vedea {#messages-you-may-see}

Panoul avertizează când imaginea nu este o diferență reală:

| Mesaj | Înseamnă |
|---|---|
| *N + / M −* (sau *N + / M − / K nefolosite*) | Câte valori sunt pe fiecare parte (și pe niciuna). |
| Niciun rând din fereastră nu este pe partea **+** | Se desenează doar partea **−**. Mută fereastra cronologiei sau schimbă împărțirea. |
| Niciun rând din fereastră nu este pe partea **−** | Se desenează doar partea **+**. |
| Nicio valoare nu este pe vreo parte | Diferența nu desenează nimic. Pune cel puțin o valoare pe **+** sau pe **−**. |
| *coloana* nu poate fi împărțită în acest fel | Coloana aleasă nu se potrivește cu împărțirea. Alege din nou coloana. |
| Coloana de împărțire nu a încăput în memoria GPU pentru N din M blocuri | Rândurile acelea nu se desenează. Mărește bugetul GPU din Performanță → Bugete de resurse sau încarcă mai puține rânduri. |

### După grup {#by-group}

Panoul doar trimite la [Lista echipelor](teams-list.md), unde fiecare grup are un buton **+** și unul **−**. La fiecare încărcare prima jumătate a grupurilor (rotunjită în sus) este pusă pe +, restul pe −; **Împarte egal** din Lista echipelor face la fel din nou. Un grup pus pe niciuna dintre părți, sau ascuns cu bifa lui, nu contribuie cu nimic.

### După valorile de categorie {#by-category-values}

| Parte | Înseamnă |
|---|---|
| `a + / b − / c nefolosite` | Câte valori sunt pe fiecare parte și pe niciuna. |
| **Golește** | Pune fiecare valoare pe niciuna dintre părți. |
| Lista valorilor | Fiecare valoare cu un buton **+** și unul **−** (apasă din nou pe cel activ ca să-l scoți de pe acea parte). O valoare goală apare ca *(lipsă)*. |
| Notă de limită | Sunt listate doar primele 200 de valori: *Se arată primele 200 din N valori. O coloană atât de largă se restrânge mai bine întâi cu un filtru, sau se împarte după interval dacă valorile sunt ordonate.* |

Alegerea coloanei pune prima ei valoare pe + și a doua pe −. Când nicio parte nu are nicio valoare, împărțirea revine la grupuri, în loc să arate un cadru gol. *Fișier sursă* funcționează la fel, cu o valoare pe fiecare fișier - așa se compară două exporturi, două rulări de test sau două versiuni.

### După interval {#by-range}

| Parte | Înseamnă |
|---|---|
| Indiciu | Minimul și maximul coloanei. |
| **Interval pozitiv (+)**, **de la** / **la** | Rândurile cu o valoare în acest interval, inclusiv la ambele capete, adună. |
| **Interval negativ (−)**, **de la** / **la** | Rândurile din acest interval scad. |
| **Împarte la mijloc** | Pune + pe [minim, mijloc] și − pe [mijloc, maxim] - și ce face și alegerea coloanei. |

O valoare aflată în ambele intervale contează ca +. Intervalele nu trebuie să acopere coloana; valorile aflate în niciunul sunt lăsate deoparte. *Primele două minute față de ultimele două* este o împărțire pe interval a unei coloane asemănătoare cu timpul.

## Culori {#colours}

Secțiunea **Culorile căldurii** arată în acest mod doi editori de rampă: **Pozitiv (echipe aditive)** și **Negativ (echipe subtractive)**, fiecare cu propriul buton de resetare (*Resetează la transparent → roșu → galben → alb*, *Resetează la transparent → verde → albastru → violet*). Compunerea ia valoarea absolută a căldurii nete prin [punctul de saturație și răspuns](colour-and-exposure.md), și alege rampa negativă acolo unde rezultatul net este sub zero. Vezi [Culoare și expunere](colour-and-exposure.md#the-ramp-editor).

Folosește răspunsul *Liniar* al densității când contează mărimea diferenței: este singurul răspuns în care aceeași culoare înseamnă același număr.

## Cum funcționează {#how-it-works}

Fiecare rând primește un semn de +1, -1 sau 0 în shader-ul de vârfuri ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); un 0 respinge rândul înainte ca vreun fragment să fie desenat.

- După grup, semnul vine dintr-un tabel de 4.096 de intrări indexat după identificatorul grupului rândului (identificatorul grupului stă în al patrulea canal al texelului de poziție al rândului).
- După categorie, semnul vine dintr-un al doilea tabel de 4.096 de intrări, completat pentru fiecare valoare de categorie, iar valoarea rândului se citește din textura de filtru a coloanei; o valoare de după sfârșitul tabelului este respinsă pe ambele backend-uri.
- După interval, valoarea rândului se compară cu cele două intervale.

Schimbarea împărțirii repornește acumularea.

**Grupurile ascunse rămân ascunse la orice împărțire.** Sub o împărțire după o coloană, tabelul de grupuri nu mai poartă semne; ține 1 pentru un grup vizibil și 0 pentru unul ascuns ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), iar ambele tabele ajung la shader împreună - două rânduri ale unei singure texturi de semne pe WebGL2, două jumătăți ale unui singur buffer de stocare pe WebGPU. Un rând se desenează doar când grupul lui este vizibil *și* valoarea lui de coloană este pe o parte. Deci un grup debifat în [Lista echipelor](teams-list.md), sau lăsat deoparte de concentrarea pe partea din fila Meci, nu contribuie cu nimic, oricum s-ar împărți diferența.
