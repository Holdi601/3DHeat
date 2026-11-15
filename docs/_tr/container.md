---
title: "Her maç için bir dosya (.3dheat)"
parent: "Veri alma"
nav_order: 9
lang: "tr"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Her maç için bir dosya: `.3dheat`

Bir `.3dheat` dosyası, bütün bir maçtır; tek bir dosyada, kopyalamak, saklamak ya da paylaşmak için. Birini açmak için dosyayı Kaynak panelinin üstüne bırakmanız yeter.

```
match.3dheat   (a ZIP file)
  manifest      what the match is, and the list of everything inside
  table         the positions (Parquet)
  match.json    the match document
  sidecars      what the converter kept whole (events, messages, ...)
```

Dönüştürülmüş bir maç eskiden yan yana duran birkaç dosyaydı: `<match>.parquet` tablosu, `<match>.match.json` maç belgesi ve `<match>.<ne>.parquet` yan dosyaları ([Dönüştürücüler her şeyi korur](converters.md)). Bir `.3dheat` dosyası bunların hepsini tek bir yerde tutar: bir tekrar, bir dosya; kopyalamak, saklamak ya da paylaşmak için.

Bin tanesini yüklemek, ayrı tabloları yüklemek kadar hızlı olacak şekilde yapılmıştır. Ayrıca sonraki dönüştürücüler, yeni bir biçime gerek kalmadan içine çok daha fazlasını koyabilir.

## Birini yüklemek {#loading-one}

Bir dosya ya da klasörün yüklendiği her yerde, bir `.3dheat` dosyası da yüklenir. Bir klasör kapsayıcıları ve düz dosyaları karıştırabilir:

| Nerede | Kapsayıcıdan ne okunur |
|---|---|
| **Isı haritası** Kaynak paneli (dosyalar, klasör, sürükle bırak) | tabloları, düz `<match>.parquet` gibi |
| **Isı haritası → Birçok maç birden** (Dosyalar, Klasör, Klasör ekle) | tabloları, yükleyicinin çalışanları yerinde okur |
| **Maç** sekmesi (Yükle ya da görünüme bırakma) | maç belgesini |
| **Taktik** tahtası telemetrisi | tablolarını |

Bir kapsayıcıyı açmak, onun iki küçük parçasını okur: sonundaki dizini ve başındaki manifesti. Bir tablonun hiçbir parçası, yükleyici onu okuyana kadar okunmaz. Yan dosyalar ve maç belgesi yalnızca biri onları istediğinde okunur. Aynı maçı hem düz hem paketli olarak tutan bir klasör, onu bir kez yükler.

## Paketlemek ve açmak {#packing-and-unpacking}

Yeni dönüştürmeler varsayılan olarak kapsayıcı yazar: War Thunder dönüştürücüsü (`heat3d-wt-replay`), CS2 dönüştürücüsü (`heat3d_cs2 demos`) ve Tacview aracı (`node tools/acmi-to-parquet.mjs`). `--loose` ayrı dosyaları tutar.

Daha önce ya da başka araçlarla dönüştürülmüş maçlar şöyle paketlenir:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack**, klasörlerin altındaki her `<match>.parquet` tablosunu, ona ait dosyalarla birlikte bulur ve yanına `<match>.3dheat` yazar. Zaten paketlenmiş bir maç atlanır. Her kapsayıcı, başka bir şey olmadan önce baştan sona geri okunur (her üyenin sha256'sı, boyutu, CRC'si ve Parquet alt bilgisi). Düz dosyalar yalnızca `--delete-loose` ile silinir; daha önce paketlenmiş bir maçın düz dosyaları ise yalnızca kapsayıcının tuttuğuyla bayt bayt aynıysa silinir. Son `--settle` dakika içinde (varsayılan 10) bir dosyası değişmiş bir maça dokunulmaz: bir dönüştürücü hâlâ yazıyor olabilir.
- **unpack**, üyeleri kapsayıcının yanına düz dosyalar olarak geri yazar.
- **update**, tablolar yeniden yazılmadan üye ekler ya da değiştirir (aşağıya bakın).
- **repack**, bir kapsayıcıyı baştan yeniden yazar; güncellemelerin geride bıraktıklarını atar.

