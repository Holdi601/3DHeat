---
title: "Örnekleme ve bütçeler"
parent: "Çizim iç yapısı"
nav_order: 3
lang: "tr"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Örnekleme ve bütçeler

Bir karede çizilecek çok fazla nokta olduğunda, görüntüleyici eşit aralıklı bir örnek çizer ve her noktanın daha fazla şey saymasını sağlar; böylece resim doğru kalır. Bir denetleyici, görüntüleyicinin kare hızını koruyabilmesi için kaç nokta çizildiğini ayarlar.

## Performans paneli denetimleri {#performance-panel-controls}

| Denetim | Varsayılan | Aralık (kaydırma) |
|---|---|---|
| **Her karede her satırı çiz** | açık | |
| **Uyarlanır bütçe** | açık | |
| **Hedef FPS** | 60 | 20-240 (1000) |
| **Başlangıç sprite / kare** (uyarlanır) ya da **Sprite / kare** | 4,00M | 65.536-268.435.456, logaritmik (268.435.456) |
| **Isı çözünürlüğü** | %100 | %25-100, uyarlanır ikinci aşama ölçeğiyle çarpılır |
| **Aşamalı iyileştirme** | açık | Kapalı: her kare yeni bir tek kare tahminidir (ham örneği görmek için kullanışlıdır). |

Ayrıca bkz. [Performans paneli ve istatistik katmanı](performance-and-stats.md).

## Geliştiriciler için {#for-developers}

### Aday satırlar {#candidate-rows}

Satırlar artan zamana göre saklanır. Zaman çizelgesi penceresi [*lo*, *hi*], zaman sütunu üzerinde iki ikili aramayla bir satır aralığına dönüşür ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); zaman sütunu yoksa her satır adaydır. Bunlar istatistik katmanının **Penceredeki satırlar** değeridir. Satır başına testler - filtreler, gruplar, bölme, eleme, dilim, ömür - daha sonra shader'da yapılır; başarısız olan bir satır bir vertex çağrısına mal olur ve hiç fragment'a mal olmaz.

### Örnekleme planı {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) aday aralığını **4.096 ardışık satırlık bloklara** böler ve karenin sprite bütçesinden kaç tane çizileceğini seçer:

- Bütçe her bloğu karşılıyorsa hepsi çizilir - kare tam olur.
- Aksi halde bloklar, aralık boyunca eşit bir adımla alınır; her karede altın orana göre ilerleyen bir titreşimle kaydırılır; böylece art arda gelen kareler farklı blokları kapsar ve birleşim eşit biçimde dolar. Bu **katmanlı** bir örnektir: zaman aralığının her parçası her karede temsil edilir.

Çizilen her satırın ısısı **adaylar / gönderilen** ile çarpılır; böylece bir karenin beklenen ısısı her bütçede tamdır; yalnızca gürültü bütçeye bağlıdır. Satırlar 8.388.608'lik parçalarda tutulur (bkz. [GPU bellek kalıcılığı](gpu-memory.md)); bir blok bir parçanın sınırını geçtiğinde bölünür ve her parça, çizmesi gereken blok başlangıçlarının listesini alır.

Bir plan en fazla 65.536 blok - 268.435.456 sprite - taşıyabilir, çünkü iki arka uç da sabit 65.536 yuvalı bir blok başlangıç tamponu tutar. Daha fazla istek oraya sınırlanır ve eksik kısım, yakınsamak için daha fazla kare olarak dürüstçe görünür.

### Her karede her satırı çiz {#draw-every-row-each-frame}

**Performans → Her karede her satırı çiz** (varsayılan **açık**): bütçe bir tavan olmaktan çıkıp bir taban olur ve yeni bir tahmin başlatan bir kare, sorumlu olduğu her satırı çizer (268M sınırına kadar).

Nedeni: kamera hareketi birikimi atar; bu yüzden hareket eden bir kare, çizdiği verinin ne kadarının gürültüsü belirlenen tek bir tahmindir - dörtte birini çizerseniz, onu parlak ağırlıklı noktalarda dörtte bir olarak görürsünüz; hareket eden bir görünümü parıldatan da budur. Her şeyi çizmek her kareyi bitmiş resim yapar. Bedeli, kare süresinin artık penceredeki verinin büyüklüğünü izlemesidir; kaldıraçlar daha dar bir zaman penceresi, filtreler ya da bir mesafe elemesidir; bunlar adayları daha ince örneklemek yerine azaltır.

