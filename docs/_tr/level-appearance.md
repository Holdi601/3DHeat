---
title: "Harita görünümü"
parent: "Haritalar ve arka plan geometrisi"
nav_order: 3
lang: "tr"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Harita görünümü

Bu denetimler, 3B bir haritanın nasıl göründüğünü değiştirir; böylece ısı ondan öne çıkar ve yine de yeri okuyabilirsiniz. Buradaki hiçbir şey veriyi değiştirmez.

## Hızlı başlangıç {#quick-start}

1. Bir 3B harita yükleyin ([3B haritalar](model-levels.md)).
2. **Arka plan / bölüm** altında, ısı ekranda en parlak şey olana kadar **Parlaklık** değerini düşürün.
3. **Zemin rölyefi**ni açın ve bir tepeyi düzlükten ayırt edebilene kadar **Eğim gölgelendirmesi** ya da **Kontur gücü** değerini artırın.
4. **Yapılar**'ı açın. Binaların içini görmek için **Yüzey opaklığı**nı düşürün, ya da katı görmek için **Yapı dokusu**nu açın.
5. Zeminin üzerine bir resim boyanmışsa, **Zemin dokusu**nu kapatıp açmayı deneyin.

![Zemin rölyefi ve Yapılar bölümleri açık, harita rölyef ipuçlarıyla gösterilmiş](../assets/img/en/level-appearance-sections.webp)

Bir [3B harita](model-levels.md) yüklüyken Arka plan / bölüm paneli bu denetimleri gösterir. Varsayılanlar, yeni içe aktarılmış bir haritanın aldığı değerlerdir ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Bunları değiştirmek yalnızca sahneyi yeniden çizer; ısı birikimi korunur.

## Tüm harita {#the-whole-level}

| Denetim | Varsayılan | Aralık | Anlamı |
|---|---|---|---|
| **Opaklık** | %100 | %0-100 | %100'ün altında harita karıştırılır ve derinlik yazmaz; böylece artık ısıyı [okluzyonla](depth-and-culling.md) gizlemez. |
| **Parlaklık** | 0,9 | 0-2 (kaydırma 64) | |

Harita, doygunluğu azaltılmış çizilir - gri zemin, renkli bir kabuk - böylece ekranda doygun olan tek şey ısıdır. Bir [harita görselinin](map-images.md) aksine, 3B bir haritanın Doygunluğu Azalt kaydırıcısı yoktur.

## Zemin rölyefi {#ground-relief}

Uzaktan bir tepe ile bir ova aynı griye görünür; bu yüzden görüntüleyici üç ipucu ekler. Her biri farklı bir hataya cevap verir:

| Denetim | Varsayılan | Anlamı |
|---|---|---|
| **Kontur aralığı** | zeminin yükseklik aralığından | Kontur çizgileri arasındaki yükseklik, haritanın yükseklik aralığının 1/4000'inden 1/2'sine kadar logaritmik; izin altı *kapalı*dır. Varsayılan, zeminin yükseklik aralığının 1/40'ı olup 1/2/5 adımına yuvarlanır - 10 m'lik çizgiler bir yamaç için uygundur, bir taş ocağının tabanında işe yaramazlar. Her 5. çizgi daha kuvvetli çizilir. Konturlar ekran uzayında çizilir; bu yüzden her yakınlaştırmada bir piksel genişliğinde kalırlar ve gölgelendirilemeyecek kadar sığ zeminlerde hayatta kalan tek ipucudur. |
| **Kontur gücü** | %35 | %0-100 |
| **Eğim gölgelendirmesi** | %55 | Eğime göre karartır; böylece yamaçlar ve uçurumlar her kamera açısından okunur - sizin ona baktığınız her an düzleşen bir ışıktan farklı olarak. |
| **Yükseklik rampası** | %50 | Zeminin yükseklik aralığında alçak zemin daha koyu, yüksek zemin daha açık: büyük ölçekli şekil. |

Bölümün başlığı kontur durumunu gösterir: *her N m*, kontur aralığı ya da aralık kapalıysa *kontur yok*.

## Zemin yüzeyi {#ground-surface}

