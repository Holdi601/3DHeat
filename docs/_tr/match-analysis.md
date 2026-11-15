---
title: "Maç analizi (CS2)"
nav_order: 10
lang: "tr"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: true
---

# Maç analizi (Counter-Strike 2)

**Maç** sekmesi bir kaydı figürler olarak oynatır; bir Counter-Strike 2 maçı için ayrıca skor tablosunu da gösterir: her rauntu kimin kazandığını, nasıl kazandığını ve öldürmeleri kimin yaptığını. Bir maçı raunt raunt incelemek, sonra ısı haritasında aynı ana atlamak için kullanın.

Maç sekmesi, **Tekrardaki maçlar** altında listelenen herhangi bir kaydı figürler olarak oynatır: bir War Thunder ya da Tacview kaydı, ya da bir CS2 demosu ([Maç tekrarı](match-replay.md)). Bir CS2 `.match.json` dosyası, bu sayfada anlatılan skor tablosunu ekler.

## Bir CS2 maçını inceleyin {#review-a-cs2-match}

1. Demoyu ([aşağıda](#where-the-data-comes-from)) bir `.parquet` ve bir `.match.json` dosyasına dönüştürün.
2. **Isı haritası** sekmesinde, **Kaynak** altında `.parquet` dosyasını yükleyin.
3. **Maç** sekmesini açın ve **Maç dosyalarını yükle…** düğmesine basın ya da `.match.json` dosyasını görünüme bırakın.
4. **Maç özetleri** altında bir maça, sonra o rauntu açmak için raunt şeridinin bir hücresine tıklayın.
5. O rauntu ısı haritasında görmek için **Rauntu göster**e, ya da figürler olarak izlemek için **Rauntu tekrar oynat**a tıklayın.

![Maç sekmesi: açık bir rauntlu raunt şeridi, öldürme akışı ve Skor tablosu](../assets/img/en/match-analysis-round.webp)

KAST, ADR, eco, force buy ve trade gibi sözcükler [sözlüktedir](glossary.md#counter-strike-words).

## Veri nereden gelir {#where-the-data-comes-from}

[3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) demo dönüştürücüsü, demoları her harita için bir klasörde, maç başına iki dosyaya çevirir:

```bash
python -m heat3d_cs2 demos <demo dosyaları ya da klasörleri> -o out
```

| Dosya | Nerede yüklenir | Tuttuğu |
|---|---|---|
| `<match>.parquet` | **Isı haritası** sekmesi (Kaynak paneli, her Parquet gibi — bir dosya, birkaçı ya da bütün klasör) | her oyuncunun konumu saniyede sekiz kez ve her olayın olduğu yer: öldürme, ölüm, yaralanma, atış, fırlatma, smoke, flash, HE, molotov, decoy, körleme, kurulum, etkisizleştirme, patlama; `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, bakış yönü, `weapon`, `place`, `opening`, `traded` ... ile birlikte |
| `<match>.match.json` | **Maç** sekmesi | takımlar, skor, her raunt (kazanan, nasıl, ekonomi, kurulum, sırayla her öldürme, clutch'lar, sağ kalanlar), her oyuncunun skor tablosu satırı |

Parquet dosyasının alt bilgisi okuma talimatlarını taşır (`heat3d` anahtarı), bu yüzden hiçbir şey ayarlamadan açılır: oyuncu kişi olarak, taraf grup olarak, her raunt (`roundId`, "<match> #NN") bir oturum olarak, bakış yönü açık ve dünya doğru yönde (CS2'nin dünyası sağ elli ve Z yukarıdır; varsayılan Z-yukarı eşlemesi olarak okunsaydı aynalanmış çıkardı). Bkz. [Sütun eşlemesi](column-mapping.md) ve [Dosya yükleme](loading-files.md). `python -m heat3d_cs2 map <map>` harita geometrisini aynı çerçevede dışa aktarır ve **Seviye** sekmesinde yüklenir.

Sayıların arkasındaki kurallar dönüştürücüye aittir (README'sinde belirtilir ve her özetinde taşınır): bir ölüm, katili mağdurun takım arkadaşlarından biri **5 s** içinde öldürdüğünde **trade edilmiş** sayılır; **KAST**, bir öldürme, bir asist (flash asisti sayılır), hayatta kalma ya da trade edilmiş bir ölüm olan rauntların payıdır; **hasar** gerçekten kaybedilen can, yalnızca düşmanlara; bir **clutch**, düşmanlar ayaktayken bir tarafın son sağ kalanı olmaktır, taraf kazanırsa kazanılmış sayılır; taraf başına **satın alma**, dondurma süresinin sonundaki ortalama ekipman değerinden: her yarı-maçın ilk raundu bir tabanca raundudur (uzatmada yoktur), sonra 1.500 $'ın altı bir eco, 4.000 $'ın altı bir force buy, daha fazlası tam satın alma.

## Sekme {#the-tab}

Maç sekmesinin kenar çubuğunda, en üstte ısı haritasının mod anahtarı ve oturum seçici, altta maç bölümleri, sonra ısı haritasının **Filtreler**, **Seviye** ve **Kamera** panelleri bulunur — görünüm, Isı haritası sekmesinde yüklenmiş olan Parquet'in ısı haritasıdır.

### Maç özetleri {#match-summaries}

| Denetim | Ne yapar |
|---|---|
| **Maç dosyalarını yükle…** | `.json` dosyalarını seçer (aynı anda birkaç): `.match.json` özetleri |
| görünüme bırakma | Maç sekmesi açıkken görünüme bırakılan JSON dosyaları aynı şekilde yüklenir (diğer dosyalar yok sayılır) |
| **Temizle** | her maçı kaldırır |
| **Tüm maçlar** (iki ya da daha fazlasıyla) | "N maç, M raunt": hepsi üzerinden istatistikler |
| bir maç satırı | "TeamA 13 - TeamB 9", harita · N raunt: o maçı açar |

Bir dosya, `"format": "heat3d-cs2-match"` ve `rounds`, `players` ve `teams` dizileri olan bir JSON ise kabul edilir. Hatalar düğmelerin altında listelenir: "<dosya>: JSON değil", "<dosya>: bir CS2 maç özeti değil (heat3d-cs2-match)", "<dosya>: rounds, players ya da teams eksik". Yeniden yüklenen bir maç (aynı `match` adıyla) öncekinin yerini alır. Maçlar önce haritaya, sonra ada göre sıralanır. Tam olarak bir maç yüklüyse o açılır; değilse seçim kalır (varsayılan olarak tüm maçlar).

Hiçbir şey yüklü değilken bölüm açıklar: `python -m heat3d_cs2 demos` ile dönüştürün, `.match.json` dosyalarını burada, `.parquet` dosyalarını Isı haritası sekmesinde yükleyin.

### Maç (bir maç açıkken) {#match-one-match-open}

**Başlık:** her iki takım skorlarıyla, harita, yarılar — "yarılar 7-5, 6-6": raunt 1-12 ve 13-24 (premier ve rekabetçi oyunda MR12; bir özet kendi yarı uzunluğunu belirttiğinde onu kullanır, yani MR15 için 1-15 ve 16-30) — sonra maç uzatmaya gittiyse, kendi başına skoru: "uzatma 4-2", iki yarıdan sonraki raundlar. Berabere biten bir raund hiçbir takıma sayılmaz. Özet eksik raundlar listelediğinde "demoda kesilen N raunt" de yazar.

**Raunt şeridi:** her raunt için bir hücre, kazanan tarafın rengiyle, numarası ve nasıl bittiğine dair bir işaretle. Berabere biten bir raunt (kazanan yok) nötr gri bir hücredir, `=` işaretli, asla bir tarafın rengi değildir; ipucu "Raunt 30: berabere - hiçbir taraf kazanmadı" der.

| İşaret | Nasıl bitti |
|---|---|
| B | bomba patladı |
| D | bomba etkisizleştirildi |
| K | elendi |
| T | süre doldu |
| S | teslim |
| = | berabere |
| ? | diğer |

Bir ayırıcı, ikinci yarının başlangıcını (raunt 13, ya da özetin yarı uzunluğundan sonraki raunt) ve her üç rauntluk uzatma yarısını (raunt 25, 28, 31, ...) işaretler. Bir hücrenin üzerine gelin: "Raunt 7: TeamA (T) - bomba patladı, A'ya kuruldu" ("…, kuruldu, bölge bilinmiyor" özet bölge içermediğinde) ve her iki tarafın satın alımı ve ekipman değeri. Rauntu açmak için tıklayın; kapatmak için yeniden tıklayın ("Öldürmeleri, ekonomisi ve tekrarı için bir rauntu tıklayın.").

**Raunt:**

- "Raunt 7: <takım> kazandı - <nasıl>" ("Raunt 30: berabere - hiçbir taraf kazanmadı" berabere için) ve raundun ne kadar sürdüğü (dondurma bitişinden karara kadar, d:ss);
- ekonomi: her tarafın takımı, satın alması (tabanca, eco, force buy, tam satın alma) ve ekipman değeri ("$4,350");
- kurulum: bölge, oyuncu ve raunda girdikten sonraki zaman (her iki özet sürümünden); bölge bilinmediğinde "<oyuncu> tarafından 1:05'te kuruldu, bölge bilinmiyor";
- **öldürme akışı**, sırayla: raunda girdikten sonraki zaman, saldıran (tarafın renginde; saldıran yoksa "world"), silah ve bayraklar — **HS** kafadan atış, **WB** duvardan, **SM** smoke'tan geçerek; raundun ilk öldürmesi **açılış**, **trade** (5 s içinde bir takım arkadaşının intikamı), **trade edildi** (katil 5 s içinde öldürüldü), **takım** bir takım arkadaşını öldürme (intihar yoktur). Raunt karara bağlandıktan sonraki öldürmeler soluklaştırılır;
- clutch'lar: "<oyuncu> (T) tek başına 3'e karşı: clutch'ı kazandı" / "kaybetti";
- sonda her tarafta kimin hayatta olduğu ("kimse yok");
- **Rauntu göster**: bu raunttaki her şey, ısı haritasında;
- **Rauntu tekrar oynat**: rauntu başından itibaren kutular olarak oynatır (aşağıda).

Bu maç ya da açık raunt için **Isı haritasında göster** düğmeleri (bkz. [aşağıda](#show-in-the-heatmap)).

### Skor tablosu {#scoreboard}

Her takım için bir tablo, her oyuncu için bir satır:

| Sütun | Nedir |
|---|---|
| K, D | öldürmeler, ölümler |
| A | asistler, flash asistleri dahil |
| ± | öldürme eksi ölüm (0'ın üzerinde yeşil, altında kırmızı) |
| ADR | raunt başına hasar, gerçekten kaybedilen can |
| KAST | öldürme, asist, hayatta kalma ya da trade edilmiş bir ölüm olan rauntların % oranı |
| HS | % kafadan atış öldürmesi |
| Open | kazanılan-kaybedilen açılış düelloları |
| Cl | kazanılan/oynanan clutch'lar |

Bir oyuncunun üzerine gelin: trade öldürmeleri, trade edilme sayısı, flash asistleri, flash'lenen düşmanlar, yardımcı hasarı ve çoklu öldürme rauntları ("2×3k") görünür. Bir **oyuncuya tıklayın**: ısı haritasında (bu maç için) öldürmeleri ve ölümleri.

### Maçlar arası (Tüm maçlar) {#across-matches-all-matches}

Yüklü her maç üzerinden:

- "N maç · M raunt · <haritalar>" ve beraberlik varsa "N raunt berabere, hiçbir taraf kazanmadı";
- taraf başına **Kazanılan raund**: genel olarak, **tabanca** raundlarında (özetin tabanca raundları) ve **eco**, **force** ve **tam** satın almalarda (her biri oynanan raundlarla bir yüzde olarak; "oynanandan kazanılan" için üzerine gelin). Berabere biten bir raund her iki tarafça oynanır ve hiçbiri tarafından kazanılmaz;
- **Bomba**: bölge başına kurulumlar ve T tarafının o raundları kazanmaya devam etme sıklığı ("A'da 12 kurulum (T %67 kazandı)"), özetin kendi başına bilmediği bölgeye kurulumlar ("bilinmeyen bölgede 2 kurulum (T %50 kazandı)") ya da "hiç kurulmadı"; raundların nasıl bittiği, en yaygını önce;
- "Açılış öldürmesini alan taraf bu raundların %N'ini kazandı." (intihar bir açılış öldürmesi değildir; berabere biten bir raund açılışı dönüştürmez);
- **Açılış düelloları, nerede**: en çok açılış öldürmesi olan on yer (mağdurun nerede olduğuna göre; oyunun yer adları okunur hâle getirilmiş, "TopofMid" → "Top of Mid"), düellolar ve T tarafının kazandığı pay;
- **Oyuncular**: öldürme eksi ölüm ile en iyi on beş, tüm maçlarında birleştirilmiş (Steam ID ile eşleştirilmiş): maçlar, K-D, oynanan raundlara göre ağırlıklı ADR ve KAST, öldürmelere göre ağırlıklı HS%, açılış düelloları. Bir **oyuncuya tıklayın**: tüm maçlar üzerinden ısı haritasında öldürmeleri ve ölümleri.

Yüklü tüm maçlar için Isı haritasında göster düğmeleri bunun altında durur.

## Isı haritasında göster {#show-in-the-heatmap}

Her bağlantı ısı haritasının kendi **filtrelerini** ayarlar; böylece gösterilen şey Filtreler panelinde görünür ve düzenlenebilir kalır, **Tümünü göster** onları temizler. Isı haritası sekmesinde yüklenen ısı haritası tablosu üzerinde çalışırlar; maç sekmesi onu asla kendisi yüklemez.

| Düğme | Gösterilen olaylar |
|---|---|
| **Konumlar** | `position` — oyuncuların saniyede sekiz kez nerede olduğu |
| **Öldürmeler** | `kill` — katilin nerede durduğu |
| **Ölümler** | `death` — mağdurun nerede düştüğü |
| **Açılışlar** | `opening` = 1 olan `kill` ve `death` — her raundun ilk öldürmesi, ikisinin de durduğu yer (yalnızca tabloda bir `opening` sütunu varsa sunulur) |
| **Smoke'lar** | `smoke` — smoke'ların indiği yer |
| **Flash'lar** | `flash` — flash'ların patladığı yer |
| **Molotoflar** | `molotov` — molotov ve yakıcı bombaların yandığı yer |
| **HE** | `he` — HE bombalarının patladığı yer |
| **Bomba kurulumları** | `plant` — bombanın kurulduğu yer |
| **Atışlar** | `shot` — atışların yapıldığı yer |

Düğmelerin bulunduğu yere göre kapsamlıdır: yüklü tüm maçlar, bu maç ya da bu raunt ("Isı haritasında göster - raunt 7").

Uygulanamayan şey, sessizce hiçbir şeye süzülmek yerine düğmelerin altında söylenir: "maç sütunu saklanmadı - maç uygulanmadı", "maç: X yüklü veride yok", raunt ve olaylar için aynısı, "oyuncu X yüklü veride yok", "taraf X yüklü veride yok", "yüklü ısı haritası verisi yok: maçların .parquet dosyalarını Isı haritası sekmesinde yükleyin". Veri yüklü değilken bağlantılar da "Haritada görmek için maçların .parquet dosyalarını Isı haritası sekmesinde yükleyin." der.

**Rauntu tekrar oynat** ayrıca ısı haritasını **Kutu tekrarı**na, zaman çizelgesini kayıt penceresi *ömür* olarak ayarlanmış *oynat* moduna geçirir, rauntun oturumunun başına gider ve oynatır. Raunt, yüklü verinin bir oturumu değilse: "bu raunt yüklü verinin bir oturumu değil: tekrar oynatılacak bir şey yok".

## Geliştiriciler için {#for-developers}

Kod: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Özet sürümleri {#summary-versions}

Sekme, sürüm 1 ve sürüm 2 özetlerini (dosyadaki `"version"`) yan yana okur ve aynı şekilde işler:

| | Sürüm 2 | Sürüm 1 |
|---|---|---|
| kurulum zamanı | öldürmeler gibi, raunda girdikten sonraki saniyeler | maç saniyeleri; sekme rauntun başlangıcını çıkarır |
| kurulum bölgesi | `A` ya da `B`; demo söylemediğinde boş | `A`, `B` ya da bir varlık numarası — bilinmeyen bölge olarak okunur |
| yarı uzunluğu | `halfLength`, tarafların ilk kez yer değiştirdiği yerden; boşsa 12 | 12 (MR12) |
| tabanca raundları | `pistolRounds` (raund 1 ve yarıdan sonraki ilk raund) | satın alması `pistol` olan raundlar |
| berabere raund | `winner` ve `winnerTeam` boş | - |
| intihar | öldürmede `suicide`, asla takım öldürmesi değil | saldıran ve mağdurun aynı oyuncu olmasıyla anlaşılır |

Bir öldürmenin `noscope` ve `attackerBlind` alanları (sürüm 2) Maç sekmesinde gösterilmez; sekme ısı haritası tablosundan bir yer de göstermez, bu yüzden oradaki bir bomba satırının boş `place`'i burada hiçbir şeyi değiştirmez.

Bir odağın nasıl filtrelere dönüştüğü (`focusFilters`):

- **maç** → `match` sütunu üzerinde bir kategori filtresi;
- **raunt** → sayısal bir `round` sütunu üzerinde `round` = N aralık filtresi (kategorik olan üzerinde bir kategori filtresi) ve rauntun oturumu (`<match> #NN`) oturum seçicisinde seçilir;
- **olaylar** → `event` sütunu üzerinde bir kategori filtresi;
- **oyuncu** → o oyuncu üzerinde bir kişi filtresi;
- **taraf** → bir grup filtresi.
