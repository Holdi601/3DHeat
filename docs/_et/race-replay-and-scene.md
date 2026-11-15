---
title: "Kordus ja 3D-stseen"
parent: "Sõiduanalüüs"
nav_order: 52
lang: "et"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Kordus ja 3D-stseen

Mängi oma ringid kokku tagasi, nagu võidusõit, ja vaata, kus üks auto kellestki ette jookseb. Kõik, mida näed **Sõiduanalüüsi** vaate 3D-vaates, on siin kirjeldatud: sõidetud jooned, rajal olevad värvid, autod ja sildid.

![Põhjuste kaart, autod joondatud 40 m enne kurvi: värviline rada, kaks autot ja lipuvarras](../assets/img/en/race-replay-lined-up.webp)

## Ringi kell {#the-replay-clock}

Üks kell juhib kõiki ringe: sekundeid **võrdlusringi** järgi. Mootor edeneb igal kaadril mängimise ajal (kaadriaeg × kordusekiirus). Lõpus läheb see tagasi 0-le, kui **Kordus** on sisse lülitatud, muidu peatub. Kell ei ole tahtlikult poes, et külgriba ei joonistuks iga kaadri järel uuesti. HUD ja graafikud tellivad selle ja uuenevad kõige rohkem korra kaadris.

**Kordusel pikkus** on pikim aeg, mida mõni ring kellal kulutab: iga ringi aeg (miinus selle nihe režiimis *Ritta seatud*) või võrdlusringi aeg režiimis *Kõrvuti*.

## Ülekandeplaat {#the-transport-bar}

Vaate all, vasakult paremale:

| Juhtnupp | Mis teeb |
|---|---|
| ⏮ | tagasi algusesse (ka **Home**) |
| ▶ / ❚❚ | mängi / peata (ka **K**) |
| kiirus | 0,25×, 0,5×, 1×, 2×, 4× |
| kerimisliugur | seab kella otse, 0,01 s sammudes |
| kell | `aeg / pikkus · meetrid`: kell ringi ajana, kordusel pikkus ja see, kui kaugele võrdlusringil on võrdlusauto |
| *Stardijoonelt* / *Ritta seatud* / *Kõrvuti* | kordusrežiim (allpool) |
| **Sea siin ritta** | paneb kõik autod sinna, kus võrdlusring praegu on, ja jätkab sealt |
| **Kordus** | alustab lõpus uuesti (vaikimisi sees) |
| **Peida graafikud** / **Näita graafikuid** | vahemaagraafikud riba all |

Nupud on keelatud, kuni ringid on laaditud (üks ring piisab selle kordamiseks; võrdlused vajavad kahte).

## Kordusrežiimid {#replay-modes}

Kuidas iga ringi enda aeg järgneb kellale:

| Režiim | Iga ringi aeg | Mida näitab |
|---|---|---|
| **Stardijoonelt** (`start`) | kell ise | iga ring oma algusest: võidusõit nende vahel, vahe kasvab nii, nagu see rajal kasvas |
| **Ritta seatud** (`anchor`) | kell pluss ringi nihe | iga auto samal kohal samal hetkel, siis lastakse lahti – mis juhtub sellest punktist edasi, mitte ringi algusest |
| **Kõrvuti** (`locked`) | aeg, mil ring jõudis võrdlusringi praeguse vahemaani | iga auto peetakse kogu ringi vältel võrdlusringi vahemaal: kiirusi ja sisendeid võrreldakse meetri kaupa |

Kasuta seda, kui:

- **Stardijoonelt**: tahad näha, kes on ees ja kuidas vahe kasvab.
- **Ritta seatud**: tahad teada, mis juhtub ühes kurvis või ühel sirgel, kusjuures kõik alustavad seal võrdselt.
- **Kõrvuti**: tahad võrrelda, mida juhid pedaalide ja rooliga rajal samas kohas teevad.

