---
title: "Profily áut a porovnanie"
parent: "Analýza pretekov"
nav_order: 56
lang: "sk"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Profily áut a porovnanie

Auto dokáže brzdiť, zatáčať a zrýchľovať len do určitej miery. Prehliadač túto mieru meria z vašich vlastných kôl, takže vám nikdy nepovie, aby ste urobili niečo, čo vaše auto nedokáže. Vysvetlí tiež, ktorá časť straténej sekundy bola chyba auta a ktorá vaša.

![Porovnanie áut: dve autá vedľa seba s ich priľnavosťou, brzdením a ťahom](../assets/img/en/race-cars-compared.webp)

Analýza hovorí kolu, aby brzdilo silnejšie, držalo vyššiu rýchlosť alebo zrýchľovalo skôr, len tam, kde to jeho auto už ukázalo, že zvládne. Z každej straty tiež odpočíta to, čo vysvetľujú samotné autá. Preto sa limity každého auta (jeho *obálka*, nižšie) a jeho charakter (jeho *profil*) merajú z každého načítaného kola daného auta. Táto stránka popisuje obálku, profil, sekciu **Porovnanie áut** a to, čo autá rozhodujú v každej zákrute.

**Jedno auto** = kolá s rovnakým číslom auta (alebo názvom, ak číslo nie je) a rovnakým indexom výkonu: iné ladenie je iné auto.

## Obálka: čo auto dokáže pri každej rýchlosti {#the-envelope-what-the-car-can-do-at-each-speed}

Pre každé auto, cez každé jeho načítané kolo, v **pásmach rýchlosti po 5 m/s** (24 pásiem, až do 120 m/s). Vynechajú sa vzorky vo vzduchu, vzorky počas utíchania 0,3 s po dopade a vzorky od 0,1 s pred každým zásahom do 1 s po ňom. Zrýchlenia 80 m/s² alebo viac sa ignorujú (nad to, čo zvládne ktorékoľvek auto s prítlakom).

| Obálka | Vzorky | Hodnota v pásme | Potrebné |
|---|---|---|---|
| **bočná priľnavosť** | bočné zrýchlenie **udržané pol sekundy** (priemer jeho absolútnej hodnoty v centrovanom okne 0,5 s), len tam, kde auto zatáčalo: aspoň tretina 99. percentilu všetkých takých hodnôt | 95. percentil | 6 vzoriek |
| **brzdenie** | brzda > 0,3; pozdĺžne zrýchlenie ako medián každej vzorky a jej dvoch susedov | 95. percentil spomalenia | 4 vzorky |
| **ťah pri plnom plyne** | plyn > 0,95, brzda pod 0,05; rovnaký medián z troch | 90. percentil | 4 vzorky |

Prečo udržané pol sekundy: obrubník, šmyk, ktorý sa zachytí, alebo auto, ktoré sa chytí, krátko vyšplhá bočné zrýchlenie, a auto, ktoré to robí často, vyzeralo priľnavejšie, než je. Prečo medián z troch: pri rozstupe päť metrov je jedna vzorka veľký kus cesty a jediná vzorka s výkyvom je obrubník, výmol alebo stena.

Hodnota obálky pri danej rýchlosti sa interpoluje medzi stredmi pásiem a pri prázdnom pásme sa použije najbližšie pásmo s dátami.

**O dvoch druhoch podložia.** Ak kolá auta išli na asfalte a na voľnom podklade aspoň pätinou vzoriek z každého, pre každé z nich sa uchová samostatná obálka a každá zákruta sa posudzuje s podložím pod autom v jeho najpomalšom bode.

**Zlom.** Rýchlosť, od ktorej ťah klesá ako `1/v` (obmedzený výkonom), a nie zostáva rovný (obmedzený trakciou): prvé pásmo, ktorého `a·v` je do 15 % najvyššej videnej hodnoty `a·v`.

## Profil: aký typ auta to je {#the-profile-what-kind-of-car-it-is}

`profile`, z tých istých kôl (vzorky na zemi, bez zásahu, rýchlejšie ako 8 m/s):

