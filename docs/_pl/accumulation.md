---
title: "Akumulacja"
parent: "Wnętrze renderowania"
nav_order: 2
lang: "pl"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Akumulacja

Gdy widok nie może narysować każdej kropki w jednej klatce, rysuje jedną część, potem kolejną, i dodaje obrazy, gdy stoisz nieruchomo. Obraz staje się wyraźniejszy, jak zdjęcie wywoływane w ciemni. Ruch kamery zaczyna wszystko od nowa. Wiersz **Pokrycie** w nakładce statystyk pokazuje, jak daleko to zaszło.

![Nakładka statystyk: Pokrycie pokazuje procent, gdy obraz się wywołuje, a *dokładne*, gdy jest gotowy](../assets/img/en/performance-stats-overlay.webp)

## Dla programistów {#for-developers}

Gdy jedna klatka nie może narysować każdego wiersza, rysuje próbkę i waży ją w górę. Obraz jest wtedy nieobciążonym, ale zaszumionym szacunkiem. **Akumulacja** łączy kolejne klatki, tak że szacunek zbiega do dokładnej odpowiedzi, dopóki nic się nie zmienia. Każda klatka wybiera jeden z pięciu trybów ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)). Ostatnio użyty jest zapisany w `engine.live.accumMode`.

| Tryb | Kiedy | Co dzieje się z akumulatorem |
|---|---|---|
| **reset** | kamera się ruszyła, zmieniło się coś, co zmienia pole, stopniowe doprecyzowanie jest wyłączone, zaczyna się rosnące okno (pierwsza klatka odtwarzania, po przewinięciu) albo zmieniła się odtwarzana linia ciepła | Zastąpiony szacunkiem tej klatki. |
| **extend** | **Narastające** okno, które od ostatniej klatki tylko urosło | Ta klatka rysuje tylko wiersze, które właśnie się pojawiły, z pełną wagą, i je dodaje. Nic nie zanika. |
| **ema** | przesuwające się okno (**Okno**, **Czas życia**) się przesunęło | `acc = acc × (1 - 0,34) + klatka × 0,34` - wykładnicza średnia krocząca z około trzech klatek. |
| **mean** | nic się nie zmieniło, a szacunek nie jest kompletny | `acc = acc × (1 - 1/n) + klatka × 1/n` w *n*-tej klatce: średnia bieżąca. |
| **skip** (bezczynność) | zbieżność osiągnięta i nic się nie zmieniło | Nic nie jest rysowane; klatka tylko składa obraz na nowo. |

### Dlaczego każdy {#why-each}

- **Średnia bieżąca, nie suma.** Skalowanie bufora przez 1 - 1/n i dodanie 1/n nowej klatki jest algebraicznie tym samym, co sumowanie i dzielenie przez *n* na końcu. Ale bufor zawsze trzyma wartość jednego pola. Suma sięga *n* razy pola, a na celu 16-bitowym nasyca się przy 65 504. Przy dzielniku, który ciągle rośnie, nieruchomy widok blakłby im dłużej stoi. Poruszana kamera, która resetuje się co klatkę, wygląda wtedy idealnie. Zestaw testów sprawdza, że 16 połączonych klatek daje 1,00× tego, co daje jedna klatka.
- **Extend dla odtwarzania narastającego.** Wiersze już zgromadzone są nadal widoczne, więc klatka potrzebuje tylko ułamka sekundy, który właśnie napłynął. To mieści się w jednej klatce, więc wchodzi dokładnie. Ponowne szacowanie zapaliłoby w każdej klatce inny losowy podzbiór i go wygaszało. Wyglądałoby to jak wybuchy, które rozbłyskują i znikają, a wstrzymana klatka dalej by się dopełniała. Zestaw testów sprawdza, że suma rośnie monotonicznie podczas odtwarzania i trzyma się w granicach 0,02% przez 2,5 s wstrzymania.
- **Średnia krocząca dla przesuwających się okien.** Te naprawdę zmieniają się w każdej klatce. Stała waga mieszania nadąża za przesuwającym się oknem (średnia po wszystkich klatkach od początku odtwarzania spóźniałaby się za głowicą) i jest dużo spokojniejsza niż zaczynanie od nowa.
- **Reset dla odtwarzanych linii.** Głowice linii ciepła poruszają się w każdej klatce. Średnia krocząca rozmazałaby każdą w smugę, więc każda klatka jest rysowana w całości, a zanik ogona jest własnym obrazem.
- **Częściowe klatki przechodzą przez tymczasowy cel.** Klatka połączona z ułamkiem pełnej wagi jest rozpraszana do osobnego celu od zera, a potem mieszana z akumulatorem, zamiast być rozpraszana bezpośrednio z wagą 1/n. Bezpośrednio każdy sprite dodawałby się z 1/n rozmiaru sumy, do której dołącza, a cel połówkowy zaokrągla to do zera. Najgorzej jest tam, gdzie jest najgęściej ([Akumulacja połówkowa](half-float-accumulation.md)).

### Zbieżność {#convergence}

Plan każdej klatki zna liczbę wierszy kandydujących i liczbę wysyłanych, więc liczba klatek potrzebnych do objęcia każdego wiersza to ⌈kandydaci / wysłani⌉. Gdy tyle klatek zostanie połączonych, widok jest **zbieżny**. Wiersz nakładki statystyk *Pokrycie* zmienia się z procentu na *dokładne*, a kolejne klatki są bezczynne. Przy włączonym **Rysuj każdy wiersz w każdej klatce** (domyślnie) pojedyncza klatka zwykle obejmuje wszystko, więc zbieżność jest natychmiastowa. Mechanizm stopniowy jest potrzebny tylko wtedy, gdy okno ma więcej wierszy, niż może unieść jeden plan rysowania (około 67 milionów).

### Co go restartuje {#what-restarts-it}

Ustawienia dzielą się na trzy grupy, zależnie od tego, co zgromadzony bufor nadal znaczy po ich zmianie:

| Grupa | Zmiany | Efekt |
|---|---|---|
| **Geometria** - które wiersze się liczą i ile wnoszą | tryb widoku; trasy linii; promień sprite'a, intensywność w środku i na krawędzi, spadek, gładki gradient, krzywa, ograniczenia pikseli, spłaszczenie; odcinanie odległości bliskie, dalekie i płaszczyznowe; zasłanianie i ukrywanie za terenem; przekrój; rozmiar płótna; rozdzielczość ciepła; widoczność i znaki grup; podział różnicy; Wszystko / Odtwórz; historia; filtry kolumn i wybór jednostek; wzmocnienie połówkowe | Reset. |
| **Okno** - zakres czasu | przesuwanie się głowicy; rezerwowy czas życia i zanikanie | Rozszerzenie (narastająco) albo średnia krocząca (przesuwające się). |
| **Składanie** - tylko kolorowanie | nasycenie, odpowiedź na gęstość, minimalne ciepło, gradienty kolorów; wycinanie poziomu; siatka i osie; ustawienia powtórki w sześcianach i sesja; głębia ostrości | Odrysowanie bez ruszania ciepła. |

Ruch kamery zawsze resetuje. Zatem przeciąganie nasycenia albo gradientu nic nie kosztuje, a przeciąganie promienia sprite'a restartuje zbieżność przy każdym kroku.
