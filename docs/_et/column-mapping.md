---
title: "Veergude seostamine"
parent: "Andmete sisselugemine"
nav_order: 2
lang: "et"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Veergude vastendus

Fail on tabel ja 3DHeat peab teadma, milline veerg hoiab ida-lääne positsiooni, milline aega, milline mängija
nime ja nii edasi. See paneel ütleb, mida ta arvas, ja seal parandad vale oletuse.

![Veergude vastenduse paneel pärast Parquet-faili laadimist: kõik kastid juba täidetud - 1 X, 2 Y, 3 Z, 4 Aeg, 5 Isiku ID, 6 Seanss / matš, 7 Võistkond / rühm](../assets/img/en/column-mapping-panel.webp)

*Fail nimetas oma veerud ise, nii et iga kast on juba täidetud.*

Näiteks CSV päisega `x,y,z,t,player,team` seostab end ise: x, y ja z saavad positsiooniks, `t` ajaks, `player`
[isikuks](glossary.md) ja `team` [grupiks](glossary.md).

Pärast failide valimist avaneb paneel **Veergude vastendus** allikapaneeli all. See ütleb, milline veerg mängib
millist rolli. See täidetakse automaatselt ja iga välja saab enne **Laadi** vajutamist muuta; vastendus loetakse
laadimise ajal, nii et selle muutmine hiljem nõuab uut laadimist.

## Väljad {#the-fields}

Kõik veerumenüüd loetlevad kõik esimese faili veerud, plus *- puudub -*.

