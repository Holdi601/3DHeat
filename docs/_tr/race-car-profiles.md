---
title: "Araç profilleri ve karşılaştırma"
parent: "Yarış analizi"
nav_order: 56
lang: "tr"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Araç profilleri ve karşılaştırma

Bir araç yalnızca bu kadar sert fren, dön ve hızlan yapabilir. Görüntüleyici bunun ne kadar sert olduğunu kendi turlarınızdan ölçer; bu yüzden aracınızın yapamayacağı bir şeyi yapmanızı asla söylemez. Bu aynı zamanda kaybedilen bir saniyenin ne kadarının aracın hatası, ne kadarının sizin hatanız olduğunu da açıklar.

![Karşılaştırılan araçlar: iki araç yan yana, tutuşları, frenlemeleri ve çekişleriyle](../assets/img/en/race-cars-compared.webp)

Analiz, bir turun ancak aracının bunu yapabildiğini gösterdiği yerlerde daha sert fren yapmasını, daha fazla hız taşımasını ya da daha erken hızlanmasını söyler; ve bir kayıptan, araçların kendilerinin açıkladığı kısmı çıkarır. Bu yüzden her aracın sınırları (aşağıda *zarfı*) ve karakteri (*profili*) o aracın yüklenmiş her turundan ölçülür. Bu sayfa zarfı, profili, **Araçların karşılaştırması** bölümünü ve her virajda araçların neye karar verdiğini kapsar.

**Bir araç** = aynı araç numarası (ya da numara yoksa ad) ve aynı performans indeksine sahip turlar: farklı bir ayar, farklı bir araçtır.

## Zarf: araç her hızda ne yapabilir {#the-envelope-what-the-car-can-do-at-each-speed}

Araç başına, yüklenmiş her turu üzerinden, **5 m/s hız bantlarında** (24 bant, 120 m/s'ye kadar). Havadaki örnekler, bir inişten sonra 0,3 s oturma ve her temastan 0,1 s öncesinden 1 s sonrasına kadar olanlar dışarıda bırakılır; 80 m/s² ve üzeri ivmeler yok sayılır (herhangi bir downforce'lu aracın tuttuğunun üzerinde).

| Zarf | Örnekler | Bant başına değer | Gerekir |
|---|---|---|---|
| **yanal tutuş** | yanal ivme **yarım saniye tutulmuş** (ortalanmış 0,5 s pencerede mutlak değerinin ortalaması), yalnızca aracın viraj aldığı yerlerde: bütün bunun 99. yüzdeliğinin en az üçte biri | 95. yüzdelik | 6 örnek |
| **frenleme** | fren > 0,3; boylamsal ivme, her örneğin ve iki komşusunun medyanı olarak | yavaşlamanın 95. yüzdeliği | 4 örnek |
| **tam gaz çekişi** | gaz > 0,95, fren 0,05'in altında; aynı üçlü medyan | 90. yüzdelik | 4 örnek |

Neden yarım saniye tutulmuş: bir bordür, bir kaymanın geri zıplaması, bir arabanın yakalanması, hepsi yanal ivmeyi bir anlığına zirveye çıkarır ve bunu sık yapan bir araç, olduğundan daha çok tutuşlu görünürdü. Neden üçlü medyan: beş metrelik aralıkta bir örnek uzun bir mesafedir ve tek örnekli bir zirve bir bordür, bir tümsek ya da bir duvardır.

Bir hızda zarfı okumak bant merkezleri arasında enterpolasyon yapar; bir bant boşsa, veri olan en yakın bandı alır.

**İki tür zemin üzerinde.** Bir aracın turları, örneklerinin beşte birinden fazlasını hem asfalt hem gevşek zeminde sürdüğünde, her biri için ayrı bir zarf tutulur ve her viraj, en yavaş noktasında aracın altındaki zemine göre yargılanır.

**Kesişim.** Çekişin sabit kalmak yerine (çekişle sınırlı) `1/v` olarak (güçle sınırlı) düştüğü hız: `a·v` değerinin görülen en yüksek `a·v` değerinin %15 içinde olduğu ilk bant.

## Profil: aracın nasıl bir araç olduğu {#the-profile-what-kind-of-car-it-is}

