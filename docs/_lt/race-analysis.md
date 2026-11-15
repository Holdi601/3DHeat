---
title: "Lenktynių analizė"
nav_order: 11
has_children: true
lang: "lt"
source: "race-analysis.md"
source_hash: "ab0531fa7bbd"
translated: true
outdated: false
---

# Lenktynių analizė

Jūs važiavote tą pačią trasą du kartus. Skirtukas **Lenktynių analizė** abu važiavimus paleidžia kartu 3D erdvėje, parodo, kur vienas ratas buvo lėtesnis, ir pasako,
kodėl. Ratų dar nėra? Spauskite **Demonstraciniai ratai**.

![Lenktynių analizės skirtukas su demonstraciniais ratais: šoninė juosta su Ratai ir Kur tobulėti, automobiliai trasoje, diagramos po vaizdu](../assets/img/lt/race-analysis-overview.webp)

Skirtukas lygina du ar daugiau vienos trasos ratų. Jis dalijasi drobe, kamera ir įkelto trasos modeliu (**Fonas / lygis**) su šilumos žemėlapiu; viskas kita yra jo
paties: savo šoninė juosta ir savo juosta po vaizdu. Žodžiai *ratas*, *etalonas* ir *viršūnė* paaiškinti [žodynėlyje](glossary.md).

Šis puslapis yra skirtuko žemėlapis. Kiekviena dalis turi savo puslapį:

| Puslapis | Ką apima |
|---|---|
| [Ratų įkėlimas](race-loading-laps.md) | kiekvienas failo formatas, aplankai ir trasos, automobilių pavadinimai, demonstraciniai ratai, ratų sąrašas, etalonas ir fokusas |
| [Atkūrimas ir 3D scena](race-replay-and-scene.md) | atkūrimo juosta, trys atkūrimo režimai, automobilių sulygiavimas, vejamoji kamera, linijos, žemėlapiai, automobiliai, žymos, veidrodiniai pasauliai |
| [Diagramos ir HUD](race-charts-and-hud.md) | atstumo diagramos, grafikų rinkiklis, užvedimas ir priartinimas, automobilių kortelės, kanalų lentelė |
| [Automobilio valdymo įvykiai](race-control-events.md) | užblokavimai, ratų slydimas, perteklinis vairavimas (oversteer), sukimasis, nepakankamas vairavimas (understeer), smūgiai, avarijos, ABS/TC, rankinis stabdys, oras - kaip kiekvienas aptinkamas, su visomis ribomis |
| [Posūkis po posūkio analizė](race-corner-analysis.md) | suderinimas pagal atstumą, posūkiai ir segmentai, posūkio laiko apskaita, kiekviena priežastis ir tvarka, kuria jos tikrinamos, linijos forma ir patarimas |
| [Automobilių profiliai ir palyginimas](race-car-profiles.md) | ką kiekvienas automobilis gali, išmatuota iš jo ratų; *Automobilių palyginimas*; ką automobilis lemia kiekviename posūkyje |
| [Trasos statistika](race-course-statistics.md) | daug vienos trasos ratų: klaidos pagal posūkį ir rūšį, klaidų žemėlapis, šilumos žemėlapio eksportas, našumo ribos |
| [Lenktynių analitika: metodas](race-analytics.md) | taisyklių pagrindą sudarantys tyrimai su šaltiniais |
| [Kiti lenktynių žaidimai](other-games.md) | ką peržiūra daro su kiekvieno žaidimo ratais: slydimas ir dreifas, apskaičiuoti tada, kai žaidimas jų neduoda, veidrodiniai pasauliai, papildomi kanalai |

## Ekranas {#the-screen}

**Šoninė juosta**, iš viršaus žemyn (skyrius galima sulankstyti):

1. **Ratai** - įkėlimas, sąrašas, rodyti/slėpti, etalonas, fokusas, vejimas.
   Žr. [Ratų įkėlimas](race-loading-laps.md).
2. **Trasos statistika** - tik nuo trijų įkeltų ratų.
   Žr. [Trasos statistika](race-course-statistics.md).
3. **Kur tobulėti** - fokusuoto rato radiniai, posūkis po posūkio.
   Žr. [Posūkis po posūkio analizė](race-corner-analysis.md).