| Väli | Roll | Märkused |
|---|---|---|
| **Eraldaja** | Ainult CSV: väljade eraldaja. | Menüü: *Koma ,*, *Semikoolon ;*, *Tabulaator*, *Toru \|*, *Tühik*; või kirjuta mis tahes üks märk väljale *või kirjuta üks märk*. Tuvastatakse automaatselt (vt allpool). Muutmine käivitab automaatvastenduse uuesti, nii et varasemad muudatused lähevad kaotsi. |
| **X**, **Y**, **Z** | Positsioon. | Vaja on vähemalt kahte; vastendamata kolmas telg on 0 (andmed asuvad tasandil). Sama veerg kahel teljel on viga. |
| **Ülestelg allikas** | Milline allika telg osutab üles. | *Z on üles (enamik mängumootoreid)* või *Y on üles (graafikakonventsioon)*. Vaata [Teljed, ühikud ja aeg](axes-units-and-time.md). |
| **Ühikuskaala** | Korrutab iga positsiooni. | Nupud *1 (m)* ja *0.01 (cm→m)*, või kirjuta väärtus. |
| **Pööra X / Pööra Y / Pööra Z** | Eitab allika telge. | Rakendatakse positsioonidele ja vaatesuuna vektoritele. |
| **Aeg** | Ajatelg. | Valikuline. Ilma selleta ajajoont ei ole. |
| **Ajaühik** | Kuidas lugeda ajaveergu. | Seitse ühikut; vt [Teljed, ühikud ja aeg](axes-units-and-time.md#time). Parquet'i veergude `TIMESTAMP`/`DATE` puhul ignoreeritakse, paneel ütleb seda. |
| **Isiku ID** | Kellele või millele rida kuulub. | Valikuline. Teeb võimalikuks rajad, eluead, kastiesitamise ja joonesoojuse. |
| **Seanss / matš** | Milline matš, rüüs, voor, sõit või ring rida kuulub. | Valikuline. Positsioone ei interpoleerita, ei jäeta jälge ega ühendata marsruudiks üle seansi vahetuse. Vaata [Seansid, isikud ja grupid](sessions-persons-groups.md). |
| **Võistkond / rühm** | Mis tahes väikese arvu väärtustega veerg. | Valikuline. Juhib grupivärve, meeskonna soojust ja grupi järgi vahe jaotust. |
| **Vaatesuund** | *Puudub*, *Pöörde-/kaldenurga veerud* või *Suunavektori veerud*. | Pöördenurgaga: **Pöördenurk**, **Kaldenurk** ja **Nurgaühik** (*Kraadid* / *Radiaanid*). Vektoriga: **Suund X**, **Suund Y**, **Suund Z**. Kasutatakse [kastiesituse](box-replay.md) vaatekiirte jaoks. |
| **Säilita filtreerimiseks** | Mälus hoitavad lisaveerud. | Märkeruut igale veerule ja iga märgitud veeru puhul *vahemik* (arv) või *kategooria*. Iga maksab 4 baiti rea kohta ja ühe dekodeerimise läbi laadimisel. Ainult säilitatud veerge saab [filtreerida](filters.md), kasutada [vahe jaotuses](difference.md) või [joonesoojuse](line-heat.md) sündmuste veerguna. |
| **Näita näidisridu** | Esimese 12 proovitud rea tabel, kõik veerud. | Oletuste kontrollimiseks. |

Märgitud filtriveerg, mida ei ole eraldi määratud, loetakse *vahemikuks*; arvulise väljaga ID-veerg on sageli
kasulikum *kategooriana*. Korraga saab olla aktiivsed ainult 4 filtrit ([Filtrid](filters.md)).

## Kuidas automaatvastendus oletab {#how-the-auto-mapping-guesses}

Oletamine on failis [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). See vaatab
veergude nimesid, seda, millised veerud on proovitud ridades arvulised (üle 90% mitte-tühjadest väärtustest annavad
arvuna), seda, mitu erinevat väärtust iga veerg proovis võtab, ja Parquet'i loogilisi tüüpe. Nimemustreid proovitakse
järjekorras, suurtähti-väikeseid eristamata, ja esimene muster, mis sobib mõne veel vaba veeruga, võidab.

### Positsioon {#position}

| Telg | Nimemustrid järjekorras (ainult arvulised veerud) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Kui telg on veel tühi, täidavad seda järjekorras esimesed vabad arvulised veerud (ignoreerides `filename`, `level`, `year`,
`month`, `day`, `hour`, `location`). Vale oletus on ekraanil ilmne; tühi jätaks vaateala tühjaks.

### Aeg {#time}

- **Esmalt Parquet'i ajatempli veerud.** Veergude seast, mille loogiline tüüp on `TIMESTAMP` või `DATE`, valitakse parim
  skoori järgi: +10 000, kui nimi sobib ajamustriga, -5 000 tavalise `DATE` puhul, plus proovi erinevate väärtuste arv.
  Terve päeva kuupäev ja konstantne seansi algus saavad peaaegu ilma erinevate väärtusteta, seega võidab sündmuse hetk.
  Ühik on siis *Unixi ajatempel (ms)*.
- **Muidu nime järgi:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`,
  siis möödunud aja nimed (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`,
  `…minute from start…`, `…since start…`, `age`). Ühik oletatakse siis väärtustest: ISO-8601, kui väärtus näeb välja nagu
  `YYYY-MM-DDT…` või `YYYY-MM-DD …`; muidu suurima suurusjärgu järgi: üle 10^17 nanosekundi, üle 10^14 mikrosekundi, üle
  10^11 Unixi millisekundi, üle 10^8 Unixi sekundi, üle 10^6 millisekundi, muidu sekundid.

Kui valitakse möödunud aja veerg, märgib paneel, et iga seanss joondatakse siis oma algusega - hea matšide kattumiseks,
mitte nende nägemiseks päris järjestuses.

### Seanss, isik, grupp {#session-person-group}

Seanss hõivatakse **pärast** ajatelge ja **enne** isikut ja gruppi, sest seansiveerg on sageli ajatempel (matši algushetk
igal matši real).

| Roll | Nimemustrid järjekorras |
|---|---|
| Seanss | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (igaüks täpselt, valikuliselt koos `_id`-ga) |
| Isik | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, siis `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (võistlusandmed: liigub auto) |
| Grupp | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grupp, varu | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Grupi kandidaat, mis võtab enamikus proovitud ridades eraldiseisva väärtuse (rohkem kui max(48, 60% proovist)), on ID,
mitte grupp: see saab isiku veeruks, kui ühtegi ei leitud, ja gruppi ei kasutata. Kui gruppi veergu ei leitud üldse,
kasutatakse mitte-arvulist veergu, millel on kõige vähem erinevaid väärtusi vahemikus 2 kuni 12.

### Vaatesuund {#look-direction}

Arvuline veerg nimega `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` või `rot_z` / `rotation_z` lülitab vaatesuuna
pöörde-/kaldenurgale; kaldenurka otsitakse nimedega `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Kraade
eeldatakse, kui mõni proovitud pöördenurk ületab suuruselt 7, muidu radiaane. Suunavektorit ei oletata kunagi; see tuleb
allolevatest vihjetest või sinult.

