---
title: "Kolonnenzouweisung"
parent: "Daten astellen"
nav_order: 2
lang: "lb"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Kolonnenzouweisung

Eng Datei ass eng Tabell, an 3DHeat muss wëssen, wéi eng Kolonn d'Positioun vun Ost nach West hält, wéi eng d'Zäit, wéi eng de Numm vum Spiller, an sou weider. Dësen Panel ass do, wou et seet, wat et vermutt huet, an wou Dir eng falsch Vermutung korrigéiert.

![De Panel Kolonnenzouweisung nodeem eng Parquet-Datei gelueden gouf: all Këscht ass scho ausgefëllt - 1 X, 2 Y, 3 Z, 4 Zäit, 5 Persounen-ID, 6 Sessioun / Match, 7 Equipe / Grupp](../assets/img/en/column-mapping-panel.webp)

*D'Datei huet hir eege Kolonnen selwer genannt, sou datt all Këscht schonn ausgefëllt ass.*

Zum Beispill ordnet sech eng CSV mat dem Kapp `x,y,z,t,player,team` selwer zou: x, y an z ginn d'Positioun, `t` d'Zäit, `player` d'[Persoun](glossary.md) an `team` d'[Grupp](glossary.md).

Nodeem d'Dateien ausgewielt sinn, geet den Panel **Kolonnenzouweisung** ënner dem Quell-Panel op. Hie seet, wéi eng Kolonn wéi eng Roll spillt. Hie gëtt automatesch ausgefëllt, an all Feld kann geännert ginn, ier Dir **Lueden** dréckt; d'Zouweisung gëtt beim Lueden gelies, dofir heescht eng Ännerung duerno nei lueden.

## D'Felder {#the-fields}

All Kolonnemenüen weisen all Kolonn vun der éischter Datei, plus *- keng -*.

