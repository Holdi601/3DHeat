---
title: "Alte jocuri de curse"
parent: "Analiză de cursă"
nav_order: 59
lang: "ro"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Alte jocuri de curse în vizualizator

Vizualizatorul citește tururi din multe jocuri de curse, nu doar dintr-unul. Pagina aceasta le enumeră și spune cum scoți un tur din fiecare.

## Jocurile {#the-games}

| Joc | Înregistrator | Alunecarea este în fișier? | Lumea este oglindită? | Note |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out prin UDP) sau fișierele de tur ale FH Companion plus fișierele lor `.tele.gz` | da, pe fiecare roată (normalizată) | da (lume cu sistem stâng) | fișierul `.tele.gz` de lângă fiecare tur FH Companion dă alunecarea fiecărei roți; fișierul de tur singur nu o dă |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (memorie partajată) | da, pe fiecare roată | măsurată din tururi | și ABS și control de tracțiune în acțiune, sarcini pe roți, temperaturi |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | nu, calculată din vitezele roților | măsurată din tururi | raliu: pământul afânat și săriturile se judecă altfel |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (UDP NGP) | nu | măsurată din tururi | fără viteze ale roților |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (un mod) | nu, calculată din vitezele roților | măsurată din tururi | |
| Trackmania | pluginul Openplanet, `telemetry --game trackmania --install` | un coeficient de alunecare pentru fiecare roată | măsurată din tururi | fizică de arcade: derapajele se judecă altfel |
| iRacing | niciunul: propriul său fișier `.ibt` | nu (nu este înregistrată); calculată din girație | nu (bazată pe GPS) | pornește înregistrarea în mașină cu Alt+L |

## Cum înregistrezi un tur {#how-to-record-a-lap}

1. Alege jocul tău în tabel și pregătește-l așa cum spune pagina înregistratorului pentru jocul respectiv (o setare în joc, un mod sau nimic, pentru iRacing). Pașii diferă de la joc la joc, așa că sunt în documentele înregistratoarelor: [GameCapture: jocuri](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Pornește înregistratorul, apoi conduce. Scrie un fișier pentru fiecare tur.
3. În fila **Analiză de cursă** apasă **Încărcați fișiere cu tururi…** și alege două sau mai multe tururi de pe același traseu (vezi [Încărcarea tururilor](race-loading-laps.md)).

Pentru jocurile de raliu, înregistratorul dă un fișier pentru fiecare rulare de etapă, iar pentru Forza cel mai simplu început este biblioteca FH Companion, cu fișierele `.tele.gz` alăturate fișierelor de tur.

## Ce documentează înregistratoarele {#what-the-recorders-document}

Cum este înregistrat fiecare joc, ce trimite, sursele pentru structurile lui și ce trasee pot fi exportate din fișierele lui sunt de documentat de înregistratoare: [GameCapture: jocuri](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (public, în [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)), iar fișierul de tur pe care îl scrie fiecare înregistrator este descris în [GameCapture: formatul turului](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Ce face vizualizatorul cu ele {#what-the-viewer-does-with-them}

Fiecare joc ajunge în fișiere `heat3d-lap` (sau într-un CSV de tur, ori este citit direct, cum este fișierul `.ibt` al iRacing), cu numele canalelor canonice din `src/race/schema.ts` și un bloc `meta` care spune ce înseamnă numerele lui: cum este scalată alunecarea, dacă e circuit, raliu sau arcade, suprafața când este cunoscută. Astfel fila **Analiză de cursă** le tratează la fel. Când nu este încărcat un model de traseu, fila **Analiză de cursă** desenează un drum după răspândirea tururilor înseși, deci fiecare joc se poate folosi fără model.

Ce nu trimite niciunul dintre jocurile de raliu - alunecarea anvelopelor - vizualizatorul o calculează: din punctul de contact al fiecărei roți sau din viteza suprafeței față de viteza mașinii acolo unde jocul trimite una (`(roată - mașină) / mașină`), iar din rotație și o rază de rulare măsurată pe tur însuși acolo unde jocul trimite doar rotația. Unghiul de derapaj vine din viteza proprie a mașinii (Forza, jocurile AC, Trackmania, RBR), din viteza în lume proiectată pe axele mașinii (EA WRC, DiRT, BeamNG) sau din orientare față de traseu. Dacă mașina este în aer se află din contactul, sarcinile sau suspensia roților. Vezi `src/race/derive.ts`.

Unde lumea unui joc este cu sistem stâng - a lui Forza este - traseul iese oglindit în vizualizator; turele și suspensia proprii ale tururilor o arată, iar fila **Analiză de cursă** oferă să inverseze o axă. Jocurile al căror sistem de coordonate nu este documentat (RBR, BeamNG, Trackmania) sunt tratate la fel: măsurate, nu presupuse.

Pe lângă canalele de conducere, înregistratoarele păstrează ce adaugă fiecare joc: ABS și controlul de tracțiune în acțiune la jocurile AC, repartiția frânării, DRS, limitatorul de boxe, boost-ul și durata de viață a plăcuțelor și discurilor de frână; la iRacing setările de ajutor, repartiția frânării, combustibilul, temperaturile uleiului și apei și orice alt canal pe care îl înregistrează sub numele lui. Vizualizatorul le desenează din tabelul său de canale - lămpi, niveluri, simboluri, grafice - așa că a înregistra mai mult nu cere nicio schimbare în vizualizator.
