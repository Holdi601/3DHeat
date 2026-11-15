---
title: "Sütun eşleme"
parent: "Veri alma"
nav_order: 2
lang: "tr"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Sütun eşleme

Bir dosya bir tablodur ve 3DHeat'in hangi sütunun doğu-batı konumunu, hangisinin zamanı, hangisinin oyuncunun adını taşıdığını bilmesi gerekir. Bu panel neyi tahmin ettiğini söyler ve yanlış bir tahmini düzelttiğiniz yerdir.

![Bir Parquet dosyası yüklendikten sonra Sütun eşleme paneli: her kutu zaten doldurulmuş; 1 X, 2 Y, 3 Z, 4 Zaman, 5 Kişi kimliği, 6 Oturum / maç, 7 Takım / grup](../assets/img/en/column-mapping-panel.webp)

*Dosya kendi sütunlarını adlandırmış, bu yüzden her kutu zaten dolu.*

Örneğin `x,y,z,t,player,team` başlıklı bir CSV kendini eşler: x, y ve z konum olur, `t` zaman, `player` [kişi](glossary.md) ve `team` [grup](glossary.md).

Dosyalar seçildikten sonra **Sütun eşlemesi** paneli Kaynak panelinin altında açılır. Hangi sütunun hangi rolü oynadığını söyler. Otomatik doldurulur ve **Yükle**'ye basmadan önce her alan değiştirilebilir. Eşleme yükleme anında okunur; bu yüzden sonradan değiştirmek yeniden yüklemek demektir.

## Alanlar {#the-fields}

Tüm sütun menüleri, ilk dosyanın her sütununu ve *- yok -* seçeneğini listeler.

