---
title: "Raja statistika"
parent: "Sõiduanalüüs"
nav_order: 57
lang: "et"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Raja statistika

Laadi ühe raja palju ringe ja vaataja loeb vead kokku: milline kurv maksab kõige
rohkem aega, mitmel ringil seal midagi valesti läks ja miks. Seda kasuta, et leida
kurv, mida on väärt harjutada.

Proovi: **Demoringid** annab kolm ringi, see piisab, et see jaotis ilmuks.

![Raja statistika vigade kaardiga: rada on värvitud selle järgi, mitmel ringil iga kurvi kohal aeg kadus, ja kurvide loend](../assets/img/en/race-course-mistake-map.webp)

Laadi raja terve kaust - kümneid ringe, mitu autot, mitu võistlusklassi - ja iga
ring hinnatakse ja loetakse kokku. See lehekülg kirjeldab võrdlust klasside
kaupa, mida loetakse veaks, jaotist **Raja statistika**, vigade kaarti, soojuskaardi
eksporti, mitme raja ringe ja jõudlust paljude ringidega.

## Parimaga oma klassist {#against-the-best-of-its-own-class}

Ringi võrreldakse kurvi kaupa **oma võistlusklassi kiireima täieliku ringiga**
(etalon, etaloni klassis); see ring ise aga selle klassi kiireima sõitjaga igas
kurvis, või kui ta on klassis üksi, kõigi ringide kiireimaga. Autod on
rühmitatud mängu võistlusklassi järgi (Forzas D kuni X; C ja S2 on kaks neist).
C-klassi auto pidurdus-punkt S2 auto oma kõrval ei ütle midagi sõidu kohta. Aja
kaart, erinevused ringide loendis ja tabel *Kurv kurvi haaval* järgivad sama
võrdlust (vt [kellega iga ringi võrreldakse](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statistika on ehitatud iga ringi analüüsile, mitte selle kõrvale.

## Mida loetakse veaks {#what-counts-as-a-mistake}

**Esinemine** on ühe ringi viga ühes kurvis (lõigus). Ringi vead kurvis on:

1. **Juhi põhjus**, mille analüüs selle kohta seal leidis - leid, mis on kadu ja
   mis läheb juhi arvele (mitte auto ega olukorra), maksab selle etaloniringi
   suhtes **0,05 s** või rohkem. Selle hind on kurvi kadu.
2. **Iga autojuhtimise viga**, mille ta seal tegi ja mida teine ring ei teinud
   (ühine ei ole), maksab **0,03 s** või rohkem - blokeerumine, rattad libisevad,
   tagumik lendab välja, ülestõuke, pöörlemine. Selle hind on sündmuse enda.
3. **Iga kokkupõrge ja õnnetus**, ühine või mitte, mida see ka ei maksnud.

Ühes kurvis võib olla mitu; iga liik loetakse **ühe korra ringi ja kurvi kohta**.
Võit, auto osa ja hilisem saabumine, mis otsustati eelmises kurvis, ei ole vead.

### Leidudest vigadeni {#from-findings-to-mistakes}

| Leid | Viga |
|---|---|
| sisse liiga kiiresti, välja aeglaselt, sest pidurdas mitu meetrit hiljem kui teine | Pidurdas liiga hilja |
| pidurdas varakult | Pidurdas liiga vara |
| pidurdas õrnalt | Pidurdas liiga õrnalt |
| põhjusena blokeerumine | Blokeeris ratta |
| veeres | Veeres |
| haardeväel on reserv, tipuni aeglasem, pidurdas seal, kus teine ainult tõstis gaasi | Liiga aeglane keskel |
| liiga kitsas joon | Liiga kitsas joon |
| lükkas laiali | Lükkas laiali |
| keeras autot vähem / liiga palju | Keeras auto valesti |
| hilja gaasile, täisgaasi hilja, kõhkles | Hilja gaasile |
| kurvist väljudes aeglasem | Väljus aeglasemalt |
| rattad libisesid | Rattad libisesid |
| tagumik lendas välja, keskel külgsuunas | Tagumik lendas välja |
| sõitis laiali | Sõitis laiali |
| kaotas kiirust | Kaotas kiirust |
| tõstis gaasi (sissesõidul või sirgel) | Tõstis gaasi |
| peaaegu seisma jäi, pöörlemine, kokkupõrge või õnnetus põhjusena | Pöörles / Põrkas millegi otsa / Sõitis kokku, kui ringi sündmused seal nii ütlevad (kõigepealt õnnetus, siis pöörlemine, siis kokkupõrge); muidu Peaaegu seisma jäi |
| pikem lend | Lendas liiga kaugele |

Kaks mustrit loetakse seal leitud põhjuse järgi, sama tabeli alusel. *Andis
sissesõidul rohkem, kui väljumine tagasi võitis* on oma kirje põhjuse viga:
varakult pidurdamine on *Pidurdas liiga vara*, blokeerumine *Blokeeris ratta*,
veeremine *Veeres*, kasutamata haarde *Liiga aeglane keskel*. *Sisse liiga
kiiresti, välja aeglaselt* on *Pidurdas liiga hilja*, kui ring pidurdas teisest
hiljem; muidu on see tema väljumise põhjuse viga - *Hilja gaasile*, *Rattad
libisesid*, *Tagumik lendas välja*, *Sõitis laiali*, *Väljus aeglasemalt*. Muster,
mille põhjus on auto oma või hilisem saabumine, ei lähe arvesse.

Ei lähe arvesse: hilisem saabumine, start, iga *auto* leid (tõmme, haardetase,
pidurid, ajam) ja iga võit või tasane kurv.

### Liigid nende järjekorras {#the-kinds-in-their-order}

Pidurdamine: *Pidurdas liiga hilja*, *Pidurdas liiga vara*, *Pidurdas liiga
õrnalt*, *Blokeeris ratta*. Sisenemine: *Veeres*, *Liiga aeglane keskel*, *Liiga
kitsas joon*, *Lükkas laiali*, *Keeras auto valesti*. Väljumine: *Hilja gaasile*,
*Väljus aeglasemalt*, *Rattad libisesid*, *Tagumik lendas välja*, *Sõitis
laiali*, *Kaotas kiirust*. Sirge: *Tõstis gaasi*. Juhtumid: *Pöörles*, *Põrkas
millegi otsa*, *Sõitis kokku*, *Peaaegu seisma jäi*, *Lendas liiga kaugele*.

## Jaotis Raja statistika {#the-course-statistics-section}

Kuvatakse alates **3** ringist, kohal **Ringid** ja **Kus parandada** vahel.

- **Kokkuvõte**: "40 ringi 9 autoga, 3 klassi: iga kurv hinnatud oma klassi kiireima
  ringi järgi." (autod loetud auto numbri või nime järgi).
- **Klassi märgid** (kui on mitu klassi): **Kõik** ja üks märk klassi kohta, igaühel
  tema ringide arv, mängu järjekorras (D, C, B, A, S1, S2, R, X, siis teised).
  Klõps klassil näitab ainult selle ringe; **Shift+klõps** lisab või eemaldab ühe.
  Kõik allpool - loendid, kaart, soojuskaardi eksport - järgivad valitud klasse.
- **Mis läheb kõige sagedamini valesti**: iga vea liik, kõige rohkem ringe enne (siis
  kõige rohkem kordi, siis suurim hind), kõige rohkem 8. **Kõik N liiki** näitab
  ülejäänud, **Vähem** peidab need jälle. Iga rida: nimi, "N / M ringil", riba selle
  osa kohta ja "K korda · umbes X s · enim T3 (5), T7 (4), T1 (2)" - kui tihti see
  tehti (ring kurvi kaupa), kokku mis see maksis, ja kolm kurvi, kus seda kõige
  rohkem ringe tegi. **Klõps real** näitab seda vigade kaardil (ja lülitab kaardi
  sisse); uuesti klõps näitab kõiki vigu.
- **Kurv kurvi haaval** (või *Kurv kurvi haaval - <viga>*, kui üks on valitud): iga
  lõigu kohta "N / M kaotas aega · X s" - ringid, mis sõitsid kogu kurvi, need, kes
  seal kaotasid **0,05 s** või rohkem oma klassi parima suhtes, ja kogu aeg, mis nad
  kaotasid. Kokkuvolditult loetleb kolm kõige sagedasemat viga koos ringide arvuga.
  **Klõps kurvil** avab selle, sihib selle kaameraga ja lülitab vigade kaardile: iga
  vea kohta (või ainult valitud ühe kohta) joon, näiteks "12 / 40 ringil pidurdati
  siin liiga vara. 9 erinevas autos - umbes 0,21 s igaüks." ja ringid, mis selle
  tegid, **kõige hullemad enne**, igaühel oma hinnaga - kõige rohkem 8, ülejäänud
  "+N veel". **Klõps ringil** fokusseerib selle ja mängib selle vea uuesti (joondatud
  40 m enne seda).
- **Näita soojuskaardil**: vt allpool. "Soojuskaarti ehitatakse…" kuni see töötab;
  puudub, kui vigu ei ole.

## Vigade kaart {#the-mistake-map}

**Vaade → Vigade kaart** värvib etaloni rajal, mitu ringi (valitud klassidest) tegi
igal meetril vea - kõiki liike või statistikas valitud ühte. Iga ring loetakse igal
meetril ühe korra; iga esinemise ulatust (kus tema põhjus või sündmus oli) laiendatakse
mõlemale poole 6 m, et lühike oleks näha. Laiem ja heledam seal, kus rohkem ringe
tegi: laius `3 + 10 · (ringe siin / kõige rohkem ringe kusagil)` meetrit, värv tuhmpruunist
heledaoranžini; hall 2 m riba seal, kus keegi ei teinud. Legend: *vähe ringe ↔ kõige
rohkem ringe*.

Kui **Sildid** on sisse lülitatud, kannab iga kurvi tipp oma kõige sagedasemat viga:
"T3 · 12/40 varajane pidurdamine" (ringid, mis seda tegid / ringid, mis kurvi sõitsid),
"T3 · 12/40", kui üks liik on valitud, "T3 · puhas", kui ühtegi ei ole. Sildi kohal
hoides näidatakse kurvi kadusid ja tema viis kõige sagedasemat viga; klõps sellel avab
või sulgeb selle kurvi statistikas.

## Näita soojuskaardil {#show-in-the-heatmap}

**Näita soojuskaardil** annab sama soojuskaardi vahekaardile andmestikuna nimega
"Vead rajal <rada>" (või "Vead rajal"), nii et kogu soojuskaardi tööriistakomplekt -
soojusrežiimid, filtrid, ajajoon, lõikamine - töötab sellel, kus ringid valesti lähevad.

See on mälus ehitatud CSV (`mistakeTable`), üks rida iga ruudustiku punkti kohta (iga
2 m) iga esinemise kohta, **selle ringi enda asukohas** seal:

| Veerg | Sisu |
|---|---|
| `x`, `y`, `z` | ringi asukoht sel meetril (mängu koordinaadid) |
| `elapsed` | ringi aeg seal, s |
| `lap` | ringi silt |
| `car` | auto nimi (või "car 1234") |
| `mistake` | vea nimi praeguses keeles |
| `car_class` | klass, `-` kui seda ei ole |
| `corner` | kurvi silt, `T3` |
| `cost` | esinemise hind, s |

See laaditakse soojuskaardi enda laaduri kaudu koos kaardistusvihjetega: Y üles, pöördeid
ei ole, skaala 1; aeg `elapsed` sekundites; **isik** = `car`, **rühm** = `mistake`,
**seanss** = `lap`; vaatesuunda ei ole; `car_class`, `corner` ja `cost` jäävad
filtriveergudeks. Seejärel läheb vahekaart **Soojuskaart** peale ja kaadrib andmed.
Eksporditakse ainult statistikas valitud klassid.

## Mitme raja ringid {#courses-from-several-tracks}

Ringe analüüsitakse **korraga ühe raja kaupa**. Kaust, kus on mitme raja ringid - kogu
ringide raamatukogu - pakub iga rada eraldi laadimiseks (ringide arvuga, kõige rohkem
enne); ringid sõitudest, mis ei lõppenud (FH Companioni `unfinished/`), lähevad oma rajaga
kaasa, märgituna *osaline*. Mitme nimetatud raja ringid, mis on valitud failidena, pakutakse
samamoodi; ringid, mis ei nimeta rada, lähevad sellega, mis on valitud. Teise nimetatud raja
ringide laadimine asendab need, mis olid laaditud. Üksikasjad:
[Ringide laadimine](race-loading-laps.md#folders-and-courses).

## Jõudlus paljude ringidega {#performance-with-many-laps}

Kümneid ringe analüüsitakse sekundi või kahega (alati kõik). Joonistatu on piiratud, et
vaade püsiks kaadrikiiruses:

| Piir | Väärtus | Mõju |
|---|---|---|
| vaikimisi joonistatud ringid | 8 (`SHOW_ALL_UP_TO`) | üle 8 laaditud ringi peidetakse uued ringid, kui nad ei ole etalon, fokusseeritud ring ega oma klassi parim. **Näita kõiki** joonistab kõik ringid; **Ainult vaadeldavad** viib tagasi. Ringi fokusseerimine teeb tema ja tema klassi parima jälle nähtavaks |
| lihtsad autod ja õhukesed jooned | üle 10 nähtava (`PLAIN_PAST`) | muud ringid kui fookus, jälitatav auto ja etalon: joonepunkt iga 6 m (1,5 m asemel), autod joonistatud lihtsalt |
| graafikuga ringid | 8 (`CHART_LAPS`) | esmalt fookus, tema klassi parim ja etalon; "+N veel joonistatud, graafikuta" |
| HUD-kaardid | 6 | esimesed kuus nähtavat ringi |
| statistika | alates 3 ringist | jaotis on alla selle peidetud |
| loetletud leiud | 12 juhi, 8 auto/konteksti, 10 võitu | fokusseeritud ringi kohta |
| näidatud autopaarid | 3 | üle 3 paari üks paar valijaga |

Vea esinemised arvutatakse analüüsi kohta üks kord ja jäetakse vahemällu; vigade kaardi
tihedus jäetakse vahemällu klassi valiku ja vea kohta.

## Arendajatele {#for-developers}

Kood: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` failis [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
