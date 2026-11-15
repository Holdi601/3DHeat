---
title: "Viraj viraj analiz"
parent: "Yarış analizi"
nav_order: 55
lang: "tr"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Viraj viraj analiz

Aynı pistteki iki tur, viraj viraj karşılaştırılır. Her virajda görüntüleyici kimin daha hızlı olduğunu, bunun ne kadar zaman ettiğini ve nedenini söyler: çok erken fren yapıldı, gaz geç verildi, daha geniş bir çizgi izlendi. Böylece önce neyi çalışmanız gerektiğini bilirsiniz.

![Nerede gelişebilirsiniz bölümünde açılmış bir bulgu, Viraj viraj tablosunun yanında](../assets/img/en/race-corner-finding.webp)

Bir örnek: 3. virajda Sürücü A, Sürücü B'den 20 m önce fren yapar ve oraya varmak için 0,15 s kaybeder. Ama gazı daha erken basar ve virajdan çıkarken 0,15 s kazanır. Net sonuç 0,00 s'dir: virajda eşitlik vardır ve kimseye daha geç fren yapması söylenmez.

## Ne görürsünüz {#what-you-see}

### Nerede gelişebilirsiniz {#where-to-improve}

Odaklanılan tur için kenar çubuğundaki bölüm ("En az iki tur yükleyin." bu yapılana kadar gösterilir).

**Başlık:** "<tur> <süre> karşısında <referans> <süre>" ve tur süresi farkı. Ya da referans için "her virajdan geçen en hızlı diğer tura karşı (…)" ve kaybedilen toplam. Yanında kayıp, *sürüş* ve *araç / durum* olarak ayrılır.

**Döküm çubuğu:** nedene göre kaybedilen süre (frenleme, giriş, çıkış, düzlük, araç, durum), neden renkleriyle ve bir açıklamayla.

**Bulgular**, üç liste:

1. Sürücü kayıpları, en pahalıdan başlayarak, en fazla **12** tane. Ya da "Farklı sürmenin zaman kazandıracağı bir yer öne çıkmıyor." yazar.
2. **Arabanın ya da durumun ne kadara mal olduğunu göster (X s)**: araç ve durum kayıpları, en fazla 8 (varsayılan olarak açık).
3. **<tur> başka bir yolla daha hızlı ya da eşit olduğu yerler (N)**: kazançlar ve eşit virajlar, en fazla 10 (varsayılan olarak açık).

Her bulgu sırasını, başlığını (virajı ve ne olduğunu, kayıpsa maliyetiyle), karar satırını, maliyeti (kazançlar eksi işaretle) ve bir çubuğu, ayrıca bir etiketi gösterir: *frenleme*, *giriş*, *çıkış*, *düzlük* (sürücü kayıplarında, araç 0,02 s ya da daha fazlasını açıklıyorsa "· araç X" ile), *araç*, *durum*, *hızlı*, *eşit*. **Birine tıklayın**: arabaları ondan 40 m önce hizalar, çerçeveye alır, tekrar oynatır ve ölçümlerini açar:

