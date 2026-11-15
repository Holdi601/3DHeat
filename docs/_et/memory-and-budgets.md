---
title: "Mälu ja eelarved"
parent: "Andmete sisselugemine"
nav_order: 6
lang: "et"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Mälu, eelarved ja mahutavuse kontroll

Sinu arvutil on piiratud mälu. 3DHeat liidab kokku, mida sinu failid vajavad, ja ütleb enne nupu **Laadi** vajutamist, kas need mahuvad.

![Mäluhinnang "won't fit": Laadi iga [N] rida on eeltäidetud ja Laadi nupp ütleb "Too large - reduce or decimate"](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Kas see arvuti on liiga väike? 3DHeat soovitab selle asemel laadida iga N-ndat rida.*

Brauseri vahekaart, mis saab laadimise keskel mälu otsa, jookseb kokku ja kaotab minuteid tööd, ning GPU, millelt küsitakse rohkem, kui tal on, kas kaotab konteksti või aeglustub roomamiseni. Seetõttu näitab allikapaneel enne laadimise algust, kui palju mälu see vajab, võrdleb seda selle masina jaoks tuvastatud eelarvetega ja keeldub, kui see ei mahu, pakkudes väljapääsu. Mudel asub failis [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Mäluhinnang {#the-memory-estimate}

Kuvatakse nupu **Laadi** kohal, kui read on loetud.

| Rida | Tähendus |
|---|---|
| **Mäluhinnang** - *mahub* / *napilt* / *ei mahu* | Otsus: roheline, kollane või punane. |
| `N rida · B B/rida` | Read, mis laetakse (pärast sammu), ja püsiv bait rea kohta. |
| `RAM X püsiv, Y tipp laadimisel` | Laetult hoitav mälu ja laadimise ajal kõrgeim tase. |
| `GPU Z · hinnanguline laadimine T` | GPU mälu ridade jaoks ja hinnanguline kestus kiirusel 1,2 miljonit rida sekundis. |
| GPU nimi | Renderdaja nimi, kui draiver selle esitab. |
| Teated | Miks see ei mahu või on napilt, ja mida teha. |
| **Laadi iga [N] rida** | Harvendamise samm (vt allpool). |
| `Eelarve: X RAM, Y GPU. Muuda jaotises Jõudlus → Ressursieelarved.` | Eelarved, mida kontroll kasutas. |

### Baidid rea kohta {#bytes-per-row}

| Veerg | Püsiv (RAM) | Märkused |
|---|---|---|
| Asukoht | 12 | Kolm 32-bitist ujukomaarvu, alati (ka lame telg on massiiv) |
| Aeg | 4 | Kui seotud |
| Eluiga | 4 | Kui seotud aeg ja isik |
| Isik | 4 | Kui seotud |
| Rühm | 2 | Kui seotud |
| Seanss | 4 | Kui seotud |
| `Source file` | 4 | Kui on laetud rohkem kui üks fail |
| Iga filtriveerg | 4 | Iga linnukesega *Säilita filtreerimiseks* veeru kohta |

**Tipp** lisab selle, mida laadimine vajab ainult ajutiselt – 8 baiti 64-bitist ajast ühendamise ajal, 12 baiti sorteerimisvõtmeid ja indekseid, 4 baiti permutatsiooni ajutist ruumi (kõik kolm, kui aeg on seotud) ning 4 baiti, kui rühma veerg on veel 32-bitine – ja korrutab summa **2,0-ga**. See tegur on mõõdetud (päris mitme faili laadimine tippus 1,9 × üksikutest massiividest, Parquet-dekoodri töömälu, kopeeritud veergude pikkuse lõikamise ja vabastatud, kuid veel tagastamata mälu tõttu) ja ümardatud üles, sest liiga madal hinnang maksab jooksnud vahekaardi, liiga kõrge hinnang maksab ainult tarbetu sammu.

**GPU** juures maksab iga rida 8 baiti (asukoht ja rühm, kumbki 16 bitti), plus 4 baiti (aeg ja eluiga, kumbki 16 bitti), kui nii aeg kui isik on seotud. Vt [GPU mälu hoidmine](gpu-memory.md). Filtritekstuurid (4 baiti rea kohta iga aktiivse filtri kohta) ja joonte soojuse segmendi algused (8 baiti rea kohta, kui režiim Lines on sees) ei kuulu sellesse hinnangusse.

## Mahutavuse kontroll {#the-fit-check}

Võrreldakse kolme piirangut ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- RAM-i tipp versus **RAM-i eelarve**,
- GPU baidid versus **GPU eelarve**,
- ridade arv versus **sortimise laed** 400 000 000 rida, kui on seotud ajaveerg.

Otsustab kolmest suhtarvust halvim: kuni 70% on *mahub*, kuni 100% *napilt* (peaks laadima, kuid oodata aeglust), üle selle *ei mahu*. Kui ei mahu, nimetab paneel piirava piirangu ja soovitab:

- laadida iga *N*-ndat rida, kus *N* = ⌈ridu / ridu, mis mahuvad⌉, eeltäidetuna sammu kastis;
- eemaldada filtriveerud, tühistada ajaveeru määramine (see eemaldab sortimise ja selle lae, hinnaga ajajoone) või tõsta eelarvet.

Kui eelarve ise pole riistvara tegelik omadus – brauser piiras RAM-i näitu, vaikeväärtust hoiab all see, mis on praegu vaba, või GPU näit on oletus –, siis teade ütleb seda, et sa ei võtaks kätte sammu, mida sa ei vaja.

### Harvendamine {#decimation}

**Laadi iga [N] rida** säilitab ühe rea *N*-st, lugedes faili kaupa. Soojus on keskmine, nii et iga *N*-s rida annab sama jaotuse rohkema müraga – sama kompromissi, mida renderdaja juba iga kaadriga teeb. Kast algab väärtusest 1 (*rida (kõik)*); kui valik ei mahu, on see eeltäidetud soovitatud sammuga, kui sa pole sinna midagi kirjutanud. Nupp Laadi loeb siis *Laadi N faili (1 / K)*, ja andmestiku nimi salvestab `every Kth row`.

### Sortimise lagi {#the-sort-ceiling}

Renderdaja vajab ridu kasvavas ajajärjekorras, seega seotud ajaveerg tähendab iga rea sortimist radix-sordiga 32-bitiste võtmetega ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Üle **400 miljoni** rea keeldutakse seda vahekaardil proovimast. See kontrollitakse enne laadimist, nii et piirist suurem valik lükatakse tagasi sammu soovitusega, selle asemel et lugeda see täielikult ja ebaõnnestuda viimasel sammul. Piiri lähedal (*napilt*) hoiatab paneel, et sortimine on pikk käik ilma oma edenemiseta. Ilma ajaveeruta sortimist ei toimu ja lage ei rakendu.

## Ressursieelarved {#resource-budgets}

**Jõudlus → Ressursieelarved** (kokkuvõikav rida jõudluspaneeli all, mis loeb `Ressursieelarved - RAM, GPU, tuumad`). Eelarved tuvastatakse; tuvastatud näit on vaikeväärtus; ja liugurid ei lähe kõrgemale kui **lagi**, mis on tuvastatud näit, välja arvatud juhul, kus tuvastamine ei ole teadaolevalt mõõtmine.

| Juhtelement | Vahemik | Tähendus |
|---|---|---|
| **RAM reaandmetele** | 256 MiB kuni RAM-i lagi, logaritmiline | RAM-i eelarve mahutavuse kontrolli jaoks. Märgitud *(üle tuvastatu)*, kui ületab tuvastatud vaikeväärtuse, *(max)* laes. |
| **GPU reaandmetele** | 128 MiB kuni GPU lagi, logaritmiline | GPU eelarve mahutavuse kontrolli ja ridade üleslaadimise jaoks. Märgitud *(üle tuvastatu)*, kui ületab tuvastatud vaikeväärtuse, *(max)* laes. |
| **Parseri lõimed** | 1 kuni loogiliste tuumade arv | Mitu faili laadimine parsib korraga, igaüks oma töötajas. Vaikimisi tuumad - 2 (neljal või vähemal tuumal tuumad - 1). Vt [Parseri lõimed](#parser-threads) (jaotises Arendajatele). |
| Allikate rida | | Kust iga näit tuli (`RAM: …. GPU: …. CPU: ….`). |
| **Tuvasta uuesti** | | Küsib arendusserverilt värsket mälunäitu ja arvutab kõik eelarved uuesti. |
| GPU nimi | | Adapteri lühinimi; täielik renderdaja string on kohtspikril. |

### GPU eelarve tõstmine {#raising-the-gpu-budget}

Tuvastatust suurem GPU eelarve kehtib nii, nagu seatud: mahutavuse kontroll ja üleslaadimine võtavad sama väärtuse ühest funktsioonist ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), mis piirab seda ainult GPU lagi, milleni liugur ulatub. Seega laaditakse täielikult üles laadimine, millest kontroll läbi läheb. Üle tuvastatud väärtuse loeb liugur *(üle tuvastatu)*: arv on siis sinu hinnang kaardile, mitte mõõtmine, ja selle seadmine kõrgemaks, kui kaart suudab, toob kaasa konteksti kadumise või roomamise.

## Väga suured andmestikud: hoovad {#huge-datasets-the-levers}

Odavamast kõige drastilisemani:

1. **Vähem filtriveerge.** Igaüks on 4 baiti rea kohta ja üks dekodeerimiskäik.
2. **Samm.** Iga *N*-s rida.
3. **Ajaveergu pole.** Sortimist pole, sortimise lage pole, 4–8 baiti rea kohta aja ja eluea jaoks pole – ega ajajoont.
4. **Tõsta eelarveid**, kui tead, et mälu on olemas.

Renderdamise ajal käsitletakse suuri andmestikke valimise ja järkjärgulise kogumisega, mitte andmeid vähendades; vt [Valimine ja eelarved](sampling-and-budgets.md).

## Arendajatele {#for-developers}

### Parseri lõimed {#parser-threads}

Mitme faili laadimine parsib korraga kuni **Parseri lõimed** neist, igaüks parseri töötajas, mille ingest-töötaja selle laadimise jaoks käivitab ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Väärtusel 1 või ühe faili korral parsitakse failid üksteise järel ingest-töötajas endas.

Mitme korraga käivitamine ei lõdvenda mahutavuse kontrolli:

- **Koostaja loetakse esimesena.** Ühendatud veerud eraldatakse kogu valiku jaoks enne esimese faili lugemist, seega lendavad failid saavad ainult selle, mida RAM-i eelarve jätab nende kõrvale (`parseHeadroom`): asukoht, 64-bitine aeg, vaatenurgad, isik, 32-bitine rühm, seanss, filtriveerud ja `Source file`, rea kohta, mis laetakse – korda 2,6, kui ridade arv on CSV hinnang, veeru kasvamiseks suuremaks.
- **Iga fail broneerib oma kulu enne algust** (`fileParseBytes`): tema read (Parquet footerist; CSV puhul osa hinnangust suuruse järgi), korda samad veerud, korda **8** – plokk ise, koopia selle kõrval, kui read ilma asukohata visatakse välja, ja dekoodri töömälu, mis tekstiveergude puhul on palju suurem kui nende ID-d. Harvendamine seda ei vähenda, sest failid loetakse täielikult ja harvendatakse hiljem. 8 on mõõtmisega seatud varu: kolme või viie juures tõi kolmkümmend parseri lõime vahekaardi üle lubatu 86 miljoni rea puhul isikute ja seansi nimedega; kaheksaga ei toonud.
- **Järgmine fail algab ainult siis, kui tema broneering mahub** sellest, mis on järele jäänud. Fail, mis on lõpetanud, kuid ootab eelmise ühendamist, hoiab oma broneeringut kuni ühendamiseni.
- **Üks fail jookseb alati.** Kui midagi pole broneeritud, algab järgmine fail, mis iganes see maksab – see on üks-korraga laadimine, mida mahutavuse kontroll lubas, nii et napp eelarve langeb selle peale, selle asemel et keelduda.

Näit *tipp laadimise ajal* on üks-korraga laadimise tipp, mis tuleb sortimisel, pärast seda, kui kõik failid on loetud. Kõrvuti parsitud failid võivad lugemise ajal mälu sellest näidust üle viia; broneeringud hoiavad selle RAM-i eelarve piires, niivõrd kui ülal olevad hinnangud on õiged.

Ühendamise järjekord on valiku järjekord, olenemata sellest, mis järjekorras failid lõpetavad, nii et isiku, rühma ja seansi nummerdus, read ja `Source file` väärtused on identsed üks-korraga laadimisega. Fail, mida ei saa lugeda, jäetakse vahele ja nimetatakse täpselt nagu varem. Parseri töötaja surm lõpetab kogu laadimise, nagu ingest-töötaja surm alati tegi, ja iga parseri töötaja lõpetatakse laadimise lõppedes, kuidas see ka lõpeb. Kui parseri töötajaid üldse käivitada ei saa, parsitakse failid selle asemel ingest-töötajas.

### Kuidas näidud tuvastatakse {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) käivitub käivitamisel, veel kord, kui renderdaja on olemas, ja nupul **Tuvasta uuesti**.

**RAM, arendusserveriga.** `start.bat` ja `npm run dev` serveerivad lehe protsessist, mis suudab masina mälu lugeda, aadressil `/__host/memory` (vastatakse 1,5 s jooksul või ignoreeritakse). Vaikeväärtus on väiksem kahest: 60% paigaldatud RAM-ist ja 80% praegu vabast RAM-ist; lagi on 60% paigaldatust. Kui vaba mälu on see, mis vaikeväärtust alla hoiab, ütleb paneel seda ja soovitab sulgeda programme ning vajutada **Tuvasta uuesti**.

**RAM, ilma selleta** (staatiline juurutus): ükski brauseri API ei esita vaba mälu ja `navigator.deviceMemory` ümardatakse alla kahe astmeni ning Chrome ja Edge piiravad selle 8 GiB-ni. Vaikeväärtus on 60% `deviceMemory`-st, veel piiratud 4 × vahekaardi vaba JS-hunniku järgi, kus brauser selle esitab, või 4 GiB, kui midagi pole esitatud. Kui `deviceMemory` on täpselt 8 (lagi), märgitakse näit *piiratuks* ja lagi on 4 × vaikeväärtus, koos märkusega, et vaikeväärtusest kõrgemal on arv sinu väide, mitte mõõtmine.

**Kummalgi juhul** piiratakse RAM-i vaikeväärtus ja lagi **12 GiB-ga**, suurima massiivipuhvri mäluga, mida üks Chrome'i vahekaart suudab hoida, olenemata masinast (lehekülg jõudis umbes 15,75 GB-ni ja ebaõnnestus; 12 jätab ruumi kõigele muule), ja see ei lange kunagi alla 256 MiB.

**GPU mälu.** Ükski veebi-API seda üldse ei esita.

- Arendusserveriga loeb kaardi mälu `nvidia-smi` (suurim adapter) või Windowsis draiveri registriväärtus `HardwareInformation.qwMemorySize`. Vaikeväärtus on 70% sellest, lagi 90%.
- Ilma näituta tuletatakse see: vaikimisi 2 GiB; 4 GiB, kui suurim tekstuur on 16 384 px või rohkem (eraldiseisev kaart), 1 GiB, kui väiksem; või 8 × WebGPU `maxBufferSize`, kui see on suurem. Lagi on siis 8 × tuletatud näit, sest tuletamine eristab integreeritud osa eraldiseisvast, aga peenemat ei eristu. Paneel ütleb, et näit on tuletatud.
- Ei kunagi alla 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4, kui pole esitatud).
