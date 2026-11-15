---
title: "Toplu davranış"
parent: "İçgörüler"
nav_order: 3
lang: "tr"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Toplu davranış: kalabalıklar, sürüler, güruhlar ve baskı altında kararlar

Bir maçtaki oyuncular, her yerdeki insanlar gibi davranır: kapılarda yığılırlar, ilk gidene uyarlar, bir arada kalır ya da dağılırlar, ağır kayıplardan sonra geri çekilirler, kötü bir hayattan sonra daha çok risk alırlar. **Davranış mercek ölçümleri** bu örüntüleri, kalabalık biliminin, toplu hareket fiziğinin, davranışsal iktisadın ve askeri psikolojinin yöntemleriyle ölçer; her biri kendi boş modeline karşı, ve onları [bilgi tabanındaki](knowledge.md) ilgili girdilerle okur.

## Deneyin {#try-it}

1. Zamanı, konumları ve takımları olan bir ya da daha fazla maç yükleyin.
2. **İçgörüler** bölümünü açın ve çalıştırın.
3. **Mercek ölçümleri**'ni açın: davranış ölçüleri diğerleriyle birlikte listelenir (Ortak hizalanma, Rota sürüleme, Şeritler ve patikalar, Kalabalık, Liderler ve takipçiler, Uyum ve geride kalanlar, Kırılma noktası, Kayıplardan sonra risk, Seriler, Satın alma uyumu, Bastırma ateşi); her birinin sayıları, testi ve bunu açıklayan literatür vardır.
4. **Özet** bunlara atıf yapar; **Yapay zekâ ile yaz** raporla birlikte bunları gönderir.

## Ölçüler {#the-measures}

Parçalar, her 2 s'de bir noktaya yeniden örneklenir (aralığın sonundaki konum ve üzerindeki hız). Mesafeler, verinin kendi tipik aralığına göre ölçeklenir - bir birimden en yakın takım arkadaşına olan ortanca mesafe - böylece aynı ölçü piyade, tanklar ve uçaklar için çalışır.

