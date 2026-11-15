---
title: "Panel wydajności i statystyki"
parent: "Wnętrze renderowania"
nav_order: 7
lang: "pl"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Panel wydajności i statystyki

Pole w prawym górnym rogu widoku pokazuje, jak mocno pracuje przeglądarka: ile klatek na sekundę, ile kropek rysuje i czy wciąż dopracowuje obraz. Panel **Wydajność** pozwala wymienić jakość obrazu na szybkość.

## Nakładka statystyk {#the-stats-overlay}

Pole w prawym górnym rogu widoku, w kartach Mapa cieplna i Mecz ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Odczytuje na żywo dane silnika przy każdej klatce animacji.

![Nakładka statystyk na scenie wielu meczów, z ponumerowanymi opisami: 1 Backend, 2 FPS, 3 Frame, 4 Rows in window, 5 Sprites / frame, 6 Budget, 7 Heat res, 8 Coverage](../assets/img/en/performance-stats-overlay.webp)

| Wiersz | Znaczenie |
|---|---|
| **Backend** | *WebGPU* albo *WebGL2*. Po najechaniu widać, dlaczego nie użyto WebGPU, jeśli nie zostało użyte. Zobacz [Dwa silniki](backends.md). |
| **FPS** | Klatki na sekundę, uśrednione z co najmniej 0,4 s. |
| **Klatka** | Czas klatki w ms, wygładzony (90% poprzedniej wartości, 10% nowej). To czas między klatkami, a nie czas GPU - czas poszczególnych przebiegów GPU nie jest mierzony. |
| **Wiersze w oknie** | Kandydujące wiersze: wiersze w bieżącym oknie czasowym, przed filtrowaniem poszczególnych wierszy w shaderze. |
| **Sprite'y / klatka** | Sprite'y, które zgłosił plan ostatniej klatki (na klatkach bezczynnych, które niczego nie rysują, zostaje zaplanowana wartość). |
| **Budget** | Budżet sprite'ów, z którym zaplanowano tę klatkę - wartość kontrolera adaptacyjnego, podniesiona do wszystkich kandydatów, gdy rysowany jest każdy wiersz. |
| **Rozdz. ciepła** | Rozdzielczość bufora ciepła jako udział płótna: ustawienie *Rozdzielczość ciepła* razy skala adaptacyjnego drugiego stopnia. |
| **Pokrycie** | Jak daleko akumulacja progresywna doszła do użycia każdego wiersza: procent podczas zbiegania (bursztynowy), *dokładnie*, gdy skończone. Zaszumiona klatka nigdy nie zostanie pomylona z gotowym obrazem. |
| **Sześciany** | Pudełka narysowane w [powtórce pudełek](box-replay.md). |
| **Nie w pamięci** | Pokazywane tylko wtedy, gdy wiersze nie zmieściły się w budżecie GPU: ile ich jest. Zobacz [Pamięć GPU](gpu-memory.md). |

## Wyświetlacz prędkości {#the-speed-display}

W prawym dolnym rogu widoku, tylko w perspektywie: prędkość lotu i czas przelotu przez dane z tą prędkością. Przeciągnij go, aby zmienić prędkość. Zobacz [Kamera](camera.md#fly-speed).

## Gdy przeglądarka jest wolna {#if-the-viewer-is-slow}

Spójrz na nakładkę statystyk, a potem:

1. **Wiersze w oknie znacznie większe niż Sprite'y / klatka, Pokrycie poniżej 100%** - klatka nie może narysować wszystkiego; przy bezruchu zbiega w kilku klatkach. Zawęź okno, filtruj albo odrzucaj, aby zmniejszyć liczbę kandydatów; albo zaakceptuj próbkowanie.
2. **Sprite'y / klatka równe Wiersze w oknie, klatka wciąż wolna** - koszt zależy od liczby sprite'ów na ekranie: obniż *Maks. promień w pikselach* ([Kształt sprite'a](sprite-shape.md#pixel-clamps)) albo *Rozdzielczość ciepła*.
3. **Wolno przy małej liczbie wierszy** - prawdopodobnie poziom: duża liczba konstrukcji z włączonymi krawędziami, trójkąty podłoża, głębia ostrości. Zobacz [Wygląd poziomu](level-appearance.md).
4. **Wszystko wolne i czerwony baner** - renderowanie programowe ([Wykrywanie renderowania programowego](software-rendering.md)).

## Panel Wydajność {#the-performance-panel}

| Sterowanie | Domyślnie | Efekt |
|---|---|---|
| Wskazówka | | Każda klatka rozpyla losowy warstwowy podzbiór widocznych wierszy, z wagą przeskalowaną tak, by wyrównać oczekiwane ciepło przy każdym budżecie; gdy widok stoi w miejscu, klatki nadal się scalają, aż każdy wiersz się przyczyni. |
| **Rysuj każdy wiersz w każdej klatce** | włączone | Każda klatka, która zaczyna nowe oszacowanie, rysuje każdy kandydujący wiersz (do około 268 mln); poniższy budżet staje się dolną granicą. [Próbkowanie i budżety](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptacyjny budżet** | włączone | Dostrajaj sprite'y na klatkę, a potem rozdzielczość ciepła, by utrzymać docelową szybkość klatek - i przestań ciąć, gdy cięcie nie pomaga. [Próbkowanie i budżety](sampling-and-budgets.md#the-adaptive-budget) |
| **Docelowe FPS** | 60 | 20-240 (1000 z uchwytem). Wartości poniżej 15 są traktowane jak 15. |
| **Początkowe sprite'y / klatka** / **Sprite'y / klatka** | 4,00 mln | 65 536-268 435 456, logarytmicznie. Nazwane *Początkowe*, gdy adaptacja jest włączona, bo kontroler je przesuwa. |
| **Rozdzielczość ciepła** | 100% | 25-100%. Koszt fragmentów rośnie z kwadratem: 50% zmniejsza pracę mieszania czterokrotnie, a pole ciepła jest na tyle gładkie, że to prawie nie widać. |
| **Stopniowe doprecyzowanie** | włączone | Akumulacja przez klatki, gdy widok stoi w miejscu. Wyłączone pokazuje co klatkę oszacowanie z jednej klatki. [Akumulacja](accumulation.md) |
| **Budżety zasobów** | wykryte | Budżety RAM, GPU i wątku parsera. [Pamięć i budżety](memory-and-budgets.md#resource-budgets) |

Żadne z tych ustawień nie jest zapisywane; ponowne załadowanie przywraca domyślne.
