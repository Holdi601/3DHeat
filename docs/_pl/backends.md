---
title: "Dwa silniki"
parent: "Wnętrze renderowania"
nav_order: 1
lang: "pl"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Dwa silniki graficzne

Przeglądarka pozwala stronie korzystać z karty graficznej na dwa sposoby: WebGPU (nowszy) i WebGL2. Przeglądarka obsługuje oba i sama wybiera lepszy, więc zwykle nic nie musisz robić. Sprawdź, którego używasz: **Backend** w nakładce statystyk (u góry po prawej w widoku).

![Nakładka statystyk: Backend, FPS, Frame, Rows in window, Sprites / frame, Budget, Heat res, Coverage](../assets/img/en/performance-stats-overlay.webp)

Przeglądarka ma dwa pełne renderery za jednym interfejsem ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) i **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Oba rysują ten sam obraz tymi samymi algorytmami; shadery istnieją równolegle w WGSL i GLSL ES 3.00. Pierwsza linia nakładki statystyk, **Backend**, mówi, który działa; po najechaniu na nią widać, dlaczego nie użyto WebGPU, jeśli nie zostało użyte.

## Dla programistów {#for-developers}

### Jak wybierany jest silnik {#how-one-is-chosen}

Płótno może mieć tylko jeden rodzaj kontekstu, więc wybór zapada raz, przed jakimkolwiek rysowaniem ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Jeśli WebGL2 nie jest wymuszony: gdy istnieje `navigator.gpu`, żąda adaptera z `powerPreference: 'high-performance'` i urządzenia, po czym tworzy renderer WebGPU. Każdy błąd zostaje zapamiętany jako przyczyna.
2. Jeśli WebGPU był wymuszony i się nie powiódł, zatrzymujemy się: widok pokazuje *Nie można zainicjować renderera.* z przyczyną.
3. W przeciwnym razie tworzymy renderer WebGL2 (też żądając adaptera o wysokiej wydajności). Jeśli WebGL2 jest niedostępny albo nie może renderować do tekstur zmiennoprzecinkowych (`EXT_color_buffer_float`), widok pokazuje błąd.

`powerPreference: 'high-performance'` zapobiega temu, by laptop z przełączaną grafiką przydzielił stronie zintegrowany układ GPU. Poza tym strona nie ma tu nic do powiedzenia: akceleracja sprzętowa to ustawienie przeglądarki.

### Przełączniki w adresie URL {#url-switches}

Dopisz do adresu strony, na przykład `http://127.0.0.1:5273/?backend=webgl2`.

| Parametr | Efekt |
|---|---|
| `?backend=webgpu` | Użyj WebGPU albo zgłoś błąd. |
| `?backend=webgl2` | Użyj WebGL2, nawet gdy WebGPU jest dostępny - oddziela „to źle się renderuje" od „to źle się renderuje na WebGPU". |
| `?heat=f16` | Wymuś ścieżkę akumulacji ciepła 16-bitowego na dowolnym silniku ([Akumulacja half-float](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: odczytuj błędy GL podczas klatki i udostępniaj je w `renderer.heatDebug`. Domyślnie wyłączone, bo `getError` synchronizuje potok. |
| `?occdebug=<n>` | Pomoc dla programistów w WebGL2: zastępuje ciepło wartościami debugowania okluzji. Nie do zwykłego użytku. |

### Różnice, które mają znaczenie {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Przechowywanie wierszy | Bufory pamięci: indeks wiersza to indeks tablicy. Żąda największego rozmiaru wiązania bufora pamięci i rozmiarów buforów adaptera. | Tekstury całkowite (8192 texele szerokości) adresowane z `gl_VertexID` przez teksturę indeksów bloków, aktualizowaną co klatkę. |
| 32-bitowa akumulacja ciepła | Gdy adapter oferuje zarówno `float32-blendable`, jak i `float32-filterable` | Gdy obecne jest `EXT_float_blend` |
| W przeciwnym razie | 16-bitowa (`r16float`) | 16-bitowa (`R16F`) |
| Zakres głębi | [0, 1]; silnik mnoży przez remapowanie macierzy three.js z [-1, 1]. Bez tego rzut równoległy - którego głębia jest liniowa - trafia prawie w całości poniżej 0 i jest po cichu wycinany. | [-1, 1], używany bez zmian |
| Uniformy | Pierścień slotów wyrównanych do 256 bajtów, po jednym na rysowanie, wiązany przez przesunięcie - `queue.writeBuffer` jest uporządkowane w kolejce, więc jeden bufor przepisywany przy każdym rysowaniu sprawiłby, że każde rysowanie czytałoby ostatni zapis. Blok uniformów przebiegu ciepła to dokładnie jeden slot 256-bajtowy. | Zwykłe uniformy |
| Cel ciepła poniżej rozdzielczości płótna | Dostaje własną teksturę głębi (każdy załącznik w przebiegu musi mieć ten sam rozmiar) | |
| Przechwycenie klatki | `captureFrame()` renderuje kompozycję drugi raz do celu poza ekranem i odczytuje ją z powrotem (bezgłowy Chromium renderuje WebGPU, ale nie składa swojego płótna) | Odczytuje domyślny bufor ramki przy następnej renderowanej klatce |
| Odczyt | Bufory pośrednie zachowywane i używane ponownie; jeden czytelnik w locie naraz | `readPixels`, pytając sterownik, która para format/typ jest dozwolona |

Oba silniki przesyłają tabelę krzywej sprite'ów jako połówki zmiennoprzecinkowe; `queue.writeTexture` w WebGPU kopiuje surowe bajty, więc dane najpierw koduje się do binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Limity tekstur {#texture-limits}

`texStorage2D` powyżej `MAX_TEXTURE_SIZE` nie zgłasza wyjątku: alokacja zostaje odrzucona, późniejsze wysyłania się nie udają, a próbkowanie zwraca zero. Pomocnik WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) sprawdza oba wymiary względem limitu i zgłasza wyjątek z rozmiarem; tekstura indeksów bloków jest dwuwymiarowa (4096 szerokości), więc nie może przerosnąć limitu, a `src/render/limits.test.ts` przypina każdy wymiar tekstury do limitów wartych obsługi. Renderer WebGL2 odmawia też urządzenia, którego maksymalny rozmiar tekstury jest mniejszy niż szerokość 8192 tekstury wierszy.

### Testowanie obu {#testing-both}

`npm run smoke` uruchamia prawdziwą aplikację w bezgłowym Chromium na WebGL2 (domyślnie `http://127.0.0.1:5273/`); przekaż `"http://127.0.0.1:5273/?backend=webgpu"` do `node tools/smoke.mjs`, aby użyć WebGPU, a `npm run smoke:f16` dla ścieżki half-float. `tools/probe-webgpu.mjs` i `tools/probe-present.mjs` (wymienione w narzędziach dla programistów w [Narzędzia wiersza poleceń](ref-tools.md)) diagnozują dostępność adaptera i prezentacji w bezgłowych przeglądarkach.