`profile`, aynı turlardan (zeminde, çarpılmamış, 8 m/s'den hızlı örnekler):

| Ölçü | Nasıl |
|---|---|
| **tutulan tutuş** (m/s²) | yarım saniye tutulan yanal ivmenin 95. yüzdeliği |
| **çekiş** 50 km/s'ye kadar, 50-120, 120-200, 200'ün üzerinde (m/s²) | zarfın tam gaz çekişinin 3-14, 14-33, 33-56 ve 56-90 m/s'deki ortalaması, aracın ulaştığı hızlarda (en hızlısı + 2 m/s'ye kadar), en az üç 1 m/s adımından; ve gösterdiği en fazla değer ve nerede |
| **frenleme** (m/s²) | 60 ila 160 km/h (16,7-44,4 m/s) arasında zarfın frenlemesinin ortalaması, karşılaştırmanın adlandırdığı bant |
| **en hızlı** | ulaştığı en yüksek hız |
| **zirveye ulaştığı yer** | düz bir yolda tam gazda kazanmayı bıraktığı yer (aşağıda) |
| **en hızlısında hâlâ çekiş** | en hızlı hızında zarfın çekişi: hâlâ ne kadar gidebileceği |
| **tur başına arka yakalanan** | arkasının kaydığı ve yakalanması gerektiği tur sayısı (aşağıda) |
| **gazda başlayan pay** | bunların, gaz > 0,5 ve fren olmadan başlayanların payı |
| **bırakma noktası** | her kaymanın başlamasından 0,15 s önceki tutulan yanal ivmenin medyanı, tutuşun payı olarak |
| **10° sürüklenmenin üzerinde, sert virajda** | tutuşunun %60'ı ya da daha fazlasıyla viraj alan örneklerin, kayan payı (asfaltta 10°, gevşekte 20°); 30 örnek gerekir |
| **medyan sürüklenme** | aynı örnekler üzerinde |
| **denge** | sert viraj alan ve kaymayan yerlerde ön eksi arka kayma açısı (nominal zirvenin katları), en az 30 örneğin ortalaması: + geniş itme demektir |
| **yüzey** | örneklerin %80'inden fazlası gevşekse: gevşek; %20'sinden azıysa: asfalt; aksi halde karışık |

**Zirveye ulaşma.** Bir örnek, etrafındaki bir saniye (±0,5 s, en az 0,9 s veri) tamamen tam gazdaysa (> 0,95, fren yok), zeminde, **düz** sürülmüşse (|yanal| 4 m/s² ile tutuşunun dörtte birinin büyüğünden küçük), **0,35 m/s²**'den az kazanıyorsa, 25 m/s'den hızlıysa ve turun en hızlısının %90'ı içindeyse sayılır — tam gazla bir tepeye ya da uzun bir virajdan geçmek de kazanmayı durdurur, aracın en yüksek hızının çok altında. Bütün turlar üzerinde bu tür en az **bir saniyelik** bir platoyla, bu hızların medyanı aracın zirveye ulaştığı yerdir. Aksi halde bir zirve hızı yoktur: hiçbir düz yol yeterince uzun değilse, *en hızlısında hâlâ çekiş* ne kadar uzakta kaldığını söyler. Turların gösterdiğinin ötesinde tahmin yok: dişli oranı ve sınırlayıcı, sürükleme başlamadan çok önce bir aracın çekişini bitirir.

**Arkayı kaybetmek.** Sürücünün yakalamak zorunda kaldığı yerde sayılır: tutuşunun %60'ı ya da daha fazlasıyla viraj alırken, kayarken (asfaltta 10°'nin, gevşekte 20°'nin üzerinde sürüklenme), direksiyon (0,06'nın üzerinde) virajın **tersine** çevrilmiş. Direksiyonun hangi işaretinin, virajın hangi kuvvet işaretiyle uyuştuğu tur başına ölçülür (kaymadan dönen örnekler). Bir kayma, araç kaymayı bırakana kadar bir kez sayılır. Kasıtlı olarak biraz yana sürülen bir araç hiçbir şey kaybetmez; ters direksiyon gerektiren bir araç kaybeder. Her araç için aynı şekilde sayılır, böylece iki araç karşılaştırılabilir. Direksiyon ve bir sürüklenme açısı gerekir.

## Araçların karşılaştırması {#cars-compared}