### Filtriveerud {#filter-columns}

Automaatselt hoitakse kõige rohkem **6** veergu, järjestatult:

1. `region`, `sessionMode`, `actor` - veerud, mis on olemas selleks, et neid filtreerida (skoor 1200);
2. kategooriaveerud, mis proovis varieeruvad, vähem erinevate väärtustega enne (1000 miinus arv);
3. proovis konstantne veerg, aga ainult siis, kui laaditakse mitut faili - see võib failide vahel erineda, nagu piirkond
   või testikäigu ID (600);
4. arvulised veerud (500).

Veerge, mis juba mängivad rolli, ülalpool olevaid müranimesid, ühe faili laadimisel konstantseid veerge ja vabateksti
veerge (rohkem kui max(16, poole proovi) erinevat väärtust) ei pakuta automaatselt. Iga veeru võib siiski käsitsi märkida.

### Ülestelg {#up-axis}

Kui kõik kolm telge on seostatud, võetakse üleseks see telg, mille Y ja Z levik proovis on väiksem (kaart on palju laiem kui
kõrge); muidu eeldatakse Z-üles.

## `heat3d` vihjed Parquet'i jalus {#the-heat3d-hints-in-a-parquet-footer}

Parquet-fail võib öelda, kuidas teda tuleks lugeda. Kui faili jaluse võtme/väärtuse metaandmetes on kirje võtmega
**`heat3d`**, parsitakse selle väärtus JSON-ina ja kantakse oletuste peale ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)).
CS2 demo konverter kirjutab sellise kirje, nii et tema tabelid avanevad mängijaga isikuna, poolega grupina, iga voor seansina,
vaatesuund sisse lülitatud ja maailm õiges suunas.

Vihjete jaoks loetakse ainult valiku **esimest** faili. Iga kirje on valikuline ja iga vihjatud väärtus ilmub ikka paneelil ja
seda saab muuta. Täielik skeemi kirjeldus koos näite ja kirjutamisviisiga on [Andmevormingute viites](data-formats.md#the-heat3d-hints).

Reeglid lühidalt:

- Vihje nimetatud veergu rakendatakse ainult siis, kui failis on see veerg.
- `lookMode: "vector"` jõustub ainult siis, kui `dirX`, `dirY` ja `dirZ` on kõik seatud; `"yawPitch"` ainult siis, kui `yaw` on seatud.
- `extra`, kui see on olemas, asendab automaatse filtriloendi (tundmatud nimed ja juba rolli mängivad veerud jäetakse välja); iga
  ühe vahemiku/kategooria tüüp järgib seda, kas see paistis arvuline. Kui puudub, jääb automaatne loend alles, välja arvatud veerud,
  millele vihje andis rolli.
- `axes.up` peab olema `"y"` või `"z"`, pööramised peavad olema tõeväärtused, `scale` peab olema positiivne.
- `entity.size`, kui see on positiivne, on ühe jälgitava asja suurus faili ühikutes ([üksuse suurus](sessions-persons-groups.md#entity-size));
  ainult selle kaudu seda saab määrata.

## Teadaolev viga: CSV eraldaja ülekirjutamine {#known-issue-overriding-the-csv-separator}

Kui muudad eraldajat tuvastatust erinevaks, ei muutu veergude loend ega näidisread (eelvaade jaotab ikka tuvastatud eraldajaga).
Valitud eraldajat kasutatakse ikka laadimisel endal. Kui tuvastatud eraldaja on vale:

1. Ava fail tekstiredaktoris.
2. Asenda eraldaja kõikjal komaga (ja kümnendkomad punktidega).
3. Salvesta ja laadi fail uuesti.

Põhjus on failis [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
