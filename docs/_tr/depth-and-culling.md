---
title: "Derinlik ve eleme"
parent: "Isı modları"
nav_order: 4
lang: "tr"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Derinlik ve eleme

Derinlik, tıpkı gerçek bir duvarın bir insanı gizlemesi gibi, tepelerin ve duvarların arkasındaki ısıyı gizler. Uzaklık elemesi, kameraya göre yakın ve uzak bir mesafe arasındaki ısıyı tutar.

![Bir tepenin arkasında alçak bir kamera; Arazinin arkasını gizle kapalı (solda) ve açık (sağda)](../assets/img/en/depth-and-culling-terrain.webp)

![Uzak 400 m ve Seviyeyi de kes açık olan uzaklık elemesi: kameranın çevresindeki harita dilimi](../assets/img/en/depth-and-culling-far.webp)

Derinlik olmadan, 3B bir [seviyenin](levels.md) üzerindeki ısı haritası düz bir bindirmedir: veri kümesinde ne varsa her duvardan tam güçle parlar, seviyenin sağladığı derinlik ipuçları iptal olur ve bir binanın içindeki sıcak nokta, çatısındakiyle aynı görünür. **Derinlik** bölümü, seviyenin arkasında kalanı gizlemesini sağlar; **Uzaklık elemesi**, ısıyı kameranın etrafındaki bir kabukla ya da levhayla sınırlar; [Dilim](slice.md) ise dünyadan bir levha keser. Üçü de ısı modlarına uygulanır ve hangi satırların katkı yaptığını değiştirir; bu yüzden birini değiştirmek birikimi yeniden başlatır.

## Derinlik {#depth}

