---
title: "Figür bindirmedeki figürler"
parent: "Figürler"
grand_parent: "Tekrar"
nav_order: 2
lang: "tr"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figür bindirmedeki figürler

Bu sayfa, kutuları her birimin gerçekte ne olduğunun küçük 3B figürlerine çevirmekle ve figürlerin arkasında bıraktığı duman ve yangınla ilgilidir. Tekrarın kendi denetimleri [Maç tekrarı](match-replay.md) sayfasındadır.

[Kutu tekrar oynatma](box-replay.md) ve Maç sekmesinin figür tekrarında **Kutular yerine figürler** (varsayılan olarak açık), her canlı kişiyi ne olduğunun figürü olarak çizer: yürüyen bir asker, birinin sürdüğü tank, bir Tacview izinin uçağı. Figür, kutunun rengine, yerine ve yönüne sahiptir. Uçaklar ve füzeler için ayrıca yunuslama (pitch) ve verinin bir Roll sütunu varsa yatış (bank) vardır. **Figür boyutu** onları ölçekler; 1 kat gerçek boyuttur. Bir figüre tıklamak, kutusuna tıklanmış gibi yanıt verir.

## Hangi figür {#which-figure}

Verinin kendi ad ve tür sütunları karar verir. Sütun adlarıyla birlikte tam kurallar [Figürler](figures.md#which-figure-a-unit-gets) sayfasındadır. İki tür sütunun da olmadığı veri, insanların verisidir: herkes bir askerdir.

Eşleşme etikete göre önbelleğe alınır; bu yüzden bir kare yalnızca yerleştirme maliyeti taşır. Bir veri birimi, verinin tek bir izlenen nesnenin ne kadar büyük olduğunu söylemediği sürece bir metredir (CS2 dışa aktarımı bir oyuncunun 32 birim genişliğinde olduğunu söyler); figürler buna göre ölçeklenir.

Kendi figürlerinizden oluşan isteğe bağlı bir paket, makinenizde katalog figürlerinin yerini alabilir; bkz. [Figürler](figures.md#an-optional-local-figure-pack).

## Efektler {#effects}

Bir süre bir şey bırakan olay satırları, neden olanın renginde, olduğu yerde, süresi boyunca çizilir: bir duman (yaklaşık 18 sn), bir molotov ya da yakıcı (7 sn), bir flaş (yaklaşık bir saniye) ve bir HE patlaması (bir saniyeden kısa), bir yem (15 sn), yerleştirilmiş bir bomba (40 sn). Bunlar, etiketi `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` ya da `plant` olan bir olay sütunundan (Event, Events) gelir; CS2 dışa aktarımı bunları patlama anında yazar.

## Maç tekrarı: Tacview'un araçları {#match-replay-tacviews-tools}

Kameralar, yer imleri, taktik görüntü, istatistikler, etiketler, **Dikey çizgiler**, olay listesi ve grafik penceresi [Maç tekrarı](match-replay.md) sayfasında anlatılır. [Tacview eşdeğerliği](tacview-parity.md) her Tacview özelliğini ve bulunduğu durumu listeler.
