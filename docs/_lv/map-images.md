---
title: "Karšu attēli"
parent: "Līmeņi un fona ģeometrija"
nav_order: 1
lang: "lv"
source: "map-images.md"
source_hash: "f0bbaa4b019e"
translated: true
outdated: false
---

# Karšu attēli

Kartes attēls ir plakana bilde — mini karte, satelīta foto, plāns —, kas novietota zem taviem datiem, lai redzētu, kur atrodas siltums. Tu pasaki skatītājam, kur attēlam jābūt, piespraužot divus punktus uz tā pie divām vietām pasaulē (“enkuriem”).

## Ielādē un novieto kartes attēlu {#load-and-place-a-map-image}

1. Vispirms ielādē datus ([Datu ievade](getting-data-in.md)).
2. Sadaļā **Fons / līmenis** nospied **Kartes attēls…** un izvēlies attēlu. Tas tiek izstiepts pāri datu laukumam.
3. Nospied **Pielāgot datu robežām**, ja attēls ir pārvietots. Enkurs 1 nonāk attēla augšējā kreisajā stūrī, enkurs 2 — apakšējā labajā stūrī, datu malās.
4. Ja siltums nesakrīt ar attēlu, izvēlies divus orientierus, kas atrodas tālu viens no otra (piemēram, divus pretējus ēkas stūrus vai divus krustojumus). Nolasi katra pikseli attēlā un tā pasaules pozīciju (virs [lineāla](measure.md) uzvelc, lai nolasītu **X** un **Z**).
5. Ieraksti tos sadaļā **Novietojums**: enkuram 1 orientiera **px**, **py**, **pasaules X**, **pasaules Z**; tāpat enkuram 2.
6. Pārbaudi: trajektorijai vai karstai vietai, par kuru zini, ka tā atrodas uz ceļa, tagad vajadzētu atrasties uz tā ceļa. Pielāgo skaitļus, līdz tā ir.

![Sadaļa Novietojums ar diviem enkuriem un siltumu, zīmētu uz kartes attēla](../assets/img/en/map-images-placement.webp)

Abiem orientieriem jāatšķiras gan pikseļu kolonnās, gan pikseļu rindās, citādi panelis saka *Abi enkuri dala vienu pikseļu rindu vai kolonnu*.

## Ielāde {#loading}

Jebkurš attēla formāts, ko pārlūks var nolasīt. Attēls, kura garākā mala ir virs **8192 px**, tiek samazināts līdz 8192 (lielākā mala, ko GPU lūdz turēt), un panelis saka *Samazināts no W×H uz w×h*.

Ielādējot, attēls tiek izstiepts pāri datu kopas X-Z robežām (vai ±1000 vienībām bez datu kopas), ziemeļi uz augšu, datu kopas zemākajā Y. Noklusējumi ir **Necaurredzamība** 100%, **Spilgtums** 0,7, **Atkrāsot** 100%, **Apmainīt ziemeļus/dienvidus** ieslēgts: atkrāsots un pieblāvināts, jo fona uzdevums ir ļaut tev atrast karsto vietu, nevis konkurēt ar to.

## Vadības {#controls}

| Vadība | Noklusējums | Diapazons | Nozīme |
|---|---|---|---|
| **Necaurredzamība** | 100% | 0–100% | |
| **Spilgtums** | 0,7 | 0–2 (kustināšana 64) | |
| **Atkrāsot** | 100% | 0–100% | Pelēks fons, piesātināts siltums. Krāsa kartē konkurē ar krāsu datos. |
| **Apmainīt ziemeļus/dienvidus** | ieslēgts | | Kura attēla rinda ir pasaules maksimālais Z. To pārslēdzot ar ielādētu datu kopu, enkuri tiek arī no jauna pielāgoti datu robežām. |
| **Novietojums**: Enkurs 1, Enkurs 2 | attēla stūri uz datu robežām | | Katrs enkurs ir pikselis attēlā — **px** (no kreisās, 0 līdz platumam) un **py** (no augšas, 0 līdz augstumam) — un pasaules koordināta, kurā tas atrodas, **pasaules X** un **pasaules Z**. Mērogs un nobīde izriet no pāra. |
| **Pielāgot datu robežām** | | | Novieto enkuru 1 attēla augšējā kreisajā stūrī un enkuru 2 apakšējā labajā, datu X-Z robežās. Sākumpunkts precīzam novietojumam. Prasa datu kopu. |
| **Augstums** | datu kopas zemākais Y | datu min Y − 500 līdz max Y + 500 (kustināšana max Y + 100 000) | Kartes plaknes augstums. Novieto to tieši zem datiem, lai nekas netiktu ar to paslēpts. |

