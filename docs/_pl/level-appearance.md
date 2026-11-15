---
title: "Wygląd poziomu"
parent: "Poziomy i geometria tła"
nav_order: 3
lang: "pl"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Wygląd poziomu

Te ustawienia zmieniają wygląd poziomu 3D, tak by ciepło się z niego wyróżniało, a ty nadal mogłeś czytać miejsce. Nic tu nie zmienia danych.

## Szybki start {#quick-start}

1. Wczytaj poziom 3D ([Poziomy 3D](model-levels.md)).
2. W **Tło / poziom** obniż **Jasność**, aż ciepło będzie najjaśniejszą rzeczą na ekranie.
3. Otwórz **Rzeźba terenu** i podnieś **Cieniowanie spadków** albo **Wyrazistość poziomic**, aż odróżnisz wzgórze od równiny.
4. Otwórz **Budowle**. Obniż **Krycie ścian**, by zajrzeć do budynków, albo włącz **Teksturę budowli**, by widzieć je pełne.
5. Jeśli na podłożu namalowany jest obraz, wypróbuj **Teksturę podłoża** wyłączoną i włączoną.

![Otwarte sekcje Rzeźba terenu i Budowle, poziom pokazany ze wskazówkami rzeźby](../assets/img/en/level-appearance-sections.webp)

Gdy wczytany jest [poziom 3D](model-levels.md), panel Tło / poziom pokazuje te ustawienia. Wartości domyślne są takie, jakie dostaje świeżo zaimportowany poziom ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Ich zmiana tylko odrysowuje scenę; akumulacja ciepła zostaje.

## Cały poziom {#the-whole-level}

| Ustawienie | Domyślnie | Zakres | Znaczenie |
|---|---|---|---|
| **Krycie** | 100% | 0-100% | Poniżej 100% poziom jest mieszany i nie zapisuje głębi, więc przestaje [zasłaniać](depth-and-culling.md) ciepło. |
| **Jasność** | 0,9 | 0-2 (suwak 64) | |

Poziom jest rysowany bez nasycenia: szare podłoże, lekko zabarwiona powłoka. Ciepło jest wtedy jedyną nasyconą rzeczą na ekranie. W przeciwieństwie do [obrazu mapy](map-images.md) poziom 3D nie ma suwaka Odbarwienie.

## Rzeźba terenu {#ground-relief}

Z daleka wzgórze i równina wyglądają tak samo szaro, więc widok dodaje trzy wskazówki. Każda odpowiada na inny problem:

| Ustawienie | Domyślnie | Znaczenie |
|---|---|---|
| **Odstęp poziomic** | z zakresu wysokości podłoża | Wysokość między poziomicami, logarytmicznie od 1/4000 do 1/2 zakresu wysokości poziomu; dolna część suwaka to *wyłączone*. Domyślnie to 1/40 zakresu wysokości podłoża zaokrąglona do kroku 1/2/5. Linie co 10 m pasują do zbocza, a na dnie kamieniołomu są bezużyteczne. Co piąta linia jest rysowana mocniej. Poziomice rysuje się w przestrzeni ekranu, więc mają szerokość piksela przy każdym powiększeniu. Są jedyną wskazówką, która przetrwa podłoże zbyt płaskie, by w ogóle je cieniować. |
| **Wyrazistość poziomic** | 35% | 0-100% |
| **Cieniowanie spadków** | 55% | Przyciemnia według stromości, więc brzegi i klify czytają się z każdego kąta kamery. Światło tego nie robi: spłaszcza, gdy na nie patrzysz. |
| **Gradient wysokości** | 50% | Niżej położony teren ciemniejszy, wyżej położony jaśniejszy, w całym zakresie wysokości podłoża: duży kształt. |

Nagłówek sekcji pokazuje stan poziomic: *co N m*, odstęp poziomic, albo *brak poziomic*, gdy odstęp jest wyłączony.

## Powierzchnia podłoża {#ground-surface}

