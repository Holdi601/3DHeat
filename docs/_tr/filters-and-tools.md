---
title: "Filtreler ve araçlar"
nav_order: 6
has_children: true
lang: "tr"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtreler ve araçlar

Bu paneller *hangi* verinin görüldüğünü seçmenize ve gördüğünüzü ölçmenize izin verir. Resim fazla kalabalık olduğunda kullanın: tek bir takımı, tek bir oyuncuyu, tek bir yeri ya da bir binanın tek bir katını gösterin.

Her panel veriyi daraltır ve birlikte çalışırlar: bir satır yalnızca **hepsinden** geçerse çizilir (VE).

```
tüm satırlar -> Filtreler -> Takımlar -> Varlıklar -> Kesit -> resim
                  VE           VE          VE          VE
```

Örnek: Filtreler altında *Tank*'ı işaretten kaldırın, Takımlar altında Kırmızı takımı gizleyin ve Varlıklar altında tek bir oyuncu seçin. Yalnızca o oyuncunun tank olmayan hareketlerini görürsünüz.

| Panel | Ne yapar | Isı modları | Figür bindirme |
|---|---|---|---|
| [Filtreler](filters.md) | Yükleme sırasında tutulan herhangi bir sütunda aralık ve kategori filtreleri. | Evet | Hayır (yalnızca sütun filtreleri) |
| [Fark ayrımı](difference.md#the-difference-split-panel) | Fark modunda hangi satırların eklediği, hangilerinin çıkardığı. | Yalnızca Fark | Hayır |
| [Takımlar](teams-list.md) | Her takımı göster ya da gizle; takımları + ya da - tarafına koy. | Evet | Evet |
| [Varlıklar](entities.md) | Tek tek oyuncuları seç. | Evet | Evet |
| [Kesit](slice.md) | Bir binanın içini görmek için seviyeden ve ısıdan bir dilim kes. | Evet, ve seviye | Hayır |
| [Ölçüm](measure.md) | Bir cetvel ve imlecin altındaki ısı değeri. | Evet | Evet |
| [Hacimler ve karşılaştırma](volumes.md) | 3B şekiller çizin ve içinde ne olduğunu sorun. Süzebilir de. | Evet | Evet |
| [Dökümleme](breakdown.md) | Bir yerde hangi araç, oyuncu ya da silahın en iyi sonucu verdiği. | yok | yok |

İsabet analizinin **Araçlar** sekmesinde kendi alan filtresi vardır: bkz. [İsabet analizi](hit-analysis.md).

Isı haritası, satır, kişi ve grup gibi terimler [terimler sözlüğünde](glossary.md) açıklanır.

## Panellerin yeri {#where-the-panels-are}

Isı haritası sekmesinin kenar çubuğu, yukarıdan aşağıya:

1. Mod çubuğu ve oturum seçici
2. Kaynak, Sütun eşlemesi, Veri kümesi
3. Yollar (Çizgiler modu)
4. Isı panelleri ya da Takım görüntüleyici
5. Fark ayrımı
6. Takımlar
7. Varlıklar
8. Filtreler
9. Arka plan / bölüm
10. Kesit
11. Ölçüm
12. Kamera yolu ve çizim
13. Performans
14. Kamera ve sahne

Maç sekmesi mod çubuğunu, oturum seçiciyi, kendi panelini, Filtreler'i, Arka plan / bölüm'ü ve Kamera ve sahne'yi gösterir.
