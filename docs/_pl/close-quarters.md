---
title: "Walka na bliskim dystansie i rundy"
parent: "Wnioski"
nav_order: 2
lang: "pl"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Walka na bliskim dystansie i rundy

Dla strzelanek rundowych (najpierw Counter-Strike, każde dane z rundami, stronami i zabójstwami) Wnioski mierzą,
jak wygrywano walki: kto wygrał pojedynki otwierające i ile były warte, czy śmierci były wymieniane, czy gracz
wychodzący za róg pokonywał tego, który go trzymał, czy krzyżowy ogień i błyski się opłacały, jak szanse w rundzie
zmieniały się z każdym zabójstwem i które wejścia zabijały graczy, którzy przez nie przechodzili. Użyj tego, by
zobaczyć, dlaczego rundy były wygrywane, a nie tylko kto zdobył zabójstwa.

Miary pochodzą z doktryny walki w pomieszczeniach i walki miejskiej (lejek śmierci, punkty dominacji, krzyżowy ogień)
oraz z analityki e-sportu i sportu (prawdopodobieństwo wygranej, wartość działań, skorygowany plus-minus). Każda jest
czytana przez [soczewkę wiedzy](knowledge.md) i cytowana.

## Wypróbuj {#try-it}

1. Wczytaj jeden lub więcej meczów z rundami (konwersja CS2 ma wszystko, czego potrzeba).
2. Otwórz **Wnioski** i naciśnij **Znajdź wnioski**.
3. W **Miarach soczewki** przeczytaj linie od *Prawdopodobieństwa wygrania rundy* do *Wpływu gracza*; każda ma swoje
   liczby, 95% przedział, wartość q i źródła, na które się powołuje.
4. Wybierz soczewkę **E-sport** albo **Miejska**, by czytać je przez tę literaturę; **Napisz z pomocą SI** wysyła je
   razem z raportem.

## Co mierzy {#what-it-measures}

| Miara | Co mówi | Jak |
|---|---|---|
| Prawdopodobieństwo wygrania rundy | Jak prawdopodobne było wygranie rundy przez każdą stronę w każdym momencie | Regresja logistyczna na graczach żywych po każdej stronie, bombie albo celu i jego czasie, zegarze rundy i zakupie, dopasowana do wczytanych danych; kalibracja sprawdzana poza próbką według rundy (wynik Brier i jego umiejętność, log loss, błąd kalibracji na dziesięciu przedziałach, nachylenie rekalibracji, AUC) |
| Wartość działań | O ile zabójstwo, zabójstwo otwierające, wymiana, zabójstwo za błyskiem, podłożenie albo błysk zmieniły szansę strony na wygraną | Prawdopodobieństwo wygranej po minus przed; wymiany, zabójstwa otwierające i zabójstwa za błyskiem testowane względem pozostałych zabójstw permutacją |
| Pojedynki otwierające | Która strona wygrywa pierwszy pojedynek, jak często to wygrywa rundę i gdzie jedna strona wygrywa otwarcia daleko ponad swoją średnią | Przedziały Wilsona; miejsca dwumianowym testem dokładnym względem udziału strony, q po miejscach |
| Wymiany | Śmierci odpowiedziane zabójstwem zabójcy przez kolegę z drużyny w ciągu 5 s, czas, jaki to zajęło, i rundy wygrane, gdy pierwsza śmierć została wymieniona | Dokładny test Fishera, przedział Newcombe'a |
| Wychodzący kontra trzymający | Pojedynki, w których jeden gracz wszedł w walkę (1,5 m/s lub więcej w ostatniej sekundzie), a drugi stał w miejscu (0,75 m/s lub mniej): udział wychodzącego | Dokładny test dwumianowy względem jednej połowy |
| Celowanie przed pojedynkiem | Widok każdego gracza względem kierunku do drugiego na 0,75 s przed zabójstwem; kto celował lepiej i jak często ten gracz wygrywał; trzymający na swoim kącie (w 15°) względem poza nim; zasięgi zabójstw | Dokładny test dwumianowy; Fisher |
| Krzyżowy ogień | Trzymający z nieruchomym kolegą w promieniu 25 m od wychodzącego, którego linia na niego odchodzi o 35° lub więcej od ich własnej, względem trzymających samych | Fisher, Newcombe |
| Uzbrojenie pomocnicze przy wejściach | Wychodzący za błyskiem własnej strony (w ciągu 3 s i 15 m) albo dymem (w ciągu 18 s) względem suchych wyjść; pojedynki otwierające z błyskiem tylko po jednej stronie; oślepieni przeciwnicy | Fisher, dwumianowy |
| Przewaga liczebna | Dla każdego stanu graczy żywych (5v4, 4v5, 2v1...) pierwszy osiągnięty w rundzie: udział rund wygranych od tego stanu | Przedziały Wilsona |
| Clutche | Rundy, w których strona została z ostatnim graczem: wygrane względem oczekiwanych przez model, według liczby przeciwników | Test normalny obserwowanych względem oczekiwanych |
| Stosy, rotacje, czajenie się | Największa grupa w promieniu 10 m przy pojedynku otwierającym (3 lub więcej: stos); gracze dalej niż 30 m od pierwszej walki albo podłożonego celu i jak szybko zbliżają się na 12 m; czas i szanse zabójstwo do śmierci dalej niż 30 m od każdego kolegi | Fisher; stosunek szans z przedziałem Woolfa |
| Po podłożeniu i odbicie | Rundy wygrane przez stronę podkładającą, według liczb przy podłożeniu, oraz jej udział w pojedynkach po podłożeniu | Przedziały Wilsona |
| Śmiertelne lejki | Wejścia na każde miejsce (zmiana kolumny miejsca, a gdy jej nie ma - komórki 8 m) i śmierci w ciągu 2,5 s od wejścia, względem wskaźnika mapy | Dokładny test dwumianowy, q po miejscach; stosunek skurczony z 20 wejściami przy wskaźniku mapy |
| Wpływ gracza | Prawdopodobieństwo wygranej dodane przez każdego gracza w rundzie (zabójstwa, śmierci, podłożenia), skurczone empirycznym Bayesem; skorygowany grzbietowo plus-minus wyników rund względem startu modelu; wartość zabójstwa według miejsca i broni, skurczona | Kara wybierana przez walidację krzyżową pięciokrotną |

