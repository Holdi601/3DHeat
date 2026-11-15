---
title: "Stulpelių priskyrimas"
parent: "Duomenų įkėlimas"
nav_order: 2
lang: "lt"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Stulpelių priskyrimas

Failas yra lentelė, o 3DHeat turi žinoti, kuriame stulpelyje yra pozicija rytai-vakarai, kuriame - laikas, kuriame -
žaidėjo vardas ir t. t. Šis skydelis parodo, ką jis atspėjo, ir čia galite ištaisyti klaidingą spėjimą.

![Stulpelių priskyrimo skydelis įkėlus Parquet failą: visi langeliai jau užpildyti - 1 X, 2 Y, 3 Z, 4 Laikas, 5 Asmens ID, 6 Sesija / rungtynės, 7 Komanda / grupė](../assets/img/en/column-mapping-panel.webp)

*Failas pats pavadino savo stulpelius, todėl visi langeliai jau užpildyti.*

Pavyzdžiui, CSV su antrašte `x,y,z,t,player,team` susiejasi pats: x, y ir z tampa pozicija, `t` - laiku, `player` - [asmeniu](glossary.md),
o `team` - [grupe](glossary.md).

Pasirinkus failus, po Šaltinio skydeliu atsidaro **Stulpelių priskyrimas** skydelis. Jame nurodoma, kuris stulpelis vaidina kokį vaidmenį. Jis
užpildomas automatiškai, ir kiekvieną lauką prieš spaudžiant **Įkelti** galima pakeisti; susiejimas nuskaitomas įkeliant, todėl pakeitus jį vėliau,
reikia įkelti iš naujo.

## Laukai {#the-fields}

Visi stulpelių meniu išvardija visus pirmojo failo stulpelius, plius *- nėra -*.

