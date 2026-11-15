---
title: "Dosya yükleme"
parent: "Veri alma"
nav_order: 1
lang: "tr"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Dosya yükleme

Bu sayfa, 3DHeat'e dosyalarınızı nasıl vereceğinizi ve onlarla ne yaptığını gösterir. Bir klasör bırakın; konum tutan dosyaları seçer ve tek bir resimde birleştirir.

1. Isı haritası kenar çubuğunun üstündeki **Kaynak**'ı açın.
2. Dosyaları ya da bir klasörü bırakma alanına bırakın, ya da **Dosyalar…** veya **Klasör…**'e basın.
3. Seçim satırını ve **Bellek tahmini**'ni okuyun (aşağıdaki resme bakın).
4. **Yükle**'ye basın.

![On maçlık bir klasör bırakıldıktan sonra Kaynak paneli: 1 seçim satırı, 2 "sığar" yazan Bellek tahmini ve 3 "10 dosyayı yükle"](../assets/img/en/loading-files-source.webp)

*Bir klasör bıraktıktan sonra 3DHeat ne bulduğunu ve sığıp sığmadığını söyler.*

Dosyalar, Isı haritası sekmesinin kenar çubuğunun üstündeki **Kaynak** panelinde yüklenir. Bir seferde seçilen her şey **tek** bir veri kümesi olur.

## Dosya seçme {#choosing-files}

| Denetim | Ne yapar |
|---|---|
| **Dosyaları veya bir klasörü buraya bırakın** (bırakma alanı) | İstediğiniz karışık dosya ve klasörleri bırakın. Klasörlerin içi özyinelemeli olarak taranır. Bırakma alanına tıklamak **Dosyalar…** ile aynı seçiciyi açar. |
| **Tek dosya…** | Tek bir dosya için bir dosya seçici. |
| **Dosyalar…** | Birden fazla dosya kabul eden bir dosya seçici. |
| **Klasör…** | Bir klasör seçici (tarayıcının `webkitdirectory` seçicisi); klasör ağacındaki her dosya sunulur. |

