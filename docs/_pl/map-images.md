---
title: "Obrazy map"
parent: "Poziomy i geometria tła"
nav_order: 1
lang: "pl"
source: "map-images.md"
source_hash: "e7a4a651d75d"
translated: true
outdated: false
---

# Obrazy map

Obraz mapy to płaski obraz: minimapa, zdjęcie satelitarne, plan piętra. Kładziesz go pod swoje dane, by widzieć, gdzie leży ciepło. Mówisz widokowi, gdzie ma być obraz, przypinając na nim dwa punkty do dwóch miejsc w świecie (to są „kotwice”).

## Wczytaj i ustaw obraz mapy {#load-and-place-a-map-image}

1. Najpierw wczytaj swoje dane ([Wczytywanie danych](getting-data-in.md)).
2. W **Tło / poziom** naciśnij **Obraz mapy…** i wybierz obraz. Zostanie rozciągnięty na obszar danych.
3. Naciśnij **Dopasuj do zakresu danych**, jeśli obraz został przesunięty. Kotwica 1 trafi w lewy górny róg obrazu, kotwica 2 w prawy dolny, na krawędziach danych.
4. Jeśli ciepło nie pasuje do obrazu, wybierz dwa punkty orientacyjne daleko od siebie (na przykład dwa przeciwległe rogi budynku albo dwa skrzyżowania). Odczytaj piksel każdego z nich na obrazie i jego położenie w świecie (najedź [linijką](measure.md), by odczytać **X** i **Z**).
5. Wpisz je w **Umiejscowienie**: dla **Kotwica 1** punkt orientacyjny **px**, **py**, **świat X**, **świat Z**; tak samo dla **Kotwica 2**.
6. Sprawdź: ślad albo punkt gorący, o którym wiesz, że leży na drodze, powinien teraz leżeć na tej drodze. Zmieniaj liczby, aż tak będzie.

![Sekcja Umiejscowienie z dwiema kotwicami i ciepłem narysowanym na obrazie mapy](../assets/img/en/map-images-placement.webp)

Oba punkty orientacyjne muszą różnić się zarówno kolumną, jak i wierszem pikseli. Inaczej panel mówi *The two anchors share a pixel row or column*.

## Wczytywanie {#loading}

Dowolny format obrazu, który przeglądarka potrafi odczytać. Obraz, którego dłuższy bok jest większy niż **8192 px**, zostaje pomniejszony do 8192 (największy bok, jaki GPU może przechować). Panel mówi wtedy *Downscaled from W×H to w×h* (pomniejszono z W×H do w×h).

Przy wczytaniu obraz zostaje rozciągnięty na granice X-Z zbioru danych (albo na ±1000 jednostek bez zbioru), północą do góry, na najniższej Y zbioru danych. Domyślnie są: **Krycie** 100%, **Jasność** 0,7, **Odbarwienie** 100%, **Odwróć północ/południe** włączone. Obraz jest odbarwiony i przyciemniony, bo zadaniem tła jest pomóc znaleźć punkt gorący, a nie rywalizować z nim.

## Ustawienia {#controls}

| Ustawienie | Domyślnie | Zakres | Znaczenie |
|---|---|---|---|
| **Krycie** | 100% | 0-100% | |
| **Jasność** | 0,7 | 0-2 (suwak 64) | |
| **Odbarwienie** | 100% | 0-100% | Szare tło, nasycone ciepło. Kolor na mapie konkuruje z kolorem w danych. |
| **Odwróć północ/południe** | włączone | | Który wiersz obrazu jest maksymalnym Z świata. Przełączenie tego przy wczytanym zbiorze danych dopasowuje też ponownie kotwice do granic danych. |
| **Umiejscowienie**: Kotwica 1, Kotwica 2 | rogi obrazu na granicach danych | | Każda kotwica to piksel na obrazie: **px** (od lewej, 0 do szerokości) i **py** (od góry, 0 do wysokości) oraz współrzędna świata, w której się znajduje, **świat X** i **świat Z**. Skala i przesunięcie wynikają z pary. |
| **Dopasuj do zakresu danych** | | | Kładzie kotwicę 1 w lewym górnym rogu obrazu, a kotwicę 2 w prawym dolnym, na granicach X-Z danych. Punkt wyjścia do dokładnego ustawienia. Wymaga zbioru danych. |
| **Wysokość** | najniższe Y zbioru danych | min Y danych - 500 do max Y + 500 (suwak max Y + 100 000) | Wysokość płaszczyzny mapy. Ustaw tuż pod danymi, by nic nie było przez nią zasłonięte. |

