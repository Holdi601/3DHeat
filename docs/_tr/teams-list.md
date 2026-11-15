---
title: "Takım listesi"
parent: "Filtreler ve araçlar"
nav_order: 2
lang: "tr"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Takım listesi

**Takımlar** paneli bir takımı gizlemenizi ya da bir karşılaştırmanın bir tarafına koymanızı sağlar. Yalnızca Mavi'ye bakmak ya da "Mavi'nin Kırmızı'nın gitmediği nereye gittiği" sorusunu sormak için kullanın.

*Grup*, bir takım ya da taraftır; örneğin Mavi ve Kırmızı ([Gruplar](sessions-persons-groups.md#group)). Panel, veri kümesinde bir grup sütunu olduğunda gösterilir; grup sayısı başlığında yazar. Takım ısısı kipinde kenar çubuğunda **Takım görüntüleyici** adlı, kendi ayarları olan bir bölüm de vardır; bu sayfa **Takımlar** listesini anlatır.

## Bir takımı gizleyin {#hide-a-team}

1. Kenar çubuğunda **Takımlar**'ı açın.
2. Gizlenecek takımın kutusunun (*Görünür*) işaretini kaldırın. Resim hemen güncellenir.
3. Her takımı geri getirmek için **Tümünü göster**'e basın.

![Takım listesi: Mavi 5p, Kırmızı 5p, Tümünü göster ile](../assets/img/en/teams-list.webp)

## Her satır {#each-row}

| Parça | Anlamı |
|---|---|
| Kutu (*Görünür*) | Grubu göster ya da gizle. |
| Renk örneği | Grubun rengi: Takım ısısı kipinde [takım ısısı](team-heat.md) rengi, diğer kiplerde temel rengi. |
| Ad | Grup etiketi (tam etiket üzerine gelince). |
| **+** / **-** (Fark kipi) | Grubu [farkın](difference.md) pozitif ya da negatif tarafına koyar; etkin düğmeye yeniden basmak onu iki tarafın da dışına koyar. |
| `Np` (diğer kipler) | İlk satırı bu grupta olan kişi sayısı. |

![Fark kipi: Mavi + tarafında, Kırmızı - tarafında](../assets/img/en/teams-list-difference.webp)

## Düğmeler {#buttons}

| Düğme | Etkisi |
|---|---|
| **Tümünü göster** | Her grubu yeniden görünür yapar. |
| **Eşit böl** (Fark kipi) | Grupların ilk yarısı (yukarı yuvarlanmış) +'ya, kalanı -'ye; her yüklemede aynı bölünme ile başlar. |

## Bir grubu gizlemek ne yapar {#what-hiding-a-group-does}

- **Isı**, **Takım ısısı** ve **Çizgiler** kiplerinde grubun satırları hiçbir şeye katkıda bulunmaz.
- **Fark** kipinde gizli bir grup, hangi tarafta olursa olsun hiçbir şeye katkıda bulunmaz; başka bir sütuna göre bölmede de böyledir (bkz. [Fark](difference.md#for-developers)).
- **Figür bindirmede**, ilk satırı o grupta olan kişiler çizilmez.
- **Takım ısısında** diğer gruplar renklerini korur: tonlar görünür olanlardan değil, toplam grup sayısından atanır; böylece iki resim karşılaştırılabilir kalır.

Görünürlüğü değiştirmek birikimi yeniden başlatır. Her yeni veri kümesinde her grup yeniden görünür olur.

Panelin ipucu kipe göre değişir: Fark'ta + ve - tarafların ne olduğunu açıklar; Takım ısısında renk örneklerinin her grubun çizdiği renkler olduğunu.
