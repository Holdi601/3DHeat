---
title: "Įžvalgos"
nav_order: 7
has_children: true
lang: "lt"
source: "insights.md"
source_hash: "c8722ac44bfa"
translated: true
outdated: false
---

# Įžvalgos

**Įžvalgos** peržiūri įkeltus duomenis ieškodamos to, kas išsiskiria – stiprių pozicijų, pavojingos vietovės, atsiradimo spąstų, siaurų vietų, žaidėjų, labai pranokstančių savo bendraamžius – ir praneša apie tai, stipriausius pirma, su įrodymais. Su jomis per minutę sužinosite, kur rungtynės buvo laimėtos arba pralaimėtos. Vėliau jos gali parašyti santrauką, o vienose rungtynėse gali veikti kaip komentatorius, kuris peršoka prie didelių akimirkų.

Viskas skaičiuojama jūsų naršyklėje. Niekas nepalieka jūsų kompiuterio, nebent įjungsite išorinį DI (žr. [Išorinis DI](#external-ai)).

![Įžvalgos tankų demonstracijoje: 14 radinių, stipriausi pirmi](../assets/img/lt/insights.webp)

Skiltis **Įžvalgos** yra Šilumos žemėlapio ir Rungtynių skirtukų šoninėje juostoje. Ji turi tris skirtukus: **Radiniai**, **Santrauka** ir **Komentatorius**.

## Radiniai {#findings}

1. Įkelkite duomenis ir atidarykite **Įžvalgos**. Paspauskite **Rasti įžvalgų** (rodoma „Skaičiuojama… n%“, kad matytumėte eigą).
2. Perskaitykite sąrašą. Kiekvienas radinys turi stiprumo juostą, sakinį, kokie įrodymai (*Stiprūs įrodymai*, *Geri įrodymai* arba *Šiek tiek įrodymų*), kuris detektorius jį rado ir transporto klasę, kai tai svarbu.
3. **Spustelėkite radinį**: peržiūros programa pritaiko jo filtrus, nuskrenda kamera į vietą, peršoka į laiką ir atidaro detales: efektą su 95 % intervalu, p ir q reikšmes, suskaičiuotus įrodymus bei **Tūris čia**, kuris nubrėžia [tūrį](volumes.md) aplink vietą.
4. **Atkurti filtrus** grąžina jūsų filtrus. **Kopijuoti JSON** nukopijuoja visą ataskaitą.

Skaičiavimas naudoja dabartinius filtrus, paslėptas grupes ir pasirinktas rungtynes per visą laiko intervalą. Jei vėliau pakeisite filtrus, pranešimas tai nurodys; paspauskite **Perskaičiuoti**.

Sąrašo viršuje esančios eilutės (pavyzdžiui, pinigų sumos) apibendrina visus duomenis prieš radinius.

![Atidarytas radinys: šūvių karštoji zona, jos skaičiai ir atitinkama literatūros ištrauka](../assets/img/lt/insights-finding.webp)

### Detektoriai {#the-detectors}

| Detektorius | Ką randa | Reikia duomenyse |
|---|---|---|
| **Galios pozicijos** | Vietas, kur nužudymų ir mirčių santykis daug geresnis nei kitur žemėlapyje, ir *saugią vietą*, kur per praleistą laiką žūsta mažai | nužudymų ir mirčių įvykių |
| **Karštos ir šaltos zonos** | Vietas, kur įvykių rūšis (šūviai, pataikymai, užėmimai ...) pasitaiko daug dažniau arba rečiau, nei prognozuoja ten praleistas laikas | įvykių stulpelio |
| **Atvira vieta ir priedanga** | Mirtys atvirai prieš arti esančią lygio geometriją ir lėtai prieš greitą judėjimą | mirčių; 3D lygio geometrijos daliai |
| **Atsiradimo taškai** | Stiprūs atsiradimo taškai, atsiradimo spąstai, saugūs atsiradimo taškai, laikas iki pirmo kontakto | laiko ir asmenų |
| **Klasė pagal vietą** | Transporto klasė arba žaidėjai prieš DI, daug geriau ar blogiau veikiantys srityje | nužudymų ir transporto klasės arba žaidėjo/DI stulpelio |
| **Žaidėjai** | Žaidėjai, kurie nužudo arba žūsta daug dažniau ar rečiau nei kiti tos pačios klasės žaidėjai | asmenų ir nužudymų |
| **Siauros vietos ir flangai** | Siauros vietos (daug daugiau perėjimų nei aplinkiniame plote) ir flangų maršrutai (retai naudojami, bet veda į nužudymus) | asmenų |
| **Vertė** | *Brangi vietovė* ir *Uždirbanti vietovė* | [vertės stulpelių](value-weighting.md) |
| **Kas lėmė raundus** | Kas skyrė laimėtus raundus nuo pralaimėtų, ir žaidėjai, kurie daugiausia pridėjo ar kainavo pergalės tikimybės (žr. [Kas laimėjo](#who-won-what-decided-the-rounds)) | raundai, nužudymai ir mirtys, ir [baigties stulpeliai](data-formats.md#outcome-columns) (`won`) |

Detektoriai, kurie negali veikti su duomenimis, išvardyti apačioje su priežastimi.

### Kaip radiniai surikiuojami {#how-findings-are-ranked}

Kiekviena vieta arba grupė tikrinama palyginus su likusiu žemėlapiu (tiksli binominė arba dažnio analizė). Klaidingų atradimų dažnis laikomas 5 % (Benjamini-Hochberg). Atsitiktinumas gali atrodyti kaip dėsningumas; tai padeda mažinti klaidingus signalus: tarp rodomų radinių apytiksliai vienas iš dvidešimties tikėtinai yra atsitiktinumas. Efektai, paremti nedideliu įvykių skaičiumi, prieš rikiavimą traukiami link „jokio efekto“. Rodoma ne daugiau kaip 60 radinių, ir kiekvienas detektorius gauna keletą vietų viršuje.

### Kas laimėjo {#who-won-what-decided-the-rounds}

Kai rungtynės nurodo, kas laimėjo kiekvieną raundą ([baigties stulpelis](data-formats.md#outcome-columns) `won`), rezultatas yra atskiras tikslas:

- **Vietos: pergalių dalis.** Kiekvienai pusei jos raundų vietoje dalis, kurią ji laimėjo, prieš dalį, kurią ji laimėjo tose pačiose rungtynėse bet kur - taigi žemėlapio, pusės ir pačių rungtynių balansas yra atskaitos linija, ir išsiskiria tik vietos, kurių laikytojai laimi daugiau (ar mažiau) savo raundų. Išgalvotas pavyzdys: *„Dust: pusė T laimi daugiau savo raundų, kai yra čia: laimėta 61 % iš 412, prieš 49 %, tikėtiną pagal jos pačios dažnį tose pačiose rungtynėse (šansai 1,6x; laikyta 31/48 rungtynėse).“* Tas pats klaidingų atradimų dažnis ir stabilumo patikrinimai kaip kiekvienai vietai; **Įkelti** įkelia rungtynes, kuriose vieta buvo laikoma, ir rodo tos pusės pozicijas.
- **Nišos: raundo pergalė.** Lentelėje **Raundai** yra kiekvienos gyvybės raundas: žemėlapis, pusė, rungtynių dalis (raundai 1-4, 5-8, ...), technika (operatorius, agentas), daugiausia naudotas ginklas, ilgiausiai laikyta vieta, pirkimas (eco, force, full) ir ar jos pusė padarė pirmąjį nukovimą. Grupė vertinama pagal tai, ką jos pusė laimėjo tose pačiose rungtynėse, todėl *T Dust žemėlapyje su AWP* yra niša tik tada, kai tie raundai buvo laimėti dažniau nei kiti T raundai tose rungtynėse. Išgalvotas pavyzdys: *„m1 · T · AWP: laimi 80 % iš 320 raundų, prieš 62 %, tikėtiną iš tų pačių pusių tose pačiose rungtynėse (šansai 2,3x; 40 rungtynių).“* Rikiuojama pagal pakilimo ir paramos sandaugą; **Įkelti** įkelia rungtynes, kurių raunduose tai matyti labiausiai.

Abiem reikia 2 versijos santraukų (žr. [Santraukų gavimas](#getting-the-summaries)): senesnės apskaičiuojamos iš naujo.

## Santrauka {#debrief}

Skirtuke **Santrauka** radiniai surašomi į trumpą tekstą: įvadas, aiškiausias radinys, vienas taktikai, vienas balansavimui, tada – kai duomenys nurodo, kas laimėjo – kas lėmė raundus, likusieji sugrupuoti pagal detektorių ir kiek jų remiasi silpnesniais įrodymais.

Kas lėmė raundus, pateikiama keturiomis pastraipomis: rezultatas ir iš kur ateina pergalės tikimybės; stipriausi veiksniai su jų skaičiais, intervalu ir q (kai nė vienas neišlaiko klaidingų atradimų dažnio, tekstas sako *kol kas niekas nėra tikra* ir vis tiek įvardija stipriausią); trys didžiausi lūžio taškai; ir žaidėjai, kurie daugiausia pridėjo ir kainavo pergalės tikimybės, su vietomis, kurios daugiausia laimėjo. Išgalvotas pavyzdys:

> T laimėjo 23, o CT laimėjo 17 iš 40 raundų su žinomu rezultatu (T: 58 %, 95 % nuo 42 % iki 72 %). Pergalės tikimybės ateina iš modelio, pritaikyto šiems raundams.
>
> Kas skyrė laimėtus raundus nuo pralaimėtų: T laimėjo 79 % iš 19 raundų, kai laikė Mid, prieš 24 % iš 21 be to (55 procentiniai punktai, 95 % nuo 26 iki 74) (q 0,004), ...
>
> Lūžio taškai: 17 raundas, 48 s, CT nužudymas prie B site pakeitė jos galimybę nuo 31 % iki 58 %, ir ji laimėjo raundą, ... Kiekviena pastraipa turi numeruotus mygtukus, rodančius jos radinius. **Kopijuoti tekstą** jį nukopijuoja.

![Santrauka, parašyta įmontuoto pasakotojo](../assets/img/lt/debrief.webp)

Įmontuotas pasakotojas veikia neprisijungęs, jūsų kalba. Virš jo esantis **Lęšis** parinkiklis (žr. [Žinių lęšis](knowledge.md)) nusprendžia, kokią literatūrą pastraipos cituoja.

### Išorinis DI {#external-ai}

**DI nustatymai** leidžia santrauką parašyti pasirinktam DI modeliui:

| Nustatymas | Reiškia |
|---|---|
| **Teikėjas** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (vietinis), LM Studio (vietinis), llama.cpp serveris (vietinis) arba bet koks OpenAI suderinamas galinis taškas |
| **Bazinis URL**, **Modelis** | Užpildo teikėjas; **Rodyti modelius** klausia serverio |
| **API raktas** | Siunčiamas tik į bazinį URL. Niekada neįrašomas į žurnalą, neišsaugomas rodiniuose, eksportuose ar `.3dheat` failuose. Dauguma vietinių serverių jo nereikalauja. |
| **Prisiminti raktą šioje naršyklėje** | Pagal numatymą išjungta: raktas pamirštamas uždarius puslapį |
| **Naudoti išorinį DI** | Pagal numatymą išjungta |
| **Siųsti žaidėjų vardus** | Pagal numatymą išjungta: žaidėjai siunčiami kaip P1, P2 ... |

Tada įveskite neprivalomą klausimą ir paspauskite **Rašyti su DI**. Siunčiami tik radiniai ir jų skaičiai – niekada jūsų duomenų eilutės. Atsakymas rodomas palaipsniui; paminėti radiniai tampa mygtukais. Kai duomenys nurodo, kas laimėjo, modeliui liepiama pradėti nuo to, kas lėmė raundus, su kiekvieno skaičiaus intervalu ir q, ir pasakyti, kai veiksnys remiasi mažai raundų arba pergalės tikimybės ateina iš prior modelio.

## Komentatorius {#caster}

**Vienoms rungtynėms** (jei įkelta keletas, pasirinkite vieną) **Komentatorius** randa akimirkas, vertas stebėti: pirmąjį kraujo praliejimą, kelis nužudymus vienu metu, keitimus, paskutinius kovotojus, tikslų pasikeitimus, sugrįžimus, išsiskiriančius žaidėjus, tolimus šūvius ir **lūžio taškus** – nužudymus, kurie labiausiai pakeitė pusės galimybę laimėti raundą (pagal kiekvienoje pusėje gyvus likusius žaidėjus, raunduose be atgimimo).

Kai duomenys nurodo, kas laimėjo kiekvieną raundą, kiekviena akimirka tai pasako: *„Anna nukauna Beną: T galimybė laimėti raundą pakyla nuo 38 % iki 62 % – ir jie laimi raundą.“* Galiausiai laimėjusios pusės akimirka sveria daugiau, kai komentatorius renkasi, kurias palikti, o sugrįžimas skaičiuojamas laimėtais raundais.

![Komentatoriaus akimirkos vienam raundui iš šaulio demonstracijos](../assets/img/lt/caster.webp)

- Spustelėkite akimirką: rodinys persijungia į pakartojimą, peršoka prieš ją, nuskrenda į vietą ir seka žaidėją.
- **Paleisti akimirkas** paleidžia kiekvieną iki pabaigos ir eina toliau; **Ankstesnė** / **Kita** persijungia tarp jų.
- Įjungus išorinį DI, **DI komentaras** parašo komentarą pagal akimirkų sąrašą (rūšis, laikai, vardai arba pseudonimai, komandos, klasės, atstumai).

Jam reikia asmenų ir nužudymo / mirties (arba užėmimo) įvykių; `other` / `victim` stulpelis leidžia atpažinti keitimus ir tolimus šūvius.

## Žinių lęšis {#knowledge-lens}

Radinį galima skaityti per **lęšį** – įsitvirtinusių žinių: karinės doktrinos, oro ir jūrų kovos, miesto operacijų, žaidimų dizaino ir kibersporto (arba *Auto*, pasirenka duomenų vienetai). Atidarytas radinys tada rodo artimiausią **doktrinos ir literatūros** įrašą bei **istorinę paralelę** su nuorodomis, o **Lęšio rodikliai** iš tos literatūros apskaičiuoja matus duomenims (Lanchesterio modelių pritaikymas, mainų santykiai, jėgų santykiai, ugnies sektoriai, pagrindinis reljefas, keitimai, iniciatyva). Santrauka ir DI užklausa jus įtraukia. Viskas apie tai: [Žinių lęšis](knowledge.md).

Lęšio rodikliai taip pat matuoja, kaip žaidėjai elgiasi kaip minia ir kaip grupė – suderinimą ir sukimąsi, maršrutų vedimą, eisenas ir takus, susigrūdimą, lyderius ir sekėjus, atsiliekančius, lūžio tašką po nuostolių, riziką po prarastos gyvybės, serijas, sutarimą dėl pirkimų ir reakciją į gaunamą ugnį – kiekvieną pagal savo nulinį modelį: [Kolektyvinis elgesys](collective-behaviour.md).

## Duomenys, kurie įgalina įžvalgas {#data-that-makes-insights-work}

- pozicijos su **laiku**, **asmens** ir **komandos** stulpeliais;
- **įvykių** stulpelis su nužudymais ir mirtimis (`kill`, `death`) bei kitais (`hit`, `fire`, `capture` ...);
- **kitos pusės** stulpelis (`other`, `victim`) keitimams ir kryptims;
- **technikos** arba **tipo** stulpelis klasėms; `ai` stulpelis žaidėjams prieš DI;
- **sesijos** / **rungtynių** / **raundo** stulpelis, kai yra kelios rungtynės.

[Demonstraciniai duomenys](demo-data.md) turi visus šiuos stulpelius.