| Laukas | Vaidmuo | Pastabos |
|---|---|---|
| **Skirtukas** | Tik CSV: lauko skirtukas. | Meniu: *Kablelis ,*, *Kabliataškis ;*, *Tabuliacija*, *Vertikalus brūkšnys \|*, *Tarpas*; arba įveskite bet kurį vieną simbolį lauke *arba įveskite vieną simbolį*. Aptinkamas automatiškai (žr. žemiau). Pakeitus jį, automatinis susiejimas paleidžiamas iš naujo, todėl anksčiau atlikti pakeitimai prarandami. |
| **X**, **Y**, **Z** | Pozicija. | Reikia bent dviejų; nesusietoji trečioji ašis yra 0 (duomenys guli plokštumoje). Ta pati kolona dviem ašims yra klaida. |
| **Vertikalioji ašis šaltinyje** | Kuri šaltinio ašis rodo aukštyn. | *Z yra aukštyn (dauguma žaidimų variklių)* arba *Y yra aukštyn (grafikos konvencija)*. Žr. [Ašys, vienetai ir laikas](axes-units-and-time.md). |
| **Vienetų mastelis** | Padaugina kiekvieną poziciją. | Mygtukai *1 (m)* ir *0,01 (cm→m)*, arba įveskite reikšmę. |
| **Apversti X / Apversti Y / Apversti Z** | Pakeičia šaltinio ašies ženklą. | Taikoma pozicijoms ir žiūros krypties vektoriams. |
| **Laikas** | Laiko ašis. | Neprivaloma. Be jos nėra laiko juostos. |
| **Laiko vienetas** | Kaip skaityti laiko stulpelį. | Septyni vienetai; žr. [Ašys, vienetai ir laikas](axes-units-and-time.md#time). Ignoruojamas Parquet `TIMESTAMP`/`DATE` stulpeliams, ką skydelis ir nurodo. |
| **Asmens ID** | Kam priklauso eilutė - žmogui ar daiktui. | Neprivaloma. Padaro įmanomus takelius, gyvavimo trukmes, dėžės atkūrimą ir linijų šilumą. |
| **Sesija / rungtynės** | Kurioms rungtynėms, reidui, raundui, bėgimui ar ratui priklauso eilutė. | Neprivaloma. Pozicijos niekada neinterpoliuojamos, nevelkamos ir nejungiamos į kelią per sesijos pakeitimą. Žr. [Sesijos, asmenys ir grupės](sessions-persons-groups.md). |
| **Komanda / grupė** | Bet koks stulpelis su mažai skirtingų reikšmių. | Neprivaloma. Valdo grupių spalvas, komandų šilumą ir skirtumo skaidymą pagal grupę. |
| **Žiūrėjimo kryptis** | *Nėra*, *Posūkio / polinkio stulpeliai* arba *Krypties vektoriaus stulpeliai*. | Su posūkiu/polinkiu: **Posūkis**, **Polinkis** ir **Kampo vienetas** (*Laipsniai* / *Radianai*). Su vektoriumi: **Kryptis X**, **Kryptis Y**, **Kryptis Z**. Naudojama žiūros spinduliams [dėžės atkūrime](box-replay.md). |
| **Išsaugoti filtravimui** | Papildomi stulpeliai, laikomi atmintyje. | Varnelė kiekvienam stulpeliui, o kiekvienam pažymėtam - *ruožas* (skaitinis) arba *kategorija*. Kiekvienas kainuoja 4 baitus eilutei ir dekodavimo perėjimą įkeliant. Tik išsaugotus stulpelius galima [filtruoti](filters.md), naudoti [skirtumo skaidymui](difference.md) ar kaip [linijų šilumos](line-heat.md) įvykių stulpelį. |
| **Rodyti pavyzdines eilutes** | Pirmųjų 12 pavyzdinių eilučių lentelė, visi stulpeliai. | Spėjimams patikrinti. |

Pažymėtas filtro stulpelis, kurio tipas nenustatytas aiškiai, skaitomas kaip *ruožas*; skaitiniu atrodantis id stulpelis dažnai naudingesnis kaip
*kategorija*. Vienu metu aktyvūs gali būti tik 4 filtrai ([Filtrai](filters.md)).

## Kaip automatinis susiejimas spėja {#how-the-auto-mapping-guesses}

Spėjimas vyksta [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Jis žiūri į stulpelių pavadinimus,
į tai, kurie stulpeliai yra skaitiniai pavyzdinėse eilutėse (daugiau nei 90% netuščių reikšmių nusiskaito kaip skaičiai), į tai, kiek skirtingų reikšmių
kiekvienas stulpelis turi pavyzdyje, ir į Parquet loginius tipus. Pavadinimų šablonai bandomi eilės tvarka, nepriklausomai nuo raidžių dydžio, ir
laimi pirmas šablonas, atitinkantis bet kurį dar laisvą stulpelį.

### Pozicija {#position}

| Ašis | Pavadinimų šablonai, eilės tvarka (tik skaitiniai stulpeliai) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Jei ašis dar tuščia, pirmieji laisvi skaitiniai stulpeliai (ignoruojant `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) ją užpildo
eilės tvarka. Klaidingas spėjimas ekrane matosi aiškiai; tuščia ašis paliktų tuščią vaizdo sritį.

### Laikas {#time}

- **Pirma Parquet laiko žymų stulpeliai.** Tarp stulpelių, kurių loginis tipas yra `TIMESTAMP` ar `DATE`, geriausias parenkamas pagal balą: +10 000, jei
  pavadinimas atitinka laiko šabloną, -5 000 už paprastą `DATE`, plius skirtingų reikšmių skaičius pavyzdyje. Visos dienos data ir pastovi sesijos pradžia
  turi beveik nė vienos skirtingos reikšmės, todėl laimi įvykio momentas. Vienetas tada yra *Unix laiko žyma (ms)*.
- **Kitaip pagal pavadinimą:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, tada praėjusio laiko
  pavadinimai (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`).
  Vienetas tada spėjamas pagal reikšmes: ISO-8601, kai reikšmė atrodo kaip `YYYY-MM-DDT…` arba `YYYY-MM-DD …`; kitu atveju pagal didžiausią dydį: virš 10^17
  nanosekundžių, virš 10^14 mikrosekundžių, virš 10^11 Unix milisekundžių, virš 10^8 Unix sekundžių, virš 10^6 milisekundžių, kitu atveju - sekundės.

Kai pasirenkamas praėjusio laiko stulpelis, skydelyje pažymima, kad kiekviena sesija tada sulygiuojama pagal savo pradžią - gerai rungtynėms
sudėti vieną ant kitos, bet ne joms matyti realia seka.

### Sesija, asmuo, grupė {#session-person-group}

Sesija priskiriama **po** laiko ašies ir **prieš** asmenį bei grupę, nes sesijos stulpelis dažnai yra laiko žyma (rungtynių pradžios momentas kiekvienoje
rungtynių eilutėje).

| Vaidmuo | Pavadinimų šablonai, eilės tvarka |
|---|---|
| Sesija | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (kiekvienas tiksliai, pasirinktinai su `_id`) |
| Asmuo | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, tada `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (lenktynių duomenys: judantis yra automobilis) |
| Grupė | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grupė, atsarginė | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Grupės kandidatas, kuris daugumoje pavyzdinių eilučių įgyja skirtingą reikšmę (daugiau nei max(48, 60% pavyzdžio)), yra id, o ne grupė: jis tampa
asmens stulpeliu, jei kito nerasta, ir nenaudojamas kaip grupė. Jei grupės stulpelio visai nerasta, naudojamas ne skaitinis stulpelis su mažiausiai
skirtingų reikšmių nuo 2 iki 12.

### Žiūrėjimo kryptis {#look-direction}

Skaitinis stulpelis, pavadintas `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` arba `rot_z` / `rotation_z`, perjungia žiūros kryptį į
posūkį/polinkį; polinkis ieškomas kaip `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Laipsniai daromi prielaida, kai bet kuris
pavyzdinis posūkis absoliučiu dydžiu viršija 7, kitu atveju - radianai. Krypties vektorius niekada nespėjamas; jis ateina iš žemiau esančių užuominų
arba iš jūsų.

### Filtro stulpeliai {#filter-columns}

Automatiškai išsaugoma ne daugiau kaip **6** stulpeliai, surikiuoti:

1. `region`, `sessionMode`, `actor` - stulpeliai, kurie egzistuoja tam, kad pagal juos būtų filtruojama (balas 1200);
2. kategorijų stulpeliai, kurie kinta pavyzdyje, pirmiau tie, kurių mažiau skirtingų reikšmių (1000 minus skaičius);
3. pavyzdyje pastovus stulpelis, bet tik kai įkeltas kelių failų rinkinys - jis gali skirtis tarp failų, pavyzdžiui, regionas ar bandymo paleidimo id (600);
4. skaitiniai stulpeliai (500).

Stulpeliai, jau einantys vaidmenį, aukščiau išvardyti triukšmo pavadinimai, stulpeliai, pastovūs vieno failo įkėlime, ir laisvo teksto stulpeliai (daugiau
nei max(16, pusė pavyzdžio) skirtingų reikšmių) automatiškai nesiūlomi. Bet kurį stulpelį vis dar galima pažymėti ranka.

### Vertikalioji ašis {#up-axis}

Kai visos trys ašys susietos, kaip aukštyn imama ta ašis, kurios Y ir Z sklaida pavyzdyje mažesnė (žemėlapis yra daug platesnis, nei aukštesnis); kitu atveju
daroma prielaida, kad aukštyn yra Z.

## `heat3d` užuominos Parquet poraštėje {#the-heat3d-hints-in-a-parquet-footer}

Parquet failas gali nurodyti, kaip jį skaityti. Jei failo poraštės raktų ir reikšmių metaduomenyse yra įrašas su raktu **`heat3d`**, jo reikšmė
išanalizuojama kaip JSON ir užklojama ant spėjimų ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). CS2 demo konverteris
rašo tokį įrašą, todėl jo lentelės atsidaro su žaidėju kaip asmeniu, puse kaip grupe, kiekvienu raundu kaip sesija, įjungta žiūros kryptimi ir pasauliu
teisinga orientacija.

Užuominoms skaitomas tik **pirmasis** pasirinkimo failas. Kiekvienas įrašas neprivalomas, o kiekviena užuominos reikšmė vis tiek rodoma skydelyje ir gali būti
pakeista. Pilnas schemos aprašymas su pavyzdžiu ir kaip ją rašyti yra [Duomenų formatų žinyne](data-formats.md#the-heat3d-hints).

Taisyklės trumpai:

- Stulpelis, nurodytas užuominoje, pritaikomas tik tada, kai failas tą stulpelį turi.
- `lookMode: "vector"` įsigalioja tik tada, kai nustatyti visi `dirX`, `dirY` ir `dirZ`; `"yawPitch"` - tik tada, kai nustatytas `yaw`.
- `extra`, kai yra, pakeičia automatinį filtrų sąrašą (nežinomi pavadinimai ir stulpeliai, jau einantys vaidmenį, išmetami); kiekvieno ruožo/kategorijos tipas
  seka, ar jis atrodė skaitinis. Kai jo nėra, automatinis sąrašas paliekamas, išskyrus stulpelius, kuriems užuomina davė vaidmenį.
- `axes.up` turi būti `"y"` arba `"z"`, apvertimai - loginės reikšmės, `scale` - teigiamas.
- `entity.size`, kai teigiamas, yra vienos sekamos daikto dydis failo vienetais ([daikto dydis](sessions-persons-groups.md#entity-size)); tai vienintelis būdas jį nustatyti.

## Žinoma problema: CSV skirtuko perrašymas {#known-issue-overriding-the-csv-separator}

Pakeitus skirtuką į kitą nei aptiktasis, stulpelių sąrašas ir pavyzdinės eilutės nesikeičia (peržiūra vis dar skaido aptiktuoju skirtuku). Pasirinktas
skirtukas vis tiek naudojamas pačiam įkėlimui. Jei aptiktasis skirtukas klaidingas:

1. Atidarykite failą teksto redaktoriuje.
2. Pakeiskite skirtuką kableliu visur (dešimtainius kablelius - taškais).
3. Įrašykite ir įkelkite failą iš naujo.

Priežastis yra [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).

