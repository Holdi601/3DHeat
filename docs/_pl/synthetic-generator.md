---
title: "Generator syntetyczny"
parent: "Wczytywanie danych"
nav_order: 5
lang: "pl"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Generator syntetyczny

Nie masz własnych danych? Naciśnij jeden przycisk, a 3DHeat wymyśli dla ciebie udawaną bitwę, tak małą lub tak dużą, jak chcesz.

1. Otwórz panel **Zbiór danych** w pasku bocznym Mapy cieplnej (poniżej **Źródło**).
2. Przewiń do **Generator syntetyczny**.
3. Ustaw **Wiersze (w milionach)**. Spróbuj najpierw 1: domyślne 8 milionów jest ciężkie przy pierwszej próbie.
4. Naciśnij **Generuj**.

![1 milion wierszy, 8 drużyn, narysowane w Cieple drużyn](../assets/img/en/synthetic-generator-team-heat.webp)

Panel **Zbiór danych** może wygenerować zbiór danych zamiast go wczytywać. Służy do dwóch rzeczy: wypróbowania przeglądarki bez własnych danych oraz sprawdzenia, czy dana liczba wierszy, promień sprite'a i budżet dają użyteczną szybkość klatek na komputerze, *zanim* wczytasz na niego duże prawdziwe dane. Jego ruch ma kształt meczu battle royale - drużyny startują osobno, a potem są ściskane razem - bo jednolity szum wygląda dobrze przy każdym budżecie i ukrywa dokładnie te artefakty, które warto wyłapać.

## Sterowanie {#controls}

| Sterowanie | Domyślnie | Znaczenie |
|---|---|---|
| **Wiersze (w milionach)** | 8 | Wierszy do wygenerowania. Zaokrąglane w dół do całej liczby ticków dla każdego gracza. |
| **Drużyny** | 8 | Liczba grup (co najmniej 1). |
| **Na drużynę** | 12 | Graczy w grupie (co najmniej 1). |
| **Połowa rozmiaru mapy (m)** | 4000 | Połowa szerokości obszaru gry na osiach X i Z. |
| Linia szacunku | | „≈ X GB RAM, Y GB na GPU po kwantyzacji.” (około 26 bajtów RAM i 8 bajtów GPU na wiersz). |
| **Generuj** | | Generuje w procesie roboczym importu, z postępem, i zastępuje wczytany zbiór danych. |

Generowanie działa w tle, w procesie roboczym, więc dziesiątki milionów wierszy nie zamrażają strony.

## Co jest generowane {#what-it-generates}

Z [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Kolumny:** pozycja, czas, osoba (`P000`, `P001`, ...), grupa (`Team 1`, `Team 2`, ...), odchylenie w bok (yaw) i pochylenie oraz czasy życia. Bez kolumny sesji i bez kolumn filtrów.
- **Czas:** jedna próbka na gracza co 0,25 s, od 0 (czas względny, bez zegara ściennego).
- **Ruch:** każda drużyna startuje we własnym wycinku pierścienia na 55-95% połowy rozmiaru mapy. Bezpieczny okrąg, wyśrodkowany blisko środka (przesunięty losowo o do ćwiartki połowy rozmiaru), kurczy się do 8% połowy rozmiaru w sześciu fazach z płaskowyżami; każdy gracz kieruje się ku wędrującemu punktowi wewnątrz niego, z tłumieniem i szumem. Wysokość faluje między 0 a 220 m.
- **Kierunek patrzenia:** odchylenie w bok zgodnie z kierunkiem ruchu, pochylenie z prędkości pionowej.
- **Powtarzalność:** ziarno losowości jest stałe (1337), więc te same ustawienia zawsze dają te same dane.

Każdy tryb ciepła, powtórka pudełek i ciepło linii (całe trasy, bo nie ma kolumny zdarzeń) działają na nim. Działa też historia czasu życia.