| Meranie | Ako |
|---|---|
| **udržaná priľnavosť** (m/s²) | 95. percentil udržaného bočného zrýchlenia za pol sekundy |
| **ťah** do 50 km/h, 50-120, 120-200, nad 200 (m/s²) | priemer ťahu pri plnom plyne z obálky v rozsahoch 3-14, 14-33, 33-56 a 56-90 m/s, pri rýchlostiach, ktoré auto dosiahlo (až po jeho najvyššiu + 2 m/s), z aspoň troch krokov po 1 m/s; a najvyšší videný ťah a kde |
| **brzdenie** (m/s²) | brzdenie z obálky spriemerované od 60 do 160 km/h (16,7-44,4 m/s), pásmo, ktoré porovnanie uvádza |
| **najrýchlejšie** | najvyššia rýchlosť, akú dosiahlo |
| **dosiahne strop pri** | kde prestalo pri plnom plyne na rovinke nadobúdať rýchlosť (nižšie) |
| **stále ťahá pri najvyššej rýchlosti** | ťah obálky pri jeho najvyššej rýchlosti: ako ďaleko mu ešte chýbalo |
| **zadok zachytený, na kolo** | koľkokrát za kolo šmykol a musel sa zachytiť (nižšie) |
| **podiel na plyne** | z toho podiel, ktorý sa začal s plynom > 0,5 a bez brzdy |
| **pustí pri** | medián udržaného bočného zrýchlenia 0,15 s pred každým začatým šmykom, ako podiel priľnavosti |
| **nad 10° driftu pri tvrdom zatáčaní** | z vzoriek zatáčajúcich pri 60 % priľnavosti alebo viac podiel šmyku (10° na asfalte, 20° na voľnom podklade); potrebných 30 vzoriek |
| **medián driftu** | cez tie isté vzorky |
| **vyváženosť** | predný mínus zadný uhol šmyku (násobky menovitého maxima) pri tvrdom zatáčaní bez šmyku, priemer aspoň 30 vzoriek: + znamená, že tlačí do šírky |
| **povrch** | nad 80 % vzoriek na voľnom podklade: voľný; pod 20 %: asfalt; inak zmiešaný |

**Dosiahnutie stropu.** Vzorka sa počíta, keď sekunda okolo nej (±0,5 s, aspoň 0,9 s dát) bola celá pri plnom plyne (> 0,95, bez brzdy), na zemi a išla **rovno** (|bočné| pod väčšou z hodnôt 4 m/s² a štvrtiny jej priľnavosti), pričom získavala menej ako **0,35 m/s²**, je rýchlejšia ako 25 m/s a je do 90 % najrýchlejšieho kola - plný plyn do kopca alebo cez dlhú zákrutu tiež prestane získavať, hoci je ďaleko pod maximálnou rýchlosťou auta. Keď je vo všetkých kolách aspoň **jedna sekunda** takejto plošiny, medián týchto rýchlostí je miesto, kde auto dosiahne strop. Inak nemá auto žiadnu maximálnu rýchlosť: ak žiadna rovinka nebola dosť dlhá, hovorí *stále ťahá pri najvyššej rýchlosti*, ako ďaleko bolo od nej. Nič nad rámec toho, čo kolá ukazujú - prevodový pomer a obmedzovač ukončia ťah auta oveľa skôr, než ho zastaví odpor vzduchu.

**Strata zadku.** Počíta sa tam, kde ju vodič musel zachytiť: zatáčanie pri 60 % priľnavosti alebo viac, šmyk (drift nad 10° na asfalte, 20° na voľnom podklade), pričom volant (nad 0,06) je otočený **proti** zákrute. Ktorý znak riadenia zodpovedá ktorému znaku bočnej sily v zákrute, sa meria pre každé kolo zvlášť (vzorky, kde sa auto otáča bez šmyku). Šmyk sa počíta raz, kým auto neprestane šmýkať. Auto, ktoré vodič úmyselne mierne nakloní bokom, nič nestráca; to, ktoré potrebuje opačný uhol volantu, áno. Počíta sa rovnako pre každé auto, takže sa dajú porovnať dve autá. Potrebuje riadenie a uhol driftu.

## Porovnanie áut {#cars-compared}

Sekcia na bočnom paneli sa volá **Auto** pri jednom aute a **Porovnanie áut** pri viacerých.

