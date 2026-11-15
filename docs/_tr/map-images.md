---
title: "Harita görselleri"
parent: "Haritalar ve arka plan geometrisi"
nav_order: 1
lang: "tr"
source: "map-images.md"
source_hash: "f0bbaa4b019e"
translated: true
outdated: false
---

# Harita görselleri

Bir harita görseli düz bir resimdir - bir mini harita, bir uydu fotoğrafı, bir kat planı - verinizin altına serilir ve ısının nerede durduğunu görebilirsiniz. Görüntüleyiciye resmin nereye ait olduğunu, üzerindeki iki noktayı dünyadaki iki yere sabitleyerek söylersiniz ("çapalar").

## Bir harita görselini yükleyin ve yerleştirin {#load-and-place-a-map-image}

1. Önce verinizi yükleyin ([Veri almak](getting-data-in.md)).
2. **Arka plan / bölüm** altında **Harita görüntüsü…** düğmesine basın ve resmi seçin. Verinin alanına gerilir.
3. Resim taşındıysa **Veri sınırlarına sığdır** düğmesine basın. Çapa 1 resmin sol üst köşesine, çapa 2 sağ alt köşesine, verinin kenarlarında gider.
4. Isı resimle hizalanmıyorsa, birbirinden uzak iki işaret noktası seçin (örneğin bir binanın karşılıklı iki köşesi ya da iki kavşak). Her birinin resimdeki pikselini ve dünya konumunu okuyun ([cetvelle](measure.md) üzerine gelerek **X** ve **Z** değerlerini okuyabilirsiniz).
5. Bunları **Yerleşim** kutularına yazın: **Çapa 1** için işaret noktasının **px**, **py**, **dünya X**, **dünya Z** değerleri; **Çapa 2** için aynısı.
6. Kontrol edin: bir yolun üzerinde olduğunu bildiğiniz bir iz ya da sıcak nokta artık o yolun üzerinde durmalı. Öyle olana kadar sayıları ayarlayın.

![İki çapalı Yerleşim bölümü ve bir harita resminin üzerinde çizilmiş ısı](../assets/img/en/map-images-placement.webp)

İki işaret noktası hem piksel sütununda hem piksel satırında farklı olmalıdır; aksi halde panel *İki çapa aynı piksel satırını ya da sütununu paylaşıyor* der.

## Yükleme {#loading}

