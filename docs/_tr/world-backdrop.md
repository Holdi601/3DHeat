---
title: "Dünya arka planı"
parent: "Haritalar ve arka plan geometrisi"
nav_order: 5
has_children: true
lang: "tr"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Dünya arka planı

Bir dünya arka planı, bir uçuş kaydının altına gerçek zemini koyar: tepeler, yollar, nehirler, havaalanları ve binalar. Ücretsiz açık harita verilerinden indirilir. Tacview kaydı yoksa boş bir ızgaranın üzerinde yüzecek olduğu zaman kullanın. Bu bir [bölüm](glossary.md)dür, bu yüzden ısı ve figürler üzerine oturur.

## Bir tane oluşturun {#build-one}

1. Yerini dünya üzerinde belirten bir uçuş kaydı yükleyin (bir Tacview `.acmi` dosyası), ya da hiçbir şey yüklemeyin ve 3. adımda bir harekât alanı seçin. Bkz. [Veriyi içeri almak](getting-data-in.md).
2. Kenar çubuğunda **Arka plan / bölüm** bölümünü açın.
3. Verinizin altındaki zemini oluşturmak için **Gerçek dünya arka planı** düğmesine basın. Ya da **Harekât alanı** içinden bir oyun haritası seçip **Harekât alanı arka planını oluştur** (ya da **Harekât alanını akışla yükle**) düğmesine basın.
4. Bekleyin. Panel ilerlemeyi gösterir (*Yükseklik karoları*, *Harita karoları*, *Arka plan oluşturuluyor*). **İptal** durdurur.
5. Etrafta uçun. Harita verisinin kredi satırı, görünümün sağ altına yazılır.

İlk oluşturmada birkaç on megabayt indirilir. Tarayıcı bunları saklar. Aynı alanın ikinci oluşturulması hiçbir şey indirmez. **Harita karolarını unut** bunları siler. **Gerçek dünya arka planı** düğmesi yalnızca yüklü veri bir coğrafi referans taşıdığında gösterilir (aşağıya bakın).

Her şey bir arka plan işçisinde ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)) oluşturulur. Sonuç mevcut bölümün yerine geçer ve herhangi bir [3B bölüm](model-levels.md) gibi davranır: arkasındaki ısıyı gizler, dilimle kesilir, [görünüm denetimlerine](level-appearance.md) sahiptir ve [kütüphaneye](level-library.md) kaydedilebilir.

## Veri nerede: coğrafi referans {#where-the-data-is-the-geographic-reference}

Bir veri kümesi, yalnızca bir referans belirten bir kaynaktan coğrafi referans alır:

- **Bir ACMI kaydı**: başlığındaki `ReferenceLatitude` ve `ReferenceLongitude`, ve okuyucunun orada WGS84 elipsoidine değen düzleme yansıttığı konumlar (X doğu, Y kuzey, metre cinsinden; yükseklikler kaydın deniz seviyesinden yüksekliğidir). Referans, eşleme **X** ve **Y**'yi zemin eksenleri olarak aldığında korunur (kaydın kendi ipuçları bunu söyler). Zemin, bir oyunun kendi düz dünya **U** ve **V** gibi başka bir sütundan geldiğinde ise düşürülür.
- **`heat3d` ipuçlarında bir `geo` girdisi taşıyan bir Parquet tablosu**: [Watcher](https://github.com/Holdi601/3DHeat-Watcher)'ın DCS, MSFS, X-Plane ve IL-2 (Tacview) tabloları. Girdi [Geliştiriciler için](#for-developers) bölümünde anlatılır.

Birden fazla dosyanın yüklenmesi, referansı yalnızca hepsi aynı referansı paylaştığında korur. Diğer her yükleyici etkilenmez ve hiçbir referans taşımaz.

Arka plan aynı şekilde yansıtılır ve sonra yüklemenin eksen eşlemesinden geçirilir. Böylece eşleme ne çevirme ne de ölçek uygularsa, verinin altına düşer.

## Harekât alanları {#theatres}

**Harekât alanı** seçici, DCS World'ün gerçek dünya haritalarını listeler (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) ve IL-2 Great Battles'ı (Stalingrad, Moscow, Kuban, Rheinland, Normandy, Prokhorovka, Velikie Luki, Arras, Odessa, Finnish Gulf / Leningrad, Korea). Her biri dünya üzerinde kendi kutusuyla gelir ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). DCS kutuları, yayımlanmış projeksiyonlardan hesaplanan editörlerin sınırlarıdır. IL-2 kutuları ve işaretli DCS olanlar ise haritaların yayımlanmış boyutlarından ve kenarlarındaki kasabalardan tahmin edilmiştir. Panel bunu söyler.

