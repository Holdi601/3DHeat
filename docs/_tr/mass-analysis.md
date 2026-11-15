---
title: "Toplu analiz"
nav_order: 8
lang: "tr"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Toplu analiz: aynı anda binlerce maç

**Toplu analiz**, bütün bir maç klasörünün neye vardığını gösterir: hangi araç en çok kazanıyor, hangi taraf kayırılıyor, eylem nerede. İzleyebileceğinizden çok daha fazla maçınız olduğunda kullanın.

Her maçın küçük bir özetinden çalışır, bu yüzden bin ya da on bin maç hızla açılır. Tam satırları yalnızca tıkladığınız maçlar için yükler.

## Deneyin {#try-it}

1. Isı haritası kenar çubuğunda **Toplu analiz**i açın.
2. **Klasör...** (ya da **Dosyalar...**) düğmesine basın ve `.3dheat` maçlarınızı seçin.
3. Panel özetleri okurken bekleyin ("Özetler... N / M").
4. **Analizi aç** düğmesine basın. Sekmeli bir pencere açılır.
5. Filtreleri ayarlayın (Oyun, Harita, Mod, Nereden, Nereye), sonra bir sekmeyi okuyun, örneğin Denge.
6. Bir satıra, bir hücreye ya da bir içgörüye tıklayın: maçları 3B görünüme yüklenir, kamera yerin üzerinde olur.

![Denge sekmesi: araca göre kazanma oranı ve ölüm başına öldürme](../assets/img/en/mass-balance.webp)

```
.3dheat klasörü -> özetler -> pencere (sekmeler) -> bir satıra tıkla -> maçlar 3B'de açılır
```

Bir `.3dheat` dosyası bir maçtır ([Maç başına bir dosya](container.md)). *Isı haritası* ve *satır* [sözlükte](glossary.md) açıklanmıştır.

## Özetleri almak {#getting-the-summaries}

Çoğu kişi için yapılacak bir şey yoktur: panel eksik özetleri kendisi hesaplar. Büyük bir klasörü bir kez hazırlamak için aşağıdaki çevrimdışı aracı kullanın.

Her `.3dheat` maçı bir özet alır (`src/mass/summarize.ts`); bu, kapsayıcıda `<maç>.summary.json` üyesi olarak tutulur (rol `summary`, bkz. [Maç başına bir dosya](container.md)). Çevrimdışı araç bunları yazar ve klasör başına bir dizin. Bu bir geliştirici aracıdır; paneli işten kurtarmak için büyük bir klasörde çalıştırın:

