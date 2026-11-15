---
title: "Tekrar ve 3B sahne"
parent: "Yarış analizi"
nav_order: 52
lang: "tr"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Tekrar ve 3B sahne

Turlarınızı bir yarış gibi birlikte oynatın ve bir arabanın nerede öne geçtiğini izleyin. **Yarış analizi** sekmesinin 3B görünümündeki her şey burada anlatılır: sürülen çizgiler, pistin üzerine boyanan renkler, araçlar ve etiketler.

![Neden haritası, arabalar bir virajdan 40 m önce hizalanmış: renkli pist, iki araba ve bayraklı direk](../assets/img/en/race-replay-lined-up.webp)

## Tekrar saati {#the-replay-clock}

Tek bir saat her turu yönlendirir: **referans** turun saniyeleri. Motor, oynatılırken her karede saati ilerletir (kare süresi × tekrar hızı). Sonunda **Döngü** açıksa 0'a döner, değilse durur. Saat bilerek mağazanın parçası değildir. Böylece kenar çubuğu her karede yeniden çizilmez. HUD ve grafikler buna abone olur ve en fazla karede bir kez güncellenir.

**Tekrarın uzunluğu**, saatte herhangi bir turun ulaştığı en uzun süredir: her turun süresi (*Hizalı* modundaki ofsetinden çıkarılmış), ya da *Yan yana* modunda referansın süresi.

## Taşıma çubuğu {#the-transport-bar}

Görünümün altında, soldan sağa:

| Kontrol | Yaptığı |
|---|---|
| ⏮ | başa dön (**Home** tuşu da) |
| ▶ / ❚❚ | oynat / duraklat (**K** tuşu da) |
| hız | 0,25×, 0,5×, 1×, 2×, 4× |
| kaydırma çubuğu | saati doğrudan, 0,01 s adımlarla ayarlar |
| saat | `zaman / uzunluk · metre`: saat bir tur süresi olarak, tekrarın uzunluğu ve referans arabanın referansta ne kadar ilerde olduğu |
| *Start çizgisinden* / *Hizalı* / *Yan yana* | tekrar modu (aşağıda) |
| **Burada hizala** | her arabayı şu an referansın olduğu yere koyar ve oradan devam eder |
| **Döngü** | sonunda baştan başlar (varsayılan olarak açık) |
| **Grafikleri gizle** / **Grafikleri göster** | çubuğun altındaki mesafe grafikleri |

Düğmeler tur yüklenene kadar devre dışıdır. (Tek bir tur bile tekrar etmek için yeter; karşılaştırmalar için iki tur gerekir.)

## Tekrar modları {#replay-modes}

Her turun kendi süresi, saatten şöyle çıkar:

| Mod | Her turun süresi | Ne gösterir |
|---|---|---|
| **Start çizgisinden** (`start`) | saatin kendisi | her tur kendi başlangıcından: aralarında bir yarış, farkın pistte olduğu gibi büyümesi |
| **Hizalı** (`anchor`) | saat artı turun ofseti | her araba aynı anda aynı noktada, sonra serbest bırakılmış: o noktadan sonra ne olduğu, turun başından değil |
| **Yan yana** (`locked`) | turun referansın şu anki mesafesine ulaştığı zaman | her araba tur boyunca referansın mesafesinde tutulur: hızlar ve girdiler metre metre karşılaştırılır |

Ne zaman kullanılır:

- **Start çizgisinden**: kimin önde olduğunu ve farkın nasıl büyüdüğünü görmek istediğinizde.
- **Hizalı**: bir viraj ya da bir düzlükte ne olduğunu bilmek istediğinizde, herkes orada eşit başlayarak.
- **Yan yana**: sürücülerin pedallarla ve direksiyonla aynı yerde ne yaptığını karşılaştırmak istediğinizde.