**Harekât alanı arka planını oluştur** iki ayrıntı düzeyini tek bir ağda oluşturur:

| Düzey | Alan | Arazi | Harita |
|---|---|---|---|
| Harekât alanı | tüm kutu | en fazla 64 yükseklik karosu gerektiren en derin 10 yakınlaştırma (Kafkasya üzerinde yaklaşık 3 km köşe başına, Normandiya üzerinde 1 km) | en fazla 64 vektör karosu, 4 ile 9 yakınlaştırma arasında; deniz, göller, arazi örtüsü ve otoyollar |
| Ayrıntılı alan | **Verinin altında**, **Bir nokta çevresinde** (enlem, boylam, 12 ile 400 km), ya da hiçbiri | 100 karoya kadar, 12 yakınlaştırmaya kadar; en fazla 500.000 köşe | aşağıdaki her şey, en derin 14 yakınlaştırmada, sığabilecek en fazla 1.500 vektör karosundan |

Ayrıntılı alan, harekât alanının ızgarasında bir delik açar. Bu delik, iki ızgara kenar çizgilerini paylaşsın diye hücre bütünlüğüne genişletilir ve yükseklikleri farklı örneklediği yeri kapatan ince bir duvar eklenir.

Veri yüklüyken harekât alanı, verinin düzleminde oluşturulur, bu yüzden olduğu gibi altına düşer. Veri yokken ise harekât alanının kendi referans noktası etrafında kurulur (ayrıntılı alanının yanındaki tam derecelerde). Sonradan başka bir referansta yüklenen veri (bir ACMI dosyası kendi referansını belirtir) arka planı da altına taşır. İki projeksiyon arasındaki tam dönüşüm, arka planın üzerinde 256 × 256 bir ızgarada hesaplanır ve düğümler arasında okunur. Bütün bir harekât alanı boyunca bir ya da iki metre içinde kalır ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Kütüphaneye kaydedilen bir arka plan yerini korur ve başka verinin altında yüklendiğinde aynı şekilde taşınır.

### Bir harekât alanını akışla yüklemek {#streaming-a-theatre}