Nosaukuma rindā rāda `platums×augstums px · x × z m/px` — pasaules izmērs vienam pikselim katrā asī.

## Ainā {#in-the-scene}

Attēls ir viens tekstūrēts četrstūris augstumā. Pilnā necaurredzamībā tas ieraksta dziļumu, tāpēc piedalās [aizsegšanā](depth-and-culling.md) kā zeme. Zem 100% necaurredzamības tas tiek sajaukts un neieraksta dziļumu, tāpēc nekā neaizsedz. [Lineāls](measure.md) mēra uz tā plaknes. [Līmeņu bibliotēka](level-library.md) saglabā attēla līmeni kopā ar tā enkuriem.

## Dota 2 karte {#dota-2-map}

Poga **Dota 2 karte** blakus **Kartes attēls…** ielādē pašreizējās Dota 2 kartes zīmējumu, ko [OpenDota](https://www.opendota.com) rāda savās mača lapās, un novieto to zem tabulām, ko [Watcher](https://github.com/Holdi601/3DHeat-Watcher) raksta no Dota 2 atkārtojumiem ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Attēls tiek ielādēts no opendota.com, kad nospied pogu, un nav daļa no 3DHeat. Jaunākās versijas zīmējums tiek ņemts no OpenDota pašu saraksta, bet 7.40 zīmējums — kad sarakstu nevar nolasīt.

| | |
|---|---|
| Avots | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Novietojums | OpenDota kalibrācija: attēls aptver Dota pasaules vienības no −8192 līdz 8064 abās asīs (128 vienību šūnas no 64 līdz 191), ziemeļi augšā. Ar atkārtojuma tabulas asīm (Z augšup, Y apgriezts) tas ir pasaules X no −8192 līdz 8064 un pasaules Z no −8064 līdz 8192. Apmēram 18 vienības vienā pikselī. |
| Augstums | 0. Varoņi stāv no 0 līdz aptuveni 600. |
| Izskats | Spilgtums 0,8, atkrāsot 50%. |

Pārbaudīts uz publiska mača atkārtojuma 7.40 versijā: katra varoņa trajektorija seko zīmētajām joslām, un torņi, kazarmas un senie, ko atkārtojums novieto, nokrīt uz zīmētajām bāzēm. Skats **Augša** rāda karti ar ziemeļiem ekrāna apakšā, kā tas rāda jebkuru Z-augšup tabulu ar apgrieztu Y.

Zīmējums ir OpenDota, Valve karte; Valve neatbalsta 3DHeat.

### 3D karte {#the-3d-map}

Ja Dota 2 ir instalēta, atsevišķais rīks [3DHeat Dota](https://holdi601.github.io/3DHeat-Ext-Dota/) (`heat3d-dota-maps level -o dota.glb`; to palaiž arī Watcher komanda [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html)) no pašas spēles failiem izveido karti 3D: zemi, klintis, ūdeni, kokus un ēkas, atkārtojumu tabulu vienībās un asīs. Ielādē failu vienreiz ar **3D modelis…**: skatītājs to atpazīst pēc daļām (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` failā `dotaMap.ts`), uzreiz ieliek [līmeņu bibliotēkā](level-library.md), aizstājot vecāku, un par to paziņo. No tā brīža **Dota 2 karte** ielādē šo 3D karti no bibliotēkas, nevis lejupielādē zīmējumu; ja bibliotēkā tādas nav, tā lejupielādē zīmējumu un pasaka, kā izveidot 3D karti. Fails nāk no tavas pašas instalācijas un paliek tavā datorā.

## Izstrādātājiem {#for-developers}

### Kā enkuri novieto attēlu {#how-the-anchors-place-the-image}

No [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), ar enkuriem *a* un *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Divi enkuri nosaka gan mērogu, gan nobīdi katrā asī neatkarīgi, tāpēc karti var izstiept atšķirīgi pa X un Z, bet nevar pagriezt. Enkuriem jāatšķiras **abās** pikseļu koordinātēs. Kad tie dala rindu vai kolonnu, nevar iegūt nevienu mērogu, karte netiek zīmēta, un panelis saka *Abi enkuri dala vienu pikseļu rindu vai kolonnu*.
