---
title: "Traseul camerei și videoclipul"
nav_order: 15
lang: "ro"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Traseul camerei și videoclipul

Fă un film din datele tale: pui camera în câteva locuri, vizualizatorul zboară între ele și salvează un videoclip. Fiecare cadru este foarte curat, fără granulație. Camera și capul de redare se mișcă împreună, deci același panou face și un timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Fă un zbor {#make-a-flythrough}

1. Zboară până unde începe filmul și apasă **Adaugă cadru cheie aici** în **Traseu de cameră și randare**.
2. Zboară până la următorul loc și apasă din nou. Repetă pentru fiecare oprire.
3. Bifează **Previzualizare pe traseu** și trage **Poziția pe traseu** ca să verifici mișcarea.
4. Setează **Durata** (cât de lung este videoclipul). O mișcare care este corectă, dar prea rapidă, are nevoie doar de o durată mai mare.
5. Apasă **Randează video**. Așteaptă linia de progres; fișierul se descarcă la final.

![Panoul Traseu de cameră și randare cu trei cadre cheie, interpolare Netedă, 12 s, 30 fps și 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Cadre cheie {#keyframes}

| Comandă | Efect |
|---|---|
| **Adaugă cadru cheie aici** | Adaugă la sfârșit poziția, girația, tangajul și câmpul vizual actuale ale camerei, ca cadru cheie. |
| **Golește** | Șterge toate cadrele cheie. |
| Lista de cadre cheie | Un rând pentru fiecare cheie: numărul ei (dă clic ca să zbori camera acolo, setând și câmpul vizual), poziția, `yaw° / pitch°` și **×** ca să o ștergi. |

Cheile sunt distanțate **uniform** de-a lungul unei axe normalizate a traseului, de la 0 la 1, ori de câte ori se adaugă sau se scoate una; durata de ieșire întinde apoi toată mișcarea, deci un cadru care este corect, dar prea rapid, are nevoie doar de o durată mai mare. Girația este desfășurată între chei, astfel încât camera se întoarce pe drumul scurt.

Fără cadre cheie, o randare ține camera actuală nemișcată pentru tot clipul - un timelapse perfect valabil.

## Setările traseului {#path-settings}

| Comandă | Implicit | Interval (cursor) | Înțeles |
|---|---|---|---|
| **Interpolare** (2+ chei) | *Netedă* | *Netedă* / *Dreaptă* | *Netedă*: o curbă Hermite cubică prin chei, cu tangente din cheile vecine, astfel încât viteza se potrivește la fiecare cheie și nu există nicio smucitură acolo unde se întâlnesc segmentele. *Dreaptă*: linii drepte între chei, previzibile, cu un colț vizibil la fiecare cheie. Câmpul vizual este mereu interpolat liniar. |
| Linia de deplasare (2+ chei) | | | `N unități de deplasare - M pe secundă la această durată`, sau o notă că toate cheile sunt în același loc. |
| **Previzualizare pe traseu** (1+ chei) | oprit | | Conduce camera din fereastră după traseu și mută capul de redare odată cu ea, cum o face randarea, ca mișcarea să poată fi judecată înainte de randare. |
| **Poziția pe traseu** (în timpul previzualizării) | 0% | 0-100% | Unde pe traseu să se previzualizeze. |
| **Durata** | 12 s | 1-120 s (3600) | Lungimea videoclipului. |
| **Rata de cadre** | 30 fps | 6-60 (240) | |
| **Bitrate** | 16 Mbps | 1-60 Mbps, logaritmic (400) | Gradientele de căldură se benzuiesc prost la bitrate-uri mici: există puțin detaliu în spatele căruia un codec să poată ascunde eroarea. |
| **Limita de așteptare pentru convergență** | 240 de cadre | 2-600 (10.000) | Cel mai lung timp în care un cadru de ieșire poate aștepta să devină exact. Cadrele care ating limita sunt scrise oricum și numărate. |
| Rezumat | | | `N cadre · fereastră: cumulativă/fixă/durată de viață`, și când cronologia este în modul Toate: *(randarea trece Toate la Redare, ca capul de redare să aibă sens)*. |
| **Randează video** / **Anulează** | | | Pornește randarea; cât timp rulează, arată `cadrul i / n · a așteptat w · X MB` și câte cadre nu au fost exacte. Are nevoie de un set de date. |

## Sfaturi {#tips}

- Dimensiunea de ieșire este dimensiunea canvasului în pixeli fizici (raportul de pixeli al ecranului, plafonat la 2). Redimensionează fereastra browserului ca să o schimbi.
- O istorie cumulativă construiește căldura de-a lungul clipului; o istorie pe fereastră sau pe durată de viață arată o felie în mișcare a timpului.
- Pozițiile cheilor sunt coordonate de afișaj: cu o [axă a lumii inversată](camera.md#invert-world-axis), cheile făcute înainte de comutare indică altceva după.

## Pentru dezvoltatori {#for-developers}

### Ce face o randare {#what-a-render-does}

1. Face o captură de test a cadrului, ca să afle mărimea exactă de ieșire în pixeli fizici.
2. Alege un codec prin WebCodecs: **VP9** (`vp09.00.10.08`), altfel **VP8**, la bitrate-ul și rata de cadre alese. Fără `VideoEncoder` se oprește cu *Acest browser nu are VideoEncoder - WebCodecs este necesar pentru a scrie un videoclip*; fără niciunul dintre codecuri, cu *Niciun codec video suportat (încercate VP9, VP8)*.
3. Preia setările de care are nevoie o randare: pune redarea pe pauză, comută **bugetul adaptiv oprit**, **rafinarea progresivă pornită** și bugetul de sprite-uri la 64M pe cadru (bugetul adaptiv protejează rata de cadre, ceea ce este scopul greșit aici: ar citi fiecare cadru lent care converge drept un motiv să împrăștie mai puține rânduri, ceea ce cere mai multe cadre ca să convergă), și comută cronologia de la **Toate** la **Redare**. Setarea istoriei (cumulativă, fereastră, durată de viață) rămâne cum este: o randare trebuie să fie chiar lucrul pe care îl priveai, redat și scris.
4. Pentru fiecare cadru de ieșire *f* din *n*, la *u* = f / (n - 1):
   - pune camera în poziția traseului la *u* (dacă există chei);
   - mută capul de redare la aceeași fracțiune *u* din intervalul cronologiei (durata sesiunii selectate în reluarea în cuburi);
   - forțează o estimare nouă, chiar dacă camera nu s-a mișcat - moștenirea acumulării cadrului precedent ar lăsa o fantomă a ferestrei precedente;
   - așteaptă, cadru cu cadru, până când imaginea este exactă (toate rândurile candidate desenate într-un singur cadru, sau acumularea completă), până la limita de așteptare;
   - captează cadrul compus și îl codează, cu un cadru cheie la fiecare 2 secunde de ieșire, ca fișierul să poată fi derulat.
5. Îmbină cadrele într-un fișier WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)), cu timestamp-uri alese din rata de cadre - timpul de ceas pe care l-a luat fiecare cadru nu contează.
6. Restabilește bugetul, câmpul vizual, modul cronologiei, capul de redare și dacă rula sau nu.
7. Descarcă videoclipul ca `3dheat-<width>x<height>-<frames>f.webm` și raportează `N cadre la W×H, X MB - fiecare cadru exact`, sau câte au atins limita de așteptare.

**Anulează** oprește după cadrul curent (*Randare anulată.*) și restabilește setările.
