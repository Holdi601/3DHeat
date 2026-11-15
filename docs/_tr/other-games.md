---
title: "Diğer yarış oyunları"
parent: "Yarış analizi"
nav_order: 59
lang: "tr"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Görüntüleyicideki diğer yarış oyunları

Görüntüleyici yalnızca tek bir oyundan değil, birçok yarış oyunundan tur okur. Bu sayfa bu oyunları listeler ve her birinden bir turun nasıl alınacağını anlatır.

## Oyunlar {#the-games}

| Oyun | Kaydedici | Dosyada kayma var mı? | Dünya aynalı mı? | Notlar |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (UDP üzerinden Data Out), ya da FH Companion'ın tur dosyaları ve `.tele.gz` dosyaları | evet, tekerlek başına (normalleştirilmiş) | evet (sol elli dünya) | Her FH Companion tur dosyasının yanındaki `.tele.gz` her tekerleğin kaymasını verir; tur dosyası tek başına vermez |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (paylaşımlı bellek) | evet, tekerlek başına | turlardan ölçülür | ayrıca ABS ve çekiş kontrolünün devrede olması, tekerlek yükleri, sıcaklıklar |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | hayır, tekerlek hızlarından hesaplanır | turlardan ölçülür | ralli: gevşek zemin ve sıçramalar farklı değerlendirilir |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | hayır | turlardan ölçülür | tekerlek hızı yok |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (bir mod) | hayır, tekerlek hızlarından hesaplanır | turlardan ölçülür | |
| Trackmania | Openplanet eklentisi, `telemetry --game trackmania --install` | tekerlek başına bir kayma katsayısı | turlardan ölçülür | arkade fizik: kaymalar farklı değerlendirilir |
| iRacing | yok: kendi `.ibt` dosyası | hayır (kaydedilmez); yaw'dan hesaplanır | hayır (GPS tabanlı) | arabada Alt+L ile kaydı açın |

## Tur nasıl kaydedilir {#how-to-record-a-lap}

1. Tablodan oyununuzu seçin ve kaydediciyi o oyun için sayfasında anlatıldığı gibi kurun (oyunda bir ayar, bir mod ya da iRacing için hiçbir şey). Adımlar oyuna göre değişir; bu yüzden kaydedicilerin belgelerinde yer alırlar: [GameCapture: oyunlar](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Kaydediciyi başlatın, sonra sürün. Her tur için bir dosya yazar.
3. **Yarış analizi** sekmesinde **Tur dosyalarını yükle…** düğmesine basın ve aynı pistin iki veya daha fazla turunu seçin (bkz. [Turları yükleme](race-loading-laps.md)).

Ralli oyunlarında kaydedici her etap sürüşü için bir dosya verir. Forza için en kolay başlangıç, `.tele.gz` dosyaları tur dosyalarının yanındayken FH Companion kütüphanesidir.

## Kaydediciler neyi belgeler {#what-the-recorders-document}

Her oyunun nasıl kaydedildiği, ne gönderdiği, düzenleri için kaynaklar ve dosyalarından hangi pistlerin dışa aktarılabileceği, kaydedicilerin belgelemesi gereken konudur: [GameCapture: oyunlar](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (herkese açık, [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) içinde). Her kaydedicinin yazdığı tur dosyası ise [GameCapture: tur biçimi](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md) sayfasında anlatılır.

## Görüntüleyici bunlarla ne yapar {#what-the-viewer-does-with-them}

Her oyun sonunda `heat3d-lap` dosyalarına dönüşür (ya da bir tur CSV'sine, ya da iRacing'in `.ibt` dosyası gibi doğrudan okunur). Kanal adları `src/race/schema.ts` dosyasındaki standart adlardır ve bir `meta` bloğu sayılarının ne anlama geldiğini söyler: kaymasının nasıl ölçeklendiği, pistin mi ralli mi arkade mi olduğu, biliniyorsa yüzey. Böylece **Yarış analizi** sekmesi hepsini aynı şekilde işler. Bir pist modeli yüklü değilse **Yarış analizi** sekmesi yolu turların kendi yayılımından çizer; bu yüzden her oyun bir model olmadan da kullanılabilir.

Hiçbir ralli oyununun göndermediği lastik kaymasını görüntüleyici kendisi hesaplar. Bir oyun her tekerlek için temas yamasını ya da yüzey hızını gönderiyorsa kayma, bunu arabanın hızıyla karşılaştırarak bulunur (`(wheel - car) / car`). Oyun yalnızca dönüşü gönderiyorsa, kayma dönüşten ve turun kendisinde ölçülen bir yuvarlanma yarıçapından bulunur. Sürüklenme açısı arabanın kendi hız vektöründen gelir (Forza, AC oyunları, Trackmania, RBR), ya da dünya hız vektörünün arabanın eksenlerine izdüşümünden (EA WRC, DiRT, BeamNG), ya da başın yola göre açısından. Arabanın havada olup olmadığı tekerleklerinin temasından, yüklerinden ya da süspansiyonundan anlaşılır. Bkz. `src/race/derive.ts`.

Bir oyunun dünyası sol elli ise (Forza'nınki öyledir) pist görüntüleyicide aynalı çıkar. Turların kendi direksiyon ve süspansiyon verileri bunu ele verir ve **Yarış analizi** sekmesi bir eksenin tersine çevrilmesini önerir. Elliliği belgelenmemiş oyunlar (RBR, BeamNG, Trackmania) da aynı şekilde ele alınır: varsayılmaz, ölçülür.

Sürüş kanallarının ötesinde kaydediciler her oyunun eklediklerini de tutar: AC oyunlarında ABS ve çekiş kontrolünün devrede olması, fren dağılımı, DRS, pit limiter, turbo ile fren balatası ve disk ömrü; iRacing'de yardım ayarları, fren dağılımı, yakıt, yağ ve su sıcaklıkları ile kendi adıyla kaydettiği her kanal. Görüntüleyici bunları kanal tablosundan çizer (göstergeler, seviyeler, simgeler, grafikler). Bu yüzden daha fazla şey kaydetmek görüntüleyicide değişiklik gerektirmez.
