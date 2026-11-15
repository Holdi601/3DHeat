---
title: "Grafikler ve HUD"
parent: "Yarış analizi"
nav_order: 53
lang: "tr"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Grafikler ve HUD

Grafikler turlarınızı metre metre hizalar; böylece bir sürücünün nerede daha geç frenlediğini ya da nerede daha erken gazı kestiğini görebilirsiniz. Görünümün sol üstündeki kartlar, her araç ve sürücünün tam şu anda ne yaptığını gösterir.

![Görünümün altındaki grafikler: iki tur için fark, hız, gaz, fren ve direksiyon satırları; üstte zaman ve neden şeritleri; imleç ve kartlar](../assets/img/en/race-charts-rows.webp)

## Grafikler {#the-charts}

Her tur tek bir mesafe ekseninde, referans boyunca metre cinsinden (bkz. [tek mesafe ekseni](race-corner-analysis.md#one-distance-axis)); böylece aynı x, her tur için pistte aynı yerdir. Bir tur tek başına grafiğe alınır (ve oynatılır); aynı parkurdan ikinci bir tur ona karşı grafiğe alınır. Hiç tur yüklü değilse (ya da analiz başarısızsa) alanda şu yazar: "Grafikler, bir tur yüklendiğinde görünür; ikisini karşılaştırmak için aynı parkurdan bir tur daha yükleyin."

### Üzerlerinde ne var {#what-is-on-them}

- **Açıklama**: grafiğe alınmış her turun rengi ve etiketi; referans "(referans)" olarak işaretli. Görünür tur sayısı grafiğe alınandan fazlaysa "+N tane daha çizildi, grafikte yok". **Grafikler (N) ▾**; yakınlaşmışken **Tüm tur**; tek satırlık bir ipucu.
- **Üstte iki şerit**, odaklanılan tur için:
  - *zaman*: [zaman haritası](race-replay-and-scene.md#time-map-where) bir şerit olarak; kırmızı kaybetmek, yeşil kazanmak;
  - *neden*: kayıplarının her biri, nedeninin olduğu yerin üzerinde, neden renginde bir çubuk olarak. Başlığını ve maliyetini görmek için bir çubuğun üzerine gelin.
- **Viraj bantları**: her virajın girişinden çıkışına kadar gölgeli bir bant (referansta bulunduğu gibi) ve eksenin altında apekste adı (`T1` …).
- **Seçili bulgu**: menzili üzerinde, neden renginde bir bant.
- **Satırlar** (grafikler): seçilen kanal başına bir tane. Her biri adını ve solda aralığının üst ve alt değerini gösterir; aralık sıfırı geçtiğinde bir sıfır çizgisi çizilir. Her tur kendi renginde bir çizgidir: odaklanılan tur 2 px genişliğinde ve opak, referans opak, diğerleri %75 saydamlıkta 1,5 px. Fark satırı referansı dışarıda bırakır (kendisine göre sıfırdır).
- **İmleç**: referans aracın olduğu yerde (ya da işaretçinin olduğu yerde) dikey bir çizgi ve fark dışındaki her satırda araç başına bir nokta. İmleçte her araç aynı metrededir; aksi halde her aracın, tekrar saatinde kendi mesafesi gösterilir.

En fazla **8** tur grafiğe alınır: önce odaklanılan tur, sınıfının en iyisi ve referans; sonra diğerleri yükleme sırasıyla.

### Satırlar ve yükseklikleri {#rows-and-their-heights}

Satırlar grafiğin yüksekliğini ağırlıklarına göre paylaşır; hiçbiri 16 px'ten düşük değildir:

| Satır | Ağırlık |
|---|---|
| Referansa fark (saniye, işaretli) | 1,7 |
| Hız (km/h) | 1,7 |
| bir pedal (gaz, fren, debriyaj) | 1 |
| direksiyon | 1,1 |
| vites | 0,8 |
| bir lamba (el freni, ABS …) | 0,55 |
| diğer her şey | 1 |

Tabloda sabit bir gösterim aralığı olan kanal (pedallar 0-100%) onu kullanır; diğerleri turların görünür bölümüne uydurulur. Alana sığmayacak kadar uzun bir satır adı (başka bir dilde uzun bir kelime) yeterince yüksek satırda üst değeri bir satır aşağı indirir; değilse üç nokta ile kesilir. Tam ad ipucu olarak görünür.

### Varsayılan grafikler {#the-default-graphs}

Grafikler seçilene kadar: **fark**, sonra turların taşıdığı ve tabloda `graph` diye işaretli her kanal (gaz, fren, debriyaj, el freni, direksiyon, vites, hız). Bir pedal ya da lamba kanalı, herhangi bir tur onu 0,02'nin üzerine taşımadıkça dışarıda kalır (hiç basılmayan bir debriyaj bir grafik değildir). Sıra tablonunkidir.

### Grafik seçici {#the-graph-picker}

**Grafikler (N) ▾** düğmenin üstünde bir panel açar:

- bir filtre kutusu (bir kanalın adı ya da kimliğiyle eşleşir);
- **Varsayılanlar** (varsayılan kümeye döner; ipucu kaç tane olduğunu söyler) ve **Kapat**;
- *Referansa fark*, sonra grafiğe alınmış turların taşıdığı her kanal; gruplu (hareket, girdiler, motor, yardımcılar, lastikler, frenler, süspansiyon, tekerlekler, diğer, zamanlama, konum), her biri için bir kutucuk. Tekerlek başına bir kanal, her tekerlek için bir çipli tek satırdır (FL, FR, RL, RR).

İşaretleme sırası ne olursa olsun seçim tablonun sırasını korur. Seçim, **Varsayılanlar** ya da yeniden yükleme gelene kadar kalır. Tablonun bilmediği kanallar *diğer* altında sunulur ve kendi kimliklerinden adlandırılır ("brakeLinePress" → "Brake line press").

### Üzerine gelme, tekerlek, yakınlaştırma, tıklama {#hover-wheel-zoom-click}

| Girdi | Yaptığı |
|---|---|
| üzerine gelme | her araç, kartı ve girdileri o metreye taşınır; bir direk pistte onu işaretler; bir tablo, orada her satırda grafiğe alınmış her turun değerini listeler (referans için fark "ref" olarak gösterilir); kartların üstünde "N m noktasında - grafiklerin imleci". Grafik alanından çıkmak oynatmayı geri verir |
| tekerlek | her çentikte turun görünür açıklığının 1/200'ü kadar oynatmayı tur boyunca adım adım ilerletir (Shift: 5 kat); oynatmayı duraklatır. Yakınlaşmışken görünüm imleci izler |
| Ctrl+tekerlek (Cmd+tekerlek) | mesafe eksenini işaretçinin etrafında yakınlaştırır: her çentikte 1,25× uzaklaştırma, 0,8× yakınlaştırma; 40 m'den dar olmaz. Tüm tura uzaklaşmak yakınlaştırmayı bitirir |
| yana tekerlek | yakınlaşmışken kaydırır (her 100 birim kaydırmada açıklığın %10'u) |
| çift tıklama, **Tüm tur** | uzaklaş |
| tıklama | oynatmayı referansın o metreye ulaştığı yere atlatır |
| Shift+tıklama | arabaları orada hizalar (bkz. [hizalama](race-replay-and-scene.md#lining-up)) |

Grafikler, dil değiştiğinde geçerli dilde yeniden çizilir.

Grafiklerdeki ipucu satırı aynı şeyi kısaca söyler: "Üzerine gelin: oradaki her araç · tekerlek: tur boyunca adım adım · Ctrl+tekerlek: yakınlaştır · tık: atla · Shift+tık: hizala".

## Arabaların kartları (HUD) {#the-car-cards-hud}

Görünümün sol üstünde, görünür her tur için bir kart vardır: en fazla **6**, yükleme sırasıyla ilk altı görünür tur. Kartlar, oynatmanın (ya da grafiklerin imlecinin) o anki konumunu gösterir.

**Başlık:** turun rengi ve etiketi; canlı fark, yani bu turun şu anki mesafesine ulaşma süresi eksi referansın aynı mesafeye ulaşma süresi ("+0,48 sn") ya da "referans"; **⋯** diğer her değeri göstermek ya da gizlemek için (*Kartlardaki tüm değerler* ile aynı). Takip edilen aracın kartı vurgulanır.

**Yukarıdan araç:** turun renginde gövde ana hattı ve önünde bir ok; dört lastik (önkiler direksiyonla 28°'ye kadar döner), her biri sıcaklığına göre renkli. 3B araçla düz çizilen aynı simgelerle: kayma halkası, süspansiyon çubuğu, fren parıltısı, aşınma bandı, yük çubuğu.

**Okumalar:** km/h cinsinden hız, turun kendi zamanı ve referans boyunca mesafesi.

**Girdiler:**

- direksiyon girdisiyle döndürülen bir direksiyon simidi (tam kilit 180° olarak çizilir), altında yüzdesi;
- pedal başına bir çubuk; bir pedal kutusundaki gibi soldan sağa: debriyaj, fren, gaz. Her biri yüzdesi, kısa adı ve kendi rengiyle (yalnızca turun taşıdığı pedaller);
- vites (geri için R, boşta için N);
- turun taşıdığı her açık/kapalı kanal için küçük bir lamba: el freni, ABS, TC, DRS, pit limitleyici, havada. Açıkken kendi renginde yanar (aralığının yarısının üstünde);
- seviye kanalı başına bir okuma: fren dengesi, ABS ve TC ayarları, turbo, yakıt.

**Girdi izi:** her pedalın son **6 saniyesi** (tek bir şerit, her biri kendi renginde) ve direksiyon (kendi şeridi, ortalanmış). Bu an sonunda biter; yani sürücünün oraya girerken ne yaptığını gösterir. En fazla 160 nokta.

**Tüm değerler** (⋯ ya da *Kartlardaki tüm değerler*): turun bu anda taşıdığı diğer her skaler değer; sonra tekerlek başına her kanal dört değer olarak (FL FR RL RR), kanal tablosundan ya da kanalın kendi adından adlandırılmış, gruplarına göre sıralı.

## Geliştiriciler için {#for-developers}

Kod: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Kanal tablosu {#the-channel-table}

[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) içindeki `CHANNELS`, bir kanalın tanımlandığı tek yerdir: birimi; örnek başına bir değer mi yoksa tekerlek başına bir değer mi olduğu (`name.FL` … olarak saklanır); grubu; gösterim aralığı; araçta nasıl çizildiği (`glyph`); kartta nasıl göründüğü (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`); varsayılan grafik olup olmadığı; harmanlanmak yerine adım adım değişip değişmediği (vites, bayraklar); ve nasıl gösterildiği (ölçek, birim, basamak). Etiketler ve kısa adlar her dilde iletilerdir (`race.channel.<name>.label` / `.short`).

Çizimi ya da varsayılan grafiği olan kanallar:

| Kanal | Birim | Çizim | Varsayılan grafik |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedal (yeşil, kırmızı, …), % olarak gösterilir | evet |
| `handbrake` | 0..1 | lamba | evet |
| `steer` | -1..1, sağa pozitif | direksiyon simidi | evet |
| `gear` | - | vites | evet |
| `speed` | m/s, km/h olarak gösterilir | - | evet |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lamba | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | seviye okuması | - |
| `tireTemp` (tekerlek başına) | °C, gösterim 40-130 | lastik rengi | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (tekerlek başına) | oyunun ölçeklediği gibi, gösterim ±1,5 | kayma halkası | - |
| `combinedSlip`, `slipIndex` (tekerlek başına) | gösterim 0-1,5, 0-1 | kayma halkası | - |
| `suspension` (tekerlek başına) | 0..1 | süspansiyon çubuğu | - |
| `brakeTemp` (tekerlek başına) | °C, gösterim 100-900 | fren parıltısı | - |
| `tireWear` (tekerlek başına) | 0..1 | aşınma bandı | - |
| `wheelLoad` (tekerlek başına) | N, gösterim 0-12 000 | yük çubuğu | - |

Tablodaki diğerleri (grafiğe alınır ve listelenir, çizilmez): `latAcc`, `longAcc`, `vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`, `vertVel`, `bodySlip` (drift açısı), `loose`, `lateral` (referanstan sapma), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`, `tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`, `wheelSpeed`, `wheelSurfaceSpeed`; ayrıca `time`, `distance`, `x`, `y`, `z`.

**Tabloda olmayan bir kanal** yine okunur, grafiğe alınır (*diğer* altında) ve kartlarda listelenir; kendi adından etiketlenir. **Ona düzgün bir ad, birim ve çizim vermek için** tabloya bir kayıt ekleyin (ve etiket iletisini her `src/i18n/locales/<dil>/race-channels.json` dosyasına). Yeni bir *tür* tekerlek çizimi, `WHEEL_GLYPHS` (glyph.ts) içinde bir kayıt ve onun düz ikizi `CARD_GLYPHS` (RaceHud.tsx) demektir. İkisi de türle tiplenmiştir; bu yüzden ikisi de var olana kadar derleme başarısız olur. `src/race/extensible.test.ts`, bilinmeyen kanalların grafiklere ulaştığını, tablodaki her simgenin çizilebildiğini ve lambaların yandığını denetler.
