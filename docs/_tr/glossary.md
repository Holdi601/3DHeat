---
title: "Terimler sözlüğü"
nav_order: 21
lang: "tr"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Terimler sözlüğü

Bu sitenin kullandığı kelimelerin kısa, sade dille anlamları. Her madde, onu tam olarak anlatan sayfaya bağlanır.

## Veri {#data}

**Satır.** Verinizin tek bir satırı: bir yerde ve bir zamanda olmuş tek bir şey, örneğin "7. oyuncu 12. saniyede buradaydı". Görüntüleyici her satırı çizer. [Veri biçimleri](data-formats.md)

**Sütun.** Satırlardaki tek bir değer türü, örneğin x, y, z, zaman ya da takım. Görüntüleyici hangi sütunun hangisi olduğunu tahmin eder ve tahmini değiştirebilirsiniz. [Sütun eşleme](column-mapping.md)

**CSV.** Düz metin tablosu: her satırda bir kayıt, değerler virgülle ayrılmış. Neredeyse her program bir tane yazabilir. [Dosya yükleme](loading-files.md)

**Parquet.** Milyonlarca satırla bile hızlı okunan kompakt bir tablo dosyası. Görüntüleyiciye verilecek en iyi biçimdir. [Dosya yükleme](loading-files.md)

**Olay.** Bir atış, bir isabet, bir öldürme ya da bir kalkış gibi olmuş bir şey. Bir satır bir olay olabilir ya da yalnızca "buradaydım" demek olabilir. [Filtreler](filters.md)

**Kişi.** Satırları üreten: bir oyuncu, bir pilot, bir araba ya da bir tank. Bir kişi, zaman içinde konumlarının tek bir çizgisidir. [Oturumlar, kişiler ve gruplar](sessions-persons-groups.md)

**Grup (takım).** Aynı renkte gösterilen bir kişi kümesi, örneğin Mavi ve Kırmızı. [Oturumlar, kişiler ve gruplar](sessions-persons-groups.md)

**Oturum (maç, tur).** Oyunun tek bir çalışması. Bir maç ya da bir tur bir oturumdur. Görüntüleyici tek bir oturumu gösterebilir ya da birçok oturumu üst üste bindirebilir. [Oturumlar, kişiler ve gruplar](sessions-persons-groups.md)

**Seviye.** Verinin yaşandığı 3B harita: zemin, binalar, duvarlar. Satırlar, seviyede oldukları yerde görünür. [Haritalar ve arka plan geometrisi](levels.md)

## Verlere bakmak {#looking-at-the-data}

**Isı haritası.** Birçok satırın dokunduğu yerlerin daha sıcak parladığı bir resim. Soğuk yerler sakin, sıcak yerler yoğundur. [Isı](heat.md)

**Isı.** Bir noktada ne kadar olduğu. Görüntüleyici her noktada her satırın parıltısını toplar; toplam ısıdır. [Isı](heat.md)

**Sprite.** Görüntüleyicinin bir satır için çizdiği küçük parlayan leke. Üst üste binen birçok sprite, ısıya toplanır. [Sprite şekli](sprite-shape.md)

**Pozlama.** Resmin ne kadar parlak olduğu. Bir kamera gibi, çok fazla pozlama her şeyi beyaz yapar, çok az pozlama ayrıntıyı gizler. [Renk ve pozlama](colour-and-exposure.md)

**Doygunluk.** "Renkler ne kadar sıcak gidebilirse o kadar sıcak" sayılan ısı miktarı. Sakin yerlerin görünmesi için düşürün; yalnızca en sıcak olanları görmek için yükseltin. [Renk ve pozlama](colour-and-exposure.md)

**Hacim.** 3B görünüme yerleştirdiğiniz bir kutu ya da şekil. Görüntüleyici içindekileri sayar ve hacimleri birbiriyle karşılaştırabilir. [Hacimler ve karşılaştırma](volumes.md)

**Filtre.** İstemediğiniz satırları gizleyen bir kural, örneğin "yalnızca öldürmeler" ya da "yalnızca Kırmızı takım". [Filtreler](filters.md)

## Tekrar {#replay}

**Figür.** Verinin söylediği yerde hareket eden bir tankın, uçağın, arabanın ya da askerin küçük bir modeli. [Figürler](figures.md)

**LOD (ayrıntı düzeyi).** Her figürün ayrıntılı, daha basit ve çok basit bir sürümü vardır. Yakın olanlar ayrıntılı, uzaktakiler basit sürümü kullanır; böylece binlercesi bir kerede çizilebilir. [Figürler](figures.md)

## Yarış {#racing}

**Tur.** Pistin etrafında bir gidiş, çizgiden tekrar çizgiye. [Turları yükleme](race-loading-laps.md)

**Referans turu.** Diğer tüm turların karşılaştırıldığı tur. Farklar, ona göre "daha hızlı" ya da "daha yavaş" olarak gösterilir. [Turları yükleme](race-loading-laps.md)

**Tepe noktası.** Arabanın iç kenara en yakın olduğu virajın noktası. [Viraj viraj analiz](race-corner-analysis.md)

**Kayma.** Bir lastiğin ne kadar kaydığı. Az kayma en fazla tutuşu verir; çok kayma arabayı savurur. [Yarış analizi: yöntem](race-analytics.md)

**Zarf.** Bir arabanın her hızda ne yapabildiği: kayana kadar ne kadar sert dönebildiği, fren yapabildiği ve hızlanabildiği. [Yarış analizi: yöntem](race-analytics.md)

## Uçak değerleri {#aircraft-numbers}

**ALT.** Yükseklik: yer ya da deniz seviyesinin üstündeki yükseklik. [Maç tekrarı](match-replay.md#labels-and-statistics)

**TAS.** Gerçek hava hızı: bir uçağın havada ne kadar hızlı hareket ettiği. [Maç tekrarı](match-replay.md#labels-and-statistics)

## Bilgisayar {#computer}

**GPU.** Grafik kartı ya da çipi. Resmi çizer ve milyonlarca lekeyi çizmede ana işlemciden çok daha hızlıdır. [İki arka uç](backends.md)

**WebGPU / WebGL2.** Bir tarayıcının bir sayfanın GPU'yu kullanmasına izin verdiği iki yol. WebGPU daha yenidir. Görüntüleyici ikisini de kullanabilir ve tarayıcınızda bulunan en iyisini seçer. [İki arka uç](backends.md)

## Counter-Strike terimleri {#counter-strike-words}

**Tur.** Bir maç içindeki kısa bir çatışma. Bir taraf onu kazanır ve skor bir artar.

**Eko, zorla satın alma, tam satın alma.** Bir tarafın bir turun başında silaha ne kadar para harcadığı. Eko para biriktirir ve neredeyse hiçbir şey almaz (oyuncu başına ortalama 1.500 $'ın altında). Zorla satın alma, sahip olduğunu harcar (4.000 $'ın altında). Tam satın alma alabileceği her şeyi alır. [Maç analizi](match-analysis.md)

**Takas.** Bir öldürmeyi geri ödeyen bir öldürme: sen vurulursun ve bir takım arkadaşın 5 saniye içinde katilini vurur. [Maç analizi](match-analysis.md)

**KAST.** Bir oyuncunun bir öldürme aldığı, bir asist yaptığı, hayatta kaldığı ya da takasa girdiği turların payı. Yüksek bir sayı, oyuncunun daha çok turda yardımcı olduğu anlamına gelir. [Maç analizi](match-analysis.md)

**ADR.** Tur başına ortalama hasar: bir oyuncunun her turda düşmanlardan aldığı can miktarı. [Maç analizi](match-analysis.md)
