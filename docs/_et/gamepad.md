---
title: "Mängupult ja HOTAS"
parent: "Kaamera ja juhtimine"
nav_order: 1
lang: "et"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Mängupult ja HOTAS

Kaamerat saab lennutada Xboxi-stiilis mängupuldiga klaviatuuri asemel. Kasuta seda, kui tahad nõjatuda tagasi ja vaadata suurt stseeni. Selle sisend **liidetakse** klaviatuuri sisendile, nii et saad mõlemaid korraga kasutada.

## Mängupuldi ühendamine {#connect-a-controller}

1. Ühenda pult (või siduda see).
2. Klõpsa vaatel ja vajuta pulti mis tahes nuppu. Brauserid näitavad pulti alles pärast esimest sisendit.
3. Ava **Kaamera ja stseen → Mängupult**. Seadmete loend näitab pulti märgiga `●`.
4. Lennutamiseks lükka vasakut juhtkangi, vaatamiseks paremat. Kui kaamera triivib, kui juhtkangid on keskel, tõsta **Surnud tsoon**.

Iga seade, mille brauser seostab standardse mängupuldi paigutusega, töötab. Lennujuhtkang või gaasihoob (HOTAS) jäetakse vaikimisi tähelepanuta; vt allpool.

## Seostamine {#mapping}

| Juhtelement | Mõju |
|---|---|
| Vasak juhtkang | Liikumine: ette ja taha ning külgsuunas |
| Parem juhtkang | Vaatamine: pööre ja kallutus kiirusega *Vaatamise kiirus* kraadi sekundis täisel kaldel |
| `RT` / `LT` (analoog) | Üles / alla; paralleelprojektsioonis suum sisse / välja |
| `RB` (all hoitud) | 6× kiiremini |
| `LB` (all hoitud) | 15% kiirusest |
| `A` (all hoitud) | 3× sprint (koos RB/LB-ga) |
| `Y` (vajutus) | Sobita andmed vaatesse |

Nuppude numbrid järgivad standardset paigutust: A 0, Y 3, LB 4, RB 5, LT 6, RT 7. Juhtkangid on teljel 0–1 (vasak) ja 2–3 (parem).

## Mängupuldi seaded {#the-gamepad-settings}

Jaotises **Kaamera ja stseen → Mängupult**. **Seaded** / **Peida** avab häälestusjuhtnupud.

| Juhtelement | Vaikimisi | Vahemik (hiireratta kaupa) | Tähendus |
|---|---|---|---|
| **Sees** | sees | | |
| Seadme olek | | | Iga ühendatud seade: `●`, kui jälgitakse, `○`, kui mitte. Mittestandardsete seadmete puhul on lisaks *— pole XInput pult, eiratakse* või *— pole XInput pult, kasutatakse siiski*. Kui pulti pole, kuvatakse: *Pulti ei tuvastatud. Brauserid näitavad pulti alles pärast seda, kui see saadab esimese sisendi – vajuta sellel nuppu.* |
| **Kasuta seadet** | *Ainult XInput-pultid (soovitatav)* | | Näidatakse, kui ühendatud on mittestandardne seade. Seadme nime järgi valides jälgitakse seda hoopis. |
| **Vaatamise kiirus** | 150°/s | 20–540 (5000) | Pööramise kiirus parema juhtkangi täisel kaldel. |
| **Surnud tsoon** | 12% | 0–50% (95%) | Radiaalne: diagonaalne liigutus ei lähe kunagi ainult ühte telge. Tõsta, kui kaamera triivib juhtkangide keskel olles. |
| **Juhtkangi kõver** | x² | lineaarne (1) kuni x⁴ (16) | Reaktsiooni eksponent pärast surnud tsooni: täpsem juhtimine keskme lähedal, rõhk ikka täisel kiirusel servas. |
| **Pööra juhtkangi Y ümber** | väljas | | |
| **Vaheta juhtkangid** | väljas | | Liigutus parema juhtkangiga, vaatamine vasakuga. |

Juhtkangi kuju: kui kaldenurk on *m* (juhtkangi vektori pikkus) ja surnud tsoon *d*, siis väljund on juhtkangi suunas ((m − d) / (1 − d)) ^ kõver ja surnud tsooni sees 0.

## Miks vaikimisi ainult standardsed pultid {#why-only-standard-pads-by-default}

Mängupuldi API näitab **kõiki** HID-seadmeid, millel on teljed: lennujuhtkangid, gaasihoovad, pedaalid, rattad. Need ei seisa keskel: keeravat telge või gaasihooba hoitakse täis kaldel, kui keegi seda ei puuduta. Juhtkangina loetuna on see püsiv täiskiirusel sisend, mida ükski surnud tsoon ei summuta. Kaamera pöörleks lehe avamisest peale ise (ja iga soojusrežiim näiks katki, sest liikuv kaamera alustab akumulatsiooni igal kaadril uuesti).

Seega jälgitakse seadet ainult siis, kui brauser teatab `mapping: "standard"`, see tähendab "XInput-stiilis pult, kus teljed on seal, kus oodatakse". Teisi seadmeid näidatakse loendis ja märgitakse ignoreerituks. **Kasuta seadet** lubab ühe neist selgesõnaliselt, näiteks lennutamiseks HOTAS-iga. Kui pult on jälgimisel, jääb kaamera selle juurde, nii et kaks pulti ei võitle kaamera pärast sõltuvalt loendamise järjekorrast.

**HOTAS:** loetakse ainult teljed 0–3 (kaks juhtkangi) ja standardsed nupud. Gaas või pedaalid teistel telgedel ei tee midagi, ning juhtkang või gaas, mille teljed ei seisa keskel, võib vajada suuremat **Surnud tsooni**.

Brauserid peidavad pulti, kuni see on saatnud esimese sisendi. Seega ühendatud pult, mida pole puudutatud, ei ole lehe jaoks veel olemas.
