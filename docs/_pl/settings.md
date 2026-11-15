---
title: "Ustawienia, jednostki i klawisze"
nav_order: 16
lang: "pl"
source: "settings.md"
source_hash: "f25e4cbaf3bb"
translated: true
outdated: false
---

# Ustawienia, jednostki i klawisze

Małe przyciski u góry paska bocznego zmieniają sposób, w jaki przeglądarka się z tobą komunikuje: język, jednostki (metry lub stopy, km/h lub węzły) oraz tryb pomocy, który objaśnia kolory. Twoje wybory są zapamiętywane w przeglądarce.

## Nagłówek {#the-header}

U góry paska bocznego:

| Sterowanie | Co robi |
|---|---|
| **?** | Tryb pomocy: co znaczy każdy kolor (także `?` albo `F1`) |
| Menu **Jednostki** | Metryczne, Imperialne, Lotnicze albo Morskie |
| Przycisk **...** obok **Jednostki** | Otwiera „Wybierz jednostkę dla każdej wielkości”: jedna lista rozwijana dla każdej wielkości |
| Menu **Język** | Język przeglądarki: [40 języków](languages.md) albo język przeglądarki |

![Nagłówek z menu Jednostki i otwartym oknem jednostek dla każdej wielkości](../assets/img/pl/settings-units.webp)

Liczby, które wpisujesz w polu, mogą mieć kropkę albo przecinek (`0.35` albo `0,35`). Przeglądarka czyta oba i pokazuje liczby tak, jak zapisuje je język przeglądarki.

## Jednostki {#units}

1. Wybierz zestaw w menu **Jednostki**. Wszystkie wielkości przełączają się razem.
2. Aby zmienić tylko jedną wielkość, kliknij przycisk **...** obok niej i wybierz dla niej jednostkę. Menu pokaże wtedy `*` za zestawem.
3. Wielkość, której nie ustawiłeś, podąża za zestawem. Wybierz „Jak w zestawie”, aby wrócić.

| Wielkość | Metryczne (domyślne) | Imperialne | Lotnicze | Morskie |
|---|---|---|---|---|
| Odległość | km | mi | NM | NM |
| Wysokość, długość | m | ft | ft | m |
| Prędkość | km/h | mph | kt | kt |
| Prędkość pionowa | m/s | ft/min | ft/min | m/s |
| Temperatura | °C | °F | °C | °C |
| Ciśnienie | hPa | inHg | hPa | hPa |
| Masa, paliwo | kg, l | lb, gal | lb, gal | t, m³ |
| Kąt | stopnie | stopnie | stopnie | stopnie |

Inne jednostki, które możesz wybrać dla jednej wielkości: odległość km, mi, NM; prędkość km/h, m/s, kt, mph; prędkość pionowa m/s, ft/min, m/min; temperatura °C, °F, K; ciśnienie hPa, inHg, mmHg, psi; masa kg, lb, t; kąt stopnie albo mile NATO (6400 na okrąg). Jednostki są takie same wszędzie w przeglądarce: w etykietach, kartach, wykresach i statystykach.

## Tryb pomocy {#help-mode}

![Tryb pomocy: co znaczą kolory](../assets/img/pl/help.webp)

Naciśnij `?` albo `F1`, albo kliknij przycisk **?**. Pokazuje on *Co oznaczają kolory*: legendy widoku 3D, gradienty ciepła, kolory drużyn, kolory poziomu, kolory statusu paneli, panel meczu i widok wyścigu. Działa, dopóki go nie wyłączysz. W karcie Mecz objaśnia także kolory panelu meczu.

![Tryb pomocy w karcie Mecz](../assets/img/pl/settings-help-match.webp)

## Co przeglądarka pamięta {#what-the-browser-remembers}

Te ustawienia są zapisywane w przeglądarce między wizytami (nic nie jest nigdzie wysyłane):

- język, jednostki i tryb pomocy;
- ustawienia figury, symbolu, etykiety, kamery i wyświetlania taktycznego powtórki;
- prędkość odtwarzania i odbicie lustrzane;
- zakładki dla każdego nagrania, woluminy dla każdego zbioru danych, warstwy celów;
- zewnętrzne ustawienia SI (klucz tylko wtedy, gdy zaznaczysz *Zapamiętaj*).

Ustawienia ciepła, filtry i tryb zaczynają się od nowa przy każdym załadowaniu. Pełna, wygenerowana lista: [Zapisane ustawienia](ref-settings-storage.md).

## Klawisze, które przeglądarka zostawia dla siebie {#keys-the-viewer-keeps-from-the-browser}

Sesja z dużymi danymi wymaga czasu na wczytanie, więc przeglądarka nie pozwala, by przeglądarka wyrzuciła ją przez przypadek:

- `Ctrl`/`Cmd` + litery, które drukowałyby, zapisywały, otwierały, przeładowywały, zamykały lub otwierały nowe okna, nic nie robią poza polami tekstowymi; `F1`, `F3`, `F5`, `F6` i `F7` nic nie robią.
- Zamknięcie albo przeładowanie karty z załadowanymi danymi lub poziomem najpierw pyta.
- Na pełnym ekranie przeglądarka blokuje klawisze, których używa (W, T, N, S, R, P, Q, Esc), aby przeglądarka ich nie przejęła.

Dokładna lista: [Klawisze przeglądarki](ref-browser-keys.md). Wszystkie własne klawisze przeglądarki: [Klawiatura i mysz](keyboard-reference.md).
