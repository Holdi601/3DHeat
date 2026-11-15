---
title: "Harita kitaplığı"
parent: "Haritalar ve arka plan geometrisi"
nav_order: 4
lang: "tr"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Harita kitaplığı

Kitaplık, seviyelerinizi bu tarayıcıda saklar; böylece onları yeniden yükleyip sadeleştirmek zorunda kalmazsınız. **Tarayıcıda sitenin verilerini silmek kitaplığı siler ve dışa aktarma yoktur.** Özgün dosyalarınızı saklayın.

Bir seviyeyi işlemek (ayrıştırma, sınıflandırma, birleştirme, seyrekleştirme, doku paketleme) yavaştır ve sonuç her seferinde aynıdır. **Arka plan / bölüm** panelinin altındaki **Kitaplık**, işlenmiş seviyeleri bu tarayıcıda tutar; böylece seyrekleştirilmiş bir ağ asla iki kez yeniden oluşturulmaz ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Bir seviyeyi kaydedin ve yeniden yükleyin {#save-and-reload-a-level}

1. Bir harita görseli ya da 3B model yükleyin ve doğru göründüğünü denetleyin.
2. **Kitaplığa kaydet**'e basın. Panel *Kaydedildi. Bir dahaki sefere anında yüklenecek.* yazar.
3. Bir dahaki sefere **Kitaplık** listesini açın ve seviyenin yanındaki ▸'ye basın.
4. Artık ihtiyaç duymadığınız bir girdiyi silmek için ✕'e basın.

## Kullanımı {#using-it}

| Denetim | Etkisi |
|---|---|
| **Kitaplığa kaydet** | Geçerli seviyeyi saklar. Bir harita görseli, iki çapasıyla birlikte PNG olarak; bir model, işlenmiş tamponları olarak saklanır. Panel *Kaydedildi. Bir dahaki sefere anında yüklenecek.* yazar. |
| Kitaplık listesi | Saklanan seviye başına bir satır: ad (üzerine gelince saklanan boyut), bir model için üçgen sayısı ya da bir görsel için piksel cinsinden genişlik. |
| ▸ (*Yükle*) | Girdiyi geçerli seviye olarak yükler. |
| ✕ (*Sil*) | Girdiyi kaldırır. |
| Kullanım satırı | `X / Y kullanılıyor.` - bu site için tarayıcının depolama tahmini. |

Hiçbir şey saklanmamışsa liste *Boş. Bir harita ya da model yükleyin, sonra "Kitaplığa kaydet"e basın.* yazar.

## Neler saklanır {#what-is-stored}

| Tür | Saklanan | Saklanmayan |
|---|---|---|
| Harita görseli | Görsel (PNG), boyutu, çapaları | Yükseklik, ters çevirme, opaklık, parlaklık, renk giderme - varsayılanlara döner (yükseklik = geçerli veri kümesinin en düşük Y'si, ters çevirme açık) |
| 3B seviye | Köşeler, köşe renkleri, doku koordinatları, bunların karoları ve doku atlası, zemin / yapı / su üçgenleri, yapı kenarları, üçgen sayıları | Parça adları ve sınıflandırma nedenleri ile her görünüm ayarı - yeni bir içe aktarımın varsayılanlarına döner |

Kitaplıktan yüklenen bir modelin parça listesi yoktur; sınırları ve zemin yükseklik bandı köşelerinden yeniden hesaplanır.

## Nerede durur {#where-it-lives}

Tarayıcının IndexedDB'sinde: `3dheat` veritabanı, `levels` nesne deposu, sayfanın kaynağı için (tarayıcının adres çubuğundaki adres). Bu, o tarayıcı profiline yereldir; başka bir tarayıcı, başka bir profil ya da başka bir adres (örneğin `127.0.0.1` yerine `localhost`) farklı, boş bir kitaplık görür. Tarayıcıda sitenin verilerini silmek onu siler. Yapılar, renkler ya da su olmadan eski sürümlerce kaydedilmiş girdiler yine yüklenir.
