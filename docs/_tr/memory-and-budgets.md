---
title: "Bellek ve bütçeler"
parent: "Veri alma"
nav_order: 6
lang: "tr"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Bellek, bütçeler ve sığma denetimi

Bilgisayarınızın belleği sınırlıdır. 3DHeat dosyalarınızın neye ihtiyaç duyduğunu toplar ve **Yükle**den önce sığıp sığmadıklarını söyler.

![Bellek tahmini "sığmıyor" derken, Her [N] satırı yüklemesi önceden doldurulmuş ve Yükle düğmesinin "Çok büyük - azaltın ya da seyreltin" yazdığı ekran](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Bu bilgisayar için çok büyük mü? 3DHeat bunun yerine her N'inci satırı yüklemeyi önerir.*

Bir yükleme ortasında belleği biten bir tarayıcı sekmesi çöker ve dakikalık işi kaybeder; ihtiyacından fazlasını isteyen bir GPU ya bağlamını kaybeder ya da sürünür hâle gelir. Bu yüzden yükleme başlamadan Kaynak paneli ne kadar bellek gerektiğini söyler, bunu bu makine için algılanmış bütçelerle karşılaştırır ve sığmayacaksa — bir çıkış yoluyla birlikte — reddeder. Model [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) dosyasındadır.

## Bellek tahmini {#the-memory-estimate}

Satırlar sayıldıktan sonra **Yükle** düğmesinin üstünde gösterilir.

| Satır | Anlamı |
|---|---|
| **Bellek tahmini** - *sığar* / *sıkı* / *sığmaz* | Karar: yeşil, kehribar ya da kırmızı. |
| `N satır · B B/satır` | Yüklenecek satırlar (adımdan sonra) ve satır başına sabit bayt. |
| `RAM X kalıcı, yüklenirken Y tepe` | Yüklendikten sonra tutulan bellek ve yükleme sırasındaki en yüksek nokta. |
| `GPU Z · tahmini yükleme T` | Satırlar için GPU belleği ve saniyede 1,2 milyon satırda tahmini süre. |
| GPU adı | Sürücü bildirdiğinde işleyicinin adı. |
| İletiler | Neden sığmadığı ya da sıkı olduğu ve ne yapılacağı. |
| **Her [N] satırı yükle** | Seyreltme adımı (aşağıya bakın). |
| `Bütçe: X RAM, Y GPU. Performans → Kaynak bütçeleri altında ayarlayın.` | Denetimin kullandığı bütçeler. |

### Satır başına bayt {#bytes-per-row}

| Sütun | Sabit (RAM) | Notlar |
|---|---|---|
| Konum | 12 | Her zaman üç 32-bit kayan nokta (düz bir eksen de yine bir dizidir) |
| Zaman | 4 | Eşlendiğinde |
| Ömür | 4 | Zaman ve kişi eşlendiğinde |
| Kişi | 4 | Eşlendiğinde |
| Grup | 2 | Eşlendiğinde |
| Oturum | 4 | Eşlendiğinde |
| `Source file` | 4 | Birden çok dosya yüklendiğinde |
| Her filtre sütunu | 4 | İşaretlenmiş her *Filtreleme için sakla* sütunu başına |

**Tepe**, yükleme sırasında yalnızca geçici olarak gereken şeyleri ekler — birleştirme sırasında 64-bit zamanın 8 baytı, sıralama anahtarlarının ve indekslerinin 12 baytı, permütasyon geçici alanının 4 baytı (zaman eşlendiğinde üçü de) ve grup sütunu hâlâ 32-bit iken 4 bayt — ve toplamı **2,0** ile çarpar. Bu çarpan ölçülmüştür (gerçek bir çok dosyalı yükleme, döküm edilen dizilerin 1,9 katında tepe yaptı; bunun nedeni Parquet çözücüsünün çalışma kümesi, her sütunu uzunluğa kırpan kopyalar ve serbest bırakılmış ama henüz geri verilmemiş bellek) ve yukarı yuvarlanmıştır, çünkü az tahmin edilmiş bir bellek çöken bir sekmeye, fazla tahmin edilmiş bir bellek ise yalnızca gereksiz bir adıma mal olur.

**GPU** üzerinde her satır 8 bayta mal olur (konum ve grup, her biri 16 bit), artı zaman ve kişi ikisi de eşlendiğinde 4 bayt (zaman ve ömür, her biri 16 bit). Bkz. [GPU belleği yerleşimi](gpu-memory.md). Filtre dokuları (etkin filtre başına satır başına 4 bayt) ve çizgi ısısının segment başlangıçları (Çizgiler modu açıkken satır başına 8 bayt) bu tahminin parçası değildir.

## Sığma denetimi {#the-fit-check}

Üç kısıt karşılaştırılır ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- tepe RAM, **RAM bütçesine** karşı,
- GPU baytları, **GPU bütçesine** karşı,
- satır sayısı, bir zaman sütunu eşlendiğinde **sıralama tavanına** (400.000.000 satır) karşı.

Üç oranın en kötüsü karar verir: %70'e kadar *sığar*, %100'e kadar *sıkı* (yüklenmeli, ama yavaş olması beklenir), üstü *sığmaz*. Sığmadığında panel bağlayıcı kısıtı adlandırır ve şunları önerir:

- her *N*'inci satırı yüklemek, *N* = ⌈satırlar / sığan satırlar⌉, adım kutusunda önceden doldurulmuş;
- filtre sütunlarını bırakmak, zaman sütununun eşlemesini kaldırmak (sıralamayı ve tavanını kaldırır, zaman çizelgesi pahasına) ya da bütçeyi yükseltmek.

Bütçe kendisi donanım hakkında bir gerçek olmadığında — tarayıcı RAM rakamını sınırlamış, varsayılan o an boş olanla aşağıda tutulmuş ya da GPU rakamı bir tahminse — ileti bunu söyler, böylece ihtiyacınız olmayan bir adıma uzanmazsınız.

### Seyreltme {#decimation}

**Her [N] satırı yükle**, *N*'de bir satırı, dosya başına sayarak tutar. Isı bir ortalamadır, bu yüzden her *N*'inci satır daha fazla gürültüyle aynı dağılımı verir — işleyicinin her karede zaten yaptığı takas. Kutu 1 ile başlar (*satır (hepsi)*); seçim sığmadığında, siz içine yazmadığınız sürece önerilen adımla önceden doldurulur. Yükle düğmesi o zaman *N dosya yükle (K'da 1)* yazar ve veri kümesinin adı `every Kth row` kaydeder.

### Sıralama tavanı {#the-sort-ceiling}

İşleyici satırların artan zaman sırasında olmasını ister; bu yüzden eşlenmiş bir zaman sütunu her satırın sıralanması demektir; 32-bit anahtarlar üzerinde bir radix sıralaması ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). **400 milyon** satırı aştığında bu bir sekmede denenmek yerine reddedilir. Bu, yüklemeden önce denetlenir; böylece sınırın üstündeki bir seçim, tamamı okunup son adımda başarısız olmak yerine bir adım önerisiyle reddedilir. Sınıra yakınken (*sıkı*), panel sıralamanın kendi ilerlemesi olmayan uzun bir geçiş olduğunu uyarır. Bir zaman sütunu olmadan hiçbir sıralama yapılmaz ve hiçbir tavan uygulanmaz.

## Kaynak bütçeleri {#resource-budgets}

**Performans → Kaynak bütçeleri** (Performans panelinin altındaki daraltılabilir bir satır, `Kaynak bütçeleri - RAM, GPU, çekirdekler` yazan). Bütçeler algılanır; algılanan rakam varsayılandır; kaydırıcılar, algılamanın bir ölçüm olmadığı bilinmedikçe algılanan rakam olan bir **tavanın** ötesine çıkmaz.

| Denetim | Aralık | Anlamı |
|---|---|---|
| **Satır verisi için RAM** | 256 MiB'den RAM tavanına, logaritmik | Sığma denetimi için RAM bütçesi. Algılanan varsayılanın üstünde *(algılananın üstünde)*, tavanda *(en çok)* olarak işaretlenir. |
| **Satır verisi için GPU** | 128 MiB'den GPU tavanına, logaritmik | Sığma denetimi ve satır yüklemesi için GPU bütçesi. Algılanan varsayılanın üstünde *(algılananın üstünde)*, tavanda *(en çok)* olarak işaretlenir. |
| **Ayrıştırıcı iş parçacıkları** | 1'den mantıksal çekirdek sayısına | Bir yüklemenin aynı anda kaç dosya ayrıştırdığı, her biri kendi işçisinde. Varsayılan çekirdek - 2 (dört ya da daha az çekirdekte çekirdek - 1). Bkz. [Ayrıştırıcı iş parçacıkları](#parser-threads) (Geliştiriciler için altında). |
| Kaynak satırı | | Her rakamın nereden geldiği (`RAM: …. GPU: …. CPU: ….`). |
| **Yeniden algıla** | | Geliştirici sunucusundan taze bir bellek okuması ister ve her bütçeyi yeniden hesaplar. |
| GPU adı | | Bağdaştırıcının kısa adı; tam işleyici dizgisi ipucudur. |

### GPU bütçesini yükseltmek {#raising-the-gpu-budget}

Algılanan rakamın üstündeki bir GPU bütçesi ayarlandığı gibi uygulanır: sığma denetimi ve yükleme aynı rakamı tek bir işlevden alır ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), bu da onu yalnızca kaydırıcının durduğu GPU tavanıyla sınırlar. Yani denetimin geçtiği bir yükleme tamamen yüklenir. Algılanan rakamın ötesinde kaydırıcı *(algılananın üstünde)* okur: rakam o zaman bir ölçüm değil, kartın hakkındaki yargınızdır ve kartın sahip olduğundan daha yükseğe ayarlamak bir bağlam kaybı ya da sürünme riskini taşır.

