---
title: "Taktik tahtası"
nav_order: 15
has_children: true
lang: "tr"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Taktik tahtası

**Taktik** sekmesi bir takım planı için bir çizim tahtasıdır: bir haritanın üzerine küçük figürler koyarsınız, nereye gideceklerini gösteren oklar çizersiniz ve olmasını izlemek için oynatırsınız. Oynamadan önce bir tur ya da bir saldırıyı planlamak için kullanın. Kamerayı, tuvali ve [seviyeyi](levels.md) diğer sekmelerle paylaşır, başka hiçbir şeyi paylaşmaz; bir plan veri değildir ve hiçbir ısı çizmez.

## İlk planınız {#your-first-plan}

1. **Taktik** sekmesini açın. **Oyun** seçin (örneğin Counter-Strike 2) ve Valorant için **Valorant haritalarını yükle**'ye basıp bir **Harita** seçin. Ya da önce bir [seviye](levels.md) yükleyin.
2. Bir **Taraf** seçin (renk verir) ve **Üstten görünüm**'e basın.
3. **Yer**'i seçin, **Figürler** içinden bir figür seçin (birini bulmak için **Figür ara**'yı kullanın) ve haritaya tıklayın. İki ya da üç tane yerleştirin.
4. **Ok**'u seçin, bir figüre tıklayın, gitmesi gereken yol boyunca tıklayın ve oku bitirmek için **Enter**'a basın.
5. Görünümün altındaki **+**'a basarak 2. adımı ekleyin. Her figür, okunun bittiği yerden başlar. Orada daha fazla ok çizin.
6. Gösterilen adımdan sona kadar planı oynatmak için **▶**'ye (ya da `K`) basın.
7. **Plan adı**'nda planı adlandırın ve **Kaydet**'e basın.

![Üstten görünümde Taktik sekmesi: solda oyun, taraflar ve araçlar; Taşı okları olan üç figür, bir duman Atış yayı, bir Alan ve altta adımlar](../assets/img/en/tactics.webp)

## Plana başlamak {#starting-a-plan}

