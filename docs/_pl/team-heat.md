---
title: "Ciepło drużyn"
parent: "Tryby ciepła"
nav_order: 6
lang: "pl"
source: "team-heat.md"
source_hash: "e18e62600e3e"
translated: true
outdated: false
---

# Ciepło drużyn

Ciepło drużyn pokazuje, gdzie była każda drużyna, każda we własnym kolorze. Tam, gdzie drużyny się nakładają, kolory się mieszają.

**Ciepło drużyn** (klawisz 3) to pole gęstości z [Ciepła](heat.md), w którym każda [grupa](glossary.md) ma własny odcień. Tam, gdzie grupy się nakładają, ich odcienie się mieszają; równa walka wychodzi neutralnie. Krycie nadal niesie gęstość dokładnie tak jak w innych trybach, więc obraz odpowiada jednocześnie na pytanie *ile* i *czyje*. Wymaga kolumny grup.

![Ciepło drużyn: każda strona we własnym kolorze; tam, gdzie się nakładają, kolory się mieszają](../assets/img/pl/heat-teams.webp)

To nie jest [nakładka sylwetek](box-replay.md): ona rysuje jedną sylwetkę na osobę; to jest pole ciepła pokolorowane tą samą kolumną.

## Jak tego używać {#how-to-use-it}

1. Naciśnij `3` (albo wybierz **Ciepło drużyn** na pasku trybów).
2. Otwórz **Kolory ciepła**. Próbki pokazują kolor każdej grupy; najedź na próbkę, aby zobaczyć nazwę drużyny.
3. Jeśli wszystko wygląda na szare, podnieś **Rozdzielenie kolorów**.
4. Odznacz grupę na [Liście drużyn](teams-list.md), aby ją wyłączyć; pozostałe kolory zostają na miejscu.

## Sterowanie {#controls}

W sekcji **Kolory ciepła**:

| Sterowanie | Domyślnie | Znaczenie |
|---|---|---|
| Próbki | | Kolor każdej grupy, dla pierwszych 12 grup, potem *+N więcej*. Najedź, aby zobaczyć nazwę grupy i kolor. |
| **Rozdzielenie kolorów** | 1.4 | Jak daleko mieszanina jest odsuwana od neutralnej, 0-4. 0 robi wszystko szare; 1 to prawdziwa średnia; powyżej około 2 najjaśniejsze mieszaniny wychodzą poza zakres wyświetlania i są obcinane dla każdego kanału, co przesuwa ich odcień. |
| **Gradient krycia (kolor pochodzi z grupy)** | domyślny gradient ciepła | Używany jest tu tylko **kanał alfa** gradientu: przezroczysty tam, gdzie nic nie ma, nieprzezroczysty na szczycie. Jego kolory są ignorowane. |

Grupa, której etykieta oznacza „brak grupy” (`0`, puste, `none`, `unknown`, `null` albo `-1`), jest rysowana na szaro.

Wszystkie pozostałe sterowania ciepłem - kształt, nasycenie, reakcja, minimalne ciepło, głębia, odrzucanie - działają tak jak w [Cieple](heat.md).

[Lista drużyn](teams-list.md) pokazuje kolor ciepła drużyn każdej grupy jako jej próbkę w tym trybie. Ukrycie grupy zostawia kolor każdej innej grupy na miejscu: odcienie pochodzą z łącznej liczby grup, a nie z tego, co jest włączone, więc dwa obrazy pozostają porównywalne.

## Dla programistów {#for-developers}

### Paleta {#the-palette}

Z [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Kolory leżą na płaszczyźnie barw **Oklab** przy stałej jasności (0,7) i chromatyczności (0,115), więc każda grupa jest równie jasna i czerwona grupa nie wygląda na cieplejszą od niebieskiej.
- Przy *n* grupach koło odcieni dzieli się na *n* równych części, a grupa *i* bierze **środek** swojej części, `(i + 0,5) / n` obrotu. Każde dwie grupy są od siebie tak daleko, jak pozwala liczba, a przeciwieństwa pozostają przeciwieństwami, cokolwiek by to nie było.
- Używanych jest najwyżej **16** różnych odcieni. Przy większej liczbie grup id są rozmieszczane przez wielokrotne dzielenie na pół (id z odwróconymi bitami: 0, ½, ¼, ¾, ⅛, …), by sąsiednie id nie miały wspólnego odcienia; grupy powyżej 16 muszą dzielić odcienie.
- Grupa, której etykieta oznacza „brak grupy” - `0`, puste, `none`, `unknown`, `null` albo `-1`, bez względu na wielkość liter - jest rysowana jako **neutralna szarość** zamiast brać wycinek koła. Tak traktowana jest tylko pierwsza taka etykieta na liście grup.

Domyślne rozdzielenie to 1,4, a nie 1, bo przy 1 mieszanina pięciu równo rozłożonych odcieni *jest* szara: poprawnie, ale nieczytelnie. Nieco powyżej 1 zachowuje uczciwość remisów, a jednocześnie czyni widocznym podział 60/40.

### Jak to działa {#how-it-works}

Cel ciepła ma w tym trybie cztery kanały. Każda sprite'a dodaje swoją gęstość *v* do pierwszego kanału, a *v* × współrzędne Oklab *a* i *b* grupy do drugiego i trzeciego. Przy składaniu mieszanina piksela to średnia ważona gęstością: *a* = G / R, *b* = B / R, skalowana rozdzieleniem kolorów i przeliczana na sRGB przy jasności palety. Dzielenie przez zgromadzoną gęstość sprawia, że odcień nie zależy od tego, ile jest danych, i dlatego każde sterowanie gęstością działa wyłącznie na krycie.

Cel czterokanałowy kosztuje cztery razy tyle pamięci GPU co jednokanałowy cel ciepła przy tej samej rozdzielczości.
