---
title: "Próbkowanie i budżety"
parent: "Wnętrze renderowania"
nav_order: 3
lang: "pl"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Próbkowanie i budżety

Gdy punktów jest za dużo, by narysować je w jednej klatce, widok rysuje równomierną próbkę i sprawia, że każdy punkt liczy się za więcej. Obraz dalej jest poprawny. Regulator dostosowuje liczbę rysowanych punktów tak, by widok utrzymał swoją liczbę klatek na sekundę.

## Ustawienia panelu wydajności {#performance-panel-controls}

| Ustawienie | Domyślnie | Zakres (suwak) |
|---|---|---|
| **Rysuj każdy wiersz w każdej klatce** | włączone | |
| **Adaptacyjny budżet** | włączone | |
| **Docelowe FPS** | 60 | 20-240 (1000) |
| **Początkowe sprite'y / klatka** (adaptacyjny) albo **Sprite'y / klatka** | 4,00M | 65 536-268 435 456, logarytmicznie (268 435 456) |
| **Rozdzielczość ciepła** | 100% | 25-100%, mnożone przez skalę etapu drugiego adaptacji |
| **Stopniowe doprecyzowanie** | włączone | Wyłączone: każda klatka to świeży szacunek jednej klatki (przydatne, by zobaczyć surową próbkę). |

Zob. też [Panel wydajności i nakładka statystyk](performance-and-stats.md).

## Dla programistów {#for-developers}

### Wiersze kandydujące {#candidate-rows}

Wiersze są zapisane w rosnącym czasie. Okno osi czasu [*lo*, *hi*] staje się zakresem wierszy dzięki dwóm wyszukiwaniom binarnym po kolumnie czasu ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Bez kolumny czasu każdy wiersz jest kandydatem. To są **Wiersze w oknie** w nakładce statystyk. Testy na wiersz (filtry, grupy, podział, odcinanie, przekrój, czas życia) odbywają się później, w shaderze. Wiersz, który nie przejdzie, kosztuje jedno wywołanie wierzchołka i żadnego fragmentu.

### Plan próbkowania {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) dzieli zakres kandydatów na **bloki po 4096 kolejnych wierszy** i wybiera, ile z nich narysować, z budżetu sprite'ów klatki:

- Jeśli budżet pokrywa każdy blok, rysowane są wszystkie. Klatka jest wtedy dokładna.
- Inaczej bloki są brane w równym kroku przez cały zakres, z przesunięciem drżenia, które w każdej klatce idzie o złoty podział. Kolejne klatki obejmują więc różne bloki, a suma wypełnia się równomiernie. To jest **warstwowa** próbka: każda część zakresu czasu jest obecna w każdej klatce.

Ciepło każdego narysowanego wiersza mnoży się przez **kandydatów / wysłanych**. Oczekiwane ciepło klatki jest więc dokładne przy każdym budżecie. Od budżetu zależy tylko szum. Wiersze leżą w porcjach po 8 388 608 (zob. [Rezydencja pamięci GPU](gpu-memory.md)). Blok jest dzielony tam, gdzie przekracza porcję, a każda porcja dostaje listę początków bloków, które musi narysować.

Jeden plan może mieć najwyżej 65 536 bloków, czyli 268 435 456 sprite'ów, bo obie implementacje backendu trzymają bufor początków bloków o stałej liczbie 65 536 miejsc. Żądanie większe jest tam ograniczane, a niedobór pokazuje się uczciwie jako więcej klatek do zbieżności.

### Rysuj każdy wiersz w każdej klatce {#draw-every-row-each-frame}

**Wydajność → Rysuj każdy wiersz w każdej klatce** (domyślnie **włączone**): budżet staje się dolną granicą, a nie górną, i klatka, która zaczyna świeży szacunek, rysuje każdy wiersz, za który odpowiada (do limitu 268 M).

Powód: ruch kamery odrzuca akumulację, więc klatka w ruchu to pojedynczy szacunek, którego szum zależy od tego, ile danych narysowała. Gdy rysuje się jedną czwartą, widzisz jedną czwartą w jasnych ważonych kropkach, i to sprawia, że poruszany widok migocze. Rysowanie wszystkiego sprawia, że każda klatka jest gotowym obrazem. Koszt polega na tym, że czas klatki zależy teraz od wielkości danych w oknie. Dźwignie to węższe okno czasu, filtry albo odcinanie odległości. Zmniejszają one kandydatów, a nie przerzedzają ich bardziej.

