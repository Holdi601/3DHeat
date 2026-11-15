---
title: "Pamięć GPU"
parent: "Wnętrze renderowania"
nav_order: 5
lang: "pl"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Pamięć GPU

Karta graficzna ma tylko określoną ilość pamięci. Jeśli twoje dane się w niej nie mieszczą, przeglądarka pokazuje, co się mieści, i mówi o tym wprost: nakładka statystyk dostaje bursztynowy wiersz **Nie w pamięci** z liczbą wierszy, które zostały pominięte. Skrócony zbiór danych, który wygląda na kompletny, byłby najgorszym błędem, jaki może popełnić narzędzie analityczne, dlatego ten wiersz nigdy nie jest ukrywany.

![Nakładka statystyk z bursztynowym wierszem Nie w pamięci](../assets/img/en/gpu-memory-not-resident.webp)

Aby zmieścić więcej, podnieś budżet GPU w **Budżety zasobów** i wczytaj ponownie ([Pamięć i budżety](memory-and-budgets.md#raising-the-gpu-budget)), najpierw zawęź dane albo użyj karty z większą pamięcią.

## Dla programistów {#for-developers}

### Jak wiersze są przechowywane w GPU {#how-rows-are-stored-on-the-gpu}

Wiersze są wysyłane raz, gdy nadchodzi zbiór danych, w **porcjach** po 8 388 608 wierszy (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Każda porcja jest kwantyzowana względem własnego prostopadłościanu ograniczającego i własnego zakresu czasu:

| Dane | Format | Bajty na wiersz |
|---|---|---|
| Pozycja X, Y, Z i id grupy | cztery 16-bitowe liczby całkowite bez znaku (RGBA16UI w WebGL2); X, Y, Z w obrębie prostopadłościanu porcji | 8 |
| Czas i czas życia (gdy zbiór ma i czas, i osobę) | dwie 16-bitowe liczby całkowite bez znaku (RG16UI): czas w obrębie zakresu czasu porcji; czas życia, gdzie 65 535 oznacza „brak następnej próbki” | 4 |

To prostopadłościany ograniczające dla każdej porcji sprawiają, że 16 bitów wystarcza: porcja zwykle obejmuje ułamek mapy, więc krok kwantyzacji wypada dużo poniżej centymetra na mapie o szerokości kilometrów, znacznie poniżej szumu w prawdziwej telemetrii. Id grupy w czwartym kanale nic nie kosztuje - i dlatego grup może być najwyżej 4096 ([Grupy](sessions-persons-groups.md#limits)).

W WebGL2 każda porcja to tekstura o szerokości 8192 texeli, dopełniona do pełnych wierszy tekstury; do wierszy dociera się z `gl_VertexID` przez teksturę indeksów bloków aktualizowaną co klatkę. W WebGPU to bufory pamięci.

Dodatkowa pamięć GPU na wiersz, przydzielana w miarę użycia:

- każdy aktywny [filtr](filters.md) kolumny: 4 bajty na wiersz (wartości zmiennoprzecinkowe 32-bitowe albo id kategorii), wysyłane dla każdej porcji przy pierwszym użyciu filtra;
- [ciepło linii](line-heat.md): 8 bajtów na wiersz (początek każdego segmentu, skwantowany w obrębie prostopadłościanu danych, i jego flagi), gdy tryb Linii jest włączony.

Do tego cele renderowania: kolor i głębia sceny, cel ciepła i jego bliźniaczy bufor roboczy (cztery kanały w [Cieple drużyn](team-heat.md)), warstwy depth-peeling dla [okluzji](depth-and-culling.md) oraz geometria poziomu.

### Budżet jest egzekwowany przy wysyłaniu {#the-budget-is-enforced-at-upload}

WebGL przyjmuje alokacje, których nie może obsłużyć, a potem albo traci kontekst, albo przechodzi na pamięć systemową ze strasznym kosztem, dlatego budżet GPU jest egzekwowany, gdy zbiór danych jest wysyłany ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- porcje są wysyłane po kolei (czyli w kolejności czasu), dopóki się mieszczą;
- pierwsza porcja, która się nie mieści, jest wysyłana **częściowo** - tyle pełnych wierszy tekstury, ile mieści pozostały budżet - zamiast wcale, więc budżet, który nie pomieści całej porcji, pokazuje tyle, ile może; a ponieważ wiersze są uporządkowane czasowo, pokazana część to spójny odcinek czasu;
- wszystko dalej jest **nie w pamięci**.

Brak nie jest ukrywany: nakładka statystyk pokazuje wiersz **Nie w pamięci** z liczbą wierszy, które się nie zmieściły, w kolorze bursztynowym, zawsze gdy jest większa od zera. Obcięty zbiór danych, który wygląda na kompletny, to najgorsza awaria, jaką może mieć narzędzie analityczne. [Sprawdzenie dopasowania](memory-and-budgets.md#the-fit-check) przed wczytaniem ma temu zapobiegać.

Budżet, którego używa renderer, to budżet GPU z **Budżety zasobów**, ta sama wartość, której używa sprawdzenie dopasowania - także powyżej wykrytej wartości, aż do górnej granicy suwaka (zobacz [Podnoszenie budżetu GPU](memory-and-budgets.md#raising-the-gpu-budget)). Jest stosowany przy wysyłaniu zbioru danych; zmiana później działa przy następnym wczytaniu.
