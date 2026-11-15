---
title: "Hacimler ve karşılaştırma"
parent: "Filtreler ve araçlar"
nav_order: 6
lang: "tr"
source: "volumes.md"
source_hash: "25cc132dbe25"
translated: true
outdated: false
---

# Hacimler ve karşılaştırma

**Hacim**, bir yerin etrafına çizdiğiniz, görünmez bir kutudur (ya da bir silindir, ya da bir küre); şunu sormak için: içeride ne oldu? Bir köprüdeki öldürmeleri saymak, iki tepeyi karşılaştırmak ya da yalnızca bir bölgedeki etkinliği göstermek için kullanın.

```
 üstten görünüm           Bir şekil çizersiniz ->  görüntüleyici
 +------------+           içindekini sayar:
 |   ( A )    |            satırlar, oyuncular, öldürmeler, zaman ...
 |        [B] |           A ile B'yi yan yana karşılaştırın.
 +------------+
```

![Demo Valley üzerinde üç hacim: tepelerin etrafında iki silindir, köyün etrafında bir kutu](../assets/img/en/volumes.webp)

Hacimler içlerinde olanı ölçer, görünümü onlara göre süzer, satırlarını dışa aktarır ve yan yana karşılaştırılabilir. Satır, kişi ve maç için [terimler sözlüğüne](glossary.md) de bakın.

## Bir hacim çizin {#draw-a-volume}

1. Kenar çubuğunda **Hacimler**'i açın.
2. Bir araç seçin ve 3B görünümde ya da 2B haritada çizin. Taban ve tavan, altındaki veriden başlar. Esc iptal eder.
3. Seçmek için hacme tıklayın; **İstatistikler**i görünür.

| Araç | Nasıl çizilir |
|---|---|
| **Kutu** | Bir dikdörtgeni sürükleyin (Shift: kare). Bir tıklama varsayılan bir kutu koyar. |
| **n-gen** | Merkezden sürükleyin (Shift düzenli tutar). *Köşeler* n'yi 3 ile 64 arasında ayarlar (varsayılan 8, bu yüzden düğme **8-gen** yazar). |
| **Çokgen** | Köşelere tıklayın; çift tıklama, Enter ya da ilk köşeye tıklama ile kapatın. Backspace son köşeyi kaldırır. |
| **Silindir** | Yarıçapı sürükleyin. |
| **Küre** | Yarıçapı sürükleyin; yere oturur. |

## Düzenleme {#edit}

- Seçmek için bir hacme tıklayın. Gövdesini sürükleyerek taşıyın, köşelerini sürükleyerek yeniden biçimlendirin (köşede Shift ölçekler).
- **Sarı** tutamaçlar taban ve tavanı ayarlar, **turkuaz** tutamaç onu döndürür.
- Alt+sürükleme kopyalar, Del kaldırır, Ctrl+Z / Ctrl+Y geri alır ve yineler, Ctrl+D çoğaltır. **Tümünü kaldır** her hacmi siler.
- Kesin değerler: Taban, Tavan, Dönüş / Eğim / Yatış (kutular), Yarıçap (küreler, silindirler).

Her hacim satırında bir göster onay kutusu, bir renk, bir ad, **dahil et** ya da **hariç tut**, çoğaltma ve silme vardır. Hacimler her veri kümesi için tarayıcıda saklanır; **Kaydet...** / **Yükle...** bir `volumes.json` dosyasını yazar ve okur.

## Görünümü süzün {#filter-the-view}

| Filtre | Etkisi |
|---|---|
| **Tümünü göster** (varsayılan) | Hacimler yalnızca ölçer. |
| **Yalnızca içeride** | Isı, tekrar ve [isabet analizi](hit-analysis.md) yalnızca dahil edilen hacimlerin içinde olanı ve hariç tutulanların dışında olanı çizer. |
| **İçeridekini gizle** | Tersi. |

GPU filtresi toplam 64 ana hatlı noktayla en fazla 8 hacim alır; bunun ötesindeki bir hacim "!" ile işaretlenir. İstatistikler ve dışa aktarma yine de onu sayar.

