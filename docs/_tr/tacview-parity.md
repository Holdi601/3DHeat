---
title: "Tacview eşdeğerliği"
parent: "Maç tekrarı"
grand_parent: "Tekrar"
nav_order: 1
lang: "tr"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Tacview eşdeğerliği

Tacview, uçuş kayıtlarını izlemek için yaygın bir programdır. Onu biliyorsanız, bu sayfa onun her aracının 3DHeat'te nerede olduğunu gösterir.

Tacview 1.9'un her özelliğini (kılavuzu, kullanıcı arayüzü metin tablosu ve ACMI 2.2 dosya biçimi) ve 3DHeat'in [maç tekrarının](match-replay.md) onunla nerede durduğunu listeler. Amaç: Tacview'in bir tekrar ve verileri için yapabildiğini, 3DHeat de yapabilsin.

**Durum:**
- **hazır**: zaten 3DHeat'te.
- **yeni**: bir Tacview özelliğiyle eşleşmek için yapıldı.
- **henüz değil**: geçerli, ama yapılmadı.
- **uygulanmaz**: burada geçerli değil; nedeniyle birlikte.

Özellikleri nerede bulacağınız: **Maç** sekmesi, **Figür tekrarı** (ya da Isı haritası sekmesinde **Figür bindirme**), kenar çubuğundaki **Tekrar**, **Birimler**, **Olaylar**, **Yer imleri**, **Taktik ekran**, **İstatistikler**, **Zaman kaydırma ve kırpma**, **Harita ve konum**, **Ses ve video** ve **Etiketler** bölümleri. Bkz. [Maç tekrarı](match-replay.md).

## Kameralar {#cameras}