Wszystkie testy jednej analizy dzielą jeden współczynnik fałszywych odkryć (Benjamini-Hochberg), wliczając każde
wypróbowane miejsce, nie tylko pokazane; pokazane q jest liczone po wszystkich. Model i jego kalibracja są dopasowane do
wczytanych danych, więc opisują tę populację: model zawodowy źle ocenia grę towarzyską i odwrotnie.

Sprawdzono na syntetycznych rundach z wbudowanymi efektami (przewaga wychodzącego, krzyżowy ogień, błyski, jeden śmiertelny
lejek, lepsze celowanie wygrywające), oraz na 100 zbiorach tych samych rund bez nich, gdzie współczynnik fałszywych odkryć
testów wbudowanych efektów musi pozostać na nominalnych 5% (w granicach pasma) (`src/insights/cqb/cqb.test.ts`); na około
tysiącu prawdziwych rund model dał wynik Brier 0,14 wobec 0,25 dla wskaźnika bazowego, błąd kalibracji 0,03 i nachylenie
rekalibracji 1,0.

## Potrzebne dane {#data-it-needs}

- kolumny **czas**, **gracz**, **strona** i **runda** (sesja), oraz zabójstwa i śmierci w kolumnie zdarzeń; rundy, w których
  nikt nie ginie dwa razy, traktuje się jako rundy eliminacyjne (przewaga liczebna, clutche i model ich potrzebują);
- kolumnę **drugiej strony** (`other`, `victim`, `killer`, `attacker`) nazywającą ofiarę przy zabójstwie i zabójcę przy
  śmierci (bez niej zabójstwa i śmierci w tej samej chwili są parowane);
- **kierunek patrzenia** dla miar celowania;
- surową kolumnę `event` nazywającą `flash`, `smoke`, `he`, `molotov`, `plant` i `defuse` dla uzbrojenia pomocniczego i podłożeń;
- `won` (strona wiersza wygrała rundę), `place` (nazwy miejsc), `weapon`, `buy` i `state_flashed`, gdy dane je mają.

Pozycje powinny być próbkowane kilka razy na sekundę; prędkości, celowanie i krzyżowy ogień czytają ostatnie dwie sekundy
przed każdą śmiercią.

## W podziale {#in-the-breakdown}

[Podział](breakdown.md) mierzy cztery sytuacje jako czynniki, z i bez: *oślepiony*, *śmierć wymieniona*, *pojedynek otwierający*
oraz liczebności (*przewaga*, *równe liczebności*, *niedobór*), każdą względem K/D, wygranych rund, przeżycia i zabójstw na minutę.

## Wiele meczów {#many-matches}

Każde podsumowanie meczu z [analizy wielu meczów](mass-analysis.md) danych z kolumną rundy niesie te same miary jako liczby
(`cqb` w podsumowaniu): pojedynki otwierające, wymiany, wyjścia, krzyżowy ogień, wejścia za błyskiem, celowanie, przewagę
liczebną, podłożenia i 40 najczęściej wchodzonych miejsc z ich wejściami i śmierciami. Liczby sumują się po meczach, więc tysiąc
meczów daje te same udziały co jedna duża analiza. Zakładka **Walka na bliskim dystansie** w panelu pokazuje je jako udziały
z przedziałami, dla wszystkich map albo według mapy; kliknięcie wiersza wczytuje mecze, z których pochodzi.

## Dla programistów {#for-developers}

`src/insights/cqb/`: `walk.ts` (jeden przebieg po wierszach w kolejności czasu, rundy trzymane osobno, pojedynki zapisywane
z ich stanem), `finish.ts` (miary i liczby na mecz), `model.ts` (regresja logistyczna metodą IRLS, kalibracja, grzbiet metodą
gradientów sprzężonych, empiryczny Bayes, Fisher, Newcombe, testy permutacyjne), `run.ts` i `worker.ts` (przeglądarka: własny
wątek, obok przebiegu wniosków), `summary.ts` (zbieracz podsumowania wielu meczów), `factors.ts` (sytuacje z podziału),
`shows.ts` (to, co czyta soczewka), `synth.ts` (testowe rundy). Wpisy wiedzy są w `src/insights/knowledge/cqb.ts`, wzorce w
`patterns-cqb.ts`. Wyniki trafiają do raportu jako `lens.cqb`.