Seçiciler [yüklenebilir dosyalar listesindeki](data-formats.md#files) dosya türlerini kabul eder. Kısaca: `.parquet`/`.pq` Parquet olarak okunur; `.csv`/`.tsv`/`.txt` ayraçlı metin olarak; `.acmi` (Tacview), OCAP `.json`/`.json.gz` ve GPS biçimleri (GPX, KML, KMZ, NMEA, IGC, FIT) kendi okuyucularından geçer; `.3dheat` maç kapsayıcıları ise içerdikleri tablolar olarak yüklenir ([Her maç için bir dosya](container.md)). Okunamayan bir kapsayıcı *csv/parquet dosyası değil* diye atlanır.

Bırakılan klasörler, sembolik bağ döngülerine ve kontrolden çıkan ağaçlara karşı bir koruma olarak en fazla 12 düzey derinliğe ve en fazla 20.000 dosyaya kadar taranır.

## Hangi dosyalar tutulur {#which-files-are-kept}

Hiçbir şey okunmadan önce seçim süzülür ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Başka bir uzantısı olan dosya atlanır: *csv/parquet dosyası değil*.
- 0 bayt olan dosya atlanır: *boş (0 bayt)*.
- **Dönüştürücü yan dosyaları**, yani bir dönüştürücünün bir maçın tablosunun yanında sakladığı ham veri (`<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` ve [Dönüştürücüler her şeyi korur](converters.md) sayfasında listelenen diğerleri), atlanır: *bir dönüştürücünün yan dosyası*. Birini açmak için onu tek başına seçin ya da bırakın (ya da yalnızca yan dosyaları): yalnızca yan dosyalardan oluşan bir seçim, onları herhangi bir tablo gibi yükler. Bir tablonun yanındaki JSON dosyaları (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` ve `.hints.json`) konum olarak asla sunulmaz.
- **Hareket dosyası kuralı.** Seçimdeki herhangi bir dosya `movement*.parquet`, `movement*.csv` (ve diğer uzantılar) adlıysa (`movement.parquet`, `movement_1.parquet` vb.), diğer her veri dosyası atlanır: *hareket dosyası değil ve bu klasörde hareket dosyaları var*. Telemetri dışa aktarımları çoğu zaman konum tutmayan düzinelerce tablonun yanında bir konum tablosu içerir ve yalnız ilki çizilebilir. Hiç hareket dosyası olmayan bir klasör tüm veri dosyalarını yükler. Örnek: `movement_1.parquet`, `kills.parquet` ve `shop.parquet` içeren bir klasör yalnızca `movement_1.parquet`'yi yükler; diğer ikisi atlanmış olarak listelenir. Örnek: `movement_1.parquet`, `kills.parquet` ve `shop.parquet` içeren bir klasör yalnızca `movement_1.parquet`'yi yükler; diğer ikisi atlanmış olarak listelenir.
- Tutulan dosyalar seçim içindeki yollarına göre sıralanır; böylece aynı klasör her zaman aynı veri kümesini ve aynı renkleri üretir.

Panel, sonra seçimi gösterir (tek dosyanın adı ya da en uzun ortak klasörü kullanan `klasör (N dosya)`), dosya sayısını, toplam boyutunu ve toplam satır sayısını. Hepsi Parquet ise satır sayısı tam, herhangi biri CSV ise `≈` işaretiyle gösterilir. Atlanan dosyalar nedenleriyle listelenir; ilk dördü adlarıyla.

## Şemayı okumak {#reading-the-schema}

Seçimin **ilk** dosyası, şemayı tanımlamak için açılır ("Şema okunuyor"): sütun adları, ilk 50 veri satırı, hangi sütunların sayısal göründüğü ve Parquet için her sütunun mantıksal türü ile `heat3d` alt bilgi girdisi. Tek bir tablonun dışa aktarımlarından oluşan bir klasör tek bir şemayı paylaşır; bu yüzden tek bir dosya hepsini temsil eder. Sonra her dosya ölçülür ("Satırlar sayılıyor"): bir Parquet alt bilgisi, tek ve küçük bir okumayla tam sayıyı verir; bir CSV'nin sayısı ise ilk megabaytının ortalama satır uzunluğundan tahmin edilir.

[Sütun eşleme](column-mapping.md) paneli otomatik eşleme tahminleriyle açılır ve [bellek tahmini](memory-and-budgets.md) **Yükle** düğmesinin üstünde görünür.

## Yüklemeden önce mesajlar {#messages-before-loading}

Seçimin altında panel, [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts) kaynağından şunları listeler:

- **Hatalar** (kırmızı): yükleme başlayamaz. İki konum ekseninden az olması, iki eksende aynı sütun, dosyada olmayan eşlenmiş bir sütun, sayısal görünmeyen bir konum sütunu, örneklenen değerleri metin olan bir zaman sütunu (birim bir sayıyken: her satır NaN okunur ve 0 zamana düşer), örneklenen değerlerinin hiçbiri tarih olarak ayrıştırılamayan ISO-8601 olarak ayarlanmış bir zaman sütunu ve 0 olan bir birim ölçeği.
- **Uyarılar** (sarı): yüklenir, ama muhtemelen amaçlandığı gibi değil. Örneklenen satırların çoğunda ayrık bir değer alan bir grup sütunu (yani bu bir grup değil, bir kimliktir), `DATE` zaman sütunu (bir günün her satırı aynı anı paylaşır) ve sütunları olmadan ayarlanmış bakış yönü.
- **Notlar**: eşlemenin ne ima ettiği. Bir eksen eşlenmemişken düzlemde çizim, zaman sütunu olmadan zaman çizelgesi yok, kişi sütunu olmadan izler yok ve grup sütunu olmadan her şey için tek renk ve yalnızca filtre için tutulan bir sütun üzerinde bölünebilen bir fark.

## Yükleme {#loading}

**Yükle** düğmesi *Dosyayı yükle*, *N dosyayı yükle* yazar; bir [azaltma adımı](memory-and-budgets.md#decimation) ayarlıysa *N dosyayı yükle (K'da 1)* yazar. [Sığma denetimi](memory-and-budgets.md#the-fit-check) yüklemenin sığmayacağını söylediğinde *Çok büyük: azaltın ya da seyreltin* yazar ve devre dışı kalır. Eşlemenin hataları varken ya da başka bir yükleme sürerken de devre dışıdır.

Yükleme sırasında panel geçerli adımı gösterir (birden fazla dosya varsa önünde `[dosya/dosyalar]` ile), şimdiye kadar okunan satırları, bir ilerleme çubuğunu ve **İptal**'i. İptal, alım çalışanını ve onunla başlattığı ayrıştırma çalışanlarını sonlandırır.

Sayfa yüklerken çizmeye devam eder, çünkü iş arka planda yapılır. Geçerli adımı, okunan satırları, bir ilerleme çubuğunu ve **İptal**'i görürsünüz. Son dosyadan sonra panel şu adımları gösterir: *Satırlar zaman sırasına konuyor*, *Sütunlar yeniden sıralanıyor (n / m)*, *Kapsam ölçülüyor*, *Liste oluşturuluyor*, *Oturumlar özetleniyor* ve *Yaşam süreleri hesaplanıyor*. Ardından bir kare boyunca *N satır GPU'ya yükleniyor*. Böylece uzun bir yükleme asla donma sanılmaz.

### Nasıl çalışır {#how-it-works}

Yükleme bir Web Worker'da çalışır ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Birkaç dosya ve birden fazla [ayrıştırma iş parçacığı](memory-and-budgets.md#parser-threads) varsa, RAM bütçesinin izin verdiği ölçüde o kadar dosya **aynı anda** ayrıştırılır; her biri kendi ayrıştırma çalışanında ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)). Yine de seçimin sırasıyla tek tek birleştirilirler; böylece veri kümesi, tek tek yüklemeyle aynıdır. Birkaç dosya yoldayken ilerleme satırı en son bildiren dosyayı adlandırır; çubuk ve satır sayısı, yoldaki her dosyayı toplar. Tek bir iş parçacığında ya da tek bir dosyada, dosyalar alım çalışanının kendisinde birer birer ayrıştırılır. Yalnızca eşlemenin adlandırdığı sütunlar okunur: Parquet dosyasının eşlenmemiş bir sütunu bir maliyet getirmez; bir CSV bayt bayt taranır ama yalnızca eşlenmiş alanlar çözülür.

## Birden fazla dosya tek veri kümesi olur {#several-files-become-one-dataset}

Birden fazla dosya yüklendiğinde ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Tek liste.** Kişiler, gruplar, oturumlar ve kategori değerleri tüm dosyalar arasında paylaşılan sözlüklerdir; böylece iki dışa aktarımdaki aynı oyuncu tek bir kişi ve tek bir izdir.
- **Tek zaman başlangıcı.** Zamanlar birleştirme sırasında 64-bit saniye olarak tutulur ve *tüm* seçimin en erken zamanına göre yeniden tabanlanır; sonra o başlangıçtan 32-bit saniye olarak saklanır. Dört öğleden sonranın dört dışa aktarımı, üst üste yığılmak yerine gerçek sıralarına yerleştirilir.
- **Tek zaman sırası.** Tüm dosyalardan gelen satırlar bir radix sıralamasıyla zamana göre sıralanır (bkz. [sıralama tavanı](memory-and-budgets.md#the-sort-ceiling)).
- **Bir `Source file` sütunu.** Her satır hangi dosyadan geldiğini, `Source file` adlı bir kategori sütunu olarak hatırlar. [Filtreler](filters.md) içinde görünür ve [fark bölümünde](difference.md) *Source file - iki yüklemeyi karşılaştır* olarak çıkar. Tek dosyalı bir yükleme bunu almaz: sabit bir sütun, hiçbir şey söylemek için satır başına 4 bayt tutardı.
- **Eksik sütunlar.** Bir *filtre* sütununu eksik olan bir dosya, onun için yalnızca değer katkısı yapmaz. Eşlenmiş bir *rol* sütununu (X, zaman, kişi, ...) eksik olan bir dosya *dosyada "ad" sütunu yok* hatasıyla başarısız olur; çok dosyalı bir yüklemede o dosya atlanır, diğerleri yine yüklenir ve atlanan dosyalar veri kümesinde listelenir. Tek dosyalı bir yükleme başarısız olursa hatayı bildirir.
- **Eksiklik uyarısı.** Yüklenen satırlar, önceden sayılan satırların %95'inden az olduğunda, veri kümesi eksik payla birlikte bir uyarı taşır. Bu, okunamayan dosyalardan ya da kullanılabilir bir konumu olmayan satırlardan kaynaklanır; bu satırlar içeri alınırken düşer.

## Yüklemeden sonra {#after-loading}

Yeni veri kümesi önceki herhangi birinin yerine geçer. Her yüklemede ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- tüm filtreler ve grup görünürlüğü temizlenir;
- gruba göre fark bölümü sıfırlanır: grupların ilk yarısı (yukarı yuvarlanmış) pozitif, geri kalanı negatif olur;
- nokta yarıçapı yatay kapsam / 120 olarak, doygunluk ise analitik bir tahmin olarak ayarlanır; küp boyutu, bakış ışını uzunluğu, uçuş hızı ve yakın/uzak düzlemler kapsamdan ayarlanır (bkz. [Oturumlar, kişiler ve gruplar](sessions-persons-groups.md#entity-size));
- kutu tekrar oturumu en çok satırı olan oturuma ayarlanır;
- çizgi ısısı rotaları baştan tahmin edilir ([Çizgi ısısı](line-heat.md));
- geçerli mod yeni veri tarafından desteklenmiyorsa görünüm modu **Isı**'ye döner; zaman sütunu yoksa zaman çizelgesi **Tümü**'ne, yaşam süreleri yoksa geçmiş **Kümülatif**'e döner;
- oynatma imleci başa alınır ve oynatma durur;
- kamera, varsayılan yönden (-Z boyunca, yaklaşık 36° aşağı eğimli) tüm veri kümesini çerçeveler.

Sonra **Veri kümesi** paneli, veri kümesinin adını (seçim, satır ve dosya sayıları ve bir azaltma adımı kullanıldıysa adım), `N takım · N kişi · N sn açıklık` yazısını ve yükleme sırasında oluşan her uyarıyı sarı olarak, veri kümesi yüklü olduğu sürece gösterir. Bu paneldeki **Kaldır** veri kümesini çıkarır.