**Tabuľka**: stĺpec pre každé auto, riadok pre každé meranie, pre ktoré má nejaké auto hodnotu: Udržaná priľnavosť; Ťah do 50 km/h, 50-120, 120-200, nad 200; Brzdenie; Najrýchlejšie; Dosiahne strop pri (*stále ťahá*, ak ho nikdy nedosiahlo); Stále ťahá pri najvyššej rýchlosti; Zadok zachytený, na kolo; Nad 10° driftu pri tvrdom zatáčaní. Tam, kde sa autá líšia o viac ako 3 %, je lepšia hodnota označená (vyššia pri priľnavosti, ťahu, brzdení a rýchlostiach; nižšia pri šmykoch zadku).

**Jedno auto samo**: vety o tom, aký je podľa kôl - priľnavosť, ktorú drží (m/s² a g), jeho ťah v každom pásme, kde prestalo nadobúdať rýchlosť na dlhých rovinkách (alebo že nikdy nedosiahlo strop a čo ešte ťahalo pri najvyššej rýchlosti), a ako často bolo treba zachytiť zadok („takmer nikdy“ menej ako raz za kolo, „väčšinou na plyne“, keď 60 % alebo viac začalo na plyne).

**Dve autá**: pre každú dvojicu veta o tom, čím je jedno auto oproti druhému („X zrýchľuje lepšie, ale nedokáže zatáčať tak tvrdo, potrebuje dlhšie na zastavenie a ľahšie stráca zadok“), tabuľka, každý jasný rozdiel od najväčšieho, potom **Ako jazdiť s každým**. Pri viac ako **3** dvojiciach sa zobrazí jedna dvojica: aktuálne zamerané kolo proti autu vybranému zo zoznamu (predvolene auto najlepšieho kola jeho triedy, inak referenčné, inak prvé iné).

Rozdiel sa uvedie len vtedy, keď kolá jasne ukazujú:

| Rozdiel | Uvádza sa od | Veta |
|---|---|---|
| priľnavosť | **4 %** | „X drží o N % viac priľnavosti v zákrutách … to je o M % vyššia rýchlosť cez stred každej zákruty“ (rýchlosť = √ pomeru priľnavosti) |
| ťah | **5 %**, v prvom pásme, ktoré majú obe autá, z 120-200, 50-120, nad 200 km/h | „X zrýchľuje o N % silnejšie od 120 do 200 km/h“; aj pri rozjazde, alebo „hoci Y sa z miesta rozbieha silnejšie“, keď sa rozbeh líši o 8 % |
| maximálna rýchlosť | **4 km/h** | „X dosahuje vyššiu maximálnu rýchlosť: prestal získavať pri …“ |
| maximálna rýchlosť, len jedno | jedno auto dosiahlo strop, druhé nie | „Y vyčerpalo ťah pri … ; X ešte získavalo, keď brzdilo“ |
| maximálna rýchlosť, žiadne | ani jedno nedosiahlo strop | čo každé ešte získavalo pri najvyššej rýchlosti |
| brzdenie | **5 %** | „X zastavuje o N % tvrdšie … Y musí brzdiť skôr“ |
| strata zadku | aspoň raz za kolo viac **a** o polovicu častejšie | „X ľahšie stráca zadok: šmykol sa natoľko, že musel opačne natočiť volant N-krát za kolo oproti M …“ - väčšinou na plyne (60 % a viac) alebo väčšinou pri vstupe do zákruty a pri uvoľnení (30 % alebo menej), od približne P % jeho priľnavosti; na voľnom podklade „časť z toho je, ako sa auto riadi; zachytávanie nie“ |
| šmyky do strán | **12 percentuálnych bodov** tvrdého zatáčania nad hranicou driftu | „X pri hranici jazdí viac do strán“ |
| predná vyváženosť | **0,3** menovitého maxima | „X viac tlačí vpredu … treba ho spomaliť a natočiť pred vrcholom zákruty“ |