| Denetim | Ne yapar |
|---|---|
| **Oyun** | Paletin sunduğu tarafları ve figürleri seçer: Counter-Strike 2 (T, CT; oyuncular ve yardımcı öğeler), Valorant (Saldırı, Savunma; oyuncular ve genel yetenekler), Battlefield, Squad, Arma (piyade, kara araçları, uçaklar, botlar), DCS / War Thunder / IL-2 (jetler, pervaneli uçaklar, helikopterler, hava savunma, kara, gemiler, silahlar) ve Diğer. Zaten figürleri olan bir plan, oyun değiştiğinde taraflarını korur. |
| **Plan adı** | Planın kaydedildiği ad. |
| **Harita**, **Valorant haritalarını yükle** | Valorant seçiliyken: **Valorant haritalarını yükle** harita listesini [valorant-api.com](https://valorant-api.com) adresinden alır; **Harita** ardından seçilen haritanın mini haritasını seviye olarak koyar ve üstten çerçeveler. Görsel seçildiğinde alınır ve asla gönderilmez. Ekranda olduğu sürece Riot'un bildirimi gösterilir (aşağıya bakın). |
| **Taraf** | Sonraki figürün, okun ya da alanın ait olduğu taraf; tarafın rengini alır. |

Seviye yokken tahta düz zemin düzlemidir. Gerçek bir haritada planlamak için **Seviye** altında bir seviye yükleyin: CS2 aracıyla dışa aktarılmış bir CS2 haritası, kitaplıktan bir seviye ya da bir harita görseli.

## Araçlar {#tools}

| Araç | Tıklama | Notlar |
|---|---|---|
| **Seç** | Bir figür, bir ara nokta, bir ok, bir alan ya da bir not seçer. | Shift+tıklama ekler ya da çıkarır; Shift+sürükleme, eklenecek şeyin etrafına bir kutu çizer. Seçime bir dönüşüm tutamacı gelir (aşağıya bakın); `Delete` ya da `Backspace` kaldırır. `M` seçili figürü bir sonraki tıklamaya taşır. |
| **Yer** | Seçilen figürü koyar. | Figür, **Figürler** paletinden (**Figür ara** ile) seçilir. Hiçbir şey seçili değilken, `R` bir sonraki figürü yerleştirilmeden önce 15° döndürür (`Shift+R` tersi yönde). |
| **Ok** | Her tıklama bir nokta ekler; Enter, çift tıklama ya da sağ tıklama bitirir, Esc bırakır. | **Taşı**, **Saldırı** (daha geniş uç) ya da **Gözetle** (göz hizasında ince bir çizgi). Bir figürden başlayan bir ok, o figürün bu adımdaki rotasıdır: oynatıldığında figür onu yürür ve sonraki adım bittiği yerden başlar. |
| **Atış** | Atan, sonra nereye düştüğü. | Biri ile diğeri arasında kesikli bir yay ve seçilen yardımcı öğe (duman, flaş, molotof, ...) düştüğü yerde belirir ve bu adımdan itibaren kalır. |
| **Alan** | Orta, sonra kenar. | Tarafın renginde bir disk. |
| **Not** | Notun gideceği yer; metnini ister. | Bir iğne ve üstünde metni olarak gösterilir. |
| **Sil** | Bir figür, ok, alan ya da not. | Bu adımdan itibaren kaldırır; ilk adımındaysa tamamen kaldırır. |

**Geri al** ve **Yinele** (`Ctrl+Z`; `Ctrl+Y` ya da `Ctrl+Shift+Z`) her değişikliği adım adım gezer. Planın altındaki bir çizgi kaç figür, ok ve adımı olduğunu gösterir. **Üstten görünüm** doğrudan aşağı bakar (dik izdüşüm), **3B görünüm** perspektife döner, **Kare** planı sığdırır; plan boşsa seviyeyi.

**Figür boyutu** tahtadaki her figürü ölçekler; 1× gerçek boyuttur, yukarıdan bakıldığında bir kişi için birkaç piksel eder.

## Taşıma, döndürme ve ölçekleme {#moving-turning-and-scaling}

Tahtadaki her şey bir 3B editördeki gibi taşınabilir: figürler, yardımcı öğeler, işaretçiler, tek tek ara noktalar ve bütün oklar, alanlar ve notlar. Seçili olan şeyin ortasına bir tutamaç gelir:

| Mod | Tuşlar | Tutamaçlar |
|---|---|---|
| **Taşı** | W (ya da G) | Eksen başına bir ok (X kırmızı, Y yeşil ve yukarı, Z mavi) onun boyunca taşır; bir kare düzlemi boyunca taşır; merkez, imlecin altındaki seviyenin üzerinde taşır. |
| **Döndür** | E (ya da R) | Eksen başına bir halka onun etrafında döndürür. Tek bir figürün halkaları kendi sapma, eğim ve yalpasıdır; bir grup, ortasında dünyanın eksenleri etrafında döner. |
| **Ölçekle** | R (ya da S) | Seçimi ortasından bir eksen boyunca ya da her yöne yayar veya toplar; bir alanın yarıçapı onunla birlikte büyür. |

**Tuşlar** W / E / R (Unity, Unreal) ile G / R / S (Blender) arasında geçiş yapar; tuşlar yalnızca bir şey seçiliyken modu seçer, aksi halde kamerayı uçurur. Yani `R`, bir şey seçiliyken W / E / R tuşlarıyla **Ölçekle** ve G / R / S tuşlarıyla **Döndür** demektir; hiçbir şey seçili değilken yerleştirilecek bir sonraki figürü döndürür. Tüm tahta tuşları [klavye başvurusunda](keyboard-reference.md#tactics-board) listelenmiştir. Taşırken **Ctrl**'yi basılı tutarak bir taşımayı **Izgara**ya (metre) ya da bir dönüşü **Açı adımı**na oturtun. **Zemine yapıştır** (varsayılan açık) taşınan insanları, araçları, işaretçileri, ara noktaları ve alanları seviyenin yüzeyine koyar; uçaklar ve helikopterler yüksekliğini korur ve Y okunun boyunca yapılan bir sürükleme asla yapışmaz. Bir tutamacı sürüklemek kamerayı asla taşımaz. **Esc** bir sürüklemeyi iptal eder; her değişiklik Geri al'da bir adımdır.

Ara noktalar, gösterilen adımın oklarında noktalar olarak görünür: birini seçmek için tıklayın, taşımak için sürükleyin, çıkarmak için Delete. **Seçili** bölümü seçimin metre cinsinden yerini, bir figürün sapma, eğim ve yalpasını derece olarak ve bir alanın yarıçapını, her biri yazılabilir olarak gösterir.

## Zamanlama {#timing}

Bir figürün rotası zamanlanır: her bölüm, seviye üzerindeki uzunluğu kadar sürer - yüzeyde her birkaç metrede bir örneklenir, böylece iki nokta arasındaki bir tepe ya da merdiven sayılır - o oyunda o figürün hareket **modunun** hızıyla, artı bir ara noktada herhangi bir **bekleme**. Piyade sürünür, çömelir, yürür (sessiz), koşar ya da sprint atar; araçlar ve botlar sürünür, ihtiyatla, normal ya da acele ile gider; uçaklar ve helikopterler yavaş, seyir, muharebe hızında ya da azami hızda uçar. Oyunun sahip olmadığı bir mod (CS2'de sprint yoktur) en yakın sahip olduğunu alır. Bir eğimin nasıl yavaşlattığı oyuna bağlıdır: CS2 ve Valorant'ta oyunlardaki gibi yalnızca yatay mesafe sayılır; askerî simülasyonlar piyadeyi yokuşta (Tobler'in yürüyüş fonksiyonu) ve araçları eğime göre yavaşlatır.

Hızlar, kaynaklarıyla birlikte oyuna özgü tablolardan gelir (bkz. [Hareket hızları](tactics-speeds.md)): CS2 taşınan silaha göre, oyunun silah tanımlarından; Valorant silaha göre; Battlefield, Squad, Arma ve hava oyunları araç türüne ve sınıfına göre. **Şu gibi hareket eder** bir figürün profilini seçer (bir silah, bir araç türü); **Kendi (m/s)** o figür için herhangi bir modu geçersiz kılar. Modlar tahtanın gösterdiği adlarla anılır: *Sürünme*, *Çömelme*, *Yürüme (sessiz)*, *Koşu*, *Sprint*; *Temkinli*, *Normal*, *Rush*; *Yavaş*, *Seyir*, *Çatışma*, *Azami*.

Her ara nokta, bir öncekinden olan süreyi ve planın başlangıcından geçen süreyi gösterir ("+3,9 sn · 0:12"). Seçili figürün rotası her bölümü modu, uzunluğu ve süresi, beklemesi ve varışıyla listeler. **Zamanlama** altındaki **Varışlar**, rotası olan her figürü tek bir zaman çizgisine koyar; ilk varış en üstte. **Gerçek zamanlı oynat** (varsayılan açık) ile bir adım, en yavaş rotanın varışına kadar sürer ve her figür kendi hızında hareket eder; **Saniye** o zaman adımın en kısa uzunluğudur. **Metre başına seviye birimi** seviyenin neyle ölçüldüğünü söyler: CS2 haritaları için 39,37 (oyun birimleri), metre haritaları için 1.

## Maç verileriyle karşılaştırma {#compare-with-match-data}

**Maç dosyalarını yükle…** haritanın CS2 maç tablolarını okur (CS2 aracının Parquet dosyaları, istediğiniz kadar; yalnızca gerekli sütunlar, arka planda); **Yüklenen verileri kullan** görüntüleyicide yüklenen veriyi alır. Ardından:

- **Haritada en erken varış**, haritayı, bir oyuncunun her noktaya ilk ulaştığı tur başlangıcından bu yana geçen süreye göre renklendirir - **En hızlı** düğmesi tüm turlar üzerinden en hızlıyı, **Tipik (medyan)** ortanca turu gösterir - erken için yeşil, geç için kırmızı; bir taraf ya da ikisi için. Neyin ne zaman mümkün olduğunu gösterir.
- Seçilen rota, oyuncuların başlangıcından (ya da turun başlangıcından) bitişine kadar başardıklarıyla karşılaştırılır; her uç, ayarlanan yarıçapta bir disk olur: "Gözlenen en hızlı 14,2 sn, p10 15,0 sn, medyan 18,3 sn, 41 koşu üzerinden; planınız 15,1 sn".
- Oyuncuların gerçekte hareket ettiği hızlar - koşarken, yürürken, çömelirken; tablolardaki yürüme ve eğilme sütunlarından - m/s olarak.

## Adımlar {#steps}

Görünümün altındaki çubuk adımları tutar. Bir plan bir adımla başlar; **+** bir tane ekler ve her figür, son adımdaki rotasının bittiği yerden başlar; **−** gösterileni kaldırır. **Saniye**, gösterilen adımın oynatıldığında ne kadar sürdüğüdür. **▶** (K) gösterilen adımdan sona kadar oynatır: rotası olan figürler onu yürür, sonraki adımda yeni bir yere taşınan figürler oraya kayar, geri kalanlar durur. Bir adım gösterilirken, her figürün sonraki adımdaki yeri soluk bir hayalet olarak çizilir ve son adımın okları bu adımın altında hafifçe görünür.

## Kaydetme {#saving}

**Dosya** bölümü **Kaydet**, **Aç** ve **Temizle**'yi tutar. **Kaydet** planı `<name>.h3dplan.json` olarak yazar (düz JSON: taraflar, adımlar, her adımda bir yeri olan figürler, oklar, alanlar, notlar); **Aç** birini geri okur. Başka bir sürümün ya da bir plan olmayan bir dosya nedeniyle birlikte reddedilir. **Temizle** planı boşaltır; Geri al onu geri getirir.

## Figürler {#figures}

Her figür görüntüleyicinin kendisi tarafından yapılır: bir türün yayımlanmış boyutuna kadar basit şekiller, komşularından ayıran özelliklerle - bir tankın yol tekerlekleri ve tareti, bir hava savunma aracının topları, füzeleri ve radarları, bir uçağın kanat planı, kuyruğu ve motorları, bir helikopterin rotorları ve kısa kanatları. Hiçbir oyundan alınmaz. Bir oyunun icat ettiği bir tasarım, sınıfının genel figürü olarak gösterilir. Verinin figürünü nasıl bulduğu için bkz. [Figürler](figures.md#which-figure-a-unit-gets).

## Riot'un bildirimi {#riots-notice}

Valorant haritaları, Riot Games'in "Legal Jibber Jabber" politikası kapsamında gösterilir; bu politika ücretsiz topluluk projelerinin bunları kullanmasına izin verir ve nerede göründüklerinde bu bildirimi ister: *3DHeat, Riot Games'in "Legal Jibber Jabber" politikası kapsamında, Riot Games'e ait varlıklar kullanılarak oluşturulmuştur. Riot Games bu projeyi onaylamaz ya da sponsor olmaz.* Tahtadaki yetenekler Riot'un sanatı değil, genel şekillerdir.
