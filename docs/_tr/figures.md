---
title: "Figürler"
parent: "Tekrar"
nav_order: 3
has_children: true
lang: "tr"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Figürler

Bir **figür**, bir birimin gerçekte ne olduğunun küçük bir 3B modelidir: bir tank, bir jet, bir gemi, bir asker. [Tekrar oynatma](match-replay.md), her birimi düz bir kutu yerine gerçek boyutunda kendi figürüyle çizer.

Görüntüleyicinin kendisi tarafından yapılmış, yaklaşık 2.000 adlandırılmış araç, uçak, gemi, silah ve asker vardır.

![Demodaki tanklar kendi figürleriyle çizilmiş](../assets/img/tr/replay-tanks.webp)

## Kataloğunda neler var {#what-is-in-the-catalogue}

| Alan | Örnekler |
|---|---|
| İnsanlar | ayakta, çömelmiş, yatar asker; keskin nişancı, tanksavar, sağlıkçı, mürettebat |
| Kara | tanklar, piyade savaş araçları, hava savunması, topçu, kamyonlar ve arabalar, trenler ve tramvaylar |
| Hava | savaş uçakları, saldırı uçakları, bombardıman uçakları, nakliye uçakları, helikopterler; çift kanatlı uçaklardan modern jetlere |
| Deniz | sınıfına göre savaş gemileri, uçak gemileri, denizaltılar, botlar, ticaret gemileri |
| Silahlar | füzeler, roketler, bombalar, torpidolar, fişekler ve metal şeritler |
| İşaretçiler | duman, parlama ve yangın bombaları, yerleştirilmiş bombalar, bayraklar, doğma noktaları, rota noktaları |

## Figürler nasıl yapılır {#how-the-figures-are-made}

- **Yayımlanmış boyutlardan yapılır.** Çoğu figür, görüntüleyicinin kendi figür oluşturucusuyla herkese açık sayılardan yapılır: uzunluk, genişlik, yükseklik, yol tekerlekleri, kule ve top, kanatlar ve kuyruk. Biçimleri sonra herkese açık fotoğraflara, çizimlere ve yayımlanmış boyutlara göre ayarlanır. Hiçbir oyunun modelleri kullanılmaz.
- **Ücretsiz modeller.** Birkaç figür, daha gerçekçi olduklarında ücretsiz 3B modeller kullanır (CC0 ya da CC BY); bazen yapılmış gövdeyle birleştirilerek. CC BY eserlerin yazarları [Figür künyeleri](figure-credits.md) sayfasında belirtilir; CC0 eserler künye gerektirmez ve orada listelenmez.
- Her figürün tam, kaba ve uzak sürümleri vardır (ayrıntı düzeyleri, LOD); böylece binlercesi aynı anda çizilebilir.

## Bir birim hangi figürü alır {#which-figure-a-unit-gets}

Görüntüleyici verinin kendi sütunlarına bakar:

1. **Adlar**: *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* ya da *Figure* adlı sütunlar kataloğla eşleştirilir: tam olarak, yaklaşık 4.000 takma ad üzerinden (birkaç oyunun birim kimlikleri), bilinen en uzun başlangıçla (`F-16C_50` F-16C'dir) ya da onunla başlayan en kısa figür adıyla.
2. Bir figürün adı, birimin **türüyle** uyuşmuyorsa kullanılmaz (*Typhoon* adlı bir kamyon savaş uçağı değildir).
3. **Türler**: *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* ya da *Domain* adlı sütunlar bir sınıf figürü verir: Tacview etiketleri (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), harita simgeleri ya da düz kelimeler (tank, helikopter, piyade).
4. İkisi de olmayan veri, insanların verisidir: herkes bir askerdir.

Yani doğru figürleri almanın en kolay yolu, gerçek adlarla bir `vehicle` sütunu ya da Tacview etiketleriyle bir `type` sütunudur.

**Birimim bir kutu ya da asker olarak görünüyor.** Gerçek adla bir `vehicle` sütunu ya da bir Tacview etiketiyle bir `type` sütunu ekleyin. Hangi adın eşleştiğini görmek için birimin üzerine gelin. Bu tür sütunları olan ama bir birim hakkında hiçbir şey söylemeyen veri, onu kutu olarak bırakır; ikisi de olmayan veri askerler olarak çizilir.

## Ayarlar {#settings}

Tekrar kenar çubuğunun **Figürler** bölümü boyutu, ekrandaki en küçük boyutu, uzaktaki birimlerin neye dönüşeceğini (figür, ok, sembol) ve üzerlerinde çizilen efektleri ayarlar. Bkz. [Maç tekrarı](match-replay.md#figures). Duman, yangın ve diğer zamanlı efektler: [Figür bindirmedeki figürler](figure-replay.md).

## İsteğe bağlı yerel bir figür paketi {#an-optional-local-figure-pack}

Kendi makinenizde isteğe bağlı kendi figür paketinizi tutabilirsiniz. Paketinizdeki figürler, aynı adlı katalog figürlerinin yerini alır. Hiçbir zaman deponun ya da yayımlanmış bir derlemenin parçası değildir; biri yoksa hiçbir şey değişmez.
