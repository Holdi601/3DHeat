---
title: "Klavye ve fare başvurusu"
parent: "Kamera ve denetimler"
nav_order: 2
lang: "tr"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Klavye ve fare başvurusu

Her tuş ve fare işlemi tek bir yerde, böylece ihtiyacınız olanı kolayca bulursunuz. Önce görünüme tıklayın ki klavyeyi alsın. Bir metin kutusu ya da açılır liste odakta olduğunda tuşlar yok sayılır. Kısa özet, görünümün sol altında da yazılıdır.

Hızlı arama:

| Yapmak istediğim ... | Basın |
|---|---|
| uçmak | `W A S D`, bakmak için sürükleyin |
| her şeyi görmek | `F` |
| oynatmak ya da duraklatmak | `K` |
| geriye oynatmak | `J` (duraklatmak için yeniden basın), ileri `L` |
| renklerin ne anlama geldiğini görmek | `?` ya da `F1` |
| Taktik sekmesinde geri almak | `Ctrl+Z` |

## Kamera {#camera}

[`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts) dosyasından.

| Girdi | Etkisi |
|---|---|
| `W` / `↑` | Bakış yönünde ileri |
| `S` / `↓` | Geri |
| `A` / `←` | Sola kay |
| `D` / `→` | Sağa kay |
| `Space` / `E` | Yukarı |
| `Q` / sol `Ctrl` | Aşağı |
| `Shift` (herhangi biri) | Basılı tutun: 6 kat hız |
| sol `Alt` | Basılı tutun: %15 hız |
| Görünümde sol ya da sağ sürükleme | Bakma (düğme basılıyken imleç kilitlenir) |
| Tekerlek (perspektif) | Uçuş hızı tık başına ×1,5 (tekerlek olayı başına en fazla 4 tık) |
| Tekerlek (paralel) | Yakınlaştırma |
| Sağ tık | Görünümde bağlam menüsü açılmaz |

## Genel {#global}

[`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx) dosyasından.

