---
title: "Parkur istatistikleri"
parent: "Yarış analizi"
nav_order: 57
lang: "tr"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Parkur istatistikleri

Bir parkurun birçok turunu yükleyin, görüntüleyici hataları sayar: hangi viraj en çok zamana mal oluyor, o virajda turların kaçı ters gitti ve neden. Çalışmaya değer virajı bulmak için kullanın.

Deneyin: **Demo turlar** üç tur verir; bu bölümün görünmesi için yeterlidir.

![Hata haritalı parkur istatistikleri: her virajda kaç turun zaman kaybettiğine göre boyanmış pist ve viraj listesi](../assets/img/en/race-course-mistake-map.webp)

Bir parkurun tüm klasörünü (düzinelerce tur, birkaç araç, birkaç performans sınıfı) yükleyin; her tur değerlendirilir, sonra sayılır. Bu sayfa sınıfa göre karşılaştırmayı, neyin hata sayıldığını, **Parkur istatistikleri** bölümünü, hata haritasını, ısı haritası dışa aktarımını, birkaç pistten parkurları ve çok turda performans sınırlarını anlatır.

## Kendi sınıfının en iyisine karşı {#against-the-best-of-its-own-class}

Bir tur, viraj viraj, **kendi performans sınıfının en hızlı tamamlanmış turuyla** karşılaştırılır (referans, referansın sınıfında). Kendisi de, kendi sınıfında her virajdan en hızlı geçenle karşılaştırılır; sınıfında yalnızsa her turla. Araçlar oyunun performans sınıfına göre gruplanır (Forza'da D'den X'e; C ve S2 bunlardan ikisidir). Bir C sınıfı aracın fren noktası, bir S2 aracının fren noktasıyla karşılaştırılırsa sürüş hakkında bir şey söylemez. Zaman haritası, tur listesindeki farklar ve *Viraj viraj* tablosu aynı karşılaştırmayı izler (bkz. [her turun kiminle karşılaştırıldığı](race-corner-analysis.md#who-each-lap-is-compared-with)).

İstatistikler, her turun analizi üzerine kuruludur; onun yanında değil.

## Hata neyi sayılır {#what-counts-as-a-mistake}

Bir **olay**, bir turun bir viraj (segment) içindeki tek bir hatasıdır. Bir turun bir virajdaki hataları şunlardır:

1. **Analizin orada kaybın nedeni olarak bulduğu sürüş nedeni**: sürücüye bağlanan (arabaya ya da duruma değil), kayıp olan bir bulgu; karşılaştırma turuna göre **0,05 sn** veya daha fazla maliyetli. Maliyeti virajın kaybıdır.
2. Diğer turun yapmadığı (paylaşılmayan) her **araç kontrol hatası**, **0,03 sn** veya daha fazla maliyetle: kilitlenme, patinaj, arkanın kayması, önden kayma, spin. Maliyeti olayın kendisininkidir.
3. Her **çarpma ve kaza**, paylaşılmış ya da paylaşılmamış, maliyeti ne olursa olsun.

Bir virajda birkaçı olabilir; her tür **tur ve viraj başına bir kez** sayılır. Kazançlar, aracın payı ve önceki virajda belirlenen daha yavaş varış hata sayılmaz.

### Bulgulardan hatalara {#from-findings-to-mistakes}

| Bulgu | Hata |
|---|---|
| girişte çok hızlı, çıkışta yavaş; diğerinden birkaç metre daha geç frenlemeden | Çok geç frenledi |
| erken frenledi | Çok erken frenledi |
| yumuşak frenledi | Çok yumuşak frenledi |
| neden olarak bir kilitlenme | Tekerlek kilitledi |
| süzüldü | Süzüldü |
| kullanılmayan tutuş, apekse daha yavaş, diğerinin yalnızca gazı kestiği yerde frenledi | Ortada çok yavaş |
| çok dar bir çizgi | Çok dar çizgi |
| dışa itildi | Önden kaydı |
| aracı daha az / çok fazla döndürdü | Aracı yanlış döndürdü |
| gaza daha geç bastı, tam gaza daha geç, tereddüt etti | Gaza geç bastı |
| virajdan daha yavaş çıktı | Daha yavaş çıktı |
| patinaj | Patinaj |
| arka kaydı, orta boyunca yana | Arka kaçtı |
| dışa açıldı | Dışa açıldı |
| hız sürttü | Hız kaybetti |
| gaz kesti (girişte ya da düzlükte) | Gaz kesti |
| neden olarak neredeyse durma, spin, çarpma ya da kaza | O turun orada olayları hangisini gösteriyorsa Spin attı, Temas etti ya da Kaza yaptı (önce kaza, sonra spin, sonra temas); aksi halde Neredeyse durdu |
| daha uzun bir uçuş | Çok uzun uçtu |

İki kalıp, içlerindeki neden olarak, aynı tabloyla sayılır. *Girişte, çıkışın geri kazandığından fazlasını verdi* kalıbının hatası, girişteki nedenin hatasıdır: erken frenleme *Çok erken frenledi*, kilitlenme *Tekerlek kilitledi*, süzülme *Süzüldü*, kullanılmayan tutuş *Ortada çok yavaş*. *Çok hızlı girdi, yavaş çıktı* kalıbı, tur diğerinden geç frenlediyse *Çok geç frenledi*'dir; aksi halde çıkışının nedeninin hatasıdır: *Gaza geç bastı*, *Patinaj*, *Arka kaçtı*, *Dışa açıldı*, *Daha yavaş çıktı*. Nedeni aracın ya da daha yavaş bir varışın olduğu bir kalıp sayılmaz.

Sayılmaz: daha yavaş varış, kalkış, her *araç* bulgusu (çekiş, tutuş, frenler, sürüş) ve her kazanç ya da dengeli viraj.

### Türler, sıralarıyla {#the-kinds-in-their-order}

Frenleme: *Çok geç frenledi*, *Çok erken frenledi*, *Çok yumuşak frenledi*, *Tekerlek kilitledi*. Giriş: *Süzüldü*, *Ortada çok yavaş*, *Çok dar çizgi*, *Önden kaydı*, *Aracı yanlış döndürdü*. Çıkış: *Gaza geç bastı*, *Daha yavaş çıktı*, *Patinaj*, *Arka kaçtı*, *Dışa açıldı*, *Hız kaybetti*. Düzlük: *Gaz kesti*. Olaylar: *Spin attı*, *Temas etti*, *Kaza yaptı*, *Neredeyse durdu*, *Çok uzun uçtu*.

## Parkur istatistikleri bölümü {#the-course-statistics-section}

**3** turdan itibaren gösterilir; **Turlar** ile **Nerede gelişmeli** arasında.

- **Özet**: "9 araçla 40 tur, 3 sınıf: her tur, viraj viraj, kendi sınıfının en hızlı turuna karşı değerlendirildi." (araçlar araç numarasıyla ya da adıyla sayılır).
- **Sınıf etiketleri** (birden fazla sınıf varsa): **Tümü** ve her sınıf için bir etiket; her biri tur sayısıyla, oyunun sırasıyla (D, C, B, A, S1, S2, R, X, sonra diğerleri). Bir sınıfa tıklayın, yalnız onun turlarını görün; **Shift+tıklama** birini ekler ya da çıkarır. Aşağıdaki her şey (listeler, harita, ısı haritası dışa aktarımı) seçilen sınıfları izler.
- **En sık ne ters gidiyor**: her hata türü, en çok turu olan önce (sonra en çok kez, sonra en çok maliyet), en fazla 8 tane (**Tümü N tür** kalanları gösterir, **Daha az** onları yeniden gizler). Her satır: adı, "N / M turda", o oranın bir çubuğu ve "K kez · yaklaşık X sn · en çok T3 (5), T7 (4), T1 (2)": kaç kez yapıldığı (tur tur viraj), toplam maliyeti ve en çok turun yaptığı üç viraj. **Bir satıra tıklayın**: hata haritasında gösterilir (ve harita açılır); tekrar tıklayın, her hatayı görün.
- **Viraj viraj** (ya da bir hata seçiliyken *Viraj viraj - <hata>*): segment segment, "N / M zaman kaybetti · X sn": virajı tamamen süren turlar, orada sınıflarının en iyisine karşı **0,05 sn** veya daha fazla kaybedenler ve kaybettikleri bütün zaman. Katlandığında en sık üç hatasını tur sayılarıyla listeler. Bir viraja tıklayın: açılır, kamerayla çerçevelenir ve hata haritasına geçilir. Her hata için (ya da yalnızca seçilen için) "Burada 40 turun 12'si erken frenledi. 9 farklı arabada, her biri yaklaşık 0,21 sn." gibi bir satır ve bu hatayı yapan turlar, **en kötüsü önce**, her biri maliyetiyle. En fazla 8 tane gösterilir, kalanlar için "+N daha". Bir tura tıklayın: ona odaklanır ve o hatayı tekrar oynatır (hata anından 40 m önce hizalı).
- **Isı haritasında göster**: aşağıya bakın. Çalışırken "Isı haritası oluşturuluyor…" yazar; hata yoksa devre dışıdır.

## Hata haritası {#the-mistake-map}

**Görünüm → Hata haritası**, referans yolu boyunca, her metrede (seçilen sınıfların) kaç turun hata yaptığını boyar: her türden ya da istatistiklerde seçilen tek bir türden. Her tur metre başına bir kez sayılır. Her olayın aralığı (nedeninin ya da olayının olduğu yer) iki yandan 6 m genişletilir, böylece kısa olanlar da görünür. Daha çok turun yaptığı yer daha geniş ve parlak olur: genişlik `3 + 10 · (buradaki tur sayısı / her yerdeki en çok tur sayısı)` metre, renk soluk kahverengiden parlak turuncuya; hiç hata olmayan yerlerde gri 2 m şerit. Açıklama: *az tur ↔ en çok tur*.

**Etiketler** açıkken her viraj apeksinde en sık hatası yazılır: "T3 · 12/40 erken frenleme" (hatayı yapan turlar / virajı süren turlar); tek bir tür seçiliyken "T3 · 12/40"; hiçbiri seçili değilse "T3 · temiz". Bir etiketin üzerine gelince virajın kayıpları ve en sık beş hatası listelenir; tıklayınca o viraj istatistiklerde açılır ya da kapanır.

## Isı haritasında göster {#show-in-the-heatmap}

**Isı haritasında göster**, aynısını ısı haritası sekmesine "<pist> üzerindeki hatalar" (ya da "Parkurdaki hatalar") adlı bir veri kümesi olarak verir. Böylece ısı haritasının bütün araçları (ısı modları, filtreler, zaman çizelgesi, dilimleme) turların nerede ters gittiği üzerinde çalışır.

Bu, bellekte oluşturulan bir CSV'dir (`mistakeTable`). Her olayın her ızgara noktası (her 2 m) için bir satır vardır ve o noktada **turun kendi konumu** kullanılır:

| Sütun | İçerik |
|---|---|
| `x`, `y`, `z` | turun o metredeki konumu (oyunun koordinatları) |
| `elapsed` | turun orada zamanı, sn |
| `lap` | turun etiketi |
| `car` | aracın adı (ya da "car 1234") |
| `mistake` | hatanın adı, geçerli dilde |
| `car_class` | sınıf; yoksa `-` |
| `corner` | virajın etiketi, `T3` |
| `cost` | olayın maliyeti, sn |

Isı haritasının kendi yükleyicisiyle, eşleme ipuçlarıyla yüklenir: Y yukarı, eksen çevirmesi yok, ölçek 1; zaman `elapsed` sn olarak; **kişi** = `car`, **grup** = `mistake`, **oturum** = `lap`; bakış yönü yok; `car_class`, `corner` ve `cost` filtre sütunu olarak tutulur. Sekme daha sonra **Isı haritası**'na geçer ve veriyi çerçeveler. Yalnızca istatistiklerde seçilen sınıflar dışa aktarılır.

## Birkaç pistten parkurlar {#courses-from-several-tracks}

Turlar **bir seferde bir parkur** olarak analiz edilir. Birden fazla parkurun turlarını tutan bir klasör (tüm tur kitaplığı), her parkuru ayrı ayrı yüklemeyi sunar (tur sayısıyla, en çoğu önce). Hiç bitmemiş koşuların turları (FH Companion'ın `unfinished/` klasörü) kendi parkuruyla gider ve *kısmi* olarak işaretlenir. Dosya olarak seçilen, birkaç adlandırılmış pistin turları da aynı şekilde sunulur; hiçbir piste adı olmayan turlar seçilen her neyse onunla gider. Yüklenmiş olanlardan başka adlandırılmış bir pistin turlarını yüklemek onları değiştirir. Ayrıntılar: [Tur yükleme](race-loading-laps.md#folders-and-courses).

## Çok turla performans {#performance-with-many-laps}

Düzinelerce tur bir ya da iki saniyede analiz edilir (hepsi, her zaman). Çizilen şey, görünümün kare hızında kalması için sınırlıdır:

| Sınır | Değer | Etkisi |
|---|---|---|
| varsayılan olarak çizilen tur | 8 (`SHOW_ALL_UP_TO`) | 8 yüklü turun ötesinde, yeni eklenen turlar; referans, odaklanılan tur ya da sınıfının en iyisi değilse gizlenir. **Tümünü göster** her turu çizer; **Yalnızca incelenenler** geri alır. Bir tura odaklanmak onu ve sınıfının en iyisini yeniden gösterir |
| düz araçlar ve ince çizgiler | 10'dan fazla görünür (`PLAIN_PAST`) | odaktaki, takip edilen araç ve referans dışındaki turlar: her 6 m'de bir çizgi noktası (1,5 m yerine) ve araçlar düz çizilir |
| grafiğe alınan turlar | 8 (`CHART_LAPS`) | önce odak, sınıfının en iyisi ve referans; "+N daha çizildi, grafiğe alınmadı" |
| HUD kartları | 6 | görünür ilk altı tur |
| istatistikler | 3 turdan itibaren | bölüm bunun altında gizlenir |
| listelenen bulgular | 12 sürücü, 8 araç/bağlam, 10 kazanç | odaklanılan tur başına |
| gösterilen araç çiftleri | 3 | 3 çiftin ötesinde, bir seçiciyle tek bir çift |

Hata olayları her analizde bir kez hesaplanır ve önbelleğe alınır; hata haritasının yoğunluğu ise sınıf seçimi ve hata başına önbelleğe alınır.

## Geliştiriciler için {#for-developers}

Kod: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) içinde.