**Hizalı modunda ofsetler:** referansta `s` metrede bir çapa için, her turun ofseti, kendi zamanının `s`'deki değeri eksi referansın zamanının `s`'deki değeri, ikisi de hizalanmış turlardan okunur (bkz. [tek bir mesafe ekseni](race-corner-analysis.md#one-distance-axis)). `s`'yi kapsamayan bir tur 0 ofseti tutar. Mod düğmelerinden *Hizalı* seçilirse, çapa referansın şu anki mesafesine konur.

*Hizalı* modunda, 14 m yüksekliğinde bayraklı beyaz bir direk çapayı işaretler.

### Hizalama {#lining-up}

| Eylem | Çapa | Saat |
|---|---|---|
| **Burada hizala** | referansın şu an olduğu yer | değişmez |
| Grafiklerde Shift+tıklama | tıklanan metre | referans oraya gelmeden 1,5 s önce |
| *Neden*: bir *Nerede gelişebilirsiniz* bulgusu, pistteki numaralı bir rozet, bir bulguyu içeren *Viraj viraj* satırı | bulgunun nedeninin başladığı yerden 40 m önce | o noktadan 1,5 s önce; sonra oynatılır |
| bir araç kontrol olayı, bir darbenin etiketi | olaydan 40 m önce | 1,5 s önce; sonra oynatılır |
| kurs istatistiklerinde bir tur | bulgusu ya da olayı gibi | yukarıdaki gibi, o tur odaklanmış olarak |

Bir bulguya bakmak, kamerayla onu da çerçeveye alır: bulgunun aralığının ortasında bir küre, yarıçapı 40 m ile bulgunun uzunluğunun yarısı artı 30 m'nin büyüğü (bir olay için 60 m). Kamera bir arabayı takip etmiyorsa.

### Takip kamerası {#chase-camera}

Tur listesindeki ⌖, kamerayı o arabayı takip ettirir: arabanın 2,5 + 4 × araba boyutu metre arkasında ve 0,9 + 1,1 × araba boyutu metre yukarısında, arabanın hareket yönüne bakar, arabaya doğru aşağı eğilir ve her karede yolun 20%'si kadar yumuşatılır, böylece her sarsıntıyla titremez. ⌖'ye yeniden basmak bırakır. Takip edilen araba biraz daha açık çizilir, yerde beyaz bir halkası olur ve kartı vurgulanır.

## Görünüm bölümü {#the-view-section}

| Kontrol | Varsayılan | Yaptığı |
|---|---|---|
| **Çizgiler** / **Zaman haritası** / **Neden haritası** / **Hata haritası** | Zaman haritası | pist boyunca ne boyandığı (aşağıda); *Çizgiler* hiçbir şey boyamaz |
| açıklama | - | zaman haritası için *kazanır ↔ kaybeder*, neden haritası için neden renkleri, hata haritası için *az tur ↔ çok tur* |
| **Sürülen çizgiler** | açık | görünür her turun kendi renginde çizgisi |
| **Araçlar** | açık | arabalar ve HUD kartlarının kaynakları |
| **Lastikler ve süspansiyon** | açık | lastik sıcaklığı, kayma halkaları, süspansiyon itici çubukları ve tekerlek başına diğer simgeler, arabalardaki çatı lambaları |
| **Etiketler** | açık | viraj adları, numaralı rozetler, darbe etiketleri, hata haritasının viraj etiketleri |
| **Turlardan oluşturulan pist** | açık | çıkarılmış bir model olmayan bir pist için yol yüzeyi (bir pist modeli **Bölüm**'de yüklüyken gizlenir) |
| **Kartlarda tüm değerler** | kapalı | her HUD kartında listelenen her kanal |
| **Gerçek araç şekilleri** | açık | her araba, karşılığının şeklinde (bkz. [Araçlar](#the-cars)); kapalıysa açık tek koltuklu, telemetrinin hiçbirini gizlemeyen şekil |
| **Araç boyutu** | 1× | 1× ile 10× arası, 0,5 adımlarla; 1× arabanın gerçek boyutudur, oyundaki kadar uzun ve geniş. Bunu yalnızca bu kaydırıcı değiştirir |

## Sürülen çizgiler {#driven-lines}

Görünür her turun, kendi örneklerinden geçen yolu, kendi renginde, kaydedilen konumun 0,12 m altında çizilir (bir arabanın kaydedilen konumu referans noktasıdır ve çıkarılmış Forza pistlerinde yoldan 0,28 ile 0,47 m yukarıdadır). Her 1,5 m'de bir nokta tutulur. Görünür 10'dan fazla tur varsa, ilgilenilmeyen turlar her 6 m'de bir nokta tutar (her köşe her karede GPU'ya gönderilir).

## Haritalar {#the-maps}

Üçü de **referans** yolu boyunca şeritlerdir, kaydedilen konumların 0,2 m altında, ızgaranın her 2 m'lik adımı için bir dörtgen.

### Zaman haritası (`where`) {#time-map-where}

Odaklanılan tur için: o noktada, karşılaştırıldığı tura göre (sınıfının en iyisi, ya da referans için her bölümden geçen en hızlı diğer tur) saniye kazanılan ya da kaybedilen metre başına süre; hizalanmış deltanın ızgara adımı başına değişiminden, ±10 m üzerinden düzgünleştirilmiş. Zaman kaybedilen yer kırmızı, kazanılan yer yeşil, aradaki gri. Renk ölçeği, mutlak değerlerin 95. yüzdeliğidir. Böylece uç değerler kırpılır ve turun çoğu aralık içinde kalır. 6 m geniş.

### Neden haritası (`why`) {#cause-map-why}

Odaklanılan tur için: her kayıp, nedeninin olduğu aralık üzerine boyanır (zamanın göründüğü yere değil). Renk nedenin grubuna göredir ve iki kayıp üst üste geldiğinde en pahalı bulgu kazanır. Genişlik `3 + 9·√(maliyet / en büyük maliyet)` metredir. Hiçbir kayıp yoksa, gri 2 m'lik bir şerit. *Nerede gelişebilirsiniz* bölümünde seçilen bulgu beyaza boyanır.

| Grup | Renk | Bulgular |
|---|---|---|
| frenleme | turuncu | frenleme evresindeki sürücü kayıpları |
| giriş | macenta | içeri girerken ve ortadan geçerken sürücü kayıpları |
| çıkış | mavi | dışarı çıkarken sürücü kayıpları |
| düzlük | sarı | düzlükte sürücü kayıpları |
| araç | gri | araç açıklar |
| durum | koyu gri | durum (yarış startı ile uçan tur karşılaştırması) |

### Hata haritası {#mistake-map}

Tüm turlardan (kurs istatistiklerinde seçilen sınıflardan) her metrede kaç tanesinin hata yaptığı: her tür hata, ya da yalnızca istatistiklerde seçilen tür. Her tur her metrede bir kez sayılır. Her hatanın aralığı, kısa olanlar da görünsün diye her iki yandan 6 m genişletilir. Genişlik `3 + 10·(tur / en çok tur)` metre ve koyu kahverengiden parlak turuncuya bir renk. Hiçbir turun hata yapmadığı yerde gri 2 m. Bkz. [Pist istatistikleri](race-course-statistics.md#the-mistake-map).

## Turlardan oluşturulan pist {#track-from-the-laps}

Araçları çıkarılmamış bir oyun için, çizgilerin altına bir yol çizilir. Turlar referans boyunca ne kadar yayılıyorsa o kadar geniş (referans çizgisinden 25 m içindeki yanal ofsetler sayılır) artı her iki yanda 2 m; her iki yanda en az 4 m referans çizgisinden. ±8 ızgara noktası (±16 m) üzerinden düzgünleştirilmiş, asfalt grisi ve hafif kenar çizgileriyle, kaydedilen konumların 0,3 m altında. **Bölüm**'de bir pist modeli yüklüyken gizlenir.

## Araba, darbe ve kazalar pistte {#hits-and-crashes-on-the-track}

Görünür her turun darbeleri ve kazaları (bkz. [Araç kontrol olayları](race-control-events.md#hits-and-crashes)), çizgiler ya da arabalar çizildiğinde, olduğu yerde işaretlenir: sivri bir yıldız — kaza için kırmızı, darbe için kehribar — bir direğin üstünde, dibinde turun renginde bir halka; araba boyutuyla boyutlandırılmış (kazalar daha büyük). Araba bir darbenin anından geçerken, bu noktadan 0,8 s boyunca bir şok halkası yayılır.

## Yardım modu {#help-mode}

Dil seçicinin yanındaki **?**, ya da **?** veya **F1** tuşu, üç sekmede de ekrandaki her rengin anahtarını açar ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx), [`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Seçim bu tarayıcıda kalır.

- **Görünümün köşesindeki anahtar**, kullanılan sekme ve mod için renkleri listeler. Her renk skalası, görünümün onu nereden aldığına göre gelir. Düzenlediğiniz bir ısı skalası, düzenlendiği gibi görünür. Yarış sekmesinde yalnızca yüklü turların taşıdığı şeyler listelenir.
- **Her arabanın kartına**, tekerleklerinde çizilenin adlarla bir tablosu eklenir. Her tekerleğin değeri çizildiği renkle yazılır.
- **Odaktaki araba**, her tekerleğinde aynısını söyleyen bir etiket alır. Etiketler köşelere doğru yerleştirilir. Araba ekranda onlara sığmayacak kadar küçükse gizlenir.

## Araçlar {#the-cars}

**Her araba kendi şeklinde**, turunun renginde ve gerçek boyutunda. Şekiller, oyunun çalıştığı makinede bir kez yapılan bir araç dosyasından gelir:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Bir araç dosyası yoksa, her araba **görüntüleyicinin kendi arabası** olarak çizilir. Türü ve dönemiyle: sedan, coupe, hatchback, station wagon, spor araba, süper araba, kas arabası, arazi aracı, pickup, van ya da mikro araba. Her biri bir klasik (1980'den önce), 80'ler ve 90'lar ya da modern olarak ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Bunlar genel oranlardan burada yapılmıştır: logo yok, model adı yok ve hiçbir oyunun dosyalarından bir şey yok. Bu yüzden görüntüleyiciyle birlikte gelirler. Türü arabanın adından, dönemi içindeki yıldan alınır. Hiçbiri olmayan bir araba sınıfından alınır. Yayımlanmış uzunluk, genişlik, yükseklik ve dingil mesafesiyle bilinen yaklaşık yüz gerçek nesil vardır ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); her biri bir satır, yuvarlanmış). Böylece 1990'ların bir 3 serisi, o arabanın boyutunu ve duruşunu alır. Ama rozet ya da ızgara olmadan düz bir şekil olarak.

Araba dosyası, kendi makinenizde, kendi oyun kopyanızdan yapılır. Her arabanın düşük ayrıntılı bir modelini tutar, yaklaşık 900 üçgen, tekerlek konumlarıyla birlikte (bkz. [çıkarıcının `cars` komutu](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Araç dosyası yükle...** görünüm ayarlarında ya da dosyayı yarış sekmesine bırakmakla yüklenir. Bu tarayıcıda kalır. Oyunun şekillerini içerdiğinden başkasına verilecek bir şey değildir. Görüntüleyici hiç birini taşımaz.

Bir turun arabasının yerine hangi arabanın geçtiği, her seferinde o an yüklü olanlardan hesaplanır ve asla saklanmaz. Bu yüzden bugün karşılığı olmayan bir araba, daha yeni bir dosya onu içerir içermez kendi arabasını alır ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Turun arabası | Nasıl çizilir |
|---|---|
| numarası, aynı oyunun dosyasında yer alıyor | o araba |
| aynı marka ve adında modelin bir kelimesi var | o model, yıl bakımından en yakın |
| aynı marka, aynı nesil | o markanın yıl bakımından en yakın arabası |
| başka her şey, bir araç dosyasıyla | aynı markanın en yakını varsa o, yoksa aynı gövde tipi, yıl bakımından en yakın |
| adından bir açık tekerlekli araba | aşağıdaki tek koltuklu |
| yukarıdakilerden hiçbiri, ve görüntüleyici arabayı boyutundan tanıyor | o gerçek arabanın boyutunda görüntüleyicinin kendi arabası, dosyayla ya da dosyasız |
| dosyasız başka her şey | o türün ve dönemin görüntüleyici arabası |

Yani başka bir oyundaki 1990 model bir BMW 3 serisi turu, o yıllara yakın bir BMW gösterir. Dosyadan daha yeni bir araba, dosya yeniden yapılana kadar en yakın akrabasını gösterir. Bir turun ipucu ve odaktaki tur için araba boyutunun altındaki satır, neyle çizildiğini ve bunun ne kadar yakın olduğunu söyler.

Görüntüleyicinin kendi arabalarının camları koyu renktir. Bir araba dosyasının modelleri her yerinde tek renktir, çünkü dosyada boya ve cam yoktur. Tekerlekler, arka lambalar, farlar ve aşağıdaki telemetri simgeleri tek koltuklu gibi çizilir. İtici çubuk tekerleğin dış yanından yukarı çıkar, görülebilsin diye. Salıncak kolları ise çıkarılır.

**Tek koltuklu**, turun renginde bir açık tekerlekli araçtır. Ön, her açıdan belli olsun ve hiçbir şey tekerlekleri gizlemesin diye: gövde, motor kapağı, yan kaporta, bir kaskla kokpit, halo, zemin, ön ve arka kanatlar; dört yuvarlak teker, ön olanlar direksiyonla döner (tam kilitte 0,5 radyana kadar), her biri iki salıncak kolunda, dik milde, ön için takım çubuğu ya da arka için tahrik mili ve bir itici çubukla. Model kaydedilen konumun 0,3 m aşağısına indirilir, tekerlekleri yola otursun diye, ve **Araç boyutu** ile ölçeklenir.

**Gövde yayları üzerinde hareket eder**: turda dört süspansiyon yolu da varsa, her köşe kendi yolu kadar iner (tam sarkmadan tam sıkışmaya 0,12 m olarak abartılı, bir takip kamerasından da görünsün diye), ve gövde bu dört noktadan geçen düzlem üzerinde batar, eğilir ve yuvarlanır.

**Telemetriden çizilenler** (*Lastikler ve süspansiyon* açıkken), [kanal tablosunu](race-charts-and-hud.md#the-channel-table) izler:

| Simge | Kaynak | Çizim |
|---|---|---|
| lastik rengi | `tireTemp` | lastiğin kendisi, soğuk için mavi → turkuaz → çalışma sıcaklığında yeşil → sarı → sıcak için kırmızı, 40-130 °C arası |
| kayma halkası | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (en büyüğü) | tekerleğin altında yerde bir halka: tutuş elde iken yeşil, 0,66'da kehribar, 1'de kırmızı (oyunun bildirdiği tutuşun kenarı); 0,3'ün altında soluk |
| süspansiyon çubuğu | `suspension` (0..1) | itici çubuk, hareketine göre renkli: uzamış mavi, orta beyaz, sıkışmış kırmızı |
| fren parıltısı | `brakeTemp` (100-900 °C) | tekerleğin dış yüzünde bir disk, koyudan turuncuya |
| aşınma bandı | `tireWear` (0..1) | lastik kenarının etrafında bir bant, yeni için beyazdan aşınmış için kırmızıya |
| yük çubuğu | `wheelLoad` (0-12 000 N) | tekerleğin yanında, yükü kadar yüksek bir direk |

Fren lambaları (yağmur ışığı ve kanat uçları), fren pedalıyla yanar. Açık olan her `lamp` kanalı (aralığının yarısından fazla) hava kutusunun üstündeki bir lambayı kendi rengiyle yakar: ABS çalışıyor, çekiş kontrolü çalışıyor, DRS, pit limiter, el freni, havada.

**Kalabalıkta** (10'dan fazla görünür), bakılmayan arabalar sade çizilir: yalnızca gövde, kanatlar, tekerlekler ve fren lambası.

## Etiketler {#labels}

Pist üzerine sabitlenmiş, her karede kameranın izdüşümüne göre yerleştirilir (ekran dışında ya da kameranın arkasında olursa gizlenir). **Etiketler** açıkken:

| Etiket | Yeri | Tıklama |
|---|---|---|
| viraj adları (`T1`, `T2` …) | referansta her virajın viraj noktasının üstünde | - |
| 1-5 arası numaralı rozetler | odaktaki turun en büyük beş sürücü kaybı, her nedenin aralığının ortasında, nedenin renginde kenarlıklı; üzerine gelince başlık ve maliyet | o bulguyu hizalayıp tekrar oynat |
| darbe / kaza etiketleri | **odaktaki** turun her patlamasının üstünde: "Kaza −45 km/s" / "Darbe −12 km/s"; üzerine gelince tam açıklama ve ipucu | darbeyi hizalayıp tekrar oynat |
| hata haritasının viraj etiketleri (adların ve rozetlerin yerine, harita hata haritası olduğunda) | her virajın viraj noktasında: "T3 · 5/40 erken fren" (en yaygın hata, bunu yapan turlar / virajı süren turlar), tek bir tür seçildiğinde "T3 · 5/40", hiçbiri yoksa "T3 · temiz"; üzerine gelince virajın kayıpları ve en yaygın beş hatası | o virajı kurs istatistiklerinde aç ya da kapat |

## Aynalanmış dünyalar {#mirrored-worlds}

Görüntüleyicinin dünyası, Y yukarı olan sağ elli bir dünyadır. Üstten bakıldığında, yön açısı `atan2(dx, dz)` büyüyen bir araba sola dönüyordur. Sol elli dünyası olan bir oyun (Forza bunlardan biri) aynalanmış çıkar: her sağ dönüş sol dönüş olarak çizilir. Pist ve turların ikisi de.

Turlar bunu kendileri söyler ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)). Her turu birkaç metre (3 m) adımlarla yürüyerek, yolunun dönüşü, dış süspansiyonun sıkışmasıyla (`suspension.FR` eksi `suspension.FL`) karşılaştırılır. Süspansiyon yoksa direksiyonla (her bağdaştırıcıda sağa pozitif) karşılaştırılır. Toplamda π'den az dönen bir tur bir şey söylemez. Kanıt, dönüşün %2'sinden fazla olduğunda sayılır. Turlar oy kullanır. Berabere kalırsa "söylenemez".

Turların kararı, mevcut eksen ters çevrimiyle (**Kamera ve sahne → Dünya eksenini ters çevir** içinde tek sayıda ters çevrilmiş eksen) çeliştiğinde, **Turlar** bölümü bunu listenin altında söyler:

- oyun aynalanmıştır ve hiçbir şey ters çevrilmemiştir: "Bu turlar, pist sola bükülü çizilirken sağa direksiyon kırıyor …" ve **X'i ters çevir**;
- eksenler ters çevrilmiştir ama turlar aynalanmamıştır: "Ters çevrilmiş eksenler, bu turları aynalanmış çiziyor …" ve **Eksenleri sıfırla**.

Yalnızca çizim değişir. Görünüm matrisine katlanmış bir yansıma. Veri, analiz ve araçların gösterdiği her koordinat oyunun kendisi olarak kalır. Ters çevirme tarayıcıda tutulur. Analiz, bükülerin sağ ya da sol olduğunu aynı ölçümle adlandırır (bilinmeyen bir dünya, Forza'nınki gibi aynalanmış sayılır).

## Geliştiriciler için {#for-developers}

Kod: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Saniyedeki bir arabanın durumu {#what-a-car-is-at-a-moment}

`stateAt`, her kanalı turun zamanının iki yanındaki iki örnek arasında enterpolasyonla hesaplar. Basamaklı kanallar (vites, bayraklar) en yakın örneği alır. Bitmiş bir tur çizgide durur.

**Yön.** Hareket yönü, birkaç metre arayla alınan konumlardan gelir (her iki yanda en az 2 m, böylece bir sarsıntı arabayı döndürmez). Arabanın gövde yönü, oyunun yaw değerinden ancak hareket yönüne uydurulduğunda gelir: işaret ve ofset, 10 m/s'nin üzerindeki örneklerde (en az 20) dairesel ortalamayla. Ve yalnızca sonra o yönle uyuşuyorsa (dairesel varyans 0,05'in altında, yaklaşık 18° saçılma). Aksi halde gövde hareket yönünü gösterir. Bu, bir kaymanın görünür kalmasını sağlar (gövde ve hareket ayrı), bir oyunun açı kuralına güvenmeden.

**Direksiyon ve taraflar.** Pozitif bir direksiyonun arabayı hangi yöne döndürdüğü ve oyunun sağ tekerleklerinin hangi tarafa ait olduğu, turdan ölçülür: direksiyon, yolun dönüşüne karşı; ve dönüşlerin dış tarafında hangi tarafın süspansiyonunun sıkıştığı (süspansiyon verisi yoksa Forza oyunları aynalanmış sayılır).
