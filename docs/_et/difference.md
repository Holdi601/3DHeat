---
title: "Erinevus"
parent: "Soojusrežiimid"
nav_order: 5
lang: "et"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: true
---

# Erinevus

Punane seal, kus meeskond A oli rohkem, roheline-sinine seal, kus meeskond B oli, ja tühi seal, kus nad olid võrdsed.

**Erinevus** (klahv 2) on märgiga soojus. Ühe populatsiooni read lisavad soojust; teise populatsiooni read lahutavad seda. Kus kaks poolt on ühtlaselt kattuvad, on tulemus null ja täiesti läbipaistev; kus üks domineerib, näidatakse seda selle poole värvides - vaikimisi soojad (läbipaistev → punane → kollane → valge) **+** poolele ja jahedad (läbipaistev → roheline → sinine → lilla) **−** poolele.

![Erinevuse soojus: punane seal, kus + pool oli rohkem, roheline ja sinine seal, kus - pool oli rohkem](../assets/img/et/difference-split.webp)

## Kuidas seda kasutada {#how-to-use-it}

1. Vajuta `2` (või vali režiimiribal **Erinevus**).
2. Ava külgribal **Erinevuse jaotus**.
3. Vali, mille järgi **Jaota järgi**: tavaliselt *Rühmad*.
4. Pane üks rühm (või väärtus) poolele **+** ja teine poolele **−**.
5. Loe värve: soe tähendab + poolt, jahe tähendab − poolt. Paneel hoiatab, kui ühel poolel pole ridu (vaata [Sõnumid, mida võid näha](#messages-you-may-see)).

*Millised* kaks populatsiooni on kogu küsimus, seega võib jaotus olla mis tahes alles hoitud veerg, mitte ainult rühmad. Read, mis jäävad **kummalegi** poolele, **jäetakse välja**, mitte ei loeta nulliks: see teebki jaotuse kahe väärtuse vahel täpseks, ja see kombineerub [filtritega](filters.md) - filtreeri kõigepealt üheks kaardiks, siis jaota see versiooni järgi.

Režiim vajab kahte poolt: rühmaveergu vähemalt kahe rühmaga või jaotust veeru järgi, mis on alles hoitud filtreerimiseks. Andmetel, kus on alla kahe rühma, alustab laadimine veerujaotusega - kõigepealt mitme faili laadimise veerg *Source file*, muidu esimene kategooriaveerg kahe väärtusega, muidu esimene arvuline veerg, millel on ulatus - nii et *võrdle kahte laadimist* töötab ka andmetel, millel rühmi pole. Ainult andmed, millel pole ei üht ega teist, jätavad režiimi kättesaamatuks; nii on ka siis, kui veerujaotuse ühel poolel ei ole midagi.

## Erinevuse jaotuse paneel {#the-difference-split-panel}

Näidatakse erinevuse režiimis, soojuse paneelide all.

**Jaota järgi** pakub:

| Valik | Kuvatakse kujul | Jaotusreegel |
|---|---|---|
| Rühmad | *Rühm (N)* (kui on rühmaveerg) | Iga rühm poolel +, − või kummalgi, seadistatud [Võistkondade loendis](teams-list.md) |
| Kategooriaveerg | *veerg (N väärtust)* | Väärtused poolel +, − või kummalgi |
| Arvuline veerg | *veerg (arvuline)* | Väärtusevahemik kummalegi poolele |
| Päritolufail | *Source file — võrdle kahte laadimist* (kui laeti mitu faili) | Failid poolel +, − või kummalgi |

Pakutakse ainult veerge, mis on laadimisel jäetud valikule *Hoia filtreerimiseks*.

### Võrdle osakaale, mitte arve {#compare-shares-not-counts}

**Võrdle osakaale, mitte arve** (vaikimisi väljas) kaalub iga poolt ühe jagatud selle enda ridade arvuga, nii et pool, millel on viis korda rohkem ridu, ei võida pelgalt arvude põhjal. Värv näitab siis, kus iga pool on teisega võrreldes proportsionaalselt sagedasem. Kasuta seda, kui poolte andmekogused on väga erinevad, näiteks kahe erineva pikkusega seansi puhul.

### Sõnumid, mida võid näha {#messages-you-may-see}

Paneel hoiatab, kui pilt ei ole päris erinevus:

| Sõnum | Tähendus |
|---|---|
| *N + / M −* (või *N + / M − / K kasutamata*) | Mitu väärtust on kummalgi poolel (ja kummalgi pole). |
| Aknas pole ühtegi rida poolel **+** | Joonistatakse ainult **−** pool. Liiguta ajajoone akent või muuda jaotust. |
| Aknas pole ühtegi rida poolel **−** | Joonistatakse ainult **+** pool. |
| Kummalgi poolel pole ühtegi väärtust | Erinevus ei joonista midagi. Pane vähemalt üks väärtus poolele **+** või **−**. |
| *veerg* ei saa nii jaotada | Valitud veerg ei sobi jaotusega. Vali veerg uuesti. |
| Jaotusveerg ei mahtunud GPU mällu N-st M tükist | Need read ei joonistu. Tõsta GPU eelarvet jaotises Jõudlus → Ressursieelarved või laadi vähem ridu. |

### Rühmade kaupa {#by-group}

Paneel viitab lihtsalt [Võistkondade loendile](teams-list.md), kus igal rühmal on nupud **+** ja **−**. Igal laadimisel pannakse rühmade esimene pool (ülespoole ümardatult) poolele +, ülejäänud poolele −; **Jaota võrdselt** Võistkondade loendis teeb sama uuesti. Rühm, mis on kummalgi poolel mitte, või mis on märkeruuduga peidetud, ei panusta midagi.

### Kategooriaväärtuste kaupa {#by-category-values}

| Osa | Tähendus |
|---|---|
| `a + / b − / c kasutamata` | Mitu väärtust on kummalgi poolel ja kummalgi pole. |
| **Tühjenda** | Paneb iga väärtuse kummalegi poolele mitte. |
| Väärtuste loend | Iga väärtus nuppudega **+** ja **−** (aktiivsele vajutades uuesti eemaldad selle poolelt). Tühja väärtust nimetatakse *(puudub)*. |
| Piirimärkus | Näidatakse ainult esimesi 200 väärtust: *Näitan esimesi 200 väärtust N-st. Nii lai veerg on parem kitsendada filtriga või jaotada vahemiku järgi, kui väärtused on järjestatud.* |

Veeru valimisel pannakse selle esimene väärtus poolele + ja teine poolele −. Kui kummalgi poolel ei ole ühtegi väärtust, taandub jaotus rühmadele, selle asemel et näidata tühja kaadrit. *Source file* töötab samamoodi, üks väärtus faili kohta - nii võrreldakse kahte eksporti, kahte katset või kahte versiooni.

### Vahemiku järgi {#by-range}

| Osa | Tähendus |
|---|---|
| Vihje | Veeru miinimum ja maksimum. |
| **Positiivne vahemik (+)**, **alates** / **kuni** | Read selles vahemikus, mõlemad otsad kaasa arvatud, liidavad. |
| **Negatiivne vahemik (−)**, **alates** / **kuni** | Read selles vahemikus lahutavad. |
| **Jaota keskpunktist** | Seab + vahemikuks [miinimum, keskmine] ja − vahemikuks [keskmine, maksimum] - sama, mis veeru valimisel. |

Väärtus, mis on mõlemas vahemikus, loetakse + poolele. Vahemikud ei pea veergu katma; väärtused, mis jäävad kummaski, jäetakse välja. *Esimesed kaks minutit võrreldes viimaste kahega* on ajalaadse veeru vahemikujaotus.

## Värvid {#colours}

Jaotises **Soojuse värvid** on selles režiimis kaks skaalaredigeerijat: **Positiivne (liitvad võistkonnad)** ja **Negatiivne (lahutavad võistkonnad)**, igaühel oma lähtestusnupp (*Lähtesta: läbipaistev → punane → kollane → valge*, *Lähtesta: läbipaistev → roheline → sinine → lilla*). Kompositsioon võtab netosoojuse absoluutväärtuse läbi [küllastuspunkti ja vastuse](colour-and-exposure.md), ja valib negatiivse skaala seal, kus neto on alla nulli. Vaata [Värv ja säritus](colour-and-exposure.md#the-ramp-editor).

Kasuta *lineaarset* tiheduse vastust, kui erinevuse suurusel on tähtsus: see on ainus vastus, kus sama värv tähendab sama arvu.

## Kuidas see töötab {#how-it-works}

Iga rida saab tippude varjutajas märgi +1, -1 või 0 ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); 0 lükkab rea tagasi enne, kui ühtegi fragmenti joonistatakse.

- Rühma järgi tuleb märk 4096-kirjest rühmatabelist, mida indekseeritakse rea rühma-id järgi (rühma-id sõidab rea positsioonitekseli neljandas kanalis).
- Kategooria järgi tuleb märk teisest 4096-kirjest tabelist, mis täidetakse iga kategooriaväärtuse kaupa, ja rea väärtus loetakse veeru filtritekstuurist; tabeli lõpust väljaspool olev väärtus lükatakse mõlemal renderdajal tagasi.
- Vahemiku järgi võrreldakse rea väärtust kahe vahemikuga.

Jaotuse muutmine alustab akumulatsiooni uuesti.

**Peidetud rühmad jäävad peidetuks igas jaotuses.** Veeru järgi jaotamisel rühmatabel enam märke ei kanna; ta hoiab 1 nähtava rühma ja 0 peidetud rühma jaoks ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), ning mõlemad tabelid jõuavad varjutajasse koos - kaks rida ühes märgitekstuuris WebGL2-l, kaks poolt ühes salvestuspuhvris WebGPU-l. Rida joonistatakse ainult siis, kui tema rühm on nähtav *ja* tema veeru väärtus on kummalgi poolel. Seega rühm, mis on [Võistkondade loendis](teams-list.md) maha märgitud või mis jäetakse Matši vahekaardi poolefookusega välja, ei panusta mitte midagi, sõltumata sellest, kuidas erinevust jaotatakse.