İki denetim de bir [seviye](levels.md) gerektirir - bir harita görseli ya da bir 3B model. Hiçbir seviye yüklü değilse arkasında gizlenecek bir şey yoktur ve bunlar hiçbir şey yapmaz. [Yere düz yerleştir](sprite-shape.md#flatten-onto-ground-plane) açıkken ikisi de kapalıdır.

### Arazinin arkasını gizle {#hide-behind-terrain}

**Arazinin arkasını gizle** (varsayılan açık): kameraya bakan en yakın yüzeyi *zemin* olan (bir yapı değil) bir veri noktası, yalnızca soluklaştırılmak yerine tamamen atılır.

Arazi ve duvarlar farklı biçimlerde opaktır. Trafiğin hangi katta olduğunu görmek için bir duvarın *içinden* bilerek bakarsınız; bir tepenin içinden asla bakmak istemezsiniz, çünkü arkasında haritanın uzak yanı vardır - kilometrelerce genişliğindeki bir haritada verinin büyük kısmı odur ve ufuk boyunca toplanarak ön plandakinden daha parlak bir şerit oluşturur. Tek bir soluklaştırıcı ikisine birden hizmet edemez; bu yüzden arazi bir kesme sınırı alır, duvarlar ise aşağıdaki soluklaştırıcıyı kullanmaya devam eder.

### Geometrinin arkasında gizli {#hidden-behind-geometry}

**Geometrinin arkasında gizli** (varsayılan 0,8): seviye geometrisinin arkasındaki bir veri noktasının ne kadar güçlü bastırıldığı. Değer 0'da *içinden görünür*, aradaki değerlerde *%N daha koyu* (ölçülen soluklaşma değil, kaydırıcının konumu), 1'de *tamamen gizli* anlamına gelir.

Nokta ile kamera arasındaki her duvar ya da zemin onu daha da soluklaştırır: varsayılanda bir duvar, birkaç yüzde bırakır ve her ek yüzey kalanı yarıya indirir; dört yüzeye kadar. 1'de geometrinin arkasında hiçbir şey çizilmez ve bu en ucuz ayardır.

Ayrıca bkz. [Seviye görünümü](level-appearance.md).

## Uzaklık elemesi {#distance-culling}

**Uzaklık elemesi** (varsayılan olarak kapalı), ısıyı kameradan bir yakın ve bir uzak sınır arasındaki satırlarla sınırlar. Haritanın uzak tarafı üstüne toplanmadan bir binanın içindeki yoğunluğu okumak için bir uzak sınır koyun; bir sıcak noktaya *içinden* uçmak için ise bir yakın sınır koyun.

| Denetim | Varsayılan | Aralık (kaydırma) | Anlamı |
|---|---|---|---|
| **Yakın** | kapalı | 0,5-5000 m, logaritmik, izin altındaki %5 = kapalı (200.000) | Bundan daha yakın satırlar atlanır. |
| **Uzak** | kapalı | 1-200.000 m, logaritmik, alt kısım = kapalı (10.000.000) | Bundan daha uzak satırlar atlanır. |
| **Bir düzlemde kes** | açık | | Sınırları gözden değil, bakış ekseni boyunca ölçer; böylece kesim, sizi çevreleyen bir küre yerine ekrana paralel bir düzlemdir. Bir kürenin kenarı çerçevede eğrilir ve siz döndükçe kayar; bir düzlem, yerleştirdiğiniz yerde kalır. |
| **Seviyeyi de kes** | açık | | Zemini, yapıları ve suyu aynı sınırlarda kes. Seviye bütün bırakılırsa kesim veri noktalarını kaldırır ve bina onların önünde durur; ikisi de kesilirse harita boyunca bir kesit olur ve noktalar kendi duvarlarına ve zeminlerine oturur. Bu yalnızca yeniden çizer; birikimi yeniden başlatmaz. |

### Klavye {#keyboard}

Uzak sınır, süpürdüğünüz bir denetimdir - onu bir binanın içinden geçirip trafiğin hangi kata ait göründüğünü izlersiniz - bu yüzden uçarken klavyededir ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tuş | Etkisi |
|---|---|
| `]` | Uzak sınırı 1,12 çarpanıyla dışarı it (Shift: 1,35) |
| `[` | Aynı çarpanla içeri çek |
| `\` | Uzak sınırı kapat, ya da bırakıldığı mesafede yeniden aç (ilk seferde 6000) |

Adımlar geometriktir, çünkü kullanışlı aralık bir odadan bir haritaya kadar dört kat büyüklüğü kapsar. Klavye, uzak sınırı 100 ile 400.000 arasında tutar. Bir metin kutusu ya da menü odakta olduğunda tuşlar hiçbir şey yapmaz.

## Geliştiriciler için {#for-developers}

### Arazinin arkasını gizle {#hide-behind-terrain}

Yapılar kendi derinlik dokusuna çizilir. Sahnenin derinliğinin arkasında ama yapıların derinliğinin *arkasında olmayan* bir fragment, zeminin arkasındadır ve atılır. Anahtar kapalıyken atlanan, yapılar üzerinde bir derinlik geçişine mal olur.

### Geometrinin arkasında gizli {#hidden-behind-geometry}

**Yüzey başına** sayılır. Tek bir derinlik karşılaştırması yalnızca "önde bir şey var" diyebilir; bu yüzden bir duvarın arkasındaki bir nokta ile bir binanın içinde dört oda derinlikteki bir nokta aynı derecede soluklaşır ve iç mekan tek bir soluk leke olarak okunur. Bunun yerine yapı geometrisi, en fazla 3 ek katmana **derinlik soyulur** ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); her fragment önünde kaç yüzey olduğunu sayar (sahnenin kendi derinliği ile soyulmuş katmanlar: en fazla dört) ve soluklaşma birleşir:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Kaydırıcı | 1 yüzey | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | %25 | %12,5 | %6,25 | %3,1 |
| 0,8 (varsayılan) | %4 | %2 | %1 | %0,6 (taban) |
| 1,0 | çizilmez | çizilmez | çizilmez | çizilmez |

Neden iki faktör: kaydırıcı, bir duvarın birkaç yüzde bırakacak şekilde kalibre edilmiştir - "bir şeyin arkasında" diye okunan görünüm budur - ve birkaç yüzde birleşince üçüncü duvarda hiçbir şey kalmazdı; her ek yüzeyde yarıya inmek dört ayırt edilebilir adım tutar. Neden kare: doğrusal olsaydı, doygun bir alan bir duvarın arkasında hâlâ doygun kalırdı; dördüncü kuvvet ise 0,8'de onu tamamen silerdi. Neden taban: gizli ısıyı tamamen gizlemek, gizli trafik dolu bir odayı boş bir oda gibi gösterir ve [Dilim](slice.md)'e uzanma ipucu vermez. Yalnızca 1'e sabitlenmiş bir kaydırıcı onu tamamen gizler - ve en ucuz ayardır, çünkü gizli noktalar o zaman atılır.

Nasıl ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), nokta ısı shader'ları): karşılaştırma fragment başına, sahnenin derinlik dokusuna karşı, dünya uzaklığı yerine **pencere derinliğinde** yapılır. Bazı sürücülerde (ANGLE'ın yazılım rasterleştiricisi dahil) vertex aşamasındaki bir derinlik dokusu okuması her yerde "uzak" döner; her iki derinliği metreye çevirmek ise geniş bir yakın/uzak aralıkta hassasiyet kaybettirir. Sapma, bir sprite yarıçapının pencere birimlerine çevrilmiş hâli artı birkaç en az anlamlı bitten oluşur; böylece bir yüzeye oturan bir veri noktası kendi kendini gölgelemez.

Yapılar yarı saydam çizilir, ama okluzyonun okuduğu derinliğe çizilir; yapıları derinlik dokusuna ulaşmamış bir seviye yalnızca araziye karşı okluzyon yapardı.

### Uzaklık elemesi {#distance-culling}

Her iki sınır da vertex shader'da değerlendirilir; bu yüzden elenen bir satır bir vertex maliyetine mal olur ve hiç fragment maliyeti olmaz.
