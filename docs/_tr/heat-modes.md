---
title: "Isı modları"
nav_order: 4
has_children: true
lang: "tr"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Isı modları

Her nokta biraz parıltı ekler, parıltılar üst üste biner ve yığın renklerle boyanır. Modlar bunu boyamanın beş yoludur ve her biri bir soruyu yanıtlar.

Isı haritası sekmesinin kenar çubuğunun üstündeki mod çubuğu, [veri kümesinin](glossary.md) nasıl çizileceğini seçer. 1-4 tuşları Isı, Fark, Takım ısısı ve Çizgiler'i seçer. Figür bindirmenin bir tuşu yoktur.

![Isı, Fark, Takım ısısı, Figür bindirme ve Çizgiler ile mod çubuğu](../assets/img/en/heat-modes-bar.webp)

| Mod | Yanıtladığı soru |
|---|---|
| **Isı** | Nerede oldu ve ne kadar? |
| **Fark** | Hangi taraf daha çok yaptı? |
| **Takım ısısı** | Kimin yaptığı? |
| **Çizgiler** | İnsanlar hangi yönde gitti? |
| **Figür bindirme** | Kim nerede ve ne zaman oldu? |

![Aynı veri dört modda: Isı, Fark, Takım ısısı ve Çizgiler](../assets/img/en/heat-modes-grid.webp)

| Mod (mod çubuğu etiketi) | Tuş | Ne çizer | Gerektirir |
|---|---|---|---|
| **Isı** | 1 | Toplamalı yoğunluk: görünen her satır kameraya dönük bir radyal sprite ekler. [Isı](heat.md) | bir veri kümesi |
| **Fark** | 2 | İşaretli yoğunluk: bir nüfus ekler, diğeri çıkarır. [Fark](difference.md) | iki taraf: en az iki grup ya da ayırmak için tutulmuş bir sütunda bölme |
| **Takım ısısı** | 3 | Gruba göre renklendirilmiş yoğunluk: grup başına bir ton, gruplar üst üste geldiği yerde karışır. [Takım ısısı](team-heat.md) | bir grup sütunu |
| **Figür bindirme** | - | Kişi başına bir figür (ya da kutu), zaman çizelgesinde hareket eder: tekrar. [Figür bindirme](box-replay.md), [Maç tekrarı](match-replay.md) | bir kişi sütunu |
| **Çizgiler** | 4 | Çizgi ısısı: bir kişinin her örneğinden bir sonrakine bir çizgi, ısı yanlara doğru azalır. [Çizgi ısısı](line-heat.md) | bir kişi ve bir zaman sütunu |

Veri kümesinin desteklemediği bir mod soluk gösterilir ve ipucu nedenini verir; örneğin *Kullanılamıyor — Fark modu, ayırmak için iki grup ya da filtreleme için tutulan bir sütun gerektirir; bu veride bir grup var.* Yeni bir veri kümesi geçerli modu desteklemezse, görünüm **Isı** moduna döner.

1-4 tuşları aynı şekilde veriye göre denetlenir: soluk gösterilen bir modun tuşu hiçbir şey yapmaz.

## Her modun gösterdiği paneller {#which-panels-each-mode-shows}

| Panel | Isı | Fark | Takım ısısı | Figür bindirme | Çizgiler |
|---|---|---|---|---|---|
| Yollar ([çizgi ısısı](line-heat.md)) | | | | | evet |
| Isı şekli (**Görünümü izle** ve **Her yakınlaştırmada aynı yoğunluk** ile), Isı renkleri, Sprite piksel sınırları, Derinlik, Mesafe eleme | evet | evet | evet | | evet |
| Yön ([yönlü ısı](directional-heat.md)), Değer ([değer ağırlıklandırma](value-weighting.md)) | evet | evet | evet | | evet |
| Takım görüntüleyici ([figür bindirme](box-replay.md)) | | | | evet | |
| Fark bölmesi ([fark](difference.md)) | | evet | | | |
| [Takımlar](teams-list.md), [Varlıklar](entities.md), [Filtreler](filters.md), Arka plan / bölüm, [Kesit](slice.md), [Ölçüm](measure.md), Kamera yolu ve render, Performans, Kamera ve sahne | evet | evet | evet | evet | evet |

## Her ısı modunun ortak noktaları {#what-every-heat-mode-shares}

Figür bindirme dışındaki dört ısı modunun tümü farklı girdilerle aynı makinedir ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Hangi satırlar.** [Zaman çizelgesi](timeline.md) penceresi zamana göre sıralı satırların sürekli bir aralığını seçer; [filtreler](filters.md), grup görünürlüğü, fark bölmesi, [mesafe elemesi](depth-and-culling.md#distance-culling) ve [kesit](slice.md) her satırın katkıda bulunup bulunmayacağına ve ne kadar güçlü katkıda bulunacağına köşe gölgelendiricide karar verir.
2. **Serpme.** Katkıda bulunan her satır, bir sprite (ya da Çizgiler modunda bir parça) olarak kayan noktalı bir **ısı hedefine** çizilir ve kendi rampa değerini ekler. Bir karenin karşılayabileceğinden fazla satır olduğunda satırların katmanlı bir örneği çizilir ve bunu telafi etmek için ağırlıklandırılır. Bkz. [Örnekleme ve bütçeler](sampling-and-budgets.md).
3. **Birikim.** Hiçbir şey değişmediği sürece, her satır tam olarak bir kez katkıda bulunana kadar kareler birleştirilir. Bkz. [Birikim](accumulation.md).
4. **Bileşim.** Her pikseldeki birikmiş değer **doygunluk noktasına** bölünür, **yoğunluk tepkisiyle** şekillendirilir, **en az ısı** ile yükseltilir ve **renk rampasında** aranır; rampanın alfası onu sahneyle karıştırır. Bkz. [Renk ve pozlama](colour-and-exposure.md).

Adım 4'teki her şey bileşim sırasında uygulanır; bu yüzden bu denetimleri sürüklemek birikimi asla yeniden başlatmaz; adım 1-2'deki her şey başlatır.

## Bu bölümdeki sayfalar {#pages-in-this-section}

- [Isı](heat.md) - düz ısı modu ve panellerinin genel görünümü
  - [Sprite şekli](sprite-shape.md) - yarıçap, yoğunluklar, sönümleme, eğri düzenleyici, piksel sınırları, düzleştirme
  - [Renk ve pozlama](colour-and-exposure.md) - rampa düzenleyici, doygunluk noktası, otomatik pozlama, en az ısı, yoğunluk tepkisi
  - [Derinlik ve eleme](depth-and-culling.md) - seviyenin örtmesi, arazinin arkasında gizleme, mesafe elemesi
- [Fark](difference.md) - fark bölmesi
- [Takım ısısı](team-heat.md)
- [Çizgi ısısı](line-heat.md) - yollar
- [Figür bindirme](box-replay.md) - tekrar modu (dosyanın adı hâlâ kutu tekrarı)
- [Yönlü ısı](directional-heat.md)
- [Değer ağırlıklandırma](value-weighting.md)
