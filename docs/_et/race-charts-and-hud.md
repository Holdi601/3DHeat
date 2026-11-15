---
title: "Graafikud ja HUD"
parent: "Sõiduanalüüs"
nav_order: 53
lang: "et"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Graafikud ja HUD

Graafikud reastavad sinu ringid meetri kaupa, nii et näed, kus üks sõitja pidurdas
hiljem või tõstis gaasi varem. Kaardid vaate vasakus ülanurgas näitavad, mida iga auto
ja juht parajasti teeb.

![Graafikud vaate all: kahe ringi vahe, kiiruse, gaasi, pidurdamise ja roolimise read, aja ja põhjuse ribad ülal ning kursor kaartidega](../assets/img/en/race-charts-rows.webp)

## Graafikud {#the-charts}

Iga ring ühel distantsiteljel - meetrid etaloni järgi (vt
[üks distantsitelg](race-corner-analysis.md#one-distance-axis)) - nii et sama x on
iga ringi jaoks rajal sama koht. Üks ring joonistatakse eraldi (ja see mängib); teine
sama raja ring joonistatakse selle kõrvale. Kui ühtegi ringi ei ole laaditud (või
analüüs ebaõnnestus), ütleb ala: "Graafikud ilmuvad, kui ring on laaditud; laadi veel
sama raja ring, et kaks võrrelda."

### Mis neil on {#what-is-on-them}

- **Legend**: iga joonistatud ringi värv ja silt, etalon märgitud "(etalon)"; "+N veel
  joonistatud, graafikuta", kui nähtavaid ringe on rohkem kui joonistatud; **Graafikud (N) ▾**;
  **Kogu ring**, kui on suumitud; üherealine vihje.
- **Kaks riba** üleval fokusseeritud ringi jaoks:
  - *aeg*: [ajakaart](race-replay-and-scene.md#time-map-where) ribana, punane kaotamisel,
    roheline võitmisel;
  - *põhjus*: iga tema kadu baarina sinna, kus on tema põhjus, põhjuse värvis; hõlju baari
    kohal, et näha pealkirja ja hinda.
- **Kurvi vööndid**: varjutatud vöönd igast kurvi sisenemisest väljumiseni (nagu etalonil leitud)
  ja selle nimi (`T1` …) telje all tipu kohal.
- **Valitud leid**: vöönd leiu põhjuse värvis tema ulatuse kohal.
- **Read** (graafikud), üks iga valitud kanali kohta, igaühel nimi ja tema ulatuse ülemine ja
  alumine väärtus vasakul, nullijoon seal, kus ulatus läbib nulli. Iga ring on joon oma värvis:
  fokusseeritud ring 2 px lai ja läbipaistmatu, etalon läbipaistmatu, teised 1,5 px 75%-ga.
  Vahe-rida jätab etaloni välja (see on iseendaga null).
- **Kursor**: vertikaalne joon, kus on etaloni auto (või kus on kursor), ja punkt igas autos iga
  rea kohta, välja arvatud vahe-rida - kursori juures on iga auto samal meetril; muidu iga auto
  oma distants replay kellal.

Joonistatakse kuni **8** ringi: esmalt fokusseeritud ring, oma klassi parim ja etalon, siis teised
laadimise järjekorras.

### Read ja nende kõrgused {#rows-and-their-heights}

Read jagavad graafiku kõrguse kaalu järgi, mitte madalamad kui 16 px:

| Rida | Kaal |
|---|---|
| Vahe (etaloniga, sekundites, märgiga) | 1,7 |
| Kiirus (km/h) | 1,7 |
| pedaal (gaas, pidur, kupler) | 1 |
| rool | 1,1 |
| käik | 0,8 |
| tuli (käsipidur, ABS …) | 0,55 |
| kõik muu | 1 |

Kanal, millel on tabelis fikseeritud kuvamisulatus (pedaalid 0-100%), kasutab seda; teised
sobitatakse ringide nähtavasse lõiku. Rea nimi, mis on ruumi jaoks liiga pikk (pikk sõna
teises keeles), viib ülemise väärtuse ühe rea võrra alla, kui rida on piisavalt kõrge, ja
lõigatakse kolmepunktiga, kui ei ole; täisnimi on tööriistavihje.

### Vaikimisi graafikud {#the-default-graphs}

Kuni graafikuid ei ole valitud: **vahe**, siis iga kanal, mille tabel märgib `graph`-iks ja mis
ringidel on - gaas, pidur, kupler, käsipidur, roolimine, käik, kiirus - välja arvatud see, et
pedaali- või tulekanal jäetakse välja, kui keegi ring ei liiguta seda üle 0,02 (kupleri, mida
kunagi ei vajutata, ei ole graafik). Järjekord on tabeli oma.

### Graafikuvalija {#the-graph-picker}

**Graafikud (N) ▾** avab paneeli nupu kohal:

- filtrikast (vastab kanali nimele või ID-le);
- **Vaikimisi** (tagasi vaikimisi komplekti; tööriistavihje ütleb, mitu) ja **Sulge**;
- *Vahe etalonini*, siis iga kanal, mida joonistatud ringid kannavad, rühmitatult (liikumine,
  sisendid, mootor, abivahendid, rattad, pidurid, vedrustus, ratastik, muu, ajastus,
  positsioon), igaühel märkeruut; ratta kaupa kanal on üks rida, millel on kiip igale rattale
  (FL, FR, RL, RR).

Märkimine säilitab tabeli järjekorra, sõltumata märkimise järjekorrast. Valik kehtib kuni
**Vaikimisi** või lehe laadimiseni. Kanalid, mida tabel ei tunne, pakutakse rühmas *muu*, nimetatud
nende enda ID järgi ("brakeLinePress" → "Brake line press").

### Hõljutus, ratas, suum, klõps {#hover-wheel-zoom-click}

| Sisend | Teeb |
|---|---|
| hõljutus | iga auto, tema kaart ja sisendid liiguvad sellele meetrile; post märgib seda rajal; tabel loetleb iga joonistatud ringi väärtuse igal real seal (vahe näidatakse etaloni puhul "ref"); kaartide kohal "N m juures - graafikute kursor". Plotilt lahkumisel tagastatakse replay |
| ratas | liigutab replay'd mööda ringi 1/200 nähtavast ulatusest sakki kohta (Shift: 5×), peatades replay; suumitult jälgib vaade kursorit |
| Ctrl+ratas (Cmd+ratas) | suumib distantsitelge osuti ümber, 1,25× välja / 0,8× sisse sakki kohta, mitte kitsamalt kui 40 m; suumimine välja kogu ringile lõpetab suumi |
| külgratas | liigub suumitult (10% ulatusest 100 kerimisühiku kohta) |
| topeltklõps, **Kogu ring** | suumib välja |
| klõps | viib replay'i sinna, kus etalon jõuab selle meetrini |
| Shift+klõps | joondab autod sinna (vt [joondamine](race-replay-and-scene.md#lining-up)) |

Graafikud joonistatakse keele muutumisel uuesti selles keeles.

Legendi vihjerida ütleb sama lühidalt: "Hõljuta: kõik autod seal · ratas: liigu mööda ringi ·
Ctrl+ratas: suum · klõps: hüppa · Shift+klõps: joonda".

## Autokaardid (HUD) {#the-car-cards-hud}

Vaate vasakus ülanurgas on iga nähtava ringi kohta kaart - kuni **6**, esimesed kuus nähtavat
ringi laadimise järjekorras - replay'i (või graafikute kursori) hetke kohta.

**Päis:** ringi värv ja silt; elav vahe - selle ringi aeg, et jõuda oma praeguse distantsini,
miinus etaloni aeg, et jõuda sama distantsini, "+0,48 s" - või "etalon"; **⋯** näitab või peidab
kõik muud väärtused (sama mis *Kõik väärtused kaartidel*). Jälitatava auto kaart on esile tõstetud.

**Auto ülevalt:** kere kontuur ringi värvis, esiosas nool, neli rehvi (esirattad pööravad roolimisega
kuni 28°), igaüks oma temperatuuri värvis, samade sümbolitega nagu 3D-autol, lamedalt joonistatuna:
libisemisrõngas, vedrustusriba, pidurihõõgumine, kulumisriba, koormusriba.

**Näidud:** kiirus km/h, ringi enda aeg, distants mööda etaloni.

**Sisendid:**

- rool, mida pöörab roolisisend (täispööre joonistatud kui 180°), protsent selle all;
- riba igale pedaalile, vasakult paremale nagu pedaalikastis - kupler, pidur, gaas -
  igaühel oma protsent ja lühinimi, oma värvis (ainult pedaalid, mida ring kannab);
- käik (R tagurpidi, N neutraal);
- väike tuli iga sisse/välja kanali kohta, mida ring kannab - käsipidur, ABS, TC, DRS,
  boksi piirang, õhus - süttib oma värvis, kui on sees (üle poole ulatusest);
- näit iga tasemekanali kohta: pidurijaotus, ABS ja TC seaded, turbo, kütus.

**Sisendite jälg:** viimased **6 sekundit** igast pedaalist (üks rida, igaüks oma värvis) ja
roolimine (oma rida, keskel), lõppedes sel hetkel - mida juht tegi enne seda. Kuni 160 punkti.

**Kõik väärtused** (⋯ või *Kõik väärtused kaartidel*): iga muu skalaar, mida ring sel hetkel
kannab, siis iga ratta kanal neljale väärtusele (FL FR RL RR), nimetatud kanalitabelist või
kanali enda nime järgi, järjestatud rühmade kaupa.

## Arendajatele {#for-developers}

Kood: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Kanalitabel {#the-channel-table}

`CHANNELS` failis [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts)
on ainus koht, kus kanal kirjeldatakse: tema ühik, kas üks väärtus proovi kohta või üks ratta kohta
(salvestatud kui `name.FL` …), tema rühm, kuvamisulatus, kuidas see autol joonistatakse (`glyph`),
kuidas see kaardil ilmub (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), kas see on vaikimisi
graafik, kas see astub, mitte ei segune (käik, lipud), ja kuidas seda näidatakse (skaala, ühik, numbrid).
Sildid ja lühinimed on sõnumid igas keeles (`race.channel.<name>.label` / `.short`).

Kanalid joonistusega või vaikimisi graafikuga:

| Kanal | Ühik | Joonistatud kui | Vaikimisi graafik |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedaal (roheline, punane, …), näidatud %-na | jah |
| `handbrake` | 0..1 | tuli | jah |
| `steer` | -1..1, parem positiivne | rool | jah |
| `gear` | - | käik | jah |
| `speed` | m/s, näidatud km/h | - | jah |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | tuli | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | tasemenäit | - |
| `tireTemp` (ratta kohta) | °C, kuva 40-130 | rehvi värv | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (ratta kohta) | nagu mäng skaleerib, kuva ±1,5 | libisemisrõngas | - |
| `combinedSlip`, `slipIndex` (ratta kohta) | kuva 0-1,5, 0-1 | libisemisrõngas | - |
| `suspension` (ratta kohta) | 0..1 | vedrustusriba | - |
| `brakeTemp` (ratta kohta) | °C, kuva 100-900 | pidurihõõgumine | - |
| `tireWear` (ratta kohta) | 0..1 | kulumisriba | - |
| `wheelLoad` (ratta kohta) | N, kuva 0-12 000 | koormusriba | - |

Teised tabelis (graafikul ja loetletud, mitte joonistatud): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (libisemisnurk), `loose`, `lateral` (nihe etaloni suhtes),
`rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, lisaks `time`, `distance`, `x`, `y`, `z`.

**Kanal, mida tabelis ei ole,** loetakse ikka, joonistatakse graafikul (rühmas *muu*) ja
loetletakse kaartidel, silt on tema enda nimest. **Et anda sellele korralik nimi, ühik ja
joonistus**, lisa tabelisse üks kirje (ja selle sildi sõnum igasse
`src/i18n/locales/<keel>/race-channels.json` faili). Uus *liik* ratta joonistust on üks kirje
`WHEEL_GLYPHS` (glyph.ts) sees ja tema lame kaksik `CARD_GLYPHS` (RaceHud.tsx) sees; mõlemad on
liigi järgi tüübitud, nii et ehitus ebaõnnestub, kuni need mõlemad on olemas.
`src/race/extensible.test.ts` kontrollib, et tundmatud kanalid jõuavad graafikutele, et iga sümbol
tabelis on joonistatav ja et tuled süttivad.