## Biçim {#the-format}

Bir `.3dheat` dosyası bir ZIP arşividir (her ZIP aracı açar) ve şu kurallara uyar:

1. Bir kapsayıcı yazıldığında **`manifest.json` ilk üyedir** ve her zaman bulunur. ZIP merkezi dizini üzerinden bulunur; bu yüzden bir `update` sonrası dosyanın daha sonrasında yer alabilir.
2. **Bayt aralığıyla okunan ya da zaten sıkıştırılmış üyeler saklanır** (ZIP yöntemi 0): Parquet, Arrow, görseller, modeller, ses, video, opak bloblar. Saklanan bir üye kapsayıcının tek ve bitişik bir bayt aralığıdır; bu yüzden bir okuyucu, bir tablonun alt bilgisini ve sütun parçalarını yerinde okur (bir tarayıcıda `File.slice` ile ya da bir HTTP aralık isteğiyle), tıpkı düz dosyayı okuyacağı gibi.
3. **Metin sıkıştırılır** (yöntem 8): JSON, CSV, düz metin. Bunlar küçüktür ve baştan sona okunur.
4. Adlar UTF-8'dir (bayrak biti 11), göreli, `/` ile ayrılmış, `..` içermez; klasörler de içerebilir (`analysis/heat.json`). Paketlenen bir düz dosya kendi adını korur; bu yüzden açmak aynı dosyaları geri verir.
5. 4 GiB'den büyük üyeler ya da 65.535'ten fazla üyesi olan kapsayıcılar, her zamanki gibi ZIP64 kullanır. Yazıcılar üyelerden sonra veri tanımlayıcısı koymaz.

Dönüştürücülerin bugün yazdığı üyeler, bu sırayla:

| Rol | Üye | Saklanır |
|---|---|---|
| `table` | `<match>.parquet` | evet |
| `match` | `<match>.match.json` | hayır (sıkıştırılmış) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | evet |
| `summary` | `<match>.summary.json`, toplu dizinin özeti ([Toplu analiz](mass-analysis.md)), `tools/3dheat-summarize.mjs` tarafından eklenir | hayır (sıkıştırılmış) |

Tablo manifestin hemen ardından gelir; böylece okuyucunun dosyanın başındaki ilk okuması, manifesti ve tablonun yerel başlığını birlikte kapsar.

### Manifest {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Alan | Anlamı |
|---|---|
| `format` | her zaman `3dheat` |
| `format_version` | `major.minor` (aşağıya bakın) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | maçın ne olduğu ve onu neyin ürettiği; bilinmediğinde `null` |
| `created`, `updated` | ne zaman yazıldığı, en son ne zaman güncellendiği (`updated` yalnızca bir güncellemeden sonra görünür) |
| `roles` | her rolü ilk üyesinin adına bağlar: hızlı bir dizin |
| `members` | manifest dışındaki her üye: tam liste ve okuyucunun güvendiği şey |
| `matches` | isteğe bağlı: birden fazla maç içeren bir kapsayıcının maçları (aşağıya bakın) |
| `references` | isteğe bağlı: kapsayıcının ihtiyaç duyduğu ama tutmadığı dosyalar |
| `extensions` | isteğe bağlı: bir dönüştürücünün kendi üst verisi |

Her üye:

