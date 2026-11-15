---
title: "Dönüştürücüler her şeyi korur"
parent: "Veri alma"
nav_order: 8
lang: "tr"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Dönüştürücüler her şeyi korur

Bir tekrarı açmak için bu sayfaya ihtiyacınız yok. Oyun dosyalarını 3DHeat tablolarına çeviren araçları yazan kişiler ve bu tabloların neden bu kadar çok şey tuttuğunu bilmek isteyen herkes içindir.

Bir oyunun tekrarını, demosunu, günlüğünü ya da canlı telemetrisini görüntüleyicinin açtığı bir şeye çeviren her araç tek bir kurala uyar:

> **Kaynağın şimdi okunabilen her şeyini dönüştürün ve geri kalanını bütün olarak tutun, böylece orijinal dosya olmadan sonra da okunabilsin.**

Bir tekrar çoğu zaman bir oyun güncellemesinden, yeniden kurulumdan ya da dolu bir diskten sonra yok olur; canlı bir akış ise gönderildiği anda yok olur. Bir dönüştürücünün düşürdüğü şey kalıcı olarak kaybolur; bütün olarak tuttuğu şey, birinin onu anladığı gün çözülebilir. Bu yüzden bir dönüştürücü asla neyin kullanışlı olacağına karar vermez: çözebildiğini çözer, diğer her iletiyi, paketi, olayı, özelliği ya da satırı tablonun yanında değişmeden tutar ve kendi çıktısında her birinden ne kadarını okuduğunu ve ne kadarını yalnızca sakladığını söyler.

