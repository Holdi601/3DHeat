---
title: "Oturumlar, kişiler ve gruplar"
parent: "Veri alma"
nav_order: 4
lang: "tr"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Oturumlar, kişiler ve gruplar

Bir **kişi**, hareket eden tek bir şeydir (bir oyuncu, bir araba). Bir **takım / grup**, onların ait olduğu taraftır. Bir **oturum** ise bir maç ya da bir turdur. Bkz. [terimler sözlüğü](glossary.md).

Bir dosyanın tek bir satırı üçünü de adlandırabilir:

| x | y | zaman | oyuncu | takım | maç |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` kişidir, `team` gruptur, `match` oturumdur.

Üç isteğe bağlı sütun, bir satırın *kime* ve *hikâyenin neresine* ait olduğunu tanımlar. Her biri yüklemede sözlük kodlamasından geçer: metin değerleri, satır başına küçük tam sayı kimliklerine ve yüklemenin her dosyası arasında paylaşılan tek bir etiket listesine dönüşür.

## Kişi {#person}

**Kişi kimliği** sütunu, bir satırın ait olduğu hareket eden şeyi adlandırır: bir oyuncu, bir bot, bir araba. Satır başına 32 bitlik bir kimlik olarak saklanır.

Bir kişi ve bir zaman sütunuyla, yükleme her satırın **ömrünü** hesaplar: aynı kişinin *aynı oturumdaki* bir sonraki örneğine kadar geçen süre. Bir sonraki örnek yoksa "yok" (-1 nöbetçisi) olur; kişi öldü, ayrıldı ya da kaydın sonuna gelindi. Ömürler, [zaman çizelgesinin](timeline.md) **Ömür** geçmişini, [kutu tekrarındaki](box-replay.md) enterpolasyonu ve eskimeyi, ve [çizgi ısısının](line-heat.md) güzergâh kırılmalarını besler. Bir sonraki örneği olmayan bir satırın ne yaptığı bir görüntüleme ayarıdır (*Yedek ömür*), veriye gömülü değildir.

Her kişiye, zaman içindeki **ilk** satırının grubu verilir. Bu atama, kutu tekrarında onların kutusunu boyar ve orada hangi grubun görünürlük anahtarının onları gizleyeceğine karar verir. Isı modları bunun yerine her satırın kendi grubunu kullanır.

### Aynı anda birçok şeyin taşıdığı adlar {#names-worn-by-several-things-at-once}

Bir ad her zaman tek bir varlık değildir: bazı dışa aktarımlarda her maçın her botu tek bir ad altında kaydedilir. Böyle bir "kişinin" iki örneğini (enterpolasyonla, bir izle ya da bir güzergâhla) birleştirmek, haritada iki farklı yaratık arasında bir çizgi çizer.

Yüklemede ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) bir ad, iki kaydı şunları sağladığında **paylaşılan** olarak işaretlenir:

- aynı oturumdaysa,
- aynı zamanı taşıyorlarsa,
- aynı türdeyse (tutulan her kategori sütunu aynı değere sahipse) ve
- verinin kapsamının köşegeninin %1'inden daha uzaksalar.

Paylaşılan adlar tek örnekler olarak çizilir: enterpolasyon yok, iz yok, çizgi ısısı güzergâhı yok. Onlarla ilgili diğer her şey (ısıları) etkilenmez. Veri kümesi paneli kaç adın işaretlendiğini, en fazla üç örnekle listeler; kutu tekrarı paneli sayıyı yineler.

## Oturum {#session}

**Oturum / maç** sütunu, bir satırın hangi maça, baskına, tura, koşuya ya da tura ait olduğunu söyler. Bir kişinin örneklerini tek ve sürekli bir iz yapan budur: gerçek telemetri çoğu zaman eşzamanlı maçları iç içe geçirir ve oynatma kafasının hemen öncesindeki bir oyuncu örneği ile hemen sonrasındakiler yüzlerce metre uzaktaki farklı maçlardan olabilir. Bir oturum sütunuyla:

- enterpolasyon, izler ve çizgi ısısı güzergâhları asla bir oturum değişiminin üstünden geçmez;
- bir satırın ömrü kendi oturumunun sonunda biter;
- **Oturum** seçicisi kenar çubuğunun üstünde, mod çubuğunun altında görünür.

Bir oturum sütunu çok sık bir *zaman damgasıdır*: maçın başlangıç anı, o maçın her satırında tekrar eder. Otomatik eşleyici bu yüzden kişi ve gruptan önce oturum adlarına bakar ([Sütun eşleme](column-mapping.md#session-person-group)). Bir yarış turu ya da bir stint de bir oturumdur: aynı araçtan iki tur tek bir izde birleştirilmemelidir.

### Oturum seçicisi {#the-session-picker}

![On maçlık bir dosyada açık Oturum seçicisi: Tüm oturumlar (10), Match 01, Match 02 ve benzeri](../assets/img/en/sessions-persons-groups-picker.webp)

*Bir dosyada on maç: birini seçin ya da hepsini görün.*

Veri kümesinin listelenmiş oturumları olduğunda gösterilir (aşağıdaki sınıra bakın).

| Parça | Anlamı |
|---|---|
| Sağdaki etiket | Seçili oturumun satır sayısı ya da *hepsi bir arada*. |
| Menü | *Tüm oturumlar (N)*, sonra her oturum, en yoğun olan önce, `etiket - N satır, açıklık` biçiminde (açıklık 90 sn'nin altında saniye, 90 dakikanın altında dakika, üstünde saat olarak). |
| Sarı ipucu | *Tüm oturumlar* seçiliyken gösterilir: konumlar yine oturumlar arasında asla birleştirilmez, ama eşzamanlı maçlar ilgisiz oyuncuları haritada bir araya getirir. |
| İpucu | Bir oturum seçiliyken ısı modlarında gösterilir: seçim yalnızca oynatma kafasını taşır. |

Yüklemede en yoğun oturum seçilir. Bir oturum seçmek, oynatma kafasını o oturumun başına götürür.

Seçim neyi değiştirir:

- **[kutu tekrarında](box-replay.md)** hangi oturumun oynatılacağına o karar verir: yalnızca o oturumun kutuları ve izleri çizilir, zaman çizelgesinin aralığı oturumun kendi açıklığı olur.
- **Isı modlarında** ısıyı sınırlamaz. Seçicinin altındaki bir ipucu bunu söyler: *Isı modlarında bu yalnızca oynatma kafasını oturumun başına taşır; ısı yine tüm oturumları sayar. Kutu tekrarı seçilen oturumu tek başına oynatır.* Isıyı bir oturumla sınırlamak için, oturum sütununu filtre sütunu olarak da tutun (*Filtreleme için tut*) ve ona göre filtreleyin. Bir sütun hem oturum sütunu hem de filtre sütunu olabilir: yükleyici, üstlendiği rol ne olursa olsun, işaretlenmiş her filtre sütununu kendi başına okur.

### Çok fazla oturum {#too-many-sessions}

En fazla **100.000** oturum listelenir. Bunun ötesinde sütun gerçekte bir kimliktir (her biri birkaç satırlık milyonlarca oturumu olan bir klasör); bu kadar etiketi çalışandan sayfaya göndermek bir sekmenin belleğini tüketir. Yükleme o zaman oturum **kimliklerini** tutar, böylece sınırlar yine her yerde uygulanır; ama etiketleri ve seçiciyi düşürür ve veri kümesi paneli bunu söyler.

## Grup {#group}

**Takım / grup** sütunu, düşük kardinaliteli herhangi bir sütundur: bir takım, bir taraf, bir kadro, bir hizip, bir oyuncu-karşı-yapay zekâ bayrağı, bir araba sınıfı. Satır başına 16 bitlik bir kimlik olarak saklanır ve şunları yönetir:

- [Takım listesi](teams-list.md) (grup başına görünürlük, + / − taraflar),
- [takım ısısı](team-heat.md) (grup başına bir ton),
- [gruba göre fark](difference.md) bölmesi,
- [kutu tekrarında](box-replay.md) kutu renkleri (grup başına bir ton ailesi, üye başına bir gölge).

### Sınırlar {#limits}

En fazla **4.096** ayrı grup. Grup kimliği, GPU'daki her satırın konum texelinin dördüncü kanalında taşınır ve her grubun, gölgelendiricinin *gizli*, *eklenen* ya da *çıkarılan* olduğuna karar vermek için okuduğu 4.096 genişliğindeki işaret tablosunda bir texel'e ihtiyacı vardır. Daha fazla ayrı değer içeren bir sütun bir gruptan çok bir kimliktir: **yükleme her satırı tutar ve yalnızca gruplamayı düşürür**; veri kümesinde bunun yerine onu kişi sütunu olarak eşlemeyi ya da bir filtre sütunu olarak tutmayı öneren bir uyarı çıkar.

Aynı 4.096 sınırı, tutulan bir *kategori* filtre sütunu için de geçerlidir; daha geniş bir sütun tutulmaz ve veri kümesi bunu söyler. Sayısal bir sütunun (diyelim bir zaman damgası) bir *aralık* filtresi olarak böyle bir sınırı yoktur.

Grup değerleri `0`, boş bir değer, `none`, `unknown`, `null` ve `-1` (büyük-küçük harf duyarsız) [takım ısısına](team-heat.md) "grup yok" demektir; bunları kendinden emin bir renk yerine nötr gri olarak çizer.

## Varlık boyutu {#entity-size}

İzlenen tek bir şeyin, bir oyuncunun çarpışma kutusunun ya da bir arabanın ne kadar büyük olduğu, [kutu tekrarındaki](box-replay.md) kutuların ve bakış ışınlarının ne kadar büyük çizileceğine karar verir. Panelde bunun bir alanı yoktur; dosyanın [`heat3d` ipuçlarından](data-formats.md#the-heat3d-hints) gelir (`entity.size`, dosyanın kendi birimlerinde; CS2 dönüştürücüsü 32 yazar). Yükleme bunu birim ölçeğiyle çarpar.

Her yüklemede ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), *kapsam* verinin X ve Z açıklıklarının büyük olanı olmak üzere:

| Ayar | Varlık boyutuyla | Olmadan |
|---|---|---|
| Küp boyutu | varlık boyutu | kapsam / 500 |
| Bakış ışını uzunluğu | varlık boyutu × 4 | kapsam / 200 |
| Sprite yarıçapı | kapsam / 120 | kapsam / 120 |
| Doygunluk noktası | analitik tahmin (sonra ölçülür) | aynı |
| Uçuş hızı | kapsam / 12 | aynı |
| Uzak düzlem | kapsam × 12 | aynı |
| Yakın düzlem | max(0,05; kapsam / 20.000) | aynı |

## Veri kümesi paneli {#the-dataset-panel}

Kaynak panelinin altında. Bir veri kümesi yüklüyken şunları gösterir:

- veri kümesinin **adı**: seçim, satır sayısı, dosya sayısı ve bir azaltma adımı kullanıldıysa adım;
- **`N takım · N kişi · N sn açıklık`**;
- yükleme sırasında oluşan her **uyarı**, veri kümesi yüklü olduğu sürece sarı olarak: çok fazla değer yüzünden düşürülen gruplar ya da bir filtre sütunu, listelenmeyen oturumlar, paylaşılan adlar, eksik satırlar, atlanan dosyalar;
- [yapay veri üretici](synthetic-generator.md);
- veri kümesini kaldıran **Kaldır**.

Satır sayısı panelin başlığında gösterilir.
