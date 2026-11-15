---
title: "Rungtynių analizė (CS2)"
nav_order: 10
lang: "lt"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: true
---

# Rungtynių analizė (Counter-Strike 2)

Skirtukas **Match** (Rungtynės) atkuria įrašą kaip figūras, o Counter-Strike 2 rungtynėms jis taip pat rodo rezultatų lentelę: kas laimėjo kiekvieną raundą, kaip ir kas gavo nukovimus. Naudokite jį rungtynėms peržiūrėti raund po raundo, po to nušokite į tą patį momentą šilumos žemėlapyje.

Skirtukas Match atkuria bet kurį įrašą kaip figūras: War Thunder ar Tacview įrašą arba CS2 demonstraciją, išvardytą skyriuje **Rungtynės pakartojime** ([Rungtynių pakartojimas](match-replay.md)). CS2 failas `.match.json` prideda šiame puslapyje aprašytą rezultatų lentelę.

## Peržiūrėkite CS2 rungtynes {#review-a-cs2-match}

1. Konvertuokite demonstraciją ([žemiau](#where-the-data-comes-from)) į `.parquet` ir `.match.json` failą.
2. Skirtuke **Heatmap** (Šilumos žemėlapis) įkelkite `.parquet` failą skyriuje **Source** (Šaltinis).
3. Atidarykite skirtuką **Match** ir paspauskite **Įkelti rungtynių failus…**, arba nuvilkite `.match.json` failą ant vaizdo.
4. Spustelėkite rungtynes skyriuje **Rungtynių santraukos**, tada raundo juostos langelį, kad atidarytumėte tą raundą.
5. Spustelėkite **Rodyti raundą**, kad pamatytumėte tą raundą šilumos žemėlapyje, arba **Pakartoti raundą**, kad žiūrėtumėte jį kaip figūras.

![Skirtukas Match: raundų juosta su atidarytu raundu, nukovimų srautas ir rezultatų lentelė](../assets/img/en/match-analysis-round.webp)

Tokie žodžiai kaip KAST, ADR, eco, force buy ir trade yra [žodyne](glossary.md#counter-strike-words).

## Iš kur gaunami duomenys {#where-the-data-comes-from}

[3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) demonstracijų konverteris
paverčia demonstracijas į du failus kiekvienoms rungtynėms, aplanke kiekvienam žemėlapiui:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Failas | Įkeliamas į | Turi |
|---|---|---|
| `<match>.parquet` | skirtuką **Heatmap** (Šaltinio skydelis, kaip bet kurį Parquet - vienas failas, keli arba visas aplankas) | kiekvieno žaidėjo padėtį aštuonis kartus per sekundę ir kiekvieną įvykį, kur jis įvyko: nukovimą, mirtį, sužalojimą, šūvį, metimą, dūmus, apakinamąją, HE, molotovą, klaidinantį taikinį, apakinimą, padėjimą, nuvalymą, sprogimą; su `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, žiūrėjimo kryptimi, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | skirtuką **Match** | komandas, rezultatą, kiekvieną raundą (nugalėtoją, kaip, ekonomiką, padėjimą, kiekvieną nukovimą eilės tvarka, kliučius, išlikusiuosius), kiekvieno žaidėjo rezultatų eilutę |

Parquet failo poraštė turi skaitymo nurodymus (raktas `heat3d`), todėl jis atsidaro be jokių nustatymų: žaidėjas kaip asmuo, pusė kaip grupė, kiekvienas raundas (`roundId`, "<match> #NN") kaip sesija, įjungta žiūrėjimo kryptis, o pasaulis - teisinga kryptimi (CS2 pasaulis yra dešiniarankis su Z aukštyn; perskaitytas kaip numatytasis Z aukštyn atvaizdavimas, atrodytų veidrodiškas). Žr. [Stulpelių atvaizdavimas](column-mapping.md) ir [Failų įkėlimas](loading-files.md). `python -m heat3d_cs2 map <map>` eksportuoja žemėlapio geometriją tuo pačiu rėmu, įkeliamą skirtuke **Level**.

Skaičių pagrindas yra konverterio (jis aprašytas jo README ir perduodamas kiekvienoje santraukoje): mirtis yra **atkeršyta** (traded), kai jos žudikas nužudomas vieno iš aukos komandos draugų per **5 s**; **KAST** yra raundų, kuriuose buvo nukovimas, asistas (apakinimo asistas skaičiuojamas), išlikimas ar atkeršyta mirtis, dalis; **žala** yra tikrai prarasta sveikata, tik priešams; **klutčas** (clutch) yra paskutinis gyvas pusės narys, kai stovi priešai, laimėtas, kai laimi pusė; **pirkimas** kiekvienai pusei pagal vidutinę įrangos vertę freeze laiko pabaigoje - pirmasis kiekvienos reguliariosios pusės raundas yra pistoleto raundas (overtime metu nėra), tada žemiau $1 500 - eco, žemiau $4 000 - force buy, daugiau - pilnas pirkimas.

## Skirtukas {#the-tab}

Skirtuko Match šoninėje juostoje viršuje yra šilumos žemėlapio režimo jungiklis ir sesijos pasirinkėjas, po to - rungtynių skyriai, o žemiau - šilumos žemėlapio **Filtrai**, **Level** ir **Camera** skydeliai; vaizdas yra šilumos žemėlapis to Parquet, kuris įkeltas skirtuke Heatmap.

### Rungtynių santraukos {#match-summaries}

| Valdiklis | Ką daro |
|---|---|
| **Įkelti rungtynių failus…** | pasirenka `.json` failus (keletą iš karto): `.match.json` santraukas |
| nuvilkti ant vaizdo | JSON failai, nuvilkti ant vaizdo, kol atidarytas skirtukas Match, įkeliami taip pat (kiti failai ignoruojami) |
| **Išvalyti** | pašalina visas rungtynes |
| **Visos rungtynės** (kai dvejos ar daugiau) | "N rungtynių, M raundų": statistika visoms kartu |
| rungtynių eilutė | "TeamA 13 vs TeamB 9", žemėlapis · N raundų: atidaro tas rungtynes |

Failas priimamas, kai tai JSON su `"format": "heat3d-cs2-match"` ir masyvais `rounds`, `players` ir `teams`. Klaidos išvardytos po mygtukais: "<file>: not JSON" (<failas>: ne JSON), "<file>: not a CS2 match summary (heat3d-cs2-match)" (<failas>: tai nėra CS2 rungtynių santrauka (heat3d-cs2-match)), "<file>: rounds, players or teams missing" (<failas>: trūksta rounds, players ar teams). Rungtynės, įkeltos iš naujo (tas pats `match` pavadinimas), pakeičia ankstesnes. Rungtynės surikiuotos pagal žemėlapį, o tada pagal pavadinimą. Kai įkeltos tik vienos rungtynės, jos atidaromos; kitaip pasirinkimas lieka (pagal numatymą - visos rungtynės).

Kai nieko neįkelta, skyrius paaiškina: konvertuokite su `python -m heat3d_cs2 demos`, čia įkelkite `.match.json` failus, o skirtuke Heatmap - `.parquet` failus.

### Rungtynės (atidarytos viena) {#match-one-match-open}

**Antraštė:** abi komandos su savo rezultatu, žemėlapis, pusės - "pusės 7-5, 6-6": raundai 1-12 ir 13-24 (premjeros ir varžybų žaidimas MR12; santraukos pačios pateikiamas pusės ilgis, jei jis nurodytas, taigi 1-15 ir 16-30 MR15) - tada, kai rungtynės pateko į pratęsimą, jos rezultatas atskirai: "pratęsimas 4-2", raundai po abiejų pusių. Lygiųjų raundas neskaičiuojamas nė vienai komandai. Ir "N raundų nutraukta demonstracijoje", kai santraukoje yra nebaigti raundai.

**Raundų juosta:** langelis kiekvienam raundui, nuspalvintas pagal pusę, kuri laimėjo, su jo numeriu ir žyma, kaip jis baigėsi. Lygusis raundas (nugalėtojo nėra) yra neutralus pilkas langelis su žyma `=`, niekada ne pusės spalva; jo patarimas sako "Round 30: a draw - neither side won it" (30 raundas: lygiosios - nė viena pusė jo nelaimėjo).

| Žyma | Baigė |
|---|---|
| B | bomba sprogo |
| D | bomba nuvalyta |
| K | visi pašalinti |
| T | baigėsi laikas |
| S | pasidavimas |
| = | lygiosios |
| ? | kita |

Skirtukas žymi antrosios pusės pradžią (13 raundas arba raundas po santraukos pusės ilgio) ir kiekvieną trijų raundų pratęsimo pusę (25, 28, 31, …). Užvedus ant langelio: "Round 7: TeamA (T) - bomb exploded, planted A" (7 raundas: TeamA (T) - bomba sprogo, padėta A) ("…, planted, site unknown" - padėta, vieta nežinoma, kai santraukoje vietos nėra) ir abiejų pusių pirkimas bei įrangos vertė. Spustelėkite, kad atidarytumėte raundą; spustelėkite dar kartą, kad uždarytumėte ("Click a round for its kills, economy and replay." - spustelėkite raundą, kad pamatytumėte nukovimus, ekonomiką ir pakartojimą).

**Raundas:**

- "Round 7: <team> won - <how>" (7 raundas: <komanda> laimėjo - <kaip>) ("Round 30: a draw - neither side won it" - 30 raundas: lygiosios - nė viena pusė jo nelaimėjo), kai lygiosios, ir kiek laiko truko raundas (nuo freeze pabaigos iki sprendimo, m:ss);
- ekonomika: kiekvienos pusės komanda, pirkimas (pistoletas, eco, force buy, full buy) ir įrangos vertė ("$4,350");
- padėjimas: vieta, žaidėjas ir laikas raunde (iš bet kurios santraukos versijos); "Planted by <player> at 1:05, site unknown" (Padėjo <žaidėjas> 1:05, vieta nežinoma), kai vieta nežinoma;
- **nukovimų srautas** eilės tvarka: laikas raunde, puolėjas (pusės spalva; "world", kai puolėjo nėra), ginklas ir žymos - **HS** galvos šūvis, **WB** pro sieną, **SM** pro dūmus; **open** (pirmas raundo nukovimas), **trade** (atkeršyta komandos draugui per 5 s), **traded** (žudikas buvo nužudytas per 5 s), **team** - komandos draugo nukovimas (savižudybė nėra); nukovimai, įvykę po to, kai raundas jau buvo nuspręstas, yra pritemdyti;
- klutčai: "<player> (T) alone against 3: won the clutch" (<žaidėjas> (T) vienas prieš 3: laimėjo klutčą) / "lost it" (pralaimėjo);
- kas buvo gyvas pabaigoje, pagal pusę ("nobody" - nieks);
- **Rodyti raundą**: viskas šiame raunde, šilumos žemėlapyje;
- **Pakartoti raundą**: atkuria raundą kaip dėžes, nuo jo pradžios (žemiau).

Mygtukai **Rodyti šilumos žemėlapyje** (žr. [žemiau](#show-in-the-heatmap)) šioms rungtynėms arba atidarytam raundui.

### Rezultatų lentelė {#scoreboard}

Lentelė kiekvienai komandai, eilutė kiekvienam žaidėjui:

| Stulpelis | Yra |
|---|---|
| K, D | nukovimai, mirtys |
| A | asistai, įskaitant apakinimo asistus |
| ± | nukovimai minus mirtys (žalia virš 0, raudona žemiau) |
| ADR | žala raunde, tikrai prarasta sveikata |
| KAST | % raundų su nukovimu, asistu, išlikimu ar atkeršyta mirtimi |
| HS | % galvos šūvio nukovimų |
| Open | laimėtos-pralaimėtos pirmosios dvikovos |
| Cl | laimėti / sužaisti klutčai |

Užvedus ant žaidėjo: nukovimai atkeršijimu (trade), kiek kartų atkeršyta, apakinimo asistai, apakinti priešai, žala naudingais daiktais ir raundai su keliais nukovimais ("2×3k"). **Spustelėkite žaidėją**, kad jo nukovimai ir mirtys būtų parodyti šilumos žemėlapyje (šias rungtynes).

### Per rungtynes (Visos rungtynės) {#across-matches-all-matches}

Visose įkeltose rungtynėse:

- "N rungtynių · M raundų · <žemėlapiai>", ir "N rounds drawn, won by neither side" (N raundų lygiosios, nė viena pusė nelaimėjo), kai buvo lygiųjų;
- **Laimėti raundai** kiekvienai pusei: bendrai, **pistoleto** raunduose (santraukos pistoleto raundai) ir **eco**, **force** ir **full** pirkimuose (kiekvienas kaip procentas su sužaistų raundų skaičiumi; užvedus - "won of played", laimėta iš sužaistų). Lygusis raundas sužaistas abiejų pusių ir nelaimėtas nė vienos;
- **Bomba**: padėjimai pagal vietą ir kaip dažnai T pusė toliau laimėjo tuos raundus ("12 plants on A (T won 67%)" (12 padėjimų ant A (T laimėjo 67%))), padėjimai, kurių vietos santrauka pati nežino ("2 plants on an unknown site (T won 50%)" (2 padėjimai nežinomoje vietoje (T laimėjo 50%))), arba "never planted" (niekada nepadėta); kaip baigėsi raundai, dažniausi pirmi;
- "The side that took the opening kill won N% of those rounds." (Pusė, kuri padarė pirmąjį nukovimą, laimėjo N% tų raundų.) (savižudybė nėra pirmasis nukovimas; lygusis raundas nepaverčia pirmojo nukovimo);
- **Pirmosios dvikovos, kur**: dešimt vietų su daugiausia pirmųjų nukovimų (pagal tai, kur buvo auka; žaidimo vietų pavadinimai paversti į skaitomus, "TopofMid" → "Top of Mid"), dvikovos ir dalis, kurią laimėjo T pusė;
- **Žaidėjai**: penkiolika geriausių pagal nukovimus minus mirtis, sujungtų visose jų rungtynėse (sutapatinta pagal Steam ID): rungtynės, K-D, ADR ir KAST, svertiniai pagal sužaistus raundus, HS% svertinis pagal nukovimus, pirmosios dvikovos. **Spustelėkite žaidėją**, kad jo nukovimai ir mirtys per visas rungtynes būtų parodyti šilumos žemėlapyje.

Po tuo yra mygtukai Rodyti šilumos žemėlapyje visoms įkeltoms rungtynėms.

## Rodyti šilumos žemėlapyje {#show-in-the-heatmap}

Kiekviena nuoroda nustato paties šilumos žemėlapio **filtrus**, todėl tai, kas rodoma, lieka matoma ir redaguojama skydelyje Filtrai, o **Rodyti visas** juos išvalo. Jie veikia su šilumos žemėlapio lentele, įkelta skirtuke Heatmap; skirtukas Match jos niekada pats neįkelia.

| Mygtukas | Rodomi įvykiai |
|---|---|
| **Padėtys** | `position` - kur buvo žaidėjai, aštuonis kartus per sekundę |
| **Nukovimai** | `kill` - kur stovėjo žudikas |
| **Mirtys** | `death` - kur krito auka |
| **Pirmieji nužudymai** | `kill` ir `death` su `opening` = 1 - pirmasis kiekvieno raundo nukovimas, kur stovėjo abu (siūloma tik tada, kai lentelėje yra `opening` stulpelis) |
| **Dūmai** | `smoke` - kur nusileido dūmai |
| **Apakinamosios** | `flash` - kur sprogo apakinamosios granatos |
| **Molotovai** | `molotov` - kur degė molotovai ir padegamosios granatos |
| **HE** | `he` - kur sprogo HE granatos |
| **Padėjimai** | `plant` - kur buvo padėta bomba |
| **Šūviai** | `shot` - kur buvo šaudoma |

Taikoma pagal tai, kur yra mygtukai: visos įkeltos rungtynės, šios rungtynės arba šis raundas ("Show in the heatmap - round 7" (Rodyti šilumos žemėlapyje - 7 raundas)).

Tai, ko negalima pritaikyti, pasakoma po mygtukais, o ne tyliai išfiltruojama iki nieko: "no match column retained - match not applied" (rungtynių stulpelis neišsaugotas - rungtynės nepritaikytos), "match: X not in the loaded data" (rungtynės: X neįkeltų duomenų tarpe), tas pats raundui ir įvykiams, "player X not in the loaded data" (žaidėjo X nėra įkeltuose duomenyse), "side X not in the loaded data" (pusės X nėra įkeltuose duomenyse), "no heatmap data loaded: load the matches' .parquet files in the Heatmap tab" (šilumos žemėlapio duomenys neįkelti: įkelkite rungtynių .parquet failus skirtuke Heatmap). Kai duomenys neįkelti, nuorodos taip pat sako "Load the matches' .parquet files in the Heatmap tab to see them on the map." (Įkelkite rungtynių .parquet failus skirtuke Heatmap, kad jas pamatytumėte žemėlapyje.)

**Pakartoti raundą** papildomai perjungia šilumos žemėlapį į **Box replay** (dėžių pakartojimas), laiko juostą - į *play* (groti) režimą su langu *lifetime* (gyvavimo trukmė), nukreipia į raundo sesijos pradžią ir groja. Kai raundas nėra įkeltų duomenų sesija: "this round is not a session of the loaded data: nothing to replay" (šis raundas nėra įkeltų duomenų sesija: nėra ką pakartoti).

## Kūrėjams {#for-developers}

Kodas: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Santraukų versijos {#summary-versions}

Skirtukas skaito 1 ir 2 versijos santraukas (`"version"` faile) greta viena kitos ir traktuoja jas vienodai:

| | 2 versija | 1 versija |
|---|---|---|
| padėjimo laikas | sekundės raunde, kaip nukovimai | rungtynių sekundės; skirtukas atima raundo pradžią |
| padėjimo vieta | `A` arba `B`; tuščia, kai demonstracija to nesako | `A`, `B` arba subjekto numeris - skaitoma kaip nežinoma vieta |
| pusės ilgis | `halfLength`, nuo to, kur pusės pirmą kartą keičiasi; 12, kai jis null | 12 (MR12) |
| pistoleto raundai | `pistolRounds` (1 raundas ir pirmasis raundas po pusės) | raundai, kurių pirkimas yra `pistol` |
| lygusis raundas | `winner` ir `winnerTeam` tušti | - |
| savižudybė | `suicide` ties nukovimu, niekada ne komandos draugo nukovimas | nustatoma pagal tai, kad puolėjas ir auka yra tas pats žaidėjas |

Nukovimo `noscope` ir `attackerBlind` (2 versija) skirtuke Match nerodomi, o skirtukas taip pat nerodo vietos iš šilumos žemėlapio lentelės, todėl tuščias granatos eilutės `place` ten nieko nekeičia.

Kaip židinys tampa filtrais (`focusFilters`):

- **match** → kategorijos filtras `match` stulpeliui;
- **round** → intervalo filtras `round` = N skaitiniam stulpeliui `round` (kategorijos filtras kategoriniam), o raundo sesija (`<match> #NN`) pasirenkama sesijos pasirinkėjuje;
- **events** → kategorijos filtras stulpeliui `event`;
- **player** → asmens filtras tam žaidėjui;
- **side** → grupės filtras.
