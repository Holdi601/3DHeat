---
title: "Birçok maç birden"
parent: "Tekrar"
nav_order: 2
lang: "tr"
source: "many-matches.md"
source_hash: "a37a7b4cf8c2"
translated: true
outdated: false
---

# Aynı anda çok sayıda maç

**Aynı anda çok sayıda maç**, birbirinin üzerine bindirilmiş çok sayıda maç oynatır; böylece her maçın oyuncularının genellikle nereye gittiğini görürsünüz. Yüzlerce ya da binlerce maçı tek bir resimde karşılaştırmak için kullanın.

Her maç kendi başlangıcından başlar ve birimleri figür olarak hareket eder. Dosyalar doğrudan grafik kartına gider ve tam bir tablo oluşturulmaz; bu yüzden normal bir yüklemenin bellek tükeneceği yerde bile akıcı oynar.

![Üst üste bindirilmiş on tank maçı, her maç için bir renk](../assets/img/tr/many-matches.webp)

## Nasıl kullanılır {#how-to-use-it}

1. Isı haritası kenar çubuğunda **Aynı anda çok sayıda maç**'ı açın.
2. **Dosyalar…** (çok sayıda dosya seçin), **Klasör…** (bir klasör ve alt klasörleri) ya da **Klasör ekle…** (yüklü olana ekleyin) düğmelerine basın.
3. Görüntüleyici figür bindirmeye geçer ve başlangıçtan başlar. **Oynat**'a basın.

Her dosya bir maçtır (ya da birkaçını tutar). Parquet dosyaları ve [`.3dheat`](container.md) kapsayıcıları çalışır. Bir dosyanın bir konum, bir zaman ve bir birim sütununa ihtiyacı vardır; ad, tür ve taraf sütunları korunur. Diğer dosyalar ve dönüştürücülerin yan dosyaları (uçuş, iletiler, olaylar, sohbet, hedefler) atlanır. Normal bir tablo için bkz. [Veri alma](getting-data-in.md).

## Ayarlar {#settings}

| Ayar | Ne yapar |
|---|---|
| **Takıma göre** / **Maça göre** | Tarafa göre renklendirir ya da maç başına bir renk. |
| **Birimlerin öldüğü yerleri işaretle** | Her birimin öldüğü yerde 10 sn, 30 sn, 120 sn ya da şimdiye kadarki tüm süre için bir işaret. |

Panel, kaç maç, birim, satır ve konumun okunduğunu, kullanılan belleği ve yükleme süresini gösterir. *Kalan yer*, grafik kartının kaç konum daha alabileceğidir. *Figürler şu boyuttan*, bir birimin figürü yerine küçük bir ok olarak çizildiği ekran boyutudur.

Figürlerin görünümü [maç tekrarıyla](match-replay.md#figures) aynı denetimleri kullanır: **Figür boyutu**, **Ekrandaki en küçük figür** ve **Uzaktan**.

## İpuçları {#tips}

- Her şey bellekte sığmayacaksa konumlar seyreltilir (her birkaç metrede bir konum tutulur) ve panel bunu söyler.
- Isı kipleri bindirmenin verisinde de çalışır.
- Çizmeden binlerce maç üzerinde istatistik için bkz. [Toplu analiz](mass-analysis.md).
