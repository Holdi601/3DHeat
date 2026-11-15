---
title: "Kaamera ja juhtimine"
nav_order: 14
has_children: true
lang: "et"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kaamera ja juhtimine

Lendad stseenis nagu lind: **W A S D** liigutab, lohistades hiirt vaatad ringi. Sellel lehel õpid lendama, hüppama ülal- või külgvaatesse ning lugema täpselt, kus kaamera on.

## Lenda 4 sammuga {#fly-in-4-steps}

1. Klõpsa vaatel üks kord, et sellel oleks klaviatuur.
2. Hoia **W** all, et lennata edasi, **S** tagasi, **A** ja **D** küljele, **tühik** üles, **Q** alla.
3. Hoia vasak või parem hiireklahv all ja lohista, et ringi vaadata.
4. Vajuta **F**, et kõik andmed uuesti kaadrisse võtta.

Kaamera on vaba lendamise kaamera, perspektiivse ja paralleelse projektsiooniga, eelseadistatud vaadetega, sisestatava asendiga ja teravussügavusega. Tema seaded on külgriba allosas paneelil **Kaamera ja stseen** (kuvatakse ka vahekaartidel Sõiduanalüüs ja Matš). Teostus on [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Lendamine {#flying}

| Sisend | Mõju |
|---|---|
| `W` `A` `S` `D` või nooleklahvid | Edasi (mööda vaadet, koos selle kaldega), vasakule, tagasi, paremale |
| `Tühik` või `E` | Üles (maailma üles) |
| `Q` või vasak `Ctrl` | Alla |
| `Shift` (all hoitud) | 6× kiiremini |
| vasak `Alt` (all hoitud) | 15% kiirusest |
| Lohistamine vasaku või parema hiireklahviga | Ringivaatamine. Kursor on lohistamise ajal lukus. |
| Hiireratas | Lennukiirus ×1,5 sammu kohta (perspektiiv); suum (paralleelne) |
| `F` | Andmete kaadrisse võtmine |
| Klõps (ilma lohistamata) | Näitab, mis on kursori all ([Vaate uurimine](#inspecting-the-view)) |
| `C` | Kopeerib kaamera asukoha, pöördenurga ja kaldenurga |
| `G` | Mine sisestatud punkti |
| `Esc` | Sulgeb valiku kaardi (ja lõpetab üksuse jälgimise) |

### Üksuse jälgimise ajal {#while-following-a-unit}

Kui kaamera jälgib kordusel üksust ([Matši kordus](match-replay.md)), teevad lendamisklahvid teist asja:

| Sisend | Mõju |
|---|---|
| Ratas, `W` / `S` | Lähemale üksusele / kaugemale (satelliitvaates kõrgemale / madalamale) |
| `A` / `D`, `Q` / `E` | Tiirlemine üksuse ümber (jälituse ja orbiidi vaated) |
| Lohistamine | Ringivaatamine üksuse ümber (kokpit: vaatamine kokpitis) |
| `V` / `Shift+V` | Järgmine / eelmine kaamera vaade |
| `Esc` | Lõpeta esmalt teise üksuse vaatamine, seejärel jälgimine |

Liikumisklahvid liituvad [mängupuldiga](gamepad.md); kõige muu kohta vaata [klahvistiku juhendit](keyboard-reference.md). Klahvid ei tööta, kui tekstikast või rippmenüü on aktiivne. Kallet piiratakse nii, et see ei jõua täpselt üles ega alla.

## Paneel Kaamera ja stseen {#camera--scene-panel}

![Paneel Kaamera ja stseen: Projektsioon, Eelseadistatud vaated, Vaatevälja nupud, Lennukiirus ja Asend](../assets/img/en/camera-panel.webp)

### Projektsioon {#projection}

**Projektsioon**: *Perspektiiv* (vaikimisi) või *Paralleelne*.

*Paralleelne* (ortograafiline) kaotab lühenemise, nii et kaks võrdse tihedusega kuumapunkti paistavad võrdse suurusega kõikjal kaadris – just see võrdlus on kaardi kuumuskaardi mõte – ja just see teeb isomeetrilisest vaatest isomeetrilise. Paralleelses režiimis suumib hiireratas (pole edasiliikumist, mis muudaks mõõtkava) ja [kiiruse näit](#fly-speed) on peidetud.

**Ümberlülitamine hoiab objekti samas suuruses.** Paralleelsel projektsioonil pole vaatevälja, seega pole selle kaadri kõrgus seotud kaamera kaugusega; naiivne ümberlülitamine kas suumib metsikult või ei näita midagi. Paralleelseks minnes määratakse kaadri kõrguseks see, mida perspektiivkaamera katab fookuskaugusel (2 × kaugus × tan(fov / 2), fookuskaugus on viimase kaadrisse võtmise kaugus). Tagasi minnes taastub perspektiivi asend, mille jätsid, samas ilmselges mõõtkavas, mitte seal, kuhu paralleelvaade kõndis.

### Eelseadistatud vaated {#preset-views}

| Rühm | Nupud | Orientatsioon |
|---|---|---|
| **Isomeetria** | **KI**, **LO**, **KA**, **ED** | Paralleelne, kallak -35,264° (= atan(1/√2), nurk, mille juures kõik kolm telge projitseeritakse sama pikkusena), pöördenurk -45°, 45°, -135°, 135°. Neli nurka, sest üks nurk peidab alati pool kaardist sellele, mis on lähemal. |
| **Külgvaated** | **Ülevalt**, **Alt**, **Eest**, **Tagant**, **Vasakult**, **Paremalt** | Paralleelne. Ülevalt vaatab otse alla (kallak -89,9°), Alt otse üles, Eest mööda -Z (pöördenurk 0°), Tagant mööda +Z (180°), Vasakult mööda -X (-90°), Paremalt mööda +X (90°). |
| | **Tagasi perspektiivi** | Naaseb perspektiivi asendisse, mille jätsid. Perspektiivis keelatud. |
| | **Kolmveerandvaade** | Perspektiiv, pöördenurk -35°, kallak -28°. |

Iga eelseadistus vahetab ise projektsiooni – perspektiivis konvergeerub "pealtvaade" ikka kaugpunkti poole ja võrdsed alad ei paista enam võrdsetena – ning kaadrib andmed sellest suunast.

### Vaateväli {#field-of-view}

**Vaateväli** on vertikaalne nurk. Vaikimisi 65°, rajal 10–140° (käepidemega 179°), nupud **Lame 20°**, **Pikk 35°**, **Tavaline 50°**, **Lai 65°**, **Väga lai 90°**. Kitsas lamestab perspektiivi ja tundub rohkem paralleelprojektsioonina; lai liialdab sügavusega ja raskendab kauguste hindamist. See jääb paralleelses režiimis elavaks: seab mõõtkava, mille tagasilüliti lahendab, ja kauguse, mida **Kaader** kasutab.

### Lennukiirus {#fly-speed}

**Lennukiirus** on maailmaühikud (meetrit) sekundis täisgaasil. Vaikimisi 120; igal laadimisel andmete horisontaalne ulatus / 12. Logaritmiline, 0,02–20 000 (200 000 käepidemega; käepide muudab seda suhete, mitte summade kaupa). Hiireratas korrutab või jagab seda 1,5-ga sammu kohta, vahemikus 0,02–200 000.

Sama väärtus on kuvatud vaate paremas allnurgas (ainult perspektiivis): kiirus m/s või km/s ja aeg, mis kulub andmete (või taseme, kui laaditud on 3D-tase) läbimiseks selle kiirusega. Lohista seda üles või alla, et kiirust muuta.

### Lähedal ja kaugel {#near-and-far}

**Lähedal** (vaikimisi 0,5) ja **Kaugel** (vaikimisi 40 000) on lõikekaugused. Mõlemad arvutatakse igal laadimisel andmetest uuesti (lähedal = max(0,05, ulatus / 20 000), kaugel = ulatus × 12) ja neid laiendatakse, mitte ei kitsendata, kui 3D-tase on suurem ([Tasemed](levels.md#what-a-level-does-for-the-heat)). Nende suhe määrab sügavuse täpsuse, millele varjamine toetub, seega nõrgendab väga väike lähedal ja väga suur kaugel [varjamist](depth-and-culling.md). Stseenist väljastpoolt või kõrgelt selle maapinnast vaadates liigub tegelikult kasutatav lähitasand 2% sellest kaugusest välja, nii et kaugelt ülevalt vaadatud kaart säilitab piisava sügavuse täpsuse, et vesi ja kaldajoon ei välgataks; kast näitab ikka seatud väärtust.

### Muud juhtelemendid {#other-controls}

| Juhtelement | Vaikimisi | Tähendus |
|---|---|---|
| **Pööra Y ümber** | väljas | Pöörab hiire vaatamise üles/alla. |
| **Teravussügavus** | väljas | Vt allpool. |
| **Mängupult** | sees | Vt [Mängupult ja HOTAS](gamepad.md). |
| **Asend** | | Vt allpool. |
| **Uuri** | | Kaamera näit, klõpsuga valimine, pöördenurga kokkulepe ja *Mine punkti*; vt [Vaate uurimine](#inspecting-the-view). |
| **Kaadri andmestik (F)** | | Sobitab andmed (vahekaardil Sõiduanalüüs: ringid) vaatesse, säilitades praeguse suuna. Kaamera asetatakse kaugusele r / tan(fov / 2) keskpunktist, kus r on andmete piirkonna diagonaali pool. |
| **Ruudustik**, **Teljed** | sees, sees | Maapinna ruudustik sammuga 1/2/5 × 10ⁿ, umbes 1/40 andmete ulatusest (ulatudes 1,5 × andmeteni, 8 kuni 120 ruudustiku sammu vahel), ja värvilised teljed. |
| **Pööra maailma telg ümber** X, Y, Z | väljas | Vt allpool. |

### Asend {#pose}

Viis numbrikasti – **X**, **Y**, **Z** ja **pöördenurk °**, **kaldenurk °** – mis järgivad kaamerat, kui ükski neist ei ole fookuses. Sisesta väärtus ja vajuta `Enter` (või lahku kastist), et kaamera sinna liigutada. **kopeeri** paneb lõikelauale `pos X Y Z · yaw A · pitch B` (ja sellele järgneb `(game yaw)`, kui see kokkulepe on valitud). Lendamine on viis uurida; koordinaadid on viis vaate taasloomiseks. Need on samad numbrid mis [kaamera näit](#camera-readout): andmete enda koordinaadid, sealhulgas siis, kui telg on ümber pööratud, ja pöördenurk valitud [kokkuleppes](#yaw-conventions).

### Pööra maailma telg ümber {#invert-world-axis}

**Pööra maailma telg ümber X / Y / Z** joonistab maailma selle telje suhtes ümber pööratult. Mäng, mis hoiab vasakukäelist maailma, tuleb sellesse parempoolsesse vaatajasse peegelpildis – parempoolsed kurvid joonistatakse vasakpoolsetena – ja X või Z pööramine taastab selle. **Muutub ainult joonistus**: andmed, analüüs ja iga koordinaat, mida tööriistad näitavad (asend, joonlaud, lõige), jäävad mängu enda omaks. Vaade pöördub kohapeal, nii et vaatad ikka sama kohta. See seade jääb brauserisse meelde (`localStorage` võti `heat3d.mirror`); võrdle laadimisaegsete [pööramistega](axes-units-and-time.md#flips), mis muudavad andmeid.

## Vaate uurimine {#inspecting-the-view}

Kus kaamera on, mis on kursori all ja minek punkti – paneeli Kaamera ja stseen plokk **Uuri** ning kaks kattekihti vaate vasakus ülanurgas. Kood asub failides [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) ja [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Juhtelement | Vaikimisi | Tähendus |
|---|---|---|
| **Kaamera asukoht vaate kohal** | sees | Kaamera näit, allpool. Suletakse ka nupuga **×**. |
| **Klõps näitab, mis seal on** | sees | Klõpsuga valimine, allpool. |
| **Pöördenurga kokkulepe** | Vaatur | Milline pöördenurk näitab ja loeb näit, asendikastid ja hüppekast. |

Need kolm jäävad brauserisse meelde (`localStorage` võti `heat3d.inspect`).

### Kaamera näit {#camera-readout}

Vaate vasakus ülanurgas: kaamera **x**, **y**, **z**, **pöördenurk** ja **kaldenurk**, elavalt, koos sildiga, mis nimetab pöördenurga kokkuleppe. See näitab samu numbreid mis [Asend](#pose) kastid ega maksa lendamise ajal midagi (see kirjutatakse lehele kaadrikella järgi, ilma paneeli uuesti renderdamata).

- **kopeeri** (või `C` igal pool väljaspool tekstikasti) paneb lõikelauale `x X y Y z Z yaw A pitch B (viewer yaw)`, koos punktidega kümnendkohtadena, olenemata keelest – rida, mille hüppekast ja iga skript loeb tagasi.
- **mine** (või `G`) avab selle all kasti: kleebi punkt ja vajuta `Enter`, et seda vaadata, või kleebi terve kopeeritud asend, et seista selles vaates. `Esc` sulgeb kasti.

### Koordinaadid: andmete enda teljestik {#coordinates-the-datas-own-frame}

Iga koordinaat, mida uurimistööriistad näitavad või vastu võtavad, on **laaditud andmete enda teljestikus**: laadimise [telgede seos](axes-units-and-time.md) (ülesuunaline telg, pöörded, skaala) on tagasi keeratud. Vaatelt loetud asend on number, mis on lähtetabelis, ja tabelist hüppekasti sisestatud number viib sellele kohale. Kui seos ei muuda midagi (Y-üles, skaalata laadimine – just seda kirjutavad salvestustööriistad ja tasemete eksportijad), on see lihtsalt maailm; muidu kannab näit sildi **andmete teljestik**. Ilma andmestikuta on koordinaadid maailma koordinaadid. Pöördenurk ja kaldenurk on alati vaatleja maailma suhtes, Y üleval.

### Pöördenurga kokkulepped {#yaw-conventions}

| Kokkulepe | Pöördenurk 0° vaatab mööda | Kasvab poole | Kasutab |
|---|---|---|---|
| **Vaatur** | -Z | -X | vaba lendamise kaamera, [eelseadistatud vaated](#preset-views) |
| **Mäng / salvestustööriistad** | +X | -Z | salvestustööriistade `yaw` veerud ja asendid; vaatleja teljestikus eksporditud tasemel mängu enda pöördenurk |

Kaldenurk on mõlemas sama: horisontaalist üles. Need kaks erinevad veerandpöörde võrra ja muud midagi:

> vaatleja pöördenurk = mängu pöördenurk - 90°

Suund `d` on `(cos p · cos y, sin p, -cos p · sin y)` mängu kokkuleppes ja `(-sin y · cos p, sin p, -cos y · cos p)` vaatleja omas. Vali **Mäng / salvestustööriistad**, et sisestada pöördenurk otse salvestustabelist või võrrelda sellega näitu.

### Minek punkti {#going-to-a-point}

**Mine punkti**, plokis Uuri (ja näidu kasti **mine** all):

- tekstikast võtab `x, y, z` või `x y z` (või `x; y; z`), kümnendpunkti või kümnendkoma – `-321.6, 137.8, -59.9` ja `-321,6 137,8 -59,9` on sama punkt. Viis numbrit lisavad pöördenurga ja kaldenurga, ning näidult või asendikastidest kopeeritud asend loetakse tervena, koos siltide ja kokkuleppega;
- **pöördenurk °** ja **kaldenurk °** (valikuline) pööravad kaamerat valitud kokkuleppes;
- **Vaata** säilitab suuna (kallutatakse alla vaatama vähemalt 20°, kui vaadati tasaselt) ja tagasi mööda seda praeguse kauguseni, hoides 0,3% kuni 3% stseeni laiusest – 6 kuni 60 m kahekilomeetrisel tasemel. Fookuskaugus, paralleelvaate kõrgus ja lennukiirus järgivad, nii et vaade on kohe kasutatav;
- **Seisa siin** paneb kaamera punkti, pööratuna antud pöördenurga ja kaldenurga järgi või nii, nagu see oli.

Kleebitud asend oma pöördenurga ja kaldenurgaga viib alati sellesse vaatesse.

### Klõpsuga valimine {#click-to-pick}

Klõps vaatel – vajuta ja lase lahti, lohistamata rohkem kui 4 pikslit; lohistamine vaatab ikka ringi – näitab vaate vasakus ülanurgas kaarti, mis kirjeldab, mis on kursori all. Kui [joonlaud](measure.md) on sees, lähevad klõpsud joonlauale.

**Joonistatud andmepunkt võidab.** Lähim proov 8 pikslist klõpsust, nende hulgast, mis tegelikult joonistatakse: ajaaknas ja elueas olevad read, [filtritest](filters.md) läbi käivad, näidatud rühmad ja erinevuse jaotus, kauguseslõikamise piires ja lõike piires, mis lõikab kuumuse. Kastikordusel kast, mis on kursori all (kuhu iganes selle peal). Kaart loetleb iga veeru, mille rida kannab, allika enda veerunimede all – aeg (kellaaeg või faili enda sekundid `m:ss.ss`), isik, rühm, seanss, iga säilitatud veerg, asend ja vaatesuund – ning kauguse kaamerast. Mälus on ainult veerud, mille laadimine säilitas: veergu, mida ei valitud [filtriveeruks](column-mapping.md), ei näidata.

**Muidu taseme pind**: punkt, kus klõpsu kiir kohtub taseme tegelike kolmnurkadega (mitte joonlaua viitetasapinnaga), koos **osaga**, millele see kuulub (eksportija nimi, `structure:props`, `ground:terrain …`), selle **liigiga** (maapind, ehitis, vesi, kaardipilt), koordinaatide ja kaugusega. Lõike või kauguseslõikamisega peidetud geomeetria läbib. Kus tasemel on [navigeerimisvõrk](model-levels.md#navigation-meshes), nimetab rida selle ja ütleb, kas koht asub sellel (✓). Osa nimi eesliitega `≈` oli arvatud osade piirkastidest, sest see osa tasemest lihtsustati laadimisel.

Kaart jääb, kuni see suletakse (**×**, `Esc`), teine klõps vastab millelegi muule või klõps tühjale kohale. Stseenis joonistatakse punktile helesinine rist ja ekraanil selle ümber rõngas. Selle nupud: **kopeeri** (kõik väärtused ja koordinaadid kui `x, y, z`), **Vaata** ja **Seisa siin** (andmepunktil, vaadates nii, nagu rida vaatas, kui sellel on vaatesuund; pinnal 1,7 m selle kohal).

Tase on indekseeritud valimiseks esimesel klõpsul, mis seda vajab: veergude võrk tema jalajäljel, mida ehitatakse mõne millisekundi kaupa kaadrite vahel, nii et vaade ei seisa kunagi (umbes sekund tööd mitme miljoni kolmnurga tasemel), ja hoitakse kuni taseme muutumiseni. Kuni siis ütleb kaart *Taset valimiseks ette valmistatakse* protsendiga ja vastab klõpsule, kui see on valmis. Andmepunkti otsing üle nelja miljoni joonistatud rea jaotatakse samamoodi kaadrite vahele.

## Teravussügavus {#depth-of-field}

Kokkuklapitav jaotis paneelis Kaamera ja stseen, pealkirjaga *Teravussügavus - sees*, kui see on lubatud. Vaikimisi väljas: see on esitluslik efekt ja vaikevaade peaks näitama andmeid, mitte nende tõlgendust.

| Juhtelement | Vaikimisi | Ulatus (hoob) | Tähendus |
|---|---|---|---|
| **Sees** | väljas | | |
| **Teravusta sellele, mis vaatesse mahutati** | sees | | Teravusta kaugusel, mida viimane kaadrisse võtmine kasutas (*Teravustatud N m peale.*). |
| **Teravustamiskaugus** | 1000 | 1–200 000, logaritmiline (10 000 000) | Näidatakse, kui teravustamine on käsitsi. |
| **Ava** | ±35% | ±2% kuni ±200%, logaritmiline (±3200%) | Teravana hoitav sügavus, murdosana teravustamiskaugusest – suhteline, mitte f-arv, sest stseenid ulatuvad toast kaheksa kilomeetri kaardini. |
| **Maksimaalne hägu** | 12 px | 1–48 (256) | Suurim hägususe raadius; kulu skaleerub selle järgi. |

See hägustab **taset, ruudustikku ja kaste** – *mitte kuumust*. Kuumus pikslis on paljude sügavuste sprite'ide summa, seega pole tal ühte sügavust, kus olla fookuses; hägustada seda selle taga oleva geomeetria järgi oleks vale kõikjal, kus see hõljub ees. Terav andmestik pehmendatud konteksti taustal on ka kasulikum. Hägu on 24-punktiline kuldse nurga koguja koostu-etapis, kaalutud nii, et terav esiplaan ei määrduks väljapoole tagaplaani hägususe poolt. Selle muutmine joonistab uuesti, ilma kuumuse kogumist uuesti alustamata.

## Lõuendi eraldusvõime {#canvas-resolution}

Lõuend renderdatakse ekraani pikslisuhtega, piiratuna 2-ga. Kuumuspuhver võib olla renderdatud madalama eraldusvõimega kui see ([Kuumuse eraldusvõime](performance-and-stats.md)).

## Selle jaotise lehed {#pages-in-this-section}

- [Mängupult ja HOTAS](gamepad.md)
- [Klaviatuuri ja hiire juhend](keyboard-reference.md)
