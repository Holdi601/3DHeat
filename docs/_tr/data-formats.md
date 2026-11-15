---
title: "Veri biçimleri başvurusu"
nav_order: 19
lang: "tr"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: true
---

# Veri biçimleri başvurusu

Bu sayfa, 3DHeat'in açabildiği her dosya türünü ve içindeki bir tablonun nasıl görünmesi gerektiğini listeler. Tablo, bir elektronik tablo gibi satırlar ve sütunlardır: her satır bir şeyin nerede olduğunu ve, eğer biliyorsanız, ne zaman ve kim olduğunu söyler.

Isı sekmesinin sütun sütun ne okuduğu ve bir Parquet dosyasının taşıyabileceği ipuçları burada yer alır. (Yarış analizi sekmesi tur dosyalarını, Maç sekmesi maç özetlerini okur. Bkz. [Yarış analizi](race-analysis.md) ve [Maç analizi](match-analysis.md).)

## Dosyalar {#files}

Yüklenebilir dosyaların tam listesi budur. **Kaynak** panelinin (**Dosyalar…**, **Klasör…** ya da sürükle bırak) kabul ettiği dosyalar tam olarak bunlardır:

| Uzantı | Nedir | Okuyan |
|---|---|---|
| `.parquet`, `.pq` | Parquet tablosu | Parquet okuyucusu (aşağıda) |
| `.csv`, `.tsv`, `.txt` | Ayraçlı metin | metin okuyucusu (aşağıda) |
| `.3dheat` | Tek dosyada bir maç (tabloyu ve ekstralarını tutan bir ZIP) | tuttuğu tablo olarak yüklenir - [Bir dosyada bir maç](container.md) |
| `.acmi` (ayrıca `.txt.acmi`, `.zip.acmi`) | Tacview uçuş kaydı | kendi okuyucusu - [Tacview kayıtları](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP kaydı (Arma tarzı) | kendi okuyucusu |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS izleri: GPX, KML/KMZ, NMEA günlükleri, IGC planör günlükleri, FIT spor dosyaları | kendi okuyucusu; konumlar enlem ve boylamdan gelir |

Konum olarak yüklenmeyenler: bir tabloyu tanımlamak için yanına konan küçük JSON dosyaları (adları `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json` ile biten) ve bir dönüştürücünün ekstra tabloları (`<match>.events.parquet` ve benzerleri, bkz. [Dönüştürücüler](converters.md)), tek başına seçmediğiniz sürece. Diğer her şey bir nedenle atlanır. Bir seçimin nasıl süzüldüğü [Dosya yükleme](loading-files.md#which-files-are-kept) bölümünde anlatılır.

Boş dosyalar atlanır. İçinde `movement*.<ext>` dosyaları olan bir seçimde yalnızca onlar yüklenir ([Dosya yükleme](loading-files.md#which-files-are-kept)).

Veri **örnek başına bir satırdır**: bir andaki bir konum, isteğe bağlı olarak kim, hangi grup, hangi oturum, nereye bakıyor ve daha fazla sütun. Olay satırları (bir öldürme, bir bomba kurma, bir atış) konum satırlarıyla aynı tabloda olabilir. Bir olay sütunu onları ayırır.

## Ayraçlı metin (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Üç satırlık en küçük kullanışlı dosya:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Sütunlar kendiliğinden eşlenir ([Sütun eşleme](column-mapping.md)).

Baytlık bir tarayıcı tarafından okunur, yalnızca eşlenen sütunların kodunu çözer ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Konu | Kural |
|---|---|
| Başlık | İlk boş olmayan satır sütun adlarını tutar. Boş bir ad `column_N` olur. |
| Ayraç | İlk 1 MiB'ın ilk 20 boş olmayan satırından, virgül, noktalı virgül, sekme ve dikey çizgi arasından **tutarlılıkla** tespit edilir: örneklenen her satırda aynı alan sayısını veren ayraç kazanır; sonra daha fazla alan veren. Boşluk asla tespit edilmez ama seçilebilir; herhangi bir tek karakter yazılabilir ([Sütun eşleme](column-mapping.md#the-fields)). |
| Tırnak | RFC 4180: alanlar çift tırnak içinde olabilir, tırnak içindeki `""` gerçek bir tırnaktır. |
| Boşluklar | Her alandan baştaki ve sondaki boşluklar, sekmeler ve tırnaklar kırpılır. |
| Satır başına alan | En fazla 4.096; daha fazlası bir hatadır (*ayraç doğru mu?*). |
| Sayılar | İsteğe bağlı işaret, rakamlar, isteğe bağlı `.` ve ondalıklar, isteğe bağlı üs (`1.5e-3`). Ondalık virgül (`1,5`), binlik ayraçlar ya da sonradan gelen birimler (`12 m`) ayrıştırılmaz ve eksik sayılır. Dosyanız ondalık virgül kullanıyorsa, yüklemeden önce noktayla değiştirin (bir metin düzenleyicide bul ve değiştir yeterlidir). |
| Sayısal sütun | İlk 50 satırın boş olmayan değerlerinin %90'ından fazlası sayı olarak ayrıştırılırsa bir sütun sayısal olarak sunulur. |
| Satır sayısı | İlk 1 MiB'ın ortalama satır uzunluğundan, yüklemeden önce tahmin edilir. |
| Metin kodlaması | UTF-8. |

## Parquet {#parquet}

[hyparquet](https://github.com/hyparam/hyparquet) ile okunur, sütun parçası parçası tipli dizilere, yalnızca eşlenen sütunları isteyerek ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Konu | Kural |
|---|---|
| Satır sayısı | Kesin, yüklemeden önce altbilgiden. |
| Önizleme | İlk 50 satır, nesneler olarak çözülmüş; değerleri hangi sütunların sayısal göründüğüne karar verir. |
| Tamsayılar | `INT32` ve `INT64` (BigInt olarak çözülür) sayı olur. |
| Ondalıklar | `FLOAT`, `DOUBLE`. |
| Mantıksal değerler | 1 ve 0. |
| Metinler | Kişi, grup, oturum ve kategori sütunları için kullanılır; sayısal görünen bir metin, sayısal roller için kabul edilir. |
| `TIMESTAMP`, `DATE` mantıksal türleri | Zaman anlarına (1970'ten bu yana milisaniye) çözülür; zaman ekseni olarak kullanıldığında birim ayarı yok sayılır. |
| İç içe sütunlar | Struct ve list sütunları hiçbir rol için tasarlanmamıştır (JSON metni olarak önizlenir); denenmemiştir. |
| Altbilgi üst verisi | `heat3d` anahtarı, eşleme ipucu olarak okunur (aşağıda). |

Sayı olmayan bir değer içeren konum, zaman ya da bakış sütunu eksik sayılarak çözülür.

## Sütun rolleri ve türleri {#column-roles-and-types}

| Rol | Dosyadaki tür | Zorunlu | Nasıl saklanır | Sınırlar |
|---|---|---|---|---|
| X, Y, Z | sayı | üçünden ikisi | 32-bit kayan nokta, [eksen eşlemesinden](axes-units-and-time.md) sonra | Kullanılabilir konumu olmayan bir satır atılır. |
| Zaman | [zaman birimlerinden](axes-units-and-time.md#time-units) birinde sayı, Parquet zaman damgası ya da ISO-8601 metni | hayır | en erken satırdan itibaren 32-bit kayan nokta saniye | 400.000.000 satırın üzerinde sıralama reddedilir ([neden](memory-and-budgets.md#the-sort-ceiling)). |
| Kişi | herhangi; sözlük kodlamalı | hayır | 32-bit kimlik | |
| Oturum | herhangi; sözlük kodlamalı | hayır | 32-bit kimlik | 100.000 oturuma kadar etiket listelenir. |
| Grup | herhangi; sözlük kodlamalı | hayır | 16-bit kimlik | En fazla 4.096 grup, yoksa gruplama bırakılır. |
| Yaw, pitch | sayı, derece ya da radyan | hayır | 32-bit kayan nokta radyan | |
| Yön X, Y, Z | sayı | hayır (üçü birlikte) | yaw ve pitch'e çevrilir | |
| Süzgeç sütunu, *aralık* | sayı | hayır | 32-bit kayan nokta | Aynı anda en fazla 4 süzgeç etkin. |
| Süzgeç sütunu, *kategori* | herhangi; sözlük kodlamalı | hayır | 32-bit kimlik | En fazla 4.096 değer, yoksa sütun tutulmaz. |

Süzgeç sütunu olarak tutulan bir Parquet `TIMESTAMP` sütunu, epoch milisaniyelerinin bir *aralığı*dır: bir liste değil, bir kaydırıcı.

## `heat3d` ipuçları {#the-heat3d-hints}

Bir Parquet dosyası, kendi okuma talimatlarını altbilgisindeki anahtar/değer üst verisinde, **`heat3d`** anahtarı altında, bir JSON nesnesi olarak taşıyabilir ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Görüntüleyici, dosya bir seçimin ilkiyse bunları kendi tahminlerinin üzerine uygular. Her girdi isteğe bağlıdır ve her sonuç yine de [Sütun eşleme](column-mapping.md#the-heat3d-hints-in-a-parquet-footer) panelinde gösterilir ve düzenlenebilir. JSON nesnesi olarak ayrıştırılamayan her şey yok sayılır.

### Şema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          konum için sütun adları
    "time": string,                                  zaman sütunu
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           tutulacak süzgeç sütunları, en yararlıdan başlayarak
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  > 0 olmalı
  },
  "entity": {
    "size": number                                   dosya birimlerinde izlenen bir şeyin boyutu, > 0
  }
}
```

| Girdi | Uygulandığı zaman | Etkisi |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | adı verilen sütun dosyada varsa | o rolü ayarlar. |
| `columns.timeUnit` | yedi birimden biriyse | zaman birimini ayarlar. |
| `columns.angleUnit` | `"degrees"` ya da `"radians"` | açı birimini ayarlar. |
| `columns.lookMode` | dirX, dirY ve dirZ hepsi ayarlıyken `"vector"`; yaw ayarlıyken `"yawPitch"`; `"none"` | bakış modunu ayarlar. |
| `columns.extra` | bir dizi ise | otomatik süzgeç listesinin yerine geçer; yalnızca bir ipucunun bir role atamadığı, var olan sütunları tutar. Her biri, önizlemede sayısal göründüyse *aralık*, aksi halde *kategori* olur. Bu girdi olmadan otomatik liste, bir ipucunun bir role atadığı sütunlar çıkarılarak korunur. |
| `axes.up` | `"y"` ya da `"z"` | yukarı ekseni. |
| `axes.flipX/Y/Z` | bir boolean | çevirmeler. |
| `axes.scale` | 0'dan büyük bir sayı | birim ölçeği. |
| `entity.size` | 0'dan büyük bir sayı | [Varlık boyutu](sessions-persons-groups.md#entity-size) (yüklemede birim ölçeğiyle çarpılır). Ayarlamanın tek yolu budur. |

### Örnek {#example}

Uydurma bir nişancı oyunu dışa aktarımı: Z yukarı, santimetre, sol elli bir dünya, oyuncular yaklaşık 72 cm genişliğinde.

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### Yazmak {#writing-it}

pyarrow ile, özel şema üst verisi dosyanın anahtar/değer üst verisine yazılır:

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` bir dosyanın şemasını yazdırır. İpuçlarının başvurduğu sütun adlarını kontrol etmenin hızlı bir yoludur.

## Isı sekmesinin yazdıkları {#what-the-heatmap-tab-writes}

Veriye hiçbir şey geri yazılmaz. Çıktılar şunlardır:

- videolar, WebM olarak (VP9 ya da VP8) - [Kamera yolu ve video](camera-path-and-video.md);
- bir kamera konumu, metin olarak panoya kopyalanır - [Kamera](camera.md#pose);
- tarayıcının [bölüm kitaplığında](level-library.md) kaydedilmiş bölümler.
