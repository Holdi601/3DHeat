---
title: "Haritalar ve arka plan geometrisi"
nav_order: 13
has_children: true
lang: "tr"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: true
---

# Haritalar ve arka plan geometrisi

Bir harita, oyunun oynandığı 3B yerdir - bir harita, bir kasaba, bir pist. Verinizin arkasına koyduğunuzda ısının *nerede* olduğunu görebilirsiniz. **Arka plan / bölüm** paneli (harita için bkz. [Terimler sözlüğü](glossary.md)) üç tür bağlam verir:

- **bir harita görüntüsü**, iki çapa ile coğrafi olarak konumlandırılmış - bkz. [Harita görselleri](map-images.md);
- **bir 3B harita** - `.glb`, `.gltf`, `.obj`, `.stl` ya da `.ply` - zemine, yapılara ve suya bölünmüş ve içe aktarılırken sadeleştirilmiş - bkz. [3B haritalar](model-levels.md) ve [Harita görünümü](level-appearance.md);
- bir **dünya arka planı** - dünyada nerede olduğunu söyleyen bir kayıt için (bir Tacview ACMI dosyası), açık verilerden indirilen gerçek arazi, yollar, su, hava alanları ve binalar - bkz. [Dünya arka planı](world-backdrop.md).

Hiçbir şey yüklü değilken sahne ızgara ve renkli eksenlerle karanlıktır ([Kamera ve sahne](camera.md) içindeki **Izgara** ve **Eksenler**), ve panel *Hiçbir şey yüklü değil - sahne bir ızgara ve eksenler gösteriyor. Isıya bağlam vermek için bir harita görüntüsü ya da bir seviye ağı ekleyin.* der.

Harita üç sekmenin hepsi tarafından paylaşılır: Yarış analizi sekmesinde yüklenen bir pist, ısı haritasının gösterdiği haritanın aynısıdır.

![Harita yüklüyken Arka plan / bölüm paneli: Harita görüntüsü ve 3B model düğmeleri, Harekât alanı, Opaklık, Parlaklık, Kitaplığa kaydet ve Kitaplık listesi](../assets/img/tr/level-panel.webp)

## Verinizin arkasına bir harita koyun {#put-a-level-behind-your-data}

1. Önce verinizi yükleyin ([Veri alma](getting-data-in.md)), böylece harita ona göre oturtulur.
2. Kenar çubuğunda **Arka plan / bölüm**'ü açın.
3. Bir resim için **Harita görüntüsü…**'ne, bir 3B harita için **3B model…**'e basın ve dosyayı seçin. Gerçek dünya kaydı için bunun yerine **Gerçek dünya arka planı** ya da **Harekât alanı** kullanın.
4. İlerleme satırının bitmesini bekleyin. Büyük bir model önce sadeleştirilir (aşağıdaki **Sadeleştirme hedefi**'ne bakın).
5. Her şeyi çerçevelemek için görünümde **F**'ye basın. Isı haritadan öne çıkana kadar **Opaklık** ve **Parlaklık**'ı kullanın.
6. Haritayı yeniden kullanacaksanız **Kitaplığa kaydet**'e basın ([Harita kitaplığı](level-library.md)).

## Bir harita ısı için ne yapar {#what-a-level-does-for-the-heat}

- **Örtme** yapar: arkasındaki veri noktaları yüzey başına soluklaşır ve arazinin arkasındaki veri noktaları gizlenir ([Derinlik ve eleme](depth-and-culling.md)). Harita yokken örtme yoktur.
- [Kesit](slice.md) tarafından ve *Bölümü de kes* ile [mesafe elemesi](depth-and-culling.md#distance-culling) tarafından, ısıyla birlikte **kesilir**.
- [Alan derinliği](camera.md#depth-of-field) tarafından bulanıklaştırılan tek şeydir; ızgara ve kutular hariç.
- Bir 3B harita, verilerden büyük olduğunda kameranın **uzak düzlemini genişletir**: yakın ve uzak düzlem veri kümesinden kalibre edilir ve birkaç kilometre genişliğindeki bir dışa aktarılmış harita, aksi halde tamamen uzak düzlemin arkasında kalıp boş bir görünüm bırakırdı. Yatay kapsam bundan büyükse uzak düzlem 3 × harita kapsamı olur, yakın düzlem onunla birlikte hareket eder (en az uzak / 100.000), örtmenin bağlı olduğu derinlik hassasiyetini korumak için ve uçuş hızı en az kapsam / 12'ye yükseltilir. Yalnızca genişletilir, asla daraltılmaz.

## Panel, yukarıdan aşağıya {#the-panel-top-to-bottom}

| Bölüm | Ayrıntılar |
|---|---|
| **Harita görüntüsü…**, **3B model…** | Birini yükleyin; geçerli haritanın yerini alır. |
| **Gerçek dünya arka planı**, **Harita karolarını unut** | Yalnızca coğrafi bir başvurusu olan bir veri kümesi için: altındaki gerçek yeri harita olarak oluşturur ya da indirilen karoları siler. [Dünya arka planı](world-backdrop.md) |
| **Sadeleştirme hedefi** | Bir sonraki model içe aktarması için üçgen bütçesi: *Tam - sadeleştirme yok* (varsayılan), *Yüksek - 8M*, *Orta - 3M*, *Düşük - 800k*, *Siluet - 100k*. [3B haritalar](model-levels.md#simplification) |
| İlerleme ve **İptal** | Çözülürken ya da içe aktarılırken. |
| İçe aktarma notu | Öncesi ve sonrası üçgenler, zemin / yapılar / su bölümü, kullanılan ayrıntı düzeyi. |
| Ad ve boyut | Bir görüntü için `genişlik×yükseklik px · x × z m/px`, bir model için `N üçgen (M'den)`. |
| **Opaklık**, **Parlaklık** | İki tür için de. |
| Görüntü denetimleri | **Doygunluğu azalt**, **Kuzey/güneyi çevir**, **Yerleşim** (iki çapa), **Veri sınırlarına sığdır**, **Yükseklik**. [Harita görselleri](map-images.md) |
| Model denetimleri | Zemin kabartısı, su, zemin üçgenleri, tel kafes, doku, yakalanan renk, yapılar, bölüm sınıflandırması. [Harita görünümü](level-appearance.md) |
| **Kitaplığa kaydet**, **Kaldır** | [Harita kitaplığı](level-library.md); Kaldır haritayı boşaltır. |
| **Kitaplık** | Bu tarayıcıda saklanan haritalar. [Harita kitaplığı](level-library.md) |

## Bu bölümdeki sayfalar {#pages-in-this-section}

- [Harita görselleri](map-images.md)
- [3B haritalar](model-levels.md) - biçimler, bölümler, sınıflandırma, sadeleştirme, dokular
- [Harita görünümü](level-appearance.md) - bir 3B harita için her denetim
- [Harita kitaplığı](level-library.md)
- [Dünya arka planı](world-backdrop.md) - açık verilerden, bir kaydın altındaki gerçek dünya

Haritaların oyunlardan ve motorlardan nasıl çıkarılacağı ayrı dışa aktarma araçlarının işidir (bkz. depo [README](https://github.com/Holdi601/3DHeat/blob/main/README.md)); onların yazdığı sözleşme [3B haritalar](model-levels.md#the-exporter-contract) sayfasında özetlenmiştir.
