---
title: "Matši kordus"
nav_order: 9
has_children: true
lang: "et"
source: "match-replay.md"
source_hash: "9d61f24a5a04"
translated: true
outdated: false
---

# Matši kordus

Kordus on matši film, kus iga mängija on joonistatud selle asjana, mida ta juhtis. Kasuta seda, et vaadata lahing uuesti, jälgida ühte üksust ja näha, kes kellele lõi.

Lasud, tabamused, tulekahjud ja vraki märgitakse tasemel olevatele üksustele ja eesmärkidele. Kaamerad, sildid ja taktikaline kuva aitavad lahingut lugeda. Kas tunned Tacview't? [Tacview tasemel](tacview-parity.md) näitab, kus on kõik selle tööriistad.

![Tankide demo kujukordus: tankid oma kujudena, nime-, sõiduki- ja kiirusesiltidega](../assets/img/en/replay-overview.webp)

## Alusta kordust {#start-a-replay}

1. Laadi salvestis **Allikas → Failid…** abil või lohista see paneelile Allikas (mis tahes tabel, millel on **isiku** ja **aja** veerg, Tacview fail, konverteeritud kordus, [`.3dheat`](container.md) matš). Vt [Andmete sisselugemine](getting-data-in.md).
2. Ava vahekaart **Matš** ja vali **Kujukordus** või vali Soojuskaardi vahekaardi režiimiribal **Kujude ülekate**.
3. Jaotises **Korduse matšid** vali üks matš, kõik korraga või mitu.
4. Vajuta ajajoonel **Esita** (või `K`). Ajajoone lohistamisel hüppad sinna.

Kujud asendavad kastid igal üksusel, mille nimi või tüüp on teada (vt [Kujud](figures.md)). Andmed, millel pole nime- ega tüübiveergu, joonistatakse sõduritena.

![Vahekaart Matš: matšide valija, jaotis Kujud, kaamera vaated, Esita ja sündmuste loend](../assets/img/en/match-replay-tab.webp)

## Kujud {#figures}

![Põlev tank orbitaalkaamera vaates, koos tabamusega, mis selle tabas](../assets/img/en/replay-tanks.webp)

| Seade (jaotis **Kujud**) | Vaikimisi | Mida ta teeb |
|---|---|---|
| **Kujud kastide asemel** | sees | Väljas joonistab lihtsad kastid. |
| **Kujude suurus** (tegelik suurus korda) | 1 | 1 on päris suurus; 0,25 kuni 20 korda (logaritmiline skaala). Suurem aitab kaugelt. |
| **Väikseim kujund ekraanil** | 36 px | Kaugel olevad kujud kasvavad, et jääda nii pikaks, 0 kuni 200 px; 0 jätab tegeliku suuruse. |
| **Kaugelt**: Kuju, Nool, Tähis | Kuju | Mis saab kaugel olevast üksusest. |
| **Tähised** | NATO (APP-6) | NATO (APP-6), vene taktikalised märgid, **Mängukaardi** ikoonid või **Ainult kujud (värvipimedatele)**. |
| **Tähise suurus**, **Minu pool**, **Vaenulik / Neutraalne**, **Kursikriipsud** | 28 px (12 kuni 64), automaatne, vaenulik, sees | Kuidas tähised välja näevad ja milline pool on sõbralik. |
| **Loodjooned** | sees | Joon igast üksusest otse maapinnale, nii et kõrgused loetakse 3D-s. |
| **Loodjooned ja sildid relvadel** | väljas | Jooned maapinnale ja sildid rakettidel ja pommidel. |
| **Tulekahjud üksustel** | sees | Leegid hetkest, mil üksus süttib, kuni see kustutatakse. |
| **Tabamused üksustel** | sees | Märgid, kus lasud tabasid (allpool). **Tabamused püsivad**: 1 kuni 300 sekundit või **Kogu elu**. **Hõljuvad märgid**: märgid, mis joonistatakse pinnast kõrgemale. |
| **Vaate- ja tornijooned** | väljas | Katkendlik: kuhu mängija vaatab; pidev: kuhu kanon sihib. |
| **Hooned** | tahke | Tahked või läbipaistvad hooned, kui tase neid joonistab. |

### Sümbolid kaugel {#symbols-at-a-distance}

Kui üksus oleks väiksem kui **Väikseim kujund ekraanil**, võib ta muutuda sümboliks, mis jääb loetavaks. Kuju ütleb liigi (näiteks soomuki puhul ümarnurkne kast jälje märgiga); värv ütleb poole. Menüüs **Tähised** saab stiili muuta.

![Samad kuus üksust NATO sümbolitena, vene taktikaliste märkidena, mängukaardi ikoonidena ja ainult kujudena](../assets/img/en/match-replay-symbols-styles.webp)

### Tabamusmärgid, vrakid ja tulekahjud {#hit-marks-wrecks-and-fires}

- **Tabamusmärgid** asuvad pinnal, kuhu lask jõudis, kuju mõõtkavas. Nende välimus ütleb, mis juhtus: auk (läbis), hele pritsmed (ei läbinud), sälk (libises mööda), tahma täht (plahvatav mürsk). Värviline rõngas ütleb, mis tegi: tapev lask, moodul hävitatud, kriitiline, raske, kahju, kahjustuseta, tabamus. Märgi kohale hiirt viies näed vooru nime.
- Hävitatud üksus joonistatakse **söestunud** vrakina surmast kuni taaskerkimiseni või eemaldamiseni; tema sümbol on ristiga läbi kriipsutatud.
- **Tulekahjud** põlevad üksusel alates hetkest, mil see süttib, kuni see kustutatakse.
- **Tornid** pöörduvad sinna, kuhu andmed ütlevad, et kanon sihib (või, kui seda pole, kuhu mängija vaatab).

