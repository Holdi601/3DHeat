---
title: "Varlıklar"
parent: "Filtreler ve araçlar"
nav_order: 3
lang: "tr"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Varlıklar

**Varlıklar**, tek bir oyuncuyu (ya da birkaçını) seçmenizi ve yalnızca o oyuncunun nereye gittiğini görmenizi sağlar. Kendi hareketinizi ya da tek bir rakibi izlemek için kullanın.

Panel, veri kümesinde bir kişi sütunu olduğunda gösterilir. Başlığı kişi sayısını gösterir; bir seçim etkinken `seçilen / toplam` yazar (bir *kişi*, bir oyuncu ya da yapay zekâdır; bkz. [terimler sözlüğü](glossary.md)).

## Bir oyuncu seçin {#pick-a-player}

1. Kenar çubuğunda **Varlıklar**'ı açın.
2. Arama kutusuna adın bir parçasını yazın.
3. Oyuncuyu işaretleyin. Başlık örneğin `2 / 10` yazar ve diğer her şey kaybolur.
4. **Temizle** herkesi yeniden gösterir.

![On oyuncudan ikisi seçilmiş Varlıklar](../assets/img/en/entities-selected.webp)

Seçim, ısı kiplerinde (noktalar, çizgiler, fark, takım ısısı) ve [figür tekrar oynatmanın](box-replay.md) izlerinde, figürlerinde ve izlerinde yalnızca seçilen kişileri gösterir. Herkesi göstermek için boş bırakın; herkesi seçmek, hiç kimseyi seçmemekle aynıdır.

## Panel {#the-panel}

| Parça | Anlamı |
|---|---|
| Arama kutusu | *N varlığı ara...* - listeyi adın büyük/küçük harf duyarsız bir alt dizgesiyle süzer. `N eşleşme` ya da `N eşleşme, ilk 200 gösteriliyor` yazar; arama hiçbir şey bulmazsa *"..." ile eşleşen yok* yazar. |
| Liste | En fazla 200 kişi (eşleşen ilk 200), her biri bir kutuyla, kişinin renginin bir örneğiyle ve adıyla (boş bir ad için *(adsız)*). |
| Oynuyor ipucu | Zaman oynarken liste, *oynatma kafasında oynayanları* tutar; arama hepsini bulur. |
| **Yapay zekâ (n)** | Oyuncular dışında, yapay zekânın denetlediği birimleri tutan daraltılabilir bir grup. |
| **Gösterilenleri ekle** | Şu anda listelenen herkesi seçime ekler. |
| **Yalnızca gösterilenler** | Seçimi tam olarak listelenenler yapar. |
| **Temizle** | Seçimi boşaltır. |

## Sınırlar {#limits}

Isıda seçim bir filtredir ve dört [filtre yuvasından](filters.md#rules) birini kullanır. Diğer filtreler dört yuvanın tamamını zaten kullanıyorsa panel şunu yazar: *Isıya uygulanmadı: tüm filtre yuvaları dolu. Figür tekrar oynatma yine yalnızca bu varlıkları gösterir. Bir yuva boşaltmak için Filtreler altında bir filtreyi temizleyin.* Bir yuvayı boşaltmak için bir filtreyi temizleyin.

Seçim, her yeni veri kümesinde temizlenir. Maç sekmesi, tek bir oyuncuya odaklandığında aynı seçimi ayarlar.

## Geliştiriciler için {#for-developers}

Seçim, bir *persons* filtresi olarak saklanır ([Filtreler](filters.md#for-developers)). Gölgelendiricinin maskesi 65.536 kişi kimliği tutar; bunun ötesindeki bir kişi, bir seçim etkinken ısıda çizilmez.
