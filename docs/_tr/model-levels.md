---
title: "3B haritalar"
parent: "Haritalar ve arka plan geometrisi"
nav_order: 2
lang: "tr"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# 3B seviyeler

3B bir seviye, verinizin içinde durduğu yerin bir modelidir — tepeler, sokaklar, binalar. Isının hangi kat, tepe ya da çatıda olduğunu görmenizi sağlar. Görüntüleyici onu kara (katı), yapılar (içini görebilmeniz için saydam) ve su olarak ayırır.

## 3B bir seviye yükleyin {#load-a-3d-level}

1. Önce verinizi yükleyin ([Veriyi içeri almak](getting-data-in.md)). Model, verinin kullandığı dünya uzayını ve birimi kullanmalı, Y yukarı.
2. **Arka plan / bölüm** altında bir **Sadeleştirme hedefi** seçin. Model çok büyük değilse *Tam - sadeleştirme yok* olarak bırakın.
3. **3B model…** düğmesine basın ve bir `.glb`, `.gltf`, `.obj`, `.stl` ya da `.ply` dosyası seçin.
4. İlerleme satırını bekleyin. **İptal** durdurur.
5. Görünümde **F**'ye basın. Kara katıdır, yapılar saydam kabuklardır, su düzdür.
6. Görünümü [Seviye görünümü](level-appearance.md) sayfasında ayarlayın. Sonucu saklamak için **Kitaplığa kaydet**e basın ([Seviye kitaplığı](level-library.md)).

![Yüklenmiş bir 3B seviye: kontur çizgili opak kara, saydam binalar, düz su](../assets/img/en/model-levels-loaded.webp)

**3B model…** seviye ağını yükler. Bir arka plan işçisinde ayrıştırılır, sınıflandırılır ve sadeleştirilir ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)); bir ilerleme satırı ve **İptal** ile: *Model okunuyor*, *Dosya ayrıştırılıyor*, *N doku paketleniyor*, *N bölüm sınıflandırılıyor*, *Kara sadeleştiriliyor (N üçgen)*, *Yapılar sadeleştiriliyor (N üçgen)*, *Tel kafes oluşturuluyor*.

## Biçimler {#formats}

| Biçim | Okunan | Sınırlar |
|---|---|---|
| `.glb` | `mode` 4 (üçgenler) ya da hiç modu olmayan her mesh ilkeli, her düğümün dünya dönüşümü uygulanmış; `POSITION`; köşe rengi olarak `COLOR_0` (vec3 ya da vec4); malzemenin `baseColorTexture`'ı ve dokusu olarak `TEXCOORD_n`; bölüm adları olarak düğüm ve mesh adları. | Çizgiler ve noktalar atlanır. |
| `.gltf` | Aynısı. | Yalnızca gömülü tamponlarla: harici bir `.bin`'e başvuran bir glTF, *Geometri gömülü olsun diye tek bir .glb olarak dışa aktarın.* ile reddedilir. |
| `.obj` | Yüzler; `o` ve `g` blokları bölüm olarak. | Yalnızca geometri (malzeme yok). |
| `.stl` | İkili ve ASCII (`solid …`). | Tek bir bölüm. |
| `.ply` | Yalnızca ASCII. | İkili PLY, *.glb ya da ikili .stl'e dönüştürün.* ile reddedilir. |

Yalnızca geometri: konumlar, normaller ve üçgenler tek bir tampona kaynaştırılır; varsa renkler ve doku koordinatlarıyla birlikte ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Hiç üçgeni olmayan bir model reddedilir. Model, verinin kullandığı dünya uzayında ve birimde olmalıdır (Y yukarı): hiçbir şey sığsın diye dönüştürülmez.

## Kara, yapılar ve su {#ground-structures-and-water}

Bir seviye içe aktarıldığında üç sınıfa ayrılır, çünkü zıt işlemler isterler ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Kara** — opak çizilir ve konumun karşısında okunabilmesi için kabartma ipuçlarıyla (eğim, kontur, bir yükseklik geçişi) gölgelendirilir.
- **Yapılar** — binalar ve donatılar kamera ile içindeki ısı arasında durur, bu yüzden **saydam bir kabuk** olarak çizilir (parlak bir kenarlı soluk yüzler, artı tekilleştirilmiş kenarlar) — ya da dokulu olduğunda kendi dokularıyla katı.
- **Su** — kara ipuçları olmadan düz: bir gölün üzerindeki bir kontur çizgisi saçmadır.

