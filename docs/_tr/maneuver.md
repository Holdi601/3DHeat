---
title: "Manevralar"
parent: "İçgörüler"
nav_order: 4
lang: "tr"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manevralar: gruplar nasıl hareket eder

**İçgörüler → Manevralar** her tarafın birimlerinin *grup olarak* nasıl hareket ettiğini izler ve yaptıkları manevraları adlandırır: yan saldırı, kıskaç, yarma, pusu, geri çekilme, füze savunması, T'yi geçme. Her birinin yanında ne kadar emin olunduğu, arkasındaki sayılar, karşılığının verilip verilmediği ve doktrindeki ve tarihteki benzerleri yazılır. **Toplu analiz → Manevralar** bunları binlerce maçta sayar: her harita, mod ve taraf için her manevranın ne sıklıkla yapıldığını ve ne sıklıkla karşılığını verdiğini gösterir.

Her şey tarayıcınızda, kendi çalışanında (`src/insights/maneuver`) hesaplanır. Birkaç yüz birimlik bir maç 10-500 ms sürer; binlerce nesneli iki saatlik bir hava savaşı yaklaşık bir saniye sürer.

## Kullanımı {#using-it}

- **İçgörüler**'i açın, **Manevralar** sekmesine geçin. İlk açıldığında sayar. Filtreleri değiştirdikten sonra **Yeniden bul**'a basın.
- **Kesin / Olası / Mümkün** listelenen güveni belirler (varsayılan olarak Olası).
- **Zaman çizelgesi** her taraf için bir şerit, her manevra için bir çubuk gösterir. Altındaki **liste** aynısını zamana göre verir. Bir tıklama tekrarı manevranın başına geçirir, kamerayı oraya uçurur ve 3B çizer: her grubun izlediği yol bir ok olarak (kıskacın iki kolu iki yay olarak), kilit andaki grupların dış hatları (düşmanınki kendi tarafının renginde) ve düşmanın cephesi beyaz bir çizgi olarak. **Hepsini 3B çiz** maçın diğer manevralarını da soluk olarak ekler. Çizgiler seçim değiştiğinde bir kez ekran kartına gönderilir, her karede değil: oynatma sırasında 480 manevra çizilirken gerçek bir GPU'da (WebGL2 ve WebGPU, p99 18,0-18,5 ms, en uzun 19,5-20,8 ms) kare süreleri, bunlar çizilmeden olanlarla aynıdır.
- Açılan bir manevra sonucunu gösterir: manevrayı yapan birimlerin, manevra sürerken ve hemen sonrasında, tarafın maç genelindeki değişimine karşı imha ve kayıpları. Ayrıca kanıtlarını ve bilgi tabanındaki kayıtlarını: doktrini ve tarihsel benzerlerini (kıskaç için Cannae, yarma için Sedan 1940, T'yi geçme için Tsushima, aldatma için Operation Bolo...).
- Sonundaki küçük tablo, her tür ve taraf için yapılan ve karşılığını veren manevraları gösterir.

![Sentetik demo maçında bir kıskaç: iki kolun okları, düşman gövdesi ve cephesi](../assets/img/en/maneuvers.webp)

## Gruplar nasıl bulunur {#how-groups-are-found}

Her birim ortak bir zaman çizelgesine yerleştirilir: yaya ise 1 sn, değilse 2 sn adımla (çok büyük dosyalarda daha uzun). Bir birim öldüğünde yerinde tutulur ki yeniden doğması harita üzerinde bir çizgi çizmesin. Her adımda bir tarafın ve bir türün (uçak, araç, gemi, piyade) birimleri yakınsa bağlanır — yaya için 18 m, araçlar için 170 m, gemiler için 3 km, uçaklar için 5 km — ve benzer hızla hareket ediyorlarsa (hızları daha hızlı olanın yarısı içinde ya da ikisi de duruyorsa). Bir küme, üyelerinin çoğunun ait olduğu grubun kimliğini tutar. Sınıfı olmayan bir birim, hızına göre yaya, araçta ya da havada sayılır.

Bir grubun **şekli** yönüne göre okunur: boyuna ve enine yayılmasına göre kolon ya da hat; ortası öne çıkıyorsa kama; üyeler bir yana doğru geriye çekiliyorsa eşelon; köşeleri tutuyorlarsa kutu.

Her şey maçın kendi ölçeğinde ölçülür. **Çatışma menzili** `R`, bir katil ile kurbanı arasındaki mesafenin 75. yüzdeliğidir (alanın anlamına göre sınırlanmış). Bir manevranın süreleri birimin türüne göre ölçeklenir (piyade için süre, zemindekinin üçte biri kadardır).

## Neyi bulur {#what-it-finds}

| Manevra | Ne zaman bulunur |
|---|---|
| Düzen | bir grup, hareket ettiği adımların %60'ında 30 sn boyunca tek bir şekli korur |
| Cephe taarruzu | bir grup menzil dışından temasa gelir, ¾ R veya daha fazla mesafeden, düşmanın baktığı yönün 35° içinden |
| Kanat taarruzu | aynısı 50-130° açıdan (arkadan daha ötesi); yalnızca orada düşmanla çarpışan dost bir *sabitleyici kuvvet* varsa kesin (her iki yanda da imha sayılır) |
| Kıskaç | aynı tarafın aynı düşman gövdesine karşı zıt yönlerden (100° veya daha fazla ara ile), 90 sn içinde yaptığı iki kanat taarruzu; kollar çarpışıyorsa kesin |
| Çevirme | 1,5 R içinde, diğer taraftan en az o kadar birimin çevrelediği sıkı bir düşman grubu; iki veya daha fazla gruptan, aralarında 100°'den büyük boşluk olmadan, bir dakika boyunca, kendi tarafından kesilmiş. Çember ½ R'ye daraldıysa ve cebi çatışıyorsa kesin |
| Yarma | bir grup tutulan bir hattı geçer (solunda ve sağında 30 sn duran düşmanlar, kendi tarafının merkezi onların ötesinde); ½ R ötesine varır, 20 sn orada kalır ve çarpışırsa kesin; bir R daha ötedeyse bu bir yarılmadır |
| Örtü altında sıçramalarla ilerleme | küçük bir grupta bir kısım hareket ederken kalanı durur; roller dört veya daha fazla kez değişir ve duran kısım örtü ateşi açar |
| Kuvvet yığınağı / Dağılma | bir tarafın en yoğun noktasına yakın payı %35'ten %60'a çıkar (birimler 1,5 R veya daha fazla mesafeden gelir, sonra temas olur) — ya da taraf yayıldıkça düşer |
| Aldatma | temastaki küçük bir unsur, başka yerlerden iki veya daha fazla düşmanı çeker; sonra daha büyük bir grup, düşmanın daha az olduğu yerde dört menzil uzaktan vurur |
| Geri çekilme / takip | temastaki bir grup döner ve çatıştığı yerden R kadar uzaklaşır; oradaki bir düşman az önce grubun bir birimini öldürmüşse ve grup o katilden 2 R uzaklaşmışsa kesin (yayada asla: aşağıya bakın); aynı yöne giden ve yetişen düşmanlar takip eder |
| Derinlemesine savunma | düşmanın hattına çapraz iki veya daha fazla şeritte, R derinlikte duran birimler; düşman ilerlerken şeritlerden ateş |
| Ters yamaç | bir sırtı aşan kurbanların, duran birimleri tarafından kısa menzilden üç veya daha fazla imha |
| Pusu | hareket eden bir grup 45 sn durmuş düşmanlarla karşılaşır; onlar önce ateş eder ve hareket edenler iki birim ya da grubun yarısını kaybeder |
| Perde | üç veya daha fazla birimlik bir kuvvetin önünde ilerleyen bir veya iki birim; düşmanla ilk onlar karşılaşır |
| İç hatlar | bir tarafın grupları diğer tarafın arasında yakın durur, birimleri aralarında kayar |
| Tempo | bir taraf temasa (dönüş, hız değişimi, ilk atış) 1,5 kat hızlı karşılık verir; Mann-Whitney p değeri 0,05'in altında |
| Kıvrım (crank), çentik (notch), çekme (drag), pompa (pump) | füze atışının hedefi atıcıyı 35-70°, 75-105° ya da 140°'nin ötesine döndürür; ya da onu çeker ve geri döndürür |
| Hava kıskacı, duvar, öncü-izleyici, öğütücü | bir çift bir düşmana karşı ikiye ayrılır; üç uçak düşmana yan yana; bir unsur diğerinin 5-20 km arkasında; iki uçak bir noktanın etrafında, birbirinden uzakta döner |
| Muharebe hava devriyesi | bir istasyonun etrafında üç dakika döner |
| Enerji / açı dövüşü | yakın dövüşte — yönler 30° farklı, her biri sırayla diğerini burnunda tutar ya da aralarında bir imha olur — yükseklik kullanılır ve tırmanılır, ya da alçak uçulup yavaşlarken sert dönülür; biri diğerini öldürdüyse kesin |
| Vuruş paketi, SEAD | karışık görevli bir hava grubu, bir kısmı yere vurur; hava savunma imhaları, diğer yer imhalarının çoğundan önce gelir |
| Savaş hattı, T'yi geçme | kolon halinde üç gemi; bir kolon, düşman kolonunun başını dik kesen bir kolon |

Her manevra, bilgi tabanındaki hangi **kalıpları** gösterdiğini ve önce okunacak kayıtları söyler (`patterns-maneuver.ts`: düzen, cephe taarruzu, çift kuşatma, çevirme, yarma, ateş ve manevra, aldatma, geri çekilme, takip, derinlemesine savunma, perdeleme, dağılma, füze savunması, açı dövüşü, muharebe hava devriyesi, vuruş paketi, savaş hattı, T'yi geçme). Eski kayıtlar yeni kalıpları `knowledge/maneuver-tags.ts` üzerinden taşır. Bkz. [Bilgi merceği](knowledge.md).

**Karşılığını verdi**, birimlerin manevra sürerken (ve bir dakika sonra) yaptığı değişimi, tarafın maç genelindekiyle karşılaştırır. Geri çekilme, dönüşten sonra dönmeden öncekine göre daha az birim kaybederse karşılığını verir; füze savunması uçak bir dakika yaşarsa; çevirme, cep yarısını kaybederse.

## Birçok maçta {#over-many-matches}

Her maçın özeti (`src/mass/summarize.ts`, bkz. [Toplu analiz](mass-analysis.md)) küçük bir `maneuvers` bölümü taşır: her tür ve taraf için yapılan (Olası veya üstü), karşılığını veren, karşılığını vermeyen, imha ve kayıplar. **Toplu analiz → Manevralar** bunları filtrenin tuttuğu maçlar üzerinden toplar — harita ve moda göre ya da hepsi için — karşılığını verme oranını Wilson aralığıyla birlikte gösterir; bir satır, yapıldığı maçları yükler. Bu bölüm var olmadan yazılmış özetlerde hiç yoktur: eklemek için `node tools/3dheat-summarize.mjs <klasör> --force` çalıştırın.

## Ne kadar emin olduğu {#how-sure-it-is}

Planlanmış manevraları olan sentetik maçlar (`synth.ts`, `maneuver.test.ts` tarafından çalıştırılır): planlanan 28 türün hepsi Olası veya üstü bulunur. Bildirilen 50 manevradan 31'i planlanan türdür; diğer 19'u da gerçekten oradadır (hareket eden grubun düzeni, yarıcı kolonun cepheye yaklaşması). Hiçbiri yanlış değildir. Sahte 30 maçta — birbirinden ayrı ve karışık rastgele yürüyüşler, rastgele duran birimler, düz yollarda uçaklar, dolaşan bir kalabalık — Olası veya üstü hiçbir şey bildirilmez.

Gerçek veride (onlarca kara muharebesi, birkaç uzun hava savaşı görevi, bir düzine nişancı maçı): tank muharebelerinde cephe taarruzları, kanat taarruzları, yarmalar ve çevirmeler; havada düzenler ve yakın dövüşler; hava savaşı görevlerinde füze savunmaları, muharebe hava devriyesi yörüngeleri ve öncü-izleyici çiftleri; nişancı maçlarında cephe infazları, kolonlar ve birkaç pusu ve sıçramalı çift. Eşikler, oyun ölçeğindeki doktrin şekilleridir. Tek bir bulguyu kanıtıyla, toplu tablonun oranlarını da aralıklarıyla birlikte okuyun.

### Aynı maçların sahte modellerine karşı {#against-null-models-of-the-same-matches}

Bir dedektör zemin ve kalabalık tarafından kandırılabilir: bir kavgada her grubun her yanında düşmanı vardır. Bu yüzden her tür, aynı maçlardan kurulan **sahte modeller** (`nulls.ts`) üzerinde de çalıştırılır. Bu modellerde taraflar eskisi gibi karşılaşmaz: bir tarafın zaman çizelgesi üçte biri ile üçte ikisi arasında bir ölçüde çevrilir (*kaydırma*), ya da izleri haritanın merkezi etrafında döndürülür (*döndürme*). Takım etiketleri de karıştırılır (*takımlar*; bu, yapısı gereği gerçek çatışmaların yaklaşık yarısını korur). Çatışmalar yalnızca imhalar, ölümleriyle eşleştiğinde sayılır: katil 2 R içinde ve kurban yerinde olmalıdır. Sahte bir model bunu bozar. Gerçek ve sahte modellere karşı, aynı maçlarda Olası veya üstü bulunanlar (30 tank muharebesi; 12 nişancı maçı):

| Tür | Tank muharebeleri: gerçek / kaydırma / döndürme | Nişancı: gerçek / kaydırma / döndürme |
|---|---|---|
| Çevirme | 0 / 0 / 0 (önceden 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Yarma | 0,03 / 0,02 / 0,05 (önceden 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Kanat | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Cephe taarruzu | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Geri çekilme | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (yayada hiçbir zaman kesin değil) |
| Pusu | - | 0,17 / 0,04 / 0,04 |
| Enerji dövüşü | 1,2 / 0,1 / 0,85 | - |
| Açı dövüşü | 0,6 / 0,07 / 0,3 | - |

Bir savaş alanının merkezi üzerindeki yakın hava dövüşleri, o merkez etrafında dönüşe rağmen ayakta kalır. Bu yüzden döndürme sütunu onları yer türlerine kıyasla daha az olumlu gösterir. Aynı taraf içindeki türler — düzen, muharebe hava devriyesi, öğütücü, vuruş paketi, SEAD, sıçrama, perde — diğer tarafa bağlı değildir ve bu şekilde sınanmaz. `maneuver.test.ts`, sahte modellerin sentetik maçlardan planlanmış kanat, kıskaç, çevirme, yarma, pusu ve geri çekilmeyi kaldırdığını denetler.

## Sınırlar {#limits}

- Gruplar zamanla konum verisi gerektirir; yalnızca olaylardan oluşan bir dosyada konum yoktur.
- Yön veriden okunmaz: düşmanın cephesi, sabitleyici kuvvetin ona saldırdığı yerdir; yoksa hareket ettiği yer; yoksa saldırganın geldiği yer.
- Arazi, birimlerin kendi yüksekliklerinden okunur (ters yamaç); bir görüş hattı testi yoktur.
- Çok büyük dosyalar daha uzun adımlarla örneklenir; içlerindeki kısa hava manevraları yine de 2-4 sn adımlarla okunur.
