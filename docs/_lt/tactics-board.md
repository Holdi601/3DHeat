---
title: "Taktikos lenta"
nav_order: 15
has_children: true
lang: "lt"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Taktikos lenta

Skirtukas **Taktika** yra piešimo lenta komandos planui: ant žemėlapio dedate mažas figūras, piešiate rodykles, kur jos eina, ir paspaudžiate groti, kad pamatytumėte, kaip tai vyksta. Naudokite, kad suplanuotumėte raundą ar ataką prieš žaisdami. Jis su kitais skirtukais dalijasi tik drobę, kamerą ir [lygį](levels.md); planas nėra duomenys ir nepiešia šilumos.

## Jūsų pirmas planas {#your-first-plan}

1. Atidarykite skirtuką **Taktika**. Pasirinkite **Žaidimą** (pavyzdžiui, Counter-Strike 2) ir, jei Valorant, paspauskite **Įkelti Valorant žemėlapius** ir pasirinkite **Žemėlapį**. Arba pirma įkelkite [lygį](levels.md).
2. Pasirinkite **Pusę** (ji nustato spalvą) ir paspauskite **Vaizdas iš viršaus**.
3. Pasirinkite **Padėti**, pasirinkite figūrą **Figūrose** (naudokite **Ieškoti figūrų**, kad rastumėte) ir spustelėkite žemėlapį. Padėkite dvi ar tris.
4. Pasirinkite **Rodyklė**, spustelėkite figūrą, spustelėkite kelią, kuriuo ji turėtų eiti, ir paspauskite **Enter**, kad užbaigtumėte rodyklę.
5. Paspauskite **+** po vaizdu, kad pridėtumėte 2 žingsnį. Kiekviena figūra prasideda ten, kur baigėsi jos rodyklė. Ten nubrėžkite daugiau rodyklių.
6. Paspauskite **▶** (arba `K`), kad planas paleistų nuo rodomo žingsnio iki pabaigos.
7. Pavadinkite planą lauke **Plano pavadinimas** ir paspauskite **Įrašyti**.

![Taktikos skirtukas vaizde iš viršaus: žaidimas, pusės ir įrankiai kairėje, trys figūros su Judėjimo rodyklėmis, dūmų Metimo lanko, Sritis ir žingsniai apačioje](../assets/img/lt/tactics.webp)

## Plano pradžia {#starting-a-plan}