| Ölçü | Neyi ölçer | Boş model ve test | Bilgi |
|---|---|---|---|
| Ortak hizalanma | Her iki tarafın hareket eden birimlerinin her 2 s'deki kutuplaşması (ortalama birim yönünün uzunluğu), ağırlık merkezi etrafında dönme (dolaşma), zamanın kutuplaşmış, dolaşan ve sürüye dönüşen paylarını, maç evresine göre; iki hizalı taraf arasındaki çatışmalarda, daha hizalı tarafın öldürme payı | Her birimin kendi parçası maç içinde zamanda kaydırılmış (yolunu korur, eşzamanlılığı bozar); 60 s pencerelerinde işaret-çevirme testi | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Rota sürüleme | Bir birimin, bir yerden çıkarken önündeki takım arkadaşının yaptığı gibi (30 s içinde) çıkma sıklığı; aynı girişten, yerin kendi çıkış paylarına karşı - ve bir düşmanın önceki geçişini kopyalamaya karşı | Çıkışlar yer ve giriş içinde karıştırılır; etki, takım arkadaşı eksi düşman kopyalamasıdır (Manski'nin yansıma sorunu: kopyalama ile bir tarafın paylaştığı bir plan birbirine benzer) | Banerjee 1992, Bikhchandani ve ark. 1992, Manski 1993 |
| Şeritler ve patikalar | Karşı akışın olduğu yerlerde iki yönün yanal ayrışması; en yoğun %10 zemindeki hareketin payı, bunun Gini'si ve maçların en yoğun zeminlerinin örtüşmesi | Yönler bütün ziyaretler arasında karıştırılır; yarım yer kadar kaydırılmış iki ızgara, her biri test edilir, Bonferroni | Helbing ve ark. 1997, 2005 |
| Kalabalık | Komşu sayısına göre (tipik aralığın iki katı içinde) hız (birimin kendi temposuna göre) ve akış; en yoğun sınıftaki kapasite düşüşü, en yoğun zeminde; kalabalıklarda saatte ölümler; yakındaki takım arkadaşlarının dakikada yaptığı atışlar (sosyal ihmalkârlık) | Her birimin kendi hız-yoğunluk korelasyonu, birimler arasında işaret-çevirme, ±0,05'in ötesinde asgari etki ρ; kesin oran testleri | Helbing ve ark. 2000, Seyfried ve ark. 2005, Latané ve ark. 1979 |
| Liderler ve takipçiler | Birlikte seyahat eden takım arkadaşları için, birinin yönünün diğerinin yönünü en iyi tahmin ettiği zaman gecikmesi (8 s'ye kadar); lider grafiği, üçlülerin geçişkenliği, liderlerin ölüm ve öldürme oranları | Bir parçası zamanda kaydırılmış çiftler %95 eşiğini verir; %5'e karşı binom testi | Nagy ve ark. 2010, Couzin ve ark. 2005 |
| Uyum ve geride kalanlar | En yakın takım arkadaşından, tarafın tipik aralığının üç katının ötesinde geçirilen süre; orada grupla birlikteki ölüm oranına karşı; bir tarafın aralığının bir çatışmadaki öldürme payına karşı | İki Poisson oranının kesin koşullu testi | Shils ve Janowitz 1948, Siebold 2007 |
| Kırılma noktası | Düşmana yaklaşma hızı (tarafın kendi temposunda), son bir dakikada tarafın kaybettiği paya göre; tarafların geri çekildiği en düşük kayıp düzeyi | Tek yönlü küme önyüklemesi, temponun onda biri kadar geri çekilmeye karşı (kayıplar tarafların karşılaştığı yerde olur ve karşılaşan taraflar yaklaşmayı bırakır), düzeyler üzerinde Bonferroni | Dupuy 1987, Rowland 2006 |
| Kayıplardan sonra risk | Bir sonraki hayatın, tarafın kendi payının ve o sırada geri dönen diğer birimlerin payının üzerinde, düşmana doğru tarafın önünde geçirilen payı: bir öldürme olmadan kaybedilen bir hayattan sonra, bir öldürmeyle kaybedilenden sonrasına karşı; erken bir ölümden sonra erken ölüm (eğilim) | Her birimin hayatları karıştırılır (ilk hayat korunur), böylece sonlu dizi yanlılığı boş modelde yer alır | Kahneman ve Tversky 1979, Thaler ve Johnson 1990 |
| Seriler | P(k öldürmeden sonra öldürme) − P(k ölümden sonra öldürme), k = 1..3 | Her oyuncunun kendi dizisi 1.000 kez karıştırılır: Miller ve Sanjurjo'nun gösterdiği yanlılık çıkarılır; k üzerinde Bonferroni | Gilovich ve ark. 1985, Miller ve Sanjurjo 2018 |
| Satın alma uyumu | Bir tarafın bir turundaki donanım bantlarının (eko, kuvvet, tam; Counter-Strike dışında üçte birlikler) Fleiss κ'si | Tarafın oyuncu-turları, kendi turları arasında karıştırılır | Fleiss 1971 |
| Bastırma ateşi | Ölümcül olmayan hasardan sonraki 4 s'deki hız, öncesindeki 4 s'ye karşı; ve sonraki 10 s'deki atışlar, öncesine karşı; isabetlerde ve aynı birimin sakin anlarında | Birimler üzerinde işaret-çevirme; asgari etkiler temponun 0,05'i ve dakikada bir atış | Rowland 2006 |

Raporun her p-değeri, Benjamini-Hochberg yanlış keşif oranından (`q`) geçer. Veri bir ölçüyü taşıyamıyorsa ölçü dışarıda bırakılır: satın alma uyumu için turlar ve ekipman değerleri, bastırma için hasar olayları, seriler ve risk için birimlere atfedilen öldürme ve ölümler gerekir.

## Kitlesel analizde {#in-the-mass-analysis}

Her maç özeti (`<match>.summary.json`, bkz. [Kitlesel analiz](mass-analysis.md)), o maç için aynı ölçüleri `behaviour` bölümünde taşır; böylece binlerce maç, satırlarını yeniden okumadan karşılaştırılabilir.

## Ne kadar iyi çalışır {#how-well-it-works}

Her etki içine yerleştirilmiş simüle edilmiş savaşlarda ve etkisiz aynı dünyalarda (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): her ölçü yerleştirilmiş etkisini bulur ve boş dünyalar yanlış keşif eşiğinin altında kalır. Kayıplardan sonra risk en az güce sahiptir; rota sürüleme, kopyalamayı paylaşılan bir plandan ayıramaz (tek bir hedefi paylaşan bir taraf, bu ölçüye göre "sürüleme" olur).

## Geliştiriciler için {#for-developers}

- `src/insights/behaviour/acc.ts` - biriktirici (yeniden örneklenmiş parçalar, olaylar, turlar) ve `finish`; `motion.ts` ve `choice.ts` ölçüler; `bstats.ts` permütasyon, önyükleme ve kappa yardımcıları; `shows.ts` mercek'in okuduğu örüntüler ve cümleler (`lens.<measure>`).
- `feed.ts` onu içgörü çalışanının parçalarından besler; `summaryTap.ts` bir maç özetinden, tablo akarken.
- Bilgi: `src/insights/knowledge/behaviour.ts` (girdiler), `patterns-behaviour.ts`, `refs-behaviour.ts` (kaynaklar, her biri Crossref ya da Open Library kaydıyla denetlenmiş).
- Etiketler: `locales/*/lens.json` içinde `lens.metric.<measure>`.
