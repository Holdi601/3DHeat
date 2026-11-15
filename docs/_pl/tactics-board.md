---
title: "Tablica taktyczna"
nav_order: 15
has_children: true
lang: "pl"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Tablica taktyczna

Karta **Taktyka** to tablica do rysowania planów drużyny: kładziesz małe figury na mapie, rysujesz strzałki, dokąd idą, i naciskasz odtwarzanie, by zobaczyć, jak to się dzieje. Użyj jej, by zaplanować rundę albo atak przed grą. Dzieli z innymi kartami płótno, kamerę i [poziom](levels.md) i nic więcej; plan nie jest danymi i nie rysuje żadnego ciepła.

## Twój pierwszy plan {#your-first-plan}

1. Otwórz kartę **Taktyka**. Wybierz **Gra** (na przykład Counter-Strike 2) i, dla Valoranta, naciśnij **Wczytaj mapy Valoranta** i wybierz **Mapa**. Albo najpierw wczytaj [poziom](levels.md).
2. Wybierz **Strona** (ustawia kolor) i naciśnij **Widok z góry**.
3. Wybierz **Miejsce**, wybierz figurę w **Figury** (użyj **Szukaj figur**, by ją znaleźć) i kliknij na mapie. Postaw dwie albo trzy.
4. Wybierz **Strzałka**, kliknij figurę, klikaj po drodze, którą ma iść, i naciśnij **Enter**, aby zakończyć strzałkę.
5. Naciśnij **+** pod widokiem, aby dodać krok 2. Każda figura zaczyna tam, gdzie skończyła się jej strzałka. Narysuj tam kolejne strzałki.
6. Naciśnij **▶** (albo `K`), aby odtworzyć plan od pokazywanego kroku do końca.
7. Nazwij plan w **Nazwa planu** i naciśnij **Zapisz**.

![Karta Taktyka w widoku z góry: gra, strony i narzędzia po lewej, trzy figury z strzałkami Przesuń, łuk rzutu dymnego, Obszar i kroki wzdłuż dołu](../assets/img/en/tactics.webp)

## Zaczynanie planu {#starting-a-plan}

