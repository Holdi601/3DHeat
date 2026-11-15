---
title: "Skirtumas"
parent: "Šilumos režimai"
nav_order: 5
lang: "lt"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: false
---

# Skirtumas

Raudona, kur A komanda buvo daugiau, žalsvai mėlyna, kur daugiau buvo B komanda, nieko, kur jos buvo lygios.

**Skirtumas** (klavišas 2) yra ženklą turinti šiluma. Vienos populiacijos eilutės prideda šilumą, kitos populiacijos eilutės ją atima. Ten, kur abi pusės persidengia lygiai, rezultatas lygus nuliui ir visiškai permatomas; ten, kur viena pusė vyrauja, ji rodoma tos pusės spalvomis – pagal numatymą šiltomis (skaidri → raudona → geltona → balta) **+** pusei ir vėsiomis (skaidri → žalia → mėlyna → violetinė) **−** pusei.

![Skirtumo šiluma: raudona, kur + pusė buvo daugiau, žalia ir mėlyna, kur - pusė buvo daugiau](../assets/img/en/difference-split.webp)

## Kaip naudoti {#how-to-use-it}

1. Paspauskite `2` (arba pasirinkite **Skirtumas** režimų juostoje).
2. Šoninėje juostoje atidarykite **Skirtumo skaidymas**.
3. Pasirinkite, ką **Skaidyti pagal**: dažniausiai *Grupes*.
4. Vieną grupę (arba reikšmę) įdėkite į **+**, kitą – į **−**.
5. Skaitykite spalvas: šiltos reiškia + pusę, vėsios – − pusę. Skiltis perspėja, jei vienoje pusėje nėra eilučių (žr. [Pranešimai, kuriuos galite matyti](#messages-you-may-see)).

*Kurios dvi populiacijos* – visas klausimas, todėl skaidyti galima pagal bet kurį išsaugotą stulpelį, ne tik pagal grupes. Eilutės, patenkančios **nė į vieną** pusę, **neįtraukiamos**, o ne laikomos nuliais: būtent dėl to skaidymas per dvi iš daugelio reikšmių palygina tik tas dvi. Tai dera su [filtrais](filters.md): atrinkite vieną žemėlapį, tada skaidykite pagal versiją.

Režimui reikia dviejų pusių: grupių stulpelio su bent dviem grupėmis arba skaidymo pagal stulpelį, išsaugotą filtravimui. Duomenims su mažiau nei dviem grupėmis įkėlimas pradeda nuo stulpelio skaidymo – pirmiausia **Failo šaltinis** stulpelio, jei kelių failų įkėlimas, kitaip pirmo kategorijos stulpelio su dviem reikšmėmis, kitaip pirmo skaitinio stulpelio su intervalu – todėl *palyginti du įkėlimus* veikia ir duomenims be grupių. Režimas nepasiekiamas tik duomenims, kuriuose nėra nieko tokio; taip pat ir tada, kai stulpelio skaidymas vienoje pusėje neturi nieko.

## Skirtumo skaidymo skiltis {#the-difference-split-panel}

Rodoma Skirtumo režime, po šilumos skiltimis.

**Skaidyti pagal** siūlo:

| Pasirinkimas | Rodoma kaip | Skaidymo taisyklė |
|---|---|---|
| Grupės | *Grupė (N)* (kai yra grupių stulpelis) | Kiekviena grupė į +, − arba nė vieną, nustatoma [Komandų sąraše](teams-list.md) |
| Kategorijos stulpelis | *stulpelis (N reikšmių)* | Reikšmės į +, − arba nė vieną |
| Skaitinis stulpelis | *stulpelis (skaitinis)* | Reikšmių intervalas kiekvienai pusei |
| Šaltinio failas | *Failo šaltinis – palyginti du įkėlimus* (kai įkelta keli failai) | Failai į +, − arba nė vieną |

Siūlomi tik stulpeliai, paliekami skiltyje *Palikti filtravimui* įkeliant.

### Lyginti dalis, ne kiekius {#compare-shares-not-counts}

**Lyginti dalis, ne kiekius** (numatytoji – išjungta) kiekvieną pusę sveria pagal vieną, padalytą iš jos eilučių skaičiaus, todėl pusė su penkis kartus daugiau eilučių nelaimi vien skaičiais. Spalva tada rodo, kur kiekviena pusė proporcingai dažnesnė už kitą. Naudokite, kai dviejų pusių duomenų kiekis labai skiriasi, pavyzdžiui, dvi skirtingo ilgio sesijos.

### Pranešimai, kuriuos galite matyti {#messages-you-may-see}

Skiltis perspėja, kai vaizdas nėra tikras skirtumas:

| Pranešimas | Reiškia |
|---|---|
| *N + / M −* (arba *N + / M − / K nenaudojama*) | Kiek reikšmių yra kiekvienoje pusėje (ir nė vienoje). |
| Nė viena langelio eilutė nėra **+** pusėje | Piešiama tik **−** pusė. Pakeiskite laiko juostos langą arba skaidymą. |
| Nė viena langelio eilutė nėra **−** pusėje | Piešiama tik **+** pusė. |
| Nė viena reikšmė nepatenka į pusę | Skirtumas nieko nepiešia. Įdėkite bent vieną reikšmę į **+** arba **−**. |
| *stulpelio* negalima skaidyti taip | Pasirinktas stulpelis netinka šiam skaidymui. Pasirinkite stulpelį iš naujo. |
| Skaidymo stulpelis netilpo GPU atmintyje N iš M dalių | Tos eilutės nepiešiamos. Padidinkite GPU biudžetą skiltyje Našumas → Resursų biudžetai arba įkelkite mažiau eilučių. |

### Pagal grupę {#by-group}

Skiltis tik nukreipia į [Komandų sąrašą](teams-list.md), kur kiekviena grupė turi mygtukus **+** ir **−**. Kiekvieno įkėlimo metu pirmoji grupių pusė (suapvalinta aukštyn) dedama į +, likusios – į −; **Padalyti po lygiai** Komandų sąraše daro tą patį dar kartą. Grupė, nepatenkanti į jokią pusę, arba paslėpta su savo žymės langeliu, nieko neprideda.

### Pagal kategorijos reikšmes {#by-category-values}

| Dalis | Reiškia |
|---|---|
| `a + / b − / c nenaudojama` | Kiek reikšmių yra kiekvienoje pusėje ir nė vienoje. |
| **Išvalyti** | Kiekvieną reikšmę perkelia į nė vieną pusę. |
| Reikšmių sąrašas | Kiekviena reikšmė su mygtukais **+** ir **−** (paspaudus aktyvų dar kartą, jis nuimamas nuo tos pusės). Tuščia reikšmė rodoma kaip *(trūksta)*. |
| Apribojimo pastaba | Rodomos tik pirmos 200 reikšmių: *Rodomos pirmos 200 iš N reikšmių. Tokį platų stulpelį geriau iš pradžių susiaurinti filtru arba skaidyti pagal intervalą, jei jo reikšmės surikiuotos.* |

Pasirinkus stulpelį, jo pirma reikšmė dedama į +, antra – į −. Jei nė vienoje pusėje nėra jokios reikšmės, skaidymas grįžta prie grupių, o ne rodo tuščią kadrą. *Šaltinio failas* veikia taip pat, po vieną reikšmę kiekvienam failui – taip lyginami du eksportai, du bandymai ar dvi versijos.

### Pagal intervalą {#by-range}

| Dalis | Reiškia |
|---|---|
| Užuomina | Stulpelio mažiausia ir didžiausia reikšmė. |
| **Teigiamas intervalas (+)**, **nuo** / **iki** | Eilutės, kurių reikšmė šiame intervale (abu galai įskaičiuoti), prideda. |
| **Neigiamas intervalas (−)**, **nuo** / **iki** | Eilutės šiame intervale atima. |
| **Skaidyti per vidurį** | Nustato + į [mažiausia, vidurys] ir − į [vidurys, didžiausia] – tai taip pat padaro pasirinkus stulpelį. |

Reikšmė, patenkanti į abu intervalus, skaičiuojama kaip +. Intervalai nebūtinai turi apimti visą stulpelį; reikšmės, nepatenkančios į jokį, neįtraukiamos. *Pirmosios dvi minutės prieš paskutines dvi* yra intervalo skaidymas laiko tipo stulpelyje.

## Spalvos {#colours}

Šiame režime skiltyje **Šilumos spalvos** rodomi du skalės redaktoriai: **Teigiama (pridedančios komandos)** ir **Neigiama (atimančios komandos)**, kiekvienas su savo atkūrimo mygtuku (*Atkurti: skaidri → raudona → geltona → balta*, *Atkurti: skaidri → žalia → mėlyna → violetinė*). Sudėtis ima grynosios šilumos absoliučiąją reikšmę per [įsotinimo tašką ir atsaką](colour-and-exposure.md), o neigiamą skalę pasirenka, kai grynoji reikšmė mažesnė už nulį. Žr. [Spalva ir ekspozicija](colour-and-exposure.md#the-ramp-editor).

Naudokite *Tiesinį* tankio atsaką, kai svarbus skirtumo dydis: tai vienintelis atsakas, kuriame ta pati spalva reiškia tą patį skaičių.

## Kaip tai veikia {#how-it-works}

Kiekviena eilutė viršūnių šešėliuotuve gauna ženklą +1, −1 arba 0 ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); 0 atmeta eilutę dar prieš piešiant bet kurį fragmentą.

- Pagal grupę ženklas ateina iš 4 096 įrašų grupių lentelės, indeksuotos pagal eilutės grupės numerį (grupės numeris kelionės keturiame kanale su eilutės pozicijos tekseliu).
- Pagal kategoriją ženklas ateina iš antros 4 096 įrašų lentelės, užpildytos pagal kiekvieną kategorijos reikšmę, o eilutės reikšmė nuskaitoma iš stulpelio filtravimo tekstūros; reikšmė už lentelės ribų atmetama abiejuose varikliuose.
- Pagal intervalą eilutės reikšmė lyginama su abiem intervalais.

Pakeitus skaidymą, kaupimas pradedamas iš naujo.

**Paslėptos grupės lieka paslėptos su kiekvienu skaidymu.** Skaidant pagal stulpelį, grupių lentelė nebeturi ženklų; joje matomai grupei įrašomas 1, paslėptai – 0 ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), o abi lentelės vienu metu pasiekia šešėliuotuvą – dvi vieno ženklų tekstūros eilutės WebGL2 variante, dvi vieno saugyklos buferio pusės WebGPU variante. Eilutė piešiama tik tada, kai jos grupė matoma *ir* jos stulpelio reikšmė patenka į pusę. Todėl grupė, kurios žymė nuimta [Komandų sąraše](teams-list.md), arba kurią paliko Rungtynių skirtuko pusės fokusas, nieko neprideda, kaip bebūtų skaidomas skirtumas.