| Alan | Rol | Notlar |
|---|---|---|
| **Ayırıcı** | Yalnızca CSV: alan ayırıcısı. | Menü: *Virgül ,*, *Noktalı virgül ;*, *Sekme*, *Dikey çizgi \|*, *Boşluk*; ya da *veya bir karakter yazın* alanına tek bir karakter yazın. Otomatik algılanır (aşağıya bakın). Değiştirmek otomatik eşlemeyi yeniden çalıştırır; böylece önce yapılan düzenlemeler kaybolur. |
| **X**, **Y**, **Z** | Konum. | En az ikisi gerekir; eşlenmeyen üçüncü eksen 0'dır (veri bir düzlemde yatar). İki eksende aynı sütun bir hatadır. |
| **Kaynaktaki yukarı ekseni** | Kaynağın hangi ekseni yukarıyı gösterdiği. | *Z yukarıdır (çoğu oyun motoru)* ya da *Y yukarıdır (grafik geleneği)*. Bkz. [Eksenler, birimler ve zaman](axes-units-and-time.md). |
| **Birim ölçeği** | Her konumu çarpar. | *1 (m)* ve *0,01 (cm→m)* düğmeleri ya da bir değer yazın. |
| **X'i / Y'yi / Z'yi çevir** | Kaynağın bir eksenini ters çevirir. | Konumlara ve bakış yönü vektörlerine uygulanır. |
| **Zaman** | Zaman ekseni. | İsteğe bağlı. Onsuz zaman çizelgesi olmaz. |
| **Zaman birimi** | Zaman sütununun nasıl okunacağı. | Yedi birim; bkz. [Eksenler, birimler ve zaman](axes-units-and-time.md#time). Parquet `TIMESTAMP` / `DATE` sütunlarında yok sayılır; panel bunu söyler. |
| **Kişi kimliği** | Bir satırın kime ya da neye ait olduğu. | İsteğe bağlı. İzleri, ömürleri, kutu tekrarını ve çizgi ısısını mümkün kılar. |
| **Oturum / maç** | Bir satırın hangi maça, baskına, tura, koşuya ya da tura ait olduğu. | İsteğe bağlı. Konumlar bir oturum değişiminde asla enterpole edilmez, izlenmez ya da bir güzergâha birleştirilmez. Bkz. [Oturumlar, kişiler ve gruplar](sessions-persons-groups.md). |
| **Takım / grup** | Düşük kardinaliteli herhangi bir sütun. | İsteğe bağlı. Grup renklerini, takım ısısını ve gruba göre fark bölmesini yönetir. |
| **Bakış yönü** | *Yok*, *Yaw / pitch sütunları* ya da *Yön vektörü sütunları*. | Yaw / pitch ile: **Yaw**, **Pitch** ve **Açı birimi** (*Derece* / *Radyan*). Vektörle: **Dir X**, **Dir Y**, **Dir Z**. [Kutu tekrarının](box-replay.md) bakış ışınları için kullanılır. |
| **Filtreleme için tut** | Bellekte tutulan ek sütunlar. | Sütun başına bir kutucuk ve işaretlenen her biri için *aralık* (sayısal) ya da *kategori*. Her biri satır başına 4 bayt tutar ve yüklemede bir çözme geçişi gerektirir. Yalnızca tutulan sütunlar [filtrelenebilir](filters.md), [fark bölmesi](difference.md) için ya da bir [çizgi ısısı](line-heat.md) olay sütunu olarak kullanılabilir. |
| **Örnek satırları göster** | İlk 12 örneklenmiş satırın, tüm sütunlarıyla tablosu. | Tahminleri denetlemek için. |

Açıkça ayarlanmamış ve işaretlenmiş bir filtre sütunu *aralık* olarak okunur. Sayı gibi görünen bir kimlik sütunu çoğu zaman *kategori* olarak daha kullanışlıdır. Aynı anda yalnızca 4 filtre etkin olabilir ([Filtreler](filters.md)).

## Otomatik eşleme nasıl tahmin eder {#how-the-auto-mapping-guesses}

Tahmin [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts) içindedir. Sütun adlarına, örneklenmiş satırlarda hangi sütunların sayısal olduğuna (boş olmayan değerlerin %90'ından fazlası sayı olarak ayrıştırılıyorsa), örnekte her sütunun kaç ayrı değer aldığına ve Parquet mantıksal türlerine bakar. Ad kalıpları sırayla, büyük-küçük harf duyarsız denenir; hâlâ boş herhangi bir sütunla eşleşen ilk kalıp kazanır.

### Konum {#position}

| Eksen | Ad kalıpları, sırayla (yalnızca sayısal sütunlar) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Bir eksen hâlâ boşsa, ilk boş sayısal sütunlar (`filename`, `level`, `year`, `month`, `day`, `hour`, `location` yok sayılarak) sırayla onu doldurur. Yanlış bir tahmin ekranda bariz görünür; boş bir eksen ise boş bir görüş alanı bırakırdı.

### Zaman {#time}

- **Önce Parquet zaman damgası sütunları.** Mantıksal türü `TIMESTAMP` ya da `DATE` olan sütunlar arasında en iyisi puanla seçilir: ad bir zaman kalıbıyla eşleşirse +10.000, düz bir `DATE` için -5.000, artı örnekteki ayrı değer sayısı. Tam günlük bir tarih ve sabit bir oturum başlangıcı neredeyse hiç ayrı değer almaz; bu yüzden olayın anı kazanır. Birim o zaman *Unix zaman damgası (ms)* olur.
- **Aksi halde ada göre:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, sonra geçen süre adları (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Birim sonra değerlerden tahmin edilir: bir değer `YYYY-MM-DDT…` ya da `YYYY-MM-DD …` gibi görünüyorsa ISO-8601; aksi halde en büyük büyüklüğe göre: 10^17 nanosaniyenin, 10^14 mikrosaniyenin, 10^11 Unix milisaniyesinin, 10^8 Unix saniyesinin üstünde, 10^6 milisaniye, değilse saniye.

Geçen süre sütunu seçildiğinde panel, her oturumun kendi başlangıcına hizalandığını not eder. Bu, maçları üst üste bindirmek için iyidir; gerçek sıralarında görmek için değildir.

### Oturum, kişi, grup {#session-person-group}

Oturum, zaman ekseninden **sonra** ve kişi ile gruptan **önce** alınır; çünkü bir oturum sütunu çoğu zaman bir zaman damgasıdır (maçın her satırında maçın başlangıç anı).

| Rol | Ad kalıpları, sırayla |
|---|---|
| Oturum | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (her biri tam olarak, isteğe bağlı olarak `_id` ile) |
| Kişi | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, sonra `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (yarış verisi: hareket eden araçtır) |
| Grup | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grup, yedek | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Örneklenmiş satırların çoğunda ayrı bir değer alan bir grup adayı (max(48, örneklemin %60'ı) değerinden fazla), bir gruptan çok bir kimliktir: hiç kişi sütunu bulunmadıysa kişi sütunu olur ve grup olarak kullanılmaz. Hiç grup sütunu bulunmazsa, 2 ile 12 arasında en az ayrı değeri olan sayısal olmayan sütun kullanılır.

### Bakış yönü {#look-direction}

`yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` ya da `rot_z` / `rotation_z` adlı bir sayısal sütun, bakış yönünü yaw / pitch'e çevirir. Pitch, `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…` olarak aranır. Örneklenmiş herhangi bir yaw'ın büyüklüğü 7'yi aşarsa dereceler varsayılır, aksi halde radyanlar. Bir yön vektörü asla tahmin edilmez; ya aşağıdaki ipuçlarından gelir ya da sizden.

### Filtre sütunları {#filter-columns}

En fazla **6** sütun otomatik tutulur, sıralamaya göre:

1. `region`, `sessionMode`, `actor`: filtrelenmek için var olan sütunlar (puan 1200);
2. örnekte değişen kategori sütunları, az ayrı değeri olan önce (1000 eksi sayı);
3. örnekte sabit bir sütun, ama yalnızca birden fazla dosya yüklendiğinde: dosyalar arasında farklı olabilir, bir bölge ya da bir test-çalıştırma kimliği gibi (600);
4. sayısal sütunlar (500).

Zaten bir rol oynayan sütunlar, yukarıdaki gürültü adları, tek dosyalı bir yüklemede sabit sütunlar ve serbest metin sütunları (max(16, örneklemin yarısı) değerinden fazla ayrı değeri olan) otomatik olarak sunulmaz. Her sütun yine de elle işaretlenebilir.

### Yukarı ekseni {#up-axis}

Üç eksen de eşlenmişken, örnekte Y ve Z'nin daha küçük yayılımına sahip eksen yukarı kabul edilir (bir harita yüksekliğinden çok daha geniştir). Aksi halde Z-yukarı varsayılır.

## Parquet alt bilgisindeki `heat3d` ipuçları {#the-heat3d-hints-in-a-parquet-footer}

Bir Parquet dosyası nasıl okunması gerektiğini söyleyebilir. Dosyanın alt bilgi anahtar/değer üst verisinde **`heat3d`** anahtarlı bir girdi varsa, değeri JSON olarak ayrıştırılır ve tahminlerin üstüne serilir ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). CS2 demo dönüştürücüsü böyle bir girdi yazar; bu yüzden tabloları, oyuncu kişi, taraf grup, her tur bir oturum, bakış yönü açık ve dünya doğru yönde olarak açılır.

Yalnızca bir seçimin **ilk** dosyası ipuçları için okunur. Her girdi isteğe bağlıdır ve ipucu verilen her değer yine panelde görünür ve değiştirilebilir. Şemanın tam açıklaması, bir örnek ve nasıl yazılacağıyla birlikte [Veri biçimleri başvurusunda](data-formats.md#the-heat3d-hints) bulunur.

Kurallar, kısaca:

- Bir ipucunun adlandırdığı bir sütun, yalnızca dosyada o sütun varsa uygulanır.
- `lookMode: "vector"` yalnızca `dirX`, `dirY` ve `dirZ` hepsi ayarlıysa etkili olur; `"yawPitch"` yalnızca `yaw` ayarlıysa.
- `extra`, varsa otomatik filtre listesinin yerine geçer (bilinmeyen adlar ve zaten bir rol oynayan sütunlar atılır); her birinin aralık ya da kategori türü, sayısal görünüp görünmediğine bağlıdır. Yoksa otomatik liste, bir ipucunun rol verdiği sütunlar çıkarılmış olarak korunur.
- `axes.up` `"y"` ya da `"z"` olmalı, çevirmeler mantıksal değer olmalı, `scale` pozitif olmalı.
- `entity.size`, pozitifse, dosyanın birimlerindeki bir izlenen şeyin boyutudur ([varlık boyutu](sessions-persons-groups.md#entity-size)); ayarlamanın tek yoludur.

## Bilinen sorun: CSV ayırıcısını geçersiz kılmak {#known-issue-overriding-the-csv-separator}

Ayırıcıyı algılananından farklı birine değiştirdiğinizde sütun listesi ve örnek satırlar değişmez; önizleme hâlâ algılanan ayırıcıyla böler. Seçilen ayırıcı yükleme için yine de kullanılır. Algılanan ayırıcı yanlışsa:

1. Dosyayı bir metin düzenleyicide açın.
2. Ayırıcıyı her yerde virgülle değiştirin (ve ondalık virgülleri noktalarla).
3. Kaydedin, sonra dosyayı yeniden yükleyin.

Nedeni [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts) içindedir.