**Harekât alanını akışla yükle**, harekât alanını bir uçuş simülatörü harita görüntüleyicisi gibi gösterir. Zemin, kameranın çevresinde birçok küçük karo olarak gelir, uçtukça yüklenir ve erişimin dışına çıkınca bırakılır ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Web Mercator karolarından bir dörtlü ağaç.** 5. yakınlaştırmadaki kökler, kameranın çevresindeki 1.500 km'yi kapsar. Böylece zemin harekât alanının kutusunun ötesine, ufka kadar uzanır. Bir karo, kamera genişliğinin 1,4 katından daha yakınken dört çocuğuna bölünür. Bu, 15. yakınlaştırmaya kadar sürer (karo başına yaklaşık 1 km, arazi köşeleri arasında 15 m). Ayrıntı, ekranda olduğu gibi uzaklıkla azalır.
- **Her karo kendi ağı**, bir işçide yapılır ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): kenarında bir etek olan 65 × 65 bir arazi ızgarası (farklı ayrıntıdaki komşular asla çatlak göstermesin diye), üzerine boyanmış arazi örtüsü ve deniz, yollar, demiryolları, göller, nehirler, havaalanları, ölçülmüş pistler ve binalar, ve isteğe bağlı olarak karenin uydu resmi. Görüntüleyici karoları, bölümün görünümü ve derinlik kurallarıyla çizer. Böylece tıpkı herhangi bir bölüm gibi arkalarındaki ısıyı gizlerler.
- **Önce kaba.** Karolar, her kaynak için aynı anda dört indirme ile önce kaba ve yakın olanlar için istenir. Bir karonun çocukları yüklenirken, karo onların yerine durur. Böylece görünüm hemen dolar ve netleşir.
- **Bellek**: oluşturulan karolar 600 MB'a kadar tutulur. En az yakın zamanda çizilen önce atılır. **İndirmeler** karo önbelleğinde kalır, 2 GB bütçe ile sınırlı, en eski olan önce çıkar. Bir bölgeye geri uçmanın maliyeti yoktur, ve oluşturma başına bir sınır yoktur.
- **Kütüphaneye** akışla yüklediği şey olarak kaydedilir: harekât alanı, seçenekleri ve dünya üzerindeki yeri, karolar olarak değil. Yüklemek yeniden akışla yapar ve karolar hâlâ oradaysa karo önbelleğinden. Tıklamalar ve inceleyici, herhangi bir bölümde olduğu gibi karolara çarpar.
- Her iki görüntüleyici de karoları çizer. Gerçek bir GPU'da yan yana denendi (aynı kartta WebGPU ve WebGL2). Bir sırtın arkasındaki ısı da dahil.
- Veri yüklüyken karolar verinin düzleminde oluşturulur. Sonradan başka bir düzlükte yüklenen veri, karoları oraya yeniden kurar (önbellekten).
- Üç noktada (Normandiya, Nevada, Suriye) yapılan sentetik uçuşlarda ölçüldü: görüntüyle ilk ziyarette yaklaşık 63, 45 ve 24 MB. İkinci ziyarette hiçbir şey indirilmez.

## Ne oluşturulur {#what-is-built}

