---
title: "Tacview kayıtları (ACMI)"
parent: "Veri alma"
nav_order: 7
lang: "tr"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview kayıtları (ACMI)

Tacview, uçuş simülatörlerindeki uçuşları kaydeden bir programdır; dosyaları `.acmi` ile biter. 3DHeat bunları açar, böylece her uçağın nereden uçtuğunu görebilirsiniz.

Tacview uçuş kayıtları her tablo gibi yüklenir: bir `.acmi` dosyasını (metin, `.txt.acmi` ya da sıkıştırılmış, `.zip.acmi`) seçin ya da sürükleyin ve **Yükle**'ye basın. Böylece tüm uçuşların ısısını elde edersiniz; **Maç** sekmesinde ise figürler, izler ve bir olay listesiyle bir tekrar oynatma ([Maç tekrar oynatma](match-replay.md)). ACMI, Tacview'un herkese açık dosya biçimidir ([belgeleri](https://www.tacview.net/documentation/acmi/)); DCS (Tacview'un dışa aktarıcısı üzerinden), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS ve diğerleri bu biçimi yazar, bu yüzden hepsi okunur.

## Bir kayıt neye dönüşür {#what-a-recording-becomes}

Bir nesnenin konumu her yazıldığında bir satır, nesnenin yerindeki her olay için bir satır ve bir nesne ayrıldığında bir satır (`Removed`, son görüldüğü yerde). Henüz görülmemiş bir nesneyle ilgili olay (bir yer imi, herkese bir ileti) referans noktasında `(recording)` nesnesinin satırıdır. Kayıt kendi okuma talimatlarını taşır, bu yüzden eşleme adımı kendini doldurur. Okuyucu şu sütunları yazar: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, ve kaydın sahip olduğu başka özellikler. Rolleri:

| Sütun | Rol | Anlamı |
|---|---|---|
| Time | zaman | Kaydın ReferenceTime değerinden sonraki saniye; ReferenceTime varsa Unix saniyesi, böylece saat gerçek zamanı gösterir. |
| X, Y | konum | Kaydın referans noktasında yeryüzüne dokunan bir düzlemde doğu ve kuzey, metre cinsinden: yakınında mesafeler ve yönler doğrudur, 100 km'de binde birden az kayar. Kuzey, dünyanın -Z'si olur. |
| Altitude | konum (yukarı) | Metre. |
| Object | kişi | Pilot ve nesnenin kimliğiyle adı, örneğin `Viper 1 (F-16C_50) #a01`; insansız bir nesne `(T-90A) #401`. |
| Coalition | takım | Taraf (ya da koalisyon yoksa renk). |
| Heading, Pitch | bakış | Derece; yön 0 kuzeydir. |
| Recording | oturum | Kaydın Title değeri ya da dosya adı: birkaç kayıt, izleri birleşmeden yan yana yüklenir. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtreler | Filtreleme için tutulur; Type ve Name her nesnenin [figürünü](figures.md) seçer, Event, değerlendirmenin (debrief) olay listesini besler, Roll uçağı yatırır. |
| U, V | | Oyunun kendi düz dünya metreleri, her örnekte varsa (DCS yazar). |
| EventObjects | filtreler | Bir olayın adını andığı her nesne (`Message|a01|b02|...`), kimliğiyle. |
| RecordingInfo | | Kaydın o andaki kendi özellikleri: DataSource, DataRecorder, Author, Category, Briefing, Comments, ... JSON olarak. |
| IAS, Mach, AOA, FuelWeight, ... | filtreler | Kaydın taşıdığı diğer sayısal her özellik. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtreler | Kaydın taşıdığı diğer metin özellikleri; sayı olmayan herhangi bir değere sahip özellik metindir. |

Tacview konumunun dört biçimi de okunur (`lon|lat|alt`, `u|v` ile, `roll|pitch|yaw` ile ve hepsi ile birlikte bir yön), boş alanlar son değeri korur. `-id` bir nesneyi kaldırır; ondan sonra yeniden kullanılan bir kimlik yeni bir nesnedir. Kaçış karakterli virgüller ve devam eden satırlar işlenir.

Konumlar her zaman enlem ve boylamdan projeksiyonla alınır, U/V'den asla; bu yüzden her oyunun kayıtları gerçek dünyanın bir arka planıyla tek bir projeksiyonu paylaşır.
