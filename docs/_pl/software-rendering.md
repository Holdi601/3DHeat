---
title: "Wykrywanie renderowania programowego"
parent: "Wnętrze renderowania"
nav_order: 6
lang: "pl"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Wykrywanie renderowania programowego

Jeśli twoja przeglądarka rysuje na głównym procesorze zamiast na karcie graficznej, przeglądarka działa wielokrotnie wolniej. Przeglądarka to zauważa i pokazuje czerwone pole, które mówi, co włączyć.

Gdy przeglądarka ma wyłączoną akcelerację sprzętową albo jej sterownik jest na czarnej liście, rysuje WebGL i WebGPU na procesorze. Wszystko nadal działa, wielokrotnie wolniej, a objaw brzmi: „ta przeglądarka jest z moimi danymi nie do użycia” - to wskazuje na narzędzie, a nie na przełącznik w przeglądarce. Dlatego przeglądarka patrzy na nazwę renderera i mówi o tym wprost ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Baner {#the-banner}

Gdy renderer zostanie jednoznacznie rozpoznany jako programowy, na górze paska bocznego (w kartach Mapa cieplna i Mecz), nad paskiem trybów, pojawia się czerwone pole:

![Czerwony baner: Działa bez karty graficznej](../assets/img/en/software-rendering-banner.webp)

> **Działa bez karty graficznej.**
> Ta przeglądarka rysuje na procesorze zamiast na karcie graficznej, co jest wielokrotnie wolniejsze i nie poradzi sobie z dużymi zbiorami danych. Włącz akcelerację sprzętową w ustawieniach przeglądarki (Chrome: Ustawienia → System → „Używaj akceleracji grafiki, gdy jest dostępna”, a potem uruchom ją ponownie) i sprawdź, czy sterownik karty graficznej jest aktualny.

## Dla programistów {#for-developers}

### Jak to rozstrzyga {#how-it-decides}

Ciąg renderera - `UNMASKED_RENDERER_WEBGL` w WebGL2 albo dostawca, architektura i urządzenie adaptera w WebGPU - jest zamieniany na małe litery i klasyfikowany:

- **programowy**, gdy zawiera `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` albo `generic renderer`;
- **sprzętowy**, gdy zawiera znanego dostawcę albo rodzinę GPU (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **nieznany** w pozostałych przypadkach.

Tylko *programowy* włącza baner. Nierozpoznany adapter nie mówi nic: wysyłanie kogoś z działającym GPU do przestawiania przeglądarki to gorsza awaria niż przeoczenie przypadku.

### Krótka nazwa {#the-short-name}

Ten sam moduł skraca ciąg renderera do wyświetlenia: z ciągu ANGLE, takiego jak `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)`, zachowuje pole urządzenia, usuwa identyfikator PCI oraz końcowy model API i shadera, i pokazuje `Vendor Model`. Krótka nazwa pojawia się w **Budżety zasobów**, z pełnym ciągiem jako podpowiedzią; oszacowanie pamięci pokazuje pełny ciąg.
