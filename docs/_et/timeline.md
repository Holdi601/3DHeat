---
title: "Ajajoon ja taasesitus"
nav_order: 5
lang: "et"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Ajajoon ja taasesitus

Riba pildi all on nagu videomängija: andmeid saab esitada filmina, peatada, kerida ja muuta kiirust.

![Ajajoone riba: 1 Kõik/Esita, 2 juhtnupud, 3 kell, 4 Kiirus, 5 Ajalugu, aken ja 30 s vahemik](../assets/img/en/timeline-bar.webp)

Riba vaate all on ajajoon ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Ta otsustab, millised read on igal hetkel nähtavad. Ta vajab ajaveergu; ilma selleta on kogu riba keelatud, vaade jääb režiimi **Kõik** ja külgriba ütleb: *Neis andmetes pole ajaveergu - ajajoon on välja lülitatud ja kõik andmepunktid kuvatakse korraga.*

## Kõik ja Esita {#all-and-play}

Kaks ülemise taseme režiimi, sest need vastavad erinevatele küsimustele.

- **Kõik** (vaikimisi iga laadimise järel) ignoreerib mängupead täielikult ja näitab iga rida, mis läbib filtrid. See on vaade "kus see juhtub", ja see ei ole sama mis kerimine lõppu. Kerimisriba on keelatud ja kell näitab `kõik · <span> andmetest`.
- **Esita** käivitab andmed ajavahemikuna. Ilmuvad kerimisriba, juhtnupud ja ajaloo seaded.

Režiimi **Kõik** valimine peatab ka esituse.

## Juhtnupud {#the-controls}

