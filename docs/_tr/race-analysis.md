---
title: "Yarış analizi"
nav_order: 14
has_children: true
lang: "tr"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Yarış analizi

Aynı pisti iki kez sürdünüz. **Yarış analizi** sekmesi iki sürüşü birlikte 3B'de oynatır, bir turun nerede yavaş olduğunu gösterir ve nedenini söyler. Henüz turunuz yok mu? **Demo turlar**'a basın.

![Demo turlarıyla Yarış analizi sekmesi: Turlar ve Nerede gelişmeli bölümleri olan kenar çubuğu, parkurdaki arabalar, görünümün altındaki grafikler](../assets/img/en/race-analysis-overview.webp)

Sekme bir pistin iki ya da daha fazla turunu karşılaştırır. Tuvali, kamerayı ve yüklenen pist modelini (**Arka plan / bölüm**) ısı haritasıyla paylaşır; geri kalan her şey kendisine aittir: kendi kenar çubuğu ve görünümün altındaki kendi çubuğu. *Tur*, *referans* ve *apeks* gibi sözcükler [terimler sözlüğündedir](glossary.md).

Bu sayfa sekmenin haritasıdır. Her bölümün kendi sayfası vardır:

| Sayfa | Neyi kapsar |
|---|---|
| [Turları yükleme](race-loading-laps.md) | her dosya biçimi, klasörler ve pistler, araba adları, demo turlar, tur listesi, referans ve odak |
| [Tekrar ve 3B sahne](race-replay-and-scene.md) | aktarım çubuğu, üç tekrar modu, arabaları hizalama, takip kamerası, çizgiler, haritalar, arabalar, etiketler, aynalanmış dünyalar |
| [Grafikler ve HUD](race-charts-and-hud.md) | mesafe grafikleri, grafik seçici, üzerine gelme ve yakınlaştırma, araba kartları, kanal tablosu |
| [Araç kontrol olayları](race-control-events.md) | kilitlenmeler, tekerlek patinajı, aşırı dönüş, takla, düşük dönüş, çarpmalar, kazalar, ABS/TC, el freni, hava - her birinin nasıl algılandığı, her eşiğiyle |
| [Viraj viraj analiz](race-corner-analysis.md) | mesafeye göre hizalama, virajlar ve bölümler, bir virajın zaman hesabı, her neden ve denendikleri sıra, çizgi biçimi ve öneri |
| [Araç profilleri ve karşılaştırma](race-car-profiles.md) | her arabanın neler yapabildiği, turlarından ölçülerek; *Karşılaştırılan araçlar*; araba her virajda neye karar verir |
| [Parkur istatistikleri](race-course-statistics.md) | bir pistin birçok turu: virajlara ve türlere göre hatalar, hata haritası, ısı haritası dışa aktarımı, performans sınırları |
| [Yarış analitiği: yöntem](race-analytics.md) | kuralların arkasındaki araştırma, kaynaklarıyla |
| [Diğer yarış oyunları](other-games.md) | görüntüleyicinin her oyunun turlarıyla ne yaptığı: bir oyunun göndermediği yerlerde kayma ve drift hesabı, aynalanmış dünyalar, ek kanallar |

## Ekran {#the-screen}

**Kenar çubuğu**, yukarıdan aşağıya (bölümler katlanabilir):

1. **Turlar** - yükleme, listeleme, göster/gizle, referans, odak, takip.
   Bkz. [Turları yükleme](race-loading-laps.md).
2. **Parkur istatistikleri** - yalnızca üç tur yüklendiğinde görünür.
   Bkz. [Parkur istatistikleri](race-course-statistics.md).
3. **Nerede gelişmeli** - odaklanılan turun bulguları, viraj viraj.
   Bkz. [Viraj viraj analiz](race-corner-analysis.md).
