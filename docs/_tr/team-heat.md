---
title: "Takım ısısı"
parent: "Isı modları"
nav_order: 6
lang: "tr"
source: "team-heat.md"
source_hash: "e18e62600e3e"
translated: true
outdated: false
---

# Takım ısısı

Takım ısısı, her takımın nerede olduğunu gösterir; her takım kendi rengiyle. Takımların üst üste bindiği yerlerde renkler karışır.

**Takım ısısı** (tuş 3), her [grubun](glossary.md) kendi renk tonuyla verildiği [Isı](heat.md) yoğunluk alanıdır. Gruplar üst üste bindiğinde tonları karışır; dengeli bir mücadele nötr çıkar. Opaklık, diğer modlardaki gibi yoğunluğu tam olarak taşımaya devam eder; böylece resim *ne kadar* ve *kimin* sorularını aynı anda yanıtlar. Bir grup sütunu gerektirir.

![Takım ısısı: her taraf kendi renginde; üst üste bindikleri yerlerde renkler karışır](../assets/img/tr/heat-teams.webp)

Bu, [figür bindirme](box-replay.md) değildir: o her kişi için bir figür çizer; bu ise aynı sütunla renklendirilmiş bir ısı alanıdır.

## Nasıl kullanılır {#how-to-use-it}

1. `3` tuşuna basın (ya da mod çubuğunda **Takım ısısı**'nı seçin).
2. **Isı renkleri** bölümünü açın. Renk örnekleri her grubun rengini gösterir; takım adını görmek için bir örneğin üzerine gelin.
3. Her şey gri görünüyorsa **Renk ayrımı** değerini yükseltin.
4. Bir grubu çıkarmak için [Takım listesi](teams-list.md) içinde onun işaretini kaldırın; diğer renkler olduğu yerde kalır.

## Denetimler {#controls}

**Isı renkleri** bölümünde:

| Denetim | Varsayılan | Anlamı |
|---|---|---|
| Renk örnekleri | | Her grubun rengi; ilk 12 grup için, sonra *+N daha*. Grubun adını ve rengini görmek için üzerine gelin. |
| **Renk ayrımı** | 1,4 | Bir karışımın nötrden ne kadar uzağa itildiği, 0-4. 0 her şeyi gri yapar; 1 gerçek ortalamadır; yaklaşık 2'nin üzerinde en parlak karışımlar gösterilebilir aralıktan çıkar ve kanal kanal kırpılır, bu da tonlarını kaydırır. |
| **Opaklık rampası (renk gruptan gelir)** | varsayılan ısı rampası | Burada yalnızca rampanın **alfa** değeri kullanılır: hiçbir şeyin olmadığı yerde saydam, en üstte opak. Renkleri yok sayılır. |

Etiketi "grup yok" anlamına gelen bir grup (`0`, boş, `none`, `unknown`, `null` ya da `-1`) gri çizilir.

Diğer tüm ısı denetimleri (şekil, doygunluk, tepki, en düşük ısı, derinlik, eleme) [Isı](heat.md) sayfasındaki gibi çalışır.

[Takım listesi](teams-list.md), bu modda her grubun takım ısısı rengini kendi renk örneği olarak gösterir. Bir grubu gizlemek diğer grupların renklerini olduğu yerde bırakır: tonlar açık olanlardan değil, toplam grup sayısından gelir; böylece iki resim karşılaştırılabilir kalır.

## Geliştiriciler için {#for-developers}

### Palet {#the-palette}

[`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts) dosyasından:

- Renkler, sabit bir parlaklıkta (0,7) ve kromada (0,115) **Oklab** renk düzlemi üzerinde yaşar; böylece her grup eşit parlaktadır ve kırmızı bir grup maviden daha sıcak görünmez.
- *n* grup varsa ton çemberi *n* eşit parçaya bölünür ve *i* grubu parçasının **merkezini** alır, yani turun `(i + 0.5) / n` kadarını. Herhangi iki grup, sayının izin verdiği kadar uzaktır ve zıtlar, sayı ne olursa olsun zıt kalır.
- En fazla **16** ayrı ton kullanılır. Daha fazla grup varsa kimlikler tekrarlı yarılama ile yerleştirilir (bit ters çevrilmiş kimlikler: 0, ½, ¼, ¾, ⅛, …), böylece komşu kimlikler bir tonu paylaşmaz; 16'nın üstündeki gruplar kaçınılmaz olarak paylaşır.
- Etiketi "grup yok" anlamına gelen bir grup (`0`, boş, `none`, `unknown`, `null` ya da `-1`, büyük/küçük harf farkı gözetilmeksizin) çemberden bir dilim almak yerine **nötr gri** çizilir. Grup listesindeki yalnızca ilk böyle etiket bu şekilde ele alınır.

Varsayılan ayrım 1 değil 1,4'tür, çünkü 1'de eşit aralıklı beş tonun bir karışımı *gridir*: doğru ama okunamaz. 1'in biraz üstü, eşitlikleri dürüst tutarken %60/%40'lık bir bölünmeyi görünür kılar.

### Nasıl çalışır {#how-it-works}

Bu kipte ısı hedefinin dört kanalı vardır. Her sprite yoğunluğu *v*'yi ilk kanala, *v* × grubun Oklab *a* ve *b* koordinatlarını ikinci ve üçüncü kanallara ekler. Bileşim zamanında pikselin karışımı yoğunlukla ağırlıklı ortalamadır: *a* = G / R, *b* = B / R; renk ayrımıyla ölçeklenir ve paletin parlaklığında sRGB'ye çevrilir. Biriken yoğunluğa bölmek, tonu ne kadar veri olduğundan bağımsız tutar; her yoğunluk denetiminin yalnızca opaklığı etkilemeye devam etmesinin nedeni budur.

Dört kanallı hedef, aynı çözünürlükte tek kanallı ısı hedefinin dört katı GPU belleğine mal olur.
