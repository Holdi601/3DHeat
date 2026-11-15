---
title: "Yakın çarpışma ve turlar"
parent: "İçgörüler"
nav_order: 2
lang: "tr"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Yakın çarpışma ve turlar

Tur tabanlı nişancı oyunları için (önce Counter-Strike, ayrıca turları, tarafları ve öldürmeleri olan her veri), İçgörüler dövüşlerin nasıl kazanıldığını ölçer: açılış düellolarını kim aldı ve bunlar ne değerdeydi, ölümler takas edildi mi, bir açıya girip bekleyeni gözetleyen oyuncu onu yendi mi, çapraz ateşler ve flaşlar karşılığını verdi mi, her imhayla tur olasılıkları nasıl değişti ve girenleri hangi kapılar öldürdü. Kimin öldürdüğü yerine turların *neden* kazanıldığını görmek için kullanın.

Ölçüler oda temizleme ve kentsel doktrinden (ölümcül huni, hâkimiyet noktaları, çapraz ateş) ve e-spor ile spor analitiğinden (kazanma olasılığı, eylemlerin değeri, düzeltilmiş artı-eksi) gelir. Her biri [bilgi merceğiyle](knowledge.md) okunur ve atıflıdır.

## Deneyin {#try-it}

1. Turları olan bir ya da daha fazla maç yükleyin (bir CS2 dönüştürmesi gereken her şeye sahiptir).
2. **İçgörüler**'i açın ve **İçgörü bul**'a basın.
3. **Mercek ölçümleri** altında, *Tur kazanma olasılığı*'ndan *Oyuncu etkisi*'ne kadar olan satırları okuyun. Her birinin sayıları, %95 aralığı, q değeri ve izlediği kaynaklar vardır.
4. Bunları o literatür üzerinden okumak için **E-spor** ya da **Kentsel** merceğini seçin. **Yapay zekâ ile yaz** onları raporla birlikte gönderir.

## Neyi ölçer {#what-it-measures}