Kenar çubuğu bölümü, tek bir araç için **Araç**, birden çok araç için **Araçların karşılaştırması**dır.

**Tablo**: araç başına bir sütun, herhangi bir aracın bir değeri olan ölçü başına bir satır: Tutulan tutuş; 50 km/s'ye kadar, 50-120, 120-200, 200'ün üzerinde çekiş; Frenleme; En hızlı; Zirveye ulaştığı yer (hiç ulaşmadıysa "hâlâ çekiyor"); En hızlısında hâlâ çekiş; Tur başına arka yakalanan; 10° sürüklenmenin üzerinde, sert virajda. Araçlar %3'ten fazla farklı olduğunda, daha iyi değer işaretlenir (tutuş, çekiş, frenleme, hızlar için daha yüksek; arka kaymalar için daha düşük).

**Tek bir araç**: turların onun hakkında gösterdiğini söyleyen cümleler — tuttuğu tutuş (m/s² ve g), her bantta çekişi, uzun düzlüklerde kazanmayı nerede bıraktığı (ya da hiç zirveye ulaşmadığı ve en hızlısında hâlâ ne çektiği), arkasının ne sıklıkta yakalanması gerektiği ("neredeyse hiç" tur başına bir kereden azsa, başlayanların 60% ya da daha fazlası gazdaysa "çoğunlukla gazda").

**İki araç**: her çift için, her araç hakkında diğerine göre birer cümle ("X daha iyi hızlanır, ama o kadar sert dönemez, durmak için daha uzun süre gerekir ve arkasını daha kolay kaybeder"), tablo, her net fark en büyüğü önce, sonra **Her biriyle sürüş**. Üçten fazla çiftte (**3**), bir çift gösterilir: odaklanılan turun aracı, bir açılır listeden seçilen bir araca karşı (varsayılan olarak sınıfının en iyi turunun aracı, yoksa referansın, yoksa diğer ilk araç).

Bir fark yalnızca turlar onu açıkça gösterdiğinde söylenir:

