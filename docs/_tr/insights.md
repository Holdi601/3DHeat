---
title: "İçgörüler"
nav_order: 7
has_children: true
lang: "tr"
source: "insights.md"
source_hash: "8232fe145807"
translated: true
outdated: false
---

# İçgörüler

**İçgörüler** yüklenen veriyi öne çıkan şeyler için tarar - güçlü konumlar, ölümcül zemin, doğma tuzakları, dar geçitler, akranlarının çok üstünde oyuncular - ve en güçlüden başlayarak, kanıtlarıyla birlikte size anlatır. Bir maçın nerede kazanıldığını ya da kaybedildiğini bir dakikada öğrenmek için kullanın. Ardından bir özet yazabilir ve tek bir tekrarda, büyük anlara atlayan bir anlatıcı gibi davranabilir.

Her şey tarayıcınızda sayılır. Harici bir yapay zekâyı açmadıkça (bkz. [Harici yapay zekâ](#external-ai)) hiçbir şey bilgisayarınızdan çıkmaz.

![Tank demosunda içgörüler: 14 bulgu, en güçlüsü önce](../assets/img/en/insights.webp)

**İçgörüler** bölümü Isı haritası ve Maç sekmelerinin kenar çubuğundadır. Üç sekmesi vardır: **Bulgular**, **Özet** ve **Anlatıcı**.

## Bulgular {#findings}

1. Veri yükleyin ve **İçgörüler**'i açın. **İçgörü bul**'a basın ("Sayılıyor… %n" ilerlemeyi gösterir).
2. Listeyi okuyun. Her bulgunun bir güç çubuğu, bir cümlesi, kanıtın ne kadar iyi olduğu (*Güçlü kanıt*, *İyi kanıt* ya da *Biraz kanıt*), onu bulan dedektör ve bunun önemli olduğu araç sınıfı vardır.
3. **Bir bulguya tıklayın**: görüntüleyici süzgeçlerini uygular, kamerayı yere uçurur ve zamana atlar, ayrıntıları açar: %95 aralığıyla etki, p ve q değerleri, sayılan kanıt ve bunun etrafına bir [hacim](volumes.md) çizen **Burada hacim**.
4. **Filtreleri geri yükle** sizin filtrelerinizi geri koyar. **JSON'u kopyala** tüm raporu kopyalar.

Sayma, tüm zaman aralığında geçerli filtreleri, gizli grupları ve seçilen maçı kullanır. Filtreleri sonradan değiştirdiğinizde bir not bunu söyler; **Yeniden say**'a basın.

Listenin en üstündeki satırlar (örneğin para toplamları) bulgulardan önce tüm veriyi özetler.

![Açılmış bir bulgu: ateş edilen atışların sıcak bölgesi, sayıları ve literatürden eşleşen bir pasaj](../assets/img/en/insights-finding.webp)

### Dedektörler {#the-detectors}

| Dedektör | Ne bulur | Veride gereken |
|---|---|---|
| **Güç konumları** | Haritanın geri kalanına göre çok daha iyi öldürme-ölüm oranına sahip yerler ve harcanan süreye göre az kişinin öldüğü *güvenli zemin* | öldürme ve ölüm olayları |
| **Sıcak ve soğuk bölgeler** | Bir olay türünün (atış, isabet, ele geçirme ...) orada geçirilen süreden tahmin edilenden çok daha sık ya da az sık olduğu yerler | bir olay sütunu |
| **Açık alan ve siper** | Yakın seviye geometrisine karşı açıkta yapılan ölümler ve hızlı harekete karşı yavaş hareket | ölümler; geometri kısmı için bir 3B harita |
| **Doğmalar** | Güçlü doğmalar, doğma tuzakları, güvenli doğmalar, ilk temasa kadar geçen süre | zaman ve kişiler |
| **Yere göre sınıf** | Bir bölgede çok daha iyi ya da kötü sonuç veren bir araç sınıfı ya da oyuncular ile YZ'ler | öldürmeler artı bir araç sınıfı ya da oyuncu/YZ sütunu |
| **Oyuncular** | Aynı sınıftaki diğerlerinden çok daha fazla ya da az öldüren ya da ölen oyuncular | kişiler ve öldürmeler |
| **Dar geçitler ve kanatlar** | Dar geçitler (çevredeki zemine göre çok daha fazla geçiş) ve kanat güzergâhları (nadiren kullanılan ama öldürmelere çıkan) | kişiler |
| **Değer** | *Pahalı zemin* ve *Kazançlı zemin* | [değer sütunları](value-weighting.md) |

Veride çalışamayan dedektörler, nedeniyle birlikte en altta listelenir.

### Bulgular nasıl sıralanır {#how-findings-are-ranked}

Her yer ya da grup haritanın geri kalanına karşı sınanır (kesin ikili ya da oran testleri). Yanlış keşif oranı %5'te tutulur (Benjamini-Hochberg). Şans bir örüntü gibi görünebilir; bu, yanlış alarmları düşük tutar: gösterilen bulguların en fazla yirmide birinin şans olması beklenir. Az olaydan gelen etkiler sıralamadan önce "etki yok"a doğru çekilir. En fazla 60 bulgu listelenir ve her dedektör en üstte birkaç yer alır.

## Özet {#debrief}

**Özet** sekmesi bulguları kısa bir metne yazar: bir giriş, en net bulgu, taktik için bir tane, dengeleme için bir tane, geri kalanı dedektöre göre gruplanmış ve kaçının daha zayıf kanıta dayandığı. Her paragrafta, bulgularını gösteren numaralı düğmeler vardır. **Metni kopyala** onu kopyalar.

![Yerleşik anlatıcının yazdığı özet](../assets/img/en/debrief.webp)

Yerleşik anlatıcı çevrimdışı çalışır, sizin dilinizde. Üstündeki **Mercek** seçici (bkz. [Bilgi merceği](knowledge.md)) paragrafların hangi literatüre atıf yaptığını belirler.

### Harici yapay zekâ {#external-ai}

**Yapay zekâ ayarları**, özeti bunun yerine seçtiğiniz bir yapay zekâ modelinin yazmasını sağlar:

| Ayar | Anlamı |
|---|---|
| **Sağlayıcı** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (yerel), LM Studio (yerel), llama.cpp sunucusu (yerel) ya da herhangi bir OpenAI uyumlu uç nokta |
| **Temel URL**, **Model** | Sağlayıcı tarafından doldurulur; **Modelleri listele** sunucuya sorar |
| **API anahtarı** | Yalnızca temel URL'ye gönderilir. Asla günlüğe yazılmaz, görünümlerde, dışa aktarmalarda ya da `.3dheat` dosyalarında saklanmaz. Çoğu yerel sunucu hiç gerektirmez. |
| **Anahtarı bu tarayıcıda hatırla** | Varsayılan kapalı: sayfa kapandığında anahtar unutulur |
| **Harici yapay zekâ kullan** | Varsayılan kapalı |
| **Oyuncu adlarını gönder** | Varsayılan kapalı: oyuncular P1, P2 ... olarak gönderilir |

Sonra isteğe bağlı bir soru yazın ve **Yapay zekâ ile yaz**'a basın. Yalnızca bulgular ve sayıları gönderilir - veri satırlarınız hiçbir zaman. Yanıt akarak gelir; atıf yapılan bulgular düğmeye dönüşür.

## Anlatıcı {#caster}

**Tek bir maç** için (birkaç tane yüklüyse birini seçin), **Anlatıcı** izlemeye değer anları bulur: ilk kan, çoklu öldürmeler, takaslar, son adam savaşları, hedef değişimleri, geri dönüşler, öne çıkan oyuncular, uzun atışlar.

![Shooter demosunun bir turu için anlatıcının anları](../assets/img/en/caster.webp)

- Bir ana tıklayın: görünüm tekrara geçer, hemen öncesine atlar, oraya uçar ve oyuncuyu izler.
- **Anları oynat** her birini sonuna kadar oynatır ve ilerler; **Önceki** / **Sonraki** onların arasında adım atar.
- Harici bir yapay zekâ açıkken **Yapay zekâ yorumu**, anlar listesinden (türler, zamanlar, adlar ya da takma adlar, takımlar, sınıflar, mesafeler) bir yorum yazar.

Kişilere ve öldürme/ölüm (ya da ele geçirme) olaylarına ihtiyaç duyar; bir `other`/`victim` sütunu takasları ve uzun atışları mümkün kılar.

## Bilgi merceği {#knowledge-lens}

Bir bulgu, yerleşik bilgiden bir **mercek** üzerinden okunabilir: askerî doktrin, hava ve deniz muharebesi, kentsel harekât, oyun tasarımı ve e-sporlar (ya da *Otomatik*, verideki birimlere göre seçilir). Açılmış bir bulgu, bu durumda en yakın **doktrin ve literatür** girdisini ve **tarihsel bir paralel**i, kaynaklarıyla birlikte gösterir; **Mercek ölçümleri** bu literatürden verideki ölçüleri hesaplar (Lanchester uyumları, değiş tokuş oranları, kuvvet oranları, ateş alanları, anahtar arazi, takaslar, inisiyatif). Özet ve yapay zekâ istemi bunları içerir. Hepsi hakkında: [Bilgi merceği](knowledge.md).

Mercek ölçümleri ayrıca oyuncuların bir kalabalık ve bir grup olarak nasıl davrandığını ölçer - hizalanma ve dönme, güzergâh sürüleme, şeritler ve izler, sıkışıklık, liderler ve takipçiler, geride kalanlar, kayıplar altında kırılma noktası, bir can kaybından sonraki risk, seriler, satın alma uyumu ve gelen ateşe tepki - her biri kendi boş modeline karşı: [Toplu davranış](collective-behaviour.md).

## İçgörülerin işe yaraması için gereken veri {#data-that-makes-insights-work}

- **zamanlı** konumlar, bir **kişi** ve bir **takım** sütunu;
- öldürme ve ölümlerle (`kill`, `death`) bir **olay** sütunu, ve diğerleri (`hit`, `fire`, `capture` ...);
- takaslar ve yönler için bir **öteki taraf** sütunu (`other`, `victim`);
- sınıflar için bir **araç** ya da **tür** sütunu; oyuncuları YZ'ye karşı ayırmak için bir `ai` sütunu;
- birden çok maç olduğunda bir **oturum** / **maç** / **tur** sütunu.

[Demo verileri](demo-data.md) hepsine sahiptir.