| Pole | Co robi |
|---|---|
| **Gra** | Wybiera strony i figury, które oferuje paleta: Counter-Strike 2 (T, CT; gracze i uzbrojenie taktyczne), Valorant (Atak, Obrona; gracze i ogólne zdolności), Battlefield, Squad, Arma (piechota, pojazdy lądowe, statki powietrzne, łodzie), DCS / War Thunder / IL-2 (odrzutowce, samoloty śmigłowe, helikoptery, obrona przeciwlotnicza, ląd, okręty, uzbrojenie) oraz Inne. Plan, który już ma figury, zachowuje swoje strony, gdy zmieni się gra. |
| **Nazwa planu** | Nazwa, pod którą plan jest zapisywany. |
| **Mapa**, **Wczytaj mapy Valoranta** | Przy wybranym Valorancie: **Wczytaj mapy Valoranta** pobiera listę map z [valorant-api.com](https://valorant-api.com); **Mapa** kładzie potem minimapę wybranej mapy jako poziom, kadrowaną z góry. Obraz jest pobierany w chwili wyboru i nigdy nie jest dołączany. Zastrzeżenie Riot jest pokazywane, gdy jest na ekranie (zob. niżej). |
| **Strona** | Strona, do której należy następna figura, strzałka albo obszar; przyjmuje kolor strony. |

Bez poziomu tablica to płaska płaszczyzna gruntu. Wczytaj poziom w sekcji **Poziom**, aby planować na prawdziwej mapie: mapę CS2 wyeksportowaną narzędziem CS2, poziom z biblioteki albo obrazek mapy.

## Narzędzia {#tools}

| Narzędzie | Kliknięcie | Uwagi |
|---|---|---|
| **Zaznacz** | Figura, punkt trasy, strzałka, obszar albo notatka zaznacza ją. | Shift+kliknięcie dodaje lub usuwa; Shift+przeciągnięcie rysuje prostokąt wokół tego, co dodać. Zaznaczenie dostaje uchwyt przekształceń (zob. niżej); `Delete` albo `Backspace` usuwa. `M` przenosi zaznaczoną figurę do następnego kliknięcia. |
| **Miejsce** | Stawia wybraną figurę. | Figura jest wybierana w palecie **Figury** (z **Szukaj figur**). Gdy nic nie jest zaznaczone, `R` obraca następną figurę o 15° przed postawieniem (`Shift+R` w drugą stronę). |
| **Strzałka** | Każde kliknięcie dodaje punkt; Enter, podwójne kliknięcie albo prawy przycisk ją kończy, Esc porzuca. | **Przesuń**, **Atak** (szerszy grot) albo **Obserwacja** (cienka linia na wysokości oczu). Strzałka zaczęta na figurze jest jej trasą w tym kroku: po odtworzeniu figura po niej idzie, a następny krok zaczyna się tam, gdzie się skończyła. |
| **Rzut** | Rzucający, potem miejsce lądowania. | Przerywany łuk od jednego do drugiego, a wybrane uzbrojenie (dym, błysk, koktajl Mołotowa, ...) pojawia się tam, gdzie wylądowało, i zostaje od tego kroku w górę. |
| **Obszar** | Środek, potem krawędź. | Dysk w kolorze strony. |
| **Notatka** | Miejsce notatki; pyta o jej tekst. | Pokazywana jako pinezka, a jej tekst nad nią. |
| **Usuń** | Figurę, strzałkę, obszar albo notatkę. | Usuwa ją od tego kroku w górę; w pierwszym kroku usuwa ją całkiem. |

**Cofnij** i **Ponów** (`Ctrl+Z`; `Ctrl+Y` albo `Ctrl+Shift+Z`) przechodzą przez każdą zmianę. Linia pod planem pokazuje, ile ma figur, strzałek i kroków. **Widok z góry** patrzy prosto w dół (ortograficznie), **Widok 3D** wraca do perspektywy, **Klatka** dopasowuje plan, a gdy plan jest pusty - poziom.

**Rozmiar figur** skaluje każdą figurę na tablicy; 1× to rozmiar prawdziwy, który z dużej wysokości jest kilkoma pikselami na człowieka.

## Przesuwanie, obracanie i skalowanie {#moving-turning-and-scaling}

Wszystko na tablicy można przesuwać jak w edytorze 3D: figury, uzbrojenie, znaczniki, pojedyncze punkty trasy i całe strzałki, obszary i notatki. Zaznaczona rzecz dostaje uchwyt w swoim środku:

| Tryb | Klawisze | Uchwyty |
|---|---|---|
| **Przesuń** | W (albo G) | Strzałka na każdą oś (X czerwona, Y zielona i w górę, Z niebieska) przesuwa wzdłuż niej; kwadrat przesuwa w swojej płaszczyźnie; środek przesuwa po poziomie pod kursorem. |
| **Obróć** | E (albo R) | Pierścień na każdą oś obraca wokół niej. Pierścienie pojedynczej figury to jej własny obrót, pochylenie i przechył; grupa obraca się wokół osi świata w swoim środku. |
| **Skaluj** | R (albo S) | Rozsuwa albo zbiera zaznaczenie ze swojego środka wzdłuż osi albo na wszystkie strony; promień obszaru rośnie razem z tym. |

**Klawisze** przełączają między W / E / R (Unity, Unreal) a G / R / S (Blender); klawisze wybierają tryb tylko wtedy, gdy coś jest zaznaczone, a w pozostałych wypadkach latają kamerą. Tak więc `R` oznacza **Skaluj** przy klawiszach W / E / R i **Obróć** przy klawiszach G / R / S, gdy coś jest zaznaczone, a gdy nic nie jest, obraca następną figurę do postawienia. Wszystkie klawisze tablicy są wypisane w [skróty klawiszowe](keyboard-reference.md#tactics-board). Przytrzymaj **Ctrl** podczas przeciągania, aby przyciągnąć przesunięcie do **Siatki** (metry) albo obrót do **Kroku kąta**. **Przyciągaj do ziemi** (domyślnie włączone) kładzie przesunięte osoby, pojazdy, znaczniki, punkty trasy i obszary na powierzchni poziomu; statki powietrzne i helikoptery zachowują wysokość, a przeciągnięcie wzdłuż strzałki Y nigdy nie przyciąga. Przeciąganie uchwytu nigdy nie rusza kamerą. **Esc** anuluje przeciąganie, a każda zmiana to jeden krok Cofnij.

Punkty trasy pokazują się jako kropki na strzałkach pokazywanego kroku: kliknij jedną, by ją zaznaczyć, przeciągnij, by przesunąć, Delete, by ją usunąć. Sekcja **Zaznaczone** pokazuje położenie zaznaczenia w metrach, obrót, pochylenie i przechył figury w stopniach oraz promień obszaru, każdy do wpisania.

## Czas {#timing}

Trasa figury ma czas: każdy odcinek zajmuje tyle, ile wynosi jego długość po poziomie - próbkowanej na powierzchni co kilka metrów, więc wzgórze albo schody między dwoma punktami się liczą - z prędkością **trybu** ruchu tej figury w tej grze, plus ewentualny **postój** w punkcie trasy. Piechota czołga się, kuca, idzie (cicho), biegnie albo sprintuje; pojazdy i łodzie wolno, ostrożnie, normalnie albo na złamanie karku; statki powietrzne i helikoptery lecą wolno, z prędkością przelotową, bojową albo maksymalną. Tryb, którego gra nie ma (CS2 nie ma sprintu), zastępuje najbliższy, jaki ma. To, jak nachylenie spowalnia, zależy od gry: w CS2 i Valorancie liczy się tylko odległość pozioma, jak w grach; symulatory wojskowe spowalniają piechotę pod górę (funkcja turystyczna Toblera), a pojazdy według nachylenia.

Prędkości pochodzą z tabel dla każdej gry wraz ze źródłami (zob. [Prędkości ruchu](tactics-speeds.md)): CS2 według trzymanej broni, z definicji broni gry; Valorant według broni; Battlefield, Squad, Arma i gry lotnicze według rodzaju i klasy pojazdu. **Porusza się jak** wybiera profil figury (broń, rodzaj pojazdu); **Własna (m/s)** nadpisuje dowolny tryb dla tej figury. Tryby są nazwane tak, jak pokazuje je tablica: *Czołganie*, *Kucanie*, *Chód (cicho)*, *Bieg*, *Sprint*; *Ostrożnie*, *Normalnie*, *Na złamanie karku*; *Wolno*, *Przelotowo*, *Bojowo*, *Maksymalnie*.

Każdy punkt trasy pokazuje czas od poprzedniego i czas od początku planu („+3,9 s · 0:12”). Trasa zaznaczonej figury wypisuje każdy odcinek z jego trybem, długością i czasem, postój i przybycie. **Przybycia** w sekcji **Pomiar czasu** kładzie każdą figurę z trasą na jednej osi czasu, pierwsze przybycie na górze. Przy włączonym **Odtwarzaj w czasie rzeczywistym** (domyślnie włączone) krok trwa, aż przyjedzie najwolniejsza trasa, a każda figura porusza się własnym tempem; **Sekundy** to wtedy najkrótsza długość kroku. **Jednostek poziomu na metr** mówi, czym jest poziom: 39,37 dla map CS2 (jednostki gry), 1 dla map w metrach.

## Porównanie z danymi meczów {#compare-with-match-data}

**Wczytaj pliki meczów…** czyta tabele meczów CS2 tej mapy (pliki Parquet narzędzia CS2, ile chcesz; tylko potrzebne kolumny, w tle); **Użyj wczytanych danych** bierze dane wczytane w przeglądarce. Potem:

- **Najwcześniejsze przybycie na mapie** koloruje mapę według czasu od początku rundy, po którym gracz pierwszy raz dotarł w każde miejsce - przycisk **Najszybszy** pokazuje najszybszy ze wszystkich rund, **Typowy (mediana)** środkową rundę - od zielonego (wcześnie) do czerwonego (późno), dla jednej strony albo obu. Pokazuje, co jest możliwe i kiedy.
- Wybrana trasa jest porównywana z tym, co gracze osiągnęli od jej początku (albo od początku rundy) do końca, każdy koniec jako dysk o ustawionym promieniu: „Najszybciej zaobserwowane 14,2 s, p10 15,0 s, mediana 18,3 s z 41 przejazdów; twój plan 15,1 s”.
- Prędkości, z jakimi gracze naprawdę się poruszali - biegiem, chodem, kucając, z kolumn chodu i kucania w tabelach - w m/s.

## Kroki {#steps}

Pasek pod widokiem zawiera kroki. Plan zaczyna się z jednym; **+** dodaje następny, a każda figura zaczyna go tam, gdzie skończyła się jej trasa w ostatnim kroku; **−** usuwa pokazywany. **Sekundy** to, jak długo pokazywany krok trwa przy odtwarzaniu. **▶** (K) odtwarza od pokazywanego kroku do końca: figury z trasą idą nią, figury przesunięte na nowe miejsce w następnym kroku tam zjeżdżają, a reszta stoi. Gdy krok jest pokazany, miejsce każdej figury w następnym kroku jest rysowane jako blady duch, a strzałki ostatniego kroku słabo pod strzałkami tego.

## Zapisywanie {#saving}

Sekcja **Plik** ma **Zapisz**, **Otwórz** i **Wyczyść**. **Zapisz** zapisuje plan jako `<nazwa>.h3dplan.json` (zwykły JSON: strony, kroki, figury z miejscem w każdym kroku, strzałki, obszary, notatki); **Otwórz** wczytuje go z powrotem. Plik innej wersji albo taki, który nie jest planem, zostaje odrzucony z podaniem powodu. **Wyczyść** opróżnia plan; Cofnij go przywraca.

## Figury {#figures}

Każda figura jest budowana przez samą przeglądarkę: proste kształty w opublikowanym rozmiarze typu, z cechami, które odróżniają ją od sąsiadów - gąsienice i wieża czołgu, działa, pociski i radary pojazdu obrony przeciwlotniczej, układ skrzydeł, ogona i silników samolotu, wirniki i krótkie skrzydła helikoptera. Nic nie jest zabrane z gry. Projekt, który wymyśliła gra, jest pokazywany jako ogólna figura jej klasy. Jak dane znajdują swoją figurę: zob. [Figury](figures.md#which-figure-a-unit-gets).

## Zastrzeżenie Riot {#riots-notice}

Mapy Valoranta są pokazywane zgodnie z polityką Riot Games „Legal Jibber Jabber”, która pozwala darmowym projektom społecznościowym z nich korzystać i wymaga tego zastrzeżenia wszędzie, gdzie się pojawiają. Zastrzeżenie w oryginalnym brzmieniu: *3DHeat was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.* Zdolności na tablicy to ogólne kształty, a nie grafika Riot.