**Nihked režiimis *Ritta seatud*:** ankru puhul `s` meetrit mööda võrdlusringi on iga ringi nihe tema enda aeg kohal `s` miinus võrdlusringi aeg kohal `s`, mõlemad loetud joondatud ringidest (vt [üks vahemaatelg](race-corner-analysis.md#one-distance-axis)). Ring, mis ei kata `s`-i, jääb nihkega 0. Režiimi *Ritta seatud* valimine režiimi-nuppudest ankurdab võrdlusringi praeguse vahemaa juurde.

Valge lipuga post (14 m kõrge) märgib ankrut režiimis *Ritta seatud*.

### Joondamine {#lining-up}

| Toiming | Ankur | Kell |
|---|---|---|
| **Sea siin ritta** | kus võrdlusring praegu on | ei muutu |
| Shift+klõps graafikutel | klõpsatud meeter | 1,5 s enne, kui võrdlusring sinna jõuab |
| leid jaotises *Mida parandada*, rajal nummerdatud märk, *Kurv-kurvilt* rida koos leiuga | 40 m enne kohta, kus leiu põhjus algab | 1,5 s enne seda punkti; siis mängib |
| auto juhtimise sündmus, tabamuse silt | 40 m enne sündmust | 1,5 s enne; siis mängib |
| ring kursuse statistikas | nagu tema leid või sündmus | nagu ülal, selle ringi fookusega |

Leiu vaatamine raamib ka selle kaameraga: pall leiu vahemiku keskmise ümber, raadius on suurem neist – 40 m või pool selle pikkusest pluss 30 m (sündmuse puhul 60 m) –, kui kaamera just ei jälita autot.

### Jälituskaamera {#chase-camera}

⌖ ringide nimekirjas paneb kaamera autot järgima: 2,5 + 4 × auto suurus meetrit selle taga ja 0,9 + 1,1 × auto suurus meetrit selle kohal, vaadates mööda sõidusuunda, autole kallutatuna ja pehmendatult (20% teekonnast igal kaadril), nii et see ei väriseks iga kõikumise peale. ⌖ veel kord vabastab selle. Jälgitud auto joonistatakse veidi heledamalt, maapinnal valge rõngaga, ja tema kaart on esile tõstetud.

## Vaate jaotis {#the-view-section}

| Juhtnupp | Vaikimisi | Mis teeb |
|---|---|---|
| **Jooned** / **Ajakaart** / **Põhjuste kaart** / **Vigade kaart** | Ajakaart | mis on rajale värvitud (allpool); *Jooned* ei värvi midagi |
| legend | - | *võidab ↔ kaotab* ajakaardi jaoks, põhjuste värvid põhjuste kaardi jaoks, *vähe ringe ↔ kõige rohkem ringe* vigade kaardi jaoks |
| **Sõidetud jooned** | sees | iga nähtava ringi joon oma värvis |
| **Autod** | sees | autod ja HUD-kaartide allikad |
| **Rehvid ja vedrustus** | sees | rehvi temperatuur, libisemisrõngad, vedrustuse tõukurid ja muud ratastekohased glüfid ning autode katusetuled |
| **Sildid** | sees | kurvide nimed, nummerdatud märgid, tabamuste sildid, vigade kaardi kurvisildid |
| **Rada ringide põhjal** | sees | teekatte pind kursusel, millel ei ole väljavõetud mudelit (peidetud, kui kursuse mudel on laaditud) |
| **Kõik väärtused kaartidel** | väljas | iga HUD-kaardil loetletud kanal |
| **Autode tegelikud kujud** | sees | iga auto oma vaste kujul (vt [Autod](#the-cars)); väljas: avatud üksikistmega auto, mis ei peida telemeetria ühtegi osa |
| **Auto suurus** | 1× | 1× kuni 10× sammudes 0,5; 1× on auto päris suurus, nii pikk ja lai, nagu ta mängus on. Midagi muud seda ei muuda kui see liugur |

## Sõidetud jooned {#driven-lines}

Iga nähtava ringi tee läbi tema enda proovipunktide, tema värvis, joonistatud 0,12 m salvestatud asukohast allpool (auto salvestatud asukoht on tema viitepunkt, 0,28 kuni 0,47 m teest kõrgemal väljavõetud Forza kursustel). Punkt hoitakse iga 1,5 m järel. Kui on nähtav üle 10 ringi, hoiavad ringid, mida ei vaadata, iga 6 m järel (iga tipp läheb igal kaadril GPU-le).

## Kaardid {#the-maps}

Kõik kolm on ribad mööda **võrdlusringi** teed, 0,2 m salvestatud asukohtadest allpool, üks nelinurk iga 2 m ruudustiku sammu kohta.

### Ajakaart (`where`) {#time-map-where}

Fookusringi puhul: sekundid, mis saadakse või kaotatakse meetri kohta võrreldes ringiga, millega seda selles punktis võrreldakse (oma klassi parim, või võrdlusringi puhul kiireim teine ring läbi iga lõigu). Need tulevad joondatud deltamuutusest ruudustiku sammu kohta, silutud ±10 m ulatuses. Punane seal, kus aega kaotatakse, roheline seal, kus võidetakse, hall vahepeal. Värviskaala on absoluutväärtuste 95. protsentiil, nii et tipud on lõigatud ja enamik ringist jääb vahemikku. 6 m lai.

### Põhjuste kaart (`why`) {#cause-map-why}

Fookusringi puhul: iga kadu värvitakse üle vahemiku, kus on tema **põhjus** (mitte see, kus aeg näitab). Värv tuleb põhjuse rühma järgi; kallim leid võidab, kui kaks kattuvad. Laius on `3 + 9·√(kulu / suurim kulu)` meetrit; kus midagi ei kaotatud, on hall 2 m riba. Jaotises *Mida parandada* valitud leid on valgega värvitud.

| Rühm | Värv | Leiud |
|---|---|---|
| pidurdamine | oranž | juhi kaod pidurdusfaasis |
| sisenemine | magenta | juhi kaod sisenemisel ja keskel |
| väljumine | sinine | juhi kaod väljumisel |
| sirge | kollane | juhi kaod sirgel |
| auto | hall | see, mida auto selgitab |
| kontekst | tumehall | olukord (võidusõidu start võrreldes lendava ringiga) |

### Vigade kaart {#mistake-map}

Kui paljud kõigist ringidest (kursuse statistikas valitud klassidest) tegid igal meetril vea – iga liiki või ainult statistikas valitud. Iga ring loetakse meetri kohta üks kord; iga vea vahemikku laiendatakse 6 m kummalegi poolele, et lühike viga näiks ka. Laius on `3 + 10·(ringid / kõige rohkem ringe)` meetrit ja värv tuhmpruunist heleoranžini; hall 2 m seal, kus ükski ring viga ei teinud. Vt [Raja statistika](race-course-statistics.md#the-mistake-map).

## Rada ringide põhjal {#track-from-the-laps}

Mängu puhul, mille kursust ei ole väljavõetud, joonistatakse jooned alla tee: nii lai, kui ringid levivad võrdlusringi üle (külgnihked 25 m piires loetakse), pluss 2 m kummalegi poolele, vähemalt 4 m kummalegi poolele võrdlusjoonest. Silutud ±8 ruudustiku punkti (±16 m) ulatuses, asfaldihalli värviga, kergete servajoontega, 0,3 m salvestatud asukohtadest allpool. Peidetud, kui **Tasemes** on laaditud kursuse mudel.

## Tabamused ja kokkupõrked rajal {#hits-and-crashes-on-the-track}

Iga nähtava ringi tabamused ja kokkupõrked (vt [Sõiduki juhtimise sündmused](race-control-events.md#hits-and-crashes)) on märgitud sinna, kus need juhtusid, alati kui jooni või autosid joonistatakse. Teravatipuline täht – punane kokkupõrke korral, merevaigukollane tabamuse korral – seisab posti peal, ringi värvis rõngas jalamil, suurus auto suuruse järgi (kokkupõrked suuremad). Kui auto läbib tabamuse hetke, levib sellest 0,8 s jooksul löögirõngas.

## Abirežiim {#help-mode}

**?** keelevalija kõrval või klahv **?** või **F1** lülitab sisse võtme iga ekraanil oleva värvi kohta kõigil kolmel vaatel ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx), [`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Valik jääb sellesse brauserisse.

- **Võti** vaate nurgas loetleb värvid vaate ja režiimi kohta, mis on kasutusel. Iga skaala tuleb sellest kohast, kust vaade selle saab, nii et muudetud soojusskaala näitab end muudetuna. Sõiduanalüüsi vaates on loetletud ainult see, mida laaditud ringid kannavad.
- **Iga auto kaart** saab tabeli sellest, mis on joonistatud tema ratastele, nime järgi, iga ratta väärtusega selles värvis, millega see on joonistatud.
- **Fookuses olev auto** saab iga ratta juurde sildi, mis ütleb sama, paigutatuna nurkadesse. Peidetud, kui auto on ekraanil liiga väike, et need mahuksid.

## Autod {#the-cars}

**Iga auto oma kujul**, oma ringi värvis ja päris suuruses. Kujud tulevad autofailist, mis tehakse üks kord masinas, kus mäng on:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Ilma selleta joonistatakse iga auto **vaataja enda autona** oma liigi ja ajastu järgi: sedaan, kupee, luukpära, universaal, sportauto, superauto, lihasauto, maastur, pikap, kaubik või mikroauto, igaüks kas klassikalisena (enne 1980), 80ndate ja 90ndate või kaasaegsena ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Need on siin ehitatud üldistest proportsioonidest: ei mingeid logosid, mudelinimesid ega midagi ühegi mängu failidest, nii et need tulevad vaatajaga kaasa. Liik tuleb auto nimest ja ajastu selles olevast aastaarvust; auto, millel pole kumbagi, võetakse klassi järgi. Umbes sada päris põlvkonda on tuntud avaldatud pikkuse, laiuse, kõrguse ja telgede vahe järgi ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); iga rida ümardatud), nii et 1990. aastate 3-seeria saab selle auto suuruse ja seisu, ikka lihtsa kujuna ilma embleemi või võreta.

Autofail tehakse sinu enda masinas sinu enda koopiast mängust. See hoiab iga auto madala detailsusega mudelit, umbes 900 kolmnurka, koos ratta asukohtadega (vt [väljavõtja käsku `cars`](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Laadi autofail...** vaate seadetes või faili lohistamine sakile laadib selle; see jääb sellesse brauserisse. See sisaldab mängu kujusid, nii et seda ei tohi edasi anda, ja vaataja ei sisalda ühtegi.

Milline auto ringi asemel seisab, arvutatakse iga kord sellest, mis on laaditud, ja seda ei salvestata. Nii saab auto, millel täna vastet pole, oma vaste kohe, kui uuem fail seda sisaldab ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Ringi auto | Joonistatakse kui |
|---|---|
| selle number on failis sama mängu jaoks | just see auto |
| sama mark, ja nimes on mudeli sõna | see mudel, aastatelt lähim |
| sama mark, sama põlvkond | selle marki auto, aastatelt lähim |
| mis tahes muu, autofailiga | sama marki lähim, kui see on, muidu sama liiki kere, aastatelt lähim |
| ülemiste rataste auto nime järgi | allpool olev üksikistmeline |
| ükski neist kahest esimesest, ja vaataja tunneb auto suuruse järgi | vaataja enda auto selle päris auto suurusega, failiga või ilma |
| mis tahes muu ilma failita | vaataja enda auto sellest liigist ja ajastust |

Seega kuvatakse teise mängu 1990. aasta BMW 3-seeriat umbes samal aastal BMW-na, ja auto, mis on failist uuem, näitab oma lähimat sugulast, kuni fail tehakse uuesti. Ringi tooltip ja fookuses oleva ringi auto suuruse all olev rida ütlevad, mis see joonistatakse ja kui lähedal see sellele on.

Vaataja enda autodel on tumedad aknad. Autofaili mudelid on kõik ühevärvilised, sest failil pole värvi ega klaasi, millest lähtuda. Rattad, tagatuled, lambid ja telemeetria glüfid joonistatakse all nagu üksikistmelisel; tõukur kulgeb mööda ratta välisküljel, kus seda näha on, ja õõtshoovad jäetakse välja.

**Üksikistmeline auto** on avatud rataste autoga ringi värvis, nii et esiosa on igalt nurgalt selge ja miski ei peida rattaid: kere, mootorikate, külgkorvid, kokpit kiivriga, kaitseraam, põrand, esi- ja tagatiib; neli ümmargust ratast, esimesed pööravad rooliga (kuni 0,5 rad täispööret), igaüks kahe õõtshoovaga, ülesseisva telje, rattavarda (esi) või ajuvõlli (tagumine) ja tõukuriga. Mudelit lastakse salvestatud asukohast 0,3 m allapoole, et selle rattad jääksid teele, ja seda skaleeritakse **Auto suuruse** järgi.

**Keha liigub oma vedrudel**: kui ringil on kõik neli vedrustuse käiku, vajub iga nurk oma käigu võrra (rõhutatud 0,12 m-ni täiskäigust täiskoormuseni, et see paistaks jälituskaamerast), ja keha vajub, kallutub ja veereb nende nelja läbival tasapinnal.

**Mida telemeetriast joonistatakse** (kui *Rehvid ja vedrustus* on sees), järgib [kanalitabelit](race-charts-and-hud.md#the-channel-table):

| Glüüf | Allikas | Joonistus |
|---|---|---|
| rehvi värv | `tireTemp` | rehv ise: sinine külm → tsüaan → roheline töötemperatuur → kollane → punane kuum, 40–130 °C vahel |
| libisemisrõngas | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (suurim) | rõngas maapinnal ratta all: roheline haardega, merevaigukollane 0,66-l, punane 1-l (haarde piir nii, nagu mäng seda näitab); nõrk alla 0,3 |
| vedrustuse varras | `suspension` (0..1) | tõukur värvitud käigu järgi: sinine välja sirutatud, valge keskel, punane kokku surutud |
| pidurisoojus | `brakeTemp` (100–900 °C) | ketas ratta välisküljel, tumedast oranžini |
| kulumisriba | `tireWear` (0..1) | riba profiili servas, valgest uuest punaseks kulunuks |
| koormusriba | `wheelLoad` (0–12 000 N) | post ratta kõrval, sama kõrge kui koormus |

Pidurituled (vihmatuli ja tiivaotsad) süttivad piduripedaaliga. Iga `lamp` kanal, mis on sees (üle poole oma ulatusest), süütab tuli õhukasti kohal oma värviga: ABS töötab, libisemisvastane töötab, DRS, boksi piirik, käsipidur, õhus.

**Rahvamassis** (üle 10 nähtava auto) joonistatakse autod, mida ei vaadata, lihtsalt: kere, tiivad, rattad ja pidurituli.

## Sildid {#labels}

Kinnitatud rajale ja paigutatud igal kaadril kaamera projektsioonist (ekraanilt väljas või kaamera taga, peidetud). Kui **Sildid** on sees:

| Silt | Kus | Klõps |
|---|---|---|
| kurvinimed (`T1`, `T2` …) | iga kurvi tipu kohal võrdlusringil | - |
| nummerdatud märgid 1–5 | fookusringi viie suurima juhi kao kohal, iga põhjuse vahemiku keskel, põhjuse värviga ääristatud; hõljutades pealkiri ja kulu | joonda ja mängi see leid |
| tabamuse / kokkupõrke sildid | **fookusringi** igal purske kohal: "Kokkupõrge −45 km/h" / "Tabamus −12 km/h"; hõljutades täielik kirjeldus ja vihje | joonda ja mängi löök |
| vigade kaardi kurvisildid (kui kaart on vigade kaart, kurvinimede ja märkide asemel) | iga kurvi tipp: "T3 · 5/40 varajane pidurdus" (kõige sagedasem viga: ringid, mis seda tegid / ringid, mis kurvi sõitsid), "T3 · 5/40", kui valitud on üks liik, "T3 · puhas", kui ühtegi | ava või sulge see kurv kursuse statistikas |

## Peegeldatud maailmad {#mirrored-worlds}

Vaataja maailm on parempoolne, Y üles: ülevalt vaadatuna pöörab auto, mille sõidusuund `atan2(dx, dz)` kasvab, vasakule. Mäng vasakukäelise maailmaga, seas Forza, tuleb peegeldatuna: iga paremkäe kurv joonistatakse vasakukäe kurvina, nii kursus kui ringid.

Ringid ise ütlevad selle ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): iga ringi käiakse läbi paari meetri kaupa (3 m), tee pööramist võrreldakse väliskülje vedrustuse kokkusurumisega (`suspension.FR` miinus `suspension.FL`) ja ilma vedrustuseta rooliga (igas adapteris positiivne paremale). Ring, mis pöörab kokku vähem kui π, ei ütle midagi; tõendid loetakse, kui need ületavad 2% pööramisest. Ringid hääletavad; viigi korral on "ei saa öelda".

Kui ringide otsus ei nõustu praeguse teljepööramisega (paaritu arv pööratud telgi **Kaamera ja stseen → Pööra maailma telg ümber** all), ütleb **Ringid** jaotis selle nimekirja all:

- mäng on peegeldatud ja midagi ei ole pööratud: "Need ringid keeravad paremale, kus kursus on joonistatud vasakule kaarduvana …" koos nupuga **Pööra X ümber**;
- teljed on pööratud, aga ringid ei ole peegeldatud: "Pööratud teljed joonistavad need ringid peegeldatuna …" koos nupuga **Lähtesta teljed**.

Muutub ainult joonistus – peegeldus on vaatemaatriksisse kokku volditud. Andmed, analüüs ja iga koordinaat, mida tööriistad näitavad, jäävad mängu enda omaks. Pööramine jääb brauserisse. Analüüs nimetab kurve vasakuks või paremaks sama mõõtmisega (tundmatut maailma loetakse peegeldatuks, nagu Forza oma on).

## Arendajatele {#for-developers}

Kood: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts), [`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts), [`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts), [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`), [`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Mis auto on hetkel {#what-a-car-is-at-a-moment}

`stateAt` interpoleerib iga kanali kahe ringi aja ümber oleva proovi vahel. Sammuvad kanalid (käik, lipud) võtavad lähima proovi. Lõpetanud ring parkib joonele.

**Suund.** Sõidusuund tuleb paari meetri kaugusel olevatest asukohtadest (vähemalt 2 m kummalegi poolele, et kõikumine ei pööraks autot). Keha suund tuleb mängu pöördest ainult siis, kui see on sobitatud sõidusuunaga – märk ja nihe, ringkeskmise järgi proovidel, mis sõidavad kiiremini kui 10 m/s (vähemalt 20) – ja ainult siis, kui see siis sellega nõustub (ringhajutus alla 0,05, umbes 18° hajumine). Muidu osutab keha sõidusuunas. See hoiab libisemise nähtavana (keha ja sõit lahus), ilma et usaldataks mängu nurgakonventsiooni.

**Rool ja küljed.** Millises suunas positiivne roolipööre auto pöörab ja millisele küljele mängu paremad rattad kuuluvad, mõõdetakse ringist: roolipööre võrreldes tee pööramisega ning see, millise külje vedrustus kurvi välisküljel kokku surub (ilma vedrustuse andmeteta loetakse Forza mängud peegeldatuks).
