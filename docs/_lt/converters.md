---
title: "Konverteriai išsaugo viską"
parent: "Duomenų įkėlimas"
nav_order: 8
lang: "lt"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Konverteriai išsaugo viską

Šio puslapio nereikia, kad atidarytumėte pakartojimą. Jis skirtas žmonėms, rašantiems įrankius, kurie paverčia žaidimų failus 3DHeat lentelėmis, ir visiems, kas nori sužinoti, kodėl tose lentelėse yra tiek daug.

Kiekvienas įrankis, kuris paverčia žaidimo pakartojimą, demonstraciją, žurnalą ar gyvą telemetriją į tai, ką žiūryklė atidaro, laikosi vienos taisyklės:

> **Konvertuokite viską, ką šaltinis turi ir ką galima perskaityti dabar, o likusį išsaugokite nepakeistą, kad jį būtų galima perskaityti vėliau be originalaus failo.**

Pakartojimas dažnai dingsta po žaidimo atnaujinimo, perinstaliavimo ar pilno disko, o gyvas srautas dingsta akimirksniu, kai buvo išsiųstas. Tai, ką konverteris numeta, prarandama visam laikui; tai, ką išsaugo nepakeistą, galima iššifruoti tą dieną, kai kas nors tai supranta. Todėl konverteris niekada nenusprendžia, kas bus naudinga: jis iššifruoja tai, ką gali, o kiekvieną kitą žinutę, paketą, įvykį, savybę ar eilutę palieka nepakeistą šalia lentelės ir savo išvestyje nurodo, kiek kiekvieno perskaitė ir kiek tik išsaugojo.

