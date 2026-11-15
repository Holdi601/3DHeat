---
title: "Masinė analizė"
nav_order: 8
lang: "lt"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Masinė analizė: tūkstančiai rungtynių iš karto

**Masinė analizė** parodo, ką sudaro visas rungtynių aplankas: kuri technika laimi dažniausiai, kuri pusė turi pranašumą, kur vyksta veiksmas. Naudokite ją, kai turite daug daugiau rungtynių, nei galėtumėte pažiūrėti.

Ji veikia pagal trumpą kiekvienų rungtynių santrauką, todėl tūkstantis ar dešimt tūkstančių rungtynių atsidaro greitai. Pilnas eilutes ji įkelia tik rungtynėms, kurias spustelėjate.

## Išbandykite {#try-it}

1. Heatmap šoninėje juostoje atidarykite **Masinė analizė**.
2. Paspauskite **Aplankas...** (arba **Failai...**) ir pasirinkite savo `.3dheat` rungtynes.
3. Palaukite, kol skydelis nuskaito santraukas ("Santraukos... n iš N").
4. Paspauskite **Atidaryti analizę**. Atsidaro langas su skirtukais.
5. Nustatykite filtrus (Žaidimas, Žemėlapis, Režimas, Iš, Į), tada peržiūrėkite skirtuką, pavyzdžiui, Balansas.
6. Spustelėkite eilutę, langelį ar įžvalgą: jos rungtynės įkeliamos į 3D vaizdą, kamera nukreipta į vietą.

![Balanso skirtukas: pergalių dalis ir nukovimai vienai mirčiai pagal techniką](../assets/img/en/mass-balance.webp)

```
.3dheat aplankas -> santraukos -> langas (skirtukai) -> spustelėkite eilutę -> rungtynės atsidaro 3D
```

Failas `.3dheat` yra viena rungtynės ([Vienas failas - viena rungtynės](container.md)). *Šilumos žemėlapis* ir *eilutė* paaiškinti [žodyne](glossary.md).

## Santraukų gavimas {#getting-the-summaries}

Daugumai žmonių nieko daryti nereikia: skydelis pats apskaičiuoja trūkstamas santraukas. Norėdami kartą paruošti didelį aplanką, naudokite toliau aprašytą neprisijungus veikiantį įrankį.

Kiekvienos `.3dheat` rungtynės gauna santrauką (`src/mass/summarize.ts`), saugomą konteineryje kaip narys `<match>.summary.json` (vaidmuo `summary`, žr. [Vienas failas - viena rungtynės](container.md)). Neprisijungęs įrankis jas parašo ir kiekvieno aplanko indeksą. Tai kūrėjo įrankis; paleiskite jį dideliam aplankui, kad skydeliui nereikėtų dirbti:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Rungtynės, jau apibendrintos (ta pati formato versija), tik nuskaitomos; `--force` apskaičiuoja iš naujo. `--no-write` palieka konteinerius nepakeistus.
- Failas, pakeistas per paskutines `--settle` minutes (10), praleidžiamas: konverteris gali dar jį rašyti.
- `<folder>/3dheat-index.jsonl.gz`: viena eilutė kiekvienoms rungtynėms - jų kelias, dydis, laikas ir santrauka be tinklelio. `<folder>/3dheat-index.grids.jsonl.gz`: viena eilutė kiekvienoms rungtynėms su jų tinkleliu.
- Paleiskite mašinoje, kurioje yra failai, mažu prioritetu (pavyzdžiui, `nice -n 19 ionice -c3` Linux sistemoje).

Skydelis kiekvienoms rungtynėms paima pirmą tinkamą: aplanko indekso eilutę (ta pati vieta ir dydis), naršyklės talpyklą (IndexedDB, pagal pavadinimą, dydį ir laiką), konteinerio narį `summary` arba santrauką, apskaičiuotą darbininkų baseine ir įrašytą į talpyklą. Taigi aplankas be indekso taip pat veikia - pirmąkart tokiu greičiu, kokiu skaitomos lentelės, po to iš talpyklos.

## Skydelis {#the-panel}