Vlastnosti v súhrne: *drží viac priľnavosti* / *nedokáže zatáčať tak tvrdo*, *zrýchľuje lepšie* / *ťahá menej*, *dosahuje vyššiu maximálnu rýchlosť* / *dosahuje nižšiu maximálnu rýchlosť*, *stále ťahá na konci rovinky* / *vyčerpá ťah*, *zastavuje tvrdšie* / *potrebuje dlhšie na zastavenie*, *je stabilnejšie* / *ľahšie stráca zadok* (*je oveľa šmykľavejšie …* pri dvojnásobnej frekvencii plus jeden; *musí sa zachytávať častejšie* na voľnom podklade), *tlačí vpredu*. „Na týchto kolách sa od Y ťažko odlíši“, keď rozdiel neexistuje.

**Ako jazdiť s každým:**

- jedno auto drží viac priľnavosti a druhé viac ťahá: v tej s priľnavosťou udržte rýchlosť cez stred na širokej, okrúhlej línii (tvar „U“); v silnejšej brzdite rovno, otočte ju v krátkom tesnom strede a narovnajte východ zo zákruty (tvar „V“);
- jedno auto zaostáva v oboch: jeho najlepšie kolo je to najčistejšie - brzdite rovno, najširší polomer, plný plyn čo najskôr, kým to drží;
- auto, ktoré ľahšie stráca zadok: plyn pridávajte len vtedy, keď sa volant vracia do stredu, a krátko preraďte (šmyky na plyne), alebo jemne uvoľnite brzdu a v strede držte stály plyn (šmyky pri vstupe).

Nápoveda pod sekciou opakuje, ako sa každé z nich meria.

## Čo autá rozhodnú v zákrute {#what-the-cars-decide-in-a-corner}

Keď sú kolá v rôznych autách, každé zistenie o stratenej zákrute končí **Autá:** - čo z toho rozhodnú autá a ako z tohto jedného auta vyťažiť čo najviac (`carNote`):

- **Cez stred**, keď toto auto drží menej ako 96 % priľnavosti druhého, druhé bolo v najpomalšom bode o viac ako 0,5 m/s rýchlejšie a toto kolo nebolo ďaleko pod tým, čo vysvetľuje jeho priľnavosť (nad 70 % z nej): na línii druhého auta toto auto dovoľuje `v_druhé · √(priľnavosť_moja / priľnavosť_druhé)`. Ak kolo to prenieslo (do 1 m/s), rozdiel je auto a žiadny brzdný bod ho nezmení; ak menej, ukáže sa, koľko ešte možno získať. Potom kde sa čas dá získať inak: na rovinku, medzi dve zákruty, alebo v aute, ktoré ťahá o 5 % silnejšie - až za vrcholom (brzdite rovno, zatočte neskôr, namierte včas na východ zo zákruty); inak najširší polomer, aký cesta dovolí.
- **Zadok, ktorý tu povolil** (šmyk alebo otočka, ktorú nikto nezdieľal, alebo driftu nad hranicou šmyku pri vstupe), v aute, ktoré ho stráca aspoň raz za kolo viac a o polovicu častejšie: čo robiť v tomto aute - plyn pridávajte, keď sa volant vracia (jeho šmyky začínajú na výkone v 60 % prípadov alebo viac), alebo brzdu jemne uvoľnite bez odľahčenia.
- **Rovinka potom**: keď ťah áut vysvetlil 0,03 s alebo viac, silnejší ťah druhého auta z rovnakej rýchlosti, s ťahom oboch áut od 120 do 200 km/h.
- **Maximálna rýchlosť**: keď toto kolo dosiahlo 98 % miesta, kde jeho auto dosahuje strop na rovinke dlhšej ako 150 m, a druhé išlo o 1,5 m/s rýchlejšie: to je maximálna rýchlosť auta a každý ďalší km/h z tej zákruty ešte pomáha, kým sa k nej nedostane.
- **Brzdenie**: keď druhé auto brzdí o 5 % tvrdšie a toto kolo brzdilo o viac ako 5 m skôr, časť skoršieho brzdenia patrí autu.

Podiel auta sa odpočíta aj z samotného času - pozri [podiel auta](race-corner-analysis.md#the-cars-share) - a zákruta, v ktorej auto vysvetlí 60 % alebo viac, sa pripíše autu.

## Pre vývojárov {#for-developers}

Kód: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` v [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` v [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
