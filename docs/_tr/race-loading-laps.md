---
title: "Tur yükleme"
parent: "Yarış analizi"
nav_order: 51
lang: "tr"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Tur yükleme

Bir tur dosyası, tek bir sürüşün kaydıdır: araba nerede olmuş ve sürücü ne yapmış, saniyede birçok kez. Aynı pistten iki ya da daha fazla tur yüklerseniz **Yarış analizi** sekmesi bunları karşılaştırabilir.

![Yarış analizi sekmesinin Turlar bölümü, üç demo turu yüklü: tur listesi, referans yıldızı ve odak](../assets/img/en/race-loading-laps-list.webp)

## İlk turlarınız {#your-first-laps}

1. **Yarış analizi** sekmesini açın.
2. Sadece bakmak mı istiyorsunuz? **Demo turlar** düğmesine basın (bkz. [Demo turlar](#demo-laps)).
3. Kendi turlarınız mı var? Oyunda bir kaydediciyle kaydedin (bkz. [Dosya biçimleri](#file-formats)). Kaydedici her tur için bir dosya yazar.
4. **Tur dosyalarını yükle…** düğmesine basın ve aynı pistten iki ya da daha fazla dosya seçin. Ya da **Klasör…** düğmesine basıp bunların bulunduğu klasörü seçin. Dosyaları ya da klasörleri 3B görünüme de sürükleyip bırakabilirsiniz.
5. Nerede zaman kaybettiğini görmek için listede bir tura tıklayın.

**Uyarı: turlar, her seferinde bir pist karşılaştırılır.** Adı belli başka bir pistin turunu yüklemek, o ana kadar yüklü turları temizler.

## Düğmeler {#the-buttons}

| Kontrol | Yaptığı |
|---|---|
| **Tur dosyalarını yükle…** | `.json`, `.csv`, `.txt`, `.ibt`, `.gz` ve `.h3dcars` dosyaları için bir dosya seçici, birden fazla birden (`.h3dcars` bir araç dosyasıdır, bkz. [Araçlar](race-replay-and-scene.md#the-cars)) |
| **Klasör…** | bir klasör seçici: klasördeki ve altındaki her tur dosyası |
| **Demo turlar** | bir uydurma pistin üç uydurma turu (bkz. [Demo turlar](#demo-laps)) |
| **Temizle** | her turu kaldırır (tur yüklendiğinde gösterilir) |
| görünüme bırakın | görünüme bırakılan dosyalar ve tüm klasörler aynı şekilde yüklenir |

Turlar, yüklü olanlara **eklenir** — **adı belli başka bir pistin turları değilse: o zaman yüklü turlar önce temizlenir** (turlar her seferinde bir pist karşılaştırılır). Okunamayan dosyalar düğmelerin altında, her biri bir satırda listelenir. Diğerleri yine yüklenir.

## Dosya biçimleri {#file-formats}

Biçim, dosya adından değil içeriğinden anlaşılır. Sade bir dille:

- **heat3d-lap**, 3DHeat kaydedicisinin çoğu oyun için yazdığı dosyadır.
- **FH Companion**, Forza Horizon turlarını kaydeden ücretsiz bir araçtır. Bir tur dosyası yazar ve yanında bir `.json.tele.gz` dosyası (aynı turun her tekerleğin verisiyle, gzip ile sıkıştırılmış hali). İkisini birlikte seçin.
- **iRacing `.ibt`**, iRacing'in kendi telemetri dosyasıdır. Arabada Alt+L ile kaydı açın ve dosyayı olduğu gibi yükleyin.
- Bir **tur CSV**'si, her an için bir satır içeren düz bir tablodur.

| Biçim | Tipik kaynak | Okuyan |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Data Out üzerinden Forza Horizon ve Motorsport, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion tur `.json` | FH Companion'ın tur kitaplığı | `fromFhCompanion` |
| FH Companion telemetri `.json.tele.gz` | her FH Companion tur dosyasının yanında | `readForzaTelemetry` |
| iRacing `.ibt` | iRacing'in kendi telemetri dosyaları (arabada Alt+L ile kayıt açılır) | `readIbt` |
| tur CSV | `heat3d_capture laps`, Trackmania eklentisi ya da `x`, `z`, bir zaman sütunu ve isteğe bağlı bir `lap` sütunu olan her CSV | `fromCsv` |

Her oyunun nasıl kaydedildiği ve ne gönderdiği, kaydediciler tarafından belgelenmiştir: [GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) ve [GameCapture: the lap format](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md). Ayrıca bkz. [Diğer yarış oyunları](other-games.md).

## Klasörler ve pistler {#folders-and-courses}

**Klasör…** ya da bırakılan bir klasör, altındaki her dosyayı getirir. Bir klasörün içinde yalnızca `.json`, `.csv`, `.txt`, `.ibt` ya da `.tele.gz` ile biten dosyalar dikkate alınır. Tur olmayan bir `.json` (bir pistin kendi dosyası, haritası) hata vermeden atlanır.

**Tek seçimde birden fazla pist.** FH Companion'ın tur kitaplığı her pisti, `<course name> (course_<x>_<z>_to_<x>_<z>)` adlı bir klasörde tutar (adsız bir pist için yalnızca `course_...`). Seçilen dosyalar böyle birden fazla pist klasöründe bulunuyorsa hiçbir şey yüklenmez. Bunun yerine **Turlar** bölümü "Bunlar N pistin turları ve turlar her seferinde bir pist karşılaştırılır. Birini seçin:" der ve her pisti tur sayısıyla listeler, en çok turu olan başta (`.json`, `.csv` ya da `.ibt` ile biten dosyalar sayılır, `course.json` sayılmaz). Birine tıklamak o pistin dosyalarını yükler.

Bir pist, adı ve **başlangıç** noktasıyla anahtarlanır, bitişiyle değil. Bitmemiş koşular FH Companion tarafından aynı ad ve başlangıçla (`unfinished/` içinde) saklanır ve durdukları yer bitiş olarak yazılır. Bunlar kendi pistleriyle birlikte gider ve listede **kısmi** olarak işaretlenir.

**Seçilen dosyalar arasında birkaç pist.** Dosyalar doğrudan seçildiyse (pist klasörlerinden değil) ve birden fazla adı belli pistin turuysa, aynı seçim pist başına sunulur. Pist adı olmayan turlar, seçilen pistle birlikte gider.

## Araç adları {#car-names}

Bir tur, oyunun verdiği tam araç adıyla anılır. Tur dosyası araba adını belirtmiyorsa:

1. **Klasör.** FH Companion'ın kitaplığı turları `<course>/<class>/<car name> '<yy> (car<number>)/<tune>/<tag>/<lap>.json` içinde tutar. `<name> (car<number>)` ile eşleşen en içteki klasör ad ve numarayı verir; yalnızca `car<number>` ile eşleşen ise sadece numarayı. Bu yolu yalnızca klasör seçimleri ve bırakılan klasörler taşır.
2. **Aynı arabanın başka bir turu.** Herhangi bir tur bir araba adını belirttiğinde, aynı oyun ve araba numarasına sahip her tur o adla anılır. Bu, birlikte yüklenen turlar ve bu tarayıcıda daha sonra yüklenen turlar içindir. Adlar `localStorage` içinde `heat3d.carNames` anahtarıyla saklanır (`<game>:<car number>` biçiminde). Gizli bir pencerede yalnızca turlar kadar yaşarlar.
3. Aksi halde numarasıyla "car 1234", ya da yalnızca "car".

**Etiketler.** Tur listesinde bir tur, araba adını gösterir. Aynı arabanın birkaç turu "Ad #1", "Ad #2" diye numaralanır. Analizin cümleleri, etiketler tekil olduğunda aynısını kullanır. Değilse araba adı ile tur süresi birlikte gösterilir: "Ad (1:29.616)" (örnek süreler), hâlâ tekil değilse daha da numaralanır.

**Gruplama.** Turlar, araba numaraları (ya da numara yoksa adları) ve performans indeksleri aynıysa aynı arabaya aittir (zarflar, profiller ve karşılaştırmalar için). Aynı model farklı bir ayarla başka bir arabadır (`carKey`).

**Sınıflar.** Bir turun performans sınıfı oyuna aittir (Forza D..X, iRacing'in araba sınıfı kısa adı). İstatistikler sınıfları D, C, B, A, S1, S2, R, X, sonra da alfabetik olarak sıralar.

## Demo turlar {#demo-laps}

**Demo turlar**, uydurma bir pistin üç turunu yükler (dört düzlük ve dört sağ viraj). Bunlar basit bir araç modeliyle yapılmıştır ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): her virajın tutuşla sınırlı hızı, bir hız-tur simülatörünün yaptığı gibi bir ivmelenme geçişi ileri ve bir frenleme geçişi geri.

| Tur | Araba | Hatalar |
|---|---|---|
| temiz | Tutuş arabası | yok |
| hatalarla | Tutuş arabası | T2'ye 35 m erken fren, T3'ten çıkışta gazı 30 m geç alır, T4'ü hızının 0,88'iyle alır, 1,2 m bir yana kayar |
| diğer araba | Güç arabası | yok; 1,2 m diğer yana kayar |

| Araba (numara) | Tutuş | Frenleme | Çekiş | Güç/kütle | Sürükleme |
|---|---|---|---|---|---|
| Tutuş arabası (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Güç arabası (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Hatalı tur odaklanmıştır. Pist, Forza'nın dünyasını tuttuğu şekilde (sol elli) çizilmiştir. Bu yüzden, gerçek bir Forza turunda olduğu gibi, ayna görüntüsü çıkar ve sekme **X'i ters çevir** seçeneğini sunar. Üç turun hepsi teker başına veri taşır, böylece sekmenin her bölümünde gösterecek bir şey vardır.

## Tur listesi {#the-lap-list}

Her satır, soldan sağa:

| Öğe | Yaptığı |
|---|---|
| ● / ○ | turu gösterir / gizler (çizgiler, araba, kart, grafikler); gizli turlar yine analiz edilir |
| renk çizgisi | turun rengi |
| ad ve etiketler | **odaklamak** için tıklayın; üzerine gelince kaynak dosyası ve arabası görünür (ad · sınıf PI · çekiş) |
| ⌖ | kamerayla bu arabayı takip et (durdurmak için yeniden tıklayın) |
| ★ | her şeyi bu tura karşı karşılaştır (referans yap); referans olanda devre dışı |
| × | turu kaldır |

**Etiketler:** *referans*; bir sınıfın en hızlı turunda *X'in en iyisi* (ya da *sınıfının en iyisi*), birden fazla sınıf varsa; bitişe ulaşmayan bir koşuda *kısmi*.

**İkinci satır:** sınıf (yalnızca birden fazla sınıf varsa), tur süresi (`1:29.616`), karşılaştırıldığı tura göre fark (sınıfının en iyisi ya da referans) `+0.512` olarak (örnek) ve turun başlangıcı referansın başlangıcından 10 m'den fazla geç olduğunda *geç başladı*.

Listede 8'den fazla tur varsa, "M'den N'si çizili" satırı **Tümünü göster** (her turu çizer: daha yavaş ve bir karmaşa) ve **Yalnızca incelenenler** (referans, odaklanılan tur ve sınıfının en iyisi; istatistikler yine her turu sayar) seçeneklerini sunar.

Listenin altında: turlar çizimin aynalandığını söylediğinde ayna ipucu (bkz. [aynalanmış dünyalar](race-replay-and-scene.md#mirrored-worlds)), iki ya da daha fazla turda "Nerede zaman kaybettiğini görmek için bir tura tıklayın …" ipucu ve birden fazla sınıf varsa her turun kendi sınıfının en hızlısıyla karşılaştırıldığı.

### Referans ve odak {#reference-and-focus}

- **Referans:** diğer her turun hizalandığı ve varsayılan olarak karşılaştırıldığı tur. ★ başka bir tur seçmediği sürece en hızlı **tam** tur. (Hiçbiri tam değilse yüklenen ilk tur.) Referans turu kaldırmak, otomatik seçime döndürür.
- **Odak:** bulguları, araba kontrolü ve haritaları gösterilen tur. Kullanıcının koyduğu yerde kalır. Aksi halde referans olmayan **en yavaş** turdur ("öğrenecek en çok şey"). Bir turu odaklamak, onu ve sınıfının en iyi turunu da görünür yapar. Referansı odaklamak, onu her virajdan geçen en hızlı diğer turla karşılaştırır.
- **Sınıflar:** birden fazla performans sınıfının turlarıyla, her tur kendi sınıfının en hızlı tam turuyla karşılaştırılır (referans, referansın sınıfında). Bkz. [Pist istatistikleri](race-course-statistics.md).

### Renkler {#colours}

Her tur, yükleme sırasındaki yerine göre kendi rengini alır. Böylece diğerleri gizlenirken bir tur rengini korur. Tonlar, ısı haritasının takım modunun grupları dağıttığı gibi renk çemberine yayılır. Her yuva için parlaklık (OKLCH'de 0,52 ile 0,66 arası) ve kroma (0,12 ile 0,18 arası), normal, protanop ve deuteranop görüşte komşu yuvalardan (ve sonuncusu ilkinden) en uzak duracak şekilde seçilir. Her biri koyu grafik yüzeyine karşı en az 3:1 olur.

## Geliştiriciler için {#for-developers}

Kod: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Her biçim nasıl okunur {#how-each-format-is-read}

Her biçim sonunda tek bir `LapTrace` olur: kanallar kanonik adlarla (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., bkz. [kanal tablosu](race-charts-and-hud.md#the-channel-table)), araba, tur süresi, tam tur olup olmadığı ve bir `meta` bloğu. Her biçimde `time` ve `distance` 0'dan başlayacak şekilde kaydırılır. Bir kaynakta `speed` yoksa, komşu örneklerden mesafe bölü zaman olarak hesaplanır.

#### heat3d-lap JSON {#heat3d-lap-json}

`"format": "heat3d-lap"` içeren bir JSON nesnesi. Okunan alanlar:

| Alan | Kullanım |
|---|---|
| `channels` | kanonik adlara göre, her kanal için bir dizi içeren bir nesne; teker başına kanallar `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` ve `z` zorunlu |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | araba: kimlik, ad, Forza sınıf indeksi (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), performans indeksi, çekiş kodu (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | tur süresi; yoksa son `time` değeri |
| `lap.complete` | `false` kısmi bir koşuyu işaretler; başka her değer tam tur |
| `game`, `track` | adlar; `game` disiplini belirler (aşağıya bakın) |
| `units.slipRatio` / `units.slipAngle` | kaymanın nasıl ölçeklendiği: birimi `raw` içeren bir şey `scaled` demektir, `normalised` `peak` demektir, diğer her şey `physical` |
| `meta` | `slip`, `surface`, `discipline` verildiği gibi yukarıdakileri geçersiz kılar |

`distance` kanalı yoksa, mesafe 3B konumlardan toplanır.

#### FH Companion tur dosyaları {#fh-companion-lap-files}

Her yaklaşık 5 m'de bir örnek tutan bir `samples` dizisi içeren bir `Lap` nesnesi olan bir JSON nesnesi. Eşlenen alanlar:

| FH Companion | Kanal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (tur 0'da başlasın diye kaydırılmış) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | aynısı, küçük harfle |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², adına rağmen) |
| `Puddle` | `puddle` |

Araba `Lap.carOrdinal`, `Lap.carName` (yalnızca yeni dosyalarda), `Class` (ya da bir Forza sınıf indeksi olarak `Lap.carClass`), `Lap.performanceIndex`, `Lap.drivetrain` ve `Lap.peakKilowatts`'tan gelir. Süre `Lap.lapSeconds`'tan gelir. `EndedAtFinish: false` olan bir koşu kısmidir. Oyun `forza-horizon`'dur.

Bu dosyalar lastik verisi ve yön taşımaz. Bu yüzden kilitlenmeler, patinaj ve kaymalar yalnız bunlardan yargılanamaz. İtmeler (yoldan direksiyon farkıyla), çarpmalar ve kazalar hâlâ yargılanır. Geri kalanı için her birinin yanındaki `.tele.gz` dosyasını da seçin.

#### FH Companion telemetrisi (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Gzip ile sıkıştırılmış `{ version, columns, data }` JSON'u: tek bir turun Forza'nın bütün Data Out verisi, paket başına bir satır, oyunun kendi alan adlarıyla. Sütunlar ada göre aranır, asla konuma göre değil. 2. biçim her paketi tutar (oyunun 64 tikine karşı saniyede ~110). Kaydedicinin kendi saati (`t`, `metres`) dışında önceki satırla aynı olan bir satır atılır. Böylece bir tur, oyunun saniyede 64 satırıyla okunur. (Yükleme düğmesinin ipucu bunu söyler: "her tekerleğin kayması için 64 Hz'de".)

| Data Out alanı | Kanal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (araba çerçevesi: x sağ, y yukarı, z ileri) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`; 0..255'ten 0..1'e ölçeklenmiş |
| `Steer` | `steer`; -127..127'den -1..1'e ölçeklenmiş |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, Fahrenheit'tan °C'ye çevrilmiş |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` teker başına |

`<Wheel>` değerleri `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR` olur. Kayma `peak` olarak işaretlenir (Forza'nın normalleştirilmiş kayması: 1'in üzerinde tekerlek tutuşunu kaybetmiştir).

**Eşleştirme.** Birlikte seçilen ya da bırakılan bir `<lap>.json` tur dosyası ve bir `<lap>.json.tele.gz` (aynı yol, yalnızca `.tele.gz` farkıyla) **tek** bir tur olur: telemetrinin kanalları, tur dosyasının arabası, sınıfı, süresi, pisti ve kısmi bayrağıyla. Telemetri dosyasının kendi araba adı varsa o geçerlidir. Tek başına bir `.tele.gz` de yüklenir. 2. biçim dosyalar `car` (`ordinal`, `name`, `class`, `pi`), `track` ve `lapSeconds` taşır. Bunlar olmadan tur süresi telemetrinin kendi süresidir ve araba bilinmez.

#### iRacing `.ibt` {#iracing-ibt}

iRacing'in telemetri dosyası doğrudan okunur (tarayıcıda, dönüştürme olmadan): 112 baytlık başlık, 32 baytlık disk alt başlığı, değişken tablosu (kanal başına 144 bayt) ve oturum YAML'ı.

- **Gerekli kanallar:** `SessionTime`, `Lap`, `Lat`, `Lon`. Bunlar yoksa: "… SessionTime, Lap, Lat ve Lon kanallarına sahip değil — bir iRacing telemetri dosyası mı?"
- **Konumlar:** enlem ve boylam, ilk sıfır olmayan fiksin teğet düzlemine metre olarak yerleştirilir (Dünya yarıçapı 6 371 008,8 m): x doğu, z güney, y yükseklik (`Alt`). Yani varsayılan kamerayla kuzey ekranda yukarıdır. Pistin kendi çerçevesi değildir: çıkarılmış bir pist modeli hizalanmazdı.
- **Turlar:** oturum `Lap` değiştiği yerde bölünür. Bir tur, 60 örnekten fazla olduğunda, `LapDistPct` değeri %5'in altında başlayıp %95'in üzerinde bittiğinde tutulur. Kısmi turlar atılır. Hiç kalmazsa: "… N km'lik pistin tam turu yok" (pist uzunluğu YAML'dan) ya da "… tam turu yok".
- **Mesafe:** turun başlangıcından `LapDist`, yoksa konumlardan toplanarak.
- **Araba:** `DriverInfo`'dan: oyuncunun `CarScreenName`, `CarID` (araba numarası olarak) ve `CarClassShortName` (sınıf olarak). Pist: `TrackDisplayName`, yoksa `TrackName`.

Eşlenen kanallar:

| iRacing | Kanal | Dönüşüm |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | aynı adlar | - |
| `Clutch` | `clutch` | `1 - v` (iRacing kavramanın devreye girmesini sayar; bizimki pedaldır) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radyan, saat yönünün tersine; -1..1, sağ pozitif; en az 0,1, yoksa π) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | aynı, küçük harfle | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | 1,5'in üzerindeyse 100'e bölünür |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | kaskas ortası sıcaklığı |
| `LFshockDefl` ... | `suspensionM.FL` ... | amortisör sapması, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa'dan psi'ye) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Teker önekleri: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. Örnek başına tek değeri olan **diğer her** kanal (bit alanı türü olmayan), kendi adıyla geçirilir. Bir teker önekiyle başlıyorsa teker başına (`RRspeed`, `speed.RR` olur). Böylece grafikler ve kartların değer listeleri hepsini sunar. iRacing hiçbir lastik kaymasını kaydetmez. Bu yüzden araba kontrolü, sürüklenme açısından yargılanır: `Yaw`, gidilen yöne uydurulmuş, arabanın nereye gittiğine karşı. Ve direksiyondan yola karşı. Yaw hızının yanal ivmeye karşı kullanımı yalnızca yön uydurulamadığında olur, bu yüzden sürüklenme açısı yoktur (bkz. [Araç kontrol olayları](race-control-events.md)).

Hatalar: "… çok kısa, bir .ibt dosyası değil", "… bir iRacing telemetri başlığına sahip değil", "… konum fiksi yok".

#### Tur CSV'si {#lap-csv}

Her örnek için bir satır. Bir dosyadaki birçok tur, bir `lap` sütunuyla ayrılır. Ayraç ilk beş satırdan tespit edilir. İsteğe bağlı ilk satır `# { ...json... }` koşuyu tanımlar: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Sütun (büyük/küçük harf duyarsız) | Kanal |
|---|---|
| `x`, `y`, `z` | konum (`x` ve `z` zorunlu) |
| `elapsed` ya da `time` | `time` (her tur için zorunlu) |
| `metres` ya da `distance` | `distance` (yoksa konumlardan toplanarak) |
| `speed_ms` ya da `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | aynısı |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| herhangi bir kanonik kanal adı, örn. `latVel`, `slipIndex.FL` | kendisi |
| `lap` | bir satırın hangi tura ait olduğu |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | tur süresi, araba numarası, sınıf, PI, pist (her turun ilk satırından) |

Bir açıklama yoksa oyun `forza-horizon` alınır ve her tur tam sayılır. Bir turun kaynağı, dosyada birkaç tur varsa `<file> · <lap>` olarak gösterilir. Hatalar: "… satır yok", "… x ve z sütunu yok", "… zaman sütunu olan tur yok".

#### Disiplin ve yüzey {#discipline-and-surface}

Bir tur bunu söylemediğinde, analizin bir tur hakkında varsaydığı şeyler (`lap.ts`):

- **Disiplin:** `meta.discipline`, yoksa bir oyun adı `rally|wrc|dirt|rbr` ile eşleşiyorsa **ralli**, `trackmania` ise **arcade**, diğer her şey **circuit** (pist).
- **Yüzey:** `meta.surface`, yoksa pist adından ve kaynaktan: adı `monte` olan bir ralli **karışık**; `snow|ice|winter|arctic|sweden` **kar**; asfalt raliler (İspanya/España/Catalunya/Costa Daurada, Hırvatistan/Hrvatska, Orta Avrupa, Almanya/Deutschland, Japonya, Korsika/Corse, Ypres ya da tarmac/asphalt kelimeleri) **asfalt**; `scramble|trail|cross country|dirt|gravel` içeren her ad **gevşek**; başka bir ralli etabı, arabanın nasıl sürüldüğüne göre değerlendirilir: örneklerin üzerinde 12 m/s'den hızlı ve yerde olan (en az 200 tane), yanal ivmenin 95. yüzdeliği 10 m/s² veya daha fazla ve medyan sürüklenme açısı 6°'nin altında olduğunda (arabanın bunun %70'inde ya da daha fazla köşe aldığı yerde, en az 30 örnek), asfalt; diğer her şey ya da söyleyecek kadar veri yoksa gevşek. Adında `rally` geçen, ralli olmayan bir ad gevşektir; diğer her şey asfalttır.
- Örnek başına, `loose` kanalı (Forza'nın yüzey titreşimi, Trackmania'nın malzemeleri, bkz. [Araç kontrol olayları](race-control-events.md#the-ground)) turun yüzeyini geçersiz kılar.