### Relvad, lõksud ja jäljed {#weapons-decoys-and-tracers}

Kui **Relvad, lasud ja tabamused** on sisse lülitatud (jaotis Võistkonnavaatur): raketid, rakettid, pommid ja torpeedod lendavad oma kujudena suitsujäljega; kuulid ja mürsud on jäljed; tabamused ja plahvatused välgatavad. Jälg, mis on joonistatud **katkendlikult**, arvutati tabamusest, sest andmetes polnud lasku. Valgussoojuslõksud ja tinakitid joonistatakse peibutistena; need on üksuste loendist peidetud, kui pole märgitud *Peibutised ja mürsud*.

## Kaamerad {#cameras}

Klõpsa üksusel või selle sildil, et seda **jälgida**; jaotis **Kordus** pakub **Jälitus**, **Orbiit**, **Kokpit** (koos peakuva, `H`), **Fikseeritud**, **Padlock**, **Sihtmärk** ja **Satelliit**. `V` vahetab neid ja **Kaamera kaugus** seab, kui kaugel. Esc peatab.

- **Kahe üksuse vaade**: vali **Sihtmärk** (või Ctrl/Alt-klõps üksusel), et seda vaadata jälgitavalt üksuselt; **Vaheta** vahetab need.
- **Mõõt**: Shift-klõps kahel üksusel annab nende vaheline suund, kaugus ja kõrgusevahe.
- **2D-kaart** (`M`): nurk- või täisvaade, jälgede ja nimedega.
- **Järjehoidjad** (`B`): salvesta hetk ja kaamera; salvestise enda tapmised, surmad ja märgid on samuti loetletud.
- **Sündmused**: iga sündmus ajajärjekorras; klõps viib sinna. `Page Up` / `Page Down` hüppavad sündmuste vahel; **Peata sündmusel** peatub igal neist.

## Taktikaline kuva {#tactical-display}

![Õhudemo taktikalises ilmes (T): traatraam maastik, tapmiste ja sündmuste paneelid](../assets/img/en/replay-air-tactical.webp)

Jaotis **Taktikaline kuva** joonistab ühegi üksuse jaoks, valitud üksuste, kõigi või ühe liigi (õhusõidukid, maismaa, laevad, relvad) jaoks: kiirusvektorid ja ees olev tee, nina- ja tõstejooned, radarikoonused, lukustused, andmesidelingid, kaasamisalad ja -jooned, nägemisjooned, kus mängijad vaatavad (vaatekoonused), tornide sihtimine ja salvestatud kaamera.

### Kuvastiil {#display-style}

`T` (või lüliti **Näita taktikalise kuvana**) lülitab ilme radarikuva stiilile: hõõgumine, kontuurid, kõrgusjooned, mõõtmisvõrk, skaneerimisjooned, ulatusrõngad, kõrguse redelid, paneelid tapmiste ja sündmustega ning **Režissöör**, mis liigutab kaamerat sündmuste juurde ise.

![Sama õhulahing tavalises ilmes](../assets/img/en/replay-air.webp)

## Eesmärgid {#objectives}

Kui matš tuleb oma eesmärkidega, joonistab jaotis **Eesmärgid** need tasemele: vallutustsoonid (koos omaniku ja vallutuse edenemisega), spawnid, lennuväljad, alad ja pommitamise sihtmärgid, iga kiht eraldi sisse-välja lülitatav, koos siltidega. Need nähakse läbi maapinna. Kui on laaditud mitu mängurežiimi, filtreerib **Režiim** matše režiimi järgi. Eesmärgid tulevad konverteri matšifailist salvestise kõrvalt või [`.3dheat`](container.md) konteinerist.

## Sildid ja statistika {#labels-and-statistics}

- **Sildid**: reeglid liigi kaupa (**Valitud**, **Õhusõidukid**, **Maismaa**, **Laevad**, **Relvad**, **TI**): näidatud või mitte, mis väärtused, ning **Prioriteet**, kes saab ruumi, kui sildid kattuvad. **Hoia silte lahus** viib sildi kõrvale oma üksuse juurde, kui see kataks teise, ja jätab selle välja, kui ruumi pole. **Siltide suurus** on 60 kuni 250%. **Tagasi nimele, sõidukile, kõrgusele ja kiirusele** lähtestab reeglid.
  - Maismaa üksused algavad nime, sõiduki ja kiirusega.
  - Õhusõidukid algavad nime, sõiduki, kõrguse ja kiirusega.
  - Laevad algavad nime, sõiduki, kiiruse ja kursiga.
  - Üksuse kohale hiirt viies näed kõiki selle väärtusi.
- **Statistika**: meeskonna ja üksuse kaupa: tapmised, surmad, lasud, tabamused, tabamuste suhe, õhkutõusud, maandumised, õhus oldud aeg, tippkiirus, kõrgus ja G, vahemaa. CSV-eksport.
- **Diagrammid**: ühe üksuse väärtused ajas, kahe üksuse võrdlus või üks väärtus teise vastu.

## Palju matše korraga {#many-matches-at-once}

Sadade või tuhandete matšide üksteise peale laotamiseks vaata [Palju matše korraga](many-matches.md). Kujude üksikasjad (suits, tulekahju, muud ajastatud efektid): [Kujud kujude ülekattes](figure-replay.md). Tacview funktsioonide loend: [Tacview tasemel](tacview-parity.md), selle lehe alamlehekülg.
