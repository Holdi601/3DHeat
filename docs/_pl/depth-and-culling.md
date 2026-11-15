---
title: "Głębia i odrzucanie"
parent: "Tryby ciepła"
nav_order: 4
lang: "pl"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Głębia i odrzucanie

Głębia sprawia, że wzgórza i ściany zasłaniają ciepło za sobą, tak jak prawdziwa ściana zasłania człowieka. Odcinanie według odległości zostawia tylko ciepło między bliską a dalszą odległością od kamery.

![Niska kamera za wzgórzem, z Ukryj za terenem wyłączonym (po lewej) i włączonym (po prawej)](../assets/img/en/depth-and-culling-terrain.webp)

![Odcinanie według odległości z Daleko na 400 m i Tnij też poziom włączonym: wycinek mapy wokół kamery](../assets/img/en/depth-and-culling-far.webp)

Bez głębi mapa cieplna nad poziomem 3D [poziomem](levels.md) jest płaską nakładką: wszystko, co zawiera zbiór danych, świeci przez każdą ścianę z pełną siłą. Wskazówki głębi, które daje poziom, zostają anulowane, a punkt gorący wewnątrz budynku wygląda tak samo jak ten na jego dachu. Sekcja **Głębia** sprawia, że poziom zasłania to, co jest za nim. **Odcinanie według odległości** ogranicza ciepło do powłoki albo płyty wokół kamery. [Przekrój](slice.md) wycina płytę ze świata. Wszystkie trzy działają w trybach ciepła i zmieniają, które wiersze się liczą, więc ich zmiana zaczyna akumulację od nowa.

## Głębia {#depth}

