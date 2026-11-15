---
title: "Pad i HOTAS"
parent: "Kamera i sterowanie"
nav_order: 1
lang: "pl"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Pad i HOTAS

Kamerę możesz sterować kontrolerem w stylu Xbox zamiast klawiatury. Użyj go, gdy chcesz odchylić się do tyłu i rozejrzeć po dużej scenie. Jego wejście **dodaje się** do klawiatury, więc możesz użyć obu naraz.

## Podłącz kontroler {#connect-a-controller}

1. Podłącz kontroler (albo sparuj go).
2. Kliknij widok i naciśnij dowolny przycisk na kontrolerze. Przeglądarki pokazują kontroler dopiero po jego pierwszym sygnale.
3. Otwórz **Kamera i scena → Gamepad**. Lista urządzeń pokaże go znakiem `●`.
4. Popchnij lewą gałkę, aby lecieć, a prawą, aby się rozglądać. Jeśli kamera dryfuje przy wyśrodkowanych gałkach, podnieś **Martwa strefa**.

Działa każde urządzenie, które przeglądarka odwzorowuje na standardowy układ pada. Drążek lotniczy albo przepustnica (HOTAS) są domyślnie ignorowane; zobacz niżej.

## Odwzorowanie {#mapping}

| Sterowanie | Efekt |
|---|---|
| Lewa gałka | Ruch: przód/tył i przesuw na boki |
| Prawa gałka | Rozglądanie: odchylenie i pochylenie, z prędkością *Prędkość rozglądania* stopni na sekundę przy pełnym wychyleniu |
| `RT` / `LT` (analogowe) | W górę / w dół; w rzucie równoległym przybliżanie / oddalanie |
| `RB` (przytrzymany) | 6× szybciej |
| `LB` (przytrzymany) | 15% prędkości |
| `A` (przytrzymany) | Sprint 3× (łączy się z RB/LB) |
| `Y` (naciśnięty) | Kadruj dane |

Numery przycisków odpowiadają standardowemu układowi: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; gałki na osiach 0-1 (lewa) i 2-3 (prawa).

## Ustawienia Gamepada {#the-gamepad-settings}

W **Kamera i scena → Gamepad**. **Ustawienia** / **Ukryj** otwiera lub zamyka sterowanie strojeniem.

| Sterowanie | Domyślnie | Zakres (pokrętło) | Znaczenie |
|---|---|---|---|
| **Włączony** | włączone | | |
| Stan urządzeń | | | Każde podłączone urządzenie: `●`, gdy jest śledzone, `○`, gdy nie; dla urządzeń niestandardowych *– nie jest padem XInput, pomijany* albo *– nie jest padem XInput, używany mimo to*. Gdy nie ma żadnego: *Nie wykryto pada. Przeglądarki pokazują kontroler dopiero po jego pierwszym sygnale – naciśnij na nim dowolny przycisk.* |
| **Używaj urządzenia** | *Tylko pady XInput (zalecane)* | | Pokazywane, gdy podłączone jest urządzenie niestandardowe. Wybierz urządzenie po nazwie, aby zamiast tego je śledzić. |
| **Prędkość rozglądania** | 150°/s | 20-540 (5000) | Szybkość obrotu przy pełnym wychyleniu prawej gałki. |
| **Martwa strefa** | 12% | 0-50% (95%) | Promieniowa: ukośne wychylenie nigdy nie przecieka do jednej osi. Podnieś ją, jeśli kamera dryfuje przy wyśrodkowanych gałkach. |
| **Krzywa gałki** | x² | liniowa (1) do x⁴ (16) | Wykładnik reakcji po martwej strefie: dokładniejsza kontrola blisko środka, nadal pełna prędkość przy krawędzi. |
| **Odwróć Y gałki** | wyłączone | | |
| **Zamień gałki** | wyłączone | | Ruch na prawej gałce, rozglądanie na lewej. |

Kształtowanie gałki: przy wychyleniu *m* (długość wektora gałki) i martwej strefie *d* wynik = ((m - d) / (1 - d)) ^ krzywa wzdłuż kierunku gałki, a 0 wewnątrz martwej strefy.

## Dlaczego domyślnie tylko standardowe pady {#why-only-standard-pads-by-default}

Interfejs Gamepad API zgłasza **każde** urządzenie HID z osiami - drążki lotnicze, przepustnice, pedały, kierownice - a te nie wracają do środka: oś skrętu albo dźwignia przepustnicy stoi w pełnym wychyleniu, gdy nikt jej nie dotyka. Odczytane jak gałka, dają stały wejściowy sygnał pełnej prędkości, którego żadna martwa strefa nie stłumi; kamera kręci się sama od chwili załadowania strony (a każdy tryb ciepła też wygląda na zepsuty, bo ruchoma kamera co klatkę zaczyna akumulację od nowa).

Dlatego urządzenie jest śledzone tylko wtedy, gdy przeglądarka zgłasza `mapping: "standard"` - to jej sposób powiedzenia „pad w stylu XInput z osiami tam, gdzie się ich spodziewasz”. Inne urządzenia są wymienione i oznaczone jako pomijane, a **Używaj urządzenia** pozwala wybrać jedno jawnie - na przykład do sterowania kamerą przez HOTAS. Gdy pad jest śledzony, kamera zostaje przy nim, więc dwa kontrolery nie walczą o kamerę w zależności od kolejności wyliczania.

**HOTAS:** odczytywane są tylko osie 0-3 (dwie gałki) i standardowe przyciski. Przepustnica albo pedały na innych osiach nic nie robią, a drążek lub przepustnica, których osie nie wracają do środka, mogą wymagać większej **Martwej strefy**.

Przeglądarki ukrywają kontroler, dopóki nie wyśle pierwszego sygnału, więc podłączony, ale nieruszany pad dla strony jeszcze nie istnieje.