| Ölçü | Ne söyler | Nasıl |
|---|---|---|
| Tur kazanma olasılığı | Her an her tarafın turu kazanma olasılığı | Her tarafta canlı oyuncular, bomba ya da hedef ve zamanı, tur saati ve satın alma üzerine lojistik regresyon; veriye uydurulur. Kalibrasyon tur bazında kat dışında denetlenir (Brier skoru ve beceri, log kaybı, on kutuda kalibrasyon hatası, yeniden kalibrasyon eğimi, AUC) |
| Eylemlerin değeri | Bir imha, açılış imhası, takas, flaş arkasındaki imha, plant ya da flaş tarafın kazanma şansını ne kadar değiştirdi | Eylemden sonraki kazanma olasılığı eksi öncekisi; takaslar, açılışlar ve flaşlı imhalar, diğer imhalara karşı permütasyonla sınanır |
| Açılış düelloları | Hangi taraf ilk düelloyu kazanır, bu turu kazanma sıklığı ve bir taraf açılışları kendi ortalamasının çok üstünde nerede kazanır | Wilson aralıkları; yerler, tarafın payına karşı tam ikili testle; yerler üzerinde q |
| Takaslar | Bir takım arkadaşının katilini 5 sn içinde imhasıyla yanıtlanan ölümler, geçen süre ve ilk ölüm takas edildiğinde kazanılan turlar | Fisher'ın tam testi, Newcombe aralığı |
| Gözetleyen karşısında bekleyen | Bir oyuncunun dövüşe girdiği (son saniyede 1,5 m/s ya da daha fazla) ve diğerinin hareketsiz durduğu (0,75 m/s ya da daha az) düellolar: gözetleyenin payı | Yarıya karşı tam ikili test |
| Düellodan önce nişan | Her oyuncunun imhadan 0,75 sn önce diğerine karşı bakışı: kim daha iyi nişan aldı ve bu oyuncu ne sıklıkla kazandı; açısında (15° içinde) bekleyenler ile dışında olanlar; imha menzilleri | Tam ikili test; Fisher |
| Çapraz ateş | Gözetleyenin 25 m içinde hareketsiz bir takım arkadaşı olan bekleyenler, gözetleyene olan çizgisi kendi yönünden 35° ya da daha fazla saparsa; yalnız bekleyenlere karşı | Fisher, Newcombe |
| Girişlerde yardımcı öğeler | Kendi tarafının bir flaşının (3 sn ve 15 m içinde) ya da bir dumanın (18 sn içinde) arkasındaki gözetleyenler, kuru gözetlemelere karşı; yalnızca bir tarafta flaşı olan açılış düelloları; kör edilen kurbanlar | Fisher, ikili |
| Adam üstünlüğü | Bir turda ilk ulaşılan canlı oyuncu durumunun her biri için (5v4, 4v5, 2v1...), oradan kazanılan turların payı | Wilson aralıkları |
| Son adam | Bir tarafın son oyuncusuna indiği turlar: modelin beklenen kazanmalarına karşı kazanmalar, rakip sayısına göre | Gözlenenin beklenene karşı normal testi |
| Yığılma, rotasyon, pusu | Açılış düellosunda 10 m içindeki en büyük grup (3 ya da daha fazla: yığılmış); ilk çatışmadan ya da kurulan hedeften 30 m'den uzaktaki oyuncular ve 12 m içine ne kadar hızlı girdikleri; her takım arkadaşından 30 m'den uzakken zaman ve imha-ölüm oranları | Fisher; Woolf aralığıyla oran oranı |
| Plant sonrası ve geri alma | Plant eden tarafın kazandığı turlar, plant anındaki sayılara göre ve plant sonrası düellolardaki payı | Wilson aralıkları |
| Ölümcül huniler | Her yere girişler (yer sütununun değişimi, yoksa 8 m'lik bir hücre) ve girişten sonra 2,5 sn içindeki ölümler, haritanın oranına karşı | Tam ikili test, yerler üzerinde q; oran, haritanın oranında 20 girişle küçültülür |
| Oyuncu etkisi | Her oyuncunun tur başına eklediği kazanma olasılığı (imhalar, ölümler, plantlar), ampirik Bayes ile küçültülmüş; tur sonuçlarının modelin başlangıcına karşı ridge düzeltilmiş artı-eksisi; yere ve silaha göre imha değeri, küçültülmüş | Ceza beş katlı çapraz doğrulamayla seçilir |

Bir analizin tüm testleri tek bir yanlış keşif oranını (Benjamini-Hochberg) paylaşır. Gösterilen yerler dahil denenen her yer sayılır, yalnızca gösterilenler değil; gösterilen q hepsi üzerindendir. Model ve kalibrasyonu yüklenen veriye uydurulur; bu yüzden o popülasyonu tanımlar. Profesyonel bir model gündelik oyunu yanlış değerlendirir ve tersi de geçerlidir.

Etkileri gömülmüş sentetik turlarda (bir gözetleyenin üstünlüğü, çapraz ateş, flaşlar, bir ölümcül huni, daha iyi nişanın kazanması) ve aynı turların etkisiz 100 veri kümesinde denetlendi. Gömülü etki testlerinin yanlış keşif oranı nominal %5'te (bir bant içinde) kalmalıdır (`src/insights/cqb/cqb.test.ts`). Yaklaşık bin gerçek turda model, taban oran için 0,25'e karşılık 0,14 Brier skoru, 0,03 kalibrasyon hatası ve 1,0 yeniden kalibrasyon eğimi verdi.

## Ihtiyaç duyduğu veri {#data-it-needs}

- **zaman**, **oyuncu**, **taraf** ve **tur** (oturum) sütunları; olay sütununda imhalar ve ölümler. Hiç kimsenin iki kez ölmediği turlar eleme turu sayılır (adam üstünlüğü, son adam ve model bunlara ihtiyaç duyar);
- bir **diğer taraf** sütunu (`other`, `victim`, `killer`, `attacker`): bir imhada kurbanı, bir ölümde katili adlandırır. Bu olmadan aynı anda olan imhalar ve ölümler eşleştirilir;
- nişan ölçüleri için bir **bakış yönü**;
- yardımcı öğeler ve plantlar için `flash`, `smoke`, `he`, `molotov`, `plant` ve `defuse` adlarını taşıyan ham bir `event` sütunu;
- veride varsa `won` (satırın tarafı turu kazandı), `place` (çağrılar), `weapon`, `buy` ve `state_flashed`.

Konumlar saniyede birkaç kez örneklenmelidir. Hızlar, nişan ve çapraz ateş her ölümden önceki son iki saniyeyi okur.

## Dökümlemede {#in-the-breakdown}

[Dökümleme](breakdown.md), dört durumu karşılaştırmalı faktörler olarak ölçer: *kör edilmiş*, *ölüm takas edildi*, *açılış düellosu* ve sayılar (*adam üstünlüğü*, *eşit sayı*, *adam dezavantajı*). Her biri K/D, kazanılan turlar, hayatta kalma ve dakikada imha üzerinde gösterilir.

## Birçok maç {#many-matches}

Tur sütunu olan verinin [çok maç analizinin](mass-analysis.md) her maç özeti, aynı ölçüleri sayılar olarak taşır (özetteki `cqb`): açılış düelloları, takaslar, gözetlemeler, çapraz ateşler, flaşlı girişler, nişan, adam üstünlüğü, plantlar ve en çok girilen 40 yer, girişleri ve ölümleriyle. Sayılar maçlar üzerinden toplanır; bu yüzden bin maç, tek bir büyük analizle aynı payları verir. Panelin **Yakın çarpışma** sekmesi bunları aralıklarıyla birlikte pay olarak tüm haritalar için ya da harita başına gösterir. Bir satıra tıklamak, o satırın geldiği maçları yükler.

## Geliştiriciler için {#for-developers}

`src/insights/cqb/` klasöründe: `walk.ts` (satırlar üzerinde zaman sırasıyla tek geçiş; turlar ayrı tutulur, düellolar durumlarıyla kaydedilir), `finish.ts` (ölçüler ve maç başına sayılar), `model.ts` (IRLS ile lojistik regresyon, kalibrasyon, eşlenik gradyanlarla ridge, ampirik Bayes, Fisher, Newcombe, permütasyon testleri), `run.ts` ve `worker.ts` (görüntüleyici: İçgörü geçişinin yanında kendi çalışanı), `summary.ts` (çok maç özetinin toplayıcısı), `factors.ts` (dökümlemenin durumları), `shows.ts` (merceğin okuduğu şey), `synth.ts` (test turları). Bilgi kayıtları `src/insights/knowledge/cqb.ts` içinde, kalıplar `patterns-cqb.ts` içinde. Sonuçlar rapora `lens.cqb` olarak girer.
