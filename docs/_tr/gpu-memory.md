---
title: "GPU bellek yerleşimi"
parent: "Çizim iç yapısı"
nav_order: 5
lang: "tr"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# GPU bellek yerleşimi

Grafik kartının belleği sınırlıdır. Verileriniz sığmazsa görüntüleyici neyin sığdığını gösterir ve bunu söyler: istatistik katmanına, dışarıda bırakılan satır sayısıyla birlikte kehribar renkli bir **Bellekte değil** satırı eklenir. Eksik görünen kısaltılmış bir veri kümesi, bir analiz aracının yapabileceği en kötü hata olurdu; bu yüzden bu satır asla gizlenmez.

![Kehribar renkli Bellekte değil satırı olan istatistik katmanı](../assets/img/en/gpu-memory-not-resident.webp)

Daha fazlasını sığdırmak için **Kaynak bütçeleri** altındaki GPU bütçesini yükseltip yeniden yükleyin ([Bellek ve bütçeler](memory-and-budgets.md#raising-the-gpu-budget)), önce veriyi daraltın ya da daha fazla belleği olan bir kart kullanın.

## Geliştiriciler için {#for-developers}

### Satırlar GPU'da nasıl saklanır {#how-rows-are-stored-on-the-gpu}

Satırlar, bir veri kümesi geldiğinde bir kez, 8.388.608 satırlık (2²³) **parçalar** hâlinde yüklenir ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Her parça kendi sınır kutusuna ve zaman aralığına göre kuantalanır:

| Veri | Biçim | Satır başına bayt |
|---|---|---|
| Konum X, Y, Z ve grup kimliği | dört 16 bit işaretsiz tam sayı (WebGL2'de RGBA16UI); X, Y, Z parçanın sınır kutusu içinde | 8 |
| Zaman ve ömür (veri kümesinde hem zaman hem kişi varsa) | iki 16 bit işaretsiz tam sayı (RG16UI): parçanın zaman aralığı içinde zaman; 65.535 "sonraki örnek yok" anlamına gelen ömür | 4 |

16 bitin yetmesini sağlayan parça başına sınır kutularıdır: bir parça genellikle haritanın bir kısmını kapsar, bu yüzden kuantalama adımı kilometrelerce genişlikteki bir haritada bir santimetrenin çok altında kalır; gerçek telemetrideki gürültünün çok altında. Dördüncü kanalda taşınan grup kimliği bedavadır; en fazla 4.096 grup olabilmesinin nedeni de budur ([Gruplar](sessions-persons-groups.md#limits)).

WebGL2'de her parça 8.192 texel genişliğinde bir dokudur ve tam doku satırlarına tamamlanır; satırlara kare başına bir blok indeksi dokusu üzerinden `gl_VertexID` ile ulaşılır. WebGPU'da ise depolama tamponlarıdır.

Kullanıldıkça ayrılan, satır başına ek GPU belleği:

- her etkin sütun [filtresi](filters.md): satır başına 4 bayt (32 bit kayan nokta değerleri ya da kategori kimlikleri), filtre ilk kez kullanıldığında parça parça yüklenir;
- [çizgi ısısı](line-heat.md): Çizgiler kipi açıkken satır başına 8 bayt (her parçanın başlangıcı, verinin sınır kutusu içinde kuantalanmış, ve bayrakları).

Buna ek olarak çizim hedefleri: sahne rengi ve derinliği, ısı hedefi ve onun geçici ikizi ([Takım ısısı](team-heat.md) içinde dört kanal), ve [örtme](depth-and-culling.md) için derinlik soyma katmanları; ve seviyenin geometrisi.

### Bütçe yükleme sırasında zorlanır {#the-budget-is-enforced-at-upload}

WebGL, karşılayamayacağı ayırmaları kabul eder ve sonra ya bağlamı kaybeder ya da sistem belleğine çok pahalı bir şekilde düşer. Bu yüzden GPU bütçesi veri kümesi yüklenirken zorlanır ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- parçalar sırayla (yani zaman sırasıyla) sığdıkları sürece yüklenir;
- sığmayan ilk parça hiç yüklenmemesi yerine **kısmen** yüklenir: kalan bütçenin tutabildiği kadar tam doku satırı. Böylece tam bir parçayı tutamayan bütçe, gösterebildiği kadarını gösterir; satırlar zaman sıralı olduğu için gösterilen kısım tutarlı bir zaman parçasıdır;
- sonrası her şey **bellekte değil**dir.

Eksiklik gizlenmez: sıfırdan büyük olduğunda istatistik katmanı, sığmayan satır sayısıyla birlikte kehribar renkli bir **Bellekte değil** satırı gösterir. Tam görünen kısaltılmış bir veri kümesi, bir analiz aracının sahip olabileceği en kötü hatadır. Yüklemeden önceki [sığma denetimi](memory-and-budgets.md#the-fit-check) bu durumu önlemek içindir.

Oluşturucunun kullandığı bütçe, **Kaynak bütçeleri** içindeki GPU bütçesidir; sığma denetiminin kullandığı aynı rakam. Algılanan rakamın da üstündedir; kaydırıcının tavanına kadar (bkz. [GPU bütçesini yükseltme](memory-and-budgets.md#raising-the-gpu-budget)). Bir veri kümesi yüklenirken uygulanır; sonradan değiştirmek bir sonraki yüklemede etkili olur.