Bütün alanı aynı anda kaldıramayan donanımda kapatın: o zaman *Sprite / kare* gerçek bir sınır olur ve görünüm birkaç durağan karede yakınsar.

Tam bir planın maliyeti, büyük bir haritada 4K tuval üzerinde yüksek uçlu bir masaüstü GPU ile ölçüldü, 1 m yarıçaplı sprite'lar (bir ya da iki piksel): kare başına yaklaşık 100M sprite 30 fps'de, 200M 15 fps'de ve 268M maksimumu yaklaşık 12 fps'de. Bu kadar küçük sprite'larda maliyetin tamamı vertex aşamasıdır ve ısı çözünürlüğü hiçbir şeyi değiştirmez; büyük sprite'larda ise dolgu belirleyicidir: 100 m yarıçaplı 8M sprite, tam ısı çözünürlüğünde kare başına 2,5 s, %25'te 170 ms sürdü. **Her karede her satırı çiz** bu nedenle 67M'de başlar, kareler 150 ms'nin altındayken her karede bir çeyrek artar ve 400 ms'nin üzerindeyken yarıya iner; böylece ağır bir görünüm, GPU'nun izleyicisinin izin verdiğinin ötesine bir kareyi itemez.

### Uyarlanır bütçe {#the-adaptive-budget}

**Performans → Uyarlanır bütçe** (varsayılan açık) sprite bütçesini **Hedef FPS**'yi tutacak şekilde ayarlar ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Kutu tekrarında ve video render'ları sırasında boşta kalır.

Girdi, kare süresidir; yumuşatılmış (önceki %90 + yeni %10, tek karelerde en fazla 2 s), hedefi 1000 / max(15, hedef FPS) ms'dir.

**Birinci aşama - sprite'lar.** Her karede bütçe `1 + (hedef / kare - 1) × kazanç` ile çarpılır; yavaş olduğunda kazanç 0,35, boşluk olduğunda 0,08'dir; kare başına 0,5-1,25 çarpanıyla ve 65.536-268.435.456 sprite ile sınırlandırılır.

**İkinci aşama - çözünürlük.** Yalnızca bütçe zaten tabanındayken ve kareler hâlâ %10'dan fazla yavaşken, ısı tamponunun çözünürlüğü kare başına %8 düşer, tuvalin %25'ine kadar; %30 boşluk olduğunda kare başına %4 geri kazanır. Fragment maliyeti çözünürlüğün karesiyle düşer; bu, yumuşak bir rampanın altında neredeyse görünmezdir. (10M satır ve aşırı büyük sprite'larla yazılım işlemede ölçüldü: kare başına 141 ms → 17 ms.) Ölçek on altıda birlere yuvarlanır; katmanın *Isı çöz.* göstergesi bunu gösterir.

**Vazgeçme.** Yavaş bir kare, sprite'ların mı yoksa ağır bir haritanın mı neden olduğuna bakmaksızın aynı görünür - geçiş başına zamanlama yoktur. Bütçe tabanında kalır ve kareler 30 kare boyunca hedefin %70'inin altında kalırsa, maliyet sprite'lar değildir: denetleyici **tırmanma** moduna geçer; bütçeyi her 14 karede 1,5 ile çarpar ve çözünürlüğü geri yükler; kare süresi tabanda olduğunun 1,5 katı içinde kaldığı sürece. Bundan daha kötü sonuçlanan bir tırmanma %60'a geri çeker ve normal kontrole döner; hedefe ulaşmak tırmanmayı sona erdirir.

Uyarlanır bütçe kapalıyken bütçe basitçe **Sprite / kare**'dir.

*Her karede her satırı çiz* açıkken uyarlanır bütçe yine çalışır, ama kesin kural bütçeyi tüm aday satırları kapsayacak şekilde yükseltir; bu yüzden pratikte yalnızca çözünürlük aşamasını ve yeni bir tahmin başlatmayan kareleri denetler.
