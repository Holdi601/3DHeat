---
title: "Grafikai ir HUD"
parent: "Lenktynių analizė"
nav_order: 53
lang: "lt"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Diagramos ir HUD

Diagramos sulygiuoja jūsų ratus metras po metro, todėl matote, kur vienas vairuotojas stabdė vėliau ar
atleido anksčiau. Kortelės viršutiniame kairiajame vaizdo kampe rodo, ką kiekvienas automobilis ir
vairuotojas daro dabar.

![Diagramos po vaizdu: dviejų ratų atstumo, greičio, dujų, stabdžių ir vairo eilės, laiko ir priežasčių juostos viršuje ir žymeklis su kortelėmis](../assets/img/en/race-charts-rows.webp)

## Diagramos {#the-charts}

Visi ratai - vienoje atstumo ašyje: metrai išilgai etalono (žr.
[viena atstumo ašis](race-corner-analysis.md#one-distance-axis)), todėl ta pati x
reikšmė reiškia tą pačią vietą trasoje kiekvienam ratui. Vienas ratas diagramuojamas
atskirai (ir atkuriamas); antras to paties kurso ratas diagramuojamas lyginant su juo.
Be įkeltų ratų (arba kai analizė nepavyko) srityje rašoma: „Diagramos atsiranda įkėlus
ratą; įkelkite kitą to paties kurso ratą, kad palygintumėte abu."

### Kas jose yra {#what-is-on-them}

- **Legenda**: kiekvieno diagramuojamo rato spalva ir žymė, etalonas pažymėtas
  „(etalonas)"; „+N daugiau nubrėžta, diagramoje nerodoma", kai matomų ratų daugiau nei
  diagramuojama; **Grafikai (N) ▾**; **Visas ratas** kai priartinta; viena eilutės užuomina.
- **Dvi juostos** viršuje, fokusuotam ratui:
  - *laikas*: [laiko žemėlapis](race-replay-and-scene.md#time-map-where) kaip juostelė,
    raudona - prarandama, žalia - įgyjama;
  - *priežastis*: kiekvienas jo nuostolis kaip juosta virš vietos, kur yra jo priežastis,
    priežasties spalva; užvedus pelę ant juostos matomas jos pavadinimas ir kaina.
- **Posūkių juostos**: nuspalvinta juosta nuo kiekvieno posūkio įvažiavimo iki išvažiavimo
  (kaip rasta etalone) ir jo pavadinimas (`T1` …) po ašimi viršūnėje.
- **Pasirinktas radinys**: juosta jo priežasties spalva virš jo ruožo.
- **Eilutės** (grafikai), po vieną kiekvienam pasirinktam kanalui, kiekviena su pavadinimu ir
  kairėje rodomomis diapazono viršutine ir apatine reikšmėmis; nulio linija, kur diapazonas
  kerta nulį. Kiekvienas ratas - linija jo spalva: fokusuotas ratas 2 px pločio ir nepermatomas,
  etalonas nepermatomas, kiti - 1,5 px 75% skaidrumu. Tarpo eilutėje etalonas nerodomas (jis
  yra nulis pats sau).
- **Žymeklis**: vertikali linija ten, kur yra etalono automobilis (arba kur pelė), ir taškas
  kiekvienam automobiliui kiekvienoje eilutėje, išskyrus tarpą - žymeklio vietoje visi automobiliai
  yra tame pačiame metre; kitu atveju - kiekvieno automobilio atstumas pagal atkūrimo laikrodį.

Diagramuojama ne daugiau kaip **8** ratai: pirmiausia fokusuotas ratas, geriausias jo klasės ir
etalonas, tada kiti įkėlimo tvarka.

### Eilutės ir jų aukščiai {#rows-and-their-heights}

Eilutės dalijasi diagramos aukštį pagal svorį, ne mažiau kaip 16 px:

| Eilutė | Svoris |
|---|---|
| Tarpas (iki etalono, sekundės, su ženklu) | 1,7 |
| Greitis (km/h) | 1,7 |
| pedalas (dujos, stabdžiai, sankaba) | 1 |
| vairas | 1,1 |
| pavara | 0,8 |
| lemputė (rankinis stabdys, ABS ...) | 0,55 |
| bet kas kita | 1 |

Kanalas, kuriam lentelėje nurodytas fiksuotas rodymo diapazonas (pedalai 0-100%), jį naudoja;
kiti pritaikomi prie matomos ratų dalies. Eilutės pavadinimas, per ilgas vietai (ilgas žodis kitoje
kalboje), perkelia viršutinę reikšmę žemyn eilute, kai eilutė pakankamai aukšta, o kur ji per žema -
nukerpamas su daugtaškiu; pilnas pavadinimas rodomas kaip patarimas.

### Numatytieji grafikai {#the-default-graphs}

Kol grafikai nepasirinkti: **tarpas**, tada kiekvienas kanalas, kurį lentelė pažymi `graph` ir kurį
ratai turi - dujos, stabdžiai, sankaba, rankinis stabdys, vairas, pavara, greitis - išskyrus tai, kad
pedalo ar lemputės kanalas paliekamas, nebent kuris nors ratas jį pastumia per 0,02 (sankaba, kuri niekada
nespaudžiama, nėra grafikas). Tvarka - lentelės.

### Grafikų rinkiklis {#the-graph-picker}

**Grafikai (N) ▾** atidaro skydelį virš mygtuko:

- paieškos laukas (atitinka kanalo pavadinimą ar id);
- **Numatytieji** (grąžina numatytąjį rinkinį; jo patarime nurodoma, kiek jų) ir **Uždaryti**;
- *Tarpas iki etalono*, tada visi kanalai, kuriuos diagramuojami ratai turi, sugrupuoti (judėjimas,
  valdymas, variklis, pagalbos, padangos, stabdžiai, pakaba, ratai, kita, laikas, padėtis), kiekvienas su
  varnele; kanalas kiekvienam ratui yra viena eilutė su žymėmis kiekvienam ratui (FL, FR, RL, RR).

Pažymėjimas išlaiko lentelės tvarką, kad ir kokia būtų žymėjimo tvarka. Pasirinkimas galioja, kol
spaudžiama **Numatytieji** arba perkraunama. Kanalai, kurių lentelė nežino, siūlomi grupėje *kita* ir
įvardijami pagal savo id („brakeLinePress" → „Brake line press").

### Užvedimas, ratukas, priartinimas, spustelėjimas {#hover-wheel-zoom-click}

| Veiksmas | Ką daro |
|---|---|
| užvedimas | kiekvienas automobilis, jo kortelė ir valdymas pasislenka į tą metrą; stulpelis paženklina ją trasoje; lentelėje - kiekvieno diagramuojamo rato reikšmė kiekvienoje eilutėje ten (tarpas rodomas kaip „ref" etalonui); virš kortelių - „ties N m - diagramų žymeklis". Nukėlus pelę nuo grafiko grąžinama į atkūrimą |
| ratukas | žingsniuoja atkūrimą išilgai rato po 1/200 matomo ruožo vienu žingsniu (Shift: 5×), sustabdydamas atkūrimą; kai priartinta, vaizdas seka žymeklį |
| Ctrl+ratukas (Cmd+ratukas) | priartina atstumo ašį apie žymeklį: 1,25× atitolinant / 0,8× artinant vienam žingsniui, ne siauriau nei 40 m; atitolinus iki viso rato priartinimas baigiamas |
| šoninis ratukas | slenka, kai priartinta (10% ruožo už 100 slinkimo vienetų) |
| dukart spustelėti, **Visas ratas** | atitolina |
| spustelėjimas | perkelia atkūrimą ten, kur etalonas pasiekia tą metrą |
| Shift+spustelėjimas | ten sulygiuoja automobilius (žr. [sulygiavimas](race-replay-and-scene.md#lining-up)) |

Diagramos perpiešiamos dabartine kalba, kai ji pasikeičia.

Užuominos eilutė legendoje sako tą patį trumpai: „Užvedimas: visi automobiliai ten · ratukas: žingsnis išilgai rato
· Ctrl+ratukas: priartinimas · spustelėjimas: peršokimas · Shift+spustelėjimas: sulygiavimas".

## Automobilių kortelės (HUD) {#the-car-cards-hud}

Viršutiniame kairiajame vaizdo kampe - kortelė kiekvienam matomam ratui - ne daugiau kaip **6**, pirmi šeši
matomi ratai įkėlimo tvarka - atkūrimo (arba diagramų žymeklio) metu.

**Antraštė:** rato spalva ir žymė; gyvas tarpas - šio rato laikas pasiekti dabartinį atstumą minus etalono
laikas pasiekti tą patį atstumą, „+0,48 s" - arba „etalonas"; **⋯** parodo arba paslepia visas kitas reikšmes
(tas pats, kas *Visos reikšmės kortelėse*). Vejamo automobilio kortelė paryškinama.

**Automobilis iš viršaus:** kėbulo kontūras rato spalva su rodykle priekyje, keturios padangos (priekinės
pasukamos iki 28° su vairu), kiekviena nuspalvinta pagal savo temperatūrą, su tais pačiais ženklais kaip
plokščiai nubrėžtas 3D automobilis: slydimo žiedas, pakabos juosta, stabdžių švytėjimas, susidėvėjimo juosta,
apkrovos juosta.

**Rodmenys:** greitis km/h, paties rato laikas, jo atstumas išilgai etalono.

**Valdymas:**

- vairo ratas, pasukamas vairo įvestimi (visas posūkis nubrėžiamas kaip 180°), su procentu po juo;
- juosta kiekvienam pedalui, iš kairės į dešinę kaip pedalų dėžėje - sankaba, stabdžiai, dujos - kiekviena su
  savo procentu ir trumpu pavadinimu, savo spalva (tik tie pedalai, kuriuos turi ratas);
- pavara (R - atbulinė, N - neutrali);
- maža lemputė kiekvienam įjungimo/išjungimo kanalui, kurį turi ratas - rankinis stabdys, ABS, TC, DRS, boksų
  ribotuvas, ore - užsidega savo spalva, kai įjungta (virš pusės diapazono);
- rodmuo kiekvienam lygio kanalui: stabdžių balansas, ABS ir TC nustatymai, sustiprinimas, kuras.

**Valdymo pėdsakas:** paskutinės **6 sekundės** kiekvieno pedalo (viena juosta, kiekvienas savo spalva) ir vairo
(savo juosta, centruota), baigiantis šiuo momentu - ką vairuotojas darė prieš tai. Iki 160 taškų.

**Visos reikšmės** (⋯ arba *Visos reikšmės kortelėse*): kiekviena kita skaliarinė rato reikšmė šiuo momentu, tada
kiekvienas kanalas kiekvienam ratui kaip keturios reikšmės (FL FR RL RR), įvardytos pagal kanalų lentelę arba pagal
paties kanalo pavadinimą, surikiuotos pagal grupę.

## Kūrėjams {#for-developers}

Kodas: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Kanalų lentelė {#the-channel-table}

`CHANNELS` faile [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) yra vienintelė
vieta, kur aprašomas kanalas: jo vienetas, ar tai viena reikšmė kiekvienam mėginiui, ar viena kiekvienam ratui (saugoma
kaip `name.FL` …), jo grupė, rodymo diapazonas, kaip jis piešiamas ant automobilio (`glyph`), kaip rodomas kortelėje
(`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), ar jis yra numatytasis grafikas, ar šokinėja, o ne susilieja
(pavara, vėliavėlės), ir kaip rodomas (mastelis, vienetas, skaitmenys). Etiketės ir trumpi pavadinimai yra pranešimai
kiekvienoje kalboje (`race.channel.<name>.label` / `.short`).

Kanalai su piešiniu ar numatytuoju grafiku:

| Kanalas | Vienetas | Piešiamas kaip | Numatytasis grafikas |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedalas (žalia, raudona, ...), rodoma % | taip |
| `handbrake` | 0..1 | lemputė | taip |
| `steer` | -1..1, dešinė teigiama | vairo ratas | taip |
| `gear` | - | pavara | taip |
| `speed` | m/s, rodoma km/h | - | taip |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lemputė | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | lygio rodmuo | - |
| `tireTemp` (kiekvienam ratui) | °C, rodoma 40-130 | padangos spalva | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (kiekvienam ratui) | kaip žaidimas skalina, rodoma ±1,5 | slydimo žiedas | - |
| `combinedSlip`, `slipIndex` (kiekvienam ratui) | rodoma 0-1,5, 0-1 | slydimo žiedas | - |
| `suspension` (kiekvienam ratui) | 0..1 | pakabos juosta | - |
| `brakeTemp` (kiekvienam ratui) | °C, rodoma 100-900 | stabdžių švytėjimas | - |
| `tireWear` (kiekvienam ratui) | 0..1 | susidėvėjimo juosta | - |
| `wheelLoad` (kiekvienam ratui) | N, rodoma 0-12 000 | apkrovos juosta | - |

Kiti lentelės kanalai (grafikuojami ir išvardijami, bet nepiešiami): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (slydimo kampas), `loose`, `lateral` (nuokrypis nuo etalono),
`rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, taip pat `time`, `distance`, `x`, `y`, `z`.

**Kanalas, kurio nėra lentelėje**, vis tiek nuskaitomas, grafikuojamas (grupėje *kita*) ir išvardijamas
kortelėse, pavadintas pagal savo pavadinimą. **Kad jam būtų suteiktas tinkamas pavadinimas, vienetas ir
piešinys**, pridėkite vieną įrašą į lentelę (ir jo etiketės pranešimą į kiekvieno
`src/i18n/locales/<kalba>/race-channels.json`). Nauja ratų piešinio *rūšis* - tai vienas įrašas `WHEEL_GLYPHS`
(glyph.ts) ir jo plokščias atitikmuo `CARD_GLYPHS` (RaceHud.tsx); abu tipizuoti pagal rūšį, todėl kompiliavimas
nepavyks, kol neegzistuos abu. `src/race/extensible.test.ts` patikrina, kad nežinomi kanalai pasiekia grafikus, kad
kiekvieną lentelės glifą galima nupiešti ir kad lemputės užsidega.

