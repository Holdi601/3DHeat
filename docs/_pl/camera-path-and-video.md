---
title: "Ścieżka kamery i wideo"
nav_order: 15
lang: "pl"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Ścieżka kamery i wideo

Nakręć film ze swoich danych: ustawiasz kamerę w kilku miejscach, widok leci między nimi i zapisuje wideo. Każda klatka jest bardzo czysta, bez ziarna. Kamera i głowica odtwarzania poruszają się razem, więc ten sam panel robi też przyspieszone nagranie ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Zrób przelot {#make-a-flythrough}

1. Doleć tam, gdzie zaczyna się film, i naciśnij **Dodaj klatkę kluczową tutaj** w **Ścieżka kamery i renderowanie**.
2. Doleć do następnego miejsca i naciśnij to samo ponownie. Powtórz dla każdego przystanku.
3. Zaznacz **Podgląd wzdłuż ścieżki** i przeciągnij **Pozycja na ścieżce**, by sprawdzić ruch.
4. Ustaw **Czas trwania** (jak długie będzie wideo). Ruch, który jest dobry, ale za szybki, wymaga tylko dłuższego czasu.
5. Naciśnij **Renderuj wideo**. Poczekaj na pasek postępu; plik pobierze się, gdy skończy się render.

![Panel Ścieżka kamery i renderowanie z trzema klatkami kluczowymi, interpolacją Gładką, 12 s, 30 fps i 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Klatki kluczowe {#keyframes}

| Ustawienie | Działanie |
|---|---|
| **Dodaj klatkę kluczową tutaj** | Dopisuje bieżące położenie kamery, yaw, pitch i pole widzenia jako klatkę kluczową. |
| **Wyczyść** | Usuwa wszystkie klatki kluczowe. |
| Lista klatek kluczowych | Jeden wiersz na klucz: jego numer (kliknięcie przenosi kamerę tam, ustawiając też pole widzenia), położenie, `yaw° / pitch°` i **×**, by go usunąć. |

Klucze są rozłożone **równomiernie** wzdłuż znormalizowanej osi ścieżki od 0 do 1, przy każdym dodaniu albo usunięciu. Czas wyjścia rozciąga cały ruch, więc ujęcie, które jest dobre, ale za szybkie, wymaga tylko dłuższego czasu. Yaw jest rozwijany między kluczami, więc kamera skręca krótszą drogą.

Bez klatek kluczowych render trzyma bieżącą kamerę nieruchomo przez cały klip. To w pełni dobre przyspieszone nagranie.

## Ustawienia ścieżki {#path-settings}

| Ustawienie | Domyślnie | Zakres (suwak) | Znaczenie |
|---|---|---|---|
| **Interpolacja** (2+ klucze) | *Gładka* | *Gładka* / *Prosta* | *Gładka*: krzywa sześcienna Hermite'a przez klucze ze stycznymi z sąsiednich kluczy, więc prędkość zgadza się na każdym kluczu i nie ma szarpnięcia w miejscu połączenia odcinków. *Prosta*: proste odcinki między kluczami, przewidywalne, z widocznym narożnikiem na każdym kluczu. Pole widzenia jest zawsze interpolowane liniowo. |
| Linia przejazdu (2+ klucze) | | | `N jednostek drogi - M na sekundę przy tym czasie trwania` albo uwaga, że wszystkie klucze są w jednym miejscu. |
| **Podgląd wzdłuż ścieżki** (1+ klucz) | wyłączone | | Prowadzi kamerę widoku według ścieżki i przesuwa razem z nią głowicę, tak jak robi to render, więc ruch można ocenić przed renderowaniem. |
| **Pozycja na ścieżce** (podczas podglądu) | 0% | 0-100% | Miejsce na ścieżce do podglądu. |
| **Czas trwania** | 12 s | 1-120 s (3600) | Długość wideo. |
| **Liczba klatek na sekundę** | 30 fps | 6-60 (240) | |
| **Przepływność** | 16 Mbps | 1-60 Mbps, logarytmicznie (400) | Gradienty ciepła źle się bandują przy niskiej przepływności: kodek ma mało szczegółów, za którymi może ukryć błąd. |
| **Limit oczekiwania na zbieżność** | 240 klatek | 2-600 (10 000) | Najdłużej, ile jedna klatka wyjściowa może czekać, by być dokładna. Klatki, które go osiągną, są nadal zapisywane i liczone. |
| Podsumowanie | | | `N klatek · okno: narastająco/stałe/czas życia`, a gdy oś czasu jest w trybie Wszystko: *(render przełącza Wszystko na Odtwórz, by głowica coś znaczyła)*. |
| **Renderuj wideo** / **Anuluj** | | | Uruchamia render; w czasie pracy pokazuje `klatka i / n · czekano w · X MB` i ile klatek nie było dokładnych. Wymaga zbioru danych. |

## Wskazówki {#tips}

- Rozmiar wyjścia to rozmiar płótna w pikselach urządzenia (współczynnik pikseli ekranu, ograniczony do 2). Zmień rozmiar okna przeglądarki, by go zmienić.
- Historia narastająca buduje ciepło przez cały klip. Historia okna albo czasu życia pokazuje przesuwający się wycinek czasu.
- Położenia klatek kluczowych są współrzędnymi wyświetlania: przy [odwróconej osi świata](camera.md#invert-world-axis) klucze zrobione przed przełączeniem wskazują po przełączeniu gdzie indziej.

## Dla programistów {#for-developers}

### Co robi render {#what-a-render-does}

1. Robi próbne przechwycenie klatki, by poznać dokładny rozmiar wyjścia w pikselach urządzenia.
2. Wybiera kodek przez WebCodecs: **VP9** (`vp09.00.10.08`), a jeśli go nie ma, **VP8**, przy wybranej przepływności i liczbie klatek. Bez `VideoEncoder` zatrzymuje się z komunikatem *This browser has no VideoEncoder - WebCodecs is required to write a video*; bez żadnego z kodeków z *No supported video codec (tried VP9, VP8)*.
3. Przejmuje ustawienia, których render potrzebuje: wstrzymuje odtwarzanie, wyłącza **adaptacyjny budżet**, włącza **stopniowe doprecyzowanie** i ustawia budżet sprite'ów na 64 M na klatkę. (Adaptacyjny budżet chroni liczbę klatek, a tu to zły cel: każdą wolno zbiegającą klatkę odczytywałby jako powód, by rysować mniej wierszy, co wymaga więcej klatek do zbieżności.) Przełącza też oś czasu z **Wszystko** na **Odtwórz**. Ustawienie historii (narastająco, okno, czas życia) zostaje bez zmian: render ma pokazać to, na co patrzyłeś, odtworzone od początku do końca i zapisane.
4. Dla każdej klatki wyjściowej *f* z *n*, przy *u* = f / (n - 1):
   - ustawia kamerę w pozie ścieżki przy *u* (jeśli są klucze);
   - przewija głowicę do tego samego ułamka *u* zakresu osi czasu (rozpiętość wybranej sesji w powtórce w sześcianach);
   - wymusza świeży szacunek, nawet gdy kamera się nie ruszyła. Odziedziczenie akumulacji poprzedniej klatki zostawiłoby upiór poprzedniego okna;
   - czeka, klatka po klatce, aż obraz będzie dokładny (wszystkie wiersze kandydujące narysowane w jednej klatce albo akumulacja zakończona), do limitu oczekiwania;
   - przechwytuje złożoną klatkę i ją koduje, z klatką kluczową co 2 sekundy wyjścia, by plik dał się przewijać.
5. Składa klatki w plik WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) ze znacznikami czasu wybranymi z liczby klatek na sekundę. Czas zegarowy, jaki zajęła każda klatka, nie ma znaczenia.
6. Przywraca budżet, pole widzenia, tryb osi czasu, głowicę i to, czy odtwarzanie trwało.
7. Pobiera wideo jako `3dheat-<szerokość>x<wysokość>-<klatki>f.webm` i zgłasza `N klatek przy W×H, X MB - każda klatka dokładna` albo ile klatek dotarło do limitu oczekiwania.

**Anuluj** zatrzymuje się po bieżącej klatce (*Render anulowany.*) i przywraca ustawienia.