Her bölüm (glTF düğümü, OBJ nesnesi ya da grup) kendi başına, uygulanan ilk kurala göre sınıflandırılır:

1. **Dışa aktarıcının etiketi.** `ground:`, `structure:` ya da `water:` ile başlayan bir ad (ya da `:` yerine `|` ile) söylediği gibi alınır. Projenin kendi dışa aktarıcıları her bölümü bu şekilde etiketler.
2. **Su adları.** Bir sözcük olarak `water` (*water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe* değil), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Kara adları.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Yapı adları.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometri.** Haritanın X-Z alanının %25'inden fazlasını kaplayan ve üçgen alanının %60'ından fazlası yukarı bakan bir bölüm kara'dır. Yukarı bakan payı %45'in altında olan ya da seviye yüksekliğinin %15'inden uzun ama alanının %10'undan azını kaplayan bir bölüm yapıdır. Yukarı bakan pay alana göre ağırlıklandırılır, böylece bir ev çatısı olduğu için düz sayılmaz.
6. **Aksi halde kara** — belirsiz bir bölüm kara'ya varsayılır, çünkü neredeyse görünmez bir kabuk varsayılanı seviyeyi bir çizim hatası gibi gösterirdi.

Yapı olarak sınıflandırılan tek bölüm içeren bir model bunun yerine kara yapılır (*tek adsız mesh - kara olarak ele alındı*).

### Gezinme ağları {#navigation-meshes}

`nav:…` adlı bir bölüm (bir seviye dışa aktarıcısının `nav:walkable`'ı) bir gezinme ağıdır: bir askerin durabileceği yer. Kara olarak listelenir (*gezinme ağı - çizilmez, kara üzerinde yattığı için; tıklamalar yine onu bulur*) ama **çizilmez**. Üretildiği kara üzerine serilir, santimetrelere kadar onunla aynı düzlemde, ve kara gibi çizilseydi iki yüzey her pikselde savaşırdı: pişmiş bir kara dokusu olan bir seviyede bütün oynanabilir alan, gezinme üçgeni başına bir tane olmak üzere sert kenarlı gri ve bej yamalar olarak görünürdü. Sadeleştirilmeden tutulur, böylece [tıkla-seç](camera.md#click-to-pick) bir noktanın yürünebilir olup olmadığını söyleyebilsin. Kitaplık girdileri bunu tutmaz.

Panelde **Bölüm sınıflandırmasını göster (N)** (birden çok bölümü olan modeller için gösterilir) her bölümü sınıfı ve nedeniyle listeler — *dışa aktarıcı etiketledi*, *ad kalıba uyuyor*, *haritanın %X'ini kaplıyor, %Y yukarı bakan*, *%Y yukarı bakan, seviye yüksekliğinin %Z'si*, *belirsiz - kara olarak varsayıldı*. Birini değiştirmek için, kaynak modelde bölümü yeniden adlandırın ve yeniden içe aktarın; bölme indeks tamponlarına gömülüdür.

## Sadeleştirme {#simplification}

**Sadeleştirme hedefi**, bir sonraki içe aktarma için üçgen bütçesini ayarlar ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Ayar | Üçgenler |
|---|---|
| *Tam - sadeleştirme yok* (varsayılan) | hepsi |
| *Yüksek - 8M üçgen* | 8.000.000 |
| *Orta - 3M üçgen* | 3.000.000 |
| *Düşük - 800 bin üçgen* | 800.000 |
| *Siluet - 100 bin üçgen* | 100.000 |

Bütçe **%60 yapılara ve %40 kara'ya** bölünür ve ayrı ayrı sadeleştirilir — yapılar, seyreltmede şekillerini en hızlı kaybeder. Su sadeleştirilmez. Sadeleştirme, çakışan köşeler kaynaştırıldıktan sonra, kenar daraltma ile kuadrik hata metrikleriyle yapılır ([meshoptimizer](https://github.com/zeux/meshoptimizer), WebAssembly üzerinden); böylece siluetler ve sert kenarlar korunur. İçe aktarma notu `kaynak → şimdi üçgen, sapma %X`, bölümler arasında kara / yapı / su bölünmesini bildirir ve — 8M üçgenin üstündeki bir modelde *Tam* kullanıldığında — *Yüksek* (30M'ye kadar) ya da *Orta* (üstü) önerir. WebAssembly olmadan sadeleştirici kullanılamaz ve içe aktarma bunu söyler.