| Fark | Şuradan söylenir | Cümle |
|---|---|---|
| tutuş | **%4** | "X viraj boyunca N% daha fazla tutuş tutar … bu, her virajın ortasında M% daha fazla hız demektir" (hız = tutuş oranının √'si) |
| çekiş | **%5**, iki aracın da sahip olduğu ilk bantta: 120-200, 50-120, 120 km/s'nin üzerinde | "X 120'den 200 km/s'ye N% daha sert hızlanır"; başlangıçta da, ya da başlangıç farkı %8 olduğunda "ama Y çıkışta daha sert kalkar" |
| en yüksek hız | **4 km/s** | "X daha yükseğe çıkar: şurada kazanmayı bıraktı …" |
| en yüksek hız, yalnızca bir tanesi | bir araç zirveye ulaştı, diğeri ulaşmadı | "Y şurada çekişini bitirdi; X frenlediğinde hâlâ kazanıyordu" |
| en yüksek hız, hiçbiri | hiçbiri zirveye ulaşmadı | her birinin en hızlısında hâlâ kazandığı şey |
| frenleme | **%5** | "X N% daha sert durur … Y daha erken fren yapmak zorunda" |
| arkayı kaybetmek | tur başına en az bir kez daha fazla **ve** yarım kat daha sık | "X arkasını daha kolay kaybeder: ters direksiyon gerektirecek kadar uzağa kaydı, tur başına N kez karşı M'ye …" — çoğunlukla gazda (%60+) ya da çoğunlukla viraja girerken ve gazı keserken (%30 ya da daha az), tutuşunun yaklaşık P%'sinden; gevşek zeminde "bunun bir kısmı arabanın nasıl döndürüldüğüdür; yakalama değildir" |
| yana kayma | sürüklenme eşiğinin ötesinde sert virajda **12 yüzde puanı** | "X sınırda daha fazla yana kayar" |
| ön denge | nominal zirvenin **0,3**'ü | "X ön tarafta daha fazla iter … Tepe noktasından önce yavaşlatılıp döndürülmesi gerekir" |

Özetteki özellikler: *daha fazla tutuş tutar* / *o kadar sert dönemez*, *daha iyi hızlanır* / *daha az çeker*, *daha yükseğe çıkar* / *daha alçağa çıkar*, *düzlüklerin sonunda hâlâ çeker* / *çekişi biter*, *daha sert durur* / *durmak için daha uzun süre gerekir*, *daha stabildir* / *arkasını daha kolay kaybeder* (*çok daha kaygan …* iki katı artı bir kadar sıklıkta; gevşek zeminde *daha sık yakalanması gerekir*), *ön tarafta iter*. Hiçbir fark yoksa, bu turlarda Y'den ayırt etmek için pek bir şey yok.

**Her biriyle sürüş:**

- bir araç daha çok tutunur, diğeri daha çok çeker: tutuşlu olanla ortadan geniş, yuvarlak bir çizgide ("U") hız taşıyın; güçlü olanla düz frenleyin, kısa ve dar bir ortada döndürün ve çıkışta doğrultun (the "V");
- bir araç her ikisinde de geride: en iyi turu en temiz olanıdır — düz frenleyin, en geniş yarıçapı, tutabildiği kadar erken tam gaz;
- arkasını daha kolay kaybeden bir araç: gazı yalnızca direksiyon çözülürken verin ve kısa vites değiştirin (gazdaki kaymalar), ya da frenden nazikçe çekin ve ortada sabit bir gaz tutun (girişteki kaymalar).

Bölümün altındaki ipucu, her birinin nasıl ölçüldüğünü yineler.

## Viraj için araçların neye karar verdiği {#what-the-cars-decide-in-a-corner}

Turlar farklı araçlarda olduğunda, kaybedilen her virajın bulgusu **Araç:** ile biter — araçların bunun neresine karar verdiği ve bu aracın potansiyelinden en iyi nasıl yararlanılacağı (`carNote`):

- **Ortadan geçerken**: bu araç diğerinin tutuşunun %96'sından azını tutuyorsa, diğer araç en yavaş noktada 0,5 m/s'den fazla hızlıysa ve bu tur, tutuşunun açıkladığından çok da aşağıda değilse (%70'inin üzerinde): diğer aracın çizgisinde, bu aracın tutuşu `v_diğer · √(tutuşum / tutuşdiğer)` hızına izin verir. Tur bunu taşıdıysa (1 m/s içinde) boşluk araçtır ve hiçbir fren noktası bunu değiştirmez; daha azıysa, hâlâ ne kadar kazanılabileceği. Sonra zamanın nerede kazanılabileceği: bir düzlüğe, iki düzlük arasına ya da %5 daha sert çeken bir araca — tepe noktasından sonra (düz frenleyin, daha geç dönün, erken çıkışa yönelin); aksi halde yolun izin verdiği en geniş yarıçap.
- **Burada bırakılan bir arka** (paylaşılmayan bir kayma ya da spin, ya da girişte kayma eşiğinin ötesinde bir sürüklenme), tur başına en az bir kez daha fazla ve yarım kat daha sık kaybeden bir araçta: bu aracın nasıl yapılacağı — direksiyon çözülürken verilen gaz (kaymaları zamanın %60 ya da daha fazlasında güçte başlar) ya da frenin gaz kesmeden nazikçe bırakılması.
- **Sonraki düzlük**: aracın çekişi 0,03 s ya da daha fazlasını açıkladığında, aynı hızdan diğer aracın daha güçlü çekişi, iki aracın da 120'den 200 km/s'ye çekişiyle.
- **En yüksek hız**: bu tur, aracın 150 m'den uzun bir düzlükte zirveye ulaştığı yerin %98'ine ulaştığında ve diğeri 1,5 m/s daha hızlı gittiğinde: bu aracın en yüksek hızıdır ve virajdan çıkarken km/s'nin her artışı oraya ulaşana kadar yardımcı olur.
- **Frenleme**: diğer araç %5 daha sert fren yaptığında ve bu tur 5 m'den fazla daha erken fren yaptığında, erken frenlemenin bir kısmının aracın olduğu.

Aracın payı zamanın kendisinden de çıkarılır — bkz. [aracın payı](race-corner-analysis.md#the-cars-share) — ve aracın %60 ya da daha fazlasını açıkladığı bir virajın nedeni araca yazılır.

## Geliştiriciler için {#for-developers}

Kod: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts) içindeki `carNote`,
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx) içindeki `CarsSection`.
