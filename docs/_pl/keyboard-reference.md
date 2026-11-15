---
title: "Klawiatura i mysz"
parent: "Kamera i sterowanie"
nav_order: 2
lang: "pl"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Klawiatura i mysz

Wszystkie klawisze i działania myszy w jednym miejscu, żebyś znalazł ten, którego potrzebujesz. Najpierw kliknij widok, by miał klawiaturę. Klawisze są ignorowane, gdy aktywne jest pole tekstowe albo lista rozwijana. Krótka wersja jest też wypisana w lewym dolnym rogu widoku.

Szybkie wyszukiwanie:

| Chcę ... | Naciśnij |
|---|---|
| latać | `W A S D`, przeciągnij, by się rozejrzeć |
| zobaczyć wszystko | `F` |
| odtworzyć albo wstrzymać | `K` |
| odtwarzać wstecz | `J` (naciśnij ponownie, by wstrzymać), w przód `L` |
| zobaczyć, co znaczą kolory | `?` albo `F1` |
| cofnąć w karcie Tablica taktyczna | `Ctrl+Z` |

## Kamera {#camera}

Z [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Wejście | Działanie |
|---|---|
| `W` / `↑` | Do przodu w kierunku widoku |
| `S` / `↓` | Do tyłu |
| `A` / `←` | W bok w lewo |
| `D` / `→` | W bok w prawo |
| `Space` / `E` | W górę |
| `Q` / lewy `Ctrl` | W dół |
| `Shift` (dowolny) | Przytrzymaj: 6× szybciej |
| lewy `Alt` | Przytrzymaj: 15% prędkości |
| Lewy albo prawy przeciąg po widoku | Rozglądanie się (wskaźnik zablokowany, gdy przycisk jest wciśnięty) |
| Kółko (perspektywa) | Prędkość lotu ×1,5 na jedno kliknięcie (najwyżej 4 kliknięcia na jedno zdarzenie kółka) |
| Kółko (równoległy) | Zoom |
| Prawy przycisk | Nad widokiem nie otwiera się menu kontekstowe |

## Globalne {#global}

Z [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Klawisz | Działanie |
|---|---|
| `K` | Odtwórz / wstrzymaj [oś czasu](timeline.md) |
| `F` | Dopasuj widok do danych |
| `C` | Skopiuj położenie kamery, odchylenie w poziomie i pochylenie ([odczyt kamery](camera.md#camera-readout)) |
| `G` | Przejdź do wpisanego punktu: otwiera pole pod odczytem kamery |
| `Esc` | Zamknij kartę wyboru; potem przestań patrzeć na drugą jednostkę; potem przestań śledzić jednostkę |
| `T` | Wygląd wyświetlacza taktycznego włączony albo wyłączony ([Powtórka meczu](match-replay.md#display-style)) |
| `?` / `F1` | Tryb pomocy: co znaczą kolory ([Ustawienia, jednostki i klawisze](settings.md#help-mode)) |
| `1` | [Ciepło](heat.md) |
| `2` | [Różnica](difference.md) |
| `3` | [Ciepło drużyn](team-heat.md) |
| `4` | [Linie](line-heat.md) |
| `]` | Dalsza granica odcinania na zewnątrz ×1,12 (`Shift`: ×1,35) |
| `[` | Dalsza granica odcinania do środka ÷1,12 (`Shift`: ÷1,35) |
| `\` | Dalsza granica odcinania wyłączona / z powrotem włączona tam, gdzie była ([Głębia i odrzucanie](depth-and-culling.md#keyboard)) |

Tryb **Nałożone figury** nie ma klawisza z cyfrą; wybierz go na pasku trybów albo otwórz kartę Mecz. Klawisze cyfr działają tak samo jak pasek trybów: klawisz trybu, który pasek pokazuje jako niedostępny dla wczytanych danych, nic nie robi.

## Powtórka meczu {#match-replay}

W trybie Nałożone figury, którego używa karta Mecz ([Powtórka meczu](match-replay.md)). Działają, gdy jednostka jest śledzona albo nie, za wyjątkiem miejsc, gdzie to zaznaczono:

| Klawisz | Działanie |
|---|---|
| `B` | Dodaj zakładkę: chwilę i kamerę |
| `M` | Mapa 2D: w rogu, na całym widoku, wyłączona |
| `V` / `Shift+V` | Następny / poprzedni widok kamery śledzonej jednostki |
| `H` | Wyświetlacz head-up w widokach kokpitu i padlock |
| `Page Down` / `Page Up` | Następne / poprzednie zdarzenie z rodzajów, które pokazuje lista zdarzeń |
| `J` | Odtwarzaj wstecz; ponownie, by wstrzymać |
| `L` | Odtwarzaj do przodu; ponownie, by wstrzymać |
| `.` / `,` | Sekunda do przodu / do tyłu, przy wstrzymaniu (`Shift`: dziesięć sekund) |
| `Esc` | Najpierw przestań patrzeć na cel, potem przestań śledzić |
| `Ctrl`+kliknięcie albo `Alt`+kliknięcie jednostki (w widoku albo na liście jednostek) | Patrz na nią z pozycji śledzonej jednostki (widok dwóch jednostek); kliknij ponownie, by ją odrzucić |
| `Shift`+kliknięcie dwóch jednostek | Miara między nimi: kierunek, odległość, różnica wysokości |

`V` wymaga śledzonej jednostki. `M` to tutaj Mapa 2D, a w Tablicy taktycznej oznacza „przesuń”.

## Śledzenie jednostki {#following-a-unit}

Gdy kamera śledzi jednostkę, kółko i klawisze lotu prowadzą wokół jednostki, zamiast lecieć swobodnie ([Kamera](camera.md#while-following-a-unit)):

| Wejście | Działanie |
|---|---|
| Kółko, `W` / `S` | Bliżej / dalej (wyżej / niżej w widoku satelity). Nie w widokach kokpitu i padlock. |
| `A` / `D`, `Q` / `E` | Orbita wokół jednostki (widoki pościgu i orbity) |
| Przeciąganie | Rozglądanie się wokół jednostki; w kokpicie rozglądanie się wewnątrz |
| `V` / `Shift+V` | Następny / poprzedni widok kamery |
| `H` | Wyświetlacz head-up (widoki kokpitu i padlock) |
| `Esc` | Przestań patrzeć na drugą jednostkę, potem przestań śledzić |

## Tablica taktyczna {#tactics-board}

W karcie Tablica taktyczna ([Tablica taktyczna](tactics-board.md)). `F`, `C`, `G` i `T` działają jak wyżej; klawisze cyfr nic nie robią.

| Klawisz | Działanie |
|---|---|
| `Ctrl+Z` | Cofnij |
| `Ctrl+Y` albo `Ctrl+Shift+Z` | Ponów |
| `Enter` | Zakończ rysowaną strzałkę (podwójne kliknięcie albo prawy przycisk robi to samo) |
| `Esc` | Anuluj przeciąganie; w przeciwnym razie usuń strzałkę albo trwające przesunięcie; w przeciwnym razie odznacz |
| `Delete` albo `Backspace` | Usuń zaznaczenie |
| `W` / `E` / `R` | Uchwyt Przesuń / Obróć / Skaluj dla zaznaczenia (schemat klawiszy **W / E / R**) |
| `G` / `R` / `S` | Uchwyt Przesuń / Obróć / Skaluj dla zaznaczenia (schemat klawiszy **G / R / S**) |
| `R` | Gdy nic nie jest zaznaczone: obróć następną figurę do ustawienia o 15°. `Shift+R` obraca ją z powrotem. |
| `M` | Gdy figura jest zaznaczona: przesuń ją do następnego kliknięcia |
| `K` | Odtwórz albo wstrzymaj plan |
| Shift+kliknięcie | Dodaj do zaznaczenia albo usuń z niego |
| Shift+przeciąganie | Narysuj prostokąt wokół tego, co zaznaczyć |
| `Ctrl` podczas przeciągania uchwytu | Przyciągnij do siatki albo do kroku kąta |

Klawisze uchwytu działają tylko wtedy, gdy coś jest zaznaczone. Gdy nic nie jest zaznaczone, `W A S D` lecą kamerą jak zwykle.

## Wskazywanie kliknięciem {#click-to-pick}

Gdy **Kliknięcie pokazuje, co tam jest** jest włączone, a linijka wyłączona ([Wskazywanie kliknięciem](camera.md#click-to-pick)):

| Wejście | Działanie |
|---|---|
| Lewy przycisk (bez przeciągnięcia więcej niż 4 px) | Pokaż punkt danych albo miejsce na poziomie pod wskaźnikiem |

## Miara {#measure}

Gdy **Linijka aktywna** ([Miara](measure.md)):

| Wejście | Działanie |
|---|---|
| Lewy przycisk (bez przeciągnięcia więcej niż 4 px) | Postaw punkt |
| Prawy przycisk | Usuń ostatni punkt |

## Gdzie indziej {#elsewhere}

| Miejsce | Wejście | Działanie |
|---|---|---|
| Uchwyt dowolnego suwaka (chwyt obok liczby) | Przeciągnij w górę / w dół | Zmienia wartość płynnie, tym szybciej, im dalej przeciągniesz; przytrzymaj `Shift` dla precyzji. Puść, by się zatrzymać. |
| Wskaźnik prędkości nad widokiem | Przeciągnij w górę / w dół | Zmienia prędkość lotu w ten sam sposób. |
| Pola pozycji | `Enter` | Zastosuj wpisane położenie albo orientację. |
| Edytor krzywej | Podwójne kliknięcie / Alt+kliknięcie / prawy przycisk | Dodaj punkt / usuń punkt ([Kształt sprite'a](sprite-shape.md#the-curve-editor)). |

## Karta Analiza wyścigowa {#race-analysis-tab}

W karcie Analiza wyścigowa `K` odtwarza i wstrzymuje powtórkę wyścigu, `Home` ją przewija na początek, a klawisze cyfr nic nie robią. Zob. [Analiza wyścigowa](race-analysis.md).

## Klawisze, które przeglądarka zostawia przeglądarce {#keys-the-viewer-keeps-from-the-browser}

Niektóre skróty przeglądarki zamknęłyby albo przeładowały stronę i zgubiły wczytaną sesję; widok zachowuje je dla siebie. Lista jest generowana z kodu: [Klawisze przeglądarki](ref-browser-keys.md).

## Pad do gier {#gamepad}

Zob. [Pad do gier i HOTAS](gamepad.md).