Oba ustawienia wymagają [poziomu](levels.md): obrazu mapy albo modelu 3D. Bez wczytanego poziomu nie ma czego zasłaniać i nic nie robią. Oba są wyłączone, gdy włączone jest [Spłaszcz na płaszczyznę podłoża](sprite-shape.md#flatten-onto-ground-plane).

### Ukryj za terenem {#hide-behind-terrain}

**Ukryj za terenem** (domyślnie włączone): punkt danych, którego najbliższa powierzchnia w stronę kamery to *ziemia* (a nie budowla), zostaje całkowicie usunięty, a nie przyciemniony.

Teren i ściany są nieprzezroczyste na różne sposoby. Patrzysz *przez* ścianę celowo, by zobaczyć, na którym piętrze był ruch. Nigdy nie chcesz patrzeć przez wzgórze, bo za nim jest odległa strona mapy. Na mapie o szerokości kilometrów to większość danych, a ich suma na horyzoncie tworzy pas jaśniejszy niż cokolwiek na pierwszym planie. Jeden przyciemniacz nie może obsłużyć obu przypadków, więc teren dostaje próg odcięcia, a ściany zostają przy przyciemnianiu poniżej.

### Ukryte za geometrią {#hidden-behind-geometry}

**Ukryte za geometrią** (domyślnie 0,8): jak mocno tłumiony jest punkt danych za geometrią poziomu. Wartość 0 oznacza *widać przez*, wartości pośrednie to *N% ciemniej* (pozycja suwaka, a nie zmierzone przyciemnienie), a 1 oznacza *całkowicie ukryte*.

Każda ściana albo podłoga między punktem a kamerą przyciemnia go jeszcze bardziej. Przy domyślnym ustawieniu jedna ściana zostawia kilka procent, a każda kolejna powierzchnia dzieli to, co zostało, na pół, do czterech powierzchni. Przy 1 nic za geometrią nie jest rysowane i to najtańsze ustawienie.

Zob. też [Wygląd poziomu](level-appearance.md).

## Odcinanie według odległości {#distance-culling}

**Odcinanie według odległości** (domyślnie zamknięte) ogranicza ciepło do wierszy między bliską a dalszą granicą od kamery. Ustaw dalszą granicę, by odczytać gęstość wewnątrz budynku bez tego, że daleka strona mapy sumuje się na nim. Ustaw bliższą granicę, by lecieć *przez* gorący punkt zamiast w jego stronę.

| Ustawienie | Domyślnie | Zakres (suwak) | Znaczenie |
|---|---|---|---|
| **Blisko** | wyłączone | 0,5-5000 m, logarytmicznie; dolne 5% suwaka = wyłączone (200 000) | Wiersze bliżej niż to są pomijane. |
| **Daleko** | wyłączone | 1-200 000 m, logarytmicznie; dół = wyłączone (10 000 000) | Wiersze dalej niż to są pomijane. |
| **Tnij płaszczyzną** | włączone | | Mierz granice wzdłuż osi widoku, a nie od oka, więc cięcie jest płaszczyzną równoległą do ekranu, a nie kulą wokół ciebie. Krawędź kuli odchodzi w bok przez kadr i przesuwa się, gdy się odwracasz. Płaszczyzna zostaje tam, gdzie ją ustawiłeś. |
| **Tnij też poziom** | włączone | | Tnij ziemię, budowle i wodę tymi samymi granicami. Gdy poziom zostaje cały, cięcie usuwa punkty danych i zostawia budynek stojący przed nimi. Gdy tnie się oba, powstaje przekrój przez mapę, a punkty leżą przy swoich ścianach i podłogach. Ta opcja tylko odrysowuje obraz; nie zaczyna akumulacji od nowa. |

### Klawiatura {#keyboard}

Dalsza granica to ustawienie, które przesuwasz: przeprowadzasz je przez budynek i patrzysz, na którym piętrze pojawia się ruch. Dlatego jest na klawiaturze podczas lotu ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Klawisz | Działanie |
|---|---|
| `]` | Przesuń dalszą granicę na zewnątrz o czynnik 1,12 (Shift: 1,35) |
| `[` | Przesuń ją do środka o ten sam czynnik |
| `\` | Wyłącz dalszą granicę albo włącz ją z powrotem na odległości, na której ją zostawiono (za pierwszym razem 6000) |

Kroki są geometryczne, bo użyteczny zakres obejmuje cztery rzędy wielkości, od pokoju do mapy. Klawiatura trzyma dalszą granicę między 100 a 400 000. Klawisze nic nie robią, gdy aktywne jest pole tekstowe albo menu.

## Dla programistów {#for-developers}

### Ukryj za terenem {#hide-behind-terrain}

Budowle są rysowane do własnej tekstury głębi. Fragment, który jest za głębią sceny, ale *nie* za głębią budowli, jest za ziemią i zostaje odrzucony. Kosztuje to jeden przebieg głębi po budowlach, pomijany, gdy przełącznik jest wyłączony.

### Ukryte za geometrią {#hidden-behind-geometry}

Liczy się **dla każdej powierzchni**. Pojedyncze porównanie głębi mówi tylko „coś jest z przodu”, więc punkt za jedną ścianą i punkt cztery pokoje w głąb budynku przyciemniłyby się tak samo, a wnętrze wyglądałoby jak jedna blada plama. Zamiast tego geometria budowli jest **zdejmowana warstwami głębi** do maksymalnie 3 dodatkowych warstw ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Każdy fragment liczy, ile powierzchni jest przed nim (własna głębia sceny plus zdjęte warstwy: do czterech), a przyciemnienia się składają:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Suwak | 1 powierzchnia | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25% | 12,5% | 6,25% | 3,1% |
| 0,8 (domyślnie) | 4% | 2% | 1% | 0,6% (dolna granica) |
| 1,0 | nie rysowane | nie rysowane | nie rysowane | nie rysowane |

Dlaczego dwa czynniki: suwak jest skalibrowany tak, że jedna ściana zostawia kilka procent, czyli wygląd, który czytelnie znaczy „za czymś”. Kilka procent złożonych po sobie byłoby niczym już przy trzeciej ścianie. Dzielenie na pół przy każdej kolejnej powierzchni zostawia cztery rozróżnialne kroki. Dlaczego do kwadratu: liniowo nasycone pole za ścianą wciąż było nasycone; czwarta potęga wymazywała je przy 0,8. Dlaczego dolna granica: całkowite ukrycie zasłoniętego ciepła sprawia, że pokój pełen ukrytego ruchu wygląda jak pusty pokój, bez żadnej wskazówki, by sięgnąć po [Przekrój](slice.md). Tylko suwak przyciśnięty do 1 ukrywa je całkowicie i jest to najtańsze ustawienie, bo zasłonięte punkty są wtedy odrzucane.

Jak to działa ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), shadery punktowego ciepła): porównanie idzie na fragment, z teksturą głębi sceny, w **głębi okna**, a nie w odległości świata. Pobranie tekstury głębi w etapie wierzchołków na niektórych sterownikach zwraca „daleko” wszędzie (między innymi w programowym rasteryzerze ANGLE). Linearyzacja obu głębi do metrów gubi rozdzielność przez precyzję przy szerokim zakresie bliskiej i dalekiej płaszczyzny. Przesunięcie to jeden promień sprite'a przeliczony na jednostki okna plus kilka najmniej znaczących bitów, więc punkt danych leżący na powierzchni nie zasłania sam siebie.

Budowle są rysowane półprzezroczyście, ale są rysowane w głębi, z której czyta się zasłanianie. Poziom, którego budowle nie trafiły do tekstury głębi, zasłaniałby tylko względem terenu.

### Odcinanie według odległości {#distance-culling}

Obie granice są liczone w shaderze wierzchołków, więc odcięty wiersz kosztuje jeden wierzchołek i żadnego fragmentu.
