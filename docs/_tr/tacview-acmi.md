---
title: "Tacview kayıtları (ACMI)"
parent: "Veri alma"
nav_order: 7
lang: "tr"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview kayıtları (ACMI)

Tacview, uçuş simülatörlerindeki uçuşları kaydeden bir programdır; dosyaları `.acmi` ile biter. 3DHeat bunları açar, böylece her uçağın nereden uçtuğunu görebilirsiniz.

Tacview uçuş kayıtları her tablo gibi yüklenir: bir `.acmi` dosyasını (metin, `.txt.acmi` ya da sıkıştırılmış, `.zip.acmi`) seçin ya da sürükleyin ve **Yükle**'ye basın. Böylece tüm uçuşların ısısını elde edersiniz; **Maç** sekmesinde ise figürler, izler ve bir olay listesiyle bir tekrar oynatma ([Maç tekrar oynatma](match-replay.md)). ACMI, Tacview'un herkese açık dosya biçimidir ([belgeleri](https://www.tacview.net/documentation/acmi/)); DCS (Tacview'un dışa aktarıcısı üzerinden), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS ve diğerleri bu biçimi yazar, bu yüzden hepsi okunur.

## Bir kayıt neye dönüşür {#what-a-recording-becomes}

Bir nesnenin konumu her yazıldığında bir satır, nesnenin yerindeki her olay için bir satır ve bir nesne ayrıldığında bir satır (`Removed`, son görüldüğü yerde). Henüz görülmemiş bir nesneyle ilgili olay (bir yer imi, herkese bir ileti) referans noktasında `(recording)` nesnesinin satırıdır. Kayıt kendi okuma talimatlarını taşır, bu yüzden eşleme adımı kendini doldurur. Okuyucu şu sütunları yazar: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, ve kaydın sahip olduğu başka özellikler. Rolleri:

| Sütun | Rol | Anlamı |
|---|---|---|
| Time | zaman | Kaydın ReferenceTime değerinden sonraki saniye; ReferenceTime varsa Unix saniyesi, böylece saat gerçek zamanı gösterir. |
| X, Y | konum | Kaydın referans noktasında yeryüzüne dokunan bir düzlemde doğu ve kuzey, metre cinsinden: yakınında mesafeler ve yönler doğrudur, 100 km'de binde birden az kayar. Kuzey, dünyanın -Z'si olur. |
| Altitude | konum (yukarı) | Metre. |
| Object | kişi | Pilot ve nesnenin kimliğiyle adı, örneğin `Viper 1 (F-16C_50) #a01`; insansız bir nesne `(T-90A) #401`. |
| Coalition | takım | Taraf (ya da koalisyon yoksa renk). |
| Heading, Pitch | bakış | Derece; yön 0 kuzeydir. |
| Recording | oturum | Kaydın Title değeri ya da dosya adı: birkaç kayıt, izleri birleşmeden yan yana yüklenir. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtreler | Filtreleme için tutulur; Type ve Name her nesnenin [figürünü](figures.md) seçer, Event, değerlendirmenin (debrief) olay listesini besler, Roll uçağı yatırır. |
| U, V | | Oyunun kendi düz dünya metreleri, her örnekte varsa (DCS yazar). |
| EventObjects | filtreler | Bir olayın adını andığı her nesne (`Message|a01|b02|...`), kimliğiyle. |
| RecordingInfo | | Kaydın o andaki kendi özellikleri: DataSource, DataRecorder, Author, Category, Briefing, Comments, ... JSON olarak. |
| IAS, Mach, AOA, FuelWeight, ... | filtreler | Kaydın taşıdığı diğer sayısal her özellik. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtreler | Kaydın taşıdığı diğer metin özellikleri; sayı olmayan herhangi bir değere sahip özellik metindir. |

Tacview konumunun dört biçimi de okunur (`lon|lat|alt`, `u|v` ile, `roll|pitch|yaw` ile ve hepsi ile birlikte bir yön), boş alanlar son değeri korur. `-id` bir nesneyi kaldırır; ondan sonra yeniden kullanılan bir kimlik yeni bir nesnedir. Kaçış karakterli virgüller ve devam eden satırlar işlenir.

Konumlar her zaman enlem ve boylamdan projeksiyonla alınır, U/V'den asla; bu yüzden her oyunun kayıtları gerçek dünyanın bir arka planıyla tek bir projeksiyonu paylaşır.

## DCS sunucuları: kim kazandı ve her uçuş nasıl bitti {#dcs-servers-who-won-and-how-each-sortie-ended}

Çok oyunculu bir DCS sunucusu görevlerini gece gündüz Tacview ile kaydeder. Kalıcı bir PvP sunucusu bunların birçoğu boyunca bir sefer yürütür: bir taraf, diğerinin her havaalanını, FARP'ını ve bölgesini alınca kazanır. Bu günler ve görevin birçok kez yeniden başlatılmasını gerektirir. Kayıtlar seferi değil uçuşları tutar: hiçbir mesaj kimin neyi aldığını söylemez, havaalanları başta bir kez yazılır ve hiçbir şey kimin kazandığını söylemez. Tacview dönüştürücüsü (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) bilinebileni her satıra ekler, bilinemeyeni boş bırakır. Asla tahmin etmez.

| Sütun | Anlamı |
|---|---|
| `server` | sunucu ya da sefer, kaydın başlığından (Title, Author ve Comments bilinen herkese açık sunucuları adlandırır - Blue Flag, SPS Contention, Growling Sidewinder; aksi hâlde birini adlandıran bir Author); `--server Name` tüm bir klasöre ad verir. Başlığı hiçbir sunucu adlandırmayan bir kayıt - `Admin` gibi bir Author, hiçbir bilinen sunucunun yazmadığı bir Title ve Comments - atanmamış kalır: `server` boştur, bir sunucunun kayıt sayfasından indirilmiş olsa bile, çünkü o sayfada başka toplulukların görevleri de olabilir |
| `mission` | kaydın sürümü ya da sefer ayı olmadan Title'ı: `Operation_Example_V7.7.99`, `Operation Example` olur |
| `campaign` | kaydın ait olduğu sefer turu, sunucu, harita ve numaraya göre: `Example Server North 3`. Bir kayıt bir oturumdur (yeniden başlatmadan yeniden başlatmaya); bir tur birçok oturum, gün ya da hafta sürer |
| `round` | o turun numarası: sunucu yayımlıyorsa sunucunun kendi numarası, aksi hâlde o sunucu ve haritada görülen n'inci tur; bir tur dosyasından (aşağıda), dosya yoksa boş |
| `session` | kaydın turun oturumları arasındaki yeri, 1, 2, ...; `sessionStart` gerçek başlangıcı (Unix saniyesi) |
| `heldRed`, `heldBlue` | her tarafın oturumun başında tuttuğu çekişmeli yerler, zincirlenmiş bir tur dosyasından (aşağıda) |
| `won`, `matchWon` | satırın tarafı (Color'ı, Red ya da Blue) o seferi kazandıysa 1, kaybettiyse 0; hiçbir tur dosyasının kazanan adlandırmadığı yerlerde ve tarafsız satırlarda boş. Bir sefer aynı anda hem tur hem maçtır, bu yüzden ikisi de aynı değeri taşır |
| `roundEndReason` | her şeyi alarak kazanılmış bir sefer için `capture` |
| bir turun her oturumunda `won`, `matchWon` | turun sonucu, sonu bilinir bilinmez turun her kaydına yazılır |
| `sortie` | bir uçağın satırlarında: uçuşu, 1, 2, ... kalkıştan kalkışa; ilk kalkıştan önceki ve bir inişten sonraki yerde geçen süre ait olduğu uçuşa sayılır |
| `sortieResult` | o uçuşun nasıl bittiği: `landed`, `landed damaged` (havada isabet aldıktan sonra), `ejected`, `shot down`, `destroyed` (yerde), `crashed`, `despawned` (görünür bir neden olmadan havada kayboldu - oyundan çıkan bir oyuncu), `airborne at end`, `no takeoff` |
| `sortieKills` | o uçuşta uçağa yazılan düşürmeler |

Kalıcı bir sunucuda anlamlı birim uçuştur. Uçuşların nerede kaybedildiğini görmek için `sortieResult` = `shot down` ile filtreleyin, ya da ısıyı [dökümde](breakdown.md) `sortieResult` veya `server` ile bölün. Uçuşu oluşturan kalkışlar, inişler, fırlatmalar, düşürmeler ve kazalar, dönüştürücünün uçağın hareketinden çıkardığı olaylardır (yukarıda).

Bir turun iki oturumu arasında alınan yerler (tur dosyasından bilinir, aşağıda) sonraki kaydın başında `capture` olaylarıdır: `Object` `(campaign)`, o yerde, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Kaydın gösterdiği yerde taraf değiştiren bir havaalanı ya da FARP (diğer tarafın renginde yeniden yazılan, ya da silinip beş dakika içinde yerinde diğerinin renginde yeniden yazılan) o pistte bir `capture` olayı olur: `Event` = `capture`, `Airfield` adı, `Detail` `Red to Blue`, `Coalition` yeni tarafı. Bir renkte ilk kez yazılan bir pist ele geçirme değildir. Şimdiye kadar incelenen sunucular pistlerini bir kez yazar, bu yüzden kayıtlarında ele geçirme yoktur.

### Tur dosyaları {#rounds-files}

Bir tur dosyası, sunucu başına sefer turlarını, onları kimin kazandığını ve her birinin oturumlarını söyler. Sunucunun yayımladıklarından ya da kayıtların kendisinden (aşağıda) gelir.

Bir seferi kimin kazandığı, sunucunun yayımladığı bir şeydir (web sayfasındaki bir sefer günlüğü), kayıtta bulunan bir şey değildir. Bunu bir tur dosyası taşır ve dönüştürücü onu `--rounds file.json` ile okur (birden fazla verilebilir):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Bir kayıt, kendi `server` sunucusunun, `title` alanı (bir düzenli ifade) kaydın Title'ıyla eşleşen turlarına aittir. Her satır, gerçek zamanının düştüğü tura aittir: kaydın RecordingTime değeri artı satırın saniyeleri, görevin oyun içi tarihi değil. Saatler UTC'dir. Kazananı olmayan bir tur (değiştirilmiş, hâlâ sürüyor) satırlarına tur numarasını ve boş bir sonuç verir.

Maç belgesinin karşılığı olan `acmi` alt bilgisi, bir War Thunder maçının `result.source` alanı gibi, sonucun nereden geldiğini söyler: `outcome.result`, `{ winner, round, endReason, source }` olur; `source`, tur dosyasının `source` değeridir, hiçbir şey kazanan adlandırmadıysa `null`. `outcome` ayrıca kaydın turlarını, ele geçirmelerini ve uçuşlarını nasıl bittiklerine göre listeler:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

O seferde Mavi taraftaki `Viper 1 (F-16C_50) #a01` pilotunun bir satırı o zaman şöyledir: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Kayıtların kendisinden turlar {#rounds-from-the-recordings-themselves}

Kalıcı bir sunucu seferini yeniden başlatmalar boyunca korur ve her kayıt, iki tarafın kara birlikleri ve statik nesneleriyle, seferin onları bıraktığı yerde başlar. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` her kaydın ilk dakikalarını okur ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), her sunucunun bir haritadaki kayıtlarını zaman sırasına koyar ve onları zincirler:

- **Yerler**: yaklaşık 2 km'lik hücrelere bölünmüş arazi; bir oturumun başında oradaki birliklerin dörtte üçü bir tarafınsa hücre o tarafındır. *Çekişmeli* yerler, iki tarafın da elinde görülen yerlerdir.
- **Ele geçirmeler**: bir sonraki oturumun başında diğer tarafın tuttuğu bir yer - görevler arasında ya da öncekinin sırasında alınmış.
- **Yeni bir tur**: yerleri bir öncekininkinden %60'tan fazla farklı olan bir oturum - eski turun bir adımı değil, yeni bir turun başlangıç düzeni. Sunucu başka bir haritaya geçtiğinde de bir tur biter (oturumları sonuncudan sonra başlar ve devam eder).
- **Kim kazandı**: biten bir turda, son oturumunun başında her yeri tutan taraf (`capture`, güven yüksek), aksi hâlde çekişmeli yerlerin daha fazlasını tutan taraf (diğerinin iki katıysa orta, değilse düşük; harita değişikliğiyle bittiyse düşük). Açık bir turun kazananı yoktur, ama her oturum başında her tarafın kaç yer tuttuğunu söyler, böylece kimin önde olduğu görünür.
- Bütün oturumları aynı başlayan bir sunucu, oturumlar arasında durum tutmaz: zincirlenmez.

Son oturumun başı turun bitişinden saatler önce olabilir, bu yüzden güven önemlidir. Kazananlarını yayımlayan bir sunucuda kontrol edildi: zincir her yeni turu, yayımlanan turun başladığı oturumda buldu ve son başlangıçta önde olan taraf, kontrol edebildiği 9 turun her birinde yayımlanan kazanandı. `--official file.json` böyle bir sunucunun yayımlanan turlarını tutar ve onlara zincirin oturumlarını ekler; dosyanın `validation` alanı zincirin ne kadar uyuştuğunu söyler. Uydurma bir seferde:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Bir sefer turunu seri olarak izlemek {#watching-a-campaign-round-as-a-series}

Bir turun kayıtlarını birlikte yükleyin (`campaign` değeri aynı olan dosyalar), görüntüleyici onları tek bir seri olarak oynatır: oturum ardına oturum, gerçek sıralarıyla; iki oturum arasındaki saatler ya da günler bir dakikalık bir araya kısaltılır. Zaman çizelgesi her oturumun başını sarıyla, araları koyu şeritlerle işaretler; saat hangi oturumun oynadığını ve gerçek tarihini söyler (`session 4/12 · 2026-11-02 12:38 UTC`). Isı, tekrar, filtreler ve Insights, yüklenmiş herhangi bir veride olduğu gibi tüm seride çalışır. **Maç** sekmesinin **Sefer turu** bölümü oturumları tarihleriyle, her başlangıçta her tarafın kaç çekişmeli yer tuttuğunu (tüm tur boyunca bir grafik olarak da) ve öncesinde kaçının alındığını listeler; bir tıklama bir oturumun başına gider. Tek başına yüklenen bir kayıt orada hangi tur ve hangi oturum olduğunu söyler. Farklı turlardan birlikte yüklenen kayıtlar bir seri değildir: her biri ayrı maçlar gibi sıfırdan başlar. Çok maç yükleyicisi (**Aynı anda çok sayıda maç**) de bir turu seri olarak oynatır; akış hâlinde ve GPU'ya göre boyutlanmış olarak, çok gigabaytlık turlar için.

Tur sırasında el değiştiren yerler haritada ele geçirme bölgeleri olarak çizilir. Her biri, oynayan oturumun başında onu tutan tarafın rengindedir ve oturum sınırlarında değişir; her değişiklik tekrarın olay listesinde bir ele geçirmedir. Yüklenen satırlardan çıkarılırlar (her oturumun ilk dakikalarındaki kara birlikleri ve statik nesneleri, yaklaşık 2 km'lik hücrelerde, zincirin yaptığı gibi), bu yüzden tam yükleyiciye ihtiyaç duyarlar (çok maç yükleyicisi her satırdan çok az şey tutar).

**Tüm turu kayıtlarından birinden yüklemek.** Sıradan bir tarayıcıda görüntüleyici sizin seçmediğiniz dosyaları açamaz: turun dosyalarını birlikte yükleyin. Yerel görüntüleyici sunucusu tarafından sunulduğunda (`npm run dev` ya da `npm run preview`) açabilir: git'in yok saydığı `tools/local-data.json` dosyasına, tur dosyalarının klasörünü ve dönüştürülmüş kayıtların klasörlerini adlandıran bir `campaigns` girdisi ekleyin. Böylece tek bir kaydın Sefer turu bölümü **Turun tamamını yükle** seçeneğini sunar: orada bulunan turun oturumlarını getirir ve çok maç yükleyicisiyle yükler:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Yalnızca bir tur dosyasının adlandırdığı kayıtlar sunulur (`tools/campaign-files.mjs`); bu klasörlerde bulunamayan bir oturum sayılır, yüklenmez.

Bilinen sunucuların yayımladıkları:

| Sunucu | Bir tur | Bir taraf nasıl kazanır | Kazanan nerede okunabilir |
|---|---|---|---|
| SPS Contention | tek bir harita ve dönemde bir sefer (günler), birçok yeniden başlatma boyunca | her havaalanı, FARP ve kale alınır; kazanansız biten bir sefer değiştirilmiştir | sunucunun herkese açık sefer günlüğü (her sefer için kazanan, başlangıç, bitiş) |
| Blue Flag | birçok 5 saatlik görev boyunca bir sefer turu; Title'daki `_YYYY_MM` her yeniden başlatmada bir ay ilerler | her düşman mevzisi alınır; eski turlar, sabit bir süreden sonra daha fazlasını tutan tarafı ilan ederdi | şimdiye kadar bulunan bir biçimde yayımlanmıyor; kayıtların zinciri her turu ve her başlangıçta kimin ne kadar tuttuğunu izler |
| Growling Sidewinder | açık çatışma görevinin bir çalıştırması (6 saat) | bölgeler ve havaalanları alınır | istatistik sayfası sonuçları değil pilotları gösterir; her oturum aynı başlar, bu yüzden hiçbir tur birden çok oturuma yayılmaz: boş |
| Yapay zekâya karşı görevler (bölge ele geçirme görevleri) | bir görev çalıştırması | oyuncuların tarafı görevin yapay zekâsına karşı: PvP sonucu yok | boş |
| Atanmamış (başlık hiçbir sunucu adlandırmıyor) | - | - | boş, `server` da boş |
