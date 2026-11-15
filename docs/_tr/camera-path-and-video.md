---
title: "Kamera yolu ve video"
nav_order: 15
lang: "tr"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Kamera yolu ve video

Verinizden bir film yapın: kamerayı birkaç yere yerleştirirsiniz, görüntüleyici aralarında uçar ve bir video kaydeder. Her kare çok temizdir, hiç tanecik yoktur. Kamera ve oynatma imleci birlikte hareket eder; bu yüzden aynı panel bir hızlandırılmış çekim de yapar ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Bir uçuş yapın {#make-a-flythrough}

1. Filmin başlayacağı yere uçun ve **Kamera yolu ve render** içinde **Buraya anahtar kare ekle** düğmesine basın.
2. Bir sonraki yere uçun ve yine basın. Her durak için tekrarlayın.
3. **Yol boyunca önizle** kutusunu işaretleyin ve hareketi kontrol etmek için **Yol üzerindeki konum** kaydırıcısını sürükleyin.
4. **Süre**yi ayarlayın (videonun ne kadar uzun olacağı). Doğru ama çok hızlı bir hareket yalnızca daha uzun bir süre ister.
5. **Video render et** düğmesine basın. İlerleme satırını bekleyin; bitince dosya indirilir.

![Üç anahtar kare, Yumuşak enterpolasyon, 12 s, 30 fps ve 16 Mbps ile Kamera yolu ve render paneli](../assets/img/en/camera-path-panel.webp)

## Anahtar kareler {#keyframes}

| Denetim | Etkisi |
|---|---|
| **Buraya anahtar kare ekle** | Geçerli kamera konumunu, yaw, pitch ve görüş alanını bir anahtar kare olarak ekler. |
| **Temizle** | Tüm anahtar kareleri kaldırır. |
| Anahtar kare listesi | Her anahtar için bir satır: numarası (kameranın oraya uçması ve görüş alanını da ayarlamak için tıklayın), konumu, `yaw° / pitch°` ve kaldırmak için **×**. |

Bir anahtar eklendiğinde ya da kaldırıldığında, anahtarlar 0 ile 1 arasındaki normalleştirilmiş bir yol ekseni boyunca **eşit** aralıklarla yerleştirilir; çıkış süresi daha sonra tüm hareketi gerer, böylece doğru ama çok hızlı bir çekim yalnızca daha uzun bir süre ister. Yaw, anahtarlar arasında açılır; böylece kamera kısa yoldan döner.

Anahtar kare yoksa, bir render tüm klip boyunca geçerli kamerayı sabit tutar - tamamen iyi bir hızlandırılmış çekimdir.

## Yol ayarları {#path-settings}

| Denetim | Varsayılan | Aralık (kaydırma) | Anlamı |
|---|---|---|---|
| **Enterpolasyon** (2+ anahtar) | *Yumuşak* | *Yumuşak* / *Düz* | *Yumuşak*: anahtarlardan geçen, komşu anahtarlardan teğetlerle kübik bir Hermite eğrisi; böylece her anahtarda hız eşleşir ve parçaların birleştiği yerde sarsıntı olmaz. *Düz*: anahtarlar arasında düz çizgiler, öngörülebilir, her anahtarda görünür bir köşeyle. Görüş alanı her zaman doğrusal olarak enterpole edilir. |
| Hareket çizgisi (2+ anahtar) | | | `N birim hareket - bu süredeyken saniyede M`, ya da anahtarların hepsinin tek bir yerde olduğuna dair bir not. |
| **Yol boyunca önizle** (1+ anahtar) | kapalı | | Görüntü alanı kamerasını yoldan sürer ve render'ın yaptığı gibi oynatma imlecini de onunla taşır; böylece hareket render etmeden önce değerlendirilebilir. |
| **Yol üzerindeki konum** (önizlerken) | %0 | %0-100 | Yolun neresinin önizleneceği. |
| **Süre** | 12 s | 1-120 s (3600) | Videonun uzunluğu. |
| **Kare hızı** | 30 fps | 6-60 (240) | |
| **Bit hızı** | 16 Mbps | 1-60 Mbps, logaritmik (400) | Isı geçişleri düşük bit hızlarında kötü bantlanır: bir kodeğin hatayı arkasına gizleyebileceği az ayrıntı vardır. |
| **Yakınsama bekleme sınırı** | 240 kare | 2-600 (10.000) | Bir çıkış karesinin tam olmak için bekleyebileceği en uzun süre. Buna takılan kareler yine de yazılır ve sayılır. |
| Özet | | | `N kare · pencere: birikimli/sabit/ömür`, ve zaman çizelgesi Tümü modundaysa: *(render, oynatma imlecinin bir anlamı olması için Tümü'yü Oynat'a çevirir)*. |
| **Video render et** / **İptal** | | | Render'ı başlatır; çalışırken `kare i / n · bekleme w · X MB` ve tam olmayan kare sayısını gösterir. Bir veri kümesi gerekir. |

## İpuçları {#tips}

- Çıktı boyutu, cihaz pikselleri cinsinden tuval boyutudur (ekranın piksel oranı, 2 ile sınırlı). Değiştirmek için tarayıcı penceresini yeniden boyutlandırın.
- Birikimli bir geçmiş, ısıyı klip boyunca biriktirir; bir pencere ya da ömür geçmişi ise hareket eden bir zaman dilimini gösterir.
- Anahtar kare konumları görüntü koordinatlarıdır: [ters çevrilmiş bir dünya ekseniyle](camera.md#invert-world-axis), onu değiştirmeden önce yapılan anahtarlar, değiştirdikten sonra başka bir yeri gösterir.

## Geliştiriciler için {#for-developers}

### Bir render ne yapar {#what-a-render-does}

1. Cihaz pikselleri cinsinden tam çıktı boyutunu öğrenmek için karenin bir test yakalamasını alır.
2. WebCodecs üzerinden bir kodek seçer: seçilen bit hızı ve kare hızında **VP9** (`vp09.00.10.08`), yoksa **VP8**. `VideoEncoder` yoksa *Bu tarayıcıda VideoEncoder yok - video yazmak için WebCodecs gerekir* ile durur; iki kodek de yoksa *Desteklenen video kodeği yok (VP9, VP8 denendi)*.
3. Bir render'ın ihtiyaç duyduğu ayarları devralır: oynatmayı duraklatır, **uyarlanır bütçeyi kapatır**, **aşamalı iyileştirmeyi açar** ve sprite bütçesini kare başına 64M'ye ayarlar (uyarlanır bütçe kare hızını korur; bu burada yanlış hedeftir: her yavaş yakınsayan kareyi daha az satır serpmek için bir neden sanır, bu da yakınsamak için daha fazla kare gerektirir); zaman çizelgesini **Tümü**'nden **Oynat**'a çevirir. Geçmiş ayarı (birikimli, pencere, ömür) olduğu gibi kalır: bir render, baktığınız şeyin oynatılıp yazıya dökülmesi içindir.
4. *n* çıktı karesinin her *f* için, *u* = f / (n - 1) olmak üzere:
   - kamerayı *u* anındaki yolun pozuna yerleştirir (anahtarlar varsa);
   - oynatma imlecini zaman çizelgesi aralığının aynı *u* oranına getirir (kutu tekrarında seçili oturumun aralığı);
   - kamera hareket etmemiş olsa bile yeni bir tahmini zorlar - önceki karenin birikimini devralmak, önceki pencerenin bir hayaletini bırakırdı;
   - resim tam olana kadar (tüm aday satırlar tek bir karede çizilene ya da birikim tamamlanana kadar), bekleme sınırına kadar kare kare bekler;
   - birleştirilmiş kareyi yakalar ve kodlar; dosyanın aranabilir olması için her 2 saniyelik çıktıda bir anahtar kare koyar.
5. Kareleri bir WebM dosyasına birleştirir ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)); zaman damgaları kare hızından seçilir - her karenin aldığı duvar saati süresi önemsizdir.
6. Bütçeyi, görüş alanını, zaman çizelgesi modunu, oynatma imlecini ve oynatılıp oynatılmadığını geri yükler.
7. Videoyu `3dheat-<width>x<height>-<frames>f.webm` olarak indirir ve `N kare, W×H, X MB - her kare tam` ya da bekleme sınırına kaç karenin takıldığını bildirir.

**İptal** geçerli kareden sonra durur (*Render iptal edildi.*) ve ayarları geri yükler.
