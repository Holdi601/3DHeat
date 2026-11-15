---
title: "Dane demonstracyjne"
nav_order: 2
lang: "pl"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Dane demonstracyjne: wypróbuj przeglądarkę w pięć minut

![Ciepło dziesięciu meczów czołgów w Demo Valley: co pokazuje krok 4](../assets/img/en/heat-hero.webp)

Nie masz jeszcze własnych danych? Repozytorium je tworzy. Wszystko w nim jest zmyślone: dolina, podwórko i mecze trzech zmyślonych stylów gry, z graczami o nazwach *Blue 1* albo *Red 3*. Wszystkie obrazki na tej stronie zostały zrobione właśnie z nich.

## Wygeneruj je {#make-it}

```bash
node tools/demo-data.mjs
```

To zapisuje do `tools/.shots/demo/`:

| Plik | Czym jest |
|---|---|
| `demo-valley.glb` | dolina o długości 12 km z dwoma wzgórzami i wioską, jako poziom 3D |
| `demo-yard.glb` | obwiedzione murem podwórko o długości 160 m z budynkami, jako poziom 3D |
| `tanks.parquet` | 10 meczów czołgów, po 8 na 8: ruch, strzały, trafienia z miejscem na kadłubie, pożary, zabójstwa, wraki, celowanie wieży, zwycięzcy |
| `tanks/match-NN.parquet` | te same mecze, po jednym pliku na mecz, do [wiele meczów naraz](many-matches.md) |
| `air.parquet` | walka powietrzna 4 na 4 z pociskami, flarami, zabójstwami i chybieniami |
| `shooter.parquet` | 12 rund po 5 na 5 pieszo: strzały, zabójstwa, podłożenie bomby, zdobyte i wydane kredyty, hełmy i środki taktyczne |
| `mass/` | folder małych plików `.3dheat` z meczami, do [analiza zbiorcza](mass-analysis.md) |
| zestaw okrążeń wyścigowych | dwa okrążenia jednego samochodu na zmyślonej trasie, do [Analiza wyścigu](race-analysis.md) |

Każda tabela podaje swoje kolumny w stopce, więc wczytuje się bez żadnego mapowania.

## Wypróbuj {#try-it}

1. Uruchom przeglądarkę danych (`start.bat` w Windows albo raz `npm install`, a potem `npm run dev` w dowolnym systemie) i otwórz `http://127.0.0.1:5273/`.
2. **Tło / poziom → Model 3D…** i wybierz `demo-valley.glb`.
3. **Źródło → Pliki…** i wybierz `tanks.parquet`.
4. Naciśnij `F`, aby dopasować widok do danych. Widzisz [ciepło](heat.md) dziesięciu meczów.
5. Wypróbuj pasek trybów: **Różnica** (Blue przeciwko Red), **Ciepło drużyn**, **Linie**.
6. Otwórz **Wnioski** (w pasku bocznym Mapy cieplnej): znajdzie miejsca, gdzie znacznie więcej strzelano, trafiano i niszczono niż gdzie indziej - wokół dwóch wzgórz.
7. Otwórz kartę **Mecz**; w **Mecze w powtórce** wybierz *Match 01* i naciśnij **Odtwórz** na osi czasu: [powtórka](match-replay.md).

![Powtórka Match 01 z czołgami jako figurami](../assets/img/en/replay-overview.webp)

W przypadku strzelanki wczytaj `demo-yard.glb` i `shooter.parquet`; do walki powietrznej - `air.parquet` (figury są łatwiej widoczne przy **Rozmiar figur** 4, suwaku w panelu **Widok drużyn** w pasku bocznym Mapy cieplnej).

## Zrzuty ekranu {#the-screenshots}

Obrazki na stronie są robione z tych danych przez skrypt, w dowolnym z języków przeglądarki:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Serwer zrzutów działa bez lokalnego pakietu sylwetek, więc widać tylko publiczny katalog sylwetek. Obrazki trafiają do `docs/assets/img/<lang>/`. Zob. [Utrzymanie dokumentacji](maintaining.md).