4. **Viraj viraj** (ya da birden çok sınıf varken *Viraj viraj - sınıf X*) - her viraj için en hızlı tur ve çizgisi. İki ya da daha fazla turla gösterilir.
5. **Araç kontrolü** - odaklanılan turun kilitlenmeleri, kaymaları, itmeleri ve çarpmaları.
   Bkz. [Araç kontrol olayları](race-control-events.md).
6. **Araçların karşılaştırması** (tek araçla **Araç**) - bkz. [Araç profilleri ve karşılaştırma](race-car-profiles.md).
7. **Görünüm** - pistin üstüne hangi haritanın boyanacağı ve neyin çizileceği.
   Bkz. [Tekrar ve 3B sahne](race-replay-and-scene.md).
8. Ortak **Bölüm** ve **Kamera ve sahne** panelleri (pist modeli, eksen çevirme, kamera) - ısı haritasıyla ve [Kamera](camera.md) ile belgelenmiştir.

**Görünüm** pisti, sürülen çizgileri, haritayı, arabaları, pisete sabitlenmiş etiketleri ve sol üstte en fazla altı araba kartını gösterir (bkz. [Grafikler ve HUD](race-charts-and-hud.md)). Hiç tur yüklenmemişse "Tur yüklenmedi - Buraya iki ya da daha fazla tur dosyası bırakın ya da kenar çubuğundan demo turları yükleyin." der.

**Görünümün altındaki çubuk** tekrarın aktarım denetimlerini ve gizlenmediği sürece mesafe grafiklerini tutar.

## Hızlı başlangıç {#quick-start}

