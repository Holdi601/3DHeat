---
title: "Referință pentru tastatură și mouse"
parent: "Camera și comenzile"
nav_order: 2
lang: "ro"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Referință pentru tastatură și mouse

Fiecare tastă și fiecare acțiune de mouse, într-un singur loc, ca să găsești cea de care ai nevoie. Dă clic întâi pe vedere, ca să aibă tastatura. Tastele sunt ignorate cât timp o casetă de text sau o listă derulantă are focusul. Versiunea scurtă este afișată și în colțul din stânga jos al vederii.

Căutare rapidă:

| Vreau să ... | Apasă |
|---|---|
| zbor | `W A S D`, trage pentru a privi |
| văd tot | `F` |
| redau sau pun pe pauză | `K` |
| redau înapoi | `J` (apasă din nou pentru pauză), înainte `L` |
| văd ce înseamnă culorile | `?` sau `F1` |
| anulez în fila Tactici | `Ctrl+Z` |

## Cameră {#camera}

Din [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Intrare | Efect |
|---|---|
| `W` / `↑` | Înainte, pe direcția de vizualizare |
| `S` / `↓` | Înapoi |
| `A` / `←` | Lateral, la stânga |
| `D` / `→` | Lateral, la dreapta |
| `Space` / `E` | În sus |
| `Q` / `Ctrl` stânga | În jos |
| `Shift` (oricare) | Ține apăsat: viteză de 6× |
| `Alt` stânga | Ține apăsat: 15% din viteză |
| Trageți cu butonul stâng sau drept pe vedere | Privire (indicatorul este blocat cât timp butonul este apăsat) |
| Rotița (perspectivă) | Viteza de zbor ×1,5 pe fiecare clic (cel mult 4 clicuri la un eveniment al rotiței) |
| Rotița (paralel) | Zoom |
| Clic dreapta | Nu deschide niciun meniu contextual peste vedere |

## Global {#global}

Din [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tastă | Efect |
|---|---|
| `K` | Redă / pune pe pauză [cronologia](timeline.md) |
| `F` | Încadrează datele |
| `C` | Copiază poziția camerei, yaw-ul și pitch-ul ([citirea camerei](camera.md#camera-readout)) |
| `G` | Mergi la un punct scris: deschide caseta de sub citirea camerei |
| `Esc` | Închide cartonașul de selecție; apoi nu mai privi a doua unitate; apoi nu mai urmări o unitate |
| `T` | Aspectul afișajului tactic pornit sau oprit ([Reluarea meciului](match-replay.md#display-style)) |
| `?` / `F1` | Modul de ajutor: ce înseamnă culorile ([Setări, unități și taste](settings.md#help-mode)) |
| `1` | [Căldură](heat.md) |
| `2` | [Diferență](difference.md) |
| `3` | [Căldura pe echipe](team-heat.md) |
| `4` | [Linii](line-heat.md) |
| `]` | Limita de eliminare îndepărtată iese ×1,12 (`Shift`: ×1,35) |
| `[` | Limita de eliminare îndepărtată intră ÷1,12 (`Shift`: ÷1,35) |
| `\` | Limita de eliminare îndepărtată oprită / pornită din nou acolo unde a fost ([Adâncime și eliminarea fețelor](depth-and-culling.md#keyboard)) |

Modul **Figuri suprapuse** nu are tastă cu număr; alege-l din bara de moduri sau deschide fila Meci. Tastele cu numere trec prin aceeași verificare ca bara de moduri: o tastă pentru un mod pe care bara îl arată ca indisponibil pentru datele încărcate nu face nimic.

## Reluarea meciului {#match-replay}

În modul Figuri suprapuse, folosit de fila Meci ([Reluarea meciului](match-replay.md)). Funcționează fie când o unitate este urmărită, fie când nu, cu excepțiile notate:

| Tastă | Efect |
|---|---|
| `B` | Adaugă un semn de carte: momentul și camera |
| `M` | Harta 2D: colț, vedere întreagă, oprită |
| `V` / `Shift+V` | Următoarea / precedenta vedere a camerei asupra unității urmărite |
| `H` | Afișaj cu proiecție frontală în vederile din carlingă și padlock |
| `Page Down` / `Page Up` | Următorul / precedentul eveniment din tipurile arătate de lista de evenimente |
| `J` | Redă înapoi; din nou, pentru pauză |
| `L` | Redă înainte; din nou, pentru pauză |
| `.` / `,` | O secundă înainte / înapoi, pe pauză (`Shift`: zece secunde) |
| `Esc` | Nu mai privi ținta întâi, apoi nu mai urmări |
| `Ctrl`+clic sau `Alt`+clic pe o unitate (în vedere sau în lista de unități) | Privește-o din unitatea urmărită (vederea cu două unități); dă clic din nou ca s-o lași |
| `Shift`+clic pe două unități | Măsoară între ele: direcție, distanță, diferență de înălțime |

`V` are nevoie de o unitate urmărită. Aici `M` este harta 2D, iar în fila Tactici înseamnă „mută”.

## Urmărirea unei unități {#following-a-unit}

Cât timp camera urmărește o unitate, rotița și tastele de zbor se mișcă în jurul unității, în loc să zboare liber ([Camera](camera.md#while-following-a-unit)):

| Intrare | Efect |
|---|---|
| Rotița, `W` / `S` | Mai aproape / mai departe (mai sus / mai jos în vederea satelit). Nu în vederile din carlingă și padlock. |
| `A` / `D`, `Q` / `E` | Orbitează în jurul unității (vederile din spate și orbitală) |
| Tragere | Privește în jurul unității; în carlingă, privește în interior |
| `V` / `Shift+V` | Următoarea / precedenta vedere a camerei |
| `H` | Afișaj cu proiecție frontală (vederile din carlingă și padlock) |
| `Esc` | Nu mai privi a doua unitate, apoi nu mai urmări |

## Tabla de tactici {#tactics-board}

În fila Tactici ([Tabla de tactici](tactics-board.md)). `F`, `C`, `G` și `T` funcționează ca mai sus; tastele cu numere nu fac nimic.

| Tastă | Efect |
|---|---|
| `Ctrl+Z` | Anulează |
| `Ctrl+Y` sau `Ctrl+Shift+Z` | Refă |
| `Enter` | Încheie săgeata desenată (un dublu clic sau un clic dreapta face același lucru) |
| `Esc` | Anulează o tragere; altfel, lasă săgeata sau mutarea în curs; altfel, deselectează |
| `Delete` sau `Backspace` | Șterge selecția |
| `W` / `E` / `R` | Gizmo Mută / Rotește / Scalează pentru selecție (schema de taste **W / E / R**) |
| `G` / `R` / `S` | Gizmo Mută / Rotește / Scalează pentru selecție (schema de taste **G / R / S**) |
| `R` | Fără nimic selectat: rotește cu 15° următoarea figură de plasat. `Shift+R` o rotește înapoi. |
| `M` | Cu o figură selectată: o mută la următorul clic |
| `K` | Redă sau pune pe pauză planul |
| Shift+clic | Adaugă sau scoate din selecție |
| Shift+tragere | Desenează o casetă în jurul celor de selectat |
| `Ctrl` în timp ce tragi de un mâner | Se fixează pe grilă sau pe pasul unghiular |

Tastele gizmo funcționează doar cât timp ceva este selectat; fără nimic selectat, `W A S D` zboară cu camera ca de obicei.

## Alegerea cu clic {#click-to-pick}

Cu **Clicul arată ce se află acolo** pornit și rigla oprită ([Alegerea cu clic](camera.md#click-to-pick)):

| Intrare | Efect |
|---|---|
| Clic stânga (fără a trage mai mult de 4 px) | Arată punctul de date sau, altfel, locul de pe nivel de sub indicator |

## Măsură {#measure}

Cu **Riglă activă** ([Măsură](measure.md)):

| Intrare | Efect |
|---|---|
| Clic stânga (fără a trage mai mult de 4 px) | Lasă un punct |
| Clic dreapta | Șterge ultimul punct |

## În altă parte {#elsewhere}

| Unde | Intrare | Efect |
|---|---|---|
| Mânerul oricărui cursor (butonul de lângă număr) | Trage în sus / jos | Schimbă valoarea continuu, cu atât mai repede cu cât tragi mai departe; ține apăsat `Shift` pentru reglaj fin. Eliberează ca să oprești. |
| Afișajul vitezei peste vedere | Trage în sus / jos | Schimbă viteza de zbor în același fel. |
| Casetele de poziție | `Enter` | Aplică poziția sau orientarea scrisă. |
| Editorul de curbe | Dublu clic / Alt-clic / clic dreapta | Adaugă un punct / șterge un punct ([Forma sprite-ului](sprite-shape.md#the-curve-editor)). |

## Fila Analiza cursei {#race-analysis-tab}

În fila Analiza cursei, `K` redă și pune pe pauză reluarea cursei, `Home` o derulează înapoi, iar tastele cu numere nu fac nimic. Vezi [Analiza cursei](race-analysis.md).

## Tastele pe care vizualizatorul le păstrează din browser {#keys-the-viewer-keeps-from-the-browser}

Unele scurtături ale browserului ar închide sau reîncărca pagina și ar pierde o sesiune încărcată; vizualizatorul le păstrează pentru sine. Lista este generată din cod: [Taste ale browserului](ref-browser-keys.md).

## Gamepad {#gamepad}

Vezi [Gamepad și HOTAS](gamepad.md).
