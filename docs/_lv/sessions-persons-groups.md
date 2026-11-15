---
title: "Sesijas, personas un grupas"
parent: "Datu ievade"
nav_order: 4
lang: "lv"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sesijas, personas un grupas

**Persona** ir viena kustīga lieta (spēlētājs, auto). **Komanda/grupa** ir puse, kurai tā pieder. **Sesija** ir viens mačs vai aplis. Skatiet [glosāriju](glossary.md).

Vienā faila rindā var būt visas trīs:

| x | y | laiks | spēlētājs | komanda | mačs |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` ir persona, `team` ir grupa, `match` ir sesija.

Trīs neobligātas kolonnas apraksta, *kas* un *kur stāstā* rinda pieder. Katra tiek kodēta ar vārdnīcu ielādes laikā: teksta vērtības kļūst par maziem veseliem skaitļiem katrā rindā un vienu etiķešu sarakstu, kas kopīgs visiem ielādes failiem.

## Persona {#person}

Kolonna **Personas ID** nosauc kustīgo lietu, kam pieder rinda: spēlētājs, bots, auto. Tā glabājas kā 32 bitu ID katrā rindā.

Ja ir persona un laika kolonna, ielāde aprēķina katras rindas **dzīves ilgumu**: laiku līdz tās pašas personas nākamajam paraugam *tajā pašā sesijā* vai "nav" (sargvērtība -1), ja nākamā parauga nav — persona nomira, aizgāja vai žurnāls beidzās. Dzīves ilgumi darbina [laika skalas](timeline.md) **Dzīves ilgums** vēsturi, interpolāciju un novecošanu [kastes atskaņošanā](box-replay.md), kā arī [līniju siltuma](line-heat.md) maršrutu pārtraukumus. Ko dara rinda bez nākamās, ir skatīšanās iestatījums (*Rezerves dzīves ilgums*), nevis ieraksts datos.

Katrai personai tiek dota grupa no tās **pirmās** rindas laikā; šis piešķīrums krāso tās kasti kastes atskaņošanā un nosaka, kuras grupas redzamības slēdzis to tur paslēpj. Siltuma režīmi katrai rindai izmanto tās pašas grupu.

### Vārdi, ko vairākas lietas valkā vienlaikus {#names-worn-by-several-things-at-once}

Vārds nav vienmēr viena vienība: dažos eksportos katrs mača bots raksta zem viena vārda. Savienojot divus šādas "personas" paraugus — ar interpolāciju, pēdu vai maršrutu — karte uzzīmē līniju starp divām dažādām radībām.

Ielādes laikā ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) vārds tiek atzīmēts kā **kopīgs**, ja divi tā ieraksti

- ir vienā sesijā,
- ir vienā un tajā pašā laikā,
- ir vienā un tajā pašā veidā (katrai paturētajai kategoriju kolonnai ir vienāda vērtība), un
- atrodas tālāk viens no otra par vairāk nekā 1% no datu apjoma diagonāles.

Kopīgos vārdus zīmē kā atsevišķus paraugus — bez interpolācijas, bez pēdas, bez līniju siltuma maršruta. Viss pārējais par tiem (to siltums) nemainās. Datu kopas panelī uzskaitīts, cik vārdu tika atzīmēti, ar līdz trim piemēriem, un kastes atskaņošanas panelis atkārto skaitu.

## Sesija {#session}

Kolonna **Sesija / mačs** saka, kuram mačam, reidam, raundam, braucienam vai aplim pieder rinda. Tā padara personas paraugus par vienu nepārtrauktu trajektoriju: reāla telemetrija bieži sajauc vienlaicīgus mačus, un spēlētāja paraugs tieši pirms atskaņošanas galvas un tas, kas seko tieši pēc tās, var būt no dažādiem mačiem simtiem metru attālumā. Ar sesijas kolonnu:

- interpolācija, pēdas un līniju siltuma maršruti nekad nešķērso sesijas maiņu;
- rindas dzīves ilgums beidzas savas sesijas beigās;
- izvēle **Sesija** parādās sānjoslas augšdaļā, zem režīmu joslas.

Sesijas kolonna ļoti bieži ir *laika zīmogs* — mača sākuma brīdis, atkārtots katrā šā mača rindā. Automātiskais kartētājs šī iemesla dēļ meklē sesijas nosaukumus pirms personām un grupām ([Kolonnu atbilstība](column-mapping.md#session-person-group)). Sacīkšu aplis vai posms arī ir sesija: divi apļi ar vienu un to pašu auto nedrīkst tikt savienoti vienā trajektorijā.

### Sesijas izvēle {#the-session-picker}

![Sesijas izvēle atvērta failā ar desmit mačiem: Visas sesijas (10), Match 01, Match 02 un tā tālāk](../assets/img/en/sessions-persons-groups-picker.webp)

*Desmit mači vienā failā: izvēlieties vienu vai redziet visus.*

Rādīts, kad datu kopai ir uzskaitītas sesijas (skatiet tālāk esošo ierobežojumu).

| Daļa | Nozīme |
|---|---|
| Uzraksts pa labi | izvēlētās sesijas rindu skaits vai *visas reizē*. |
| Izvēlne | *Visas sesijas (N)*, tad katra sesija, aktīvākā pirmā, kā `etiķete - N rindas, ilgums` (ilgums sekundēs zem 90 s, minūtēs zem 90 min, stundās virs tā). |
| Dzeltenīgs padoms | Rāda *Visas sesijas*: pozīcijas joprojām nekad netiek savienotas starp sesijām, bet vienlaicīgi mači karti rāda kopā nesaistītus spēlētājus. |
| Padoms | Rāda siltuma režīmos, kad izvēlēta viena sesija: izvēle pārvieto tikai atskaņošanas galvu. |

Ielādējot, tiek izvēlēta aktīvākā sesija. Izvēloties sesiju, atskaņošanas galva pāriet uz šīs sesijas sākumu.

Ko maina izvēle:

- **[kastes atskaņošanā](box-replay.md)** tā nosaka, kura sesija tiek atskaņota: zīmētas tikai šīs sesijas kastes un pēdas, un laika skalas diapazons kļūst par pašas sesijas ilgumu.
- **siltuma režīmos** tā nesašaurina siltumu, un zem izvēles ir padoms, kas to saka: *Siltuma režīmos tas tikai pārvieto atskaņošanas galvu uz sesijas sākumu; siltums joprojām skaita visas sesijas. Kastes atskaņošana atskaņo tikai izvēlēto sesiju.* Lai siltumu sašaurinātu līdz vienai sesijai, paturiet arī sesijas kolonnu kā filtra kolonnu (*Paturēt filtrēšanai*) un filtrējiet pēc tās. Kolonna var būt gan sesijas kolonna, gan filtra kolonna: ielādētājs nolasa katru atzīmēto filtra kolonnu atsevišķi, neatkarīgi no tā, kādu lomu tā vēl spēlē.

### Pārāk daudz sesiju {#too-many-sessions}

Līdz **100 000** sesijām tiek uzskaitītas. Virs tā kolonna patiesībā ir ID (mape ar miljoniem sesiju, katrā pāris rindu), un tik daudz etiķešu sūtīšana no darbinieka uz lapu ir tas, kas liek cilnei izbeigties atmiņas trūkuma dēļ. Tad ielāde paturē sesiju **ID** — tāpēc robežas joprojām tiek ievērotas visur — bet nomet etiķetes un izvēli, un datu kopas panelis to saka.

## Grupa {#group}

Kolonna **Komanda / grupa** ir jebkura kolonna ar nelielu vērtību skaitu: komanda, puse, vienība, frakcija, spēlētājs pret MI karodziņš, auto klase. Tā glabājas kā 16 bitu ID katrā rindā un vada:

- [Komandu sarakstu](teams-list.md) (redzamība pa grupām, + / − pusēm),
- [komandu siltumu](team-heat.md) (nokrāsa katrai grupai),
- [starpības](difference.md) sadalījumu pēc grupas,
- kastu krāsas [kastes atskaņošanā](box-replay.md) (krāsu saime katrai grupai, nianse katram dalībniekam).

### Ierobežojumi {#limits}

Ne vairāk kā **4096** dažādas grupas. Grupas ID brauc ceturtajā kanālā katras rindas pozīcijas texel uz GPU, un katrai grupai vajag texel 4096 platajā zīmju tabulā, ko ēnotājs lasa, lai izlemtu *paslēpts*, *pievienots* vai *atņemts*. Kolonna ar vairāk dažādām vērtībām ir ID, nevis grupa: **ielāde paturi katru rindu un nomet tikai grupēšanu**, datu kopā ar brīdinājumu, kas iesaka to kartēt kā personas kolonnu vai paturēt kā filtra kolonnu.

Tas pats 4096 ierobežojums attiecas uz paturētu *kategoriju* filtra kolonnu; platāka netiek paturēta, un datu kopa to saka. Skaitliskai kolonnai (piemēram, laika zīmogam) šāda ierobežojuma kā *diapazona* filtram nav.

Grupu vērtības `0`, tukša vērtība, `none`, `unknown`, `null` un `-1` (neatkarīgi no lielajiem burtiem) nozīmē "nav grupas" [komandu siltumam](team-heat.md), kas tās zīmē neitrāli pelēkas, nevis kā noteiktu krāsu.

## Vienības izmērs {#entity-size}

Cik liela ir viena izsekota lieta — spēlētāja sadursmes kaste, auto — nosaka, cik lielas ir [kastes atskaņošanas](box-replay.md) kastes un skata stari. Panelī šim nav lauka; tas nāk no faila [`heat3d` norādēm](data-formats.md#the-heat3d-hints) (`entity.size`, faila pašās vienībās; CS2 konvertētājs raksta 32). Ielāde to reizina ar vienību mērogu.

Katrā ielādē ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), kur *izmērs* ir lielākais no datu X un Z diapazoniem:

| Iestatījums | Ar vienības izmēru | Bez tā |
|---|---|---|
| Kuba izmērs | vienības izmērs | izmērs / 500 |
| Skata stara garums | vienības izmērs × 4 | izmērs / 200 |
| Sprite rādiuss | izmērs / 120 | izmērs / 120 |
| Piesātinājuma punkts | analītisks novērtējums (pēc tam mērīts) | tas pats |
| Lidojuma ātrums | izmērs / 12 | tas pats |
| Tālā plakne | izmērs × 12 | tas pats |
| Tuvā plakne | max(0,05; izmērs / 20 000) | tas pats |

## Datu kopas panelis {#the-dataset-panel}

Zem Avota paneļa. Ar ielādētu datu kopu tas rāda:

- datu kopas **nosaukumu** — izvēli, rindu skaitu, failu skaitu, soli, ja tas tika izmantots;
- **`N komandas · N personas · Ns ilgums`**;
- katru **brīdinājumu**, ko ielāde radīja, dzeltenā krāsā, kamēr datu kopa ir ielādēta: grupas vai filtra kolonna nomesta vērtību pārpilnības dēļ, sesijas nav uzskaitītas, kopīgi vārdi, trūkstošas rindas, izlaisti faili;
- [sintētisko ģeneratoru](synthetic-generator.md);
- **Izlādēt**, kas noņem datu kopu.

Rindu skaits ir rādīts paneļa galvenē.