| Alan | Anlamı |
|---|---|
| `name` | kapsayıcıdaki yolu |
| `role` | ne için olduğu (aşağıya bakın) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` ya da `deflate` |
| `bytes` | boyutu, sıkıştırılmamış |
| `sha256` | bayt içeriğinin sha256'sı, sıkıştırılmamış |
| `rows` | bir tablonun satır sayısı |
| `schema` | uyduğu kural, `{ "id", "version" }`: bir belgenin kendi `format` ve `version` değerleri (`heat3d-wt-replay-match` 2); görüntüleyicinin `heat3d` alt bilgisiyle okuduğu bir tablo için `heat3d-table`; Tacview aracınınki için `heat3d-acmi-table` |
| `match` | birden fazla maç içeren bir kapsayıcıda, ait olduğu `matches[].id` |

### Büyümeye hazır {#made-to-grow}

Biçim, bugünkünden çok daha zengin tekrarları, bugünkü okuyucuları bozmadan taşıyacak şekilde tasarlanmıştır:

- **Sürümleme.** `format_version` `major.minor`'dır. Bir okuyucu, kendi major sürümündeki her minor sürümü okur ve bildiği olmayan her alanı yok sayar. Minor, bir şey eklendiğinde artar; major yalnızca düzen, eski bir okuyucunun onu yanlış okuyacağı şekilde değiştiğinde artar (artık saklanmayan bir üye, arşivden taşınan manifest). Her üyenin kendi kuralı, `schema` içinde ayrı sürümlenir; böylece yeni bir tablo düzeni ya da yeni bir belge sürümü yeni bir kapsayıcı sürümü gerektirmez. İlk yazılan kapsayıcılar bunun yerine `"version": 1` yazıyordu; okuyucular bunu 1.0 olarak alır.
- **Roller açıktır.** Bir rol herhangi bir dizedir. Okuyucular bildikleri rolleri kullanır, geri kalanı korur: bilinmeyen bir rol listelenir, asla reddedilmez; `update` ve `repack` onu olduğu gibi taşır. Bir rolün birden fazla üyesi olabilir: birkaç tablo (birim başına izler, farklı hızlarda telemetri), olaylar, ses, video senkronu, seviye referansları, figür geçersiz kılmaları, analiz sonuçları. Adlar klasörler de içerebilir.
- **Her ortam.** Bir üye, bir ortam türü olan her şey olabilir: Parquet, JSON, Arrow, PNG ya da JPEG küçük resimler, glTF modelleri, ses, ham bloblar.
- **Birden fazla maç.** Bir oturum ya da bir turnuva tek bir kapsayıcıya girebilir: `matches` onları listeler (`{ "id", "map", "mode", "started", ... }`) ve her üye bağlı olduğu `match`'i adlandırır. Görüntüleyici, `table` rolündeki her üyeyi yükler.
- **Referanslar.** Bir kapsayıcının ihtiyaç duyduğu ama tutmadığı dosyalar (örneğin bir seviye), `references` içinde ad ve sha256 ile listelenir (`{ "kind": "level", "name": "...", "sha256": "..." }`). Böylece doğru dosya, her maça kopyalanmadan bulunur ve denetlenir.
- **Uzantılar.** `extensions`, bir dönüştürücünün kendi üst verisini kendi anahtarı altında tutar: `"<vendor>/<name>": { ... }`. Böylece iki dönüştürücü asla çakışmaz ve paylaşılan alanlara bir şey eklemek gerekmez.
- **Yerinde güncelleme.** `update`, büyük saklanan tabloları yeniden yazmadan üye ekler ya da değiştirir: yeni üyeler ve yeni bir manifest, kapsayıcının sonundan sonra eklenir ve ardından yeni bir merkezi dizin gelir. Değiştirilen şey, `repack` gelene kadar başvurulmayan baytlar olarak kalır. Her üye ve her manifest alanı, bilinen ya da bilinmeyen, korunur. Başarısız bir güncelleme, kapsayıcıyı eski haline geri keser.

Görüntüleyicinin testleri bunu sınar: bilinmeyen bir rol, bir üye alanı, bir uzantı ve bir klasördeki bir ses üyesi içeren 1.7 biçimindeki bir kapsayıcı yüklenir ve hepsi tam olarak kalmış halde bir güncellemeyi ve bir repack'i atlatır; major sürümü 2 olan bir kapsayıcı reddedilir.

## Yazıcılar {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs) (yazma, okuma, doğrulama, güncelleme, repack); paketleme aracı ve Tacview aracı tarafından kullanılır.
- Python: `container.py`, standart `zipfile` üzerinde yaklaşık 140 satır; her dönüştürücüde aynı dosya (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`). Böylece hiçbir dönüştürücü diğerine bağlı değildir. Yeni bir dönüştürücü bu dosyayı kopyalar.
- Görüntüleyici şununla okur: [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