Pasirinkite aplanką (arba failus; **Pridėti aplanką...** prijungia kitą). Lange yra filtrai **Žaidimas**, **Žemėlapis**, **Režimas**, **Iš** ir **Į**, pasirinkimas **Skaidyti pagal**, **Mažiausiai gyvybių** ir **Tik žaidėjai**, ir šie skirtukai. Visi skaičiai ateina iš santraukų. Spustelėjus eilutę, langelį ar įžvalgą, jos rungtynės įkeliamos į vaizdą kaip daugelio rungtynių perdanga su filtrais, kurie ją rodo (technika, klasė, ginklas, komanda, žaidėjas), ir kamera nukreipta į vietą:

| Skirtukas | Kas čia |
|---|---|
| Apžvalga | rungtynės, valandos, žaidėjai, gyvybės, eilutės, datos; rungtynių per dieną; pagal žaidimą, žemėlapį, režimą; įvykių sumos; ekonomika pagal valiutą; kada rungtynių metu kas vyksta |
| Balansas | pagal techniką, klasę, ginklą ar komandą, skaidoma pagal žemėlapį, režimą, lygį ar žaidimą: K/D su jo ~95% intervalu, pergalių dalis (Wilson), išgyvenimas, nukovimai ir pataikymai per minutę, uždirbimas per minutę, ir q - Benjamini-Hochberg klaidingų atradimų dažnis K/D ir pergalei, lyginant su likusiu skaidymu. **Mažiausiai gyvybių** paslepia eilutes su per mažai gyvybių, kad jomis būtų galima pasitikėti; **Tik žaidėjai** palieka tai, ką vairavo misijos DI |
| Tendencijos | naudojimas (dalis nuo buvimo), K/D ar pergalių dalis geriausių technikų ar klasių per dieną, savaitę ar mėnesį |
| Žaidėjai | skirtingi žaidėjai, rungtynės vienam žaidėjui, žaidėjai vienose rungtynėse, dažniausiai pasitaikantys žaidėjai |
| Pusės | kiekviena kiekvieno žemėlapio pusė: rungtynės, laimėtos prieš lygų pasiskirstymą |
| Artimoji kova | raundų duomenys: pirmosios dvikovos pagal pusę ir jų konversija, prekybos, besišliejantis prieš laikantįjį, kryžminės ugnys, akinamos įėjimai, taiklumas, padėjimai, skaičių pranašumas ir, **Pagal žemėlapį**, vietos, kurios nužudo žaidėjus, įeinančius į jas - kiekvienas kaip dalis su savo Wilson intervalu, iš santraukų `cqb` skaičių ([Artima kova ir raundai](close-quarters.md)) |
| R6 paviršiai | Rainbow Six Siege žymės lygyje (kulkų skylės ir panašiai) pagal lygio paviršių: žymės, per žemėlapio raundą, kambarys, dalis, kurios šaulys nustatytas; spustelėjimas atveria žymių rūšis, šaulių operatorius ir ginklų klases bei tai, kur paviršiuje yra žymės (mažas ketvirčio metro ląstelių šilumos žemėlapis); paviršius išlaiko savo id visose vienos žemėlapio versijos rungtynėse. Iš santraukų `marks` skaičių |
| Žemėlapis | žemėlapio sumuotas tinklelis: buvimas, nukovimai, mirtys, K/D, bet koks įvykis, srautas ir **karšta kiek rungtynių** (stabilumas); pagal komandą, 1, 2, 4 ar 8 kartus didesnėje ląstelėje |
| Vietos | vietos, kurios išsiskiria skaičiuose, bet ne šilumos žemėlapyje (didelė sritis, užimta visumoje, koridoriai, aukščio juostos), ir vietos, kurių laikytojai laimi daugiau ar mažiau savo raundų; **Rasti vietas** |
| Nišos | grupės, kurios daro gerokai geriau ar blogiau nei kitos (technika viename žemėlapyje, sektorius vienoje aukštyje), ir raundų grupės, laimėtos daugiau, nei jų pusė laimėjo tose pačiose rungtynėse; **Rasti nišas** |
| Įžvalgos | masiniai detektoriai ir žemėlapio detektoriai (žemiau); **Kopijuoti ataskaitą (JSON)** duoda JSON, kurį skaito kalbos modelis |

## Įžvalgos iš daugelio rungtynių {#insights-over-many-matches}

