---
title: "Dálkatengingar"
parent: "Hvernig gögn eru sett inn"
nav_order: 2
lang: "is"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Dálkatenging

Skrá er tafla, og 3DHeat þarf að vita hvaða dálkur geymir staðsetningu austur-vestur, hvaða dálkur geymir tímann, hvaða dálkur geymir nafn leikmannsins og svo framvegis. Þetta spjald segir hvað það giskaði á, og þar lagar þú vitlausa ágiskun.

![Dálkatenging-spjaldið eftir að Parquet-skrá var hlaðin: hver reitur þegar fylltur - 1 X, 2 Y, 3 Z, 4 Tími, 5 Persónuauðkenni, 6 Seta / leikur, 7 Lið / hópur](../assets/img/en/column-mapping-panel.webp)

*Skráin gaf sína eigin dálka, svo hver reitur er þegar fylltur.*

Til dæmis tengir CSV-skrá með hausnum `x,y,z,t,player,team` sig sjálf: x, y og z verða staðsetningin, `t` tíminn, `player` [persónan](glossary.md) og `team` [hópurinn](glossary.md).

Eftir að skrár eru valdar opnast spjaldið **Dálkatenging** undir Uppruna-spjaldinu. Það segir hvaða dálkur gegnir hvaða hlutverki. Það er fyllt út sjálfkrafa og hvern reit má breyta áður en ýtt er á **Hlaða**; tengingin er lesin við hleðslu, svo ef þú breytir henni síðar þarftu að hlaða aftur.

## Reitirnir {#the-fields}

Allir dálkavalmyndir telja upp alla dálka fyrstu skrárinnar, auk *- enginn -*.