1. **Yarış analizi** sekmesini açın (kenar çubuğunun üstünde **Isı haritası**'nın yanında).
2. Turları alın. Sekmenin üç uydurma turla ne yaptığını görmek için **Demo turlar**'a basın. Kendi turlarınız için önce kaydedin ([dosya biçimleri ve kayıt araçları](race-loading-laps.md#file-formats)), sonra **Tur dosyalarını yükle…** ya da **Klasör…**'e basın ya da görünüme dosya ya da klasörler bırakın.
3. Tamamlanan en hızlı tur referans olur; odaklanılan, diğer en yavaş turdur. Odaklamak için listedeki herhangi bir tura tıklayın; ★ bir turu referans yapar.
4. **Nerede gelişmeli**'yi okuyun. Bir bulguya tıklayın: arabalar 40 m önce hizalanır, kamera onu çerçeveler, tekrar onun içinden oynar ve ölçümler açılır.
5. Grafiklerin üzerine gelerek her arabayı o metreye taşıyın; orada hizalamak için Shift+tıklayın.

## Klavye {#keyboard}

Yarış sekmesi açıkken:

| Tuş | Ne yapar |
|---|---|
| **K** | tekrarı oynat / duraklat |
| **Home** | tekrarın başına dön |
| rakam tuşları | hiçbir şey (ısı haritasında modları değiştirirler) |

Bir metin alanına ya da açılır listeye yazılan tuşlar yok sayılır. Kamera tuşları ısı haritasındaki gibi çalışır (**W A S D**, yukarı için **Boşluk**, aşağı için **Q**, daha hızlı için **Shift**, daha yavaş için **Alt**, bakmak için fare; hepsi [Kamera](camera.md) sayfasında); **F** yüklenen turları çerçeveler (tur yüklemenin yaptığı gibi).

## Birçok tur {#many-laps}

- Yüklenen tüm turlar analiz edilir ve sayılır; onlarca tur bir ya da iki saniye sürer.
- **8** turun (`SHOW_ALL_UP_TO`) üstünde, eklenen turlar yalnızca referans, odaklanılan tur ya da odaklanılan turun sınıfının en iyi turu olduklarında çizilir. *Tümünü göster* / *Yalnızca incelenenler* arasında geçiş yapar.
- **10** görünür arabanın (`PLAIN_PAST`) üstünde, bakılmayan turlar (odak, takip edilen araba ya da referans değil) 1,5 m yerine her 6 m'de bir noktaya indirgenmiş çizgilerle ve düz arabalarla çizilir.
- Grafikler en fazla **8** tur çizer; HUD en fazla **6** kart gösterir.
- Parkur istatistikleri **3** turdan itibaren görünür.

Ayrıntılar: [Parkur istatistikleri](race-course-statistics.md#performance-with-many-laps).

## Varsayılan görünüm ayarları {#default-view-settings}

| Ayar | Varsayılan |
|---|---|
| Harita | Zaman haritası |
| Sürülen çizgiler, Arabalar, Lastikler ve süspansiyon, Etiketler, Turlardan oluşturulan pist | açık |
| Kartlardaki tüm değerler | kapalı |
| Araba boyutu | 1× |
| Grafikler | gösterilir |
| Tekrar modu | Start çizgisinden |
| Tekrar hızı | 1× |
| Döngü | açık |

Bunların hiçbiri kaydedilmez; sayfayı yeniden yüklemek varsayılanlardan başlar. Tarayıcıda hatırlananlar: dil ve tur dosyalarından öğrenilen araba adları (bkz. [Turları yükleme](race-loading-laps.md#car-names)).

## Geliştiriciler için {#for-developers}

### Turlar yüklendiğinde ne olur {#what-happens-when-laps-are-loaded}

Tur kümesi, referans ya da dil her değiştiğinde, tüm analiz yeniden yapılır (`analyse`, [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts) içinde):

1. Oyunun göndermediği yerlerde her tura türetilmiş kanallar eklenir: sürüklenme açısı, tekerlek hızlarından tekerlek kayması, havada olma, gevşek zemin, dönme hızı ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Referans seçilir ve her tur yolu üzerine yansıtılıp her 2 m'de yeniden örneklenir ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Oyunun dünyasının aynalanıp aynalanmadığı turlardan çıkarılır ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Viraj referansta bulunur ve bir fren bölgesinden diğerine kadar bölümlere gruplanır ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Araba başına: zarfı (hıza göre tutunma, frenleme, çekiş), profili, lastik eğrileri ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Tur ve bölüm başına: ne yaptığı (fren noktası, en yavaş nokta, tam gaz, ...) ve sürdüğü çizgi ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Tur başına: araba kontrol olayları, her biri karşılaştırıldığı turla orada yan yana konarak.
8. Tur ve bölüm başına: karşılaştırma turuna karşı zaman hesabı ve bulgu sözlerle.
9. Tur başına zaman haritası ve neden haritası.

Metinler geçerli dilde üretilir; dil değiştirmek analizi yeniden çalıştırır (ve demo turları yeniden adlandırır). Analizdeki bir hata **Turlar** düğmelerinin altında bir hata olarak gösterilir ve turlar yüklü kalır.

### Kaynak dosyalar {#source-files}

| Dosya | Rolü |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | tur dosyalarını okuma |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | tur türü, adlandırma, demo turlar |
| `src/race/derive.ts`, `handedness.ts` | türetilmiş kanallar, aynalanmış dünyalar |
| `src/race/align.ts`, `segments.ts`, `line.ts` | mesafe ekseni, viraj, çizgiler |
| `src/race/analysis.ts` | karşılaştırılan virajlar, nedenler, bulgular |
| `src/race/envelope.ts`, `profile.ts` | bir arabanın neler yapabildiği |
| `src/race/control.ts`, `impacts.ts` | araç kontrolü, çarpmalar ve kazalar |
| `src/race/stats.ts` | birçok tur |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | tekrar ve çizim |
| `src/race/schema.ts`, `graphs.ts` | kanal tablosu, grafiklerin satırları |
| `src/ui/race/*` | kenar çubuğu, grafikler, HUD, etiketler |
| `src/state/raceStore.ts` | sekmenin durumu ve tekrar saati |