| Juhtnupp | Vaikimisi | Tähendus |
|---|---|---|
| Kerimisriba | algus | Mängupea. Lohista, et liikuda; 20 000 sammu üle vahemiku. |
| **Kõik** / **Esita** | Kõik | Vt ülal. |
| ▶ / ❚❚ | peatatud | Esita või peata; ka `K`. |
| ◀ **Esita tagurpidi (J)** | | Mängib andmed vastupidi. Näidatakse ainult režiimis **Kujude ülekate**; sama klahv `J` töötab seal ka (vt [Klaviatuur](#keyboard)). |
| ⏮ | | Tagasi vahemiku algusesse. |
| Kell | | `möödunud / kokku` kujul `mm:ss.s` (või `h:mm:ss`) ja - kui ajaveerg on absoluutne ajatempel - mängupea kellaaeg kujul `HH:MM:SSZ` (UTC). |
| **Kiirus** | 1× | Andmete sekundeid reaalse sekundi kohta. Menüüs on 17 astet 0,01×-st 1800×-ni (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), ning **Kohandatud…**: kirjuta mis tahes kiirus 0,001×-st 3600×-ni (näiteks 0,3 või 12) ja vajuta Enter; Esc jätab praeguse kiiruse. Viimane kiirus jääb järgmiseks külastuseks meelde (vt [Salvestatud seaded](ref-settings-storage.md)). |
| **Ajalugu** | Kumulatiivne | Mis loetakse mängupea juures nähtavaks: *Kumulatiivne*, *Aken* või *Eluiga* (allpool). |
| **Vahemik** (Aken; Joonte režiimis ka Eluiga) | 30 s | Mängupeas lõppeva akna pikkus; vähemalt 0,01 s. [Joonsoojuses](line-heat.md#playback) on see saba pikkus. |
| **Varueluiga** (ainult Eluiga, mitte Joonte režiimis) | 10 s | Kui kaua andmepunkt, millel pole oma isiku järgmist proovi, jääb nähtavaks. |
| **Hääbumine** (ainult Eluiga, mitte Joonte režiimis) | 0,4 | Osa iga andmepunkti elust, mis kulub hääbumiseks, 0-1. |
| **Kordus** | sees | Lõpus alustab uuesti; väljas peatub lõpus. |
| Parem pool | | Andmestiku nimi. |

**Vahemik** on andmestiku ajaulatus - või, [kujude ülekatteaknas](box-replay.md) kui on valitud seanss, selle seansi ulatus.

## Ajalugu {#history}

Režiimis Esita:

- **Kumulatiivne** - kõik alates vahemiku algusest kuni mängupeani. Soojus kogub esituse käigus.
- **Aken** - kindel ajaloo ulatus, mis lõpeb mängupeas (*Vahemik*).
- **Eluiga** - iga andmepunkt elab kuni **sama isiku järgmise proovini** (samas seansis), nii et igal hetkel on iga isiku kohta täpselt üks asukoht kehtiv. Andmepunkt, mille isik enam ei ilmu - surm, katkestus, logi lõpp - ei oma järgmist proovi ning elab *Varueluigani*, selle asemel et kohe kaduda või igavesti püsida. Andmepunktid **hääbuvad** viimase *Hääbumise* osa jooksul oma elust, mitte ei kao järsku: kui iga isiku kohta on elus üks proov, muudab andmepunkti kadumine ühest kaadrist järgmisesse kogu välja vilkuvaks prooviperioodi kiirusel. *Hääbumine* 0 taastab järsu lõike.

Eluiga vajab nii isikuveergu kui ajaveergu; ilma isikuveerguta laaditakse ajalugu vaikimisi Kumulatiivne. [Joonsoojuses](line-heat.md#playback) määrab ajalugu, kui kaua marsruudi saba nähtav on; [kujude ülekatteaknas](box-replay.md) on *Varueluiga* aeg, kui kaua isikut hoitakse, kui tal pole enam proove.

## Esituse käitumine {#playback-behaviour}

Kaadriahelast ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- Mängupea liigub *kaadriaeg × kiirus* võrra. Kaadriaega piiratakse 0,1 s-ga, nii et vahekaartide vahetamine ei hüppa mängupead.
- Esitamise vajutamine vahemiku lõpus alustab algusest, nagu meediamängija. Iga laadimise järel pannakse mängupea algusesse, nii et esimene esitamise vajutus mängib.
- Vahemiku lõpus hüppab mängupea tagasi algusse (Kordus sees) või peatub seal ja esitus lõpeb (Kordus väljas).
- Kerimisriba loeb mootori mängupead otse igal kaadril; rakenduse olek uueneb kerimistel, alustamistel, peatamistel ja kordustel.
- Seansi valija seansi valimine kerib selle seansi algusesse.

## Miks esitus on sujuv ja odav {#why-playback-is-smooth-and-cheap}

Read on salvestatud aja järgi sorditult, nii et ajaaken on kaks binaarotsingut ajaveerus: mängupea liigutamine liigutab kahte täisarvu ja ei puuduta ühtegi rida, ning esituse maksumus järgib akna ridade arvu, mitte andmestiku suurust.

Kuidas soojus aken liikumisel stabiilseks jääb, sõltub ajaloost ([Akumulatsioon](accumulation.md)):

- **Kumulatiivne** ainult kasvab, nii et iga kaader lisab ainult need read, mis on pärast eelmist nähtavaks saanud, täiskaalus. Väli ehitub monotoonselt ja peatamine ei muuda midagi, sest pole enam midagi saabuda. (Uuesti hindamine muudaks iga kaadri heledaks erineva juhusliku alamhulga ja hääbutaks seejärel selle, mis näeb välja nagu purskeid, mis plahvatavad ja kaovad.)
- **Aken** ja **Eluiga** muutuvad iga kaadriga tõeliselt ja hinnatakse need uuesti, segatuna eksponentsiaalse libiseva keskmisena (kaalu 0,34 uuele kaadrile), mis on stabiilses olekus erapooletu ja palju vaiksem kui otsast alustamine.
- Eluiga režiimis on kandidaatridad need, mille aeg on *mängupea - max(andmete pikim vahe, Varueluiga)* kuni mängupeani; varjutaja jätab seejärel välja iga rea, mille oma elu on lõppenud, ja rakendab hääbumise.

Režiimide Kõik ja Esita vahetamine või ajaloo muutmine alustab akumulatsiooni uuesti.

## Klaviatuur {#keyboard}

| Klahv | Mõju |
|---|---|
| `K` | Esita / peata |
| `J` | Esita tagurpidi; uuesti vajutades peatub (ainult Kujude ülekate) |
| `L` | Esita edasi; uuesti vajutades peatub (ainult Kujude ülekate) |

`J` ja `L` lülitavad ajajoone ka režiimile **Esita**. Klahvid ei tööta, kui tekstikast või menüü on fookuses. Sõiduanalüüsi vahekaardil juhib `K` hoopis selle vahekaardi oma kordust.
