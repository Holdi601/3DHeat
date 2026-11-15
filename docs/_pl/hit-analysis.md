---
title: "Analiza trafień (karta Pojazdy)"
parent: "Replay"
nav_order: 4
lang: "pl"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Analiza trafień

Karta **Pojazdy** pokazuje, gdzie trafiono jeden czołg, statek albo żołnierza i kto to zrobił. Użyj jej, by zobaczyć, która strona czołgu dostaje strzały, albo który wróg zadaje obrażenia.

## Wypróbuj {#try-it}

1. Wczytaj mecz, w którym są trafienia (tabela niżej mówi, które gry je dają).
2. Otwórz kartę **Pojazdy** na górze.
3. W **Pojazd** wybierz jednostkę, na przykład typ czołgu. Liczba w nawiasach to liczba trafień, jakie przyjęła.
4. Przeczytaj rysunek: każdy znak to trafienie, postawione tam, gdzie uderzyło.
5. Otwórz **Kto trafił**, by zobaczyć strzelców, broń albo pojazdy strzelców, z trafieniami, obrażeniami, zabójstwami i dystansem.

![Karta Pojazdy: czołg demo ze znakami trafień i otwarte Kto trafił](../assets/img/en/hit-analysis-tank.webp)

Jeśli nic nie jest wczytane albo dane nie mają trafień w pojazdach, karta mówi, czego brakuje i którego konwertera użyć.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

Rysunek pokazuje trafienia tam, gdzie dane podają punkt albo część ciała. Zestawienie (kto trafił, czym, jak mocno, z jakiej odległości) działa dla każdego źródła.

## Co daje każde źródło {#what-each-source-gives}

| Źródło | Punkt na jednostce | Strzelec | Broń | Obrażenia / wynik |
|---|---|---|---|---|
| War Thunder | tak, w układzie jednostki, wraz z kierunkiem strzału | tak | pojazd strzelca | krytyczne, poważne, zniszczone moduły, strzał zabijający |
| CS2 | część ciała (hitgroup) | tak | tak | obrażenia, pancerz, pozostałe zdrowie |
| World of Tanks | tak (pudełko podzespołu, wejście i wyjście) | tak | - | obrażenia albo brak (odbicie, brak przebicia) |
| World of Warships | tak, w układzie statku | tak | rodzaj trafienia | - |
| Squad | pojazdy: tak - uderzenie umieszczone w układzie pojazdu z jego własnej pozycji i kursu | nie (dane nie podają żadnego) | rodzaj obrażeń | spadek zdrowia pojazdu w tym momencie, zniszczony |
| Żołnierze Squad | nie: wyniki trafień (kość i punkt uderzenia) są zachowywane surowe przez konwerter; wiersze `impact` z `hitBone` są czytane, gdy tylko je zapisze | | | tylko rany i zgony |
| Arma (OCAP, rejestrator Arma 3) | nie: OCAP zapisuje, kto trafił albo zabił kogo, czym i z jakiej odległości, ale nie gdzie | tak | tak | trafienie albo zabójstwo, odległość |
| Tacview ACMI | tak, tam gdzie obiekt broni kończy lot w odległości 30 m od jednostki (nie wyrzutni): jego ostatnie miejsce w układzie jednostki (kurs, pochylenie, przechył), nadlatujące tą stroną, którą leciał | `Parent` broni | nazwa broni, albo AmmoType Timeout | Outcome Timeout, spadki `Health`, `Destroyed`; bez broni zabójstwo albo obrażenia bez punktu |
| Telemetria IL-2 (Watcher) | tak: zdarzenia `hit` / `damage` niosą punkt w układzie własnego samolotu gracza (przyjęte jako x do przodu, y w górę, z w prawo) | nie | nie | siła |
| Dota 2 | nie: dziennik walki nie ma miejsca na bohaterze | atakująca jednostka | zdolność albo przedmiot (brak: atak) | obrażenia, zgon bohatera |
| Battlefield 6 (GameCapture) | nie: przechwycenie czyta tablicę zabójstw (zabójstwa, zgony, flaga strzału w głowę), a nie trafienia | | | |
| DCS / inne żywe źródła Watchera | brak zdarzeń trafień poza tym, co zawierają ich nagrania Tacview | | | |

Gdy żadne trafienie jednostki nie ma punktu, rysunek nie pokazuje znaków, a zestawienie **Kto trafił** otwiera się samo: według strzelca, broni albo pojazdu strzelca, każdy z trafieniami, obrażeniami i zabójstwami, oraz medianą i najdalszą odległością.

## Ogranicz do obszaru {#restrict-to-an-area}

Sekcja **Obszar** ogranicza analizę do trafień, które zaszły w miejscu na mapie.

1. Naciśnij **Rysuj prostokąt** albo **Rysuj wielokąt** i rysuj na trójwymiarowym terenie albo na mapie taktycznej.
2. Wybierz **Ofiara w środku** (liczy trafienie, gdy trafiona jednostka była w obszarze) albo **Strzelec w środku** (gdy w obszarze był strzelec).
3. Naciśnij **Użyj jako filtra**. Etykiety pokazują „{n} z {total} trafień w obszarze”.
4. **Resetuj obszar** usuwa wszystkie obszary.

Każdy obszar jest [objętością](volumes.md), więc te same kształty filtrują też mapę cieplną i powtórkę. Obszar może włączać albo wykluczać (obszar wykluczający zostawia swoje trafienia poza analizą, pokazywane jako „{n} z {total} trafień poza obszarem”). Każdy obszar jest widoczny jako etykieta z liczbą trafień jednostki, które się w nim znalazły; × na etykiecie usuwa go. Liczby, rysunek, zestawienie i listy filtrów idą za tym wszystkim.

Miejsca trafień: wiersz, z którego pochodzi trafienie, zawiera miejsce jednej strony (ofiary dla trafienia albo postrzału, strzelca dla strzału). Miejsce drugiej strony to najbliższa w czasie próbka tej jednostki (w ciągu 5 s). Trafienie, którego miejsce strony nie jest znane, zostaje pominięte, gdy obszar filtruje, a panel mówi, ile ich jest („Pominięto, nieznane miejsce”).

## Dla programistów {#for-developers}

Każdy konwerter może dodawać trafienia: wiersz ofiary (`hit`, `impact`, `hurt`, `wounded`) z `hitBone` (kość szkieletu, selekcja Arma, strefa trafienia Reforgera - odwzorowana na głowę, klatkę piersiową, brzuch, ręce i nogi) albo `hitLocalX/Y/Z` (metry, x do przodu, y w górę, z w prawo), z `other` jako strzelcem i `damage`.
