---
title: "Performans paneli ve istatistikler"
parent: "Çizim iç yapısı"
nav_order: 7
lang: "tr"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Performans paneli ve istatistik katmanı

Görünümün sağ üstündeki kutu, görüntüleyicinin ne kadar çalıştığını gösterir: saniyede kaç kare, kaç nokta çizdiği ve resmi hâlâ iyileştirip iyileştirmediği. **Performans** paneli resim kalitesi ile hız arasında denge kurmanızı sağlar.

## İstatistik katmanı {#the-stats-overlay}

Isı haritası ve Maç sekmelerinde görünümün sağ üstündeki kutu ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Motorun canlı değerlerini her animasyon karesinde okur.

![Çok maçlı sahnede istatistik katmanı, numaralı açıklamalarla: 1 Arka uç, 2 FPS, 3 Kare, 4 Penceredeki satırlar, 5 Sprite / kare, 6 Bütçe, 7 Isı çöz., 8 Kapsama](../assets/img/en/performance-stats-overlay.webp)

| Satır | Anlamı |
|---|---|
| **Arka uç** | *WebGPU* ya da *WebGL2*. WebGPU kullanılmadıysa nedenini görmek için üzerine gelin. Bkz. [İki arka uç](backends.md). |
| **FPS** | Saniyedeki kare sayısı, en az 0,4 sn üzerinden ortalama. |
| **Kare** | Kare süresi, ms cinsinden, yumuşatılmış (%90 önceki, %10 yeni). Kareler arasındaki süredir, GPU süresi değildir; geçiş başına GPU zamanlaması ölçülmez. |
| **Penceredeki satırlar** | Aday satırlar: geçerli zaman penceresindeki satırlar, gölgelendiricide satır başına filtrelemeden önce. |
| **Sprite / kare** | Son karenin planının gönderdiği sprite'lar (hiçbir şey çizmeyen boşta karelerde planlanan değerde tutulur). |
| **Bütçe** | Bu karenin planlandığı sprite bütçesi: uyarlanır denetleyicinin değeri; her satırı çizerken tüm adaylara yükseltilmiş. |
| **Isı çöz.** | Isı tamponunun çözünürlüğü, tuvalin payı olarak: *Isı çözünürlüğü* ayarı çarpı uyarlanır ikinci aşama ölçeği. |
| **Kapsama** | Aşamalı biriktirmenin her satırı kullanmaya ne kadar yaklaştığı: yakınsarken yüzde (kehribar renkte), bitince *tam*. Gürültülü bir kare asla bitmiş resim sanılmaz. |
| **Küpler** | [Kutu tekrar oynatma](box-replay.md) içinde çizilen kutular. |
| **Bellekte değil** | Yalnızca satırlar GPU bütçesine sığmadığında gösterilir: kaç tane. Bkz. [GPU bellek yerleşimi](gpu-memory.md). |

## Hız göstergesi {#the-speed-display}

Görünümün sağ altında, yalnızca perspektifte: uçuş hızı ve bu hızla veri üzerinden geçmenin süresi. Hızı değiştirmek için sürükleyin. Bkz. [Kamera](camera.md#fly-speed).

## Görüntüleyici yavaşsa {#if-the-viewer-is-slow}

Önce istatistik katmanına bakın, sonra:

1. **Penceredeki satırlar, Sprite / kare değerinden çok büyük ve Kapsama %100'ün altında**: kare her şeyi çizemez; durgunken birkaç karede yakınsar. Adayları azaltmak için pencereyi daraltın, filtreleyin ya da eleyin; ya da örneklemeyi kabul edin.
2. **Sprite / kare, Penceredeki satırlara eşit ve kare hâlâ yavaş**: maliyet ekrandaki sprite başınadır. *En büyük piksel yarıçapını* ([Sprite şekli](sprite-shape.md#pixel-clamps)) ya da *Isı çözünürlüğünü* düşürün.
3. **Az satırla yavaş**: büyük olasılıkla seviye: kenarlar açıkken çok sayıda yapı, zemin üçgenleri, alan derinliği. Bkz. [Seviye görünümü](level-appearance.md).
4. **Her şey yavaş ve kırmızı bir uyarı şeridi var**: yazılımsal çizim ([Yazılımsal çizim algılama](software-rendering.md)).

## Performans paneli {#the-performance-panel}

| Denetim | Varsayılan | Etkisi |
|---|---|---|
| İpucu | | Her kare, görünür satırların katmanlı rastgele bir alt kümesini, eksik kalan ısıyı telafi edecek ağırlıkla splat eder; böylece beklenen ısı her bütçede doğrudur. Görünümü durgun tutmak, her satır katkıda bulunana kadar karelerin birleştirilmeye devam etmesini sağlar. |
| **Her karede her satırı çiz** | açık | Yeni bir tahmin başlatan her kare, her aday satırı çizer (yaklaşık 268 milyona kadar); aşağıdaki bütçe bir alt sınır olur. [Örnekleme ve bütçeler](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Uyarlanır bütçe** | açık | Hedef kare hızını korumak için önce kare başına sprite'ı, sonra ısı çözünürlüğünü ayarlar; ve kesmenin yardımcı olmadığında kesmeyi durdurur. [Örnekleme ve bütçeler](sampling-and-budgets.md#the-adaptive-budget) |
| **Hedef FPS** | 60 | 20-240 (tutamakla 1000). 15'in altındaki değerler 15 kabul edilir. |
| **Başlangıç sprite / kare** / **Sprite / kare** | 4,00 M | 65.536-268.435.456, logaritmik. Uyarlanır açıkken *Başlangıç* adıyla anılır, çünkü denetleyici onu hareket ettirir. |
| **Isı çözünürlüğü** | %100 | %25-%100. Parça maliyeti karenin ölçeğiyle büyür: %50, karışım işini dörtte birine indirir ve ısı alanı o kadar pürüzsüzdür ki neredeyse fark edilmez. |
| **Aşamalı iyileştirme** | açık | Görünüm durgunken kareler boyunca biriktirir. Kapalıyken her karede tek kare tahmini gösterilir. [Birikim](accumulation.md) |
| **Kaynak bütçeleri** | algılandı | RAM, GPU ve ayrıştırıcı iş parçacığı bütçeleri. [Bellek ve bütçeler](memory-and-budgets.md#resource-budgets) |

Bunların hiçbiri kaydedilmez; sayfayı yeniden yüklemek varsayılanları geri getirir.
