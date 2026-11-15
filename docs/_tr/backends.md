---
title: "İki arka uç"
parent: "Çizim iç yapısı"
nav_order: 1
lang: "tr"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# İki arka uç

Bir tarayıcı, bir sayfanın grafik kartını iki yoldan kullanmasına izin verebilir: WebGPU (daha yeni) ve WebGL2. Görüntüleyici ikisini de kullanabilir ve en iyisini kendisi seçer, bu yüzden normalde bir şey yapmanız gerekmez. Hangisinde olduğunuzu görmek için istatistik katmanındaki **Arka uç** satırına bakın (görünümün sağ üstü).

![İstatistik katmanı: Arka uç, FPS, Kare, Pencerede satır, Sprite / kare, Bütçe, Isı çöz., Kapsama](../assets/img/en/performance-stats-overlay.webp)

Görüntüleyicide, tek bir arayüzün arkasında iki eksiksiz oluşturucu vardır ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) ve **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). İkisi de aynı algoritmalarla aynı resmi çizer; gölgelendiriciler WGSL ve GLSL ES 3.00 olarak yan yana bulunur. İstatistik katmanının ilk satırı olan **Arka uç**, hangisinin çalıştığını söyler. Üzerine gelince, WebGPU kullanılmadıysa nedenini gösterir.

## Geliştiriciler için {#for-developers}

### Biri nasıl seçilir {#how-one-is-chosen}

Bir tuval yalnızca bir tür bağlam tutabilir, bu yüzden seçim çizimden önce bir kez yapılır ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. WebGL2 zorlanmadıysa: `navigator.gpu` varsa `powerPreference: 'high-performance'` ile bir adaptör ve bir aygıt istenir ve WebGPU oluşturucusu yaratılır. Her hata neden olarak kaydedilir.
2. WebGPU zorlanmış ve başarısız olmuşsa durulur: görünüm nedeniyle birlikte *Oluşturucu başlatılamadı.* yazar.
3. Aksi halde WebGL2 oluşturucusu yaratılır (yine yüksek performanslı adaptör istenir). WebGL2 yoksa ya da kayan noktalı dokulara çizemiyorsa (`EXT_color_buffer_float`), görünüm hatayı gösterir.

`powerPreference: 'high-performance'`, geçişli grafik olan bir dizüstü bilgisayarın sayfaya tümleşik GPU'sunu vermesini engeller. Bunun ötesinde sayfanın söz hakkı yoktur: donanım hızlandırma bir tarayıcı ayarıdır.

### URL anahtarları {#url-switches}

Sayfa adresinin sonuna ekleyin, örneğin `http://127.0.0.1:5273/?backend=webgl2`.

| Parametre | Etkisi |
|---|---|
| `?backend=webgpu` | WebGPU kullan, yoksa başarısız ol. |
| `?backend=webgl2` | WebGPU'nun olduğu yerde bile WebGL2 kullan. "Bu yanlış çiziyor" ile "bu WebGPU'da yanlış çiziyor" durumlarını ayırır. |
| `?heat=f16` | Her iki arka uçta da 16 bit ısı biriktirme yolunu zorla ([Yarım kayan nokta birikimi](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: kare sırasında GL hatalarını okur ve `renderer.heatDebug` üzerinde gösterir. Varsayılan olarak kapalıdır, çünkü `getError` bir boru hattı eşitleme noktasıdır. |
| `?occdebug=<n>` | WebGL2 geliştirici yardımcısı: ısıyı örtme hata ayıklama değerleriyle değiştirir. Normal kullanım için değildir. |

### Önemli farklar {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Satır depolaması | Depolama tamponları: satır indeksi bir dizi alt simgesidir. Adaptörün en büyük depolama tamponu bağlamasını ve tampon boyutlarını ister. | Tam sayı dokuları (8.192 texel genişlik), kare başına bir blok indeksi dokusu üzerinden `gl_VertexID` ile adreslenir. |
| 32 bit ısı biriktirme | Adaptör hem `float32-blendable` hem `float32-filterable` sunduğunda | `EXT_float_blend` varsa |
| Aksi halde | 16 bit (`r16float`) | 16 bit (`R16F`) |
| Derinlik aralığı | [0, 1]; motor, three.js'in [-1, 1] matrislerinin bir yeniden eşlemesini önceden çarpar. Bu olmadan, derinliği doğrusal olan paralel bir projeksiyon neredeyse tamamen 0'ın altına düşer ve sessizce kırpılır. | [-1, 1], olduğu gibi kullanılır |
| Tekdüzeler (uniform) | Çizim başına bir tane, 256 bayta hizalı yuvalardan oluşan bir halka; kayma ile bağlanır. `queue.writeBuffer` kuyrukta sıralıdır, bu yüzden çizim başına yeniden yazılan tek bir tampon her çizimin son yazılanı okumasına neden olurdu. Isı geçişinin tekdüze bloğu tam olarak tek bir 256 baytlık yuvadır. | Olağan tekdüzeler |
| Tuval çözünürlüğünün altındaki ısı hedefi | Kendi derinlik dokusunu alır (bir geçişteki her ek aynı boyutta olmalıdır) | |
| Kare yakalama | `captureFrame()` bileşimi ekran dışı bir hedefe ikinci kez çizer ve geri okur (başsız Chromium WebGPU çizer ama tuvalini bileştirmez) | Bir sonraki çizilen karede varsayılan çerçeve arabelleğini geri okur |
| Geri okuma | Hazırlama tamponları tutulur ve yeniden kullanılır; aynı anda yalnızca bir okuyucu uçuşta | `readPixels`, hangi biçim/tür çiftinin geçerli olduğunu sürücüye sorarak |

İki arka uç da sprite eğri tablosunu yarım kayan noktalar olarak yükler. WebGPU'nun `queue.writeTexture` ham baytları kopyaladığı için veri önce binary16'ya kodlanır ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Doku sınırları {#texture-limits}

`MAX_TEXTURE_SIZE` değerinin üzerindeki bir `texStorage2D` hata vermez: ayırma düşer, sonraki yüklemeler başarısız olur ve örnekleme sıfır döndürür. WebGL2 yardımcısı [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) iki boyutu da sınırla karşılaştırır ve boyutla birlikte hata verir. Blok indeksi dokusu iki boyutludur (4.096 genişlik), bu yüzden bir sınırı aşamaz. `src/render/limits.test.ts`, desteklemeye değer her doku boyutunu sınırlara karşı sabitler. WebGL2 oluşturucusu, en büyük doku boyutu satır dokusunun 8.192 genişliğinin altında olan bir aygıtı da reddeder.

### İkisini de sınama {#testing-both}

`npm run smoke`, gerçek uygulamayı başsız Chromium'da WebGL2 üzerinde sürer (varsayılan olarak `http://127.0.0.1:5273/`). WebGPU için `node tools/smoke.mjs` komutuna `"http://127.0.0.1:5273/?backend=webgpu"` verin, yarım kayan nokta yolu için `npm run smoke:f16` kullanın. `tools/probe-webgpu.mjs` ve `tools/probe-present.mjs` (kullanılabilecek [Komut satırı araçları](ref-tools.md) sayfasında geliştirici araçları altında listelenir), başsız tarayıcılarda adaptör ve sunum kullanılabilirliğini teşhis eder.