Šis puslapis - visų konverterių bendra konvencija: War Thunder, World of Tanks, World of Warships ir Squad pakartojimų konverteriai, CS2 demonstracijų konverteris, fone veikiantis stebėtojas (jo Dota pakartojimų dekoderis ir kiekvienas gyvas adapteris), žaidimo įrašymo įrankio telemetrijos skaitytuvai ir žiūryklės pačios importai (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Žiūryklės skaitytuvai aprašyti [Tacview įrašai](tacview-acmi.md) ir [Failų įkėlimas](loading-files.md); vieno failo forma - [Vienas failas - viena rungtynės](container.md). Viena rungtynės tampa lentele, `match.json` ir šoniniais failais, pasirinktinai supakuotais į vieną `.3dheat` failą. Kiekvieno įrankio README turi skyrių **Completeness**, kuriame kiekvienam šaltiniui išvardyta, kas perskaityta, kas išsaugota nepakeista ir kas nepasiekiama, ir kodėl.

## Trys vietos kiekvienam elementui {#three-homes-for-every-item}

Viskas, ką turi šaltinis, baigiasi tiksliai viename iš trijų vietų:

| Vieta | Kas ten eina |
|---|---|
| **Iššifruota** | Lentelė (viena eilutė kiekvienam mėginiui ar įvykiui, žiūryklės skaitomi stulpeliai, papildomi stulpeliai kiekvienai kitai reikšmei, priklausančiai eilutei) ir rungtynių dokumentas `<match>.match.json` (viskas, kas priklauso rungtynėms kaip visumai: nustatymai, sąrašai, rezultatai, lentelės, savikontrolė). |
| **Išsaugota nepakeista** | Šoninis failas šalia lentelės: kiekvienas elementas, kuris nėra iššifruotas arba yra iššifruotas tik iš dalies, visas ir nepakeistas, su savo tipu, laiku ir vienetu ar subjektu, kuriam jis priklauso. |
| **Nepasiekiama** | Įvardyta README skyriuje Completeness su priežastimi: formatas to nesaugo (kliento pakartojime nėra kitų žaidėjų įvesčių), šaltinis to niekada nesiunčia arba skaityti neleidžiama (apsaugotas procesas, užšifruotas blokas, kurio raktas nėra mūsų naudoti). |

Elementas, kuris yra **iš dalies** iššifruotas, yra iššifruotas *ir* išsaugotas nepakeistas: lentelė gauna tai, kas suprantama, šoninis failas - visą elementą, todėl vėlesniam geresniam dekoderiui nereikia originalaus failo.

Ketvirtos vietos nėra. Numesti ką nors, nes atrodė nenaudinga, nes buvo dublikatas „tikriausiai", ar nes buvo didelis, yra klaida. Retinti leidžiama tik lentelėje (kamera 2 Hz vietoj 60), niekada šoniniame faile.

## Šoniniai failai {#sidecars}

Šoninis failas yra Parquet failas šalia lentelės, pavadintas pagal ją:

```
<folder>/<match>.parquet              lentelė
<folder>/<match>.match.json           rungtynių dokumentas
<folder>/<match>.<what>.parquet       šoninis failas
```

`<what>` yra vienas žodis iš šio sąrašo. Naujas konverteris pasirenka tinkamą žodį arba prideda naują čia **ir** į `SIDECAR_PARQUET` faile [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), kad žiūryklė jo neįkeltų, kai įkeliamas visas aplankas.

| `<what>` | Turi | Naudoja |
|---|---|---|
| `messages` | tinklo srauto paketus, objektų metodų kvietimus ir savybių atnaujinimus, visus | War Thunder, World of Tanks, World of Warships |
| `flight` | kiekvieno lėktuvo skrydžio modelio įrašus, visus | War Thunder |
| `packets` | visus kadrus ir tinklo pranešimus arba konteinerių dalis, esančias už objektų srauto ribų | CS2, Dota 2, Squad |
| `events` | žaidimo įvykius su visais jų raktais, kaip juos duoda analizatorius | CS2 |
| `entities` | objektų ir savybių atnaujinimus, nuotolinius kvietimus, atidarytus ir uždarytus kanalus, su eksportais, kurių reikia dekoderiui | Squad, Dota 2 |
| `props` | kiekvieną objekto savybę, kurią skaito analizatorius, kiekvieną kartą, kai ji pasikeitė | CS2 |
| `units` | kiekvieno vieneto būseną, esančią už pozicijų lentelės | Dota 2 |
| `combatlog` | kovos žurnalą, kiekvieną įrašą su kiekvienu lauku | Dota 2 |
| `strings` | kiekvieną kiekvienos eilučių lentelės įrašą | CS2, Dota 2 |
| `objectives` | fiksavimo zonas ir tikslus, kiekvieną pokytį su laiku | War Thunder |
| `raw` | gyvą srautą: kiekvieną gautą paketą, eilutę, API dokumentą ar atminties skaitymą, visą | stebėtojo sesijos (`heat.raw.parquet`), žaidimo įrašymo įrankio rato įrašytojai (`<stamp>_<game>.raw.parquet`), stebėtojo osu!, LoL ir Valorant pakartojimų failai |

Žiūryklė, įkeliant aplanką, praleidžia kiekvieną šio sąrašo `*.<what>.parquet`, kiekvieną `*.match.json`, `*.meta.json`, `*.summary.json` ir kitus JSON šoninius failus; atidarius vieną iš jų atskirai - pasirinkus ar nuvilkus tik tą failą - jis įkeliamas kaip bet kuri kita lentelė (žr. [Failų įkėlimas](loading-files.md)).

Tai failai taip, kaip konverteris juos rašo su `--loose`. Pagal numatymą War Thunder, CS2 ir Tacview konverteriai supakuoja rungtynių lentelę, dokumentą ir šoninius failus į vieną failą `<match>.3dheat` tais pačiais pavadinimais (žr. [Vienas failas - viena rungtynės](container.md)); viskas čia galioja kiekvienam nariui.

### Stulpeliai {#columns}

Kiekviena šoninio failo eilutė yra vienas elementas. Stulpeliai yra tokia tvarka, kiek jie taikomi:

| Stulpelis | Tipas | Kas |
|---|---|---|
| `time` | float64 | sekundės tuo pačiu laikrodžiu kaip lentelės `time` (arba `tick`, kur šaltinis skaičiuoja žymes; tada abu) |
| `type` | string (žodynas) | kas yra elementas, pagal paties šaltinio terminus: paketo tipas, pranešimo ID, įvykio pavadinimas, savybės kelias, eilutės priešdėlis |
| `name` | string (žodynas) | jo pavadinimas, jei žinomas (bendruomenės pavadinimas, klasės pavadinimas), kitaip tuščias |
| `entity` / `unit` / `uid` / `player` | sveikasis skaičius arba tekstas | kam jis priklauso, tais pačiais ID kaip lentelėje, kad šoninio failo eilutę būtų galima sujungti su trajektorija |
| `decoded` | string (JSON) | kas iš jo suprantama, jei kas nors suprantama; kitu atveju tuščia |
| `payload` | binary | elemento baitai, visi ir nepakeisti (dvejetainiai šaltiniai) |
| `text` | string | elemento tekstas, visas ir nepakeistas (tekstiniai šaltiniai: žurnalo eilutė, JSON objektas, raktų ir reikšmių blokas) |

Leidžiami ir kiti stulpeliai (bitų poslinkis, dydis, kanalas). Kartojamos eilutės koduojamos žodynu, o failas rašomas su zstd, todėl šoninis failas yra tik dalis paties pakartojimo dydžio.

Šoninis failas turi pakakti pats savaime: vėliau parašytas dekoderis skaito šoninį failą, niekada ne originalų pakartojimą. Kai elementas be konteksto nesuprantamas (objekto klasė, eilučių lentelė, raktas, į kurį nurodo pranešimas), kontekstas įdedamas ir į šoninį failą, ir į rungtynių dokumentą.

### Gyvi šaltiniai {#live-sources}

Gyvi adapteriai (UDP telemetrija, bendra atmintis, žaidimo žurnalas, vietinė API) neturi failo, prie kurio galėtų grįžti. Jie įrašo **kiekvieną lauką, kurį šaltinis siunčia**, net tuos, kurių dar niekas nenaudoja:

- paketų srautas: kiekvienas paketas visas, `payload` - baitai, `type` - jo paketo ID ar formatas, tuo greičiu, kuriuo jis atkeliauja;
- bendra atmintis ar apklausiama API: kiekvienas kiekvieno skaitymo laukas, arba kaip pavadinti stulpeliai, arba visas blokas kaip `payload`, tuo greičiu, kuriuo adapteris skaito;
- žurnalas: kiekviena eilutė, `text` - eilutė, `type` - eilutės rūšis, įskaitant eilutes, kurių adapteris nevykdo.

Jie patenka į `<session>.raw.parquet` šalia sesijos lentelės. Dydis yra taisyklės kaina; jį sumažina zstd ir žodyno kodavimas, o ne praleidimas.

## Savikontrolė {#the-self-check}

Kiekvienas konverteris įrašo į savo rungtynių dokumentą (arba sesijos `meta.json`, arba santrauką, kur rungtynių dokumento nėra) bloką `completeness` po `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Laukas | Reikšmė |
|---|---|
| `seen` | kiek šio tipo elementų turi šaltinis |
| `decoded` | perskaityta visa į lentelę arba rungtynių dokumentą |
| `partial` | perskaityta iš dalies į lentelę ar dokumentą ir išsaugota visa šoniniame faile |
| `raw` | išsaugota visa tik šoniniame faile, neiššifruota |
| `lost` | `seen - decoded - partial - raw`: turi būti 0 |

Viršutinis `lost` yra suma. Konverterio testai tikrina, kad jis yra 0 jų sintetiniuose pavyzdžiuose, o README sako, koks jis buvo tikruose. Nenulinis `lost` - tai konverterio pranešimas, kad jis pažeidė taisyklę; jis nurodo tipą, todėl spragą galima surasti.

„Tipai" yra paties šaltinio: paketų tipai, pranešimų ID, įvykių pavadinimai, savybių grupės, eilučių rūšys. Jie skaičiuojami tada, kai konverteris su jais susiduria, o ne pagal sąrašą to, ko jis tikisi, todėl tipas, apie kurį niekas nežinojo, pasirodo su savo skaičiumi, o ne dingsta.

## README skyrius „Completeness" {#the-readmes-completeness-section}

Kiekvieno konverterio README yra skyrius, pavadintas **Completeness**, su trimis sąrašais:

- **Read** (perskaityta): kas patenka į lentelę ir rungtynių dokumentą ir kaip kiekvienas naujas laukas patikrintas su kažkuo nepriklausomu (paties žaidimo skaičiais, antruoju šaltiniu, įrašu, padarytu tam tikslui).
- **Kept raw** (išsaugota nepakeista): kas yra kuriame šoniniame faile, pagal kokį `type`, ir kas apie tai žinoma iki šiol.
- **Not available** (nepasiekiama): ką šaltinis nenešioja arba ko negalima skaityti, ir kodėl.

Jis nuorodomis grįžta čia.

## Kur stovi kiekvienas konverteris {#where-each-converter-stands}

| Konverteris | Šoniniai failai | Jo skyrius Completeness |
|---|---|---|
| War Thunder pakartojimai | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (jo savikontrolės skaičiai yra po `counts`; `completeness` blokas dar bus) |
| World of Tanks pakartojimai | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships pakartojimai | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad serverių demonstracijos | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2 demonstracijos | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2 pakartojimai (stebėtojas) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2 pakartojimai](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!, LoL, Valorant pakartojimai (stebėtojas) | `raw` | jų puslapiai [stebėtojo dokumentacijoje](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Gyvi adapteriai (stebėtojas) | `raw` | kiekvieno žaidimo puslapis [stebėtojo dokumentacijoje](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), ir [kūrimas](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) `Session.raw` |
| Rato įrašytojai (žaidimo įrašymo įrankis) | `raw`, ir `unparsed` baitai Forza rato failo viduje | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Pačios žiūryklės importai | nėra: žr. žemiau | šis puslapis |

### Pačios žiūryklės importai {#the-viewers-own-imports}

Tacview ACMI, OCAP ir GPS formatai nuskaitomi naršyklėje iš paties naudotojo failo; žiūryklė nieko iš jų nesaugo, todėl pats failas lieka įrašu. Jie vis tiek perskaito kiek įmanoma:

- **Tacview ACMI** (`src/data/acmi.ts`): kiekviena objekto eilutė su padėtimi yra eilutė su visomis savybėmis, kurias turi įrašas; kiekvienas įvykis - eilutė; kiekvienas pašalinimas - eilutė; paties įrašo savybės (su antraštės FileType ir FileVersion) kiekvienoje eilutėje kaip `RecordingInfo`; komentaro eilutė yra įvykis `Comment`, objektas, kuris niekada negauna padėties - eilutė `Unplaced` atskaitos taške, o U ir V yra stulpeliai, kai bet kuri eilutė juos turi. Savybės eilutė be padėties perskaitoma iš dalies: jos reikšmės pasiekia kitą objekto eilutę, o ne įvyksta savo laiku. `AcmiTable.completeness` suskaičiuoja failo eilutes pagal rūšį.
- **OCAP** (`src/data/ocap.ts`): kiekvieno subjekto kadrai, šūviai, žymos, kiekviena įvykio rūšis (nežinomos rūšys - kaip „Mission" eilutės su savo tekstu) ir paties dokumento laukai (`Info`). Dar neperskaityta: subjekto laukai ir galinės padėties elementai, kurių nėra jo antraštėje (naujesnio įrašytuvo papildymai), ir žuvusio vieneto pasikartojantys kadrai po mirties (tyčia retinami: jų niekas nekeičia).
- **GPS formatai** (`src/data/geoTracks.ts`): fiksacijos, jų laikas, aukštis, kursas ir greitis, bei širdies ritmas, kadencija, galia, temperatūra, palydovai, HDOP ir slėgio aukštis, kur failas tai įrašo. Dar neperskaityta: kiti GPX ir KML plėtiniai, NMEA sakiniai, išskyrus padėties, IGC įrašai, išskyrus fiksacijas ir jų plėtinius, ir FIT pranešimai, išskyrus įrašus (ratus, sesijas, įrenginio informaciją).

Šios spragos išvardytos tam, kad jos būtų uždarytos, o ne kad būtų pateisintos; žiūryklės įkelto įrašo eksportai (`src/data/exportRecording.ts`) rašo tik tai, kas buvo perskaityta.

## Konverterio pridėjimas {#adding-a-converter}

1. Išvardykite, ką formatas turi, pagal jo dokumentaciją, jo paties struktūras arba suskaičiavę kiekvieną pranešimo tipą tikruose pavyzdžiuose. Sąrašas yra savikontrolės `types`.
2. Iššifruokite tai, ką galima patikrinti dabar. Kiekvienas naujas laukas patikrinamas su kažkuo nepriklausomu, prieš jam patenkant į lentelę; laukas, kurio dar negalima patikrinti, lieka nepakeistas.
3. Likusį išsaugokite nepakeistą šoniniame faile, pavadintame aukščiau nurodytu būdu, su aukščiau nurodytais stulpeliais.
4. Parašykite bloką `completeness` ir testą, kad jo `lost` yra 0.
5. Parašykite README skyrių Completeness ir nuorodą čia.
6. Jei šoninio failo `<what>` yra naujas, įtraukite jį į lentelę aukščiau ir į `SIDECAR_PARQUET` faile `src/data/filePick.ts`.

Konverteriai yra švarios sąsajos (clean-room): jie rašomi pagal formatus, dokumentaciją ir pavyzdžius, niekada pagal GPL ar AGPL kodą. Tikrų pakartojimų pavyzdžiai lieka mašinoje, kuri juos sukūrė; testai naudoja sintetinius failus.