| Tacview | 3DHeat | Durum |
|---|---|---|
| Kokpit görünümü (F5), ufuk uçakla birlikte döner | **Kokpit**: birimin dışında, tutumu boyunca, hareket modelinin gösterdiği gibi. Birimin kendi figürü kırpılır. Etrafa bakmak için sürükleyin; **Yeniden ileriye bak** sıfırlar. | yeni |
| Kokpit görünümünde HUD (IAS/CAS/TAS seçimi) | **Başüstü gösterge** (H): gerçek görünümün ufku ve eğim merdiveni, uçuş yolu işaretçisi, pruva bandı, IAS, yükseklik, TAS, Mach, G, hücum açısı, dikey hız, AGL | yeni |
| 3B kokpit göstergeleri, pilot başı takibi (PilotHead*), TrackIR | Kokpit modeli yok; baş açıları birim kartının **Ham** görünümünde gösterilir | uygulanmaz (kokpit modeli yok; baş takibi donanımı canlı uçuş içindir) |
| Dış görünüm (F6): birincil nesnenin etrafında yörünge | **Arkadan** (birimle birlikte döner) ve **Yörünge** (kendi yönünü korur) | hazır |
| Dogfight kamerası, "Hedefe bak" (padlock) | **Padlock**: kokpitten, hedefe kilitli | yeni |
| Dogfight kamerası, "Ortalanmış" / "İleriye bak" | **Hedef**: hedeften gelen çizgide birimin arkasında, hedefi geçip hedefe bakarak. Azimut 0'da **Sabit**, önden ileriye bakar. | yeni |
| Birincil ve ikincil nesneleri değiştirme | Hedefin yanında **Değiştir** | yeni |
| Uydu görünümü (F7), dik üstten görünüm | **Uydu**: birimin tam üstünden aşağı, kuzey yukarıda; döndürmek için sürükleyin. 2B harita dik plandır. | yeni |
| Serbest kamera (F8), W/A/S/D, E/C | Serbest uçuş kamerası (W/A/S/D, Space/Q, Shift/Alt) | hazır |
| Eklenti Head-On kamerası; nesneye sabitlenmiş dış kamera | **Sabit**: birimin etrafında, onunla dönen ve yalpalanan bir yer; taşımak için sürükleyin (arkada, bir kanat ucunda, tam önde) | yeni |
| Eklenti Lock Camera (konumu dondurma) | Takibi bırakın (Esc): kamera olduğu yerde kalır | hazır |
| Stratejik görünüm (tüm Dünya'ya uzaklaşma) | [Dünya arka planı](world-backdrop.md) ve 2B haritanın tüm kayıt çerçevesi | hazır |
| Görüş alanı ayarı | **Kamera ve sahne** FOV | hazır |
| Tuşlarla görünümler arasında geçiş | **V** sonraki görünüm, **Shift+V** geri | yeni |

## 3B görünüm ve ekran seçenekleri {#d-view-and-display-options}

| Tacview | 3DHeat | Durum |
|---|---|---|
| Şerit izleri, uzunluk kaydırıcısı | Takım görüntüleyicisinde izler (saniye) | hazır |
| Öngörücü iz (ileri yol) | **İleri yol**: birimin sonraki saniyelerde gerçekte nereye gittiği | yeni |
| Nesne yükseklik çizgileri / duvarlar | **Dikey çizgiler** | hazır (çizgiler; duvarlar yapılmadı) |
| Seçili nesne vektörleri: pruva (noktalı), rota (düz), kaldırma | **Hız vektörleri** (rota ve hız, belli saniyeler için, bir ipucuyla) ve **Burun ve kaldırma çizgileri** (burun kesikli, kaldırma kısa ve koyu) | yeni |
| Pilotun görüş hattı | **Pilotun görüş hattı**: birimin eksenlerine karşı PilotHeadYaw/PilotHeadPitch (ya da bir HeadYaw, ViewYaw ya da LookYaw sütunu) boyunca kesikli camgöbeği çizgi | yeni |
| SAM/AAA öldürücü menzil kubbeleri (EngagementRange, VerticalEngagementRange, EngagementMode, "2" ikizleri) | **Angajman bölgeleri**: kubbeler; dikey menzil farklıysa oval; EngagementMode 0 iken kapalı | yeni |
| Radar kilitleri (LockedTarget..9) etiketlerle | **Kilitler**: kilitli her nesneye kırmızı çizgiler; FocusedTarget'a kesikli kehribar; bir nesne adlandırılmamışsa LockedTargetAzimuth/Elevation/Range boyunca. **Kilit etiketleri**: her kilit çizgisinde hedefin adı ve menzili | yeni |
| Radar konisi (RadarMode, Azimuth, Elevation, Roll, Range, ışın genişlikleri) ve menzil kapısı | **Radar konileri**: azimut, yükseklik ve yalpa ile birime karşı döndürülmüş ışının kenar ve orta halkası; menzil kapısı iki sarı kenar. Işın genişlikleri yoksa yalnızca ışının ekseni. | yeni |
| İki seçili nesne arasındaki görüş hattı (arazi engellediğinde yeşil / kırmızı noktalı) | Ölçülen çiftin çizgisi, aralarında zemin varsa kırmızıya döner ve kesikli olur | yeni |
| Uzaktaki nesneleri otomatik büyütme | Ekrandaki en küçük figür (piksel) | hazır |
| Enlem/boylam ızgarası | **Harita ve konum → Izgara**: kameranın altındaki zeminde enlem ve boylam çizgileri, yüksekliğe göre yuvarlak aralıklarla (10°'den 1'e kadar), etiketli; ya da UTM bölgesinin **MGRS** kilometre ızgarası, bölge ve 100 km karesi gösterilir. 2B haritanın kendi ızgarası aynen kalır | yeni |
| Bullseye halkaları | 2B haritada her takımın bullseye'ı etrafında halkalar | yeni (yalnız 2B) |
| Süzülüş yolu kaplaması | **Süzülüş yolları**: kayda yakın her pistin iki ucunda ±0,7°'lik tam ölçek kenarlarıyla 3° yollar; OurAirports'un ölçülmüş eşik ve yükseklikleri (bir kez indirilir, çevrimdışı tutulur), her deniz milinde bir işaret, havalimanı ve piste göre adlandırılmış | yeni |
| İrtifa kısıtlamaları (tavan/taban alarmı) | **İrtifa kısıtlaması**: bir taban ve bir tavan; dışarıdaki birimlerin etiketleri kırmızıya döner ve her geçiş (tabanın altına, tavanın üstüne, geri içeri) listelenir — bir tıklama oraya gider ve birimi izler | yeni |
| Yok edilen nesneler gri, 15 dakika sonra kaldırılır | Ölümler izleriyle birlikte biter; ölü bir birim birim listesinde soluklaşır | hazır |
| Görünür / Devre dışı özellikleri | **Ham** içinde gösterilir; hiçbir şey onlarla gizlenmez | henüz değil |
| Çubuk/gaz/pedal konumlarını gösterme | Gaz ve motor değerleri alanlarda; kontrol girdileri **Ham** içinde | hazır (değer olarak) |
| Yorumları altyazı olarak gösterme | **Mesajlar altyazı olarak** (Etiketler): ACMI Message ve Comment olayları ve her oyundan sohbet (Chat, Say ya da Radio olayları, ya da bir sohbet sütunu); görünümün altında, kimin söylediğiyle birlikte, altı saniye | yeni |
| Tarih ve UTC saat gösterimi | Kaydın bir referans saati varsa UTC'li zaman çizelgesi saati | hazır |
| Fare konumu enlem/boylam, MGRS, bullseye | Seçim kartı (bir noktaya tıklayın) enlem/boylamı derece, dakika ve saniye olarak ve dünya metrelerinin yanında MGRS verir; birim başına bullseye (alan) | yeni |
| Özel logo | Yapılmadı | uygulanmaz (marka) |
| 3B modeller, bilinmediğinde en yakın | Kendi figür kataloğu, en yakın karşılık, gerçek boyut | hazır |
| Çoklu angajmanlar (tüm çiftler arasında çizgiler) | **Angajman çizgileri**: kapsamdaki her birimden, ayarlanan menzil (1-200 km) içindeki her rakibe; her birinin menzili, en yakın 60 çift; ölçülen çift eskisi gibi | yeni |

## Etiketler {#labels}

| Tacview | 3DHeat | Durum |
|---|---|---|
| Etiketleri aç/kapat, seçili ve seçili olmayan nesneler için ayrı | **Etiketler**; **Seçili**, **Uçaklar**, **Kara**, **Gemiler**, **Silahlar** ve **YZ** kurallarıyla: gösterilip gösterilmeyeceği, kendi değerleri, öncelik | yeni |
| Etiket alanları: ad, çağrı işareti, pilot, hızlar (TAS/CAS/IAS/Mach/GS), yükseklikler (ASL/AGL), VS, AOA, AOS, G (dikey, yanal, boylamsal), dönüş hızı ve yarıçapı, enerji, yakıt ağırlığı/hacmi/akışı, pruva/rota, yalpa/eğim, kalp atışı | `fields.ts`'nin her değeri: aynı liste, kaydedilmeyenler hesaplanarak (tahminler ~ ile işaretli). Yalpa hızı ve SpO2 yalnızca Ham üzerinden. | hazır |
| Etiketlerde bullseye konumu | **Bullseye (kerteriz / mesafe)** alanı | yeni |
| ILS sapmaları, uçulan mesafe | Ham değerler; uçulan mesafe istatistiklerde | hazır (kısmen) |
| Seçili olmayan telemetriyi sadeleştirme | **Etiketleri ayrı tut**, her kuralın önceliğine göre sıralı | hazır / yeni |
| Tüm yer nesnelerini ya da yalnızca tehditleri etiketleme | Kara ve YZ kuralları | yeni |
| Etiket ölçeği | **Etiket boyutu** (%60-250) | yeni |
| Metrik / İngiliz birimleri | Metrik / İngiliz | hazır (iki ön ayar, sekiz değil) |

## Nesne bilgisi ve telemetri {#object-info-and-telemetry}

| Tacview | 3DHeat | Durum |
|---|---|---|
| Birincil ve ikincil seçim | Tıklama izler ve seçer; iki nesneyi ölçmek için shift-tıklama; **Hedef** seçici | hazır / yeni |
| İki nesne arasında menzil / kerteriz / açı / yaklaşma | Ölçülen çiftin BRAA çizgisi; izlenen birimden Menzil, Kerteriz, Açı ve Yaklaşma alanları | hazır |
| Bağıl kerteriz, görüş hattı açısal hızı | **Bağıl kerteriz** (izlenen birimin burnundan, sol/sağ) ve **Görüş hattı açısal hızı** (°/s) alanları | yeni |
| Telemetri pencereleri | Birim kartı ve üzerine gelme kartı | hazır |
| Ham telemetri (kaydedilen her özellik, bilinmeyenler dahil) | Birim kartında **Ham**: birimin satırındaki her sütun, yazıldığı gibi | yeni |
| Etkin nesneler listesi | **Birimler**: oyuncular, YZ, uçuştaki silahlar; canlı olanlar parlak | hazır |
| Kayıt özellikleri penceresi (başlık, yazar, brifing...) | RecordingInfo sütunu olarak tutulur; Ham'da gösterilir | hazır (pencere yok) |
| Konum biçimleri DMS/MGRS, manyetik kuzey | DMS'te **Konum (enlem / boylam)** ve **MGRS** alanları; bir **Manyetik pruva** alanı; **Manyetik yönler** pruvayı, rotayı ve kerteriz değerlerini manyetik (°M) olarak yazar ve iki kuzeyi ve sapmayı gösteren bir pusula — Dünya Manyetik Modeli 2025 (kamu malı katsayıları), birimin yerinde ve tarihinde burada hesaplanır | yeni |

## Grafikler {#charts}

| Tacview | 3DHeat | Durum |
|---|---|---|
| Bir nesnenin grafiği, en fazla 4 değer | **Zamana göre** (ve Tekrar altındaki grafik) | hazır |
| Aynı anda en fazla 4 nesne çizme | **Karşılaştır**: tek ölçekte en fazla 8 birimin bir değeri | yeni |
| Değere karşı değer (enerji-manevra tarzı) | **Değer - değer**: dönüş hızı hıza ya da herhangi bir çifte karşı, her birim bir çizgi, geçerli noktası işaretli | yeni |
| X ekseni zamana göre; yakınlaştırma; grafikten zamanda gezinme | Tekerlek zamanda yakınlaştırır, çift tıklama sıfırlar, tıklama o ana gider | yeni |
| X ekseni hava ya da yer mesafesine göre | Zaman ve karşılaştırma grafiklerinde **Zaman / Hava mesafesi / Yer mesafesi**; yakınlaştırma ve tıklayarak gitme aynı çalışır | yeni |
| Önceden tanımlı grafikler (enerji, ivme...) | Herhangi bir değer seçilebilir (enerji yüksekliği ve oranı da birer değerdir) | hazır |

## İstatistikler, uçuş günlüğü, olaylar {#statistics-flight-log-events}

| Tacview | 3DHeat | Durum |
|---|---|---|
| Uçuş günlüğü: kalktı, indi, ateş etti, tarafından vuruldu, tarafından yok edildi, alandan çıktı | Birim başına **İstatistikler**: yaşamlar, öldürmeler, ölümler, atışlar, isabetler, isabet oranı, kalkışlar, inişler, havada geçen süre, en büyük G (ve en küçük), en yüksek hız, yükseklik ve Mach, mesafe. Kalkışlar TakenOff/Landed olaylarından, OnGround, AGL'den ya da ~ ile işaretli bir tahminden gelir. | yeni |
| Skor tablosu ve görev raporu eklentileri | Takım başına özet ve en çok öldürme; maç özetinin kendi skor tablosu | yeni / hazır |
| Uçuş günlüğünü XML/CSV olarak dışa aktarma | İstatistiklerin ve listelendiği gibi olayların **CSV olarak dışa aktar**ımı | yeni (yalnız CSV) |
| Telemetriyi bir hızda CSV olarak dışa aktarma | **Seçili birimin telemetrisi**: her değer, saniyede 1-20 | yeni |
| Olay günlüğü, çift tıklayınca oraya gider ve seçer | **Olaylar** listesi, türe ve birime göre süzülmüş; bir tıklama oraya uçar | hazır |
| Önceki / sonraki olay (Ctrl+←/→) | **Page Up / Page Down** | yeni |
| Olayda duraklatma | **Olayda duraklat** | yeni |
| Zaman çizelgesi işaretleri (bırakmalar, isabetler, yok etmeler; seçili nesnenin mavi, yer imlerinin kırmızı) | Öldürmeler ve ölümler bir yoğunluk çubuğu olarak, izlenen birimin mavi, yer imleri kırmızı; gitmek için tıklayın | yeni |
| Bir olayı kaldırma, öldürme-kaldırma | Yapılmadı | uygulanmaz (olaylar kaydın parçasıdır; süzgeçler onları gizler) |

## Yer imleri {#bookmarks}

| Tacview | 3DHeat | Durum |
|---|---|---|
| Seçim ve bakış açısıyla yer imi ekleme | **Yer imi ekle** (B): an, serbest kamera ya da izlenen birim ve görünümü, mesafesi ve hedefi; adlandırılmış; kayıt başına bu tarayıcıda tutulur | yeni |
| Yer imi kaldırma | Listedeki × | yeni |
| Yer imleri zaman çizelgesinde ve günlüklerde | Kırmızı işaretler; liste | yeni |
| ACMI'de Event=Bookmark | Kaydın işaretleri altında, öldürmeler, ölümler ve mesajlarla birlikte listelenir | yeni |
| Kopyala/yapıştır kısayolu (bir görünümü paylaşma) | Yer imlerini bir dosya olarak **Dışa aktar / İçe aktar**; C kamera konumunu kopyalar | yeni |

## Oynatma {#playback}

| Tacview | 3DHeat | Durum |
|---|---|---|
| Oynat/duraklat, başa, hız, zaman çizelgesinde gezinme | Zaman çizelgesi | hazır |
| Kare kare | **,** ve **.** bir saniye geri ve ileri (Shift: on saniye) | yeni |
| Ters oynatma | Zaman çizelgesinde **◀**, **J** (ileri **L**; aynı tuşa tekrar basmak duraklatır): sondan başa, seçilen hızda oynatır, başta döngü ya da durur | yeni |
| Zaman atlama penceresi | Zaman çizelgesi ve olay listesi | hazır |
| Tek bir nesneyi zamanda kaydırma (hayalet) | **Zaman kaydırma ve kırpma**: bir birimin uçuşunu ya da tüm bir kaydı, o kadar saniye kaydırın; **Kayıtları hizala** birkaç kaydı birlikte başlamak üzere taşır ve aynı anda oynatır (farklı günlerdeki iki görev yan yana). Kayıt yeniden kurulur; izler, olaylar, grafikler ve istatistikler buna uyar | yeni |
| Öncesini/sonrasını kırpma | **Şimdiden / Şimdiye / Bu aralığa kes** (geri almak kaydırmaları korur), ardından **CSV olarak dışa aktar** (3DHeat'e geri yüklenir) ya da **ACMI olarak dışa aktar** (Tacview 2.2 metni, Dünya'ya yerleştirilmiş bir kayıt için) | yeni |

## Arazi ve harita {#terrain-and-map}

| Tacview | 3DHeat | Durum |
|---|---|---|
| Gerçek arazi, özel yükseklik ve dokular | Seviyeler (oyunun kendi haritası bir 3B model olarak), dünya arka planı kareleri | hazır |
| Düz / boş / yüksek kontrastlı arazi modları | [Seviye görünümü](level-appearance.md): zemin kabartısı, yüzey ve yapılar gösterilir ya da gösterilmez | hazır (aynı modlar değil) |
| 2B taktik harita (Tacview'de yok: uydu görünümü var) | **2B harita**: köşe ya da tüm görünüm, türe ve takıma göre semboller (dolu oyuncular, çizgili YZ) pruvasına döndürülmüş, izler, adlar, ölçek çubuğu, izlenen birim etrafında menzil halkaları, bullseye halkaları, 3B kameranın yeri, son ölümler; sürükleyin, kaydırın, izlemek için tıklayın (M) | yeni |
| Statik nesneler (havalimanları, pistler, way noktaları, alanlar, KML) | Dünya arka planında ölçülmüş pistler (OurAirports) ve süzülüş yolları; GPX way noktaları ve KML işaretleri duran nesneler olarak yüklenir; [Taktik tahta](tactics-board.md) alanları ve rotaları çizer | yeni |

## İçe aktarma, dışa aktarma, kayıt {#import-export-recording}

| Tacview | 3DHeat | Durum |
|---|---|---|
| ACMI metni ve zip | [Tacview ACMI](tacview-acmi.md) | hazır |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (izler, rotalar, way noktaları; Garmin kalp atışı, kadans, güç, sıcaklık), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (her konuşucunun RMC ve GGA cümleleri, sağlama toplamları kontrol edilir, gece yarısını aşarak), **IGC** (B kayıtları, tarih, pilot ve planör), **FIT** (kayıt iletileri, sıkıştırılmış zaman damgaları) — her biri izlerin ortasındaki düzlemde enlem ve boylamıyla yerleştirilir, böylece dünya arka planı hizalanır; yönelim, eğim ve hız dosyadan ya da bir konum düzeltmesinden diğerine hesaplanır. CSV ve Parquet eskisi gibi | yeni (DIS uygulanmaz: canlı bir ağ protokolü) |
| Yerel kayıt cihazları (DCS, BMS, IL-2, MSFS...) | 3DHeat'in kendi dönüştürücüleri (War Thunder, CS2, Squad, Arma ve diğerleri) | hazır (kendi) |
| TCP üzerinden gerçek zamanlı telemetri, ADS-B | Yapılmadı | uygulanmaz (maçtan sonra tekrarlanır) |
| Eşzamanlı ses/video | **Ses ve video**: yerel bir dosya, ayarlanan bir başlangıçtan itibaren zaman çizelgesiyle oynar, duraklar, konum değiştirir ve hızı değiştirir (**Şimdi başlar**, ±0,1 s); görünümün üzerinde boyutlandırılabilir bir panelde video ya da resim içinde resim. Dosya tarayıcıda kalır | yeni |
| Video dışa aktarma | [Kamera yolu ve video](camera-path-and-video.md) | hazır |

## Diğer {#other}

| Tacview | 3DHeat | Durum |
|---|---|---|
| Lua eklentileri | Yapılmadı | uygulanmaz (açık kaynak: görüntüleyicinin kendisini değiştirin) |
| Çevrimiçi brifing (paylaşılan oturum) | Yapılmadı | uygulanmaz (Tacview'in ki herkesi tek bir oynatma başında tutan barındırılan bir oturumdur. 3DHeat'te sunucu yoktur ve kayıtlar görüntüleyicinin makinesinde tutulur; eşler arası bir bağlantı bile bir sinyal sunucusu gerektirir. Bir brifing dosya olarak paylaşılır: kırpılmış kayıt (ACMI ya da CSV olarak dışa aktarma) ve aynı anlarda ve görünümlerde açılan yer imi dosyası) |
| Eğitmen uzaktan kumandası | Yapılmadı | uygulanmaz (çalışan bir simülatörü kontrol eder) |
| Nesne düzenleme (nesne ekleme, düzenleme, kaldırma) | Planlanmış nesneler için [Taktik tahta](tactics-board.md); kayıtlar salt okunurdur | uygulanmaz |
| Diller | 40 dil | hazır |
| Kayıtların kimlik doğrulaması | Yapılmadı | uygulanmaz |

## Geliştiriciler için: ACMI 2.2 özellikleri {#for-developers-acmi-22-properties}

`data/acmi.ts` tarafından okunur; sayısal özellikler sayı sütunları, metin olanlar kategori sütunları olur. Hepsi birim kartında **Ham** altında gösterilir. Bunlar bir amaç için okunur:

| Özellikler | Kullanım |
|---|---|
| T (dört biçimin tümü), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Konum, tutum, figür, birim adı, takım |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Alanlar, grafikler, HUD, kalkış ve iniş algılama |
| VerticalGForce, LongitudinalGForce, LateralGForce | G alanları |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Alanlar |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Yakıt alanları, depolar üzerinden toplanır |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radar konileri ve menzil kapısı |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Kilit çizgileri |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Angajman kubbeleri |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Alanlar |
| Health | Alan |
| Olaylar: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Olay listesi, istatistikler (ölümler, kalkışlar, inişler), yer imleri; Message ve Comment altyazı olarak |
| PilotHeadYaw, PilotHeadPitch | Pilotun görüş hattı |
| Tür etiketi Bullseye (Navaid+Static+Bullseye) | Bullseye alanı ve harita halkaları |
| Diğer her şey (PilotHeadRoll, kontroller, yüzeyler, ILS sapmaları, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, boyutlar...) | **Ham** altında yazıldığı gibi gösterilir |

Radar ve kilit açıları birimin kendi eksenlerine göre alınır: azimut sağa, yükseklik yukarı, yalpa sağ kanat aşağı. ACMI spesifikasyonu bunların uçağa göre olduğunu, ama hangi yönün pozitif olduğunu söylemez; bu okuma dönüşümünü izler (yaw saat yönünde, pitch yukarı, roll sağa).
