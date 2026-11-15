---
title: "Oyun kumandası ve HOTAS"
parent: "Kamera ve denetimler"
nav_order: 1
lang: "tr"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Oyun kumandası ve HOTAS

Kamerayı klavye yerine Xbox tarzı bir kumandayla uçurabilirsiniz. Büyük bir sahneye yaslanıp etrafa bakmak istediğinizde kullanın. Kumandanın girişi klavyeninkine **eklenir**, bu yüzden ikisini birlikte kullanabilirsiniz.

## Kumandayı bağlayın {#connect-a-controller}

1. Kumandayı takın (ya da eşleştirin).
2. Görünüme tıklayın ve kumandada herhangi bir düğmeye basın. Tarayıcılar bir kumandayı ancak ilk girişinden sonra gösterir.
3. **Kamera ve sahne → Oyun kumandası** bölümünü açın. Aygıt listesi onu `●` ile gösterir.
4. Uçmak için sol çubuğu, bakmak için sağ çubuğu itin. Çubuklar ortadayken kamera kayarsa **Ölü bölge** değerini yükseltin.

Tarayıcının standart kumanda düzenine eşlediği her aygıt çalışır. Bir uçuş çubuğu ya da gaz kolu (HOTAS) varsayılan olarak yok sayılır; aşağıya bakın.

## Eşleme {#mapping}

| Denetim | Etkisi |
|---|---|
| Sol çubuk | Hareket: ileri/geri ve yana kayma |
| Sağ çubuk | Bakış: tam sapmada saniyede *Bakış hızı* derece ile sağa-sola ve yukarı-aşağı |
| `RT` / `LT` (analog) | Yukarı / aşağı; paralel projeksiyonda yakınlaştır / uzaklaştır |
| `RB` (basılı tutma) | 6 kat hızlı |
| `LB` (basılı tutma) | %15 hız |
| `A` (basılı tutma) | 3 kat koşu (RB/LB ile birlikte çalışır) |
| `Y` (bas) | Veriyi çerçeveye al |

Düğme numaraları standart düzeni izler: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; çubuklar eksen 0-1 (sol) ve 2-3 (sağ) üzerindedir.

## Oyun kumandası ayarları {#the-gamepad-settings}

**Kamera ve sahne → Oyun kumandası** bölümünde. **Ayarlar** / **Gizle** ayar denetimlerini açar ya da kapatır.

| Denetim | Varsayılan | Aralık (kaydırma) | Anlamı |
|---|---|---|---|
| **Etkin** | açık | | |
| Aygıt durumu | | | Bağlı her aygıt; izlenenler `●`, izlenmeyenler `○` ile gösterilir. Standart olmayan aygıtlar için *- XInput kumandası değil, yok sayıldı* ya da *- XInput kumandası değil, yine de kullanılıyor* yazar. Hiçbiri yoksa: *Kumanda algılanmadı. Tarayıcılar bir kumandayı, ilk girişini gönderene kadar göstermez - üzerindeki bir düğmeye basın.* |
| **Kullanılacak cihaz** | *Yalnızca XInput kumandaları (önerilir)* | | Standart olmayan bir aygıt bağlıyken gösterilir. Bunun yerine adıyla bir aygıt seçerek onu izleyebilirsiniz. |
| **Bakış hızı** | 150°/sn | 20-540 (5000) | Sağ çubuk tam sapmadayken dönme hızı. |
| **Ölü bölge** | %12 | %0-50 (%95) | Radyal: çapraz itme asla tek bir eksene sızmaz. Çubuklar ortadayken kamera kayarsa yükseltin. |
| **Çubuk eğrisi** | x² | doğrusal (1) ile x⁴ (16) arası | Ölü bölgeden sonraki tepki üssü: merkezde daha ince denetim, kenarda yine tam hız. |
| **Çubuk Y eksenini ters çevir** | kapalı | | |
| **Çubukları değiştir** | kapalı | | Hareketi sağ çubukta, bakışı sol çubukta yapar. |

Çubuk şekillendirmesi: *m* sapması (çubuk vektörünün uzunluğu) ve *d* ölü bölge ile çıktı, çubuğun yönü boyunca ((m - d) / (1 - d)) ^ eğri olur; ölü bölgenin içinde 0.

## Neden varsayılan olarak yalnızca standart kumandalar {#why-only-standard-pads-by-default}

Gamepad API, eksenli **her** HID aygıtını bildirir: uçuş çubukları, gaz kolları, pedallar, direksiyonlar. Bunlar merkezde durmaz: bir büküm ekseni ya da gaz kolu, kimse dokunmadığında bile tam sapmadadır. Bir çubuk gibi okunursa, hiçbir ölü bölgenin bastıramayacağı sürekli tam hızlı bir giriş olur ve kamera sayfa yüklendiği andan itibaren kendi kendine döner (her ısı kipi de bozuk görünür, çünkü hareket eden kamera biriktirmeyi her karede yeniden başlatır).

Bu yüzden bir aygıt yalnızca tarayıcı `mapping: "standard"` bildirdiğinde izlenir. Bu, "eksenleri beklediğiniz yerde olan XInput tarzı bir kumanda" demenin tarayıcının yoludur. Diğer aygıtlar listelenir ve yok sayıldığı işaretlenir. **Kullanılacak cihaz** ise açıkça birini seçmenizi sağlar; örneğin bir HOTAS ile kamerayı uçurmak için. Bir kumanda izlenmeye başlanınca kamera onunla kalır, böylece numaralandırma sırasına göre iki kumanda kamera için kavga etmez.

**HOTAS:** Yalnızca 0-3 eksenleri (iki çubuk) ve standart düğmeler okunur. Diğer eksenlerdeki gaz kolu ya da pedallar hiçbir şey yapmaz; merkezde durmayan eksenleri olan bir çubuk ya da gaz kolu daha büyük bir **Ölü bölge** isteyebilir.

Tarayıcılar, bir kumanda ilk girişini gönderene kadar onu gizler. Bu yüzden takılı ama dokunulmamış bir kumanda, sayfa açısından henüz yoktur.
