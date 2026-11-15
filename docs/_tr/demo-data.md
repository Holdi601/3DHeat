---
title: "Demo verileri"
nav_order: 2
lang: "tr"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# Demo verileri: görüntüleyiciyi beş dakikada deneyin

![Demo Valley'de on tank maçının ısısı: adım 4'ün gösterdiği](../assets/img/en/heat-hero.webp)

Henüz kendi verileriniz yok mu? Depo bazılarını üretir. İçindeki her şey uydurmadır: bir vadi, bir avlu ve üç uydurma oyun tarzında maçlar; oyuncuların adı *Blue 1* ya da *Red 3*. Bu sitedeki resimlerin tümü bununla çekildi.

## Üretin {#make-it}

```bash
node tools/demo-data.mjs
```

Bu, `tools/.shots/demo/` klasörüne yazar:

| Dosya | Ne içerir |
|---|---|
| `demo-valley.glb` | iki tepe ve bir köyü olan 12 km'lik bir vadi, 3B harita olarak |
| `demo-yard.glb` | binaları olan 160 m'lik duvarlı bir avlu, 3B harita olarak |
| `tanks.parquet` | 10 tank maçı, 8'e karşı 8: hareket, atışlar, gövdedeki yere göre isabetler, yangınlar, öldürmeler, enkazlar, taret nişanı, kazananlar |
| `tanks/match-NN.parquet` | aynı maçlar, her biri ayrı bir dosyada, [birçok maç birden](many-matches.md) için |
| `air.parquet` | füzeler, fişekler, öldürmeler ve kaçırmalarla 4'e karşı 4 hava muharebesi |
| `shooter.parquet` | yaya olarak 5'e karşı 5 olan 12 tur: atışlar, öldürmeler, bir bomba kurulumu, kazanılan ve harcanan krediler, kasklar ve yardımcı öğeler |
| `mass/` | [toplu analiz](mass-analysis.md) için küçük `.3dheat` maçlarından oluşan bir klasör |
| bir tur kümesi | uydurma bir pistte tek bir arabanın iki turu, [Yarış analizi](race-analysis.md) için |

Her tablo sütunlarını kendi altbilgisinde adlandırır; bu yüzden hiçbir eşleme yapmadan yüklenir.

## Deneyin {#try-it}

1. Görüntüleyiciyi başlatın (Windows'ta `start.bat`, ya da herhangi bir sistemde bir kez `npm install` ve ardından `npm run dev`) ve `http://127.0.0.1:5273/` adresini açın.
2. **Arka plan / bölüm → 3B model…** seçin ve `demo-valley.glb` dosyasını seçin.
3. **Kaynak → Dosyalar…** seçin ve `tanks.parquet` dosyasını seçin.
4. Verileri çerçevelemek için `F` tuşuna basın. On maçın [ısısını](heat.md) görürsünüz.
5. Mod çubuğunu deneyin: **Fark** (Blue'ya karşı Red), **Takım ısısı**, **Çizgiler**.
6. **İçgörüler**'i açın (Isı haritası kenar çubuğunda): diğer yerlerden çok daha fazla ateş edilen, isabet alan ve yok edilen yerleri bulur - iki tepenin çevresinde.
7. **Maç** sekmesini açın; **Tekrardaki maçlar** altında *Match 01* seçin; zaman çizelgesinde **Oynat**'a basın: [tekrar](match-replay.md).

![Tankların figür olarak göründüğü Match 01 tekrarı](../assets/img/en/replay-overview.webp)

Shooter için `demo-yard.glb` ve `shooter.parquet` dosyalarını yükleyin; hava muharebesi için `air.parquet` dosyasını (figürler **Figür boyutu** 4'te daha kolay görülür; bu, Isı haritası kenar çubuğunun **Takım görüntüleyici** panelindeki bir kaydırıcıdır).

## Ekran görüntüleri {#the-screenshots}

Sitenin resimleri bu verilerden bir betikle, görüntüleyicinin dillerinden herhangi birinde yapılır:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

Ekran görüntüsü sunucusu yerel bir figür paketi olmadan çalışır; bu yüzden yalnızca herkese açık figür kataloğu gösterilir. Resimler `docs/assets/img/<lang>/` klasörüne gider. Bkz. [Belgelerin bakımı](maintaining.md).
