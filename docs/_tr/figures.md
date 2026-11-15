---
title: "Figürler"
parent: "Tekrar"
nav_order: 3
has_children: true
lang: "tr"
source: "figures.md"
source_hash: "7040eba3b7ac"
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
| Yakın dövüş | plaka taşıyıcı yelekli, piyade tüfeği, hafif makineli tabanca, pompalı tüfek, DMR, hafif makineli tüfek, tabanca ya da kalkanlı askerler; dronlar, kameralar, dikenli tel, kalkanlar, duvar güçlendirme, barikatlar, kırma şarjları, tuzaklar, pencereler, el bombaları, imha kiti |

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

## Yakın dövüş figürleri (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Rainbow Six Siege tekrar okuyucusununki gibi yazılmış tablolar (`operator`, `pawn`, `primaryClass`, `side` sütunları) kendi figürlerini alır:

- **Oyuncular** kendi operatörleridir. 78 operatörün her birinin kendi figürü vardır: yaklaşık 1,8 m boyunda, kendi kıyafetleriyle. Ceket, pantolon ve teçhizat için, alışılmış kamuya açık görünümlerine göre iki ya da üç renk (siyah, zeytin yeşili, haki, kent grisi, beyaz, lacivert; kırmızı, turuncu ya da camgöbeği teçhizatla). Kendi şekilleriyle de: yukarıdan görünmeleri gereken yerlerde gerçeğinden üçte bir daha büyük. Başlık (miğferler, bir vizör ya da ağır miğfer, şapkalar, bereler, kasketler, geniş bir boonie şapka ya da kürk şapka, kapüşonlar, atkılar, saç), yüz (koruyucu gözlük, gaz maskesi, gözlük, maske, sakal, üç camlı gözlük), hafif, orta ya da ağır yapı (ağır olanlar geniş, büyük omuz plakaları ve yakalı), uzun bir palto ya da takım elbise, ghillie kıyafeti, sırtlarında taşıdıkları (çekiç, şarjlar, dronlar, tüpler, yakıt tankı, fırlatıcı borusu, arbalet, paneller, karıştırıcı, kalkan) ya da kollarındaki (fırlatıcı, metal kol), kendi kalkanları (uzun bir kalkan, çevik kuvvet kalkanı, ışıklı bir kalkan) ve omuzlarda bir vurgu rengi. Ana silahlarının sınıfını tutarlar. Görüntüleyicinin tanımadığı bir operatör, takım renginde, plaka taşıyıcı yelekli sade bir askerdir.
- **Taraf** kıyafetten ayrı görünür: her operatörün altında yerde bir halka, **saldırı için kehribar, savunma için açık camgöbeği**, içinde takımın rengi; aynı renkte kol ve baş bantları. Bir `stance` sütunu (ayakta, çömelmiş, yüzüstü) duruşlarını belirler; bu sütun yoksa ayakta dururlar.
- **Tekrar mesafesinden ayırt edilir:** yukarıdan ve dörtte üç açıdan 48 piksel yükseklikte çizildiğinde, bir taraftaki her iki operatör belirgin bir renk farkıyla ya da farklı bir şekille ayrılır (görüntüleyicinin testleri bunu kontrol eder).
- **Etiketler** oyuncuyu ve o anda oynanan operatörü adlandırır; operatörün rolü bir sembolle gösterilir: ✸ sert kırıcı, ⚒ yumuşak kırıcı, ➤ giriş, ✦ fragger, ✚ destek, ⬟ kalkan, ◉ istihbarat, ◇ esnek, ↺ kanat gözcüsü, ⚓ çapa, ✕ tuzakçı, ⇄ gezgin, ↯ ekipman karşıtı, ▣ kırma karşıtı.
- **Dronlar** iki tekerlekli, atılabilen bir drondur, yaklaşık 30 cm genişliğindedir. Her biri sahibinin adını taşıyan kendi izidir (“Ash · drone 2”).
- **Yerleştirilen ekipmanlar** konuldukları yerde, o andan raundun sonuna kadar durur. Her biri yaptığı işin figürüdür: kamera, dikenli tel, açılır kalkan, kırma şarjı, sert kırma şarjı, küçük yapışkan şarj, zemin tuzağı, tetik lazeriyle bir claymore, tek yönlü pencere, zırh paneli, el bombası, gaz tüpü, karıştırıcı, sensör, lazer kapısı, ikmal kutusu. Aynı işi yapan her ekipman için tek bir figür kullanılır. Türünü verinin söylemediği bir ekipman, ışıklı küçük bir cihazdır.
- **İmha kiti** kurulduğu yerde 45 saniyesi boyunca durur.

Dosya yüklenirken her dron ve ekipman kendi izi olur, böylece oyuncunun kendi figürü kendi bedeninde kalır. Operatörler, kamuya açık tanımlarına ve görsellerine göre basitleştirilmiş şekillerdir (ne giydikleri, yetenekleri olan cihaz); ekipmanların şekli ise yaptıkları işten gelir. Bunların hepsi görüntüleyicinin kendi tasarımlarıdır, nesnenin gerçek boyutundadır (yaklaşık 22 cm genişliğinde bir claymore, 1 m'ye 2,1 m kapı boyutunda bir panel); oyundan alınmış modeller değildir.

## Ayarlar {#settings}

Tekrar kenar çubuğunun **Figürler** bölümü boyutu, ekrandaki en küçük boyutu, uzaktaki birimlerin neye dönüşeceğini (figür, ok, sembol) ve üzerlerinde çizilen efektleri ayarlar. Bkz. [Maç tekrarı](match-replay.md#figures). Duman, yangın ve diğer zamanlı efektler: [Figür bindirmedeki figürler](figure-replay.md).

## İsteğe bağlı yerel bir figür paketi {#an-optional-local-figure-pack}

Kendi makinenizde isteğe bağlı kendi figür paketinizi tutabilirsiniz. Paketinizdeki figürler, aynı adlı katalog figürlerinin yerini alır. Hiçbir zaman deponun ya da yayımlanmış bir derlemenin parçası değildir; biri yoksa hiçbir şey değişmez.