## Çok büyük veri kümeleri: kaldıraçlar {#huge-datasets-the-levers}

En ucuzdan en sert olana:

1. **Daha az filtre sütunu.** Her biri satır başına 4 bayt ve bir çözme geçişidir.
2. **Bir adım.** Her *N*'inci satır.
3. **Zaman sütunu yok.** Sıralama yok, sıralama tavanı yok, satır başına 4-8 bayt zaman ve ömür yok — ve zaman çizelgesi yok.
4. **Bütçeleri yükseltin**, belleğin orada olduğunu bildiğinizde.

Oluşturma zamanında büyük veri kümeleri, veriyi küçültmek yerine örnekleme ve kademeli birikimle işlenir; bkz. [Örnekleme ve bütçeler](sampling-and-budgets.md).

## Geliştiriciler için {#for-developers}

### Ayrıştırıcı iş parçacıkları {#parser-threads}

Birden çok dosyanın yüklenmesi, aynı anda en fazla **Ayrıştırıcı iş parçacıkları** kadarını ayrıştırır; her biri, o yükleme için alım işçisi tarafından başlatılan bir ayrıştırıcı işçisinde ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). 1'de ya da tek bir dosya için, dosyalar alım işçisinin kendisinde birbiri ardına ayrıştırılır.

Birden çok dosyayı aynı anda çalıştırmak sığma denetimini gevşetmez:

