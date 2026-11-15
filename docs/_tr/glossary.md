---
title: "Terimler sözlüğü"
nav_order: 24
lang: "tr"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: false
---

# Terimler sözlüğü

Bu sitenin kullandığı sözcüklerin kısa anlamları, sade bir dille. Her madde, onu tam olarak açıklayan sayfaya bağlanır.

## Veri {#data}

**Satır.** Verinizin bir satırı: bir yerde ve bir zamanda olan bir şey, örneğin "7 numaralı oyuncu 12. saniyede buradaydı". Görüntüleyici her satırı çizer. [Veri biçimleri](data-formats.md)

**Sütun.** Satırlardaki bir değer türü, örneğin x, y, z, zaman ya da takım. Görüntüleyici hangi sütunun hangisi olduğunu tahmin eder ve tahmini siz değiştirebilirsiniz. [Sütun eşleme](column-mapping.md)

**CSV.** Düz bir metin tablosu: her satırda bir kayıt, değerler virgüllerle ayrılmış. Neredeyse her program bir tane yazabilir. [Dosya yükleme](loading-files.md)

**Parquet.** Milyonlarca satırla bile hızlı okunan kompakt bir tablo dosyası. Görüntüleyiciye vermek için en iyi biçim. [Dosya yükleme](loading-files.md)

**Olay.** Bir atış, bir isabet, bir öldürme ya da bir kalkış gibi olan bir şey. Bir satır bir olay olabilir ya da yalnızca "buradaydım" olabilir. [Filtreler](filters.md)

**Kişi.** Satırları yapan: bir oyuncu, bir pilot, bir araba ya da bir tank. Bir kişi, zaman içinde bir konum çizgisidir. [Oturumlar, kişiler ve gruplar](sessions-persons-groups.md)

**Grup (takım).** Aynı renkle gösterilen bir kişi kümesi, örneğin Mavi ve Kırmızı. [Oturumlar, kişiler ve gruplar](sessions-persons-groups.md)

**Oturum (maç, tur).** Oyunun tek bir koşusu. Bir maç ya da bir tur bir oturumdur. Görüntüleyici bir oturumu gösterebilir ya da birçoğunu üst üste koyabilir. [Oturumlar, kişiler ve gruplar](sessions-persons-groups.md)

**Harita.** Verinin gerçekleştiği 3B harita: zemin, binalar, duvarlar. Satırlar haritada olduğu yerde görünür. [Haritalar ve arka plan geometrisi](levels.md)

## Verinin incelenmesi {#looking-at-the-data}

**Isı haritası.** Birçok satırın dokunduğu yerlerin daha sıcak parladığı bir resim. Soğuk yerler sakin, sıcak yerler yoğundur. [Isı](heat.md)

**Isı.** Bir noktada ne kadar olduğu. Görüntüleyici her yerde her satırın parıltısını toplar; toplam ısıdır. [Isı](heat.md)

**Sprite.** Görüntüleyicinin bir satır için çizdiği küçük parlayan leke. Üst üste binen birçok sprite ısıya dönüşür. [Sprite şekli](sprite-shape.md)

**Pozlama.** Resmin ne kadar parlak olduğu. Bir kamera gibi, fazla pozlama her şeyi beyaza çevirir, az pozlama ayrıntıyı gizler. [Renk ve pozlama](colour-and-exposure.md)

**Doygunluk.** "Renklerin gidebildiği kadar sıcak" sayılan ısı miktarı. Sakin yerlerin görünmesi için düşürün; yalnızca en sıcakları görmek için yükseltin. [Renk ve pozlama](colour-and-exposure.md)

**Hacim.** 3B görünüme yerleştirdiğiniz bir kutu ya da şekil. Görüntüleyici içindekini sayar ve hacimleri birbiriyle karşılaştırabilir. [Hacimler ve karşılaştırma](volumes.md)

**Filtre.** İstemediğiniz satırları gizleyen bir kural, örneğin "yalnızca öldürmeler" ya da "yalnızca Kırmızı takım". [Filtreler](filters.md)

## Tekrar {#replay}

**Figür.** Verinin söylediği yerde hareket eden bir tankın, uçağın, arabanın ya da askerin küçük bir modeli. [Figürler](figures.md)

**LOD (ayrıntı düzeyi).** Her figürün ayrıntılı, daha basit ve çok basit bir sürümü vardır. Yakındakiler ayrıntılı olanı, uzaktakiler basit olanı kullanır; böylece binlercesi aynı anda çizilebilir. [Figürler](figures.md)

## Yarış {#racing}

**Tur.** Pist etrafında bir yolculuk: çizgiden başlayıp yine çizgiye dönmek. [Turları yükleme](race-loading-laps.md)

**Referans turu.** Diğer tüm turların karşılaştırıldığı tur. Farklar, ona göre "daha hızlı" ya da "daha yavaş" olarak gösterilir. [Turları yükleme](race-loading-laps.md)

**Apeks.** Arabanın iç kenara en yakın olduğu viraj noktası. [Viraj viraj analiz](race-corner-analysis.md)

**Kayma.** Bir lastiğin ne kadar kaydığı. Az kayma en fazla tutunmayı verir; çok kayma arabanın savrulmasına yol açar. [Yarış analitiği: yöntem](race-analytics.md)

**Zarf.** Bir arabanın her hızda neler yapabildiği: kayana kadar ne kadar sert dönebildiği, frenleyebildiği ve hızlanabildiği. [Yarış analitiği: yöntem](race-analytics.md)

## Uçak sayıları {#aircraft-numbers}

**ALT.** Yükseklik: yerin ya da deniz seviyesinin üstündeki yükseklik. [Maç tekrarı](match-replay.md#labels-and-statistics)

**TAS.** Gerçek hava hızı: bir uçağın havada ne kadar hızlı hareket ettiği. [Maç tekrarı](match-replay.md#labels-and-statistics)

## Bilgisayar {#computer}

**GPU.** Grafik kartı ya da çipi. Resmi çizer ve milyonlarca lekeyi çizmede ana işlemciden çok daha hızlıdır. [İki arka uç](backends.md)

**WebGPU / WebGL2.** Bir tarayıcının bir sayfanın GPU'yu kullanmasına izin verdiği iki yol. WebGPU daha yenidir. Görüntüleyici ikisinden birini kullanabilir ve tarayıcınızda bulunan en iyisini seçer. [İki arka uç](backends.md)

## Counter-Strike terimleri {#counter-strike-words}

**Tur.** Bir maç içindeki tek bir kısa çatışma. Bir taraf kazanır ve skor bir artar.

**Eko, zorla alım, tam alım.** Bir tarafın bir turun başında silahlara ne kadar para harcadığı. Eko para biriktirir ve neredeyse hiçbir şey almaz (oyuncu başına ortalama 1.500 $'ın altında). Zorla alım sahip olduğunu harcar (4.000 $'ın altında). Tam alım alabildiği her şeyi alır. [Maç analizi](match-analysis.md)

**Takas.** Bir öldürmeye karşılık veren öldürme: vurulursunuz ve bir takım arkadaşınız, 5 saniye içinde katilinizi vurur. [Maç analizi](match-analysis.md)

**KAST.** Bir oyuncunun öldürme, asist aldığı, hayatta kaldığı ya da takas edildiği turların oranı. Yüksek bir sayı, oyuncunun daha çok turda yardımcı olduğu anlamına gelir. [Maç analizi](match-analysis.md)

**ADR.** Tur başına ortalama hasar: bir oyuncunun her turda düşmanlardan aldığı can. [Maç analizi](match-analysis.md)