| Tuş | Etkisi |
|---|---|
| `K` | [Zaman çizelgesini](timeline.md) oynat / duraklat |
| `F` | Verileri çerçeveye al |
| `C` | Kameranın konumunu, yaw ve pitch değerlerini kopyala ([kamera göstergesi](camera.md#camera-readout)) |
| `G` | Yazılan bir noktaya git: kamera göstergesinin altındaki kutuyu açar |
| `Esc` | Seçim kartını kapat; sonra ikinci birime bakmayı bırak; sonra bir birimi takip etmeyi bırak |
| `T` | Taktik ekran görünümünü aç ya da kapat ([Maç tekrarı](match-replay.md#display-style)) |
| `?` / `F1` | Yardım modu: renklerin ne anlama geldiği ([Ayarlar, birimler ve tuşlar](settings.md#help-mode)) |
| `1` | [Isı](heat.md) |
| `2` | [Fark](difference.md) |
| `3` | [Takım ısısı](team-heat.md) |
| `4` | [Çizgiler](line-heat.md) |
| `]` | Uzak eleme sınırını ×1,12 dışarı it (`Shift`: ×1,35) |
| `[` | Uzak eleme sınırını ÷1,12 içeri çek (`Shift`: ÷1,35) |
| `\` | Uzak eleme sınırını kapat / kapatılmadığı yerde yeniden aç ([Derinlik ve eleme](depth-and-culling.md#keyboard)) |

**Figür bindirme** modunun bir sayı tuşu yoktur; onu mod çubuğundan seçin ya da Maç sekmesini açın. Sayı tuşları mod çubuğuyla aynı kontrolden geçer: yüklenen veriler için mod çubuğunda kullanılamaz görünen bir modun tuşu hiçbir şey yapmaz.

## Maç tekrarı {#match-replay}

Maç sekmesinin kullandığı Figür bindirme modunda ([Maç tekrarı](match-replay.md)). Aksi belirtilmedikçe, bir birim takip edilirken de edilmezken de çalışırlar:

| Tuş | Etkisi |
|---|---|
| `B` | Yer imi ekle: an ve kamera |
| `M` | 2B harita: köşe, tam görünüm, kapalı |
| `V` / `Shift+V` | Takip edilen birimin sonraki / önceki kamera görünümü |
| `H` | Kokpit ve padlock görünümlerinde baş üstü ekran |
| `Page Down` / `Page Up` | Olay listesinin gösterdiği türde sonraki / önceki olay |
| `J` | Geriye oynat; tekrar basınca duraklat |
| `L` | İleri oynat; tekrar basınca duraklat |
| `.` / `,` | Bir saniye ileri / geri, duraklatılmış (`Shift`: on saniye) |
| `Esc` | Önce hedefe bakmayı bırak, sonra takibi bırak |
| Bir birime `Ctrl` ile tıklama ya da `Alt` ile tıklama (görünümde ya da birim listesinde) | Takip edilen birimden ona bak (iki birimli görünüm); bırakmak için yeniden tıkla |
| İki birime `Shift` ile tıklama | Aralarını ölç: yön, mesafe, yükseklik farkı |

`V` takip edilen bir birim gerektirir. Burada `M` 2B haritadır; Taktik sekmesinde ise "taşı" anlamına gelir.

## Bir birimi takip etme {#following-a-unit}

Kamera bir birimi takip ederken tekerlek ve uçuş tuşları, serbestçe uçmak yerine birimin etrafında yön verir ([Kamera](camera.md#while-following-a-unit)):

| Girdi | Etkisi |
|---|---|
| Tekerlek, `W` / `S` | Daha yakın / daha uzak (uydu görünümünde daha yüksek / daha alçak). Kokpit ve padlock görünümlerinde değil. |
| `A` / `D`, `Q` / `E` | Birimin etrafında yörünge (arkadan ve yörünge görünümleri) |
| Sürükleme | Birimin etrafına bak; kokpitte, içeride bak |
| `V` / `Shift+V` | Sonraki / önceki kamera görünümü |
| `H` | Baş üstü ekran (kokpit ve padlock görünümleri) |
| `Esc` | İkinci birime bakmayı bırak, sonra takibi bırak |

## Taktik tahtası {#tactics-board}

Taktik sekmesinde ([Taktik tahtası](tactics-board.md)). `F`, `C`, `G` ve `T` yukarıdaki gibi çalışır; sayı tuşları hiçbir şey yapmaz.

| Tuş | Etkisi |
|---|---|
| `Ctrl+Z` | Geri al |
| `Ctrl+Y` ya da `Ctrl+Shift+Z` | Yinele |
| `Enter` | Çizilmekte olan oku bitir (çift tıklama ya da sağ tıklama da aynısını yapar) |
| `Esc` | Sürüklemeyi iptal et; yoksa çizilen oku ya da sürdürülen taşımayı bırak; yoksa seçimi kaldır |
| `Delete` ya da `Backspace` | Seçimi sil |
| `W` / `E` / `R` | Seçim için Taşı / Döndür / Ölçekle aracı (tuş düzeni **W / E / R**) |
| `G` / `R` / `S` | Seçim için Taşı / Döndür / Ölçekle aracı (tuş düzeni **G / R / S**) |
| `R` | Hiçbir şey seçili değilken: yerleştirilecek bir sonraki figürü 15° döndür. `Shift+R` onu geri döndürür. |
| `M` | Bir figür seçiliyken: onu bir sonraki tıklamaya taşı |
| `K` | Planı oynat ya da duraklat |
| Shift+tıklama | Seçime ekle ya da seçimden çıkar |
| Shift+sürükleme | Seçilecek şeyin etrafına bir kutu çiz |
| Bir tutamacı sürüklerken `Ctrl` | Izgaraya ya da açı adımına yapıştır |

Araç tuşları yalnızca bir şey seçiliyken çalışır; hiçbir şey seçili değilken `W A S D` kamerayı her zamanki gibi uçurur.

## Tıkla-seç {#click-to-pick}

**Tıklama orada ne olduğunu gösterir** açıkken ve cetvel kapalıyken ([Tıkla-seç](camera.md#click-to-pick)):

| Girdi | Etkisi |
|---|---|
| Sol tıklama (4 px'ten fazla sürüklemeden) | İmlecin altındaki veri noktasını ya da seviyedeki noktayı göster |

## Ölçü {#measure}

**Cetvel etkin** açıkken ([Ölçü](measure.md)):

| Girdi | Etkisi |
|---|---|
| Sol tıklama (4 px'ten fazla sürüklemeden) | Bir nokta bırak |
| Sağ tıklama | Son noktayı kaldır |

## Diğer yerler {#elsewhere}

| Nerede | Girdi | Etkisi |
|---|---|---|
| Herhangi bir kaydırıcının tutamağı (sayının yanındaki tutamaç) | Yukarı / aşağı sürükle | Değeri sürekli değiştir; ne kadar uzağa sürüklersen o kadar hızlı. İnce ayar için `Shift` basılı tut. Durdurmak için bırak. |
| Görünümün üstündeki hız göstergesi | Yukarı / aşağı sürükle | Uçuş hızını aynı şekilde değiştir. |
| Konum kutuları | `Enter` | Yazılan konumu ya da yönü uygula. |
| Eğri düzenleyici | Çift tıklama / Alt-tıklama / sağ tıklama | Nokta ekle / nokta kaldır ([Sprite şekli](sprite-shape.md#the-curve-editor)). |

## Yarış analizi sekmesi {#race-analysis-tab}

Yarış analizi sekmesinde `K` yarış tekrarını oynatır ve duraklatır, `Home` onu geri sarar; sayı tuşları hiçbir şey yapmaz. Bkz. [Yarış analizi](race-analysis.md).

## Görüntüleyicinin tarayıcıdan tuttuğu tuşlar {#keys-the-viewer-keeps-from-the-browser}

Bazı tarayıcı kısayolları sayfayı kapatır ya da yeniden yükler ve yüklü oturumu kaybettirir; görüntüleyici bunları kendisi için tutar. Liste koddan üretilir: [Tarayıcı tuşları](ref-browser-keys.md).

## Oyun kumandası {#gamepad}

Bkz. [Oyun kumandası ve HOTAS](gamepad.md).
