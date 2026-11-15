---
title: "Yapay veri üretici"
parent: "Veri alma"
nav_order: 5
lang: "tr"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Yapay veri üretici

Kendi verinizde yok mu? Bir düğmeye basın, 3DHeat sizin için istediğiniz kadar küçük ya da büyük uydurma bir savaş üretsin.

1. Isı haritası kenar çubuğunda **Veri kümesi** panelini açın (**Kaynak**'ın altında).
2. **Sentetik üretici**'ye kaydırın.
3. **Satır (milyon)** değerini ayarlayın. Önce 1 deneyin: varsayılan 8 milyon, ilk deneme için ağırdır.
4. **Oluştur**'a basın.

![1 milyon satır, 8 takım, Takım ısısında çizilmiş](../assets/img/en/synthetic-generator-team-heat.webp)

**Veri kümesi** paneli, bir veri kümesini yüklemek yerine üretebilir. İki şey için tasarlanmıştır: görüntüleyiciyi kendi verisi olmadan denemek ve belli bir satır sayısının, sprite yarıçapının ve bütçenin bir makinede kullanılabilir bir kare hızını koruyup korumadığını, büyük bir gerçek yüklemeyi ona *vermeden önce* denetlemek. Hareketi bir battle royale maçı gibi biçimlendirilmiştir: takımlar ayrı başlar, sonra birbirine sıkıştırılır; çünkü düzgün gürültü her bütçede iyi görünür ve tam da yakalanmaya değer yapaylıkları gizler.

## Denetimler {#controls}

| Denetim | Varsayılan | Anlamı |
|---|---|---|
| **Satır (milyon)** | 8 | Üretilecek satır. Her oyuncu için tam bir tik sayısına aşağı yuvarlanır. |
| **Takımlar** | 8 | Grup sayısı (en az 1). |
| **Takım başına** | 12 | Grup başına oyuncu (en az 1). |
| **Harita yarı genişliği (m)** | 4000 | X ve Z üzerinde oynanabilir alanın genişliğinin yarısı. |
| Tahmin satırı | | "≈ X GB RAM, kuantalamadan sonra GPU'da Y GB." (satır başına yaklaşık 26 bayt RAM ve 8 bayt GPU). |
| **Oluştur** | | Veri alma işçisinde ilerlemeyle üretir ve yüklü bir veri kümesinin yerini alır. |

Üretim arka plan işçisinde çalışır; bu yüzden on milyonlarca satır sayfayı dondurmaz.

## Ne üretir {#what-it-generates}

[`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts) dosyasından:

- **Sütunlar:** konum, zaman, kişi (`P000`, `P001`, ...), grup (`Team 1`, `Team 2`, ...), yaw ve pitch, ve ömürler. Oturum sütunu ve filtre sütunu yoktur.
- **Zaman:** her oyuncu için 0,25 sn'de bir örnek, 0'dan başlayarak (göreli zaman, duvar saati yok).
- **Hareket:** her takım, yarı genişliğin %55-95'indeki bir halkanın kendi sektöründe başlar. Ortaya yakın merkezli bir güvenli daire (yarı genişliğin dörtte birine kadar rastgele kaydırılmış) altı evrede, duraklarla birlikte yarı genişliğin %8'ine küçülür; her oyuncu, sönümleme ve gürültüyle, onun içindeki dolaşan bir noktaya doğru yönelir. Yükseklik 0 ile 220 m arasında dalgalanır.
- **Bakış yönü:** yaw hareket yönü boyunca, pitch dikey hızdan.
- **Tekrarlanabilir:** rastgele tohum sabittir (1337), bu yüzden aynı ayarlar her zaman aynı veriyi üretir.

Her ısı kipi, kutu tekrar oynatma ve çizgi ısısı (tüm izler, çünkü bir olay sütunu yok) bunda çalışır. Yaşam geçmişi de çalışır.
