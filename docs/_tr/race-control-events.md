---
title: "Araç kontrol olayları"
parent: "Yarış analizi"
nav_order: 54
lang: "tr"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Araç kontrolü olayları

Görüntüleyici her turun nasıl sürüldüğünü izler ve sürücünün arabayı nerede kaydırdığını, patinaj yaptırdığını, bir şeye temas ettirdiğini ya da tutuşu boşa harcadığını işaretler. Bu yararlıdır, çünkü zamana mal olan bir hata, düzeltmesi en hızlı olan hatadır.

![Araç kontrolü bölümü: her tur bir tekerleği kaç kez kilitledi, patinaj yaptı ya da dışarı savruldu, ve açılmış tek bir kusurla birlikte kusurların listesi](../assets/img/en/race-control-table.webp)

## Basit anlatımla {#in-plain-words}

- **Kilitlenme**: frene o kadar sert basarsınız ki bir tekerlek dönmeyi bırakır ve kayar. Araba daha kötü durur ve yönlendirilemez.
- **Patinaj**: gaza o kadar sert basarsınız ki çeken tekerlekler araba ilerlediğinden daha hızlı döner. Çekişi kaybedersiniz.
- **Arka kaçışı**: arabanın arkası geniş bir yay çizerek kayar. Tam bir tur dönerse bu bir **spin**dir.
- **Önden kayma**: arabanın önü geniş bir yay çizerek kayar ("itme"); direksiyonu daha çok çevirmek yardımcı olmaz.
- **Temas** ve **düşme**: araba bir şeye dokunmuştur (temas bir çarpma ya da sıyrılmadır, düşme ise sert bir çarpmadır).
- **ABS**, **TC**: arabanın kendi yardımcıları; kilitlenmeye ve patinaja karşı çalışırlar. Bunlar hata değildir.

## Araç kontrolü bölümü (ne görürsünüz) {#the-car-control-section-what-you-see}

Odaklanılan tur için, turların taşıdığı her şeyle ilgili olarak — lastik kayması ve kayma açısı yoksa bile — hâlâ bulunabilen şeyi gösterir; hiçbir şey göstermemek yerine (aşağıda).

**Tablo**: iki turun en az birinin gösterdiği her tür için bir satır — Kilitlenen tekerlekler, Patinaj, Arka kayması (arka kaçışı ve spinler), Geniş itme, Düşmeler, Temaslar, ABS etkin, Çekiş kontrolü etkin, El freni, Havada — her hücrede "sayı · saniye", odaklanılan tur ve onunla karşılaştırılan tur için; kayma açısı varsa *En büyük kayma açısı* (yerde en büyük olan).

**Liste**: en az 0,02 s'ye mal olan, paylaşılmayan kusurları, en pahalıdan başlayarak, en çok 12 tane; her biri başlığı ve maliyetiyle (ve türünün etiketiyle). Birine tıklayarak ipucunu okuyun, arabaları 40 m önce hizalayın ve tekrar oynatın. **Ayrıca iki turun orada ne yaptığı** her kusuru ekler, paylaşılanlar dahil (etiket "ikisi de yaptı", maliyet 0,01 s'nin altındaysa "—"). Hiç yoksa: "X'in lastiklerle yaptığı ve Y'nin de yapmadığı hiçbir şey ona zaman kaybettirmedi."

**Bunun altındaki ipucu** algılamanın neye bakarak görebildiğini söyler — "Her tekerleğin kayması ve kayma açısından ve arabanın kayma açısından." (ya da kayma ve kayma açısı, kayma açısı ile kayma, yalnızca kayma, ya da "Yalnızca arabanın kayma açısından — bu turlarda lastik kayması yok.") — sınırların hangi zemin için ölçüldüğünü (asfalt, gevşek, karışık: örneklerin %80'inden fazlası gevşekse gevşek, %20'sinden azı asfaltsa asfalt), olayların hangi tura göre yerleştirildiğini ve maliyetin nasıl sayıldığını.

