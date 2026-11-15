---
title: "Çizim iç yapısı"
nav_order: 22
has_children: true
lang: "tr"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Oluşturma iç yapısı

Görüntüleyici milyonlarca noktayı parlayan lekeler olarak çizer ve bunları toplar. Bu bölüm, bunu hızlı tutan numaraları ve istatistik katmanındaki sayıların ne anlama geldiğini açıklar. Görüntüleyici yavaş hissettiriyorsa ya da oluşturucu üzerinde çalışmak istiyorsanız okuyun.

```
veri -> zaman penceresi -> GPU filtreleri -> örnekleme planı -> splat -> biriktirme -> renk -> ekran
```

Kendi bilgisayarınızın nasıl çalıştığını görmek için görünümün sağ üstündeki istatistik kutusuna bakın: [Performans paneli ve istatistikler](performance-and-stats.md). Yeni kelimeler (GPU, satır, sprite, ısı haritası) [terimler sözlüğünde](glossary.md) yer alır.

## Asıl sorun {#the-core-problem}

Üst üste binen radyal rampaların toplamı, kare başına *N* × π*r*² karışık parça maliyeti getirir. Yarıçapı 8 px olan 100 milyon sprite'ta bu 2 × 10¹⁰ parçadır; üst düzey bir GPU'da yaklaşık bir saniyelik iştir. Bu her karede kaba kuvvetle yapılamaz, bu yüzden görüntüleyici şunları birleştirir:

- **zamana göre sıralı satırlar**: bir zaman penceresi iki ikili aramadır ve oynatma maliyeti veri kümesine değil, pencerideki satırlara bağlıdır;
- **karede CPU'da satır başına hiçbir iş yok**: satırlar GPU belleğinde, kuantalanmış olarak yaşar; filtreler, grup işaretleri, ömür testi, pencere, eleme ve dilim köşe gölgelendiricisinde hesaplanır;
- **katmanlı örnekleme**, bir kare her satırı çizemediğinde dengeleyici ağırlıklarla, ve **aşamalı biriktirme**, görünüm hâlâ açıkken tam tüm-satır sonucuna yaklaşan biçimde ([Örnekleme ve bütçeler](sampling-and-budgets.md), [Birikim](accumulation.md));
- **iki aşamalı bir kısıtlayıcı**, kare hızı için önce kare başına sprite'tan, sonra ısı çözünürlüğünden ödün verir ([Örnekleme ve bütçeler](sampling-and-budgets.md#the-adaptive-budget));
- **zorlanan bellek bütçeleri**, böylece sığmayan bir veri kümesi çökmek yerine görünür biçimde kesilir ([GPU bellek yerleşimi](gpu-memory.md)).

## Bir kare {#one-frame}

Kare döngüsü [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts) içindedir. Kare hızında değişen her şey (kamera, oynatma imleci, bütçe) uygulama durumunda değil motorda yaşar, bu yüzden bir kare React işi getirmez; durum her karede bir kez okunur ve yalnızca düşük sıklıklı göstergeler için geri yazılır.

1. **Yeni veri mi?** Yeni bir veri kümesi bir karede duyurulur (*N satır GPU'ya yükleniyor*) ve bir sonraki karede yüklenir; böylece iş iş parçacığını engellemeden önce ileti çizilmiş olur. Yeni bir seviye oluşturucuya verilir; çizgi ısı rotaları oluşturulur ya da serbest bırakılır.
2. **Oynatma imleci** ilerler (kare başına en fazla 0,1 sn gerçek zaman), döngüye girer ya da durur.
3. **Kamera** tuşları, fareyi ve oyun kumandasını okur; eksen aynası görünüm matrisine katlanır; WebGPU'da bir derinlik yeniden eşleme matrisi three.js'in OpenGL tarzı derinlik aralığını WebGPU'nunkine çevirir.
4. **Görünür olan**: zaman çizelgesi ve geçmişten zaman aralığı; grup işareti tablosu (yalnızca bir sütuna göre bölmede görünürlük); en fazla dört filtre (sütun filtreleri ve Varlıklar seçimi); fark bölmesi.
5. **Renk ve eğri tabloları**, ayarları değiştiyse yeniden oluşturulur.
6. **Bütçe**: uyarlanır denetleyici bu karenin sprite bütçesini ve ısı çözünürlüğünü belirler; *Her karede her satırı çiz* seçiliyken bütçe, her aday satırı kapsayacak kadar yükseltilir.
7. **İmzalar**, biriktirme tamponunun hâlâ ne anlama geldiğine karar verir: satırların neye ve nasıl katkıda bulunduğunu değiştiren bir şey (*geometri*), zaman penceresi ya da yalnızca sonucun nasıl renklendirildiği (*bileşim*). Bkz. [Birikim](accumulation.md#what-restarts-it).
8. **Örnekleme planı**: hangi satır bloklarının çizileceği ([Örnekleme ve bütçeler](sampling-and-budgets.md)).
9. **Biriktirme kipi**: sıfırlama, genişletme, hareketli ortalama, çalışan ortalama ya da boşta.
10. **Kutu tekrar oynatma geometrisi** (küpler, izler) CPU'da, yalnızca bu kipte ve boşta değilken.
11. **Çizim**: arka uç sahneyi çizer (seviye, ızgara, eksenler, kutular, izler, cetvel), ısıyı ısı hedefine splat eder, biriktiriciye birleştirir ve ısıyı sahnenin üzerine tuvale bileştirir.
12. **Otomatik pozlama** geri sayımı sıfıra ulaştığında çalışır; cetvelin ısı ölçümü en fazla her 120 ms'de bir piksel okur; göstergeler yayımlanır.

Boşta bir kare (yakınsamış, hiçbir şey değişmemiş) sahneyi ve splat işlemini atlar ama yine de **yeniden bileştirir**. `preserveDrawingBuffer` olmadan oluşturulan bir WebGL tuvalinin içeriği bileşimden sonra tanımsızdır; son kareyi göstermeye devam edeceğine güvenmek güvenli değildir. Sahne ve ısı hedefleri görüntüleyicinin kendi çerçeve arabellekleridir ve bunları tutar; bu yüzden boşta bir kare tek bir tam ekran geçişine mal olur.

## Bu bölümdeki sayfalar {#pages-in-this-section}

- [İki arka uç](backends.md): WebGPU ve WebGL2, birinin nasıl seçildiği, URL anahtarları
- [Birikim](accumulation.md): sıfırlama, genişletme, hareketli ortalama, çalışan ortalama
- [Örnekleme ve bütçeler](sampling-and-budgets.md): katmanlı örnekleyici, tam kip, uyarlanır bütçe
- [Yarım kayan noktalı birikim](half-float-accumulation.md): 16 bit hedeflerde aralık ve hassasiyet
- [GPU bellek yerleşimi](gpu-memory.md): kuantalanmış satır depolaması ve zorlanan GPU bütçesi
- [Yazılımsal çizim algılama](software-rendering.md)
- [Performans paneli ve istatistikler](performance-and-stats.md)
