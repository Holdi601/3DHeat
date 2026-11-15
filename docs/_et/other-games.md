---
title: "Muud võidusõidumängud"
parent: "Sõiduanalüüs"
nav_order: 59
lang: "et"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Muud võidusõidumängud vaatajas

Vaataja loeb ringe paljudest võidusõidumängudest, mitte ainult ühest. See leht loetleb need ja ütleb, kuidas igast mängust ring välja saada.

## Mängud {#the-games}

| Mäng | Salvestaja | Libisemine failis? | Maailm peegelpildis? | Märkused |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out UDP kaudu) või FH Companioni ringifailid ja nende `.tele.gz` | jah, igal rattal (normaliseeritud) | jah (vasakukäeline maailm) | iga FH Companioni ringifaili kõrval olev `.tele.gz` annab iga ratta libisemise; ringifail üksi seda ei anna |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (jagatud mälu) | jah, igal rattal | mõõdetakse ringidest | lisaks ABS ja traktsioonikontrolli töö, rataste koormused, temperatuurid |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | ei, arvutatakse rataste kiirustest | mõõdetakse ringidest | ralli: lahtine pinnas ja hüpped hinnatakse teisiti |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | ei | mõõdetakse ringidest | rataste kiirusi ei ole |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (mod) | ei, arvutatakse rataste kiirustest | mõõdetakse ringidest | |
| Trackmania | Openplanet'i plugin, `telemetry --game trackmania --install` | iga ratta libisemistegur | mõõdetakse ringidest | arkaadfüüsika: libisemisi hinnatakse teisiti |
| iRacing | puudub: oma `.ibt` fail | ei (ei logita); arvutatakse pöördemomendist (yaw) | ei (GPS-põhine) | logimine sisse autos klahviga Alt+L |

## Kuidas ringi salvestada {#how-to-record-a-lap}

1. Vali oma mäng tabelist ja seadista see nii, nagu salvestaja selle mängu lehel ütleb (seade mängus, mod või iRacingi puhul mitte midagi). Sammud on mängude kaupa erinevad, seetõttu on need salvestajate dokumentides: [GameCapture: mängud](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Käivita salvestaja ja sõida. See kirjutab iga ringi kohta ühe faili.
3. Vahelehel **Sõiduanalüüs** vajuta **Laadi ringifailid…** ja vali kaks või enam sama raja ringi (vt [Ringide laadimine](race-loading-laps.md)).

Ralli-mängudes annab salvestaja ühe faili iga etapisõidu kohta. Forza puhul on kõige lihtsam alustada FH Companioni raamatukogust, mille `.tele.gz` failid asuvad ringifailide kõrval.

## Mida salvestajad dokumenteerivad {#what-the-recorders-document}

Iga mängu salvestamise viisi, saadetavat infot, layoutide allikaid ja seda, millised rajad saab mängu failidest eksportida, dokumenteerivad salvestajad: [GameCapture: mängud](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (avalik, repos [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Iga salvestaja kirjutatava ringifaili kirjeldus on lehel [GameCapture: ringi formaat](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Mida vaataja nendega teeb {#what-the-viewer-does-with-them}

Iga mäng jõuab lõpuks `heat3d-lap` failideks (või ringi CSV-ks, või loetakse otse, nagu iRacingi `.ibt`), mille kanalite nimed on kanoonilised, kujul nagu `src/race/schema.ts` neid määrab, ja `meta` plokiga, mis ütleb, mida nende arvud tähendavad: kuidas libisemine on skaleeritud, kas ring, ralli või arkaad, ja pind, kui see on teada. Nii käsitleb vahekaart **Sõiduanalüüs** neid kõiki ühtemoodi. Kui raja mudelit ei ole laaditud, joonistab vahekaart **Sõiduanalüüs** tee ringide enda hajuvuse järgi, nii et iga mäng on kasutatav ka ilma mudelita.

Rehvi libisemise, mida ükski ralli-mäng ei saada, arvutab vaataja ise. Kui mäng saadab rataste kontaktplaadi või pinnakiiruse, siis võrreldakse seda auto kiirusega (`(wheel - car) / car`). Kui mäng saadab ainult pöörlemise, siis arvutatakse see pöörlemisest ja veerevast raadiusest, mis on mõõdetud ringil endal. Triivinurk tuleb auto enda kiirusvektorist (Forza, AC mängud, Trackmania, RBR), maailma kiirusvektorist, mis on projitseeritud auto telgedele (EA WRC, DiRT, BeamNG), või suunast võrreldes rajaga. Kas auto on õhus, selgub rataste kontaktist, koormustest või vedrustusest. Vt `src/race/derive.ts`.

Kui mängu maailm on vasakukäeline (Forza oma on), tuleb rada vaatajas peegelpildina. Ringide enda rooli ja vedrustus annavad selle ära ning vahekaart **Sõiduanalüüs** pakub telje pööramist. Mänge, mille käelisust ei ole dokumenteeritud (RBR, BeamNG, Trackmania), käsitletakse samamoodi: see mõõdetakse, mitte ei eeldata.

Sõidukanalitest kaugemale säilitavad salvestajad selle, mida iga mäng lisab: AC mängude ABS ja traktsioonikontrolli töö, pidurijaotuse, DRS-i, boksi piiraja, turbo ja piduriklotside ning ketaste eluea; iRacingi abiseaded, pidurijaotuse, kütuse, õli ja vee temperatuurid ning kõik muud kanalid, mida see logib oma nime all. Vaataja joonistab need oma kanalitabelist (lambid, tasemed, sümbolid, graafikud), nii et rohkema salvestamine ei nõua vaataja muutmist.