Lastik kayması ve kayma açısı **olmayan** bir turda (Forza Horizon'ın FH Companion tur dosyası, telemetrisi olmadan) tablo ve liste yine gösterilir ve ipucu, turların taşıdığı şeylerden hâlâ neyin bulunduğunu söyler: "Bu turlar lastik kayması ve kayma açısı taşımıyor, bu yüzden kilitlenmeler ve patinaj söylenemez. Yine de bulunanlar: itmeler, direksiyondan yola karşı; temaslar ve düşmeler, hızdan ve ivmeden." — turlarda bir yaw oranı varsa kaymalar da adlandırılır, itmeler ise yalnızca direksiyon verisi varsa. Kayma ve kayma açısı sınırlarına ilişkin cümle çıkarılır ve ikinci bir ipucu şunu söyler: "Forza Horizon için, her FH Companion turunun yanındaki `.tele.gz` dosyasını da seçin: tam telemetridir, her tekerleğin kaymasını saniyede 64 kez içerir."

Turun **toplam** kontrol maliyeti (özetlerde kullanılır) üst üste binen kusurları — 40 m içindeki bir kilitlenme ve onun başlattığı kayma — bir kez, kümenin en pahalısında sayar.

## Nasıl algılanır {#how-it-is-detected}

Bu sayfanın geri kalanı kural kitabıdır: her tür, her eşik.

Kod: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Gerekçe ve kaynaklar [yöntemde](race-analytics.md).

## Türler {#the-kinds}

| Tür | Tablo satırı | Bir kusur mu? | Sayılan en kısa süre |
|---|---|---|---|
| `lock` | Kilitlenen tekerlekler | evet | 0,1 s |
| `wheelspin` | Patinaj | evet | 0,15 s |
| `oversteer` | Arka kayması | evet | 0,2 s |
| `spin` | (Arka kayması ile birlikte sayılır) | evet | 0,1 s |
| `understeer` | Geniş itme | evet | 0,25 s |
| `crash` | Düşmeler | evet | - |
| `hit` | Temaslar | evet | - |
| `abs` | ABS etkin | hayır | 0,2 s |
| `tc` | Çekiş kontrolü etkin | hayır | 0,2 s |
| `handbrake` | El freni | hayır | 0,1 s |
| `airborne` | Havada | hayır | 0,15 s |

Daha kısa süreler gürültüdür (bir bordür, bir çukur, tek bir örnek). Bir testi geçen ızgara noktalarının (her 2 m) ardışık grupları, 2 noktaya kadar olan boşluklar üzerinden birleştirilir. Yalnızca **kusurlar** hata olabilir ve bir maliyeti vardır; diğerleri arabanın ve sürücünün yaptıklarıdır.

## Her testin gerektirdikleri {#what-every-test-needs}

### Türetilmiş kanallar {#derived-channels}

Yargılanmadan önce her tur, oyunun göndermediği şeyleri standart adlarla alır (bir oyunun kendi değeri her zaman kazanır):

| Kanal | Kaynağı |
|---|---|
| `bodySlip` (kayma açısı) | araç çerçevesindeki hız, `atan2(latVel, abs(longVel))`, oyunun gönderdiği yerde (3 m/s'nin altında 0); aksi halde yön (oyunun yaw değeri, hareket yönüne işaret ve kayma ile uydurulmuş, 10 m/s'den hızlı örnekler üzerinden, yalnızca dairesel varyans 0,05'in altındaysa güvenilir) ile hareket yönü (en az 2 m aralıklı konumlar), 3 m/s üzerindeki hızlarda |
| `yawRate` | bir yön varsa ama bir oran yoksa, `yaw` değerinin zamana göre değişimi |
| `airborne` | her tekerleğin yere temasının kapalı olması (≤ 0,5); yoksa her tekerleğin yükünün medyanının %5'inin altında olması; yoksa her süspansiyon hareketinin 0,02'de ya da altında olması (tamamen açık). Tek bir rastgele örnek bir uçuş sayılmaz |
| `slipRatio.<W>` | oyun tekerlek yüzey hızlarını gönderdiğinde `(tekerlek yüzey hızı - araba hızı) / araba hızı`, 3 m/s üzerinde; ya da tekerlek dönüşü × turda ölçülmüş bir yuvarlanma yarıçapı — düz giderken kaydırmada `speed / rotation` medyanı (hız > 10 m/s, gaz < 0,3, fren < 0,05, abs(boylamsal ivme) < 3 m/s², havada değil; 20'den az olduğunda 10 m/s üzerindeki her örnek), 0,1 ile 1 m arasında kabul edilir. `physical` olarak işaretlenir |
| `loose` | Forza'nın yüzey gürültüsü en az 2 tekerleğde (> 0,001) en az 0,33 s boyunca (bir bordür daha kısadır), 1 s'den küçük boşluklar köprülenir |

### Yerde ve oturmuş {#on-the-ground-and-settled}

Havada ya da **bir inişten sonraki 0,3 s** boyunca hiçbir şey yargılanmaz — süspansiyon dibe vurur ve ivmeler sıçrar; bu tutuş, fren ya da çekiş değildir. Bir örnek ayrıca **hareket halinde** olmalıdır: 5 m/s'den hızlı.

### Zemin {#the-ground}

Her örneğin zemini, turun `loose` kanalının bunu söylediği yerde **gevşektir** (Forza'nın yüzey gürültüsü, Trackmania'nın tekerlek malzemeleri); aksi halde turun yüzeyidir (bkz. [disiplin ve yüzey](race-loading-laps.md#discipline-and-surface)): asfalt ya da başka her şey için gevşek. Eğriler, kayma alışkanlıkları ve eşikler asfalt ve gevşek zemin için ayrı tutulur.

### Kayma, lastiğin nominal zirvesinin katı olarak {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Oyunlar kaymayı farklı ölçekler; `meta.slip` nasıl olduğunu söyler ve her kayma, yaklaşık 1'in lastiğin nominal zirvesi olması için bir ölçeğe bölünür:

| `meta.slip` | Anlamı | Bölünen |
|---|---|---|
| `peak` | oyun tarafından normalleştirilmiş: 1'in ötesinde tutuş kaybolur (Forza Data Out) | 1 |
| `scaled` | fiziksel kayma, bir asfalt zirvesine bölünmüş (Kunos kaydedicisi) | zeminin nominal zirvesinin asfalt zirvesine oranı |
| `index` | 0..1 arası bir kayma ölçüsü (Trackmania'nın SlipCoef'i) | 0,5 |
| `physical` (ya da bilinmeyen) | kayma oranı bir kesir olarak, kayma açısı radyan olarak | zeminin nominal zirvesi |

En iyi bilinmeyen durumda nominal zirveler:

| Yüzey | Kayma oranı | Kayma açısı |
|---|---|---|
| asfalt | 0,12 | 8° |
| karışık | 0,18 | 12° |
| gevşek (çakıl) | 0,25 | 15° |
| kar | 0,25 | 15° |
| buz | 0,10 | 6° |

### Tutuş nerede biter: her arabanın lastik eğrileri {#where-grip-ends-each-cars-tyre-curves}

Bir lastiğin daha fazla vermeyi bıraktığı nokta **araba başına** ölçülür, o arabanın yüklü her turundan (`measureTyres`), asfalt ve gevşek zemin için ayrı ayrı:

| Eğri | Örnekler (hız > 10 m/s, oturmuş, ivmeler 45 m/s²'nin altında) | Kayma (x) | Kuvvet (y) |
|---|---|---|---|
| frenleme | fren > 0,3, el freni ≤ 0,2, düz giderken (yanal, en sertin %30'unun altında) | dört tekerleğin ortalama kayma oranının mutlak değeri | yavaşlama |
| çekiş | gaz > 0,8, fren ≤ 0,05, düz, o hızda arabanın tam gaz çekişi > 0,5 m/s² | en büyük çeken tekerleğin kayma oranı | o çekişin payı olarak ivme |
| ön | yanal, en sertin %30'undan fazla, o hızda arabanın tutuşu > 1 m/s² | iki ön kayma açısından büyük olanı | o tutuşun payı olarak yanal ivme |
| arka | aynısı | iki arka kayma açısından büyük olanı | aynısı |

"En sert" ilgili zeminde turun yanal ivmesinin mutlak değerinin 99. yüzdeliğidir (50'den az örneği varsa tüm zemin). Çekiş dişlisi, hangi tekerleklerin çektiğine karar verir (önden çekiş: ön tekerlekler, arkadan çekiş: arka tekerlekler, dört çekiş: hepsi; bilinmiyorsa: hepsi).

En az **150 örnekten** itibaren kayma 6 ila 14 eşit sayıda gruba bölünür (her 40 örnek için bir grup); her grubun kuvveti üst çeyreğidir (sürücü istediğinde lastiğin verdiği), komşu gruplar üzerinden düzleştirilmiş. **En iyi** değer en çok kuvvetin olduğu gruptur; **sınır** ise kuvvetin **%8** düştüğü, ondan sonraki ilk gruptur. Verilerde hiç düşmeyen bir eğrinin sınırı yoktur (sonsuz) — o oyunda "zirvenin" ötesine geçmek bir şeye mal olmaz ve kayma tek başına orada hiçbir şeyi işaretlemez (Forza Horizon'ın viraj ve çekiş eğrileri böyledir). Bir zeminde örnekler azsa, diğer zeminin örnekleri kullanılır; toplamda azsa, **nominal** sınır: nominal zirvenin 1,5 katı.

Her araba ayrıca şunları alır:

- **kayma alışkanlığı**: en az %60 ya da daha fazla sertlikte virajda döndüğü her yerde kayma açısının üst çeyreği (100 örnek gerekir);
- **eğrilik başına direksiyon** (`steerGain`), her 5 m/s hız bandı için: sert bir şekilde ama tutuşunun iyice içinde virajda dönerken (sertliğinin %30-60'ı, 400 m yarıçapından daha sıkı eğrilik, direksiyon 0,02'nin üzerinde; bant başına 25 örnek) mutlak değer(direksiyon) / yol eğriliğinin medyanı. Yolun eğriliği, oyun bir yaw oranı gönderdiğinde yaw oranının hıza bölümüdür; aksi halde ±5 m'deki konumlardan hesaplanır.

## Algılama, tür tür {#detection-kind-by-kind}

| Tür | Test (hareket halinde, oturmuş örnekler üzerinde) | `peak` ve `limit` |
|---|---|---|
| **lock** | fren > 0,05, el freni 0,2'yi geçmiyor ve herhangi bir tekerleğin kayma oranı, frenleme sınırının eksisi altında | en negatif kayma (nominal zirvenin katları); sınır negatif olarak |
| **wheelspin** | gaz > 0,2 (ya da gaz kanalı yoksa), ve çeken bir tekerleğin kayma oranı çekiş sınırının üzerinde | en büyük çeken kayma; sınır |
| **oversteer** (kayma açısı) | kayma açısı, yüzeyin tabanı ile 1,5 × arabanın o yerdeki kayma alışkanlığı arasındaki büyük olanın üzerinde | en büyük kayma açısı, radyan |
| **oversteer** (kayma açıları, kayma açısı yok) | arka kayma açılarının büyüğü, arka sınırın üzerinde ve öndekinden 0,25'ten fazla büyük | arka kayma açısı (zirvenin katları) |
| **oversteer** (kayma açısı yok, ama yaw oranı ve yanal ivme var) | "tutum hızı" — mutlak(yaw oranı) eksi mutlak(yanal ivme) / hız, 8 m/s'den fazla — 0,2 rad/s'nin üzerinde, direksiyon virajın tersine | rad/s; sınır 0,2 |
| **spin** | kayma açısı tepe değeri **60°**'nin üzerine çıkan bir oversteer grubu | oversteer gibi |
| **understeer** (kayma açıları) | kaymıyor, ön kayma açılarının büyüğü ön sınırın üzerinde ve arkadakinden 0,3'ten fazla büyük | ön kayma açısı; sınır |
| **understeer** (kayma açısı yok) | 12 m/s'den hızlı, kaymıyor, karşı direksiyon yok, yanal ivme turun en sertinin (99. yüzdelik) yarısından fazla, yol 300 m yarıçaptan daha sıkı, ve direksiyon arabanın kendi eğrilik başına direksiyonunun yolun gerektirdiğini söylediğinin **1,6 katından** fazla | gereken direksiyonun katı; sınır 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` 0,5'in üzerinde | - |
| **handbrake** | `handbrake` 0,2'nin üzerinde | - |
| **airborne** | `airborne` 0,5'in üzerinde | - |
| **hit**, **crash** | bkz. [Temaslar ve düşmeler](#hits-and-crashes) | darbenin aldığı hız |

Zemine göre kayma açısı tabanları: asfalt **7°**, karışık **10°**, gevşek ve kar **15°**, buz **10°**. Kendiliğinden daha çok kayan bir araba — arcade bir lastik modeli, bir çakıl uzmanı — kendi turlarından, kendi (daha yüksek) eşiğine sahiptir (1,5 × alışkanlığı).

**Araba hangi yöne döner** ("virajın tersine" için): turun kendi yolunun ±6 m üzerindeki yön değişimi (en az 2 ızgara noktası); 600 m yarıçaptan daha sıkısı dönüş sayılır; sağ ya da sol, dünyanın aynalanıp aynalanmadığına göre. Direksiyon **tersine** olduğunda, mutlak(direksiyon) > 0,05 ve işareti dönüşün tersi ise — bir kaymanın ters direksiyonla **yakalanması**.

**Başladığı andaki pedallar** (`pedal`): *fren*, fren 0,1'in üzerinde ise; *gaz*, 0,3'ün üzerinde; *gazı kesme*, gaz, önündeki 8 ızgara noktası (16 m) içinde 0,5'in üzerinde ise; aksi halde *boşta* (ya da gaz kanalı yoksa).

## Diğer tur ile karşılaştırma {#laid-against-the-other-lap}

Her olay, odaklanılan turun o bölümde karşılaştırıldığı tura göre yargılanır (sınıfının en iyisi; turun kendisi için, bölümden en hızlı geçen sınıf arkadaşı):

1. **Diğer tur ne kadar gitti**: aynı metrelerde, ±8 m, diğer turun kendi aynı ailesinden olayları (bir spin oversteer sayılır, bir düşme temas sayılır), aynı birimlerde, eşiksiz, diğer arabanın lastik eğrileriyle ölçülmüş.
2. **Paylaşılmış**, diğer tur **%80** veya daha fazla gittiğinde: virajın böyle sürüldüğü, bir hata olmadığı anlamına gelir. Hata olmayan türler her zaman "paylaşılmış" sayılır.
3. **Maliyet**, paylaşılmayan bir kusur için: olaydan 5 m önce ile olaydan **40 m sonra** arasında bu turun diğerine karşı kaybettiği zaman (bir temas ya da düşme için, araba hızını geri kazanana kadar — kendi çekişiyle geri kazanması için gereken metre, 40 ila 400 m; ölçülmüş bir çekiş yoksa, 5 m/s²). Asla negatif değildir.
4. **Arabanın sınırına verilen hız**: bir kilitlenme için, arabanın o hızda yapabildiğini gösterdiği yavaşlama eksi yaptığı, olay boyunca toplanmış; patinaj için tam gaz çekişi eksi yaptığı; bir darbe için darbenin aldığı hız. 0,5 m/s'nin (1,8 km/s) üzerindeyse söylenir.

Paylaşılmayan ve en az **0,02 s** maliyeti olan bir kusur listelenir ([yarış istatistikleri](race-course-statistics.md) yalnızca **0,03 s** veya daha fazla kusurları sayar; böylece birçok turda sayılan bir hata açık bir hatadır), ve bir virajın kaybının nedeni olabilir (bkz. [Viraj viraj analiz](race-corner-analysis.md#car-control-faults-and-impacts)).

## Temaslar ve düşmeler {#hits-and-crashes}

`impacts.ts` temasları, yeniden örneklemeden önce turun **kendi örneklerinden** okur — bir temas yüzde saniyeler içinde biter. Lastikler bir darbenin kuvvetlerini yaratamaz, bu yüzden bir temas kendi arabasının kendi turuna göre ölçülür:

- **Tutuşu `G`**: turun üzerindeki yatay ivmesi `√(lat² + long²)` değerinin 99. yüzdeliği; zeminde ve 5 m/s'den hızlı. İvme kanalları yoksa (ya da 3 m/s²'nin altındaysa), 15 m/s² — bir yol arabasının tutuşu.
- **Eşik**: `max(1.8 G, G + 18, 30)` m/s².
- **Çarpılan örnek**: yatay ivme eşiğin üzerinde **ve** bir önceki örneğe göre `G`'nin yarısından fazla sıçrıyor; **ya da** hız 0,1 s içinde, eşiğin 0,1 s'de alacağından ve 1,5 m/s'den fazla düşüyor. Yalnızca zeminde ve oturmuşken, ve araba 5 m/s'den hızlıyken.
- Çarpılan örnekler **0,4 s** içinde bir darbedir.
- **Önce / sonra**: 0,15 s öncesindeki en yüksek hız; son çarpılan örnekten 0,3 s sonrasına kadar en düşük hız.
- **Darbe değil**: hız, arkasında hiçbir kuvvet olmadan kaybolmuş — 0,1 s içindeki en büyük yatay ivme, `G` ve 25 m/s²'nin büyüğünün altında — oyunun arabayı geri sarması ya da sıfırlamasıdır.
- **Düşme**, **30 km/s** veya daha fazla kaybettirdiğinde ya da hızının yarısından azını bıraktığında; aksi halde **temas** — bir çarpma, bir duvar boyunca sıyrılma.
- **Yön**: boylamsal ivme yanal olandan büyük ve negatifse: *kafa kafaya*; pozitifse: *arkadan*; yanal olan büyükse: *yan tarafa*. İvme yoksa, kafa kafaya.

Bir arabanın neler yapabildiği, tüm darbeler dışarıda bırakılarak, darbeden 0,1 s öncesinden 1 s sonrasına kadar ölçülür (`struckMask`).

## Metinler {#the-texts}

Her olay her iki turu adlandırarak söylenir: nerede (referansın metresi), başladığı hız, diğer tura karşı sınırın ne kadar aşıldığı ve bir ipucu. İpucu türden ve ölçülenden çıkar:

| Olay | İpucu |
|---|---|
| kilitlenme, yalnızca önler | kilitlenen bir ön tekerlek direksiyon veremez: bölgenin başında daha az basınç, virajın içine doğru bırakın |
| kilitlenme, yalnızca arkalar | kilitlenen bir arka tekerlek arabanın dönmesine izin verir: düz giderken daha çok fren, dönerken frenden çekin; tekrar oluyorsa dengeyi öne alın |
| kilitlenme, gevşek zemin | kilitlenen bir tekerlek saplanarak ilerler: kilitlenmenin hemen altına kadar sıkın |
| kilitlenme, diğer | tutuş için fazla pedal: daha kademeli sıkın |
| patinaj | direksiyon açılırken gazı verin; çekiş sınırlıysa vitesi erken alın (gevşek zeminde: daha yüksek bir vites torku yumuşatır) |
| spin / oversteer | pedala göre: frenin altında (çok fazla fren yaparak frenle dönüş, çok erken bir vites küçültme), gazı kesmiş (gaz kesme oversteer'ı: sabit bir gaz tutun), gazda (hâlâ dönerken çok fazla), hiçbiri (çok hızlı döndü); karşı direksiyon uygulandığında "ters direksiyonla yakalandı"; gevşek zeminde ya da bir ralide, "bir açı en hızlı yoldur — diğer turun açısı yeterliydi" |
| önden kayma | ön gittikten sonra daha fazla direksiyon bir işe yaramaz: daha yavaş gelin, ön yükü artırmak için biraz fren ile gidin, direksiyonu çözün; gevşek zeminde, gazı kesme ya da sol ayakla hafif basarak arabayı döndürün |
| temas / düşme | yan tarafta: bir metre boşluk, sıyrılmaktan daha az maliyetlidir; arkadan: başka bir araba ya da geriye kayma; kafa kafaya bir düşme: daha erken fren yapın; önde bir çarpma: bir şeye çarptınız. Paylaşıldığında "X de orada çarptı." |

Trackmania'da bir kayma ayrıca şunu söyler: yaklaşık **400 km/s**'nin (gevşek zeminde **300**: toprak, çimen, plastik) altında bir kayma tutunmaktan daha az çekiş verir; üstünde, doğru açıdaki bir hız kayması kazandırır, ve bu kayma zaman kaybettirdiği için açısı yanlıştı.

## Her kaynağın izin verdikleri {#what-each-source-allows}

| Turlar taşır | Kilitlenmeler / patinaj | Oversteer / spin | Önden kayma |
|---|---|---|---|
| tekerlek başına kayma oranı ve kayma açısı, araba hızı (Forza Data Out, AC oyunları) | kaymadan | kayma açısından ya da arka kayma açısından | kayma açılarından |
| tekerlek hızları, dünya hızı (ralli oyunları, BeamNG) | türetilmiş kaymadan | türetilmiş kayma açısından | eğrilik başına direksiyondan |
| yaw ve yaw oranı, kayma yok (iRacing) | - | kayma açısından (uydurulmuş yaw'un hareket yönüne karşı); yaw'a güvenilemediğinde, ters direksiyonla birlikte tutum hızından | eğrilik başına direksiyondan |
| yalnızca yön | - | yön ile hareket yönünün karşılaştırmasından | eğrilik başına direksiyondan |
| yalnızca FH Companion tur dosyası (yaw yok, kayma yok) | - | - | eğrilik başına direksiyondan (direksiyonu ve ivmeleri vardır) |

Temaslar ve düşmeler yalnızca hıza ihtiyaç duyar (ivmelerle daha iyi), bu yüzden her kaynakta vardır. **Araç kontrolü** bölümü her kaynağın neye izin verdiğini gösterir: yalnızca bir FH Companion tur dosyasıyla, direksiyondan gelen itmeler ve temaslar, ve geri kalanı için `.tele.gz` dosyasını yükleme ipucu.