Wyłącz to na sprzęcie, który nie udźwignie całego pola naraz. Wtedy *Sprite'y / klatka* staje się prawdziwym limitem, a widok zbiega się przez kilka nieruchomych klatek.

Ile kosztuje pełny plan, zmierzone na wydajnym komputerowym GPU, na płótnie 4K z dużym poziomem, przy sprite'ach o promieniu 1 m (piksel lub dwa): mniej więcej 100 M sprite'ów na klatkę przy 30 fps, 200 M przy 15 fps, a maksimum 268 M przy około 12 fps. Przy tak małych sprite'ach koszt to cały etap wierzchołków, a rozdzielczość ciepła nic nie zmienia. Przy dużych sprite'ach koszt to wypełnianie: 8 M sprite'ów o promieniu 100 m zajęło 2,5 s na klatkę przy pełnej rozdzielczości ciepła i 170 ms przy 25%. **Rysuj każdy wiersz w każdej klatce** zaczyna więc od 67 M i rośnie o czwartą część na klatkę, gdy klatki trwają poniżej 150 ms. Spada do połowy, gdy trwają powyżej 400 ms. Dzięki temu ciężki widok nie przekroczy tego, co dopuszcza watchdog GPU.

### Adaptacyjny budżet {#the-adaptive-budget}

**Wydajność → Adaptacyjny budżet** (domyślnie włączone) dostraja budżet sprite'ów, by utrzymać **Docelowe FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). W powtórce w sześcianach i podczas renderu wideo jest nieaktywny.

Wejściem jest czas klatki, wygładzony (90% poprzedniego + 10% nowego, pojedyncze klatki ograniczone do 2 s), w porównaniu z celem 1000 / max(15, docelowe FPS) ms.

**Etap pierwszy - sprite'y.** W każdej klatce budżet mnoży się przez `1 + (cel / klatka - 1) × wzmocnienie`. Wzmocnienie to 0,35, gdy jest za wolno, i 0,08, gdy jest zapas. Zmiana w jednej klatce jest ograniczona do współczynnika 0,5-1,25, a budżet do 65 536-268 435 456 sprite'ów.

**Etap drugi - rozdzielczość.** Dopiero gdy budżet już jest na dolnej granicy, a klatki nadal są o ponad 10% za wolne, rozdzielczość bufora ciepła spada o 8% na klatkę, aż do 25% płótna. Odzyskuje 4% na klatkę, gdy jest 30% zapasu. Koszt fragmentów maleje z kwadratem rozdzielczości, co przy gładkim gradiencie jest prawie niewidoczne. (Zmierzone na renderowaniu programowym z 10 M wierszy i przerośniętymi sprite'ami: 141 ms → 17 ms na klatkę). Skala jest zaokrąglana do szesnastych; *Rozdz. ciepła* w nakładce ją pokazuje.

**Rezygnacja.** Wolna klatka wygląda tak samo, czy winę ponoszą sprite'y, czy ciężki poziom. Nie ma pomiaru czasu na przebieg. Jeśli budżet siedzi na dolnej granicy, a klatki przez 30 klatek zostają poniżej 70% celu, to nie sprite'y są kosztem. Regulator przechodzi wtedy w **wspinaczkę**: mnoży budżet przez 1,5 co 14 klatek i przywraca rozdzielczość, dopóki czas klatki mieści się w 1,5-krotności tego, czym był na dolnej granicy. Wspinaczka, która pogarsza sprawę ponad to, cofa się do 60% i wraca do zwykłej kontroli. Osiągnięcie celu kończy wspinaczkę.

Przy wyłączonym adaptacyjnym budżecie budżetem jest po prostu **Sprite'y / klatka**.

Gdy *Rysuj każdy wiersz w każdej klatce* jest włączone, adaptacyjny budżet nadal działa, ale ścisła reguła podnosi budżet tak, by objąć wszystkie wiersze kandydujące. W praktyce steruje więc tylko etapem rozdzielczości i klatkami, które nie zaczynają świeżego szacunku.
