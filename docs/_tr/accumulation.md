---
title: "Birikim"
parent: "Çizim iç yapısı"
nav_order: 2
lang: "tr"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Birikim

Görüntüleyici her noktayı tek bir karede çizemediğinde, bir kısmını çizer, sonra bir başka kısmını, ve siz hareketsiz dururken resimleri üst üste toplar. Resim, bir fotoğrafın belirmesi gibi netleşir. Kamerayı hareket ettirmek baştan başlatır. İstatistik katmanının **Kapsama** satırı ne kadar ilerlediğini gösterir.

![İstatistik katmanı: resim belirirken Kapsama bir yüzde gösterir, tamamlandığında *tam*](../assets/img/en/performance-stats-overlay.webp)

## Geliştiriciler için {#for-developers}

Tek bir kare her satırı çizemediğinde, bir örnek çizer ve onu ağırlıklandırır; resim o zaman yansız ama gürültülü bir tahmindir. **Birikim**, hiçbir şey değişmezken tahmin kesin yanıta yakınsayana kadar art arda gelen kareleri birleştirir. Her kare beş moddan birini seçer ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); en son kullanılan `engine.live.accumMode` üzerindedir.

| Mod | Ne zaman | Biriktiricinin başına ne gelir |
|---|---|---|
| **sıfırla** | kamera hareket etti, alanı değiştiren bir şey değişti, aşamalı iyileştirme kapalı, büyüyen bir pencere başlıyor (oynatmanın ilk karesi, bir atlamadan sonra) ya da oynatılan çizgi ısısı hareket etti | Bu karenin tahminiyle değiştirilir. |
| **genişlet** | son kareden beri yalnızca büyümüş bir **Kümülatif** pencere | Bu kare yalnızca az önce görünür olan satırları, tam ağırlıkla çizer ve ekler. Hiçbir şey sönmez. |
| **ema** | kayan bir pencere (**Pencere**, **Ömür**) hareket etti | `acc = acc × (1 - 0,34) + frame × 0,34` - yaklaşık üç karelik üstel hareketli ortalama. |
| **ortalama** | hiçbir şey değişmedi ve tahmin tam değil | *n*. karede `acc = acc × (1 - 1/n) + frame × 1/n`: bir çalışan ortalama. |
| **atla** (boşta) | yakınsadı ve hiçbir şey değişmedi | Hiçbir şey çizilmez; kare yalnızca yeniden bileştirilir. |

### Neden her biri {#why-each}

- **Toplam değil, çalışan ortalama.** Tamponu 1 - 1/n ile ölçeklemek ve yeni karenin 1/n'sini eklemek cebirsel olarak sonunda *n*'ye bölerek toplamakla aynıdır; ama tampon her zaman bir alanın değerini tutar. Bir toplam alanın *n* katına ulaşır ve 16 bit bir hedefte 65.504'te doyar; sürekli büyüyen bir bölenle, durağan bir görünüm ne kadar uzun dururSA o kadar soluklaşırdı - oysa her karede sıfırlanan hareket eden bir kamera tamamen doğru görünür. Duman paketi, 16 birleştirilmiş karenin tek bir karenin 1,00 katı tuttuğunu doğrular.
- **Kümülatif oynatma için genişlet.** Zaten biriktirilmiş satırlar hâlâ görünürdür; bu yüzden bir karenin yalnızca az önce gelen saniyenin kesri gerekir - bu bir karede sığar, bu yüzden tam olarak girer. Bunun yerine yeniden tahmin etmek her karede farklı bir rastgele alt küme aydınlatır ve söndürür; patlamalar parlayıp kaybolur gibi okunur ve duraklatılmış bir kare dolmaya devam ederdi. Paket, oynatma sırasında toplamın tekdüze arttığını ve 2,5 s duraklatılmışken %0,02 içinde kaldığını doğrular.
- **Kayan pencereler için hareketli ortalama.** Bunlar gerçekten her karede değişir. Sabit bir karışım ağırlığı hareket eden pencereyi izler (oynatma başladığından beri tüm karelerin ortalaması imlecin gerisinde kalırdı) ve baştan başlamaktan çok daha sakindir.
- **Oynatılan çizgiler için sıfırla.** Çizgi ısısının başları her karede hareket eder; hareketli bir ortalama her birini bir çizgiye yayardı, bu yüzden her kare bütün çizilir ve kuyruk solması resmin kendisinin olur.
- **Kısmi kareler bir geçici hedeften geçer.** Tam ağırlığın bir kesrinde birleştirilen bir kare, 1/n ağırlıkla doğrudan serpilmek yerine, sıfırdan ayrı bir hedefe serpilir ve sonra biriktiriciye karıştırılır. Doğrudan serpilseydi her sprite, katıldığı toplamın 1/n boyutunda eklenirdi; bu da yarım kayan noktalı bir hedefin yuvarladığı bir şeydir - en yoğun olduğu yerde en kötüsü ([Yarım kayan nokta birikimi](half-float-accumulation.md)).

### Yakınsama {#convergence}

Her karenin planı kaç aday satır olduğunu ve kaçını gönderdiğini bilir; bu yüzden her satırı kapsamak için gereken kare sayısı ⌈adaylar / gönderilen⌉'dir. Bu kadar kare birleştirildiğinde görünüm **yakınsamış** olur: istatistik katmanının *Kapsama* satırı bir yüzdeden *tam*'a döner ve daha fazla kare boşta kalır. **Her karede her satırı çiz** açıkken (varsayılan) tek bir kare genellikle her şeyi kapsar, bu yüzden yakınsama anidir; aşamalı mekanizma yalnızca pencere, tek bir çizim planının taşıyabileceğinden (yaklaşık 67 milyon) daha fazla satır tuttuğunda gerekir.

### Neyin yeniden başlattığı {#what-restarts-it}

Ayarlar, biriktirilmiş tamponun değiştirildikten sonra hâlâ ne anlama geldiğine göre üç gruba ayrılır:

| Grup | Değişenler | Etkisi |
|---|---|---|
| **Geometri** - hangi satırların katkı yaptığı ve ne kadar | görünüm modu; çizgi rotaları; sprite yarıçapı, merkez ve kenar şiddeti, azalma, yumuşak rampa, eğri, piksel sınırları, düzleştirme; uzaklık elemesi yakın, uzak ve düzlemsel; okluzyon ve arazinin arkasını gizleme; dilim; tuval boyutu; ısı çözünürlüğü; grup görünürlüğü ve işaretleri; fark bölmesi; Tümü / Oynat; geçmiş; sütun filtreleri ve Varlıklar seçimi; yarım kayan nokta kazancı | Sıfırla. |
| **Pencere** - zaman aralığı | oynatma imlecinin hareketi; Ömür yedeği ve solması | Genişlet (kümülatif) ya da hareketli ortalama (kayan). |
| **Bileşim** - yalnızca renklendirme | doygunluk, yoğunluk tepkisi, en düşük ısı, renk rampaları; haritayı kesmek; ızgara ve eksenler; kutu tekrarı ayarları ve oturumu; alan derinliği | Isıya dokunmadan yeniden çiz. |

Kamera hareketi her zaman sıfırlar. Yani doygunluğu ya da rampayı sürüklemek bedavadır; sprite yarıçapını sürüklemek ise her adımda yakınsamayı yeniden başlatır.