| Denetim | Varsayılan | Gösterildiği durum | Anlamı |
|---|---|---|---|
| **Su** | açık | harita suya sahipse | Göller, nehirler ve deniz; solgun mavi-gri düz çizilir: tanımı gereği düz olan bir yüzeye arazi ipuçlarının hiçbiri uygulanmaz. |
| **Su opaklığı** | %60 | Su açıkken | Kıyı çizgisi ve sığ suyun altındaki zemin, yarı saydam suyun içinden görünür. |
| **Zemin üçgenleri** | %30 (dokulu bir haritada 0) | her zaman | Arazinin kendi kenarları, gölgelendirilmiş yüzeyin üzerine çizilir; kameradan haritanın genişliğinin %6 ile %25'i arasında solar. Zeminin ne kadar kaba örneklendiğini gösterir ve bir yamacın mesafeyi tahmin edebileceği bir şey verir. İlk kullanımda oluşturulur; büyük bir haritada bir an sürer. |
| **Zemin yalnızca tel kafes** | kapalı | her zaman | Arazi yüzeyini kenarlarıyla değiştirir. Tamamen şematiktir - gölgelendirmeyi, konturları ve okluzyonu da bırakır; bu yüzden *Zemin üçgenleri* genellikle daha iyi seçimdir. |
| **Zemin dokusu** | açık | harita dokulara sahipse | Zemini dosyanın taşıdığı dokularla çizer (asfalt, kenar, çimen). Doku kendi ince rölyefini zaten taşıdığı için ağ aydınlatması üzerine hafifçe uygulanır. Isının altında onu sakinleştirmenin yolu **Parlaklık**tır; Doygunluk Azalt harita görsellerine aittir. |
| **Yakalanan renk** | kapalı | harita tepe renklerine sahipse | Zemini gri yerine bir taramanın yakaladığı renkle gölgelendirir - aksi halde yeniden oluşturulmuş bir yol kenardan ayırt edilemez. Motor dışa aktarımları bunu taşımaz; yoksa panel *Bu harita renk taşımıyor.* der. |

## Yapılar {#structures}

**Yapılar** başlığı yapı üçgen sayısını gösterir; aşağıdaki ipucu nasıl çizildiklerini (*kendi dokularında katı çizilmiş* ya da *içindeki ısıyı görebilmeniz için saydam bir kabuk olarak çizilmiş*) ve kaç parçanın yapı olduğunu söyler.

| Denetim | Varsayılan | Anlamı |
|---|---|---|
| **Yapı dokusu** | yapılar dokulara sahipse açık | Yapıları kendi dokularında katı çizer. Açmak yüzey opaklığını %100'e ayarlar ve kenarları kapatır; kapatmak %25'lik renkli, görünür kabuğa döndürür. Dokulu bir yapı, kameranın gördüğü taraftan aydınlatılır, çünkü bir tabela sırt sırta iki yüzeydir ve derinlik testini hangisinin kazandığı yuvarlamaya bağlıdır. |
| **Tel kafes kenarları** | açık; 300.000 yapı üçgeninin üzerinde ya da dokuluysa kapalı | Yapıların tekrarsız kenarları, her kenar için bir çizgi. |
| **Kenar opaklığı** | %50 | |
| **Kabuk yüzeyleri** | açık | Parlak bir Fresnel kenarlı, soluk bir yüzey; bir bina bir kafes ya da sis bankası değil, bir hacim olarak okunur. |
| **Yüzey opaklığı** | %25 (300.000 yapı üçgeninin üzerinde %35, dokulu %100) | Ölçekte %0-60, tutamakla %100'e kadar. Düşük tutun: katı yapılar içindeki veriyi gizler. |
| **Keskin kenarlar** | açık (dokuluysa kapalı) | Her üçgeni kendi normaliyle gölgelendirir; normal, ekran uzayı türevlerinden fragment shader'da hesaplanır. Dışa aktarılan haritalar kaynaştırılmıştır ve ortalaması alınmış normaller taşır; bu da her kutu köşesini "erimiş folyo" gibi yuvarlar; bunu düzeltmek için her vertex'i ayırmak vertex tamponunu çoğaltırdı. Eğri yüzeyleri köşelerinden daha önemli olan bir harita için kapatın. |
| **Yapı rengi** | Camgöbeği | Bir renk seçici ve **Camgöbeği**, **Kehribar**, **Menekşe**, **Beyaz** hazır ayarları. |
| **Parça sınıflandırmasını göster (N)** | | Her parça, sınıfı ve nedeni; bkz. [3B haritalar](model-levels.md#ground-structures-and-water). |

## Haritayı kesmek {#cutting-the-level}

[Dilim](slice.md) ve *Seviyeyi de kes* seçiliyken [uzaklık elemesi](depth-and-culling.md#distance-culling), zemini, yapıları ve suyu ısıyla aynı düzlemlerde keser.