Tarayıcının çözebildiği her görüntü biçimi. Uzun kenarı **8192 px**'in üstünde olan bir görüntü 8192'ye küçültülür (GPU'nun tutmasının istendiği en büyük kenar) ve panel *W×H boyutundan w×h boyutuna küçültüldü* yazar.

Yüklendiğinde görüntü, veri kümesinin X-Z sınırlarına gerilir (veri kümesi yoksa ±1000 birim), kuzey yukarıda, verinin en düşük Y'sinde. Varsayılanlar **Opaklık** %100, **Parlaklık** 0,7, **Doygunluğu azalt** %100 ve **Kuzey/güneyi çevir** açık: doygunluğu azaltılmış ve koyulaştırılmış, çünkü arka planın işi bir sıcak noktayı bulmanızı sağlamaktır, onunla yarışmak değil.

## Denetimler {#controls}

| Denetim | Varsayılan | Aralık | Anlamı |
|---|---|---|---|
| **Opaklık** | %100 | %0-100 | |
| **Parlaklık** | 0,7 | 0-2 (kaydırma 64) | |
| **Doygunluğu azalt** | %100 | %0-100 | Gri arka plan, doygun ısı. Haritadaki renk, verideki renkle yarışır. |
| **Kuzey/güneyi çevir** | açık | | Resmin hangi satırının dünyanın en büyük Z'si olduğunu belirler. Veri kümesi yüklüyken bunu değiştirmek, çapaları veri sınırlarına yeniden sığdırır. |
| **Yerleşim**: Çapa 1, Çapa 2 | veri sınırları üzerindeki resim köşeleri | | Her çapa resim üzerinde bir pikseldir - **px** (soldan, 0 ile genişlik arası) ve **py** (üstten, 0 ile yükseklik arası) - ve oturduğu dünya koordinatı, **dünya X** ve **dünya Z**. Ölçek ve kaydırma bu çiftten çıkar. |
| **Veri sınırlarına sığdır** | | | Çapa 1'i resmin sol üst köşesine, çapa 2'yi sağ alt köşesine, verinin X-Z sınırlarında koyar. Kesin yerleşim için bir başlangıç noktasıdır. Bir veri kümesi gerekir. |
| **Yükseklik** | verinin en düşük Y'si | verinin min Y - 500 ile max Y + 500 (kaydırma max Y + 100.000) | Harita düzleminin yüksekliği. Hiçbir şeyin onun tarafından gizlenmemesi için onu verinin hemen altına koyun. |

Ad satırı `genişlik×yükseklik px · x × z m/px` gösterir: her eksen boyunca tek bir pikselin dünya boyutu.

## Sahnede {#in-the-scene}

Görüntü, yüksekliğinde tek bir dokulu dörtgendir. Tam opaklıkta derinlik yazar; böylece zemin olarak [okluzyona](depth-and-culling.md) katılır; %100'ün altındaki opaklıkta karıştırılır ve derinlik yazmaz, bu yüzden hiçbir şeyi gizlemez. [Cetvel](measure.md) onun düzleminde ölçer. [Harita kütüphanesi](level-library.md) bir görüntü seviyesini çapalarıyla birlikte saklar.

## Dota 2 haritası {#dota-2-map}

**Harita görüntüsü…**'nün yanındaki **Dota 2 haritası**, [OpenDota](https://www.opendota.com)'nın maç sayfalarında gösterdiği güncel Dota 2 haritasının çizimini indirir ve [Watcher'ın](https://github.com/Holdi601/3DHeat-Watcher) Dota 2 tekrarlarından yazdığı tabloların altına yerleştirir ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Görüntü, düğmeye basıldığında opendota.com'dan alınır ve 3DHeat'in bir parçası değildir; en yeni yamanın çizimi OpenDota'nın kendi listesinden alınır, liste okunamazsa 7.40 çizimi kullanılır.

| | |
|---|---|
| Kaynak | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Yerleşim | OpenDota'nın kalibrasyonu: görüntü iki eksende de Dota dünya birimlerinin -8192 ile 8064 arasını kaplar (128 birimlik hücreler 64 ile 191), kuzey üstte. Tekrar tablosunun eksenleriyle (Z yukarı, Y ters) bu, dünya X -8192 ile 8064 ve dünya Z -8064 ile 8192 demektir. Piksel başına yaklaşık 18 birim. |
| Yükseklik | 0. Kahramanlar 0 ile yaklaşık 600 arasında durur. |
| Görünüm | Parlaklık 0,8, doygunluğu azaltma %50. |

Yama 7.40'ın herkese açık bir maçının tekrarında kontrol edildi: her kahramanın izi çizilen şeritleri izliyor ve tekrarın yerleştirdiği kuleler, kışlalar ve ancient'lar çizilen üsslerin üzerine düşüyor. **Üst** görünüm, haritayı ekranın alt tarafında kuzey olacak şekilde gösterir; Y'si ters çevrilmiş Z-yukarı herhangi bir tabloyu gösterdiği gibi.

Çizim OpenDota'nındır; harita Valve'indir; Valve, 3DHeat'i onaylamaz.

### 3B harita {#the-3d-map}

Dota 2 kuruluysa ayrı [3DHeat Dota](https://holdi601.github.io/3DHeat-Ext-Dota/) aracı (`heat3d-dota-maps level -o dota.glb`; Watcher'ın [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) komutu da onu çalıştırır) haritayı oyunun kendi dosyalarından 3B olarak oluşturur: zemin, uçurumlar, su, ağaçlar ve binalar, tekrar tablolarının birimleri ve eksenleriyle. Dosyayı bir kez **3B model…** ile yükleyin: görüntüleyici onu parçalarından tanır (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `dotaMap.ts` içindeki `isDotaLevel`), hemen [harita kitaplığına](level-library.md) koyar, eskisinin yerine geçirir ve bunu söyler. O andan itibaren **Dota 2 haritası** çizimi indirmek yerine bu 3B haritayı kitaplıktan yükler; kitaplıkta yoksa çizimi indirir ve 3B haritanın nasıl yapılacağını söyler. Dosya kendi kurulumunuzdan gelir ve makinenizde kalır.

## Geliştiriciler için {#for-developers}

### Çapalar görüntüyü nasıl yerleştirir {#how-the-anchors-place-the-image}

[`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts) dosyasından, *a* ve *b* çapalarıyla:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

İki çapa, her eksende hem ölçeği hem kaydırmayı bağımsız olarak sabitler; bu yüzden bir harita X ve Z'de farklı gerilebilir ama döndürülemez. Çapalar **her iki** piksel koordinatında da farklı olmalıdır; bir satırı ya da sütunu paylaştıklarında hiçbir ölçek türetilemez, harita çizilmez ve panel *İki çapa aynı piksel satırını ya da sütununu paylaşıyor* der.
