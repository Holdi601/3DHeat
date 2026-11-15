---
title: "Ayarlar, birimler ve tuşlar"
nav_order: 19
lang: "tr"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Ayarlar, birimler ve tuşlar

Kenar çubuğunun üstündeki küçük denetimler görüntüleyicinin sizinle nasıl konuştuğunu değiştirir: dil, birimler (metre ya da fit, km/sa ya da deniz mili) ve renkleri açıklayan bir yardım modu. Seçimleriniz tarayıcınızda hatırlanır.

## Üst bilgi {#the-header}

Kenar çubuğunun en üstünde:

| Denetim | Ne yapar |
|---|---|
| **?** | Yardım modu: her rengin ne anlama geldiği (ayrıca `?` ya da `F1`) |
| **Birimler** menüsü | Metrik, İmparatorluk, Havacılık ya da Deniz |
| **Birimler**in yanındaki **...** düğmesi | "Her nicelik için bir birim seçin" penceresini açar: nicelik başına bir açılır liste |
| **Dil** menüsü | Görüntüleyicinin dili: [40 dil](languages.md) ya da tarayıcınınki |

![Birimler menüsü ve nicelik başına birim penceresi açık üst bilgi](../assets/img/en/settings-units.webp)

Bir kutuya yazdığınız sayılar nokta ya da virgül kullanabilir (`0.35` ya da `0,35`). Görüntüleyici ikisini de okur ve sayıları görüntüleyicinin dilinin yazdığı biçimde gösterir.

## Birimler {#units}

1. **Birimler** menüsünde bir ön ayar seçin. Tüm nicelikler birlikte değişir.
2. Yalnızca bir niceliği değiştirmek için, yanındaki **...** düğmesine tıklayın ve o nicelik için bir birim seçin. Menü bundan sonra ön ayarın yanında bir `*` gösterir.
3. Ayarlamadığınız bir nicelik ön ayarı izler. Geri dönmek için "Ön ayar gibi" seçin.

| Nicelik | Metrik (varsayılan) | İmparatorluk | Havacılık | Deniz |
|---|---|---|---|---|
| Mesafe | km | mi | NM | NM |
| Yükseklik, uzunluk | m | ft | ft | m |
| Hız | km/sa | mph | kt | kt |
| Dikey hız | m/sn | ft/dk | ft/dk | m/sn |
| Sıcaklık | °C | °F | °C | °C |
| Basınç | hPa | inHg | hPa | hPa |
| Kütle, yakıt | kg, l | lb, gal | lb, gal | t, m³ |
| Açı | derece | derece | derece | derece |

Bir nicelik için seçebileceğiniz diğer birimler: mesafe km, mi, NM; hız km/sa, m/sn, kt, mph; dikey hız m/sn, ft/dk, m/dk; sıcaklık °C, °F, K; basınç hPa, inHg, mmHg, psi; kütle kg, lb, t; açı derece ya da NATO mil'i (çemberde 6400). Birimler görüntüleyicide her yerde aynıdır: etiketler, kartlar, grafikler, istatistikler.

## Yardım modu {#help-mode}

![Yardım modu: renklerin ne anlama geldiği](../assets/img/en/help.webp)

`?` ya da `F1`'e basın ya da **?** düğmesine tıklayın. *Renklerin anlamı* bölümünü gösterir: 3B görünüm için açıklamalar, ısı rampaları, takım renkleri, seviyenin renkleri, panellerin durum renkleri, maç paneli ve yarış görünümü. Kapatana kadar açık kalır. Maç sekmesinde maç panelinin renklerini de açıklar.

![Maç sekmesinde yardım modu](../assets/img/en/settings-help-match.webp)

## Tarayıcının hatırladıkları {#what-the-browser-remembers}

Bu ayarlar ziyaretler arasında tarayıcınızda tutulur (hiçbir şey bir yere gönderilmez):

- dil, birimler ve yardım modu;
- tekrarın figür, sembol, etiket, kamera ve taktik ekran ayarları;
- oynatma hızı ve aynalama;
- kayda göre yer imleri, veri kümesine göre hacimler, hedef katmanları;
- harici yapay zekâ ayarları (anahtar yalnızca *Hatırla* işaretliyse).

Isı ayarları, filtreler ve mod her yüklemede sıfırdan başlar. Tam, üretilmiş liste: [Kayıtlı ayarlar](ref-settings-storage.md).

## Görüntüleyicinin tarayıcıdan korduğu tuşlar {#keys-the-viewer-keeps-from-the-browser}

Büyük verili bir oturumun yüklenmesi zaman alır; bu yüzden görüntüleyici tarayıcının onu yanlışlıkla atmasını engeller:

- Metin kutuları dışında, yazdıracak, kaydedecek, açacak, yeniden yükleyecek, kapatacak ya da yeni pencereler açacak `Ctrl`/`Cmd` + harf tuşları hiçbir şey yapmaz; `F1`, `F3`, `F5`, `F6` ve `F7` hiçbir şey yapmaz.
- Veri ya da bir seviye yüklüyken sekmeyi kapatmak ya da yeniden yüklemek önce sorar.
- Tam ekranda görüntüleyici kullandığı tuşları (W, T, N, S, R, P, Q, Esc) kilitler; böylece tarayıcı onları almaz.

Tam liste: [Tarayıcı tuşları](ref-browser-keys.md). Görüntüleyicinin kendi tüm tuşları: [Klavye ve fare başvurusu](keyboard-reference.md).