```
node tools/3dheat-summarize.mjs <klasör>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Zaten özetlenmiş bir maç (aynı biçim sürümü) yalnızca okunur; `--force` onu yeniden hesaplar. `--no-write` kapsayıcılara dokunmaz.
- Son `--settle` dakikasında (10) değişen bir dosya dışarıda bırakılır: bir dönüştürücü hâlâ yazıyor olabilir.
- `<klasör>/3dheat-index.jsonl.gz`: her maç için bir satır — yolu, boyutu, zamanı ve ızgarasız özeti. `<klasör>/3dheat-index.grids.jsonl.gz`: her maç için ızgarasıyla birlikte bir satır.
- Aracı dosyaların bulunduğu makinede, düşük öncelikle çalıştırın (örneğin Linux'ta `nice -n 19 ionice -c3`).

Panel her maç için şunlardan ilkini alır: klasörün dizin satırı (aynı yol ve boyut), tarayıcının önbelleği (IndexedDB, ada, boyuta ve zamana göre), kapsayıcının `summary` üyesi ya da bir işçi havuzunda hesaplanıp önbelleğe alınmış bir özet. Yani dizini olmayan bir klasör de çalışır — ilk seferde tabloları okuma hızında, sonrasında önbellekten.

## Panel {#the-panel}

Bir klasör seçin (ya da dosyalar; **Klasör ekle...** bir başkasını katar). Pencerede **Oyun**, **Harita**, **Mod**, **Nereden** ve **Nereye** filtreleri, bir **Ayırma ölçütü** seçeneği, **En az can** ve **Yalnızca oyuncular** ile şu sekmeler bulunur. Her sayı özetlerden gelir; bir satıra, bir hücreye ya da bir içgörüye tıklamak, maçlarını görünüme çoklu-maç bindirmesi olarak yükler; onu gösteren filtrelerle (araç, sınıf, silah, takım, oyuncu) ve kamera yerin üzerinde:

| Sekme | Ne |
|---|---|
| Genel bakış | maçlar, saatler, oyuncular, canlar, satırlar, tarihler; güne göre maç; oyuna, haritaya, moda göre; olay toplamları; para birimine göre ekonomi; maçta olayların ne zaman olduğu |
| Denge | araca, sınıfa, silaha ya da takıma göre; haritaya, moda, kademeye ya da oyuna göre bölünmüş: ~%95 aralığıyla K/D, kazanma oranı (Wilson), hayatta kalma, dakika başına öldürme ve isabet, dakika başına kazanç ve q — K/D ve kazancın, bölünmenin geri kalanına karşı Benjamini-Hochberg yanlış keşif oranı. **En az can** güvenilmeyecek kadar az canı olan satırları gizler; **Yalnızca oyuncular** görevin YZ'sinin sürdüğü şeyleri dışarıda bırakır |
| Eğilimler | kullanım (varlık payı), en iyi araçların ya da sınıfların K/D'si ya da kazanma oranı, gün, hafta ya da ay bazında |
| Oyuncular | ayrı oyuncular, oyuncu başına maç, maç başına oyuncu, en sık oyuncular |
| Taraflar | her haritanın her tarafı: eşit bir paylaşımın üzerinde kazanılan maçlar |
| Yakın çatışma | tur verisi: tarafa göre açılış düellolar ve bunların dönüşümü, takaslar, bekleyen ile tutan, çapraz ateşler, kör edilmiş girişler, nişan, kurulumlar, adam avantajı ve **Haritaya göre**, oraya giren oyuncuları öldüren yerler — her biri bir pay olarak Wilson aralığıyla, özetlerin `cqb` sayılarından ([Yakın çatışma ve turlar](close-quarters.md)) |
| R6 yüzeyleri | Rainbow Six Siege'in seviyedeki izleri (kurşun delikleri ve benzerleri) seviye yüzeyi başına: izler, haritanın turu başına, oda, atıcısı belirlenmiş olanların payı; bir tıklama iz türlerini, atıcıların operatörlerini ve silah sınıflarını ve izlerin yüzeyde nerede olduğunu açar (çeyrek metrelik hücrelerden küçük bir ısı); bir yüzey, bir harita sürümünün maçları boyunca kimliğini korur. Özetlerin `marks` sayılarından |
| Harita | bir haritanın toplanmış ızgarası: varlık, öldürmeler, ölümler, K/D, her olay, akış ve **kaç maçta sıcak** (kararlılık); takıma göre, hücrenin 1, 2, 4 ya da 8 katında |
| Yerler | sayılarda öne çıkan ama ısıda öne çıkmayan yerler (geniş bir alan bütün olarak yoğun, koridorlar, yükseklik bantları) ve tutanların turlarını daha çok ya da daha az kazandığı yerler; **Yer bul** |
| Nişler | geri kalandan belirgin şekilde daha iyi ya da kötü yapan gruplar (bir haritada bir araç, bir yükseklikte bir sektör) ve taraflarının aynı maçlarda kazandığının ötesinde kazanılan tur grupları; **Niş bul** |
| İçgörüler | toplu dedektörler ve harita dedektörleri (aşağıda); **Raporu kopyala (JSON)** bir dil modelinin okuduğu JSON'u verir |

## Birçok maç üzerinde içgörüler {#insights-over-many-matches}

**Yerler** sekmesi, sayılarda öne çıkan ama ısıda çıkmayan yerleri bulur — bütün olarak yoğun geniş bir alan, bir koridor, bir yükseklik bandı, maçın yalnızca bir bölümünde yoğun bir yer — düz ısının göstermediklerini **gizli** olarak işaretler ve 3B görünümde ana hatlarını çizer; **Yükle** oraya, tuttuğu maçlarla birlikte uçar. **Nişler** sekmesi geri kalandan belirgin şekilde daha iyi ya da kötü yapan grupları (bir haritada ve tarafta bir araç, bir yükseklikte bir sektör) bulur; birine tıklayarak inceliklerini görün.

### Kim kazandı {#who-won}

Maçlar her turu kimin kazandığını söylüyorsa (`won` [sonuç sütunu](data-formats.md#outcome-columns)), sonuç kendi başına bir hedef olur:

- **Yerler: kazanma oranı.** Her taraf için, bir yerdeki turlarından kazandığı pay, aynı maçta herhangi bir yerde kazandığı paya karşı — böylece haritanın, tarafın ve maçın kendi dengesi temel olur ve yalnızca tutanların turlarını daha çok (ya da daha az) kazandığı yerler öne çıkar. Uydurma bir örnek: *"Dust: T tarafı buradayken turlarının daha çoğunu kazanıyor: 412 turun %61'i kazanıldı, aynı maçlardaki kendi oranından beklenen %49'a karşı (oran 1,6x; 31/48 maçta tutuldu)."* Her yerdeki aynı yanlış keşif oranı ve kararlılık denetimleri; **Yükle** tutulduğu maçları yükler ve o tarafın konumlarını gösterir.
- **Nişler: tur kazanma.** **Turlar** tablosu her canın turunu tutar: harita, taraf, maçın bölümü (1-4, 5-8, ... turlar), araç (bir operatör, bir ajan), en çok kullandığı silah, en uzun tuttuğu yer, satın alma (eco, force, full) ve tarafının ilk öldürmeyi yapıp yapmadığı. Bir grup, tarafının aynı maçlarda kazandığına karşı değerlendirilir; bu yüzden *Dust'ta AWP ile T* ancak bu turlar o maçlardaki T'nin diğer turlarından daha sık kazanıldıysa bir niştir. Uydurma bir örnek: *"m1 · T · AWP: 320 turun %80'ini kazanıyor, aynı maçlarda aynı taraflardan beklenen %62'ye karşı (oran 2,3x; 40 maç)."* Artış çarpı destek ile sıralanır; **Yükle** turları bunu en çok gösteren maçları yükler.

İkisi de sürüm 2 özetlerine ihtiyaç duyar (bkz. [Özetleri almak](#getting-the-summaries)): eskileri yeniden hesaplanır.

**İçgörüler** sekmesi, tüm maçlar üzerinden, geri kalana göre daha iyi ya da kötü takas eden ya da kazanan araçları, sabit bir pay maçta sıcak olan yerleri, eşit paylaşımın üzerinde kazanan tarafları, kullanımı tarihlerle değişen araçları ve eşit dağılımdan daha fazla öldürme tutan maç bölümlerini bulur. Her bulgu sayılarını, etkisini, aralığını ve yanlış keşif oranını (%5'te tutulan) taşır; tıklamak maçlarını yükler. Ayrıntılar: [Geliştiriciler için](#for-developers).

## Ölçek {#scale}

Bunun küçük bir sürümünü kendiniz tekrarlayabilirsiniz: `node tools/demo-data.mjs` 150 sentetik tank maçını `tools/.shots/demo/mass` klasörüne yazar (her biri yaklaşık 1.000 satır). Masaüstü bir PC'de, `tools/demo-data.mjs`'in bu 150 sentetik demo maçında ölçüldü (gerçek bir maç çok daha büyüktür):

- 4 işçiyle `tools/3dheat-summarize.mjs`: 150'nin hepsi için 2,6 ila 4,8 s, işçi içinde maç başına 8 ila 21 ms; yalnızca özetleri okuyan ikinci bir çalıştırma yaklaşık 2 s.
- Dizini mevcutken klasörü panelde açmak, pencere görünene kadar: 0,9 ila 1,6 s (işçinin kendi kısmı, 150 dizin satırını okuma, 20 ila 40 ms).
- Bir sekmeye geçmek, tablosu çizilene kadar: Genel bakış 10 ila 30 ms, Denge 30 ila 70 ms, Eğilimler 30 ila 45 ms, Oyuncular 15 ila 35 ms, Taraflar 15 ila 20 ms, Harita 55 ila 130 ms.
- Depo 150 maçı yaklaşık 0,5 MB'de tutar.

Pencereyi açmak tek bir kısa kare alır: seçilen dosyalar işçiye 16'şar gider, tarih alanları ve ilk sekme bir kare sonra gelir.

Depo maç başına yaklaşık 15 KB tutar; yani 10.000 maç işçide yaklaşık 150 MB tutar. Izgaralar, harita için istenenden fazla hiçbir zaman tutulmaz.

## Geliştiriciler için {#for-developers}

### Birçok maç üzerinde içgörüler {#insights-over-many-matches}

`src/mass/detect.ts` — her bulgu, sayıları, etkisi ve aralığı, p ve q (Benjamini-Hochberg, denenen her şey üzerinden, %5'te tutulur), maçlarını yükleyen derinlemesine inceleme ve değerleriyle bir cümle anahtarı; rapor (`heat3d.mass/1`), `massReportForModel`'in bir anlatıcıya verdiği şeydir, tek maç raporuyla aynı biçimde (`insights/seam.ts`).

| Dedektör | Bulduğu |
|---|---|
| `balance` | bir oyuncu aracının bir haritada ya da bir modda, geri kalana göre daha iyi ya da kötü takas edip kazandığı |
| `hotspot` | bir sabit maç payında sıcak olan yerler (sıcak olan maçlar / görülen maçlar, haritanın diğer hücrelerine karşı) — yalnızca toplamda sıcak olmak değil |
| `side` | bir haritanın bir tarafının eşit paylaşımın üzerinde kazanması |
| `meta` | bir aracın oyuncu canları içindeki payı ya da K/D'sinin, tarihlerin önceki ve sonraki yarısı arasında kayması — yeterince büyük, çeyreklere göre eğilimli, çoğu haritada aynı yönde (aşağıda) |
| `phase` | maç uzunluğunun bir bölümünün, eşit dağılımdan daha fazla öldürme, isabet, fırlatma... tutması |
| `place` | çok maç üzerinde öne çıkan yerler (B Aşaması, aşağıda): bir bölgenin oranı ya da öldürme payı, her maçın kendisine karşı; daireler, koridorlar, büyütülmüş bölgeler, yükseklik bantları, aşamalar; düz ısı göstermediğinde gizli |
| `niche` | belirgin şekilde daha iyi ya da kötü yapan gruplar (B Aşaması, aşağıda) |
| `grid.*` | her haritanın toplanmış ızgaraları üzerinde tek veri kümesi dedektörleri (güç konumları, sıcak ve sessiz bölgeler, sınıf yerleri): `GridMerge.toInsightJob` içgörü geçişinin ızgaralarını özetlerden doldurur; iz gerektiren dedektörler atlanır |

### Özet {#the-summary}

Düz JSON (`src/mass/types.ts`), maç başına sıkıştırılmış yaklaşık 5-30 KB:

- maç: oyun, harita, mod, görev, başlangıç, uzunluk, satırlar, canlar, oyuncular, YZ, takımlar (canlar, oyuncular, varlık, öldürmeler, ölümler, kazanılan, para), kazanan;
- araç ve takım başına: sınıf, kademe, canlar, oyuncu canları, varlık, kanonik türe göre olaylar, hedefin sınıfına göre öldürmeler, kazanılanlar, para;
- oyuncu başına (kullanıcı kimliğine göre, yoksa ada göre): takım, canlar, varlık, öldürmeler, ölümler, isabetler, fırlatmalar, kazanılan, araçlar; silah başına: türe göre olaylar;
- bir sonuç sütunuyla (sürüm 2): takım, araç (`rw`, her biri bir can ve bir tur), oyuncu ve silah (bir tarafın onu kullandığı turlar) başına kazanılan ve oynanan turlar; her canın turu (`outcome.u`: tur, taraf, araç, en çok kullandığı silah, en uzun tuttuğu yer, satın alma, kazandı) ve her turun numarası, kazananı ve ilk öldürmesinin tarafı (`outcome.r`);
- ekonominin sütunları (`cost_*`, `earn_*`) ve toplamları;
- aşamalar: maç uzunluğunun 20 bölmesinde ve dakikaya göre türe göre olaylar;
- davranış: maçın toplu davranış ölçüleri (hizalanma, rota sürüklemesi, şeritler, kalabalıklaşma, liderler, geride kalanlar, kırılma noktası, kayıplardan sonra risk, seriler, satın alma uyumu, bastırma), her birinin kendi boş modeli, p ve q ile — bkz. [Toplu davranış](collective-behaviour.md);
- ızgara (aşağıda).

Görüntüleyicinin saydığı gibi sayılır: sütunlar çok maçlı yükleyicinin bulduğu gibi (`leanSpec`), olaylar `data/canonical.ts` ile; bir Tacview silahının öldürmesi nişancısına sayılır; aynı anda iki kez söylenen bir ölüm (`dead`, `death`) bir kez sayılır.

#### Izgara: B Aşamasının dayandığı şey {#the-grid-what-stage-b-builds-on}

Mekansal kısım, yalnızca ısı resimleri için değil, her boyut ve şekilde bölgeler üzerinde tarama istatistikleri için yapılmıştır:

- **Bir piramit.** Hücreler, dünya birimlerinde (x, z görüntüleyicinin yerleştirdiği gibi) hizalanmış ikinin kuvvetleridir. `k` seviyesi, `ix >> k, iz >> k` ile toplanan hücrelerdir — tam, bir maç içinde ve farklı hücre boyutlarındaki maçlar arasında — ve herhangi bir bölge (bir kutu, bir çizgi boyunca bir koridor, bir halka) hücrelerin toplamıdır. En ince seviye, maçın sağlam kapsamına (varlığın %99'unu tutan hücreler) 128 hücrede sığar; dışındaki dağınık hücreler tutulur.
- **Her sayının yanında maruziyet.** Hücre başına varlık saniyeleri, takım başına (`pt`), araç sınıfı başına (`pc`) ve yükseklik bandı başına (`ph`), böylece bir bölgenin oranı, beklentisi ve oranı her alt grup için hesaplanabilir.
- **Yükseklik.** Maç tabanının (yüksekliğin %1'lik dilimi) üzerindeki bantlar: 3 m'nin altı, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, üstü; `floor`/`storey`/`deck` sütunu olan bir dosya bunun yerine katlarına göre bantlanır. `y` her hücrenin ortalama yüksekliği, `y0` en düşüğüdür (kendi katı, üzerindeki yükseklik için).
- **Olaylar** `[cell, kind, team, class, band, count]` demetleri olarak.
- **Sonuca göre turlar** (sürüm 2, bir sonuç sütunu ve iki ya da daha çok turla): `[cell, team, rounds won, rounds lost]` olarak `pw` — her tarafın hücrede bir saniye ya da daha uzun geçirdiği turlar, turdaki sonucuna göre.
- **Zaman dilimleri** kaba bir seviyede (bir kenarda 8 hücre), maç başlangıcından itibaren dakikaya göre: `[cx, cz, minute, kind, value]`, varlık saniyeleri `GRID_KINDS.length` türü olarak; maç aşamaları uzunluk üzerinde dakikalardır.
- Seyrek, sayılar tam sayı, saniyeler onda bire: olanların sınırladığı kadar.

### B Aşaması: yerler ve nişler {#stage-b-places-and-niches}

B Aşaması, sayılarda göze çarpmadan öne çıkanı arar: bütünüyle yoğun ama içinde hiçbir sıcak hücre olmayan geniş bir alan, az olayda tuhaf bir öldürme-ölüm oranı, bir koridor, bir yükseklik bandı, yalnızca maçın bir bölümünde var olan bir küme — ve belirgin şekilde geri kalandan daha iyi ya da kötü yapan gruplar (bir haritada ve bir tarafta bir araç, bir yükseklikte bir sektör). Tek bir **Yer bul** / **Niş bul** / **İçgörü bul** tüm dedektörleri çalıştırır; üç sekme raporu paylaşır.

#### Yerler (`src/mass/scan.ts`) {#places-srcmassscants}

Her haritanın maçları iki kez okunur, maç maç; bellek, en fazla 64 hücrelik bir ızgaranın (uzay-zaman taraması için 16) toplamlarını tutar, maçların kendisini asla değil.

- **Ölçüler.** Bir olayın varlığın saniyesi başına oranı — öldürmeler, ölümler, isabetler, fırlatmalar, ele geçirmeler, tüm birimler için, sınıf başına (en çok olaylı 4 tanesi), yükseklik bandı başına — ve öldürmeler ile ölümlerdeki öldürme payı (hepsi, taraf başına, bant başına) ve her tarafın **kazanma oranı**: hücredeki turlarının kazanılana karşı kaybedileni (`pw`); haritanın 8 ya da daha çok maçı olduğunda turlar sonuca göre sayılır. Hangi sınıfların ve tarafların geldiği başlıklardan (`planOf`).
- **Maç başına beklenti.** Her maçın kendi oranı, kendi varlığı üzerinden bir hücredeki beklentidir (maça göre tabakalanmış, kovaryatla düzeltilmiş bir Kulldorff taraması): birkaç kanlı maç ya da bir yoğun sunucu yer yaratmaz. Kazanma oranı için beklenti, tarafın o maçta kazandığı turların kendi payıdır; böylece haritanın ve tarafın dengesi hiçbir zaman bir yer olmaz. Bir bölgenin birkaç hücresindeki bir tur her birinde sayılır; bölgenin boyutunda ölçülen dağılım bunu taşır.
- **Aşırı dağılım.** Maçlar Poisson'un çok ötesinde ayrışır. Her maçın artıkları 1, 2, 4, 8, 16 hücrelik bloklarda toplanır; her blok boyutunun dağılımı (artıkların karesi bölü boş varyans, birleştirilmiş, en kötü %5 blok dışarıda bırakılmış) o boyuttaki bir bölgenin her testini ölçekler: bir kuasi-olabilirlik oranı, oranlar için Poisson, paylar için iki terimli.
- **Bölgeler.** 0,75 ila 18 hücre arası daireler; altı açıda, genişliklerinin 3 ve 6 katı uzunlukta, 3 ila 18 hücre arası elipsler (koridorlar; eksen içgörünün `place.path`'idir); en güçlü yerel Getis-Ord Gi* hücrelerinden hücre hücre büyütülen bölgeler, bölgenin z'si büyüdükçe (düzensiz şekiller) — maçların bir yarısında büyütülüp diğer yarısında test edilir, böylece büyütmenin serbestliği sahte yer maliyeti getirmez; her yükseklik bandı, haritanın diğer bantlarına karşı tüm harita üzerinden (küme sağlam); uzay-zaman silindirleri: uzunluğun beşte birinde ya da beşte ikisinde bir daire, maçın kendi olaylarının yer ve zamana göre kendi yayılımına karşı (uzay-zaman permütasyon taraması).
- **Test.** p kuasi-olabilirlikten; her haritada denenen her bölge üzerinden Benjamini-Hochberg (üç haritada 700.000 yaygındır), %5'te. Geçen şey budanır (güçlü bir bölgenin içinde çoğunlukla kalan bölge aynısını söyler), **kararlılığı** için yeniden okunur — onu gören maçlar, tuttuğu maçlar, beş katlamada maçların yönü — ve maçların kendi gösterdiği varyansta bir kez daha test edilir (küme sağlam, maçlar küme olarak, asla Poisson altında değil), yine BH. Bir taban üzerindeki sessiz yerler (haritanın doğuşlarının, kalkışlarının ve inişlerinin %2'si ya da daha fazlası) dışarıda bırakılır.
- **Etki.** Oran (ya da odds oranı), ampirik Bayes ile küçültülmüş (haritanın 2x2 bloklarına uydurulmuş bir gamma önceli), dağılımda ~%95 aralıkla; merkezde 1, 2 ve 4 hücrede Gi* ve yerel Moran.
- **Görsel belirginlik.** Bölgenin olayının düz ısısında zaten ne kadar göründüğü (görünümlerin çizdiği gibi, en parlak hücreye logaritmik ölçek): çevresindeki bir halkayla karşıtlığı (paletin onda biri zor görülür, beşte ikisi düz) ve fazlalığı taşıyan parlak bir tepe; bir oran asla ısıyla çizilmez, bu yüzden bir pay yarım sayılır. %35'in altı **gizli**dir. Sıralama: güç (etki 4 katında doyan, sessiz yerler 0,7'de) çarpı `1 - 0,7 x belirginlik` çarpı katlamaların uyumu.

**Yerler** sekmesi bunları listeler (varsayılan olarak yalnızca gizliler; haritaya, şekle, yöne göre); bir tıklama haritanın yerlerini 3B görünümde ana hatlarıyla çizer (`placeLines.ts`: motorun üst çizgileri, bir kez oluşturulur — gizli için macenta, düz için kehribar, sessiz için camgöbeği, seçileni tam; bir bant, tabanından tavanına bir kutu olarak) ve Harita sekmesinin tuvalinde; **Yükle** oraya uçar ve tuttuğu en çok 60 maçı, olayına (ve sınıfına) süzülmüş olarak yükler.

#### Nişler (`src/mass/niche.ts`) {#niches-srcmassnichets}

Üç tablo üzerinde ışın araması (genişlik 24, derinlik 3): **canlar** (oyuncuların canları: oyun, harita, mod, sınıf, araç, taraf, kademe, tarihlerin çeyreği, maç uzunluklarının üçte biri; K/D, kazanma, bir canın ölümü, saatte öldürme, dakikada kazanç), **yerler** (haritaya, moda, tarihlere, haritanın 4 x 4 sektörüne, sınıfa, tarafa, bantlara göre öldürmeler ve ölümler) ve **aşamalar** (sektör ve maçın beşte biri: K/D, varlık saatinde ölümler). Bir grup bütüne karşı maçlar küme olarak test edilir (maç başına artıkların sandviç varyansı), etkisi 20 sonuçluk bir önceyle küçültülmüş bir odds ya da oran oranıdır; 8 maçta 30 sonuç gerekir, bir iyileştirme üst grubundan %10 daha güçlü olmalıdır, sonucun hiç ya da tamamen olmadığı gruplar (onlar için kaydedilmemiş) dışarıda bırakılır. Tutulanlar: değerlendirilen her grup üzerinden %5'in altında BH, en az 1,25 küçültülmüş oran (ya da 1/1,25), beş katlamadan dördünün uyumu, yalnızca üst grubunu tekrarlayan bir iyileştirme değil. **Nişler** sekmesi bunları listeler; bir tıklama grubun her tek koşullu iyileştirmesini gösterir (gezgin), **Yükle** maçlarını yükler. Donanımlar henüz özetlerde yok.

Dördüncü tablo, **turlar** (`roundsTable`), hedef olarak turun sonucunu alır: bir canın turu başına bir satır — harita, taraf, maçın bölümü (1-4, 5-8, ... turlar), araç, en çok kullanılan silah, en uzun tutulan yer, satın alma, ilk öldürme ya da ilk ölüm — kendi maçında kendi tarafının kazanma oranına karşı değerlendirilir (Mantel-Haenszel'in tabakalı beklentisi: artık `won - e`, `e` tarafın maçtaki payı); böylece bir niş hiçbir zaman haritanın ya da tarafın dengesi olmaz. Kümeler maçlar olarak kalır. z'si kalibre edilir: aynı ışın araması, sonuçlar her maçın her tarafının turları arasında karıştırılarak (tarafın her maçtaki oranı korunur) sekiz kez çalışır ve bu boş z'lerin standart normalin ötesindeki yayılımı — koşul sayısı başına, ortadan (medyan / 0,674) ve kuyruktan (99. yüzdelik / 2,576), büyüğü, asla 1'in altında değil — gerçek olanları p'lerinden ve yanlış keşif oranından önce böler (ampirik boş, Efron 2004). Daha derin gruplar daha büyük ölçeği alır: ışın, büyük z'leri için seçilmiş grupların inceltmelerini tutar. Bir nişin tabanı kendi beklentisidir, artışı bunun üstündeki puanlardır ve artış çarpı turlarının karekökü ile sıralanır; kanıt ve katlarla desteklenir (`wracc` destek çarpı artıştır). En çok göründüğü maçları (`matchIds`) ve ayrıntıya inmek için bunların birkaç turunu (`rounds`, `[match, round]`) taşır.

#### Eğilimler pratik anlamlılıkla {#meta-shifts-with-practical-significance}

Karışık tarihlerde canlar üzerindeki iki terimli, neredeyse her değişikliği anlamlı buluyordu. `meta` şimdi küme sağlam test eder (her maçın canları bir küme), yalnızca 2 puan ve en az %25 kullanım kaymasını, 1,3 katı bir K/D kaymasını, tarihlerin çeyreklerinin aynı yönde eğilimini (Kendall'ın tau'su en az 0,5) ve birden çok haritadaki bir araç için çoğunda aynı yönü tutar. Düz testin neredeyse hepsini işaretlediği bir test kümesinde yalnızca birkaç kayma kalır.

#### Bir model için {#for-a-model}

`massReportForModel` her yere `region` (şekil, gizli, belirginlik, yükseklikler, aşama) ve her nişe `conditions` verir, ayrıca kaç bölgenin ve grubun denendiğini. Bilgi merceği yerleri öldürme bölgeleri ve yaklaşma yolları olarak okuyabilir: türleri `place.*` ve `niche.*`'tir.

#### Kontroller {#checks}

`scan.test.ts`, 240 sentetik aşırı dağılımlı maçta, 22 hücrelik bir dairede 1,6 kat ölüm oranlı yayılmış bir alan (her hücrede silik), bir koridor, bir yükseklik bandı ve yalnızca bir aşamada bir küme yerleştirir — hepsi bulunur, yayılmış olan gizli — ve sekiz boş kümeyi, her biri 60 maçlık, çalıştırır: yer yok. `niche.test.ts`, yerleştirilmiş bir araç x harita x taraf grubunu bulur ve beş boş tabloda hiçbir şey bulmaz. `outcome.test.ts` sürüm 2 özetini denetler (taraf, birim, oyuncu ve silah başına kazanılan turlar, `pw`, birim turları); tarafı turlarının %35 yerine %70'ini kazanan bir şerit yerleştirir (her maç kendi dengesiyle) — bulunur — ve şeritlerin hiçbir şey söylemediği, her biri 50 maçlık 20 boş küme çalıştırır: kazanma oranı yeri yok; bir haritada tarafının turlarını 30 puan daha çok kazanan bir AWP yerleştirir — maçları ve turlarıyla birlikte bulunur — ve her maçın kendi dengesi olduğu ve bir tarafın bir haritada daha güçlü olduğu, her biri 80 maçlık 30 boş küme çalıştırır: niş yok.
