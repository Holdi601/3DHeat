---
title: "Belgelerin bakımı"
nav_order: 23
lang: "tr"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Belgelerin bakımı

Bu sayfa, görüntüleyiciye ve bu siteye bakan kişi içindir. Bir değişikliğin ardından sayfaların, resimlerin ve çevirilerin doğru kalması için adımları listeler.

Bu site **her sürümde** ve bir şey çok değiştiğinde yeniden denetlenir: tuş atamaları, arayüzdeki yol, ayarlar, dosya biçimleri. Denetim listesi:

1. **Başvuru sayfalarını yeniden üretin**: `node tools/docs-refs.mjs` (ve her dil için `--lang <dil>`). `node tools/docs-refs.mjs --check`, bir sayfa güncel değilse başarısız olur.
2. **Ekran görüntülerini [demo verisinden](demo-data.md) yeniden üretin**. Bölgesi en-US olan bir bilgisayar ya da kapsayıcı kullanın; böylece sayılar `0.35` olarak okunur, `0,35` olarak değil (sayı kutuları, değiştirilene kadar tarayıcının bölgesini izler). Demo verisini `node tools/demo-data.mjs` ile üretin, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1` ile 5321 numaralı bağlantı noktasında bir geliştirme sunucusu başlatın **yerel figür paketi olmadan**, sonra `node tools/docs-shots.mjs --lang <dil>` çalıştırın. Her resme bakın: yalnızca demo adları (*Demo Valley*, *Blue 1*, *Red 3* ...), gerçek harita, oyuncu ya da kayıt olmamalı.
3. **Son sürüm etiketinden beri neyin değiştiğini listeleyin**: `git log --oneline <son etiket>..HEAD` ve `CHANGELOG.md` dosyasının **Docs** bölümü; burada her özellik sayfasıyla eşleştirilir. Her yeni özelliğin bir sayfası ya da bölümü olmalı; ekranda göründüğü yerde bir resmiyle.
4. **Sayfaları yazmamış biri tarafından İngilizce sayfaların bağımsız incelemesi**, üç okur için: bir acemi, sekiz yaşında bir çocuk, bir uzman. Adımlar eksiksiz ve doğru sırada mı, sözcükler arayüzün sözcükleri mi, resimler güncel mi, şemaların etiketleri doğru mu?
5. **İncelemenin bulduklarını düzeltin.**
6. **Değişen sayfaları kaynak karmasına göre yeniden çevirin**, sonra dil başına incelemeyi çalıştırın. `tools/docs-translate.md` dosyasına bakın.
7. **Değişen dosyalarda gizli terimleri tarayın** ve hiçbir resmin demo verisinden başka bir şey göstermediğini denetleyin.
8. Yalnızca sürüm onaylandığında **yayımlayın**.

Aynı denetim, ilgili depoların belge sitelerini de kapsar (bkz. [Ana sayfa](index.md#related-repositories)).

## exporters/ altındaki araçlar {#the-tools-under-exporters}

Görüntüleyicinin çevresindeki araçlar ayrı herkese açık projelerdir; her birinin kendi MIT lisansı, sürümleri, wiki'si ve güncelleme denetimi vardır ve bu depoda git alt modülleri olarak sabitlenmiştir:

| Klasör | Depo |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - oyunların kendi arşivlerinden pistler ve seviyeler |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - tur telemetri kaydediciler; oyun videosundan seviyeler |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - Unreal Editor eklentisi |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2 demoları ve haritalar |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - oyunu arka planda kaydeder |

**Sabitlenmiş**, bu deponun her aracın tam olarak bir commit'ini kaydettiği anlamına gelir. Görüntüleyicinin bir kopyası bu commit'leri alır:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# veya düz bir klonlamadan sonra:
git submodule update --init
```

Yukarıdaki iki güncelleme yolu da çekmeden sonra `git submodule update --init` çalıştırır; böylece araçlar görüntüleyiciyi, en yeni sürümünün sabitlediği commit'lere kadar izler; araçların kendi en yeni commit'lerine değil. Bir aracın daha yeni bir sürümü, bu depodaki sabit değiştirildiğinde görüntüleyiciye ulaşır: bir araçtaki değişiklikler önce kendi klasöründe (kendi deposunda) commit'lenir ve gönderilir, sonra yeni sabit burada commit'lenir. Her araç kendi daha yeni sürümlerini de denetler; bu, kendi deposunda belgelenmiştir.