| Valdiklis | Ką daro |
|---|---|
| **Žaidimas** | Parenka puses ir figūras, kurias siūlo paletė: Counter-Strike 2 (T, CT; žaidėjai ir priemonės), Valorant (Ataka, Gynyba; žaidėjai ir bendri gebėjimai), Battlefield, Squad, Arma (pėstininkai, sausumos technika, orlaiviai, laivai), DCS / War Thunder / IL-2 (reaktyviniai, sraigtiniai lėktuvai, sraigtasparniai, oro gynyba, sausuma, laivai, ginklai) ir Kita. Planas, kuriame jau yra figūrų, pakeitus žaidimą išlaiko savo puses. |
| **Plano pavadinimas** | Vardas, pagal kurį planas įrašomas. |
| **Žemėlapis**, **Įkelti Valorant žemėlapius** | Pasirinkus Valorant: **Įkelti Valorant žemėlapius** gauna žemėlapių sąrašą iš [valorant-api.com](https://valorant-api.com); **Žemėlapis** tada padeda pasirinkto žemėlapio mini žemėlapį kaip lygį, įrėmintą iš viršaus. Paveikslėlis parsisiunčiamas pasirinkus ir niekada nesiunčiamas kartu su programa. Riot pranešimas rodomas, kol jis matomas ekrane (žr. žemiau). |
| **Pusė** | Pusė, kuriai priklauso kita figūra, rodyklė ar sritis; ji įgauna tos pusės spalvą. |

Be lygio lenta yra plokščias žemės paviršius. Įkelkite lygį skiltyje **Lygis**, kad planuotumėte ant tikro žemėlapio: CS2 žemėlapį, eksportuotą CS2 įrankiu, lygį iš bibliotekos arba žemėlapio paveikslėlį.

## Įrankiai {#tools}

| Įrankis | Spustelėjimas | Pastabos |
|---|---|---|
| **Žymėti** | Figūra, tarpinis taškas, rodyklė, sritis ar pastaba pažymi ją. | Shift+spustelėjimas prideda arba pašalina; Shift+tempimas nubrėžia dėžę, ką pridėti. Pažymėjimas gauna transformacijos įrankį (žr. žemiau); `Delete` arba `Backspace` pašalina. `M` perkelia pažymėtą figūrą į kitą spustelėjimą. |
| **Padėti** | Padeda pasirinktą figūrą. | Figūra pasirenkama **Figūrų** paletėje (su **Ieškoti figūrų**). Jei nieko nepažymėta, `R` pasuka kitą figūrą 15° prieš padedant (`Shift+R` – kita kryptimi). |
| **Rodyklė** | Kiekvienas spustelėjimas prideda tašką; Enter, dvigubas spustelėjimas arba dešinysis spustelėjimas ją baigia, Esc ją išmeta. | **Perkelti**, **Ataka** (platesnė galvutė) arba **Stebėjimas** (plona linija akių aukštyje). Rodyklė, pradėta ant figūros, yra tos figūros maršrutas šiame žingsnyje: atkūrus figūra juo eina, o kitas žingsnis prasideda ten, kur ji baigėsi. |
| **Metimas** | Metėjas, tada kur nukrenta. | Brūkšninis lankas tarp jų, o pasirinkta priemonė (dūmai, blyksnis, molotovas ir kt.) atsiranda, kur nukrenta, ir lieka nuo šio žingsnio. |
| **Sritis** | Centras, tada kraštas. | Diskas pusės spalva. |
| **Pastaba** | Kur eina pastaba; prašo jos teksto. | Rodoma kaip smeigtukas, o jos tekstas virš jo. |
| **Trinti** | Figūra, rodyklė, sritis ar pastaba. | Pašalina nuo šio žingsnio; pirmame žingsnyje – visiškai. |

**Anuliuoti** ir **Grąžinti** (`Ctrl+Z`; `Ctrl+Y` arba `Ctrl+Shift+Z`) eina per kiekvieną pakeitimą. Linija po planu rodo, kiek figūrų, rodyklių ir žingsnių jame yra. **Vaizdas iš viršaus** žiūri tiesiai žemyn (ortografinis), **3D vaizdas** grąžina perspektyvą, **Sutalpinti** įrėmina planą, o jei planas tuščias – lygį.

**Figūrų dydis** keičia visų figūrų mastelį lentoje; 1× yra tikras dydis, kuris iš labai aukštai yra keli pikseliai žmogui.

## Perkėlimas, sukimas ir keitimas mastelį {#moving-turning-and-scaling}

Viską lentoje galima perkelti kaip 3D redaktoriuje: figūras, priemones, žymes, atskirus tarpinius taškus ir visas rodykles, sritis ir pastabas. Pažymėtas elementas gauna įrankį savo viduryje:

| Režimas | Klavišai | Rankenėlės |
|---|---|---|
| **Perkelti** | W (arba G) | Rodyklė kiekvienai ašiai (X raudona, Y žalia ir aukštyn, Z mėlyna) perkelia išilgai jos; kvadratas perkelia per savo plokštumą; centras perkelia virš lygio po žymekliu. |
| **Sukti** | E (arba R) | Žiedas kiekvienai ašiai sukasi apie ją. Vienos figūros žiedai yra jos paties posūkis, polinkis ir riedėjimas; grupė sukasi apie pasaulio ašis aplink savo vidurį. |
| **Keisti mastelį** | R (arba S) | Išskleidžia arba suspaudžia pažymėtą dalį nuo jos vidurio išilgai ašies arba visomis kryptimis; sritis spindulys auga kartu. |

**Klavišai** perjungia tarp W / E / R (Unity, Unreal) ir G / R / S (Blender); klavišai parenka režimą tik kai kažkas pažymėta, o kitaip skrenda kamera. Taigi `R` reiškia **Keisti mastelį** su W / E / R klavišais ir **Sukti** su G / R / S klavišais, kai kas nors pažymėta, o kai nieko nepažymėta – pasuka kitą figūrą prieš padedant. Visi lentos klavišai išvardyti [klavišų nuorodoje](keyboard-reference.md#tactics-board). Laikykite **Ctrl** tempdami, kad perkėlimas prisitrauktų prie **Tinklelio** (metrai) arba sukimas – prie **Kampo žingsnio**. **Prilipdyti prie žemės** (pagal numatymą įjungta) perkeltus žmones, technikę, žymes, tarpinius taškus ir sritis pastato ant lygio paviršiaus; orlaiviai ir sraigtasparniai išlaiko aukštį, o tempimas išilgai Y rodyklės niekada neprisitraukia. Tempiant rankenėlę kamera niekada nejuda. **Esc** atšaukia tempimą, o kiekvienas pakeitimas yra vienas Anuliavimo žingsnis.

Tarpiniai taškai rodomi kaip taškai rodomo žingsnio rodyklėse: spustelėkite vieną, kad pažymėtumėte, tempkite, kad perkeltumėte, Delete, kad pašalintumėte. Skiltyje **Pasirinkti** rodoma pažymėto elemento vieta metrais, figūros posūkis, polinkis ir riedėjimas laipsniais bei srities spindulys – visa įrašoma.

## Laikas {#timing}

Figūros maršrutas yra laiko atžymėtas: kiekvienas ruožas trunka savo ilgį lygyje – matuojamą paviršiuje kas porą metrų, todėl kalva ar laiptai tarp dviejų taškų skaičiuojami – tos figūros **judėjimo režimo** greičiu tame žaidime, plius bet koks **laukimas** prie tarpinio taško. Pėstininkai šliaužia, tupi, eina (tyliai), bėga arba sprintina; technika ir laivai šliaužia, važiuoja atsargiai, įprastai arba skuba; orlaiviai ir sraigtasparniai skrenda lėtai, skrydžio greičiu, kovos greičiu arba maksimaliu. Režimas, kurio žaidimas neturi (CS2 neturi sprinto), paima artimiausią turimą. Kaip įkalnė lėtina, priklauso nuo žaidimo: CS2 ir Valorant skaičiuojamas tik horizontalus atstumas, kaip žaidimuose; karinės simuliacijos pėstininkus įkalnėje lėtina (Tobler'io pėsčiojo funkcija), o techniką – pagal nuolydį.

Greičiai ateina iš kiekvienam žaidimui skirtų lentelių su šaltiniais (žr. [Judėjimo greičiai](tactics-speeds.md)): CS2 – pagal laikomą ginklą, iš žaidimo ginklų apibrėžimų; Valorant – pagal ginklą; Battlefield, Squad, Arma ir oro žaidimai – pagal technikos tipą ir klasę. **Juda kaip** parenka figūros profilį (ginklą, technikos tipą); **Savas (m/s)** nepaiso jokio režimo tai figūrai. Režimai pavadinti taip, kaip rodo lenta: *Šliaužti*, *Pritūpti*, *Eiti (tyliai)*, *Bėgti*, *Sprintas*; *Atsargus*, *Įprastas*, *Rush*; *Lėtas*, *Kreiserinis*, *Kova*, *Maksimalus*.

Kiekvienas tarpinis taškas rodo laiką nuo paskutinio ir laiką nuo plano pradžios („+3,9 s · 0:12“). Pažymėtos figūros maršrutas išvardija kiekvieną ruožą su jo režimu, ilgiu ir laiku, laukimą ir atvykimą. **Atvykimai** skiltyje **Laikas** deda kiekvieną maršrutizuotą figūrą į vieną laiko liniją, pirmasis atvykimas viršuje. Su **Groti realiuoju laiku** (pagal numatymą įjungta) žingsnis trunka tol, kol atvyksta lėčiausias maršrutas, ir kiekviena figūra juda savo greičiu; **Sekundės** tada yra trumpiausias žingsnio ilgis. **Lygio vienetų metre** nurodo, kuo lygis yra: 39,37 CS2 žemėlapiams (žaidimo vienetai), 1 metrų žemėlapiams.

## Palyginkite su rungtynių duomenimis {#compare-with-match-data}

**Įkelti rungtynių failus…** nuskaito CS2 rungtynių lenteles žemėlapiui (CS2 įrankio Parquet failus, kiek norite; tik reikalingus stulpelius, fone); **Naudoti įkeltus duomenis** paima peržiūros programoje įkeltus duomenis. Tada:

- **Anksčiausias atvykimas žemėlapyje** nudažo žemėlapį pagal laiką nuo raundo pradžios, per kurį žaidėjas pirmą kartą pasiekė kiekvieną vietą – mygtukas **Greičiausias** rodo greičiausią per visus raundus, **Tipinis (mediana)** – vidurinį raundą: žalia anksti, raudona vėlai, vienai ar abiems pusėms. Tai rodo, kas įmanoma, kada.
- Pasirinktas maršrutas lyginamas su tuo, ką žaidėjai pasiekė nuo jo pradžios (arba nuo raundo pradžios) iki pabaigos, kiekviena pabaiga – diskas nustatytu spinduliu: „Greičiausias stebėtas 14,2 s, p10 15,0 s, mediana 18,3 s per 41 bandymą; jūsų planas 15,1 s“.
- Greičiai, kuriais žaidėjai iš tikrųjų judėjo – bėgant, eiti, tupint, iš lentelių ėjimo ir tupėjimo stulpelių – m/s.

## Žingsniai {#steps}

Juosta po vaizdu laiko žingsnius. Planas prasideda su vienu; **+** prideda vieną, o kiekviena figūra jame prasideda ten, kur baigėsi jos maršrutas paskutiniame žingsnyje; **−** pašalina rodomą. **Sekundės** yra, kiek trunka rodomas žingsnis paleidus. **▶** (K) groja nuo rodomo žingsnio iki pabaigos: figūros su maršrutu juo eina, figūros, perkeltos į naują vietą kitame žingsnyje, slysta ten, likusios stovi. Kol žingsnis rodomas, kiekvienos figūros vieta kitame žingsnyje piešiama blyškiu šešėliu, o paskutinio žingsnio rodyklės silpnai matomos po šio.

## Įrašymas {#saving}

Skiltyje **Failas** yra **Įrašyti**, **Pirm.** ir **Išvalyti**. **Įrašyti** planą įrašo kaip `<name>.h3dplan.json` (paprastas JSON: pusės, žingsniai, figūros su vieta kiekviename žingsnyje, rodyklės, sritys, pastabos); **Pirm.** nuskaito jį atgal. Kito versijos failas arba failas, kuris nėra planas, atmetamas su priežastimi. **Išvalyti** ištuština planą; Anuliuoti jį grąžina.

## Figūros {#figures}

Kiekvieną figūrą sukuria pati peržiūros programa: paprastos formos pagal paskelbtą tipo dydį, su bruožais, kurie atskiria ją nuo kaimynų – tanko kelio ratai ir bokštas, ginklai, raketos ir radarai oro gynybos technikai, orlaivio sparno planas, uodega ir varikliai, sraigtasparnio sraigtai ir trumpi sparnai. Niekas nepaimta iš žaidimo. Žaidimo sugalvotas dizainas rodomas kaip bendra jo klasės figūra. Kaip duomenys randa savo figūrą, žr. [Figūros](figures.md#which-figure-a-unit-gets).

## Riot pranešimas {#riots-notice}

Valorant žemėlapiai rodomi pagal Riot Games „Legal Jibber Jabber“ politiką, kuri leidžia nemokamiems bendruomenės projektams jais naudotis ir reikalauja šio pranešimo visur, kur jie pasirodo: *3DHeat sukurta pagal Riot Games „Legal Jibber Jabber“ politiką, naudojant Riot Games priklausančius išteklius. Riot Games nepritaria šiam projektui ir jo neremia.* Lentoje esantys gebėjimai yra bendros formos, o ne Riot meno kūriniai.
