---
title: "Atmintis ir biudžetai"
parent: "Duomenų įkėlimas"
nav_order: 6
lang: "lt"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Atmintis, biudžetai ir tikrinimas, ar telpa

Jūsų kompiuterio atmintis yra ribota. 3DHeat sudeda, ko reikia jūsų failams, ir prieš **Įkelti** pasako, ar jie telpa.

![Atminties įvertis: neatitinka, su iš anksto užpildytu Įkelti kas [N] eilutę ir mygtuku Įkelti, rodančiu Per didelis - sumažinkite arba retinkite](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Per didelis šiam kompiuteriui? 3DHeat vietoj to siūlo įkelti kas N-ąją eilutę.*

Naršyklės skirtukas, kuris išnaudoja atmintį įkėlimo viduryje, nulūžta ir praranda minutes darbo, o GPU, kuriam paprašoma daugiau, nei jis turi, arba praranda kontekstą, arba sulėtėja iki šliaužimo. Todėl prieš pradedant įkėlimą šaltinio skydelis parodo, kiek atminties jam reikia, palygina tai su šiai mašinai aptiktais biudžetais ir atsisako - su išeitimi - kai neatitiks. Modelis yra [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Atminties įvertis {#the-memory-estimate}

Rodomas virš mygtuko **Įkelti**, kai eilutės jau suskaičiuotos.

| Eilutė | Reikšmė |
|---|---|
| **Atminties įvertis** - *telpa* / *ankšta* / *neatitinka* | Išvada: žalia, gintarinė arba raudona. |
| `N eilučių · B B/eilutei` | Eilutės, kurios bus įkeltos (po žingsnio), ir pastovūs baitai vienai eilutei. |
| `RAM X rezidentinė, Y pikas įkeliant` | Atmintis, laikoma įkėlus, ir didžiausia reikšmė įkėlimo metu. |
| `GPU Z · apskaič. įkėlimas T` | GPU atmintis eilutėms ir apskaičiuota trukmė esant 1,2 milijono eilučių per sekundę. |
| GPU pavadinimas | Atvaizdavimo įrankio pavadinimas, kai tvarkyklė jį praneša. |
| Pranešimai | Kodėl neatitinka arba ankšta ir ką daryti. |
| **Įkelti kas [N] eilutę** | Retinimo žingsnis (žr. žemiau). |
| `Biudžetas: X RAM, Y GPU. Keiskite skiltyje Našumas → Išteklių biudžetai.` | Biudžetai, kuriuos naudojo tikrinimas. |

### Baitai vienai eilutei {#bytes-per-row}

| Stulpelis | Pastovu (RAM) | Pastabos |
|---|---|---|
| Padėtis | 12 | Visada trys 32 bitų slankieji skaičiai (plokščia ašis vis tiek yra masyvas) |
| Laikas | 4 | Kai susietas |
| Gyvavimo trukmė | 4 | Kai susieti laikas ir asmuo |
| Asmuo | 4 | Kai susietas |
| Grupė | 2 | Kai susieta |
| Sesija | 4 | Kai susieta |
| `Source file` | 4 | Kai įkeliama daugiau nei vienas failas |
| Kiekvienas filtro stulpelis | 4 | Kiekvienam pažymėtam stulpeliui *Palikti filtravimui* |

**Pikas** prideda tai, ko įkėlimui reikia tik trumpam - 8 baitus 64 bitų laikui sujungiant, 12 baitų rikiavimo raktams ir indeksams, 4 baitus permutacijos laikinai atminčiai (visus tris, kai susietas laikas), ir 4 baitus, kol grupės stulpelis dar 32 bitų - ir sumos daugiklis yra **2,0**. Tas koeficientas išmatuotas (tikras kelių failų įkėlimas pasiekė 1,9 karto daugiau nei surašyti masyvai dėl Parquet dekoderio darbinės aibės, kopijų, kurios apkarpo kiekvieną stulpelį iki ilgio, ir atminties, kuri jau atlaisvinta, bet dar negrąžinta) ir suapvalintas aukštyn, nes per mažas įvertinimas kainuoja nulūžusį skirtuką, o per didelis tik nereikalingą žingsnį.

Ant **GPU** kiekviena eilutė kainuoja 8 baitus (padėtis ir grupė, po 16 bitų), plius 4 baitus (laikas ir gyvavimo trukmė, po 16 bitų), kai susieti ir laikas, ir asmuo. Žr. [GPU atminties išlaikymas](gpu-memory.md). Filtrų tekstūros (4 baitai eilutei kiekvienam aktyviam filtrui) ir linijų šilumos segmentų pradžios (8 baitai eilutei, kai įjungtas Lines režimas) nėra šio įvertinimo dalis.

## Tikrinimas, ar telpa {#the-fit-check}

Lyginami trys apribojimai ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- pikas RAM palyginti su **RAM biudžetu**,
- GPU baitai palyginti su **GPU biudžetu**,
- eilučių skaičius palyginti su **rikiavimo riba** - 400 000 000 eilučių, kai susietas laiko stulpelis.

Lemia blogiausias iš trijų santykių: iki 70% - *telpa*, iki 100% - *ankšta* (turėtų įkelti, bet tikėkitės lėtumo), virš to - *neatitinka*. Kai neatitinka, skydelis nurodo lemiantį apribojimą ir siūlo:

- įkelti kas *N*-ąją eilutę, kur *N* = ⌈eilutės / tinkamos eilutės⌉, iš anksto įrašytą žingsnio langelyje;
- pašalinti filtrų stulpelius, atsieti laiko stulpelį (tai pašalina rikiavimą ir jo ribą, kainuodama laiko juostą) arba padidinti biudžetą.

Kai pats biudžetas nėra faktas apie techninę įrangą - naršyklė apribojo RAM skaičių, numatytoji reikšmė sumažinta pagal tai, kas laisva tuo metu, arba GPU skaičius yra spėjimas - pranešime tai pasakoma, kad nesiekėte žingsnio, kurio nereikia.

### Retinimas {#decimation}

**Įkelti kas [N] eilutę** palieka po vieną eilutę iš *N*, skaičiuojant kiekviename faile. Šilumos vaizdas yra vidurkis, todėl kas *N*-oji eilutė duoda tą patį pasiskirstymą su daugiau triukšmo - tas pats kompromisas, kurį atvaizdavimas jau daro kiekviename kadre. Langelis prasideda nuo 1 (*eilutė (visos)*); kai pasirinkimas netelpa, jis iš anksto užpildomas siūlomu žingsniu, nebent įrašėte ką nors pats. Mygtukas Įkelti tada rodo *Įkelti N failus (1 iš K)*, o duomenų rinkinio pavadinime užrašoma `every Kth row` (kas K-oji eilutė).

### Rikiavimo riba {#the-sort-ceiling}

Atvaizdavimo įrankiui reikia eilučių didėjančia laiko tvarka, todėl susietas laiko stulpelis reiškia visų eilučių rikiavimą radikso rikiavimu per 32 bitų raktus ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Daugiau nei **400 milijonų** eilučių atsisakoma, o ne bandoma skirtuke. Tai tikrinama prieš įkėlimą, todėl pasirinkimas virš ribos atmetamas su siūlomu žingsniu, o ne skaitomas visas ir nulūžta paskutiniame žingsnyje. Arti ribos (*ankšta*) skydelis įspėja, kad rikiavimas yra ilgas etapas be savo progreso. Be laiko stulpelio rikiavimo nėra ir ribos nėra.

## Išteklių biudžetai {#resource-budgets}

**Našumas → Išteklių biudžetai** (sulankstoma eilutė Našumo skydelio apačioje, kur rašoma `Resource budgets - RAM, GPU, cores` (Išteklių biudžetai - RAM, GPU, branduoliai)). Biudžetai aptinkami; aptiktas skaičius yra numatytoji reikšmė; o slankikliai neina aukščiau **ribos**, kuri yra aptiktas skaičius, išskyrus atvejus, kai žinoma, kad aptikimas nėra matavimas.

| Valdiklis | Ribos | Reikšmė |
|---|---|---|
| **RAM eilučių duomenims** | nuo 256 MiB iki RAM ribos, logaritmiškai | RAM biudžetas tikrinimui, ar telpa. Pažymėta *(virš aptikto)* viršijus aptiktą numatytąją reikšmę, *(maks.)* ribos. |
| **GPU eilučių duomenims** | nuo 128 MiB iki GPU ribos, logaritmiškai | GPU biudžetas tikrinimui ir eilučių įkėlimui. Pažymėta *(virš aptikto)* viršijus aptiktą numatytąją reikšmę, *(maks.)* ribos. |
| **Analizės gijos** | nuo 1 iki loginių branduolių skaičiaus | Kiek failų įkėlimas analizuoja vienu metu, kiekvienas savo darbininko gijoje. Numatyta: branduolių skaičius minus 2 (minus 1, kai keturi ar mažiau branduolių). Žr. [Analizės gijos](#parser-threads) (skyriuje Kūrėjams). |
| Šaltinių eilutė | | Iš kur kiekvienas skaičius gautas (`RAM: …. GPU: …. CPU: ….`). |
| **Aptikti iš naujo** | | Paprašo kūrimo serverio naujo atminties nuskaitymo ir perskaičiuoja visus biudžetus. |
| GPU pavadinimas | | Adapterio trumpas pavadinimas; pilna atvaizdavimo eilutė - patarime. |

### GPU biudžeto didinimas {#raising-the-gpu-budget}

GPU biudžetas, didesnis nei aptiktas, taikomas kaip nustatytas: tikrinimas ir įkėlimas paima tą patį skaičių iš vienos funkcijos ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), kuri ją apriboja tik GPU riba, kurioje slankiklis sustoja. Taigi įkėlimas, kurį tikrinimas praleidžia, įkeliamas pilnai. Viršijus aptiktą skaičių, slankiklis rodo *(virš aptikto)*: skaičius tada yra jūsų spėjimas apie kortą, o ne matavimas, ir nustačius jį didesnį nei kortoje yra, rizikuojama prarasti kontekstą arba sulėtėti iki šliaužimo.

## Labai dideli duomenų rinkiniai: svertai {#huge-datasets-the-levers}

Nuo pigiausio iki drastiškiausio:

1. **Mažiau filtro stulpelių.** Kiekvienas - 4 baitai eilutei ir dekodavimo praėjimas.
2. **Žingsnis.** Kas *N*-oji eilutė.
3. **Be laiko stulpelio.** Nėra rikiavimo, nėra rikiavimo ribos, nėra 4-8 baitų eilutei laiko ir gyvavimo trukmės - ir nėra laiko juostos.
4. **Padidinkite biudžetus**, kai žinote, kad atminties yra.

Atvaizdavimo metu dideli duomenų rinkiniai tvarkomi imties ėmimu ir progresyviu kaupimu, o ne duomenų mažinimu; žr. [Imties ėmimas ir biudžetai](sampling-and-budgets.md).

## Kūrėjams {#for-developers}

### Analizės gijos {#parser-threads}

Kelių failų įkėlimas vienu metu analizuoja iki **Analizės gijų** skaičiaus failų, kiekvienas savo analizės darbininke, paleistame įkėlimo darbininko tam įkėlimui ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Kai 1 arba vienas failas, failai analizuojami vienas po kito pačiame įkėlimo darbininke.

Kelių vienu metu paleidimas neatlaisvina tikrinimo, ar telpa:

- **Pirmiausia skaičiuojamas kūrėjas.** Sujungti stulpeliai išskiriami visam pasirinkimui prieš skaitant pirmąjį failą, todėl skrendantys failai gauna tik tai, ką RAM biudžetas palieka šalia (`parseHeadroom`): padėtis, 64 bitų laikas, žiūrėjimo kampai, asmuo, 32 bitų grupė, sesija, filtrų stulpeliai ir `Source file`, kiekvienai įkeliamai eilutei - padauginta iš 2,6, kai eilučių skaičius yra CSV įvertis, nes stulpelis auga į didesnį.
- **Kiekvienas failas prieš pradedant rezervuoja savo kainą** (`fileParseBytes`): jo eilutės (iš Parquet poraštės; CSV dalis įvertyje pagal dydį) padaugintos iš tų pačių stulpelių ir iš **8** - pats blokas, šalia esanti kopija, kol eilutės be padėties išmetamos, ir dekoderio darbinė aibė, kuri tekstiniams stulpeliams gerokai didesnė nei jų id. Žingsnis to nesumažina, nes failai skaitomi visi, o retinami vėliau. 8 yra matavimu nustatyta atsarga: esant 3 ar 5, trisdešimt analizės gijų išmetė skirtuką už ribos su 86 milijonais eilučių su asmenų ir sesijų vardais; esant 8 - ne.
- **Kitas failas pradedamas tik tada, kai jo rezervacija telpa** likusiame. Failas, kuris baigtas, bet laukia ankstesnio sujungimo, išlaiko savo rezervaciją, kol bus sujungtas.
- **Vienas failas visada vykdomas.** Kai nieko nerezervuota, kitas failas pradedamas, kad ir kiek kainuotų - tai yra vienas po kito įkėlimas, kurį tikrinimas leido, todėl griežtas biudžetas grįžta prie jo, o ne atsisako.

Skiltis *pikas įkeliant* yra vieno po kito įkėlimo pikas, kuris pasiekiamas rikiavimo metu, kai visi failai jau perskaityti. Šalia vienas kito analizuojami failai gali viršyti šią reikšmę skaitymo metu; rezervacijos laiko juos RAM biudžeto ribose, kiek tiksliai teisingi aukščiau pateikti įvertinimai.

Sujungimo tvarka yra pasirinkimo tvarka, kad ir kokia tvarka failai baigtųsi, todėl asmenų, grupių ir sesijų numeracija, eilutės ir `Source file` reikšmės yra tokios pačios kaip vieno po kito įkėlimo. Failas, kurio nepavyksta perskaityti, praleidžiamas ir išvardijamas kaip anksčiau. Analizės darbininkas, kuris žūva, nutraukia visą įkėlimą, kaip ir įkėlimo darbininko žūtis visada nutraukdavo, o kiekvienas analizės darbininkas užbaigiamas, kai įkėlimas baigiasi, kaip bebūtų baigiantis. Jei analizės darbininkų visai paleisti nepavyksta, failai analizuojami įkėlimo darbininke.

### Kaip aptinkami skaičiai {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) paleidžiamas paleidimo metu, dar kartą, kai atvaizdavimo įrankis jau yra, ir paspaudus **Aptikti iš naujo**.

**RAM, su kūrimo serveriu.** `start.bat` ir `npm run dev` pateikia puslapį iš proceso, kuris gali nuskaityti mašinos atmintį, adresu `/__host/memory` (atsakoma per 1,5 s arba ignoruojama). Numatytoji reikšmė yra mažesnioji iš 60% įdiegtos RAM ir 80% dabar laisvos RAM; riba - 60% įdiegtos. Kai numatytąją reikšmę žemina laisva atmintis, skydelis tai pasako ir siūlo uždaryti programas bei paspausti **Aptikti iš naujo**.

**RAM, be jo** (statinis diegimas): joks naršyklės API nepraneša laisvos atminties, o `navigator.deviceMemory` Chrome ir Edge suapvalinamas žemyn iki dviejų laipsnio ir apribojamas 8 GiB. Numatytoji reikšmė yra 60% `deviceMemory`, dar apribota 4 × laisvu skirtuko JS krūva, kai naršyklė ją praneša, arba 4 GiB, kai nieko nepranešama. Kai `deviceMemory` rodo tiksliai 8 (riba), skaičius pažymimas kaip *apribotas*, o riba yra 4 × numatytoji reikšmė, su pastaba, kad viršijus numatytąją skaičius yra jūsų teiginys, o ne matavimas.

**Abiem atvejais** RAM numatytoji reikšmė ir riba apribojamos **12 GiB** - daugiausia tipizuotų masyvų atminties, kurią vienas Chrome skirtukas gali laikyti, kad ir kokia būtų mašina (puslapis pasiekė apie 15,75 GB ir nulūžo; 12 palieka vietos viskam kitam), ir niekada nenukrenta žemiau 256 MiB.

**GPU atmintis.** Joks žiniatinklio API jos visai nepraneša.

- Su kūrimo serveriu kortos atmintį nuskaito `nvidia-smi` (didžiausias adapteris) arba, Windows sistemoje, iš displėjaus adapterio registro reikšmės `HardwareInformation.qwMemorySize`. Numatytoji reikšmė yra 70% jos, riba - 90%.
- Be nuskaitymo ji išvedama: pagal numatymą 2 GiB; 4 GiB, kai didžiausia tekstūra yra 16 384 px ar didesnė (diskrečioji kortelė), 1 GiB, kai mažesnė; arba 8 × WebGPU `maxBufferSize`, kai ji didesnė. Riba tada yra 8 × išvestas skaičius, nes išvedimas atskiria integruotą dalį nuo diskrečios ir nieko smulkesnio. Skydelis sako, kad skaičius išvestas.
- Niekada nežemiau 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4, kai nepranešama).
