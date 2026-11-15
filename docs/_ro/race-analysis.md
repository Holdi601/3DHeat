---
title: "Analiză de cursă"
nav_order: 14
has_children: true
lang: "ro"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Analiză de cursă

Ai condus același traseu de două ori. Fila **Analiză de cursă** redă ambele curse împreună în 3D, arată unde un tur a fost mai lent și îți spune de ce. Nu ai încă ture? Apasă **Tururi demonstrative**.

![Fila Analiză de cursă cu ture demonstrative: bara laterală cu Tururi și Unde să te îmbunătățești, mașinile pe traseu, graficele de sub vedere](../assets/img/en/race-analysis-overview.webp)

Fila compară două sau mai multe ture ale aceluiași traseu. Împarte pânza, camera și modelul încărcat al traseului (**Fundal / nivel**) cu harta termică; restul este propriu: propria bară laterală și propria bară de sub vedere. Cuvinte precum *tur*, *referință* și *apex* sunt în [glosar](glossary.md).

Această pagină este harta filei. Fiecare parte are pagina ei:

| Pagină | Ce acoperă |
|---|---|
| [Încărcarea turelor](race-loading-laps.md) | fiecare format de fișier, dosare și trasee, nume de mașini, ture demonstrative, lista turelor, referința și focusul |
| [Reluarea și scena 3D](race-replay-and-scene.md) | bara de transport, cele trei moduri de reluare, alinierea mașinilor, camera de urmărire, liniile, hărțile, mașinile, etichetele, lumile oglindite |
| [Grafice și HUD](race-charts-and-hud.md) | graficele pe distanță, selectorul de grafice, cursorul și zoom-ul, cardurile mașinilor, tabelul canalelor |
| [Evenimente de control al mașinii](race-control-events.md) | blocări, patinare, supravirare, învârtiri, subvirare, contacte, accidente, ABS/TC, frâna de mână, aerul - cum este detectat fiecare, cu fiecare prag |
| [Analiza curbă cu curbă](race-corner-analysis.md) | aliniere pe distanță, viraje și segmente, contul de timp al unui viraj, fiecare cauză și ordinea în care sunt încercate, forma traiectoriei și sfatul |
| [Profilurile mașinilor și compararea](race-car-profiles.md) | ce poate face fiecare mașină, măsurat din turele ei; *Mașini comparate*; ce decide mașina în fiecare viraj |
| [Statisticile traseului](race-course-statistics.md) | multe ture ale unui traseu: greșeli pe viraj și pe tip, harta greșelilor, exportul hărții termice, limitele de performanță |
| [Analiza de cursă: metoda](race-analytics.md) | cercetarea din spatele regulilor, cu surse |
| [Alte jocuri de curse](other-games.md) | ce face vizualizatorul cu ture din fiecare joc: alunecarea și derapajul calculate acolo unde un joc nu le trimite, lumi oglindite, canalele suplimentare |

## Ecranul {#the-screen}

**Bara laterală**, de sus în jos (secțiunile pot fi strânse):

1. **Ture** - încărcare, listă, arată/ascunde, referință, focus, urmărire.
   Vezi [Încărcarea turelor](race-loading-laps.md).
2. **Statisticile traseului** - doar de la trei ture încărcate.
   Vezi [Statisticile traseului](race-course-statistics.md).
3. **Unde să te îmbunătățești** - constatările turului focalizat, viraj cu viraj.
   Vezi [Analiza curbă cu curbă](race-corner-analysis.md).
4. **Viraj cu viraj** (sau *Viraj cu viraj – clasa X* cu mai multe clase) - cel mai rapid tur prin fiecare viraj și traiectoria lui. Apare cu două sau mai multe ture.
5. **Controlul mașinii** - blocările, derapajele, împingerile și contactele turului focalizat.
   Vezi [Evenimente de control al mașinii](race-control-events.md).
6. **Mașini comparate** (sau **Mașina** cu o singură mașină) - vezi [Profilurile mașinilor și compararea](race-car-profiles.md).
7. **Vedere** - ce hartă este pictată pe pistă și ce se desenează.
   Vezi [Reluarea și scena 3D](race-replay-and-scene.md).
8. Panourile comune **Nivel** și **Cameră și scenă** (modelul traseului, inversarea axelor, camera) - documentate împreună cu harta termică și [Camera](camera.md).

**Vederea** arată traseul, liniile parcurse, harta, mașinile, etichetele fixate pe pistă și până la șase carduri de mașină în stânga sus (vezi [Grafice și HUD](race-charts-and-hud.md)). Fără ture încărcate, spune „Nicio tură încărcată - trage aici două sau mai multe fișiere cu ture sau încarcă turele demonstrative din bara laterală.”

**Bara de sub vedere** ține transportul reluării și, dacă nu este ascunsă, graficele pe distanță.

## Start rapid {#quick-start}