4. **Posūkis po posūkio** (arba *Posūkis po posūkio - klasė X*, kai yra kelios klasės) -
   greičiausias ratas per kiekvieną posūkį ir jo linija. Rodoma, kai yra du ar daugiau ratų.
5. **Automobilio valdymas** - fokusuoto rato užblokavimai, slydimai, stūmimai ir smūgiai.
   Žr. [Automobilio valdymo įvykiai](race-control-events.md).
6. **Automobilių palyginimas** (arba **Automobilis**, kai yra vienas automobilis) - žr.
   [Automobilių profiliai ir palyginimas](race-car-profiles.md).
7. **Vaizdas** - kuris žemėlapis nudažomas ant trasos ir kas nubrėžiama.
   Žr. [Atkūrimas ir 3D scena](race-replay-and-scene.md).
8. Bendri **Lygis** ir **Kamera ir scena** skydeliai (trasos modelis, ašies apvertimas, kamera) - aprašyti su šilumos žemėlapiu ir [Kamera](camera.md).

**Vaizdas** rodo trasą, nuvažiuotas linijas, žemėlapį, automobilius, prie trasos prisegtas žymas ir iki šešių automobilių kortelių viršutiniame kairiajame kampe (žr.
[Diagramos ir HUD](race-charts-and-hud.md)). Kai ratų neįkelta, rašoma: „Ratų neįkelta - čia nuvilkite dvi ar daugiau ratų failų arba įkelkite demonstracinius ratus
iš šoninės juostos."

**Juosta po vaizdu** laiko atkūrimo valdiklius ir, jei nepaslėpta, atstumo diagramas.

## Greita pradžia {#quick-start}

