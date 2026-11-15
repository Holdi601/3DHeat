---
title: "Grafikët dhe HUD"
parent: "Analiza e garës"
nav_order: 53
lang: "sq"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Grafikët dhe HUD

Grafikët i vendosin xhirot tuaja njëri pas tjetrit metër për metër, kështu që mund të shihni ku një vozitës frenoi më vonë ose e lëshoi gazin më herët. Kartat në të majtën lart të pamjes tregojnë se çfarë po bën çdo makinë dhe çdo vozitës tani.

![Grafikët nën pamjen: rreshtat e hendekut, shpejtësisë, gazit, frenës dhe drejtimit për dy xhiro, shiritat e kohës dhe të shkakut lart, dhe kursori me kartat](../assets/img/en/race-charts-rows.webp)

## Grafikët {#the-charts}

Çdo xhiro në një bosht të vetëm distance - metra përgjatë referencës (shih
[një bosht distancash](race-corner-analysis.md#one-distance-axis)) - kështu që
i njëjti x është i njëjti vend në pistë për çdo xhiro. Një xhiro grafikohet
e vetme (dhe riluhet); një xhiro e dytë e së njëjtës pistë grafikohet kundrejt
saj. Pa asnjë xhiro të ngarkuar (ose kur analiza dështoi), zona thotë "Grafikët
shfaqen kur ngarkohet një xhiro; ngarkoni një tjetër të së njëjtës pistë për t'i
krahasuar të dyja."

### Çfarë ka në to {#what-is-on-them}

- **Legjenda**: ngjyra dhe etiketa e çdo xhiroje të grafikuar, referenca e shënuar
  "(referenca)"; "+N të tjera të vizatuara, jo në grafik" kur janë të dukshme më
  shumë xhiro sesa janë në grafik; **Grafikët (N) ▾**; **E gjithë xhiroja** ndërsa
  është zmadhuar; një rresht i shkurtër ndihmës.
- **Dy shirita** lart, për xhiron e fokusuar:
  - *koha*: [harta e kohës](race-replay-and-scene.md#time-map-where) si shirit,
    e kuqe kur humbet, jeshile kur fiton;
  - *shkaku*: çdo humbje e saj si një shirit mbi vendin ku ndodhet shkaku i saj,
    në ngjyrën e shkakut; kalimi i miut mbi shirit jep titullin dhe kostonë e tij.
- **Brezat e kthesave**: një brez i hijezuar nga hyrja e çdo kthese deri në daljen e
  saj (ashtu si gjendet te referenca) dhe emri i saj (`T1` …) nën bosht, te maja.
- **Gjetja e zgjedhur**: një brez në ngjyrën e shkakut të saj mbi distancën e saj.
- **Rreshtat** (grafikët), nga një për çdo kanal të zgjedhur, secili me emrin e tij
  dhe majën dhe fundin e diapazonit të tij në të majtë, një vijë zero aty ku diapazoni
  kalon zeron. Çdo xhiro është një vijë në ngjyrën e vet: xhiroja e fokusuar 2 px e
  gjerë dhe e errët, referenca e errët, të tjerat 1.5 px me 75%. Rreshti i hendekut e
  lë referencën jashtë (është zero me veten).
- **Kursori**: një vijë vertikale aty ku është makina e referencës (ose ku është miu),
  dhe një pikë për makinë në çdo rresht përveç hendekut - te kursori çdo makinë është
  në të njëjtin metër; përndryshe distanca e vetë e çdo makine në orën e riluajtjes.

Të shumtën **8** xhiro grafikohen: xhiroja e fokusuar, më e mira e klasës së saj dhe
referenca të parat, pastaj të tjerat sipas radhës së ngarkimit.

### Rreshtat dhe lartësitë e tyre {#rows-and-their-heights}

Rreshtat ndajnë lartësinë e grafikut sipas peshës, asnjëri më i ulët se 16 px:

| Rreshti | Pesha |
|---|---|
| Hendeku (ndaj referencës, sekonda, me shenjë) | 1.7 |
| Shpejtësia (km/h) | 1.7 |
| një pedale (gazi, frena, kuplungu) | 1 |
| drejtimi | 1.1 |
| marsheja | 0.8 |
| një dritë (frena e dorës, ABS …) | 0.55 |
| çdo gjë tjetër | 1 |

Një kanal me diapazon fiks shfaqjeje në tabelë (pedalet 0-100%) e përdor atë; të
tjerët përshtaten me pjesën e dukshme të xhirove. Një emër rreshti shumë i gjatë për
hapësirën (një fjalë e gjatë në një gjuhë tjetër) e zhvendos vlerën e lartë një rresht
poshtë aty ku rreshti është mjaft i lartë, dhe pritet me tre pika aty ku nuk është; emri
i plotë është tekst kur kaloni miun.

### Grafikët e parazgjedhur {#the-default-graphs}

Derisa të zgjidhen grafikët: **hendeku**, pastaj çdo kanal që tabela e shënon
`graph` dhe që xhirot e kanë - gazi, frena, kuplungu, frena e dorës, drejtimi,
marsheja, shpejtësia - përveç që një kanal pedale ose drite lihet jashtë nëse
askush nuk e lëviz mbi 0.02 (një kuplung që s'shtypet kurrë nuk është grafik).
Radha është ajo e tabelës.

### Zgjedhësi i grafikëve {#the-graph-picker}

**Grafikët (N) ▾** hap një panel mbi buton:

- një kuti filtrimi (përputhet me emrin ose id-në e një kanali);
- **Parazgjedhjet** (kthehet te grupi i parazgjedhur; teksti i tij thotë sa janë) dhe
  **Mbyll**;
- *Hendeku ndaj referencës*, pastaj çdo kanal që mbajnë xhirot e grafikuara, të grupuar
  (lëvizja, komandat, motori, ndihmat, gomat, frenat, pezullimi, rrotat, të tjera,
  koha, pozicioni), me një kuti zgjedhjeje për secilin; një kanal për rrotë është një
  rresht me një çip për rrotë (FL, FR, RL, RR).

Zgjedhjet mbajnë radhën e tabelës, pavarësisht nga radha e klikimeve. Zgjedhja mbetet deri
te **Parazgjedhjet** ose një ringarkim. Kanalet që tabela nuk i njeh ofrohen nën *të tjera*,
të emërtuara nga id-ja e tyre ("brakeLinePress" → "Brake line press").

### Kalimi i miut, rrota, zmadhimi, klikimi {#hover-wheel-zoom-click}

| Veprimi | Çfarë bën |
|---|---|
| kalimi i miut | çdo makinë, kartat dhe komandat e saj lëvizin në atë metër; një shtyllë e shënon në pistë; një tabelë liston vlerën e çdo xhiroje të grafikuar në çdo rresht atje (hendeku shfaqet "ref" për referencën); mbi kartat, "në N m - kursori i grafikëve". Largimi nga grafiku ua kthen kontrollin riluajtjes |
| rrota | e çon riluajtjen përgjatë xhiros me 1/200 të hapësirës së dukshme për çdo kllikim (Shift: 5×), duke e ndalur riluajtjen; kur është zmadhuar, pamja ndjek kursorin |
| Ctrl+rrota (Cmd+rrota) | zmadhon boshtin e distancës rreth treguesit, 1.25× më larg / 0.8× më afër për çdo kllikim, kurrë më ngushtë se 40 m; zvogëlimi deri te xhiroja e plotë e mbyll zmadhimin |
| rrota anësore | lëviz anash ndërsa është zmadhuar (10% e hapësirës për çdo 100 njësi rrotullimi) |
| klikim i dyfishtë, **E gjithë xhiroja** | zvogëlon zmadhimin |
| klikimi | e çon riluajtjen aty ku referenca arrin atë metër |
| Shift+klikimi | i vendos makinat njëra pas tjetrës aty (shih [vendosjen njëra pas tjetrës](race-replay-and-scene.md#lining-up)) |

Grafikët rivizatohen në gjuhën aktuale kur ajo ndryshon.

Rreshti i shkurtër ndihmës në legjendë thotë të njëjtën gjë shkurt: "Kalim miu: çdo makinë atje · rrota: hap përgjatë xhiros · Ctrl+rrota: zmadhim · klikim: kërcim · Shift+klikim: vendose njëra pas tjetrës".


## Kartat e makinave (HUD) {#the-car-cards-hud}

Në të majtën lart të pamjes, një kartë për çdo xhiro të dukshme - të shumtën **6**, gjashtë
xhirot e para të dukshme sipas radhës së ngarkimit - për momentin ku është riluajtja (ose
kursori i grafikëve).

**Koka:** ngjyra dhe etiketa e xhiros; hendeku i drejtpërdrejtë - koha e kësaj xhiroje për të
arritur distancën e saj aktuale minus kohën e referencës për të arritur të njëjtën distancë,
"+0.48 s" - ose "referenca"; **⋯** për të shfaqur ose fshehur çdo vlerë tjetër (e njëjta gjë
me *Të gjitha vlerat te kartat*). Karta e makinës që ndiqet është e theksuar.

**Makina nga lart:** kontura e karrocerisë në ngjyrën e xhiros me një shigjetë në përpara,
katër goma (ato të përparme të kthyera deri 28° me drejtimin), secila e ngjyrosur sipas
temperaturës së saj, me të njëjtat simbole si makina 3D e vizatuar e sheshtë: unaza e
rrëshqitjes, shiriti i pezullimit, shkëlqimi i frenës, brezi i konsumit, shiriti i ngarkesës.

**Leximet:** shpejtësia në km/h, koha e vetë xhiros, distanca e saj përgjatë referencës.

**Komandat:**

- një timon i kthyer nga komanda e drejtimit (kthesa e plotë vizatohet si 180°) me përqindjen
  nën të;
- një shirit për çdo pedale, nga e majta në të djathtë si në një kuti pedalesh - kuplungu, frena,
  gazi - secila me përqindjen dhe emrin e shkurtër, në ngjyrën e vet (vetëm pedalet që ka xhiroja);
- marsheja (R për prapa, N për neutër);
- një dritë e vogël për çdo kanal on/off që ka xhiroja - frena e dorës, ABS, TC, DRS, kufizuesi i
  boksit, në ajër - e ndezur në ngjyrën e vet kur është aktive (mbi gjysmën e diapazonit të saj);
- një lexim për çdo kanal nivelesh: ndarja e frenës, cilësimet e ABS dhe TC, rritja, karburanti.

**Gjurma e komandave:** **6 sekondat** e fundit të çdo pedale (një shirit, secila në ngjyrën e
vet) dhe drejtimi (shiriti i vet, i qendërzuar), që mbaron në këtë moment - çfarë bëri vozitësi
për të arritur këtu. Deri në 160 pika.

**Të gjitha vlerat** (⋯ ose *Të gjitha vlerat te kartat*): çdo vlerë tjetër skalare që ka xhiroja
në këtë moment, pastaj çdo kanal për rrotë si katër vlera (FL FR RL RR), të emërtuara nga tabela e
kanaleve ose nga emri i vetë kanalit, të renditura sipas grupit.

## Për zhvilluesit {#for-developers}

Kodi: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Tabela e kanaleve {#the-channel-table}

`CHANNELS` te [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts)
është vendi i vetëm ku përshkruhet një kanal: njësia e tij, nëse është një vlerë për mostër
ose një për rrotë (ruhet si `name.FL` …), grupi i tij, një diapazon shfaqjeje, si vizatohet
mbi makinë (`glyph`), si duket te karta (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`),
nëse është grafik i parazgjedhur, nëse hap hapa në vend që të përzihet (marshe, flamuj), dhe
si shfaqet (shkalla, njësia, shifrat). Etiketat dhe emrat e shkurtër janë mesazhe në çdo gjuhë
(`race.channel.<name>.label` / `.short`).

Kanalet me vizatim ose grafik të parazgjedhur:

| Kanali | Njësia | Vizatohet si | Grafiku i parazgjedhur |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedale (jeshile, e kuqe, …), shfaqur në % | po |
| `handbrake` | 0..1 | dritë | po |
| `steer` | -1..1, e djathta pozitive | timon | po |
| `gear` | - | marshe | po |
| `speed` | m/s, shfaqur km/h | - | po |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | dritë | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | lexim niveli | - |
| `tireTemp` (për rrotë) | °C, shfaqja 40-130 | ngjyra e gomës | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (për rrotë) | ashtu si e shkallëzon loja, shfaqja ±1.5 | unaza e rrëshqitjes | - |
| `combinedSlip`, `slipIndex` (për rrotë) | shfaqja 0-1.5, 0-1 | unaza e rrëshqitjes | - |
| `suspension` (për rrotë) | 0..1 | shiriti i pezullimit | - |
| `brakeTemp` (për rrotë) | °C, shfaqja 100-900 | shkëlqimi i frenës | - |
| `tireWear` (për rrotë) | 0..1 | brezi i konsumit | - |
| `wheelLoad` (për rrotë) | N, shfaqja 0-12 000 | shiriti i ngarkesës | - |

Të tjerët në tabelë (të grafikuar dhe të listuar, jo të vizatuar): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (këndi i rrëshqitjes), `loose`, `lateral` (devijimi nga referenca),
`rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, plus `time`, `distance`, `x`, `y`, `z`.

**Një kanal që nuk është në tabelë** lexohet prapë, grafikohet (nën *të tjera*) dhe listohet te
kartat, i emërtuar nga emri i vetë. **Për t'i dhënë një emër, njësi dhe vizatim të duhur**, shtoni
një hyrje në tabelë (dhe mesazhin e saj të etiketës në çdo
`src/i18n/locales/<gjuha>/race-channels.json`). Një *lloj* i ri vizatimi rrote është një hyrje te
`WHEEL_GLYPHS` (glyph.ts) dhe binjaku i tij i sheshtë `CARD_GLYPHS` (RaceHud.tsx); të dyja shtypen sipas
llojit, kështu që ndërtimi dështon derisa të ekzistojnë të dyja. `src/race/extensible.test.ts` kontrollon
që kanalet e panjohura arrijnë te grafikët, që çdo simbol i tabelës mund të vizatohet dhe që dritat ndizen.
