---
title: "Kamera ve denetimler"
nav_order: 14
has_children: true
lang: "tr"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera ve denetimler

Sahnede bir kuş gibi uçarsınız: hareket etmek için **W A S D**, bakmak için fareyi sürükleyin. Bu sayfayı uçmak, bir üst ya da yan görünüme atlamak ve kameranın tam olarak nerede olduğunu okumak için kullanın.

## 4 adımda uçun {#fly-in-4-steps}

1. Klavyeyi almak için görünüme bir kez tıklayın.
2. İleri uçmak için **W**'yi, geri için **S**'yi, yanlara için **A** ve **D**'yi, yukarı için **Space**'i, aşağı için **Q**'yu basılı tutun.
3. Etrafa bakmak için sol ya da sağ fare düğmesini basılı tutup sürükleyin.
4. Tüm veriyi yeniden kadrajlamak için **F**'ye basın.

Kamera, perspektif ve paralel izdüşüm, hazır görünümler, yazılan bir poz ve alan derinliği olan serbest uçuş kamerasıdır. Ayarları kenar çubuğunun altındaki **Kamera ve sahne** panelindedir (Yarış analizi ve Maç sekmelerinde de gösterilir). Uygulama [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts) dosyasındadır.

## Uçmak {#flying}

| Girdi | Etkisi |
|---|---|
| `W` `A` `S` `D` ya da ok tuşları | İleri (görünüm boyunca, eğimi dahil), sol, geri, sağ |
| `Space` ya da `E` | Yukarı (dünyanın yukarısı) |
| `Q` ya da sol `Ctrl` | Aşağı |
| `Shift` (basılı) | 6 kat hızlı |
| sol `Alt` (basılı) | %15 hız |
| Sol ya da sağ fare düğmesiyle sürükleyin | Etrafa bakın. Sürüklerken imleç kilitlenir. |
| Fare tekerleği | Her tık için uçuş hızı ×1,5 (perspektif); yakınlaştırma (paralel) |
| `F` | Veriyi kadrajla |
| Tıklama (sürüklemeden) | İmlecin altındakini göster ([Görünümü incelemek](#inspecting-the-view)) |
| `C` | Kameranın konumunu, yaw ve pitch'ini kopyala |
| `G` | Yazılan bir noktaya git |
| `Esc` | Seçim kartını kapat (ve bir birimi izlemeyi bırak) |

### Bir birimi izlerken {#while-following-a-unit}

Kamera bir tekrarda bir birimi izlediğinde ([Maç tekrarı](match-replay.md)), uçuş tuşları başka bir şey yapar:

| Girdi | Etkisi |
|---|---|
| Tekerlek, `W` / `S` | Birime yaklaşır / uzaklaşır (uydu görünümünde daha yüksek / daha alçak) |
| `A` / `D`, `Q` / `E` | Birimin etrafında yörünge (arkadan ve yörünge görünümlerinde) |
| Sürükleme | Birimin etrafına bakın (kokpit: içeride etrafa bakın) |
| `V` / `Shift+V` | Sonraki / önceki kamera görünümü |
| `Esc` | Önce ikinci birime bakmayı bırakın, sonra izlemeyi bırakın |

Hareket tuşları bir [oyun kumandası](gamepad.md) ile toplanır; diğer her şey için [klavye başvurusuna](keyboard-reference.md) bakın. Bir metin kutusu ya da açılır liste odaktayken tuşlar yok sayılır. Eğim, tam yukarı ve aşağının hemen altında sınırlanır.

## Kamera ve sahne paneli {#camera--scene-panel}

![Kamera ve sahne paneli: İzdüşüm, Hazır görünümler, Görüş alanı düğmeleri, Uçuş hızı ve Poz](../assets/img/en/camera-panel.webp)

### İzdüşüm {#projection}

**İzdüşüm**: *Perspektif* (varsayılan) ya da *Paralel*.

*Paralel* (dik izdüşüm) kısalmayı kaldırır; böylece kare içinde nerede olursa olsun eşit yoğunluktaki iki sıcak nokta aynı boyutta okunur — bir harita ısı haritasının desteklemek için var olduğu karşılaştırma — ve izometrik görünümü izometrik yapan da budur. Paralel modda fare tekerleği yakınlaştırır (ölçeği değiştiren ileri hareket yoktur) ve [hız göstergesi](#fly-speed) gizlenir.

**Geçiş konuyu aynı boyutta tutar.** Paralel bir izdüşümün görüş alanı yoktur, bu yüzden kare yüksekliği kameranın uzaklığıyla ilgisizdir; saf bir çevirme ya da çok büyük ya da hiçbir şey göstermez. Paralele geçerken kare yüksekliği, perspektif kameranın odak mesafesinde kapsadığı şeye ayarlanır (2 × mesafe × tan(fov / 2); odak mesafesi son kadrajlamanın mesafesidir). Geri dönmek, paralel görünümün dolaştığı yere değil, bıraktığınız perspektif pozunu aynı görünür ölçekte geri yükler.

### Hazır görünümler {#preset-views}

| Grup | Düğmeler | Yönelim |
|---|---|---|
| **İzometrik** | **KD**, **KB**, **GD**, **GB** | Paralel, eğim -35,264° (= atan(1/√2), üç eksenin de aynı uzunluğa izdüştüğü açı), yaw -45°, 45°, -135°, 135°. Dört köşe, çünkü tek bir köşe, haritanın yarısını her zaman daha yakın olan bir şeyin arkasında gizler. |
| **Görünüşler** | **Üst**, **Alt**, **Ön**, **Arka**, **Sol**, **Sağ** | Paralel. Üst tam aşağı bakar (eğim -89,9°), Alt tam yukarı, Ön -Z boyunca (yaw 0°), Arka +Z boyunca (180°), Sol -X boyunca (-90°), Sağ +X boyunca (90°). |
| | **Perspektife dön** | Bıraktığınız perspektif pozuna dön. Perspektifte devre dışı. |
| | **Dörtte üç görünüm** | Perspektif, yaw -35°, eğim -28°. |

Her hazır görünüm izdüşümün kendisini değiştirir — perspektif altında bir "üst görünüm" hâlâ bir kaçış noktasına yaklaşır ve eşit alanlar eşit okunmaz — ve veriyi o yönden kadrajlar.

### Görüş alanı {#field-of-view}

**Görüş alanı** — dikey açı. Varsayılan 65°, kaydırıcıda 10-140° (tutamakla 179°), **Düz 20°**, **Uzun 35°**, **Normal 50°**, **Geniş 65°**, **Çok geniş 90°** düğmeleriyle. Dar olan perspektifi düzleştirir ve paralel bir izdüşüme daha çok benzer; geniş olan derinliği abartır ve mesafeleri yargılamayı zorlaştırır. Paralel modda canlı kalır; orada geçişin çözdüğü ölçeği ve **Kare**nin kullandığı mesafeyi belirler.

### Uçuş hızı {#fly-speed}

**Uçuş hızı** — tam gazda saniyedeki dünya birimi (metre). Varsayılan 120; her yüklemede verinin yatay boyutu / 12. Logaritmik, 0,02-20.000 (tutamakla 200.000; tutamak miktarları değil oranları değiştirir). Fare tekerleği, tık başına 1,5 ile çarpar ya da böler; 0,02-200.000 aralığında.

Aynı değer görünümün sağ alt köşesinde gösterilir (yalnızca perspektif): hızı m/s ya da km/s olarak ve o hızda verinin (ya da 3B bir seviye yüklüyse seviyenin) karşıdan karşıya geçme süresi. Hızı değiştirmek için yukarı ya da aşağı sürükleyin.

### Yakın ve uzak {#near-and-far}

**Yakın** (varsayılan 0,5) ve **Uzak** (varsayılan 40.000) kırpma mesafeleri. İkisi de her yüklemede veriden yeniden hesaplanır (yakın = max(0,05; boyut / 20.000), uzak = boyut × 12) ve daha büyük bir 3B seviyeyle yalnızca genişletilir, asla daraltılmaz ([Seviyeler](levels.md#what-a-level-does-for-the-heat)). Oranları, örtülmenin dayandığı derinlik hassasiyetini belirler; bu yüzden küçük bir yakın ve büyük bir uzak, [örtülmeyi](depth-and-culling.md) zayıflatır. Sahnenin dışından ya da zemininin çok üstünden bakıldığında, kullanılan yakın düzlem bu mesafenin %2'sine kadar dışarı kayar; böylece uzaktan yukarıdan görülen bir harita, su ve kıyının titremeyeceği kadar derinlik hassasiyeti korur; kutu yine ayarlanan değeri gösterir.

### Diğer denetimler {#other-controls}

| Denetim | Varsayılan | Anlamı |
|---|---|---|
| **Y'yi ters çevir** | kapalı | Fare ile bakışı yukarı/aşağı ters çevirir. |
| **Alan derinliği** | kapalı | Aşağıya bakın. |
| **Oyun kumandası** | etkin | [Oyun kumandası ve HOTAS](gamepad.md) bölümüne bakın. |
| **Poz** | | Aşağıya bakın. |
| **İncele** | | Kamera okuması, tıkla-seç, yaw kuralı ve *Bir noktaya git*; [Görünümü incelemek](#inspecting-the-view) bölümüne bakın. |
| **Veriyi kare içine al (F)** | | Veriyi (Yarış analizi sekmesinde: turları) görünüme sığdırır, mevcut yönü korur. Kamera, merkezden r / tan(fov / 2) uzaklığa yerleştirilir; r, verinin sınırlarının köşegeninin yarısıdır. |
| **Izgara**, **Eksenler** | açık, açık | Verinin açıklığının yaklaşık 1/40'ı kadar 1/2/5 × 10ⁿ aralıklı bir zemin ızgarası (verinin 1,5 katına kadar uzanır, 8 ile 120 ızgara adımı arasında), ve renkli eksenler. |
| **Dünya eksenini ters çevir** X, Y, Z | kapalı | Aşağıya bakın. |

### Poz {#pose}

Beş sayı kutusu — **X**, **Y**, **Z** ve **yaw °**, **pitch °** — hiçbiri odakta değilken kamerayı izler. Bir değer yazın ve `Enter`'a basın (ya da kutudan çıkın); kamera oraya gider. **kopyala** panoya `poz X Y Z · yaw A · eğim B` koyar (o kural seçiliyse sonuna `(oyun yaw)` eklenir). Uçmak keşfetmenin yoludur; koordinatlar bir görünümü yeniden üretmenin yoludur. [Kamera okumasındaki](#camera-readout) sayılarla aynıdır: verinin kendi koordinatları, bir eksen ters çevrildiğinde bile, ve yaw seçilen [kuralda](#yaw-conventions).

### Dünya eksenini ters çevir {#invert-world-axis}

**Dünya eksenini ters çevir X / Y / Z**, dünyayı o ekseni ters çevrilmiş olarak çizer. Sol elli bir dünya tutan bir oyun, bu sağ elli görüntüleyicide aynalanmış çıkar — sağ el dönüşleri sol el gibi çizilir — ve X ya da Z'yi ters çevirmek onu geri getirir. **Yalnızca çizim değişir**: veri, analiz ve araçların gösterdiği her koordinat (poz, cetvel, dilim) oyunun kendisinde kalır. Görünüm yerinde döner ve aynı noktaya bakmaya devam edersiniz. Bu ayar tarayıcıda hatırlanır (`localStorage` anahtarı `heat3d.mirror`); yükleme anındaki [çevirmelerle](axes-units-and-time.md#flips) karşılaştırın, bunlar veriyi değiştirir.

## Görünümü incelemek {#inspecting-the-view}

Kameranın nerede olduğu, imlecin altında ne olduğu ve bir noktaya gitmek — Kamera ve sahne panelinin **İncele** bloğu ve görünümün sol üstündeki iki bindirme. Kod [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) ve [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts) dosyalarındadır.

| Denetim | Varsayılan | Anlamı |
|---|---|---|
| **Görünüm üzerinde kamera konumu** | açık | Kamera okuması, aşağıda. Ayrıca **×** ile kapanır. |
| **Tıklama orada ne olduğunu gösterir** | açık | Tıkla-seç, aşağıda. |
| **Yaw kuralı** | Görüntüleyici | Okumanın, poz kutularının ve atlama kutusunun hangi yaw'ı gösterip okuduğu. |

Bu üçü tarayıcıda hatırlanır (`localStorage` anahtarı `heat3d.inspect`).

### Kamera okuması {#camera-readout}

Görünümün sol üstünde: kameranın **x**, **y**, **z**, **yaw** ve **pitch**'i, canlı, yaw kuralını adlandıran bir etiketle. [Poz](#pose) kutularıyla aynı sayıları gösterir ve uçarken maliyeti yoktur (kare saatinde sayfaya yazılır, paneller yeniden çizilmeden).

- **kopyala** (ya da bir metin kutusu dışında her yerde `C`) panoya `x X y Y z Z yaw A pitch B (görüntüleyici yaw)` koyar; ondalıklar dil ne olursa olsun `.` ile — atlama kutusunun ve her betiğin geri okuyabildiği bir satır.
- **git** (ya da `G`) altında bir kutu açar: bir nokta yapıştırın ve bakmak için `Enter`'a basın, ya da kopyalanmış bir pozun tamamını yapıştırıp o görünümde durun. `Esc` kutuyu kapatır.

### Koordinatlar: verinin kendi çerçevesi {#coordinates-the-datas-own-frame}

İnceleme araçlarının gösterdiği ya da kabul ettiği her koordinat, **yüklenmiş verinin kendi çerçevesindedir**: yüklemenin [eksen eşlemesi](axes-units-and-time.md) (yukarı ekseni, çevirmeler, ölçek) geri alınır. Görünümden okunan bir konum, kaynak tablonun tuttuğu sayıdır ve atlama kutusuna yazılan tablo sayısı o noktaya iner. Eşleme hiçbir şeyi değiştirmediğinde (Y-yukarı, ölçeksiz bir yükleme — yakalama araçlarının ve seviye dışa aktarıcılarının yazdığı budur) bu basitçe dünyadır; aksi halde okuma bir **veri çerçevesi** etiketi taşır. Veri kümesi yoksa koordinatlar dünya koordinatlarıdır. Yaw ve pitch her zaman görüntüleyicinin dünyası hakkındadır, Y yukarı.

### Yaw kuralları {#yaw-conventions}

| Kural | Yaw 0° şuraya bakar | Şuraya doğru artar | Kullanan |
|---|---|---|---|
| **Görüntüleyici** | -Z | -X | uçuş kamerası, [hazır görünümler](#preset-views) |
| **Oyun / yakalama araçları** | +X | -Z | yakalama araçlarının `yaw` sütunları ve pozları; görüntüleyicinin çerçevesinde dışa aktarılmış bir seviyede, oyunun kendi yaw'ı |

Eğim ikisinde de aynıdır: yatayın yukarısı. İkisi yalnızca çeyrek dönüşle farklıdır, başka hiçbir şeyle değil:

> görüntüleyici yaw = oyun yaw - 90°

Bir `d` yönü, oyun kuralında `(cos p · cos y, sin p, -cos p · sin y)`, görüntüleyicininkinde `(-sin y · cos p, sin p, -cos y · cos p)`dir. Bir yaw'ı doğrudan bir yakalama tablosundan yazmak ya da okumayı onunla karşılaştırmak için **Oyun / yakalama araçları**nı seçin.

### Bir noktaya gitmek {#going-to-a-point}

**Bir noktaya git**, İncele bloğunda (ve okumanın **git** kutusunda):

- metin kutusu `x, y, z` ya da `x y z` (ya da `x; y; z`) alır, ondalık nokta ya da ondalık virgülle — `-321.6, 137.8, -59.9` ve `-321,6 137,8 -59,9` aynı noktadır. Beş sayı bir yaw ve pitch ekler; kamera okumasından ya da poz kutularından kopyalanmış bir poz, etiketleri ve kuralı dahil, bütün olarak okunur;
- **yaw °** ve **pitch °** (isteğe bağlı) kamerayı seçilen kuralda döndürür;
- **Buna bak** yönü korur (düz bakıyorsa en az 20° aşağı bakacak şekilde eğilir) ve o yönde mevcut mesafeye geri çekilir; sahne genişliğinin %0,3 ile %3'ü arasında tutulur — iki kilometrelik bir seviyede 6 ila 60 m. Odak mesafesi, paralel görünümün yüksekliği ve uçuş hızı buna uyar, böylece görünüm kullanılabilir olarak gelir;
- **Burada dur** kamerayı noktaya koyar; verilen yaw ve pitch'e döndürülmüş, ya da olduğu gibi.

Yapıştırılan bir poz kendi yaw ve pitch'iyle her zaman o görünümde durur.

### Tıkla-seç {#click-to-pick}

Görünüme bir tıklama — 4 pikselden fazla sürüklemeden basıp bırakın; sürükleme yine etrafa bakar — sol üstte, imlecin altındakini gösteren bir kart açar. [Cetvel](measure.md) açıkken, tıklamalar cetvele gider.

**Çizilmiş bir veri noktası kazanır.** Tıklamaya 8 piksel içindeki en yakın örnek, gerçekten çizilenler arasından: zaman penceresindeki ve ömründeki satırlar, [filtrelerden](filters.md) geçen, gösterilen gruplar ve fark bölünmesi, mesafe eleme içinde ve ısıyı kırpan bir dilim içinde. Kutu tekrarında, imlecin altındaki bir kutu (üzerinde herhangi bir yerde). Kart, satırın taşıdığı her sütunu, kaynağın kendi sütun adlarıyla listeler — zaman (duvar saati, ya da dosyanın kendi saniyeleri `m:ss.ss` ile), kişi, grup, oturum, tutulan her sütun, konum ve bakış yönü — ve kameradan mesafe. Bellekte yalnızca yüklemenin tuttuğu sütunlar vardır: [filtre sütunu](column-mapping.md) olarak seçilmemiş bir sütun gösterilmez.

**Aksi halde seviyenin yüzeyi**: tıklamanın ışınının seviyenin gerçek üçgenleriyle buluştuğu nokta (cetvelin referans düzlemi değil), ait olduğu **bölüm** (dışa aktarıcının adı, `structure:props`, `ground:terrain …`), **türü** (zemin, yapı, su, harita görüntüsü), koordinatlar ve mesafe. Bir dilim ya da mesafe elemesiyle gizlenmiş geometri geçirilir. Seviyenin bir [gezinme ağı](model-levels.md#navigation-meshes) olduğu yerde, bir satır bunu adlandırır ve noktanın onun üzerinde olup olmadığını söyler (✓). `≈` ile önek verilmiş bir bölüm adı, bölümlerin sınırlayıcı kutularından tahmin edilmiştir, çünkü seviyenin o kısmı yüklemede sadeleştirilmiştir.

Kart kapatılana kadar kalır (**×**, `Esc`), başka bir tıklama başka bir şeyi yanıtlar ya da boş bir yere tıklanır. Sahnede noktada camgöbeği bir çarpı ve ekranda üstünde bir halka çizilir. Düğmeleri: **kopyala** (her değer ve koordinatlar `x, y, z` olarak), **Buna bak** ve **Burada dur** (bir veri noktasında, satır bir bakış yönü taşıyorsa satırın baktığı yöne bakarak; bir yüzeyde, üzerinde 1,7 m).

Seviye, ihtiyaç duyan ilk tıklamada tıkla-seç için dizinlenir: ayak izi üzerinde sütunlardan oluşan bir ızgara, kareler arasında birkaç milisaniyelik parçalarla kurulur ki görünüm hiç durmasın (birkaç milyon üçgenli bir seviye için yaklaşık bir saniyelik iş), ve seviye değişene kadar tutulur. O zamana kadar kart, bir yüzdeyle *Seviye tıkla-seç için hazırlanıyor* yazar ve hazır olduğunda tıklamayı yanıtlar. Dört milyondan fazla çizilmiş satır üzerinde bir veri noktası araması da aynı şekilde karelere yayılır.

## Alan derinliği {#depth-of-field}

Kamera ve sahne içinde daraltılabilir bir bölüm; etkinken *Alan derinliği - açık* başlığını taşır. Varsayılan olarak kapalı: bu bir sunum efektidir ve varsayılan görünüm, verinin bir yorumunu değil, veriyi göstermelidir.

| Denetim | Varsayılan | Aralık (kaydırıcı) | Anlamı |
|---|---|---|---|
| **Etkin** | kapalı | | |
| **Çerçevelenene odaklan** | açık | | Son kadrajlamanın kullandığı mesafede odak (*N m'de odaklandı.*). |
| **Odak mesafesi** | 1000 | 1-200.000, logaritmik (10.000.000) | Odak elle olduğunda gösterilir. |
| **Diyafram** | ±%35 | ±%2 ila ±%200, logaritmik (±%3200) | Keskin tutulan derinlik, odak mesafesinin bir kesri olarak — f-sayısı değil, göreli, çünkü sahneler bir odadan sekiz kilometrelik bir haritaya kadar uzanır. |
| **En fazla bulanıklık** | 12 px | 1-48 (256) | En büyük bulanıklık yarıçapı; maliyeti onunla ölçeklenir. |

**Seviyeyi, ızgarayı ve kutuları** bulanıklaştırır — *ısıyı değil*. Bir pikseldeki ısı, birçok derinlikteki sprite'ların toplamıdır, bu yüzden odak dışında olabileceği tek bir derinliği yoktur; onu arkasındaki herhangi bir geometriyle bulanıklaştırmak, önünde yüzdüğü her yerde yanlış olurdu. Yumuşatılmış bağlamın üzerinde keskin veri ikisinden de daha kullanışlıdır. Bulanıklık, bileşik geçişinde 24 dokunuşlu bir altın açı toplamasıdır; keskin bir ön plan, arkasındaki bulanık arka plan tarafından dışa doğru bulaştırılmasın diye ağırlıklandırılır. Değiştirmek, ısı birikimini yeniden başlatmadan yeniden çizer.

## Tuval çözünürlüğü {#canvas-resolution}

Tuval, görüntünün piksel oranında, en çok 2 ile çizilir. Isı arabelleği bundan daha düşük bir çözünürlükte çizilebilir ([Isı çözünürlüğü](performance-and-stats.md)).

## Bu bölümdeki sayfalar {#pages-in-this-section}

- [Oyun kumandası ve HOTAS](gamepad.md)
- [Klavye ve fare başvurusu](keyboard-reference.md)