Bu sayfa, tüm dönüştürücülerin paylaştığı kuraldır: War Thunder, World of Tanks, World of Warships ve Squad tekrar dönüştürücüleri, CS2 demo dönüştürücüsü, arka plan izleyicisi (Dota tekrar çözücüsü ve her canlı uyarlayıcı), oyun kayıt aracının telemetri okuyucuları ve görüntüleyicinin kendi içe aktarmaları (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Görüntüleyicinin kendi okuyucuları [Tacview kayıtları](tacview-acmi.md) ve [Dosya yükleme](loading-files.md) sayfalarında anlatılır; tek dosyalı biçim [Maç başına bir dosya](container.md) sayfasındadır. Bir maç bir tablo, bir `match.json` ve yan dosyalar olur; isteğe bağlı olarak tek bir `.3dheat` dosyasında paketlenir. Her aracın README'sinde, o kaynak için neyin okunduğunu, neyin ham tutulduğunu ve neyin bulunmadığını ve nedenini listeleyen bir **Tamlık** bölümü vardır.

## Kaynağın her öğesi için üç yer {#three-homes-for-every-item}

Bir kaynağın tuttuğu her şey tam olarak üç yerden birinde biter:

| Yer | Oraya ne gider |
|---|---|
| **Çözülmüş** | Tablo (satır başına bir örnek ya da olay, görüntüleyicinin okuduğu sütunlar, bir satıra ait her diğer değer için ek sütunlar) ve maç belgesi `<match>.match.json` (bütün olarak maça ait her şey: ayarlar, kadrolar, sonuçlar, skor tabloları, öz denetim). |
| **Ham tutulan** | Tablonun yanında bir yan dosya: çözülmemiş ya da yalnızca kısmen çözülmüş her öğe, bütün ve değişmemiş olarak, türü, zamanı ve ait olduğu birim ya da varlıkla birlikte. |
| **Kullanılamıyor** | README'nin Tamlık bölümünde nedeniyle birlikte adlandırılmış: biçim onu taşımaz (bir istemci tekrarında diğer oyuncuların girdileri yoktur), kaynak onu hiç göndermez ya da okuması izin verilmez (korumalı bir süreç, anahtarı bize ait olmayan şifreli bir blok). |

**Kısmen** çözülmüş bir öğe hem çözülmüş *hem de* ham tutulmuştur: tablo anlaşılanı alır, yan dosya bütün öğeyi alır; böylece daha sonra daha iyi bir çözücü orijinal dosyaya ihtiyaç duymaz.

Dördüncü bir yer yoktur. Bir şeyi işe yaramaz göründüğü için, "muhtemelen" bir kopya olduğu için ya da büyük olduğu için düşürmek bir hatadır. Yalnızca tabloda inceltmeye izin verilir (60 yerine 2 Hz'de bir kamera), yan dosyada asla.

## Yan dosyalar {#sidecars}

Yan dosya, tablonun yanındaki ve adı tablodan alınan bir Parquet dosyasıdır:

```
<klasör>/<maç>.parquet              tablo
<klasör>/<maç>.match.json           maç belgesi
<klasör>/<maç>.<ne>.parquet         bir yan dosya
```

`<ne>`, bu listedeki bir kelimedir. Yeni bir dönüştürücü uyan kelimeyi seçer ya da buraya **ve** [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts) içindeki `SIDECAR_PARQUET`'e yeni bir tane ekler; böylece görüntüleyici bütün bir klasör yüklendiğinde onu dışarıda bırakır.

| `<ne>` | Tuttuğu | Kullanan |
|---|---|---|
| `messages` | bir ağ akışının paketleri, varlık metot çağrıları ve özellik güncellemeleri, bütün | War Thunder, World of Tanks, World of Warships |
| `flight` | uçak başına uçuş modeli girdileri, bütün | War Thunder |
| `packets` | varlık akışının dışında, bütün kareler ve ağ iletileri ya da kap parçaları | CS2, Dota 2, Squad |
| `events` | ayrıştırıcının verdiği gibi, bütün anahtarlarıyla oyun olayları | CS2 |
| `entities` | varlık ve özellik güncellemeleri, uzak çağrılar, açılan ve kapanan kanallar; bir çözücünün ihtiyaç duyduğu dışa aktarımlarla | Squad, Dota 2 |
| `props` | ayrıştırıcının okuduğu her varlık özelliği, her değiştiğinde | CS2 |
| `units` | konum tablosunun dışındaki birim başına durum | Dota 2 |
| `combatlog` | bir savaş günlüğü, her girdi her alanıyla | Dota 2 |
| `strings` | her dize tablosunun her girdisi | CS2, Dota 2 |
| `objectives` | ele geçirme bölgeleri ve hedefler, her değişiklik zamanıyla | War Thunder |
| `raw` | bir canlı akış: alınan her paket, satır, API belgesi ya da bellek okuması, bütün | izleyicinin oturumları (`heat.raw.parquet`), oyun kayıt aracının tur kaydedicileri (`<damga>_<oyun>.raw.parquet`), izleyicinin osu!, LoL ve Valorant tekrar dosyaları |

Görüntüleyicinin klasör yüklemesi, bu listedeki her `*.<ne>.parquet` dosyasını ve her `*.match.json`, `*.meta.json`, `*.summary.json` ile diğer JSON yan dosyalarını atlar; bunlardan birini tek başına açmak (yalnızca o dosyayı seçerek ya da bırakarak), onu herhangi bir tablo gibi yükler (bkz. [Dosya yükleme](loading-files.md)).

Bunlar, bir dönüştürücünün `--loose` ile yazdığı dosyalardır. Varsayılan olarak War Thunder, CS2 ve Tacview dönüştürücüleri bir maçın tablosunu, belgesini ve yan dosyalarını aynı adlarla tek bir dosyada, `<maç>.3dheat` içinde paketler (bkz. [Maç başına bir dosya](container.md)); burada anlatılan her şey her üye için geçerlidir.

### Sütunlar {#columns}

Her yan dosya satırı bir öğedir. Sütunlar, uygulanabilir oldukları sırayla şunlardır:

| Sütun | Tür | Ne |
|---|---|---|
| `time` | float64 | tablonun `time`'ıyla aynı saatteki saniyeler (ya da kaynağın tikleri saydığı yerde `tick`; o zaman ikisi) |
| `type` | string (sözlük) | öğenin ne olduğu, kaynağın kendi terimleriyle: bir paket türü, ileti kimliği, olay adı, özellik yolu, satır öneki |
| `name` | string (sözlük) | bilindiğinde adı (topluluk adı, sınıf adı), yoksa boş |
| `entity` / `unit` / `uid` / `player` | tamsayı ya da string | kime ait olduğu, tablodaki kimliklerle aynı; böylece yan dosyanın bir satırı bir izle birleştirilebilir |
| `decoded` | string (JSON) | bir şey varsa onun anlaşılanı; yoksa boş |
| `payload` | binary | öğenin baytları, bütün ve değişmemiş (ikili kaynaklar) |
| `text` | string | öğenin metni, bütün ve değişmemiş (metin kaynakları: bir günlük satırı, bir JSON nesnesi, bir anahtar-değer bloğu) |

Başka sütunlara da izin verilir (bir bit ofseti, bir boyut, bir kanal). Tekrar eden dizeler sözlük olarak kodlanır ve dosya zstd ile yazılır; böylece bir yan dosya tekrarın kendi boyutunun bir kesri kalır.

Bir yan dosya tek başına yeterli olmalıdır: sonradan yazılan bir çözücü orijinal tekrarı değil, yan dosyayı okur. Bir öğe bağlam olmadan anlaşılamıyorsa (bir varlığın sınıfı, bir dize tablosu, bir iletinin atıfta bulunduğu bir anahtar), bağlam da yan dosyaya ya da maç belgesine konur.

### Canlı kaynaklar {#live-sources}

Canlı uyarlayıcıların (UDP telemetrisi, paylaşılan bellek, bir oyunun günlüğü, yerel bir API) geri dönülecek hiçbir dosyası yoktur. Kaynağın gönderdiği **her alanı** kaydederler, henüz hiçbir şey kullanmayanları bile:

- bir paket akışı: her paket bütün, `payload` baytları, `type` paket kimliği ya da biçimi, geldiği hızda;
- paylaşılan bellek ya da yoklanan bir API: her okumanın her alanı, ya adlandırılmış sütunlar olarak ya da bütün blok `payload` olarak, uyarlayıcının okuduğu hızda;
- bir günlük: her satır, `text` satırın kendisi, `type` satırın türü; uyarlayıcının işlemediği satırlar dahil.

Bunlar oturumun tablosunun yanındaki `<oturum>.raw.parquet` dosyasına girer. Boyut kuralın bedelidir; onu zstd ve sözlük kodlaması düşürür, öğeleri dışarıda bırakmak değil.

## Öz denetim {#the-self-check}

Her dönüştürücü, maç belgesine (ya da oturumun `meta.json`'una, ya da maç belgesi olmadığı yerde bir özete) `selfCheck` altında bir `completeness` bloğu yazar:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Alan | Anlamı |
|---|---|
| `seen` | kaynağın bu türden kaç öğe tuttuğu |
| `decoded` | tabloya ya da maç belgesine bütün olarak okunan |
| `partial` | tabloya ya da belgeye kısmen okunan, ve bir yan dosyada bütün tutulan |
| `raw` | yalnızca bir yan dosyada bütün tutulan, çözülmeyen |
| `lost` | `seen - decoded - partial - raw`: 0 olmalı |

En üst düzeydeki `lost` toplamdır. Bir dönüştürücünün testleri, sentetik örneklerinde 0 olduğunu doğrular ve README gerçek olanlarda neydi onu söyler. Sıfır olmayan bir `lost`, dönüştürücünün kuralı bozduğunu söylemesidir; türü adlandırır, böylece boşluk bulunabilir.

"Türler" kaynağın kendi türleridir: paket türleri, ileti kimlikleri, olay adları, özellik grupları, satır türleri. Dönüştürücünün onlarla karşılaştığı yerde sayılırlar, beklediği bir listeden değil; böylece kimsenin bilmediği bir tür, sayısıyla birlikte görünür ve kaybolmaz.

## README'nin Tamlık bölümü {#the-readmes-completeness-section}

Her dönüştürücünün README'sinde **Tamlık** başlıklı bir bölüm vardır ve üç listesi bulunur:

- **Okunan**: tabloya ve maç belgesine ne girdiği ve her yeni alanın bağımsız bir şeyle (oyunun kendi sayılarıyla, ikinci bir kaynakla, bu amaçla yapılmış bir kayıtla) nasıl denetlendiği.
- **Ham tutulan**: hangi yan dosyada, hangi `type` altında ne olduğu ve bunun hakkında şimdiye kadar ne bilindiği.
- **Kullanılamıyor**: kaynağın neyi taşımadığı ya da neyin okunmasına izin verilmediği ve nedeni.

Bu sayfaya geri bağlanır.

## Her dönüştürücünün durumu {#where-each-converter-stands}

| Dönüştürücü | Yan dosyalar | Tamlık bölümü |
|---|---|---|
| War Thunder tekrarları | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (öz denetim sayıları `counts` altında; `completeness` bloğu eklenecek) |
| World of Tanks tekrarları | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships tekrarları | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad sunucu demoları | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2 demoları | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2 tekrarları (izleyici) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2 tekrarları](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!, LoL, Valorant tekrarları (izleyici) | `raw` | [izleyicinin belgelerindeki](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) kendi sayfaları |
| Canlı uyarlayıcılar (izleyici) | `raw` | her oyunun sayfası [izleyicinin belgelerinde](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), ve `Session.raw` için [geliştirme](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) |
| Tur kaydediciler (oyun kaydı) | `raw`, ve bir Forza tur dosyasının içindeki `unparsed` baytlar | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Görüntüleyicinin kendi içe aktarmaları | yok: aşağıya bakın | bu sayfa |

### Görüntüleyicinin kendi içe aktarmaları {#the-viewers-own-imports}

Tacview ACMI, OCAP ve GPS biçimleri, kullanıcının kendi dosyasından tarayıcıda okunur; görüntüleyici onlardan hiçbir şey saklamaz, bu yüzden dosyanın kendisi kayıt olarak kalır. Yine de olabildiğince çok okurlar:

- **Tacview ACMI** (`src/data/acmi.ts`): konumu olan her nesne satırı, kaydın taşıdığı her özellikle birlikte bir satırdır; her olay bir satırdır; her kaldırma bir satırdır; kaydın kendi özellikleri (başlığın FileType ve FileVersion'ıyla) her satırda `RecordingInfo` olarak; bir yorum satırı bir `Comment` olaydır, hiç konum almayan bir nesne referans noktasında bir `Unplaced` satırdır ve U/V, herhangi bir satırda bulundukları yerde sütunlardır. Konumu olmayan bir özellik satırı kısmen okunur: değerleri nesnenin sonraki satırına ulaşır, kendi zamanına değil. `AcmiTable.completeness`, dosyanın satırlarını türüne göre sayar.
- **OCAP** (`src/data/ocap.ts`): her varlığın kareleri, atışları, işaretleri, her olay türü (bilinmeyen türler metinleriyle "Mission" satırları olarak) ve belgenin kendi alanları (`Info`). Henüz okunmayanlar: başlığında listelenenler dışındaki varlık alanları ve sondaki konum öğeleri (daha yeni bir kaydedicinin eklemeleri) ve bir ölü birimin ölümünden sonraki tekrarlanan kareleri (bilerek inceltilmiş: onlarda hiçbir şey değişmez).
- **GPS biçimleri** (`src/data/geoTracks.ts`): konum düzeltmeleri, zamanları, yükseklikleri, rotaları ve hızları; dosya bunları kaydettiği yerde kalp atışı, kadans, güç, sıcaklık, uydular, HDOP ve basınç yüksekliği. Henüz okunmayanlar: diğer GPX ve KML uzantıları, konum cümleleri dışındaki NMEA cümleleri, düzeltmeler ve uzantıları dışındaki IGC kayıtları ve kayıtlar (turlar, oturumlar, cihaz bilgisi) dışındaki FIT iletileri.

Bu boşluklar kapatılsın diye listelenir, mazeret olsun diye değil; yüklenmiş bir kaydın görüntüleyicinin dışa aktarımları (`src/data/exportRecording.ts`) yalnızca okunanı yazar.

## Bir dönüştürücü eklemek {#adding-a-converter}

1. Biçimin neyi tuttuğunu listeleyin: belgelerinden, kendi yapılarından ya da gerçek örneklerdeki her ileti türünü sayarak. Liste, öz denetimin `types`'ıdır.
2. Şimdi denetlenebilenleri çözün. Her yeni alan, tabloya girmeden önce bağımsız bir şeyle denetlenir; henüz denetlenemeyen bir alan ham kalır.
3. Geri kalanı, yukarıdaki gibi adlandırılmış bir yan dosyada, yukarıdaki sütunlarla bütün tutun.
4. `completeness` bloğunu ve `lost` değerinin 0 olduğunu doğrulayan bir test yazın.
5. README'nin Tamlık bölümünü yazın ve buraya bağlayın.
6. Yan dosyanın `<ne>`'si yeniyse, onu yukarıdaki tabloya ve `src/data/filePick.ts` içindeki `SIDECAR_PARQUET`'e ekleyin.

Dönüştürücüler temiz odadadır (clean-room): biçimlerden, belgelerden ve örneklerden yazılırlar, asla GPL ya da AGPL kodundan değil. Gerçek tekrarların örnekleri, onları yapan makinede kalır; testler sentetik dosyalar kullanır.
