---
title: "Yarış analitiği: yöntem"
parent: "Yarış analizi"
nav_order: 58
lang: "tr"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Yarış analitiği: yöntem

Kısaca:

- Turlar **mesafeye göre** karşılaştırılır, süreye göre değil. Böylece pistteki aynı yer birbirine denk gelir.
- Her viraj **bir bütün olarak** değerlendirilir: bir frenleme bölgesinden bir sonrakine kadar.
- Kaybedilen süre, nerede kaybedildiğine göre **ayrılır** (frenleme, giriş, çıkış, düz yol) ve bunun ne kadarının araçtan kaynaklandığı bulunur.
- Nedeni **sözlerle açıklanır** ve öneri verilir.
- Aracı kullanmak için (nasıl çalıştığını okumak için değil): [Yarış analizi](race-analysis.md) sayfasına bakın.

Bu, **Yarış analizi** sekmesinin arkasındaki yöntemdir: neyi ölçtüğünü, zamanın nerede kaybedildiğine nasıl karar verdiğini ve bunu nasıl öneriye çevirdiğini anlatır. Analiz kodunun (`src/race/`) izlediği belirtimdir. Bu yüzden buradaki her kuralın koddaki bir karşılığı ve bunu sınayan bir testi vardır.

## Profesyonel araçlar ne yapar {#what-the-professional-tools-do}

Bilinen araçlar aynı temelde buluşur. Yalnızca *nedenlere* ne kadar yaklaştıklarında ayrılırlar:

- **Her şey süreye göre değil, mesafeye göre karşılaştırılır.** İki tur, tek bir mesafe eksenine yeniden örneklenir. Aynı mesafedeki geçen süre farkı *delta*dır (MoTeC buna zaman varyansı der, diğerleri zaman kayması ya da delta izi). Eğimi, zamanın şu anda nerede kaybedildiğini gösterir: sığ bir eğim ivmelenme, sürtünme ya da sürekli tutuş demektir; dik bir eğim frenleme ya da gaz farkı demektir; yukarı-aşağı dalgalanan bir çizgi ise giriş hızı ile çıkış hızı arasındaki takastır.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Her viraj fazlara bölünür**: frenleme, giriş, orta, çıkış. Fren noktası, en yüksek fren ve bırakma, en düşük hız ve nerede olduğu, vites, gaza basma, tam gaza dönüş, çıkış hızı.
  ([Driver61: six phases](https://driver61.com/uni/corner-phases/),
  [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Viraj başına mini bölümler ve en hızlı parçalardan birleştirilmiş bir teorik en iyi tur.** ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Sürülen çizgi de karşılaştırılır**, ama tek başına asla: "Bir görüntüdeki çizgi, katkıda bulunan etmenler bilinmeden bir şey ifade etmez." Hız çizgisi ve delta ile birlikte okunur.
  ([Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Belirti değil, kök neden.** Düz yoldaki kayıp gerçekten gazdan mı kaynaklanıyor, yoksa kötü bir giriş gazı geç açmaya mı zorladı? Hatalar, tur süresine maliyetlerine göre sıralanır ve düz bir dille açıklanır.
  ([Track Titan coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### İlk sürümde ne yanlış gitti, ve neden önemli {#what-went-wrong-in-the-first-version-and-why-it-matters}

İlk sürüm her *fazı* ayrı ayrı sayıyor ve yalnızca kayıplara bakıyordu. Daha erken frenleyen bir tur, frenleme fazında zaman kaybediyor ve ona daha geç frenlemesi söyleniyordu. Oysa o erken frenleme aracı daha çabuk döndürüyor, daha çabuk gaza bastırıyor ve virajdan daha hızlı çıkarıyor, düz yolda da hepsini geri kazanıyordu. Bir testte, bunu yapan tura "çok daha geç frenle" denmişti. Oysa diğer tur, daha geç frenlemişti ama viraj içini kaçırmış, dışa geniş düşmüş ve kazandığını tümden kaybetmişti. Zaman verileri iki yolun eşit olduğunu söylüyordu. Öneri ise tam tersini söylüyordu.

Düzeltme, yukarıdaki kaynakların hepsinin üzerinde anlaştığı kuraldır: **bir viraj bir bütün olarak** değerlendirilir. Yani o virajın frenleme bölgesinden bir sonraki virajın frenleme bölgesine kadar. Çünkü "bazen bir virajda birkaç salisden vazgeçmek, sonraki bölümleri hızlandırarak tur süresini iyileştirebilir"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Kuralların kodladığı yarış bilgisi {#racing-knowledge-the-rules-encode}

**Çıkış hızı, giriş hızından daha önemlidir.** Ve sonraki düz yol ne kadar uzunsa o kadar önemlidir: "düz yollarda geçen süre, virajlarda geçen süreye hükmeder." Çıkıştaki hız eksiği bir sonraki frenleme noktasına taşınır. Bir viraj-düz yol çiftinden geçmenin en hızlı yolu, çoğu zaman virajı daha yavaş alıp gazı daha erken basmaktır. *Yavaş gir, hızlı çık.*
([Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/))
Çıkış hızına ödül veren en kısa süre planlayıcısı, viraj noktalarını (apex) daha geç koyar ve daha *hızlı* bir tur çıkarır. İkisini dengeleyen ödül, `L` uzunluğundaki bir düz yolda `v` hızında, çıkış hızının birim başına `L / v²` değerindedir. Yani bir hız farkının düz yolda maliyeti, yolun uzunluğuyla artar ve hızın karesiyle azalır
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Virajlar nereye çıktıklarına göre.** Bir düz yola çıkan: çıkış hızını en üst düzeye çıkar, viraj noktası geç olsun, gaza mümkün olduğunca erken dön. Bir düz yolun sonunda olan: düz yoldan taşınan hızı en üst düzeye çıkar, mümkün olduğunca geç fren, viraj noktası erken olabilir. İki virajın arasında olan: bizi sonra bekleyen için uzlaşır. Düz yola da iki virajdan birine de çıkabilen bir viraj, düz yola çıkan gibi kabul edilir. Hızlı virajlar daha ağır basar: yüksek hızda araba zayıf ivmelenir ve kaybedilen bir km/s geri kazanılamaz.
([Allen Berg: three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/),
[Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

**Sürtünme çemberi.** Bir lastiğin tek bir tutuş bütçesi vardır. Bu bütçe frenlemeye, viraja girmeye ve hızlanmaya herhangi bir karışımla harcanır. Toplam ivme `sqrt(lat² + long²)` formülüyle bulunur. Virajda frenleme, bu çemberin kenarını izler: direksiyon ve yanal yük arttıkça fren bırakılır.
([friction circle](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Süzülme (coasting)** — iki pedala da basılmadığı durum — hızı kaybetmenin en yavaş yoludur ve kendi başına ölçülen bir performans göstergesidir.
([Racecar Engineering / OptimumG: coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Kayma oranı.** Boyuna kuvvet, yaklaşık %10-20 kayma oranında zirve yapar, sonra düşer. Bu noktadan sonra frenlemede teker kilitlenir ya da güçte patinaj yapar. Forza kaymayı normalleştirilmiş bildirir: 0 tam tutuş demektir, 1'in üzerindeki bir büyüklük tutuşun kaybolduğu anlamına gelir.
([longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Alt ve üst direksiyon (understeer ve oversteer).** Ön kayma açısı arka kayma açısından büyükse alt direksiyondur. Arka, öndekinden büyükse üst direksiyondur. Kayma açısı yoksa: araba, direksiyonun istediği kadar dönmez. (Düşük hızda bir arabanın ihtiyaç duyduğu Ackermann açısı `L/R`'nin üzerindeki direksiyon.)
([understeer, overview](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Bir çizginin geometrisi {#the-geometry-of-a-line}

Bir arabanın `R` yarıçaplı bir dönüşte taşıyabileceği hız `v = sqrt(a R)` ile bulunur. Burada `a`, lastiklerin verdiği yanal ivmedir (buna `v²` ile büyüyen downforce de eklenir). Yani **hız, yarıçapın karekökü ile büyür**: ortadan geçen bir çizgi, %20 daha büyük yarıçapta orada yaklaşık %10 daha hızlıdır.
([maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: cornering](https://www.formula1-dictionary.net/cornering_tech.html))

**Geometrik çizgi**, bir virajdan geçen en büyük yaydır: dış kenardan başlar, iç tarafa viraj noktasında (apex) değer ve tekrar dış kenara döner. `θ` açısı kadar dönen ve `w` genişliğindeki bir yolda (arabanın genişliği çıkarılmış), iki dış kenara teğet ve iç köşeye değen bir yay `R = w / (1 - cos(θ/2))` yarıçapına sahiptir. (İç kenarın kendi yarıçapı eklenir.) Dik bir köşe için yaklaşık `3.4 w`, viriş için `w`'dir. Genişliği kullanmak bu yüzden orta virajlarda en çok, dar virajlarda ise en az önemlidir.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Geç viraj noktası (late apex)** dönüşe daha geç ve daha derinden girer. Başta daha sıkı bir yarıçapta döner, çıkışta yarıçapı açar. Ortada daha yavaştır, ama düz yola daha erken çıkar ve daha erken düzelir: "biraz daha düşük bir minimum hız, ama çıkışta daha güçlü bir ivmelenme profili". **Erken viraj noktası (early apex)** tersidir: içeri daha hızlı girer, çıkışta yarıçap sıkılaşır ve gazı geri tutar. Çok düşük tutuş dışında büyük ölçüde hataca sayılır. Çünkü içeride kaybedilen hız dışarıda geri alınamaz.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**"V" ve "U".** U, klasik yuvarlak çizgidir: en geniş yarıçap, en az direksiyon değişimi. V, daha erken döner, daha derine gider, ortada arabayı hızla döndürür ve çıkışı daha düz bir yola göre ayarlar. Frenleme düz kaldığı için daha geç yapılabilir. Minimum hız daha düşüktür ama daha geç ulaşılır. Tam gaza çok daha erken dönülür.
([Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Eğrilik, mesafeye karşı.** En hızlı çizgi, en kısa yol ile en az eğri olan yol arasında bir uzlaşmadır. Bir yarış pistinin genişliğinde eğrilik daha önemlidir. Minimum eğrilikli bir çizgi, arabanın sınırda olduğu her yerde minimum süreli çizgiye yakındır. Arabanın hızlanabileceği yerde ondan ayrılır.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Art arda virajlar**, çift viraj ya da şikan, tek bir problemdir: birincinin çıkış çizgisi, ikincinin giriş çizgisidir. Bunlar, düz yola çıkan viraja gelen virajdan başlanarak geriye doğru sürülür.
([Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

## Hangi çizgi hangi arabaya uyar {#which-line-suits-which-car}

Bunu belirleyen, o virajın hızlarında arabanın **gücü ile tutuşu arasındaki** ilişkidir: "momentum, tutuşa karşı gücün bir oran işidir".
([Ross Bentley: momentum cars](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum over horsepower](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Bu virajda araba | Çizgi | Neden |
|---|---|---|
| Tutuşuna göre sert ivmelenir ("point and shoot") | V: düz ve geç fren, kısa ve sıkı bir ortada dön, erken düz ve yatay çık | zaman tam gazla kazanılır, minimum hızla değil |
| Tutuşuna göre zayıf ivmelenir ("momentum") | geniş U, biraz geç viraj noktası, minimum hızı yüksek tut | kaybettiği hızı geri kazanamaz |
| Arada bir yerde | yavaş gir, hızlı çık: geç viraj noktalı U | klasik uzlaşma |
| Hızlı viraj, downforce varsa daha da hızlı | U, geometrik çizgiye yakın | yüksekte ivmelenme zayıftır; downforce tutuşu `v²` ile büyür, bu yüzden ortadaki hız iki kez kazandırır |
| Çok düşük tutuş (yağmur, kar) | erken viraj noktası | içeride kaybedilen hız dışarıda geri alınamaz |
| Güç tutuşun çok üzerinde | çizgi daha az önemlidir | çıkışı çizgi değil, çekiş sınırlar |

"Viraj ne kadar hızlıysa geometrik çizgiye o kadar yakın; ne kadar yavaşsa, geç viraj noktasıyla o kadar çok değiştirilir."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: grip](https://driver61.com/uni/grip/))

Çekiş düzeni, çizginin sürülüşünü çizginin kendisinden daha çok değiştirir. Önden çekişli bir araba frenlerde döndürülür (trail braking) ve güç ancak teker açıldıkça verilir. Yoksa geniş döner. Güçlü arka çekişli bir araba, tam gazdan önce düz olmalıdır. Yoksa arka kayar. Dört çekişli bir araba, dönerken de güç verebilir, bu yüzden gazı daha erken açar.
([FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Görüntüleyici, her virajda arabanın güç-tutuş oranını kendi sürüşünden ölçer. Bu, çıkış hızında tam gaz ivmelenmesinin, minimum hızdaki yanal tutuşa bölünmesidir. Oran 0,45 ve üzerindeyse "point and shoot", 0,25 ve altındaysa "momentum" diye adlandırır. 150-250 km/s arasındaki tutuşu, 55-110 km/s arasındaki tutuşundan %15'ten fazla yüksekse downforce çalışıyor demektir.

## Yöntem {#the-method}

Aşağıdaki sayılar akıl yürütmedir. Koddaki eşikler her biri kendi sayfasında tutulur. Bir sayı buradakiyle farklıysa, referans o sayfalardır: [Viraj viraj analiz](race-corner-analysis.md), [Araç kontrol olayları](race-control-events.md), [Araç profilleri ve karşılaştırma](race-car-profiles.md) ve [Pist istatistikleri](race-course-statistics.md).

### 1. Tek bir mesafe ekseni {#one-distance-axis}

En hızlı tur referanstır. Kullanıcı başka bir tur seçmedikçe bu geçerlidir. Sürülen yolu eksen olur. Diğer her turun örnekleri ona yansıtılır. Böylece her örneğin referans üzerindeki mesafesi `s` ve işaretli yanal ofseti `d` bulunur. İzdüşüm yalnızca önceki eşleşmeden ileri doğru arar. Bu sayede kendi üzerinden geçen bir tur, köprünün yanlış tarafına asla atlamaz. Sonra tüm turlar, her kanal için tek bir ızgaraya, her 2 m'de bir örneklenir. Her tur, son birkaç metreyi o anki hızıyla taşınır. Böylece çizgideki deltası, tur süreleri farkı olur.

### 2. Virajlar ve her virajın turdaki payı {#corners-and-each-corners-share-of-the-lap}

Virajların, bölümlerin ve karmaşık yapıların nasıl bulunduğu: [Viraj viraj analiz](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Bir virajın zaman hesabı {#the-time-account-of-a-corner}

Net, ayrılmış, çıkış hızı ve arabaların çekişi: [Viraj viraj analiz](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Karar ve neden {#the-verdict-and-the-cause}

Karar kalıpları ve girişte ve çıkışta nedenler: [Viraj viraj analiz](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Araba mı, sürücü mü {#the-car-against-the-driver}

Turlar farklı arabalardaysa, arabanın açıkladığı kayıp çıkarılır. Bu, parçalar halinde olur:

- **çekiş**: aynı hızdan düz yolda arabaların çekişi, yukarıdaki gibi;
- **tutuş**: daha yavaş minimum hızın, daha sıkı bir yarıçapla açıklanmayan kısmından, `½ ln(diğer_tutuş / benim_tutuşum) / ln(diğer_v / benim_v)` payı, tur arabasının sınırında olduğunda (o hızda gösterdiğinin %90'ında);
- **frenler**: `u` hızından `v` hızına, `a1` yavaşlamasıyla `a2`ye karşı, aynı noktada bitirerek, `(1/a1 - 1/a2)(u - v)² / 2u` kadar kaybettirir. Bu yalnızca tur bölgede arabanın yapabildiği kadar sert frenlediğinde geçerlidir. Bunu sadece tepe noktada değil, ortalama olarak yapmalıdır.

Bir arabanın neler yapabildiği, o arabanın yüklenmiş her turundan gelir. Yanal tutuş, frenleme ve tam gaz ivmelenmesi her 5 m/s hız aralığında (95., 95. ve 90. yüzdelik) hesaplanır. Tutuş, **yarım saniye boyunca tutulan** şeydir. Yani yanal ivmenin 0,5 saniye ortalamasıdır, tek bir örneğin değdiği değer değil. Bordür, bir kaymanın geri dönmesi, yakalanan bir araba, hepsi anlık bir sıçrama yaratır. Böyle sık sık olan bir araba, olduğundan daha çok tutuşlu görünür. (İki farklı arabanın kayıtlı turlarında denendi: örnek başına ölçüm onları birbirine yakın gösterdi. Yarım saniye tutulan ölçüm ise onları, tur süreleri gibi ayırdı.) Frenleme ve çekiş, her örneği kendisi ile komşularının medyanı olarak alır. Havada olan, bir inişten sonraki sarsıntı ve her çarpma (bölüm 6), araba iyileşene kadar hariç tutulur.

**Her arabanın nasıl olduğu** (`profile.ts`): aynı turlardan şunlar çıkar:

- **tutuş**: yarım saniyelik yanal ivmenin 95. yüzdeliği;
- **çekiş**: tam gazda 50 km/s'ye kadar, 50-120, 120-200 ve 200'ün üzerinde, ve gösterdiği en yüksek değer;
- **frenleme**: 60'tan 160 km/s'ye;
- **en yüksek hız**: düz yolda tam gazda bir saniye boyunca kazanmayı bıraktığı yer. Düz sürülen, uzun bir viraj düz geçilmiş değil. Viraj düz geçilirse araba hız kaybeder, bu da gücünden bağımsızdır. Hiçbir düz yol yeterince uzun değilse, en hızlı noktada hâlâ çektiği güç, ne kadar uzak olduğunu söyler. Turların gösterdiğinin ötesinde tahmin yoktur. Güç-hız eğrisini sürtünmeye uydurmak, bir yol arabasını gerçek en yüksek hızının 100 km/s üzerine koydu. Çünkü dişli oranı ve sınırlayıcı, bir arabanın çekişini sürtünmeden çok önce bitirir.
- **arka kaybetmek**: bir turda kaç kez, 10° kayma (kumlu zeminde 20°) aşıldığında ve direksiyon virajın tersine çevrildiğinde. Yani karşı kontrol yapılarak yakalandığında. Bunların kaçı gazdayken başladı ve başladığında tutuşunun hangi payında başladı. Bilerek biraz yanlamasına sürülen araba bir şey kaybetmiyor. Yakalanması gereken ise kaybediyor. Her araba aynı şekilde sayılır, böylece iki araba karşılaştırılabilir.
- **denge**: eğer turlarda kayma açıları varsa, sınırda ön ve arka.

**Yan yana arabalar** arabaları yan yana koyar: bir tablo, her biri için neyin diğerine göre ne olduğunu anlatan birer cümle ("X daha iyi ivmelenir, ama o kadar sert dönemez, durmak için daha uzun yol alır ve arkasını daha kolay kaybeder"), her açık fark (%4 tutuş, %5 çekiş veya frenleme, 4 km/s en yüksek hız, bir turda bir kez daha fazla yakalanan arka ve yarım kat daha sık) ve her birinin nasıl sürüleceği. Tek araba varsa, o arabanın ne olduğunu söyler.

**Her virajda**, turlar farklı arabalardaysa, bulgu, neyin arabalara ait olduğunu ve bu arabadan en iyi nasıl yararlanılacağını söyler:

- **ortadan geçişte**: diğer arabanın çizgisinde, bu arabanın tutuşu `v_diğer · √(benim_tutuşum / diğer_tutuş)` hızına izin verir. Tur bunu taşıdıysa, fark arabadadır. Hiçbir fren noktası bunu değiştirmez. Bu söylenir ve virajın sorumluluğu sürücüye değil arabaya verilir. Tur bundan azını taşıdıysa, kalan kısım kazanılabilir ve ne kadar olduğu söylenir. Sonra, zamanın nerede kazanılabileceği: bir düz yola çıkılıyorsa ya da daha güçlü çeken bir arabada viraj noktasından sonra. Yani düz frenle, daha geç dön ve çıkışa erken yönel. Aksi halde yolun izin verdiği en geniş yarıçap, çünkü daha büyük yarıçap, daha fazla tutuş olmadan daha fazla hızın tek yoludur;
- **virajın ortasında arka kaymış**: bu arabada diğerinden daha kolay kaybeder. Bu arabada ne yapılacağı: direksiyon açılırken gaz kademeli verilsin ya da fren virajın ortasında kaldırılmadan yumuşakça bırakılsın. Hangisi olacağı, kaymalarının nasıl başladığına bağlıdır;
- **sonraki düz yol**: diğer arabanın aynı hızdan daha güçlü çekişinin neyi aldığı ve bu arabanın orada çekişinin nerede bittiği;
- **daha erken bir fren noktası**: daha az sert durabilen bir arabada.

Bu turda, virajın ortasında tutuştan daha az yanal ivmeyle arka kaydıysa (bu bir kayma), o turun hiçbir virajının ortasında tutuşu fazla olduğu söylenmez. Ve arka, virajın istediğinden daha az yanal ivmeyle bırakmışsa, "fazla tutuş" küçük adımlarla bulunmasını söyler.

### 6. Araba kontrolü: kilitlenme, patinaj, kayma ve itme, çarpma ve kazalar {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Her tur, arabanın nasıl kontrol edildiği için de okunur. Bir teker nerede kilitlendi, sürülen tekerler nerede patinaj yaptı, arka nerede açıldı, ön nerede geniş döndü. Bunlar, zamanın tek başına adını koymadığı hatalardır. Üç şey bunların oyunlar ve yüzeyler arasında geçerli kalmasını sağlar.

**Tutuşun bittiği yer, arabanın kendi sürüşünden ölçülür.** Mühendisler, her araba için en fazla yavaşlamayı veren kayma oranında bir kilitlenme eşiği koyarlar (OptimumG'nin fren serisinde MoTeC kanalları bir araba için -0,07 kullanır). Kitap değerlerine bakılmaz. Ayrıca kitaplar birbiriyle çelişir: kuvvet asfaltta %5-20 kayma oranında zirve yapar, bu lastiğe ve modele göre değişir. Karda %6'da ya da %20-60'ta, kaynağa göre değişir. Çakıl için hiçbir kaynak bir değer vermez. Oyunlar kaymayı yine farklı ölçekler: Forza'nınki "normalleştirilmiştir", yani 1'i geçince tutuş kaybedilmiş olur. Ama bir arabanın frenleri en iyi performansını 1'in çok altında ya da çok üzerinde verebilir. Üstelik sıradan fren bölgeleri 1'i geçebilir. Bu yüzden her araba için, yüklenmiş her turunda, yapılan kuvvet, çekilen kayma ile gruplanır. Düz çizgi frenlemede yavaşlama, tekerlerin kayma oranına karşı; ivmelenme (o hızda arabanın yaptığının bir payı olarak), sürülen tekerlerin kaymasına karşı; virajda tutuş (o hızda arabanın tutuşunun bir payı olarak), her aksın kayma açısına karşı ölçülür. Sınır, kuvvetin %8 düştüğü en iyi noktanın ötesindeki kaymadır. Verilerde hiç düşmeyen bir eğrinin sınırı yoktur. Forza Horizon'un virajdaki ve çekişteki eğrileri böyledir, orada yalnızca kayma bir şey işaretlemez. Veri yetersizse sınır, nominal zirvenin bir buçuk katıdır.

**Zemin, oyunun söylediği yerde her örnek için bilinir.** Forza, çakıl, toprak ve çimende tekerleri titretir (asfalt pistte çok az örnek, toprak ve arazi parkurlarında çok sayıda). Trackmania, her tekerin altındaki malzemeyi adlandırır. Bir raliye etabının zemini ise 11. bölümde anlatıldığı gibi bulunur. Eğriler, sürüş alışkanlıkları ve eşikler asfalt ve gevşek zemin için ayrı tutulur.

**Her olay, aynı metrelerde diğer tura karşı yerleştirilir.** Çakılda, karda, kaymaya dayalı bir arcade yarışçısında, bir virajın sürülüş biçimi kaymadır. Optimal kontrol çalışmaları asfaltta "düşük kaymalı" çözümleri, arazide ise "agresif, yüksek kaymalı, hatta karşı direksiyonlu" çözümleri bulur. Raliye verileri, lastiklerin "doğrusal olmayan bölgenin içinde" olduğunu gösterir. Çok gevşek bir zeminde bir tekerleği kilitlemek, arabayı daha erken durdurabilir bile. Bu yüzden diğer turun da yaptığı bir olay (%80 ve üzeri) virajın sürülüş biçimidir, hata değildir. Diğer turun yapmadığı bir olay ise yalnızca zaman kaybettirdiyse hatadır: olaydan hemen önceden olayın 40 m sonrasına kadar kaybedilen süre. Bir olayın virajın kaybının %40 veya daha fazlasını açıklaması, o virajın nedeni olur.

Algılama eşikleri, diğer tur testi, çarpmalar ve kazalar ve öneri metinleri: [Araç kontrol olayları](race-control-events.md).

### 6b. Çok sayıda tur: pistin istatistikleri {#b-many-laps-the-courses-statistics}

Sınıf karşılaştırması, hata sayılan şey, istatistikler ve hata haritası: [Pist istatistikleri](race-course-statistics.md).

### 7. Sürülen çizgi {#the-driven-line}

Her tur ve virajın için, yalnızca konumlardan: dönmeye nerede başladığı (en sıkı eğriliğinin beşte biri), en sıkı yarıçapı (±8 m üzerinden), yön değişiminin ilk ve ikinci yarısındaki ortalama yarıçap, ve benzeri.

- **şekil**: en sıkı / ortalama yarıçap oranı 0,55'in altındaysa V, 0,75'in üzerindeyse U;
- **viraj noktası**: çıkış yarıçapı / giriş yarıçapı 1,25'in üzerindeyse geç, 0,8'in altındaysa erken;
- **hız viraj noktası**: en yavaş noktası, dönüşünün yarısından 15 m'den fazla önceyse yavaş gir, hızlı çık; 15 m'den fazla sonraysa ortaya kadar yavaşlamaya devam eder.

Diğer tura karşı: dönüşe girişte ne kadar içeride ya da dışarıda kaldığı, en sıkı kısımda ve iki turun da düz olduğu yerde ve her birinin nerede döndüğü. Her bulgu, o virajda turun arabasına uyan çizgiyle biter: virajın nereye çıktığına ve arabanın ölçülen güç-tutuş, downforce ve çekiş düzenine göre. Ayrıca turun bunu sürüp sürmediği yazılır. "Viraj viraj" tablosu, her virajdan geçen en hızlı turu ve çizginin şeklini, en iyi virajlarla birlikte listeler.

### 8. İki harita {#two-maps}

- **Nerede**: pist, referansa karşı `dΔt/ds` ile renklendirilir. Zaman kaybedilen yer kırmızı, kazanılan yer yeşildir.
- **Neden**: her kayıp, nedeninin olduğu yere çizilir. Renk nedenin grubuna göre seçilir: frenleme, giriş, çıkış, düz yol, araba. Daha pahalı olan daha geniş çizilir.

### 9. Tekrar {#replay}

Tek bir saat, aynı saatin her turun kendi zamanına çevrilmesinin üç yolu: çizgiden itibaren, hizalı (her tur pistin tek bir noktasına aynı anda gelir, sonra bırakılır) ve yan yana (her tur referansın mesafesinde tutulur).

### 10. Dünyanın hangi yönde dönük olduğu {#which-way-round-the-world-is}

Görüntüleyicinin dünyası sağ elli ve Y yukarıdır. Sol elli dünyası olan bir oyun (Forza bunlardan biri) bunda aynalanmış çıkar: her sağ dönüş sol dönüş gibi çizilir, pist ve turlar birlikte. Turlar bunu kendisi söyler. Pozitif direksiyon her bağdaştırıcıda sağa doğrudur ve bir virajın dış süspansiyonu sıkışır. Yarış sekmesi bunu düzeltmeyi önerir. **Kamera ve sahne → Dünya ekseni ters çevir** ise bunu yapar: X, Y ya da Z ters çizilir. Yalnızca çizim değişir. Görüntü matrisine bir yansıma eklenir. Kamera çizilen dünyada uçar. Veri, analiz ve araçların gösterdiği her koordinat oyunun kendi koordinatı olarak kalır. Analiz, virajların sağ ya da sol olduğunu aynı ölçümle adlandırır.

### 11. Raliler: kayma, sol ayak, hava {#rally-the-slide-the-left-foot-the-air}

Bir raliye etabı, kötü tutuşta sürülen bir pist değildir. Çakıl ve karda kayma, virajın nasıl alındığıdır. Araba, girerken ağırlığını kaydırarak döndürülür: "frenler arabanın ağırlığını öne taşır... ön lastikler tutuş kazanır, arka lastikler kaybeder ve araba kayarak virajda döner", sonra "istediğin yöne doğru hizalanınca" gaza geri dönülür ([DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Sol ayak frenlemeyi yapar, böylece gaz ve fren birbirine karşı oynatılabilir. El freni dar virajlarda arabayı döndürür ([RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)). Araba da yerden kalkar. Bölüm 6 kaymaları diğer turla karşılaştırır. Bu kurallar gerisini taşır.

- **Zemin.** Turun ne dediği (`meta.surface`, raliye kaydedicilerinin `--surface` seçeneği), yoksa etkinliğin adı: asfalt raliler (İspanya, Hırvatistan, Orta Avrupa, Almanya, Japonya, Korsika, Ypres), kış raliler (kar) ve Monte'nin üzerinde kar ve buz olan asfaltı (karışık). Bunlar yoksa, araba nasıl sürüldüyse. Bir Rally2 arabasının yanal sınırı çakılda 0,7-0,9 g, asfaltta 1,3-1,4 g'dir ([grenzbereich, reference values](https://github.com/GitCrush/grenzbereich)). Çakılda ise çok daha fazla kayma olur (bölüm 6). Bu yüzden, arabanın 10 m/s² veya daha fazla çektiği (95. yüzdelik, hızda, zeminde) ve medyan kaymasının 6 derecenin altında olduğu, bu sınırın %70'inde köşe aldığı etap asfalt sayılır. Diğer her şey, ya da yeterli veri yoksa, gevşek zemindir.
- **Arabanın yapabildikleri, yaptığı zeminde.** Tutuş, frenleme ve çekiş (bölüm 5) asfalt ve gevşek zemin için ayrı ölçülür. Bunun için turlar her birinden örneklerinin beşte birini ya da daha fazlasını sürmüş olmalı. Her virajın, en yavaş noktasında arabanın altındaki zemine göre değerlendirilir. Havadaki ve bir inişten sonraki 0,3 saniyedeki örnekler, arabayı ölçen her şeyden çıkarılır: zarflar, lastik eğrileri, kilitlenmeler ve patinaj. Bir iniş arabayı, lastiklerinin yapabileceğinden fazla sarsar. Havada dönen tekerlekler de patinaj sayılmaz. Hızlı ve yavaş kısımlar farklı yollar olduğu için, gevşek zeminde downforce değerlendirilmez.
- **Sol ayağın bir dokunuşu fren değildir.** Gaz yarı ya da daha fazla açıkken, 15 m'den kısa bir frene dokunuş arabayı yerleştirir ya da döndürür. Bir tur, bir viraj için frenlemeye nerede başladıysa, gaz kesildiği ilk fren ya da daha uzun süren fren odur.
- **Araba girişte döndü.** Her tur ve virajın için, frenlemeden en yavaş noktasından 5 m sonrasına kadar en büyük kayma açısı. Gevşek zeminde, arabayı diğer turdan 8 derece ya da daha az döndüren (diğeri 12 ya da daha fazla döndürdüyse) ve gücü daha geç alan bir tur, arabayı **daha az döndürmüştür**. Öneri, dönüş girerken sol ayak frenini kaldırmak ya da hafifçe basmak, böylece arka dönsün. Diğer turda el freni noktası kullanıldıysa o nokta ya da 54 km/s'den yavaş bir virajda el freni kullanılır. Ve çıkışa, viraj noktasından önce bakılır. Diğerinden 12 derece ya da daha fazla fazla döndüren ve yine de gücü daha geç alan tur ise **arabayı fazla döndürmüştür**. Gücü azaltmadan önce düzeltilmesi gerekir. Bu iki durumdan biri, araba kontrolü hatasından sonra virajın çıkıştaki nedenidir. Gevşek zeminde çizgi önerisi, her virajda aynı şeyi söyler.
- **Hava.** Diğer turdan 0,2 saniye veya daha uzun süren bir uçuş, kalkıştan 10 m önce ile inişten 40 m sonra (ya da virajın sonu) arasında zaman kaybettirdiyse ve virajın kaybının %40'ını veya daha fazlasını açıklıyorsa neden olur. Ardından gelen viraj, daha yavaş ulaşıldığında bunu söyler. Havada araba dönemez, frenleyemez ve sürülemez. Öneri, kalkışta gazı açık tutmaktır: "kalkışta gazdan çekilme", çünkü bu burnu düşürür. Tepeyi biraz daha yavaş ya da hafif fren dokunuşuyla almak, arabayı alçak tutar ([DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **En fazla üç virajlık gruplar.** Hiç düz olmadan sürülen kıvrımlı bir kesit tek bir uzun karmaşık yapı değildir. Üç viraj geçildikten sonra yeni bir grup başlar.

`src/race/rally.test.ts` analizi, basit bir modelle çalıştırılan etaplarda bunların hepsinde sınar: daha az ve geç dönen bir araba, daha uzun bir uçuş, sol ayak dokunuşları, kıvrımlı bir kesit, asfalt ile çakıl karşılaştırması.

## Veri ve her kaynağın izin verdikleri {#data-and-what-each-source-allows}

| Kaynak | Hız | Kanallar | İzin verir |
|---|---|---|---|
| FH Companion tur dosyaları | ~5 m | konum, hız, gaz, fren, direksiyon, yanal/boyuna ivme, vites | araç kontrolü dışında her şey; o, yanındaki telemetriye ihtiyaç duyar |
| FH Companion'ın her tur dosyasının yanındaki `.tele.gz` | oyunun 64 Hz'i (her paketi tutan bir kaydedici saniyede ~110 yazar; tekrarlar atılır) | Forza'nın tüm Data Out verisi: teker başına kayma oranı, kayma açısı, birleşik kayma, dönüş, süspansiyon, yüzey titreşimi; arabanın çerçevesinde hız; yaw hızı | hepsi, araç kontrolü dahil |
| `heat3d_capture telemetry` ile kaydedilen Forza Data Out | 60 Hz | yukarıdakilerin hepsi, ayrıca teker başına: lastik sıcaklığı, kayma oranı, kayma açısı, birleşik kayma, süspansiyon hareketi, teker hızı, titreşim şeridi; RPM, güç, tork, yaw hızı | hepsi |
| Assetto Corsa, ACC, AC EVO, AC Rally (paylaşılan bellek, `heat3d_capture telemetry --game ...`) | 60-333 Hz | bir üst küme: lastik çekirdeği ve iç/orta/dış sıcaklıkları, basınçlar, fren sıcaklıkları, teker yükleri, kamber, kayma oranı ve açısı; arabanın çerçevesinde hız; ABS ve TC çalışıyorsa (ACC, EVO, AC Rally) | hepsi |
| iRacing `.ibt`, doğrudan okunur | 60 Hz | GPS'ten konum, pedallar, direksiyon, g, yaw, teker başına kaskas sıcaklığı, amortisör sapması, basınç, aşınma | hepsi; araç kontrolü sürüklenme açısından (yaw'ın hareket yönüne karşı) ve direksiyondan; kayma yok (kaydedilmez) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | kare başına; 100 Hz | konum, dünya hızı ve arabanın eksenleri, teker başına temas yaması hızı ve süspansiyon, pedallar, direksiyon, etap saati ve uzunluğu | hepsi; kayma ve sürüklenme açısı türetilir |
| Richard Burns Rally (NGP UDP) | fizik adımı başına | konum, arabanın kendi hızları, teker başına yay sapması ve kuvveti, pedallar | teker kayması dışında hepsi |
| BeamNG.drive (`heat3d` protokol modu) | 100 Hz'e kadar | konum, dünya hızı ve eksenler, teker başına yüzey hızı, dönüş, yük ve zemin teması | hepsi; kayma ve sürüklenme açısı türetilir |
| Trackmania (Openplanet eklentisi) | kare başına | konum, ön ve yan hız, pedallar (fren açık/kapalı), direksiyon, teker başına kayma katsayısı ve gevşek zemin, havada | hepsi; sürüklenme açısı yan hızdan |

Her kaynak tek bir tur biçimine, `heat3d-lap`'a çevrilir. Kanalların kendi adları vardır (`speed`, `throttle`, `tireTemp[FL]` ...). Araba simgesi ve grafikler, turda hangi kanallar varsa onları çizer.

## Kaynaklar {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (distance-domain delta)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: session laps](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analysing racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: theoretical best from sectors](https://overcut.gg/)
- [Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: braking analysis, lock-up and stability KPIs (Sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: on the throttle (Jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: key performance indicators of race drivers (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Tyre-road friction models and optimal slip (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: tyre-pavement friction, slip at peak on snow and ice](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: tyre friction coefficients, peak and sliding](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: longitudinal forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: lateral forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Vehicle stability, body-slip limits (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rally driving at high sideslip (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimum-time rally manoeuvres (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC reference yaw rate (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Understeer and oversteer detection by steering against yaw (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: steering angle, Ackermann and the understeer gradient](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: math channels (Kus, combined g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: oversteer and understeer widget](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: locking on very loose surfaces](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: gravel rally data logging](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: rally vehicle dynamics, reference values](https://github.com/GitCrush/grenzbereich)
- [Trackmania speed-drift trainer plugin (constants)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania speedslide write-up](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (exit speed against minimum time)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: the three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/)
- [Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/)
- [Driver61: the six phases of a corner](https://driver61.com/uni/corner-phases/)
- [Driver61: grip](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (excerpt)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: what is a momentum car](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [The momentum over horsepower debate](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Math on the racing line, part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, part 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: cornering technique](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Global minimum-time trajectory planning considering curvature and distance](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: the coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Friction circle introduction](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Understeer, an overview](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out documentation](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: traction-limited acceleration](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: power-limited acceleration](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO shared memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetry reader](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT parsing](https://github.com/teamjorge/ibt)