- **Frenleme:** her biri nerede (ya da nerede gazdan çekildi) ve hangi hızdan frenledi, ve kaç metre önce ya da sonra (5 m'den itibaren);
- **En yavaş:** her turun en düşük hızı ve nerede olduğu;
- **Tam gaz:** her biri nerede gazı tam açtı ve ne kadar erken ya da geç;
- **Çizgi:** dönüşe girişteki fark, en sıkı yarıçaplar, ne kadar içeride ya da dışarıda kalındığı ve her turun çizgisinin şekli ile viraj noktası;
- **Bir sonraki viraja düzlük:** uzunluğu, ikisi de gazda olduğunda iki hız, ne kaybetti ya da kazandı ve neden: başlangıç hızı, diğerinin daha güçlü çekişi, bir gazdan çekilme, silinen hız ve nasıl sürüldüğü (0,02 s'den itibaren parçalar);
- **Araç:** kaybın ne kadarının araçtan geldiği ve neden (çekiş, tutuş, frenler; 0,02 s ya da daha fazlasıysa);

sonra ipucu, **Araçlar:** (farklı arabalardaysa, bkz. [Araç profilleri](race-car-profiles.md#what-the-cars-decide-in-a-corner)) ve çizgi önerisi.

### Viraj viraj {#corner-by-corner}

İki ya da daha fazla turla bir tablo, her bölüm için bir satır. Odaklanılan turun sınıfı, birden fazla sınıf varsa o sınıf:

| Sütun | Gösterir |
|---|---|
| Viraj | `T3`, `T11-T12` |
| En hızlı | ondan en hızlı geçen tur (bölümün başından sonuna kendi süresi) |
| tarafından | ikinciye karşı farkı, sn |
| çizgi | en hızlı turun şekli ve viraj noktası ("V · geç", "U/V · orta"); en sıkı, giriş ve çıkış yarıçapları için üzerine gelin; karışık bir karmaşık yapı için "iki yolla" |
| (odaklanılan tur) | en hızlıdan ne kadar geride olduğu, ya da en hızlıysa ✓ |

Bir satıra tıklamak, odaklanılan turun bulgusunu orada açar (ya da arabaları bölümden 40 m önce hizalar). Tablonun altında, her virajın bir süresi olduğunda: "Her virajdan geçen en hızlılar, bir araya getirildiğinde: <süre> (referansa göre ± / X sınıfının en iyisine göre)". Bu, en iyi bölümler artı ilk virajın başına kadar olan en hızlı koşudur, o kendi başına bir bölümse.

## Nasıl hesaplanır {#how-it-is-worked-out}

Yönetici kural: **bir viraj bir bütün olarak değerlendirilir**. Bu virajın frenleme bölgesinden, bir sonrakinin frenleme bölgesine kadar. Arabayı daha çabuk döndürmek ve gücü daha çabuk almak için daha erken fren yapan tur, bunun sağladığı çıkışa göre değerlendirilir. Ona daha geç fren yapması söylenmez.

## Tek bir mesafe ekseni {#one-distance-axis}

Turlar süreye göre değil, mesafeye göre karşılaştırılır. Bir saniye geride olan iki tur, farklı virajlardadır. Kendi kilometre sayacına göre de değil (daha sıkı bir çizgi daha az metre kateder). **Referans** turun sürülen yolu eksendir:

- Diğer her turun örnekleri referans yoluna **yansıtılır**: her örnek bir `s` alır, referansta ne kadar ilerde olduğu, ve bir `d`, sola (pozitif) ya da sağa ne kadar uzakta olduğu. Arama, bir önceki eşleşmeden ileriye doğru yapılır (8 yol parçası geriye, 40 ileriye). Böylece kendisini kesen ya da altından geçen bir tur, öteki kesişmeye asla atlamaz. İlk örnek yolun ilk çeyreğinde aranır (bir pistte başlangıç ve bitiş çakışır). 30 m içinde hiçbir şey yoksa, son eşleşmenin gerisinde olmayan en yakın nokta alınır (bir savrulmadan ya da dışarı çıkıştan sonra). `s` asla azalmaz: bir önceki örneğin gerisine düşen bir örnek tutulur.
- Her kanal **tek bir ızgaraya, her 2 m'de bir** doğrusal olarak yeniden örneklenir. Basamaklı kanallar (vites, bayraklar) en yakın örnekle alınır. Bir turun kendi aralığının dışında değerler boş kalır.
- Bir turun ilk ve son örnekleri, referansın uçlarının biraz içine yansır. Bu yüzden her tur, uçlarından **15 m'ye kadar** hızını koruyarak taşınır (zaman, mesafenin hıza bölümü kadar artar, geri kalanı sabit kalır). Böylece çizgideki deltası, tur süresi farkı olur.
- `delta` = her ızgara noktasında turun zamanı eksi referansın zamanı: aradaki fark. `lateral` = ızgaradaki `d`.

İki ızgara noktası arasında bir turun diğerinden fazla harcadığı süre, deltalarının farkıdır: `rel(s)`. Aşağıdakilerin hepsi bunun üzerine kuruludur.

## Viraj {#corners}

**Referansta** bulunur (`findCorners`). Hızı ±6 m üzerinden, eğriliği ise (±5 örnek üzerinden yön değişimi, ±10 m üzerinden düzgünleştirilmiş) ile birlikte:

1. **Önemli hız minimumları.** ±40 m içinde en düşük olan bir nokta. Her iki yanda en yüksek hızdan düşüşü (daha düşük bir minimumdan önce) en az `max(2,5 m/s, hızın %6'sı)`.
2. **Kıvrımlar.** 300 m yarıçaptan daha sıkı bir eğrilik yerel zirvesi ve 80 m içinde hız minimumu yok: tam gazla geçilen bir kıvrım da sürülmesi gereken bir virajdır.
3. **Evreler.** Her viraj noktasından, referans frenlerken (> 0,1) ya da tam gazdan çekilmişken (< 0,95) geriye doğru: giriş; tam gazdan çekilmişken ileriye doğru: çıkış. Tam gazla geçilen bir kıvrım ±30 m alır. Üst üste binen virajlar ayrı tutulur ama turu kaplayacak şekilde döşenir.
4. T1, T2 … diye, tur sırasına göre numaralandırılır. **Sol ya da sağ** eğriliğin işaretine ve dünyanın aynalanmış olup olmadığına göre (bilinmeyen, aynalanmış sayılır).

**Viraj penceresi** (referansın nerede döndüğü): viraj noktasının ±40 m içindeki en sıkı noktadan, eğrilik en yüksek değerinin altıda birinin üstünde kaldığı yere kadar dışarı doğru, her iki yanda 10 m eklenerek. Penceresinin tarafı, "içeri"nin yönünü verir.

## Bölümler: frenleme bölgesinden frenleme bölgesine {#segments-braking-zone-to-braking-zone}

Her viraj, iki yandaki viraj noktalarının yarısına kadar olan yolun sahibidir. Bu yolda:

- **Her turun en yavaş noktası**, hızda gerçek bir çukurdur: her iki yanda 6 m (3 ızgara noktası) içinde bundan yavaş bir şey yoktur. Bu, bölümün uçlarının ötesine bakılarak yapılır. Böylece önceki virajın çıkışında hâlâ hızlanan bir araba asla onu sanılmaz. Viraj penceresinden 15 m öncesinden, ondan 10 m sonrasına kadar aranır. Orada hiç yavaşlamayan bir tur, viraj noktasına yerleştirilir.
- **Bir turun ona yavaşlamaya nerede başladığı** (`entryOf`): en yavaş noktasından geriye doğru frenleme ya da gazdan çekilme boyunca, tam gaz küçük aralıklarla kesilse de, ayağı **10 m** boyunca yere basılana kadar (gaz ≥ 0,95, fren ≤ 0,1). Viraj öncesi son **30 m** içinde yeniden verilen bir gaz hâlâ bu viraja aittir. Baştan sona tam gazsa, en yavaş nokta kendisidir. Gaz kanalı olmayan ya da önceki viraja olan ayağı hiç yere basmamış bir tur, aradaki en hızlı noktasından başlar.
- **Bölüm**, ona yavaşlamaya başlayan ilk turun başlangıcında (4 m önce) başlar ve bir sonrakinin başlangıcına kadar gider. Böylece her turun frenlemesi bölümün içinde kalır ve bölümler turu döşer.

**Karmaşık yapılar.** Referansın arka arkaya gelen virajlar arasında hiç tam gazla geçmediği, yani 40 m'den az tam gaz olan virajlar, tek bir bölümdür: "T11-T12", tek olarak sürülür. Bir karmaşık yapı en fazla **üç** viraj içerir (hiç tam gazsız sürülen kıvrımlı bir bölüm yeni bir tane başlatır). Her iki yana dönen bir karmaşık yapı *karışık* sayılır: onun için tek bir çizgi şekli ölçülmez.

**Bir pistte** (referansın bittiği yer başladığı yerden 50 m içindeyse), son bölümün düzlüğü çizgiyi geçerek ilk frenleme noktasına kadar devam eder. Uçuşta bir turun çizgiden başlayan koşusu son viraja dahil edilir. Duraktan ya da bir yarış startından başlayan tur (bkz. [Başlangıç](#the-start)) bu koşuyu ayrı tutar.

### Bir viraj neye çıkar {#what-a-corner-leads-onto}

Referansta ölçülür: virajdan sonra tam gazdaki metreler (tam gazından bölümün sonuna kadar, artı çizgiyi geçen koşu) ve öncesi (önceki bölümün "sonrası" ya da başlangıçtan).

| Tür | Kural |
|---|---|
| **iki düzlük arasında** (`both`) | öncesinde 200 m veya daha fazla **ve** sonrasında 120 m veya daha fazla |
| **bir düzlüğe** | sonrasında 200 m veya daha fazla, ya da sonrasında 120 m veya daha fazla ve öncesi kadar ya da daha fazla |
| **bir düzlükten sonra** | öncesinde 200 m veya daha fazla |
| **bağlantı** | bunların dışında her şey |

## Her turun bir virajda ne yaptığı {#what-each-lap-did-in-a-corner}

`cornerMetrics`, tur ve bölüm başına, ızgarada (2 m adımla). Pedallar: fren 0,1'in üzerinde sayılır, tam gaz 0,95 ve üzeridir.

| Ölçü | Kural |
|---|---|
| **fren noktası** | gazın kapandığı (0,5'in altına düştüğü) ilk fren, ya da **15 m** süren fren: gaz açıkken sol ayağın bir dokunuşu, frenlemenin başladığı yer değildir. Yalnızca dokunuşlar varsa, ilk dokunuş |
| **gazdan çekilme** | fren yokken, gazın 0,8'in altına düştüğü ilk nokta |
| (pedal yok) | turun yavaşlamaya başladığı nokta (yukarıda) |
| **fren bırakma** | en yavaş noktadan 30 m sonraya kadar olan son fren |
| **fren noktasındaki hız**, **frenleme metreleri** | en yavaş noktaya kadar |
| **en yüksek fren**, **en yüksek yavaşlama** | frenleme bölgesi üzerinden (45 m/s²'nin üzerindeki ivmeler yok sayılır) |
| **frenle virajda dönme (trail braking)** | fren > 0,05 ve |direksiyon| > 0,1 olan metreler |
| **kilitlenme kayması** | bölgede en negatif teker kayma oranı (turda kayma varsa) |
| **en yavaş nokta**, **minimum hız** | yukarıdaki gibi |
| **gaz açık** | bırakmadan (ya da en yavaş noktadan) sonra, frensiz ilk gaz > 0,15 |
| **tam gaz** | bundan sonra, 10 m boyunca ≥ 0,95'te tutulan ilk nokta |
| **süzülme (coasting)** | fren ve gaz ikisi de 0,05'in altındayken bırakmadan gaz açılana kadar olan metreler |
| **gaz düşüşleri** | gazın, gaz açıkken ile tam gaz arasında kendi yüksek değerinin 0,25'ten fazla düştüğü kez sayısı |
| **yanal tepe** | 20 m önce bırakmadan, tam gazın ya da en yavaş noktadan 20 m sonranın hangisi daha sonraysa ona kadar en yüksek yanal ivme |
| **virajın tepesinde vites** | en yavaş noktada |
| **tekerlek patinajı** | gaz açıkken ile tam gaz arasında en yüksek tahrikli teker kayma oranı |
| **denge** | ortada ön eksi arka kayma açısı (+ alt direksiyon) |
| **tam gazda düzlük** | tam gazdan sonraki bölümün (ve çizgiyi geçen koşunun) ≥ 0,95'te olan payı; üzerindeki en uzun gazdan çekilme |
| **silinen hız** | 0,9 ve üzerinde gazla, fren yokken, yerde, yüksek bir noktadan kaybedilen en fazla hız |
| **giriş kayması** | fren noktasından en yavaş noktadan 5 m sonraya kadar, yerde en büyük kayma açısı |
| **el freni** | devreye girdiği yer (> 0,2), en yavaş noktadan 10 m sonraya kadar |
| **havada** | bölümde havada geçen saniye ve en uzun uçuşu |

## Her tur kiminle karşılaştırılır {#who-each-lap-is-compared-with}

- Bir tur, **kendi performans sınıfındaki en hızlı tam turla** karşılaştırılır (referans, referansın sınıfında).
- Bu sınıfın en iyi turu (ve referans) bölüm bölüm, onun içinden **en hızlı geçen, sınıfındaki diğer tur** ile karşılaştırılır. Sınıfında tek başına ise, bütün turlarla karşılaştırılır.

Zaman haritası, tur listesindeki farklar, araç kontrol olayları ve viraj tablosu aynı karşılaştırmayı izler.

## Bir virajın zaman hesabı {#the-time-account-of-a-corner}

`compareCorner`, bir turu diğerine karşı bir bölüm üzerinden:

- **net** = `rel(son) - rel(başlangıç)` (uçuşta bir turda çizgiyi geçen koşu dahil): karar. **0,03 s**'den yakın olan **eşit** sayılır.
- **Bölme** — öndeki turun içeride nerede döndüğü: her iki turun ilk fren noktası ya da en yavaş noktasından, ikisinin tam gaz ve en yavaş noktalarından hangisi daha sonraysa ona kadar olan aralıkta, tur sonra geri verdiği ya da geri kazandığı en büyük salınım, bu salınım **0,04 s**'nin üzerindeyse; değilse iki en yavaş noktanın daha sonraki olanı.
- **Viraj noktasına kadar** = `rel(bölme) - rel(başlangıç)`; **sonrası** = net eksi bu. İkisi de en az 0,04 s ve zıt işaretliyse, tur birinin yerine diğerini **trade etti**.
- **Sonrası**, her iki tur da tam gazda olduğunda yeniden bölünür: **çıkış** (bölmeden daha sonraki tam gaza) ve **düzlük** (oradan sonuna kadar).
- **Düzlük** üç yana bölünür:
  - *çıkış hızı* (`byExit`): ölçülür, modellenmez. Daha yavaş araba, düzlükte biraz ilerde daha hızlı arabanın başlangıç hızından geçer. Oradan itibaren kendi izi, o hızdan yapacağı şeydir, kendi dişli oranı, sürtünmesi ve eğimi içinde. Bu noktaya geri kaydırılıp (ve kazandığı metreler için bitiş hızında devam ettirilip), daha hızlı başlangıçtan kendi süresidir. Fark, çıkış hızının maliyetidir. Daha yavaş araba bu hıza hiç ulaşmazsa (ya da yalnızca son 2 örnekte), bölüm boyunca kendi ivmesi güç olarak geri konur (`a·v` sabit tutularak) ve bu hızda zarfının gösterdiğinden asla daha sert olmaz (zarf yoksa, ölçülen ivmenin iki katı).
  - *arabaların çekişi* (`byPower`): yalnızca farklı arabalarda: iki araba da aynı hızdan, aynı metrelerde, tam gazla, her birinin her hızda gösterdiği tam gaz ivmesi entegre edilerek.
  - *nasıl sürüldü* (`driven`): geri kalan — gazdan çekilme, tam gazda silinen hız.

  Çıkış hızı, düzlük maliyetinden asla fazlasını açıklamaz (ve asla zıt işaretle), bir gazdan çekilme ya da silinen hız bir kısmını geri almadıkça. Bir tur, düzlükte **gazdan çekilmiş** sayılır, tam gazdaki payı hem 0,9'un hem de diğerinin payından 0,05 eksik olduğunda. Silinen hız, ikisi 1 m/s'den fazla farklı olduğunda sayılır. İşaret olarak 0,02 s'den küçük bir anlaşmazlık sıfır yapılır.

Her bölümün neti, tur süresi farkına eklenir. Her virajın viraj noktasına kadar ve sonrası da netine eklenir (testler ikisini de sınar).

### Arabanın payı {#the-cars-share}

Yalnızca turlar **farklı arabalarda** ve tur süre kaybettiğinde (`carShare`):

- **çekiş**: arabaların düzlükteki çekişi (yukarıda), kayba kadar;
- **tutuş**: tur arabasının sınırındaysa (ortadaki yanal ivme, o arabanın o hızda tuttuğunun en az **%90**'ı) ve diğer araba **%5**'ten fazla daha çok tutuyorsa: daha sıkı bir yarıçapla açıklanmayan daha düşük minimum hızın, `½ ln(tutuş_diğer / tutuş_benim) / ln(v_diğer / v_benim)` payı, kalan kayıp üzerinden;
- **frenler**: tur frenlediyse (gazdan çekilmediyse), diğer araba **%5** daha sert fren yapıyorsa ve turun bölge üzerindeki *ortalama* yavaşlaması, arabasının yapabildiğinin en az **%80**'iyse: `u`'dan `v`'ye, `a1` ile `a2`'ye karşı, aynı noktada bitirerek, `(1/a1 - 1/a2)(u - v)² / 2u`, kalana kadar.

Arabanın maliyeti toplamdır, kayba eşit ya da daha az.

## Karar ve bulgu {#the-verdict-and-the-finding}

`cornerFinding`, tur ve virajın başına en fazla bir bulgu yazar. Şu sırayla denenir:

| Durum | Bulgu | Sonuç |
|---|---|---|
| net ±0,03 s içinde, bir trade, küçük taraf ≥ **0,1 s** | **eşit, iki yolla geçiş** — kim içeride yavaş, dışarıda hızlıydı, tersi kim. Arkasında bir düzlük varsa (bir düzlüğe ya da ikisi arasında), içeride yavaş-dışarıda hızlı yol, kurulacak yoldur: erken gazını koru, girişi daha sert frenleyerek geri kazan, daha geç değil | eşit |
| net ±0,03 s içinde, aksi halde | bir şey söylenmez | - |
| kazanıldı, bir trade, viraj noktasına kadar kaybedildi | **yavaş girip hızlı çıkmak karşılığını verdi**: koru, burada çıkış daha değerli | kazanç |
| kazanıldı, bir trade, viraj noktasına kadar kazanıldı | **içeride daha hızlı**: giriş doğru, daha erken tam gaz daha fazla tutardı | kazanç |
| kazanıldı ve diğer turun burada bir kaybı var | **diğerinin yaptığı yüzünden daha hızlı**, nedeni ve ipucu "Diğer tur için: …" diye söylenir | kazanç |
| aksi halde kazanıldı | **içeride / dışarıda daha hızlı**, hangi yarının daha çok kazandırdığına göre (daha geç fren, ortada daha fazla hız; ya da daha erken düz, daha güçlü çekiş) | kazanç |
| kaybedildi, ve bir **çarpma ya da kaza** maliyeti en az `max(0,05 s, kaybın %40'ı)` | darbe, arabalardan önce virajın hikâyesidir | kayıp |
| kaybedildi, ve **arabanın payı** %60 veya daha fazla | **araba**: düzlükteki çekişi, ortadaki tutuşu ya da frenleri — en büyük parça; sürücünün payı (≥ 0,03 s) "Diğer X s: …" diye söylenir | kayıp |
| kaybedildi, ve paylaşılmayan tek bir **araç kontrol hatası** en az `max(0,05 s, %40)` maliyetli | o hata (aşağıya bakın), zamanın onun etrafında nasıl kaydığıyla | kayıp |
| kaybedildi, ve **daha uzun bir uçuş** en az `max(0,05 s, %40)` maliyetli | uçuş | kayıp |
| kaybedildi, bir trade, viraj noktasına kadar kazanıldı | **çok hızlı girip yavaş çıkmak**: çıkışın nedeni; girişten bir miktar vazgeçip dönmeyi ve daha erken düz olmayı sağlamak, diğer turun fren ve tam gaz noktalarıyla. Kökü (`cause`, [istatistiklerin](race-course-statistics.md) saydığı şey): daha çok birkaç metreden fazla geç fren yaptığında, geç fren; aksi halde çıkışın nedeni | kayıp |
| kaybedildi, bir trade, viraj noktasına kadar kaybedildi | **girişte, çıkışın geri kazandığından fazlasını verdi**: girişin nedeni, aynı zamanda kökü (`cause`); çıkışı koru, girişte daha az kaybet | kayıp |
| kaybedildi, düzlükte gazdan çekilmiş, ve sürülen kısım kaybın yarısından fazlaysa | **düzlükte tam gaz değil**: bunun tam gazdaki payı diğerinin payına karşı, gazdan çekilmenin nerede ve ne kadar sürdüğü | kayıp |
| kaybedildi, arabaların çekişi kaybın %60'ından ve düzlük yarısından fazlaysa | **arabanın düzlükteki çekişi** (her iki arabanın 160 km/s'deki çekişiyle birlikte) | kayıp |
| aksi halde kaybedildi | daha çok kaybeden yarının nedeni (viraj noktasına kadar ≥ sonrası ise girişin; değilse çıkışın). Ortada yalnızca orta yavaş olduğu için yavaş çıkmak (1 m/s'den fazla): bunun yerine ortanın nedeni | kayıp |

Kayıp üzerine bir bulgu **Ayrıca:** ile de bitebilir: tam gazda silinen hız ya da düzlükte gazdan çekilme. Düzlüğün sürülen kısmı 0,04 s'den fazla maliyetliyse ve bu zaten neden olarak yazılmamışsa.

Bulgular önce kayıplar olacak şekilde sıralanır, en pahalısı başta. Sonra kazançlar ve eşit virajlar gelir.

### Girişteki nedenler {#causes-on-the-way-in}

`entryCause`, uygulanan ilki (hız farkları m/s cinsindendir; "5 m", bir önceki ya da sonraki noktanın sayılması için eşiktir):

| # | Neden (hata) | Kural |
|---|---|---|
| 1 | girişte bir çarpma ya da kaza | en yavaş noktadan 10 m sonraya kadar başlayan, paylaşılmamış bir darbe |
| 2 | **neredeyse durdu** (olay) | en yavaş hız, bu arabanın tutuşunun diğerinin geçtiği yerde izin verdiğinin **%60**'ının altında (`v_diğer · √(tutuş_benim / tutuş_diğer)`, diğer araba daha fazla tutuyorsa, aksi halde diğerinin hızı), diğer tur 8 m/s'nin üzerinde: bir savrulma, temas ya da kaçırılan bir viraj |
| 3 | girişte bir araç kontrol hatası | paylaşılmamış bir kilitlenme, itme, savrulma ya da gazda olmayan bir kayma, en yavaş noktadan 10 m sonraya kadar başlayan, maliyeti ≥ 0,02 s |
| 4 | en yavaş noktadan önce daha uzun bir uçuş | bkz. [ralli](#rally-rotation-and-flights) |
| 5 | **gazdan çekildi** diğeri tam gazda kaldıysa ya da 5 m veya daha geç çektiyse | yalnızca bu tur gazdan çekildi |
| 6 | **diğeri sadece gazdan çekildiğinde ya da tam gazda kaldığında fren yaptı** | ve ortada 0,5 m/s'den fazla yavaştı |
| 7 | **hafif fren yaptı** | fren yaptı (gazdan çekilmedi), daha sert frenleyebilecek yeri vardı — lastik verisi varsa, kilitlenme kayması bu arabanın frenlerinin en iyi verdiği kaymanın **%60**'ının altında; yoksa o hızda gösterdiğinin **%85**'inin altında bir en yüksek yavaşlama — pedal 0,95'in altında, ve diğer turun en yüksek yavaşlaması **%15**'ten fazla yüksek |
| 8 | **erken fren yaptı** — ya da **arabanın frenleri** | diğerinden 5 m'den fazla önce fren yaptı. Frenleri %5'ten fazla daha güçlü olan başka bir arabada, ve bu arabanın kendi yavaşlamasında ihtiyaç duyduğu mesafeye karşı 10 m'den fazla payı yoksa: arabanın frenleri. Aksi halde erken fren yapıldı, "Frenle daha geç — yaklaşık N m" diye (başka bir arabada, ihtiyaç duyulanın ötesindeki metreler) |
| 9 | **süzüldü** | iki pedalda da değil, 10 m'den fazla, ve diğerinden 5 m daha fazla |
| 10 | **ortada daha yavaş** | en yavaş noktada 0,5 m/s'den fazla yavaş; `v² = a·R` ile bölünür (aşağıda) |
| 11 | **daha yavaş vardı** | fren noktasında 1 m/s'den fazla yavaş, erken fren yapmadan: önceki virajla ve arabanın çekişiyle, ya da ondan önceki virajdaki 0,2 s daha uzun bir uçuşla önceden belirlenmiş. Arabalar farklıysa arabanın |
| 12 | viraj noktasına daha yavaş | aksi halde: frenden daha yumuşak çekmek ve ortaya daha fazla hız taşımak |

**Ortada daha yavaş** (`middleSplit`): her turun en yavaş noktasındaki yarıçapı, kendi yolundan (±8 m) ölçülür. Yanal ivme `v²/R` olarak ve

`ln(v_diğer / v_benim) = ½ ln(a_diğer / a_benim) + ½ ln(R_diğer / R_benim)`.

- Yarıçap, **yarısını veya daha fazlasını** açıklıyorsa: **çok sıkı bir çizgi** — "yolun daha fazlasını kullanın", iki yarıçap ve pay ile.
- Arabanın sınırındaysa (asfaltta 10° kayma / kumlu zeminde 20° aşarak ya da o hızda tuttuğunun %90'ından fazla yanal ivmeyle) ve diğer araba %5'ten fazla daha çok tutuyorsa: **arabanın tutuşu**; bunun yerine çıkışı koru.
- Ortada kayarak (10° / 20° kaymayı aşarak) ve diğer tur bunu yapmadıysa (girişteki kayması en az 4° daha az): **yana kayma** — tutuşunun dışında, eksik değil; biraz daha yavaş gir. Bu arabanın arkası, diğerinden turda en az bir kez daha fazla yakalanıyorsa arabanın diye söylenir.
- Diğer arabada, diğerinin tutuşunun **%96**'sının altında tutan ve turun `v_diğer · √(tutuş_benim / tutuş_diğer)` değerinin 1 m/s içinde taşıdığı yerde: **arabanın tutuşu** — "daha geç fren bunu kapatmaz".
- Aksi halde **fazla tutuş**: diğerininkine benzer bir yarıçapta yanal ivme ve bu arabanın tuttuğu; viraj noktasına daha fazla hız taşı. Bu arabanın arkası tutuşu kullanılmadan önce bırakıyorsa (kaymaları tutuşunun %85'inin altında başlıyorsa ve tur bunun %80'inde ise), kalanı küçük adımlarla bulun.

### Çıkıştaki nedenler {#causes-on-the-way-out}

`exitCause`, uygulanan ilki:

| # | Neden (hata) | Kural |
|---|---|---|
| 1 | çıkışta bir araç kontrol hatası | en yavaş noktadan 10 m öncesinde ya da sonrasında biten, paylaşılmamış tekerlek patinajı, kaza, savrulma ya da darbe |
| 2 | **silinen hız** | tam gazda diğerinden 1 m/s'den fazla hız kaybı; **7 m/s (25 km/h)** üzerinde "savrulmadan çok temas ya da kaza gibi" |
| 3 | **arabayı yanlış döndürdü** (gevşek zemin) | bkz. [ralli](#rally-rotation-and-flights) |
| 4 | **gücü daha geç verdi** | gaz açılması 5 m'den fazla geç, her turun kendi en yavaş noktasından da sayılır (en yavaş noktası daha geç olan tur, geç gaz yüzünden suçlanmaz) |
| 5 | **gazda tereddüt etti** | diğerinden daha fazla gaz düşüşü |
| 6 | **geniş gitti ve bekledi** | her ikisi de düzken, diğerinin 1,5 m'den fazla dışında, ve tam gaz kendi en yavaş noktasından 5 m'den fazla geç |
| 7 | **tam gaz geç** | tam gaz, kendi en yavaş noktasından da 5 m'den fazla geç; oradaki arabanın ivmesiyle |
| 8 | **arabanın sürüşü** | o hızda diğerinin %95'inden az çeken başka bir arabada ve çekiş düzlüğün bir kısmını açıklıyorsa |
| 9 | **virajdan yavaş çıktı** | aksi halde: daha geç bir viraj noktası, böylece araba daha erken düz olur |

Bu iki tur en yavaş noktada farklı vitesteyse, ipucu şöyle biter: "Viraj noktasında vites N; diğeri M kullandı."

### Araç kontrol hataları ve darbeler {#car-control-faults-and-impacts}

[Araç kontrol olaylarından](race-control-events.md) bir hata, neden olarak: bir kilitlenme bir *fren* nedenidir, gazdaki tekerlek patinajı ya da kayma bir *çıkış* nedeni, gerisi *giriş*. En yavaş noktadan sonraki bir darbe *çıkış*, öncesi *giriş*tir. İpucu olayın kendi ipucudur, ardından "Olaydan 40 m sonrasına kadar yaklaşık X s'ye mal oldu" (ya da bir darbe için "arabanın hızını geri aldığı zamana kadar"). Diğerinden 5 m'den fazla önce fren noktası olan bir kilitlenme, ayrıca turun erken fren yaptığını da ekler. Tekerlekler dönüyorken bunun gerekmeyeceği anlatılır.

### Ralli: dönme ve uçuşlar {#rally-rotation-and-flights}

**Gevşek zeminde**, iki turda da kayma açılarıyla ve bu turun gücü (ya da tam gazı) diğerinden 5 m'den fazla geç aldığında:

- **Arabayı daha az döndürdü**: diğer tur, en yavaş noktasında arabayı **12°** veya daha fazla döndürmüştü, ve bu turdan en az **8°** daha fazla. İpucu: dönüş girerken gazdan çekilmek ya da sol ayak frenine dokunmak, yalnızca diğer tur kullandıysa onun el freni noktasıyla, ya da 15 m/s'den (54 km/h) yavaş bir virajda el freni.
- **Fazla döndürdü**: bu tur arabayı 12° veya daha fazla döndürmüştü ve diğerinden en az **12°** daha fazla: gücün azaltılabilmesi için önce düzeltilmesi gerekiyordu.

**Daha uzun bir uçuş**: havada diğerinden 0,2 s veya daha uzun, kalkıştan 10 m önce ile inişten 40 m sonra (ya da bölümün sonu) arasında en az 0,03 s maliyetli. En yavaş noktadan önceyse bir giriş nedenidir; %40 veya daha fazlasını açıklarsa virajın hikâyesi olur. İpucu: kalkışta gazı açık tutun, tepeyi biraz daha yavaş ya da hafif bir fren dokunuşuyla alın.

### Başlangıç {#the-start}

İlk virajdan önce, bir sprintte ya da iki turdan biri duraktan başladığında (ikisi de eksende ilk olduğunda 5 m/s'nin altında) ya da bir yarış startında (diğerinin hızının %60'ının altında), ilk fren noktasına kadar olan koşu, farkı 0,03 s'den fazlaysa kendi bulgusudur (viraj 0): *Kalkış*, *Yarışın başlangıcı* ya da *İlk viraja*. Orada kaybedilen süre, bir turun yarış startından, diğerinin hızdan başladığı durumda *durum* (context) sayılır. Arabalar farklıysa arabaya, aksi halde sürücüye yazılır. İpuçları: başka bir arabayla duraktan, "çoğunlukla araba"; aynı arabayla duraktan başlanıyorsa, daha az tekerlek patinajıyla ve güç bandının üst kısmında vites değiştirerek kalkın; bir yarış startında, başka bir ilk turla karşılaştırın; uçuş hızıyla bir başlangıçta, son viraja daha iyi bir çıkış çizgiyi geçer.

## Sürülen çizgi {#the-driven-line}

`lineMetrics`, tur ve bölüm başına, yalnızca konumlardan (±2 örnek üzerinden düzgünleştirilmiş), viraj penceresi üzerinden (karışık karmaşık yapılar için değil):

| Ölçü | Kural |
|---|---|
| eğrilik | turun kendi yolunda ±8 m üzerinden yön değişimi |
| **en sıkı yarıçap** | 1 / tepe eğrilik |
| **dönüşe giriş** / **çıkış çizgisi** | eğrilik, tepesinin beşte birini ilk / son aştığı yer |
| **orta** | turun yön değişiminin yarısını döndüğü yer |
| giriş / çıkış yarıçapı | yön değişiminin yarısının üzerinde sürülen metreler; ortadan önce / sonra |
| **şekil** | dönerken en sıkı yarıçap bölü ortalama yarıçap: **0,55**'in altında bir **V**, **0,75**'in üzerinde bir **U**, aradakiler "U/V" |
| **viraj noktası** | çıkış yarıçapı bölü giriş yarıçapı: **1,25**'in üzerinde geç, **0,8**'in altında erken, aksi halde orta |
| **hız viraj noktası** | en yavaş noktası ortadan **15 m**'den fazla önceyse: yavaş gir, hızlı çık; 15 m'den fazla sonraysa: ortadan geçtikten sonra da yavaşlamaya devam eder |

Diğer tura karşı: dönüş girişinde içeride (+) ya da dışarıda ne kadar kaldığı, en sıkı kısımda ve iki turun da düz olduğu yerde (1 m'den itibaren söylenir); her birinin nerede döndüğü (8 m'den itibaren söylenir).

### Bu virajda bu arabaya hangi çizgi uyar {#which-line-suits-this-car-here}

`lineFor`, virajın nereye çıktığından ve arabanın bu virajdaki karakterinden:

- **güç-tutuş** = arabanın çıkış hızında tam gaz ivmesi, minimum hızdaki tutuşuna bölünmüş (zarfından). **Point and shoot** **0,45** ve üzerinde; **momentum** **0,25** ve altında.
- **downforce**: 151-252 km/s'deki tutuş bölü 54-108 km/s'deki tutuş **1,15** veya daha fazlaysa, **144 km/s** (40 m/s) veya daha hızlı alınan bir viraj için — o zaman gücü ne olursa olsun bu bir momentum virajıdır. Gevşek zeminde değerlendirilmez.

| Viraj türü | Araç | Çizgi |
|---|---|---|
| bir düzlükten sonra | point and shoot / diğer | V / U, viraj noktası ortada: "frenleme bölgesi ödüldür" |
| iki düzlük arasında | momentum / diğer | U / V, geç viraj noktası |
| bağlantı | momentum / diğer | U / V, viraj noktası ortada: "bunu bir sonrakinin çıkışı için sür" |
| bir düzlüğe | momentum (ya da hızlı downforce virajı) | geniş yuvarlak U, biraz geç viraj noktası |
| bir düzlüğe | point and shoot | V: düz fren, geç dönüş, kısa ve sıkı bir ortada dönme, erken düzlük |
| bir düzlüğe | ikisinin arası | geç viraj noktalı U: yavaş gir, hızlı çık |

Çıkışın önemli olduğu yerlerde (bir düzlüğe, iki düzlük arasında) çekiş düzeni bir cümle ekler: **FWD** (önden çekiş) — frenlerde döndürün, gücü ancak teker açıldıkça verin; **RWD** (arkadan çekiş), güç-tutuş 0,35 ve üzeri — tam gazdan önce doğrultun; **AWD** (dört çekiş) — dönerken bile güç verebilir. Gevşek zeminde her çizgi bir şey daha ekler: arabayı girişte döndürün.

Cümle sonra, turun ne sürdüğünü ve buna uyup uymadığını söyler: *en yavaş geç olan çıkışı bağlar* ya da *erken viraj noktası çıkışı bağlar*, geç bir viraj noktası istenirken turun ne geç viraj noktası yaptığı ne de erken yavaş olduğu yerlerde; *bu araba istediğinden daha yuvarlak*, bir V istenen yerlerde; *bu araba istediğinden daha köşeli*, bir U istenen yerlerde; aksi halde *bu uyuyor*.

## Geliştiriciler için {#for-developers}

Kod: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Gerekçe ve kaynakları: [yöntem](race-analytics.md).