- **Oluşturucu önce sayılır.** Birleştirilmiş sütunlar, ilk dosya okunmadan önce bütün seçim için ayrılır; bu yüzden uçuştaki dosyalar yalnızca RAM bütçesinin yanlarında bıraktığını alır (`parseHeadroom`): konum, 64-bit zaman, bakış açıları, kişi, 32-bit grup, oturum, filtre sütunları ve `Source file`, yüklenecek satır başına — satır sayısı bir CSV tahminiyse 2,6 ile çarpılır, daha büyük bir sütuna büyüyen bir sütun için.
- **Her dosya başlamadan önce maliyetini ayırır** (`fileParseBytes`): satırları (Parquet alt bilgisinden; bir CSV'nin tahminindeki payı boyuta göre) aynı sütunlarla çarpılmış, **8** ile çarpılmış — bloğun kendisi, konumu olmayan satırlar bırakılırken yanındaki kopya ve çözücünün çalışma kümesi; metin sütunları için bu, kimliklerinden çok daha büyüktür. Bir adım bunu azaltmaz, çünkü dosyalar tamamen okunur ve sonra seyreltilir. 8 ölçümle belirlenmiş bir paydır: 3'te ya da 5'te, kişi ve oturum adlarıyla 86 milyon satırda otuz ayrıştırıcı iş parçacığı bir sekmeyi sınırının üstüne taşıdı; 8'de taşımadı.
- **Başka bir dosya yalnızca ayırması kalanın içine sığarsa başlar.** Bitmiş ama daha önceki bir dosyanın birleştirilmesini bekleyen bir dosya, birleştirilene kadar ayırmasını korur.
- **Bir dosya her zaman çalışır.** Hiçbir şey ayrılmamışken, bir sonraki dosya ne kadara mal olursa olsun başlar — bu, sığma denetiminin kabul ettiği birer birer yüklemedir, bu yüzden sıkı bir bütçe reddetmek yerine ona düşer.

*Yüklenirken tepe* rakamı, birer birer bir yüklemenin tepesidir; bu, sıralamada, her dosya okunduktan sonra gerçekleşir. Yan yana ayrıştırılan dosyalar, okunurken bu rakamın üstünde bellek kullanabilir; ayırmalar, yukarıdaki tahminler doğru olduğu sürece bunu RAM bütçesi içinde tutar.

Birleştirme sırası, dosyaların hangi sırayla bittiğinden bağımsız olarak seçimin sırasıdır; bu yüzden kişi, grup ve oturum numaralandırması, satırlar ve `Source file` değerleri birer birer yüklemeyle aynıdır. Okunamayan bir dosya atlanır ve daha önce olduğu gibi listelenir. Çöken bir ayrıştırıcı işçisi tüm yüklemeyi bitirir; alım işçisinin ölümünün her zaman yaptığı gibi. Her ayrıştırıcı işçisi, yükleme nasıl biterse bitsin, yükleme sona erdiğinde sonlandırılır. Ayrıştırıcı işçileri hiç başlatılamazsa, dosyalar bunun yerine alım işçisinde ayrıştırılır.

### Rakamlar nasıl algılanır {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) başlangıçta çalışır, işleyici var olduğunda bir kez daha, ve **Yeniden algıla**da.

**RAM, geliştirici sunucusuyla.** `start.bat` ve `npm run dev` sayfayı, makinenin belleğini okuyabilen bir süreçten, `/__host/memory` adresinde sunar (1,5 s içinde yanıtlanır ya da yok sayılır). Varsayılan, kurulu RAM'in %60'ı ile şu an boş RAM'in %80'inin küçüğüdür; tavan kurulu RAM'in %60'ıdır. Varsayılanı aşağıda tutan şey boş bellekse, panel bunu söyler ve programları kapatıp **Yeniden algıla**ya basmayı önerir.

**RAM, o olmadan** (statik bir dağıtım): hiçbir tarayıcı API'si boş belleği bildirmez ve `navigator.deviceMemory` Chrome ve Edge tarafından ikinin kuvvetine yuvarlanır ve 8 GiB ile sınırlanır. Varsayılan, `deviceMemory`'nin %60'ıdır; tarayıcının bildirdiği yerde sekmenin boş JS yığınının 4 katıyla daha da sınırlanır, hiçbir şey bildirilmediğinde 4 GiB. `deviceMemory` tam olarak 8 okunduğunda (sınır), rakam *sınırlı* olarak işaretlenir ve tavan varsayılanın 4 katıdır; varsayılanın ötesinde rakam bir ölçüm değil, sizin iddianızdır diye bir not vardır.

**Her iki durumda da**, RAM varsayılanı ve tavanı **12 GiB** ile sınırlanır — makine ne olursa olsun bir Chrome sekmesinin tutabileceği en çok tipli dizi belleği (bir sayfa 15,75 GB'a ulaştı ve başarısız oldu; 12, diğer her şey için yer bırakır) — ve 256 MiB'in altına hiçbir zaman inmez.

**GPU belleği.** Hiçbir web API'si bunu hiç bildirmez.

- Geliştirici sunucusuyla, kartın belleği `nvidia-smi` tarafından (en büyük bağdaştırıcı) ya da Windows'ta, ekran bağdaştırıcısının kayıt defteri değeri `HardwareInformation.qwMemorySize`'tan okunur. Varsayılan bunun %70'idir, tavan %90.
- Bir okuma olmadan, çıkarılır: varsayılan 2 GiB; en büyük doku 16.384 px ya da daha fazlaysa 4 GiB (ayrı bir kart), daha küçükse 1 GiB; ya da WebGPU'nun `maxBufferSize` değeri daha büyükse 8 ×'i. Tavan o zaman çıkarılan rakamın 8 katıdır, çünkü çıkarım bütünleşik bir parçayı ayrı bir parçadan ayırır ve daha ince bir şey bilmez. Panel rakamın çıkarıldığını söyler.
- Asla 128 MiB'in altına inmez.

**CPU.** `navigator.hardwareConcurrency` (bildirilmediğinde 4).
