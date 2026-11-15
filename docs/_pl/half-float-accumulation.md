---
title: "Akumulacja half-float"
parent: "Wnętrze renderowania"
nav_order: 4
lang: "pl"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Akumulacja half-float

Niektóre karty graficzne potrafią trzymać ciepło tylko w małych 16-bitowych liczbach, co mogłoby ściąć albo zaokrąglić najgorętsze miejsca. Przeglądarka skaluje liczby tak, by to nie było widać. Nic nie musisz robić; ta strona jest dla programistów.

## Dla programistów {#for-developers}

Urządzenie, które nie potrafi mieszać do tekstur 32-bitowych zmiennoprzecinkowych (brak `float32-blendable` i `float32-filterable` w WebGPU, brak `EXT_float_blend` w WebGL2), dostaje cel ciepła w **16-bitowej liczbie zmiennoprzecinkowej** (`r16float`): maksimum 65 504 i 11 bitów mantysy. Gęste pole sięga kilkuset tysięcy, więc 16-bitowy cel jednocześnie **ścina** i **zaokrągla**, a błąd zaokrąglenia rośnie wraz z wartością - co wygląda bardzo konkretnie: najgęstsze obszary wyglądają na dużo chłodniejsze, niż są, a rzadkie wyglądają dobrze. Obsługują to dwa mechanizmy; obraz jest poprawny tylko wtedy, gdy działają oba.

### Zakres: wzmocnienie każdego rozpylenia {#range-a-gain-on-every-splat}

Każde rozpylenie jest mnożone przez **wzmocnienie** (*gain*), a składanie dzieli je z powrotem, więc pole leży w zakresie wielkości, z którym połówki zmiennoprzecinkowe radzą sobie dobrze ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = analityczne oszacowanie nasycenia dla tego zbioru danych, promienia i intensywności środka
gain     = 2 ^ round(log2(2048 / estimate)),  wykładnik ograniczony do -20..20
```

2048 zostawia około 32-krotny zapas nad szczytem rampy przed 65 504. Wzmocnienie jest **potęgą dwójki**, więc niewielki dryf oszacowania go nie zmienia - ani zgromadzonego bufora. Jest częścią [sygnatury geometrii](accumulation.md#what-restarts-it), więc zmiana restartuje akumulację.

Jest zakotwiczone w analitycznym oszacowaniu, a celowo **nie** w punkcie nasycenia. Nasycenie jest stosowane przy składaniu właśnie po to, by przeciąganie go nigdy nie restartowało zbieżności; gdyby wzmocnienie przesuwało się razem z nim, bufor nadal zawierałby wartości zapisane przy starym wzmocnieniu, podczas gdy składanie dzieliłoby przez nowe, dwa błędy znosiłyby się dokładnie i suwak wydawałby się nic nie robić.

Na celu 32-bitowym wzmocnienie zawsze wynosi 1.

### Precyzja: częściowe klatki od zera {#precision-partial-frames-from-zero}

Klatka scalana z akumulatorem z wagą 1/n jest najpierw rozpylana do **bufora roboczego** od zera, a dopiero potem mieszana, zamiast być rozpylana bezpośrednio do akumulatora z wagą 1/n ([Akumulacja](accumulation.md#why-each)). Bezpośrednio wkład każdego sprite'a byłby 1/n wielkości bieżącej sumy, do której jest dodawany, a połówka zmiennoprzecinkowa zaokrągla to do zera - tym gorzej, im gęstszy piksel. Od zera każdy składnik jest porównywalny z sumą, do której dołącza, czyli to samo działanie arytmetyczne, które już wykonuje pojedyncza klatka.

### Zmierzony efekt {#measured-effect}

Na gęstej, syntetycznej scenie, przy odczycie pola w tych samych jednostkach:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bitowy (wzorzec) | 6051 | 60742 | 121199 | 232744 |
| 16-bitowy przed | 1372 | 6972 | 7840 | 7840 |
| 16-bitowy po | 5996 | 59666 | 118824 | 210357 |

Szczyt przeszedł z 30 razy za niskiego do 0,90 razy, a składany obraz zgadza się z 32-bitowym w granicach 0,1% średniej jasności.

### Jak to sprawdzić {#testing-it}

`?heat=f16` wymusza tę ścieżkę na obu silnikach - bez przełącznika arytmetykę, którą uruchamiają tylko słabsze karty, testowaliby tylko ludzie, którzy by ją uruchamiali. `npm run smoke:f16` uruchamia cały zestaw testów przeglądarki z tym przełącznikiem.

Odczyty cofają wzmocnienie: auto-ekspozycja dzieli odczytane pole przez nie, a `engine.readHeatProbe()` przekazuje je rendererowi - tak też czyta się [odczyt ciepła na żywo linijki](measure.md#notes).