1. Deschide fila **Analiză de cursă** (lângă **Hartă termică** în partea de sus a barei laterale).
2. Adu ture. Apasă **Tururi demonstrative** ca să vezi ce face fila cu trei ture inventate. Pentru turele tale, înregistrează-le întâi ([formate de fișiere și înregistratoare](race-loading-laps.md#file-formats)), apoi apasă **Încarcă fișiere cu tururi…** sau **Dosar…**, sau trage fișiere ori dosare pe vedere.
3. Turul complet cel mai rapid devine referința; cel mai lent dintre celelalte ture este focalizat. Dă clic pe orice tur din listă ca să-l focalizezi; ★ face un tur referință.
4. Citește **Unde să te îmbunătățești**. Dă clic pe o constatare: mașinile se aliniază cu 40 m înainte de ea, camera o încadrează, reluarea trece prin ea, iar măsurătorile se deschid.
5. Treci cu cursorul peste grafice ca să muți fiecare mașină la acel metru; Shift+clic ca să le aliniezi acolo.

## Taste {#keyboard}

Cât timp fila Analiză de cursă este deschisă:

| Tastă | Face |
|---|---|
| **K** | pornește / pune pe pauză reluarea |
| **Home** | înapoi la începutul reluării |
| tastele cu cifre | nimic (în harta termică schimbă modurile) |

Tastele scrise într-un câmp de text sau într-o listă derulantă sunt ignorate. Tastele camerei funcționează ca în harta termică (**W A S D**, **Space** în sus, **Q** în jos, **Shift** mai rapid, **Alt** mai lent, mouse-ul ca să privești; toate în [Camera](camera.md)); **F** încadrează turele încărcate (la fel ca încărcarea turelor).

## Multe ture {#many-laps}

- Toate turele încărcate sunt analizate și numărate; zecile durează o secundă sau două.
- Peste **8** ture (`SHOW_ALL_UP_TO`), turele adăugate sunt desenate doar când sunt referința, turul focalizat sau cel mai bun tur al clasei turului focalizat. Comutatoarele *Arată tot* / *Doar cele analizate* schimbă.
- Peste **10** mașini vizibile (`PLAIN_PAST`), turele care nu sunt analizate (nu focusul, mașina urmărită sau referința) sunt desenate cu linii rărite la un punct la fiecare 6 m, în loc de 1,5 m, și cu mașini simple.
- Graficele desenează cel mult **8** ture; HUD-ul arată cel mult **6** carduri.
- Statisticile traseului apar de la **3** ture.

Detalii: [Statisticile traseului](race-course-statistics.md#performance-with-many-laps).

## Setările implicite ale vederii {#default-view-settings}

| Setare | Implicit |
|---|---|
| Hartă | Harta timpului |
| Liniile parcurse, Mașini, Anvelope și suspensie, Etichete, Traseul din ture | pornit |
| Toate valorile de pe carduri | oprit |
| Mărimea mașinii | 1× |
| Grafice | arătate |
| Mod de reluare | De la linie |
| Viteza reluării | 1× |
| Buclă | pornit |

Nimic din acestea nu se salvează; o reîncărcare pornește de la valorile implicite. Ce se ține minte în browser: limba și numele mașinilor învățate din fișierele de ture (vezi [Încărcarea turelor](race-loading-laps.md#car-names)).

## Pentru dezvoltatori {#for-developers}

### What happens when laps are loaded {#what-happens-when-laps-are-loaded}

Ori de câte ori se schimbă setul de ture, referința sau limba, întreaga analiză se reface (`analyse` în
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Canalele derivate se adaugă fiecărui tur acolo unde jocul nu le trimite: unghiul de derivă, alunecarea roților din viteza roților, în aer, teren nepavat, rata de giratie ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Referința este aleasă, iar fiecare tur este proiectat pe traseul lui și reeșantionat la fiecare 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Se stabilește din ture dacă lumea jocului este oglindită ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Virajele se găsesc pe referință și se grupează în segmente, de la o zonă de frânare la următoarea ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Pe mașină: anvelopa ei (aderență, frânare, putere pe viteză), profilul ei, curbele anvelopelor ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Pe tur și segment: ce a făcut (punctul de frânare, punctul cel mai lent, accelerația plină, ...) și traiectoria parcursă ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Pe tur: evenimentele lui de control al mașinii, fiecare pus alături de turul cu care este comparat acolo.
8. Pe tur și segment: contul de timp față de turul de comparație și constatarea în cuvinte.
9. Harta timpului și harta cauzelor pe tur.

Textele se produc în limba curentă; schimbarea limbii rulează din nou analiza (și redenumește turele demonstrative). O eroare a analizei apare sub butoanele **Ture** ca eroare, iar turele rămân încărcate.

### Source files {#source-files}

| File | Role |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | reading lap files |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | the lap type, naming, demo laps |
| `src/race/derive.ts`, `handedness.ts` | derived channels, mirrored worlds |
| `src/race/align.ts`, `segments.ts`, `line.ts` | distance axis, corners, lines |
| `src/race/analysis.ts` | corners compared, causes, findings |
| `src/race/envelope.ts`, `profile.ts` | what a car can do |
| `src/race/control.ts`, `impacts.ts` | car control, hits and crashes |
| `src/race/stats.ts` | many laps |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | replay and drawing |
| `src/race/schema.ts`, `graphs.ts` | the channel table, the charts' rows |
| `src/ui/race/*` | the sidebar, the charts, the HUD, the labels |
| `src/state/raceStore.ts` | the tab's state and the replay clock |
