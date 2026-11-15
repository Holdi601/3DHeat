---
title: "Biblioteka poziomów"
parent: "Poziomy i geometria tła"
nav_order: 4
lang: "pl"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Biblioteka poziomów

Biblioteka trzyma twoje poziomy w tej przeglądarce, dzięki czemu nie musisz ich ponownie wczytywać i upraszczać. **Wyczyszczenie danych witryny w przeglądarce kasuje bibliotekę, a eksportu nie ma.** Zachowaj swoje oryginalne pliki.

Przetwarzanie poziomu - analiza, klasyfikacja, scalanie wierzchołków, redukcja siatki, pakowanie tekstur - jest wolne, a wynik za każdym razem jest ten sam. **Biblioteka** na dole panelu Tło / poziom trzyma przetworzone poziomy w tej przeglądarce, więc uproszczona siatka nigdy nie jest budowana dwa razy ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Zapisz poziom i wczytaj go ponownie {#save-and-reload-a-level}

1. Wczytaj obraz mapy albo model 3D i sprawdź, czy wygląda dobrze.
2. Naciśnij **Zapisz w bibliotece**. Panel napisze *Zapisano. Następnym razem wczyta się od razu.*
3. Następnym razem otwórz listę **Biblioteka** i naciśnij ▸ przy poziomie.
4. Naciśnij ✕, aby usunąć wpis, którego już nie potrzebujesz.

## Korzystanie z niej {#using-it}

| Sterowanie | Efekt |
|---|---|
| **Zapisz w bibliotece** | Zapisuje bieżący poziom. Obraz mapy jest zapisywany jako PNG z jego dwoma punktami kotwiczenia; model jako przetworzone bufory. Panel pisze *Zapisano. Następnym razem wczyta się od razu.* |
| Lista biblioteki | Jeden wiersz na zapisany poziom: nazwa (z zapisanym rozmiarem po najechaniu), trójkąty dla modelu albo szerokość w pikselach dla obrazu. |
| ▸ (*Wczytaj*) | Wczytuje wpis jako bieżący poziom. |
| ✕ (*Usuń*) | Usuwa wpis. |
| Wiersz zużycia | `Używane X z Y.` - szacunek pamięci przeglądarki dla tej witryny. |

Gdy nic nie jest zapisane, lista pisze *Pusto. Wczytaj mapę lub model, a potem „Zapisz w bibliotece”.*

## Co jest zapisywane {#what-is-stored}

| Rodzaj | Zapisane | Niezapisane |
|---|---|---|
| Obraz mapy | Obraz (PNG), jego rozmiar, punkty kotwiczenia | Wysokość, odbicie, przezroczystość, jasność, odbarwienie - przywracane do domyślnych (wysokość = najniższe Y bieżącego zbioru danych, odbicie włączone) |
| Poziom 3D | Wierzchołki, kolory wierzchołków, współrzędne tekstur, ich kafelki i atlas tekstur, trójkąty podłoża / konstrukcji / wody, krawędzie konstrukcji, liczby trójkątów | Nazwy części i powody klasyfikacji oraz wszystkie ustawienia wyglądu - przywracane do domyślnych świeżego importu |

Model wczytany z biblioteki nie ma listy części, a jego granice i pasmo wysokości podłoża są wyliczane na nowo z wierzchołków.

## Gdzie leży {#where-it-lives}

W IndexedDB przeglądarki, baza `3dheat`, magazyn obiektów `levels`, dla źródła strony (adres na pasku adresu przeglądarki). Jest lokalna dla tego profilu przeglądarki: inna przeglądarka, inny profil albo inny adres (na przykład `localhost` zamiast `127.0.0.1`) widzi inną, pustą bibliotekę. Wyczyszczenie danych witryny w przeglądarce ją kasuje. Wpisy zapisane przez starsze wersje bez konstrukcji, kolorów czy wody nadal się wczytują.