| Parça | Kaynak | Nasıl |
|---|---|---|
| Uydu görüntüsü (akışla yüklenen harekât alanları, isteğe bağlı) | EOX Sentinel-2 cloudless 2016 | **Uydu görüntüsü**, bulut içermeyen 2016 mozaiğini (piksel başına yaklaşık 10 m, 14. yakınlaştırma; daha derin karolar onu büyütür) boyanmış arazi örtüsünün yerine zemine yerleştirir. Yollar, pistler, binalar ve adlar üstte kalır. |
| Daha ince uydu görüntüsü (ABD, Fransa) | USGS National Map ortofotoğrafları; IGN BD ORTHO | **Uydu görüntüsü** açıkken, 13. yakınlaştırmadan bir harita karosu, tamamen bitişik ABD'nin ya da Fransa'nın metropol bölgesinin içindeyse, EOX yerine ulusal ortofotoyu alır. Karonun iki yakınlaştırma derinliğinde (karonun on altı karosu tek bir resimde birleşir, yakından piksel başına 1-2 m). Diğer her yerde EOX. |
| Arazi (akışla yüklenen harekât alanları) | Mapterhorn | Her yerde Copernicus GLO-30 (12. yakınlaştırmada piksel başına yaklaşık 19 m), bir ülkenin kendi ölçümü olduğu yerlerde metre ölçekli (Fransa, ABD ve diğerleri); her karodan iki yakınlaştırma kaba okunur. Mapterhorn'a ulaşılamazsa AWS Terrain Tiles. |
| Arazi | AWS Terrain Tiles (Terrarium PNG) | Kutu üzerinde bir yükseklik ızgarası: yakınlaştırma, 36 karoya kadar gerektiren en derin 12. yakınlaştırmadır (43° K'de piksel başına yaklaşık 28 m) ve ızgara en fazla 400.000 köşeye seyreltilir. Her zamanki kabartma işaretleriyle zemin olarak çizilir. |
| Yollar, demiryolları | OpenFreeMap vektör karoları, `transportation` katmanı | Arazinin üzerine serilmiş düz şeritler, arazinin aralığına yoğunlaştırılmış ve arazi ile kavga etmesin diye onun birkaç yüzdesi kadar yukarı kaldırılmış. Genişlikler sınıfa göre, 16 m (otoyol) ile 3 m (patika, demiryolu) arası. Kutunun köşegeninin 5000'de birinden daha dar asla olmaz. Yaya yolları, feribotlar ve tüneller dışarıda bırakılır. |
| Havaalanları | `aeroway` katmanı | Pist, taksi yolu, apron ve helikopter pisti poligonları zemin olarak serilir; pist ve taksi yolu çizgileri 45 m ve 18 m şeritler olarak. |
| Su | `water` katmanı | Deniz 0 m'de düz; göller ve göletler en düşük kıyılarında düz; nehirler serilmiş. Su olarak çizilir: düz gölgeli, kontur yok. |
| Arazi örtüsü | `landcover` ve `landuse` katmanları | Arazinin kendi köşelerine boyanır, ek üçgen yok: ormanlar, çimen ve parklar yeşil, tarım arazisi saman rengi, sulak alan, kum, kaya, buz; yerleşim, sanayi, ticari, askeri ve ocak alanları bastırılmış tonlarda. Su, su yüzeyinin altına da boyanır, böylece kıyı her yükseklikten okunur. Çıplak zemin, hafif bir yükseklik tonu alır (ova gri-yeşil, yayla kahverengi, 3.000 m'nin üzerinde kar). Arazinin çözünürlüğünde okunur: ayrıntılı alanda yaklaşık 30-45 m, harekât alanında kilometreler. |
| Yer adları | `place` ve `aerodrome_label` katmanları | Şehirler, kasabalar ve köyler, ve havaalanları ICAO kodlarıyla, görünümün üstüne yazılır. Her türün ne kadar göründüğü kameranın yüksekliğine göre artar, aynı anda en fazla 70. |
| Ölçülmüş pistler | [OurAirports](https://ourairports.com/data/) `runways.csv` (kamu malı) | İsteğe bağlı (**OurAirports pistleri**, varsayılan açık): listede iki ucu da bulunan her açık pist, eşik ile eşik arasında, listelenen genişliğiyle, yan şeritleri, kesikli bir orta çizgisi ve eşik çubuklarıyla. Tek bir 4 MB liste, bir kez indirilir ve önbellekte tutulur. |
| Binalar | `building` katmanı | Ayak izleri, `render_min_height`'tan `render_height`'a (eksikse 6 m) altlarındaki en düşük zeminin üzerine çıkarılır; `hide_3d` parçaları atlanır. Yapılar olarak çizilir. |

Vektör karoları, kutu en fazla 300 tane gerektirdiğinde 14. yakınlaştırmada okunur (binaların olduğu tek yakınlaştırma). Daha büyük bir alan için, o kadar gerektiren en derin yakınlaştırma okunur, 8'e kadar. Daha büyük bir alan yalnızca arazi alır.

### Görünüm {#look}

Bir arka plan **Yakalanan rengi göster** açık olarak başlar. Renk, açık bir yolu üzerinde durduğu gri zeminden, koyu bir pisti apronundan ayıran şeydir. Zeminin üçgen kenarları kapalıdır, çünkü düzenli bir ızgara bir şey söylemez. Silik konturlar, opak deniz (uzakta yüzeyle derinlik için savaşmasın diye altına konan bir taban olmadan) ve açık gri, neredeyse katı binalar, bir harita çizdiği gibi. Açık denizde hiç zemin üçgeni yoktur. Geri kalan her şey bir model bölümünün varsayılan görünümüdür.

## Kredi, tuvalde {#credits-on-the-canvas}

Bir arka plan bölüm olduğunda, kaynaklarının kredisi görünümün sağ altına, bir tıklama gerektirmeden yazılır. Böylece ekran görüntüleri ve işlenmiş videolar onu taşır:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Her parça, kaynağının atıf sayfasına bağlanır (openstreetmap.org/copyright ve Terrain Tiles [atıf listesi](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). Kütüphaneye kaydedilen bir arka plan, kredilerini korur ve yüklendiğinde yeniden gösterir. Metin görüntüleyiciyle birlikte çevrilir, adlar çevrilmez.

## Kaynaklar ve koşulları {#sources-and-their-terms}

Her kaynak, lisansı ve arka planın koşullar içinde nasıl kaldığı: [Dünya arka planı: kaynaklar ve koşullar](world-backdrop-sources.md).

## Karo önbelleği {#the-tile-cache}

Her karo ve vektör karolarının TileJSON'u, tarayıcının Cache API'sinde `3dheat-world-tiles-v1` altında, URL'ye göre saklanır. Aynı alanın ikinci oluşturulması hiç istek yapmaz ve çevrimdışı çalışır: TileJSON önce istenir ve başarısız olursa önbellekteki kopyası, zaten tutulan karoları adlandırır. Sunucunun bulunmadığı karolar (açık deniz, 404) da yok olarak hatırlanır.

Vektör karosu URL'leri, haritanın yapım tarihini taşır. Bu yüzden OpenFreeMap yeni bir yapım yayımladıktan sonra, bir sonraki arka plan taze karolar indirir ve eskiler temizlenene kadar kalır. Önbellek 2 GB ile sınırlıdır: bu sınırı aşınca en uzun süre önce saklanan karolar önce silinir. **Harita karolarını unut** tüm önbelleği siler. Önbellek güvenli bir köken (`https://` ya da `localhost`) ister. Başka yerde her oluşturma yeniden indirir.

## Tacview ile karşılaştırma {#compared-with-tacview}

Sentetik kayıtlarla, her harekât alanında bir yerde gözle kontrol edildi: kalkış koşuları çizilmiş pistlerin orta çizgilerine, kıyı geçişleri kıyıya düşer. Tacview'in tarafı, belgelerinden ve yayımlanmış ekran görüntülerinden alınmıştır (tacview.net, Steam sayfası). Burada çalıştırılarak değil.

| | Tacview 1.9 | Bu arka plan, akışla |
|---|---|---|
| Kapsam | tüm küre | kamerada 1.500 km, kamera nerede olursa olsun |
| Arazi | ETOPO1 (yaklaşık 1,25 km) yerleşik; kullanıcı kurarsa SRTM 25-75 m; DCS'den dışa aktarılan DCS arazisi | Copernicus GLO-30 (Mapterhorn), Fransa ve ABD'de metre ölçekli |
| Uydu görüntüsü | yerleşik değil; kullanıcının indirdiği dokular (Mapview, SAS Planet, bir Caucasus VFR haritası gibi eklentiler) | EOX Sentinel-2 cloudless 2016, yaklaşık 10 m, akışla |
| Arazi örtüsü | yok, bir dokuda olmadıkça | OpenStreetMap'ten, arazinin üzerine boyanmış (uydu görüntüsü olmadan) |
| Yollar, demiryolları | yok, bir dokuda olmadıkça | kameraya yakın her sınıf; uzakta ana yollar |
| Binalar | yok | kameraya yakın, ekstrüde ayak izleri |
| Havaalanları | düz kutular olarak etiketler ve pistler, işaretsiz | ölçülmüş uçlardan pistler, yan şeritler, orta çizgi ve eşik çubukları; taksi yolları, apronlar; ICAO kodlu adlar |
| Yer adları | bazı köy ve şehir etiketleri | mesafe ve yüksekliğe göre şehirler, kasabalar, köyler, havaalanları |

Hâlâ yetersiz kaldığı yerler:

- **Görüntü çözünürlüğü**: ABD ve Fransa dışında, 10 m'lik uydu mozaiği yaklaşık 2 km'nin altında yumuşaktır. Kullanıcının kurduğu 17. yakınlaştırmalı bir dokuyla Tacview orada daha keskindir.
- **DCS'nin kendi şeklindeki arazi**: Tacview, DCS'nin kendi dışa aktardığı araziyi gösterebilir. Burada gerçek yerküre vardır. Bu, harita modelcilerinin değiştirdiği yerlerde DCS'nin arazisinden farklıdır.
- **Eğrilik**: zemin düz bir düzlemdir, bu yüzden ufuk eğri bir yerkürenin ufku değildir. Tacview bir küre çizer.
- **Hız**: bir yere ilk ziyarette, keskinleşmeden önce onlarca megabayt indirilir. Yazılım tabanlı bir tarayıcıda (ekran görüntüleri), birkaç yüz karoyla saniyede birkaç kare çizer.

## Sınırlar ve sonra gelecekler {#limits-and-what-comes-later}

- **Arazi çözünürlüğü**: en iyi yaklaşık 30 m ve büyük alanlarda daha kaba. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (AWS üzerinde bulut için optimize edilmiş GeoTIFF'ler, anahtar yok, sabit kredi metni) daha iyi bir kaynaktır: her yerde 30 m, GLO-30'un boşluklarında GLO-90 (Ermenistan ve Azerbaycan; DCS Caucasus'un kapsadığı yerler). Bir GeoTIFF okuyucusu gerektirir ve henüz kullanılmaz.
- **Daha iyi arazi**: AWS üzerindeki Copernicus GLO-30 CORS başlığı göndermez, bu yüzden bir tarayıcı okuyamaz. OpenTopography'nin aynası okunabilir (CORS ve aralıklar), ama halka açık bir uygulamanın çalışma zamanı kullanımı için koşulları bilinmiyor. Herhangi bir kullanımdan önce sorulmalı. Mapterhorn GLO-30'u zaten taşır.
- **Eğrilik**: zemin düz bir düzlemdir ve yükseklikler yerkürenin eğriliği için alçaltılmaz. Bu, kayıtların nasıl yerleştirildiğiyle eşleşir (yükseklik olarak irtifa). Referanstan uzakta her ikisi birlikte kayar, 100 km'de bin de bir parçadan az. Yalnızca karoları bükmek, onları uzakta veriden ayırırdı, bu yüzden sunulmaz. Eğri bir ufuk, aynı düşüşü gerektirir: kameradan uzaklığın karesi bölü yerkürenin yarıçapının iki katı. Bu, konumu çizen her geçişte (bölüm, karolar, ısı, çizgiler, kutular, etiketler, seçme) tek bir ortak bir uniform olarak uygulanmalı. Gerçek bir küre ise veriler için de yer merkezli konumlar ve kamera göreli çizim gerektirir. İkisi de küre modu ile planlanmıştır.
- **Yalnızca bugünkü dünya**: DCS ve IL-2'nin tarihi haritaları (Normandy 2, The Channel, Germany Cold War ve her IL-2 haritası) bugünkü kasabalar, yollar ve kıyı yapılarıyla çizilir. Panel bunu söyler. Dönemin havaalanları çizilmez.
- **Küre modu yok**: bir arka plan düz, yerel bir düzlemdir. Bütün-yerküre görünümü planlanmıştır.
- Yollar büyük alanlarda görünür kalsın diye genişletilir. Yakından, gerçekte olduğundan daha geniş görünürler.
- DCS harekât alanı adları, Watcher tablolarında `mission.theatre`'da DCS'nin verdiği gibi eşleşir. Listede olmayan bir ad, ilk fiksin tam dereceye yuvarlanmışına ve yalnızca enlem ve boylama düşer.

## Tarihi haritalar (henüz yapılmadı) {#historical-maps-not-built-yet}

Dönem haritaları, tarihi harekât alanlarını sonra dokulayabilir. Amerika Birleşik Devletleri Ordusu Harita Servisi (AMS) serileri, ABD federal hükümet eserleridir ve genellikle kamu malı sayılır (her taramanın kaydını kontrol edin. Birçoğu İngiliz GSGS ya da Alman orijinallerinin yeniden basımıdır ve bunların İngiliz Crown telifi ya da anonim eser süresi de dolmuştur):

| Harekât alanı | Seri | Nerede taranmış |
|---|---|---|
| IL-2 Stalingrad, Moscow, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Doğu Avrupa 1:250.000 (1950'lerde Sovyet ve Alman haritalarından derlendi) | UT Austin PCL; bazı paftalar UT GeoData'da coğrafi referanslı |
| IL-2 Normandy, DCS Normandy 2 ve The Channel | AMS **M661** / GSGS 4250, Fransa 1:50.000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250.000 ve **M841** 1:25.000 (Almanya) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50.000 (1951 baskıları) ve **L552** 1:250.000 | ANU Open Research (L751 paftaları, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | İngiliz I. Dünya Savaşı siper haritaları (AMS değil) | McMaster University; National Library of Scotland (ticari olmayan koşullar) |

AMS paftalarının köşelerinde enlem ve boylam işaretleri vardır. Böylece her biri dört köşe uydurmasıyla yerleştirilir ve arazinin üzerine bir doku olarak serilir. Karolar gibi yerel olarak oluşturulur ve saklanır.

## Geliştiriciler için {#for-developers}

### Parquet tablosunda `geo` girdisi {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` ve `up`, (`lat0`, `lon0`) noktasındaki aynı teğet düzlükteki doğu ve kuzey metrelerini ve yüksekliği tutan sütunların adlarıdır. Yükleme, eşlemesi bu sütunları tam olarak aldığında referansı taşır (doğu X olarak, kuzey ve yükseklik Y ve Z olarak, her iki yönde de). İsteğe bağlı `dcs` girdisi, bir DCS tablosunun kendi metrelerini (x kuzey, y yukarı, z doğu) ve harekât alanını adlandırır. Bu sütunları eşleyen bir yükleme, bunun yerine harekât alanının Transverse Mercator projeksiyonuyla yerleştirilir ([DCS koordinatları](#dcs-coordinates)). `geo` olmayan bir tablo, eskisi gibi okunur.

### DCS koordinatları {#dcs-coordinates}

Her DCS harekât alanı, kendi merkezi meridyeni ve sahte orijini olan bir Transverse Mercator projeksiyonudur (WGS84, ölçek 0,9996). DCS x kuzey ekseni, z doğu ekseni olarak alınır. Sabitler, pydcs'nin yayımladığı sabitlerdir. Matematik, altıncı dereceye kadar Krüger serisidir (Karney 2011), [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts) dosyasına taşınmıştır. DCS metreleri için bir arka plan doğrudan bunlarda kurulur. Böylece `dcs_x`/`dcs_y`/`dcs_z` ile eşlenen bir Watcher DCS tablosu, DCS arazi dönüştürücüsünün yazdığı bir bölüm ve arka plan hepsi aynı çerçeveyi paylaşır. Iraq'ın sabitleri yayımlanmamıştır. Yayımlanmış referans noktalarına uydurulmuştur (4 cm kök ortalama kare).

Watcher'ın DCS tabloları, harekât alanının sabit referans noktasında bir teğet düzlüktedir (harekât alanı seçicisinin kullandığı nokta). Bu yüzden aynı harekât alanındaki birkaç görev, referansını koruyarak birleşir ve bir harekât alanı arka planıyla hiç kaymadan hizalanır.

### Sadeleştirme ve bütçe {#simplification-and-budget}

- 20 m²'den küçük binalar atılır. Kutu 30 km'den geniş olduğunda 60 m², 80 km'nin ötesinde 150 m². Kalanlar en büyükten başlayarak, binalar 1,5 milyon üçgene ulaşana kadar eklenir.
- Küçük yollar, servis yolları ve patikalar 60 km'den geniş alanlarda atılır. 150 km'nin ötesinde yalnızca otoyollar, ana, birincil ve ikincil yollar kalır.
- Bütün arka plan yaklaşık 3 milyon üçgenin altında kalır. İçe aktarma notu, kaç binanın dışarıda bırakıldığını söyler.