Projenin kendi dışa aktarıcılarından gelen seviyeler zaten bütçelenmiştir; hedef, arkasında bütçe olmayan ham sanat içindir.

## Dokular {#textures}

Ana renk dokuları olan parçaları olan bir `.glb`, onlarla çizilir — örneğin bir yarış pisti dışa aktarımı her arazi karosu için ve yerleştirilmiş her model için birer tane taşır.

Mevcut olduğunda kara dokusu varsayılan olarak gösterilir; doku taşıyan yapılar **kendi dokularıyla katı** başlar (kaldırımlar, korkuluklar, lastik duvarlar ve tabelalar bir yolun kenarlarıdır, içine bakılacak binalar değildir), tel kafes kapalı ve düz gölgelendirme kapalıdır. Bkz. [Seviye görünümü](level-appearance.md).

## Büyük seviyeler {#large-levels}

- **300.000** yapı üçgeninin üstünde, yapı kenarları kapalı başlar ve yüz opaklığı %35'e ayarlanır: her pikselde bir kenar olduğunda ilçe düz beyaz görünür.
- Kameranın uzak düzlemi seviyeye uyacak şekilde genişler ([Seviyeler](levels.md#what-a-level-does-for-the-heat)).

## Geliştiriciler için {#for-developers}

### Doku atlası {#texture-atlas}

Her doku, alım işçisinde **tek bir atlasa** paketlenir ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)); böylece seviye her iki arka uçta da bir çizim, bir örnekleyici ve bir doku-koordinat özniteliği olarak kalır:

- her görüntünün kendi boyutunda raflar halinde paketlenir; yalnızca küme her iki yönde de **8192 px**'e sığmazsa küçültülür (WebGPU'nun varsayılan doku boyutu sınırı);
- her görüntünün etrafında **16 piksel bir boşluk**, ve yalnızca bu boşluğun koruduğu 5 mip seviyesi; böylece uzaktaki bir tabela hiçbir zaman komşusunun dokusunu örneklemez;
- **tekrarlanan dokular** tekrarlanmaya devam eder. glTF örnekleyicisinin tekrarladığı (glTF varsayılanı) ve doku koordinatlarının 0..1 dışına çıktığı bir görüntü — bir tuğla duvarın UV'si boyunca 0'dan 40'a giden — bir *kare* olur: köşeleri kendi koordinatlarını ve 16-bit bir kare numarasını tutar ve gölgelendiriciler, koordinatı piksel piksel karenin dikdörtgenine sarar; mip seviyesini sarılmamış koordinattan alır, böylece dikişler görünmez. Bir karenin boşluğu kendi karşı kenarını tutar. Örnekleyicisi kenetleyen bir eksen kenetlenir; koordinatları 0..1 içinde kalan bir görüntü eskisi gibi çizilir. Kareleri olan bir seviye köşe başına 4 bayt fazla maliyetlidir.

### Dışa aktarıcı sözleşmesi {#the-exporter-contract}

Bir seviyenin, onu kim yaparsa yapsın, görüntüleyiciden ihtiyaç duyduğu şeyler:

- tek başına, kendi kendine yeten bir `.glb`;
- float32 `POSITION`, üçgen ilkelleri;
- düğüm adları `ground:*`, `structure:*` ve `water:*` (başka her şey yukarıdaki kurallarla sınıflandırılır) ve bir gezinme ağı için `nav:*`, tutulur ama çizilmez;
- dünya uzayı koordinatları, **Y yukarı**, telemetri ile aynı birimde; böylece veri, herhangi bir yerleştirme adımı olmadan seviyenin üzerinde durur.