| Ustawienie | Domyślnie | Pokazywane, gdy | Znaczenie |
|---|---|---|---|
| **Woda** | włączone | poziom ma wodę | Jeziora, rzeki i morze, rysowane płasko w bladym niebiesko-szarym kolorze. Żadna wskazówka terenu nie dotyczy powierzchni, która z definicji jest płaska. |
| **Krycie wody** | 60% | Woda włączona | Linia brzegowa i podłoże pod płyciznami przeświecają przez półprzezroczystą wodę. |
| **Trójkąty podłoża** | 30% (0 dla poziomu z teksturami) | zawsze | Własne krawędzie terenu rysowane nad cieniowaną powierzchnią, zanikające między 6% a 25% szerokości poziomu od kamery. Pokazuje, jak grubo próbkowano podłoże, i daje zboczu coś, po czym można ocenić odległość. Budowane przy pierwszym użyciu, co na dużym poziomie zajmuje chwilę. |
| **Podłoże tylko jako siatka** | wyłączone | zawsze | Zastępuje powierzchnię terenu jej krawędziami. Całkowicie schematyczne: rezygnuje też z cieniowania, poziomic i zasłaniania, więc zwykle lepszy jest *Trójkąty podłoża*. |
| **Tekstura podłoża** | włączone | poziom ma tekstury | Rysuje podłoże w teksturach, które niesie plik (asfalt, pobocze, trawa). Oświetlenie siatki jest nakładane delikatnie, bo tekstura sama niesie swoją drobną rzeźbę. Do jej wyciszenia pod ciepłem służy **Jasność**; Odbarwienie należy do obrazów map. |
| **Zarejestrowany kolor** | wyłączone | poziom ma kolory wierzchołków | Cieniuje podłoże kolorem, który zarejestrował skan, zamiast szarym. Odtworzona droga w inny sposób nie różniłaby się od pobocza. Eksporty z silników ich nie mają; gdy ich brak, panel mówi *Ten poziom nie ma koloru.* |

## Budowle {#structures}

Nagłówek **Budowle** pokazuje liczbę trójkątów budowli. Podpowiedź pod nim mówi, jak są rysowane (*rysowane pełne we własnych teksturach* albo *rysowane jako przezroczysta powłoka, byś widział ciepło w ich wnętrzu*) i ile części to budowle.

| Ustawienie | Domyślnie | Znaczenie |
|---|---|---|
| **Tekstura budowli** | włączone, gdy budowle mają tekstury | Rysuj budowle pełne, we własnych teksturach. Włączenie ustawia krycie ścian na 100% i wyłącza krawędzie; wyłączenie wraca do zabarwionej, przeświecającej powłoki przy 25%. Budowla z teksturą jest oświetlana od strony, którą widzi kamera, bo znak to dwie ściany plecami do siebie, a to, która wygra test głębi, zależy od zaokrągleń. |
| **Krawędzie siatki** | włączone; wyłączone powyżej 300 000 trójkątów budowli albo gdy są teksturowane | Usunięte duplikaty krawędzi budowli, jedna linia na krawędź. |
| **Krycie krawędzi** | 50% | |
| **Ściany powłoki** | włączone | Słaba powierzchnia z jasną obwódką Fresnela, tak że budynek czyta się jako bryła, a nie klatka albo mgła. |
| **Krycie ścian** | 25% (35% powyżej 300 000 trójkątów budowli, 100% z teksturami) | 0-60% na suwaku, do 100% uchwytem. Trzymaj niskie: pełne budowle zasłaniają dane w swoim wnętrzu. |
| **Ostre krawędzie** | włączone (wyłączone przy teksturach) | Cieniuje każdy trójkąt jego własnym wektorem normalnym, liczonym w shaderze fragmentów z pochodnych w przestrzeni ekranu. Wyeksportowane poziomy są zespawane i mają uśrednione normalne, które zaokrąglają każdy róg pudełka do „stopionej folii”. Rozdzielenie każdego wierzchołka, by to naprawić, pomnożyłoby bufor wierzchołków. Wyłącz dla poziomu, którego zakrzywione powierzchnie są ważniejsze niż narożniki. |
| **Zabarwienie budowli** | Cyjan | Selektor koloru i ustawienia **Cyjan**, **Bursztyn**, **Fiolet**, **Biel**. |
| **Pokaż klasyfikację części (N)** | | Każda część, jej klasa i powód; zob. [Poziomy 3D](model-levels.md#ground-structures-and-water). |

## Cięcie poziomu {#cutting-the-level}

[Przekrój](slice.md) i, przy *Tnij też poziom*, [odcinanie według odległości](depth-and-culling.md#distance-culling) tną podłoże, budowle i wodę tymi samymi płaszczyznami, co ciepło.