| Reitur | Hlutverk | Athugasemdir |
|---|---|---|
| **Aðgreinir** | Aðeins CSV: reitaskilin. | Valmynd: *Komma ,*, *Semíkomma ;*, *Tab*, *Pípa \|*, *Bil*; eða skrifaðu hvaða eina stafi sem er í *eða skrifaðu einn staf*. Greinist sjálfkrafa (sjá hér fyrir neðan). Breyting endurkeyrir sjálfvirku tenginguna, svo breytingar sem þú gerðir áður tapast. |
| **X**, **Y**, **Z** | Staðsetning. | Að minnsta kosti tveir þarf; ótengdur þriðji ás er 0 (gögnin liggja á fleti). Sami dálkur á tveimur ásum er villa. |
| **Upp-ás í uppruna** | Hvaða ás uppruna vísar upp. | *Z er upp (flestar leikjavélar)* eða *Y er upp (grafískt viðmið)*. Sjá [Ásar, einingar og tími](axes-units-and-time.md). |
| **Einingakvarði** | Margfaldar hverja staðsetningu. | Hnappar *1 (m)* og *0.01 (cm→m)*, eða skrifaðu gildi. |
| **Snúa X / Snúa Y / Snúa Z** | Snýr við ási uppruna. | Beitt á staðsetningar og horfstefnuvigra. |
| **Tími** | Tímaásinn. | Valfrjálst. Án hans er engin tímalína. |
| **Tímaeining** | Hvernig tímadálkurinn er lesinn. | Sjö einingar; sjá [Ásar, einingar og tími](axes-units-and-time.md#time). Hunsuð fyrir Parquet `TIMESTAMP`/`DATE`-dálka, sem spjaldið segir frá. |
| **Persónuauðkenni** | Hver eða hvað röð tilheyrir. | Valfrjálst. Gerir spor, líftíma, kassaendurspilun og línuhita mögulega. |
| **Seta / leikur** | Hvaða leik, árás, umferð, keyrslu eða hring röð tilheyrir. | Valfrjálst. Staðsetningar eru aldrei innreiknaðar, raktar eða tengdar í leið yfir skil lotu. Sjá [Lotur, persónur og hópar](sessions-persons-groups.md). |
| **Lið / hópur** | Hvaða dálkur sem er með fáum gildum. | Valfrjálst. Stýrir litum hópa, liðahita og mismunarskiptingunni eftir hópum. |
| **Horfstefna** | *Enginn*, *Stefnuhorn / hallahorn-dálkar* eða *Stefnuvigradálkar*. | Með stefnuhorni/hallahorni: **Stefnuhorn**, **Hallahorn** og **Hornaeining** (*Gráður* / *Radíanur*). Með vigri: **Stefna X**, **Stefna Y**, **Stefna Z**. Notað fyrir horfsgeisla [kassaendurspilunar](box-replay.md). |
| **Halda fyrir síun** | Aukadálkar geymdir í minni. | Gátreitur fyrir hvern dálk, og fyrir hvern merktan *bil* (tölu) eða *flokk*. Hver kostar 4 bæti á röð og eina afkóðunarumferð við hleðslu. Aðeins geymdir dálkar geta verið [síaðir](filters.md), notaðir fyrir [mismunarskiptingu](difference.md) eða sem atburðadálkur í [línuhita](line-heat.md). |
| **Sýna sýnisraðir** | Tafla með fyrstu 12 sýnisröðunum, allir dálkar. | Til að athuga ágiskanirnar. |

Merktur síudálkur sem er ekki stilltur sérstaklega er lesinn sem *bil*; auðkennisdálkur sem lítur út eins og tala er oft gagnlegri sem *flokkur*. Aðeins 4 síur geta verið virkar í einu ([Síur](filters.md)).

## Hvernig sjálfvirka tengingin giskar {#how-the-auto-mapping-guesses}

Ágiskanirnar eru í [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Hún skoðar heiti dálka, hvaða dálkar eru tölur í sýnisröðunum (meira en 90% af gildum sem ekki eru tóm lesast sem tölur), hversu mörg ólík gildi hver dálkur tekur í sýninu, og rökræna gerð Parquet. Nafnamynstur eru reynd í röð, óháð há- og lágstöfum, og fyrsta mynstrið sem passar við einhvern enn laus dálk vinnur.

### Staðsetning {#position}

| Ás | Nafnamynstur, í röð (aðeins tölu-dálkar) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Ef ás er enn tómur fyllast hann í röð af fyrstu lausu tölu-dálkunum (án `filename`, `level`, `year`, `month`, `day`, `hour`, `location`). Röng ágiskun sést strax á skjánum; tómur ás myndi skilja gluggann eftir tóman.

### Tími {#time}

- **Fyrst Parquet-tímastimpladálkar.** Meðal dálka sem eru af rökrænni gerð `TIMESTAMP` eða `DATE` er sá besti valinn eftir stigum: +10.000 ef heitið passar við tímamynstur, -5.000 fyrir venjulegan `DATE`, auk fjölda ólíkra gilda í sýninu. Heildags-dagsetning og fastur upphaf lotu hafa næstum engin ólík gildi, svo augnablik atburðarins vinnur. Einingin er þá *Unix-tímastimpill (ms)*.
- **Annars eftir nafni:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, og síðan nöfn á liðnum tíma (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Einingin er síðan giskuð út frá gildunum: ISO-8601 þegar gildi líkist `YYYY-MM-DDT…` eða `YYYY-MM-DD …`; annars eftir stærstu stærðargráðu: yfir 10^17 nanósekúndur, yfir 10^14 míkrósekúndur, yfir 10^11 Unix-millisekúndur, yfir 10^8 Unix-sekúndur, yfir 10^6 millisekúndur, annars sekúndur.

Þegar dálkur liðins tíma er valinn tekur spjaldið fram að sérhver lota er þá jöfnuð við sinn eigin upphaf - gott til að leggja leiki yfir hvorn annan, ekki til að sjá þá í raunverulegri röð.

### Lota, persóna, hópur {#session-person-group}

Lotan er tekin **eftir** tímaásinn og **áður** en persóna og hópur eru valin, því lotudálkur er oft tímastimpill (upphafsaugnablik leiksins á hverri röð leiksins).

| Hlutverk | Nafnamynstur, í röð |
|---|---|
| Lota | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (hvert nákvæmlega, valfrjálst með `_id`) |
| Persóna | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, síðan `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (kappakstursgögn: bíllinn er það sem hreyfist) |
| Hópur | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Hópur, varaval | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Hópframbjóðandi sem tekur ólíkt gildi í flestum sýndum röðum (fleiri en max(48, 60% af sýninu)) er auðkenni, ekki hópur: hann verður persónudálkurinn ef enginn fannst, og er ekki notaður sem hópur. Ef enginn hópdálkur fannst yfirhöfuð er notaður textadálkurinn með fæstum ólíkum gildum á bilinu 2 til 12.

### Horfstefna {#look-direction}

Tölu-dálkur sem heitir `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` eða `rot_z` / `rotation_z` skiptir horfstefnunni yfir í stefnuhorn/hallahorn; hallahorn er leitað sem `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Gráður eru settar ef eitthvert sýnt stefnuhorn er yfir 7 að stærð, annars radíanur. Stefnuvigur er aldrei giskaður; hann kemur úr vísbendingunum hér fyrir neðan eða frá þér.

### Síudálkar {#filter-columns}

Mest **6** dálkar eru geymdir sjálfkrafa, raðaðir:

1. `region`, `sessionMode`, `actor` - dálkar sem eru til þess að sía eftir (stig 1200);
2. flokksdálkar sem breytast í sýninu, þeir með færri ólík gildi fyrst (1000 mínus fjöldinn);
3. dálkur sem er fastur í sýninu, en aðeins þegar margar skrár eru hlaðnar - hann getur verið ólíkur milli skráa, eins og svæði eða auðkenni prófunarkeyrslu (600);
4. tölu-dálkar (500).

Dálkar sem þegar gegna hlutverki, hávaðaheitin hér fyrir ofan, dálkar sem eru fastir í hleðslu einnar skráar, og frjálsir textadálkar (fleiri en max(16, helmingur sýnisins) ólík gildi) er ekki boðið sjálfkrafa. Hvaða dálk sem er er samt hægt að haka í með hendi.

### Upp-ás {#up-axis}

Þegar allir þrír ásar eru tengdir er ásinn með minni dreifingu Y og Z í sýninu tekinn sem upp (kort er miklu breiðara en hátt); annars er gert ráð fyrir Z upp.

## `heat3d`-vísbendingarnar í Parquet-endi {#the-heat3d-hints-in-a-parquet-footer}

Parquet-skrá getur sagt hvernig hana á að lesa. Ef lykil/gildi-lýsigögn skráarendans hafa færslu með lyklinum **`heat3d`**, er gildi hennar lesið sem JSON og lagt yfir ágiskanirnar ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Breytandi CS2-demóa skrifar slíka færslu, svo töflur hans opnast með leikmanninn sem persónu, hliðina sem hóp, hverja umferð sem lotu, horfstefnu á og heiminn rétt snúinn.

Aðeins **fyrsta** skrá valsins er lesin fyrir vísbendingar. Sérhver færsla er valfrjáls, og sérhvert vísbendingagildi birtist samt í spjaldinu og má breyta. Full lýsing á skemunni, með dæmi og hvernig á að skrifa hana, er í [Yfirliti yfir gagnasnið](data-formats.md#the-heat3d-hints).

Reglurnar í stuttu máli:

- Dálkur sem vísbending nefnir er aðeins notaður þegar skráin hefur þann dálk.
- `lookMode: "vector"` tekur gildi aðeins þegar `dirX`, `dirY` og `dirZ` eru öll stillt; `"yawPitch"` aðeins þegar `yaw` er stillt.
- `extra`, þegar það er til staðar, kemur í stað sjálfvirka síulistans (óþekkt heiti og dálkar sem þegar gegna hlutverki eru felldir út); gerð hvers (bil/flokkur) fylgir því hvort hann leit út eins og tala. Þegar það vantar er sjálfvirki listinn geymdur, án dálka sem vísbending gaf hlutverk.
- `axes.up` verður að vera `"y"` eða `"z"`, snúningar verða að vera sannar/ósannar gildi, `scale` verður að vera jákvæður.
- `entity.size`, þegar það er jákvætt, er stærð eins rakins hlutar í einingum skráarinnar ([stærð einingar](sessions-persons-groups.md#entity-size)); það er eina leiðin til að stilla hana.

## Þekkt vandamál: að yfirskrifa CSV-aðgreinina {#known-issue-overriding-the-csv-separator}

Þegar þú breytir aðgreininni í aðra en þá sem greindist breytast dálkalistinn og sýnisraðirnar ekki (forskoðunin skiptir enn með greindu aðgreininni). Valda aðgreinin er samt notuð við hleðsluna sjálfa. Ef greinda aðgreinin er röng:

1. Opnaðu skrána í textaritli.
2. Skiptu aðgreininni út fyrir komma alls staðar (og aukastafakommum fyrir punkta).
3. Vistaðu, og hlaððu skránni aftur.

Orsökin er í [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