| Feld | Roll | Notizen |
|---|---|---|
| **Trennzeechen** | nëmmen CSV: den Feldtrenner. | Menü: *Komma ,*, *Semikolon ;*, *Tab*, *Pipe \|*, *Leerzeechen*; oder tippt all eenzelen Zeechen an *oder ee Zeechen aginn*. Gëtt automatesch erkannt (kuckt hei drënner). Wann Dir en ännert, leeft d'Auto-Zouweisung nei, a viru gemaachte Ännerunge sinn fort. |
| **X**, **Y**, **Z** | Positioun. | Mindestens zwee sinn néideg; eng net zougewise drëtt Achs ass 0 (d'Daten liewen op enger Fläch). Déiselwecht Kolonn op zwou Achsen ass e Feeler. |
| **Achs no uewen an der Quell** | Wéi eng Quellachs no uewen weist. | *Z ass uewen (déi meescht Spillmotoren)* oder *Y ass uewen (Grafikkonventioun)*. Kuckt [Achsen, Eenheeten a Zäit](axes-units-and-time.md). |
| **Eenheetsskala** | Mécht all Positioun méi grouss. | Knäppercher *1 (m)* a *0,01 (cm→m)*, oder tippt e Wäert. |
| **Flip X / Flip Y / Flip Z** | Dréint eng Quellachs ëm. | Gëllt fir d'Positiounen an d'Blécksrichtungs-Vektoren. |
| **Zäit** | D'Zäitachs. | Optional. Ouni sie gëtt et keng Zäitlinn. |
| **Zäiteenheet** | Wéi d'Zäitkolonn ze liesen ass. | Siwen Eenheeten; kuckt [Achsen, Eenheeten a Zäit](axes-units-and-time.md#time). Ignoréiert bei Parquet-`TIMESTAMP`/`DATE`-Kolonnen, dat seet de Panel. |
| **Persounen-ID** | Wiem oder wat eng Zeil gehéiert. | Optional. Maacht Spuren, Liewensdauere, Box-Replay an Linn-Hëtzt méiglech. |
| **Sessioun / Match** | Zu wéiem Match, Raid, Ronn, Lauf oder Ronn eng Zeil gehéiert. | Optional. Positiounen ginn ni interpoléiert, gezunn oder bei engem Sessiounswiessel an eng Route verbonnen. Kuckt [Sessiounen, Persounen a Gruppen](sessions-persons-groups.md). |
| **Equipe / Grupp** | All Kolonn mat wéineg verschiddene Wäerter. | Optional. Steiert d'Gruppe-Faarwen, Team heat an d'Ënnerscheedsopdeelung no Gruppen. |
| **Blécksrichtung** | *Keng*, *Gier-/Nick-Kolonnen* oder *Richtungsvektor-Kolonnen*. | Mat Gier/Nick: **Gier**, **Nick** an **Wénkeleenheet** (*Grad* / *Radian*). Mat engem Vektor: **Richtung X**, **Richtung Y**, **Richtung Z**. Gëtt fir d'Blécksstrahlen vum [Box-Replay](box-replay.md) benotzt. |
| **Fir ze filteren behalen** | Extra Kolonnen, déi am Späicher bleiwen. | E Kästchen pro Kolonn, an fir all ugekräizt Kolonn *Beräich* (Zuel) oder *Kategorie*. All kascht 4 Byte pro Zeil an e Decodéierduerchgang beim Lueden. Nëmmen behalen Kolonnen kënnen [gefiltert](filters.md) ginn, fir e [Ënnerscheedsopdeelung](difference.md) benotzt ginn oder als [Linn-Hëtzt](line-heat.md)-Evenementkolonn déngen. |
| **Beispillzeile weisen** | Eng Tabell mat den éischte 12 Probezeilen, all Kolonnen. | Fir d'Vermutungen ze kontrolléieren. |

Eng ugekräizt Filterkolonn, déi net explizit gesat ass, gëtt als *Beräich* gelies; eng Id-Kolonn, déi no Zuelen ausgesäit, ass oft nëtzlecher als *Kategorie*. Nëmmen 4 Filter kënnen op eemol aktiv sinn ([Filteren](filters.md)).

## Wéi d'Auto-Zouweisung rode {#how-the-auto-mapping-guesses}

D'Vermutung steet an [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Si kuckt op d'Kolonnennimm, op wéi vill Kolonne a den Probezeilen no Zuelen ausgesinn (méi wéi 90 % vun den net eidele Wäerter loossen sech als Zuelen liesen), op wéi vill verschidden Wäerter all Kolonn an der Prouf huet, an op d'Parquet-Logiktypen. Nimm-Muster ginn an der Rei probéiert, ouni Ënnerscheed tëscht Grouss- a Klengschreiwung, an deen éischte Muster, dee bei eng nach fräi Kolonn passt, gewënnt.

### Positioun {#position}

| Achs | Nim-Muster, an der Rei (nëmmen Zuelekolonnen) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Wann eng Achs nach eidel ass, fëllen déi éischte fräie Zuelekolonnen (ignoréiert `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) se an der Rei aus. E falsch Vermutung ass um Bildschierm kloer; eng eidel Achs géif de Fënster eidel loossen.

### Zäit {#time}

- **Éischt Parquet-Zäitstempelkolonnen.** Ënner de Kolonnen, deenen hire Logiktyp `TIMESTAMP` oder `DATE` ass, gëtt déi beschte no Punkten ausgewielt: +10 000, wann de Numm ee Zäitmuster passt, -5 000 fir e einfaache `DATE`, plus d'Zuel vun de verschiddene Wäerter an der Prouf. E ganzen Dag-Datum an e konstante Sessiounsufank hunn bal keng verschidde Wäerter, dofir gewënnt de Moment vum Evenement. D'Eenheet ass dann *Unix-Zäitstempel (ms)*.
- **Soss no Numm:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, dann Nimm vun der verstrichener Zäit (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). D'Eenheet gëtt dann aus den Wäerter geroden: ISO-8601, wann e Wäert `JJJJ-MM-TT…` oder `JJJJ-MM-TT …` ausgesäit; soss no der gréisster Gréisst: iwwer 10^17 Nanosekonnen, iwwer 10^14 Mikrosekonnen, iwwer 10^11 Unix-Millisekonnen, iwwer 10^8 Unix-Sekonnen, iwwer 10^6 Millisekonnen, soss Sekonnen.

Wann eng Kolonn mat verstrichener Zäit gewielt ass, mécht de Panel eng Notiz, datt all Sessioun dann op hire eegene Ufank ausgeriicht gëtt - gutt fir Matcher iwwereneen ze leeën, net fir se a richtegen Ofleef ze gesinn.

### Sessioun, Persoun, Grupp {#session-person-group}

D'Sessioun gëtt **nom** Zäitachs an **virun** Persoun an Grupp beanspréicht, well eng Sessiounskolonn dacks en Zäitstempel ass (den Ufangsmoment vum Match op all Zeil vum Match).

| Roll | Nim-Muster, an der Rei |
|---|---|
| Sessioun | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (jeweils genau, optional mat `_id`) |
| Persoun | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, dann `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (Renndaten: dat Auto ass dat, wat sech beweegt) |
| Grupp | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grupp, Ersatz | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Eng Grupp-Kandidatin, déi op de meeschte Probezeilen en anere Wäert huet (méi wéi max(48, 60 % vun der Prouf)), ass eng ID, keng Grupp: si gëtt d'Persoun-Kolonn, wann keng gefonnt gouf, an si gëtt net als Grupp benotzt. Wann iwwerhaapt keng Gruppekolonn gefonnt gouf, gëtt déi net-numeresch Kolonn mat de wéinegsten verschiddene Wäerter tëscht 2 an 12 benotzt.

### Blécksrichtung {#look-direction}

Eng numeresch Kolonn mat dem Numm `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` oder `rot_z` / `rotation_z` schalt d'Blécksrichtung op Gier/Nick; Nick gëtt als `pitch`, `…rot…pitch…`, `…elevation…angle…` oder `…view…pitch…` gesicht. Grad gëtt ugeholl, wann e Probe-Gier iwwer 7 an der Gréisst leeft, soss Radian. E Richtungsvektor gëtt ni vermutt; dee kënnt aus de Hiweiser hei drënner oder vun Iech.

### Filterkolonnen {#filter-columns}

Héchstens **6** Kolonnen ginn automatesch behalen, no dësem Rang:

1. `region`, `sessionMode`, `actor` - Kolonnen, déi do sinn, fir dran ze filteren (Wäert 1200);
2. Kategoriekolonnen, déi an der Prouf variéieren, mat deenen wéinegsten verschiddene Wäerter fir (1000 minus d'Zuel);
3. eng Kolonn, déi an der Prouf konstant ass, awer nëmmen, wann méi Dateien gelueden sinn - si kann tëscht den Dateien variéieren, wéi eng Regioun oder eng Testlaaf-ID (600);
4. Zuelekolonnen (500).

Kolonnen, déi schonn eng Roll spillen, d'Lärmnimm hei uewen, Kolonnen, déi bei engem Lueden aus enger eenzeger Datei konstant sinn, an Textkolonnen mat ville verschiddene Wäerter (méi wéi max(16, d'Halschent vun der Prouf)) ginn automatesch net ugebueden. All Kolonn kann awer nach mat der Hand ugekräizt ginn.

### Oben-Achs {#up-axis}

Wann all dräi Achsen zougewise sinn, gëtt d'Achs mat der klenger Streuung vu Y an Z an der Prouf als uewen geholl (eng Kaart ass vill méi breet wéi héich); soss gëtt Z-uewen ugeholl.

## D'`heat3d`-Hiweiser an engem Parquet-Fouss {#the-heat3d-hints-in-a-parquet-footer}

Eng Parquet-Datei kann sôn, wéi se soll gelies ginn. Wann de Schlëssel/Wäert-Metadaten am Fouss vun der Datei en Eintrag mat dem Schlëssel **`heat3d`** hunn, gëtt de Wäert als JSON gelies an iwwer d'Vermutungen geluecht ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). De CS2-Demo-Konverter schreift esou e Eintrag, dofir maache seng Tabellen d'Spiller als Persoun op, d'Säit als Grupp, all Ronn als Sessioun, d'Blécksrichtung un an d'Welt richteg erëm.

Nëmmen d'**éischt** Datei vun enger Auswiel gëtt op Hiweiser gelies. All Eintrag ass optional, an all Wäert aus dem Hiweis steet nach ëmmer am Panel an kann geännert ginn. Eng vollstänneg Beschreiwung vum Schema, mat engem Beispill a wéi een et schreift, steet an der [Datenformater-Referenz](data-formats.md#the-heat3d-hints).

D'Reegele kuerz:

- E Kolonn, déi e Hiweis nennt, gëtt nëmmen ugewannt, wann d'Datei déi Kolonn huet.
- `lookMode: "vector"` gëtt nëmmen wierksam, wann `dirX`, `dirY` a `dirZ` all gesat sinn; `"yawPitch"` nëmmen, wann `yaw` gesat ass.
- `extra`, wann et do ass, ersetzt déi automatesch Filterlëscht (onbekannt Nimm an Kolonnen, déi schonn eng Roll hunn, falen fort); de Beräich- oder Kategorie-Typ vun all Kolonn follegt, ob se numeresch ausgesäit. Wann et fehlt, bleift d'automatesch Lëscht, ouni all Kolonn, déi e Hiweis eng Roll ginn huet.
- `axes.up` muss `"y"` oder `"z"` sinn, Flips musse Wouer/Falsch sinn, `scale` muss positiv sinn.
- `entity.size`, wann positiv, ass d'Gréisst vun engem verfollegte Ding an de Eenheeten vun der Datei ([Entitéitsgréisst](sessions-persons-groups.md#entity-size)); dat ass déi eenzeg Manéier, se ze setzen.

## Bekannten Feeler: den CSV-Trenner änneren {#known-issue-overriding-the-csv-separator}

Wann Dir den Trenner op een ännert, deen anescht ass wéi den erkannten, ännert sech d'Kolonnelëscht an d'Beispillzeilen net (d'Virschau spléckt nach ëmmer mam erkannten Trenner). De gewielte Trenner gëtt awer fir de Lueden selwer benotzt. Wann den erkannten Trenner falsch ass:

1. Maacht d'Datei an engem Texteditor op.
2. Ersetzt den Trenner iwwerall duerch e Komma (an Dezimalkommaen duerch Punkten).
3. Späicheren, a dann d'Datei nei lueden.

D'Ursaach steet an [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