Skirtukas **Vietos** randa vietas, kurios išsiskiria skaičiuose, bet ne šilumos žemėlapyje - didelę sritį, užimtą visumoje, koridorių, aukščio juostą, vietą, užimtą tik vienoje rungtynių dalyje - pažymi tas, kurių paprastas šilumos žemėlapis nerodo, kaip **paslėptas**, ir apibrėžia jas 3D vaizde; **Įkelti** nuskrenda ten su rungtynėmis, kurias ji laikė. Skirtukas **Nišos** randa grupes (technika viename žemėlapyje ir pusėje, sektorius vienoje aukštyje), kurios daro gerokai geriau ar blogiau nei kitos; spustelėkite vieną, kad pamatytumėte jos patikslinimus.

### Kas laimėjo {#who-won}

Kai rungtynės nurodo, kas laimėjo kiekvieną raundą ([baigties stulpelis](data-formats.md#outcome-columns) `won`), rezultatas yra atskiras tikslas:

- **Vietos: pergalių dalis.** Kiekvienai pusei jos raundų vietoje dalis, kurią ji laimėjo, prieš dalį, kurią ji laimėjo tose pačiose rungtynėse bet kur - taigi žemėlapio, pusės ir pačių rungtynių balansas yra atskaitos linija, ir išsiskiria tik vietos, kurių laikytojai laimi daugiau (ar mažiau) savo raundų. Išgalvotas pavyzdys: *„Dust: pusė T laimi daugiau savo raundų, kai yra čia: laimėta 61 % iš 412, prieš 49 %, tikėtiną pagal jos pačios dažnį tose pačiose rungtynėse (šansai 1,6x; laikyta 31/48 rungtynėse).“* Tas pats klaidingų atradimų dažnis ir stabilumo patikrinimai kaip kiekvienai vietai; **Įkelti** įkelia rungtynes, kuriose vieta buvo laikoma, ir rodo tos pusės pozicijas.
- **Nišos: raundo pergalė.** Lentelėje **Raundai** yra kiekvienos gyvybės raundas: žemėlapis, pusė, rungtynių dalis (raundai 1-4, 5-8, ...), technika (operatorius, agentas), daugiausia naudotas ginklas, ilgiausiai laikyta vieta, pirkimas (eco, force, full) ir ar jos pusė padarė pirmąjį nukovimą. Grupė vertinama pagal tai, ką jos pusė laimėjo tose pačiose rungtynėse, todėl *T Dust žemėlapyje su AWP* yra niša tik tada, kai tie raundai buvo laimėti dažniau nei kiti T raundai tose rungtynėse. Išgalvotas pavyzdys: *„m1 · T · AWP: laimi 80 % iš 320 raundų, prieš 62 %, tikėtiną iš tų pačių pusių tose pačiose rungtynėse (šansai 2,3x; 40 rungtynių).“* Rikiuojama pagal pakilimo ir paramos sandaugą; **Įkelti** įkelia rungtynes, kurių raunduose tai matyti labiausiai.

Abiem reikia 2 versijos santraukų (žr. [Santraukų gavimas](#getting-the-summaries)): senesnės apskaičiuojamos iš naujo.

Skirtukas **Įžvalgos** visose rungtynėse randa technikas, kurios prekiauja ar laimi geriau ar blogiau nei kitos, vietas, karštas stabiliai daliai rungtynių, puses, kurios laimi daugiau nei lygų pasiskirstymą, technikas, kurių naudojimas keičiasi per datas, ir rungtynių dalis, turinčias daugiau nukovimų nei lygus pasiskirstymas. Kiekviena išvada turi savo skaičius, efektą, intervalą ir klaidingų atradimų dažnį (laikomą 5%), o spustelėjimas įkelia jos rungtynes. Išsamiau: [Kūrėjams](#for-developers).

## Mastelis {#scale}

Galite patys pakartoti mažą šios analizės versiją: `node tools/demo-data.mjs` įrašo 150 sintetinių tankų rungtynių į `tools/.shots/demo/mass` (apie 1 000 eilučių kiekvienos). Išmatuota su tomis 150 sintetinių demonstracinių rungtynių iš `tools/demo-data.mjs` staliniame kompiuteryje (tikros rungtynės gerokai didesnės):

- `tools/3dheat-summarize.mjs` su 4 darbininkais: 2,6–4,8 s visoms 150, 8–21 ms rungtynei darbininko viduje; antras paleidimas, kuris tik skaito santraukas, trunka apie 2 s.
- Aplanko atidarymas skydelyje, kai indeksas yra, kol langas parodomas: 0,9–1,6 s (paties darbininko dalis, skaitant 150 indekso eilučių, yra 20–40 ms).
- Perjungimas į skirtuką, kol jo lentelė nupiešiama: Apžvalga 10–30 ms, Balansas 30–70 ms, Tendencijos 30–45 ms, Žaidėjai 15–35 ms, Pusės 15–20 ms, Žemėlapis 55–130 ms.
- Saugykla laiko 150 rungtynių apie 0,5 MB.

Langas atsidaro per vieną trumpą kadrą: pasirinkti failai siunčiami darbininkui po 16, o datų laukai ir pirmas skirtukas pasirodo kadrą vėliau.

Saugykla laiko apie 15 KB rungtynei, todėl 10 000 rungtynių darbininke užima ~150 MB; tinkleliai niekada nelaikomi ilgiau, nei reikia žemėlapiui.

## Kūrėjams {#for-developers}

### Įžvalgos iš daugelio rungtynių {#insights-over-many-matches}

`src/mass/detect.ts` - kiekviena išvada su savo skaičiais, efektu ir intervalu, p ir q (Benjamini-Hochberg per viską, ką bandė detektorius, laikoma 5%), išsamus įkėlimas, kuris įkelia jos rungtynes, ir sakinio raktas su jo reikšmėmis; ataskaita (`heat3d.mass/1`) yra tai, ką `massReportForModel` perduoda pasakotojui, tokios pačios formos kaip vienų rungtynių ataskaita (`insights/seam.ts`).

| Detektorius | Randa |
|---|---|
| `balance` | žaidėjo techniką, prekiaujančią ar laimėjančią geriau ar blogiau nei kitos žemėlapyje ar režime |
| `hotspot` | vietas, karštas stabiliai daliai rungtynių, kurios atėjo (karštos rungtynės / matytos rungtynės, lyginant su kitomis žemėlapio ląstelėmis) - ne tik karštos bendroje sumoje |
| `side` | žemėlapio pusę, laimėjusią daugiau nei lygų pasiskirstymą |
| `meta` | technikos dalį žaidėjų gyvybėse ar jos K/D, judančius tarp ankstesnės ir vėlesnės datų pusės, kiekviename žemėlapyje - pakankamai didelius, kad svarbu, tendencingus per ketvirčius, tuo pačiu būdu daugumoje žemėlapių (žr. žemiau) |
| `phase` | rungtynių ilgio dalį, turinčią daugiau nukovimų, pataikymų, paleidimų... nei lygus pasiskirstymas |
| `place` | vietas, kurios išsiskiria per daugelį rungtynių (B etapas, žemiau): regiono dažnis ar nukovimų dalis, lyginant su kiekvienų rungtynių savu; apskritimai, koridoriai, išaugusios zonos, aukščio juostos, fazės; paslėptos, kai paprastas šilumos žemėlapis jų nerodo |
| `niche` | grupes, kurios daro gerokai geriau ar blogiau (B etapas, žemiau) |
| `grid.*` | vieno duomenų rinkinio detektoriai (galios pozicijos, karštos ir ramios zonos, klasių vietos) kiekvieno žemėlapio sumuotuose tinkleliuose: `GridMerge.toInsightJob` užpildo įžvalgų etapo tinklelius iš santraukų; detektoriai, kuriems reikia trajektorijų, praleidžiami |

### Santrauka {#the-summary}

Paprastas JSON (`src/mass/types.ts`), apie 5-30 KB suspaustas vienoms rungtynėms:

- rungtynės: žaidimas, žemėlapis, režimas, misija, pradžia, trukmė, eilutės, gyvybės, žaidėjai, DI, komandos (gyvybės, žaidėjai, buvimas, nukovimai, mirtys, laimėjimas, pinigai), nugalėtojas;
- pagal techniką ir komandą: klasė, lygis, gyvybės, žaidėjų gyvybės, buvimas, įvykiai pagal kanoninę rūšį, nukovimai pagal taikinio klasę, pergalės, pinigai;
- pagal žaidėją (pagal vartotojo ID, kitu atveju pagal vardą): komanda, gyvybės, buvimas, nukovimai, mirtys, pataikymai, paleidimai, laimėjimas, technikos; pagal ginklą: įvykiai pagal rūšį;
- su rezultato stulpeliu (2 versija): laimėti ir sužaisti raundai pagal komandą, techniką
  (`rw`, kiekvienas po vieną gyvybę ir raundą), žaidėją ir ginklą (raundai, kuriuose pusė jį
  naudojo); kiekvienos gyvybės raundas (`outcome.u`: raundas, pusė, technika, daugiausia
  naudotas ginklas, ilgiausiai laikyta vieta, pirkimas, laimėta) ir kiekvieno raundo
  numeris, laimėtojas ir jo pirmojo nukovimo pusė (`outcome.r`);
- ekonomikos stulpeliai (`cost_*`, `earn_*`) ir jų sumos;
- fazės: įvykiai pagal rūšį 20 rungtynių ilgio intervalų ir pagal minutę;
- elgesys: rungtynių kolektyvinio elgesio matai (lygiavimas, maršruto ganymas, juostos, susigrūdimas, lyderiai, atsilikėliai, lūžio taškas, rizika po pralaimėjimų, serijos, pirkimo sutarimas, slopinimas), kiekvienas su savo nulinio modelio, p ir q - žr. [Kolektyvinis elgesys](collective-behaviour.md);
- tinklelis (žemiau).

Skaičiuojama taip, kaip skaičiuoja žiūryklė: stulpeliai randami taip, kaip juos randa daugelio rungtynių įkėlėjas (`leanSpec`), įvykiai pagal `data/canonical.ts`; Tacview ginklo nukovimas įskaitomas jo šaulio naudai; mirtis, pasakyta du kartus vienu metu (`dead`, `death`), skaičiuojama vieną kartą.

#### Tinklelis: ant ko remiasi B etapas {#the-grid-what-stage-b-builds-on}

Erdvinė dalis sukurta statistikai apie regionus bet kokio dydžio ir formos, o ne tik šilumos vaizdams:

- **Piramidė.** Ląstelės yra suderintos dvejeto laipsniai pasaulio vienetais (x, z kaip žiūryklė juos padeda). `k` lygis yra ląstelės, sumuotos pagal `ix >> k, iz >> k` - tiksliai, rungtynių viduje ir tarp rungtynių su kitokio dydžio ląstelėmis - ir bet koks regionas (dėžė, koridorius išilgai linijos, žiedas) yra ląstelių suma. Smulkiausias lygis tilpdamas tvirtą rungtynių apimtį (ląsteles, turinčias 99% buvimo) į 128 ląsteles; už jos esantys išklydimai išsaugomi.
- **Ekspozicija šalia kiekvieno skaičiaus.** Buvimo sekundės kiekvienai ląstelei, kiekvienai komandai (`pt`), kiekvienai techninės klasės (`pc`) ir kiekvienai aukščio juostai (`ph`), todėl regiono dažnis, lūkestis ir santykis skaičiuojami bet kuriam pogrupiui.
- **Aukštis.** Juostos virš rungtynių grindų (aukščio 1-asis procentilis): mažiau nei 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, daugiau; failas su stulpeliu `floor`/`storey`/`deck` juostomis skirsto pagal savo aukštus. `y` yra kiekvienos ląstelės vidutinis aukštis, `y0` - žemiausias (jos aukštas, aukščiui virš jo).
- **Įvykiai** kaip kortežai `[cell, kind, team, class, band, count]`.
- **Raundai pagal rezultatą** (2 versija, su rezultato stulpeliu ir dviem ar daugiau
  raundų): `pw` kaip `[cell, team, rounds won, rounds lost]` - raundai, kuriuos kiekviena pusė
  praleido ląstelėje sekundę ar ilgiau, pagal jos rezultatą raunde.
- **Laiko pjūviai** grubiame lygyje (8 ląstelės kiekvienoje pusėje), pagal minutę nuo rungtynių pradžios: `[cx, cz, minute, kind, value]`, buvimo sekundės kaip rūšis `GRID_KINDS.length`; rungtynių fazės yra minutės per trukmę.
- Retas, skaičiai sveikieji, sekundės iki dešimtosios: apribotas tuo, kas įvyko.

### B etapas: vietos ir nišos {#stage-b-places-and-niches}

B etapas ieško to, kas išsiskiria skaičiuose ir nepatraukia akies: didelė sritis, užimta visumoje, be karštos ląstelės; keista nukovimų ir mirčių santykis su nedaug įvykių; koridorius; aukščio juosta; klasteris, kuris yra tik vienoje rungtynių dalyje - ir grupes (technika viename žemėlapyje vienoje pusėje, sektorius vienoje aukštyje), kurios daro gerokai geriau ar blogiau nei kitos. Vienas **Rasti vietas** / **Rasti nišas** / **Rasti įžvalgų** paleidžia visus detektorius; trys skirtukai dalijasi ataskaita.

#### Vietos (`src/mass/scan.ts`) {#places-srcmassscants}

Kiekvieno žemėlapio rungtynės perskaitomos du kartus, po vienas kartas; atmintis laiko sumas rastre, ne daugiau nei 64 ląstelės kiekvienoje pusėje (16 erdvės ir laiko skenavimui), niekada ne pačias rungtynes.

- **Matai.** Įvykio dažnis per buvimo sekundę - nukovimai, mirtys, pataikymai, paleidimai, perėmimai, visiems vienetams, pagal klasę (4 su daugiausiai įvykių), pagal aukščio juostą - ir nukovimų dalis nukovimuose bei mirtyse (visi, pagal pusę, pagal juostą), ir kiekvienos pusės **pergalių dalis**: jos raundai ląstelėje laimėti prieš pralaimėtus (`pw`), kai 8 ar daugiau žemėlapio rungtynių skaičiuoja raundus pagal rezultatą. Kurios klasės ir pusės yra iš antraščių (`planOf`).
- **Lūkestis pagal rungtynes.** Kiekvienų rungtynių dažnis, paskirstytas per tos ląstelės buvimą, yra ląstelės lūkestis (Kulldorff skenavimas su kovariatėmis, sluoksniuotas pagal rungtynes): keletas kruvinų rungtynių ar vienas užimtas serveris nesukuria vietos. Pergalių daliai lūkestis yra pačios pusės laimėtų raundų dalis tose rungtynėse, todėl žemėlapio ir pusės balansas niekada netampa vieta. Raundas keliose srities ląstelėse skaičiuojamas kiekvienoje; sklaida, išmatuota srities dydžiu, tai įvertina.
- **Sklaida.** Rungtynės labai nesutampa daugiau nei Puasonas. Kiekvienų rungtynių liekanos sudedamos blokais po 1, 2, 4, 8, 16 ląstelių; kiekvieno bloko dydžio sklaida (kvadratinės liekanos per nulinę dispersiją, sujungtos, blogiausi 5% blokų išmetami) keičia kiekvieną to dydžio regiono testą: kvazi-tikėtinumo santykis, Puasonas dažniams, binominis dalims.
- **Regionai.** Apskritimai nuo 0,75 iki 18 ląstelių; elipsės šešiuose kampuose, 3 ir 6 kartus ilgesnės nei pločio, 3-18 ląstelių (koridoriai; ašis yra įžvalgos `place.path`); zonos, išaugintos ląstelė po ląstelės nuo stipriausių vietinių Getis-Ord Gi* ląstelių, kol regiono z auga (netaisyklingos formos) - išaugintos vienoje rungtynių pusėje ir išbandytos kitoje, todėl augimo laisvė nekainuoja klaidingų vietų; kiekviena aukščio juosta, lyginama su kitomis rungtynių juostomis per visą žemėlapį (klasterių atsparumas); erdvės ir laiko cilindrai: apskritimas per vieną ar du penktadalius rungtynių trukmės, lyginamas su rungtynių savo įvykių išsibarstymu per vietą ir laiką (erdvės ir laiko permutacijos skenavimas).
- **Testavimas.** p iš kvazi-tikėtinumo; Benjamini-Hochberg per kiekvieną išbandytą regioną kiekviename žemėlapyje (įprasta 700 000 trijuose žemėlapiuose) 5%. Tai, kas praeina, apkarpoma (regionas, didžiąja dalimi esantis stipresnio to paties matas viduje, sako tą patį), perskaitoma dėl savo **stabilumo** - rungtynės, kurios jį matė, rungtynės, kuriose jis laikė, jo kryptis penkiose rungtynių dalyse - ir dar kartą išbandoma tuo sklaidos lygiu, kurį rodo pačios rungtynės (klasterių atsparumas, rungtynės kaip klasteriai, niekada pagal Puasoną), BH dar kartą. Ramios vietos bazėje (2% ar daugiau žemėlapio atsiradimų, pakilimų ir nusileidimų) išbraukiamos.
- **Efektas.** Dažnio (ar šansų) santykis, sumažintas empiriniu Bajesu (gama apriorinis, pritaikytas prie žemėlapio 2x2 blokų), su ~95% intervalu esant sklaidai; Gi* 1, 2 ir 4 ląstelėse ir vietinis Moran centre.
- **Vizualus akivaizdumas.** Kiek regionas jau rodomas paprastame jo įvykio šilumos žemėlapyje (logaritminė skalė iki ryškiausios ląstelės, kaip ją piešia vaizdai): jo kontrastas su aplink jį esančiu žiedu (dešimtadalis paletės sunkiai matomas, du penktadaliai paprastai) ir ryški viršūnė, nešanti perteklių; santykio šilumos žemėlapis niekada nepiešia, todėl dalis skaičiuojama per pusę. Žemiau 35% yra **paslėpta**. Rangas: stiprumas (efektas, prisotinamas 4 kartais, ramios vietos 0,7) kartus `1 - 0,7 x akivaizdumas` kartus sutapimas tarp dalių.

Skirtukas **Vietos** juos išvardija (pagal numatytuosius paslėptos; pagal žemėlapį, formą, kryptį); spustelėjimas apibrėžia žemėlapio vietas 3D vaizde (`placeLines.ts`: variklio viršutinės linijos, sukurtos vieną kartą - magenta paslėpta, gintarinė paprasta, ciano ramia, pasirinkta visa; juosta kaip dėžė nuo grindų iki lubų) ir skirtuko Žemėlapis drobėje; **Įkelti** nuskrenda ten ir įkelia 60 rungtynių, kurias ji laikė dažniausiai, filtruotas pagal savo įvykį (ir klasę).

#### Nišos (`src/mass/niche.ts`) {#niches-srcmassnichets}

Pluošto paieška (plotis 24, gylis 3) per tris lenteles: **gyvybės** (žaidėjų gyvybės: žaidimas, žemėlapis, režimas, klasė, technika, pusė, lygis, datų ketvirtis, rungtynių trukmės trečdalis; K/D, pergalė, mirtis gyvybei, nukovimai per valandą, uždarbis per minutę), **vietos** (nukovimai ir mirtys pagal žemėlapį, režimą, datas, žemėlapio sektorių 4 x 4, klasę, pusę, juostą) ir **fazės** (sektorius ir rungtynių penktadalis: K/D, mirtys per valandą buvimo). Grupė lyginama su visu, rungtynės kaip klasteriai (sumuota liekanų dispersija pagal rungtynes), jos efektas - šansų ar dažnio santykis, sumažintas 20 rezultatų apriorine verte; reikia 30 rezultatų 8 rungtynėse, patikslinimas turi būti 10% stipresnis nei jo tėvas; grupės, kuriose rezultatas yra joks ar visas (jiems neįrašytas), išbraukiamos. Paliekama: BH mažesnis nei 5% per visas įvertintas grupes, sumažintas santykis bent 1,25 (ar 1/1,25), keturios iš penkių dalių sutinka, ir ne patikslinimas, kuris tik kartoja savo tėvą. Skirtukas **Nišos** jas išvardija; spustelėjimas parodo visus vienos sąlygos patikslinimus (naršyklė), **Įkelti** įkelia jos rungtynes. Įranga dar nėra santraukose.

Ketvirtosios lentelės, **raundai** (`roundsTable`), tikslas yra raundo rezultatas: viena eilutė kiekvienos gyvybės raundui - žemėlapis, pusė, rungtynių dalis (raundai 1-4, 5-8, ...), technika, daugiausia naudotas ginklas, ilgiausiai laikyta vieta, pirkimas, pirmasis nukovimas ar pirmoji mirtis - vertinama pagal savo pusės pergalių dalį savo rungtynėse (Mantel-Haenszel sluoksniuotas lūkestis: liekana yra `won - e`, `e` pusės dalis rungtynėse), todėl niša niekada nėra žemėlapio ar pusės balansas. Rungtynės lieka klasteriais. Jos z kalibruojamas: ta pati spindulio paieška paleidžiama aštuonis kartus su rezultatais, sumaišytais tarp kiekvienų rungtynių kiekvienos pusės raundų (pusės dažnis kiekvienose rungtynėse išlaikomas), o šių nulinių z sklaida virš standartinio normaliojo skirstinio - pagal sąlygų skaičių, iš vidurio (mediana / 0,674) ir uodegos (99-asis procentilis / 2,576), didesnė, niekada ne mažiau nei 1 - padalija tikruosius prieš jų p ir klaidingų atradimų dažnį (empirinis nulis, Efron 2004). Gilesnės grupės gauna didesnę skalę: spindulys išlaiko patikslinimus grupių, atrinktų dėl didelio z. Nišos bazė yra jos pačios lūkestis, jos pakilimas - procentiniai punktai virš jo, ir ji rikiuojama pagal pakilimo ir jos raundų skaičiaus kvadratinės šaknies sandaugą, išlaikomą įrodymų ir dalių (`wracc` yra parama kart pakilimas). Ji neša rungtynes, kuriose ji labiausiai pasireiškė (`matchIds`), ir keletą jų raundų (`rounds`, `[match, round]`) išsamesnei peržiūrai.

#### Metų pokyčiai su praktine reikšme {#meta-shifts-with-practical-significance}

Mišriose datose binominis testas su gyvybėmis pažymėdavo beveik kiekvieną pokytį kaip reikšmingą. Dabar `meta` testuojamas klasterių atsparumu (kiekvienų rungtynių gyvybės - klasteris), palieka technikos pokytį tik jei jis siekia bent 2 procentinius punktus ir 25%, K/D pokytis - 1,3 karto, datų ketvirčiai juda ta pačia kryptimi (Kendall tau bent 0,5), o technikai keliuose žemėlapiuose - ta pati kryptis daugumoje jų. Tai palieka tik kelis pokyčius bandymų rinkinyje, kur paprastas testas pažymėjo beveik visus.

#### Modeliui {#for-a-model}

`massReportForModel` kiekvienai vietai duoda jos `region` (forma, paslėpta, akivaizdumas, aukščiai, fazė), o kiekvienai nišai - jos `conditions`, ir kiek regionų bei grupių buvo išbandyta. Žinių objektyvas gali skaityti vietas kaip mirties zonas ir puolimo kryptis: jų rūšys yra `place.*` ir `niche.*`.

#### Patikrinimai {#checks}

`scan.test.ts` įdeda išsklaidytą sritį (1,6 karto didesnis mirties dažnis apskritime iš 22 ląstelių, silpna kiekvienoje ląstelėje), koridorių, aukščio juostą ir tik fazės klasterį į 240 sintetinių per-didelės sklaidos rungtynių - visi rasti, išsklaidyta paslėpta - ir paleidžia aštuonis nulinius rinkinius po 60 rungtynių: jokios vietos. `niche.test.ts` randa įdėtą techniką x žemėlapis x pusė grupę ir nieko penkiose nulinėse lentelėse.
`outcome.test.ts` tikrina 2 versijos santrauką (laimėti raundai pagal pusę, vienetą, žaidėją ir ginklą, `pw`, vienetų raundai); įdeda juostą, kurios pusė laimi 70 % savo raundų prieš 35 % (kiekvienos rungtynės su savo balansu) - rasta - ir paleidžia 20 nulinių rinkinių po 50 rungtynių, kur juostos nieko nesako: jokios pergalių dalies vietos; įdeda AWP viename žemėlapyje, kuris laimi savo pusės raundus 30 procentinių punktų dažniau - rastas su savo rungtynėmis ir raundais - ir paleidžia 30 nulinių rinkinių po 80 rungtynių, kur kiekvienos rungtynės turi savo balansą, o viena pusė stipresnė viename žemėlapyje: jokios nišos.