1. Atidarykite skirtuką **Lenktynių analizė** (šalia **Šilumos žemėlapis** šoninės juostos viršuje).
2. Įkelkite ratus. Spauskite **Demonstraciniai ratai**, kad pamatytumėte, ką skirtukas daro su trimis išgalvotais ratais. Savo ratams pirma juos įrašykite
   ([failų formatai ir įrašymo įrankiai](race-loading-laps.md#file-formats)), tada spauskite **Įkelti ratų failus…** arba **Aplankas…**, arba nuvilkite failus ar aplankus ant vaizdo.
3. Greitiausias pilnas ratas tampa etalonu; lėčiausias kitas ratas fokusuojamas. Spustelėkite bet kurį ratą sąraše, kad jį fokusuotumėte; ★ padaro ratą etalonu.
4. Perskaitykite **Kur tobulėti**. Spustelėkite radinį: automobiliai sulygiuojami 40 m prieš jį, kamera jį įrėmina, atkūrimas praeina pro jį ir atsiveria matavimai.
5. Užveskite pelę ant diagramų, kad kiekvienas automobilis persikeltų į tą metrą; Shift+spustelėjimas - kad jie ten sulygiuotųsi.

## Klaviatūra {#keyboard}

Kol atidarytas Lenktynių skirtukas:

| Klavišas | Ką daro |
|---|---|
| **K** | paleidžia / pristabdo atkūrimą |
| **Home** | grįžta į atkūrimo pradžią |
| skaitmenų klavišai | nieko (šilumos žemėlapyje jie perjungia režimus) |

Klavišai, įvesti į teksto lauką ar išskleidžiamąjį sąrašą, ignoruojami. Kameros klavišai veikia kaip šilumos žemėlapyje (**W A S D**, **Tarpas** - aukštyn, **Q** - žemyn,
**Shift** - greičiau, **Alt** - lėčiau, pelė - žiūrėti; visa [Kamera](camera.md)); **F** įrėmina įkeltus ratus (kaip ir įkeliant ratus).

## Daug ratų {#many-laps}

- Visi įkelti ratai analizuojami ir suskaičiuojami; dešimtys trunka sekundę ar dvi.
- Daugiau nei **8** ratai (`SHOW_ALL_UP_TO`): pridėti ratai piešiami tik tada, kai jie yra etalonas, fokusuotas ratas ar geriausias fokusuoto rato klasės ratas.
  Jungikliai *Rodyti visus* / *Tik nagrinėjami*.
- Daugiau nei **10** matomų automobilių (`PLAIN_PAST`): ratai, kurių nenagrinėjama (ne fokusas, ne vejamas automobilis ir ne etalonas), piešiami linijomis, sumažintomis iki taško kas
  6 m vietoj 1,5 m, ir paprastais automobiliais.
- Diagramos piešia ne daugiau kaip **8** ratus; HUD rodo ne daugiau kaip **6** kortelių.
- Trasos statistika atsiranda nuo **3** ratų.

Išsamiau: [Trasos statistika](race-course-statistics.md#performance-with-many-laps).

## Numatytieji vaizdo nustatymai {#default-view-settings}

| Nustatymas | Numatytasis |
|---|---|
| Žemėlapis | Laiko žemėlapis |
| Nuvažiuotos linijos, Automobiliai, Padangos ir pakaba, Žymos, Trasa iš ratų | įjungta |
| Visos reikšmės kortelėse | išjungta |
| Automobilio dydis | 1× |
| Diagramos | rodomos |
| Atkūrimo režimas | Nuo linijos |
| Atkūrimo greitis | 1× |
| Ciklas | įjungtas |

Nieko iš to neišsaugoma; perkrovus puslapį pradedama nuo numatytųjų. Naršyklė prisimena: kalbą ir automobilių pavadinimus, išmoktus iš ratų failų
(žr. [Ratų įkėlimas](race-loading-laps.md#car-names)).

## Kūrėjams {#for-developers}

### Kas vyksta įkėlus ratus {#what-happens-when-laps-are-loaded}

Kiekvieną kartą, kai pasikeičia ratų rinkinys, etalonas ar kalba, visa analizė atliekama iš naujo (`analyse` faile
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Kiekvienam ratui pridedami išvesti kanalai, kur žaidimas jų neduoda: dreifo kampas, ratų slydimas iš ratų greičių, ore, laisvas gruntas, posūkio greitis
   ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Parenamas etalonas ir kiekvienas ratas projektuojamas ant jo kelio ir perskaičiuojamas kas 2 m
   ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Iš ratų nustatoma, ar žaidimo pasaulis veidrodinis
   ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Posūkiai randami etalone ir sugrupuojami į segmentus nuo vienos stabdymo zonos iki kitos
   ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Kiekvienam automobiliui: jo ribos (sukibimas, stabdymas, trauka pagal greitį), profilis, padangų kreivės
   ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Kiekvienam ratui ir segmentui: ką jis padarė (stabdymo taškas, lėčiausias taškas, pilnos dujos ir t. t.) ir linija, kuria jis važiavo
   ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Kiekvienam ratui: jo automobilio valdymo įvykiai, kiekvienas sudėtas prieš ratą, su kuriuo jis ten lyginamas.
8. Kiekvienam ratui ir segmentui: laiko apskaita, palyginti su jo lyginamuoju ratu, ir radinys žodžiais.
9. Laiko žemėlapis ir priežasčių žemėlapis kiekvienam ratui.

Tekstai sukuriami dabartine kalba; pakeitus kalbą, analizė paleidžiama iš naujo (ir pervadinami demonstraciniai ratai). Analizės klaida rodoma po
**Ratai** mygtukais kaip klaida, o ratai lieka įkelti.

### Šaltinio failai {#source-files}

| Failas | Vaidmuo |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | ratų failų skaitymas |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | rato tipas, pavadinimai, demonstraciniai ratai |
| `src/race/derive.ts`, `handedness.ts` | išvesti kanalai, veidrodiniai pasauliai |
| `src/race/align.ts`, `segments.ts`, `line.ts` | atstumo ašis, posūkiai, linijos |
| `src/race/analysis.ts` | palyginti posūkiai, priežastys, radiniai |
| `src/race/envelope.ts`, `profile.ts` | ką automobilis gali |
| `src/race/control.ts`, `impacts.ts` | automobilio valdymas, smūgiai ir avarijos |
| `src/race/stats.ts` | daug ratų |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | atkūrimas ir piešimas |
| `src/race/schema.ts`, `graphs.ts` | kanalų lentelė, diagramų eilutės |
| `src/ui/race/*` | šoninė juosta, diagramos, HUD, žymos |
| `src/state/raceStore.ts` | skirtuko būsena ir atkūrimo laikrodis |