Wiersz nazwy pokazuje `szerokość×wysokość px · x × z m/px`, czyli rozmiar świata jednego piksela wzdłuż każdej osi.

## W scenie {#in-the-scene}

Obraz to pojedynczy czworokąt z teksturą na wysokości. Przy pełnym kryciu zapisuje głębię, więc bierze udział w [zasłanianiu](depth-and-culling.md) jako podłoże. Poniżej 100% krycia jest mieszany i nie zapisuje głębi, więc niczego nie zasłania. [Linijka](measure.md) mierzy na jego płaszczyźnie. [Biblioteka poziomów](level-library.md) zapisuje poziom obrazu razem z jego kotwicami.

## Mapa Dota 2 {#dota-2-map}

**Mapa Dota 2** obok **Obraz mapy…** pobiera rysunek aktualnej mapy Dota 2, który [OpenDota](https://www.opendota.com) pokazuje na swoich stronach meczów, i umieszcza go pod tabelami, które [Watcher](https://github.com/Holdi601/3DHeat-Watcher) zapisuje z powtórek Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Obraz jest pobierany z opendota.com po naciśnięciu przycisku i nie jest częścią 3DHeat. Rysunek najnowszej łatki bierze się z listy samego OpenDota, a rysunek 7.40, gdy lista nie daje się odczytać.

| | |
|---|---|
| Źródło | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Umiejscowienie | Kalibracja OpenDota: obraz obejmuje jednostki świata Dota od -8192 do 8064 na obu osiach (komórki po 128 jednostek, od 64 do 191), północ u góry. Przy osiach tabeli powtórki (Z w górze, Y odwrócone) daje to świat X od -8192 do 8064 i świat Z od -8064 do 8192. Około 18 jednostek na piksel. |
| Wysokość | 0. Bohaterowie stoją na 0 do około 600. |
| Wygląd | Jasność 0,8, odbarwienie 50%. |

Sprawdzone na publicznej powtórce meczu z łatki 7.40: trasa każdego bohatera idzie narysowanymi pasami, a wieże, koszary i ancjenty, które umieszcza powtórka, leżą na narysowanych bazach. Widok **Góra** pokazuje mapę z północą na dole ekranu, tak jak każdą tabelę Z-w-górze z odwróconym Y.

Rysunek jest OpenDota, mapy Valve; Valve nie popiera 3DHeat.

### Mapa 3D {#the-3d-map}

Gdy Dota 2 jest zainstalowana, polecenie [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) z Watchera (`python -m heat3d_watch dota-map -o dota.glb`) tworzy mapę w 3D z własnych plików gry: teren, klify, wodę, drzewa i budynki, w jednostkach i osiach tabel z powtórek. Wczytaj plik raz przez **Model 3D…**: przeglądarka rozpoznaje go po częściach (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` w `dotaMap.ts`), od razu odkłada do [biblioteki poziomów](level-library.md), zastępując starszy, i o tym informuje. Od tej pory **Mapa Dota 2** wczytuje tę mapę 3D z biblioteki zamiast pobierać rysunek; jeśli w bibliotece nie ma żadnej, pobiera rysunek i mówi, jak zrobić mapę 3D. Plik pochodzi z Twojej własnej instalacji i zostaje na Twoim komputerze.

## Dla programistów {#for-developers}

### Jak kotwice ustawiają obraz {#how-the-anchors-place-the-image}

Z [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), przy kotwicach *a* i *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Dwie kotwice ustalają skalę i przesunięcie na każdej osi osobno, więc mapę można rozciągnąć inaczej w X i Z, ale nie obrócić. Kotwice muszą różnić się w **obu** współrzędnych pikseli. Gdy dzielą wiersz albo kolumnę, nie da się wyliczyć skali, mapa nie jest rysowana, a panel mówi *The two anchors share a pixel row or column*.
