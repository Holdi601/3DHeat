---
title: "Gamepad și HOTAS"
parent: "Camera și comenzile"
nav_order: 1
lang: "ro"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Gamepad și HOTAS

Poți zbura cu camera folosind un controller de tip Xbox în loc de tastatură. Folosește-l când vrei să te lași pe spate și să privești în jur într-o scenă mare. Intrarea lui **se adaugă** la cea de la tastatură, așa că le poți folosi pe amândouă deodată.

## Conectează un controller {#connect-a-controller}

1. Conectează controllerul (sau asociază-l prin Bluetooth).
2. Dă clic pe vizualizare și apasă orice buton de pe controller. Browserele arată un controller abia după prima lui intrare.
3. Deschide **Cameră și scenă → Gamepad**. Lista de dispozitive îl arată cu `●`.
4. Împinge stick-ul din stânga ca să zbori, pe cel din dreapta ca să privești. Dacă ai camera care derivă cu stick-urile în centru, mărește **Zona moartă**.

Orice dispozitiv pe care browserul îl mapează pe aspectul standard de gamepad funcționează. Un stick de zbor sau un manetă de gaz (HOTAS) este ignorat implicit; vezi mai jos.

## Mapare {#mapping}

| Control | Efect |
|---|---|
| Stick-ul din stânga | Mișcare: înainte/înapoi și lateral |
| Stick-ul din dreapta | Privire: giratie și înclinare, cu *Viteza privirii* grade pe secundă la deviație completă |
| `RT` / `LT` (analogic) | Sus / jos; în proiecția paralelă, apropiere / depărtare |
| `RB` (ținut) | De 6 ori mai rapid |
| `LB` (ținut) | 15% din viteză |
| `A` (ținut) | Sprint de 3 ori (se combină cu RB/LB) |
| `Y` (apăsat) | Încadrează datele |

Numerele butoanelor urmează aspectul standard: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; stick-urile pe axele 0-1 (stânga) și 2-3 (dreapta).

## Setările Gamepad {#the-gamepad-settings}

În **Cameră și scenă → Gamepad**. **Setări** / **Ascunde** deschide comenzile de reglare.

| Control | Implicit | Interval (rotiță) | Înțeles |
|---|---|---|---|
| **Activată** | pornit | | |
| Starea dispozitivului | | | Fiecare dispozitiv conectat, `●` când este urmărit, `○` când nu este, cu *- nu este un gamepad XInput, ignorat* sau *- nu este un gamepad XInput, folosit oricum* pentru dispozitivele nestandard. Când nu există niciunul: *Nu s-a detectat niciun gamepad. Browserele arată un controller abia după ce trimite prima intrare - apasă un buton pe el.* |
| **Dispozitiv folosit** | *Doar gamepaduri XInput (recomandat)* | | Apare când este conectat un dispozitiv nestandard. Alege un dispozitiv după nume ca să-l urmărești în schimb. |
| **Viteza privirii** | 150°/s | 20-540 (5000) | Viteza de rotire la deviație completă a stick-ului din dreapta. |
| **Zona moartă** | 12% | 0-50% (95%) | Radială: o împingere pe diagonală nu scapă niciodată pe o singură axă. Mărește-o dacă camera derivă cu stick-urile în centru. |
| **Curba stick-ului** | x² | liniară (1) până la x⁴ (16) | Exponentul răspunsului după zona moartă: control mai fin aproape de centru, tot viteză maximă la margine. |
| **Inversează Y la stick** | oprit | | |
| **Schimbă stick-urile între ele** | oprit | | Mișcarea pe stick-ul din dreapta, privirea pe cel din stânga. |

Forma stick-ului: cu deviația *m* (lungimea vectorului stick-ului) și zona moartă *d*, ieșirea = ((m - d) / (1 - d)) ^ curba de-a lungul direcției stick-ului, și 0 în interiorul zonei moarte.

## De ce doar gamepaduri standard implicit {#why-only-standard-pads-by-default}

API-ul Gamepad raportează **fiecare** dispozitiv HID cu axe - stick-uri de zbor, manete de gaz, pedale, volane - iar acestea nu stau în centru: o axă de răsucire sau o manetă de gaz stă la deviație completă când nimeni nu le atinge. Citită ca un stick, asta este o intrare permanentă la viteză maximă pe care nicio zonă moartă nu o poate suprima, iar camera se învârte singură din clipa în care se încarcă pagina (și toate modurile de căldură par defecte, pentru că o cameră în mișcare repornește acumularea la fiecare cadru).

Deci un dispozitiv este urmărit doar când browserul raportează `mapping: "standard"`, felul lui de a spune „un gamepad în stil XInput, cu axele unde te aștepți". Celelalte dispozitive sunt listate și marcate ca ignorate, iar **Dispozitiv folosit** te înscrie explicit la unul - de exemplu ca să zbori cu camera folosind un HOTAS. Odată ce un gamepad este urmărit, camera rămâne cu el, deci două controllere nu se luptă pentru cameră în funcție de ordinea enumerării.

**HOTAS:** sunt citite doar axele 0-3 (două stick-uri) și butoanele standard. O manetă de gaz sau pedalele pe alte axe nu fac nimic, iar un stick sau o manetă ale cărei axe nu stau în centru ar putea avea nevoie de o **Zonă moartă** mai mare.

Browserele ascund un controller până când acesta trimite prima intrare, deci un gamepad conectat, dar neatins, nu există încă pentru pagină.
