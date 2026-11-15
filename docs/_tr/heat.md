---
title: "Isı"
parent: "Isı modları"
nav_order: 1
lang: "tr"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Isı

Isı, çok şeyin olduğu yerleri boyar: bir miktar olduğu yerde kırmızı, çok olduğu yerde beyaz-sıcak. "Bu nerede oluyor ve ne kadar" sorusunu yanıtlar.

**Isı** (tuş 1) varsayılan moddur. Görünen her [satır](glossary.md) kameraya dönük yuvarlak bir [sprite](glossary.md) katkıda bulunur; üst üste binen sprite'lar kayan noktalı bir tamponda toplanır; toplam bir renk rampasından geçirilir - varsayılan olarak saydam → kırmızı → sarı → beyaz - ve sahnenin üstüne çizilir.

![Bir 3B haritada ısı: binaların içinde ve üstünde sıcak noktalar](../assets/img/en/shooter-heat.webp)

Resim, binaları olan bir haritada bir shooter turunun ısısını gösterir: sıcak noktalar yalnızca zeminde değil, odalarda ve merdivenlerde de bulunur.

## Nasıl kullanılır {#how-to-use-it}

1. Verileri yükleyin ve `1` tuşuna basın (ya da mod çubuğunda **Isı**'yı seçin).
2. Her şey beyaz ya da boşsa, **Isı şekli** bölümündeki **Alana göre otomatik pozlama**'ya basın.
3. Komşu noktalar bantlar halinde birleşene kadar **Sprite yarıçapı**'nı değiştirin: küçük olan tek tek noktaları, büyük olan alanları gösterir.
4. Renkleri değiştirmek için **Isı renkleri**'ni, tepelerin ve duvarların ısıyı arkalarında gizlemesi için **Derinlik**'i açın.

![Kenar çubuğunun iki bölümü, Isı şekli ve Isı renkleri, ikisi de açık](../assets/img/en/heat-panel.webp)

Aynı paneller [Fark](difference.md), [Takım ısısı](team-heat.md) ve [Çizgi ısısı](line-heat.md) modlarını da şekillendirir; farkları eklenen şeyde (işaretli, renkli ya da çizgiler boyunca), şekillendirme biçiminde değil.

## Paneller ve varsayılanları {#the-panels-and-their-defaults}

Aşağıdaki her denetim bir gölgelendirici parametresine karşılık gelir; bu yüzden onu değiştirmek bir yeniden çizimden başka bir şeye mal olmaz. Kaydırıcıların yanında yazılabilir bir kutu ve bir sürükleme tutamacı vardır (sağdaki küçük tutamaç: yukarı ya da aşağı sürükleyin, uzağa giderseniz daha hızlı; ince ayar için Shift); bir kaydırıcının izi gerçek bir sınırdan önce biterse, tutamaç burada verilen *sürükleme tavanına* kadar ileri gidebilir. *Yükleme anında* işaretli değerler her yeni veri kümesi için yeniden hesaplanır.

### Isı şekli (açık) {#heat-shape-open}

| Denetim | Varsayılan | Aralık (sürükleme tavanı) | Ayrıntılar |
|---|---|---|---|
| **Sprite yarıçapı** | 6 m; yüklemede kapsam / 120 | 0,05-2000 m, logaritmik (50.000) | [Sprite şekli](sprite-shape.md#sprite-radius) |
| **Merkez şiddeti** | 1 | 0-10 (1000) | [Sprite şekli](sprite-shape.md#centre-and-edge-intensity) |
| **Kenar şiddeti** | 0 | -2-10 (1000) | [Sprite şekli](sprite-shape.md#centre-and-edge-intensity) |
| **Rampa şekli** | *Azalma* | *Azalma* / *Eğri* | [Sprite şekli](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Azalma** (yalnızca Azalma) | 1,6 | 0,1-8 (64) | [Sprite şekli](sprite-shape.md#falloff) |
| **Yumuşak rampa** (yalnızca Azalma) | açık | | [Sprite şekli](sprite-shape.md#falloff) |
| Eğri düzenleyici (yalnızca Eğri) | *Yumuşak* ön ayarı | | [Sprite şekli](sprite-shape.md#the-curve-editor) |
| **Doygunluk noktası** | 24; yüklemede bir tahmin, sonra ölçülür | 0,1-4000, logaritmik (10.000.000) | [Renk ve pozlama](colour-and-exposure.md#saturation-point) |
| **En düşük ısı** | kapalı (0) | %0-100 | [Renk ve pozlama](colour-and-exposure.md#minimum-heat) |
| **Yoğunluk tepkisi** | *Doyuran* | *Doyuran* / *Doğrusal* / *Log* | [Renk ve pozlama](colour-and-exposure.md#density-response) |
| **Alana göre otomatik pozlama** | | düğme | [Renk ve pozlama](colour-and-exposure.md#auto-exposure) |
| **Görünümü izle** | açık | | Kamera durduğunda pozlamayı yeniden ölçer; böylece uçtuğunuz bir bölge tüm renk rampasını kullanır. Küçük değişiklikler yok sayılır ve ölçek yumuşakça kayar. Ölçeği kilitlemek ve yerleri tek bir ölçekte karşılaştırmak için kapatın ya da **Doygunluk noktası**'nı sürükleyin. [Renk ve pozlama](colour-and-exposure.md#follow-the-view) |
| **Her yakınlaştırmada aynı yoğunluk** | açık | | Bir renk, ne kadar yakın olursanız olun, alan başına aynı sayıda satır demektir. Piksel sınırlarının büyüttüğü (uzaktan) ya da küçülttüğü (yakından) bir sprite, gerçek boyutunun ekleyeceği ısıyı korur; böylece uzaktan pozlanan bir resim içine uçtukça solmaz. Kapalıyken, sınırlanmış bir sprite tam ağırlığını sınırlanmış boyutunda ekler. [Sprite şekli](sprite-shape.md#pixel-clamps) |
| **Zemin düzlemine yasla** | kapalı | | [Sprite şekli](sprite-shape.md#flatten-onto-ground-plane) |

### Isı renkleri (kapalı) {#heat-colours-closed}

| Denetim | Varsayılan | Ayrıntılar |
|---|---|---|
| Grup renkleri ve **Renk ayrımı** (yalnızca Takım ısısı) | 1,4 | [Takım ısısı](team-heat.md) |
| **Isı rampası** düzenleyici (Fark'ta *Pozitif (ekleyen takımlar)*, Takım ısısı'nda *Opaklık rampası*) | saydam → kırmızı → sarı → beyaz | [Renk ve pozlama](colour-and-exposure.md#the-ramp-editor) |
| **Saydam → kırmızı → sarı → beyaz olarak sıfırla** | | |
| **Negatif (çıkaran takımlar)** rampası (yalnızca Fark) | saydam → yeşil → mavi → mor | [Fark](difference.md#colours) |

### Sprite piksel sınırları (kapalı) {#sprite-pixel-clamps-closed}

| Denetim | Varsayılan | Aralık (sürükleme tavanı) | Ayrıntılar |
|---|---|---|---|
| **En küçük piksel yarıçapı** | 1 px | 0-16 (512) | [Sprite şekli](sprite-shape.md#pixel-clamps) |
| **En büyük piksel yarıçapı** | 96 px | 2-1024, logaritmik (8192) | [Sprite şekli](sprite-shape.md#pixel-clamps) |

### Derinlik (açık) {#depth-open}

| Denetim | Varsayılan | Ayrıntılar |
|---|---|---|
| **Arazinin arkasındakini gizle** | açık | [Derinlik ve eleme](depth-and-culling.md#hide-behind-terrain) |
| **Geometrinin arkasında kalan** | 0,8 (*%80 daha koyu*) | [Derinlik ve eleme](depth-and-culling.md#hidden-behind-geometry) |

### Mesafe elemesi (kapalı) {#distance-culling-closed}

| Denetim | Varsayılan | Aralık (sürükleme tavanı) | Ayrıntılar |
|---|---|---|---|
| **Yakın** | kapalı (0) | 0,5-5000 m, logaritmik, parçanın alt ucu = kapalı (200.000) | [Derinlik ve eleme](depth-and-culling.md#distance-culling) |
| **Uzak** | kapalı (0) | 1-200.000 m, logaritmik, alt uç = kapalı (10.000.000) | [Derinlik ve eleme](depth-and-culling.md#distance-culling) |
| **Bir düzlemde kes** | açık | | [Derinlik ve eleme](depth-and-culling.md#distance-culling) |
| **Bölümü de kes** | açık | | [Derinlik ve eleme](depth-and-culling.md#distance-culling) |

Tuşlar: `[` ve `]` uzak sınırı içe ve dışa iter, `\` onu açıp kapatır ([Derinlik ve eleme](depth-and-culling.md#keyboard)).

### Yön ve Değer {#direction-and-value}

Isı şekli'nin altında iki bölüm daha vardır. **Yön** her satırı bir kama olarak çizer ve oklar ekler: bkz. [Yönlü ısı](directional-heat.md). **Değer** ısıyı her satırın neye mal olduğu ya da ne kazandırdığı ile tartar: bkz. [Değer ağırlıklandırma](value-weighting.md).

## Neler kaydedilir {#what-is-saved}

Yukarıdaki ısı ayarları oturumlar arasında saklanmaz: sayfayı yeniden yüklemek varsayılanları geri getirir. Tarayıcıda iki şey tutulur: son oynatma hızı (`heat3d.speed`, bkz. [Zaman çizelgesi](timeline.md)) ve [figür bindirmenin](box-replay.md) uzaktaki figür ayarları (sembol stili, boyut, isabet işaretleri ve benzeri). Dil, [ters dünya eksenleri](camera.md#invert-world-axis), yarış sekmesinin hatırladığı araba adları ve [harita kitaplığı](level-library.md) da öyledir. Tam liste [Kayıtlı ayarlar](ref-settings-storage.md) sayfasındadır.
