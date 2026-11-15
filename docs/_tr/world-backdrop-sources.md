---
title: "Dünya arka planı - kaynaklar ve terimler"
parent: "Dünya arka planı"
grand_parent: "Haritalar ve arka plan geometrisi"
nav_order: 1
lang: "tr"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Gerçek dünya arka planı: kaynaklar ve koşullar

Bir [gerçek dünya arka planının](world-backdrop.md) harita verisi açık hizmetlerden gelir. Bu sayfa her kaynağı, lisansını ve 3DHeat'in bu koşullar içinde nasıl kaldığını listeler.

| Kaynak | Koşullar (7 Kasım 2026 tarihinde okunduğu şekliyle) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - OpenStreetMap'ten OpenMapTiles şemalı vektör karoları, güncel derleme `https://tiles.openfreemap.org/planet` ile adlandırılmış | Ücretsiz, anahtar yok, ticari kullanım serbest. [Koşullar](https://openfreemap.org/tos/) "çevrimdışı indirmeler dışında otomatik yollarla" veri toplamayı yasaklar: bir uygulama, her indirme en fazla 3.000 karo ya da 50 MB ise, en fazla 4 paralel istekle ve uygulamayı tanıtan bir User-Agent ile yapılmışsa, kullanıcıların bir alanı çevrimdışı kullanım için indirmesine izin verebilir. Atıf zorunludur: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (OpenFreeMap kısmı isteğe bağlı). Hizmet haber verilmeden sona erebilir. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) verisi | ODbL 1.0. Çalışma zamanında çekip yerel olarak çizmek özel kullanımdır; çizilen görünüm, görünür bir atıf gerektiren bir Üretilmiş Eserdir; ondan yapılan ekran görüntüleri ve videolar da öyledir. |
| [OpenMapTiles](https://openmaptiles.org) şeması | Şema için CC BY 4.0; atıf "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Kamuya açık alana bırakılmıştır; anahtar yok. "Runways: OurAirports (public domain)" atfı nezaket olarak gösterilir. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | 2016 katmanı CC BY 4.0'dır (sonraki yıllar CC BY-NC-SA'dır, kullanılmaz). EOX'in hizmet sayfası, uç noktaların uygulamalarda kullanılmasını davet eder; garantisiz bir demo hizmeti olarak ve hız sınırlamasıyla; önbelleğe alma hakkında bir şey söylemez, CC BY ise buna izin verir. Tuvalde gösterilen atıf, bağlantılı olarak: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)". CORS: isteğin kökeni geri yansıtılır. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium kodlamalı 512 px kayıpsız WebP, anahtar yok, açık CORS. Kaynaklar CC BY, kamu malı ve benzeri açık lisanslar altındadır (ticari olmayan ya da paylaşım-benzeri olan yok); atıf "© Mapterhorn" ve küresel katman için "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Herkese açık uç nokta için yayımlanmış bir kullanım politikası yok. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortofoto, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Amerika Birleşik Devletleri Jeoloji Araştırmasının (USGS) bilgilerinin çoğu Kamu Malıdır ve kısıtlama olmadan kullanılabilir"; "(Ürün ya da veri adı) courtesy of the U.S. Geological Survey" gibi bir atıf ister. Hizmet kaynağını "USDA, USGS The National Map: Orthoimagery" olarak adlandırır (USDA NAIP, o da federal kamu malı bir eserdir); gösterilen atıf budur. Anahtar yok, açık CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Géoplateforme koşulları WMTS'yi "Non soumis à limite d'usage" (kullanım sınırı yok; WMS saniyede 40-50 istekle sınırlıdır) olarak listeler; veriler "soumises à la licence choisie et renseignée par le Fournisseur de données" (veri sağlayıcısının seçtiği ve belirttiği lisansa tabidir), varsayılan olarak Etalab Licence Ouverte; BD ORTHO 2021'den beri bu lisansla açıktır; kullanıcılar "ne pas nuire, entraver ou fausser le bon fonctionnement des API" (API'lerin doğru işleyişine zarar vermemeli, engellememeli ya da bozmamalıdır). Önbelleğe alma ele alınmaz; Licence Ouverte, kaynak belirtilerek yeniden kullanıma izin verir: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Anahtar yok, açık CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Her biri kendi atfıyla birçok kaynaktan açık veri ([liste](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); anahtar yok, hizmet garantisi yok, açık CORS ile sunulur. Yükseklikler `R × 256 + G + B / 256 − 32768` metre olarak çözülür. |

## Arka plan bu koşullar içinde nasıl kalır {#how-the-backdrop-stays-inside-those-terms}

- Bir kaydın altındaki bir arka plan en fazla 36 yükseklik karosu ve 300 vektör karosu indirir; bir kez kurulan bir sahne en fazla 64 + 100 yükseklik karosu ve 64 + 1.500 vektör karosu; akan bir sahne ise kamera hareket ettikçe, harita karosu başına kaynak başına bir karo. Kaynak başına aynı anda dört istek.
- **Bir kez kurulan bir sahne bir indirmedir**, ve indirmeler en fazla 1.000 vektör karosu ya da 40 MB'tır (OpenFreeMap'in koşulları 3.000 karo ya da 50 MB'a izin verir). Karolar önce merkezden istenir; ödenekten sonra kurulum yalnızca önbellekte zaten olan karoları alır ve hâlâ kaç tane kaldığını söyler. Yeniden kurmak bir sonraki parçayı çeker, ve böyle devam eder: büyük bir alan parçalar hâlinde gelir, her biri önbelleğe alınır.
- Sentetik uçuşlarda ölçüldü: 25 km'lik ayrıntılı bir alanı olan bir sahne, ilk seferinde yaklaşık 370 karo ve 20 MB alır. Yeniden kurulduğunda ya da üzerinden geri izlendiğinde hiçbir şey indirilmez.
- Karolar yalnızca **Gerçek dünya arka planı** düğmesine basıldığında indirilir, asla arka planda değil.
- Bir tarayıcı, bir sayfanın kendi User-Agent'ını ayarlamasına izin vermez; istekler tarayıcınkini ve sayfanın kökenini `Origin`/`Referer` olarak taşır. Görüntüleyicinin bir masaüstü sürümü kendisininkini göndermelidir.
- **OpenStreetMap'ten türetilmiş hiçbir şey** görüntüleyiciyle birlikte dağıtılmaz ya da onun deposuna işlenmez: ODbL'in paylaşım-benzeri koşulu, dağıtılan türetilmiş bir veritabanına uygulanır. Arka planlar kullanıcının makinesinde kurulur ve yalnızca o tarayıcıda tutulur (karo önbelleği ve, kaydedilirse, seviye kitaplığı).