## İstatistikler {#statistics}

**İstatistikler** alanı süzgeçleri, zaman penceresini ve gizli grupları izler. *Seçili* seçilen hacmi gösterir, *Tümünü karşılaştır* her hacmi yan yana koyar. Şunları gösterir:

- **İçerideki satırlar (gösterilen)** ve **İçerideki satırlar (tüm veri)**, **Oyuncular**, **Takımlar**, **Maçlar**, **İçeride geçen süre**, **Girişler / çıkışlar**, **En yüksek ısı**, **Ortalama ısı**, **Hacim / taban alanı** ve bir **Ne zaman** histogramı;
- sütun başına: **Lift** ile kategoriler (içerideki pay, tüm gösterilen veride paya bölünmüş) ve aralık, medyan ve 5-95. yüzdelikli sayılar.

**İstatistikleri CSV / JSON olarak** bunları kaydeder. **İçerideki verileri dışa aktar** içeride olan satırları CSV ya da Parquet olarak yazar (varsayılan olarak *Yalnızca gösterilen satırlar* açık), tek bir hacim ya da hepsi, her satırın hangi hacimde olduğunu söyleyen bir sütunla.

## Hacimleri karşılaştırın {#compare-volumes}

İki ya da daha fazla görünür hacimle **Karşılaştır...**'a basın.

1. Üç hacim çizin, örneğin Batı tepesi, Doğu tepesi ve Köy.
2. İstatistikler altında **Karşılaştır...**'a basın.
3. **Tablo** içinde her değerin ilk hacimden farkını okuyun.
4. Payları çubuk olarak görmek için **Çubuklar**'a geçin.

![Hacimleri karşılaştır tablosu: her hacim için satırlar, içeride geçen süre, oyuncular ve daha fazlası, ilkinden farkıyla](../assets/img/en/compare.webp)

| Görünüm | Gösterdiği |
|---|---|
| **Tablo** | Satırlar, içeride geçen süre, oyuncular, maçlar, takımlar, girişler, çıkışlar, ziyaretler, ziyaret uzunluğu, öldürmeler, ölümler, ölüm başına öldürme, dakika başına öldürme, oyuncu başına süre, değer sütunları; olaylara, araç sınıfına, oyuncuya ya da YZ'ye, takıma ve bakış yönüne göre gruplu. Her değer ilk hacimden farkını ve bir etki büyüklüğünü (önemsiz, küçük, orta, büyük) gösterir. Ilk hacme uzaklığa göre sıralamak için bir hacmin başlığına tıklayın. |
| **Çubuklar** | Olaya, sınıfa, aktöre, takıma ya da yöne göre sayılar ya da paylar. Görünümü ona süzmek için bir çubuğa tıklayın. |
| **Maç boyunca** | Maçın dakikaları boyunca hacim başına bir grafik: varlık, satırlar ya da öldürmeler. Oraya atlamak için tıklayın. |
| **Ziyaretler** | Ziyaretlerin ne kadar sürdüğünün kutu ve keman grafikleri (logaritmik ölçek). |
| **Akış** | Her hacimden çıktıktan sonra izlerin nereye gittiği: bir geçişler matrisi ya da akış şeritleri. |

![Çubuklar görünümü: hacim başına olay türleri, paylar olarak](../assets/img/en/compare-bars.webp)

## İpuçları {#tips}

- Bir bulgudan başlayın: [İçgörüler](insights.md) içinde **Burada hacim** bulgunun yerinin etrafına bir silindir ekler.
- **Döküm...** seçili hacim için [Döküm](breakdown.md) açar: içinde kimin ve neyin en iyi sonucu verdiği.
- [Yönlü ısı](directional-heat.md) seçili hacmin içindeki yönleri çizelgeleyebilir.
- [Araçlar sekmesi](hit-analysis.md#restrict-to-an-area) aynı hacimleri alan süzgeci olarak kullanır.
