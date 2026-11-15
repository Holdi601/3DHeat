---
title: "Poziomy i geometria tła"
nav_order: 13
has_children: true
lang: "pl"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: true
---

# Poziomy i geometria tła

Poziom to trójwymiarowe miejsce, w którym działa gra - mapa, miasteczko, tor. Postawiony za Twoimi danymi pozwala zobaczyć, *gdzie* jest ciepło. Panel **Tło / poziom** (zob. [Słownik pojęć](glossary.md), hasło „poziom”) daje trzy rodzaje kontekstu:

- **obraz mapy**, zgeoreferencjonowany dwiema kotwicami - zob. [Obrazy map](map-images.md);
- **poziom 3D** - `.glb`, `.gltf`, `.obj`, `.stl` albo `.ply` - podzielony na grunt, konstrukcje i wodę oraz uproszczony przy imporcie - zob. [Poziomy 3D](model-levels.md) i [Wygląd poziomu](level-appearance.md);
- **tło świata** - dla nagrania, które mówi, gdzie na Ziemi się odbyło (plik ACMI Tacview), prawdziwy teren, drogi, wodę, lotniska i budynki, pobrane z otwartych danych - zob. [Tło świata](world-backdrop.md).

Gdy nic nie jest wczytane, scena jest ciemna, z siatką i kolorowymi osiami (**Siatka** i **Osie** w [Kamera i scena](camera.md)), a panel mówi: *Nic nie wczytano - scena pokazuje siatkę i osie. Dodaj obraz mapy albo siatkę poziomu, aby dać cieplu kontekst.*

Poziom jest wspólny dla wszystkich trzech kart: trasa wczytana w karcie Analiza wyścigowa to ten sam poziom, który pokazuje mapa cieplna.

![Panel Tło / poziom z wczytanym poziomem: przyciski Obraz mapy i Model 3D, Teatr działań, Krycie, Jasność, Zapisz w bibliotece i lista Biblioteka](../assets/img/pl/level-panel.webp)

## Połóż poziom za swoimi danymi {#put-a-level-behind-your-data}

1. Najpierw wczytaj dane ([Wczytywanie danych](getting-data-in.md)), by poziom został dopasowany do nich.
2. Otwórz **Tło / poziom** w pasku bocznym.
3. Naciśnij **Obraz mapy…** dla obrazka albo **Model 3D…** dla poziomu 3D i wybierz plik. Dla nagrania z prawdziwego świata użyj zamiast tego **Tło z prawdziwego świata** albo **Teatr działań**.
4. Poczekaj, aż linia postępu się skończy. Duży model najpierw się upraszcza (zob. **Cel upraszczania** niżej).
5. Naciśnij **F** w widoku, aby objąć wszystko kadrem. Używaj **Krycia** i **Jasności**, aż ciepło wyróżni się na tle poziomu.
6. Naciśnij **Zapisz w bibliotece**, jeśli będziesz z niego korzystać ponownie ([Biblioteka poziomów](level-library.md)).

## Co poziom robi dla ciepła {#what-a-level-does-for-the-heat}

- **Zasłania**: punkty danych za nim są przyciemniane według powierzchni, a punkty za terenem są ukryte ([Głębia i odrzucanie](depth-and-culling.md)). Bez poziomu nie ma zasłaniania.
- Jest **cięty** przez [Przekrój](slice.md) i, przy *Tnij też poziom*, przez [odrzucanie według odległości](depth-and-culling.md#distance-culling), razem z ciepłem.
- Jest jedyną rzeczą, którą [głębia ostrości](camera.md#depth-of-field) rozmywa, obok siatki i pudełek.
- Poziom 3D **poszerza dalszą płaszczyznę kamery**, gdy jest większy niż dane: bliska i dalsza płaszczyzna są kalibrowane z zbioru danych, a wyeksportowana mapa o szerokości kilku kilometrów leżałaby w całości za dalszą płaszczyzną i zostawiła pusty widok. Dalsza płaszczyzna staje się 3 × poziomym zasięgiem poziomu, gdy to więcej, bliska płaszczyzna przesuwa się razem z nią (co najmniej dalsza / 100 000), by zachować precyzję głębi, od której zależy zasłanianie, a prędkość lotu rośnie do co najmniej zasięg / 12. Poszerzane jest tylko w górę, nigdy nie zawęża się.

## Panel od góry do dołu {#the-panel-top-to-bottom}

| Część | Szczegóły |
|---|---|
| **Obraz mapy…**, **Model 3D…** | Wczytaj jeden; zastępuje bieżący poziom. |
| **Tło z prawdziwego świata**, **Zapomnij kafelki map** | Tylko dla zbioru danych z odniesieniem geograficznym: buduje prawdziwe miejsce pod nim jako poziom albo usuwa pobrane kafelki. [Tło świata](world-backdrop.md) |
| **Cel upraszczania** | Budżet trójkątów przy następnym imporcie modelu: *Pełny - bez upraszczania* (domyślnie), *Wysoki - 8 mln*, *Średni - 3 mln*, *Niski - 800 tys.*, *Sylwetka - 100 tys.* [Poziomy 3D](model-levels.md#simplification) |
| Postęp i **Anuluj** | Podczas dekodowania albo importu. |
| Uwaga o imporcie | Trójkąty przed i po, podział na grunt / konstrukcje / wodę, użyty poziom szczegółowości. |
| Nazwa i rozmiar | `szerokość×wysokość px · x × z m/px` dla obrazu, `N trójkątów (z M)` dla modelu. |
| **Krycie**, **Jasność** | Oba rodzaje. |
| Pola obrazu | **Odbarwienie**, **Odwróć północ/południe**, **Umiejscowienie** (dwie kotwice), **Dopasuj do zakresu danych**, **Wysokość**. [Obrazy map](map-images.md) |
| Pola modelu | Rzeźba terenu, woda, trójkąty gruntu, siatka drutowa, tekstura, przechwycony kolor, konstrukcje, klasyfikacja części. [Wygląd poziomu](level-appearance.md) |
| **Zapisz w bibliotece**, **Usuń** | [Biblioteka poziomów](level-library.md); Usuń zdejmuje poziom. |
| **Biblioteka** | Poziomy zapisane w tej przeglądarce. [Biblioteka poziomów](level-library.md) |

## Strony w tej sekcji {#pages-in-this-section}

- [Obrazy map](map-images.md)
- [Poziomy 3D](model-levels.md) - formaty, części, klasyfikacja, upraszczanie, tekstury
- [Wygląd poziomu](level-appearance.md) - każde pole dla poziomu 3D
- [Biblioteka poziomów](level-library.md)
- [Tło świata](world-backdrop.md) - prawdziwy świat pod nagraniem, z otwartych danych

Jak wydobywać poziomy z gier i silników, to zadanie osobnych narzędzi eksportujących (zob. [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) repozytorium); format, do którego piszą, streszcza [Poziomy 3D](model-levels.md#the-exporter-contract).
